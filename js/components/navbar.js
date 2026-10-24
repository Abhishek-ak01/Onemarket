/**
 * LocalLoop - Navigation Bar Component
 * Top demo banner, brand logo, navigation links with active states,
 * location selector, user profile / auth button, and cart counter badge.
 */

const Navbar = {
  render(activeRoute = 'home') {
    const locations = Store.getLocations();
    const selectedLocation = Store.getSelectedLocation();
    const mode = Store.getMode();
    const cartSummary = Store.getCartSummary();
    const compareList = Store.getCompareList();
    const orders = Store.getOrders();
    const currentUser = Store.getCurrentUser();

    const compareCount = compareList.length;
    const ordersCount = orders.length;

    return `
      <!-- Top Demo Banner & Quick Evaluator Switcher -->
      <aside class="demo-pill-banner" aria-label="Demo Prototype Information">
        <div class="container" style="display: flex; align-items: center; justify-content: space-between; width: 100%; flex-wrap: wrap; gap: 8px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span class="demo-pill-badge">CODEFEST 2026</span>
            &nbsp;<strong>OneMarket</strong> — Hyperlocal Neighbourhood Marketplace • Hubballi
          </div>
          <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
            <span style="font-size: 0.72rem; color: #a7f3d0; font-weight: 600;">EVALUATOR SHORTCUT:</span>
            <button type="button" class="btn btn-xs" id="quick-switch-guest" style="padding: 2px 8px; font-size: 0.7rem; font-weight: 700; background: ${!currentUser ? '#059669' : 'rgba(255,255,255,0.15)'}; color: #ffffff; border: 1px solid rgba(255,255,255,0.2); border-radius: 4px; cursor: pointer;">
              Guest Mode
            </button>
            <button type="button" class="btn btn-xs" id="quick-switch-cust" style="padding: 2px 8px; font-size: 0.7rem; font-weight: 700; background: ${currentUser?.role === 'customer' ? '#059669' : 'rgba(255,255,255,0.15)'}; color: #ffffff; border: 1px solid rgba(255,255,255,0.2); border-radius: 4px; cursor: pointer;">
              Customer (Aditi)
            </button>
            <button type="button" class="btn btn-xs" id="quick-switch-sell" style="padding: 2px 8px; font-size: 0.7rem; font-weight: 700; background: ${currentUser?.role === 'seller' ? '#059669' : 'rgba(255,255,255,0.15)'}; color: #ffffff; border: 1px solid rgba(255,255,255,0.2); border-radius: 4px; cursor: pointer;">
              Seller (Malabar)
            </button>
            <button type="button" class="demo-reset-link" id="btn-reset-demo-header" title="Reset all demo edits back to seed data" style="margin-left: 6px;">
              ${Utils.icons.refresh} Reset Data
            </button>
          </div>
        </div>
      </aside>

      <!-- Main Navigation Header -->
      <header class="app-header" id="app-header">
        <div class="container">
          <div class="header-inner">
            
            <!-- Brand Logo -->
            <a href="#home" class="brand-wrapper" aria-label="OneMarket Home">
              <div class="brand-logo-icon">
                ${Utils.icons.logo}
              </div>
              <div class="brand-text">
                <span class="brand-name">One<span>Market</span></span>
                <span class="brand-tagline">YOUR CITY. YOUR SHOPS. ONE MARKETPLACE.</span>
              </div>
            </a>

            <!-- Desktop Navigation Links -->
            <nav class="desktop-nav" aria-label="Main Navigation">
              <ul class="nav-links">
                <li>
                  <a href="#home" class="nav-link ${activeRoute === 'home' ? 'active' : ''}">
                    Home
                  </a>
                </li>
                <li>
                  <a href="#catalog" class="nav-link ${activeRoute === 'catalog' ? 'active' : ''}">
                    Explore Products
                  </a>
                </li>
                <li>
                  <a href="#compare" class="nav-link ${activeRoute === 'compare' ? 'active' : ''}">
                    Compare
                    ${compareCount > 0 ? `<span class="nav-badge" id="nav-compare-count">${compareCount}</span>` : ''}
                  </a>
                </li>
                <li>
                  <a href="#budget" class="nav-link ${activeRoute === 'budget' ? 'active' : ''}">
                    Budget Buddy
                  </a>
                </li>
                <li>
                  <a href="#orders" class="nav-link ${activeRoute === 'orders' ? 'active' : ''}">
                    My Orders
                    ${ordersCount > 0 ? `<span class="nav-badge" id="nav-orders-count">${ordersCount}</span>` : ''}
                  </a>
                </li>
                <li>
                  <a href="#seller" class="nav-link ${activeRoute.startsWith('seller') ? 'active' : ''}">
                    Seller Portal
                  </a>
                </li>
              </ul>
            </nav>

            <!-- Header Right Actions -->
            <div class="header-actions">
              
              <!-- Demo Location Selector -->
              <div class="location-selector" title="Select demo neighbourhood in Hubballi">
                <span class="location-icon">${Utils.icons.mapPin}</span>
                <select id="header-location-select" class="location-select" aria-label="Select demo neighbourhood in Hubballi">
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
                <span class="cart-label" style="font-weight: 700;">Cart</span>
                <span class="cart-count-pill" id="header-cart-count">${cartSummary.count}</span>
              </a>

              <!-- Authentication / User Profile Button -->
              ${currentUser ? `
                <div class="user-auth-menu" style="display: flex; align-items: center; gap: 8px;">
                  <div style="display: flex; flex-direction: column; align-items: flex-end; line-height: 1.2;">
                    <span style="font-weight: 700; font-size: 0.85rem; color: var(--neutral-900);">
                      ${Utils.escapeHTML(currentUser.name)}
                    </span>
                    <span style="font-size: 0.68rem; color: var(--primary-700); font-weight: 700; text-transform: uppercase;">
                      ${currentUser.role === 'seller' ? (currentUser.shop?.name || 'Seller') : 'Customer'}
                    </span>
                  </div>
                  <button type="button" class="btn btn-sm btn-outline" id="btn-header-logout" title="Sign out" style="padding: 4px 10px; font-size: 0.75rem;">
                    Sign Out
                  </button>
                </div>
              ` : `
                <button type="button" class="btn btn-sm btn-primary" id="btn-header-login" style="padding: 6px 14px; font-size: 0.85rem; display: inline-flex; align-items: center; gap: 6px;">
                  ${Utils.icons.user || '👤'} Sign In
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
        <div class="modal-dialog modal-sm" style="margin: auto 0 0 0; border-radius: var(--radius-xl) var(--radius-xl) 0 0;">
          <div class="modal-header">
            <h3 class="modal-title">OneMarket Navigation</h3>
            <button class="modal-close-btn" id="mobile-nav-close">${Utils.icons.close}</button>
          </div>
          <div class="modal-body" style="padding: var(--space-4);">
            <div style="display: flex; flex-direction: column; gap: var(--space-2);">
              <a href="#home" class="nav-link mobile-link">Home</a>
              <a href="#catalog" class="nav-link mobile-link">Explore Products</a>
              <a href="#compare" class="nav-link mobile-link">
                Compare Products ${compareCount > 0 ? `(${compareCount})` : ''}
              </a>
              <a href="#budget" class="nav-link mobile-link">Budget Buddy</a>
              <a href="#orders" class="nav-link mobile-link">
                My Orders ${ordersCount > 0 ? `(${ordersCount})` : ''}
              </a>
              <a href="#seller" class="nav-link mobile-link">Seller Dashboard</a>
              <a href="#about" class="nav-link mobile-link">About / Hackathon Notes</a>
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

    // Login button trigger
    const loginBtn = document.getElementById('btn-header-login');
    if (loginBtn) {
      loginBtn.addEventListener('click', () => {
        if (typeof AuthModal !== 'undefined') {
          AuthModal.open({ tab: 'customer-login' });
        }
      });
    }

    // Logout button trigger
    const logoutBtn = document.getElementById('btn-header-logout');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        Store.logout();
        Utils.showToast('You have been signed out successfully.', 'info');
        App.renderCurrentRoute();
      });
    }

    // Evaluator Shortcut Buttons
    const guestSwitch = document.getElementById('quick-switch-guest');
    if (guestSwitch) {
      guestSwitch.addEventListener('click', () => {
        Store.logout();
        Utils.showToast('Switched to Guest Browsing Mode. Cart & checkout are restricted.', 'info');
        App.renderCurrentRoute();
      });
    }

    const custSwitch = document.getElementById('quick-switch-cust');
    if (custSwitch) {
      custSwitch.addEventListener('click', async () => {
        const res = await Store.login('customer@localloop.in', 'Customer@123');
        if (res.success) {
          Utils.showToast(`Active Account: Demo Customer (${res.user.name})`, 'success');
          App.renderCurrentRoute();
        }
      });
    }

    const sellSwitch = document.getElementById('quick-switch-sell');
    if (sellSwitch) {
      sellSwitch.addEventListener('click', async () => {
        const res = await Store.login('seller@malabarspices.in', 'Seller@123');
        if (res.success) {
          Utils.showToast(`Active Account: Demo Seller (${res.user.shop ? res.user.shop.name : res.user.name})`, 'success');
          window.location.hash = '#seller';
          App.renderCurrentRoute();
        }
      });
    }

    // Reset Demo Data Button
    const resetBtn = document.getElementById('btn-reset-demo-header');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        Utils.confirmDialog({
          title: 'Reset OneMarket Demo Data?',
          message: 'This will safely clear test orders, shopping carts, and restore product stock back to baseline seed state without deleting user accounts or modifying schemas.',
          confirmText: 'Reset Demo Data',
          confirmStyle: 'danger',
          onConfirm: async () => {
            const res = await Store.resetDemoData();
            Utils.showToast(res.message || 'OneMarket demo data restored to baseline state!', 'success');
            App.renderCurrentRoute();
          }
        });
      });
    }

    // Mobile nav toggle
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
