// ------------------------------------------------------------
//  Reusable resource browser used by both the PYQ and Notes pages.
//  Renders filters + a live-updating grid of downloadable cards.
// ------------------------------------------------------------
import { api, esc, formatDate, formatBytes } from '/script/api.js';

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

  function skeletons() {
    grid.innerHTML = Array.from({ length: 8 })
      .map(
        () => `<div class="card p-5" aria-hidden="true">
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

    const metaHtml = metaLines.map(line => `<p class="text-[11px] font-medium leading-snug text-ink-500 sm:text-sm">${esc(line)}</p>`).join('');

    return `
    <div class="card group flex min-h-[285px] flex-col p-3 transition-all duration-300 hover:-translate-y-1 hover:border-brand-300 hover:shadow-xl hover:shadow-brand-500/10 sm:min-h-[320px] sm:p-5">
      <div class="flex items-start justify-between gap-2 sm:gap-3">
        <div class="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-600 ring-1 ring-inset ring-brand-200/70 transition-transform group-hover:scale-105 sm:h-11 sm:w-11">
          <svg class="h-4 w-4 sm:h-5 sm:w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            ${iconSvg}
          </svg>
        </div>
        <span class="inline-flex items-center rounded-full bg-ink-50 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-ink-500 ring-1 ring-inset ring-ink-200/70 sm:px-2.5 sm:py-1 sm:text-xs">
          ${formatBytes(r.file_size)}
        </span>
      </div>
      
      <div class="mt-4 flex-1 sm:mt-5">
        <h3 class="mb-2 line-clamp-2 text-sm font-bold leading-snug tracking-tight text-ink-900 transition-colors group-hover:text-brand-600 sm:text-lg">${esc(displayTitle)}</h3>
        <div class="flex flex-col gap-0.5 sm:gap-1">
          ${metaHtml}
        </div>
        ${r.description ? `<p class="mt-3 hidden text-sm leading-relaxed text-ink-600 sm:line-clamp-2">${esc(r.description)}</p>` : ''}
      </div>
      
      <div class="mt-4 flex items-center justify-between gap-2 border-t border-ink-100 pt-3 text-[10px] font-medium text-ink-500 sm:mt-5 sm:gap-3 sm:pt-4 sm:text-xs">
        <span class="flex min-w-0 items-center gap-1 sm:gap-1.5" title="Uploaded on ${formatDate(r.created_at)}">
          <svg class="h-3.5 w-3.5 shrink-0 text-ink-400 sm:h-4 sm:w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          ${formatDate(r.created_at)}
        </span>
        <span class="flex shrink-0 items-center gap-1 sm:gap-1.5" title="${r.downloads || 0} downloads">
          <svg class="h-3.5 w-3.5 text-ink-400 sm:h-4 sm:w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
          ${r.downloads || 0}
        </span>
      </div>
      
      <div class="mt-3 grid grid-cols-2 gap-2 sm:mt-4 sm:gap-3">
        <a href="${esc(r.file_url)}" data-preview-url="${esc(r.file_url)}" data-preview-title="${esc(displayTitle)}" data-download-url="/api/${endpoint}/${r.id}/download" class="btn-outline btn-sm min-h-9 gap-1 px-1.5 text-[10px] sm:min-h-10 sm:gap-2 sm:px-3 sm:text-xs">
          <svg class="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
          Preview
        </a>
        <a href="/api/${endpoint}/${r.id}/download" class="btn-primary btn-sm min-h-9 gap-1 px-1.5 text-[10px] sm:min-h-10 sm:gap-2 sm:px-3 sm:text-xs">
          <svg class="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
          Download
        </a>
      </div>
    </div>`;
  }

  function closePreview() {
    const modal = document.getElementById('pdf-preview-modal');
    if (!modal) return;
    modal.remove();
    document.body.classList.remove('overflow-hidden');
  }

  function openPreview({ url, title, downloadUrl }) {
    closePreview();
    document.body.classList.add('overflow-hidden');
    const modal = document.createElement('div');
    modal.id = 'pdf-preview-modal';
    modal.className = 'fixed inset-0 z-[100] flex bg-ink-950/70 p-0 backdrop-blur-sm sm:p-4';
    modal.innerHTML = `
      <div class="mx-auto flex h-full w-full max-w-6xl flex-col overflow-hidden bg-white shadow-2xl sm:rounded-lg">
        <div class="flex min-h-14 items-center justify-between gap-3 border-b border-ink-200 px-3 py-2 sm:px-4">
          <div class="min-w-0">
            <p class="truncate text-sm font-bold text-ink-900 sm:text-base">${esc(title || 'PDF Preview')}</p>
            <p class="hidden text-xs text-ink-500 sm:block">Previewing directly on UniLab</p>
          </div>
          <div class="flex shrink-0 items-center gap-2">
            <a href="${esc(url)}" target="_blank" rel="noopener" class="btn-outline btn-sm hidden sm:inline-flex">Open</a>
            <a href="${esc(downloadUrl)}" class="btn-primary btn-sm">Download</a>
            <button type="button" class="btn-ghost btn-sm h-9 w-9 px-0" data-preview-close aria-label="Close PDF preview">
              <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12"/></svg>
            </button>
          </div>
        </div>
        <iframe src="${esc(url)}#toolbar=1&navpanes=0" title="${esc(title || 'PDF preview')}" class="h-full w-full flex-1 bg-ink-100"></iframe>
      </div>`;
    modal.addEventListener('click', (event) => {
      if (event.target === modal || event.target.closest('[data-preview-close]')) closePreview();
    });
    document.body.appendChild(modal);
  }

  function emptyState() {
    grid.innerHTML = `
      <div class="card col-span-full flex flex-col items-center gap-3 p-12 text-center">
        <div class="flex h-16 w-16 items-center justify-center rounded-full bg-ink-50 mb-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-ink-400"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        </div>
        <h3 class="text-lg font-bold text-ink-900">Nothing found</h3>
        <p class="max-w-sm text-sm text-ink-500">Try clearing the filters, or check back later — new ${isPaper ? 'papers' : 'notes'} are added regularly.</p>
      </div>`;
  }

  let debounce;
  async function load() {
    const params = new URLSearchParams();
    if (q?.value.trim()) params.set('q', q.value.trim());
    if (subject && subject.value) params.set('subject', subject.value);
    if (topic && topic.value) params.set('topic', topic.value);
    if (semester && semester.value) params.set('semester', semester.value);
    if (year && year.value) params.set('year', year.value);
    if (sort?.value) params.set('sort', sort.value);

    skeletons();
    try {
      const { data } = await api(`/${endpoint}?${params.toString()}`);
      countEl.textContent = `${data.length} result${data.length === 1 ? '' : 's'}`;
      grid.innerHTML = data.length ? data.map(card).join('') : '';
      if (!data.length) emptyState();
    } catch (e) {
      countEl.textContent = '';
      grid.innerHTML = `<div class="card col-span-full p-10 text-center text-ink-500">
        ${esc(e.message)}<br /><span class="text-sm">Resources are temporarily unavailable. Please try again later.</span></div>`;
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
  grid?.addEventListener('click', (event) => {
    const preview = event.target.closest('[data-preview-url]');
    if (!preview) return;
    event.preventDefault();
    openPreview({
      url: preview.dataset.previewUrl,
      title: preview.dataset.previewTitle,
      downloadUrl: preview.dataset.downloadUrl,
    });
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closePreview();
  });

  q?.addEventListener('input', () => {
    clearTimeout(debounce);
    debounce = setTimeout(load, 300);
  });
  [subject, topic, semester, year, sort].forEach((el) => el?.addEventListener('change', load));
  clearBtn?.addEventListener('click', () => {
    if (q) q.value = '';
    [subject, topic, semester, year].forEach((el) => el && (el.value = ''));
    if (sort) sort.value = 'new';
    load();
  });

  loadFilters();
  load();
}
