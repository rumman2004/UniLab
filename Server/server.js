// ============================================================
//  Resource BCA — Express server
// ============================================================
import './src/config/env.js'; // MUST be first: loads Server/.env
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import authRoutes from './src/routes/auth.js';
import papersRoutes from './src/routes/papers.js';
import notesRoutes from './src/routes/notes.js';
import externalNotesRoutes from './src/routes/external-notes.js';
import statsRoutes from './src/routes/stats.js';
import supportRoutes from './src/routes/support.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

app.disable('x-powered-by');
app.set('trust proxy', 1); // correct client IPs behind a proxy (for rate limiting)

// ---- Security headers (CSP tuned for this app) ----
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "blob:"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
        imgSrc: ["'self'", 'data:', 'https:'],
        // Supabase Storage (PDF preview/download) + API calls to self
        connectSrc: ["'self'", 'https:'],
        frameSrc: ["'self'", 'https:'],
        objectSrc: ["'self'", 'https:'],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);

app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ------------------------------------------------------------
//  API
// ------------------------------------------------------------
app.get('/api/health', (req, res) => res.json({ ok: true, time: Date.now() }));
app.use('/api/auth', authRoutes);
app.use('/api/papers', papersRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/external-notes', externalNotesRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/support', supportRoutes);

// ------------------------------------------------------------
//  Static assets
//  Public site is the web root; Admin panel lives under /admin.
// ------------------------------------------------------------
const CLIENT_DIR = path.join(__dirname, '..', 'Client');
const PUBLIC_DIR = path.join(CLIENT_DIR, 'Public');
const ADMIN_DIR = path.join(CLIENT_DIR, 'Admin');

app.use(express.static(PUBLIC_DIR, { extensions: ['html'] }));
app.use('/admin', express.static(ADMIN_DIR, { extensions: ['html'] }));

// ---- Clean, friendly page URLs ----
const page = (dir, file) => (req, res) => res.sendFile(path.join(dir, file));
const pub = (file) => page(path.join(PUBLIC_DIR, 'html'), file);
const adm = (file) => page(path.join(ADMIN_DIR, 'html'), file);

// Public pages
app.get('/', pub('Home.html'));
app.get('/pyq', pub('PYQ.html'));
app.get('/notes', pub('Notes.html'));
app.get('/external', pub('ExternalNotes.html'));
app.get('/about', pub('About.html'));
app.get('/faculty', pub('Faculty.html'));
app.get('/fees', pub('FeeStructure.html'));
app.get('/syllabus', pub('Syllabus.html'));
app.get('/support', pub('Support.html'));

// Admin pages (auth is enforced client-side + on every API call)
app.get('/admin', (req, res) => res.redirect('/admin/login'));
app.get('/admin/login', adm('Login.html'));
app.get('/admin/dashboard', adm('Dashboard.html'));
app.get('/admin/papers', adm('Papers.html'));
app.get('/admin/notes', adm('ManageNotes.html'));
app.get('/admin/external', adm('ExternalNotes.html'));

// ---- 404 ----
app.use((req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'Not found.' });
  }
  res.status(404).sendFile(path.join(PUBLIC_DIR, 'html', '404.html'), (err) => {
    if (err) res.status(404).send('404 — Page not found.');
  });
});

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`\x1b[32m✓ Resource BCA running →  http://localhost:${PORT}\x1b[0m`);
    if (!process.env.SUPABASE_URL) {
      console.log(
        '\x1b[33m  (Supabase not configured — add keys to .env to enable uploads/downloads)\x1b[0m'
      );
    }
  });
}

// Export for Vercel Serverless environment
export default app;
