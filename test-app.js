/**
 * Automated Test Suite for LocalLoop
 * Verifies all modules, mock data, Store state transitions, cart limits,
 * inventory rules, comparison engine, and Budget Buddy logic.
 */

const fs = require('fs');
const vm = require('vm');

const sandbox = {
  console,
  setTimeout,
  clearTimeout,
  Intl,
  Date,
  Math,
  Number,
  String,
  Boolean,
  Array,
  Object,
  Set,
  URLSearchParams,
  encodeURIComponent,
  localStorage: (() => {
    let store = {};
    return {
      getItem: (k) => store[k] || null,
      setItem: (k, v) => { store[k] = String(v); },
      removeItem: (k) => { delete store[k]; },
      clear: () => { store = {}; }
    };
  })(),
  document: {
    addEventListener: () => {},
    getElementById: () => null,
    querySelectorAll: () => [],
    createElement: () => ({ setAttribute: () => {}, appendChild: () => {}, classList: { add: () => {}, remove: () => {} } }),
    body: { appendChild: () => {}, classList: { add: () => {}, remove: () => {} } }
  },
  window: {
    location: { hash: '#home' },
    addEventListener: () => {},
    scrollTo: () => {}
  }
};

vm.createContext(sandbox);

const files = [
  'js/mock-data.js',
  'js/utils.js',
  'js/store.js',
  'js/components/navbar.js',
  'js/components/auth-modal.js',
  'js/components/product-card.js',
  'js/components/footer.js',
  'js/views/home-view.js',
  'js/views/catalog-view.js',
  'js/views/product-view.js',
  'js/views/compare-view.js',
  'js/views/budget-view.js',
  'js/views/cart-view.js',
  'js/views/orders-view.js',
  'js/views/seller-view.js',
  'js/views/storefront-view.js',
  'js/views/about-view.js',
  'js/views/portal-view.js',
  'js/views/admin-view.js',
  'js/router.js'
];

files.forEach(file => {
  const code = fs.readFileSync(file, 'utf8');
  vm.runInContext(code, sandbox);
  console.log('✓ Loaded and verified syntax: ' + file);
});

