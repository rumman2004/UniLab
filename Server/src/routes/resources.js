// ------------------------------------------------------------
//  Reusable resource router factory.
//  Papers and Notes are almost identical (a titled PDF with some
//  metadata), so both are built from this single factory.
// ------------------------------------------------------------
import express, { Router } from 'express';
import multer from 'multer';
import crypto from 'node:crypto';
import { supabase, BUCKET, isSupabaseConfigured } from '../config/supabase.js';
import { requireAdmin } from '../middleware/auth.js';

const MAX_FILE_MB = 25;

// Keep the PDF in memory, then stream it to Supabase Storage.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_MB * 1024 * 1024 },
  fileFilter(req, file, cb) {
    const isPdf =
      file.mimetype === 'application/pdf' ||
      file.originalname.toLowerCase().endsWith('.pdf');
    if (!isPdf) return cb(new Error('Only PDF files are allowed.'));
    cb(null, true);
  },
});

// Turn "OS Unit 3 (2023).pdf" into "os-unit-3-2023.pdf" for a clean key.
function slugifyFilename(name) {
  const dot = name.lastIndexOf('.');
  const base = (dot === -1 ? name : name.slice(0, dot))
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
  return `${base || 'file'}.pdf`;
}

function guard(res) {
  if (!isSupabaseConfigured) {
    res.status(503).json({
      error:
        'Storage is not configured yet. Add your Supabase keys to the .env file.',
    });
    return false;
  }
  return true;
}

/**
 * @param {object} cfg
 * @param {string} cfg.table   Supabase table name
 * @param {string} cfg.folder  storage folder prefix within the bucket
 * @param {string[]} cfg.fields metadata columns accepted from the form
 */
export function createResourceRouter({ table, folder, fields }) {
  const router = Router();

  // Coerce numeric-looking fields; leave the rest as trimmed strings.
  const numericFields = new Set(['semester', 'year']);
  function pickFields(body) {
    const out = {};
    for (const f of fields) {
      let v = body[f];
      if (v === undefined || v === null || v === '') continue;
      if (numericFields.has(f)) {
        const n = parseInt(v, 10);
        if (!Number.isNaN(n)) out[f] = n;
      } else {
        out[f] = String(v).trim();
      }
    }
    return out;
  }

  // ---- PUBLIC: list resources with filters + search ----
  router.get('/', async (req, res) => {
    if (!guard(res)) return;
    const { subject, topic, semester, year, course, q, sort = 'new', limit } = req.query;

    let query = supabase.from(table).select('*');
    if (subject) query = query.eq('subject', subject);
    if (topic) query = query.eq('topic', topic);
    if (course) query = query.eq('course', course);
    if (semester) query = query.eq('semester', parseInt(semester, 10));
    if (year) query = query.eq('year', parseInt(year, 10));
    if (q) query = query.ilike('title', `%${q}%`);

    if (sort === 'downloads') query = query.order('downloads', { ascending: false });
    else query = query.order('created_at', { ascending: false });

    if (limit) query = query.limit(Math.min(parseInt(limit, 10) || 50, 200));

    const { data, error } = await query;
    if (error) return res.status(500).json({ error: error.message });
    res.json({ data });
  });

  // ---- PUBLIC: distinct values to build filter dropdowns ----
  router.get('/filters', async (req, res) => {
    if (!guard(res)) return;
    const filterFields = fields.filter(f => ['subject', 'semester', 'year', 'course', 'topic'].includes(f));
    if (filterFields.length === 0) return res.json({});
    
    const { data, error } = await supabase
      .from(table)
      .select(filterFields.join(', '));
    if (error) return res.status(500).json({ error: error.message });

    const uniq = (key) =>
      [...new Set(data.map((r) => r[key]).filter((v) => v !== null && v !== ''))];
    
    const result = {};
    if (filterFields.includes('subject')) result.subjects = uniq('subject').sort();
    if (filterFields.includes('topic')) result.topics = uniq('topic').sort();
    if (filterFields.includes('semester')) result.semesters = uniq('semester').sort((a, b) => a - b);
    if (filterFields.includes('year')) result.years = uniq('year').sort((a, b) => b - a);
    if (filterFields.includes('course')) result.courses = uniq('course').sort();
    
    res.json(result);
  });

  // ---- PUBLIC: download (counts the download, then redirects) ----
  router.get('/:id/download', async (req, res) => {
    if (!guard(res)) return;
    const { data, error } = await supabase
      .from(table)
      .select('file_url, downloads')
      .eq('id', req.params.id)
      .single();
    if (error || !data) return res.status(404).send('File not found.');

    // Best-effort increment; don't block the download if it fails.
    supabase
      .from(table)
      .update({ downloads: (data.downloads || 0) + 1 })
      .eq('id', req.params.id)
      .then(() => {});

    res.redirect(data.file_url);
  });

  // ---- ADMIN: upload a new resource ----
  router.post('/', requireAdmin, (req, res) => {
    upload.single('file')(req, res, async (err) => {
      if (err) return res.status(400).json({ error: err.message });
      if (!guard(res)) return;
      if (!req.file) return res.status(400).json({ error: 'A PDF file is required.' });

      const meta = pickFields(req.body);
      if (!meta.title) return res.status(400).json({ error: 'Title is required.' });

      const key = `${folder}/${Date.now()}-${crypto
        .randomBytes(4)
        .toString('hex')}-${slugifyFilename(req.file.originalname)}`;

      const { error: upErr } = await supabase.storage
        .from(BUCKET)
        .upload(key, req.file.buffer, {
          contentType: 'application/pdf',
          cacheControl: '3600',
          upsert: false,
        });
      if (upErr) return res.status(500).json({ error: `Upload failed: ${upErr.message}` });

      const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(key);

      const row = {
        ...meta,
        file_name: req.file.originalname,
        file_path: key,
        file_url: pub.publicUrl,
        file_size: req.file.size,
        downloads: 0,
      };

      const { data, error } = await supabase
        .from(table)
        .insert(row)
        .select()
        .single();
      if (error) {
        // Roll back the orphaned file if the DB insert fails.
        await supabase.storage.from(BUCKET).remove([key]);
        return res.status(500).json({ error: error.message });
      }
      res.status(201).json({ data });
    });
  });

  // ---- ADMIN: edit a resource (metadata only) ----
  router.patch('/:id', requireAdmin, express.json(), async (req, res) => {
    if (!guard(res)) return;
    const meta = pickFields(req.body);
    if (Object.keys(meta).length === 0) return res.status(400).json({ error: 'No fields provided.' });

    const { data, error } = await supabase
      .from(table)
      .update(meta)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    res.json({ data });
  });

  // ---- ADMIN: delete a resource (row + stored file) ----
  router.delete('/:id', requireAdmin, async (req, res) => {
    if (!guard(res)) return;
    const { data: row, error: findErr } = await supabase
      .from(table)
      .select('file_path')
      .eq('id', req.params.id)
      .single();
    if (findErr || !row) return res.status(404).json({ error: 'Not found.' });

    if (row.file_path) {
      await supabase.storage.from(BUCKET).remove([row.file_path]);
    }
    const { error } = await supabase.from(table).delete().eq('id', req.params.id);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ ok: true });
  });

  return router;
}
