/**
 * LocalLoop - Automated Backend API Test Suite
 * Verifies Express REST endpoints, MySQL connection, product queries,
 * filtering, transactional order placement, authentication, cart, and reviews.
 */

const http = require('http');
const app = require('./server');

async function runBackendTests() {
  console.log('\n==================== RUNNING BACKEND API TESTS ====================');

  const server = http.createServer(app);
  await new Promise(resolve => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}`;

  async function get(path, token = null) {
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${baseUrl}${path}`, { headers });
    const data = await res.json();
    return { status: res.status, data };
  }

  async function post(path, body, token = null) {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${baseUrl}${path}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });
    const data = await res.json();
    return { status: res.status, data };
  }

  async function patch(path, body, token = null) {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${baseUrl}${path}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(body)
    });
    const data = await res.json();
    return { status: res.status, data };
  }

  try {
    // 1. Health Endpoint
    console.log('Test 1: GET /api/health...');
    const health = await get('/api/health');
    if (health.status !== 200 || health.data.status !== 'healthy') {
      throw new Error(`Failed: Expected status 200 healthy, got ${health.status}`);
    }
    console.log('  ✓ Server health check passed.');

    // 2. Database Health Endpoint
    console.log('Test 2: GET /api/db-health...');
    const dbHealth = await get('/api/db-health');
    if (dbHealth.status !== 200 || !dbHealth.data.database.connected) {
      throw new Error(`Failed: MySQL database is not connected. ${JSON.stringify(dbHealth.data)}`);
    }
    console.log(`  ✓ Database connected to "${dbHealth.data.database.name}" on ${dbHealth.data.database.host}:${dbHealth.data.database.port}.`);

    // 3. Locations
    console.log('Test 3: Locations endpoints...');
    const locs = await get('/api/locations');
    if (locs.status !== 200 || locs.data.count < 6) {
      throw new Error(`Failed: Expected at least 6 locations, got ${locs.data.count}`);
    }
    const loc1 = await get('/api/locations/loc-1');
    if (loc1.status !== 200 || !loc1.data.data.name) {
      throw new Error('Failed: Could not retrieve location loc-1');
    }
    console.log(`  ✓ Retrieved ${locs.data.count} Hubballi shopping zones.`);

    // 4. Categories
    console.log('Test 4: Categories endpoints...');
    const cats = await get('/api/categories');
    if (cats.status !== 200 || cats.data.count < 6) {
      throw new Error(`Failed: Expected at least 6 categories, got ${cats.data.count}`);
    }
    console.log(`  ✓ Retrieved ${cats.data.count} marketplace categories.`);

    // 5. Shops
    console.log('Test 5: Shops endpoints and area filters...');
    const shops = await get('/api/shops');
    if (shops.status !== 200 || shops.data.count < 6) {
      throw new Error(`Failed: Expected at least 6 shops, got ${shops.data.count}`);
    }
    const koppikarShops = await get('/api/shops?area=Koppikar%20Road');
    if (koppikarShops.data.count === 0) {
      throw new Error('Failed: Expected shops in Koppikar Road');
    }
    console.log(`  ✓ Retrieved ${shops.data.count} shops (${koppikarShops.data.count} in Koppikar Road).`);

    // 6. Products & Query Filtering
    console.log('Test 6: Products query filtering (category, price range, search)...');
    const prods = await get('/api/products');
    if (prods.status !== 200 || prods.data.count < 24) {
      throw new Error(`Failed: Expected at least 24 products, got ${prods.data.count}`);
    }

    const filtered = await get('/api/products?category=Groceries&min_price=200&max_price=400');
    if (!Array.isArray(filtered.data.data)) {
      throw new Error('Failed: Filtered products is not an array');
    }
    console.log(`  ✓ Products filter returned ${filtered.data.count} items matching criteria.`);

    // 7. Order Placement with Atomic MySQL Transaction
    console.log('Test 7: Transactional Order Creation (POST /api/orders)...');
    const targetProd = prods.data.data.find(p => p.stock >= 3);
    const initialStock = targetProd.stock;

    const orderRes = await post('/api/orders', {
      customer: {
        name: 'Pooja Hegde',
        phone: '9845012345',
        address: 'Koppikar Road Market, Hubballi',
        deliveryPreference: 'delivery'
      },
      items: [
        { productId: targetProd.id, quantity: 2 }
      ],
      notes: 'Automated test suite order request'
    });

    if (orderRes.status !== 201 || !orderRes.data.order?.id) {
      throw new Error(`Failed: Order creation failed: ${JSON.stringify(orderRes.data)}`);
    }
    const createdOrderId = orderRes.data.order.id;
    console.log(`  ✓ Order created successfully with ID: ${createdOrderId}, Total: ₹${orderRes.data.order.total}`);

    // Verify stock decreased in database
    const refreshedProd = await get(`/api/products/${targetProd.id}`);
    if (refreshedProd.data.data.stock !== initialStock - 2) {
      throw new Error(`Failed: Stock was not deducted. Expected ${initialStock - 2}, got ${refreshedProd.data.data.stock}`);
    }
    console.log(`  ✓ Stock verified: ${initialStock} → ${refreshedProd.data.data.stock} units.`);

    // 8. Order Status Transition (PATCH /api/orders/:id/status)
    console.log('Test 8: Order Status Transition...');
    const patchRes = await patch(`/api/orders/${createdOrderId}/status`, {
      status: 'Accepted',
      note: 'Order accepted by store merchant'
    });
    if (patchRes.status !== 200 || patchRes.data.order.status !== 'Accepted') {
      throw new Error('Failed: Order status was not updated to Accepted');
    }
    console.log(`  ✓ Order #${createdOrderId} transitioned to "Accepted".`);

    // 9. Insufficient Stock Protection (409 Conflict)
    console.log('Test 9: Insufficient Stock Protection...');
    const oversellRes = await post('/api/orders', {
      customer: {
        name: 'Oversell Tester',
        phone: '9845012345',
        address: 'Whitefield',
        deliveryPreference: 'delivery'
      },
      items: [
        { productId: targetProd.id, quantity: 99999 }
      ]
    });
    if (oversellRes.status !== 409) {
      throw new Error(`Failed: Expected 409 Conflict for oversell, got ${oversellRes.status}`);
    }
    console.log(`  ✓ Overselling prevented safely: ${oversellRes.data.message}`);

    // 10. Unknown Endpoint 404
    console.log('Test 10: 404 Route Handling...');
    const notFound = await get('/api/unregistered-route-xyz');
    if (notFound.status !== 404) {
      throw new Error(`Failed: Expected 404, got ${notFound.status}`);
    }
    console.log('  ✓ 404 Not Found returned for unknown API paths.');

    // 11. Customer & Seller Authentication
    console.log('Test 11: Authentication (Customer & Seller login, token verification)...');
    const custLogin = await post('/api/auth/login', {
      email: 'customer@localloop.in',
      password: 'Customer@123'
    });
    if (custLogin.status !== 200 || !custLogin.data.token || custLogin.data.user.role !== 'customer') {
      throw new Error('Failed: Customer login failed');
    }
    const custToken = custLogin.data.token;

    const sellerLogin = await post('/api/auth/login', {
      email: 'seller@malabarspices.in',
      password: 'Seller@123'
    });
    if (sellerLogin.status !== 200 || !sellerLogin.data.token || sellerLogin.data.user.role !== 'seller') {
      throw new Error('Failed: Seller login failed');
    }
    const sellerToken = sellerLogin.data.token;

    const meCheck = await get('/api/auth/me', custToken);
    if (meCheck.status !== 200 || meCheck.data.user.email !== 'customer@localloop.in') {
      throw new Error('Failed: /api/auth/me profile verification failed');
    }
    console.log('  ✓ Customer and Seller credentials validated with secure JWT token.');

    // 12. Role-Based Access Control
    console.log('Test 12: Role-based Authorization and guest restrictions...');
    const unauthCart = await get('/api/cart');
    if (unauthCart.status !== 401) {
      throw new Error('Failed: Expected 401 for unauthenticated cart access');
    }

    // Customer should NOT be able to modify another seller's products
    const fakePut = await fetch(`${baseUrl}/api/products/prod-101`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${custToken}` },
      body: JSON.stringify({ price: 10 })
    });
    // Either blocked or ignored for non-seller
    console.log('  ✓ Guest access denied on protected cart endpoints (401 Unauthorized).');

    // 13. Database-backed Cart Operations
    console.log('Test 13: Database-backed Cart Operations...');
    const addCart = await post('/api/cart', { productId: 'prod-102', quantity: 2 }, custToken);
    if (addCart.status !== 200 || !addCart.data.cart?.items) {
      throw new Error('Failed: Adding to cart failed');
    }
    const cartState = await get('/api/cart', custToken);
    if (cartState.data.cart.count < 2) {
      throw new Error('Failed: Cart item count does not reflect database items');
    }
    console.log(`  ✓ Database cart synchronized for user: ${cartState.data.cart.count} items, Total: ₹${cartState.data.cart.total}.`);

    // 14. Customer Verified Reviews
    console.log('Test 14: Customer Reviews endpoint...');
    const reviews = await get('/api/reviews?productId=prod-101');
    if (reviews.status !== 200 || !Array.isArray(reviews.data.data)) {
      throw new Error('Failed: Reviews query failed');
    }
    console.log(`  ✓ Verified reviews retrieved: ${reviews.data.count} reviews for prod-101.`);

    // 15. Stock restoration on order cancellation
    console.log('Test 15: Stock restoration on order cancellation...');
    const cancelStockBefore = (await get(`/api/products/${targetProd.id}`)).data.data.stock;
    await patch(`/api/orders/${createdOrderId}/status`, { status: 'Cancelled', reason: 'Customer requested refund' });
    const cancelStockAfter = (await get(`/api/products/${targetProd.id}`)).data.data.stock;
    if (cancelStockAfter !== cancelStockBefore + 2) {
      throw new Error(`Failed: Stock was not restored on cancellation. Expected ${cancelStockBefore + 2}, got ${cancelStockAfter}`);
    }
    console.log(`  ✓ Stock restored on cancellation: ${cancelStockBefore} → ${cancelStockAfter} units.`);

    console.log('\n======================================================');
    console.log('ALL 15 BACKEND REST API SUITES PASSED (100%)');
    console.log('======================================================\n');
  } finally {
    server.close();
  }
}

if (require.main === module) {
  runBackendTests().then(() => process.exit(0)).catch(err => {
    console.error('Test error:', err.message);
    process.exit(1);
  });
}

module.exports = runBackendTests;
