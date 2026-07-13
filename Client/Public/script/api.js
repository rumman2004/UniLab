// ------------------------------------------------------------
//  Shared frontend helpers: API calls, toasts, formatting.
//  Loaded on every page as /script/api.js
// ------------------------------------------------------------

// Thin fetch wrapper that always sends cookies and parses JSON.
export async function api(pathname, { method = 'GET', body, isForm } = {}) {
  const opts = { method, credentials: 'same-origin', headers: {} };
  if (body !== undefined) {
    if (isForm) {
      opts.body = body; // FormData — let the browser set the boundary
    } else {
      opts.headers['Content-Type'] = 'application/json';
      opts.body = JSON.stringify(body);
    }
  }
  const res = await fetch(`/api${pathname}`, opts);
  let data = null;
  try {
    data = await res.json();
  } catch {
    /* no JSON body */
  }
  if (!res.ok) {
    const err = new Error(data?.error || `Request failed (${res.status})`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

// ---- Toast notifications ----
let toastHost;
export function toast(message, type = 'info') {
  if (!toastHost) {
    toastHost = document.createElement('div');
    toastHost.className =
      'fixed z-[100] bottom-4 left-4 right-4 flex flex-col gap-2 sm:left-auto sm:right-5 sm:bottom-5 sm:max-w-sm';
    document.body.appendChild(toastHost);
  }
  const colors = {
    info: 'bg-ink-900 text-white',
    success: 'bg-emerald-600 text-white',
    error: 'bg-red-600 text-white',
  };
  const el = document.createElement('div');
  el.className = `${colors[type] || colors.info} rounded-lg px-4 py-3 text-sm font-medium shadow-lg translate-x-4 opacity-0 transition-all duration-300`;
  el.textContent = message;
  toastHost.appendChild(el);
  requestAnimationFrame(() => {
    el.classList.remove('translate-x-4', 'opacity-0');
  });
  setTimeout(() => {
    el.classList.add('translate-x-4', 'opacity-0');
    setTimeout(() => el.remove(), 300);
  }, 3200);
}

// ---- Formatting helpers ----
export function formatBytes(bytes) {
  if (!bytes) return '—';
  const units = ['B', 'KB', 'MB', 'GB'];
  let i = 0;
  let n = bytes;
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024;
    i++;
  }
  return `${n.toFixed(n < 10 && i > 0 ? 1 : 0)} ${units[i]}`;
}

export function formatDate(iso) {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

// Escape user-provided text before injecting into HTML.
export function esc(str = '') {
  return String(str).replace(
    /[&<>"']/g,
    (c) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]
  );
}
