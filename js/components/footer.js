/**
 * LocalLoop - Footer Component
 */

const Footer = {
  render() {
    return `
      <footer class="app-footer">
        <div class="container">
          <div class="footer-grid">
            
            <!-- Col 1: Brand & Hackathon Context -->
            <div>
              <div style="display: flex; align-items: center; gap: var(--space-3); margin-bottom: var(--space-3);">
                <div style="width: 32px; height: 32px; border-radius: var(--radius-md); background-color: var(--primary-600); color: #fff; display: flex; align-items: center; justify-content: center;">
                  ${Utils.icons.logo}
                </div>
                <h3 style="color: #fff; font-size: 1.25rem;">OneMarket</h3>
              </div>
              <p style="color: var(--neutral-400); font-size: var(--font-size-sm); margin-bottom: var(--space-4); line-height: 1.6;">
                Your city. Your shops. One local marketplace. Empowering independent neighbourhood retailers across Hubballi and connecting residents with authentic local products.
              </p>
              <div style="display: inline-flex; align-items: center; gap: 8px; background: rgba(255,255,255,0.08); padding: 4px 12px; border-radius: var(--radius-full); font-size: 0.75rem; color: #a7f3d0;">
                <span>Hubballi Hyperlocal Commerce</span>
                <span>• Karnataka, India</span>
              </div>
            </div>

            <!-- Col 2: Marketplace Navigation -->
            <div>
              <h4 class="footer-col-title">Marketplace</h4>
              <ul class="footer-links">
                <li><a href="#home">Home</a></li>
                <li><a href="#catalog">Explore All Products</a></li>
                <li><a href="#compare">Compare Local Prices</a></li>
                <li><a href="#budget">Budget Buddy</a></li>
                <li><a href="#orders">My Orders</a></li>
                <li><a href="#portal">My Portal</a></li>
                <li><a href="#inquiry">Contact & Inquiries</a></li>
              </ul>
            </div>

            <!-- Col 3: Popular Categories -->
            <div>
              <h4 class="footer-col-title">Categories</h4>
              <ul class="footer-links">
                <li><a href="#catalog?category=Groceries">Groceries & Spices</a></li>
                <li><a href="#catalog?category=Electronics">Electronics & Tech</a></li>
                <li><a href="#catalog?category=Fashion">Handlooms & Fashion</a></li>
                <li><a href="#catalog?category=Books+%26+Stationery">Books & Stationery</a></li>
                <li><a href="#catalog?category=Home+%26+Living">Home & Living</a></li>
                <li><a href="#catalog?category=Personal+Care">Personal Care</a></li>
                <li><a href="#catalog?category=Sports+%26+Lifestyle">Sports & Lifestyle</a></li>
              </ul>
            </div>

            <!-- Col 4: Merchant & Technical Architecture -->
            <div>
              <h4 class="footer-col-title">Merchant & Portals</h4>
              <ul class="footer-links">
                <li><a href="#portal">My Portal (Customer & Merchant)</a></li>
                <li><a href="#seller">Merchant Dashboard</a></li>
                <li><a href="#seller?tab=products">Product Catalog Management</a></li>
                <li><a href="#seller?tab=orders">Order Fulfillment & Stock</a></li>
                <li><a href="#seller?tab=analytics">Sales Analytics</a></li>
              </ul>
            </div>

          </div>

          <!-- Bottom Bar -->
          <div class="footer-bottom">
            <div>
              © 2026 OneMarket • Hyperlocal Neighbourhood Marketplace. Hubballi, Karnataka.
            </div>
            <div>
              <span>Connecting independent local retailers with neighbourhood customers.</span>
            </div>
          </div>
        </div>
      </footer>
    `;
  }
};
