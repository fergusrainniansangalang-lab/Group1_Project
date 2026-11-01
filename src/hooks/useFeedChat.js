// @file    useFeedChat.js
// @folder  src/hooks/
// @about   React hook managing the AI chat session state for AIChatModal.
//
// What this file does:
// - Maintains the chat message history array and the current streaming response.
// - Sends user messages to Gemini via aiClient and appends streamed tokens to the last bubble.
// - Injects the current feed as a <DATA> context block on each new message.
// - Enforces a sliding window of 10 messages to keep the context size manageable.
// - Exposes { messages, sendMessage, isStreaming, resetChat } to the modal.

/**
 * useFeedChat hook (Steps 6, 7 & 8 of The Almanac Guide).
 *
 * Manages chat history, streaming responses, turn caps (last 10 messages),
 * attaches current feed context to the latest message only, and supports
 * stop generation, retry, and clear conversation.
 */

import { useState, useRef, useCallback } from 'react';
import { streamMessage } from '../services/aiClient';
import {
  CHAT_SYSTEM,
  buildFeedContext,
  withContext,
} from '../services/aiContext';

const MAX_TURNS = 10; // Step 8 Layer 2: Chat history cap

export function useFeedChat(posts = [], stories = [], user = null) {
  const [messages, setMessages] = useState([
    {
      id: 'welcome_1',
      role: 'assistant',
      content:
        "Hi! I'm Meta AI. Ask me anything about what's happening on your feed, summarize recent posts, or ask for help drafting a post.",
      time: 'Just now',
    },
  ]);
  const [streamingText, setStreamingText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const streamRef = useRef(null);
  const lastQuestionRef = useRef('');

  const stop = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.abort();
      streamRef.current = null;
    }
    if (streamingText) {
      // Keep whatever text was streamed so far
      setMessages((prev) => [
        ...prev,
        {
          id: 'ai_' + Date.now(),
          role: 'assistant',
          content: streamingText,
          time: 'Just now',
        },
      ]);
      setStreamingText('');
    }
    setLoading(false);
  }, [streamingText]);

  const sendMessage = useCallback(
    async (questionText) => {
      const trimmed = (questionText || '').trim();
      if (!trimmed || loading) return;

      lastQuestionRef.current = trimmed;
      setError(null);

      const userMsg = {
        id: 'user_' + Date.now(),
        role: 'user',
        content: trimmed,
        time: 'Just now',
      };

      // Add user message to UI immediately
      const updatedMessages = [...messages, userMsg];
      setMessages(updatedMessages);
      setLoading(true);
      setStreamingText('');

      // Almanac Step 7.3: DATA block attached to newest message ONLY, never into stored history
      const context = buildFeedContext(posts, stories, user);
      const contextualizedPrompt = withContext(context, trimmed);

      // Almanac Step 8 Layer 2: Send last 10 messages only to save tokens
      const historyToSend = updatedMessages.slice(-MAX_TURNS).map((m, idx, arr) => {
        if (idx === arr.length - 1) {
          return { role: 'user', content: contextualizedPrompt };
        }
        return {
          role: m.role === 'assistant' ? 'assistant' : 'user',
          content: m.content,
        };
      });

      streamRef.current = streamMessage({
        system: CHAT_SYSTEM,
        messages: historyToSend,
        maxTokens: 800,
        onDelta: (chunk, fullText) => {
          setStreamingText(fullText);
        },
        onDone: (finalText) => {
          setMessages((prev) => [
            ...prev,
            {
              id: 'ai_' + Date.now(),
              role: 'assistant',
              content: finalText,
              time: 'Just now',
            },
          ]);
          setStreamingText('');
          setLoading(false);
          streamRef.current = null;
        },
        onError: (err) => {
          setError(err.message || 'Failed to get answer from AI.');
          setLoading(false);
          streamRef.current = null;
        },
      });
    },
    [loading, messages, posts, stories, user]
  );

  const retry = useCallback(() => {
    if (lastQuestionRef.current) {
      sendMessage(lastQuestionRef.current);
    }
  }, [sendMessage]);

  const clearChat = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.abort();
      streamRef.current = null;
    }
    setMessages([
      {
        id: 'welcome_' + Date.now(),
        role: 'assistant',
        content:
          "Chat cleared. I'm ready to answer questions about your feed or help you write posts!",
        time: 'Just now',
      },
    ]);
    setStreamingText('');
    setError(null);
    setLoading(false);
  }, []);

  return {
    messages,
    streamingText,
    loading,
    error,
    sendMessage,
    stop,
    retry,
    clearChat,
  };
}

