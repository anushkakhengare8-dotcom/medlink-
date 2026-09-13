const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: 'ti-layout-dashboard', href: 'dashboard.html' },
  { id: 'search', label: 'Search Medicines', distributorLabel: 'My Catalog', icon: 'ti-search', href: 'search-medicines.html' },
  { id: 'orders', label: 'Orders', distributorLabel: 'Orders Received', icon: 'ti-clipboard-list', href: 'orders.html' },
  { id: 'cart', label: 'Cart', icon: 'ti-shopping-cart', href: 'cart.html', hideForDistributor: true },
  { id: 'invoices', label: 'Invoices', icon: 'ti-file-invoice', href: 'invoices.html' },
  { id: 'payments', label: 'Payments', icon: 'ti-credit-card', href: 'payments.html', hideForDistributor: true },
  { id: 'notifications', label: 'Notifications', icon: 'ti-bell', href: 'notifications.html' },
  { id: 'support', label: 'Support', icon: 'ti-headset', href: 'support.html' },
];

const LOGO_SVG = `
<svg width="26" height="26" viewBox="0 0 32 32" aria-hidden="true">
  <defs><clipPath id="medlink-pill-clip"><rect x="13" y="13.5" width="6" height="13.4" rx="3"/></clipPath></defs>
  <style>.medlink-leg-l{stroke:var(--primary-dark)}.medlink-arm-l{stroke:var(--primary)}.medlink-leg-r{stroke:var(--accent-blue)}.medlink-arm-r{stroke:var(--accent-blue)}.medlink-pill-top{fill:var(--primary-dark)}.medlink-pill-bottom{fill:var(--accent-blue)}.medlink-ring{stroke:var(--surface)}</style>
  <path class="medlink-leg-l" d="M7,5 L7,26" fill="none" stroke-width="6" stroke-linecap="round"/>
  <path class="medlink-arm-l" d="M8,6 L16,15" fill="none" stroke-width="6" stroke-linecap="round"/>
  <path class="medlink-leg-r" d="M25,5 L25,26" fill="none" stroke-width="6" stroke-linecap="round"/>
  <path class="medlink-arm-r" d="M24,6 L16,15" fill="none" stroke-width="6" stroke-linecap="round"/>
  <g clip-path="url(#medlink-pill-clip)">
    <rect class="medlink-pill-top" x="13" y="13.5" width="6" height="6.7"/>
    <rect class="medlink-pill-bottom" x="13" y="20.2" width="6" height="6.7"/>
  </g>
  <rect class="medlink-ring" x="13" y="13.5" width="6" height="13.4" rx="3" fill="none" stroke-width="1.4"/>
</svg>`;

function renderSidebar() {
  const activePage = document.body.dataset.page;
  const user = getUser();
  const isDistributor = user && user.role === 'DISTRIBUTOR';

  const links = NAV_ITEMS
    .filter(item => !(item.hideForDistributor && isDistributor))
    .map(item => {
      const label = (isDistributor && item.distributorLabel) ? item.distributorLabel : item.label;
      return `
    <li>
      <a class="nav-link${item.id === activePage ? ' active' : ''}" href="${item.href}">
        <i class="ti ${item.icon}"></i>
        <span>${label}</span>
      </a>
    </li>`;
    }).join('');

  const sidebar = document.getElementById('sidebar');
  if (!sidebar) return;

  sidebar.innerHTML = `
    <div class="sidebar__brand">
      ${LOGO_SVG}
      <span>MedLink</span>
    </div>
    <ul class="sidebar__nav">${links}</ul>
    <div class="sidebar__foot">
      <button class="theme-toggle" id="themeToggle" type="button">
        <i class="ti ti-moon" id="themeIcon"></i>
        <span id="themeLabel">Dark mode</span>
      </button>
    </div>`;
}

function renderTopbar() {
  const topbar = document.getElementById('topbar');
  if (!topbar) return;

  const user = getUser();
  const roleLabel = user && user.role === 'DISTRIBUTOR' ? 'Distributor' : 'Pharmacy owner';
  const roleIcon = user && user.role === 'DISTRIBUTOR' ? 'ti-truck-delivery' : 'ti-building-store';
  const displayName = (user && user.businessName) || 'Account';

  topbar.innerHTML = `
    <button class="menu-btn" id="menuBtn" type="button" aria-label="Open menu">
      <i class="ti ti-menu-2"></i>
    </button>
    <div class="role-badge">
      <i class="ti ${roleIcon}"></i>
      ${roleLabel}
    </div>
    <div class="topbar__right">
      <a class="icon-btn" href="notifications.html" aria-label="Notifications">
        <i class="ti ti-bell"></i>
      </a>
      <div class="user-chip">
        <div class="user-chip__avatar"><i class="ti ti-user"></i></div>
        <div class="user-chip__text">
          <div class="name">${displayName}</div>
          <div class="role">${roleLabel}</div>
        </div>
        <button class="logout-btn" id="logoutBtn" type="button" title="Log out">
          <i class="ti ti-logout"></i> Log out
        </button>
      </div>
    </div>`;

  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) logoutBtn.addEventListener('click', logout);
}

function initTheme() {
  const stored = localStorage.getItem('medlink-theme');
  if (stored === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
  updateThemeToggleLabel();

  const toggle = document.getElementById('themeToggle');
  if (!toggle) return;
  toggle.addEventListener('click', () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    if (isDark) {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('medlink-theme', 'light');
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('medlink-theme', 'dark');
    }
    updateThemeToggleLabel();
  });
}

function updateThemeToggleLabel() {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const icon = document.getElementById('themeIcon');
  const label = document.getElementById('themeLabel');
  if (!icon || !label) return;
  icon.className = isDark ? 'ti ti-sun' : 'ti ti-moon';
  label.textContent = isDark ? 'Light mode' : 'Dark mode';
}

function initMobileMenu() {
  const menuBtn = document.getElementById('menuBtn');
  const sidebar = document.getElementById('sidebar');
  const backdrop = document.getElementById('backdrop');
  if (!menuBtn || !sidebar || !backdrop) return;

  function open() {
    sidebar.classList.add('open');
    backdrop.classList.add('show');
  }
  function close() {
    sidebar.classList.remove('open');
    backdrop.classList.remove('show');
  }
  menuBtn.addEventListener('click', open);
  backdrop.addEventListener('click', close);
}

document.addEventListener('DOMContentLoaded', () => {
  // Kick out anyone without a valid session before rendering anything else.
  requireAuth();
  // Theme must apply before paint-sensitive layout runs; class already set via inline
  // script in <head> for each page to avoid a flash, this just wires the toggle.
  renderSidebar();
  renderTopbar();
  initTheme();
  initMobileMenu();
});
