/**
 * OneMarket - Protected Administrative Dashboard View
 * Features:
 * - Server-authorized admin access control (requireAdmin)
 * - Real-time marketplace KPIs & platform revenue analytics
 * - Customer & Seller account management (Suspend / Activate)
 * - Product moderation (Deactivate listing with reason / Reactivate)
 * - Platform-wide order monitoring
 * - Live administrative audit trail
 */

const AdminView = {
  currentTab: 'overview', // 'overview', 'users', 'products', 'orders', 'audit', 'inquiries'
  stats: null,
  users: [],
  products: [],
  orders: [],
  auditLogs: [],
  inquiries: [],
  inquiryFilter: 'all',
  userFilter: 'all',
  userSearch: '',
  productFilter: 'all',
  productSearch: '',
  orderFilter: 'all',
  orderSearch: '',
  isLoading: false,

  render(queryParams = {}) {
    const currentUser = Store.getCurrentUser();

    // 1. Not Authenticated: Show Administrator Gateway
    if (!currentUser) {
      return `
        <section class="admin-login-page" style="padding: var(--space-12) 0; min-height: 75vh; background: linear-gradient(135deg, #064e3b 0%, #022c22 100%);">
          <div class="container container-narrow">
            <div style="max-width: 440px; margin: 0 auto; background: #ffffff; border-radius: var(--radius-2xl); padding: 36px 32px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); text-align: center;">
              <div style="width: 56px; height: 56px; margin: 0 auto 16px; border-radius: var(--radius-full); background: #ecfdf5; color: #065f46; display: flex; align-items: center; justify-content: center; font-size: 1.8rem;">
                🛡️
              </div>
              <h1 style="font-family: var(--font-family-display); font-size: 1.6rem; font-weight: 800; color: #064e3b; margin-bottom: 6px;">
                OneMarket Administrator
              </h1>
              <p style="font-size: 0.85rem; color: #4b5563; margin-bottom: 24px; line-height: 1.5;">
                Protected operations console for platform moderation, merchant activation, and audit compliance.
              </p>

              <form id="admin-login-form" style="text-align: left; display: flex; flex-direction: column; gap: 14px;">
                <div>
                  <label style="display: block; font-size: 0.8rem; font-weight: 700; color: #374151; margin-bottom: 4px;">Admin Email</label>
                  <input type="email" id="admin-login-email" class="form-input" placeholder="admin@onemarket.in" required style="width: 100%; border: 1.5px solid #cbd5e1; padding: 10px 14px; border-radius: 8px;">
                </div>
                <div>
                  <label style="display: block; font-size: 0.8rem; font-weight: 700; color: #374151; margin-bottom: 4px;">Password</label>
                  <input type="password" id="admin-login-password" class="form-input" placeholder="••••••••" required style="width: 100%; border: 1.5px solid #cbd5e1; padding: 10px 14px; border-radius: 8px;">
                </div>
                <div style="margin-top: 8px;">
                  <button type="submit" class="btn btn-primary btn-block btn-lg" id="btn-admin-submit" style="background: #065f46; font-weight: 700;">
                    Authenticate to Admin Console
                  </button>
                </div>
              </form>

              <div style="margin-top: 24px; padding-top: 18px; border-top: 1px solid #e2e8f0; font-size: 0.75rem; color: #64748b; line-height: 1.5;">
                🔒 Public registration cannot grant administrator privileges. Local first-admin bootstrap: <code>node database/create-admin.js</code>
              </div>
            </div>
          </div>
        </section>
      `;
    }

    // 2. Authenticated but not an administrator: Access Denied
    if (currentUser.role !== 'admin') {
      return `
        <section style="padding: var(--space-12) 0; min-height: 70vh;">
          <div class="container container-narrow">
            <div style="background: #fff1f2; border: 2px solid #fecdd3; border-radius: var(--radius-2xl); padding: 48px 32px; text-align: center;">
              <div style="font-size: 3rem; margin-bottom: 16px;">🚫</div>
              <h1 style="font-family: var(--font-family-display); font-size: 1.75rem; font-weight: 800; color: #9f1239; margin-bottom: 8px;">
                Access Forbidden — Administrator Role Required
              </h1>
              <p style="color: #4c0519; font-size: 0.95rem; max-width: 520px; margin: 0 auto 24px; line-height: 1.6;">
                You are currently signed in as <strong>${Utils.escapeHTML(currentUser.name)}</strong> (${currentUser.role}). This section is strictly reserved for platform administrators with verified credentials.
              </p>
              <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
                <a href="#portal" class="btn btn-primary">Return to My Portal</a>
                <a href="#home" class="btn btn-outline">Back to Home</a>
              </div>
            </div>
          </div>
        </section>
      `;
    }

    // 3. Authenticated Administrator Dashboard
    return `
      <section class="admin-dashboard-page" style="padding: var(--space-8) 0 var(--space-16); min-height: 85vh; background: #f8fafc;">
        <div class="container">
          
          <!-- Admin Header Bar -->
          <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px; margin-bottom: var(--space-8); padding-bottom: var(--space-6); border-bottom: 1px solid #e2e8f0;">
            <div>
              <div style="display: flex; align-items: center; gap: 10px;">
                <span style="background: #065f46; color: #ffffff; padding: 4px 10px; border-radius: var(--radius-full); font-size: 0.75rem; font-weight: 800; letter-spacing: 0.05em; text-transform: uppercase;">
                  Administrator Mode
                </span>
                <span style="font-size: 0.8rem; color: #64748b;">Hubballi Regional Node</span>
              </div>
              <h1 style="font-family: var(--font-family-display); font-size: 2rem; font-weight: 800; color: #064e3b; margin: 6px 0 2px;">
                OneMarket Operations Console
              </h1>
              <p style="color: #475569; font-size: 0.9rem; margin: 0;">
                Platform governance, seller account verification, listing moderation, and audit trail.
              </p>
            </div>

            <div style="display: flex; align-items: center; gap: 10px;">
              <button type="button" class="btn btn-sm btn-outline" id="btn-admin-refresh" style="display: flex; align-items: center; gap: 6px;">
                🔄 Refresh Data
              </button>
              <div style="font-size: 0.85rem; color: #334155; background: #ffffff; border: 1px solid #cbd5e1; padding: 6px 14px; border-radius: var(--radius-full);">
                Signed in: <strong>${Utils.escapeHTML(currentUser.email)}</strong>
              </div>
            </div>
          </div>

          <!-- Navigation Tabs -->
          <div style="display: flex; gap: 8px; margin-bottom: var(--space-6); border-bottom: 2px solid #e2e8f0; overflow-x: auto; padding-bottom: 2px;">
            <button type="button" class="admin-tab-btn ${this.currentTab === 'overview' ? 'active' : ''}" data-tab="overview" style="padding: 10px 18px; border: none; background: none; font-weight: 700; font-size: 0.9rem; cursor: pointer; border-bottom: 3px solid ${this.currentTab === 'overview' ? '#065f46' : 'transparent'}; color: ${this.currentTab === 'overview' ? '#065f46' : '#64748b'};">
              📊 Platform Overview
            </button>
            <button type="button" class="admin-tab-btn ${this.currentTab === 'users' ? 'active' : ''}" data-tab="users" style="padding: 10px 18px; border: none; background: none; font-weight: 700; font-size: 0.9rem; cursor: pointer; border-bottom: 3px solid ${this.currentTab === 'users' ? '#065f46' : 'transparent'}; color: ${this.currentTab === 'users' ? '#065f46' : '#64748b'};">
              👥 Users & Sellers (${this.users.length})
            </button>
            <button type="button" class="admin-tab-btn ${this.currentTab === 'products' ? 'active' : ''}" data-tab="products" style="padding: 10px 18px; border: none; background: none; font-weight: 700; font-size: 0.9rem; cursor: pointer; border-bottom: 3px solid ${this.currentTab === 'products' ? '#065f46' : 'transparent'}; color: ${this.currentTab === 'products' ? '#065f46' : '#64748b'};">
              📦 Product Moderation (${this.products.length})
            </button>
            <button type="button" class="admin-tab-btn ${this.currentTab === 'orders' ? 'active' : ''}" data-tab="orders" style="padding: 10px 18px; border: none; background: none; font-weight: 700; font-size: 0.9rem; cursor: pointer; border-bottom: 3px solid ${this.currentTab === 'orders' ? '#065f46' : 'transparent'}; color: ${this.currentTab === 'orders' ? '#065f46' : '#64748b'};">
              📑 Marketplace Orders (${this.orders.length})
            </button>
            <button type="button" class="admin-tab-btn ${this.currentTab === 'audit' ? 'active' : ''}" data-tab="audit" style="padding: 10px 18px; border: none; background: none; font-weight: 700; font-size: 0.9rem; cursor: pointer; border-bottom: 3px solid ${this.currentTab === 'audit' ? '#065f46' : 'transparent'}; color: ${this.currentTab === 'audit' ? '#065f46' : '#64748b'};">
              📜 Audit Trail (${this.auditLogs.length})
            </button>
            <button type="button" class="admin-tab-btn ${this.currentTab === 'inquiries' ? 'active' : ''}" data-tab="inquiries" style="padding: 10px 18px; border: none; background: none; font-weight: 700; font-size: 0.9rem; cursor: pointer; border-bottom: 3px solid ${this.currentTab === 'inquiries' ? '#065f46' : 'transparent'}; color: ${this.currentTab === 'inquiries' ? '#065f46' : '#64748b'};">
              ✉️ Inquiries (${this.inquiries.length})
            </button>
          </div>

          <!-- Tab Content Area -->
          <div id="admin-tab-content">
            ${this.renderActiveTabContent()}
          </div>

        </div>
      </section>
    `;
  },

  renderActiveTabContent() {
    switch (this.currentTab) {
      case 'overview':
        return this.renderOverviewTab();
      case 'users':
        return this.renderUsersTab();
      case 'products':
        return this.renderProductsTab();
      case 'orders':
        return this.renderOrdersTab();
      case 'audit':
        return this.renderAuditTab();
      case 'inquiries':
        return this.renderInquiriesTab();
      default:
        return this.renderOverviewTab();
    }
  },

  renderOverviewTab() {
    const s = this.stats || {
      totalCustomers: 0,
      totalSellers: 0,
      totalShops: 0,
      activeProducts: 0,
      totalOrders: 0,
      totalSales: 0,
      ordersByStatus: {}
    };

    return `
      <div>
        <!-- KPI Metrics Grid -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; margin-bottom: 24px;">
          
          <div style="background: #ffffff; border-radius: 14px; padding: 20px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
            <div style="font-size: 0.8rem; font-weight: 700; color: #64748b; text-transform: uppercase;">Total Platform Sales</div>
            <div style="font-size: 1.8rem; font-weight: 800; color: #064e3b; margin: 6px 0 2px;">
              ${Utils.formatCurrency(s.totalSales)}
            </div>
            <div style="font-size: 0.75rem; color: #10b981; font-weight: 600;">Verified paid orders</div>
          </div>

          <div style="background: #ffffff; border-radius: 14px; padding: 20px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
            <div style="font-size: 0.8rem; font-weight: 700; color: #64748b; text-transform: uppercase;">Total Orders</div>
            <div style="font-size: 1.8rem; font-weight: 800; color: #0f172a; margin: 6px 0 2px;">
              ${s.totalOrders}
            </div>
            <div style="font-size: 0.75rem; color: #64748b;">Across Hubballi shops</div>
          </div>

          <div style="background: #ffffff; border-radius: 14px; padding: 20px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
            <div style="font-size: 0.8rem; font-weight: 700; color: #64748b; text-transform: uppercase;">Registered Merchants</div>
            <div style="font-size: 1.8rem; font-weight: 800; color: #0f172a; margin: 6px 0 2px;">
              ${s.totalSellers}
            </div>
            <div style="font-size: 0.75rem; color: #059669; font-weight: 600;">${s.totalShops} Active Storefronts</div>
          </div>

          <div style="background: #ffffff; border-radius: 14px; padding: 20px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
            <div style="font-size: 0.8rem; font-weight: 700; color: #64748b; text-transform: uppercase;">Registered Customers</div>
            <div style="font-size: 1.8rem; font-weight: 800; color: #0f172a; margin: 6px 0 2px;">
              ${s.totalCustomers}
            </div>
            <div style="font-size: 0.75rem; color: #64748b;">Hubballi shoppers</div>
          </div>

          <div style="background: #ffffff; border-radius: 14px; padding: 20px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
            <div style="font-size: 0.8rem; font-weight: 700; color: #64748b; text-transform: uppercase;">Active Listings</div>
            <div style="font-size: 1.8rem; font-weight: 800; color: #0f172a; margin: 6px 0 2px;">
              ${s.activeProducts}
            </div>
            <div style="font-size: 0.75rem; color: #059669; font-weight: 600;">Verified catalogue items</div>
          </div>

        </div>

        <!-- Orders Status Distribution -->
        <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px; margin-bottom: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
          <h2 style="font-size: 1.15rem; font-weight: 800; color: #0f172a; margin-bottom: 16px;">
            Order Fulfillment Pipeline
          </h2>
          <div style="display: flex; gap: 12px; flex-wrap: wrap;">
            <div style="flex: 1; min-width: 140px; background: #fef3c7; border: 1px solid #fde68a; border-radius: 10px; padding: 14px; text-align: center;">
              <div style="font-size: 0.75rem; font-weight: 700; color: #92400e; text-transform: uppercase;">Pending</div>
              <div style="font-size: 1.5rem; font-weight: 800; color: #78350f;">${s.ordersByStatus?.pending || 0}</div>
            </div>
            <div style="flex: 1; min-width: 140px; background: #e0e7ff; border: 1px solid #c7d2fe; border-radius: 10px; padding: 14px; text-align: center;">
              <div style="font-size: 0.75rem; font-weight: 700; color: #3730a3; text-transform: uppercase;">Confirmed / Packed</div>
              <div style="font-size: 1.5rem; font-weight: 800; color: #1e1b4b;">${s.ordersByStatus?.confirmed || 0}</div>
            </div>
            <div style="flex: 1; min-width: 140px; background: #fef08a; border: 1px solid #facc15; border-radius: 10px; padding: 14px; text-align: center;">
              <div style="font-size: 0.75rem; font-weight: 700; color: #854d0e; text-transform: uppercase;">Out for Delivery</div>
              <div style="font-size: 1.5rem; font-weight: 800; color: #713f12;">${s.ordersByStatus?.outForDelivery || 0}</div>
            </div>
            <div style="flex: 1; min-width: 140px; background: #dcfce7; border: 1px solid #bbf7d0; border-radius: 10px; padding: 14px; text-align: center;">
              <div style="font-size: 0.75rem; font-weight: 700; color: #166534; text-transform: uppercase;">Delivered</div>
              <div style="font-size: 1.5rem; font-weight: 800; color: #14532d;">${s.ordersByStatus?.delivered || 0}</div>
            </div>
            <div style="flex: 1; min-width: 140px; background: #fee2e2; border: 1px solid #fecaca; border-radius: 10px; padding: 14px; text-align: center;">
              <div style="font-size: 0.75rem; font-weight: 700; color: #991b1b; text-transform: uppercase;">Cancelled</div>
              <div style="font-size: 1.5rem; font-weight: 800; color: #7f1d1d;">${s.ordersByStatus?.cancelled || 0}</div>
            </div>
          </div>
        </div>

        <!-- Recent Actions & Quick Links -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 20px;">
          
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 22px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
            <h3 style="font-size: 1.05rem; font-weight: 800; color: #0f172a; margin-bottom: 12px;">
              Admin Operations Guidance
            </h3>
            <ul style="font-size: 0.85rem; color: #475569; padding-left: 20px; line-height: 1.7; margin: 0;">
              <li><strong>Merchant Governance:</strong> Review sellers in the Users tab to activate or suspend stores violating marketplace terms.</li>
              <li><strong>Listing Moderation:</strong> Inspect catalogue listings to deactivate fraudulent or mispriced items with a reason.</li>
              <li><strong>UPI Payment Verification:</strong> Track payment statuses across customers and verify payment settlements.</li>
              <li><strong>Compliance & Audit:</strong> Every administrative status alteration is immutably logged into the audit ledger.</li>
            </ul>
          </div>

          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 22px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
            <h3 style="font-size: 1.05rem; font-weight: 800; color: #0f172a; margin-bottom: 12px;">
              Regional Marketplace Configuration
            </h3>
            <div style="font-size: 0.85rem; color: #475569; line-height: 1.6;">
              <p style="margin: 0 0 8px;"><strong>Location Target:</strong> Hubballi, Karnataka (PIN 580020 - 580031)</p>
              <p style="margin: 0 0 8px;"><strong>Loyalty Engine:</strong> 1 OneMarket Token earned per ₹100 eligible spend</p>
              <p style="margin: 0 0 8px;"><strong>Redemption Cap:</strong> ₹1 per token (Max 50% order subtotal)</p>
              <p style="margin: 0;"><strong>Active Payment Flow:</strong> Official Indian UPI Gateway with PhonePe / GPay / QR</p>
            </div>
          </div>

        </div>
      </div>
    `;
  },

  renderUsersTab() {
    let filtered = [...this.users];
    if (this.userFilter !== 'all') {
      filtered = filtered.filter(u => u.role === this.userFilter);
    }
    if (this.userSearch.trim()) {
      const q = this.userSearch.toLowerCase();
      filtered = filtered.filter(u =>
        (u.name && u.name.toLowerCase().includes(q)) ||
        (u.email && u.email.toLowerCase().includes(q)) ||
        (u.shop_name && u.shop_name.toLowerCase().includes(q))
      );
    }

    return `
      <div>
        <!-- Controls Bar -->
        <div style="display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 20px; align-items: center; justify-content: space-between;">
          <div style="display: flex; gap: 8px; flex-wrap: wrap;">
            <button type="button" class="btn btn-sm ${this.userFilter === 'all' ? 'btn-primary' : 'btn-outline'} user-role-filter" data-role="all">All (${this.users.length})</button>
            <button type="button" class="btn btn-sm ${this.userFilter === 'seller' ? 'btn-primary' : 'btn-outline'} user-role-filter" data-role="seller">Sellers Only</button>
            <button type="button" class="btn btn-sm ${this.userFilter === 'customer' ? 'btn-primary' : 'btn-outline'} user-role-filter" data-role="customer">Customers Only</button>
          </div>
          <div style="max-width: 320px; width: 100%;">
            <input type="text" id="admin-user-search-input" class="form-input" placeholder="Search by name, email, shop..." value="${Utils.escapeHTML(this.userSearch)}" style="width: 100%; border: 1.5px solid #cbd5e1; border-radius: 8px; padding: 7px 12px; font-size: 0.85rem;">
          </div>
        </div>

        <!-- Users Table -->
        <div class="table-responsive-container" style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 14px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
          <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.875rem;">
            <thead>
              <tr style="background: #f8fafc; border-bottom: 2px solid #e2e8f0; color: #475569; font-size: 0.75rem; text-transform: uppercase;">
                <th style="padding: 12px 16px;">User / Merchant</th>
                <th style="padding: 12px 16px;">Role</th>
                <th style="padding: 12px 16px;">Storefront Details</th>
                <th style="padding: 12px 16px;">Tokens</th>
                <th style="padding: 12px 16px;">Status</th>
                <th style="padding: 12px 16px; text-align: right;">Action</th>
              </tr>
            </thead>
            <tbody>
              ${filtered.length === 0 ? `
                <tr><td colspan="6" style="padding: 32px; text-align: center; color: #64748b;">No registered users found matching query.</td></tr>
              ` : filtered.map(u => `
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 14px 16px;">
                    <div style="font-weight: 700; color: #0f172a;">${Utils.escapeHTML(u.name || 'Unnamed')}</div>
                    <div style="font-size: 0.75rem; color: #64748b;">${Utils.escapeHTML(u.email)} ${u.phone ? `• ${Utils.escapeHTML(u.phone)}` : ''}</div>
                  </td>
                  <td style="padding: 14px 16px;">
                    <span style="display: inline-block; padding: 3px 8px; border-radius: 6px; font-size: 0.75rem; font-weight: 700; background: ${u.role === 'admin' ? '#f3e8ff; color: #6b21a8;' : u.role === 'seller' ? '#fef3c7; color: #92400e;' : '#dcfce7; color: #166534;'}">
                      ${u.role.toUpperCase()}
                    </span>
                  </td>
                  <td style="padding: 14px 16px;">
                    ${u.shop_name ? `
                      <div style="font-weight: 600; color: #064e3b;">${Utils.escapeHTML(u.shop_name)}</div>
                      <div style="font-size: 0.75rem; color: #64748b;">${Utils.escapeHTML(u.shop_category || '')} (${Utils.escapeHTML(u.shop_area || 'Hubballi')})</div>
                    ` : '<span style="color: #94a3b8;">—</span>'}
                  </td>
                  <td style="padding: 14px 16px; font-weight: 700; color: #065f46;">
                    ${u.reward_tokens || 0}
                  </td>
                  <td style="padding: 14px 16px;">
                    <span style="display: inline-block; padding: 3px 8px; border-radius: 6px; font-size: 0.75rem; font-weight: 700; background: ${u.status === 'suspended' ? '#fee2e2; color: #991b1b;' : '#dcfce7; color: #166534;'}">
                      ${(u.status || 'active').toUpperCase()}
                    </span>
                  </td>
                  <td style="padding: 14px 16px; text-align: right;">
                    ${u.role === 'admin' ? '<span style="font-size: 0.75rem; color: #94a3b8;">Protected</span>' : `
                      <button type="button" class="btn btn-sm ${u.status === 'suspended' ? 'btn-primary' : 'btn-outline'} btn-toggle-user-status" data-user-id="${u.id}" data-current-status="${u.status || 'active'}" data-user-name="${Utils.escapeHTML(u.name)}">
                        ${u.status === 'suspended' ? 'Activate' : 'Suspend'}
                      </button>
                    `}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  renderProductsTab() {
    let filtered = [...this.products];
    if (this.productFilter !== 'all') {
      filtered = filtered.filter(p => p.status === this.productFilter);
    }
    if (this.productSearch.trim()) {
      const q = this.productSearch.toLowerCase();
      filtered = filtered.filter(p =>
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.shop_name && p.shop_name.toLowerCase().includes(q)) ||
        (p.category && p.category.toLowerCase().includes(q))
      );
    }

    return `
      <div>
        <!-- Controls Bar -->
        <div style="display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 20px; align-items: center; justify-content: space-between;">
          <div style="display: flex; gap: 8px; flex-wrap: wrap;">
            <button type="button" class="btn btn-sm ${this.productFilter === 'all' ? 'btn-primary' : 'btn-outline'} product-status-filter" data-status="all">All (${this.products.length})</button>
            <button type="button" class="btn btn-sm ${this.productFilter === 'active' ? 'btn-primary' : 'btn-outline'} product-status-filter" data-status="active">Active Only</button>
            <button type="button" class="btn btn-sm ${this.productFilter === 'inactive' ? 'btn-primary' : 'btn-outline'} product-status-filter" data-status="inactive">Moderated / Deactivated</button>
          </div>
          <div style="max-width: 320px; width: 100%;">
            <input type="text" id="admin-prod-search-input" class="form-input" placeholder="Search products, merchants..." value="${Utils.escapeHTML(this.productSearch)}" style="width: 100%; border: 1.5px solid #cbd5e1; border-radius: 8px; padding: 7px 12px; font-size: 0.85rem;">
          </div>
        </div>

        <!-- Products Table -->
        <div class="table-responsive-container" style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 14px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
          <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.875rem;">
            <thead>
              <tr style="background: #f8fafc; border-bottom: 2px solid #e2e8f0; color: #475569; font-size: 0.75rem; text-transform: uppercase;">
                <th style="padding: 12px 16px;">Product</th>
                <th style="padding: 12px 16px;">Category</th>
                <th style="padding: 12px 16px;">Merchant</th>
                <th style="padding: 12px 16px;">Price</th>
                <th style="padding: 12px 16px;">Stock</th>
                <th style="padding: 12px 16px;">Status</th>
                <th style="padding: 12px 16px; text-align: right;">Moderation Action</th>
              </tr>
            </thead>
            <tbody>
              ${filtered.length === 0 ? `
                <tr><td colspan="7" style="padding: 32px; text-align: center; color: #64748b;">No products found matching query.</td></tr>
              ` : filtered.map(p => `
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 12px 16px;">
                    <div style="display: flex; align-items: center; gap: 12px;">
                      <img src="${p.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=100&q=80'}" alt="" style="width: 40px; height: 40px; border-radius: 8px; object-fit: cover; border: 1px solid #e2e8f0;">
                      <div>
                        <div style="font-weight: 700; color: #0f172a;">${Utils.escapeHTML(p.name)}</div>
                        <div style="font-size: 0.75rem; color: #64748b;">ID: ${p.id}</div>
                      </div>
                    </div>
                  </td>
                  <td style="padding: 12px 16px; color: #475569;">${Utils.escapeHTML(p.category)}</td>
                  <td style="padding: 12px 16px; font-weight: 600; color: #064e3b;">${Utils.escapeHTML(p.shop_name || 'Hubballi Store')}</td>
                  <td style="padding: 12px 16px; font-weight: 700; color: #0f172a;">${Utils.formatCurrency(p.price)}</td>
                  <td style="padding: 12px 16px; color: ${p.stock < 5 ? '#dc2626' : '#15803d'}; font-weight: 700;">${p.stock} units</td>
                  <td style="padding: 12px 16px;">
                    <span style="display: inline-block; padding: 3px 8px; border-radius: 6px; font-size: 0.75rem; font-weight: 700; background: ${p.status === 'inactive' ? '#fee2e2; color: #991b1b;' : '#dcfce7; color: #166534;'}">
                      ${p.status === 'inactive' ? 'MODERATED / INACTIVE' : 'ACTIVE'}
                    </span>
                  </td>
                  <td style="padding: 12px 16px; text-align: right;">
                    <button type="button" class="btn btn-sm ${p.status === 'inactive' ? 'btn-primary' : 'btn-outline'} btn-moderate-product" data-product-id="${p.id}" data-current-status="${p.status || 'active'}" data-product-name="${Utils.escapeHTML(p.name)}">
                      ${p.status === 'inactive' ? 'Reactivate' : 'Deactivate Listing'}
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  renderOrdersTab() {
    let filtered = [...this.orders];
    if (this.orderFilter !== 'all') {
      filtered = filtered.filter(o => o.status === this.orderFilter);
    }
    if (this.orderSearch.trim()) {
      const q = this.orderSearch.toLowerCase();
      filtered = filtered.filter(o =>
        (o.id && o.id.toLowerCase().includes(q)) ||
        (o.customer_name && o.customer_name.toLowerCase().includes(q))
      );
    }

    return `
      <div>
        <!-- Controls Bar -->
        <div style="display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 20px; align-items: center; justify-content: space-between;">
          <div style="display: flex; gap: 8px; flex-wrap: wrap;">
            <button type="button" class="btn btn-sm ${this.orderFilter === 'all' ? 'btn-primary' : 'btn-outline'} order-status-filter" data-status="all">All (${this.orders.length})</button>
            <button type="button" class="btn btn-sm ${this.orderFilter === 'Pending' ? 'btn-primary' : 'btn-outline'} order-status-filter" data-status="Pending">Pending</button>
            <button type="button" class="btn btn-sm ${this.orderFilter === 'Confirmed' ? 'btn-primary' : 'btn-outline'} order-status-filter" data-status="Confirmed">Confirmed</button>
            <button type="button" class="btn btn-sm ${this.orderFilter === 'Delivered' ? 'btn-primary' : 'btn-outline'} order-status-filter" data-status="Delivered">Delivered</button>
            <button type="button" class="btn btn-sm ${this.orderFilter === 'Cancelled' ? 'btn-primary' : 'btn-outline'} order-status-filter" data-status="Cancelled">Cancelled</button>
          </div>
          <div style="max-width: 320px; width: 100%;">
            <input type="text" id="admin-order-search-input" class="form-input" placeholder="Search Order ID, Customer..." value="${Utils.escapeHTML(this.orderSearch)}" style="width: 100%; border: 1.5px solid #cbd5e1; border-radius: 8px; padding: 7px 12px; font-size: 0.85rem;">
          </div>
        </div>

        <!-- Orders Table -->
        <div class="table-responsive-container" style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 14px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
          <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.875rem;">
            <thead>
              <tr style="background: #f8fafc; border-bottom: 2px solid #e2e8f0; color: #475569; font-size: 0.75rem; text-transform: uppercase;">
                <th style="padding: 12px 16px;">Order ID & Date</th>
                <th style="padding: 12px 16px;">Customer</th>
                <th style="padding: 12px 16px;">Payment</th>
                <th style="padding: 12px 16px;">Total</th>
                <th style="padding: 12px 16px;">Fulfillment Status</th>
              </tr>
            </thead>
            <tbody>
              ${filtered.length === 0 ? `
                <tr><td colspan="5" style="padding: 32px; text-align: center; color: #64748b;">No orders found matching query.</td></tr>
              ` : filtered.map(o => `
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 14px 16px;">
                    <div style="font-weight: 700; color: #0f172a;">#${o.id}</div>
                    <div style="font-size: 0.75rem; color: #64748b;">${new Date(o.created_at).toLocaleString('en-IN')}</div>
                  </td>
                  <td style="padding: 14px 16px;">
                    <div style="font-weight: 600; color: #0f172a;">${Utils.escapeHTML(o.customer_name || 'Customer')}</div>
                    <div style="font-size: 0.75rem; color: #64748b;">${Utils.escapeHTML(o.customer_phone || '')}</div>
                  </td>
                  <td style="padding: 14px 16px;">
                    <div style="font-size: 0.8rem; font-weight: 700; color: #334155;">${Utils.escapeHTML(o.payment_method || 'UPI')}</div>
                    <span style="display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 0.7rem; font-weight: 700; background: ${o.payment_status === 'Paid' ? '#dcfce7; color: #166534;' : '#fef3c7; color: #92400e;'}">
                      ${o.payment_status || 'Pending'}
                    </span>
                  </td>
                  <td style="padding: 14px 16px; font-weight: 800; color: #064e3b;">
                    ${Utils.formatCurrency(o.total)}
                  </td>
                  <td style="padding: 14px 16px;">
                    <span style="display: inline-block; padding: 3px 8px; border-radius: 6px; font-size: 0.75rem; font-weight: 700; background: ${o.status === 'Cancelled' ? '#fee2e2; color: #991b1b;' : o.status === 'Delivered' ? '#dcfce7; color: #166534;' : '#e0e7ff; color: #3730a3;'}">
                      ${o.status}
                    </span>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  renderAuditTab() {
    return `
      <div>
        <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 14px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
          <div style="padding: 16px 20px; background: #f8fafc; border-bottom: 1px solid #e2e8f0;">
            <h3 style="font-size: 1rem; font-weight: 800; color: #0f172a; margin: 0;">
              Immutable Administrative Audit Log
            </h3>
            <p style="font-size: 0.8rem; color: #64748b; margin: 4px 0 0;">
              All administrative permissions, account suspensions, and product moderations are recorded.
            </p>
          </div>
          <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.875rem;">
            <thead>
              <tr style="background: #ffffff; border-bottom: 2px solid #e2e8f0; color: #475569; font-size: 0.75rem; text-transform: uppercase;">
                <th style="padding: 12px 16px;">Timestamp</th>
                <th style="padding: 12px 16px;">Action</th>
                <th style="padding: 12px 16px;">Target</th>
                <th style="padding: 12px 16px;">Details</th>
              </tr>
            </thead>
            <tbody>
              ${this.auditLogs.length === 0 ? `
                <tr><td colspan="4" style="padding: 32px; text-align: center; color: #64748b;">No administrative actions recorded yet.</td></tr>
              ` : this.auditLogs.map(log => `
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 12px 16px; font-size: 0.75rem; color: #64748b; white-space: nowrap;">
                    ${new Date(log.created_at).toLocaleString('en-IN')}
                  </td>
                  <td style="padding: 12px 16px;">
                    <span style="font-weight: 700; font-size: 0.8rem; color: #065f46; background: #ecfdf5; padding: 2px 8px; border-radius: 4px;">
                      ${log.action}
                    </span>
                  </td>
                  <td style="padding: 12px 16px; font-size: 0.8rem;">
                    <strong>${log.target_type}:</strong> ${log.target_id}
                  </td>
                  <td style="padding: 12px 16px; font-size: 0.8rem; color: #475569;">
                    ${typeof log.details === 'string' ? log.details : JSON.stringify(log.details)}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  renderInquiriesTab() {
    let filteredInquiries = [...this.inquiries];
    if (this.inquiryFilter !== 'all') {
      filteredInquiries = filteredInquiries.filter(i => (i.status || 'unread') === this.inquiryFilter);
    }

    const shopsMap = {};
    Store.getShops().forEach(s => { shopsMap[s.id] = s.name; });

    return `
      <div>
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; margin-bottom: 20px;">
          <div>
            <h3 style="font-size: 1.25rem; font-weight: 800; color: #064e3b; margin: 0 0 4px;">
              Customer & Merchant Inquiries (${this.inquiries.length})
            </h3>
            <p style="font-size: 0.85rem; color: #64748b; margin: 0;">
              All form details and inquiries submitted by visitors are securely saved in our Supabase cloud backend.
            </p>
          </div>

          <!-- Status Filters -->
          <div style="display: flex; gap: 6px;">
            <button type="button" class="btn btn-sm ${this.inquiryFilter === 'all' ? 'btn-primary' : 'btn-outline'} inquiry-status-filter" data-status="all">All (${this.inquiries.length})</button>
            <button type="button" class="btn btn-sm ${this.inquiryFilter === 'unread' ? 'btn-primary' : 'btn-outline'} inquiry-status-filter" data-status="unread">Unread</button>
            <button type="button" class="btn btn-sm ${this.inquiryFilter === 'in_progress' ? 'btn-primary' : 'btn-outline'} inquiry-status-filter" data-status="in_progress">In Progress</button>
            <button type="button" class="btn btn-sm ${this.inquiryFilter === 'resolved' ? 'btn-primary' : 'btn-outline'} inquiry-status-filter" data-status="resolved">Resolved</button>
          </div>
        </div>

        <div style="background: #ffffff; border-radius: var(--radius-xl); border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
          <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.875rem;">
            <thead>
              <tr style="background: #f8fafc; border-bottom: 2px solid #e2e8f0; color: #475569; font-size: 0.75rem; text-transform: uppercase;">
                <th style="padding: 12px 16px;">Ref ID</th>
                <th style="padding: 12px 16px;">Sender Details</th>
                <th style="padding: 12px 16px;">Target</th>
                <th style="padding: 12px 16px;">Subject & Message</th>
                <th style="padding: 12px 16px;">Date</th>
                <th style="padding: 12px 16px;">Status</th>
                <th style="padding: 12px 16px; text-align: right;">Action</th>
              </tr>
            </thead>
            <tbody>
              ${filteredInquiries.length === 0 ? `
                <tr><td colspan="7" style="padding: 40px; text-align: center; color: #64748b;">No inquiries found matching this filter.</td></tr>
              ` : filteredInquiries.map(inq => {
                const statusColor = inq.status === 'resolved' ? '#047857' : (inq.status === 'in_progress' ? '#b45309' : '#1d4ed8');
                const statusBg = inq.status === 'resolved' ? '#ecfdf5' : (inq.status === 'in_progress' ? '#fef3c7' : '#eff6ff');
                const targetShopName = inq.shop_id ? (shopsMap[inq.shop_id] || inq.shop_id) : 'General Platform';

                return `
                  <tr style="border-bottom: 1px solid #f1f5f9;">
                    <td style="padding: 12px 16px; font-weight: 700; color: #065f46; font-size: 0.8rem;">
                      #INQ-${inq.id}
                    </td>
                    <td style="padding: 12px 16px;">
                      <div style="font-weight: 700; color: #1e293b;">${Utils.escapeHTML(inq.name || '')}</div>
                      <div style="font-size: 0.75rem; color: #64748b;">✉️ ${Utils.escapeHTML(inq.email || '')}</div>
                      ${inq.phone ? `<div style="font-size: 0.75rem; color: #64748b;">📞 ${Utils.escapeHTML(inq.phone)}</div>` : ''}
                    </td>
                    <td style="padding: 12px 16px; font-size: 0.8rem; color: #334155;">
                      <span style="display: inline-block; padding: 2px 8px; border-radius: 4px; background: #f1f5f9; font-weight: 600;">
                        ${Utils.escapeHTML(targetShopName)}
                      </span>
                    </td>
                    <td style="padding: 12px 16px; max-width: 320px;">
                      <div style="font-weight: 600; color: #0f172a; margin-bottom: 2px;">${Utils.escapeHTML(inq.subject || 'Inquiry')}</div>
                      <div style="font-size: 0.8rem; color: #475569; line-height: 1.4;">${Utils.escapeHTML(inq.message || '')}</div>
                    </td>
                    <td style="padding: 12px 16px; font-size: 0.75rem; color: #64748b; white-space: nowrap;">
                      ${inq.created_at ? new Date(inq.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
                    </td>
                    <td style="padding: 12px 16px;">
                      <span style="font-size: 0.75rem; font-weight: 700; text-transform: uppercase; padding: 3px 8px; border-radius: var(--radius-full); background: ${statusBg}; color: ${statusColor};">
                        ${inq.status || 'unread'}
                      </span>
                    </td>
                    <td style="padding: 12px 16px; text-align: right; white-space: nowrap;">
                      <select class="form-control select-inquiry-status" data-inquiry-id="${inq.id}" style="font-size: 0.75rem; padding: 4px 8px; border-radius: 6px; border: 1px solid #cbd5e1;">
                        <option value="unread" ${inq.status === 'unread' ? 'selected' : ''}>Unread</option>
                        <option value="in_progress" ${inq.status === 'in_progress' ? 'selected' : ''}>In Progress</option>
                        <option value="resolved" ${inq.status === 'resolved' ? 'selected' : ''}>Resolved</option>
                        <option value="archived" ${inq.status === 'archived' ? 'selected' : ''}>Archived</option>
                      </select>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  async loadAdminData() {
    const currentUser = Store.getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') return;

    const token = Store.getToken();
    const headers = { 'Authorization': `Bearer ${token}` };

    try {
      this.isLoading = true;

      const [statsRes, usersRes, prodsRes, ordersRes, auditRes, inquiriesRes] = await Promise.all([
        fetch('/api/admin/stats', { headers }).then(r => r.json()).catch(() => ({})),
        fetch('/api/admin/users', { headers }).then(r => r.json()).catch(() => ({})),
        fetch('/api/admin/products', { headers }).then(r => r.json()).catch(() => ({})),
        fetch('/api/admin/orders', { headers }).then(r => r.json()).catch(() => ({})),
        fetch('/api/admin/audit-logs', { headers }).then(r => r.json()).catch(() => ({})),
        fetch('/api/inquiries').then(r => r.json()).catch(() => ({}))
      ]);

      if (statsRes.success) this.stats = statsRes.stats;
      if (usersRes.success) this.users = usersRes.users || [];
      if (prodsRes.success) this.products = prodsRes.products || [];
      if (ordersRes.success) this.orders = ordersRes.orders || [];
      if (auditRes.success) this.auditLogs = auditRes.logs || [];
      if (inquiriesRes.success) this.inquiries = inquiriesRes.data || [];

      this.isLoading = false;
      this.updateViewDOM();
    } catch (err) {
      this.isLoading = false;
      console.error('Failed to load admin data:', err);
    }
  },

  updateViewDOM() {
    const content = document.getElementById('admin-tab-content');
    if (content) {
      content.innerHTML = this.renderActiveTabContent();
      this.initContentListeners();
    }
  },

  initListeners() {
    const currentUser = Store.getCurrentUser();

    // 1. Admin login form handler
    const loginForm = document.getElementById('admin-login-form');
    if (loginForm) {
      loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('admin-login-email').value.trim();
        const password = document.getElementById('admin-login-password').value;
        const btn = document.getElementById('btn-admin-submit');
        if (btn) { btn.disabled = true; btn.textContent = 'Authenticating...'; }

        try {
          const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
          });
          const data = await res.json();

          if (res.ok && data.success) {
            if (data.user?.role !== 'admin') {
              Utils.showToast('Access Denied. Account does not have administrator privileges.', 'error');
              if (btn) { btn.disabled = false; btn.textContent = 'Authenticate to Admin Console'; }
              return;
            }
            Store.login(data.user, data.token);
            Utils.showToast(`Welcome Administrator ${data.user.name}!`, 'success');
            App.renderCurrentRoute();
          } else {
            Utils.showToast(data.message || 'Authentication failed', 'error');
            if (btn) { btn.disabled = false; btn.textContent = 'Authenticate to Admin Console'; }
          }
        } catch (err) {
          Utils.showToast('Network error during authentication', 'error');
          if (btn) { btn.disabled = false; btn.textContent = 'Authenticate to Admin Console'; }
        }
      });
    }

    if (!currentUser || currentUser.role !== 'admin') return;

    // 2. Tab switching
    document.querySelectorAll('.admin-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.currentTab = btn.getAttribute('data-tab');
        document.querySelectorAll('.admin-tab-btn').forEach(b => {
          b.classList.remove('active');
          b.style.borderBottomColor = 'transparent';
          b.style.color = '#64748b';
        });
        btn.classList.add('active');
        btn.style.borderBottomColor = '#065f46';
        btn.style.color = '#065f46';
        this.updateViewDOM();
      });
    });

    // 3. Refresh button
    const refreshBtn = document.getElementById('btn-admin-refresh');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', async () => {
        refreshBtn.textContent = '⏳ Refreshing...';
        await this.loadAdminData();
        refreshBtn.textContent = '🔄 Refresh Data';
        Utils.showToast('Operations console refreshed.', 'info');
      });
    }

    // Load initial data if not loaded
    this.loadAdminData();
    this.initContentListeners();
  },

  initContentListeners() {
    const token = Store.getToken();
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    // User filters & search
    document.querySelectorAll('.user-role-filter').forEach(btn => {
      btn.addEventListener('click', () => {
        this.userFilter = btn.getAttribute('data-role');
        this.updateViewDOM();
      });
    });

    const userSearchInput = document.getElementById('admin-user-search-input');
    if (userSearchInput) {
      userSearchInput.addEventListener('input', (e) => {
        this.userSearch = e.target.value;
        this.updateViewDOM();
      });
    }

    // User Status Toggle (Suspend / Activate)
    document.querySelectorAll('.btn-toggle-user-status').forEach(btn => {
      btn.addEventListener('click', async () => {
        const userId = btn.getAttribute('data-user-id');
        const currentStatus = btn.getAttribute('data-current-status');
        const userName = btn.getAttribute('data-user-name');
        const newStatus = currentStatus === 'suspended' ? 'active' : 'suspended';

        const actionText = newStatus === 'suspended' ? 'suspend' : 'activate';
        if (!confirm(`Are you sure you want to ${actionText} user account "${userName}"?`)) {
          return;
        }

        try {
          btn.disabled = true;
          const res = await fetch(`/api/admin/users/${userId}/status`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify({ status: newStatus, reason: `Admin ${actionText} action from console` })
          });
          const data = await res.json();
          if (data.success) {
            Utils.showToast(data.message, 'success');
            await this.loadAdminData();
          } else {
            Utils.showToast(data.message || 'Failed to update user status', 'error');
            btn.disabled = false;
          }
        } catch (err) {
          Utils.showToast('Network error while updating user status', 'error');
          btn.disabled = false;
        }
      });
    });

    // Product filters & search
    document.querySelectorAll('.product-status-filter').forEach(btn => {
      btn.addEventListener('click', () => {
        this.productFilter = btn.getAttribute('data-status');
        this.updateViewDOM();
      });
    });

    const prodSearchInput = document.getElementById('admin-prod-search-input');
    if (prodSearchInput) {
      prodSearchInput.addEventListener('input', (e) => {
        this.productSearch = e.target.value;
        this.updateViewDOM();
      });
    }

    // Product Moderation Toggle (Deactivate / Reactivate)
    document.querySelectorAll('.btn-moderate-product').forEach(btn => {
      btn.addEventListener('click', async () => {
        const prodId = btn.getAttribute('data-product-id');
        const currentStatus = btn.getAttribute('data-current-status');
        const prodName = btn.getAttribute('data-product-name');
        const newStatus = currentStatus === 'inactive' ? 'active' : 'inactive';

        let reason = '';
        if (newStatus === 'inactive') {
          reason = prompt(`Enter moderation reason for deactivating "${prodName}":`, 'Listing violates marketplace guidelines or contains inaccurate inventory.');
          if (reason === null) return; // user cancelled prompt
        }

        try {
          btn.disabled = true;
          const res = await fetch(`/api/admin/products/${prodId}/status`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify({ status: newStatus, reason })
          });
          const data = await res.json();
          if (data.success) {
            Utils.showToast(data.message, 'success');
            await this.loadAdminData();
          } else {
            Utils.showToast(data.message || 'Failed to moderate product', 'error');
            btn.disabled = false;
          }
        } catch (err) {
          Utils.showToast('Network error while moderating product', 'error');
          btn.disabled = false;
        }
      });
    });

    // Order filters & search
    document.querySelectorAll('.order-status-filter').forEach(btn => {
      btn.addEventListener('click', () => {
        this.orderFilter = btn.getAttribute('data-status');
        this.updateViewDOM();
      });
    });

    const orderSearchInput = document.getElementById('admin-order-search-input');
    if (orderSearchInput) {
      orderSearchInput.addEventListener('input', (e) => {
        this.orderSearch = e.target.value;
        this.updateViewDOM();
      });
    }

    // Inquiry filter listeners
    document.querySelectorAll('.inquiry-status-filter').forEach(btn => {
      btn.addEventListener('click', () => {
        this.inquiryFilter = btn.getAttribute('data-status');
        this.updateViewDOM();
      });
    });

    // Inquiry status update listener
    document.querySelectorAll('.select-inquiry-status').forEach(sel => {
      sel.addEventListener('change', async (e) => {
        const inqId = sel.getAttribute('data-inquiry-id');
        const newStatus = e.target.value;
        try {
          sel.disabled = true;
          const res = await fetch(`/api/inquiries/${inqId}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
          });
          const data = await res.json();
          if (res.ok && data.success) {
            Utils.showToast(`Inquiry #${inqId} marked as ${newStatus}`, 'success');
            await this.loadAdminData();
          } else {
            Utils.showToast(data.message || 'Failed to update inquiry status', 'error');
            sel.disabled = false;
          }
        } catch (err) {
          Utils.showToast('Network error updating inquiry status', 'error');
          sel.disabled = false;
        }
      });
    });
  }
};
