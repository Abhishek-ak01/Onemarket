/**
 * LocalLoop - Product Search & Discovery (Catalog View)
 * Interactive multi-faceted search, filters (category, area, price, stock, shop, rating),
 * sorting (price, discount, rating, name), active filter pills, and dynamic results.
 */

const CatalogView = {
  // Current search & filter state
  filterState: {
    query: '',
    category: 'All',
    shopId: 'All',
    area: 'All',
    minPrice: '',
    maxPrice: '',
    inStockOnly: false,
    minRating: 0,
    sortBy: 'featured' // 'featured', 'price-asc', 'price-desc', 'discount-desc', 'name-asc', 'rating-desc'
  },

  render(queryParams = {}) {
    // Sync state from query parameters if provided
    if (queryParams.category) this.filterState.category = queryParams.category;
    if (queryParams.shop) this.filterState.shopId = queryParams.shop;
    if (queryParams.area) this.filterState.area = queryParams.area;
    if (queryParams.q) this.filterState.query = queryParams.q;

    const shops = Store.getShops();
    const areas = Array.from(new Set(shops.map(s => s.area).filter(Boolean)));
    const filteredProducts = this.getFilteredProducts();

    return `
      <section class="catalog-page">
        <div class="container">
          
          <!-- Breadcrumb navigation -->
          <nav class="breadcrumbs" aria-label="Breadcrumb">
            <a href="#home">Home</a>
            <span>/</span>
            <span style="color: var(--neutral-900); font-weight: 600;">Product Catalog</span>
            ${this.filterState.category !== 'All' ? `<span>/</span><span style="color: var(--primary-700); font-weight: 600;">${Utils.escapeHTML(this.filterState.category)}</span>` : ''}
          </nav>

          <div class="catalog-layout">
            
            <!-- Sidebar Filters -->
            <aside class="filters-sidebar" aria-label="Product Filters">
              <div class="filters-header">
                <h3 style="font-size: 1.1rem; font-weight: 800; color: var(--neutral-900); display: flex; align-items: center; gap: 8px; margin: 0;">
                  ${Utils.icons.filter} Filters
                </h3>
                <button type="button" class="btn btn-sm btn-outline" id="btn-clear-filters" style="padding: 4px 10px; font-size: 0.75rem; font-weight: 700;">
                  Clear All
                </button>
              </div>

              <!-- Filter: Category -->
              <div class="filter-group">
                <div class="filter-title">Category</div>
                <div class="filter-options-list">
                  <label class="filter-radio-row">
                    <input type="radio" name="filter-category" value="All" ${this.filterState.category === 'All' ? 'checked' : ''} />
                    <span class="cat-label-name">All Categories</span>
                    <span class="cat-count-badge">${Store.getProducts().length}</span>
                  </label>
                  ${CATEGORIES.map(cat => {
                    const count = Store.getProducts().filter(p => p.category.toLowerCase() === cat.name.toLowerCase()).length;
                    return `
                      <label class="filter-radio-row">
                        <input type="radio" name="filter-category" value="${cat.name}" ${this.filterState.category.toLowerCase() === cat.name.toLowerCase() ? 'checked' : ''} />
                        <span class="cat-label-name">${Utils.escapeHTML(cat.name)}</span>
                        <span class="cat-count-badge">${count}</span>
                      </label>
                    `;
                  }).join('')}
                </div>
              </div>

              <!-- Filter: Neighbourhood Area -->
              <div class="filter-group">
                <div class="filter-title">Hubballi Neighbourhood</div>
                <select id="filter-area-select" class="form-select" style="width: 100%; height: 38px; border-radius: 8px; font-size: 0.85rem; padding: 6px 10px; border: 1.5px solid var(--neutral-300);">
                  <option value="All" ${this.filterState.area === 'All' ? 'selected' : ''}>All Areas in Hubballi</option>
                  ${areas.map(area => `
                    <option value="${area}" ${this.filterState.area === area ? 'selected' : ''}>
                      📍 ${Utils.escapeHTML(area)}
                    </option>
                  `).join('')}
                </select>
              </div>

              <!-- Filter: Shop / Seller -->
              <div class="filter-group">
                <div class="filter-title">Local Merchant / Shop</div>
                <select id="filter-shop-select" class="form-select" style="font-size: var(--font-size-xs);">
                  <option value="All">All Local Shops</option>
                  ${shops.map(shop => `
                    <option value="${shop.id}" ${this.filterState.shopId === shop.id ? 'selected' : ''}>
                      ${Utils.escapeHTML(shop.name)} (${Utils.escapeHTML(shop.area)})
                    </option>
                  `).join('')}
                </select>
              </div>

              <!-- Filter: Price Range -->
              <div class="filter-group">
                <div class="filter-title">Price Range (₹)</div>
                <div class="price-range-inputs">
                  <input 
                    type="number" 
                    id="filter-min-price" 
                    class="price-range-input" 
                    placeholder="Min ₹" 
                    min="0" 
                    value="${this.filterState.minPrice}" 
                  />
                  <span style="color: var(--neutral-400); font-weight: 700;">–</span>
                  <input 
                    type="number" 
                    id="filter-max-price" 
                    class="price-range-input" 
                    placeholder="Max ₹" 
                    min="0" 
                    value="${this.filterState.maxPrice}" 
                  />
                </div>
              </div>

              <!-- Filter: Stock Status -->
              <div class="filter-group">
                <div class="filter-title">Availability</div>
                <label class="filter-checkbox-label">
                  <input type="checkbox" id="filter-in-stock" ${this.filterState.inStockOnly ? 'checked' : ''} />
                  <span>In Stock Only</span>
                </label>
              </div>

              <!-- Filter: Rating -->
              <div class="filter-group">
                <div class="filter-title">Customer Rating</div>
                <div class="filter-options-list">
                  <label class="filter-checkbox-label">
                    <input type="radio" name="filter-rating" value="0" ${this.filterState.minRating === 0 ? 'checked' : ''} />
                    <span>Any Rating</span>
                  </label>
                  <label class="filter-checkbox-label">
                    <input type="radio" name="filter-rating" value="4.5" ${this.filterState.minRating === 4.5 ? 'checked' : ''} />
                    <span>4.5 ★ & above</span>
                  </label>
                  <label class="filter-checkbox-label">
                    <input type="radio" name="filter-rating" value="4.0" ${this.filterState.minRating === 4.0 ? 'checked' : ''} />
                    <span>4.0 ★ & above</span>
                  </label>
                </div>
              </div>

            </aside>

            <!-- Main Results Area -->
            <main class="catalog-main" aria-label="Catalog Products">
              
              <!-- Toolbar -->
              <div class="catalog-toolbar">
                
                <!-- Live Search Box -->
                <div class="catalog-search-input-wrapper">
                  <span class="search-icon">${Utils.icons.search}</span>
                  <input 
                    type="text" 
                    id="catalog-search-field" 
                    class="catalog-search-input" 
                    placeholder="Search by product name, category, shop, or area..." 
                    value="${Utils.escapeHTML(this.filterState.query)}" 
                  />
                </div>

                <!-- Sort & Results count -->
                <div class="catalog-sort-wrapper">
                  <span style="font-size: var(--font-size-xs); color: var(--neutral-600); font-weight: 600;">
                    <strong>${filteredProducts.length}</strong> products found
                  </span>

                  <label for="catalog-sort-select" class="visually-hidden">Sort by</label>
                  <select id="catalog-sort-select" class="form-select" style="width: auto; font-size: var(--font-size-xs); padding: 0.45rem 0.75rem;">
                    <option value="featured" ${this.filterState.sortBy === 'featured' ? 'selected' : ''}>Featured First</option>
                    <option value="discount-desc" ${this.filterState.sortBy === 'discount-desc' ? 'selected' : ''}>🔥 Biggest Discounts (% OFF)</option>
                    <option value="price-asc" ${this.filterState.sortBy === 'price-asc' ? 'selected' : ''}>Price: Low to High</option>
                    <option value="price-desc" ${this.filterState.sortBy === 'price-desc' ? 'selected' : ''}>Price: High to Low</option>
                    <option value="name-asc" ${this.filterState.sortBy === 'name-asc' ? 'selected' : ''}>Name: A to Z</option>
                    <option value="rating-desc" ${this.filterState.sortBy === 'rating-desc' ? 'selected' : ''}>Top Customer Rating</option>
                  </select>
                </div>

              </div>

              <!-- Active Filter Tags -->
              ${this.renderActiveFilterTags()}

              <!-- Products Grid or Empty State -->
              <div id="catalog-products-container">
                ${this.renderProductsList(filteredProducts)}
              </div>

            </main>

          </div>
        </div>
      </section>
    `;
  },

  renderActiveFilterTags() {
    const tags = [];

    if (this.filterState.query) {
      tags.push({ key: 'query', label: `Search: "${this.filterState.query}"` });
    }
    if (this.filterState.category && this.filterState.category !== 'All') {
      tags.push({ key: 'category', label: `Category: ${this.filterState.category}` });
    }
    if (this.filterState.area && this.filterState.area !== 'All') {
      tags.push({ key: 'area', label: `Area: ${this.filterState.area}` });
    }
    if (this.filterState.shopId && this.filterState.shopId !== 'All') {
      const shop = Store.getShopById(this.filterState.shopId);
      tags.push({ key: 'shopId', label: `Shop: ${shop ? shop.name : this.filterState.shopId}` });
    }
    if (this.filterState.minPrice) {
      tags.push({ key: 'minPrice', label: `Min: ₹${this.filterState.minPrice}` });
    }
    if (this.filterState.maxPrice) {
      tags.push({ key: 'maxPrice', label: `Max: ₹${this.filterState.maxPrice}` });
    }
    if (this.filterState.inStockOnly) {
      tags.push({ key: 'inStockOnly', label: 'In Stock Only' });
    }
    if (this.filterState.minRating > 0) {
      tags.push({ key: 'minRating', label: `${this.filterState.minRating}★ & above` });
    }

    if (tags.length === 0) return '';

    return `
      <div class="active-filter-tags">
        <span style="font-size: var(--font-size-xs); color: var(--neutral-500); font-weight: 600;">Active Filters:</span>
        ${tags.map(tag => `
          <span class="filter-tag">
            ${Utils.escapeHTML(tag.label)}
            <button type="button" class="filter-tag-remove" data-filter-key="${tag.key}" aria-label="Remove filter ${tag.label}">
              ${Utils.icons.close}
            </button>
          </span>
        `).join('')}
      </div>
    `;
  },

  renderProductsList(products) {
    if (products.length === 0) {
      return `
        <div class="empty-state">
          <div class="empty-state-icon">
            ${Utils.icons.search}
          </div>
          <h3 class="empty-state-title">No products match your criteria</h3>
          <p class="empty-state-desc">
            We couldn't find any neighbourhood listings matching your current search query and filter combination.
          </p>
          <button type="button" class="btn btn-primary" id="btn-empty-reset-filters">
            Reset Filters & View All
          </button>
        </div>
      `;
    }

    return `
      <div class="product-grid">
        ${products.map(p => ProductCard.render(p)).join('')}
      </div>
    `;
  },

  getFilteredProducts() {
    let list = Store.getProducts();
    const { query, category, shopId, area, minPrice, maxPrice, inStockOnly, minRating, sortBy } = this.filterState;

    // Search query filter (matches name, category, shopName, or description)
    if (query) {
      const q = query.trim().toLowerCase();
      list = list.filter(p => {
        const shop = Store.getShopById(p.shopId) || {};
        return (
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.shopName.toLowerCase().includes(q) ||
          (shop.area && shop.area.toLowerCase().includes(q)) ||
          (p.description && p.description.toLowerCase().includes(q))
        );
      });
    }

    // Category filter
    if (category && category !== 'All') {
      list = list.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }

    // Area filter
    if (area && area !== 'All') {
      list = list.filter(p => {
        const shop = Store.getShopById(p.shopId) || {};
        return shop.area === area;
      });
    }

    // Shop filter
    if (shopId && shopId !== 'All') {
      list = list.filter(p => p.shopId === shopId);
    }

    // Price range filters
    if (minPrice !== '' && !isNaN(minPrice)) {
      list = list.filter(p => p.price >= Number(minPrice));
    }
    if (maxPrice !== '' && !isNaN(maxPrice)) {
      list = list.filter(p => p.price <= Number(maxPrice));
    }

    // Stock availability filter
    if (inStockOnly) {
      list = list.filter(p => p.stock > 0);
    }

    // Rating filter
    if (minRating > 0) {
      list = list.filter(p => p.rating && p.rating >= minRating);
    }

    // Sorting
    list = [...list].sort((a, b) => {
      switch (sortBy) {
        case 'discount-desc': {
          const discA = (a.originalPrice && a.originalPrice > a.price) ? ((a.originalPrice - a.price) / a.originalPrice) : 0;
          const discB = (b.originalPrice && b.originalPrice > b.price) ? ((b.originalPrice - b.price) / b.originalPrice) : 0;
          return discB - discA;
        }
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'rating-desc':
          return (b.rating || 0) - (a.rating || 0);
        case 'featured':
        default:
          return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
      }
    });

    return list;
  },

  initListeners() {
    // Real-time search field
    const searchField = document.getElementById('catalog-search-field');
    if (searchField) {
      searchField.addEventListener('input', (e) => {
        this.filterState.query = e.target.value.trim();
        this.updateResults();
      });
    }

    // Category radio buttons
    document.querySelectorAll('input[name="filter-category"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        this.filterState.category = e.target.value;
        this.updateResults();
      });
    });

    // Area dropdown
    const areaSelect = document.getElementById('filter-area-select');
    if (areaSelect) {
      areaSelect.addEventListener('change', (e) => {
        this.filterState.area = e.target.value;
        this.updateResults();
      });
    }

    // Shop dropdown
    const shopSelect = document.getElementById('filter-shop-select');
    if (shopSelect) {
      shopSelect.addEventListener('change', (e) => {
        this.filterState.shopId = e.target.value;
        this.updateResults();
      });
    }

    // Min & Max Price
    const minPriceInput = document.getElementById('filter-min-price');
    const maxPriceInput = document.getElementById('filter-max-price');

    if (minPriceInput) {
      minPriceInput.addEventListener('input', (e) => {
        this.filterState.minPrice = e.target.value;
        this.updateResults();
      });
    }
    if (maxPriceInput) {
      maxPriceInput.addEventListener('input', (e) => {
        this.filterState.maxPrice = e.target.value;
        this.updateResults();
      });
    }

    // In Stock Only checkbox
    const inStockCheckbox = document.getElementById('filter-in-stock');
    if (inStockCheckbox) {
      inStockCheckbox.addEventListener('change', (e) => {
        this.filterState.inStockOnly = e.target.checked;
        this.updateResults();
      });
    }

    // Rating radios
    document.querySelectorAll('input[name="filter-rating"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        this.filterState.minRating = Number(e.target.value) || 0;
        this.updateResults();
      });
    });

    // Sorting dropdown
    const sortSelect = document.getElementById('catalog-sort-select');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        this.filterState.sortBy = e.target.value;
        this.updateResults();
      });
    }

    // Clear filters button
    const clearBtn = document.getElementById('btn-clear-filters');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => this.resetFilters());
    }

    // Delegated click for removing active filter tags
    document.addEventListener('click', (e) => {
      const tagBtn = e.target.closest('.filter-tag-remove');
      if (tagBtn) {
        const key = tagBtn.dataset.filterKey;
        if (key === 'query') this.filterState.query = '';
        if (key === 'category') this.filterState.category = 'All';
        if (key === 'shopId') this.filterState.shopId = 'All';
        if (key === 'area') this.filterState.area = 'All';
        if (key === 'minPrice') this.filterState.minPrice = '';
        if (key === 'maxPrice') this.filterState.maxPrice = '';
        if (key === 'inStockOnly') this.filterState.inStockOnly = false;
        if (key === 'minRating') this.filterState.minRating = 0;

        if (typeof App !== 'undefined') App.renderCurrentRoute();
      }

      if (e.target.id === 'btn-empty-reset-filters') {
        this.resetFilters();
      }
    });
  },

  updateResults() {
    const products = this.getFilteredProducts();
    const container = document.getElementById('catalog-products-container');
    if (container) {
      container.innerHTML = this.renderProductsList(products);
    }
  },

  resetFilters() {
    this.filterState = {
      query: '',
      category: 'All',
      shopId: 'All',
      area: 'All',
      minPrice: '',
      maxPrice: '',
      inStockOnly: false,
      minRating: 0,
      sortBy: 'featured'
    };
    window.location.hash = '#catalog';
    if (typeof App !== 'undefined') App.renderCurrentRoute();
    Utils.showToast('All search filters reset', 'info');
  }
};
