import { createHash, timingSafeEqual } from 'node:crypto';

// Accepts the names Vercel's Upstash integration sets (KV_*) or the plain Upstash ones.
const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

export const configured = () => Boolean(url && token);

// Runs Redis commands through Upstash's REST pipeline. cmds = [['SET','k','v'], ...]
export async function redis(cmds) {
  const r = await fetch(`${url}/pipeline`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(cmds),
  });
  if (!r.ok) throw new Error('redis ' + r.status);
  return (await r.json()).map((x) => x.result);
}

export const sha = (s) => createHash('sha256').update(s).digest('hex');

export const clientKey = (req) => {
  const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
  // Only a daily hash is kept for rate limiting; the IP itself is never stored.
  return sha(ip + new Date().toISOString().slice(0, 10)).slice(0, 24);
};

// Allows `max` calls per hour per visitor for the given bucket.
export async function limited(req, bucket, max) {
  const key = `rl:${bucket}:${clientKey(req)}`;
  const [n] = await redis([['INCR', key], ['EXPIRE', key, 3600]]);
  return n > max;
}

export function safeEqual(a, b) {
  const x = Buffer.from(sha(String(a)));
  const y = Buffer.from(sha(String(b)));
  return timingSafeEqual(x, y);
}

// Trim, drop control characters and cap the length.
export const clean = (v, max) =>
  String(v ?? '').replace(/[\u0000-\u001f\u007f<>]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);

export const readJson = async (req) => {
  if (req.body && typeof req.body === 'object') return req.body;
  try { return JSON.parse(req.body || '{}'); } catch { return {}; }
};
