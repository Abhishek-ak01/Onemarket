/**
 * LocalLoop - Public Seller Storefront View (#store/:shopId)
 * Displays public merchant information, shop banner, area, ratings,
 * business timing, contact, active offers, and shop products catalog.
 */

const StorefrontView = {
  render(shopId) {
    const shop = Store.getShopById(shopId) || Store.getShops()[0];
    if (!shop) {
      return `
        <div class="container py-8 text-center">
          <h2>Storefront Not Found</h2>
          <p class="text-muted">The requested neighbourhood merchant could not be found.</p>
          <a href="#catalog" class="btn btn-primary mt-4">Browse Marketplace</a>
        </div>
      `;
    }

    const shopProducts = Store.getProductsByShop(shop.id);
    const activeOffers = shopProducts.filter(p => p.discountPercent > 0);

    return `
      <section class="storefront-page py-6">
        <div class="container">
          
          <!-- Back navigation -->
          <div style="margin-bottom: var(--space-4);">
            <a href="#catalog" class="btn btn-secondary btn-sm" style="display: inline-flex; align-items: center; gap: 6px;">
              ${Utils.icons.arrowLeft || '←'} Back to Marketplace
            </a>
          </div>

          <!-- Storefront Hero Banner -->
          <div class="storefront-banner">
            <div style="display: flex; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; gap: 20px;">
              <div>
                <span class="badge" style="background: rgba(255, 255, 255, 0.2); color: #ffffff; margin-bottom: 8px;">
                  VERIFIED LOCAL MERCHANT
                </span>
                <h1 style="font-size: 2.2rem; font-weight: 800; margin-bottom: 8px; color: #ffffff;">
                  ${Utils.escapeHTML(shop.name)}
                </h1>
                <p style="font-size: 1rem; opacity: 0.95; max-width: 640px; line-height: 1.5; color: #ffffff;">
                  ${Utils.escapeHTML(shop.description || '')}
                </p>
                <div class="storefront-meta">
                  <span class="storefront-pill">
                    📍 ${Utils.escapeHTML(shop.area || 'Bengaluru')}
                  </span>
                  <span class="storefront-pill">
                    ⭐ ${Number(shop.rating || 4.8).toFixed(1)} (${shop.reviewsCount || 80}+ reviews)
                  </span>
                  <span class="storefront-pill">
                    🏷️ ${Utils.escapeHTML(shop.category || 'Local')}
                  </span>
                  ${shop.timing ? `<span class="storefront-pill">🕒 ${Utils.escapeHTML(shop.timing)}</span>` : ''}
                  ${shop.phone ? `<span class="storefront-pill">📞 ${Utils.escapeHTML(shop.phone)}</span>` : ''}
                  <a href="#inquiry?shop_id=${encodeURIComponent(shop.id)}&subject=${encodeURIComponent('Inquiry for ' + shop.name)}" class="storefront-pill" style="background: rgba(255,255,255,0.3); color: #fff; text-decoration: none; font-weight: 700;">
                    ✉️ Inquire with Merchant
                  </a>
                </div>
              </div>

              <!-- Shop Image / Logo -->
              <div style="width: 120px; height: 120px; border-radius: var(--radius-xl); overflow: hidden; border: 3px solid rgba(255, 255, 255, 0.3); box-shadow: 0 10px 20px rgba(0,0,0,0.2);">
                <img src="${shop.image || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80'}" alt="${Utils.escapeHTML(shop.name)}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.src='https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80'" />
              </div>
            </div>
          </div>

          <!-- Active Offers Banner if applicable -->
          ${activeOffers.length > 0 ? `
            <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: var(--radius-xl); padding: 16px 20px; margin-bottom: 24px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;">
              <div style="display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 1.5rem;">🎉</span>
                <div>
                  <strong style="color: #92400e; font-size: 0.95rem;">Active Promotional Offers Available</strong>
                  <div style="font-size: 0.85rem; color: #b45309;">Enjoy up to 25% discount directly sourced from this neighborhood merchant.</div>
                </div>
              </div>
              <span class="badge" style="background: #f59e0b; color: #ffffff; font-weight: 700;">
                ${activeOffers.length} OFFERS ACTIVE
              </span>
            </div>
          ` : ''}

          <!-- Store Products Section -->
          <div class="store-products-header" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px;">
            <div>
              <h2 style="font-size: 1.5rem; font-weight: 800; color: var(--neutral-900);">
                Products from ${Utils.escapeHTML(shop.name)}
              </h2>
              <p class="text-muted" style="font-size: 0.9rem;">
                Showing all ${shopProducts.length} local catalogue items with real-time neighbourhood inventory.
              </p>
            </div>
          </div>

          <!-- Product Grid -->
          <div class="product-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 24px;">
            ${shopProducts.length > 0 ? shopProducts.map(p => ProductCard.render(p)).join('') : `
              <div class="col-span-full py-8 text-center text-muted">
                No products currently listed for this shop.
              </div>
            `}
          </div>

        </div>
      </section>
    `;
  },

  initListeners(shopId) {
    // Product cards listeners
    document.querySelectorAll('[data-action="view-storefront"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = btn.dataset.shopId;
        if (id) window.location.hash = `#store/${id}`;
      });
    });
  }
};
