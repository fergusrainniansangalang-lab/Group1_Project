// @file    aiClient.js
// @folder  src/services/
// @about   Gemini API client with streaming support and daily quota enforcement.
//
// What this file does:
// - Sends chat/completion requests to the Gemini 1.5 Flash model.
// - Streams response tokens to the caller via an onChunk callback.
// - Tracks and enforces a daily 20-request courtesy quota in AsyncStorage.
// - Supports AbortController to cancel in-flight requests when a modal closes.
// - Falls back to the Node.js proxy (server/proxy.js) when a direct key is unavailable.

/**
 * AI Client (Step 3, Step 5 & Step 8 of The Almanac Guide).
 *
 * Sends requests, streams responses, enforces daily courtesy quota (20/day),
 * handles errors, cancelling (AbortController), and multi-mode connectivity:
 *   - 'proxy': Streams from secure backend proxy server
 *   - 'direct': Streams from Gemini API using development key (dev only)
 *   - 'unconfigured': Graceful fallback with clear error message
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { AI } from '../config/env';

const DAILY_LIMIT = 20;
const STORAGE_DATE_KEY = '@ai_daily_usage_date';
const STORAGE_COUNT_KEY = '@ai_daily_usage_count';

/**
 * Check and increment the on-device daily courtesy quota (Almanac Guide Page 13, Layer 4).
 */
export async function checkDailyQuota() {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const storedDate = await AsyncStorage.getItem(STORAGE_DATE_KEY);
    let count = 0;

    if (storedDate === today) {
      const storedCount = await AsyncStorage.getItem(STORAGE_COUNT_KEY);
      count = storedCount ? parseInt(storedCount, 10) : 0;
    } else {
      await AsyncStorage.setItem(STORAGE_DATE_KEY, today);
      await AsyncStorage.setItem(STORAGE_COUNT_KEY, '0');
    }

    if (count >= DAILY_LIMIT) {
      return { allowed: false, remaining: 0, count };
    }

    return { allowed: true, remaining: DAILY_LIMIT - count, count };
  } catch (err) {
    // If storage fails, allow request
    return { allowed: true, remaining: DAILY_LIMIT, count: 0 };
  }
}

export async function incrementDailyQuota() {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const storedDate = await AsyncStorage.getItem(STORAGE_DATE_KEY);
    let count = 0;

    if (storedDate === today) {
      const storedCount = await AsyncStorage.getItem(STORAGE_COUNT_KEY);
      count = storedCount ? parseInt(storedCount, 10) : 0;
    }

    count += 1;
    await AsyncStorage.setItem(STORAGE_DATE_KEY, today);
    await AsyncStorage.setItem(STORAGE_COUNT_KEY, count.toString());
    return count;
  } catch (err) {
    return 1;
  }
}

/**
 * Format messages for the Gemini API structure.
 */
function toGeminiContents(messages = []) {
  return messages.map((m) => ({
    role: m.role === 'assistant' || m.role === 'model' ? 'model' : 'user',
    parts: [{ text: m.content || m.text || '' }],
  }));
}

/**
 * Stream an AI message with onDelta, onDone, onError callbacks.
 * Returns a handle with an `abort()` function to cancel anytime.
 *
 * @param {object} options
 * @param {string} [options.system] - System instruction / prompt rules
 * @param {Array<{role: string, content: string}>} options.messages - Turn history (last turn includes DATA)
 * @param {number} [options.maxTokens=1024] - Max tokens to generate
 * @param {function(string, string): void} options.onDelta - (deltaChunk, fullAccumulatedText)
 * @param {function(string): void} [options.onDone] - (fullAccumulatedText)
 * @param {function(Error): void} [options.onError] - (error)
 * @param {string} [options.authToken] - Optional user Firebase ID token for proxy auth
 * @returns {{ abort: () => void }}
 */
