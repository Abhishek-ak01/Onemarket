/**
 * LocalLoop - Master Application Controller
 * Bootstraps the client-side router, registers store reactivity,
 * and handles global interactive actions (Add to Cart, Compare toggle).
 */

const App = {
  init() {
    console.log('Initializing OneMarket (Hyperlocal Neighbourhood Marketplace)...');

    // Sync state with live MySQL backend API
    if (typeof Store.syncWithBackend === 'function') {
      Store.syncWithBackend().then(res => {
        if (res && res.updated) {
          Router.resolve();
        }
      });
    }

    // Setup Hash Change Listener
    window.addEventListener('hashchange', () => {
      Router.resolve();
    });

    // Global Delegated Click Listeners
    this.initGlobalDelegation();

    // Store Subscriptions for Reactive UI Updates
    Store.subscribe('cart:changed', () => {
      this.updateNavbarBadges();
    });

    Store.subscribe('compare:changed', () => {
      this.updateNavbarBadges();
      this.updateCompareButtons();
    });

    Store.subscribe('orders:changed', () => {
      this.updateNavbarBadges();
    });

    Store.subscribe('auth:changed', () => {
      this.updateNavbarBadges();
      Router.resolve();
    });

    // Initial Route Render
    Router.resolve();
  },

  renderCurrentRoute() {
    Router.resolve();
  },

  updateNavbarBadges() {
    const cartSummary = Store.getCartSummary();
    const compareList = Store.getCompareList();
    const orders = Store.getOrders();

    const cartBadge = document.getElementById('header-cart-count');
    if (cartBadge) {
      cartBadge.textContent = cartSummary.count;
    }

    const compareBadge = document.getElementById('nav-compare-count');
    if (compareBadge) {
      compareBadge.textContent = compareList.length;
      compareBadge.style.display = compareList.length > 0 ? 'inline-flex' : 'none';
    }

    const ordersBadge = document.getElementById('nav-orders-count');
    if (ordersBadge) {
      ordersBadge.textContent = orders.length;
      ordersBadge.style.display = orders.length > 0 ? 'inline-flex' : 'none';
    }
  },

  updateCompareButtons() {
    const compareList = Store.getCompareList();
    document.querySelectorAll('[data-action="toggle-compare"]').forEach(btn => {
      const prodId = btn.dataset.productId;
      const isIn = compareList.some(p => p.id === prodId);
      if (isIn) {
        btn.classList.add('in-compare');
        btn.innerHTML = Utils.icons.check;
        btn.title = 'Remove from comparison matrix';
      } else {
        btn.classList.remove('in-compare');
        btn.innerHTML = Utils.icons.compare;
        btn.title = 'Add to comparison matrix';
      }
    });
  },

  initGlobalDelegation() {
    document.addEventListener('click', (e) => {
      // Add to Cart Action
      const cartBtn = e.target.closest('[data-action="add-to-cart"]');
      if (cartBtn) {
        e.stopPropagation();
        const prodId = cartBtn.dataset.productId;

        // Check Guest Restrictions
        if (!Store.isAuthenticated()) {
          if (typeof AuthModal !== 'undefined') {
            AuthModal.open({
              tab: 'customer-login',
              onSuccess: () => {
                const retry = Store.addToCart(prodId, 1);
                if (retry.success) {
                  Utils.showToast(retry.message, retry.partial ? 'warning' : 'success');
                }
              }
            });
          }
          Utils.showToast('Please sign in or register to add products to your cart.', 'info');
          return;
        }

        const res = Store.addToCart(prodId, 1);
        if (res.success) {
          Utils.showToast(res.message, res.partial ? 'warning' : 'success');
          // Button feedback animation
          const originalText = cartBtn.innerHTML;
          cartBtn.innerHTML = `${Utils.icons.check} Added`;
          setTimeout(() => {
            cartBtn.innerHTML = originalText;
          }, 1200);
        } else if (res.requireAuth) {
          if (typeof AuthModal !== 'undefined') {
            AuthModal.open({ tab: 'customer-login' });
          }
          Utils.showToast(res.message, 'info');
        } else {
          Utils.showToast(res.message, 'warning');
        }
        return;
      }

      // Compare Toggle Action
      const compareBtn = e.target.closest('[data-action="toggle-compare"]');
      if (compareBtn) {
        e.stopPropagation();
        const prodId = compareBtn.dataset.productId;
        const compareList = Store.getCompareList();
        const isIn = compareList.some(p => p.id === prodId);

        if (isIn) {
          Store.removeFromCompare(prodId);
          Utils.showToast('Item removed from comparison list', 'info');
        } else {
          const res = Store.addToCompare(prodId);
          if (res.success) {
            Utils.showToast(res.message, 'success');
          } else {
            Utils.showToast(res.message, 'warning');
          }
        }
        return;
      }
    });
  }
};

// Bootstrap application on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
