// ------------------------------------------------------------
//  Auth routes:  POST /api/auth/login, /logout, GET /me
// ------------------------------------------------------------
import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import {
  issueToken,
  cookieOptions,
  readSession,
  COOKIE_NAME,
} from '../middleware/auth.js';

const router = Router();

// Throttle login attempts to slow down brute-force guessing.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per window per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts. Try again in a few minutes.' },
});

// Constant-time-ish comparison to avoid trivially leaking length/timing.
function safeEqual(a = '', b = '') {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

router.post('/login', loginLimiter, (req, res) => {
  const { username, password } = req.body || {};
  const expectedUser = process.env.ADMIN_USERNAME || 'admin';
  const expectedPass = process.env.ADMIN_PASSWORD || '';

  if (!expectedPass) {
    return res
      .status(500)
      .json({ error: 'Admin password is not configured on the server.' });
  }

  const ok =
    safeEqual(String(username || ''), expectedUser) &&
    safeEqual(String(password || ''), expectedPass);

  if (!ok) {
    return res.status(401).json({ error: 'Invalid username or password.' });
  }

  const token = issueToken({ user: expectedUser });
  res.cookie(COOKIE_NAME, token, cookieOptions());
  res.json({ ok: true, user: expectedUser });
});

router.post('/logout', (req, res) => {
  res.clearCookie(COOKIE_NAME, { ...cookieOptions(), maxAge: undefined });
  res.json({ ok: true });
});

// Lets the admin frontend check if the session is still valid.
router.get('/me', (req, res) => {
  const session = readSession(req);
  if (!session || session.role !== 'admin') {
    return res.status(401).json({ authenticated: false });
  }
  res.json({ authenticated: true, user: session.user });
});

export default router;
