import { configured, redis, limited } from './_lib.js';

// Public: counts a visit. Stores only a number, nothing about the visitor.
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ ok: false });
  if (!configured()) return res.status(503).json({ ok: false });
  try {
    if (await limited(req, 'hit', 20)) return res.status(429).json({ ok: false });
    await redis([['INCR', 'views']]);
    return res.status(200).json({ ok: true });
  } catch {
    return res.status(500).json({ ok: false });
  }
}
