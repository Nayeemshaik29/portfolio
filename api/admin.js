import { configured, redis, limited, safeEqual, readJson } from './_lib.js';

// Private: only works with the ADMIN_PIN set in Vercel. The PIN is sent in the body, never the URL.
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ ok: false });
  if (!configured() || !process.env.ADMIN_PIN) return res.status(503).json({ ok: false, error: 'not-configured' });

  const { pin, action, id } = await readJson(req);
  try {
    if (await limited(req, 'admin', 15)) return res.status(429).json({ ok: false, error: 'slow-down' });
    if (!pin || !safeEqual(pin, process.env.ADMIN_PIN)) return res.status(401).json({ ok: false });

    const [rows] = await redis([['LRANGE', 'visitors', 0, -1]]);
    if (action === 'delete' && id) {
      const raw = rows.find((r) => { try { return JSON.parse(r).id === id; } catch { return false; } });
      if (raw) await redis([['LREM', 'visitors', 0, raw]]);
      return res.status(200).json({ ok: true });
    }
    const visitors = rows.map((r) => { try { return JSON.parse(r); } catch { return null; } }).filter(Boolean);
    return res.status(200).json({ ok: true, visitors });
  } catch {
    return res.status(500).json({ ok: false });
  }
}
