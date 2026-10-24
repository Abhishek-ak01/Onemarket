/**
 * OneMarket - Customer & Merchant Inquiry View (#inquiry)
 * Directly connects website inquiries, bulk order questions, and contact requests
 * to the Supabase Postgres backend.
 */

const InquiryView = {
  render(queryParams = {}) {
    const shops = Store.getShops();
    const preselectedShopId = queryParams.shop_id || queryParams.shopId || '';
    const prefilledSubject = queryParams.subject || '';

    return `
      <section class="container py-8" style="max-width: 900px; margin: 0 auto; padding-bottom: 80px;">
        
        <!-- Header Banner -->
        <div style="text-align: center; margin-bottom: 36px;">
          <div style="display: inline-flex; align-items: center; gap: 8px; background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.2); padding: 6px 14px; border-radius: var(--radius-full); font-size: 0.85rem; color: #065f46; font-weight: 600; margin-bottom: 12px;">
            <span>⚡ Powered by Supabase Backend</span>
            <span>• Hubballi Local Commerce</span>
          </div>
          <h1 style="font-size: 2.2rem; font-weight: 800; color: var(--primary-900); margin-bottom: 8px;">
            Inquiries & Contact Us
          </h1>
          <p class="text-muted" style="font-size: 1.05rem; max-width: 640px; margin: 0 auto; line-height: 1.6;">
            Have a question about a product, bulk order, seller partnership, or local delivery? Fill out the form below and it will be recorded directly into our Supabase cloud backend.
          </p>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 340px; gap: 32px; align-items: start;" class="inquiry-grid">
          
          <!-- Inquiry Form Card -->
          <div class="card" style="box-shadow: 0 4px 20px rgba(0,0,0,0.06); border-radius: var(--radius-xl); border: 1px solid var(--color-border);">
            <div class="card-body" style="padding: 32px;">
              
              <div id="inquiry-alert" style="display: none; margin-bottom: 20px;"></div>

              <form id="inquiry-form">
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
                  <!-- Full Name -->
                  <div>
                    <label class="form-label" for="inquiry-name" style="font-weight: 600; font-size: 0.9rem; margin-bottom: 6px; display: block;">
                      Full Name <span style="color: #ef4444;">*</span>
                    </label>
                    <input 
                      type="text" 
                      id="inquiry-name" 
                      name="name" 
                      class="form-control" 
                      placeholder="e.g. Ramesh Kulkarni" 
                      required 
                      value="${Store.getCurrentUser()?.name || ''}"
                      style="width: 100%; padding: 10px 14px; border-radius: var(--radius-md); border: 1px solid var(--color-border);"
                    />
                  </div>

                  <!-- Email Address -->
                  <div>
                    <label class="form-label" for="inquiry-email" style="font-weight: 600; font-size: 0.9rem; margin-bottom: 6px; display: block;">
                      Email Address <span style="color: #ef4444;">*</span>
                    </label>
                    <input 
                      type="email" 
                      id="inquiry-email" 
                      name="email" 
                      class="form-control" 
                      placeholder="e.g. ramesh@example.com" 
                      required 
                      value="${Store.getCurrentUser()?.email || ''}"
                      style="width: 100%; padding: 10px 14px; border-radius: var(--radius-md); border: 1px solid var(--color-border);"
                    />
                  </div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
                  <!-- Phone Number -->
                  <div>
                    <label class="form-label" for="inquiry-phone" style="font-weight: 600; font-size: 0.9rem; margin-bottom: 6px; display: block;">
                      Phone Number (Optional)
                    </label>
                    <input 
                      type="tel" 
                      id="inquiry-phone" 
                      name="phone" 
                      class="form-control" 
                      placeholder="+91 98450 XXXXX" 
                      value="${Store.getCurrentUser()?.phone || ''}"
                      style="width: 100%; padding: 10px 14px; border-radius: var(--radius-md); border: 1px solid var(--color-border);"
                    />
                  </div>

                  <!-- Target Shop / General -->
                  <div>
                    <label class="form-label" for="inquiry-shop" style="font-weight: 600; font-size: 0.9rem; margin-bottom: 6px; display: block;">
                      Send Inquiry To
                    </label>
                    <select 
                      id="inquiry-shop" 
                      name="shop_id" 
                      class="form-control"
                      style="width: 100%; padding: 10px 14px; border-radius: var(--radius-md); border: 1px solid var(--color-border);"
                    >
                      <option value="">🏢 OneMarket Platform & Support</option>
                      ${shops.map(s => `
                        <option value="${s.id}" ${s.id === preselectedShopId ? 'selected' : ''}>
                          🏪 ${Utils.escapeHTML(s.name)} (${s.area || 'Hubballi'})
                        </option>
                      `).join('')}
                    </select>
                  </div>
                </div>

                <!-- Subject -->
                <div style="margin-bottom: 16px;">
                  <label class="form-label" for="inquiry-subject" style="font-weight: 600; font-size: 0.9rem; margin-bottom: 6px; display: block;">
                    Subject <span style="color: #ef4444;">*</span>
                  </label>
                  <input 
                    type="text" 
                    id="inquiry-subject" 
                    name="subject" 
                    class="form-control" 
                    placeholder="e.g. Bulk order inquiry for festive handlooms" 
                    required 
                    value="${Utils.escapeHTML(prefilledSubject)}"
                    style="width: 100%; padding: 10px 14px; border-radius: var(--radius-md); border: 1px solid var(--color-border);"
                  />
                </div>

                <!-- Message -->
                <div style="margin-bottom: 24px;">
                  <label class="form-label" for="inquiry-message" style="font-weight: 600; font-size: 0.9rem; margin-bottom: 6px; display: block;">
                    Message Details <span style="color: #ef4444;">*</span>
                  </label>
                  <textarea 
                    id="inquiry-message" 
                    name="message" 
                    rows="5" 
                    class="form-control" 
                    placeholder="Please describe your question, requested quantities, or order assistance in detail..." 
                    required
                    style="width: 100%; padding: 12px 14px; border-radius: var(--radius-md); border: 1px solid var(--color-border); font-family: inherit; font-size: 0.95rem; resize: vertical;"
                  ></textarea>
                </div>

                <!-- Submit Button -->
                <button 
                  type="submit" 
                  id="btn-submit-inquiry" 
                  class="btn btn-primary" 
                  style="width: 100%; padding: 14px; font-weight: 700; font-size: 1rem; border-radius: var(--radius-lg); display: flex; align-items: center; justify-content: center; gap: 8px;"
                >
                  <span>✉️ Submit Inquiry to Supabase Backend</span>
                </button>
              </form>

            </div>
          </div>

          <!-- Side Information Cards -->
          <div style="display: flex; flex-direction: column; gap: 20px;">
            
            <!-- Direct Cloud Backend Card -->
            <div class="card" style="border-radius: var(--radius-xl); border: 1px solid rgba(16, 185, 129, 0.3); background: #f0fdf4;">
              <div class="card-body" style="padding: 24px;">
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">
                  <div style="width: 36px; height: 36px; border-radius: 8px; background: #10b981; color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 800;">
                    ✓
                  </div>
                  <div>
                    <strong style="color: #065f46; font-size: 1.05rem;">Direct Supabase Sync</strong>
                    <div style="font-size: 0.8rem; color: #047857;">Live Cloud Database</div>
                  </div>
                </div>
                <p style="font-size: 0.85rem; color: #065f46; line-height: 1.5; margin: 0;">
                  Every submission is instantaneously written to the <code>inquiries</code> table in our dedicated Supabase Postgres instance, accessible via our REST API.
                </p>
              </div>
            </div>

            <!-- Merchant Hours & Hubballi Headquarters -->
            <div class="card" style="border-radius: var(--radius-xl); border: 1px solid var(--color-border);">
              <div class="card-body" style="padding: 24px;">
                <h4 style="font-size: 1rem; font-weight: 700; color: var(--primary-900); margin-bottom: 12px;">
                  Hubballi Operations Office
                </h4>
                <div style="font-size: 0.85rem; color: var(--neutral-600); line-height: 1.6; display: flex; flex-direction: column; gap: 8px;">
                  <div>📍 <strong>Address:</strong> Station Road & Koppikar Road Commercial Complex, Hubballi, Karnataka - 580020</div>
                  <div>📞 <strong>Support Line:</strong> +91 98450 12345</div>
                  <div>🕒 <strong>Merchant Support:</strong> Mon - Sat: 9:00 AM - 9:00 PM</div>
                  <div>⚡ <strong>Average Response:</strong> Under 2 business hours</div>
                </div>
              </div>
            </div>

          </div>

        </div>

      </section>
    `;
  },

  initListeners() {
    const form = document.getElementById('inquiry-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const alertBox = document.getElementById('inquiry-alert');
      const submitBtn = document.getElementById('btn-submit-inquiry');

      const name = document.getElementById('inquiry-name')?.value.trim();
      const email = document.getElementById('inquiry-email')?.value.trim();
      const phone = document.getElementById('inquiry-phone')?.value.trim();
      const shopId = document.getElementById('inquiry-shop')?.value.trim();
      const subject = document.getElementById('inquiry-subject')?.value.trim();
      const message = document.getElementById('inquiry-message')?.value.trim();

      if (!name || !email || !message) {
        if (alertBox) {
          alertBox.style.display = 'block';
          alertBox.className = 'alert alert-danger';
          alertBox.textContent = 'Please fill out all required fields (Name, Email, Message).';
        }
        return;
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<span>⏳ Saving to Supabase Backend...</span>`;
      }

      try {
        const response = await fetch('/api/inquiries', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name,
            email,
            phone,
            shopId: shopId || null,
            subject,
            message
          })
        });

        const result = await response.json();

        if (response.ok && result.success) {
          if (alertBox) {
            alertBox.style.display = 'block';
            alertBox.style.backgroundColor = '#ecfdf5';
            alertBox.style.borderColor = '#10b981';
            alertBox.style.color = '#065f46';
            alertBox.style.padding = '16px';
            alertBox.style.borderRadius = 'var(--radius-lg)';
            alertBox.innerHTML = `
              <div style="font-weight: 700; font-size: 1rem; margin-bottom: 4px;">✓ Inquiry Saved in Supabase Backend!</div>
              <div style="font-size: 0.85rem; line-height: 1.5;">
                Inquiry Ref <strong>#INQ-${result.data?.id || 'SUCCESS'}</strong> has been recorded in our Supabase database. We will contact you at <strong>${Utils.escapeHTML(email)}</strong>.
              </div>
            `;
          }

          form.reset();
          Utils.showToast?.('Inquiry successfully recorded in Supabase backend!', 'success');
        } else {
          throw new Error(result.message || 'Failed to submit inquiry.');
        }
      } catch (err) {
        if (alertBox) {
          alertBox.style.display = 'block';
          alertBox.style.backgroundColor = '#fef2f2';
          alertBox.style.borderColor = '#ef4444';
          alertBox.style.color = '#991b1b';
          alertBox.style.padding = '16px';
          alertBox.style.borderRadius = 'var(--radius-lg)';
          alertBox.textContent = `Error: ${err.message}`;
        }
        Utils.showToast?.(`Error: ${err.message}`, 'error');
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = `<span>✉️ Submit Inquiry to Supabase Backend</span>`;
        }
      }
    });
  }
};
