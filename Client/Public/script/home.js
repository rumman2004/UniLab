import { api, esc, formatDate } from '/script/api.js';

// Animate a number counting up to its final value.
function countTo(el, target) {
  if (!el) return;
  const dur = 900;
  const start = performance.now();
  function tick(now) {
    const p = Math.min((now - start) / dur, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(target * eased).toLocaleString();
    if (p < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

async function loadStats() {
  try {
    // Public counts derived from the public list endpoints.
    const [papers, notes] = await Promise.all([
      api('/papers?limit=200'),
      api('/notes?limit=200'),
    ]);
    const p = papers.data || [];
    const n = notes.data || [];
    const downloads =
      p.reduce((s, r) => s + (r.downloads || 0), 0) +
      n.reduce((s, r) => s + (r.downloads || 0), 0);
    countTo(document.getElementById('stat-papers'), p.length);
    countTo(document.getElementById('stat-notes'), n.length);
    countTo(document.getElementById('stat-downloads'), downloads);
    renderRecent(p.slice(0, 6));
  } catch (e) {
    // Supabase not configured yet — show zeros gracefully.
    ['stat-papers', 'stat-notes', 'stat-downloads'].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.textContent = '0';
    });
    renderRecent([]);
  }
}

function renderRecent(papers) {
  const host = document.getElementById('recent-papers');
  if (!host) return;
  if (!papers.length) {
    host.innerHTML = `<div class="card col-span-full p-8 text-center text-ink-500">
      No papers yet — they'll appear here once the admin uploads them.</div>`;
    return;
  }
  host.innerHTML = papers
    .map(
      (p) => `
      <a href="/pyq" class="card group p-5 transition hover:-translate-y-0.5 hover:shadow-lg">
        <div class="flex items-start justify-between gap-3">
          <div class="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-brand-50 text-xl">📄</div>
          <span class="badge-ink">${esc(p.year || '')}</span>
        </div>
        <h3 class="mt-3 line-clamp-2 font-semibold text-ink-900 group-hover:text-brand-700">${esc(p.title)}</h3>
        <p class="mt-1 text-sm text-ink-500">${esc(p.subject || 'General')} ${p.semester ? '· Sem ' + esc(p.semester) : ''}</p>
        <p class="mt-3 text-xs text-ink-400">Added ${formatDate(p.created_at)}</p>
      </a>`
    )
    .join('');
}

loadStats();
