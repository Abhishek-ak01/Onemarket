/**
 * OneMarket - Customer Marketplace Homepage View
 * Complete 12-section homepage flow:
 * 1. Header/Navigation
 * 2. Hero & Multi-product featured showcase
 * 3. Shop by Category slider (balanced row, all 7 categories)
 * 4. Today's Local Deals
 * 5. Popular Products
 * 6. Compare Local Prices
 * 7. Nearby Hubballi Shops
 * 8. Budget Buddy
 * 9. Recently Added Products
 * 10. How OneMarket Works
 * 11. Final shopping call to action
 * 12. Footer
 */

const HomeView = {
  activeHeroIndex: 0,

  getHeroProducts() {
    const products = Store.getProducts();
    // 4 distinct featured products across diverse categories
    const candidateIds = ['prod-101', 'prod-201', 'prod-401', 'prod-501'];
    const candidates = candidateIds.map(id => products.find(p => p.id === id)).filter(Boolean);
    if (candidates.length >= 3) return candidates;
    return products.slice(0, 4);
  },

  render() {
    const products = Store.getProducts();
    const shops = Store.getShops();
    const selectedLocation = Store.getSelectedLocation();

    // Data segments for homepage flow
    const heroProducts = this.getHeroProducts();
    const activeProduct = heroProducts[this.activeHeroIndex] || heroProducts[0];

    // Deals: items with discount > 0 or originalPrice > price
    const deals = products.filter(p => (p.originalPrice && p.originalPrice > p.price) || (p.discount && p.discount > 0)).slice(0, 4);

    // Popular: top rated items
    const popularProducts = [...products].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 4);

    // Recently added: items 4 to 8
    const recentProducts = products.slice(4, 8);

    return `
      <!-- 2. Hero & Multi-Product Featured Showcase -->
      <section class="hero-section" aria-label="Welcome to OneMarket">
        <div class="container">
          <div class="hero-grid">
            
            <!-- Left Hero Content -->
            <div class="hero-content">
              <div class="hero-badge">
                ${Utils.icons.mapPin} Verified Neighbourhood Commerce • ${Utils.escapeHTML(selectedLocation.name || 'Hubballi, Karnataka')}
              </div>

              <h1 class="hero-headline">
                Your neighbourhood has <span>more to offer.</span>
              </h1>

              <p class="hero-subheading">
                Discover authentic products from local Hubballi shops, compare prices across independent neighbourhood merchants, and order directly with fast local delivery.
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

              <!-- Hero Action Buttons -->
              <div class="hero-cta-group">
                <a href="#catalog" class="btn btn-primary btn-lg">
                  Explore ${products.length} Products
                </a>
                <a href="#compare" class="btn btn-outline btn-lg" style="border-color: var(--primary-300);">
                  ${Utils.icons.compare} Compare Prices
                </a>
                <a href="#budget" class="btn btn-secondary btn-lg" style="background-color: #fef3c7; color: #92400e; border-color: #fde68a;">
                  ${Utils.icons.budgetBuddy} Budget Buddy
                </a>
              </div>
            </div>

            <!-- Right Hero Composition (Multi-Product Showcase) -->
            <div class="hero-showcase">
              <div class="showcase-composition" style="width: 100%; max-width: 440px;">
                
                <!-- Main Showcase Card -->
                <div class="showcase-card-main" id="hero-showcase-card" style="background: #ffffff; border: 1px solid var(--neutral-300); border-radius: var(--radius-xl); padding: var(--space-5); box-shadow: 0 10px 25px -5px rgba(27, 67, 50, 0.15);">
                  
                  <!-- Showcase Top Controls -->
                  <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--space-3);">
                    <span class="badge" style="background: #dcfce7; color: #166534; font-weight: 700; font-size: 0.72rem; padding: 3px 8px; border-radius: var(--radius-full);">
                      Featured Local Discovery
                    </span>
                    <div style="display: flex; align-items: center; gap: 6px;">
                      <span id="hero-slide-counter" style="font-size: 0.75rem; color: var(--neutral-600); font-weight: 700;">
                        ${this.activeHeroIndex + 1} / ${heroProducts.length}
                      </span>
                      <button type="button" id="hero-prev-btn" class="btn btn-xs btn-outline" style="width: 28px; height: 28px; padding: 0; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center;" aria-label="Previous featured product">
                        ‹
                      </button>
                      <button type="button" id="hero-next-btn" class="btn btn-xs btn-outline" style="width: 28px; height: 28px; padding: 0; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center;" aria-label="Next featured product">
                        ›
                      </button>
                    </div>
                  </div>

                  <!-- Product Image with Error Fallback -->
                  <div style="position: relative; width: 100%; height: 220px; overflow: hidden; border-radius: var(--radius-lg); margin-bottom: var(--space-3); background: var(--neutral-100);">
                    <img 
                      id="hero-product-image"
                      src="${Utils.escapeHTML(activeProduct.image)}" 
                      alt="${Utils.escapeHTML(activeProduct.name)}" 
                      style="width: 100%; height: 100%; object-fit: cover; transition: opacity 0.2s;"
                      onerror="this.onerror=null; this.src='assets/product-images/placeholder.svg';"
                    />
                    ${(activeProduct.discount && activeProduct.discount > 0) ? `
                      <span id="hero-product-discount" class="discount-badge" style="position: absolute; top: 10px; right: 10px;">
                        ${activeProduct.discount}% OFF
                      </span>
                    ` : ''}
                    <span id="hero-product-stock" class="badge" style="position: absolute; bottom: 10px; left: 10px; background: rgba(0,0,0,0.65); color: #ffffff; backdrop-filter: blur(4px); font-size: 0.7rem; font-weight: 600;">
                      ${activeProduct.stock > 0 ? `In Stock (${activeProduct.stock} units)` : 'Out of Stock'}
                    </span>
                  </div>

                  <!-- Synchronized Details -->
                  <div style="margin-bottom: var(--space-3);">
                    <div id="hero-product-shop" style="font-size: 0.78rem; color: var(--primary-700); font-weight: 700;">
                      ${Utils.escapeHTML(activeProduct.shopName || 'Local Hubballi Merchant')}
                    </div>
                    <h3 id="hero-product-name" style="font-size: 1.15rem; font-weight: 800; color: var(--neutral-900); margin: 2px 0 6px; font-family: var(--font-family-display);">
                      ${Utils.escapeHTML(activeProduct.name)}
                    </h3>
                    <div style="display: flex; align-items: baseline; justify-content: space-between;">
                      <div class="price-discount-wrap">
                        <strong id="hero-product-price" class="price-current">
                          ${Utils.formatINR(activeProduct.price)}
                        </strong>
                        ${(activeProduct.originalPrice && activeProduct.originalPrice > activeProduct.price) ? `
                          <span id="hero-product-orig-price" class="price-original">
                            ${Utils.formatINR(activeProduct.originalPrice)}
                          </span>
                        ` : ''}
                      </div>
                      <span style="font-size: 0.8rem; color: var(--neutral-600);">
                        ★ ${activeProduct.rating ? activeProduct.rating.toFixed(1) : '4.8'}
                      </span>
                    </div>
                  </div>

                  <!-- Quick Action Buttons -->
                  <div style="display: flex; gap: 8px;">
                    <a id="hero-product-link" href="#product/${encodeURIComponent(activeProduct.id)}" class="btn btn-outline btn-sm btn-block" style="font-size: 0.8rem; font-weight: 700;">
                      View Details
                    </a>
                    <button type="button" class="btn btn-primary btn-sm btn-block" id="hero-add-cart-btn" style="font-size: 0.8rem; font-weight: 700;">
                      ${Utils.icons.cart} Add to Cart
                    </button>
                  </div>

                  <!-- Slide Indicator Dots -->
                  <div style="display: flex; justify-content: center; gap: 6px; margin-top: var(--space-3);">
                    ${heroProducts.map((_, i) => `
                      <button type="button" class="hero-dot-btn" data-slide="${i}" style="width: ${i === this.activeHeroIndex ? '20px' : '8px'}; height: 8px; border-radius: var(--radius-full); background: ${i === this.activeHeroIndex ? 'var(--primary-700)' : 'var(--neutral-300)'}; border: none; cursor: pointer; transition: all 0.2s;" aria-label="Go to product ${i + 1}"></button>
                    `).join('')}
                  </div>

                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      <!-- 3. Shop by Category Slider (Balanced Row of all 7 categories) -->
      <section class="categories-section" aria-label="Shop by Category">
        <div class="container">
          <div class="section-header" style="display: flex; align-items: flex-end; justify-content: space-between; flex-wrap: wrap; gap: var(--space-4);">
            <div>
              <span class="badge" style="background: var(--primary-100); color: var(--primary-900); font-weight: 700; font-size: 0.72rem; text-transform: uppercase;">Curated Departments</span>
              <h2 class="section-title" style="margin-top: 4px;">Shop by Category</h2>
              <p class="section-subtitle">Explore verified local retailers across Hubballi's commercial zones</p>
            </div>
            
            <div style="display: flex; align-items: center; gap: 8px;">
              <button type="button" class="slider-nav-btn" id="cat-prev-btn" aria-label="Scroll categories left">‹</button>
              <button type="button" class="slider-nav-btn" id="cat-next-btn" aria-label="Scroll categories right">›</button>
              <a href="#catalog" class="btn btn-outline btn-sm" style="margin-left: 6px;">
                View All ${Utils.icons.arrowRight}
              </a>
            </div>
          </div>

          <!-- Horizontally Scrollable Category Track -->
          <div class="categories-slider-wrapper">
            <div class="categories-track" id="category-slider-track">
              ${CATEGORIES.map(cat => {
                const count = products.filter(p => p.category.toLowerCase() === cat.name.toLowerCase()).length;
                const iconSvg = Utils.icons[cat.icon] || Utils.icons.package;
                return `
                  <a href="#catalog?category=${encodeURIComponent(cat.name)}" class="category-slider-card" aria-label="Browse ${cat.name}">
                    <div style="width: 44px; height: 44px; border-radius: var(--radius-lg); background: var(--primary-50); color: var(--primary-700); display: flex; align-items: center; justify-content: center; margin-bottom: var(--space-3);">
                      ${iconSvg}
                    </div>
                    <h3 style="font-family: var(--font-family-display); font-size: 1rem; font-weight: 800; color: var(--neutral-900); margin-bottom: 4px;">
                      ${Utils.escapeHTML(cat.name)}
                    </h3>
                    <p style="font-size: 0.78rem; color: var(--neutral-600); line-height: 1.4; margin-bottom: var(--space-3); flex: 1;">
                      ${Utils.escapeHTML(cat.description)}
                    </p>
                    <span style="font-size: 0.72rem; font-weight: 700; color: var(--primary-700); background: var(--primary-50); padding: 3px 8px; border-radius: var(--radius-full); width: fit-content;">
                      ${count} products
                    </span>
                  </a>
                `;
              }).join('')}
            </div>
          </div>
        </div>
      </section>

      <!-- 4. Today's Local Deals -->
      <section class="deals-section" style="padding: var(--space-12) 0; background: #fafaf9; border-bottom: 1px solid var(--color-border);" aria-label="Today's Local Deals">
        <div class="container">
          <div class="section-header" style="display: flex; align-items: flex-end; justify-content: space-between; flex-wrap: wrap; gap: var(--space-4);">
            <div>
              <span class="badge" style="background: #fee2e2; color: #991b1b; font-weight: 700; font-size: 0.72rem; text-transform: uppercase;">
                Limited-Time Discounts
              </span>
              <h2 class="section-title" style="margin-top: 4px;">Today's Local Deals</h2>
              <p class="section-subtitle">Genuine promotional price drops from independent Hubballi merchants</p>
            </div>
            <a href="#catalog" class="btn btn-outline btn-sm">
              View All Deals ${Utils.icons.arrowRight}
            </a>
          </div>

          <div class="product-grid">
            ${deals.map(product => ProductCard.render(product)).join('')}
          </div>
        </div>
      </section>

      <!-- 5. Popular Products -->
      <section class="featured-section" aria-label="Popular Products">
        <div class="container">
          <div class="section-header" style="display: flex; align-items: flex-end; justify-content: space-between; flex-wrap: wrap; gap: var(--space-4);">
            <div>
              <span class="badge" style="background: #fef3c7; color: #92400e; font-weight: 700; font-size: 0.72rem; text-transform: uppercase;">
                Top Customer Favorites
              </span>
              <h2 class="section-title" style="margin-top: 4px;">Popular Neighbourhood Products</h2>
              <p class="section-subtitle">Highly rated local staples with proven availability in Hubballi</p>
            </div>
            <a href="#catalog" class="btn btn-primary btn-sm">
              Explore Full Catalogue (${products.length})
            </a>
          </div>

          <div class="product-grid">
            ${popularProducts.map(product => ProductCard.render(product)).join('')}
          </div>
        </div>
      </section>

      <!-- 6. Compare Local Prices -->
      <section style="padding: var(--space-12) 0; background: linear-gradient(135deg, #1b4332 0%, #2d6a4f 100%); color: #ffffff;" aria-label="Compare Local Prices">
        <div class="container">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-8); align-items: center;">
            <div>
              <span class="badge" style="background: rgba(255,255,255,0.2); color: #a7f3d0; font-weight: 700; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em;">
                Smart Price Transparency
              </span>
              <h2 style="font-family: var(--font-family-display); font-size: 2rem; font-weight: 800; color: #ffffff; margin: var(--space-3) 0 var(--space-2); line-height: 1.2;">
                Compare Local Prices Across Hubballi Merchants
              </h2>
              <p style="color: #d8f3dc; font-size: 0.95rem; line-height: 1.6; margin-bottom: var(--space-6);">
                Stop store hopping. Select up to 3 items and view exact side-by-side pricing, live shelf inventory, verified specifications, and shop locations in Hubballi before ordering.
              </p>
              <div style="display: flex; gap: var(--space-3); flex-wrap: wrap;">
                <a href="#compare" class="btn btn-primary btn-lg" style="background: #ffffff; color: #1b4332; border-color: #ffffff; font-weight: 800;">
                  ${Utils.icons.compare} Open Comparison Engine
                </a>
                <a href="#catalog" class="btn btn-outline btn-lg" style="border-color: rgba(255,255,255,0.4); color: #ffffff;">
                  Browse Items to Compare
                </a>
              </div>
            </div>

            <div style="background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: var(--radius-xl); padding: var(--space-6); backdrop-filter: blur(10px);">
              <div style="font-size: 0.85rem; font-weight: 700; color: #a7f3d0; margin-bottom: 12px; text-transform: uppercase;">
                Why Compare on OneMarket?
              </div>
              <div style="display: flex; flex-direction: column; gap: var(--space-4);">
                <div style="display: flex; gap: 12px; align-items: flex-start;">
                  <div style="width: 28px; height: 28px; border-radius: 50%; background: #a7f3d0; color: #064e3b; display: flex; align-items: center; justify-content: center; font-weight: 800; flex-shrink: 0;">✓</div>
                  <div style="font-size: 0.88rem; color: #eaf5ee; line-height: 1.4;">
                    <strong>Zero hidden markups:</strong> Verified store prices direct from Hubballi merchants.
                  </div>
                </div>
                <div style="display: flex; gap: 12px; align-items: flex-start;">
                  <div style="width: 28px; height: 28px; border-radius: 50%; background: #a7f3d0; color: #064e3b; display: flex; align-items: center; justify-content: center; font-weight: 800; flex-shrink: 0;">✓</div>
                  <div style="font-size: 0.88rem; color: #eaf5ee; line-height: 1.4;">
                    <strong>Live stock confirmation:</strong> Avoid wasted trips or out-of-stock phone calls.
                  </div>
                </div>
                <div style="display: flex; gap: 12px; align-items: flex-start;">
                  <div style="width: 28px; height: 28px; border-radius: 50%; background: #a7f3d0; color: #064e3b; display: flex; align-items: center; justify-content: center; font-weight: 800; flex-shrink: 0;">✓</div>
                  <div style="font-size: 0.88rem; color: #eaf5ee; line-height: 1.4;">
                    <strong>Support local economy:</strong> Every rupee stays with neighbourhood businesses.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 7. Nearby Hubballi Shops -->
      <section class="shops-section" style="padding: var(--space-12) 0; background: #ffffff;" aria-label="Nearby Hubballi Shops">
        <div class="container">
          <div class="section-header" style="display: flex; align-items: flex-end; justify-content: space-between; flex-wrap: wrap; gap: var(--space-4);">
            <div>
              <span class="badge" style="background: var(--primary-100); color: var(--primary-900); font-weight: 700; font-size: 0.72rem; text-transform: uppercase;">
                Local Merchant Network
              </span>
              <h2 class="section-title" style="margin-top: 4px;">Nearby Hubballi Shops</h2>
              <p class="section-subtitle">Explore independent stores operating across Koppikar Road, Vidyanagar, Gokul Road, Keshwapur, and Unkal</p>
            </div>
            <span class="badge" style="background: #e0f2fe; color: #0369a1; font-weight: 700; padding: 4px 12px; border-radius: var(--radius-full);">
              ${shops.length} Participating Stores
            </span>
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
                      <span class="badge" style="background: #ecfdf5; color: #047857; border: 1px solid #a7f3d0; font-size: 10px; font-weight: 700;">Hubballi Merchant</span>
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

      <!-- 8. Budget Buddy Feature Section -->
      <section style="padding: var(--space-12) 0; background: #fffbeb; border-top: 1px solid #fef3c7; border-bottom: 1px solid #fef3c7;" aria-label="Budget Buddy">
        <div class="container">
          <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: var(--space-6);">
            <div style="max-width: 580px;">
              <span class="badge" style="background: #fef3c7; color: #b45309; font-weight: 700; font-size: 0.72rem; text-transform: uppercase;">
                Smart Spending Assistant
              </span>
              <h2 style="font-family: var(--font-family-display); font-size: 1.85rem; font-weight: 800; color: #78350f; margin: var(--space-2) 0;">
                Shopping on a Budget in Hubballi?
              </h2>
              <p style="color: #92400e; font-size: 0.95rem; line-height: 1.5; margin-bottom: var(--space-4);">
                Set your exact budget limit and let Budget Buddy find all eligible local products matching your price threshold across Hubballi merchants.
              </p>
              <div style="display: flex; gap: var(--space-2); flex-wrap: wrap;">
                <a href="#budget?max=250" class="btn btn-sm" style="background: #ffffff; color: #92400e; border: 1px solid #fde68a; font-weight: 700;">Under ₹250</a>
                <a href="#budget?max=500" class="btn btn-sm" style="background: #ffffff; color: #92400e; border: 1px solid #fde68a; font-weight: 700;">Under ₹500</a>
                <a href="#budget?max=1000" class="btn btn-sm" style="background: #ffffff; color: #92400e; border: 1px solid #fde68a; font-weight: 700;">Under ₹1,000</a>
                <a href="#budget?max=2000" class="btn btn-sm" style="background: #ffffff; color: #92400e; border: 1px solid #fde68a; font-weight: 700;">Under ₹2,000</a>
              </div>
            </div>

            <div>
              <a href="#budget" class="btn btn-primary btn-lg" style="background: #d97706; border-color: #d97706; color: #ffffff; font-weight: 800; padding: 14px 28px;">
                ${Utils.icons.budgetBuddy} Launch Budget Buddy
              </a>
            </div>
          </div>
        </div>
      </section>

      <!-- 9. Recently Added Products -->
      <section style="padding: var(--space-12) 0; background: #ffffff; border-bottom: 1px solid var(--color-border);" aria-label="Recently Added Products">
        <div class="container">
          <div class="section-header" style="display: flex; align-items: flex-end; justify-content: space-between; flex-wrap: wrap; gap: var(--space-4);">
            <div>
              <span class="badge" style="background: var(--primary-100); color: var(--primary-900); font-weight: 700; font-size: 0.72rem; text-transform: uppercase;">
                Fresh Shelf Stock
              </span>
              <h2 class="section-title" style="margin-top: 4px;">Recently Added Products</h2>
              <p class="section-subtitle">Newly listed stock directly from Hubballi store owners</p>
            </div>
            <a href="#catalog" class="btn btn-outline btn-sm">
              Browse Catalogue ${Utils.icons.arrowRight}
            </a>
          </div>

          <div class="product-grid">
            ${recentProducts.map(product => ProductCard.render(product)).join('')}
          </div>
        </div>
      </section>

      <!-- 10. How OneMarket Works -->
      <section class="how-it-works-section" style="padding: var(--space-12) 0; background: #f8fafc; border-bottom: 1px solid var(--color-border);" aria-label="How OneMarket Works">
        <div class="container">
          <div style="text-align: center; max-width: 620px; margin: 0 auto var(--space-10);">
            <span class="badge" style="background: var(--primary-100); color: var(--primary-900); font-weight: 700; font-size: 0.72rem; text-transform: uppercase;">Simple Workflow</span>
            <h2 class="section-title" style="margin-top: 4px; margin-bottom: var(--space-2);">How OneMarket Works</h2>
            <p class="section-subtitle">
              Connecting Hubballi residents with neighbourhood merchants in three easy steps.
            </p>
          </div>

          <div class="steps-grid">
            
            <div class="step-card">
              <div class="step-number">1</div>
              <h3 class="step-title">Discover Products</h3>
              <p class="step-desc">
                Browse real local inventory across spices, electronics, books, fashion, and home goods in Hubballi.
              </p>
            </div>

            <div class="step-card">
              <div class="step-number">2</div>
              <h3 class="step-title">Compare & Select</h3>
              <p class="step-desc">
                Compare prices, specifications, and live shelf quantities across independent shops side-by-side.
              </p>
            </div>

            <div class="step-card">
              <div class="step-number">3</div>
              <h3 class="step-title">Order & Earn Rewards</h3>
              <p class="step-desc">
                Place orders with transparent pricing, earn OneMarket reward tokens (1 per ₹100), and receive local delivery.
              </p>
            </div>

          </div>
        </div>
      </section>

      <!-- 11. Final Shopping Call to Action -->
      <section style="padding: var(--space-12) 0; background: linear-gradient(135deg, #0a1f16 0%, #1b4332 100%); color: #ffffff;" aria-label="Get Started with OneMarket">
        <div class="container">
          <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: var(--space-6); text-align: left;">
            <div style="max-width: 600px;">
              <h2 style="font-family: var(--font-family-display); font-size: 2rem; font-weight: 800; margin-bottom: var(--space-2); color: #ffffff;">
                Experience OneMarket in Hubballi Today
              </h2>
              <p style="color: #a7f3d0; font-size: 1rem; line-height: 1.6; margin: 0;">
                Support local businesses, enjoy fair neighbourhood pricing, and earn loyalty tokens on every rupee spent.
              </p>
            </div>
            <div style="display: flex; gap: var(--space-3); flex-wrap: wrap;">
              <a href="#catalog" class="btn btn-primary btn-lg" style="background: #a7f3d0; color: #064e3b; border-color: #a7f3d0; font-weight: 800;">
                Start Shopping Now
              </a>
              <a href="#portal" class="btn btn-outline btn-lg" style="border-color: rgba(255,255,255,0.4); color: #ffffff;">
                Open My Portal
              </a>
            </div>
          </div>
        </div>
      </section>
    `;
  },

  updateHeroShowcase() {
    const heroProducts = this.getHeroProducts();
    const product = heroProducts[this.activeHeroIndex];
    if (!product) return;

    const imgEl = document.getElementById('hero-product-image');
    const nameEl = document.getElementById('hero-product-name');
    const shopEl = document.getElementById('hero-product-shop');
    const priceEl = document.getElementById('hero-product-price');
    const origPriceEl = document.getElementById('hero-product-orig-price');
    const discountEl = document.getElementById('hero-product-discount');
    const stockEl = document.getElementById('hero-product-stock');
    const linkEl = document.getElementById('hero-product-link');
    const counterEl = document.getElementById('hero-slide-counter');

    if (imgEl) {
      imgEl.src = product.image;
      imgEl.alt = product.name;
    }
    if (nameEl) nameEl.textContent = product.name;
    if (shopEl) shopEl.textContent = product.shopName || 'Local Hubballi Merchant';
    if (priceEl) priceEl.textContent = Utils.formatINR(product.price);
    
    if (origPriceEl) {
      if (product.originalPrice && product.originalPrice > product.price) {
        origPriceEl.textContent = Utils.formatINR(product.originalPrice);
        origPriceEl.style.display = 'inline';
      } else {
        origPriceEl.style.display = 'none';
      }
    }

    if (discountEl) {
      if (product.discount && product.discount > 0) {
        discountEl.textContent = `${product.discount}% OFF`;
        discountEl.style.display = 'inline-flex';
      } else {
        discountEl.style.display = 'none';
      }
    }

    if (stockEl) {
      stockEl.textContent = product.stock > 0 ? `In Stock (${product.stock} units)` : 'Out of Stock';
    }

    if (linkEl) {
      linkEl.href = `#product/${encodeURIComponent(product.id)}`;
    }

    if (counterEl) {
      counterEl.textContent = `${this.activeHeroIndex + 1} / ${heroProducts.length}`;
    }

    // Update dot indicators
    document.querySelectorAll('.hero-dot-btn').forEach((dot, idx) => {
      if (idx === this.activeHeroIndex) {
        dot.style.background = 'var(--primary-700)';
        dot.style.width = '20px';
      } else {
        dot.style.background = 'var(--neutral-300)';
        dot.style.width = '8px';
      }
    });
  },

  initListeners() {
    const heroProducts = this.getHeroProducts();

    // Hero prev/next buttons
    const prevBtn = document.getElementById('hero-prev-btn');
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        this.activeHeroIndex = (this.activeHeroIndex - 1 + heroProducts.length) % heroProducts.length;
        this.updateHeroShowcase();
      });
    }

    const nextBtn = document.getElementById('hero-next-btn');
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        this.activeHeroIndex = (this.activeHeroIndex + 1) % heroProducts.length;
        this.updateHeroShowcase();
      });
    }

    // Hero dot buttons
    document.querySelectorAll('.hero-dot-btn').forEach(dot => {
      dot.addEventListener('click', (e) => {
        const slideIdx = parseInt(e.target.dataset.slide, 10);
        if (!isNaN(slideIdx) && slideIdx >= 0 && slideIdx < heroProducts.length) {
          this.activeHeroIndex = slideIdx;
          this.updateHeroShowcase();
        }
      });
    });

    // Hero Add to Cart button
    const heroCartBtn = document.getElementById('hero-add-cart-btn');
    if (heroCartBtn) {
      heroCartBtn.addEventListener('click', () => {
        const product = heroProducts[this.activeHeroIndex];
        if (product) {
          const res = Store.addToCart(product.id, 1);
          if (res.success) {
            Utils.showToast(`Added 1 "${product.name}" to cart.`, 'success');
            // Update cart badge in navbar
            const badge = document.getElementById('header-cart-count');
            if (badge) badge.textContent = Store.getCartSummary().count;
          } else {
            Utils.showToast(res.message, 'warning');
          }
        }
      });
    }

    // Category slider scroll buttons
    const catTrack = document.getElementById('category-slider-track');
    const catPrev = document.getElementById('cat-prev-btn');
    const catNext = document.getElementById('cat-next-btn');

    if (catTrack && catPrev && catNext) {
      catPrev.addEventListener('click', () => {
        catTrack.scrollBy({ left: -240, behavior: 'smooth' });
      });
      catNext.addEventListener('click', () => {
        catTrack.scrollBy({ left: 240, behavior: 'smooth' });
      });
    }
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
