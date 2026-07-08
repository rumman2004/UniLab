// ------------------------------------------------------------
//  Admin authentication (single admin, JWT in an httpOnly cookie)
// ------------------------------------------------------------
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'insecure-dev-secret';
const SESSION_DURATION = process.env.SESSION_DURATION || '8h';
export const COOKIE_NAME = 'rbca_session';

// Create a signed session token for the admin.
export function issueToken(payload = {}) {
  return jwt.sign({ role: 'admin', ...payload }, JWT_SECRET, {
    expiresIn: SESSION_DURATION,
  });
}

// Cookie options used both when setting and clearing the cookie.
export function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 1000 * 60 * 60 * 8, // ~8h; browser hint only, JWT is the source of truth
    path: '/',
  };
}

// Verify the session cookie. Returns the decoded token or null.
export function readSession(req) {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) return null;
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

// Middleware: block the request unless a valid admin session exists.
export function requireAdmin(req, res, next) {
  const session = readSession(req);
  if (!session || session.role !== 'admin') {
    return res.status(401).json({ error: 'Not authenticated. Please log in.' });
  }
  req.admin = session;
  next();
}
