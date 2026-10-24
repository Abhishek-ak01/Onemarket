/**
 * LocalLoop - Budget Buddy View
 * Distinctive feature allowing shoppers to discover products that fit
 * within a specified budget in Indian Rupees, filter by category, and sort.
 */

const BudgetView = {
  budgetState: {
    budgetAmount: 500,
    category: 'All',
    sortBy: 'price-asc' // 'price-asc', 'price-desc', 'best-value'
  },

  render() {
    const matchingProducts = this.getMatchingProducts();
    const categories = CATEGORIES;

    return `
      <section class="container" style="padding: var(--space-8) 0 var(--space-16);">
        
        <!-- Hero Header -->
        <div class="budget-hero">
          <div class="budget-hero-content">
            <span class="budget-badge">${Utils.icons.budgetBuddy} Smart Discovery Tool</span>
            <h1 class="budget-hero-title">Budget Buddy</h1>
            <p class="budget-hero-desc">
              Tell us what you'd like to spend. We'll scour neighbourhood shop shelves to surface quality items that fit comfortably within your limit.
            </p>

            <div class="quick-budget-chips">
              <span style="font-size: var(--font-size-xs); font-weight: 700; color: var(--primary-100); margin-right: 4px;">
                Popular Limits:
              </span>
              ${[250, 500, 1000, 1500, 3000].map(val => `
                <button 
                  type="button" 
                  class="budget-chip ${this.budgetState.budgetAmount === val ? 'active' : ''}" 
                  data-budget="${val}"
                >
                  Under ₹${val.toLocaleString('en-IN')}
                </button>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- Filter & Control Panel -->
        <div class="budget-control-panel">
          <form id="budget-form" onsubmit="event.preventDefault(); BudgetView.applyBudget();">
            <div class="budget-inputs-row">
              
              <!-- Input: Budget Amount in INR -->
              <div class="form-group" style="margin-bottom: 0;">
                <label for="budget-amount-input" class="form-label">
                  Maximum Budget per Item (₹):
                </label>
                <div style="position: relative;">
                  <span style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); font-weight: 700; color: var(--primary-700);">
                    ₹
                  </span>
                  <input 
                    type="number" 
                    id="budget-amount-input" 
                    class="form-input" 
                    style="padding-left: 28px; font-size: 1.15rem; font-weight: 700;" 
                    min="10" 
                    max="100000" 
                    step="10" 
                    value="${this.budgetState.budgetAmount}" 
                    placeholder="Enter maximum rupees" 
                    required 
                  />
                </div>
              </div>

              <!-- Input: Category -->
              <div class="form-group" style="margin-bottom: 0;">
                <label for="budget-category-select" class="form-label">
                  Category:
                </label>
                <select id="budget-category-select" class="form-select">
                  <option value="All" ${this.budgetState.category === 'All' ? 'selected' : ''}>All Categories</option>
                  ${categories.map(cat => `
                    <option value="${cat.name}" ${this.budgetState.category === cat.name ? 'selected' : ''}>
                      ${Utils.escapeHTML(cat.name)}
                    </option>
                  `).join('')}
                </select>
              </div>

              <!-- Action: Apply -->
              <div>
                <button type="submit" class="btn btn-primary btn-lg" style="width: 100%;">
                  ${Utils.icons.search} Find Matching Items
                </button>
              </div>

            </div>

            <!-- Disclaimer Notice -->
            <p class="budget-disclaimer">
              * Note: Budget Buddy applies to individual product prices. Final order requests do not process payment and are subject to seller confirmation.
            </p>
          </form>
        </div>

        <!-- Matching Results Header -->
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--space-6); flex-wrap: wrap; gap: var(--space-4);">
          <div>
            <h2 style="font-size: 1.5rem; color: var(--neutral-900);">
              Matching Products (${matchingProducts.length})
            </h2>
            <p style="font-size: var(--font-size-sm); color: var(--neutral-600);">
              Showing items priced at or below <strong>${Utils.formatINR(this.budgetState.budgetAmount)}</strong>
              ${this.budgetState.category !== 'All' ? ` in <em>${Utils.escapeHTML(this.budgetState.category)}</em>` : ''}
            </p>
          </div>

          <!-- Sort -->
          <div style="display: flex; align-items: center; gap: var(--space-2);">
            <label for="budget-sort-select" style="font-size: var(--font-size-xs); font-weight: 600; color: var(--neutral-600);">Sort by:</label>
            <select id="budget-sort-select" class="form-select" style="width: auto; font-size: var(--font-size-xs);">
              <option value="price-asc" ${this.budgetState.sortBy === 'price-asc' ? 'selected' : ''}>Price: Low to High</option>
              <option value="price-desc" ${this.budgetState.sortBy === 'price-desc' ? 'selected' : ''}>Price: High to Low (Closest to limit)</option>
              <option value="best-value" ${this.budgetState.sortBy === 'best-value' ? 'selected' : ''}>Top Rated Quality</option>
            </select>
          </div>
        </div>

        <!-- Results Grid -->
        <div id="budget-results-container">
          ${this.renderMatchingGrid(matchingProducts)}
        </div>

      </section>
    `;
  },

  renderMatchingGrid(products) {
    if (products.length === 0) {
      return `
        <div class="empty-state">
          <div class="empty-state-icon">
            ${Utils.icons.budgetBuddy}
          </div>
          <h3 class="empty-state-title">No products found under ${Utils.formatINR(this.budgetState.budgetAmount)}</h3>
          <p class="empty-state-desc">
            Try raising your budget limit or switching to "All Categories" to discover more products from neighbourhood merchants.
          </p>
          <button type="button" class="btn btn-primary" onclick="BudgetView.setBudget(1000)">
            Try Budget of ₹1,000
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

  getMatchingProducts() {
    const { budgetAmount, category, sortBy } = this.budgetState;
    let products = Store.getProducts();

    // Price <= budget
    products = products.filter(p => p.price <= Number(budgetAmount));

    // Category
    if (category && category !== 'All') {
      products = products.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }

    // Sort
    products.sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'best-value') return (b.rating || 0) - (a.rating || 0);
      return 0;
    });

    return products;
  },

  initListeners() {
    // Quick budget chips
    document.querySelectorAll('.budget-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const amount = Number(chip.dataset.budget);
        this.setBudget(amount);
      });
    });

    // Sort select
    const sortSelect = document.getElementById('budget-sort-select');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        this.budgetState.sortBy = e.target.value;
        App.renderCurrentRoute();
      });
    }
  },

  applyBudget() {
    const amountInput = document.getElementById('budget-amount-input');
    const categorySelect = document.getElementById('budget-category-select');

    if (amountInput) {
      const val = Number(amountInput.value);
      if (!isNaN(val) && val > 0) {
        this.budgetState.budgetAmount = val;
      }
    }

    if (categorySelect) {
      this.budgetState.category = categorySelect.value;
    }

    App.renderCurrentRoute();
  },

  setBudget(amount) {
    this.budgetState.budgetAmount = amount;
    App.renderCurrentRoute();
  }
};
