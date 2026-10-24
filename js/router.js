/**
 * LocalLoop - Client-Side Hash Router
 * Parses routes and query parameters, renders the active view,
 * and initializes page-specific event listeners.
 */

const Router = {
  routes: {
    'home': HomeView,
    'catalog': CatalogView,
    'product': ProductView,
    'compare': CompareView,
    'budget': BudgetView,
    'cart': CartView,
    'orders': OrdersView,
    'seller': SellerView,
    'portal': PortalView,
    'admin': AdminView,
    'store': StorefrontView,
    'shop': StorefrontView,
    'about': AboutView,
    'inquiry': InquiryView,
    'contact': InquiryView
  },

  parseHash() {
    let rawHash = (window.location.hash || '').replace(/^#\/?/, '').trim();
    if (!rawHash) rawHash = 'home';
    const [pathPart, queryPart] = rawHash.split('?');
    const pathSegments = (pathPart || '').split('/').filter(Boolean);

    const routeName = pathSegments[0] || 'home';
    const param = pathSegments[1] || null;

    const queryParams = {};
    if (queryPart) {
      const searchParams = new URLSearchParams(queryPart);
      for (const [key, value] of searchParams.entries()) {
        queryParams[key] = value;
      }
    }

    return { routeName, param, queryParams };
  },

  navigate(hash) {
    window.location.hash = hash;
  },

  resolve() {
    const { routeName, param, queryParams } = this.parseHash();
    const appContainer = document.getElementById('app-main-content');
    const navbarContainer = document.getElementById('app-navbar-container');
    const footerContainer = document.getElementById('app-footer-container');

    // Update Navbar with active state
    if (navbarContainer) {
      navbarContainer.innerHTML = Navbar.render(routeName);
      Navbar.initListeners();
    }

    // Render View Content
    if (!appContainer) return;

    let viewHtml = '';
    let initCallback = null;

    switch (routeName) {
      case 'product':
        viewHtml = ProductView.render(param);
        initCallback = () => ProductView.initListeners(param);
        break;

      case 'catalog':
        viewHtml = CatalogView.render(queryParams);
        initCallback = () => CatalogView.initListeners();
        break;

      case 'compare':
        viewHtml = CompareView.render();
        initCallback = () => CompareView.initListeners();
        break;

      case 'budget':
        viewHtml = BudgetView.render();
        initCallback = () => BudgetView.initListeners();
        break;

      case 'cart':
        viewHtml = CartView.render();
        initCallback = () => CartView.initListeners();
        break;

      case 'orders':
        viewHtml = OrdersView.render();
        initCallback = () => OrdersView.initListeners();
        break;

      case 'seller':
        viewHtml = SellerView.render(queryParams);
        initCallback = () => SellerView.initListeners();
        break;

      case 'portal':
        viewHtml = PortalView.render(queryParams);
        initCallback = () => PortalView.initListeners();
        break;

      case 'admin':
        viewHtml = AdminView.render(queryParams);
        initCallback = () => AdminView.initListeners();
        break;

      case 'store':
      case 'shop':
        viewHtml = StorefrontView.render(param);
        initCallback = () => StorefrontView.initListeners(param);
        break;

      case 'about':
        viewHtml = AboutView.render();
        initCallback = () => AboutView.initListeners();
        break;

      case 'inquiry':
      case 'contact':
        viewHtml = InquiryView.render(queryParams);
        initCallback = () => InquiryView.initListeners();
        break;

      case 'home':
      default:
        viewHtml = HomeView.render();
        initCallback = () => {
          if (typeof HomeView.initListeners === 'function') HomeView.initListeners();
        };
        break;
    }

    appContainer.innerHTML = viewHtml;

    // Run view-specific lifecycle initializers
    if (typeof initCallback === 'function') {
      try {
        initCallback();
      } catch (err) {
        console.error('Error in route initCallback:', err);
      }
    }

    // Render Footer
    if (footerContainer && !footerContainer.innerHTML) {
      footerContainer.innerHTML = Footer.render();
    }

    // Scroll to top on navigation
    window.scrollTo({ top: 0, behavior: 'instant' });
  }
};
