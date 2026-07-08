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
    const tags = [
      r.semester ? `Sem ${esc(r.semester)}` : null,
      isPaper && r.year ? esc(r.year) : null,
      isPaper && r.exam_type ? esc(r.exam_type) : null,
      !isPaper && r.unit ? esc(r.unit) : null,
    ]
      .filter(Boolean)
      .map((t) => `<span class="badge-ink">${t}</span>`)
      .join('');

    return `
    <div class="card flex flex-col p-5 transition hover:shadow-lg">
      <div class="flex items-start justify-between gap-3">
        <div class="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-brand-50 text-xl">${icon}</div>
        <span class="text-xs text-ink-400">${formatBytes(r.file_size)}</span>
      </div>
      <h3 class="mt-3 line-clamp-2 font-semibold text-ink-900">${esc(r.title)}</h3>
      <p class="mt-1 text-sm text-ink-500">${esc(r.topic || r.subject || 'General')}</p>
      ${r.description ? `<p class="mt-2 line-clamp-2 text-sm text-ink-500">${esc(r.description)}</p>` : ''}
      <div class="mt-3 flex flex-wrap gap-1.5">${tags}</div>
      <div class="mt-auto flex items-center justify-between pt-4">
        <span class="text-xs text-ink-400">${formatDate(r.created_at)} · ${r.downloads || 0} ⬇</span>
      </div>
      <div class="mt-3 grid grid-cols-2 gap-2">
        <a href="${esc(r.file_url)}" target="_blank" rel="noopener" class="btn-outline btn-sm">View</a>
        <a href="/api/${endpoint}/${r.id}/download" class="btn-primary btn-sm">Download</a>
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
        fill(
          semester,
          (f.semesters || []).map((s) => s),
          'All semesters'
        );
      if (semester) {
        semester.innerHTML =
          `<option value="">All semesters</option>` +
          (f.semesters || []).map((s) => `<option value="${s}">Semester ${s}</option>`).join('');
      }
      if (year) fill(year, f.years, 'All years');
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
