import { AI } from '../src/config/env';
import {
  buildFeedContext,
  withContext,
  parseBriefing,
  GUARDRAILS,
  BRIEFING_SYSTEM,
  CHAT_SYSTEM,
} from '../src/services/aiContext';
import { checkDailyQuota, incrementDailyQuota } from '../src/services/aiClient';

describe('Almanac AI Integration (Facebook App)', () => {
  describe('1. Configuration & Modes (Almanac Step 2)', () => {
    it('provides a valid AI configuration object', () => {
      expect(AI).toBeDefined();
      expect(AI.model).toBeDefined();
      expect(['proxy', 'direct', 'unconfigured']).toContain(AI.mode);
      expect(typeof AI.isConfigured()).toBe('boolean');
    });

    it('identifies mode properly based on settings', () => {
      if (AI.proxyUrl) {
        expect(AI.mode).toBe('proxy');
      } else if (AI.devApiKey) {
        expect(AI.mode).toBe('direct');
      }
    });
  });

  describe('2. Guardrails & Rules (Almanac Step 6)', () => {
    it('contains essential guardrails against hallucination and out-of-scope requests', () => {
      expect(GUARDRAILS).toContain('Answer only from the DATA block');
      expect(GUARDRAILS).toContain('Never open with a pleasantry');
      expect(GUARDRAILS).toContain('It does NOT cover real-world external news');
    });

    it('configures briefing system prompt strictly', () => {
      expect(BRIEFING_SYSTEM).toContain('Line 1: one sentence headline');
      expect(BRIEFING_SYSTEM).toContain('up to 2 lines each starting with "- "');
    });

    it('configures chat assistant system prompt with scope boundary', () => {
      expect(CHAT_SYSTEM).toContain('Meta AI');
      expect(CHAT_SYSTEM).toContain('2 to 4 sentences');
    });
  });

  describe('3. Templates & Context Building (Almanac Step 7)', () => {
    const mockPosts = [
      {
        id: 'p1',
        author: 'Sarah Jenkins',
        content: 'Launching our new design system today!',
        category: 'Work',
        time: '1h ago',
        completed: false,
        reactions: { like: 12, love: 4, laugh: 0 },
        comments: [{ author: 'David Chen', text: 'Looks sleek!' }],
      },
      {
        id: 'p2',
        author: 'David Chen',
        content: 'Coffee break in the studio.',
        category: 'Personal',
        time: '3h ago',
        completed: true,
        reactions: { like: 5, love: 1, laugh: 0 },
        comments: [],
      },
    ];

    const mockStories = [{ name: 'Alex Morgan', caption: 'Morning run 🏃' }];
    const mockUser = { name: 'Alex Morgan', email: 'alex@example.com' };

    it('builds a clean <DATA> block without raw noisy JSON', () => {
      const dataBlock = buildFeedContext(mockPosts, mockStories, mockUser);
      expect(dataBlock).toContain('<DATA>');
      expect(dataBlock).toContain('</DATA>');
      expect(dataBlock).toContain('Sarah Jenkins');
      expect(dataBlock).toContain('Launching our new design system today!');
      expect(dataBlock).toContain('David Chen: "Looks sleek!"');
      expect(dataBlock).toContain('Morning run');
    });

    it('attaches context to user prompt for the latest turn only', () => {
      const context = buildFeedContext(mockPosts, mockStories, mockUser);
      const combined = withContext(context, 'What did Sarah post?');
      expect(combined).toContain('<DATA>');
      expect(combined).toContain('What did Sarah post?');
    });

    it('parses streamed briefing into headline, body, and advisories', () => {
      const sampleStream = `Design System Launch Takes Center Stage

Sarah Jenkins announced the launch of the new design system, receiving strong team enthusiasm. Community activity remains focused on collaborative work.
- Review design tokens before tomorrow's sync
- Congratulate Sarah on the launch`;

      const parsed = parseBriefing(sampleStream);
      expect(parsed.headline).toBe('Design System Launch Takes Center Stage');
      expect(parsed.body).toContain('Sarah Jenkins announced');
      expect(parsed.advisories).toHaveLength(2);
      expect(parsed.advisories[0]).toBe("Review design tokens before tomorrow's sync");
    });
  });

  describe('4. Daily Courtesy Quota (Almanac Step 8 Layer 4)', () => {
    it('checks daily quota', async () => {
      const quota = await checkDailyQuota();
      expect(quota).toBeDefined();
      expect(typeof quota.allowed).toBe('boolean');
      expect(typeof quota.remaining).toBe('number');
      expect(quota.remaining).toBeLessThanOrEqual(20);
    });

    it('increments daily quota count', async () => {
      const count = await incrementDailyQuota();
      expect(typeof count).toBe('number');
      expect(count).toBeGreaterThan(0);
    });
  });
});