export function streamMessage({
  system,
  messages,
  maxTokens = 1024,
  onDelta,
  onDone,
  onError,
  authToken,
}) {
  const controller = new AbortController();
  let accumulatedText = '';
  let isAborted = false;

  const handleAbort = () => {
    if (!isAborted) {
      isAborted = true;
      controller.abort();
    }
  };

  (async () => {
    try {
      // 1. Check daily device quota
      const quota = await checkDailyQuota();
      if (!quota.allowed) {
        throw new Error(
          `Daily AI usage limit reached (${DAILY_LIMIT} requests). You can try again tomorrow or use the proxy server.`
        );
      }

      // 2. Validate connection mode
      if (AI.mode === 'unconfigured') {
        throw new Error(
          'AI is not configured. Set AI_PROXY_URL or AI_DEV_API_KEY in your .env file.'
        );
      }

      if (AI.mode === 'direct' && typeof console !== 'undefined') {
        console.warn(
          'Calling the model API directly with an embedded key (Development Mode)'
        );
      }

      // 3. Prepare payload and endpoint
      let url = '';
      let headers = { 'Content-Type': 'application/json' };
      let bodyData = {};

      if (AI.mode === 'proxy') {
        url = AI.proxyUrl;
        if (authToken) {
          headers['Authorization'] = `Bearer ${authToken}`;
        }
        bodyData = {
          system,
          contents: toGeminiContents(messages),
          generationConfig: {
            maxOutputTokens: Math.min(maxTokens, 1024),
            temperature: 0.7,
          },
        };
      } else {
        // Direct Gemini API
        const model = AI.model || 'gemini-2.5-flash-lite';
        url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?key=${AI.devApiKey}&alt=sse`;
        bodyData = {
          contents: toGeminiContents(messages),
          generationConfig: {
            maxOutputTokens: Math.min(maxTokens, 1024),
            temperature: 0.7,
          },
        };
        if (system) {
          bodyData.systemInstruction = {
            parts: [{ text: system }],
          };
        }
      }

      // 4. Send request with 60-second timeout
      const timeoutId = setTimeout(() => {
        controller.abort();
      }, 60000);
      if (timeoutId && typeof timeoutId.unref === 'function') {
        timeoutId.unref();
      }

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(bodyData),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('Rate limited. Give it a few seconds and try again.');
        }
        if (response.status === 401 || response.status === 403) {
          throw new Error('The API credentials were rejected. Check your key or proxy.');
        }
        if (response.status === 413) {
          throw new Error('Request body too large.');
        }
        const errorText = await response.text();
        throw new Error(`AI request failed (${response.status}): ${errorText.slice(0, 150)}`);
      }

      // 5. Read SSE stream or JSON response
      const contentType = response.headers.get('content-type') || '';

      if (response.body && typeof response.body.getReader === 'function') {
        // Web / modern fetch reader
        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('data: ')) {
              const dataStr = trimmed.slice(6).trim();
              if (dataStr === '[DONE]') continue;
              try {
                const parsed = JSON.parse(dataStr);
                const chunk =
                  parsed?.candidates?.[0]?.content?.parts?.[0]?.text ||
                  parsed?.text ||
                  '';
                if (chunk) {
                  accumulatedText += chunk;
                  if (onDelta) onDelta(chunk, accumulatedText);
                }
              } catch (e) {
                // Ignore parse errors on partial chunks
              }
            }
          }
        }
      } else {
        // React Native or fallback plain text/JSON read
        const textData = await response.text();
        if (textData.includes('data: ')) {
          const lines = textData.split('\n');
          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('data: ')) {
              const dataStr = trimmed.slice(6).trim();
              if (dataStr === '[DONE]') continue;
              try {
                const parsed = JSON.parse(dataStr);
                const chunk =
                  parsed?.candidates?.[0]?.content?.parts?.[0]?.text ||
                  parsed?.text ||
                  '';
                if (chunk) {
                  accumulatedText += chunk;
                  if (onDelta) onDelta(chunk, accumulatedText);
                }
              } catch (e) {
                // Ignore partial errors
              }
            }
          }
        } else {
          try {
            const json = JSON.parse(textData);
            const content =
              json?.candidates?.[0]?.content?.parts?.[0]?.text ||
              json?.text ||
              '';
            accumulatedText = content;
            if (onDelta) onDelta(content, accumulatedText);
          } catch (e) {
            accumulatedText = textData;
            if (onDelta) onDelta(textData, accumulatedText);
          }
        }
      }

      // Increment daily quota count on successful completion
      await incrementDailyQuota();

      if (onDone) onDone(accumulatedText);
    } catch (err) {
      if (isAborted) return; // User cancelled
      if (onError) {
        onError(err);
      } else {
        console.error('AI Error:', err.message);
      }
    }
  })();

  return { abort: handleAbort };
}
