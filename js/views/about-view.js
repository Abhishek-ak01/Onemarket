/**
 * LocalLoop - About & Technical Architecture View
 * Details problem statement, solution, demo data mechanics,
 * reset demo action, and future Node.js + Express + MySQL roadmap.
 */

const AboutView = {
  render() {
    return `
      <section class="container container-narrow" style="padding: var(--space-8) 0 var(--space-16);">
        
        <div class="section-header">
          <div>
            <span class="badge badge-accent">CODEFEST 2026 Submission</span>
            <h1 class="section-title">About OneMarket & Architecture</h1>
            <p class="section-subtitle">
              Your city. Your shops. One local marketplace.
            </p>
          </div>
        </div>

        <!-- Problem & Solution Card -->
        <div class="card" style="margin-bottom: var(--space-6);">
          <div class="card-body">
            <h3 style="color: var(--primary-900); font-size: 1.35rem; margin-bottom: var(--space-3);">
              The Problem We Are Solving
            </h3>
            <p style="margin-bottom: var(--space-4);">
              Local customers often struggle to discover products available at nearby neighbourhood shops, compare prices across local sellers, and understand product availability without calling multiple stores or walking between alleys.
            </p>
            <p style="margin-bottom: var(--space-4);">
              At the same time, small brick-and-mortar merchants lack a simple, friction-free digital interface to showcase items, manage physical inventory, and handle customer order requests without high commission fees.
            </p>
            <h4 style="color: var(--primary-700); font-size: 1.1rem; margin-bottom: var(--space-2);">
              The OneMarket Solution
            </h4>
            <p>
              OneMarket bridges this divide with a unified local commerce protocol. Customers enjoy smart search, 3-way product comparison, and budget-guided discovery. Local merchants manage listings and process orders through a streamlined dashboard that guarantees physical stock integrity.
            </p>
          </div>
        </div>

        <!-- Current Prototype Architecture Card -->
        <div class="card" style="margin-bottom: var(--space-6);">
          <div class="card-body">
            <h3 style="color: var(--primary-900); font-size: 1.35rem; margin-bottom: var(--space-3);">
              Technical Architecture (Full-Stack Hubballi Marketplace)
            </h3>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4); margin-bottom: var(--space-4);">
              <div style="background-color: var(--neutral-50); border: 1px solid var(--color-border); border-radius: var(--radius-lg); padding: var(--space-4);">
                <div style="font-weight: 700; color: var(--neutral-900); margin-bottom: 4px;">Frontend Core</div>
                <div style="font-size: var(--font-size-xs); color: var(--neutral-600); line-height: 1.5;">
                  • Semantic HTML5 structure<br/>
                  • Custom Vanilla CSS3 design system<br/>
                  • Zero heavyweight framework bloat<br/>
                  • High-performance Vanilla ES6+ JavaScript
                </div>
              </div>

              <div style="background-color: var(--neutral-50); border: 1px solid var(--color-border); border-radius: var(--radius-lg); padding: var(--space-4);">
                <div style="font-weight: 700; color: var(--neutral-900); margin-bottom: 4px;">State & Persistence Layer</div>
                <div style="font-size: var(--font-size-xs); color: var(--neutral-600); line-height: 1.5;">
                  • Centralized reactive Store (<code>js/store.js</code>)<br/>
                  • MySQL 8 relational database backend<br/>
                  • Transactional order processing & inventory sync<br/>
                  • Seamless customer & merchant data sharing
                </div>
              </div>
            </div>

            <div style="background-color: var(--primary-25); border: 1px solid var(--primary-100); border-radius: var(--radius-lg); padding: var(--space-4); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: var(--space-3);">
              <div>
                <strong style="color: var(--primary-900);">Reset Demo Environment</strong>
                <div style="font-size: var(--font-size-xs); color: var(--neutral-600);">Restore all 49 seed products, Hubballi shops, and baseline demo orders safely.</div>
              </div>
              <button type="button" class="btn btn-sm btn-outline" id="btn-about-reset-demo" style="border-color: var(--primary-400); color: var(--primary-800);">
                ${Utils.icons.refresh} Reset All Demo Data
              </button>
            </div>
          </div>
        </div>

        <!-- Backend Integration Roadmap -->
        <div class="card">
          <div class="card-body">
            <h3 style="color: var(--primary-900); font-size: 1.35rem; margin-bottom: var(--space-3);">
              Node.js, Express & MySQL 8 Production Architecture
            </h3>
            <p style="font-size: var(--font-size-sm); color: var(--neutral-600); margin-bottom: var(--space-4); line-height: 1.6;">
              OneMarket's frontend is architected with a decoupled <code>Store</code> interface connected to Node.js + Express REST APIs with a relational MySQL database providing ACID transactions, inventory locking, and verified customer reviews.
            </p>

            <div style="background-color: var(--neutral-900); color: #e2e8f0; border-radius: var(--radius-md); padding: var(--space-4); font-family: monospace; font-size: 12px; line-height: 1.6; overflow-x: auto;">
              <span style="color: #6ee7b7;">// OneMarket RESTful API Endpoints:</span><br/>
              GET    /api/products?category=...&area=...&shop=...&q=...<br/>
              POST   /api/products                    <span style="color: #94a3b8;">// Merchant product creation</span><br/>
              PUT    /api/products/:id                <span style="color: #94a3b8;">// Price & stock updates</span><br/>
              DELETE /api/products/:id                <span style="color: #94a3b8;">// Product removal</span><br/>
              GET    /api/shops                       <span style="color: #94a3b8;">// Hubballi local merchant profiles</span><br/>
              POST   /api/orders                      <span style="color: #94a3b8;">// Customer order request</span><br/>
              PATCH  /api/orders/:id/status           <span style="color: #94a3b8;">// ACID transaction deducting inventory</span><br/>
              POST   /api/reviews                     <span style="color: #94a3b8;">// Verified purchase customer reviews</span><br/>
              POST   /api/demo-reset                  <span style="color: #94a3b8;">// Safe baseline demo environment reset</span>
            </div>
          </div>
        </div>

      </section>
    `;
  },

  initListeners() {
    const resetBtn = document.getElementById('btn-about-reset-demo');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        Utils.confirmDialog({
          title: 'Reset Demo Data to Seed State?',
          message: 'This will reset products, inventory quantities, and demo orders back to the initial Hubballi seed dataset safely.',
          confirmText: 'Reset Data',
          confirmStyle: 'danger',
          onConfirm: async () => {
            const ok = await Store.resetDemoData();
            if (ok) {
              Utils.showToast('Demo data restored to seed defaults!', 'success');
              if (typeof App !== 'undefined') App.renderCurrentRoute();
            } else {
              Utils.showToast('Could not reset demo data. Please try again.', 'error');
            }
          }
        });
      });
    }
  }
};
