// @file    useFeedBriefing.js
// @folder  src/hooks/
// @about   React hook that auto-generates an hourly AI digest of the feed.
//
// What this file does:
// - Triggers a Gemini briefing request whenever the posts array changes.
// - Caches the briefing for one hour in AsyncStorage to conserve quota.
// - Returns { briefing, loading, error, refresh } for use in HomeScreen.
// - Skips the API call if the posts array is empty or the cache is still fresh.

/**
 * useFeedBriefing hook (Steps 6, 7 & 8 of The Almanac Guide).
 *
 * Automatically generates a smart briefing for the feed, caching it per hour
 * so pull-to-refresh or navigation doesn't consume extra quota.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { streamMessage } from '../services/aiClient';
import {
  BRIEFING_SYSTEM,
  buildFeedContext,
  parseBriefing,
} from '../services/aiContext';
import { AI } from '../config/env';

const CACHE_KEY_PREFIX = '@ai_briefing_cache_';

export function useFeedBriefing(posts = [], stories = [], user = null) {
  const [briefing, setBriefing] = useState({ headline: '', body: '', advisories: [] });
  const [rawText, setRawText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const streamRef = useRef(null);

  // Almanac Step 8.2: Cache key based on posts count, newest post id, and current hour
  const getCacheKey = useCallback(() => {
    const hour = new Date().getHours();
    const newestPostId = posts.length > 0 ? posts[0].id : 'empty';
    return `${CACHE_KEY_PREFIX}${posts.length}_${newestPostId}_${hour}`;
  }, [posts]);

  const loadBriefing = useCallback(
    async (force = false) => {
      // Abort any ongoing stream
      if (streamRef.current) {
        streamRef.current.abort();
        streamRef.current = null;
      }

      setError(null);

      // Check cache unless forced
      const cacheKey = getCacheKey();
      if (!force) {
        try {
          const cached = await AsyncStorage.getItem(cacheKey);
          if (cached) {
            const parsed = JSON.parse(cached);
            setRawText(parsed.rawText || '');
            setBriefing(parsed.briefing || parseBriefing(parsed.rawText));
            setLoading(false);
            return;
          }
        } catch (e) {
          // ignore cache read error
        }
      }

      if (!AI.isConfigured()) {
        setBriefing({
          headline: 'AI Feed Digest (Ready)',
          body: 'Connect your Gemini API key or proxy server in .env to enable live smart digests of your feed activity.',
          advisories: [],
        });
        setLoading(false);
        return;
      }

      setLoading(true);
      setRawText('');

      const contextData = buildFeedContext(posts, stories, user);
      const userMessage = `${contextData}\n\nWrite the smart feed digest for right now.`;

      streamRef.current = streamMessage({
        system: BRIEFING_SYSTEM,
        messages: [{ role: 'user', content: userMessage }],
        maxTokens: 500,
        onDelta: (chunk, fullText) => {
          setRawText(fullText);
          setBriefing(parseBriefing(fullText));
        },
        onDone: async (finalText) => {
          const finalBriefing = parseBriefing(finalText);
          setBriefing(finalBriefing);
          setLoading(false);

          // Save to hourly cache (Step 8.2)
          try {
            await AsyncStorage.setItem(
              cacheKey,
              JSON.stringify({ rawText: finalText, briefing: finalBriefing })
            );
          } catch (e) {
            // ignore cache write error
          }
        },
        onError: (err) => {
          setLoading(false);
          setError(err.message || 'Could not generate briefing.');
        },
      });
    },
    [posts, stories, user, getCacheKey]
  );

  useEffect(() => {
    // Generate or load cached briefing when posts change or on mount
    if (posts.length > 0) {
      loadBriefing(false);
    }

    return () => {
      if (streamRef.current) {
        streamRef.current.abort();
      }
    };
  }, [posts.length, loadBriefing]);

  return {
    briefing,
    rawText,
    loading,
    error,
    refresh: () => loadBriefing(true),
  };
}

