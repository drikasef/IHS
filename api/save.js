import { del, put } from '@vercel/blob';
import { CONFIG_PATH, hasSession, readConfig } from './_lib.js';

const str = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

function normalizeWhatsapp(v) {
  let d = str(v, 40).replace(/\D/g, '');
  if (!d) return '';
  if (d.length === 10 || d.length === 11) d = '55' + d; // número brasileiro sem DDI
  return d.length >= 12 && d.length <= 15 ? d : null;
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido.' });
  if (!hasSession(req)) return res.status(401).json({ error: 'Sessão expirada. Entre novamente.' });

  const b = req.body || {};
  const current = await readConfig();
  const next = { ...current };

  const wa = normalizeWhatsapp(b.whatsapp);
  if (wa === null) return res.status(400).json({ error: 'WhatsApp inválido. Use DDD + número, por exemplo 11 99999-8888.' });
  const email = str(b.email, 120);
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: 'E-mail inválido.' });

  Object.assign(next, {
    brand: str(b.brand, 60),
    nome: str(b.nome, 80),
    credenciais: str(b.credenciais, 200),
    sobre1: str(b.sobre1, 1500),
    sobre2: str(b.sobre2, 1500),
    whatsapp: wa,
    mensagem: str(b.mensagem, 200),
    instagram: str(b.instagram, 100).replace(/^https?:\/\/(www\.)?instagram\.com\//i, '').replace(/[@/?].*$/, '').replace(/[^A-Za-z0-9._]/g, ''),
    email,
  });

  // Foto: nova (data URL) ou remoção
  try {
    if (typeof b.fotoData === 'string' && b.fotoData) {
      const m = /^data:(image\/(?:jpeg|png|webp));base64,(.+)$/.exec(b.fotoData);
      if (!m) return res.status(400).json({ error: 'Formato de foto não aceito. Use JPG, PNG ou WebP.' });
      const buf = Buffer.from(m[2], 'base64');
      if (buf.length > 3 * 1024 * 1024) return res.status(400).json({ error: 'A foto está muito grande.' });
      const ext = m[1] === 'image/png' ? 'png' : m[1] === 'image/webp' ? 'webp' : 'jpg';
      const blob = await put(`config/foto-${Date.now()}.${ext}`, buf, {
        access: 'public', contentType: m[1], addRandomSuffix: false,
      });
      if (current.foto) await del(current.foto).catch(() => {});
      next.foto = blob.url;
    } else if (b.removerFoto === true) {
      if (current.foto) await del(current.foto).catch(() => {});
      next.foto = '';
    }

    await put(CONFIG_PATH, JSON.stringify(next), {
      access: 'public', contentType: 'application/json', addRandomSuffix: false,
      allowOverwrite: true, cacheControlMaxAge: 60,
    });
  } catch (e) {
    const msg = /token|BLOB/i.test(String(e?.message))
      ? 'O armazenamento (Blob) ainda não está conectado a este projeto na Vercel.'
      : 'Não foi possível salvar. Tente de novo em instantes.';
    return res.status(500).json({ error: msg });
  }
  return res.status(200).json({ ok: true, config: next });
}
