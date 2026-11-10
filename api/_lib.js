import crypto from 'node:crypto';
import { list } from '@vercel/blob';

export const COOKIE = 'lp_admin';
const WEEK = 7 * 24 * 3600;

const secret = () => process.env.SESSION_SECRET || process.env.ADMIN_PASSWORD || '';
const mac = (v) => crypto.createHmac('sha256', secret()).update(v).digest('hex');
const sha = (s) => crypto.createHash('sha256').update(s).digest();

export function sessionCookie() {
  const exp = String(Date.now() + WEEK * 1000);
  return `${COOKIE}=${exp}.${mac(exp)}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${WEEK}`;
}
export const clearCookie = () => `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`;

export function hasSession(req) {
  if (!secret()) return false;
  const raw = (req.headers.cookie || '').split(';').map((s) => s.trim()).find((s) => s.startsWith(COOKIE + '='));
  if (!raw) return false;
  const [exp, sig] = raw.slice(COOKIE.length + 1).split('.');
  if (!exp || !sig || Number(exp) < Date.now()) return false;
  const a = Buffer.from(sig);
  const b = Buffer.from(mac(exp));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export function passwordOk(pw) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || typeof pw !== 'string') return false;
  return crypto.timingSafeEqual(sha(pw), sha(expected));
}

export const CONFIG_PATH = 'config/site.json';

export async function readConfig() {
  try {
    const { blobs } = await list({ prefix: CONFIG_PATH, limit: 1 });
    if (!blobs.length) return {};
    const r = await fetch(`${blobs[0].url}?t=${Date.now()}`);
    return r.ok ? await r.json() : {};
  } catch {
    return {};
  }
}
