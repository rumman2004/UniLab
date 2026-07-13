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
      <a href="/pyq" class="group relative flex flex-col p-6 rounded-[2rem] bg-ink-800/40 border border-ink-700/50 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:bg-ink-800/80 hover:border-brand-500/50 hover:shadow-2xl hover:shadow-brand-500/10">
        <div class="flex items-start justify-between gap-3 mb-4">
          <div class="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-brand-500/20 to-indigo-500/20 text-brand-400 ring-1 ring-inset ring-brand-500/30 transition-transform group-hover:scale-105">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          </div>
          <span class="inline-flex items-center rounded-full bg-ink-800/80 px-3 py-1 text-xs font-semibold tracking-wide text-brand-300 ring-1 ring-inset ring-brand-500/30">
            ${esc(p.year || 'New')}
          </span>
        </div>
        <h3 class="text-lg font-bold tracking-tight text-white line-clamp-2 group-hover:text-brand-300 transition-colors">${esc(p.title)}</h3>
        <p class="mt-2 text-sm font-medium text-ink-300">${esc(p.subject || 'General')} ${p.semester ? '· Semester ' + esc(p.semester) : ''}</p>
        <div class="mt-auto pt-6 flex items-center justify-between">
            <p class="text-xs font-medium text-ink-400">Added ${formatDate(p.created_at)}</p>
            <span class="text-brand-400 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300"><svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg></span>
        </div>
      </a>`
    )
    .join('');
}

loadStats();
