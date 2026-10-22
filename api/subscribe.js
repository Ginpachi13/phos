// Vercel function: takes { email, consent, ts, source } from the join forms.
// The PDF stores email, timestamp and consent before launch. The newsletter tool
// (Substack, Beehiiv, Kit or Mailchimp) is still an open decision, so this only
// validates and logs. Wire the chosen tool's API here once it is picked.
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false });
  const { email, consent, ts, source } = req.body || {};
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || consent !== true) return res.status(400).json({ ok: false });
  console.log(JSON.stringify({ type: 'subscribe', email, ts: ts || new Date().toISOString(), source: source || '' }));
  return res.status(200).json({ ok: true });
}
