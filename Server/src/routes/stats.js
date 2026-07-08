// ------------------------------------------------------------
//  Stats for the admin dashboard.  GET /api/stats  (admin only)
// ------------------------------------------------------------
import { Router } from 'express';
import { supabase, isSupabaseConfigured } from '../config/supabase.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/', requireAdmin, async (req, res) => {
  if (!isSupabaseConfigured) {
    return res.json({
      papers: 0,
      notes: 0,
      totalDownloads: 0,
      recent: [],
      configured: false,
    });
  }

  async function summarize(table, type) {
    const { data, error } = await supabase
      .from(table)
      .select('id, title, subject, downloads, created_at')
      .order('created_at', { ascending: false });
    if (error) return { count: 0, downloads: 0, recent: [] };
    return {
      count: data.length,
      downloads: data.reduce((s, r) => s + (r.downloads || 0), 0),
      recent: data.slice(0, 5).map((r) => ({ ...r, type })),
    };
  }

  const [p, n] = await Promise.all([
    summarize('papers', 'paper'),
    summarize('notes', 'note'),
  ]);

  const recent = [...p.recent, ...n.recent]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 6);

  res.json({
    papers: p.count,
    notes: n.count,
    totalDownloads: p.downloads + n.downloads,
    recent,
    configured: true,
  });
});

export default router;
