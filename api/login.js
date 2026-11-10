import { clearCookie, hasSession, passwordOk, sessionCookie } from './_lib.js';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'GET') {
    return res.status(200).json({ ok: hasSession(req), configured: Boolean(process.env.ADMIN_PASSWORD) });
  }
  if (req.method === 'DELETE') {
    res.setHeader('Set-Cookie', clearCookie());
    return res.status(200).json({ ok: true });
  }
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido.' });

  if (!process.env.ADMIN_PASSWORD) {
    return res.status(500).json({ error: 'Defina a variável ADMIN_PASSWORD na Vercel e faça um novo deploy.' });
  }
  if (passwordOk(req.body?.password)) {
    res.setHeader('Set-Cookie', sessionCookie());
    return res.status(200).json({ ok: true });
  }
  await new Promise((r) => setTimeout(r, 800)); // freia tentativas em sequência
  return res.status(401).json({ error: 'Senha incorreta.' });
}
