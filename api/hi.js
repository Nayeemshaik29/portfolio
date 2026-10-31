import { configured, redis, limited, clean, readJson } from './_lib.js';

// Public: a visitor chooses to leave their name. Stored privately in Redis.
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ ok: false });
  if (!configured()) return res.status(503).json({ ok: false, error: 'not-configured' });

  const body = await readJson(req);
  if (body.website) return res.status(200).json({ ok: true }); // honeypot: bots fill this in

  const name = clean(body.name, 80);
  if (name.length < 2) return res.status(400).json({ ok: false, error: 'name' });

  try {
    if (await limited(req, 'hi', 5)) return res.status(429).json({ ok: false, error: 'slow-down' });
    const entry = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      name,
      org: clean(body.org, 100),
      public: body.public === true,
      page: clean(body.page, 120),
      country: clean(req.headers['x-vercel-ip-country'], 4),
      at: new Date().toISOString(),
    };
    await redis([['LPUSH', 'visitors', JSON.stringify(entry)], ['LTRIM', 'visitors', 0, 999]]);
    return res.status(200).json({ ok: true });
  } catch {
    return res.status(500).json({ ok: false });
  }
}
