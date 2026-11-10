import { readConfig } from './_lib.js';

// Público: devolve só o que o site precisa mostrar.
export default async function handler(req, res) {
  const c = await readConfig();
  res.setHeader('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=300');
  res.status(200).json(c);
}
