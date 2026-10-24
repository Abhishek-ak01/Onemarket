/**
 * LocalLoop - Customer Orders History & Fulfillment Tracking View
 * Displays customer order requests, preserved product snapshots,
 * 5-stage tracking progress, printable demo receipts/invoices,
 * and order cancellation with inventory restoration.
 */

const OrdersView = {
  // Rotating inspiring quotes supporting local businesses
  LOCAL_QUOTES: [
    "Thank you for supporting local businesses!",
    "Your order makes a difference to a local dream.",
    "Small businesses, big dreams — thank you for shopping local!",
    "Hyperlocal commerce keeps our neighbourhood vibrant and connected."
  ],

  getRandomQuote() {
    const idx = Math.floor(Math.random() * this.LOCAL_QUOTES.length);
    return this.LOCAL_QUOTES[idx];
  },

  render() {
    // Guest shopping protection: Prompt authentication if not logged in
    const isAuth = typeof Store.isAuthenticated === 'function' && Store.isAuthenticated();
    if (!isAuth) {
      return `
        <section class="orders-page" style="padding: var(--space-8) 0; min-height: 60vh;">
          <div class="container container-narrow">
            <div class="empty-state" style="background: white; border: 1px solid var(--color-border-subtle); border-radius: var(--radius-xl); padding: var(--space-8); box-shadow: var(--shadow-sm); text-align: center;">
              <div class="empty-state-icon" style="background: var(--primary-50); color: var(--color-primary); width: 64px; height: 64px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: var(--space-4);">
                ${Utils.icons.user || Utils.icons.lock || Utils.icons.package}
              </div>
              <h2 class="empty-state-title" style="font-family: var(--font-family-display); margin-bottom: var(--space-2);">Sign In to View Orders</h2>
              <p class="empty-state-desc" style="color: var(--neutral-600); max-width: 480px; margin: 0 auto var(--space-6);">
                Order history, live tracking, and receipts are private and associated with your registered OneMarket customer account.
              </p>
              <div style="display: flex; gap: var(--space-3); justify-content: center; flex-wrap: wrap;">
                <button type="button" class="btn btn-primary btn-lg" id="btn-orders-login">
                  ${Utils.icons.user || ''} Sign In to Account
                </button>
                <button type="button" class="btn btn-outline btn-lg" id="btn-orders-quick-demo">
                  ⚡ 1-Click Demo Customer
                </button>
              </div>
            </div>
          </div>
        </section>
      `;
    }

    const orders = Store.getOrders();
    const isJustOrdered = window.location.hash.includes('just_ordered=1');

    if (orders.length === 0) {
      return `
        <section class="orders-page" style="padding: var(--space-8) 0;">
          <div class="container container-narrow">
            <div class="empty-state" style="background: white; border: 1px solid var(--color-border-subtle); border-radius: var(--radius-xl); padding: var(--space-8); box-shadow: var(--shadow-sm); text-align: center;">
              <div class="empty-state-icon" style="background: var(--neutral-100); color: var(--neutral-500); width: 64px; height: 64px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: var(--space-4);">
                ${Utils.icons.package}
              </div>
              <h2 class="empty-state-title" style="font-family: var(--font-family-display); margin-bottom: var(--space-2);">No Orders Placed Yet</h2>
              <p class="empty-state-desc" style="color: var(--neutral-600); max-width: 460px; margin: 0 auto var(--space-6);">
                When you order from local neighbourhood merchants, your active orders, tracking timelines, and printable receipts will appear here.
              </p>
              <a href="#catalog" class="btn btn-primary btn-lg">
                Start Exploring Products
              </a>
            </div>
          </div>
        </section>
      `;
    }

    return `
      <section class="orders-page" style="padding: var(--space-8) 0;">
        <div class="container container-narrow">

          ${isJustOrdered ? `
            <div class="celebration-banner" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; border-radius: var(--radius-lg); padding: var(--space-6); margin-bottom: var(--space-6); box-shadow: var(--shadow-md); text-align: center; animation: pulse 1s ease-in-out;">
              <div style="font-size: 2.2rem; margin-bottom: var(--space-2);">🎉</div>
              <h2 style="font-family: var(--font-family-display); font-size: 1.5rem; margin-bottom: var(--space-1); color: white;">Order Placed Successfully!</h2>
              <p style="font-size: var(--font-size-base); opacity: 0.95; margin-bottom: var(--space-3); font-style: italic; max-width: 520px; margin-left: auto; margin-right: auto;">
                "${this.getRandomQuote()}"
              </p>
              <div style="display: inline-block; background: rgba(255,255,255,0.2); padding: 4px 14px; border-radius: 999px; font-size: var(--font-size-xs); font-weight: 600; letter-spacing: 0.05em;">
                DEMO TRANSACTION PROCESSED SAFELY IN DATABASE
              </div>
            </div>
          ` : ''}

          <div class="section-header" style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: var(--space-6); flex-wrap: wrap; gap: var(--space-4);">
            <div>
              <span class="badge badge-accent" style="margin-bottom: var(--space-2); display: inline-flex;">
                ${Utils.icons.receipt || ''} Customer Orders & Tracking
              </span>
              <h1 class="section-title" style="font-size: 2rem; margin: 0 0 var(--space-1);">My Order History</h1>
              <p class="section-subtitle" style="color: var(--neutral-600); margin: 0;">
                Track live fulfillment milestones and generate printable tax receipts for your neighbourhood orders.
              </p>
            </div>
            <a href="#catalog" class="btn btn-primary btn-sm">
              ${Utils.icons.plus || '+'} Shop More
            </a>
          </div>

          <div class="orders-list" style="display: flex; flex-direction: column; gap: var(--space-5);">
            ${orders.map(order => this.renderOrderCard(order)).join('')}
          </div>

        </div>
      </section>
    `;
  },

  renderOrderCard(order) {
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

    // Summary of shops involved
    const shopNames = Array.from(new Set(order.items.map(i => i.shopName || 'Local Merchant'))).join(', ');

    // 5-stage tracking progress computation
    const stages = [
      { key: 'confirmed', label: 'Confirmed' },
      { key: 'packed', label: 'Processing / Packed' },
      { key: 'shipped', label: 'Shipped' },
      { key: 'out_for_delivery', label: 'Out for Delivery' },
      { key: 'delivered', label: 'Delivered' }
    ];

    let currentStepIndex = 1;
    const s = (order.status || '').toLowerCase();
    if (s === 'delivered' || s === 'completed') {
      currentStepIndex = 5;
    } else if (s === 'out for delivery') {
      currentStepIndex = 4;
    } else if (s === 'shipped') {
      currentStepIndex = 3;
    } else if (s === 'packed' || s === 'processing' || s === 'accepted') {
      currentStepIndex = 2;
    } else if (s === 'cancelled' || s === 'rejected') {
      currentStepIndex = -1; // Cancelled state
    } else {
      currentStepIndex = 1; // Confirmed / Pending
    }

    const canCancel = (order.status === 'Pending' || order.status === 'Confirmed');

    return `
      <article class="order-card" id="order-${order.id}" style="background: white; border: 1px solid var(--color-border); border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); overflow: hidden; transition: transform 0.2s ease, box-shadow 0.2s ease;">

        <!-- Header -->
        <div class="order-card-header" style="background: var(--neutral-50); padding: var(--space-4) var(--space-5); border-bottom: 1px solid var(--color-border-subtle); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: var(--space-3);">
          <div style="display: flex; align-items: center; gap: var(--space-3);">
            <div style="width: 40px; height: 40px; border-radius: var(--radius-md); background-color: var(--primary-100); color: var(--color-primary); display: flex; align-items: center; justify-content: center; font-size: 1.2rem;">
              ${Utils.icons.receipt || Utils.icons.package}
            </div>
            <div>
              <div style="font-weight: 700; color: var(--neutral-900); font-size: 1.1rem; display: flex; align-items: center; gap: var(--space-2);">
                <span>Order #${Utils.escapeHTML(order.id)}</span>
                <span class="badge" style="font-size: 10px; background: #e0f2fe; color: #0369a1; border: 1px solid #bae6fd;">DEMO</span>
              </div>
              <div style="font-size: var(--font-size-xs); color: var(--neutral-500);">
                Placed on ${Utils.formatDate(order.date)} • Payment: <strong>${Utils.escapeHTML(order.paymentStatus || 'Demo Completed')}</strong> (${Utils.escapeHTML(order.paymentMethod || 'Demo Pay')})
              </div>
            </div>
          </div>

          <div style="display: flex; align-items: center; gap: var(--space-2);">
            <span class="badge ${badgeClass}" style="font-size: var(--font-size-xs); font-weight: 700; padding: 0.4rem 0.85rem; border-radius: 999px;">
              ${order.status === 'Cancelled' ? '✕' : '●'} ${order.status}
            </span>
          </div>
        </div>

        <!-- 5-Stage Tracking Bar -->
        ${currentStepIndex === -1 ? `
          <div style="background: #fef2f2; border-bottom: 1px solid #fee2e2; padding: var(--space-3) var(--space-5); color: #991b1b; font-size: var(--font-size-xs); display: flex; align-items: center; gap: var(--space-2);">
            <span style="font-weight: 700;">Order Cancelled:</span>
            <span>This order was cancelled and any reserved inventory has been safely restored to the local merchant's stock.</span>
          </div>
        ` : `
          <div class="order-tracking-bar" style="background: white; padding: var(--space-4) var(--space-5); border-bottom: 1px solid var(--color-border-subtle);">
            <div style="display: flex; justify-content: space-between; align-items: center; position: relative;">
              <!-- Connecting Line -->
              <div style="position: absolute; top: 12px; left: 5%; right: 5%; height: 3px; background: #e2e8f0; z-index: 1;"></div>
              <div style="position: absolute; top: 12px; left: 5%; width: ${Math.min(100, Math.max(0, (currentStepIndex - 1) * 25))}%; height: 3px; background: #10b981; z-index: 1; transition: width 0.3s ease;"></div>

              ${stages.map((st, idx) => {
                const stepNum = idx + 1;
                const isCompleted = stepNum <= currentStepIndex;
                const isCurrent = stepNum === currentStepIndex;
                return `
                  <div style="display: flex; flex-direction: column; align-items: center; position: relative; z-index: 2; width: 18%; text-align: center;">
                    <div style="width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; background: ${isCompleted ? '#10b981' : '#ffffff'}; color: ${isCompleted ? '#ffffff' : '#94a3b8'}; border: 2px solid ${isCompleted ? '#10b981' : '#cbd5e1'}; margin-bottom: 4px; box-shadow: ${isCurrent ? '0 0 0 4px rgba(16, 185, 129, 0.2)' : 'none'};">
                      ${isCompleted ? '✓' : stepNum}
                    </div>
                    <span style="font-size: 11px; font-weight: ${isCurrent ? '700' : '500'}; color: ${isCurrent ? '#0f172a' : (isCompleted ? '#10b981' : '#94a3b8')};">
                      ${st.label}
                    </span>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        `}

        <!-- Body -->
        <div class="order-card-body" style="padding: var(--space-5);">
          <div style="margin-bottom: var(--space-3); font-size: var(--font-size-sm); color: var(--neutral-700); display: flex; justify-content: space-between; flex-wrap: wrap; gap: var(--space-2);">
            <div><strong>Fulfilling Shop:</strong> ${Utils.escapeHTML(shopNames)}</div>
            <div><strong>Delivery Recipient:</strong> ${Utils.escapeHTML(order.customer ? order.customer.name : 'Customer')} (+91 ${Utils.escapeHTML(order.customer ? order.customer.phone : '')})</div>
          </div>

          <!-- Items with Preserved Product Images -->
          <div style="background-color: var(--neutral-50); border: 1px solid var(--color-border-subtle); border-radius: var(--radius-md); padding: var(--space-3); margin-bottom: var(--space-4); display: flex; flex-direction: column; gap: var(--space-2);">
            ${order.items.map(item => `
              <div style="display: flex; align-items: center; justify-content: space-between; gap: var(--space-3); font-size: var(--font-size-sm); padding: 4px 0;">
                <div style="display: flex; align-items: center; gap: var(--space-3); min-width: 0;">
                  <img 
                    src="${item.image || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=120&q=80'}" 
                    alt="${Utils.escapeHTML(item.name)}" 
                    style="width: 44px; height: 44px; object-fit: cover; border-radius: var(--radius-sm); border: 1px solid var(--color-border-subtle); flex-shrink: 0;"
                    onerror="this.src='https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=120&q=80';"
                  />
                  <div style="min-width: 0;">
                    <div style="font-weight: 600; color: var(--neutral-900); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                      ${Utils.escapeHTML(item.name)}
                    </div>
                    <div style="font-size: 11px; color: var(--neutral-500);">
                      ${item.quantity} × ${Utils.formatINR(item.price)} ${item.discount > 0 ? `<span style="color: #059669;">(Saved ${Utils.formatINR(item.discount)}/unit)</span>` : ''}
                    </div>
                  </div>
                </div>
                <div style="font-weight: 700; color: var(--neutral-900); white-space: nowrap;">
                  ${Utils.formatINR(item.price * item.quantity)}
                </div>
              </div>
            `).join('')}
          </div>

          <!-- Footer Row -->
          <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: var(--space-3); border-top: 1px solid var(--neutral-100); padding-top: var(--space-3);">
            <div>
              <span style="font-size: var(--font-size-xs); color: var(--neutral-500);">Total Order Value:</span>
              <div style="font-family: var(--font-family-display); font-size: 1.35rem; font-weight: 700; color: var(--primary-900);">
                ${Utils.formatINR(order.total)}
              </div>
            </div>

            <div style="display: flex; gap: var(--space-2); flex-wrap: wrap;">
              <button 
                type="button" 
                class="btn btn-outline btn-sm" 
                data-action="view-order-details" 
                data-order-id="${order.id}"
              >
                ${Utils.icons.clock || ''} Track Timeline
              </button>

              <button 
                type="button" 
                class="btn btn-primary btn-sm" 
                data-action="print-receipt" 
                data-order-id="${order.id}"
                style="background: #0f172a; border-color: #0f172a;"
              >
                ${Utils.icons.receipt || ''} Print Invoice
              </button>

              ${canCancel ? `
                <button 
                  type="button" 
                  class="btn btn-outline btn-sm" 
                  data-action="cancel-order" 
                  data-order-id="${order.id}"
                  style="color: var(--danger-text); border-color: #fca5a5;"
                >
                  Cancel Order
                </button>
              ` : ''}
            </div>
          </div>

        </div>

      </article>
    `;
  },

  initListeners() {
    // Unauthenticated prompt triggers
    const loginBtn = document.getElementById('btn-orders-login');
    if (loginBtn && typeof AuthModal !== 'undefined') {
      loginBtn.addEventListener('click', () => {
        AuthModal.open('customer', 'login', () => {
          window.location.reload();
        });
      });
    }

    const quickDemoBtn = document.getElementById('btn-orders-quick-demo');
    if (quickDemoBtn && typeof AuthModal !== 'undefined') {
      quickDemoBtn.addEventListener('click', async () => {
        await AuthModal.quickLogin('customer');
        window.location.reload();
      });
    }

    // View Details / Timeline Modal
    document.querySelectorAll('[data-action="view-order-details"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const orderId = btn.dataset.orderId;
        const order = Store.getOrderById(orderId);
        if (order) {
          this.showOrderDetailsModal(order);
        }
      });
    });

    // Print Demo Invoice Modal
    document.querySelectorAll('[data-action="print-receipt"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const orderId = btn.dataset.orderId;
        const order = Store.getOrderById(orderId);
        if (order) {
          this.showReceiptModal(order);
        }
      });
    });

    // Cancel Order Handler
    document.querySelectorAll('[data-action="cancel-order"]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const orderId = btn.dataset.orderId;
        if (!confirm(`Are you sure you want to cancel Order #${orderId}? Stock will be safely restored.`)) {
          return;
        }

        const res = Store.updateOrderStatus(orderId, 'Cancelled', 'Cancelled by customer.');
        if (res.success) {
          Utils.showNotification(`Order #${orderId} has been cancelled.`, 'info');
          // Re-render
          const appRoot = document.getElementById('app-root');
          if (appRoot) {
            appRoot.innerHTML = OrdersView.render();
            OrdersView.initListeners();
          }
        } else {
          Utils.showNotification(res.message || 'Failed to cancel order.', 'error');
        }
      });
    });
  },

  showOrderDetailsModal(order) {
    const statusClasses = {
      Pending: 'badge-status-pending',
      Confirmed: 'badge-status-accepted',
      Packed: 'badge-status-accepted',
      Shipped: 'badge-status-accepted',
      'Out for Delivery': 'badge-status-accepted',
      Delivered: 'badge-status-completed',
      Completed: 'badge-status-completed',
      Cancelled: 'badge-status-rejected'
    };

    Utils.openModal({
      title: `Order Tracking & Timeline #${order.id}`,
      size: 'md',
      bodyHtml: `
        <div>
          <!-- Status Banner -->
          <div style="display: flex; align-items: center; justify-content: space-between; padding: var(--space-3) var(--space-4); background-color: var(--neutral-100); border-radius: var(--radius-md); margin-bottom: var(--space-5);">
            <div>
              <div style="font-size: var(--font-size-xs); color: var(--neutral-500); font-weight: 600;">CURRENT FULFILLMENT STATUS</div>
              <span class="badge ${statusClasses[order.status] || 'badge-neutral'}" style="font-size: var(--font-size-sm); margin-top: 2px;">
                ${order.status}
              </span>
            </div>
            <div style="text-align: right; font-size: var(--font-size-xs); color: var(--neutral-600);">
              <div>Placed: ${Utils.formatDate(order.date)}</div>
              <div>Preference: <strong>${order.customer?.deliveryPreference === 'pickup' ? 'Self Pickup at Store' : 'Home Delivery'}</strong></div>
            </div>
          </div>

          <!-- Customer & Delivery Details -->
          <div style="margin-bottom: var(--space-5); background: var(--neutral-50); padding: var(--space-3) var(--space-4); border-radius: var(--radius-md); border: 1px solid var(--color-border-subtle);">
            <h4 style="font-size: var(--font-size-xs); text-transform: uppercase; letter-spacing: 0.04em; color: var(--neutral-600); margin-bottom: var(--space-2);">
              Recipient & Delivery Information
            </h4>
            <div style="font-size: var(--font-size-sm); line-height: 1.5; color: var(--neutral-800);">
              <div><strong>Name:</strong> ${Utils.escapeHTML(order.customer?.name || '')}</div>
              <div><strong>Phone:</strong> +91 ${Utils.escapeHTML(order.customer?.phone || '')}</div>
              <div><strong>Address:</strong> ${Utils.escapeHTML(order.customer?.address || 'Local neighbourhood address')}</div>
              ${order.customer?.notes ? `<div><strong>Delivery Notes:</strong> <em>${Utils.escapeHTML(order.customer.notes)}</em></div>` : ''}
            </div>
          </div>

          <!-- Ordered Items Table -->
          <div style="margin-bottom: var(--space-5);">
            <h4 style="font-size: var(--font-size-xs); text-transform: uppercase; letter-spacing: 0.04em; color: var(--neutral-600); margin-bottom: var(--space-2);">
              Preserved Order Items Snapshot
            </h4>
            <table class="specs-table" style="width: 100%;">
              <thead>
                <tr style="border-bottom: 2px solid var(--color-border); text-align: left; font-size: var(--font-size-xs); color: var(--neutral-500);">
                  <th style="padding: 6px 0;">Item</th>
                  <th style="padding: 6px 0; text-align: center;">Qty</th>
                  <th style="padding: 6px 0; text-align: right;">Unit Price</th>
                  <th style="padding: 6px 0; text-align: right;">Line Total</th>
                </tr>
              </thead>
              <tbody>
                ${order.items.map(item => `
                  <tr>
                    <td style="padding: 8px 0;">
                      <div style="display: flex; align-items: center; gap: 8px;">
                        <img src="${item.image || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=80&q=80'}" style="width: 32px; height: 32px; object-fit: cover; border-radius: 4px;" />
                        <div>
                          <div style="font-weight: 600; color: var(--neutral-900); font-size: 13px;">${Utils.escapeHTML(item.name)}</div>
                          <div style="font-size: 11px; color: var(--neutral-500);">${Utils.escapeHTML(item.shopName || '')}</div>
                        </div>
                      </div>
                    </td>
                    <td style="padding: 8px 0; text-align: center; font-weight: 600;">${item.quantity}</td>
                    <td style="padding: 8px 0; text-align: right;">${Utils.formatINR(item.price)}</td>
                    <td style="padding: 8px 0; text-align: right; font-weight: 700; color: var(--primary-900);">${Utils.formatINR(item.price * item.quantity)}</td>
                  </tr>
                `).join('')}
              </tbody>
              <tfoot>
                <tr style="border-top: 2px solid var(--color-border); font-size: var(--font-size-base);">
                  <td colspan="3" style="padding: 10px 0; font-weight: 700; color: var(--neutral-900);">Order Grand Total:</td>
                  <td style="padding: 10px 0; text-align: right; font-weight: 700; color: var(--primary-900); font-family: var(--font-family-display);">
                    ${Utils.formatINR(order.total)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          <!-- Status Timeline -->
          <div>
            <h4 style="font-size: var(--font-size-xs); text-transform: uppercase; letter-spacing: 0.04em; color: var(--neutral-600); margin-bottom: var(--space-3);">
              Milestone Timestamps & History
            </h4>
            <div style="display: flex; flex-direction: column; gap: var(--space-3); padding-left: var(--space-2); border-left: 2px solid #e2e8f0; margin-left: 8px;">
              ${(order.statusHistory && order.statusHistory.length > 0 ? order.statusHistory : [{ status: order.status, timestamp: order.date, note: 'Order placed by customer.' }]).map(hist => `
                <div style="position: relative; padding-left: var(--space-4);">
                  <span style="position: absolute; left: -11px; top: 3px; width: 10px; height: 10px; border-radius: 50%; background-color: var(--color-primary); border: 2px solid white;"></span>
                  <div style="font-size: var(--font-size-xs); font-weight: 700; color: var(--neutral-900);">${Utils.escapeHTML(hist.status)}</div>
                  <div style="font-size: 11px; color: var(--neutral-500);">${Utils.formatDate(hist.timestamp)}</div>
                  ${hist.note ? `<div style="font-size: 11px; color: var(--neutral-700); margin-top: 2px;">${Utils.escapeHTML(hist.note)}</div>` : ''}
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      `,
      footerHtml: `
        <button class="btn btn-secondary" onclick="Utils.closeModal()">Close</button>
        <button class="btn btn-primary" onclick="Utils.closeModal(); OrdersView.showReceiptModal(Store.getOrderById('${order.id}'));">
          View Printable Invoice
        </button>
      `
    });
  },

  showReceiptModal(order) {
    const subtotal = order.subtotal || order.items.reduce((s, i) => s + (i.price * i.quantity), 0);
    const deliveryFee = order.deliveryFee !== undefined ? order.deliveryFee : (subtotal >= 500 ? 0 : 40);
    const taxes = order.taxes !== undefined ? order.taxes : Math.round(subtotal * 0.05 * 100) / 100;
    const total = order.total || (subtotal + deliveryFee + taxes);

    Utils.openModal({
      title: `Tax Invoice / Demo Receipt #${order.id}`,
      size: 'lg',
      bodyHtml: `
        <div class="printable-invoice" id="printable-invoice-content" style="background: white; padding: var(--space-4); color: #0f172a; position: relative;">

          <!-- Watermark -->
          <div style="border: 2px dashed #94a3b8; background: #f8fafc; border-radius: var(--radius-md); padding: 8px 12px; text-align: center; margin-bottom: var(--space-5);">
            <strong style="color: #64748b; font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase;">
              ★ DEMO TRANSACTION — HACKATHON PROTOTYPE ONLY — NOT A TAX INVOICE FOR LEGAL COMMERCE ★
            </strong>
          </div>

          <!-- Invoice Header -->
          <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0f172a; padding-bottom: var(--space-4); margin-bottom: var(--space-4);">
            <div>
              <h2 style="font-family: var(--font-family-display); font-size: 1.6rem; color: #0f172a; margin: 0 0 4px;">OneMarket</h2>
              <div style="font-size: 12px; color: #64748b;">Hyperlocal Small Business Digital Platform</div>
              <div style="font-size: 12px; color: #64748b;">Koppikar Road, Hubballi, Karnataka 580020</div>
            </div>
            <div style="text-align: right;">
              <h3 style="font-family: var(--font-family-display); font-size: 1.25rem; color: #0f172a; margin: 0 0 4px;">ORDER RECEIPT</h3>
              <div style="font-size: 12px; font-weight: 700;">#${Utils.escapeHTML(order.id)}</div>
              <div style="font-size: 12px; color: #64748b;">Date: ${Utils.formatDate(order.date)}</div>
            </div>
          </div>

          <!-- Customer & Shop Details Grid -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4); margin-bottom: var(--space-4); font-size: 12px;">
            <div style="background: #f8fafc; padding: var(--space-3); border-radius: var(--radius-sm); border: 1px solid #e2e8f0;">
              <div style="font-weight: 700; color: #475569; text-transform: uppercase; margin-bottom: 4px;">Billed To / Delivery Recipient:</div>
              <div style="font-size: 14px; font-weight: 700; color: #0f172a;">${Utils.escapeHTML(order.customer?.name || 'Customer')}</div>
              <div>Phone: +91 ${Utils.escapeHTML(order.customer?.phone || '')}</div>
              <div>Address: ${Utils.escapeHTML(order.customer?.address || 'Self pickup at merchant shop')}</div>
            </div>
            <div style="background: #f8fafc; padding: var(--space-3); border-radius: var(--radius-sm); border: 1px solid #e2e8f0;">
              <div style="font-weight: 700; color: #475569; text-transform: uppercase; margin-bottom: 4px;">Payment & Fulfillment:</div>
              <div>Method: <strong>${Utils.escapeHTML(order.paymentMethod || 'Demo Pay')}</strong></div>
              <div>Payment Status: <strong style="color: #059669;">${Utils.escapeHTML(order.paymentStatus || 'Completed')}</strong></div>
              <div>Fulfillment: <strong>${order.customer?.deliveryPreference === 'pickup' ? 'Merchant Counter Pickup' : 'Hyperlocal Home Delivery'}</strong></div>
            </div>
          </div>

          <!-- Itemized Table -->
          <table style="width: 100%; border-collapse: collapse; margin-bottom: var(--space-4); font-size: 12px;">
            <thead>
              <tr style="background: #0f172a; color: white; text-align: left;">
                <th style="padding: 8px 10px;">Item Description</th>
                <th style="padding: 8px 10px; text-align: center;">Qty</th>
                <th style="padding: 8px 10px; text-align: right;">Unit Price</th>
                <th style="padding: 8px 10px; text-align: right;">Discount</th>
                <th style="padding: 8px 10px; text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${order.items.map((item, idx) => `
                <tr style="border-bottom: 1px solid #e2e8f0; background: ${idx % 2 === 0 ? '#ffffff' : '#f8fafc'};">
                  <td style="padding: 8px 10px;">
                    <div style="font-weight: 600; color: #0f172a;">${Utils.escapeHTML(item.name)}</div>
                    <div style="font-size: 11px; color: #64748b;">Merchant: ${Utils.escapeHTML(item.shopName || 'Local Shop')}</div>
                  </td>
                  <td style="padding: 8px 10px; text-align: center; font-weight: 600;">${item.quantity}</td>
                  <td style="padding: 8px 10px; text-align: right;">${Utils.formatINR(item.price)}</td>
                  <td style="padding: 8px 10px; text-align: right; color: #059669;">${item.discount > 0 ? Utils.formatINR(item.discount * item.quantity) : '—'}</td>
                  <td style="padding: 8px 10px; text-align: right; font-weight: 700; color: #0f172a;">${Utils.formatINR(item.price * item.quantity)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <!-- Financial Summary -->
          <div style="display: flex; justify-content: flex-end; margin-bottom: var(--space-4);">
            <div style="width: 260px; font-size: 13px;">
              <div style="display: flex; justify-content: space-between; padding: 3px 0; color: #475569;">
                <span>Subtotal:</span>
                <span style="font-weight: 600; color: #0f172a;">${Utils.formatINR(subtotal)}</span>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 3px 0; color: #475569;">
                <span>Delivery Charges:</span>
                <span style="font-weight: 600; color: #0f172a;">${deliveryFee === 0 ? '<span style="color: #059669;">FREE</span>' : Utils.formatINR(deliveryFee)}</span>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 3px 0; color: #475569;">
                <span>Estimated Local GST (5%):</span>
                <span style="font-weight: 600; color: #0f172a;">${Utils.formatINR(taxes)}</span>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 8px 0; border-top: 2px solid #0f172a; margin-top: 4px; font-size: 15px; font-weight: 700; color: #0f172a;">
                <span>Total Amount Paid:</span>
                <span style="font-family: var(--font-family-display); font-size: 1.15rem; color: #0f172a;">${Utils.formatINR(total)}</span>
              </div>
            </div>
          </div>

          <!-- Footer Note -->
          <div style="border-top: 1px solid #e2e8f0; padding-top: var(--space-3); text-align: center; font-size: 11px; color: #64748b;">
            Small businesses, big dreams — thank you for shopping local with OneMarket!
          </div>

        </div>
      `,
      footerHtml: `
        <button class="btn btn-secondary" onclick="Utils.closeModal()">Close</button>
        <button class="btn btn-primary" onclick="window.print()" style="background: #0f172a; border-color: #0f172a;">
          🖨️ Print / Save PDF
        </button>
      `
    });
  }
};
