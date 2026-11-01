/**
 * Almanac Proxy Server (Steps 4, 8, 9 & 10 of The Almanac Guide).
 *
 * A lightweight, zero-dependency Node.js proxy server that securely holds
 * the Gemini API key, validates incoming requests, and streams answers
 * back to the mobile app with strict security guard rails.
 *
 * To run:
 *   node --env-file=server/.env server/proxy.js
 * Or simply:
 *   node server/proxy.js
 */

const http = require('http');
const https = require('https');
const url = require('url');
const fs = require('fs');
const path = require('path');

// Auto-load .env if not already loaded into process.env
function loadEnvFile(envPath) {
  try {
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      content.split(/\r?\n/).forEach((line) => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) return;
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx > 0) {
          const key = trimmed.slice(0, eqIdx).trim();
          const val = trimmed.slice(eqIdx + 1).trim();
          if (!process.env[key]) {
            process.env[key] = val;
          }
        }
      });
    }
  } catch (_) {}
}

loadEnvFile(path.join(__dirname, '.env'));
loadEnvFile(path.join(__dirname, '..', '.env'));

// ─── CONFIGURATION & GUARD RAILS (Section 8.1 & 9.3) ─────────
const PORT = Number(process.env.PORT) || 8787;
const GEMINI_API_KEY =
  process.env.GEMINI_API_KEY || '';
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash-lite';

const MAX_TOKENS_CEILING = 1024; // longest answer allowed
const MAX_BODY_BYTES = 64 * 1024; // 64 KB request limit
const MAX_TURNS = 24; // longest conversation accepted
const MAX_SYSTEM_CHARS = 8000; // longest rule set accepted
const UPSTREAM_TIMEOUT_MS = 30000; // 30s upstream timeout
const RATE_LIMIT_PER_HOUR = Number(process.env.RATE_LIMIT_PER_HOUR) || 30;
const HOUR_MS = 60 * 60 * 1000;

// ─── IN-MEMORY IP RATE LIMITER (Section 8.3) ─────────────────
const hits = new Map();

function rateLimited(ip) {
  const now = Date.now();
  const entry = hits.get(ip);

  if (!entry || now - entry.start > HOUR_MS) {
    hits.set(ip, { start: now, count: 1 });
    return false;
  }

  entry.count += 1;
  return entry.count > RATE_LIMIT_PER_HOUR;
}

// ─── VALIDATION (Section 9.3) ────────────────────────────────
function validatePayload(payload) {
  if (!payload || typeof payload !== 'object') {
    return { valid: false, error: 'Invalid JSON body' };
  }

  // Check turns
  const contents = payload.contents;
  if (!Array.isArray(contents) || contents.length === 0) {
    return { valid: false, error: 'Missing or empty contents array' };
  }

  if (contents.length > MAX_TURNS) {
    return { valid: false, error: `Conversation exceeds maximum ${MAX_TURNS} turns` };
  }

  for (const turn of contents) {
    if (!turn || typeof turn !== 'object') {
      return { valid: false, error: 'Each turn must be an object' };
    }
    const role = turn.role;
    if (role !== 'user' && role !== 'model') {
      return { valid: false, error: 'Each turn needs role "user" or "model"' };
    }
    if (!Array.isArray(turn.parts) || turn.parts.length === 0) {
      return { valid: false, error: 'Each turn requires non-empty parts' };
    }
  }

  // Check system instruction length
  if (payload.system && typeof payload.system === 'string') {
    if (payload.system.length > MAX_SYSTEM_CHARS) {
      return { valid: false, error: `System prompt exceeds ${MAX_SYSTEM_CHARS} chars` };
    }
  }

  return { valid: true };
}

// ─── SERVER ──────────────────────────────────────────────────
const server = http.createServer((req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // Only accept POST on AI endpoints
  const validPaths = ['/ai', '/almanac', '/chat'];
  if (req.method !== 'POST' || !validPaths.includes(pathname)) {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
    return;
  }

  // Step 10: Client IP determination (supports TRUST_PROXY)
  const clientIp =
    process.env.TRUST_PROXY === '1'
      ? (req.headers['x-forwarded-for'] || '').split(',')[0].trim() ||
        req.socket.remoteAddress
      : req.socket.remoteAddress || '127.0.0.1';

  // Rate limit check
  if (rateLimited(clientIp)) {
    res.writeHead(429, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Too many requests. Please wait.' }));
    return;
  }

  // Read request body with size ceiling
  let body = '';
  let bytesReceived = 0;

  req.on('data', (chunk) => {
    bytesReceived += chunk.length;
    if (bytesReceived > MAX_BODY_BYTES) {
      res.writeHead(413, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Request body too large' }));
      req.destroy();
      return;
    }
    body += chunk;
  });

  req.on('end', () => {
    let payload;
    try {
      payload = JSON.parse(body);
    } catch (e) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Invalid JSON body' }));
      return;
    }

    const validation = validatePayload(payload);
    if (!validation.valid) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: validation.error }));
      return;
    }

    if (!GEMINI_API_KEY) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'GEMINI_API_KEY is not set on the proxy' }));
      return;
    }

    // Section 9.3: Never trust client blindly — rebuild upstream body field by field
    const maxTokensRequested =
      Number(payload.generationConfig?.maxOutputTokens) || 512;
    const maxTokens = Math.min(maxTokensRequested, MAX_TOKENS_CEILING);

    const upstreamPayload = {
      contents: payload.contents,
      generationConfig: {
        maxOutputTokens: maxTokens,
        temperature: 0.7,
      },
    };

    if (payload.system) {
      upstreamPayload.systemInstruction = {
        parts: [{ text: payload.system }],
      };
    }

    const upstreamUrl = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:streamGenerateContent?key=${GEMINI_API_KEY}&alt=sse`;

    // SSE headers for streaming back to mobile app
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    });

    const upstreamReq = https.request(
      upstreamUrl,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        timeout: UPSTREAM_TIMEOUT_MS,
      },
      (upstreamRes) => {
        if (upstreamRes.statusCode !== 200) {
          console.error(
            `Upstream Gemini error: HTTP ${upstreamRes.statusCode}`
          );
        }

        upstreamRes.on('data', (chunk) => {
          res.write(chunk);
        });

        upstreamRes.on('end', () => {
          res.end();
        });
      }
    );

    upstreamReq.on('timeout', () => {
      console.error('Upstream timeout');
      upstreamReq.destroy(new Error('Upstream timeout'));
      if (!res.writableEnded) {
        res.writeHead(504, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Upstream gateway timeout' }));
      }
    });

    upstreamReq.on('error', (err) => {
      console.error('Upstream request error:', err.message);
      if (!res.writableEnded) {
        res.end();
      }
    });

    // Step 8 Layer 9: Res.on('close') abort upstream if mobile client disconnects
    res.on('close', () => {
      upstreamReq.destroy();
    });

    upstreamReq.write(JSON.stringify(upstreamPayload));
    upstreamReq.end();
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(
    `Meta AI / Almanac proxy listening on http://0.0.0.0:${PORT}/ai (model ${GEMINI_MODEL})`
  );
});

module.exports = server;

