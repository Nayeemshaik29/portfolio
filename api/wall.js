import { configured, redis } from './_lib.js';

// Public: totals plus the names of people who ticked "show my name on the website".
export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ ok: false });
  if (!configured()) return res.status(503).json({ ok: false });
  try {
    const [views, hi, rows] = await redis([['GET', 'views'], ['LLEN', 'visitors'], ['LRANGE', 'visitors', 0, 199]]);
    const people = rows
      .map((r) => { try { return JSON.parse(r); } catch { return null; } })
      .filter((v) => v && v.public === true)
      .slice(0, 24)
      .map((v) => ({ name: v.name, org: v.org, country: v.country }));
    res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
    return res.status(200).json({ ok: true, views: Number(views) || 0, hi: Number(hi) || 0, people });
  } catch {
    return res.status(500).json({ ok: false });
  }
}
