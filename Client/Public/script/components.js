// ------------------------------------------------------------
//  Shared public site chrome: top navbar + footer.
//  Renders into <div id="site-nav"> and <div id="site-footer">.
// ------------------------------------------------------------

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/pyq', label: 'PYQ Papers' },
  { href: '/notes', label: 'Notes' },
  { href: '/external', label: 'External Notes' },
  { href: '/syllabus', label: 'Syllabus' },
  { href: '/support', label: 'Support' },
];

function isActive(href) {
  const path = window.location.pathname.replace(/\/$/, '') || '/';
  return href === path;
}

function navbar() {
  const links = (extra = '') =>
    NAV_LINKS.map(
      (l) => {
        const active = isActive(l.href);
        return `<a href="${l.href}" class="${extra} relative font-medium transition-all duration-300 ${
          active ? 'text-brand-700' : 'text-ink-600 hover:text-brand-600'
        } group">
          ${l.label}
          ${active ? '<span class="absolute -bottom-1 left-0 w-full h-0.5 bg-brand-600 rounded-full"></span>' : '<span class="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-600 rounded-full transition-all duration-300 group-hover:w-full"></span>'}
        </a>`;
      }
    ).join('');

  return `
  <header class="sticky top-0 z-50 border-b border-ink-200 bg-white/90 backdrop-blur-xl shadow-sm transition-all duration-300">
    <nav class="container-app flex h-[72px] items-center justify-between px-4 sm:px-6">
      <a href="/" class="flex items-center gap-1 group">
        <span class="text-2xl font-black tracking-tight text-ink-900">Uni<span class="text-brand-600">Lab</span></span>
      </a>

      <div class="hidden items-center gap-5 text-sm lg:flex">
        ${links('')}
      </div>

      <div class="hidden items-center gap-4 lg:flex">
        <a href="/pyq" class="inline-flex items-center justify-center rounded-lg bg-ink-900 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-brand-600 hover:shadow-brand-600/30 hover:-translate-y-0.5">
          Browse Papers
        </a>
      </div>

      <button id="nav-toggle" aria-label="Open menu" aria-controls="mobile-menu" aria-expanded="false"
        class="grid h-10 w-10 place-items-center rounded-lg text-ink-700 hover:bg-ink-100 focus:bg-ink-100 lg:hidden transition-colors">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="4" y1="7" x2="20" y2="7"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="17" x2="20" y2="17"/></svg>
      </button>
    </nav>

    <!-- Mobile Menu -->
    <div id="mobile-menu" class="hidden overflow-hidden bg-white border-t border-ink-100 shadow-xl lg:hidden transition-all duration-300">
      <div class="container-app flex flex-col gap-2 p-4 text-base sm:p-6">
        ${NAV_LINKS.map(l => `<a href="${l.href}" class="mobile-nav-link block rounded-lg px-4 py-3 font-semibold ${isActive(l.href) ? 'bg-brand-50 text-brand-700' : 'text-ink-600 hover:bg-ink-50 hover:text-ink-900'} transition-colors">${l.label}</a>`).join('')}
        <div class="mt-4 pt-4 border-t border-ink-100">
          <a href="/pyq" class="mobile-nav-link flex w-full items-center justify-center rounded-lg bg-ink-900 px-5 py-3.5 text-center font-bold text-white shadow-sm transition-all hover:bg-brand-600">
            Browse Papers
          </a>
        </div>
      </div>
    </div>
  </header>`;
}

