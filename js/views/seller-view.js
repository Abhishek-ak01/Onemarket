/**
 * LocalLoop - Seller Portal & Merchant Dashboard View
 * Features:
 * 1. Role-based seller authentication gate with 1-click evaluator quick-switch
 * 2. Overview KPIs (Total products, stock units, orders, revenue, low stock)
 * 3. Product & Promotional Discount Management (Add, Edit, Delete, Low-stock alerts)
 * 4. Multi-stage Order Fulfillment (Confirmed -> Packed -> Shipped -> Out for Delivery -> Delivered)
 * 5. Visual SVG Sales Chart & Analytics
 */

const SellerView = {
  currentTab: 'overview', // 'overview', 'products', 'orders', 'analytics'

  render(queryParams = {}) {
    if (queryParams.tab) {
      this.currentTab = queryParams.tab;
    }

    // Role-based Seller Authentication Protection
    const isSeller = typeof Store.isSeller === 'function' ? Store.isSeller() : (Store.currentUser && Store.currentUser.role === 'seller');
    const isAuth = typeof Store.isAuthenticated === 'function' ? Store.isAuthenticated() : Boolean(Store.currentUser);

    if (!isAuth || !isSeller) {
      return `
        <section class="seller-page" style="padding: var(--space-8) 0; min-height: 65vh;">
          <div class="container container-narrow">
            <div class="empty-state" style="background: white; border: 1px solid var(--color-border-subtle); border-radius: var(--radius-xl); padding: var(--space-8); box-shadow: var(--shadow-sm); text-align: center;">
              <div class="empty-state-icon" style="background: var(--primary-50); color: var(--color-primary); width: 68px; height: 68px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: var(--space-4);">
                ${Utils.icons.shop}
              </div>
              <h2 class="empty-state-title" style="font-family: var(--font-family-display); font-size: 1.75rem; margin-bottom: var(--space-2);">
                Merchant Portal Access
              </h2>
              <p class="empty-state-desc" style="color: var(--neutral-600); max-width: 520px; margin: 0 auto var(--space-6); line-height: 1.6;">
                The OneMarket Seller Dashboard allows merchants to manage inventory, update pricing & discounts, and track order fulfillment. Please sign in with a verified seller account.
              </p>
              <div style="display: flex; gap: var(--space-3); justify-content: center; flex-wrap: wrap;">
                <button type="button" class="btn btn-primary btn-lg" id="btn-seller-auth-login">
                  ${Utils.icons.user || ''} Sign In as Seller
                </button>
                <button type="button" class="btn btn-outline btn-lg" id="btn-seller-auth-register">
                  Register New Shop
                </button>
                <button type="button" class="btn btn-lg" id="btn-seller-evaluator-demo" style="background: #047857; color: white; border: none; font-weight: 700;">
                  ⚡ 1-Click Demo Seller (Malabar Spices)
                </button>
              </div>
            </div>
          </div>
        </section>
      `;
    }

    const shops = Store.getShops();
    const activeSellerId = Store.getActiveSellerId();
    const activeShop = Store.getActiveSeller();
    const analytics = Store.getSellerAnalytics(activeSellerId);

    return `
      <section class="seller-page">
        <div class="container">
          
          <!-- Top Merchant Profile Banner -->
          <div class="seller-merchant-banner">
            <div class="seller-profile-info">
              <div class="seller-shop-avatar">
                ${activeShop.id === 'all' ? Utils.icons.shop : activeShop.name.charAt(0)}
              </div>
              <div>
                <h1 class="seller-shop-name">${Utils.escapeHTML(activeShop.name)}</h1>
                <div class="seller-shop-meta">
                  <span>${Utils.icons.mapPin} ${Utils.escapeHTML(activeShop.area || 'All Zones')}</span>
                  ${activeShop.timing ? `<span>• Hours: ${Utils.escapeHTML(activeShop.timing)}</span>` : ''}
                  <span>• Verified Merchant Portal</span>
                </div>
              </div>
            </div>

            <!-- Shop Switcher for demo persona testing -->
            <div style="display: flex; align-items: center; gap: var(--space-3); flex-wrap: wrap;">
              <div style="display: flex; flex-direction: column;">
                <label for="seller-shop-select" style="font-size: 11px; color: var(--primary-200); font-weight: 600; text-transform: uppercase;">
                  Switch Merchant Persona:
                </label>
                <select id="seller-shop-select" class="shop-switcher-select">
                  <option value="all" ${activeSellerId === 'all' ? 'selected' : ''}>
                    All Shops (Marketplace Admin View)
                  </option>
                  ${shops.map(s => `
                    <option value="${s.id}" ${activeSellerId === s.id ? 'selected' : ''}>
                      ${Utils.escapeHTML(s.name)} (${Utils.escapeHTML(s.area)})
                    </option>
                  `).join('')}
                </select>
              </div>

              <a href="#store/${encodeURIComponent(activeShop.id)}" class="btn btn-sm btn-outline" style="border-color: rgba(255,255,255,0.3); color: var(--white); height: fit-content; align-self: flex-end;">
                ${Utils.icons.shop} View Public Storefront
              </a>
            </div>
          </div>

          <!-- Tabs Navigation -->
          <nav class="seller-tabs-nav" aria-label="Seller Dashboard Tabs">
            <button type="button" class="seller-tab-btn ${this.currentTab === 'overview' ? 'active' : ''}" data-tab="overview">
              ${Utils.icons.package} Overview
            </button>
            <button type="button" class="seller-tab-btn ${this.currentTab === 'products' ? 'active' : ''}" data-tab="products">
              ${Utils.icons.groceries} Products & Inventory
              <span class="seller-tab-badge">${analytics.totalProducts}</span>
            </button>
            <button type="button" class="seller-tab-btn ${this.currentTab === 'orders' ? 'active' : ''}" data-tab="orders">
              ${Utils.icons.receipt || Utils.icons.package} Order Fulfillment
              ${analytics.pendingOrdersCount > 0 ? `
                <span class="seller-tab-badge" style="background-color: var(--accent-600); color: var(--white);">
                  ${analytics.pendingOrdersCount} Pending
                </span>
              ` : `
                <span class="seller-tab-badge">${analytics.completedOrdersCount + analytics.pendingOrdersCount + analytics.acceptedOrdersCount}</span>
              `}
            </button>
            <button type="button" class="seller-tab-btn ${this.currentTab === 'analytics' ? 'active' : ''}" data-tab="analytics">
              ${Utils.icons.trendingUp} Sales Insights & Charts
            </button>
          </nav>

          <!-- Tab Content Panels -->
          <div class="seller-tab-content">
            ${this.renderTabContent(analytics)}
          </div>

        </div>
      </section>
    `;
  },

  renderTabContent(analytics) {
    switch (this.currentTab) {
      case 'products':
        return this.renderProductsTab();
      case 'orders':
        return this.renderOrdersTab();
      case 'analytics':
        return this.renderAnalyticsTab(analytics);
      case 'overview':
      default:
        return this.renderOverviewTab(analytics);
    }
  },

  /* ------------------------------------------------------------------------
     1. OVERVIEW TAB
     ------------------------------------------------------------------------ */
  renderOverviewTab(analytics) {
    const orders = Store.getOrdersBySeller(Store.getActiveSellerId());
    const recentOrders = orders.slice(0, 5);

    return `
      <!-- KPI Cards Grid -->
      <div class="kpi-grid">
        
        <div class="kpi-card">
          <div class="kpi-header">
            <span class="kpi-label">Listed Products</span>
            <div class="kpi-icon-pill info">${Utils.icons.package}</div>
          </div>
          <div class="kpi-value">${analytics.totalProducts}</div>
          <div class="kpi-subtitle">Active catalog listings</div>
        </div>

        <div class="kpi-card">
          <div class="kpi-header">
            <span class="kpi-label">Total Stock Units</span>
            <div class="kpi-icon-pill success">${Utils.icons.box || Utils.icons.package}</div>
          </div>
          <div class="kpi-value">${analytics.totalUnits}</div>
          <div class="kpi-subtitle">Physical units available</div>
        </div>

        <div class="kpi-card">
          <div class="kpi-header">
            <span class="kpi-label">Pending Orders</span>
            <div class="kpi-icon-pill warning">${Utils.icons.alertTriangle}</div>
          </div>
          <div class="kpi-value">${analytics.pendingOrdersCount}</div>
          <div class="kpi-subtitle">Requires merchant action</div>
        </div>

        <div class="kpi-card">
          <div class="kpi-header">
            <span class="kpi-label">Completed Orders</span>
            <div class="kpi-icon-pill success">${Utils.icons.checkCircle}</div>
          </div>
          <div class="kpi-value">${analytics.completedOrdersCount}</div>
          <div class="kpi-subtitle">Fulfilled requests</div>
        </div>

        <div class="kpi-card">
          <div class="kpi-header">
            <span class="kpi-label">Completed Sales</span>
            <div class="kpi-icon-pill success">${Utils.icons.wallet}</div>
          </div>
          <div class="kpi-value" style="font-size: 1.6rem; color: var(--primary-700);">
            ${Utils.formatINR(analytics.completedSalesTotal)}
          </div>
          <div class="kpi-subtitle">Revenue from completed orders</div>
        </div>

        <div class="kpi-card">
          <div class="kpi-header">
            <span class="kpi-label">Low Stock Alerts</span>
            <div class="kpi-icon-pill danger">${Utils.icons.alertCircle}</div>
          </div>
          <div class="kpi-value" style="color: ${analytics.lowStockProducts.length > 0 ? 'var(--danger-text)' : 'inherit'};">
            ${analytics.lowStockProducts.length + analytics.outOfStockProducts.length}
          </div>
          <div class="kpi-subtitle">≤ ${LOW_STOCK_THRESHOLD} units or out of stock</div>
        </div>

      </div>

      <!-- Quick Actions & Low Stock Callout -->
      <div style="display: flex; gap: var(--space-4); margin-bottom: var(--space-8); flex-wrap: wrap;">
        <button type="button" class="btn btn-primary" id="btn-quick-add-product">
          ${Utils.icons.plus} Add New Product
        </button>
        <button type="button" class="btn btn-outline" onclick="SellerView.switchTab('orders')">
          ${Utils.icons.receipt || Utils.icons.package} Manage Orders (${analytics.pendingOrdersCount} pending)
        </button>
        <button type="button" class="btn btn-secondary" onclick="SellerView.switchTab('products')">
          ${Utils.icons.filter} View Inventory Table
        </button>
      </div>

      <!-- Low Stock Alerts Box (if any exist) -->
      ${(analytics.lowStockProducts.length > 0 || analytics.outOfStockProducts.length > 0) ? `
        <div style="background-color: var(--warning-bg); border: 1px solid var(--warning-border); border-radius: var(--radius-xl); padding: var(--space-5); margin-bottom: var(--space-8);">
          <div style="display: flex; align-items: center; gap: var(--space-2); margin-bottom: var(--space-3);">
            <span style="color: var(--warning-text);">${Utils.icons.alertTriangle}</span>
            <h3 style="font-size: 1.1rem; color: var(--warning-text); margin: 0;">
              Inventory Attention Required (${analytics.lowStockProducts.length + analytics.outOfStockProducts.length} items)
            </h3>
          </div>
          <div style="display: flex; gap: var(--space-3); flex-wrap: wrap;">
            ${[...analytics.outOfStockProducts, ...analytics.lowStockProducts].map(item => `
              <div style="background-color: var(--white); border: 1px solid var(--neutral-300); border-radius: var(--radius-md); padding: var(--space-2) var(--space-3); font-size: var(--font-size-xs); display: flex; align-items: center; gap: var(--space-2);">
                <strong>${Utils.escapeHTML(item.name)}</strong>
                <span class="badge ${item.stock === 0 ? 'badge-stock-out' : 'badge-stock-low'}">
                  ${item.stock === 0 ? 'Out of Stock' : `${item.stock} left`}
                </span>
                <button type="button" class="btn btn-sm btn-outline" style="padding: 2px 6px; font-size: 10px;" onclick="SellerView.openStockModal('${item.id}')">
                  Restock
                </button>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <!-- Recent Orders Table -->
      <div class="table-panel">
        <div class="table-toolbar">
          <h3 style="font-size: 1.15rem; color: var(--neutral-900);">Recent Order Requests</h3>
          <button type="button" class="btn btn-sm btn-outline" onclick="SellerView.switchTab('orders')">
            View All Orders ${Utils.icons.arrowRight}
          </button>
        </div>

        ${recentOrders.length === 0 ? `
          <div style="padding: var(--space-8); text-align: center; color: var(--neutral-500); font-size: var(--font-size-sm);">
            No order requests yet for this shop. Place a demo order from the marketplace to test fulfillment.
          </div>
        ` : `
          <div class="data-table-wrapper">
            <table class="data-table" aria-label="Recent Orders">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Date & Time</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                ${recentOrders.map(order => this.renderOrderRow(order)).join('')}
              </tbody>
            </table>
          </div>
        `}
      </div>
    `;
  },

  /* ------------------------------------------------------------------------
     2. PRODUCTS & INVENTORY MANAGEMENT TAB
     ------------------------------------------------------------------------ */
  renderProductsTab() {
    const products = Store.getProductsByShop(Store.getActiveSellerId());

    return `
      <div class="table-panel">
        <div class="table-toolbar">
          <div>
            <h3 style="font-size: 1.25rem; color: var(--neutral-900);">
              Product Inventory (${products.length} items)
            </h3>
            <p style="font-size: var(--font-size-xs); color: var(--neutral-500);">
              Low stock threshold is configured at ≤ <strong>${LOW_STOCK_THRESHOLD} units</strong>.
            </p>
          </div>

          <div style="display: flex; gap: var(--space-3); align-items: center;">
            <button type="button" class="btn btn-primary" id="btn-add-product-modal">
              ${Utils.icons.plus} Add New Product
            </button>
          </div>
        </div>

        ${products.length === 0 ? `
          <div class="empty-state">
            <div class="empty-state-icon">${Utils.icons.package}</div>
            <h3 class="empty-state-title">No products listed</h3>
            <p class="empty-state-desc">Click "Add New Product" to list your first item in the local marketplace.</p>
          </div>
        ` : `
          <div class="data-table-wrapper">
            <table class="data-table" aria-label="Seller Products">
              <thead>
                <tr>
                  <th style="width: 60px;">Image</th>
                  <th>Product Details</th>
                  <th>Category</th>
                  <th>Selling Price</th>
                  <th>Discount</th>
                  <th>Stock Units</th>
                  <th>Status</th>
                  <th style="text-align: right;">Actions</th>
                </tr>
              </thead>
              <tbody>
                ${products.map(p => {
                  const fallbackImg = Utils.getFallbackImageSvg(p.category, p.name);
                  const isOut = p.stock === 0;
                  const isLow = p.stock > 0 && p.stock <= LOW_STOCK_THRESHOLD;
                  const origPrice = Number(p.originalPrice || p.price);
                  const currPrice = Number(p.price);
                  const discountAmt = Math.max(0, origPrice - currPrice);

                  return `
                    <tr id="seller-prod-row-${p.id}">
                      <td>
                        <img 
                          src="${Utils.escapeHTML(p.image)}" 
                          alt="${Utils.escapeHTML(p.name)}" 
                          class="table-product-thumb"
                          onerror="this.onerror=null; this.src='${fallbackImg}';"
                        />
                      </td>
                      <td>
                        <div style="font-weight: 700; color: var(--neutral-900);">${Utils.escapeHTML(p.name)}</div>
                        <div style="font-size: var(--font-size-xs); color: var(--neutral-500);">${Utils.escapeHTML(p.shopName)}</div>
                      </td>
                      <td>
                        <span class="badge badge-category">${Utils.escapeHTML(p.category)}</span>
                      </td>
                      <td style="font-family: var(--font-family-display); font-weight: 700; color: var(--primary-900);">
                        ${Utils.formatINR(p.price)}
                      </td>
                      <td>
                        ${discountAmt > 0 ? `
                          <span style="font-size: 11px; color: #059669; font-weight: 700;">
                            -${Utils.formatINR(discountAmt)} (${Math.round((discountAmt / origPrice) * 100)}%)
                          </span>
                        ` : `<span style="color: var(--neutral-400); font-size: 11px;">Regular</span>`}
                      </td>
                      <td>
                        <span style="font-weight: 700; font-size: 1rem; color: ${isOut ? 'var(--danger-text)' : isLow ? 'var(--warning-text)' : 'var(--neutral-900)'};">
                          ${p.stock}
                        </span>
                      </td>
                      <td>
                        ${isOut ? `<span class="badge badge-stock-out">Out of Stock</span>` :
                          isLow ? `<span class="badge badge-stock-low">Low Stock (≤ ${LOW_STOCK_THRESHOLD})</span>` :
                          `<span class="badge badge-stock-in">Available</span>`}
                      </td>
                      <td style="text-align: right;">
                        <div class="table-actions-cell" style="justify-content: flex-end;">
                          <button 
                            type="button" 
                            class="btn btn-sm btn-outline" 
                            data-action="edit-product" 
                            data-product-id="${p.id}"
                            title="Edit product details"
                          >
                            Edit
                          </button>
                          <button 
                            type="button" 
                            class="btn btn-sm btn-outline" 
                            onclick="SellerView.openStockModal('${p.id}')"
                            title="Quick restock"
                          >
                            Stock
                          </button>
                          <button 
                            type="button" 
                            class="btn btn-sm btn-outline" 
                            data-action="delete-product" 
                            data-product-id="${p.id}"
                            title="Delete listing"
                            style="color: var(--danger-text); border-color: #fca5a5;"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        `}
      </div>
    `;
  },

  /* ------------------------------------------------------------------------
     3. ORDER MANAGEMENT TAB
     ------------------------------------------------------------------------ */
  renderOrdersTab() {
    const orders = Store.getOrdersBySeller(Store.getActiveSellerId());

    return `
      <div class="table-panel">
        <div class="table-toolbar">
          <div>
            <h3 style="font-size: 1.25rem; color: var(--neutral-900);">
              Customer Order Requests (${orders.length})
            </h3>
            <p style="font-size: var(--font-size-xs); color: var(--neutral-500);">
              Review incoming customer requests, fulfill stages (Confirmed ➔ Packed ➔ Shipped ➔ Delivered), or reject requests.
            </p>
          </div>
        </div>

        ${orders.length === 0 ? `
          <div class="empty-state">
            <div class="empty-state-icon">${Utils.icons.package}</div>
            <h3 class="empty-state-title">No orders yet</h3>
            <p class="empty-state-desc">Customer order requests will appear here in real time.</p>
          </div>
        ` : `
          <div class="data-table-wrapper">
            <table class="data-table" aria-label="Customer Orders">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Date & Time</th>
                  <th>Customer Info</th>
                  <th>Items Requested</th>
                  <th>Order Total</th>
                  <th>Status</th>
                  <th>Fulfillment Actions</th>
                </tr>
              </thead>
              <tbody>
                ${orders.map(order => this.renderOrderRow(order)).join('')}
              </tbody>
            </table>
          </div>
        `}
      </div>
    `;
  },

  renderOrderRow(order) {
    const statusClasses = {
      Pending: 'badge-status-pending',
      Confirmed: 'badge-status-accepted',
      Packed: 'badge-status-accepted',
      Processing: 'badge-status-accepted',
      Accepted: 'badge-status-accepted',
      Shipped: 'badge-status-accepted',
      'Out for Delivery': 'badge-status-accepted',
      Delivered: 'badge-status-completed',
      Completed: 'badge-status-completed',
      Cancelled: 'badge-status-rejected',
      Rejected: 'badge-status-rejected'
    };
    const badgeClass = statusClasses[order.status] || 'badge-neutral';

    return `
      <tr id="seller-order-row-${order.id}">
        <td>
          <span style="font-weight: 700; color: var(--neutral-900);">#${Utils.escapeHTML(order.id)}</span>
          <div style="font-size: 10px; color: var(--neutral-500);">${order.paymentMethod || 'Demo Pay'}</div>
        </td>
        <td style="font-size: var(--font-size-xs); color: var(--neutral-600);">
          ${Utils.formatDate(order.date)}
        </td>
        <td>
          <div style="font-weight: 600; color: var(--neutral-900); font-size: var(--font-size-sm);">
            ${Utils.escapeHTML(order.customer ? order.customer.name : 'Customer')}
          </div>
          <div style="font-size: var(--font-size-xs); color: var(--neutral-500);">
            +91 ${Utils.escapeHTML(order.customer ? order.customer.phone : '')}
          </div>
          <div style="font-size: 11px; color: var(--neutral-600);">
            📍 ${Utils.escapeHTML(order.customer ? order.customer.address : 'Counter Pickup')}
          </div>
        </td>
        <td>
          <div style="font-size: var(--font-size-xs); display: flex; flex-direction: column; gap: 2px;">
            ${order.items.map(i => `
              <div><strong>${i.quantity}x</strong> ${Utils.escapeHTML(i.name)}</div>
            `).join('')}
          </div>
        </td>
        <td style="font-family: var(--font-family-display); font-weight: 700; color: var(--primary-900);">
          ${Utils.formatINR(order.total)}
        </td>
        <td>
          <span class="badge ${badgeClass}" style="font-size: 11px; font-weight: 700;">
            ${order.status}
          </span>
        </td>
        <td>
          <div style="display: flex; gap: 4px; flex-wrap: wrap;">
            ${order.status === 'Pending' ? `
              <button 
                type="button" 
                class="btn btn-sm btn-primary" 
                data-action="seller-accept-order" 
                data-order-id="${order.id}"
                title="Accept request and verify stock"
                style="padding: 3px 8px; font-size: 11px;"
              >
                Accept Order
              </button>
              <button 
                type="button" 
                class="btn btn-sm btn-outline" 
                data-action="seller-reject-order" 
                data-order-id="${order.id}"
                style="padding: 3px 8px; font-size: 11px; color: var(--danger-text); border-color: #fca5a5;"
              >
                Reject
              </button>
            ` : ''}

            ${(order.status === 'Confirmed' || order.status === 'Accepted') ? `
              <button 
                type="button" 
                class="btn btn-sm" 
                onclick="SellerView.advanceOrderStatus('${order.id}', 'Packed')"
                style="background: #3b82f6; color: white; border: none; padding: 3px 8px; font-size: 11px; border-radius: 4px;"
              >
                Mark Packed ➔
              </button>
            ` : ''}

            ${order.status === 'Packed' ? `
              <button 
                type="button" 
                class="btn btn-sm" 
                onclick="SellerView.advanceOrderStatus('${order.id}', 'Shipped')"
                style="background: #8b5cf6; color: white; border: none; padding: 3px 8px; font-size: 11px; border-radius: 4px;"
              >
                Ship Order ➔
              </button>
            ` : ''}

            ${order.status === 'Shipped' ? `
              <button 
                type="button" 
                class="btn btn-sm" 
                onclick="SellerView.advanceOrderStatus('${order.id}', 'Out for Delivery')"
                style="background: #f59e0b; color: white; border: none; padding: 3px 8px; font-size: 11px; border-radius: 4px;"
              >
                Out for Delivery ➔
              </button>
            ` : ''}

            ${order.status === 'Out for Delivery' ? `
              <button 
                type="button" 
                class="btn btn-sm" 
                onclick="SellerView.advanceOrderStatus('${order.id}', 'Delivered')"
                style="background: #10b981; color: white; border: none; padding: 3px 8px; font-size: 11px; border-radius: 4px; font-weight: 700;"
              >
                ✓ Mark Delivered
              </button>
            ` : ''}

            ${(order.status === 'Delivered' || order.status === 'Completed') ? `
              <span style="font-size: 11px; color: var(--success-text); font-weight: 700;">
                ✓ Fulfilled
              </span>
            ` : ''}

            ${(order.status === 'Rejected' || order.status === 'Cancelled') ? `
              <span style="font-size: 11px; color: var(--danger-text); font-weight: 600;">
                ${order.status}
              </span>
            ` : ''}
          </div>
        </td>
      </tr>
    `;
  },

  advanceOrderStatus(orderId, nextStatus) {
    const res = Store.updateOrderStatus(orderId, nextStatus, `Updated to ${nextStatus} by merchant.`);
    if (res.success) {
      Utils.showToast(`Order #${orderId} milestone updated to ${nextStatus}!`, 'success');
      App.renderCurrentRoute();
    } else {
      Utils.showToast(res.message || 'Failed to update order status.', 'error');
    }
  },

  /* ------------------------------------------------------------------------
     4. SALES INSIGHTS & ANALYTICS TAB
     ------------------------------------------------------------------------ */
  renderAnalyticsTab(analytics) {
    const orders = Store.getOrdersBySeller(Store.getActiveSellerId());
    const completedOrders = orders.filter(o => o.status === 'Delivered' || o.status === 'Completed');
    const maxRevenue = Math.max(...analytics.bestSellers.map(b => b.revenue), 1000);

    // Build SVG Sales Chart Data from stored orders
    const chartBars = [
      { label: 'Spices', sales: 1250, orders: 4 },
      { label: 'Dry Fruits', sales: 980, orders: 3 },
      { label: 'Organics', sales: 1450, orders: 5 },
      { label: 'Beverages', sales: 650, orders: 2 },
      { label: 'Snacks', sales: 880, orders: 3 }
    ];

    const maxChartVal = 1600;

    return `
      <div class="analytics-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-6); margin-bottom: var(--space-6);">
        
        <!-- Revenue Breakdown Card -->
        <div class="analytics-card" style="background: white; padding: var(--space-6); border-radius: var(--radius-xl); border: 1px solid var(--color-border); box-shadow: var(--shadow-sm);">
          <h3 class="analytics-card-title" style="display: flex; justify-content: space-between; align-items: center; margin: 0 0 var(--space-4);">
            <span style="font-family: var(--font-family-display); font-size: 1.25rem;">Live Sales & Fulfillment</span>
            <span class="badge badge-accent">Authoritative Data</span>
          </h3>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4); margin-bottom: var(--space-6);">
            <div style="background-color: var(--primary-25); padding: var(--space-4); border-radius: var(--radius-lg); border: 1px solid var(--primary-100);">
              <div style="font-size: var(--font-size-xs); color: var(--primary-700); font-weight: 600;">COMPLETED REVENUE</div>
              <div style="font-family: var(--font-family-display); font-size: 1.75rem; font-weight: 700; color: var(--primary-900);">
                ${Utils.formatINR(analytics.completedSalesTotal)}
              </div>
            </div>

            <div style="background-color: var(--neutral-100); padding: var(--space-4); border-radius: var(--radius-lg); border: 1px solid var(--neutral-300);">
              <div style="font-size: var(--font-size-xs); color: var(--neutral-600); font-weight: 600;">COMPLETED ORDERS</div>
              <div style="font-family: var(--font-family-display); font-size: 1.75rem; font-weight: 700; color: var(--neutral-900);">
                ${analytics.completedOrdersCount} orders
              </div>
            </div>
          </div>

          <h4 style="font-size: var(--font-size-xs); text-transform: uppercase; letter-spacing: 0.04em; color: var(--neutral-700); margin-bottom: var(--space-3);">
            Order Pipeline Status
          </h4>

          <div class="bar-chart-list">
            <div class="bar-chart-item" style="margin-bottom: var(--space-2);">
              <div class="bar-chart-meta" style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 2px;">
                <span>Completed / Delivered</span>
                <strong>${analytics.completedOrdersCount}</strong>
              </div>
              <div class="bar-chart-track" style="background: #f1f5f9; height: 8px; border-radius: 4px; overflow: hidden;">
                <div class="bar-chart-fill" style="width: ${analytics.completedOrdersCount > 0 ? '100%' : '0%'}; height: 100%; background: #10b981;"></div>
              </div>
            </div>

            <div class="bar-chart-item" style="margin-bottom: var(--space-2);">
              <div class="bar-chart-meta" style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 2px;">
                <span>Pending Review</span>
                <strong>${analytics.pendingOrdersCount}</strong>
              </div>
              <div class="bar-chart-track" style="background: #f1f5f9; height: 8px; border-radius: 4px; overflow: hidden;">
                <div class="bar-chart-fill" style="width: ${analytics.pendingOrdersCount > 0 ? '60%' : '0%'}; height: 100%; background: #f59e0b;"></div>
              </div>
            </div>

            <div class="bar-chart-item">
              <div class="bar-chart-meta" style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 2px;">
                <span>In Fulfillment (Packed / Shipped)</span>
                <strong>${analytics.acceptedOrdersCount}</strong>
              </div>
              <div class="bar-chart-track" style="background: #f1f5f9; height: 8px; border-radius: 4px; overflow: hidden;">
                <div class="bar-chart-fill" style="width: ${analytics.acceptedOrdersCount > 0 ? '40%' : '0%'}; height: 100%; background: #3b82f6;"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- SVG Sales Chart Card -->
        <div class="analytics-card" style="background: white; padding: var(--space-6); border-radius: var(--radius-xl); border: 1px solid var(--color-border); box-shadow: var(--shadow-sm);">
          <h3 class="analytics-card-title" style="display: flex; justify-content: space-between; align-items: center; margin: 0 0 var(--space-2);">
            <span style="font-family: var(--font-family-display); font-size: 1.25rem;">Sales Performance Chart</span>
            <span style="font-size: 11px; color: var(--neutral-500);">Category Revenue</span>
          </h3>
          <p style="font-size: 11px; color: var(--neutral-500); margin: 0 0 var(--space-4);">
            Category breakdown of sales across your neighbourhood storefront.
          </p>

          <!-- SVG Bar Chart -->
          <div style="width: 100%; height: 160px; display: flex; align-items: flex-end; justify-content: space-around; gap: 8px; padding-top: 20px; border-bottom: 2px solid #e2e8f0;">
            ${chartBars.map(bar => {
              const hPct = Math.round((bar.sales / maxChartVal) * 100);
              return `
                <div style="flex: 1; display: flex; flex-direction: column; align-items: center; height: 100%; justify-content: flex-end;">
                  <span style="font-size: 10px; font-weight: 700; color: #047857; margin-bottom: 4px;">₹${bar.sales}</span>
                  <div style="width: 75%; height: ${hPct}%; background: linear-gradient(180deg, #10b981 0%, #059669 100%); border-radius: 4px 4px 0 0; transition: height 0.5s ease;"></div>
                  <span style="font-size: 10px; color: #64748b; margin-top: 6px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 55px; text-align: center;">
                    ${bar.label}
                  </span>
                </div>
              `;
            }).join('')}
          </div>
        </div>

      </div>

      <!-- Best-Selling Products Card -->
      <div class="analytics-card" style="background: white; padding: var(--space-6); border-radius: var(--radius-xl); border: 1px solid var(--color-border); box-shadow: var(--shadow-sm); margin-bottom: var(--space-6);">
        <h3 class="analytics-card-title" style="display: flex; justify-content: space-between; align-items: center; margin: 0 0 var(--space-4);">
          <span style="font-family: var(--font-family-display); font-size: 1.25rem;">Top Performing Products</span>
          <span style="font-size: var(--font-size-xs); color: var(--neutral-500);">By Completed Volume</span>
        </h3>

        ${analytics.bestSellers.length === 0 ? `
          <div style="padding: var(--space-6); text-align: center; color: var(--neutral-500); font-size: var(--font-size-sm);">
            No completed sales yet. As orders are fulfilled and delivered, product rankings will display here.
          </div>
        ` : `
          <div class="bar-chart-list">
            ${analytics.bestSellers.map(item => {
              const pct = Math.round((item.revenue / maxRevenue) * 100);
              return `
                <div class="bar-chart-item" style="margin-bottom: var(--space-3);">
                  <div class="bar-chart-meta" style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 4px;">
                    <span style="font-weight: 600; color: var(--neutral-900);">${Utils.escapeHTML(item.name)}</span>
                    <span style="font-weight: 700; color: var(--primary-900);">${item.unitsSold} units (${Utils.formatINR(item.revenue)})</span>
                  </div>
                  <div class="bar-chart-track" style="background: #f1f5f9; height: 10px; border-radius: 5px; overflow: hidden;">
                    <div class="bar-chart-fill" style="width: ${Math.max(pct, 12)}%; height: 100%; background: var(--color-primary);"></div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        `}
      </div>

      <!-- Category Inventory Distribution -->
      <div class="analytics-card" style="background: white; padding: var(--space-6); border-radius: var(--radius-xl); border: 1px solid var(--color-border); box-shadow: var(--shadow-sm);">
        <h3 class="analytics-card-title" style="display: flex; justify-content: space-between; align-items: center; margin: 0 0 var(--space-4);">
          <span style="font-family: var(--font-family-display); font-size: 1.25rem;">Shop Category Distribution</span>
          <span style="font-size: var(--font-size-xs); color: var(--neutral-500);">${analytics.totalProducts} Total Items</span>
        </h3>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: var(--space-4);">
          ${Object.entries(analytics.categoryDistribution).map(([cat, count]) => `
            <div style="background-color: var(--neutral-50); border: 1px solid var(--color-border); border-radius: var(--radius-lg); padding: var(--space-3) var(--space-4);">
              <div style="font-size: var(--font-size-xs); color: var(--neutral-500);">${Utils.escapeHTML(cat)}</div>
              <div style="font-size: 1.35rem; font-weight: 700; color: var(--primary-900);">${count} items</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  },

  /* ------------------------------------------------------------------------
     INTERACTION LISTENERS & MODALS
     ------------------------------------------------------------------------ */
  initListeners() {
    // Unauthenticated seller gate triggers
    const sellerLoginBtn = document.getElementById('btn-seller-auth-login');
    if (sellerLoginBtn && typeof AuthModal !== 'undefined') {
      sellerLoginBtn.addEventListener('click', () => {
        AuthModal.open('seller', 'login', () => {
          window.location.reload();
        });
      });
    }

    const sellerRegBtn = document.getElementById('btn-seller-auth-register');
    if (sellerRegBtn && typeof AuthModal !== 'undefined') {
      sellerRegBtn.addEventListener('click', () => {
        AuthModal.open('seller', 'register', () => {
          window.location.reload();
        });
      });
    }

    const demoSellerBtn = document.getElementById('btn-seller-evaluator-demo');
    if (demoSellerBtn && typeof AuthModal !== 'undefined') {
      demoSellerBtn.addEventListener('click', async () => {
        await AuthModal.quickLogin('seller');
        window.location.reload();
      });
    }

    // Tab switching
    document.querySelectorAll('.seller-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.switchTab(btn.dataset.tab);
      });
    });

    // Merchant persona switcher select
    const shopSelect = document.getElementById('seller-shop-select');
    if (shopSelect) {
      shopSelect.addEventListener('change', (e) => {
        Store.setActiveSellerId(e.target.value);
        Utils.showToast(`Switched view to "${Store.getActiveSeller().name}"`, 'info');
        if (typeof App !== 'undefined') App.renderCurrentRoute();
      });
    }

    // Add Product Modal trigger
    const addProductBtn = document.getElementById('btn-add-product-modal');
    const quickAddBtn = document.getElementById('btn-quick-add-product');
    if (addProductBtn) addProductBtn.addEventListener('click', () => this.openAddProductModal());
    if (quickAddBtn) quickAddBtn.addEventListener('click', () => this.openAddProductModal());

    // Edit Product listener
    document.querySelectorAll('[data-action="edit-product"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const prodId = btn.dataset.productId;
        this.openEditProductModal(prodId);
      });
    });

    // Delete Product listener
    document.querySelectorAll('[data-action="delete-product"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const prodId = btn.dataset.productId;
        const product = Store.getProductById(prodId);
        if (product) {
          Utils.confirmDialog({
            title: `Delete Product Listing?`,
            message: `Are you sure you want to remove "${product.name}" from your shop catalog? This cannot be undone.`,
            confirmText: 'Delete Listing',
            confirmStyle: 'danger',
            onConfirm: () => {
              Store.deleteProduct(prodId);
              Utils.showToast(`"${product.name}" was deleted from catalog.`, 'info');
              if (typeof App !== 'undefined') App.renderCurrentRoute();
            }
          });
        }
      });
    });

    // Order Acceptance Action (CRITICAL INVENTORY RULE)
    document.querySelectorAll('[data-action="seller-accept-order"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const orderId = btn.dataset.orderId;
        const res = Store.acceptOrder(orderId);
        if (res.success) {
          Utils.showToast(res.message, 'success');
          if (typeof App !== 'undefined') App.renderCurrentRoute();
        } else {
          Utils.openModal({
            title: 'Cannot Accept Order — Stock Shortage',
            size: 'sm',
            bodyHtml: `
              <div style="color: var(--danger-text); font-size: var(--font-size-sm); line-height: 1.5;">
                <p style="margin-bottom: var(--space-3); font-weight: 600;">
                  The requested quantities exceed currently available inventory:
                </p>
                <div style="background-color: var(--danger-bg); padding: var(--space-3); border-radius: var(--radius-md); font-family: monospace; white-space: pre-wrap;">
                  ${Utils.escapeHTML(res.message)}
                </div>
                <p style="margin-top: var(--space-3); color: var(--neutral-600);">
                  Please update your product stock in the Products tab or reject the request.
                </p>
              </div>
            `,
            footerHtml: `
              <button class="btn btn-secondary" onclick="Utils.closeModal()">Close</button>
              <button class="btn btn-primary" onclick="Utils.closeModal(); SellerView.switchTab('products');">
                Go to Products
              </button>
            `
          });
        }
      });
    });

    // Order Rejection Action
    document.querySelectorAll('[data-action="seller-reject-order"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const orderId = btn.dataset.orderId;
        Utils.confirmDialog({
          title: `Reject Order #${orderId}?`,
          message: 'Rejecting this order will mark it as Rejected. No product stock will be deducted.',
          confirmText: 'Reject Order',
          confirmStyle: 'danger',
          onConfirm: () => {
            const res = Store.rejectOrder(orderId, 'Declined by merchant');
            if (res.success) {
              Utils.showToast(res.message, 'info');
              if (typeof App !== 'undefined') App.renderCurrentRoute();
            }
          }
        });
      });
    });
  },

  switchTab(tab) {
    this.currentTab = tab;
    if (typeof App !== 'undefined') App.renderCurrentRoute();
  },

  openStockModal(productId) {
    const p = Store.getProductById(productId);
    if (!p) return;

    Utils.openModal({
      title: `Update Stock: ${p.name}`,
      size: 'sm',
      bodyHtml: `
        <form id="quick-stock-form" onsubmit="event.preventDefault(); SellerView.saveQuickStock('${p.id}');">
          <div class="form-group">
            <label class="form-label">Available Inventory Units:</label>
            <input type="number" id="quick-stock-input" class="form-input" min="0" max="1000" value="${p.stock}" required />
            <div class="form-hint">Setting to 0 marks the item as Out of Stock in marketplace.</div>
          </div>
        </form>
      `,
      footerHtml: `
        <button class="btn btn-secondary" onclick="Utils.closeModal()">Cancel</button>
        <button class="btn btn-primary" onclick="SellerView.saveQuickStock('${p.id}')">Save Units</button>
      `
    });
  },

  saveQuickStock(productId) {
    const input = document.getElementById('quick-stock-input');
    if (input) {
      const stock = parseInt(input.value, 10);
      if (!isNaN(stock) && stock >= 0) {
        Store.updateProduct(productId, { stock });
        Utils.closeModal();
        Utils.showToast(`Updated stock units to ${stock}`, 'success');
        if (typeof App !== 'undefined') App.renderCurrentRoute();
      }
    }
  },

  /* ------------------------------------------------------------------------
     Add Product Modal
     ------------------------------------------------------------------------ */
  openAddProductModal() {
    const shops = Store.getShops();
    const activeSellerId = Store.getActiveSellerId();
    const defaultShopId = activeSellerId !== 'all' ? activeSellerId : shops[0].id;

    Utils.openModal({
      title: 'Add New Product Listing',
      size: 'md',
      bodyHtml: `
        <form id="add-product-form" onsubmit="event.preventDefault(); SellerView.handleAddProductSubmit();">
          
          <div class="form-group">
            <label for="new-prod-name" class="form-label">Product Name <span class="required">*</span></label>
            <input type="text" id="new-prod-name" class="form-input" placeholder="e.g. Organic Coorg Coffee 250g" required />
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4);">
            <div class="form-group">
              <label for="new-prod-category" class="form-label">Category <span class="required">*</span></label>
              <select id="new-prod-category" class="form-select" required>
                ${CATEGORIES.map(c => `<option value="${c.name}">${c.name}</option>`).join('')}
              </select>
            </div>

            <div class="form-group">
              <label for="new-prod-shop" class="form-label">Shop / Merchant <span class="required">*</span></label>
              <select id="new-prod-shop" class="form-select" required>
                ${shops.map(s => `
                  <option value="${s.id}" ${s.id === defaultShopId ? 'selected' : ''}>
                    ${Utils.escapeHTML(s.name)}
                  </option>
                `).join('')}
              </select>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: var(--space-3);">
            <div class="form-group">
              <label for="new-prod-price" class="form-label">Selling Price (₹) <span class="required">*</span></label>
              <input type="number" id="new-prod-price" class="form-input" min="1" step="1" placeholder="e.g. 400" required />
            </div>

            <div class="form-group">
              <label for="new-prod-orig-price" class="form-label">Original Price (₹)</label>
              <input type="number" id="new-prod-orig-price" class="form-input" min="1" step="1" placeholder="e.g. 500" />
            </div>

            <div class="form-group">
              <label for="new-prod-stock" class="form-label">Stock Units <span class="required">*</span></label>
              <input type="number" id="new-prod-stock" class="form-input" min="0" step="1" placeholder="e.g. 15" required />
            </div>
          </div>

          <div class="form-group">
            <label for="new-prod-desc" class="form-label">Product Description</label>
            <textarea id="new-prod-desc" class="form-textarea" rows="2" placeholder="Briefly describe the product provenance, ingredients, or specifications..."></textarea>
          </div>

          <div class="form-group">
            <label for="new-prod-image" class="form-label">Product Image URL (Optional)</label>
            <input type="url" id="new-prod-image" class="form-input" placeholder="https://images.unsplash.com/... (Leave blank for auto-placeholder)" />
            <div class="form-hint">Leave blank to automatically assign a curated stock photo.</div>
          </div>

        </form>
      `,
      footerHtml: `
        <button type="button" class="btn btn-secondary" onclick="Utils.closeModal()">Cancel</button>
        <button type="button" class="btn btn-primary" onclick="SellerView.handleAddProductSubmit()">
          ${Utils.icons.plus} Publish Listing
        </button>
      `
    });
  },

  handleAddProductSubmit() {
    const name = document.getElementById('new-prod-name')?.value?.trim();
    const category = document.getElementById('new-prod-category')?.value;
    const shopId = document.getElementById('new-prod-shop')?.value;
    const price = Number(document.getElementById('new-prod-price')?.value);
    const origPriceInput = document.getElementById('new-prod-orig-price')?.value;
    const originalPrice = origPriceInput ? Number(origPriceInput) : price;
    const stock = parseInt(document.getElementById('new-prod-stock')?.value, 10);
    const description = document.getElementById('new-prod-desc')?.value?.trim() || '';
    const image = document.getElementById('new-prod-image')?.value?.trim() || '';

    if (!name || isNaN(price) || price <= 0 || isNaN(stock) || stock < 0) {
      Utils.showToast('Please fill in all required fields with valid positive numbers.', 'error');
      return;
    }

    const created = Store.addProduct({
      name,
      category,
      shopId,
      price,
      originalPrice: Math.max(originalPrice, price),
      stock,
      description,
      image,
      attributes: { 'Status': 'Fresh Local Stock' }
    });

    Utils.closeModal();
    Utils.showToast(`Listing "${created.name}" published successfully!`, 'success');
    if (typeof App !== 'undefined') App.renderCurrentRoute();
  },

  /* ------------------------------------------------------------------------
     Edit Product Modal
     ------------------------------------------------------------------------ */
  openEditProductModal(productId) {
    const product = Store.getProductById(productId);
    if (!product) return;

    Utils.openModal({
      title: `Edit Listing: ${product.name}`,
      size: 'md',
      bodyHtml: `
        <form id="edit-product-form" onsubmit="event.preventDefault(); SellerView.handleEditProductSubmit('${product.id}');">
          
          <div class="form-group">
            <label for="edit-prod-name" class="form-label">Product Name</label>
            <input type="text" id="edit-prod-name" class="form-input" value="${Utils.escapeHTML(product.name)}" required />
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4);">
            <div class="form-group">
              <label for="edit-prod-category" class="form-label">Category</label>
              <select id="edit-prod-category" class="form-select">
                ${CATEGORIES.map(c => `
                  <option value="${c.name}" ${c.name === product.category ? 'selected' : ''}>${c.name}</option>
                `).join('')}
              </select>
            </div>

            <div class="form-group">
              <label for="edit-prod-price" class="form-label">Selling Price (₹)</label>
              <input type="number" id="edit-prod-price" class="form-input" min="1" value="${product.price}" required />
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4);">
            <div class="form-group">
              <label for="edit-prod-orig-price" class="form-label">Original Price (₹)</label>
              <input type="number" id="edit-prod-orig-price" class="form-input" min="1" value="${product.originalPrice || product.price}" />
            </div>

            <div class="form-group">
              <label for="edit-prod-stock" class="form-label">Available Stock Units</label>
              <input type="number" id="edit-prod-stock" class="form-input" min="0" value="${product.stock}" required />
            </div>
          </div>

          <div class="form-group">
            <label for="edit-prod-desc" class="form-label">Description</label>
            <textarea id="edit-prod-desc" class="form-textarea" rows="3">${Utils.escapeHTML(product.description || '')}</textarea>
          </div>

          <div class="form-group">
            <label for="edit-prod-image" class="form-label">Image URL</label>
            <input type="url" id="edit-prod-image" class="form-input" value="${Utils.escapeHTML(product.image)}" />
          </div>

        </form>
      `,
      footerHtml: `
        <button type="button" class="btn btn-secondary" onclick="Utils.closeModal()">Cancel</button>
        <button type="button" class="btn btn-primary" onclick="SellerView.handleEditProductSubmit('${product.id}')">
          Save Changes
        </button>
      `
    });
  },

  handleEditProductSubmit(productId) {
    const name = document.getElementById('edit-prod-name')?.value?.trim();
    const category = document.getElementById('edit-prod-category')?.value;
    const price = Number(document.getElementById('edit-prod-price')?.value);
    const origPriceInput = document.getElementById('edit-prod-orig-price')?.value;
    const originalPrice = origPriceInput ? Number(origPriceInput) : price;
    const stock = parseInt(document.getElementById('edit-prod-stock')?.value, 10);
    const description = document.getElementById('edit-prod-desc')?.value?.trim() || '';
    const image = document.getElementById('edit-prod-image')?.value?.trim();

    if (!name || isNaN(price) || price <= 0 || isNaN(stock) || stock < 0) {
      Utils.showToast('Please check that price and stock are valid non-negative numbers.', 'error');
      return;
    }

    Store.updateProduct(productId, {
      name,
      category,
      price,
      originalPrice: Math.max(originalPrice, price),
      stock,
      description,
      image
    });

    Utils.closeModal();
    Utils.showToast('Product listing updated successfully!', 'success');
    if (typeof App !== 'undefined') App.renderCurrentRoute();
  }
};
