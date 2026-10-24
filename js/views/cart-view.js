/**
 * LocalLoop - Shopping Cart & Multi-Step Checkout Flow
 * Implements full 5-step checkout:
 * Step 1: Cart Review
 * Step 2: Delivery Address
 * Step 3: Delivery Options & Schedule
 * Step 4: Demo Payment Methods
 * Step 5: Final Order Review & Confirmation
 */

const CartView = {
  currentStep: 1, // 1: Cart, 2: Address, 3: Delivery, 4: Payment, 5: Review
  checkoutData: {
    name: '',
    phone: '',
    address: '',
    city: 'Hubballi',
    pincode: '580020',
    deliveryPreference: 'delivery',
    deliveryInstructions: '',
    paymentMethod: 'Cash on Delivery (Demo)',
    paymentStatus: 'Pending'
  },

  render() {
    const currentUser = Store.getCurrentUser();
    if (currentUser) {
      if (!this.checkoutData.name && currentUser.name) this.checkoutData.name = currentUser.name;
      if (!this.checkoutData.phone && currentUser.phone) this.checkoutData.phone = (currentUser.phone || '').replace(/\D/g, '').slice(-10);
      if (!this.checkoutData.address && currentUser.address) this.checkoutData.address = currentUser.address;
      if (!this.checkoutData.pincode && currentUser.pincode) this.checkoutData.pincode = currentUser.pincode;
      if (currentUser.city) this.checkoutData.city = currentUser.city;
    }

    const cartSummary = Store.getCartSummary();
    const items = cartSummary.items;

    if (items.length === 0) {
      this.currentStep = 1;
      return `
        <section class="cart-page py-8">
          <div class="container container-narrow">
            <div class="empty-state text-center" style="padding: 48px 24px; background: #ffffff; border-radius: var(--radius-2xl); border: 1px solid var(--neutral-200);">
              <div class="empty-state-icon" style="font-size: 3.5rem; margin-bottom: 16px;">
                🛒
              </div>
              <h2 class="empty-state-title" style="font-size: 1.6rem; font-weight: 800; color: var(--neutral-900); margin-bottom: 8px;">
                Your Shopping Cart is Empty
              </h2>
              <p class="empty-state-desc text-muted" style="max-width: 460px; margin: 0 auto 24px; line-height: 1.5;">
                You haven't added any neighbourhood products to your cart yet. Explore local artisanal listings and support city merchants!
              </p>
              <a href="#catalog" class="btn btn-primary btn-lg">
                Explore Neighbourhood Products
              </a>
            </div>
          </div>
        </section>
      `;
    }

    return `
      <section class="cart-page py-6">
        <div class="container">
          
          <!-- Stepper Header -->
          <div class="checkout-stepper">
            <div class="step-node ${this.currentStep === 1 ? 'active' : ''} ${this.currentStep > 1 ? 'completed' : ''}" data-step="1">
              <span class="step-num">${this.currentStep > 1 ? '✓' : '1'}</span>
              <span class="step-title">1. Review Cart</span>
            </div>
            <div class="step-divider ${this.currentStep > 1 ? 'filled' : ''}"></div>

            <div class="step-node ${this.currentStep === 2 ? 'active' : ''} ${this.currentStep > 2 ? 'completed' : ''}" data-step="2">
              <span class="step-num">${this.currentStep > 2 ? '✓' : '2'}</span>
              <span class="step-title">2. Delivery Address</span>
            </div>
            <div class="step-divider ${this.currentStep > 2 ? 'filled' : ''}"></div>

            <div class="step-node ${this.currentStep === 3 ? 'active' : ''} ${this.currentStep > 3 ? 'completed' : ''}" data-step="3">
              <span class="step-num">${this.currentStep > 3 ? '✓' : '3'}</span>
              <span class="step-title">3. Delivery Options</span>
            </div>
            <div class="step-divider ${this.currentStep > 3 ? 'filled' : ''}"></div>

            <div class="step-node ${this.currentStep === 4 ? 'active' : ''} ${this.currentStep > 4 ? 'completed' : ''}" data-step="4">
              <span class="step-num">${this.currentStep > 4 ? '✓' : '4'}</span>
              <span class="step-title">4. Demo Payment</span>
            </div>
            <div class="step-divider ${this.currentStep > 4 ? 'filled' : ''}"></div>

            <div class="step-node ${this.currentStep === 5 ? 'active' : ''}" data-step="5">
              <span class="step-num">5</span>
              <span class="step-title">5. Final Review</span>
            </div>
          </div>

          <!-- Step Content Layout -->
          <div class="cart-layout" style="display: grid; grid-template-columns: 1fr 360px; gap: 24px; align-items: flex-start;">
            
            <!-- Left Main Wizard Panel -->
            <div class="wizard-panel" style="background: #ffffff; border-radius: var(--radius-xl); border: 1px solid var(--neutral-200); padding: 24px;">
              ${this.renderStepContent(cartSummary)}
            </div>

            <!-- Right Sidebar Order Summary Box -->
            <aside class="cart-summary-sidebar" style="background: #ffffff; border-radius: var(--radius-xl); border: 1px solid var(--neutral-200); padding: 24px; position: sticky; top: 90px;">
              <h3 style="font-size: 1.15rem; font-weight: 800; color: var(--neutral-900); margin-bottom: 16px;">
                Order Summary
              </h3>

              <div class="summary-breakdown" style="font-size: 0.875rem; display: flex; flex-direction: column; gap: 10px;">
                <div style="display: flex; justify-content: space-between;">
                  <span class="text-muted">Items Subtotal (${cartSummary.count} units):</span>
                  <strong>${Utils.formatINR(cartSummary.subtotal)}</strong>
                </div>

                ${cartSummary.totalDiscount > 0 ? `
                  <div style="display: flex; justify-content: space-between; color: #16a34a;">
                    <span>Promotional Savings:</span>
                    <strong>-${Utils.formatINR(cartSummary.totalDiscount)}</strong>
                  </div>
                ` : ''}

                <div style="display: flex; justify-content: space-between;">
                  <span class="text-muted">Delivery Charges:</span>
                  <span>
                    ${cartSummary.deliveryFee === 0 ? '<strong style="color: #16a34a;">FREE (Orders > ₹500)</strong>' : Utils.formatINR(cartSummary.deliveryFee)}
                  </span>
                </div>

                <div style="display: flex; justify-content: space-between;">
                  <span class="text-muted">Estimated Local Taxes (5%):</span>
                  <span>${Utils.formatINR(cartSummary.taxes)}</span>
                </div>

                <div style="border-top: 2px solid var(--neutral-200); padding-top: 12px; margin-top: 4px; display: flex; justify-content: space-between; font-size: 1.15rem; font-weight: 800; color: var(--primary-900);">
                  <span>Estimated Total:</span>
                  <span style="color: var(--primary-700);">${Utils.formatINR(cartSummary.total)}</span>
                </div>
              </div>

              <!-- Demo Safety Disclaimer -->
              <div style="background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: var(--radius-md); padding: 12px; margin-top: 20px; font-size: 0.75rem; color: #64748b; line-height: 1.4;">
                🔒 <strong>DEMO PROTOTYPE:</strong> Simulated transaction for CODEFEST 2026. No real bank accounts or payment gateways are debited.
              </div>
            </aside>

          </div>

        </div>
      </section>
    `;
  },

  renderStepContent(cartSummary) {
    switch (this.currentStep) {
      // Step 2: Address
      case 2:
        return `
          <div>
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
              <h2 style="font-size: 1.35rem; font-weight: 800; color: var(--neutral-900);">
                Step 2: Shipping & Delivery Address
              </h2>
              <button type="button" class="btn btn-sm btn-outline" id="btn-back-to-step-1">
                ← Back to Cart
              </button>
            </div>
            <p class="text-muted" style="margin-bottom: 20px; font-size: 0.9rem;">
              Provide the exact delivery location in Hubballi, Karnataka so merchants can arrange hyperlocal delivery.
            </p>

            <form id="form-checkout-address" novalidate>
              <div class="checkout-grid-2col" style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 14px;">
                <div class="form-group">
                  <label class="form-label" for="addr-name">Full Recipient Name <span style="color: #dc2626;">*</span></label>
                  <input type="text" id="addr-name" class="form-control" value="${Utils.escapeHTML(this.checkoutData.name)}" placeholder="e.g. Aditi Rao" required />
                </div>
                <div class="form-group">
                  <label class="form-label" for="addr-phone">10-Digit Mobile Number <span style="color: #dc2626;">*</span></label>
                  <input type="tel" id="addr-phone" class="form-control" value="${Utils.escapeHTML(this.checkoutData.phone)}" placeholder="9845012345" maxlength="10" required />
                </div>
              </div>

              <div class="form-group" style="margin-bottom: 14px;">
                <label class="form-label" for="addr-street">House / Flat No., Building & Street Address <span style="color: #dc2626;">*</span></label>
                <textarea id="addr-street" class="form-control" rows="2" placeholder="e.g. Flat 402, Green Palms Apts, Koppikar Road" required>${Utils.escapeHTML(this.checkoutData.address)}</textarea>
              </div>

              <div class="checkout-grid-3col" style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 14px; margin-bottom: 14px;">
                <div class="form-group">
                  <label class="form-label" for="addr-city">City</label>
                  <input type="text" id="addr-city" class="form-control" value="Hubballi" readonly style="background: #f1f5f9; cursor: not-allowed;" />
                </div>
                <div class="form-group">
                  <label class="form-label" for="addr-state">State</label>
                  <input type="text" id="addr-state" class="form-control" value="Karnataka" readonly style="background: #f1f5f9; cursor: not-allowed;" />
                </div>
                <div class="form-group">
                  <label class="form-label" for="addr-pin">Postal PIN Code <span style="color: #dc2626;">*</span></label>
                  <input type="text" id="addr-pin" class="form-control" value="${Utils.escapeHTML(this.checkoutData.pincode || '580020')}" placeholder="580020" maxlength="6" required />
                </div>
              </div>

              <div class="form-group" style="margin-bottom: 24px;">
                <label class="form-label" for="addr-notes">Delivery Instructions (Optional)</label>
                <input type="text" id="addr-notes" class="form-control" value="${Utils.escapeHTML(this.checkoutData.deliveryInstructions)}" placeholder="e.g. Ring bell twice, leave with security guard, landmark..." />
              </div>

              <div style="display: flex; justify-content: flex-end;">
                <button type="submit" class="btn btn-primary btn-lg" style="padding: 12px 28px; font-weight: 700;">
                  Continue to Delivery Options →
                </button>
              </div>
            </form>
          </div>
        `;

      // Step 3: Delivery Options
      case 3:
        return `
          <div>
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
              <h2 style="font-size: 1.35rem; font-weight: 800; color: var(--neutral-900);">
                Step 3: Fulfillment & Delivery Window
              </h2>
              <button type="button" class="btn btn-sm btn-outline" id="btn-back-to-step-2">
                ← Back to Address
              </button>
            </div>
            <p class="text-muted" style="margin-bottom: 20px; font-size: 0.9rem;">
              Choose how you would like to receive your items from local stores.
            </p>

            <div class="payment-option-card ${this.checkoutData.deliveryPreference === 'delivery' ? 'selected' : ''}" id="opt-delivery">
              <input type="radio" name="opt-fulfillment" id="radio-delivery" value="delivery" ${this.checkoutData.deliveryPreference === 'delivery' ? 'checked' : ''} style="margin-top: 4px;" />
              <div>
                <strong style="color: var(--neutral-900); font-size: 1rem;">Standard Local Delivery (Direct from Merchant)</strong>
                <p class="text-muted" style="font-size: 0.85rem; margin-top: 4px; line-height: 1.4;">
                  Delivered to your doorstep within <strong>2–3 hours</strong> by the neighbourhood merchant’s delivery staff.
                  Free for orders above ₹500.
                </p>
              </div>
            </div>

            <div class="payment-option-card ${this.checkoutData.deliveryPreference === 'pickup' ? 'selected' : ''}" id="opt-pickup">
              <input type="radio" name="opt-fulfillment" id="radio-pickup" value="pickup" ${this.checkoutData.deliveryPreference === 'pickup' ? 'checked' : ''} style="margin-top: 4px;" />
              <div>
                <strong style="color: var(--neutral-900); font-size: 1rem;">Self Store Pickup (Click & Collect)</strong>
                <p class="text-muted" style="font-size: 0.85rem; margin-top: 4px; line-height: 1.4;">
                  Ready for pickup in <strong>30 minutes</strong> at the local shop counter. Zero delivery fee.
                </p>
              </div>
            </div>

            <div style="display: flex; justify-content: flex-end; margin-top: 24px;">
              <button type="button" class="btn btn-primary btn-lg" id="btn-step-3-next" style="padding: 12px 28px;">
                Continue to Payment →
              </button>
            </div>
          </div>
        `;

      // Step 4: Demo Payment
      case 4:
        return `
          <div>
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
              <h2 style="font-size: 1.35rem; font-weight: 800; color: var(--neutral-900);">
                Step 4: Select Demo Payment Method
              </h2>
              <button type="button" class="btn btn-sm btn-outline" id="btn-back-to-step-3">
                ← Back to Delivery
              </button>
            </div>

            <div style="background: #fef3c7; border: 1px solid #fde68a; border-radius: var(--radius-md); padding: 12px 16px; margin-bottom: 20px; font-size: 0.85rem; color: #92400e;">
              ⚠️ <strong>COLLEGE HACKATHON DEMO:</strong> All transactions are simulated for prototype evaluation. Never enter genuine card numbers or banking PINs.
            </div>

            <div class="payment-option-card ${this.checkoutData.paymentMethod === 'Cash on Delivery (Demo)' ? 'selected' : ''}" id="opt-pay-cod">
              <input type="radio" name="opt-payment" value="Cash on Delivery (Demo)" ${this.checkoutData.paymentMethod === 'Cash on Delivery (Demo)' ? 'checked' : ''} style="margin-top: 4px;" />
              <div>
                <strong style="color: var(--neutral-900);">Cash on Delivery <span class="demo-payment-pill">SIMULATED DEMO</span></strong>
                <p class="text-muted" style="font-size: 0.85rem; margin-top: 2px;">
                  Pay cash or local merchant QR code when products are handed over.
                </p>
              </div>
            </div>

            <div class="payment-option-card ${this.checkoutData.paymentMethod === 'Demo UPI' ? 'selected' : ''}" id="opt-pay-upi">
              <input type="radio" name="opt-payment" value="Demo UPI" ${this.checkoutData.paymentMethod === 'Demo UPI' ? 'checked' : ''} style="margin-top: 4px;" />
              <div>
                <strong style="color: var(--neutral-900);">Demo UPI Instant Payment <span class="demo-payment-pill">SIMULATED DEMO</span></strong>
                <p class="text-muted" style="font-size: 0.85rem; margin-top: 2px;">
                  Simulates successful instant UPI verification (GooglePay / PhonePe / BHIM).
                </p>
              </div>
            </div>

            <div class="payment-option-card ${this.checkoutData.paymentMethod === 'Demo Card' ? 'selected' : ''}" id="opt-pay-card">
              <input type="radio" name="opt-payment" value="Demo Card" ${this.checkoutData.paymentMethod === 'Demo Card' ? 'checked' : ''} style="margin-top: 4px;" />
              <div>
                <strong style="color: var(--neutral-900);">Demo Credit / Debit Card <span class="demo-payment-pill">SIMULATED DEMO</span></strong>
                <p class="text-muted" style="font-size: 0.85rem; margin-top: 2px;">
                  Simulates instant 3D-Secure test gateway verification.
                </p>
              </div>
            </div>

            <div style="display: flex; justify-content: flex-end; margin-top: 24px;">
              <button type="button" class="btn btn-primary btn-lg" id="btn-step-4-next" style="padding: 12px 28px;">
                Review Order Details →
              </button>
            </div>
          </div>
        `;

      // Step 5: Final Review
      case 5:
        return `
          <div>
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
              <h2 style="font-size: 1.35rem; font-weight: 800; color: var(--neutral-900);">
                Step 5: Final Order Review
              </h2>
              <button type="button" class="btn btn-sm btn-outline" id="btn-back-to-step-4">
                ← Back to Payment
              </button>
            </div>
            <p class="text-muted" style="margin-bottom: 20px; font-size: 0.9rem;">
              Please review all items and recipient details before confirming.
            </p>

            <!-- Recipient & Payment Summary Cards -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px;">
              <div style="background: #f8fafc; padding: 14px 16px; border-radius: var(--radius-lg); border: 1px solid #e2e8f0;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                  <span style="font-size: 0.75rem; font-weight: 700; text-transform: uppercase; color: #64748b;">Shipping To</span>
                  <button type="button" class="btn-link" id="link-edit-address" style="font-size: 0.75rem;">Edit</button>
                </div>
                <strong style="color: var(--neutral-900); font-size: 0.95rem;">${Utils.escapeHTML(this.checkoutData.name)}</strong>
                <div style="font-size: 0.85rem; color: #475569; margin-top: 2px;">
                  📞 ${Utils.escapeHTML(this.checkoutData.phone)}
                </div>
                <div style="font-size: 0.85rem; color: #475569; margin-top: 2px;">
                  📍 ${Utils.escapeHTML(this.checkoutData.address)}, ${this.checkoutData.city} - ${this.checkoutData.pincode}
                </div>
              </div>

              <div style="background: #f8fafc; padding: 14px 16px; border-radius: var(--radius-lg); border: 1px solid #e2e8f0;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                  <span style="font-size: 0.75rem; font-weight: 700; text-transform: uppercase; color: #64748b;">Payment & Fulfillment</span>
                  <button type="button" class="btn-link" id="link-edit-payment" style="font-size: 0.75rem;">Edit</button>
                </div>
                <strong style="color: var(--neutral-900); font-size: 0.95rem;">${Utils.escapeHTML(this.checkoutData.paymentMethod)}</strong>
                <div style="font-size: 0.85rem; color: #475569; margin-top: 2px;">
                  🚚 ${this.checkoutData.deliveryPreference === 'pickup' ? 'Store Counter Self-Pickup' : 'Hyperlocal Home Delivery'}
                </div>
                <div style="font-size: 0.85rem; color: #059669; font-weight: 600; margin-top: 2px;">
                  ✓ Demo simulation authorized
                </div>
              </div>
            </div>

            <!-- Items list snapshot preview -->
            <h4 style="font-size: 1rem; font-weight: 700; margin-bottom: 12px; color: var(--neutral-800);">
              Items to be ordered (${cartSummary.count}):
            </h4>
            <div style="border: 1px solid var(--neutral-200); border-radius: var(--radius-lg); overflow: hidden; margin-bottom: 24px;">
              ${cartSummary.items.map(it => `
                <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 16px; border-bottom: 1px solid var(--neutral-100); background: #ffffff;">
                  <div style="display: flex; align-items: center; gap: 12px;">
                    <img src="${it.product.image}" alt="${Utils.escapeHTML(it.product.name)}" style="width: 40px; height: 40px; object-fit: cover; border-radius: 6px;" onerror="this.src='https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80'" />
                    <div>
                      <div style="font-weight: 600; font-size: 0.875rem;">${Utils.escapeHTML(it.product.name)}</div>
                      <div style="font-size: 0.75rem; color: var(--neutral-500);">Qty: ${it.quantity} × ${Utils.formatINR(it.product.price)}</div>
                    </div>
                  </div>
                  <strong style="font-size: 0.9rem;">${Utils.formatINR(it.product.price * it.quantity)}</strong>
                </div>
              `).join('')}
            </div>

            <!-- Place Order Confirm Button -->
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span class="text-muted" style="font-size: 0.85rem;">
                By placing this order you agree to OneMarket demo marketplace terms.
              </span>
              <button type="button" class="btn btn-primary btn-lg" id="btn-confirm-place-order" style="padding: 14px 36px; font-weight: 800; background: #166534;">
                🎉 Confirm & Place Demo Order (${Utils.formatINR(cartSummary.total)})
              </button>
            </div>
          </div>
        `;

      // Step 1: Cart Items Review (Default)
      case 1:
      default:
        return `
          <div>
            <div style="display: flex; align-items: center; justify-content: space-between; padding-bottom: 16px; margin-bottom: 16px; border-bottom: 1px solid var(--neutral-200);">
              <h2 style="font-size: 1.35rem; font-weight: 800; color: var(--neutral-900);">
                Step 1: Review Shopping Cart (${cartSummary.count} items)
              </h2>
              <button type="button" class="btn btn-sm btn-outline" id="btn-clear-cart" style="color: #dc2626;">
                ${Utils.icons.trash || '🗑️'} Empty Cart
              </button>
            </div>

            <div class="cart-items-list" style="display: flex; flex-direction: column; gap: 16px;">
              ${cartSummary.items.map(item => {
                const p = item.product;
                const isMaxStock = item.quantity >= p.stock;
                return `
                  <div class="cart-item-row" id="cart-item-${p.id}" style="display: grid; grid-template-columns: 80px 1fr auto auto; gap: 16px; align-items: center; padding: 12px; background: #f8fafc; border-radius: var(--radius-lg); border: 1px solid #e2e8f0;">
                    
                    <!-- Thumbnail -->
                    <img 
                      src="${Utils.escapeHTML(p.image)}" 
                      alt="${Utils.escapeHTML(p.name)}" 
                      style="width: 80px; height: 80px; object-fit: cover; border-radius: var(--radius-md);"
                      onerror="this.src='https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80'"
                    />

                    <!-- Details -->
                    <div>
                      <h4 style="font-size: 0.95rem; font-weight: 700; margin-bottom: 4px;">
                        <a href="#product/${p.id}" style="color: inherit; text-decoration: none;">
                          ${Utils.escapeHTML(p.name)}
                        </a>
                      </h4>
                      <div style="font-size: 0.8rem; color: var(--neutral-600);">
                        Sold by: <strong>${Utils.escapeHTML(p.shopName)}</strong> • 📍 ${Utils.escapeHTML(p.shopArea || 'Bengaluru')}
                      </div>
                      <div class="price-discount-wrap" style="margin-top: 4px;">
                        <span style="font-weight: 700; color: var(--primary-800);">${Utils.formatINR(p.price)}</span>
                        ${p.originalPrice && p.originalPrice > p.price ? `
                          <span class="price-original">${Utils.formatINR(p.originalPrice)}</span>
                          <span class="discount-badge">-${p.discountPercent}%</span>
                        ` : ''}
                      </div>
                      <div style="font-size: 0.72rem; color: var(--neutral-500); margin-top: 2px;">
                        Available Stock: ${p.stock} units
                      </div>
                    </div>

                    <!-- Quantity Stepper -->
                    <div>
                      <div class="qty-stepper" style="display: inline-flex; align-items: center; border: 1px solid var(--neutral-300); border-radius: var(--radius-md); background: #ffffff;">
                        <button type="button" class="qty-btn" data-action="cart-minus" data-product-id="${p.id}" style="width: 32px; height: 32px; border: none; background: transparent; cursor: pointer; font-weight: bold;">
                          –
                        </button>
                        <input type="text" class="qty-value" value="${item.quantity}" readonly style="width: 36px; text-align: center; border: none; font-weight: 700;" />
                        <button type="button" class="qty-btn" data-action="cart-plus" data-product-id="${p.id}" ${isMaxStock ? 'disabled title="Max stock reached"' : ''} style="width: 32px; height: 32px; border: none; background: transparent; cursor: pointer; font-weight: bold;">
                          +
                        </button>
                      </div>
                      ${isMaxStock ? `<div style="font-size: 0.65rem; color: #b45309; font-weight: 700; text-align: center; margin-top: 2px;">Max stock</div>` : ''}
                    </div>

                    <!-- Line Total & Delete -->
                    <div style="text-align: right;">
                      <div style="font-size: 1.05rem; font-weight: 800; color: var(--neutral-900);">
                        ${Utils.formatINR(p.price * item.quantity)}
                      </div>
                      <button type="button" class="btn-link" data-action="cart-remove" data-product-id="${p.id}" style="color: #dc2626; font-size: 0.8rem; margin-top: 4px; background: none; border: none; cursor: pointer;">
                        Remove
                      </button>
                    </div>

                  </div>
                `;
              }).join('')}
            </div>

            <!-- Proceed to Checkout Button -->
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 24px; padding-top: 16px; border-top: 1px solid var(--neutral-200);">
              <a href="#catalog" class="btn btn-outline">
                ← Continue Shopping
              </a>
              <button type="button" class="btn btn-primary btn-lg" id="btn-proceed-to-checkout" style="padding: 12px 32px;">
                Proceed to Checkout →
              </button>
            </div>
          </div>
        `;
    }
  },

  initListeners() {
    // Empty Cart Button
    const clearBtn = document.getElementById('btn-clear-cart');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        Utils.confirmDialog({
          title: 'Empty Cart?',
          message: 'Are you sure you want to remove all items from your cart?',
          confirmText: 'Empty Cart',
          confirmStyle: 'danger',
          onConfirm: () => {
            Store.clearCart();
            App.renderCurrentRoute();
          }
        });
      });
    }

    // Step 1: Proceed to Checkout
    const proceedBtn = document.getElementById('btn-proceed-to-checkout');
    if (proceedBtn) {
      proceedBtn.addEventListener('click', () => {
        // Enforce guest restriction
        if (!Store.isAuthenticated()) {
          if (typeof AuthModal !== 'undefined') {
            AuthModal.open({
              tab: 'customer-login',
              onSuccess: () => {
                this.currentStep = 2;
                App.renderCurrentRoute();
              }
            });
          }
          Utils.showToast('Please sign in or create an account to proceed to checkout.', 'info');
          return;
        }

        this.currentStep = 2;
        App.renderCurrentRoute();
      });
    }

    // Step 2: Address Form Submission
    const addrForm = document.getElementById('form-checkout-address');
    if (addrForm) {
      addrForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('addr-name')?.value?.trim();
        const phone = document.getElementById('addr-phone')?.value?.trim()?.replace(/\D/g, '');
        const street = document.getElementById('addr-street')?.value?.trim();
        const pin = document.getElementById('addr-pin')?.value?.trim();
        const notes = document.getElementById('addr-notes')?.value?.trim() || '';

        if (!name) {
          Utils.showToast('Please enter full recipient name.', 'warning');
          document.getElementById('addr-name')?.focus();
          return;
        }

        if (!phone || phone.length !== 10) {
          Utils.showToast('Please enter a valid 10-digit mobile number.', 'warning');
          document.getElementById('addr-phone')?.focus();
          return;
        }

        if (!street) {
          Utils.showToast('Please enter house/flat and street address.', 'warning');
          document.getElementById('addr-street')?.focus();
          return;
        }

        if (!pin || pin.length !== 6 || !/^\d{6}$/.test(pin)) {
          Utils.showToast('Please enter a valid 6-digit postal PIN code (e.g. 580020).', 'warning');
          document.getElementById('addr-pin')?.focus();
          return;
        }

        this.checkoutData.name = name;
        this.checkoutData.phone = phone;
        this.checkoutData.address = street;
        this.checkoutData.city = 'Hubballi';
        this.checkoutData.pincode = pin;
        this.checkoutData.deliveryInstructions = notes;

        this.currentStep = 3;
        App.renderCurrentRoute();
      });
    }

    // Back to Step 1
    const back1Btn = document.getElementById('btn-back-to-step-1');
    if (back1Btn) {
      back1Btn.addEventListener('click', () => {
        this.currentStep = 1;
        App.renderCurrentRoute();
      });
    }

    // Step 3: Fulfillment selection
    const optDelivery = document.getElementById('opt-delivery');
    const optPickup = document.getElementById('opt-pickup');
    if (optDelivery && optPickup) {
      optDelivery.addEventListener('click', () => {
        this.checkoutData.deliveryPreference = 'delivery';
        document.getElementById('radio-delivery').checked = true;
        optDelivery.classList.add('selected');
        optPickup.classList.remove('selected');
      });
      optPickup.addEventListener('click', () => {
        this.checkoutData.deliveryPreference = 'pickup';
        document.getElementById('radio-pickup').checked = true;
        optPickup.classList.add('selected');
        optDelivery.classList.remove('selected');
      });
    }

    const step3Next = document.getElementById('btn-step-3-next');
    if (step3Next) {
      step3Next.addEventListener('click', () => {
        this.currentStep = 4;
        App.renderCurrentRoute();
      });
    }

    const back2Btn = document.getElementById('btn-back-to-step-2');
    if (back2Btn) {
      back2Btn.addEventListener('click', () => {
        this.currentStep = 2;
        App.renderCurrentRoute();
      });
    }

    // Step 4: Payment selection
    const payCod = document.getElementById('opt-pay-cod');
    const payUpi = document.getElementById('opt-pay-upi');
    const payCard = document.getElementById('opt-pay-card');

    if (payCod && payUpi && payCard) {
      payCod.addEventListener('click', () => {
        this.checkoutData.paymentMethod = 'Cash on Delivery (Demo)';
        this.checkoutData.paymentStatus = 'Pending';
        payCod.classList.add('selected');
        payUpi.classList.remove('selected');
        payCard.classList.remove('selected');
      });
      payUpi.addEventListener('click', () => {
        this.checkoutData.paymentMethod = 'Demo UPI';
        this.checkoutData.paymentStatus = 'Demo Payment Successful';
        payUpi.classList.add('selected');
        payCod.classList.remove('selected');
        payCard.classList.remove('selected');
      });
      payCard.addEventListener('click', () => {
        this.checkoutData.paymentMethod = 'Demo Card';
        this.checkoutData.paymentStatus = 'Demo Payment Successful';
        payCard.classList.add('selected');
        payCod.classList.remove('selected');
        payUpi.classList.remove('selected');
      });
    }

    const step4Next = document.getElementById('btn-step-4-next');
    if (step4Next) {
      step4Next.addEventListener('click', () => {
        this.currentStep = 5;
        App.renderCurrentRoute();
      });
    }

    const back3Btn = document.getElementById('btn-back-to-step-3');
    if (back3Btn) {
      back3Btn.addEventListener('click', () => {
        this.currentStep = 3;
        App.renderCurrentRoute();
      });
    }

    // Step 5: Final place order & edits
    const editAddrLink = document.getElementById('link-edit-address');
    if (editAddrLink) {
      editAddrLink.addEventListener('click', () => {
        this.currentStep = 2;
        App.renderCurrentRoute();
      });
    }

    const editPayLink = document.getElementById('link-edit-payment');
    if (editPayLink) {
      editPayLink.addEventListener('click', () => {
        this.currentStep = 4;
        App.renderCurrentRoute();
      });
    }

    const back4Btn = document.getElementById('btn-back-to-step-4');
    if (back4Btn) {
      back4Btn.addEventListener('click', () => {
        this.currentStep = 4;
        App.renderCurrentRoute();
      });
    }

    // Final Confirm Place Order
    const confirmBtn = document.getElementById('btn-confirm-place-order');
    if (confirmBtn) {
      confirmBtn.addEventListener('click', async () => {
        confirmBtn.disabled = true;
        confirmBtn.innerHTML = 'Processing Order Request...';

        const cartSummary = Store.getCartSummary();
        const res = Store.createOrder({
          customer: {
            name: this.checkoutData.name,
            phone: this.checkoutData.phone,
            address: `${this.checkoutData.address}, ${this.checkoutData.city} - ${this.checkoutData.pincode}`,
            deliveryPreference: this.checkoutData.deliveryPreference,
            notes: this.checkoutData.deliveryInstructions
          },
          items: cartSummary.items,
          paymentMethod: this.checkoutData.paymentMethod,
          paymentStatus: this.checkoutData.paymentStatus
        });

        if (res.success) {
          this.currentStep = 1; // Reset wizard
          Utils.showToast(`Order #${res.order.id} placed successfully!`, 'success');
          // Navigate to Orders View with track param
          window.location.hash = `#orders?just_ordered=${res.order.id}`;
        } else {
          confirmBtn.disabled = false;
          confirmBtn.innerHTML = 'Confirm & Place Demo Order';
          Utils.showToast(res.message || 'Order failed. Please retry.', 'warning');
        }
      });
    }

    // Step 1: Quantity Buttons (+, -, remove)
    document.querySelectorAll('[data-action="cart-minus"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const prodId = btn.dataset.productId;
        const currentItem = Store.getCart().find(i => i.productId === prodId);
        if (currentItem) {
          Store.updateCartQuantity(prodId, currentItem.quantity - 1);
          App.renderCurrentRoute();
        }
      });
    });

    document.querySelectorAll('[data-action="cart-plus"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const prodId = btn.dataset.productId;
        const currentItem = Store.getCart().find(i => i.productId === prodId);
        if (currentItem) {
          Store.updateCartQuantity(prodId, currentItem.quantity + 1);
          App.renderCurrentRoute();
        }
      });
    });

    document.querySelectorAll('[data-action="cart-remove"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const prodId = btn.dataset.productId;
        Store.removeFromCart(prodId);
        App.renderCurrentRoute();
      });
    });
  }
};