function footer() {
  const year = new Date().getFullYear();
  return `
  <footer class="mt-32 bg-ink-900 text-ink-300">
    <!-- Decorative Top Border -->
    <div class="h-1.5 w-full bg-gradient-to-r from-brand-400 via-brand-600 to-indigo-600"></div>
    
    <div class="container-app grid gap-12 px-6 py-16 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8">
      <div class="sm:col-span-2 lg:col-span-5">
        <a href="/" class="flex items-center gap-1">
          <span class="text-2xl font-black tracking-tight text-white">Uni<span class="text-brand-400">Lab</span></span>
        </a>
        <p class="mt-6 max-w-sm text-sm leading-relaxed text-ink-400">
          Your ultimate academic companion. Free previous year question papers and expertly curated subject notes for university students. Study smarter, not harder.
        </p>
      </div>
      
      <div class="lg:col-span-2 lg:col-start-7">
        <h4 class="text-xs font-bold tracking-widest text-white uppercase mb-6">Resources</h4>
        <ul class="space-y-4 text-sm font-medium">
          <li><a href="/pyq" class="transition-colors hover:text-brand-400">PYQ Papers</a></li>
          <li><a href="/notes" class="transition-colors hover:text-brand-400">Subject Notes</a></li>
          <li><a href="/external" class="transition-colors hover:text-brand-400">External Notes</a></li>
          <li><a href="/syllabus" class="transition-colors hover:text-brand-400">Official Syllabus</a></li>
        </ul>
      </div>
      
      <div class="lg:col-span-2">
        <h4 class="text-xs font-bold tracking-widest text-white uppercase mb-6">Community</h4>
        <ul class="space-y-4 text-sm font-medium">
          <li><a href="/support" class="transition-colors hover:text-brand-400">Request Material</a></li>
          <li><a href="/support" class="transition-colors hover:text-brand-400">Report a Bug</a></li>
        </ul>
      </div>
      
      <div class="lg:col-span-2">
        <h4 class="text-xs font-bold tracking-widest text-white uppercase mb-6">Admin Portal</h4>
        <ul class="space-y-4 text-sm font-medium">
          <li><a href="/admin/login" class="inline-flex items-center gap-2 rounded-lg bg-ink-800 px-3 py-1.5 transition-colors hover:bg-brand-600 hover:text-white">Sign In <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg></a></li>
        </ul>
      </div>
    </div>
    
    <div class="border-t border-ink-800 bg-ink-900">
      <div class="container-app flex flex-col items-center justify-between gap-4 px-6 py-6 text-sm text-ink-500 sm:flex-row">
        <p>© ${year} UniLab. Built for students, by students.</p>
        <p class="flex items-center gap-1.5">Made with <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-brand-500"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg> for our juniors.</p>
      </div>
    </div>
  </footer>`;
}

function mountChrome() {
  const nav = document.getElementById('site-nav');
  const foot = document.getElementById('site-footer');
  if (nav) nav.innerHTML = navbar();
  if (foot) foot.innerHTML = footer();

  const toggle = document.getElementById('nav-toggle');
  const menu = document.getElementById('mobile-menu');
  const closeMenu = () => {
    menu?.classList.add('hidden');
    toggle?.setAttribute('aria-expanded', 'false');
  };
  toggle?.addEventListener('click', () => {
    const isOpen = !menu?.classList.contains('hidden');
    menu?.classList.toggle('hidden');
    toggle.setAttribute('aria-expanded', String(!isOpen));
  });
  document.querySelectorAll('.mobile-nav-link').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenu();
  });
  window.addEventListener('resize', () => {
    if (window.innerWidth >= 1024) closeMenu();
  });

  // Mobile filters toggle
  const filterToggle = document.getElementById('toggle-filters');
  const filterContainer = document.getElementById('filters-container');
  if (filterToggle && filterContainer) {
    const isFilterOpen = () => filterContainer.classList.contains('is-open') || window.innerWidth >= 1024;
    filterToggle.setAttribute('aria-controls', 'filters-container');
    filterToggle.setAttribute('aria-expanded', String(isFilterOpen()));
    filterToggle.addEventListener('click', () => {
      filterContainer.classList.toggle('is-open');
      filterToggle.setAttribute('aria-expanded', String(isFilterOpen()));
    });
    window.addEventListener('resize', () => {
      filterToggle.setAttribute('aria-expanded', String(isFilterOpen()));
    });
  }
}

document.addEventListener('DOMContentLoaded', mountChrome);
