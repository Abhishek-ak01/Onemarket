/**
 * LocalLoop - Customer Marketplace Homepage View
 */

const HomeView = {
  render() {
    const products = Store.getProducts();
    const shops = Store.getShops();
    const featuredProducts = products.filter(p => p.isFeatured).slice(0, 8);
    const selectedLocation = Store.getSelectedLocation();

    return `
      <!-- Hero Section -->
      <section class="hero-section" aria-label="Welcome to OneMarket">
        <div class="container">
          <div class="hero-grid">
            
            <!-- Left Hero Content -->
            <div class="hero-content">
              <div class="hero-badge">
                ${Utils.icons.sparkles || Utils.icons.mapPin} Active Demo in ${Utils.escapeHTML(selectedLocation.name || 'Hubballi, Karnataka')}
              </div>

              <h1 class="hero-headline">
                Your neighbourhood has <span>more to offer.</span>
              </h1>

              <p class="hero-subheading">
                Discover local products in Hubballi, compare prices across independent neighbourhood merchants, and submit order requests without phone calls or store hopping.
              </p>

              <!-- Hero Search Bar -->
              <form class="hero-search-box" id="hero-search-form" onsubmit="event.preventDefault(); HomeView.handleHeroSearch();">
                <select id="hero-category-select" class="search-category-select" aria-label="Select category">
                  <option value="All">All Categories</option>
                  ${CATEGORIES.map(cat => `<option value="${cat.name}">${cat.name}</option>`).join('')}
                </select>

                <input 
                  type="text" 
                  id="hero-search-input" 
                  class="hero-search-input" 
                  placeholder="Search spices, electronics, books, handlooms in Hubballi..." 
                  aria-label="Search products"
                />

                <button type="submit" class="btn btn-primary hero-search-btn">
                  ${Utils.icons.search} <span>Search</span>
                </button>
              </form>

              <!-- Hero CTAs -->
              <div class="hero-cta-group">
                <a href="#catalog" class="btn btn-primary btn-lg">
                  Explore ${products.length} Products
                </a>
                <a href="#seller" class="btn btn-outline btn-lg">
                  Merchant Dashboard
                </a>
                <a href="#budget" class="btn btn-secondary btn-lg" style="background-color: var(--accent-100); color: var(--accent-700); border-color: var(--accent-600);">
                  ${Utils.icons.budgetBuddy} Try Budget Buddy
                </a>
              </div>
            </div>

            <!-- Right Hero Composition (Showcase) -->
            <div class="hero-showcase">
              <div class="showcase-composition">
                
                <!-- Main Preview Card -->
                <div class="showcase-card-main">
                  <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--space-3);">
                    <span class="badge badge-stock-in">Live Inventory</span>
                    <span style="font-size: var(--font-size-xs); color: var(--neutral-500); font-weight: 600;">Koppikar Road Market, Hubballi</span>
                  </div>
                  <img 
                    src="assets/product-images/prod-101.jpg" 
                    alt="Malabar Spices" 
                    style="width: 100%; height: 210px; object-fit: cover; border-radius: var(--radius-lg); margin-bottom: var(--space-3);"
                    onerror="this.onerror=null; this.src='assets/product-images/placeholder.svg';"
                  />
                  <h4 style="font-size: 1.1rem; color: var(--neutral-900); margin-bottom: 4px;">Wayanad Cardamom Pods</h4>
                  <div style="display: flex; align-items: center; justify-content: space-between;">
                    <span style="font-size: var(--font-size-xs); color: var(--neutral-600);">Malabar Heritage Spices (Hubballi)</span>
                    <strong style="color: var(--primary-900); font-size: 1.25rem;">₹340</strong>
                  </div>
                </div>

                <!-- Floating Badge 1 -->
                <div class="showcase-floating-badge floating-badge-1">
                  <div style="width: 36px; height: 36px; border-radius: var(--radius-full); background-color: var(--primary-100); color: var(--primary-800); display: flex; align-items: center; justify-content: center;">
                    ${Utils.icons.compare}
                  </div>
                  <div>
                    <div style="font-size: var(--font-size-xs); font-weight: 700; color: var(--neutral-900);">Smart Price Match</div>
                    <div style="font-size: 11px; color: var(--neutral-500);">Compare up to 3 shops</div>
                  </div>
                </div>

                <!-- Floating Badge 2 -->
                <div class="showcase-floating-badge floating-badge-2">
                  <div style="width: 36px; height: 36px; border-radius: var(--radius-full); background-color: var(--accent-100); color: var(--accent-700); display: flex; align-items: center; justify-content: center;">
                    ${Utils.icons.shieldCheck}
                  </div>
                  <div>
                    <div style="font-size: var(--font-size-xs); font-weight: 700; color: var(--neutral-900);">Real Local Stock</div>
                    <div style="font-size: 11px; color: var(--neutral-500);">Zero fake availability</div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      <!-- Trust / Value Propositions -->
      <section class="trust-section" aria-label="OneMarket Benefits">
        <div class="container">
          <div class="trust-grid">
            
            <div class="trust-card">
              <div class="trust-icon-box">
                ${Utils.icons.shop}
              </div>
              <div>
                <h3 class="trust-title">Discover Local Shops</h3>
                <p class="trust-desc">
                  Browse authentic products from neighbourhood book stores, spice merchants, boutiques, and tech shops without traveling across town.
                </p>
              </div>
            </div>

            <div class="trust-card">
              <div class="trust-icon-box">
                ${Utils.icons.compare}
              </div>
              <div>
                <h3 class="trust-title">Compare Products Confidently</h3>
                <p class="trust-desc">
                  Place up to three items side-by-side to compare prices, verified specifications, and live stock levels before requesting an order.
                </p>
              </div>
            </div>

            <div class="trust-card">
              <div class="trust-icon-box">
                ${Utils.icons.shieldCheck}
              </div>
              <div>
                <h3 class="trust-title">Support Neighbourhood Businesses</h3>
                <p class="trust-desc">
                  Keep commerce within your community. Every order request connects directly to independent brick-and-mortar merchants.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      <!-- Category Shortcuts Section -->
      <section class="categories-section" aria-label="Browse Categories">
        <div class="container">
          <div class="section-header">
            <div>
              <h2 class="section-title">Shop by Category</h2>
              <p class="section-subtitle">Explore curated essentials from verified local retailers</p>
            </div>
            <a href="#catalog" class="btn btn-outline btn-sm">
              View All Categories ${Utils.icons.arrowRight}
            </a>
          </div>

          <div class="categories-grid">
            ${CATEGORIES.map(cat => {
              const count = products.filter(p => p.category.toLowerCase() === cat.name.toLowerCase()).length;
              const iconSvg = Utils.icons[cat.icon] || Utils.icons.package;
              return `
                <a href="#catalog?category=${encodeURIComponent(cat.name)}" class="category-card" aria-label="Browse ${cat.name}">
                  <div class="category-icon-box">
                    ${iconSvg}
                  </div>
                  <h3 class="category-card-title">${Utils.escapeHTML(cat.name)}</h3>
                  <p class="category-card-desc">${Utils.escapeHTML(cat.description)}</p>
                  <span class="category-count-badge">
                    ${count} products available
                  </span>
                </a>
              `;
            }).join('')}
          </div>
        </div>
      </section>

      <!-- Featured Products Grid -->
      <section class="featured-section" aria-label="Featured Products">
        <div class="container">
          <div class="section-header">
            <div>
              <h2 class="section-title">Featured Local Products</h2>
              <p class="section-subtitle">Top-rated items in stock now at neighbourhood stores</p>
            </div>
            <a href="#catalog" class="btn btn-primary btn-sm">
              Explore Full Catalog (${products.length})
            </a>
          </div>

          <div class="product-grid">
            ${featuredProducts.map(product => ProductCard.render(product)).join('')}
          </div>
        </div>
      </section>

      <!-- Nearby Hubballi Shops Section -->
      <section class="shops-section" aria-label="Nearby Hubballi Shops">
        <div class="container">
          <div class="section-header">
            <div>
              <h2 class="section-title">Nearby Hubballi Shops</h2>
              <p class="section-subtitle">Explore independent stores operating across Koppikar Road, Vidyanagar, Gokul Road, Keshwapur, and Unkal in Hubballi</p>
            </div>
            <span class="badge badge-accent">${shops.length} Participating Stores</span>
          </div>

          <div class="shops-grid">
            ${shops.map(shop => {
              const shopProducts = products.filter(p => p.shopId === shop.id);
              const fallbackImg = Utils.getFallbackImageSvg(shop.category, shop.name);
              return `
                <article class="shop-card">
                  <div class="shop-media">
                    <img 
                      src="${Utils.escapeHTML(shop.image)}" 
                      alt="${Utils.escapeHTML(shop.name)}" 
                      loading="lazy"
                      onerror="this.onerror=null; this.src='${fallbackImg}';"
                    />
                    <div class="shop-area-pill">
                      ${Utils.icons.mapPin} ${Utils.escapeHTML(shop.area)}, Hubballi
                    </div>
                  </div>
                  <div class="shop-body">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                      <span class="shop-category-tag">${Utils.escapeHTML(shop.category)}</span>
                      <span class="badge" style="background: #ecfdf5; color: #047857; border: 1px solid #a7f3d0; font-size: 10px; font-weight: 700;">Demo Shop</span>
                    </div>
                    <h3 class="shop-title">${Utils.escapeHTML(shop.name)}</h3>
                    <p class="shop-desc">${Utils.escapeHTML(shop.description)}</p>
                    
                    <div class="shop-meta-row">
                      <div>
                        <span class="star-rating">${Utils.icons.star} ${shop.rating.toFixed(1)}</span>
                        <span style="font-size: var(--font-size-xs); color: var(--neutral-500); margin-left: 4px;">
                          (${shopProducts.length} items listed)
                        </span>
                      </div>
                      <a href="#catalog?shop=${encodeURIComponent(shop.id)}" class="btn btn-sm btn-outline">
                        View Products
                      </a>
                    </div>
                  </div>
                </article>
              `;
            }).join('')}
          </div>
        </div>
      </section>

      <!-- How It Works Section -->
      <section class="how-it-works-section" aria-label="How OneMarket Works">
        <div class="container">
          <div style="text-align: center; max-width: 620px; margin: 0 auto var(--space-10);">
            <h2 class="section-title" style="margin-bottom: var(--space-2);">How OneMarket Works</h2>
            <p class="section-subtitle">
              A straightforward process bringing traditional Hubballi neighbourhood retail into a unified digital marketplace.
            </p>
          </div>

          <div class="steps-grid">
            
            <div class="step-card">
              <div class="step-number">1</div>
              <h3 class="step-title">Discover Products</h3>
              <p class="step-desc">
                Search local inventory across groceries, electronics, apparel, and stationery within Hubballi's commercial zones.
              </p>
            </div>

            <div class="step-card">
              <div class="step-number">2</div>
              <h3 class="step-title">Compare Local Options</h3>
              <p class="step-desc">
                Evaluate up to 3 items side-by-side. Inspect authentic seller prices, live stock quantities, and customer ratings.
              </p>
            </div>

            <div class="step-card">
              <div class="step-number">3</div>
              <h3 class="step-title">Place Order Request</h3>
              <p class="step-desc">
                Submit an order request with instant confirmation. The merchant reviews available stock and prepares your package.
              </p>
            </div>

          </div>

          <!-- Bottom CTA Banner -->
          <div class="how-cta-banner">
            <div>
              <h3 class="how-cta-title">Ready to explore Hubballi neighbourhood shopping?</h3>
              <p class="how-cta-text">Browse all local listings or try Budget Buddy to find items matching your spending limit.</p>
            </div>
            <div style="display: flex; gap: var(--space-3); flex-wrap: wrap;">
              <a href="#catalog" class="btn btn-primary btn-lg" style="background-color: var(--white); color: var(--primary-800); border-color: var(--white);">
                Start Exploring
              </a>
              <a href="#budget" class="btn btn-outline btn-lg" style="border-color: rgba(255,255,255,0.4); color: var(--white);">
                ${Utils.icons.budgetBuddy} Budget Buddy
              </a>
            </div>
          </div>

        </div>
      </section>
    `;
  },

  handleHeroSearch() {
    const query = document.getElementById('hero-search-input')?.value?.trim() || '';
    const category = document.getElementById('hero-category-select')?.value || 'All';

    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (category && category !== 'All') params.set('category', category);

    window.location.hash = `#catalog?${params.toString()}`;
  }
};
