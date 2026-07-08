import { guardAndMount } from '/admin/script/admin.js';
import { api, esc, formatDate } from '/script/api.js';

(async () => {
  if (!(await guardAndMount())) return;

  try {
    const s = await api('/stats');
    document.getElementById('s-papers').textContent = s.papers;
    document.getElementById('s-notes').textContent = s.notes;
    document.getElementById('s-downloads').textContent = s.totalDownloads;

    if (!s.configured) {
      document.getElementById('not-configured').classList.remove('hidden');
    }

    const recent = document.getElementById('recent');
    if (!s.recent?.length) {
      recent.innerHTML = '<div class="px-5 py-8 text-center text-ink-400">No uploads yet.</div>';
      return;
    }

    recent.innerHTML = s.recent
      .map((r) => `
        <div class="flex items-center justify-between px-5 py-4 transition-colors hover:bg-ink-50/50">
          <div class="flex items-center gap-4">
            <span class="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-ink-100/50">
              ${r.type === 'paper' 
                ? '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 text-brand-600"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" /></svg>' 
                : '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 text-accent-600"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" /></svg>'}
            </span>
            <div><p class="font-bold text-ink-900">${esc(r.title)}</p>
            <p class="text-xs font-medium text-ink-500 mt-0.5">${esc(r.subject || 'General')} &middot; ${formatDate(r.created_at)}</p></div>
          </div>
          <span class="badge-ink text-xs px-2.5 py-1">${r.downloads || 0} <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-3.5 h-3.5 ml-0.5"><path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg></span>
        </div>`)
      .join('');
  } catch {
    document.getElementById('not-configured').classList.remove('hidden');
  }
})();
