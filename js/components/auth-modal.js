/**
 * LocalLoop - Modern Authentication Modal Component
 * Supports customer & seller registration, login, 1-click evaluator testing,
 * password visibility toggling, and rich UX validations.
 */

const AuthModal = {
  activeTab: 'customer-login',
  successCallback: null,

  open(role = 'customer', mode = 'login', onSuccess = null) {
    if (typeof role === 'object' && role !== null) {
      if (role.tab) this.activeTab = role.tab;
      if (typeof role.onSuccess === 'function') this.successCallback = role.onSuccess;
    } else {
      if (role === 'seller') {
        this.activeTab = mode === 'register' || mode === 'signup' ? 'seller-signup' : 'seller-login';
      } else {
        this.activeTab = mode === 'register' || mode === 'signup' ? 'customer-signup' : 'customer-login';
      }
      if (typeof onSuccess === 'function') {
        this.successCallback = onSuccess;
      } else {
        this.successCallback = null;
      }
    }

    const backdrop = document.getElementById('app-modal-backdrop');
    if (!backdrop) return;

    backdrop.innerHTML = this.render();
    backdrop.style.display = 'flex';
    requestAnimationFrame(() => backdrop.classList.add('active'));

    this.initListeners();
  },

  close() {
    const backdrop = document.getElementById('app-modal-backdrop');
    if (!backdrop) return;

    backdrop.classList.remove('active');
    setTimeout(() => {
      backdrop.style.display = 'none';
      backdrop.innerHTML = '';
    }, 200);
  },

  async quickLogin(role = 'customer') {
    if (role === 'seller') {
      const res = await Store.login('seller@malabarspices.in', 'Seller@123');
      if (res.success) {
        Utils.showToast(`Logged in as Merchant (${res.user.shop ? res.user.shop.name : res.user.name})!`, 'success');
        this.close();
        window.location.hash = '#seller';
        if (typeof App !== 'undefined') App.renderCurrentRoute();
      } else {
        Utils.showToast(res.message, 'warning');
      }
    } else {
      const res = await Store.login('customer@localloop.in', 'Customer@123');
      if (res.success) {
        Utils.showToast(`Logged in as Demo Customer (${res.user.name})!`, 'success');
        this.close();
        if (this.successCallback) this.successCallback(res.user);
        if (typeof App !== 'undefined') App.renderCurrentRoute();
      } else {
        Utils.showToast(res.message, 'warning');
      }
    }
  },

  render() {
    return `
      <div class="auth-modal-dialog" role="dialog" aria-modal="true" aria-labelledby="auth-modal-title">
        
        <!-- Header -->
        <div class="auth-header">
          <button type="button" class="modal-close-btn" id="btn-close-auth-modal" aria-label="Close authentication modal" style="position: absolute; top: 16px; right: 16px; background: rgba(0,0,0,0.06); border: none; border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #475569; font-size: 14px; font-weight: 700; transition: all 0.2s ease;">
            ✕
          </button>
          <div style="display: inline-flex; align-items: center; justify-content: center; width: 44px; height: 44px; border-radius: 50%; background: #d1fae5; color: #047857; margin-bottom: 6px; font-size: 20px;">
            ${Utils.icons.user || '👤'}
          </div>
          <h3 id="auth-modal-title">Welcome to OneMarket</h3>
          <p>Your neighbourhood marketplace. Sign in to place orders or manage your shop.</p>
        </div>

        <!-- Demo 1-Click Fast Login Shortcuts for Evaluators -->
        <div class="auth-demo-shortcuts">
          <h5>
            <span>⚡ HACKATHON EVALUATOR QUICK-LOGIN</span>
            <span style="font-size: 0.65rem; color: #047857; background: #ecfdf5; border: 1px solid #a7f3d0; padding: 2px 6px; border-radius: 4px; font-weight: 800;">1-CLICK</span>
          </h5>
          <div class="auth-demo-grid">
            <button type="button" class="auth-demo-btn" id="btn-quick-customer">
              🛒 <strong>Demo Customer</strong>
            </button>
            <button type="button" class="auth-demo-btn" id="btn-quick-seller">
              🏪 <strong>Demo Seller</strong>
            </button>
          </div>
        </div>

        <!-- Navigation Tabs -->
        <div class="auth-tabs" role="tablist">
          <button type="button" class="auth-tab-btn ${this.activeTab === 'customer-login' ? 'active' : ''}" data-tab="customer-login">
            Customer Login
          </button>
          <button type="button" class="auth-tab-btn ${this.activeTab === 'customer-signup' ? 'active' : ''}" data-tab="customer-signup">
            Sign Up
          </button>
          <button type="button" class="auth-tab-btn ${this.activeTab === 'seller-login' ? 'active' : ''}" data-tab="seller-login">
            Seller Login
          </button>
          <button type="button" class="auth-tab-btn ${this.activeTab === 'seller-signup' ? 'active' : ''}" data-tab="seller-signup">
            Join as Seller
          </button>
        </div>

        <!-- Tab Body -->
        <div class="auth-body">
          ${this.renderActiveTabContent()}
        </div>

      </div>
    `;
  },

  renderActiveTabContent() {
    switch (this.activeTab) {
      case 'customer-signup':
        return `
          <form id="form-customer-signup" class="auth-form" novalidate>
            <div class="form-group">
              <label class="form-label" for="cust-reg-name">Full Name <span class="required">*</span></label>
              <input type="text" id="cust-reg-name" class="form-input" placeholder="e.g. Aditi Rao" required />
            </div>
            <div class="form-group">
              <label class="form-label" for="cust-reg-email">Email Address <span class="required">*</span></label>
              <input type="email" id="cust-reg-email" class="form-input" placeholder="aditi@example.com" required />
            </div>
            <div class="form-group">
              <label class="form-label" for="cust-reg-phone">10-Digit Mobile Number <span class="required">*</span></label>
              <input type="tel" id="cust-reg-phone" class="form-input" placeholder="9845012345" maxlength="10" required />
            </div>
            <div class="form-group">
              <label class="form-label" for="cust-reg-pass">Create Password (min 6 chars) <span class="required">*</span></label>
              <div style="position: relative;">
                <input type="password" id="cust-reg-pass" class="form-input" placeholder="••••••••" minlength="6" required style="padding-right: 40px !important;" />
                <button type="button" class="btn-toggle-pwd" data-target="cust-reg-pass" style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: #64748b; font-size: 14px;">👁</button>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label" for="cust-reg-addr">Delivery Address (House/Street/Area) <span class="required">*</span></label>
              <input type="text" id="cust-reg-addr" class="form-input" placeholder="e.g. 100ft Road, Indiranagar" required />
            </div>
            <button type="submit" class="btn btn-customer-submit" id="btn-submit-cust-signup">
              Create Customer Account
            </button>
            <div class="auth-footer-switcher">
              Already have an account? <a data-switch-tab="customer-login">Log in here</a>
            </div>
          </form>
        `;

      case 'seller-login':
        return `
          <form id="form-seller-login" class="auth-form" novalidate>
            <div class="form-group">
              <label class="form-label" for="sell-login-email">Registered Seller Email</label>
              <input type="email" id="sell-login-email" class="form-input" value="seller@malabarspices.in" placeholder="seller@shop.in" required />
            </div>
            <div class="form-group">
              <label class="form-label" for="sell-login-pass">Password</label>
              <div style="position: relative;">
                <input type="password" id="sell-login-pass" class="form-input" value="Seller@123" placeholder="••••••••" required style="padding-right: 40px !important;" />
                <button type="button" class="btn-toggle-pwd" data-target="sell-login-pass" style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: #64748b; font-size: 14px;">👁</button>
              </div>
            </div>
            <button type="submit" class="btn btn-seller-submit" id="btn-submit-sell-login">
              Log In to Merchant Portal
            </button>
            <div class="auth-footer-switcher">
              Want to sell on OneMarket? <a data-switch-tab="seller-signup">Register your shop</a>
            </div>
          </form>
        `;

      case 'seller-signup':
        return `
          <form id="form-seller-signup" class="auth-form" novalidate>
            <div class="form-group">
              <label class="form-label" for="sell-reg-name">Your Full Name <span class="required">*</span></label>
              <input type="text" id="sell-reg-name" class="form-input" placeholder="e.g. Narayanan Nambiar" required />
            </div>
            <div class="form-group">
              <label class="form-label" for="sell-reg-shop">Shop / Business Name <span class="required">*</span></label>
              <input type="text" id="sell-reg-shop" class="form-input" placeholder="e.g. Malabar Heritage Spices" required />
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
              <div class="form-group">
                <label class="form-label" for="sell-reg-cat">Category <span class="required">*</span></label>
                <select id="sell-reg-cat" class="form-input">
                  <option value="Groceries">Groceries</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Fashion">Fashion</option>
                  <option value="Books & Stationery">Books & Stationery</option>
                  <option value="Home & Living">Home & Living</option>
                  <option value="Personal Care">Personal Care</option>
                  <option value="Sports & Lifestyle">Sports & Lifestyle</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label" for="sell-reg-area">Hubballi Neighbourhood <span class="required">*</span></label>
                <select id="sell-reg-area" class="form-input">
                  <option value="Koppikar Road">Koppikar Road</option>
                  <option value="Vidyanagar">Vidyanagar</option>
                  <option value="Gokul Road">Gokul Road</option>
                  <option value="Keshwapur">Keshwapur</option>
                  <option value="Unkal">Unkal</option>
                  <option value="Shirur Park">Shirur Park</option>
                </select>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label" for="sell-reg-email">Business Email <span class="required">*</span></label>
              <input type="email" id="sell-reg-email" class="form-input" placeholder="store@example.com" required />
            </div>
            <div class="form-group">
              <label class="form-label" for="sell-reg-phone">Contact Phone <span class="required">*</span></label>
              <input type="tel" id="sell-reg-phone" class="form-input" placeholder="9845122345" required />
            </div>
            <div class="form-group">
              <label class="form-label" for="sell-reg-pass">Create Password (min 6 chars) <span class="required">*</span></label>
              <div style="position: relative;">
                <input type="password" id="sell-reg-pass" class="form-input" placeholder="••••••••" minlength="6" required style="padding-right: 40px !important;" />
                <button type="button" class="btn-toggle-pwd" data-target="sell-reg-pass" style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: #64748b; font-size: 14px;">👁</button>
              </div>
            </div>
            <button type="submit" class="btn btn-seller-submit" id="btn-submit-sell-signup">
              Register Merchant Storefront
            </button>
            <div class="auth-footer-switcher">
              Already registered as a seller? <a data-switch-tab="seller-login">Log in here</a>
            </div>
          </form>
        `;

      case 'customer-login':
      default:
        return `
          <form id="form-customer-login" class="auth-form" novalidate>
            <div class="form-group">
              <label class="form-label" for="cust-login-email">Email Address</label>
              <input type="email" id="cust-login-email" class="form-input" value="customer@localloop.in" placeholder="customer@example.com" required />
            </div>
            <div class="form-group">
              <label class="form-label" for="cust-login-pass">Password</label>
              <div style="position: relative;">
                <input type="password" id="cust-login-pass" class="form-input" value="Customer@123" placeholder="••••••••" required style="padding-right: 40px !important;" />
                <button type="button" class="btn-toggle-pwd" data-target="cust-login-pass" style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: #64748b; font-size: 14px;">👁</button>
              </div>
            </div>
            <button type="submit" class="btn btn-customer-submit" id="btn-submit-cust-login">
              Sign In to OneMarket
            </button>
            <div class="auth-footer-switcher">
              New customer? <a data-switch-tab="customer-signup">Create an account</a>
            </div>
          </form>
        `;
    }
  },

  initListeners() {
    const backdrop = document.getElementById('app-modal-backdrop');
    if (!backdrop) return;

    // Close button
    const closeBtn = document.getElementById('btn-close-auth-modal');
    if (closeBtn) closeBtn.addEventListener('click', () => this.close());

    backdrop.onclick = (e) => {
      if (e.target === backdrop) this.close();
    };

    // Tab buttons
    backdrop.querySelectorAll('.auth-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.switchTab(btn.dataset.tab);
      });
    });

    // Evaluator quick buttons
    const quickCustBtn = document.getElementById('btn-quick-customer');
    if (quickCustBtn) {
      quickCustBtn.addEventListener('click', async () => {
        await this.quickLogin('customer');
      });
    }

    const quickSellBtn = document.getElementById('btn-quick-seller');
    if (quickSellBtn) {
      quickSellBtn.addEventListener('click', async () => {
        await this.quickLogin('seller');
      });
    }

    this.initFormListeners();
  },

  switchTab(tabKey) {
    this.activeTab = tabKey;
    const backdrop = document.getElementById('app-modal-backdrop');
    if (!backdrop) return;

    const body = backdrop.querySelector('.auth-body');
    if (body) {
      body.innerHTML = this.renderActiveTabContent();
      this.initFormListeners();
    }
    backdrop.querySelectorAll('.auth-tab-btn').forEach(b => {
      if (b.dataset.tab === tabKey) {
        b.classList.add('active');
      } else {
        b.classList.remove('active');
      }
    });
  },

  initFormListeners() {
    const backdrop = document.getElementById('app-modal-backdrop');
    if (!backdrop) return;

    // Switcher links (e.g. "Don't have an account? Sign up")
    backdrop.querySelectorAll('[data-switch-tab]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        this.switchTab(link.dataset.switchTab);
      });
    });

    // Password visibility toggle
    backdrop.querySelectorAll('.btn-toggle-pwd').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetId = btn.dataset.target;
        const input = document.getElementById(targetId);
        if (input) {
          if (input.type === 'password') {
            input.type = 'text';
            btn.textContent = '🔒';
          } else {
            input.type = 'password';
            btn.textContent = '👁';
          }
        }
      });
    });

    // Customer Login
    const custLoginForm = document.getElementById('form-customer-login');
    if (custLoginForm) {
      custLoginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = document.getElementById('btn-submit-cust-login');
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.textContent = 'Signing In...';
        }

        const email = document.getElementById('cust-login-email').value.trim();
        const pass = document.getElementById('cust-login-pass').value;

        const res = await Store.login(email, pass);
        if (res.success) {
          Utils.showToast(`Welcome back, ${res.user.name}!`, 'success');
          this.close();
          if (this.successCallback) this.successCallback(res.user);
          if (typeof App !== 'undefined') App.renderCurrentRoute();
        } else {
          Utils.showToast(res.message, 'warning');
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Sign In to OneMarket';
          }
        }
      });
    }

    // Customer Sign Up
    const custRegForm = document.getElementById('form-customer-signup');
    if (custRegForm) {
      custRegForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('cust-reg-name').value.trim();
        const email = document.getElementById('cust-reg-email').value.trim();
        const phone = document.getElementById('cust-reg-phone').value.trim();
        const pass = document.getElementById('cust-reg-pass').value;
        const addr = document.getElementById('cust-reg-addr').value.trim();

        if (!name || !email || !pass || !addr) {
          Utils.showToast('Please fill in all required fields.', 'warning');
          return;
        }

        const submitBtn = document.getElementById('btn-submit-cust-signup');
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.textContent = 'Creating Account...';
        }

        const res = await Store.registerCustomer({ name, email, phone, password: pass, address: addr });
        if (res.success) {
          Utils.showToast(`Account created! Welcome to OneMarket, ${res.user.name}.`, 'success');
          this.close();
          if (this.successCallback) this.successCallback(res.user);
          if (typeof App !== 'undefined') App.renderCurrentRoute();
        } else {
          Utils.showToast(res.message, 'warning');
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Create Customer Account';
          }
        }
      });
    }

    // Seller Login
    const sellLoginForm = document.getElementById('form-seller-login');
    if (sellLoginForm) {
      sellLoginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = document.getElementById('btn-submit-sell-login');
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.textContent = 'Authenticating Merchant...';
        }

        const email = document.getElementById('sell-login-email').value.trim();
        const pass = document.getElementById('sell-login-pass').value;

        const res = await Store.login(email, pass);
        if (res.success) {
          Utils.showToast(`Merchant portal authenticated: ${res.user.shop ? res.user.shop.name : res.user.name}!`, 'success');
          this.close();
          window.location.hash = '#seller';
          if (typeof App !== 'undefined') App.renderCurrentRoute();
        } else {
          Utils.showToast(res.message, 'warning');
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Log In to Merchant Portal';
          }
        }
      });
    }

    // Seller Sign Up
    const sellRegForm = document.getElementById('form-seller-signup');
    if (sellRegForm) {
      sellRegForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('sell-reg-name').value.trim();
        const shopName = document.getElementById('sell-reg-shop').value.trim();
        const category = document.getElementById('sell-reg-cat').value;
        const area = document.getElementById('sell-reg-area').value;
        const email = document.getElementById('sell-reg-email').value.trim();
        const phone = document.getElementById('sell-reg-phone').value.trim();
        const pass = document.getElementById('sell-reg-pass').value;

        if (!name || !shopName || !email || !pass) {
          Utils.showToast('Please fill in all required fields.', 'warning');
          return;
        }

        const submitBtn = document.getElementById('btn-submit-sell-signup');
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.textContent = 'Registering Storefront...';
        }

        const res = await Store.registerSeller({ name, shopName, category, area, email, phone, password: pass });
        if (res.success) {
          Utils.showToast(`Storefront registered! Welcome, ${res.user.name}.`, 'success');
          this.close();
          window.location.hash = '#seller';
          if (typeof App !== 'undefined') App.renderCurrentRoute();
        } else {
          Utils.showToast(res.message, 'warning');
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Register Merchant Storefront';
          }
        }
      });
    }
  }
};
