/**
 * LocalLoop - Smart Product Comparison View
 * Compare up to 3 products across different sellers with lowest-price badge,
 * detailed attribute inspection, and direct Add-to-Cart actions.
 */

const CompareView = {
  render() {
    const compareProducts = Store.getCompareList();

    if (compareProducts.length === 0) {
      return `
        <section class="compare-page">
          <div class="container">
            <div class="empty-state">
              <div class="empty-state-icon">
                ${Utils.icons.compare}
              </div>
              <h2 class="empty-state-title">No Products in Comparison</h2>
              <p class="empty-state-desc">
                Select up to 3 products from different neighbourhood shops to compare their prices, specifications, and available stock side-by-side.
              </p>
              <a href="#catalog" class="btn btn-primary btn-lg">
                Browse Marketplace Products
              </a>
            </div>
          </div>
        </section>
      `;
    }

    // Find lowest price among currently compared products
    const minPrice = Math.min(...compareProducts.map(p => p.price));

    // Gather all distinct attribute keys across the compared items
    const allAttrKeys = new Set();
    compareProducts.forEach(p => {
      if (p.attributes) {
        Object.keys(p.attributes).forEach(k => allAttrKeys.add(k));
      }
    });
    const attrKeysList = Array.from(allAttrKeys);

    return `
      <section class="compare-page">
        <div class="container">
          
          <div class="section-header">
            <div>
              <span class="badge badge-accent" style="margin-bottom: var(--space-2);">Smart Comparison Engine</span>
              <h1 class="section-title">Product & Price Comparison</h1>
              <p class="section-subtitle">
                Comparing <strong>${compareProducts.length}</strong> of maximum 3 selected items across local sellers.
              </p>
            </div>
            
            <div style="display: flex; gap: var(--space-3); align-items: center;">
              <a href="#catalog" class="btn btn-outline btn-sm">
                ${Utils.icons.plus} Add Another Product
              </a>
              <button type="button" class="btn btn-secondary btn-sm" id="btn-clear-all-compare">
                ${Utils.icons.trash} Clear Matrix
              </button>
            </div>
          </div>

          <!-- Comparison Table Matrix -->
          <div class="compare-matrix-wrapper">
            <table class="compare-table" aria-label="Comparison Table">
              <thead>
                <tr>
                  <th class="compare-attr-col" style="vertical-align: middle;">Product Overview</th>
                  ${compareProducts.map(product => {
                    const fallbackImg = Utils.getFallbackImageSvg(product.category, product.name);
                    return `
                      <th class="compare-item-cell" style="width: calc((100% - 220px) / ${compareProducts.length});">
                        <div class="compare-item-header">
                          <button 
                            type="button" 
                            class="compare-remove-btn" 
                            data-action="remove-compare" 
                            data-product-id="${product.id}"
                            title="Remove from comparison"
                            aria-label="Remove ${Utils.escapeHTML(product.name)}"
                          >
                            ${Utils.icons.close}
                          </button>

                          <img 
                            src="${Utils.escapeHTML(product.image)}" 
                            alt="${Utils.escapeHTML(product.name)}" 
                            class="compare-thumb"
                            onerror="this.onerror=null; this.src='${fallbackImg}';"
                          />

                          <h3 class="compare-item-title">
                            <a href="#product/${product.id}" style="color: inherit;">
                              ${Utils.escapeHTML(product.name)}
                            </a>
                          </h3>
                        </div>
                      </th>
                    `;
                  }).join('')}
                </tr>
              </thead>

              <tbody>
                
                <!-- Row: Price -->
                <tr>
                  <td class="compare-attr-col">Local Price</td>
                  ${compareProducts.map(p => {
                    const isLowest = compareProducts.length > 1 && p.price === minPrice;
                    return `
                      <td class="compare-item-cell">
                        <span class="compare-price-badge">${Utils.formatINR(p.price)}</span>
                        ${isLowest ? `<span class="compare-lowest-pill">Lowest Price</span>` : ''}
                      </td>
                    `;
                  }).join('')}
                </tr>

                <!-- Row: Seller / Shop -->
                <tr>
                  <td class="compare-attr-col">Seller / Shop</td>
                  ${compareProducts.map(p => `
                    <td class="compare-item-cell">
                      <div style="font-weight: 700; color: var(--neutral-900);">${Utils.escapeHTML(p.shopName)}</div>
                      <a href="#catalog?shop=${encodeURIComponent(p.shopId)}" style="font-size: var(--font-size-xs); color: var(--primary-600);">
                        View Seller Profile
                      </a>
                    </td>
                  `).join('')}
                </tr>

                <!-- Row: Category -->
                <tr>
                  <td class="compare-attr-col">Category</td>
                  ${compareProducts.map(p => `
                    <td class="compare-item-cell">
                      <span class="badge badge-category">${Utils.escapeHTML(p.category)}</span>
                    </td>
                  `).join('')}
                </tr>

                <!-- Row: Availability -->
                <tr>
                  <td class="compare-attr-col">Stock Availability</td>
                  ${compareProducts.map(p => {
                    if (p.stock <= 0) {
                      return `<td class="compare-item-cell"><span class="badge badge-stock-out">Out of Stock</span></td>`;
                    } else if (p.stock <= LOW_STOCK_THRESHOLD) {
                      return `<td class="compare-item-cell"><span class="badge badge-stock-low">Low Stock (${p.stock} left)</span></td>`;
                    }
                    return `<td class="compare-item-cell"><span class="badge badge-stock-in">In Stock (${p.stock} units)</span></td>`;
                  }).join('')}
                </tr>

                <!-- Row: Rating -->
                <tr>
                  <td class="compare-attr-col">Customer Rating</td>
                  ${compareProducts.map(p => `
                    <td class="compare-item-cell">
                      ${p.rating ? `
                        <span class="star-rating">${Utils.icons.star} ${p.rating.toFixed(1)}</span>
                        <span style="font-size: var(--font-size-xs); color: var(--neutral-500); margin-left: 4px;">
                          (${p.reviewsCount || 1} reviews)
                        </span>
                      ` : `
                        <span style="font-size: var(--font-size-xs); color: var(--neutral-500);">Unrated new arrival</span>
                      `}
                    </td>
                  `).join('')}
                </tr>

                <!-- Rows: Dynamic Attributes -->
                ${attrKeysList.map(attrKey => `
                  <tr>
                    <td class="compare-attr-col">${Utils.escapeHTML(attrKey)}</td>
                    ${compareProducts.map(p => {
                      const val = p.attributes && p.attributes[attrKey] ? p.attributes[attrKey] : '—';
                      return `
                        <td class="compare-item-cell" style="font-size: var(--font-size-sm); color: var(--neutral-800);">
                          ${Utils.escapeHTML(val)}
                        </td>
                      `;
                    }).join('')}
                  </tr>
                `).join('')}

                <!-- Row: Action -->
                <tr>
                  <td class="compare-attr-col" style="vertical-align: middle;">Purchase Action</td>
                  ${compareProducts.map(p => `
                    <td class="compare-item-cell">
                      <button 
                        type="button" 
                        class="btn btn-sm ${p.stock <= 0 ? 'btn-secondary' : 'btn-primary'}" 
                        data-action="add-to-cart" 
                        data-product-id="${p.id}"
                        ${p.stock <= 0 ? 'disabled' : ''}
                      >
                        ${p.stock <= 0 ? 'Out of Stock' : `${Utils.icons.cart} Add to Order`}
                      </button>
                    </td>
                  `).join('')}
                </tr>

              </tbody>
            </table>
          </div>

        </div>
      </section>
    `;
  },

  initListeners() {
    const clearBtn = document.getElementById('btn-clear-all-compare');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        Store.clearCompare();
        Utils.showToast('Comparison matrix cleared', 'info');
        App.renderCurrentRoute();
      });
    }

    document.querySelectorAll('[data-action="remove-compare"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const prodId = btn.dataset.productId;
        Store.removeFromCompare(prodId);
        Utils.showToast('Item removed from comparison', 'info');
        App.renderCurrentRoute();
      });
    });
  }
};
