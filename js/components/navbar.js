/**
 * OneMarket - Navigation Bar Component
 * Fresh pill-style navigation matching the forest-green and mint-green brand identity.
 * Features:
 * - Brand logo & tagline
 * - Pill-style navigation links: Home, Explore Products, Compare, Budget Buddy, My Orders, My Portal
 * - Hubballi location selector
 * - Cart button with live count pill
 * - Authenticated customer / seller account status & sign out
 * - Responsive mobile navigation drawer
 */

const Navbar = {
  render(activeRoute = 'home') {
    const locations = Store.getLocations();
    const selectedLocation = Store.getSelectedLocation();
    const cartSummary = Store.getCartSummary();
    const compareList = Store.getCompareList();
    const orders = Store.getOrders();
    const currentUser = Store.getCurrentUser();

    const compareCount = compareList.length;
    const ordersCount = orders.length;

    // Check if portal is active
    const isPortalActive = activeRoute === 'portal' || activeRoute.startsWith('seller');

    return `
      <!-- Main Navigation Header -->
      <header class="app-header" id="app-header">
        <div class="container header-container">
          <div class="header-inner">
            
            <!-- Brand Logo & Tagline -->
            <a href="#home" class="brand-wrapper" aria-label="OneMarket Home">
              <div class="brand-logo-icon">
                ${Utils.icons.logo}
              </div>
              <div class="brand-text">
                <span class="brand-name">One<span>Market</span></span>
                <span class="brand-tagline">YOUR CITY. YOUR SHOPS. ONE MARKETPLACE.</span>
              </div>
            </a>

            <!-- Desktop Pill Navigation Menu -->
            <nav class="desktop-nav" aria-label="Main Navigation">
              <ul class="nav-pill-group">
                <li>
                  <a href="#home" class="nav-pill-item ${activeRoute === 'home' ? 'active' : ''}">
                    Home
                  </a>
                </li>
                <li>
                  <a href="#catalog" class="nav-pill-item ${activeRoute === 'catalog' ? 'active' : ''}">
                    Explore Products
                  </a>
                </li>
                <li>
                  <a href="#compare" class="nav-pill-item ${activeRoute === 'compare' ? 'active' : ''}">
                    Compare
                    ${compareCount > 0 ? `<span class="nav-pill-badge" id="nav-compare-count">${compareCount}</span>` : ''}
                  </a>
                </li>
                <li>
                  <a href="#budget" class="nav-pill-item ${activeRoute === 'budget' ? 'active' : ''}">
                    Budget Buddy
                  </a>
                </li>
                <li>
                  <a href="#orders" class="nav-pill-item ${activeRoute === 'orders' ? 'active' : ''}">
                    My Orders
                    ${ordersCount > 0 ? `<span class="nav-pill-badge" id="nav-orders-count">${ordersCount}</span>` : ''}
                  </a>
                </li>
                <li>
                  <a href="#portal" class="nav-pill-item ${isPortalActive ? 'active' : ''}">
                    My Portal
                  </a>
                </li>
                ${currentUser?.role === 'admin' ? `
                  <li>
                    <a href="#admin" class="nav-pill-item ${activeRoute === 'admin' ? 'active' : ''}" style="color: #065f46; font-weight: 700;">
                      🛡️ Admin
                    </a>
                  </li>
                ` : ''}
              </ul>
            </nav>

            <!-- Header Right Actions -->
            <div class="header-actions">
              
              <!-- Hubballi Location Selector -->
              <div class="location-selector" title="Selected neighbourhood in Hubballi">
                <span class="location-icon">${Utils.icons.mapPin}</span>
                <select id="header-location-select" class="location-select" aria-label="Select neighbourhood in Hubballi">
                  ${locations.map(loc => `
                    <option value="${loc.id}" ${loc.id === selectedLocation.id ? 'selected' : ''}>
                      ${Utils.escapeHTML(loc.name.split(',')[0])}
                    </option>
                  `).join('')}
                </select>
              </div>

              <!-- Shopping Cart Button Trigger -->
              <a href="#cart" class="cart-btn-trigger" id="cart-button-trigger" aria-label="View Shopping Cart">
                ${Utils.icons.cart}
                <span class="cart-label">Cart</span>
                <span class="cart-count-pill" id="header-cart-count">${cartSummary.count}</span>
              </a>

              <!-- User Account / Sign In -->
              ${currentUser ? `
                <div class="user-auth-menu">
                  <a href="#portal" class="user-profile-badge" title="Open My Portal">
                    <span class="user-avatar">${currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}</span>
                    <div class="user-meta">
                      <span class="user-name">${Utils.escapeHTML(currentUser.name)}</span>
                      <span class="user-role-label">
                        ${currentUser.role === 'seller' ? (currentUser.shop?.name || 'Merchant') : 'Customer'}
                      </span>
                    </div>
                  </a>
                  <button type="button" class="btn btn-sm btn-outline header-btn-logout" id="btn-header-logout" title="Sign out">
                    Sign Out
                  </button>
                </div>
              ` : `
                <button type="button" class="btn btn-sm btn-primary header-btn-signin" id="btn-header-login">
                  ${Utils.icons.user || '👤'} <span>Sign In</span>
                </button>
              `}

              <!-- Mobile Hamburger Button -->
              <button type="button" class="mobile-nav-toggle" id="mobile-nav-toggle" aria-label="Open mobile navigation menu">
                ${Utils.icons.menu}
              </button>

            </div>

          </div>
        </div>
      </header>

      <!-- Mobile Navigation Drawer -->
      <div id="mobile-nav-drawer" class="modal-backdrop" style="display: none;">
        <div class="modal-dialog modal-sm mobile-drawer-dialog">
          <div class="modal-header">
            <div style="display: flex; align-items: center; gap: 8px;">
              <div class="brand-logo-icon" style="width: 30px; height: 30px;">
                ${Utils.icons.logo}
              </div>
              <h3 class="modal-title" style="font-size: 1.15rem; font-weight: 800; color: var(--primary-900);">OneMarket</h3>
            </div>
            <button class="modal-close-btn" id="mobile-nav-close" aria-label="Close navigation">${Utils.icons.close}</button>
          </div>
          <div class="modal-body" style="padding: var(--space-4);">
            <div class="mobile-nav-list">
              <a href="#home" class="mobile-link ${activeRoute === 'home' ? 'active' : ''}">
                ${Utils.icons.home || '🏠'} Home
              </a>
              <a href="#catalog" class="mobile-link ${activeRoute === 'catalog' ? 'active' : ''}">
                ${Utils.icons.search || '🔍'} Explore Products
              </a>
              <a href="#compare" class="mobile-link ${activeRoute === 'compare' ? 'active' : ''}">
                ${Utils.icons.compare || '⚖️'} Compare Products ${compareCount > 0 ? `<span class="nav-pill-badge">${compareCount}</span>` : ''}
              </a>
              <a href="#budget" class="mobile-link ${activeRoute === 'budget' ? 'active' : ''}">
                ${Utils.icons.wallet || '💰'} Budget Buddy
              </a>
              <a href="#orders" class="mobile-link ${activeRoute === 'orders' ? 'active' : ''}">
                ${Utils.icons.box || '📦'} My Orders ${ordersCount > 0 ? `<span class="nav-pill-badge">${ordersCount}</span>` : ''}
              </a>
              <a href="#portal" class="mobile-link ${isPortalActive ? 'active' : ''}">
                ${Utils.icons.user || '👤'} My Portal
              </a>
              ${currentUser?.role === 'admin' ? `
                <a href="#admin" class="mobile-link ${activeRoute === 'admin' ? 'active' : ''}" style="color: #065f46; font-weight: 700;">
                  🛡️ Admin Operations
                </a>
              ` : ''}
              <div style="margin-top: var(--space-4); padding-top: var(--space-4); border-top: 1px solid var(--neutral-200);">
                ${currentUser ? `
                  <div style="margin-bottom: var(--space-3); font-size: 0.85rem; color: var(--neutral-700);">
                    Signed in as <strong>${Utils.escapeHTML(currentUser.name)}</strong> (${currentUser.role})
                  </div>
                  <button type="button" class="btn btn-outline btn-block" id="btn-mobile-logout">
                    Sign Out
                  </button>
                ` : `
                  <button type="button" class="btn btn-primary btn-block" id="btn-mobile-login">
                    Sign In to OneMarket
                  </button>
                `}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  initListeners() {
    // Location selector listener
    const locSelect = document.getElementById('header-location-select');
    if (locSelect) {
      locSelect.addEventListener('change', (e) => {
        Store.setSelectedLocation(e.target.value);
        const loc = Store.getSelectedLocation();
        Utils.showToast(`Browsing shops in ${loc.name}`, 'info');
      });
    }

    // Login button triggers (desktop & mobile)
    const loginBtn = document.getElementById('btn-header-login');
    const mobileLoginBtn = document.getElementById('btn-mobile-login');
    const openLogin = () => {
      if (typeof AuthModal !== 'undefined') {
        AuthModal.open('customer', 'login', () => {
          App.renderCurrentRoute();
        });
      }
    };
    if (loginBtn) loginBtn.addEventListener('click', openLogin);
    if (mobileLoginBtn) mobileLoginBtn.addEventListener('click', openLogin);

    // Logout button triggers (desktop & mobile)
    const logoutBtn = document.getElementById('btn-header-logout');
    const mobileLogoutBtn = document.getElementById('btn-mobile-logout');
    const doLogout = () => {
      Store.logout();
      Utils.showToast('You have been signed out successfully.', 'info');
      App.renderCurrentRoute();
    };
    if (logoutBtn) logoutBtn.addEventListener('click', doLogout);
    if (mobileLogoutBtn) mobileLogoutBtn.addEventListener('click', doLogout);

    // Mobile nav drawer controls
    const mobileToggle = document.getElementById('mobile-nav-toggle');
    const mobileDrawer = document.getElementById('mobile-nav-drawer');
    const mobileClose = document.getElementById('mobile-nav-close');

    if (mobileToggle && mobileDrawer) {
      mobileToggle.addEventListener('click', () => {
        mobileDrawer.style.display = 'flex';
        requestAnimationFrame(() => mobileDrawer.classList.add('active'));
      });

      const closeDrawer = () => {
        mobileDrawer.classList.remove('active');
        setTimeout(() => mobileDrawer.style.display = 'none', 200);
      };

      if (mobileClose) mobileClose.addEventListener('click', closeDrawer);
      mobileDrawer.addEventListener('click', (e) => {
        if (e.target === mobileDrawer) closeDrawer();
      });

      document.querySelectorAll('.mobile-link').forEach(link => {
        link.addEventListener('click', closeDrawer);
      });
    }
  }
};
