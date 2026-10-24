/**
 * OneMarket - Shopping Cart & Reversible Multi-Step Checkout Flow
 * Full 5-step checkout with backward & forward navigation:
 * Step 1: Cart Review (Item quantities, stock limits, empty cart)
 * Step 2: Delivery Address (Recipient name, phone, street, PIN code, instructions)
 * Step 3: Delivery Options (Hyperlocal home delivery vs Click & Collect store pickup)
 * Step 4: Payment Method (Cash on Delivery, UPI Instant, Credit/Debit Card, Net Banking)
 * Step 5: Final Review & Confirmation (Summary breakdown, loyalty token redemption, place order)
 */

const CartView = {
  currentStep: 1, // 1: Cart, 2: Address, 3: Delivery, 4: Payment, 5: Review
  tokensToRedeem: 0,
  checkoutData: {
    name: '',
    phone: '',
    address: '',
    city: 'Hubballi',
    pincode: '580020',
    deliveryPreference: 'delivery',
    deliveryInstructions: '',
    paymentMethod: 'Cash on Delivery',
    paymentStatus: 'Pending'
  },

  saveAddressFromDOM() {
    const nameEl = document.getElementById('addr-name');
    const phoneEl = document.getElementById('addr-phone');
    const streetEl = document.getElementById('addr-street');
    const pinEl = document.getElementById('addr-pin');
    const notesEl = document.getElementById('addr-notes');

    if (nameEl) this.checkoutData.name = nameEl.value.trim();
    if (phoneEl) this.checkoutData.phone = phoneEl.value.trim();
    if (streetEl) this.checkoutData.address = streetEl.value.trim();
    if (pinEl) this.checkoutData.pincode = pinEl.value.trim();
    if (notesEl) this.checkoutData.deliveryInstructions = notesEl.value.trim();
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
      this.tokensToRedeem = 0;
      return `
        <section class="cart-page" style="padding: var(--space-10) 0; min-height: 65vh;">
          <div class="container container-narrow">
            <div class="empty-state" style="padding: 48px 24px; background: #ffffff; border-radius: var(--radius-2xl); border: 1px solid var(--neutral-300); text-align: center; box-shadow: var(--shadow-sm);">
              <div class="empty-state-icon" style="font-size: 3.5rem; margin-bottom: 16px;">
                🛒
              </div>
              <h1 class="empty-state-title" style="font-family: var(--font-family-display); font-size: 1.75rem; font-weight: 800; color: var(--primary-900); margin-bottom: 8px;">
                Your Shopping Cart is Empty
              </h1>
              <p class="empty-state-desc" style="color: var(--neutral-600); max-width: 480px; margin: 0 auto 24px; line-height: 1.5; font-size: 0.95rem;">
                You haven't added any neighbourhood items to your cart yet. Explore local Hubballi merchants and earn reward tokens on every purchase!
              </p>
              <a href="#catalog" class="btn btn-primary btn-lg">
                Explore Hubballi Catalogue
              </a>
            </div>
          </div>
        </section>
      `;
    }

    // Calculate totals including reward token discount
    const availableTokens = Store.getRewardTokens();
    const maxRedeemableTokens = Math.min(availableTokens, Math.floor(cartSummary.subtotal * 0.5));
    if (this.tokensToRedeem > maxRedeemableTokens) {
      this.tokensToRedeem = maxRedeemableTokens;
    }
    const tokenDiscount = this.tokensToRedeem * 1.0;
    const taxableSubtotal = Math.max(0, cartSummary.subtotal - tokenDiscount);
    const taxes = Math.round(taxableSubtotal * 0.05 * 100) / 100;
    const grandTotal = Math.max(0, Math.round((taxableSubtotal + cartSummary.deliveryFee + taxes) * 100) / 100);

    return `
      <section class="cart-page" style="padding: var(--space-8) 0 var(--space-16);">
        <div class="container">
          
          <!-- Stepper Header with Clickable Nodes -->
          <div class="checkout-stepper" style="margin-bottom: var(--space-8); display: flex; align-items: center; justify-content: center; flex-wrap: wrap; gap: 8px;">
            <button type="button" class="step-node ${this.currentStep === 1 ? 'active' : ''} ${this.currentStep > 1 ? 'completed' : ''}" data-step="1" style="background: none; border: none; cursor: pointer; display: flex; align-items: center; gap: 8px;">
              <span class="step-num">${this.currentStep > 1 ? '✓' : '1'}</span>
              <span class="step-title">1. Review Cart</span>
            </button>
            <div class="step-divider ${this.currentStep > 1 ? 'filled' : ''}"></div>

            <button type="button" class="step-node ${this.currentStep === 2 ? 'active' : ''} ${this.currentStep > 2 ? 'completed' : ''}" data-step="2" style="background: none; border: none; cursor: pointer; display: flex; align-items: center; gap: 8px;">
              <span class="step-num">${this.currentStep > 2 ? '✓' : '2'}</span>
              <span class="step-title">2. Delivery Address</span>
            </button>
            <div class="step-divider ${this.currentStep > 2 ? 'filled' : ''}"></div>

            <button type="button" class="step-node ${this.currentStep === 3 ? 'active' : ''} ${this.currentStep > 3 ? 'completed' : ''}" data-step="3" style="background: none; border: none; cursor: pointer; display: flex; align-items: center; gap: 8px;">
              <span class="step-num">${this.currentStep > 3 ? '✓' : '3'}</span>
              <span class="step-title">3. Delivery Options</span>
            </button>
            <div class="step-divider ${this.currentStep > 3 ? 'filled' : ''}"></div>

            <button type="button" class="step-node ${this.currentStep === 4 ? 'active' : ''} ${this.currentStep > 4 ? 'completed' : ''}" data-step="4" style="background: none; border: none; cursor: pointer; display: flex; align-items: center; gap: 8px;">
              <span class="step-num">${this.currentStep > 4 ? '✓' : '4'}</span>
              <span class="step-title">4. Payment</span>
            </button>
            <div class="step-divider ${this.currentStep > 4 ? 'filled' : ''}"></div>

            <button type="button" class="step-node ${this.currentStep === 5 ? 'active' : ''}" data-step="5" style="background: none; border: none; cursor: pointer; display: flex; align-items: center; gap: 8px;">
              <span class="step-num">5</span>
              <span class="step-title">5. Final Review</span>
            </button>
          </div>

          <!-- Step Content Layout -->
          <div class="cart-layout" style="display: grid; grid-template-columns: 1fr 380px; gap: 24px; align-items: flex-start;">
            
            <!-- Left Main Wizard Panel -->
            <div class="wizard-panel" style="background: #ffffff; border-radius: var(--radius-xl); border: 1px solid var(--neutral-300); padding: 24px; box-shadow: var(--shadow-sm);">
              ${this.renderStepContent(cartSummary, availableTokens, maxRedeemableTokens, tokenDiscount, grandTotal)}
            </div>

            <!-- Right Sidebar Order Summary Box -->
            <aside class="cart-summary-sidebar" style="background: #ffffff; border-radius: var(--radius-xl); border: 1px solid var(--neutral-300); padding: 24px; position: sticky; top: 90px; box-shadow: var(--shadow-sm);">
              <h2 style="font-family: var(--font-family-display); font-size: 1.2rem; font-weight: 800; color: var(--primary-900); margin: 0 0 16px;">
                Order Summary
              </h2>

              <div class="summary-breakdown" style="font-size: 0.875rem; display: flex; flex-direction: column; gap: 10px;">
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: var(--neutral-600);">Items Subtotal (${cartSummary.count} items):</span>
                  <strong>${Utils.formatINR(cartSummary.subtotal)}</strong>
                </div>

                ${cartSummary.totalDiscount > 0 ? `
                  <div style="display: flex; justify-content: space-between; color: #166534;">
                    <span>Promotional Savings:</span>
                    <strong>-${Utils.formatINR(cartSummary.totalDiscount)}</strong>
                  </div>
                ` : ''}

                ${this.tokensToRedeem > 0 ? `
                  <div style="display: flex; justify-content: space-between; color: #047857; background: #ecfdf5; padding: 4px 8px; border-radius: var(--radius-md);">
                    <span>🪙 Loyalty Discount (${this.tokensToRedeem} Tokens):</span>
                    <strong>-${Utils.formatINR(tokenDiscount)}</strong>
                  </div>
                ` : ''}

                <div style="display: flex; justify-content: space-between;">
                  <span style="color: var(--neutral-600);">Delivery Fee:</span>
                  <span>
                    ${cartSummary.deliveryFee === 0 ? '<strong style="color: #166534;">FREE (Orders > ₹500)</strong>' : Utils.formatINR(cartSummary.deliveryFee)}
                  </span>
                </div>

                <div style="display: flex; justify-content: space-between;">
                  <span style="color: var(--neutral-600);">Local Taxes (5% GST):</span>
                  <span>${Utils.formatINR(taxes)}</span>
                </div>

                <div style="border-top: 2px solid var(--neutral-200); padding-top: 12px; margin-top: 4px; display: flex; justify-content: space-between; font-size: 1.25rem; font-weight: 900; color: var(--primary-900);">
                  <span>Order Total:</span>
                  <span style="color: var(--primary-700);">${Utils.formatINR(grandTotal)}</span>
                </div>

                <div style="background: var(--primary-50); border: 1px solid var(--primary-100); border-radius: var(--radius-md); padding: 8px 12px; margin-top: 8px; display: flex; align-items: center; gap: 8px; font-size: 0.8rem; color: var(--primary-800);">
                  <span>🪙</span>
                  <span>You will earn <strong>${Math.floor(cartSummary.subtotal / 100)} OneMarket tokens</strong> on this order!</span>
                </div>
              </div>

              <!-- OneMarket Guarantee Notice -->
              <div style="background: #f8fafc; border: 1px solid var(--neutral-200); border-radius: var(--radius-md); padding: 12px; margin-top: 18px; font-size: 0.78rem; color: var(--neutral-600); line-height: 1.4;">
                🛡️ <strong>OneMarket Local Promise:</strong> Direct delivery from verified Hubballi neighbourhood shops with genuine stock and price transparency.
              </div>
            </aside>

          </div>

        </div>
      </section>
    `;
  },

  renderStepContent(cartSummary, availableTokens, maxRedeemableTokens, tokenDiscount, grandTotal) {
    switch (this.currentStep) {
      // Step 2: Delivery Address
      case 2:
        return `
          <div>
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
              <h2 style="font-family: var(--font-family-display); font-size: 1.35rem; font-weight: 800; color: var(--primary-900); margin: 0;">
                Step 2: Shipping & Delivery Address
              </h2>
              <button type="button" class="btn btn-sm btn-outline" id="btn-back-to-step-1">
                ← Back to Cart
              </button>
            </div>
            <p style="color: var(--neutral-600); margin-bottom: 20px; font-size: 0.9rem;">
              Provide the delivery address in Hubballi, Karnataka for your neighbourhood merchant.
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

              <div style="display: flex; justify-content: space-between; align-items: center;">
                <button type="button" class="btn btn-outline" id="btn-back-step2-bottom">
                  ← Back to Cart Review
                </button>
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
              <h2 style="font-family: var(--font-family-display); font-size: 1.35rem; font-weight: 800; color: var(--primary-900); margin: 0;">
                Step 3: Fulfillment & Delivery Window
              </h2>
              <button type="button" class="btn btn-sm btn-outline" id="btn-back-to-step-2">
                ← Back to Address
              </button>
            </div>
            <p style="color: var(--neutral-600); margin-bottom: 20px; font-size: 0.9rem;">
              Choose how you would like to receive your items in Hubballi.
            </p>

            <div class="payment-option-card ${this.checkoutData.deliveryPreference === 'delivery' ? 'selected' : ''}" id="opt-delivery" style="border: 2px solid ${this.checkoutData.deliveryPreference === 'delivery' ? 'var(--primary-600)' : 'var(--neutral-300)'}; border-radius: var(--radius-lg); padding: 16px; margin-bottom: 12px; cursor: pointer; display: flex; gap: 12px;">
              <input type="radio" name="opt-fulfillment" id="radio-delivery" value="delivery" ${this.checkoutData.deliveryPreference === 'delivery' ? 'checked' : ''} style="margin-top: 4px;" />
              <div>
                <strong style="color: var(--neutral-900); font-size: 1rem;">Standard Local Delivery (Direct from Merchant)</strong>
                <p style="color: var(--neutral-600); font-size: 0.85rem; margin-top: 4px; line-height: 1.4;">
                  Delivered to your doorstep within <strong>2–3 hours</strong> by the neighbourhood merchant’s delivery team.
                  Free for orders above ₹500.
                </p>
              </div>
            </div>

            <div class="payment-option-card ${this.checkoutData.deliveryPreference === 'pickup' ? 'selected' : ''}" id="opt-pickup" style="border: 2px solid ${this.checkoutData.deliveryPreference === 'pickup' ? 'var(--primary-600)' : 'var(--neutral-300)'}; border-radius: var(--radius-lg); padding: 16px; margin-bottom: 12px; cursor: pointer; display: flex; gap: 12px;">
              <input type="radio" name="opt-fulfillment" id="radio-pickup" value="pickup" ${this.checkoutData.deliveryPreference === 'pickup' ? 'checked' : ''} style="margin-top: 4px;" />
              <div>
                <strong style="color: var(--neutral-900); font-size: 1rem;">Self Store Pickup (Click & Collect)</strong>
                <p style="color: var(--neutral-600); font-size: 0.85rem; margin-top: 4px; line-height: 1.4;">
                  Ready for collection in <strong>30 minutes</strong> at the local shop counter. Zero delivery charges.
                </p>
              </div>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 24px;">
              <button type="button" class="btn btn-outline" id="btn-back-step3-bottom">
                ← Back to Address
              </button>
              <button type="button" class="btn btn-primary btn-lg" id="btn-step-3-next" style="padding: 12px 28px;">
                Continue to Payment →
              </button>
            </div>
          </div>
        `;

      // Step 4: Payment Method
      case 4:
        return `
          <div>
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
              <h2 style="font-family: var(--font-family-display); font-size: 1.35rem; font-weight: 800; color: var(--primary-900); margin: 0;">
                Step 4: Select Payment Method
              </h2>
              <button type="button" class="btn btn-sm btn-outline" id="btn-back-to-step-3">
                ← Back to Delivery
              </button>
            </div>

            <p style="color: var(--neutral-600); margin-bottom: 18px; font-size: 0.9rem;">
              Select your preferred method to complete payment for your local order.
            </p>

            <div class="payment-option-card ${this.checkoutData.paymentMethod === 'Cash on Delivery' ? 'selected' : ''}" id="opt-pay-cod" style="border: 2px solid ${this.checkoutData.paymentMethod === 'Cash on Delivery' ? 'var(--primary-600)' : 'var(--neutral-300)'}; border-radius: var(--radius-lg); padding: 16px; margin-bottom: 12px; cursor: pointer; display: flex; gap: 12px;">
              <input type="radio" name="opt-payment" value="Cash on Delivery" ${this.checkoutData.paymentMethod === 'Cash on Delivery' ? 'checked' : ''} style="margin-top: 4px;" />
              <div>
                <strong style="color: var(--neutral-900);">Cash on Delivery (COD)</strong>
                <p style="color: var(--neutral-600); font-size: 0.85rem; margin-top: 2px;">
                  Pay cash or scan the merchant's UPI QR code upon doorstep delivery.
                </p>
              </div>
            </div>

            <div class="payment-option-card ${this.checkoutData.paymentMethod === 'UPI Payment' ? 'selected' : ''}" id="opt-pay-upi" style="border: 2px solid ${this.checkoutData.paymentMethod === 'UPI Payment' ? 'var(--primary-600)' : 'var(--neutral-300)'}; border-radius: var(--radius-lg); padding: 16px; margin-bottom: 12px; cursor: pointer; display: flex; gap: 12px;">
              <input type="radio" name="opt-payment" value="UPI Payment" ${this.checkoutData.paymentMethod === 'UPI Payment' ? 'checked' : ''} style="margin-top: 4px;" />
              <div>
                <strong style="color: var(--neutral-900);">UPI Instant Payment (GPay / PhonePe / Paytm / BHIM)</strong>
                <p style="color: var(--neutral-600); font-size: 0.85rem; margin-top: 2px;">
                  Instant bank-to-bank UPI payment verification.
                </p>
              </div>
            </div>

            <div class="payment-option-card ${this.checkoutData.paymentMethod === 'Debit / Credit Card' ? 'selected' : ''}" id="opt-pay-card" style="border: 2px solid ${this.checkoutData.paymentMethod === 'Debit / Credit Card' ? 'var(--primary-600)' : 'var(--neutral-300)'}; border-radius: var(--radius-lg); padding: 16px; margin-bottom: 12px; cursor: pointer; display: flex; gap: 12px;">
              <input type="radio" name="opt-payment" value="Debit / Credit Card" ${this.checkoutData.paymentMethod === 'Debit / Credit Card' ? 'checked' : ''} style="margin-top: 4px;" />
              <div>
                <strong style="color: var(--neutral-900);">Debit / Credit Card (Visa / Mastercard / RuPay)</strong>
                <p style="color: var(--neutral-600); font-size: 0.85rem; margin-top: 2px;">
                  Secure card payment processing.
                </p>
              </div>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 24px;">
              <button type="button" class="btn btn-outline" id="btn-back-step4-bottom">
                ← Back to Delivery Options
              </button>
              <button type="button" class="btn btn-primary btn-lg" id="btn-step-4-next" style="padding: 12px 28px;">
                Review Final Order →
              </button>
            </div>
          </div>
        `;

      // Step 5: Final Review & Confirmation
      case 5:
        return `
          <div>
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
              <h2 style="font-family: var(--font-family-display); font-size: 1.35rem; font-weight: 800; color: var(--primary-900); margin: 0;">
                Step 5: Final Order Review
              </h2>
              <button type="button" class="btn btn-sm btn-outline" id="btn-back-to-step-4">
                ← Back to Payment
              </button>
            </div>
            <p style="color: var(--neutral-600); margin-bottom: 20px; font-size: 0.9rem;">
              Please review all recipient details, purchased items, and reward token redemption before confirming.
            </p>

            <!-- Loyalty Token Redemption Card -->
            ${availableTokens > 0 ? `
              <div style="background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%); border: 1.5px solid #a7f3d0; border-radius: var(--radius-lg); padding: 16px; margin-bottom: 20px;">
                <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px; margin-bottom: 8px;">
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <span style="font-size: 1.4rem;">🪙</span>
                    <div>
                      <strong style="color: #064e3b; font-size: 0.95rem;">Redeem OneMarket Reward Tokens</strong>
                      <div style="font-size: 0.78rem; color: #047857;">Available Balance: <strong>${availableTokens} Tokens</strong> (₹${availableTokens}.00)</div>
                    </div>
                  </div>
                  <span class="badge" style="background: #dcfce7; color: #166534; font-weight: 700; font-size: 0.72rem;">1 Token = ₹1</span>
                </div>

                <div style="display: flex; align-items: center; gap: 12px; margin-top: 10px; flex-wrap: wrap;">
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <label for="input-redeem-tokens" style="font-size: 0.85rem; font-weight: 600; color: #064e3b;">Tokens to Apply:</label>
                    <input 
                      type="number" 
                      id="input-redeem-tokens" 
                      min="0" 
                      max="${maxRedeemableTokens}" 
                      value="${this.tokensToRedeem}" 
                      style="width: 80px; padding: 6px 10px; border-radius: var(--radius-md); border: 1px solid #6ee7b7; font-weight: 700; font-size: 0.9rem;"
                    />
                  </div>

                  <button type="button" class="btn btn-xs" id="btn-apply-max-tokens" style="background: #059669; color: #ffffff; padding: 6px 12px; border-radius: var(--radius-md); font-weight: 700; border: none; cursor: pointer;">
                    Apply Max (${maxRedeemableTokens})
                  </button>
                  ${this.tokensToRedeem > 0 ? `
                    <button type="button" class="btn btn-xs btn-outline" id="btn-clear-tokens" style="padding: 6px 10px; font-size: 0.75rem;">
                      Remove Discount
                    </button>
                  ` : ''}
                </div>

                <div style="font-size: 0.75rem; color: #047857; margin-top: 6px;">
                  * Maximum eligible redemption is 50% of items merchandise subtotal (${maxRedeemableTokens} tokens = ₹${maxRedeemableTokens}.00).
                </div>
              </div>
            ` : ''}

            <!-- Recipient & Payment Summary Cards -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px;">
              <div style="background: #f8fafc; padding: 14px 16px; border-radius: var(--radius-lg); border: 1px solid #e2e8f0;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                  <span style="font-size: 0.75rem; font-weight: 700; text-transform: uppercase; color: #64748b;">Shipping To</span>
                  <button type="button" class="btn-link" id="link-edit-address" style="font-size: 0.75rem; color: var(--primary-700); font-weight: 700; background: none; border: none; cursor: pointer;">Edit Address</button>
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
                  <button type="button" class="btn-link" id="link-edit-payment" style="font-size: 0.75rem; color: var(--primary-700); font-weight: 700; background: none; border: none; cursor: pointer;">Edit Method</button>
                </div>
                <strong style="color: var(--neutral-900); font-size: 0.95rem;">${Utils.escapeHTML(this.checkoutData.paymentMethod)}</strong>
                <div style="font-size: 0.85rem; color: #475569; margin-top: 2px;">
                  🚚 ${this.checkoutData.deliveryPreference === 'pickup' ? 'Store Counter Self-Pickup' : 'Hyperlocal Home Delivery'}
                </div>
              </div>
            </div>

            <!-- Items Snapshot Preview -->
            <h3 style="font-size: 1rem; font-weight: 800; margin-bottom: 12px; color: var(--neutral-900);">
              Items to be ordered (${cartSummary.count}):
            </h3>
            <div style="border: 1px solid var(--neutral-200); border-radius: var(--radius-lg); overflow: hidden; margin-bottom: 24px;">
              ${cartSummary.items.map(it => `
                <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 16px; border-bottom: 1px solid var(--neutral-100); background: #ffffff;">
                  <div style="display: flex; align-items: center; gap: 12px;">
                    <img src="${it.product.image}" alt="${Utils.escapeHTML(it.product.name)}" style="width: 44px; height: 44px; object-fit: cover; border-radius: 6px;" onerror="this.onerror=null; this.src='assets/product-images/placeholder.svg';" />
                    <div>
                      <div style="font-weight: 700; font-size: 0.875rem; color: var(--neutral-900);">${Utils.escapeHTML(it.product.name)}</div>
                      <div style="font-size: 0.75rem; color: var(--neutral-500);">${it.product.shopName || 'Hubballi Merchant'} • Qty: ${it.quantity} × ${Utils.formatINR(it.product.price)}</div>
                    </div>
                  </div>
                  <strong style="font-size: 0.95rem; color: var(--primary-900);">${Utils.formatINR(it.product.price * it.quantity)}</strong>
                </div>
              `).join('')}
            </div>

            <!-- Place Order Confirm Button -->
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
              <button type="button" class="btn btn-outline" id="btn-back-step5-bottom">
                ← Back to Payment
              </button>
              <button type="button" class="btn btn-primary btn-lg" id="btn-confirm-place-order" style="padding: 14px 36px; font-weight: 800; background: #166534; border-color: #166534;">
                Confirm & Place Order (${Utils.formatINR(grandTotal)})
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
              <h2 style="font-family: var(--font-family-display); font-size: 1.35rem; font-weight: 800; color: var(--primary-900); margin: 0;">
                Step 1: Review Shopping Cart (${cartSummary.count} items)
              </h2>
              <button type="button" class="btn btn-sm btn-outline" id="btn-clear-cart" style="color: #dc2626; border-color: #fca5a5;">
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
                      onerror="this.onerror=null; this.src='assets/product-images/placeholder.svg';"
                    />

                    <!-- Details -->
                    <div>
                      <h4 style="font-size: 0.95rem; font-weight: 700; margin-bottom: 4px;">
                        <a href="#product/${p.id}" style="color: inherit; text-decoration: none;">
                          ${Utils.escapeHTML(p.name)}
                        </a>
                      </h4>
                      <div style="font-size: 0.8rem; color: var(--neutral-600);">
                        Sold by: <strong>${Utils.escapeHTML(p.shopName)}</strong> • 📍 ${Utils.escapeHTML(p.shopArea || 'Hubballi')}
                      </div>
                      <div class="price-discount-wrap" style="margin-top: 4px;">
                        <span style="font-weight: 700; color: var(--primary-800);">${Utils.formatINR(p.price)}</span>
                        ${p.originalPrice && p.originalPrice > p.price ? `
                          <span class="price-original">${Utils.formatINR(p.originalPrice)}</span>
                          <span class="discount-badge">-${p.discountPercent || p.discount}%</span>
                        ` : ''}
                      </div>
                      <div style="font-size: 0.72rem; color: var(--neutral-500); margin-top: 2px;">
                        Available Stock: ${p.stock} units
                      </div>
                    </div>

                    <!-- Quantity Stepper -->
                    <div>
                      <div class="qty-stepper" style="display: inline-flex; align-items: center; border: 1px solid var(--neutral-300); border-radius: var(--radius-full); background: #ffffff;">
                        <button type="button" class="qty-btn" data-action="cart-minus" data-product-id="${p.id}" style="width: 28px; height: 28px; border: none; background: none; cursor: pointer; font-weight: 700;">-</button>
                        <span style="min-width: 28px; text-align: center; font-weight: 700; font-size: 0.85rem;">${item.quantity}</span>
                        <button type="button" class="qty-btn" data-action="cart-plus" data-product-id="${p.id}" ${isMaxStock ? 'disabled' : ''} style="width: 28px; height: 28px; border: none; background: none; cursor: ${isMaxStock ? 'not-allowed' : 'pointer'}; font-weight: 700; opacity: ${isMaxStock ? '0.4' : '1'};">+</button>
                      </div>
                    </div>

                    <!-- Line Total & Remove -->
                    <div style="text-align: right;">
                      <strong style="font-size: 1rem; color: var(--primary-900); display: block; margin-bottom: 4px;">
                        ${Utils.formatINR(p.price * item.quantity)}
                      </strong>
                      <button type="button" class="btn-link" data-action="cart-remove" data-product-id="${p.id}" style="font-size: 0.75rem; color: #dc2626; border: none; background: none; cursor: pointer;">
                        Remove
                      </button>
                    </div>

                  </div>
                `;
              }).join('')}
            </div>

            <!-- Proceed to Checkout Button -->
            <div style="display: flex; justify-content: flex-end; margin-top: 24px; padding-top: 16px; border-top: 1px solid var(--neutral-200);">
              <button type="button" class="btn btn-primary btn-lg" id="btn-proceed-to-address" style="padding: 12px 32px; font-weight: 700;">
                Proceed to Shipping Address →
              </button>
            </div>
          </div>
        `;
    }
  },

  initListeners() {
    // Stepper node clicks for reversible navigation
    document.querySelectorAll('.step-node').forEach(node => {
      node.addEventListener('click', (e) => {
        const targetStep = parseInt(node.dataset.step, 10);
        if (targetStep && targetStep >= 1 && targetStep <= 5) {
          // If leaving Step 2, persist address form inputs
          if (this.currentStep === 2) {
            this.saveAddressFromDOM();
          }
          this.currentStep = targetStep;
          App.renderCurrentRoute();
        }
      });
    });

    // Step 1: Proceed to Address
    const proceedBtn = document.getElementById('btn-proceed-to-address');
    if (proceedBtn) {
      proceedBtn.addEventListener('click', () => {
        this.currentStep = 2;
        App.renderCurrentRoute();
      });
    }

    // Step 1: Empty cart
    const clearBtn = document.getElementById('btn-clear-cart');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        Utils.confirmDialog({
          title: 'Empty Shopping Cart?',
          message: 'Are you sure you want to remove all items from your cart?',
          confirmText: 'Empty Cart',
          confirmStyle: 'danger',
          onConfirm: () => {
            Store.clearCart();
            this.tokensToRedeem = 0;
            Utils.showToast('Your cart has been cleared.', 'info');
            App.renderCurrentRoute();
          }
        });
      });
    }

    // Step 2: Address form submission
    const addrForm = document.getElementById('form-checkout-address');
    if (addrForm) {
      addrForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('addr-name')?.value?.trim();
        const phone = document.getElementById('addr-phone')?.value?.trim();
        const street = document.getElementById('addr-street')?.value?.trim();
        const pin = document.getElementById('addr-pin')?.value?.trim();
        const notes = document.getElementById('addr-notes')?.value?.trim() || '';

        if (!name) {
          Utils.showToast('Please enter recipient full name.', 'warning');
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

    // Back to Step 1 buttons
    const back1Btn = document.getElementById('btn-back-to-step-1');
    const back1BottomBtn = document.getElementById('btn-back-step2-bottom');
    const goBackTo1 = () => {
      this.saveAddressFromDOM();
      this.currentStep = 1;
      App.renderCurrentRoute();
    };
    if (back1Btn) back1Btn.addEventListener('click', goBackTo1);
    if (back1BottomBtn) back1BottomBtn.addEventListener('click', goBackTo1);

    // Step 3: Fulfillment selection
    const optDelivery = document.getElementById('opt-delivery');
    const optPickup = document.getElementById('opt-pickup');
    if (optDelivery && optPickup) {
      optDelivery.addEventListener('click', () => {
        this.checkoutData.deliveryPreference = 'delivery';
        const radio = document.getElementById('radio-delivery');
        if (radio) radio.checked = true;
        optDelivery.style.borderColor = 'var(--primary-600)';
        optPickup.style.borderColor = 'var(--neutral-300)';
      });
      optPickup.addEventListener('click', () => {
        this.checkoutData.deliveryPreference = 'pickup';
        const radio = document.getElementById('radio-pickup');
        if (radio) radio.checked = true;
        optPickup.style.borderColor = 'var(--primary-600)';
        optDelivery.style.borderColor = 'var(--neutral-300)';
      });
    }

    const step3Next = document.getElementById('btn-step-3-next');
    if (step3Next) {
      step3Next.addEventListener('click', () => {
        this.currentStep = 4;
        App.renderCurrentRoute();
      });
    }

    // Back to Step 2 buttons
    const back2Btn = document.getElementById('btn-back-to-step-2');
    const back2BottomBtn = document.getElementById('btn-back-step3-bottom');
    const goBackTo2 = () => {
      this.currentStep = 2;
      App.renderCurrentRoute();
    };
    if (back2Btn) back2Btn.addEventListener('click', goBackTo2);
    if (back2BottomBtn) back2BottomBtn.addEventListener('click', goBackTo2);

    // Step 4: Payment selection
    const payCod = document.getElementById('opt-pay-cod');
    const payUpi = document.getElementById('opt-pay-upi');
    const payCard = document.getElementById('opt-pay-card');

    if (payCod && payUpi && payCard) {
      payCod.addEventListener('click', () => {
        this.checkoutData.paymentMethod = 'Cash on Delivery';
        this.checkoutData.paymentStatus = 'Pending';
        payCod.style.borderColor = 'var(--primary-600)';
        payUpi.style.borderColor = 'var(--neutral-300)';
        payCard.style.borderColor = 'var(--neutral-300)';
      });
      payUpi.addEventListener('click', () => {
        this.checkoutData.paymentMethod = 'UPI Payment';
        this.checkoutData.paymentStatus = 'Pending';
        payUpi.style.borderColor = 'var(--primary-600)';
        payCod.style.borderColor = 'var(--neutral-300)';
        payCard.style.borderColor = 'var(--neutral-300)';
      });
      payCard.addEventListener('click', () => {
        this.checkoutData.paymentMethod = 'Debit / Credit Card';
        this.checkoutData.paymentStatus = 'Pending';
        payCard.style.borderColor = 'var(--primary-600)';
        payCod.style.borderColor = 'var(--neutral-300)';
        payUpi.style.borderColor = 'var(--neutral-300)';
      });
    }

    const step4Next = document.getElementById('btn-step-4-next');
    if (step4Next) {
      step4Next.addEventListener('click', () => {
        this.currentStep = 5;
        App.renderCurrentRoute();
      });
    }

    // Back to Step 3 buttons
    const back3Btn = document.getElementById('btn-back-to-step-3');
    const back3BottomBtn = document.getElementById('btn-back-step4-bottom');
    const goBackTo3 = () => {
      this.currentStep = 3;
      App.renderCurrentRoute();
    };
    if (back3Btn) back3Btn.addEventListener('click', goBackTo3);
    if (back3BottomBtn) back3BottomBtn.addEventListener('click', goBackTo3);

    // Step 5: Reward Token Controls
    const tokenInput = document.getElementById('input-redeem-tokens');
    if (tokenInput) {
      tokenInput.addEventListener('change', (e) => {
        const val = parseInt(e.target.value, 10) || 0;
        const available = Store.getRewardTokens();
        const cartSummary = Store.getCartSummary();
        const maxTokens = Math.min(available, Math.floor(cartSummary.subtotal * 0.5));
        this.tokensToRedeem = Math.max(0, Math.min(val, maxTokens));
        App.renderCurrentRoute();
      });
    }

    const applyMaxBtn = document.getElementById('btn-apply-max-tokens');
    if (applyMaxBtn) {
      applyMaxBtn.addEventListener('click', () => {
        const available = Store.getRewardTokens();
        const cartSummary = Store.getCartSummary();
        this.tokensToRedeem = Math.min(available, Math.floor(cartSummary.subtotal * 0.5));
        Utils.showToast(`Applied ${this.tokensToRedeem} OneMarket tokens for ₹${this.tokensToRedeem}.00 discount!`, 'success');
        App.renderCurrentRoute();
      });
    }

    const clearTokensBtn = document.getElementById('btn-clear-tokens');
    if (clearTokensBtn) {
      clearTokensBtn.addEventListener('click', () => {
        this.tokensToRedeem = 0;
        Utils.showToast('Reward tokens removed from order.', 'info');
        App.renderCurrentRoute();
      });
    }

    // Step 5: Quick edit links
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
    const back5BottomBtn = document.getElementById('btn-back-step5-bottom');
    const goBackTo4 = () => {
      this.currentStep = 4;
      App.renderCurrentRoute();
    };
    if (back4Btn) back4Btn.addEventListener('click', goBackTo4);
    if (back5BottomBtn) back5BottomBtn.addEventListener('click', goBackTo4);

    // Final Confirm Place Order
    const confirmBtn = document.getElementById('btn-confirm-place-order');
    if (confirmBtn) {
      confirmBtn.addEventListener('click', async () => {
        confirmBtn.disabled = true;
        confirmBtn.innerHTML = 'Placing Order with Local Merchant...';

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
          paymentStatus: this.checkoutData.paymentStatus,
          tokensToRedeem: this.tokensToRedeem
        });

        if (res.success) {
          const orderId = res.order.id;
          const tokensEarned = res.order.tokensEarned || Math.floor(cartSummary.subtotal / 100);
          this.currentStep = 1;
          this.tokensToRedeem = 0;
          Utils.showToast(`Order #${orderId} placed successfully! You earned ${tokensEarned} OneMarket tokens!`, 'success');
          window.location.hash = `#orders?just_ordered=${orderId}`;
        } else {
          confirmBtn.disabled = false;
          confirmBtn.innerHTML = 'Confirm & Place Order';
          Utils.showToast(res.message || 'Order failed. Please retry.', 'warning');
        }
      });
    }

    // Step 1: Quantity Controls
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
