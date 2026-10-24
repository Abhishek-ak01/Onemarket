/**
 * LocalLoop - Product Details View
 * Detailed specifications, promotional discount badges,
 * inventory-guarded quantity stepper, merchant storefront links,
 * guest-protected purchasing, and verified customer reviews.
 */

const ProductView = {
  render(productId) {
    const product = Store.getProductById(productId);

    if (!product) {
      return `
        <div class="container" style="padding: var(--space-12) 0;">
          <div class="empty-state" style="background: white; border: 1px solid var(--color-border-subtle); border-radius: var(--radius-xl); padding: var(--space-8); text-align: center;">
            <div class="empty-state-icon">${Utils.icons.alertCircle}</div>
            <h2 class="empty-state-title">Product Not Found</h2>
            <p class="empty-state-desc">The item you are looking for may have been removed or does not exist in our neighbourhood catalogue.</p>
            <a href="#catalog" class="btn btn-primary">Return to Catalog</a>
          </div>
        </div>
      `;
    }

    const shop = Store.getShopById(product.shopId) || {
      id: product.shopId,
      name: product.shopName,
      area: 'Local Neighbourhood',
      address: 'Bengaluru',
      timing: '9:00 AM - 9:00 PM',
      phone: '+91 98000 00000'
    };

    const isOutOfStock = product.stock <= 0;
    const isLowStock = product.stock > 0 && product.stock <= LOW_STOCK_THRESHOLD;

    let stockBadgeHtml = '';
    if (isOutOfStock) {
      stockBadgeHtml = `<span class="badge badge-stock-out">${Utils.icons.alertCircle} Currently Out of Stock</span>`;
    } else if (isLowStock) {
      stockBadgeHtml = `<span class="badge badge-stock-low">${Utils.icons.alertTriangle} Only ${product.stock} units left at local store</span>`;
    } else {
      stockBadgeHtml = `<span class="badge badge-stock-in">${Utils.icons.check} In Stock (${product.stock} units available)</span>`;
    }

    // Pricing & Discounts
    const origPrice = Number(product.originalPrice || product.price);
    const currPrice = Number(product.price);
    const discountAmount = Math.max(0, origPrice - currPrice);
    const discountPercent = origPrice > 0 && discountAmount > 0 ? Math.round((discountAmount / origPrice) * 100) : 0;

    const compareList = Store.getCompareList();
    const isInCompare = compareList.some(p => p.id === product.id);

    // Related products from same category
    const relatedProducts = Store.getProducts()
      .filter(p => p.category === product.category && p.id !== product.id)
      .slice(0, 4);

    const fallbackImg = Utils.getFallbackImageSvg(product.category, product.name);

    return `
      <section class="product-details-page" style="padding: var(--space-6) 0;">
        <div class="container">
          
          <!-- Breadcrumbs -->
          <nav class="breadcrumbs" aria-label="Breadcrumb" style="margin-bottom: var(--space-4);">
            <a href="#home">Home</a>
            <span>/</span>
            <a href="#catalog">Catalog</a>
            <span>/</span>
            <a href="#catalog?category=${encodeURIComponent(product.category)}">${Utils.escapeHTML(product.category)}</a>
            <span>/</span>
            <span style="color: var(--neutral-900); font-weight: 600;">${Utils.escapeHTML(product.name)}</span>
          </nav>

          <!-- Main Layout -->
          <div class="product-detail-layout" style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-8); background: white; padding: var(--space-6); border-radius: var(--radius-xl); border: 1px solid var(--color-border); box-shadow: var(--shadow-sm);">
            
            <!-- Left: Product Media Gallery -->
            <div class="product-gallery-pane">
              <div class="product-main-image-box" style="position: relative; border-radius: var(--radius-lg); overflow: hidden; background: var(--neutral-50); border: 1px solid var(--color-border-subtle); aspect-ratio: 1; display: flex; align-items: center; justify-content: center;">
                <img 
                  src="${Utils.escapeHTML(product.image)}" 
                  alt="${Utils.escapeHTML(product.name)}" 
                  class="product-main-image"
                  style="width: 100%; height: 100%; object-fit: cover;"
                  onerror="this.onerror=null; this.src='${fallbackImg}';"
                />
                ${discountPercent > 0 ? `
                  <div style="position: absolute; top: 12px; left: 12px; background: #dc2626; color: white; padding: 4px 10px; border-radius: 6px; font-weight: 800; font-size: 13px; box-shadow: var(--shadow-sm);">
                    ${discountPercent}% OFF
                  </div>
                ` : ''}
              </div>
            </div>

            <!-- Right: Product Info & Actions -->
            <div class="product-info-pane" style="display: flex; flex-direction: column; justify-content: space-between;">
              
              <div>
                <div class="product-meta-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-2);">
                  <span class="badge badge-category">${Utils.escapeHTML(product.category)}</span>
                  ${product.rating ? `
                    <div style="display: flex; align-items: center; gap: 4px;">
                      <span class="star-rating" style="color: #f59e0b; font-weight: 700;">★ ${Number(product.rating).toFixed(1)}</span>
                      <span style="font-size: var(--font-size-xs); color: var(--neutral-500);">(${product.reviewsCount || 1} verified ratings)</span>
                    </div>
                  ` : ''}
                </div>

                <h1 class="product-detail-title" style="font-family: var(--font-family-display); font-size: 1.85rem; margin: 0 0 var(--space-3); color: var(--neutral-900);">
                  ${Utils.escapeHTML(product.name)}
                </h1>

                <!-- Shop Card Mini with Storefront Link -->
                <div class="product-detail-shop-card" style="background: var(--neutral-50); border: 1px solid var(--color-border-subtle); border-radius: var(--radius-md); padding: var(--space-3) var(--space-4); margin-bottom: var(--space-4); display: flex; justify-content: space-between; align-items: center;">
                  <div class="shop-card-left" style="display: flex; align-items: center; gap: var(--space-3);">
                    <div style="color: var(--color-primary);">${Utils.icons.shop}</div>
                    <div>
                      <div style="font-size: 10px; color: var(--neutral-500); font-weight: 700; text-transform: uppercase;">Sold by Merchant</div>
                      <a href="#store/${encodeURIComponent(product.shopId)}" style="font-size: var(--font-size-sm); font-weight: 700; color: var(--color-primary); text-decoration: underline;">
                        ${Utils.escapeHTML(product.shopName)} ➔
                      </a>
                    </div>
                  </div>
                  <div style="text-align: right; font-size: var(--font-size-xs); color: var(--neutral-600);">
                    <div>📍 ${Utils.escapeHTML(shop.area || 'Bengaluru')}</div>
                    <div style="font-size: 11px; color: #059669; font-weight: 600;">✓ Local Storefront Verified</div>
                  </div>
                </div>

                <!-- Price Box with Promotional Discounts -->
                <div class="product-price-box" style="margin-bottom: var(--space-3);">
                  <div style="display: flex; align-items: baseline; gap: var(--space-3); flex-wrap: wrap;">
                    <div class="product-main-price" style="font-family: var(--font-family-display); font-size: 2rem; font-weight: 800; color: var(--primary-900);">
                      ${Utils.formatINR(currPrice)}
                    </div>
                    ${discountPercent > 0 ? `
                      <span style="font-size: 1.2rem; color: #94a3b8; text-decoration: line-through;">
                        ${Utils.formatINR(origPrice)}
                      </span>
                      <span class="badge" style="background: #fef2f2; color: #dc2626; border: 1px solid #fee2e2; font-weight: 700;">
                        Save ${Utils.formatINR(discountAmount)} (${discountPercent}% OFF)
                      </span>
                    ` : ''}
                  </div>
                  <span style="font-size: var(--font-size-xs); color: var(--neutral-500);">Direct neighbourhood shop price (Inclusive of all local GST)</span>
                </div>

                <!-- Stock Availability Indicator -->
                <div class="product-stock-indicator" style="margin-bottom: var(--space-3);">
                  ${stockBadgeHtml}
                </div>

                <!-- Product Description -->
                <div class="product-description-text" style="color: var(--neutral-700); font-size: var(--font-size-sm); line-height: 1.6; margin-bottom: var(--space-4);">
                  ${Utils.escapeHTML(product.description)}
                </div>

                <!-- Technical / Product Attributes -->
                ${product.attributes && Object.keys(product.attributes).length > 0 ? `
                  <div class="specs-table-wrapper" style="margin-bottom: var(--space-4);">
                    <div class="specs-title" style="font-size: var(--font-size-xs); font-weight: 700; text-transform: uppercase; color: var(--neutral-500); margin-bottom: 6px;">
                      Product Specifications
                    </div>
                    <table class="specs-table" style="width: 100%; font-size: 12px;">
                      <tbody>
                        ${Object.entries(product.attributes).map(([key, val]) => `
                          <tr>
                            <td class="specs-label" style="font-weight: 600; color: var(--neutral-600); padding: 4px 0;">${Utils.escapeHTML(key)}:</td>
                            <td class="specs-val" style="color: var(--neutral-900); padding: 4px 0;">${Utils.escapeHTML(val)}</td>
                          </tr>
                        `).join('')}
                      </tbody>
                    </table>
                  </div>
                ` : ''}
              </div>

              <!-- Purchase & Compare Actions -->
              <div class="purchase-action-panel" style="border-top: 1px solid var(--color-border-subtle); padding-top: var(--space-4);">
                <div class="purchase-actions-row" style="display: flex; gap: var(--space-3); flex-wrap: wrap; align-items: flex-end;">
                  
                  <!-- Quantity Selector -->
                  <div style="display: flex; flex-direction: column; gap: 4px;">
                    <label for="detail-qty-val" style="font-size: var(--font-size-xs); font-weight: 700; color: var(--neutral-700);">
                      Quantity (Stock: ${product.stock}):
                    </label>
                    <div class="qty-stepper">
                      <button 
                        type="button" 
                        class="qty-btn" 
                        id="btn-qty-minus" 
                        ${isOutOfStock ? 'disabled' : ''} 
                        aria-label="Decrease quantity"
                      >
                        ${Utils.icons.minus}
                      </button>
                      <input 
                        type="text" 
                        id="detail-qty-val" 
                        class="qty-value" 
                        value="${isOutOfStock ? '0' : '1'}" 
                        readonly 
                        aria-label="Current quantity"
                      />
                      <button 
                        type="button" 
                        class="qty-btn" 
                        id="btn-qty-plus" 
                        ${isOutOfStock || product.stock <= 1 ? 'disabled' : ''} 
                        aria-label="Increase quantity"
                      >
                        ${Utils.icons.plus}
                      </button>
                    </div>
                  </div>

                  <!-- Add to Cart Button -->
                  <button 
                    type="button" 
                    class="btn btn-lg ${isOutOfStock ? 'btn-secondary' : 'btn-primary'}" 
                    id="btn-detail-add-cart" 
                    style="flex: 1; min-width: 170px;"
                    ${isOutOfStock ? 'disabled aria-disabled="true"' : ''}
                  >
                    ${isOutOfStock ? 'Out of Stock' : `${Utils.icons.cart} Add to Cart`}
                  </button>

                  <!-- Buy Now Button -->
                  <button 
                    type="button" 
                    class="btn btn-lg" 
                    id="btn-detail-buy-now" 
                    style="background: #047857; color: white; border: none; font-weight: 700;"
                    ${isOutOfStock ? 'disabled aria-disabled="true"' : ''}
                  >
                    ⚡ Buy Now
                  </button>

                  <!-- Compare Toggle Button -->
                  <button 
                    type="button" 
                    class="btn btn-lg ${isInCompare ? 'btn-primary' : 'btn-outline'}" 
                    id="btn-detail-toggle-compare" 
                    title="Compare specifications with other products"
                  >
                    ${isInCompare ? `${Utils.icons.check} Comparing` : `${Utils.icons.compare} Compare`}
                  </button>

                </div>
              </div>

            </div>

          </div>

          <!-- Verified Customer Reviews Section -->
          <div class="product-reviews-section" style="margin-top: var(--space-8); background: white; padding: var(--space-6); border-radius: var(--radius-xl); border: 1px solid var(--color-border); box-shadow: var(--shadow-sm);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-4); border-bottom: 1px solid var(--color-border-subtle); padding-bottom: var(--space-3); flex-wrap: wrap; gap: var(--space-2);">
              <div>
                <h3 style="font-family: var(--font-family-display); font-size: 1.35rem; margin: 0 0 2px; color: var(--neutral-900);">
                  Verified Customer Reviews
                </h3>
                <p style="font-size: var(--font-size-xs); color: var(--neutral-500); margin: 0;">
                  Authentic ratings and feedback from local buyers who purchased this item.
                </p>
              </div>
              <button type="button" class="btn btn-outline btn-sm" id="btn-toggle-review-form">
                ✍️ Write a Review
              </button>
            </div>

            <!-- Review Submission Form (Hidden by default) -->
            <div id="review-form-container" class="review-form-card" style="display: none;">
              <div class="review-form-header">
                <h4>Share Your Experience With This Item</h4>
                <span style="font-size: 0.75rem; color: #64748b;">Feedback helps your neighbourhood community</span>
              </div>

              <div class="verified-policy-banner">
                <span>🛡️</span>
                <span><strong>Verified Buyer Guarantee:</strong> Only customers with a confirmed purchase of this product from this merchant can submit a verified review.</span>
              </div>

              <form id="product-review-form">
                <div class="form-group">
                  <label class="form-label" for="review-rating-select">Your Rating <span style="color: #dc2626;">*</span></label>
                  <select id="review-rating-select" class="form-control" style="max-width: 260px; font-weight: 600;">
                    <option value="5">★★★★★ (5 Stars - Excellent Quality)</option>
                    <option value="4">★★★★☆ (4 Stars - Very Good)</option>
                    <option value="3">★★★☆☆ (3 Stars - Average)</option>
                    <option value="2">★★☆☆☆ (2 Stars - Below Expectations)</option>
                    <option value="1">★☆☆☆☆ (1 Star - Poor)</option>
                  </select>
                </div>

                <div class="form-group">
                  <label class="form-label" for="review-comment-input">Your Review & Comments <span style="color: #dc2626;">*</span></label>
                  <textarea id="review-comment-input" class="form-control" rows="4" placeholder="How was the product quality, packaging, and merchant fulfillment? (minimum 5 characters)" required minlength="5"></textarea>
                </div>

                <div class="review-form-actions">
                  <button type="submit" class="btn btn-primary" id="btn-submit-review" style="padding: 10px 22px; font-weight: 700;">
                    Submit Verified Review
                  </button>
                  <button type="button" class="btn btn-secondary" id="btn-cancel-review" style="padding: 10px 18px;">
                    Cancel
                  </button>
                </div>
              </form>
            </div>

            <!-- Reviews List Container -->
            <div id="reviews-list-container">
              <div style="text-align: center; padding: var(--space-4); color: var(--neutral-500); font-size: var(--font-size-sm);">
                Loading verified customer reviews...
              </div>
            </div>
          </div>

          <!-- Related Products Section -->
          ${relatedProducts.length > 0 ? `
            <div style="margin-top: var(--space-8);">
              <div class="section-header" style="margin-bottom: var(--space-4);">
                <div>
                  <h3 class="section-title" style="font-size: 1.35rem; margin: 0 0 2px;">More in ${Utils.escapeHTML(product.category)}</h3>
                  <p class="section-subtitle" style="margin: 0;">Other products you might like from neighbourhood shops</p>
                </div>
              </div>
              <div class="product-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: var(--space-4);">
                ${relatedProducts.map(p => ProductCard.render(p)).join('')}
              </div>
            </div>
          ` : ''}

        </div>
      </section>
    `;
  },

  async loadReviews(productId) {
    const container = document.getElementById('reviews-list-container');
    if (!container) return;

    try {
      let reviews = [];
      if (typeof fetch !== 'undefined') {
        const res = await fetch(`/api/reviews?product_id=${encodeURIComponent(productId)}`);
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          reviews = json.data;
        }
      }

      if (reviews.length === 0) {
        container.innerHTML = `
          <div style="text-align: center; padding: var(--space-6); color: var(--neutral-500); font-size: var(--font-size-sm);">
            No customer reviews yet. Be the first verified buyer to leave a review!
          </div>
        `;
        return;
      }

      container.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: var(--space-3);">
          ${reviews.map(rev => `
            <div style="background: var(--neutral-50); border: 1px solid var(--color-border-subtle); border-radius: var(--radius-md); padding: var(--space-3) var(--space-4);">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                <div style="display: flex; align-items: center; gap: var(--space-2);">
                  <strong style="font-size: var(--font-size-sm); color: var(--neutral-900);">${Utils.escapeHTML(rev.customer_name || 'Customer')}</strong>
                  ${rev.is_verified_purchase ? `
                    <span class="badge" style="background: #ecfdf5; color: #047857; border: 1px solid #a7f3d0; font-size: 10px;">
                      ✓ Verified Purchase
                    </span>
                  ` : ''}
                </div>
                <div style="color: #f59e0b; font-size: 13px;">
                  ${'★'.repeat(rev.rating)}${'☆'.repeat(5 - rev.rating)}
                </div>
              </div>
              <p style="font-size: var(--font-size-sm); color: var(--neutral-700); margin: 0 0 4px; line-height: 1.5;">
                ${Utils.escapeHTML(rev.comment)}
              </p>
              <div style="font-size: 11px; color: var(--neutral-400);">
                ${rev.created_at ? Utils.formatDate(rev.created_at) : 'Recent review'}
              </div>
            </div>
          `).join('')}
        </div>
      `;
    } catch (e) {
      container.innerHTML = `
        <div style="text-align: center; padding: var(--space-4); color: var(--neutral-400); font-size: var(--font-size-xs);">
          Reviews could not be loaded at this moment.
        </div>
      `;
    }
  },

  initListeners(productId) {
    const product = Store.getProductById(productId);
    if (!product) return;

    let selectedQty = product.stock > 0 ? 1 : 0;
    const qtyInput = document.getElementById('detail-qty-val');
    const plusBtn = document.getElementById('btn-qty-plus');
    const minusBtn = document.getElementById('btn-qty-minus');
    const addCartBtn = document.getElementById('btn-detail-add-cart');
    const buyNowBtn = document.getElementById('btn-detail-buy-now');
    const compareBtn = document.getElementById('btn-detail-toggle-compare');

    const updateControls = () => {
      if (qtyInput) qtyInput.value = selectedQty;
      if (minusBtn) minusBtn.disabled = selectedQty <= 1;
      if (plusBtn) plusBtn.disabled = selectedQty >= product.stock;
    };

    if (plusBtn && minusBtn) {
      plusBtn.addEventListener('click', () => {
        if (selectedQty < product.stock) {
          selectedQty++;
          updateControls();
        } else {
          Utils.showToast(`Cannot add more than available stock (${product.stock} units).`, 'warning');
        }
      });

      minusBtn.addEventListener('click', () => {
        if (selectedQty > 1) {
          selectedQty--;
          updateControls();
        }
      });
    }

    if (addCartBtn) {
      addCartBtn.addEventListener('click', () => {
        if (product.stock <= 0) {
          Utils.showToast('This product is out of stock.', 'error');
          return;
        }

        // Guest shopping protection
        if (typeof Store.isAuthenticated === 'function' && !Store.isAuthenticated()) {
          if (typeof AuthModal !== 'undefined') {
            AuthModal.open('customer', 'login', () => {
              const res = Store.addToCart(product.id, selectedQty);
              if (res.success) Utils.showToast(res.message, 'success');
            });
          }
          return;
        }

        const result = Store.addToCart(product.id, selectedQty);
        if (result.success) {
          Utils.showToast(result.message, result.partial ? 'warning' : 'success');
        } else {
          Utils.showToast(result.message, 'warning');
        }
      });
    }

    if (buyNowBtn) {
      buyNowBtn.addEventListener('click', () => {
        if (product.stock <= 0) {
          Utils.showToast('This product is out of stock.', 'error');
          return;
        }

        // Guest shopping protection
        if (typeof Store.isAuthenticated === 'function' && !Store.isAuthenticated()) {
          if (typeof AuthModal !== 'undefined') {
            AuthModal.open('customer', 'login', () => {
              Store.addToCart(product.id, selectedQty);
              window.location.hash = '#cart';
            });
          }
          return;
        }

        Store.addToCart(product.id, selectedQty);
        window.location.hash = '#cart';
      });
    }

    if (compareBtn) {
      compareBtn.addEventListener('click', () => {
        const compareList = Store.getCompareList();
        const isInCompare = compareList.some(p => p.id === product.id);

        if (isInCompare) {
          Store.removeFromCompare(product.id);
          Utils.showToast(`Removed "${product.name}" from comparison`, 'info');
          if (typeof App !== 'undefined') App.renderCurrentRoute();
        } else {
          const res = Store.addToCompare(product.id);
          if (res.success) {
            Utils.showToast(res.message, 'success');
            if (typeof App !== 'undefined') App.renderCurrentRoute();
          } else {
            Utils.showToast(res.message, 'warning');
          }
        }
      });
    }

    // Reviews Form Toggle and Submission
    const toggleReviewBtn = document.getElementById('btn-toggle-review-form');
    const formContainer = document.getElementById('review-form-container');
    const cancelReviewBtn = document.getElementById('btn-cancel-review');
    const reviewForm = document.getElementById('product-review-form');

    if (toggleReviewBtn && formContainer) {
      toggleReviewBtn.addEventListener('click', () => {
        if (typeof Store.isAuthenticated === 'function' && !Store.isAuthenticated()) {
          if (typeof AuthModal !== 'undefined') {
            AuthModal.open('customer', 'login', () => {
              formContainer.style.display = 'block';
            });
          }
          return;
        }
        formContainer.style.display = formContainer.style.display === 'none' ? 'block' : 'none';
      });
    }

    if (cancelReviewBtn && formContainer) {
      cancelReviewBtn.addEventListener('click', () => {
        formContainer.style.display = 'none';
      });
    }

    if (reviewForm) {
      reviewForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const rating = document.getElementById('review-rating-select').value;
        const comment = document.getElementById('review-comment-input').value;

        const token = Store.getAuthToken ? Store.getAuthToken() : null;
        if (!token) {
          Utils.showToast('Please sign in to submit a review.', 'warning');
          if (typeof AuthModal !== 'undefined') AuthModal.open('customer', 'login');
          return;
        }

        try {
          const res = await fetch('/api/reviews', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              productId: product.id,
              rating: parseInt(rating, 10),
              comment
            })
          });

          const data = await res.json();
          if (data.success) {
            Utils.showToast(data.message, 'success');
            reviewForm.reset();
            formContainer.style.display = 'none';
            ProductView.loadReviews(product.id);
          } else {
            Utils.showToast(data.message || 'Failed to submit review.', 'error');
          }
        } catch (err) {
          Utils.showToast('Network error while submitting review.', 'error');
        }
      });
    }

    // Load existing reviews
    this.loadReviews(product.id);
  }
};