// Run Business Logic Tests
const testSuite = `
  console.log('\\n==================== RUNNING TESTS ====================');

  // Test 1: Seed Data
  const products = Store.getProducts();
  const shops = Store.getShops();
  console.log('Test 1: Seed Data verification...');
  console.log('  Total Products:', products.length, '(Requirement: >= 24)');
  if (products.length < 24) throw new Error('Failed: Expected at least 24 products');
  console.log('  Total Shops:', shops.length, '(Requirement: >= 6)');
  if (shops.length < 6) throw new Error('Failed: Expected at least 6 shops');
  console.log('  ✓ Seed data passed.');

  // Test 2: Stock Availability & Out-of-Stock handling
  console.log('Test 2: Out of Stock validation...');
  const outOfStockItem = products.find(p => p.stock === 0);
  if (!outOfStockItem) throw new Error('Failed: Need at least one out-of-stock item for testing');
  const oosResult = Store.addToCart(outOfStockItem.id, 1);
  if (oosResult.success) throw new Error('Failed: Out of stock item should not be added to cart');
  console.log('  ✓ Out of stock addition prevented:', oosResult.message);

  // Test 3: Cart Stock Limit Enforcement
  console.log('Test 3: Cart stock limit enforcement...');
  const inStockItem = products.find(p => p.stock >= 2 && p.stock <= 5);
  const stockLimit = inStockItem.stock;
  Store.clearCart();
  const addExceed = Store.addToCart(inStockItem.id, stockLimit + 5);
  const currentCart = Store.getCart();
  if (currentCart[0].quantity > stockLimit) {
    throw new Error('Failed: Cart allowed quantity exceeding physical stock!');
  }
  console.log('  ✓ Cart clamped to available stock limit (' + currentCart[0].quantity + '/' + stockLimit + ')');

  // Test 4: Demo Order Request Creation
  console.log('Test 4: Order Request Creation...');
  const orderResult = Store.createOrder({
    customer: {
      name: 'Aditi Rao',
      phone: '9845012345',
      address: 'Indiranagar 100ft Road',
      deliveryPreference: 'delivery'
    },
    items: currentCart,
    notes: 'Demo test order request'
  });
  if (!orderResult.success || orderResult.order.status !== 'Pending') {
    throw new Error('Failed: Order creation failed or status was not Pending');
  }
  console.log('  ✓ Order created successfully with ID:', orderResult.order.id, 'Status:', orderResult.order.status);

  // Test 5: Cart should be empty after order creation
  const cartAfterOrder = Store.getCart();
  if (cartAfterOrder.length !== 0) throw new Error('Failed: Cart should be cleared after order submission');
  console.log('  ✓ Cart automatically cleared after order creation');

  // Test 6: Critical Inventory Rule - Order Acceptance stock check & deduction
  console.log('Test 6: Seller order acceptance & stock deduction...');
  const initialStock = Store.getProductById(inStockItem.id).stock;
  const orderedQty = currentCart[0].quantity;
  const acceptResult = Store.acceptOrder(orderResult.order.id);
  if (!acceptResult.success) throw new Error('Failed: Order acceptance failed: ' + acceptResult.message);
  
  const postStock = Store.getProductById(inStockItem.id).stock;
  if (postStock !== initialStock - orderedQty) {
    throw new Error('Failed: Stock was not deducted correctly. Expected ' + (initialStock - orderedQty) + ', got ' + postStock);
  }
  console.log('  ✓ Stock before acceptance:', initialStock, '→ Stock after acceptance:', postStock);

  // Test 7: Prevent duplicate acceptance deduction
  const duplicateAccept = Store.acceptOrder(orderResult.order.id);
  if (duplicateAccept.success) throw new Error('Failed: Double acceptance should be prevented');
  console.log('  ✓ Double acceptance prevented safely');

  // Test 8: Seller Order Completion & Analytics Revenue update
  console.log('Test 7: Order completion & revenue calculation...');
  const initialAnalytics = Store.getSellerAnalytics('all');
  const completeResult = Store.completeOrder(orderResult.order.id);
  if (!completeResult.success) throw new Error('Failed: Order completion failed');
  const postAnalytics = Store.getSellerAnalytics('all');
  if (postAnalytics.completedOrdersCount !== initialAnalytics.completedOrdersCount + 1) {
    throw new Error('Failed: Completed orders count did not increment');
  }
  console.log('  ✓ Order completed and revenue updated to:', Utils.formatINR(postAnalytics.completedSalesTotal));

  // Test 9: Smart Comparison Engine (Max 3 items, duplicate prevention)
  console.log('Test 8: Comparison engine tests...');
  Store.clearCompare();
  Store.addToCompare(products[0].id);
  Store.addToCompare(products[1].id);
  const dupResult = Store.addToCompare(products[0].id);
  if (dupResult.success) throw new Error('Failed: Duplicate addition to comparison should be prevented');
  Store.addToCompare(products[2].id);
  const fourthResult = Store.addToCompare(products[3].id);
  if (fourthResult.success) throw new Error('Failed: More than 3 items in comparison should be prevented');
  if (Store.getCompareList().length !== 3) throw new Error('Failed: Comparison list length mismatch');
  console.log('  ✓ Comparison successfully enforces max 3 items and prevents duplicates');

  // Test 10: Budget Buddy Filter
  console.log('Test 9: Budget Buddy calculations...');
  BudgetView.budgetState.budgetAmount = 450;
  BudgetView.budgetState.category = 'All';
  const budgetMatches = BudgetView.getMatchingProducts();
  budgetMatches.forEach(p => {
    if (p.price > 450) throw new Error('Failed: Product price exceeds budget: ' + p.price);
  });
  console.log('  ✓ Budget Buddy correctly returns ' + budgetMatches.length + ' items <= ₹450');

  // Test 11: Seller Add, Edit, Delete Product Persistence
  console.log('Test 10: Seller Product Management CRUD...');
  const newProduct = Store.addProduct({
    name: 'Artisan Coorg Filter Coffee 500g',
    category: 'Groceries',
    shopId: 'shop-1',
    price: 320,
    stock: 14,
    description: 'Freshly roasted filter coffee'
  });
  if (!Store.getProductById(newProduct.id)) throw new Error('Failed: Added product not found');

  Store.updateProduct(newProduct.id, { price: 340, stock: 20 });
  const updatedP = Store.getProductById(newProduct.id);
  if (updatedP.price !== 340 || updatedP.stock !== 20) throw new Error('Failed: Product update failed');

  Store.deleteProduct(newProduct.id);
  if (Store.getProductById(newProduct.id)) throw new Error('Failed: Product deletion failed');
  console.log('  ✓ Seller Add, Edit, and Delete tested and verified');

  console.log('\\n======================================================');
  console.log('ALL 10 TEST SUITES PASSED WITH 100% SUCCESS!');
  console.log('======================================================\\n');
`;

vm.runInContext(testSuite, sandbox);
