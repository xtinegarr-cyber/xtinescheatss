import { Router } from 'express';
import { timingSafeEqual } from 'node:crypto';

// The store's admin login is checked here, against ADMIN_KEY from the
// server's environment, so the password is never shipped to browsers.
export const adminRouter = Router();

const WINDOW_MS = 10 * 60 * 1000;
const MAX_FAILURES = 10;
const failures = new Map<string, { count: number; resetAt: number }>();

function sameText(a: string, b: string): boolean {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

/** True only when ADMIN_KEY is set and `value` matches it. */
export function isAdminKey(value: unknown): boolean {
  const key = process.env.ADMIN_KEY;
  return Boolean(key) && typeof value === 'string' && sameText(value, key as string);
}

adminRouter.post('/admin/login', (req, res) => {
  if (!process.env.ADMIN_KEY) {
    return res.status(503).json({ error: 'Admin login is off: set ADMIN_KEY on the server.' });
  }
  const ip = req.ip ?? 'unknown';
  const now = Date.now();
  const entry = failures.get(ip);
  if (entry && entry.resetAt > now && entry.count >= MAX_FAILURES) {
    return res.status(429).json({ error: 'Too many attempts. Try again in 10 minutes.' });
  }

  const { username, password } = (req.body ?? {}) as { username?: unknown; password?: unknown };
  const expected = (process.env.ADMIN_USERNAME ?? 'Xtinegar').toLowerCase();
  const ok = typeof username === 'string' && username.trim().toLowerCase() === expected && isAdminKey(password);
  if (!ok) {
    if (!entry || entry.resetAt <= now) failures.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    else entry.count += 1;
    return res.status(401).json({ error: 'Incorrect username or password.' });
  }
  failures.delete(ip);
  return res.json({ ok: true });
});
