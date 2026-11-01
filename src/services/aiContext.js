// @file    aiContext.js
// @folder  src/services/
// @about   AI system prompts, guardrails, and DATA block templates for Gemini.
//
// What this file does:
// - Defines GUARDRAILS — safety rules applied to every AI conversation.
// - FEED_BRIEFING_SYSTEM — prompt for generating the daily feed digest.
// - POST_POLISH_SYSTEM   — prompt for AI-assisted post improvement in AddTaskModal.
// - CHAT_SYSTEM          — prompt for the general-purpose Meta AI chat assistant.
// - buildFeedData()      — injects the user's posts into a structured <DATA> block.

/**
 * Prompt rules, guardrails, and templates for Facebook AI (Steps 6 & 7 of The Almanac Guide).
 *
 * All prompts follow the Guide's layered structure:
 *   Shared GUARDRAILS + Feature-specific System Prompt + Scoped <DATA> Block
 */

// ─── 6.1 & 6.2 SHARED GUARDRAILS ─────────────────────────────
export const GUARDRAILS = `
Rules:
- Answer only from the DATA block. Never invent or estimate facts or counts that are not there.
- The data covers user posts, authors, post timestamps, categories (Work, Personal, Ideas), comments, reactions, and stories.
- It does NOT cover real-world external news, weather, or private account data outside this app. If asked about those, say plainly in one sentence that you do not have that data.
- Keep the tone modern, friendly, concise, and helpful, matching a native Facebook mobile assistant.
- Never open with a pleasantry (e.g. "Sure!", "Hello!", "Great question!"). Never restate the question. Never mention "the data" as a phrase.
- Concrete and specific: cite author names, post categories, or numbers you are reasoning from.
- Answer length: strictly 2 to 4 sentences maximum unless the feature format explicitly requires bullet lines.
`.trim();

// ─── 6.3 FEATURE RULES ───────────────────────────────────────
export const BRIEFING_SYSTEM = `
You are Meta AI inside this Facebook app. You write the smart digest under the feed stories.

Format strictly:
Line 1: one sentence headline, 12 words maximum
Then a blank line, then 2 to 3 sentences summarizing what people are sharing or working on.
Then, only if a post or task genuinely warrants it, up to 2 lines each starting with "- " noting an action or topic.

${GUARDRAILS}
`.trim();

export const CHAT_SYSTEM = `
You are Meta AI, the intelligent assistant inside this Facebook app. The user is asking questions about feed posts, friend updates, comments, work/personal ideas, or asking for help drafting content.

Format: 2 to 4 sentences (sized perfectly for a phone screen).
Scope: If a question is not about this app's feed, posts, tasks, or drafting social content, say in one line that you only cover this feed and post assistance, and stop.

${GUARDRAILS}
`.trim();

export const POST_POLISH_SYSTEM = `
You are the Post Assistant inside Facebook. The user is drafting a post. Suggest one clean, compelling, polished version of their draft that is authentic and engaging, followed by 2-3 relevant hashtags.

${GUARDRAILS}
`.trim();

// ─── 7.1 & 7.2 TEMPLATES (<DATA> BLOCK) ───────────────────────

/**
 * Turns app state into a compact, human-readable <DATA> block for the model.
 * Trims unneeded fields, pre-formats dates and numbers, and labels lines clearly.
 */
export function buildFeedContext(posts = [], stories = [], user = null) {
  const lines = [];
  lines.push('<DATA>');

  if (user) {
    const displayName = user.name || user.email?.split('@')[0] || 'User';
    lines.push(`CURRENT USER: ${displayName} (${user.email || 'guest'})`);
  }

  lines.push(`POSTS COUNT: ${posts.length}`);

  const categories = [...new Set(posts.map((p) => p.category).filter(Boolean))];
  lines.push(`ACTIVE CATEGORIES: ${categories.join(', ') || 'General'}`);

  lines.push('');
  lines.push('RECENT POSTS (newest first):');

  if (posts.length === 0) {
    lines.push('(No posts in the feed yet)');
  } else {
    // Trim to 10 most recent posts to control token budget
    posts.slice(0, 10).forEach((p, index) => {
      const author = p.author || p.authorName || 'Anonymous';
      const category = p.category || 'General';
      const time = p.time || 'recently';
      const content = (p.content || '').replace(/\s+/g, ' ').trim();
      const likes =
        typeof p.reactions === 'object'
          ? (p.reactions?.like || 0) + (p.reactions?.love || 0) + (p.reactions?.laugh || 0)
          : (p.reactions || 0);
      const comments = Array.isArray(p.comments) ? p.comments : [];
      const status = p.completed ? ' [Completed]' : '';

      lines.push(
        `[#${index + 1}] ${author} (${time}) [${category}]${status}: "${content}" | Likes: ${likes}, Comments: ${comments.length}`
      );

      // Include up to 2 notable comments
      if (comments.length > 0) {
        comments.slice(0, 2).forEach((c) => {
          const cAuthor = c.author || c.authorName || 'Commenter';
          const cText = (c.text || '').replace(/\s+/g, ' ').trim();
          lines.push(`   * Comment by ${cAuthor}: "${cText}"`);
        });
      }
    });
  }

  if (stories && stories.length > 0) {
    lines.push('');
    lines.push('STORIES:');
    stories.slice(0, 5).forEach((s) => {
      const sName = s.name || 'Friend';
      const sCaption = s.caption ? ` - "${s.caption}"` : '';
      lines.push(`- ${sName}${sCaption}`);
    });
  }

  lines.push('</DATA>');
  return lines.join('\n');
}

/**
 * Section 7.3: The DATA block goes on the newest message only, never stored in history.
 */
export function withContext(context, userPrompt) {
  if (!context) return userPrompt;
  return `${context}\n\n${userPrompt}`;
}

/**
 * Section 7.4: Parses a templated briefing while streaming or on complete.
 * Tolerates partial chunks gracefully.
 */
export function parseBriefing(text) {
  if (!text || typeof text !== 'string') {
    return { headline: '', body: '', advisories: [] };
  }

  const lines = text.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
  if (lines.length === 0) {
    return { headline: '', body: '', advisories: [] };
  }

  const headline = lines[0].replace(/^#+\s*/, '').trim();
  const bodyLines = [];
  const advisories = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith('- ') || line.startsWith('* ')) {
      advisories.push(line.substring(2).trim());
    } else {
      bodyLines.push(line);
    }
  }

  return {
    headline,
    body: bodyLines.join(' '),
    advisories,
  };
}

