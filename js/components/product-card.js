/**
 * LocalLoop - Reusable Product Card Component
 * Produces clean, accessible product cards with stock status, ratings,
 * Add to Cart validation, and Compare toggle.
 */

const ProductCard = {
  render(product) {
    if (!product) return '';

    const compareList = Store.getCompareList();
    const isInCompare = compareList.some(p => p.id === product.id);
    const isOutOfStock = product.stock <= 0;
    const isLowStock = product.stock > 0 && product.stock <= LOW_STOCK_THRESHOLD;

    let stockBadgeHtml = '';
    if (isOutOfStock) {
      stockBadgeHtml = `<span class="badge badge-stock-out">Out of Stock</span>`;
    } else if (isLowStock) {
      stockBadgeHtml = `<span class="badge badge-stock-low">Only ${product.stock} Left</span>`;
    } else {
      stockBadgeHtml = `<span class="badge badge-stock-in">In Stock (${product.stock})</span>`;
    }

    const fallbackImg = Utils.getFallbackImageSvg(product.category, product.name);

    return `
      <article class="product-card" id="card-${product.id}" data-id="${product.id}">
        
        <!-- Media / Thumbnail -->
        <div class="product-media" onclick="window.location.hash = '#product/${product.id}'">
          <img 
            src="${Utils.escapeHTML(product.image)}" 
            alt="${Utils.escapeHTML(product.name)}" 
            class="product-image"
            loading="lazy"
            onerror="this.onerror=null; this.src='${fallbackImg}';"
          />
          <div class="product-badge-overlay">
            <span class="badge badge-category">${Utils.escapeHTML(product.category)}</span>
          </div>
          <div class="product-stock-badge">
            ${stockBadgeHtml}
          </div>
        </div>

        <!-- Content -->
        <div class="product-content">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px;">
            <a href="#store/${encodeURIComponent(product.shopId)}" class="product-shop-link" title="Visit Storefront: ${Utils.escapeHTML(product.shopName)}">
              ${Utils.icons.shop}
              <span>${Utils.escapeHTML(product.shopName)}</span>
            </a>
            ${product.discountPercent > 0 ? `
              <span class="discount-badge">-${product.discountPercent}%</span>
            ` : ''}
          </div>

          <h3 class="product-title" onclick="window.location.hash = '#product/${product.id}'" title="${Utils.escapeHTML(product.name)}">
            ${Utils.escapeHTML(product.name)}
          </h3>

          <!-- Rating & Reviews -->
          <div class="product-rating-row">
            ${product.rating ? `
              <span class="star-rating">
                ${Utils.icons.star}
                <span>${product.rating.toFixed(1)}</span>
              </span>
              <span class="reviews-count">(${product.reviewsCount || 1} verified)</span>
            ` : `
              <span class="reviews-count" style="font-style: italic;">Local neighbourhood seller</span>
            `}
          </div>

          <!-- Price & Actions Row -->
          <div class="product-price-row">
            <div class="price-discount-wrap">
              <span class="product-price">${Utils.formatINR(product.price)}</span>
              ${product.originalPrice && product.originalPrice > product.price ? `
                <span class="price-original">${Utils.formatINR(product.originalPrice)}</span>
              ` : ''}
            </div>

            <div class="product-card-actions">
              
              <!-- Compare Toggle Button -->
              <button 
                type="button" 
                class="btn-compare-toggle ${isInCompare ? 'in-compare' : ''}" 
                data-action="toggle-compare" 
                data-product-id="${product.id}"
                title="${isInCompare ? 'Remove from comparison' : 'Add to comparison matrix'}"
                aria-label="Compare ${Utils.escapeHTML(product.name)}"
              >
                ${isInCompare ? Utils.icons.check : Utils.icons.compare}
              </button>

              <!-- Add to Cart Button -->
              <button 
                type="button" 
                class="btn btn-sm ${isOutOfStock ? 'btn-secondary' : 'btn-primary'}" 
                data-action="add-to-cart" 
                data-product-id="${product.id}"
                ${isOutOfStock ? 'disabled aria-disabled="true"' : ''}
              >
                ${isOutOfStock ? 'Out of Stock' : `${Utils.icons.plus} Cart`}
              </button>

            </div>
          </div>

        </div>

      </article>
    `;
  }
};
