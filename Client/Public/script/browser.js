// ------------------------------------------------------------
//  Reusable resource browser used by both the PYQ and Notes pages.
//  Renders filters + a live-updating grid of downloadable cards.
// ------------------------------------------------------------
import { api, esc, formatDate, formatBytes, toast } from '/script/api.js';

export function initBrowser({ endpoint, type }) {
  const grid = document.getElementById('results');
  const countEl = document.getElementById('result-count');
  const q = document.getElementById('f-search');
  const subject = document.getElementById('f-subject');
  const topic = document.getElementById('f-topic');
  const semester = document.getElementById('f-semester');
  const year = document.getElementById('f-year');
  const sort = document.getElementById('f-sort');
  const clearBtn = document.getElementById('f-clear');

  const isPaper = type === 'paper';
  const icon = isPaper ? '📄' : '📝';

  function skeletons() {
    grid.innerHTML = Array.from({ length: 6 })
      .map(
        () => `<div class="card p-5">
          <div class="skeleton h-11 w-11 rounded-lg"></div>
          <div class="skeleton mt-4 h-4 w-3/4"></div>
          <div class="skeleton mt-2 h-3 w-1/2"></div>
          <div class="skeleton mt-5 h-9 w-full"></div>
        </div>`
      )
      .join('');
  }

  function card(r) {
    const iconSvg = isPaper
      ? '<path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />'
      : '<path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />';

    const displayTitle = (isPaper && r.course === 'BCA' && r.subject) ? r.subject : (r.title || r.subject || r.topic);
    
    let metaLines = [];
    if (r.university) metaLines.push(r.university);
    const line1 = [r.course, r.semester ? `Semester ${r.semester}` : null].filter(Boolean).join(', ');
    if (line1) metaLines.push(line1);

    if (isPaper) {
      const line2 = [r.year, r.exam_type].filter(Boolean).join(', ');
      if (line2) metaLines.push(line2);
    } else {
      const line2 = [r.subject || r.topic, r.unit].filter(Boolean).join(', ');
      if (line2) metaLines.push(line2);
    }

    const metaHtml = metaLines.map(line => `<p class="text-sm font-medium text-ink-500">${esc(line)}</p>`).join('');

    return `
    <div class="card group flex flex-col p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-500/10 border border-ink-200/50 hover:border-brand-300/50 bg-white">
      <div class="flex items-start justify-between gap-3">
        <div class="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand-50 to-brand-100/50 text-brand-600 shadow-sm ring-1 ring-inset ring-brand-200/50 transition-transform group-hover:scale-105">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            ${iconSvg}
          </svg>
        </div>
        <span class="inline-flex items-center rounded-full bg-ink-50 px-2.5 py-0.5 text-[11px] font-semibold tracking-wide text-ink-500 ring-1 ring-inset ring-ink-200/50">
          ${formatBytes(r.file_size)}
        </span>
      </div>
      
      <div class="mt-5 flex-1">
        <h3 class="text-lg font-bold tracking-tight text-ink-900 line-clamp-2 group-hover:text-brand-600 transition-colors mb-1.5">${esc(displayTitle)}</h3>
        <div class="flex flex-col gap-1">
          ${metaHtml}
        </div>
        ${r.description ? `<p class="mt-2.5 line-clamp-2 text-sm leading-relaxed text-ink-600">${esc(r.description)}</p>` : ''}
      </div>
      
      <div class="mt-5 flex items-center justify-between border-t border-ink-100 pt-4 text-xs font-medium text-ink-500">
        <span class="flex items-center gap-1.5" title="Uploaded on ${formatDate(r.created_at)}">
          <svg class="h-4 w-4 text-ink-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          ${formatDate(r.created_at)}
        </span>
        <span class="flex items-center gap-1.5" title="${r.downloads || 0} downloads">
          <svg class="h-4 w-4 text-ink-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
          ${r.downloads || 0}
        </span>
      </div>
      
      <div class="mt-4 grid grid-cols-2 gap-3">
        <a href="${esc(r.file_url)}" target="_blank" rel="noopener" class="btn-outline btn-sm flex items-center justify-center gap-2">
          <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
          Preview
        </a>
        <a href="/api/${endpoint}/${r.id}/download" class="btn-primary btn-sm flex items-center justify-center gap-2">
          <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
          Download
        </a>
      </div>
    </div>`;
  }

  function emptyState() {
    grid.innerHTML = `
      <div class="card col-span-full flex flex-col items-center gap-3 p-12 text-center">
        <div class="flex h-16 w-16 items-center justify-center rounded-full bg-ink-50 mb-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-ink-400"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        </div>
        <h3 class="text-lg font-bold">Nothing found</h3>
        <p class="max-w-sm text-sm text-ink-500">Try clearing the filters, or check back later — new ${isPaper ? 'papers' : 'notes'} are added regularly.</p>
      </div>`;
  }

  let debounce;
  async function load() {
    const params = new URLSearchParams();
    if (q.value.trim()) params.set('q', q.value.trim());
    if (subject && subject.value) params.set('subject', subject.value);
    if (topic && topic.value) params.set('topic', topic.value);
    if (semester && semester.value) params.set('semester', semester.value);
    if (year && year.value) params.set('year', year.value);
    if (sort.value) params.set('sort', sort.value);
    if (sort.value) params.set('sort', sort.value);

    skeletons();
    try {
      const { data } = await api(`/${endpoint}?${params.toString()}`);
      countEl.textContent = `${data.length} result${data.length === 1 ? '' : 's'}`;
      grid.innerHTML = data.length ? data.map(card).join('') : '';
      if (!data.length) emptyState();
    } catch (e) {
      countEl.textContent = '';
      grid.innerHTML = `<div class="card col-span-full p-10 text-center text-ink-500">
        ${esc(e.message)}<br /><span class="text-sm">Add your Supabase keys to <code>.env</code> to load resources.</span></div>`;
    }
  }

  async function loadFilters() {
    try {
      const f = await api(`/${endpoint}/filters`);
      const fill = (sel, items, label) => {
        if (!sel) return;
        sel.innerHTML =
          `<option value="">${label}</option>` +
          items.map((v) => `<option value="${esc(v)}">${esc(v)}</option>`).join('');
      };
      if (subject) fill(subject, f.subjects || [], 'All subjects');
      if (topic) fill(topic, f.topics || [], 'All topics');
      if (semester) {
        semester.innerHTML =
          `<option value="">All semesters</option>` +
          (f.semesters || []).map((s) => `<option value="${s}">Semester ${s}</option>`).join('');
      }
      if (year) fill(year, f.years || [], 'All years');
    } catch {
      /* filters optional */
    }
  }

  // Events
  q?.addEventListener('input', () => {
    clearTimeout(debounce);
    debounce = setTimeout(load, 300);
  });
  [subject, topic, semester, year, sort].forEach((el) => el?.addEventListener('change', load));
  clearBtn?.addEventListener('click', () => {
    q.value = '';
    [subject, topic, semester, year].forEach((el) => el && (el.value = ''));
    sort.value = 'new';
    load();
  });

  loadFilters();
  load();
}
