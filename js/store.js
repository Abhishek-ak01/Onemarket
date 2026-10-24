/**
 * LocalLoop - Unified Application Store
 * Single source of truth for products, shops, cart, comparison, orders, and demo preferences.
 * Synchronizes with localStorage and provides an event-driven architecture.
 */

const Store = (() => {
  const STORAGE_KEYS = {
    PRODUCTS: 'localloop_products_v1',
    SHOPS: 'localloop_shops_v1',
    ORDERS: 'localloop_orders_v1',
    CART: 'localloop_cart_v1',
    COMPARE: 'localloop_compare_v1',
    LOCATION: 'localloop_location_v1',
    MODE: 'localloop_mode_v1',
    ACTIVE_SELLER: 'localloop_active_seller_v1',
    USER: 'localloop_user_v1',
    TOKEN: 'localloop_token_v1'
  };

  // In-memory state
  let state = {
    products: [],
    shops: [],
    orders: [],
    cart: [], // Array of { productId, quantity }
    compare: [], // Array of productIds (max 3)
    selectedLocationId: 'loc-1',
    mode: 'customer', // 'customer' or 'seller'
    activeSellerId: 'shop-1', // Default seller shop for dashboard
    currentUser: null,
    authToken: null
  };

  // Event listener registry
  const listeners = {};

  function emit(event, data) {
    if (listeners[event]) {
      listeners[event].forEach(cb => {
        try {
          cb(data);
        } catch (err) {
          console.error(`Error in Store listener for ${event}:`, err);
        }
      });
    }
  }

  function subscribe(event, callback) {
    if (!listeners[event]) {
      listeners[event] = [];
    }
    listeners[event].push(callback);
    return () => {
      listeners[event] = listeners[event].filter(cb => cb !== callback);
    };
  }

  // Load from localStorage or seed
  function init() {
    try {
      const storedProducts = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      state.products = storedProducts ? JSON.parse(storedProducts) : [...INITIAL_PRODUCTS];

      const storedShops = localStorage.getItem(STORAGE_KEYS.SHOPS);
      state.shops = storedShops ? JSON.parse(storedShops) : [...INITIAL_SHOPS];

      const storedOrders = localStorage.getItem(STORAGE_KEYS.ORDERS);
      state.orders = storedOrders ? JSON.parse(storedOrders) : [...INITIAL_ORDERS];

      const storedCart = localStorage.getItem(STORAGE_KEYS.CART);
      state.cart = storedCart ? JSON.parse(storedCart) : [];

      const storedCompare = localStorage.getItem(STORAGE_KEYS.COMPARE);
      state.compare = storedCompare ? JSON.parse(storedCompare) : [];

      const storedLocation = localStorage.getItem(STORAGE_KEYS.LOCATION);
      state.selectedLocationId = storedLocation || 'loc-1';

      const storedMode = localStorage.getItem(STORAGE_KEYS.MODE);
      state.mode = storedMode || 'customer';

      const storedSeller = localStorage.getItem(STORAGE_KEYS.ACTIVE_SELLER);
      state.activeSellerId = storedSeller || 'shop-1';

      const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
      state.currentUser = storedUser ? JSON.parse(storedUser) : null;
      state.authToken = localStorage.getItem(STORAGE_KEYS.TOKEN) || null;

      // Persist seeds if first run
      if (!storedProducts) saveProducts();
      if (!storedShops) saveShops();
      if (!storedOrders) saveOrders();
    } catch (e) {
      console.warn('LocalStorage error or corrupt state, resetting to initial seed:', e);
      state.products = [...INITIAL_PRODUCTS];
      state.shops = [...INITIAL_SHOPS];
      state.orders = [...INITIAL_ORDERS];
      state.cart = [];
      state.compare = [];
      state.selectedLocationId = 'loc-1';
      state.mode = 'customer';
      state.activeSellerId = 'shop-1';
      state.currentUser = null;
      state.authToken = null;
    }
  }

  // Storage persistence helpers
  function saveProducts() {
    try {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(state.products));
    } catch (e) {
      console.error('Failed to save products to localStorage', e);
    }
  }

  function saveShops() {
    try {
      localStorage.setItem(STORAGE_KEYS.SHOPS, JSON.stringify(state.shops));
    } catch (e) {
      console.error('Failed to save shops to localStorage', e);
    }
  }

  function saveOrders() {
    try {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(state.orders));
    } catch (e) {
      console.error('Failed to save orders to localStorage', e);
    }
  }

  function saveCart() {
    try {
      localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(state.cart));
    } catch (e) {
      console.error('Failed to save cart to localStorage', e);
    }
  }

  function saveCompare() {
    try {
      localStorage.setItem(STORAGE_KEYS.COMPARE, JSON.stringify(state.compare));
    } catch (e) {
      console.error('Failed to save compare list to localStorage', e);
    }
  }

  function saveUser() {
    try {
      if (state.currentUser) {
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(state.currentUser));
      } else {
        localStorage.removeItem(STORAGE_KEYS.USER);
      }
    } catch (e) {
      console.error('Failed to save user to localStorage', e);
    }
  }

  // Reset to initial demo seed
  function resetDemoData() {
    state.products = JSON.parse(JSON.stringify(INITIAL_PRODUCTS));
    state.shops = JSON.parse(JSON.stringify(INITIAL_SHOPS));
    state.orders = JSON.parse(JSON.stringify(INITIAL_ORDERS));
    state.cart = [];
    state.compare = [];
    state.selectedLocationId = 'loc-1';
    state.mode = 'customer';
    state.activeSellerId = 'shop-1';

    saveProducts();
    saveShops();
    saveOrders();
    saveCart();
    saveCompare();
    localStorage.setItem(STORAGE_KEYS.LOCATION, 'loc-1');
    localStorage.setItem(STORAGE_KEYS.MODE, 'customer');
    localStorage.setItem(STORAGE_KEYS.ACTIVE_SELLER, 'shop-1');

    emit('products:changed', state.products);
    emit('shops:changed', state.shops);
    emit('orders:changed', state.orders);
    emit('cart:changed', state.cart);
    emit('compare:changed', state.compare);
    emit('location:changed', state.selectedLocationId);
    emit('mode:changed', state.mode);
    emit('seller:changed', state.activeSellerId);
    emit('store:reset');
  }

  // Initial call
  init();

  return {
    // Subscription
    subscribe,
    emit,
    resetDemoData,

    // Dynamic API Endpoint Resolver (supports file://, localhost:3000, and Live Server)
    getApiUrl(endpoint) {
      if (typeof window !== 'undefined') {
        if (window.location.protocol === 'file:' || (window.location.port && window.location.port !== '3000')) {
          return `http://localhost:3000${endpoint}`;
        }
      }
      return endpoint;
    },

    // Backend API Sync
    async syncWithBackend() {
      if (typeof fetch === 'undefined') return { success: false, message: 'fetch unavailable' };
      try {
        const [prodRes, shopRes, orderRes, locRes, catRes] = await Promise.all([
          fetch(this.getApiUrl('/api/products')).then(r => r.ok ? r.json() : null).catch(() => null),
          fetch(this.getApiUrl('/api/shops')).then(r => r.ok ? r.json() : null).catch(() => null),
          fetch(this.getApiUrl('/api/orders')).then(r => r.ok ? r.json() : null).catch(() => null),
          fetch(this.getApiUrl('/api/locations')).then(r => r.ok ? r.json() : null).catch(() => null),
          fetch(this.getApiUrl('/api/categories')).then(r => r.ok ? r.json() : null).catch(() => null)
        ]);

        let updated = false;
        if (prodRes && prodRes.success && Array.isArray(prodRes.data)) {
          state.products = prodRes.data;
          saveProducts();
          emit('products:changed', state.products);
          updated = true;
        }
        if (shopRes && shopRes.success && Array.isArray(shopRes.data)) {
          state.shops = shopRes.data;
          saveShops();
          emit('shops:changed', state.shops);
          updated = true;
        }
        if (orderRes && orderRes.success && Array.isArray(orderRes.data)) {
          state.orders = orderRes.data;
          saveOrders();
          emit('orders:changed', state.orders);
          updated = true;
        }
        return { success: true, updated };
      } catch (err) {
        console.warn('API sync deferred (using local cache):', err.message);
        return { success: false, error: err.message };
      }
    },

    // Locations
    getLocations() {
      return [...DEMO_LOCATIONS];
    },
    getSelectedLocation() {
      const loc = DEMO_LOCATIONS.find(l => l.id === state.selectedLocationId);
      return loc || DEMO_LOCATIONS[0];
    },
    setSelectedLocation(locId) {
      state.selectedLocationId = locId;
      localStorage.setItem(STORAGE_KEYS.LOCATION, locId);
      emit('location:changed', locId);
    },

    // Mode ('customer' | 'seller')
    getMode() {
      return state.mode;
    },
    setMode(mode) {
      state.mode = mode === 'seller' ? 'seller' : 'customer';
      localStorage.setItem(STORAGE_KEYS.MODE, state.mode);
      emit('mode:changed', state.mode);
    },

    // Active Seller
    getActiveSellerId() {
      return state.activeSellerId;
    },
    getActiveSeller() {
      if (state.activeSellerId === 'all') {
        return { id: 'all', name: 'All Local Shops (Demo Admin View)' };
      }
      return state.shops.find(s => s.id === state.activeSellerId) || state.shops[0];
    },
    setActiveSellerId(sellerId) {
      state.activeSellerId = sellerId;
      localStorage.setItem(STORAGE_KEYS.ACTIVE_SELLER, sellerId);
      emit('seller:changed', sellerId);
    },

    // Shops
    getShops() {
      return [...state.shops];
    },
    getShopById(shopId) {
      return state.shops.find(s => s.id === shopId);
    },

    // Products
    getProducts() {
      return [...state.products];
    },
    getProductById(productId) {
      return state.products.find(p => p.id === productId);
    },
    getProductsByShop(shopId) {
      if (shopId === 'all') return [...state.products];
      return state.products.filter(p => p.shopId === shopId);
    },
    getProductsByCategory(categoryName) {
      if (!categoryName || categoryName === 'All') return [...state.products];
      return state.products.filter(p => p.category.toLowerCase() === categoryName.toLowerCase());
    },

    addProduct(productData) {
      const newId = `prod-${Date.now().toString().slice(-6)}`;
      const shop = state.shops.find(s => s.id === productData.shopId) || state.shops[0];

      const newProduct = {
        id: newId,
        name: productData.name.trim(),
        category: productData.category,
        shopId: shop.id,
        shopName: shop.name,
        price: Math.max(1, Number(productData.price) || 0),
        stock: Math.max(0, parseInt(productData.stock, 10) || 0),
        rating: productData.rating ? Number(productData.rating) : 4.5,
        reviewsCount: 1,
        description: productData.description?.trim() || '',
        attributes: productData.attributes || {},
        image: productData.image?.trim() || Utils.getFallbackImageSvg(productData.category, productData.name),
        isFeatured: Boolean(productData.isFeatured),
        tags: productData.tags || [productData.category.toLowerCase()]
      };

      state.products.unshift(newProduct);
      saveProducts();
      emit('products:changed', state.products);

      // Async persist to backend API
      if (typeof fetch !== 'undefined') {
        fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newProduct)
        })
        .then(r => r.ok ? r.json() : null)
        .then(res => {
          if (res && res.success && res.data) {
            const idx = state.products.findIndex(p => p.id === newProduct.id);
            if (idx > -1) {
              state.products[idx] = res.data;
              saveProducts();
              emit('products:changed', state.products);
            }
          }
        })
        .catch(e => console.warn('Product addition API sync deferred:', e.message));
      }

      return newProduct;
    },

    updateProduct(productId, updatedFields) {
      const index = state.products.findIndex(p => p.id === productId);
      if (index === -1) return null;

      const existing = state.products[index];
      const updatedProduct = {
        ...existing,
        ...updatedFields,
        id: existing.id // protect ID
      };

      if (updatedFields.price !== undefined) {
        updatedProduct.price = Math.max(1, Number(updatedFields.price) || 0);
      }
      if (updatedFields.stock !== undefined) {
        updatedProduct.stock = Math.max(0, parseInt(updatedFields.stock, 10) || 0);
      }

      state.products[index] = updatedProduct;
      saveProducts();

      // If stock became 0 or lower than cart quantities, update cart items accordingly
      let cartChanged = false;
      state.cart = state.cart.map(item => {
        if (item.productId === productId && item.quantity > updatedProduct.stock) {
          cartChanged = true;
          return { ...item, quantity: Math.max(0, updatedProduct.stock) };
        }
        return item;
      }).filter(item => item.quantity > 0);

      if (cartChanged) {
        saveCart();
        emit('cart:changed', state.cart);
      }

      emit('products:changed', state.products);

      // Async update to backend API
      if (typeof fetch !== 'undefined') {
        fetch(`/api/products/${productId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedFields)
        }).catch(e => console.warn('Product update API sync deferred:', e.message));
      }

      return updatedProduct;
    },

    deleteProduct(productId) {
      state.products = state.products.filter(p => p.id !== productId);
      saveProducts();

      // Remove from cart
      const cartBefore = state.cart.length;
      state.cart = state.cart.filter(item => item.productId !== productId);
      if (state.cart.length !== cartBefore) {
        saveCart();
        emit('cart:changed', state.cart);
      }

      // Remove from compare
      const compareBefore = state.compare.length;
      state.compare = state.compare.filter(id => id !== productId);
      if (state.compare.length !== compareBefore) {
        saveCompare();
        emit('compare:changed', state.compare);
      }

      emit('products:changed', state.products);

      // Async delete from backend API
      if (typeof fetch !== 'undefined') {
        fetch(`/api/products/${productId}`, {
          method: 'DELETE'
        }).catch(e => console.warn('Product delete API sync deferred:', e.message));
      }

      return true;
    },

    // Shopping Cart
    getCart() {
      // Returns enriched cart with live product references
      return state.cart.map(item => {
        const product = state.products.find(p => p.id === item.productId);
        return {
          productId: item.productId,
          quantity: item.quantity,
          product: product || null
        };
      }).filter(item => item.product !== null);
    },

    // Authentication & User State
    getCurrentUser() {
      return state.currentUser;
    },
    getAuthToken() {
      return state.authToken;
    },
    isAuthenticated() {
      return Boolean(state.currentUser);
    },
    isCustomer() {
      return Boolean(state.currentUser && state.currentUser.role === 'customer');
    },
    isSeller() {
      return Boolean(state.currentUser && state.currentUser.role === 'seller');
    },

    async login(email, password) {
      if (typeof fetch === 'undefined') {
        const demoUser = (typeof DEMO_USERS !== 'undefined' ? DEMO_USERS : []).find(u => u.email.toLowerCase() === email.toLowerCase()) || {
          id: 'user-demo',
          name: email.split('@')[0],
          email,
          role: email.includes('seller') ? 'seller' : 'customer'
        };
        state.currentUser = demoUser;
        state.authToken = 'mock-jwt-token';
        emit('auth:changed', state.currentUser);
        return { success: true, user: demoUser, token: 'mock-jwt-token' };
      }

      try {
        const res = await fetch(this.getApiUrl('/api/auth/login'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (data.success && data.user) {
          state.currentUser = data.user;
          state.authToken = data.token;
          try {
            localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data.user));
            localStorage.setItem(STORAGE_KEYS.TOKEN, data.token);
          } catch (e) {}
          emit('auth:changed', state.currentUser);
          this.syncCartFromBackend();
          return { success: true, user: data.user, token: data.token };
        }
        return { success: false, message: data.message || 'Invalid email or password.' };
      } catch (err) {
        console.warn('API login fetch failed, falling back to local credentials verification:', err.message);
        const demoUser = (typeof DEMO_USERS !== 'undefined' ? DEMO_USERS : []).find(u => u.email.toLowerCase() === (email || '').toLowerCase());
        if (demoUser) {
          const expectedPass = demoUser.role === 'seller' ? 'Seller@123' : 'Customer@123';
          if (password === expectedPass || password === '123456' || (password && password.length >= 6)) {
            state.currentUser = demoUser;
            state.authToken = 'demo-jwt-fallback-token';
            try {
              localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(demoUser));
              localStorage.setItem(STORAGE_KEYS.TOKEN, state.authToken);
            } catch (e) {}
            emit('auth:changed', state.currentUser);
            return { success: true, user: demoUser, token: state.authToken };
          } else {
            return { success: false, message: 'Invalid password. (Hint: Customer@123 or Seller@123)' };
          }
        }

        if (email && password && password.length >= 6) {
          const role = email.includes('seller') ? 'seller' : 'customer';
          const fallbackUser = {
            id: `user-${Date.now()}`,
            name: email.split('@')[0],
            email,
            role,
            shop: role === 'seller' ? { id: 'shop-1', name: 'Malabar Heritage Spices', area: 'Indiranagar' } : null
          };
          state.currentUser = fallbackUser;
          state.authToken = 'demo-jwt-fallback-token';
          try {
            localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(fallbackUser));
            localStorage.setItem(STORAGE_KEYS.TOKEN, state.authToken);
          } catch (e) {}
          emit('auth:changed', state.currentUser);
          return { success: true, user: fallbackUser, token: state.authToken };
        }

        return { success: false, message: 'Invalid credentials. Please enter email and password.' };
      }
    },

    async registerCustomer(payload) {
      if (typeof fetch === 'undefined') {
        const newUser = { id: `cust-${Date.now()}`, ...payload, role: 'customer' };
        state.currentUser = newUser;
        state.authToken = 'mock-jwt-token';
        emit('auth:changed', state.currentUser);
        return { success: true, user: newUser };
      }

      try {
        const res = await fetch(this.getApiUrl('/api/auth/register-customer'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.success && data.user) {
          state.currentUser = data.user;
          state.authToken = data.token;
          try {
            localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data.user));
            localStorage.setItem(STORAGE_KEYS.TOKEN, data.token);
          } catch (e) {}
          emit('auth:changed', state.currentUser);
          return { success: true, user: data.user, token: data.token };
        }
        return { success: false, message: data.message || 'Registration failed.' };
      } catch (err) {
        console.warn('API register-customer fetch failed, saving locally:', err.message);
        const newUser = {
          id: `cust-${Date.now()}`,
          name: payload.name,
          email: payload.email,
          phone: payload.phone || '',
          address: payload.address || '',
          role: 'customer'
        };
        state.currentUser = newUser;
        state.authToken = 'demo-jwt-fallback-token';
        try {
          localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(newUser));
          localStorage.setItem(STORAGE_KEYS.TOKEN, state.authToken);
        } catch (e) {}
        emit('auth:changed', state.currentUser);
        return { success: true, user: newUser, token: state.authToken };
      }
    },

    async registerSeller(payload) {
      if (typeof fetch === 'undefined') {
        const newUser = { id: `sell-${Date.now()}`, ...payload, role: 'seller', shop_id: `shop-${Date.now()}` };
        state.currentUser = newUser;
        state.authToken = 'mock-jwt-token';
        emit('auth:changed', state.currentUser);
        return { success: true, user: newUser };
      }

      try {
        const res = await fetch(this.getApiUrl('/api/auth/register-seller'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.success && data.user) {
          state.currentUser = data.user;
          state.authToken = data.token;
          try {
            localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data.user));
            localStorage.setItem(STORAGE_KEYS.TOKEN, data.token);
          } catch (e) {}
          emit('auth:changed', state.currentUser);
          return { success: true, user: data.user, token: data.token };
        }
        return { success: false, message: data.message || 'Seller registration failed.' };
      } catch (err) {
        console.warn('API register-seller fetch failed, saving locally:', err.message);
        const newShopId = `shop-${Date.now()}`;
        const newShop = {
          id: newShopId,
          name: payload.shopName,
          category: payload.category || 'Groceries',
          area: payload.area || 'Indiranagar',
          phone: payload.phone || ''
        };
        const newUser = {
          id: `sell-${Date.now()}`,
          name: payload.name,
          email: payload.email,
          phone: payload.phone || '',
          role: 'seller',
          shop_id: newShopId,
          shop: newShop
        };
        state.shops.push(newShop);
        state.currentUser = newUser;
        state.authToken = 'demo-jwt-fallback-token';
        try {
          localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(newUser));
          localStorage.setItem(STORAGE_KEYS.TOKEN, state.authToken);
          localStorage.setItem(STORAGE_KEYS.SHOPS, JSON.stringify(state.shops));
        } catch (e) {}
        emit('auth:changed', state.currentUser);
        return { success: true, user: newUser, token: state.authToken };
      }
    },

    logout() {
      state.currentUser = null;
      state.authToken = null;
      try {
        localStorage.removeItem(STORAGE_KEYS.USER);
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
      } catch (e) {}
      state.cart = [];
      saveCart();
      emit('auth:changed', null);
      emit('cart:changed', state.cart);
    },

    async syncCartFromBackend() {
      if (typeof fetch === 'undefined' || !state.authToken) return;
      try {
        const res = await fetch(this.getApiUrl('/api/cart'), {
          headers: { 'Authorization': `Bearer ${state.authToken}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.cart && Array.isArray(data.cart.items)) {
            state.cart = data.cart.items.map(it => ({
              productId: it.productId,
              quantity: it.quantity
            }));
            saveCart();
            emit('cart:changed', state.cart);
          }
        }
      } catch (e) {
        console.warn('Sync cart error:', e.message);
      }
    },

    addToCart(productId, requestedQty = 1, options = {}) {
      const product = state.products.find(p => p.id === productId);
      if (!product) {
        return { success: false, message: 'Product not found' };
      }
      if (product.stock <= 0) {
        return { success: false, message: 'This item is currently out of stock.' };
      }

      // Guest restriction in browser
      if (typeof window !== 'undefined' && typeof fetch !== 'undefined' && !state.currentUser && !options.bypassAuth) {
        return {
          success: false,
          requireAuth: true,
          message: 'Please log in to your customer account to add items to your cart.'
        };
      }

      const existingIndex = state.cart.findIndex(i => i.productId === productId);
      const currentQtyInCart = existingIndex > -1 ? state.cart[existingIndex].quantity : 0;
      const targetQty = currentQtyInCart + requestedQty;

      if (targetQty > product.stock) {
        const allowedToAdd = product.stock - currentQtyInCart;
        if (allowedToAdd <= 0) {
          return {
            success: false,
            message: `Cannot add more. You already have the maximum available stock (${product.stock} units) in your cart.`
          };
        }
        // Add up to available stock
        if (existingIndex > -1) {
          state.cart[existingIndex].quantity = product.stock;
        } else {
          state.cart.push({ productId, quantity: product.stock });
        }
        saveCart();
        emit('cart:changed', state.cart);

        if (typeof fetch !== 'undefined' && state.authToken) {
          fetch(this.getApiUrl('/api/cart'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${state.authToken}` },
            body: JSON.stringify({ productId, quantity: product.stock })
          }).catch(() => {});
        }

        return {
          success: true,
          partial: true,
          message: `Added ${allowedToAdd} units to reach maximum available stock (${product.stock}).`
        };
      }

      if (existingIndex > -1) {
        state.cart[existingIndex].quantity = targetQty;
      } else {
        state.cart.push({ productId, quantity: targetQty });
      }

      saveCart();
      emit('cart:changed', state.cart);

      if (typeof fetch !== 'undefined' && state.authToken) {
        fetch(this.getApiUrl('/api/cart'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${state.authToken}` },
          body: JSON.stringify({ productId, quantity: targetQty })
        }).catch(() => {});
      }

      return { success: true, message: `Added "${product.name}" to cart.` };
    },

    updateCartQuantity(productId, newQty) {
      const product = state.products.find(p => p.id === productId);
      if (!product) return false;

      const qty = parseInt(newQty, 10);
      if (isNaN(qty) || qty <= 0) {
        return this.removeFromCart(productId);
      }

      const clampedQty = Math.min(qty, product.stock);
      const index = state.cart.findIndex(i => i.productId === productId);

      if (index > -1) {
        state.cart[index].quantity = clampedQty;
        saveCart();
        emit('cart:changed', state.cart);

        if (typeof fetch !== 'undefined' && state.authToken) {
          fetch(`/api/cart/${productId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${state.authToken}` },
            body: JSON.stringify({ quantity: clampedQty })
          }).catch(() => {});
        }

        if (qty > product.stock && typeof Utils !== 'undefined' && Utils.showToast) {
          Utils.showToast(`Quantity capped at available stock (${product.stock} units)`, 'warning');
        }
        return true;
      }
      return false;
    },

    removeFromCart(productId) {
      state.cart = state.cart.filter(i => i.productId !== productId);
      saveCart();
      emit('cart:changed', state.cart);

      if (typeof fetch !== 'undefined' && state.authToken) {
        fetch(this.getApiUrl(`/api/cart/${productId}`), {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${state.authToken}` }
        }).catch(() => {});
      }

      return true;
    },

    clearCart() {
      state.cart = [];
      saveCart();
      emit('cart:changed', state.cart);

      if (typeof fetch !== 'undefined' && state.authToken) {
        fetch(this.getApiUrl('/api/cart'), {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${state.authToken}` }
        }).catch(() => {});
      }
    },

    getCartSummary() {
      const enrichedCart = this.getCart();
      const count = enrichedCart.reduce((sum, item) => sum + item.quantity, 0);
      const subtotal = enrichedCart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
      const totalOriginal = enrichedCart.reduce((sum, item) => {
        const orig = item.product.originalPrice || item.product.price;
        return sum + (orig * item.quantity);
      }, 0);
      const totalDiscount = Math.max(0, totalOriginal - subtotal);
      const deliveryFee = subtotal > 0 ? (subtotal >= 500 ? 0 : 40) : 0;
      const taxes = Math.round(subtotal * 0.05 * 100) / 100;
      const total = subtotal > 0 ? Math.round((subtotal + deliveryFee + taxes) * 100) / 100 : 0;

      return {
        count,
        subtotal,
        totalOriginal,
        totalDiscount,
        deliveryFee,
        taxes,
        total,
        items: enrichedCart
      };
    },

    // Comparison Engine (up to 3 products)
    getCompareList() {
      return state.compare
        .map(id => state.products.find(p => p.id === id))
        .filter(Boolean);
    },

    addToCompare(productId) {
      if (state.compare.includes(productId)) {
        return { success: false, message: 'This product is already in your comparison list.' };
      }
      if (state.compare.length >= 3) {
        return { success: false, message: 'You can compare up to 3 products at a time. Remove one first.' };
      }
      const product = state.products.find(p => p.id === productId);
      if (!product) {
        return { success: false, message: 'Product not found.' };
      }

      state.compare.push(productId);
      saveCompare();
      emit('compare:changed', state.compare);
      return { success: true, message: `Added "${product.name}" to comparison.` };
    },

    removeFromCompare(productId) {
      state.compare = state.compare.filter(id => id !== productId);
      saveCompare();
      emit('compare:changed', state.compare);
      return true;
    },

    clearCompare() {
      state.compare = [];
      saveCompare();
      emit('compare:changed', state.compare);
    },

    // Order Processing
    getOrders() {
      return [...state.orders].sort((a, b) => new Date(b.date) - new Date(a.date));
    },

    getOrderById(orderId) {
      return state.orders.find(o => o.id === orderId);
    },

    getOrderReceipt(orderId) {
      const order = state.orders.find(o => o.id === orderId);
      if (!order) return null;
      return {
        ...order,
        isDemoTransaction: true,
        watermark: 'DEMO TRANSACTION — HACKATHON PROTOTYPE',
        printedAt: new Date().toISOString()
      };
    },

    getOrdersBySeller(shopId) {
      const allOrders = this.getOrders();
      if (!shopId || shopId === 'all') return allOrders;
      return allOrders.filter(order =>
        order.items.some(item => item.shopId === shopId)
      );
    },

    createOrder(orderPayload) {
      const customer = orderPayload.customer;
      const items = orderPayload.items;
      const notes = orderPayload.notes || '';
      const paymentMethod = orderPayload.paymentMethod || 'Cash on Delivery (Demo)';
      const paymentStatus = orderPayload.paymentStatus || (paymentMethod.includes('UPI') || paymentMethod.includes('Card') ? 'Demo Payment Successful' : 'Pending');

      if (!items || items.length === 0) {
        return { success: false, message: 'Cart is empty.' };
      }

      // Calculate total from live prices to ensure integrity
      let calculatedSubtotal = 0;
      const orderItems = items.map(cartItem => {
        const prod = cartItem.product || state.products.find(p => p.id === (cartItem.productId || cartItem.id)) || {};
        const unitPrice = Number(prod.price || cartItem.price || 0);
        const origPrice = Number(prod.originalPrice || prod.price || unitPrice);
        const discount = Math.max(0, origPrice - unitPrice);
        const lineTotal = unitPrice * cartItem.quantity;
        calculatedSubtotal += lineTotal;
        return {
          productId: prod.id || cartItem.productId,
          name: prod.name || cartItem.name || 'Local Item',
          category: prod.category || cartItem.category || 'General',
          image: prod.image || cartItem.image || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
          price: unitPrice,
          originalPrice: origPrice,
          discount,
          quantity: cartItem.quantity,
          shopId: prod.shopId || cartItem.shopId || 'shop-1',
          shopName: prod.shopName || cartItem.shopName || 'Local Merchant'
        };
      });

      const requestedTokens = parseInt(orderPayload.tokensToRedeem || 0, 10);
      let tokensRedeemed = 0;
      let tokenDiscount = 0;
      if (requestedTokens > 0 && state.currentUser && (state.currentUser.reward_tokens || 0) > 0) {
        const available = state.currentUser.reward_tokens || 0;
        const maxTokens = Math.floor(calculatedSubtotal * 0.5); // max 50% discount
        tokensRedeemed = Math.min(requestedTokens, available, maxTokens);
        tokenDiscount = tokensRedeemed; // 1 token = ₹1
      }

      const deliveryFee = calculatedSubtotal > 0 ? (calculatedSubtotal >= 500 ? 0 : 40) : 0;
      const taxableAmount = Math.max(0, calculatedSubtotal - tokenDiscount);
      const taxes = Math.round(taxableAmount * 0.05 * 100) / 100;
      const grandTotal = Math.max(0, Math.round((calculatedSubtotal - tokenDiscount + deliveryFee + taxes) * 100) / 100);
      const tokensEarned = Math.floor(calculatedSubtotal / 100);

      const newOrder = {
        id: orderPayload.id || `LL-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        userId: state.currentUser ? state.currentUser.id : null,
        date: new Date().toISOString(),
        customer: {
          name: customer.name.trim(),
          phone: customer.phone.trim(),
          address: customer.address?.trim() || '',
          deliveryPreference: customer.deliveryPreference || 'delivery',
          notes: notes?.trim() || ''
        },
        paymentMethod,
        paymentStatus,
        subtotal: calculatedSubtotal,
        deliveryFee,
        taxes,
        tokensEarned,
        tokensRedeemed,
        tokenDiscount,
        items: orderItems,
        total: grandTotal,
        status: 'Pending',
        statusHistory: [
          { status: 'Confirmed', timestamp: new Date().toISOString(), note: 'Order confirmed with merchant.' }
        ]
      };

      // Update local loyalty token balance if customer logged in
      if (state.currentUser && state.currentUser.reward_tokens !== undefined) {
        if (tokensRedeemed > 0) {
          state.currentUser.reward_tokens = Math.max(0, state.currentUser.reward_tokens - tokensRedeemed);
        }
        if (tokensEarned > 0) {
          state.currentUser.reward_tokens = (state.currentUser.reward_tokens || 0) + tokensEarned;
        }
        saveUser();
        emit('user:changed', state.currentUser);
      }

      state.orders.unshift(newOrder);
      saveOrders();

      // Clear cart upon successful order request creation
      this.clearCart();

      emit('orders:changed', state.orders);

      // Async persist to backend API with server-side transaction & stock deduction
      if (typeof fetch !== 'undefined') {
        const headers = { 'Content-Type': 'application/json' };
        if (state.authToken) headers['Authorization'] = `Bearer ${state.authToken}`;

        fetch(this.getApiUrl('/api/orders'), {
          method: 'POST',
          headers,
          body: JSON.stringify({
            id: newOrder.id,
            customer: newOrder.customer,
            items: newOrder.items,
            notes: newOrder.customer.notes,
            paymentMethod: newOrder.paymentMethod,
            paymentStatus: newOrder.paymentStatus,
            tokensToRedeem: tokensRedeemed
          })
        })
        .then(r => r.ok ? r.json() : null)
        .then(res => {
          if (res && res.success && res.order) {
            const idx = state.orders.findIndex(o => o.id === newOrder.id);
            if (idx > -1) {
              state.orders[idx] = res.order;
            }
            saveOrders();
            // Refresh product inventory from server
            fetch(this.getApiUrl('/api/products'))
              .then(pr => pr.ok ? pr.json() : null)
              .then(pData => {
                if (pData && pData.success && Array.isArray(pData.data)) {
                  state.products = pData.data;
                  saveProducts();
                  emit('products:changed', state.products);
                }
              })
              .catch(() => {});
          }
        })
        .catch(err => {
          console.warn('Order saved locally, background API sync deferred:', err.message);
        });
      }

      return { success: true, order: newOrder };
    },

    /**
     * Cancel an eligible order, restoring inventory and reward tokens
     */
    async cancelOrder(orderId, reason = 'Cancelled by customer.') {
      const order = state.orders.find(o => o.id === orderId);
      if (!order) return { success: false, message: 'Order not found.' };

      const nonCancellable = ['Shipped', 'Out for Delivery', 'Delivered', 'Completed', 'Cancelled', 'Rejected'];
      if (nonCancellable.includes(order.status)) {
        return {
          success: false,
          message: `Cannot cancel Order #${orderId}. Current status is "${order.status}". Orders that are in transit or completed cannot be cancelled directly.`
        };
      }

      // Check ownership if logged in as customer
      if (state.currentUser && state.currentUser.role === 'customer') {
        const isOwner = (order.userId === state.currentUser.id) ||
                        (order.customer && order.customer.phone === state.currentUser.phone);
        if (!isOwner && order.userId) {
          return { success: false, message: 'You are not authorized to cancel an order belonging to another customer.' };
        }
      }

      let apiSuccess = false;
      let apiMsg = '';
      if (typeof fetch !== 'undefined') {
        try {
          const headers = { 'Content-Type': 'application/json' };
          if (state.authToken) headers['Authorization'] = `Bearer ${state.authToken}`;
          const res = await fetch(this.getApiUrl(`/api/orders/${orderId}/cancel`), {
            method: 'POST',
            headers,
            body: JSON.stringify({ reason })
          });
          const data = await res.json();
          if (res.ok && data.success) {
            apiSuccess = true;
            apiMsg = data.message;
            if (data.order) {
              const idx = state.orders.findIndex(o => o.id === orderId);
              if (idx > -1) state.orders[idx] = data.order;
            }
          } else {
            return { success: false, message: data.message || 'Failed to cancel order.' };
          }
        } catch (e) {
          console.warn('Backend cancel API call error, applying local cancellation:', e.message);
        }
      }

      const curOrder = state.orders.find(o => o.id === orderId);
      if (curOrder && curOrder.status !== 'Cancelled') {
        curOrder.status = 'Cancelled';
        if (!curOrder.statusHistory) curOrder.statusHistory = [];
        curOrder.statusHistory.push({
          status: 'Cancelled',
          timestamp: new Date().toISOString(),
          note: reason
        });

        // Restore local stock for items
        if (Array.isArray(curOrder.items)) {
          for (const item of curOrder.items) {
            const p = state.products.find(prod => prod.id === item.productId);
            if (p) {
              p.stock += (item.quantity || 1);
            }
          }
        }

        // Reversal of earned tokens / refund of redeemed tokens locally
        if (state.currentUser && state.currentUser.reward_tokens !== undefined) {
          if (curOrder.tokensEarned > 0) {
            state.currentUser.reward_tokens = Math.max(0, state.currentUser.reward_tokens - curOrder.tokensEarned);
          }
          if (curOrder.tokensRedeemed > 0) {
            state.currentUser.reward_tokens += curOrder.tokensRedeemed;
          }
          saveUser();
          emit('user:changed', state.currentUser);
        }
      }

      saveOrders();
      saveProducts();
      emit('orders:changed', state.orders);
      emit('products:changed', state.products);

      return {
        success: true,
        message: apiMsg || `Order #${orderId} has been cancelled. Any reserved stock has been safely restored.`,
        order: curOrder
      };
    },

    getRewardTokens() {
      return state.currentUser ? (state.currentUser.reward_tokens || 0) : 0;
    },

    async fetchRewards() {
      if (typeof fetch === 'undefined' || !state.authToken) {
        return {
          balance: this.getRewardTokens(),
          transactions: []
        };
      }
      try {
        const res = await fetch(this.getApiUrl('/api/auth/rewards'), {
          headers: { 'Authorization': `Bearer ${state.authToken}` }
        });
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            if (state.currentUser) {
              state.currentUser.reward_tokens = json.data.balance;
              saveUser();
              emit('user:changed', state.currentUser);
            }
            return json.data;
          }
        }
      } catch (e) {
        console.warn('Failed to fetch rewards:', e.message);
      }
      return {
        balance: this.getRewardTokens(),
        transactions: []
      };
    },

    updateOrderStatus(orderId, newStatus, note = '') {
      const order = state.orders.find(o => o.id === orderId);
      if (!order) return { success: false, message: 'Order not found.' };

      order.status = newStatus;
      if (!order.statusHistory) order.statusHistory = [];
      order.statusHistory.push({
        status: newStatus,
        timestamp: new Date().toISOString(),
        note: note || `Status updated to ${newStatus}`
      });

      saveOrders();
      emit('orders:changed', state.orders);

      if (typeof fetch !== 'undefined') {
        fetch(this.getApiUrl(`/api/orders/${orderId}/status`), {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            ...(state.authToken ? { 'Authorization': `Bearer ${state.authToken}` } : {})
          },
          body: JSON.stringify({ status: newStatus, note })
        }).catch(e => console.warn('Order status sync deferred:', e.message));
      }

      return { success: true, message: `Order #${orderId} marked as ${newStatus}.`, order };
    },

    /**
     * Seller accepts order: checks stock for every item.
     * Deducts stock if available, updates order status to 'Accepted'.
     */
    acceptOrder(orderId) {
      const order = state.orders.find(o => o.id === orderId);
      if (!order) return { success: false, message: 'Order not found.' };

      if (order.status !== 'Pending') {
        return { success: false, message: `Cannot accept order. Current status is already "${order.status}".` };
      }

      // Check stock sufficiency for ALL items in order
      const stockShortages = [];
      for (const item of order.items) {
        const product = state.products.find(p => p.id === item.productId);
        if (!product) {
          stockShortages.push(`"${item.name}" is no longer listed in catalog.`);
        } else if (product.stock < item.quantity) {
          stockShortages.push(`"${item.name}" has only ${product.stock} units remaining (Requested: ${item.quantity}).`);
        }
      }

      if (stockShortages.length > 0) {
        return {
          success: false,
          insufficientStock: true,
          message: `Cannot accept order due to insufficient inventory:\n• ${stockShortages.join('\n• ')}`
        };
      }

      // Deduct stock safely
      for (const item of order.items) {
        const prodIndex = state.products.findIndex(p => p.id === item.productId);
        if (prodIndex > -1) {
          state.products[prodIndex].stock -= item.quantity;
        }
      }
      saveProducts();

      // Update order status
      order.status = 'Accepted';
      order.statusHistory.push({
        status: 'Accepted',
        timestamp: new Date().toISOString()
      });
      saveOrders();

      emit('products:changed', state.products);
      emit('orders:changed', state.orders);

      if (typeof fetch !== 'undefined') {
        fetch(`/api/orders/${orderId}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'Accepted' })
        }).catch(e => console.warn('Order accept API sync deferred:', e.message));
      }

      return {
        success: true,
        message: `Order #${order.id} accepted successfully. Stock has been reserved and deducted.`
      };
    },

    /**
     * Seller rejects order: no stock deduction, status becomes 'Rejected'.
     */
    rejectOrder(orderId, reason = '') {
      const order = state.orders.find(o => o.id === orderId);
      if (!order) return { success: false, message: 'Order not found.' };

      if (order.status !== 'Pending') {
        return { success: false, message: `Cannot reject order with status "${order.status}".` };
      }

      order.status = 'Rejected';
      order.statusHistory.push({
        status: 'Rejected',
        timestamp: new Date().toISOString(),
        note: reason
      });
      saveOrders();

      emit('orders:changed', state.orders);

      if (typeof fetch !== 'undefined') {
        fetch(`/api/orders/${orderId}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'Rejected', reason })
        }).catch(e => console.warn('Order reject API sync deferred:', e.message));
      }

      return { success: true, message: `Order #${order.id} was marked as rejected.` };
    },

    /**
     * Seller completes an accepted order: marks fulfillment finished.
     */
    completeOrder(orderId) {
      const order = state.orders.find(o => o.id === orderId);
      if (!order) return { success: false, message: 'Order not found.' };

      if (order.status !== 'Accepted') {
        return { success: false, message: `Order must be "Accepted" before marking as completed. Currently "${order.status}".` };
      }

      order.status = 'Completed';
      order.statusHistory.push({
        status: 'Completed',
        timestamp: new Date().toISOString()
      });
      saveOrders();

      emit('orders:changed', state.orders);

      if (typeof fetch !== 'undefined') {
        fetch(`/api/orders/${orderId}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'Completed' })
        }).catch(e => console.warn('Order complete API sync deferred:', e.message));
      }

      return { success: true, message: `Order #${order.id} marked as completed!` };
    },

    // Seller Dashboard & Analytics Computation
    getSellerAnalytics(shopId) {
      const isAll = !shopId || shopId === 'all';
      const products = this.getProductsByShop(shopId);
      const orders = this.getOrdersBySeller(shopId);

      const totalProducts = products.length;
      const totalUnits = products.reduce((acc, p) => acc + p.stock, 0);
      const lowStockProducts = products.filter(p => p.stock > 0 && p.stock <= LOW_STOCK_THRESHOLD);
      const outOfStockProducts = products.filter(p => p.stock === 0);

      const pendingOrders = orders.filter(o => o.status === 'Pending');
      const acceptedOrders = orders.filter(o => o.status === 'Accepted');
      const completedOrders = orders.filter(o => o.status === 'Completed');
      const rejectedOrders = orders.filter(o => o.status === 'Rejected');

      // Completed Sales Total (only from items belonging to this shop if specific shop)
      let completedSalesTotal = 0;
      const itemSalesCounts = {};

      completedOrders.forEach(order => {
        order.items.forEach(item => {
          if (isAll || item.shopId === shopId) {
            const itemRevenue = item.price * item.quantity;
            completedSalesTotal += itemRevenue;

            if (!itemSalesCounts[item.productId]) {
              itemSalesCounts[item.productId] = {
                id: item.productId,
                name: item.name,
                category: item.category,
                unitsSold: 0,
                revenue: 0
              };
            }
            itemSalesCounts[item.productId].unitsSold += item.quantity;
            itemSalesCounts[item.productId].revenue += itemRevenue;
          }
        });
      });

      const bestSellers = Object.values(itemSalesCounts)
        .sort((a, b) => b.unitsSold - a.unitsSold)
        .slice(0, 5);

      // Category breakdown
      const categoryDistribution = {};
      products.forEach(p => {
        categoryDistribution[p.category] = (categoryDistribution[p.category] || 0) + 1;
      });

      return {
        shopId,
        totalProducts,
        totalUnits,
        lowStockProducts,
        outOfStockProducts,
        pendingOrdersCount: pendingOrders.length,
        acceptedOrdersCount: acceptedOrders.length,
        completedOrdersCount: completedOrders.length,
        rejectedOrdersCount: rejectedOrders.length,
        completedSalesTotal,
        bestSellers,
        categoryDistribution,
        recentOrders: orders.slice(0, 5)
      };
    },

    /**
     * Safely resets all test orders, clears shopping cart, and restores inventory to baseline seed state.
     */
    async resetDemoData() {
      try {
        if (typeof fetch !== 'undefined') {
          await fetch(this.getApiUrl('/api/demo-reset'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ confirm: 'RESET_ONEMARKET_DEMO' })
          });
        }
      } catch (err) {
        console.warn('Backend demo-reset warning:', err.message);
      }

      // Reset client-side storage
      try {
        localStorage.removeItem(STORAGE_KEYS.CART);
        localStorage.removeItem(STORAGE_KEYS.COMPARE);
        localStorage.removeItem(STORAGE_KEYS.ORDERS);
      } catch (e) {}

      state.cart = [];
      state.compareList = [];
      state.orders = JSON.parse(JSON.stringify(INITIAL_ORDERS));
      state.products = JSON.parse(JSON.stringify(INITIAL_PRODUCTS));

      if (typeof this.syncWithBackend === 'function') {
        try {
          await this.syncWithBackend();
        } catch (e) {}
      }

      emit('cart:updated', this.getCartSummary());
      emit('compare:updated', state.compareList);
      emit('orders:updated', state.orders);
      emit('products:updated', state.products);

      return { success: true, message: 'OneMarket demo environment restored to initial baseline state!' };
    }
  };
})();
