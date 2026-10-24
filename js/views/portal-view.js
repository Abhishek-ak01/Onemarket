/**
 * OneMarket - My Portal View (Customer & Seller)
 * Handles role-based portal access:
 * - Unauthenticated: Clean portal selection (Customer Portal vs Seller Portal)
 * - Authenticated Customer: Profile details, Loyalty Tokens Hub & audit ledger, Orders quick link, Saved addresses
 * - Authenticated Seller: Merchant operations dashboard (delegates to SellerView)
 */

const PortalView = {
  rewardsData: null,

  render(queryParams = {}) {
    const currentUser = Store.getCurrentUser();
    const orders = Store.getOrders();
    const cartSummary = Store.getCartSummary();

    // 1. Unauthenticated: Portal Selection Landing
    if (!currentUser) {
      return `
        <section class="portal-landing-page" style="padding: var(--space-8) 0; min-height: 75vh;">
          <div class="container container-narrow">
            
            <div style="text-align: center; max-width: 620px; margin: 0 auto var(--space-8);">
              <span class="badge" style="background: var(--primary-100); color: var(--primary-900); font-weight: 700; padding: 4px 12px; border-radius: var(--radius-full); font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em;">
                OneMarket Account Central
              </span>
              <h1 style="font-family: var(--font-family-display); font-size: 2.2rem; font-weight: 800; color: var(--primary-900); margin: var(--space-3) 0 var(--space-2); line-height: 1.2;">
                Welcome to My Portal
              </h1>
              <p style="color: var(--neutral-600); font-size: 1rem; line-height: 1.6;">
                Choose your portal below to access personalized neighbourhood shopping, live Hubballi delivery tracking, or manage your local merchant storefront.
              </p>
            </div>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: var(--space-6);">
              
              <!-- Option A: Customer Portal -->
              <div class="portal-choice-card" style="background: #ffffff; border: 2px solid var(--primary-200); border-radius: var(--radius-xl); padding: var(--space-6); display: flex; flex-direction: column; justify-content: space-between; box-shadow: var(--shadow-md); transition: transform 0.2s, box-shadow 0.2s;">
                <div>
                  <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--space-4);">
                    <div style="width: 52px; height: 52px; border-radius: var(--radius-lg); background: var(--primary-50); color: var(--primary-700); display: flex; align-items: center; justify-content: center; font-size: 1.5rem;">
                      ${Utils.icons.user || '👤'}
                    </div>
                    <span style="background: #dcfce7; color: #166534; font-size: 0.75rem; font-weight: 700; padding: 4px 10px; border-radius: var(--radius-full);">
                      SHOPPING & REWARDS
                    </span>
                  </div>

                  <h2 style="font-family: var(--font-family-display); font-size: 1.5rem; font-weight: 800; color: var(--primary-900); margin-bottom: var(--space-2);">
                    Customer Portal
                  </h2>
                  <p style="color: var(--neutral-600); font-size: 0.9rem; line-height: 1.5; margin-bottom: var(--space-4);">
                    Access your live Hubballi order requests, delivery tracking, itemized receipts, and manage your OneMarket reward tokens on every purchase.
                  </p>

                  <div style="background: var(--neutral-50); border: 1px solid var(--neutral-200); border-radius: var(--radius-md); padding: var(--space-3); margin-bottom: var(--space-5);">
                    <div style="font-size: 0.8rem; font-weight: 700; color: var(--primary-800); margin-bottom: 6px;">Customer Benefits:</div>
                    <ul style="font-size: 0.82rem; color: var(--neutral-700); margin: 0; padding-left: 18px; line-height: 1.6;">
                      <li>✨ Earn 1 OneMarket Token per ₹100 eligible spend</li>
                      <li>💰 Redeem tokens at ₹1 = 1 Token (save up to 50%)</li>
                      <li>📦 Real-time order dispatch tracking in Hubballi</li>
                      <li>🧾 Tax-compliant itemized receipts & download</li>
                    </ul>
                  </div>
                </div>

                <div style="display: flex; flex-direction: column; gap: var(--space-2); margin-top: auto;">
                  <button type="button" class="btn btn-primary btn-block btn-lg" id="btn-portal-cust-login">
                    Sign In as Customer
                  </button>
                  <button type="button" class="btn btn-outline btn-block" id="btn-portal-cust-signup">
                    Create Customer Account
                  </button>
                </div>
              </div>

              <!-- Option B: Seller Portal -->
              <div class="portal-choice-card" style="background: #ffffff; border: 2px solid var(--neutral-300); border-radius: var(--radius-xl); padding: var(--space-6); display: flex; flex-direction: column; justify-content: space-between; box-shadow: var(--shadow-md); transition: transform 0.2s, box-shadow 0.2s;">
                <div>
                  <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--space-4);">
                    <div style="width: 52px; height: 52px; border-radius: var(--radius-lg); background: #fef3c7; color: #b45309; display: flex; align-items: center; justify-content: center; font-size: 1.5rem;">
                      ${Utils.icons.shop || '🏪'}
                    </div>
                    <span style="background: #fef3c7; color: #92400e; font-size: 0.75rem; font-weight: 700; padding: 4px 10px; border-radius: var(--radius-full);">
                      MERCHANT OPERATIONS
                    </span>
                  </div>

                  <h2 style="font-family: var(--font-family-display); font-size: 1.5rem; font-weight: 800; color: var(--neutral-900); margin-bottom: var(--space-2);">
                    Seller Portal
                  </h2>
                  <p style="color: var(--neutral-600); font-size: 0.9rem; line-height: 1.5; margin-bottom: var(--space-4);">
                    Designed for verified shop owners across Hubballi. Manage your products, stock quantities, promotional discounts, and fulfill incoming orders.
                  </p>

                  <div style="background: var(--neutral-50); border: 1px solid var(--neutral-200); border-radius: var(--radius-md); padding: var(--space-3); margin-bottom: var(--space-5);">
                    <div style="font-size: 0.8rem; font-weight: 700; color: #92400e; margin-bottom: 6px;">Merchant Tools:</div>
                    <ul style="font-size: 0.82rem; color: var(--neutral-700); margin: 0; padding-left: 18px; line-height: 1.6;">
                      <li>📦 Catalogue, stock & promotional discount management</li>
                      <li>🚚 5-stage order fulfillment & status dispatch</li>
                      <li>📊 Live sales analytics & revenue metrics</li>
                      <li>⚠️ Low-stock warnings and inventory controls</li>
                    </ul>
                  </div>
                </div>

                <div style="display: flex; flex-direction: column; gap: var(--space-2); margin-top: auto;">
                  <button type="button" class="btn btn-primary btn-block btn-lg" id="btn-portal-sell-login" style="background: #1e3a8a; border-color: #1e3a8a;">
                    Merchant Sign In
                  </button>
                  <button type="button" class="btn btn-outline btn-block" id="btn-portal-sell-signup">
                    Register New Shop
                  </button>
                </div>
              </div>

            </div>

          </div>
        </section>
      `;
    }

    // 2. Authenticated as Seller: Render Seller Dashboard
    if (currentUser.role === 'seller' && queryParams.view !== 'customer') {
      return `
        <div style="background: #0f172a; color: #e2e8f0; padding: 8px 16px; font-size: 0.82rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px;">
          <div>
            <strong>Merchant Mode Active:</strong> ${Utils.escapeHTML(currentUser.shop?.name || currentUser.name)} (${Utils.escapeHTML(currentUser.email)})
          </div>
          <div style="display: flex; gap: 8px;">
            <a href="#portal?view=customer" style="color: #67e8f9; font-weight: 700; text-decoration: underline;">
              Switch to Customer View
            </a>
          </div>
        </div>
        ${SellerView.render(queryParams)}
      `;
    }

    // 3. Authenticated as Customer (or Seller viewing customer view):
    const tokenBalance = currentUser.reward_tokens || 0;
    const rupeeValue = tokenBalance * 1.0;
    const activeOrders = orders.filter(o => o.status !== 'Delivered' && o.status !== 'Completed' && o.status !== 'Cancelled');

    return `
      <section class="customer-portal-page" style="padding: var(--space-6) 0 var(--space-10);">
        <div class="container">
          
          <!-- Welcome Header -->
          <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: var(--space-4); margin-bottom: var(--space-6); padding-bottom: var(--space-4); border-bottom: 1px solid var(--neutral-200);">
            <div style="display: flex; align-items: center; gap: var(--space-4);">
              <div style="width: 58px; height: 58px; border-radius: 50%; background: var(--primary-700); color: #ffffff; font-weight: 800; font-size: 1.5rem; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(27,67,50,0.2);">
                ${currentUser.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div style="display: flex; align-items: center; gap: 8px;">
                  <h1 style="font-family: var(--font-family-display); font-size: 1.75rem; font-weight: 800; color: var(--primary-900); margin: 0;">
                    ${Utils.escapeHTML(currentUser.name)}
                  </h1>
                  <span class="badge" style="background: #dcfce7; color: #166534; font-weight: 700; font-size: 0.72rem; padding: 2px 8px; border-radius: var(--radius-full);">
                    Verified Customer
                  </span>
                </div>
                <div style="font-size: 0.85rem; color: var(--neutral-600); margin-top: 2px;">
                  ${Utils.escapeHTML(currentUser.email)} • Hubballi, Karnataka
                </div>
              </div>
            </div>

            <div style="display: flex; align-items: center; gap: var(--space-3);">
              <a href="#orders" class="btn btn-outline" style="font-size: 0.85rem;">
                ${Utils.icons.box || '📦'} My Orders (${orders.length})
              </a>
              <a href="#cart" class="btn btn-primary" style="font-size: 0.85rem;">
                ${Utils.icons.cart || '🛒'} View Cart (${cartSummary.count})
              </a>
            </div>
          </div>

          <!-- Main Grid -->
          <div style="display: grid; grid-template-columns: 2fr 1fr; gap: var(--space-6);">
            
            <!-- Left Column: Loyalty Tokens Hub & Ledger -->
            <div style="display: flex; flex-direction: column; gap: var(--space-6);">
              
              <!-- Loyalty Card Banner -->
              <div style="background: linear-gradient(135deg, #1b4332 0%, #2d6a4f 100%); color: #ffffff; border-radius: var(--radius-xl); padding: var(--space-6); box-shadow: var(--shadow-lg); position: relative; overflow: hidden;">
                <div style="position: absolute; right: -20px; bottom: -20px; font-size: 8rem; opacity: 0.1; color: #ffffff; pointer-events: none;">
                  🪙
                </div>
                <div style="display: flex; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; gap: var(--space-4); margin-bottom: var(--space-4);">
                  <div>
                    <span style="background: rgba(255,255,255,0.2); color: #a7f3d0; font-size: 0.75rem; font-weight: 800; padding: 3px 10px; border-radius: var(--radius-full); text-transform: uppercase; letter-spacing: 0.05em;">
                      OneMarket Loyalty Programme
                    </span>
                    <div style="font-size: 0.85rem; color: #d8f3dc; margin-top: 6px;">Available Reward Balance</div>
                    <div style="font-size: 2.5rem; font-weight: 900; color: #ffffff; line-height: 1.1; margin-top: 4px;">
                      ${tokenBalance} <span style="font-size: 1.15rem; font-weight: 600; color: #a7f3d0;">Tokens</span>
                    </div>
                  </div>
                  <div style="text-align: right; background: rgba(0,0,0,0.2); padding: 10px 16px; border-radius: var(--radius-lg); border: 1px solid rgba(255,255,255,0.15);">
                    <div style="font-size: 0.75rem; color: #cbd5e1; text-transform: uppercase; font-weight: 700;">Redeemable Value</div>
                    <div style="font-size: 1.4rem; font-weight: 800; color: #ffd166; margin-top: 2px;">
                      ${Utils.formatINR(rupeeValue)}
                    </div>
                    <div style="font-size: 0.72rem; color: #a7f3d0; margin-top: 2px;">1 Token = ₹1 Discount</div>
                  </div>
                </div>

                <div style="background: rgba(255,255,255,0.1); border-radius: var(--radius-md); padding: 10px 14px; font-size: 0.82rem; line-height: 1.5; color: #eaf5ee;">
                  <strong>Earning Rule:</strong> Earn 1 OneMarket token for every ₹100 of eligible local purchases.<br/>
                  <strong>Redemption Rule:</strong> Apply tokens at checkout to save up to 50% on your eligible merchandise total.
                </div>
              </div>

              <!-- Reward Transactions Audit Ledger -->
              <div style="background: #ffffff; border: 1px solid var(--neutral-300); border-radius: var(--radius-xl); padding: var(--space-5); box-shadow: var(--shadow-sm);">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--space-4);">
                  <div>
                    <h3 style="font-family: var(--font-family-display); font-size: 1.15rem; font-weight: 800; color: var(--primary-900); margin: 0;">
                      Reward Tokens Ledger
                    </h3>
                    <div style="font-size: 0.8rem; color: var(--neutral-600);">Auditable transaction history for your account</div>
                  </div>
                  <button type="button" class="btn btn-xs btn-outline" id="btn-refresh-rewards" style="padding: 4px 8px; font-size: 0.75rem;">
                    ${Utils.icons.refresh || '🔄'} Refresh
                  </button>
                </div>

                <div id="portal-rewards-table-container">
                  <div style="text-align: center; padding: var(--space-4); color: var(--neutral-500); font-size: 0.85rem;">
                    Loading token transaction ledger...
                  </div>
                </div>
              </div>

            </div>

            <!-- Right Column: Profile & Saved Hubballi Details -->
            <div style="display: flex; flex-direction: column; gap: var(--space-6);">
              
              <!-- Saved Customer Details Card -->
              <div style="background: #ffffff; border: 1px solid var(--neutral-300); border-radius: var(--radius-xl); padding: var(--space-5); box-shadow: var(--shadow-sm);">
                <h3 style="font-family: var(--font-family-display); font-size: 1.15rem; font-weight: 800; color: var(--primary-900); margin: 0 0 var(--space-4);">
                  Customer Information
                </h3>
                
                <div style="display: flex; flex-direction: column; gap: var(--space-3); font-size: 0.875rem;">
                  <div>
                    <span style="font-size: 0.75rem; color: var(--neutral-500); text-transform: uppercase; font-weight: 700; display: block;">Full Name</span>
                    <strong style="color: var(--neutral-900);">${Utils.escapeHTML(currentUser.name)}</strong>
                  </div>

                  <div>
                    <span style="font-size: 0.75rem; color: var(--neutral-500); text-transform: uppercase; font-weight: 700; display: block;">Email Address</span>
                    <span style="color: var(--neutral-800);">${Utils.escapeHTML(currentUser.email)}</span>
                  </div>

                  <div>
                    <span style="font-size: 0.75rem; color: var(--neutral-500); text-transform: uppercase; font-weight: 700; display: block;">Phone Number</span>
                    <span style="color: var(--neutral-800);">${Utils.escapeHTML(currentUser.phone || '+91 98450 12345')}</span>
                  </div>

                  <div>
                    <span style="font-size: 0.75rem; color: var(--neutral-500); text-transform: uppercase; font-weight: 700; display: block;">Default Delivery Address</span>
                    <span style="color: var(--neutral-800); line-height: 1.4; display: block;">
                      ${Utils.escapeHTML(currentUser.address || 'Flat 402, Gokul Heights, Vidyanagar, Hubballi - 580021')}
                    </span>
                  </div>

                  <div>
                    <span style="font-size: 0.75rem; color: var(--neutral-500); text-transform: uppercase; font-weight: 700; display: block;">Default Marketplace City</span>
                    <span style="color: var(--primary-700); font-weight: 700;">Hubballi, Karnataka</span>
                  </div>
                </div>
              </div>

              <!-- Quick Order Tracker Card -->
              <div style="background: #ffffff; border: 1px solid var(--neutral-300); border-radius: var(--radius-xl); padding: var(--space-5); box-shadow: var(--shadow-sm);">
                <h3 style="font-family: var(--font-family-display); font-size: 1.15rem; font-weight: 800; color: var(--primary-900); margin: 0 0 var(--space-3);">
                  Active Hubballi Orders
                </h3>
                
                ${activeOrders.length > 0 ? `
                  <div style="font-size: 0.85rem; color: var(--neutral-600); margin-bottom: var(--space-3);">
                    You have <strong>${activeOrders.length}</strong> active order${activeOrders.length > 1 ? 's' : ''} in progress.
                  </div>
                  <div style="display: flex; flex-direction: column; gap: 8px;">
                    ${activeOrders.slice(0, 3).map(o => `
                      <div style="padding: 10px; background: var(--neutral-50); border: 1px solid var(--neutral-200); border-radius: var(--radius-md); display: flex; align-items: center; justify-content: space-between;">
                        <div>
                          <div style="font-weight: 700; font-size: 0.85rem; color: var(--neutral-900);">Order #${o.id}</div>
                          <div style="font-size: 0.75rem; color: var(--neutral-600);">${o.items?.length || 1} items • ${Utils.formatINR(o.total)}</div>
                        </div>
                        <span class="badge" style="background: #dbeafe; color: #1e40af; font-size: 0.7rem; font-weight: 700; padding: 2px 8px; border-radius: var(--radius-full);">
                          ${o.status}
                        </span>
                      </div>
                    `).join('')}
                  </div>
                  <a href="#orders" class="btn btn-outline btn-block" style="margin-top: var(--space-3); font-size: 0.82rem;">
                    Track All Orders
                  </a>
                ` : `
                  <p style="font-size: 0.85rem; color: var(--neutral-600); margin-bottom: var(--space-3);">
                    No active deliveries in progress. Explore local Hubballi merchants and earn tokens!
                  </p>
                  <a href="#catalog" class="btn btn-primary btn-block" style="font-size: 0.82rem;">
                    Explore Catalogue
                  </a>
                `}
              </div>

              <!-- Switch to Merchant Portal -->
              <div style="background: #f8fafc; border: 1px dashed var(--neutral-300); border-radius: var(--radius-xl); padding: var(--space-4); text-align: center;">
                <div style="font-size: 0.85rem; font-weight: 700; color: var(--neutral-800); margin-bottom: 4px;">
                  Own a shop in Hubballi?
                </div>
                <div style="font-size: 0.78rem; color: var(--neutral-600); margin-bottom: var(--space-3);">
                  Manage your inventory, fulfill orders, and showcase your storefront on OneMarket.
                </div>
                <button type="button" class="btn btn-sm btn-outline" id="btn-portal-switch-seller">
                  ${Utils.icons.shop || '🏪'} Switch to Seller Portal
                </button>
              </div>

            </div>

          </div>

        </div>
      </section>
    `;
  },

  async renderRewardsTable() {
    const container = document.getElementById('portal-rewards-table-container');
    if (!container) return;

    try {
      const data = await Store.fetchRewards();
      this.rewardsData = data;
      const transactions = data.transactions || [];

      if (transactions.length === 0) {
        container.innerHTML = `
          <div style="text-align: center; padding: var(--space-6); background: var(--neutral-50); border-radius: var(--radius-lg);">
            <div style="font-size: 2rem; margin-bottom: 8px;">🪙</div>
            <div style="font-weight: 700; color: var(--neutral-800); font-size: 0.95rem;">No Token Transactions Yet</div>
            <p style="font-size: 0.82rem; color: var(--neutral-600); max-width: 360px; margin: 4px auto 0;">
              Place your first order on OneMarket to automatically earn reward tokens at 1 token per ₹100 spent!
            </p>
          </div>
        `;
        return;
      }

      container.innerHTML = `
        <div style="overflow-x: auto;">
          <table style="width: 100%; border-collapse: collapse; font-size: 0.82rem; text-align: left;">
            <thead>
              <tr style="border-bottom: 2px solid var(--neutral-200); color: var(--neutral-600); font-weight: 700;">
                <th style="padding: 8px 10px;">Date</th>
                <th style="padding: 8px 10px;">Description</th>
                <th style="padding: 8px 10px;">Type</th>
                <th style="padding: 8px 10px; text-align: right;">Tokens</th>
              </tr>
            </thead>
            <tbody>
              ${transactions.map(t => {
                const isPositive = Number(t.amount) > 0;
                const formattedDate = t.createdAt ? new Date(t.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                }) : 'Recent';

                return `
                  <tr style="border-bottom: 1px solid var(--neutral-200);">
                    <td style="padding: 10px; color: var(--neutral-600); white-space: nowrap;">
                      ${formattedDate}
                    </td>
                    <td style="padding: 10px; color: var(--neutral-900);">
                      ${Utils.escapeHTML(t.description || 'Loyalty Reward')}
                      ${t.orderId ? `<div style="font-size: 0.72rem; color: var(--primary-700); font-weight: 600;">Order #${t.orderId}</div>` : ''}
                    </td>
                    <td style="padding: 10px;">
                      <span class="badge" style="font-size: 0.7rem; font-weight: 700; padding: 2px 8px; border-radius: var(--radius-full); ${
                        t.type === 'EARNED' ? 'background: #dcfce7; color: #166534;' :
                        t.type === 'REDEEMED' ? 'background: #fee2e2; color: #991b1b;' :
                        t.type === 'REFUND' ? 'background: #dbeafe; color: #1e40af;' :
                        'background: #f1f5f9; color: #475569;'
                      }">
                        ${t.type || 'EARNED'}
                      </span>
                    </td>
                    <td style="padding: 10px; text-align: right; font-weight: 800; font-size: 0.9rem; ${isPositive ? 'color: #166534;' : 'color: #991b1b;'}">
                      ${isPositive ? `+${t.amount}` : t.amount}
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      `;
    } catch (err) {
      container.innerHTML = `
        <div style="padding: var(--space-4); color: var(--neutral-600); font-size: 0.85rem; text-align: center;">
          Reward tokens ledger currently synced locally (${Store.getRewardTokens()} tokens available).
        </div>
      `;
    }
  },

  initListeners() {
    const currentUser = Store.getCurrentUser();

    // Unauthenticated triggers
    const custLoginBtn = document.getElementById('btn-portal-cust-login');
    if (custLoginBtn) {
      custLoginBtn.addEventListener('click', () => {
        AuthModal.open('customer', 'login', () => App.renderCurrentRoute());
      });
    }

    const custSignupBtn = document.getElementById('btn-portal-cust-signup');
    if (custSignupBtn) {
      custSignupBtn.addEventListener('click', () => {
        AuthModal.open('customer', 'signup', () => App.renderCurrentRoute());
      });
    }

    const sellLoginBtn = document.getElementById('btn-portal-sell-login');
    if (sellLoginBtn) {
      sellLoginBtn.addEventListener('click', () => {
        AuthModal.open('seller', 'login', () => {
          window.location.hash = '#portal';
          App.renderCurrentRoute();
        });
      });
    }

    const sellSignupBtn = document.getElementById('btn-portal-sell-signup');
    if (sellSignupBtn) {
      sellSignupBtn.addEventListener('click', () => {
        AuthModal.open('seller', 'signup', () => {
          window.location.hash = '#portal';
          App.renderCurrentRoute();
        });
      });
    }

    // Switch to seller portal trigger from customer view
    const switchSellerBtn = document.getElementById('btn-portal-switch-seller');
    if (switchSellerBtn) {
      switchSellerBtn.addEventListener('click', () => {
        AuthModal.open('seller', 'login', () => {
          window.location.hash = '#portal';
          App.renderCurrentRoute();
        });
      });
    }

    // Refresh rewards button
    const refreshBtn = document.getElementById('btn-refresh-rewards');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        this.renderRewardsTable();
        Utils.showToast('Reward tokens ledger refreshed.', 'info');
      });
    }

    // If seller view is rendered, initialize SellerView listeners
    if (currentUser && currentUser.role === 'seller') {
      const urlHash = window.location.hash;
      if (!urlHash.includes('view=customer')) {
        SellerView.initListeners();
      }
    }

    // If customer view is rendered, load rewards ledger table
    if (currentUser) {
      this.renderRewardsTable();
    }
  }
};
