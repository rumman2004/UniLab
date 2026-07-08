// ------------------------------------------------------------
//  Admin shell: sidebar, auth guard, topbar, logout.
//  Every admin page (except Login) imports guardAndMount().
// ------------------------------------------------------------
import { api, toast } from '/script/api.js';

const ICONS = {
  dashboard: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" /></svg>`,
  upload: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" /></svg>`,
  papers: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" /></svg>`,
  notes: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" /></svg>`,
  globe: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" /></svg>`,
  logout: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" /></svg>`
};

const NAV = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: ICONS.dashboard },
  { href: '/admin/papers', label: 'Manage Papers', icon: ICONS.papers },
  { href: '/admin/notes', label: 'Manage Notes', icon: ICONS.notes },
  { href: '/admin/external', label: 'External Notes', icon: ICONS.globe },
];

function sidebarHtml(active) {
  const links = NAV.map(
    (n) => `<a href="${n.href}" class="nav-link ${
      active === n.href ? 'active' : ''
    }"><span class="flex items-center justify-center">${n.icon}</span> ${n.label}</a>`
  ).join('');

  return `
  <div class="flex h-full flex-col">
    <a href="/admin/dashboard" class="flex items-center gap-3 px-2 py-2">
      <span class="text-xl font-extrabold text-ink-900 tracking-tight">Uni<span class="text-brand-600">Lab</span></span>
    </a>
    <p class="mt-2 px-2 text-[10px] font-bold uppercase tracking-wider text-ink-400">Admin Panel</p>
    <nav class="mt-6 flex flex-1 flex-col gap-1.5">${links}</nav>
    <div class="mt-4 space-y-1.5 border-t border-ink-200 pt-4">
      <a href="/" target="_blank" class="nav-link"><span class="flex items-center justify-center">${ICONS.globe}</span> View site</a>
      <button id="logout-btn" class="nav-link w-full text-left text-red-600 hover:bg-red-50 hover:text-red-700"><span class="flex items-center justify-center">${ICONS.logout}</span> Logout</button>
    </div>
  </div>`;
}

// Verify the session, render the shell, or bounce to login.
export async function guardAndMount() {
  const active = window.location.pathname.replace(/\/$/, '');
  try {
    await api('/auth/me');
  } catch {
    window.location.href = '/admin/login';
    return false;
  }

  // Desktop sidebar
  const side = document.getElementById('admin-sidebar');
  if (side) side.innerHTML = sidebarHtml(active);
  // Mobile drawer
  const drawer = document.getElementById('admin-drawer-body');
  if (drawer) drawer.innerHTML = sidebarHtml(active);

  // Wire logout (there may be two buttons: desktop + mobile)
  document.querySelectorAll('#logout-btn').forEach((btn) =>
    btn.addEventListener('click', async () => {
      try {
        await api('/auth/logout', { method: 'POST' });
      } catch {}
      window.location.href = '/admin/login';
    })
  );

  // Mobile drawer toggle
  const openBtn = document.getElementById('drawer-open');
  const drawerWrap = document.getElementById('admin-drawer');
  const backdrop = document.getElementById('drawer-backdrop');
  const close = () => drawerWrap?.classList.add('hidden');
  openBtn?.addEventListener('click', () => drawerWrap?.classList.remove('hidden'));
  backdrop?.addEventListener('click', close);

  return true;
}

export { toast };
