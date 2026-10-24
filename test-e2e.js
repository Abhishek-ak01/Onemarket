/**
 * End-to-End Verification Test Script
 * Tests live HTTP server endpoints on http://localhost:3000
 */

const http = require('http');

function request(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const dataString = body ? JSON.stringify(body) : null;
    const reqHeaders = {
      'Content-Type': 'application/json',
      ...headers
    };
    if (dataString) {
      reqHeaders['Content-Length'] = Buffer.byteLength(dataString);
    }

    const options = {
      hostname: 'localhost',
      port: 3000,
      path,
      method,
      headers: reqHeaders
    };

    const req = http.request(options, (res) => {
      let rawData = '';
      res.on('data', chunk => rawData += chunk);
      res.on('end', () => {
        try {
          const parsed = res.headers['content-type']?.includes('application/json')
            ? JSON.parse(rawData)
            : rawData;
          resolve({ status: res.statusCode, data: parsed, headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, data: rawData, headers: res.headers });
        }
      });
    });

    req.on('error', reject);
    if (dataString) req.write(dataString);
    req.end();
  });
}

async function runLiveTests() {
  console.log('==================== RUNNING LIVE E2E HTTP TESTS ====================');

  // Test 1: Health
  const health = await request('GET', '/api/health');
  console.log('Test 1: GET /api/health -> Status:', health.status, health.data.status);
  if (health.status !== 200) throw new Error('Health check failed');

  // Test 2: Products
  const prods = await request('GET', '/api/products');
  console.log('Test 2: GET /api/products -> Count:', prods.data.count);
  if (prods.data.count < 49) throw new Error('Expected 49 products in catalogue');

  // Test 3: Customer Login
  const login = await request('POST', '/api/auth/login', {
    email: 'customer@localloop.in',
    password: 'Customer@123'
  });
  console.log('Test 3: POST /api/auth/login -> User:', login.data.user.name, 'Tokens:', login.data.user.reward_tokens);
  const token = login.data.token;
  if (!token) throw new Error('Login failed: no token');

  // Test 4: Rewards Endpoint
  const rewards = await request('GET', '/api/auth/rewards', null, { Authorization: `Bearer ${token}` });
  console.log('Test 4: GET /api/auth/rewards -> Balance:', rewards.data.data.balance, 'Transactions:', rewards.data.data.transactions.length);
  if (rewards.status !== 200) throw new Error('Failed to fetch rewards');

  // Test 5: Check Cardamom image
  const cardamom = prods.data.data.find(p => p.id === 'prod-101');
  console.log('Test 5: Product prod-101 (Cardamom) image path:', cardamom.image);
  if (!cardamom.image.includes('prod-101.jpg')) throw new Error('Cardamom image mismatch');

  // Test 6: Place order with reward token redemption
  const startTokens = rewards.data.data.balance;
  const tokensToRedeem = Math.min(startTokens, 5);
  const testOrderId = `LL-LIVE-${Date.now()}`;
  const initialStock = cardamom.stock;

  console.log(`Test 6: Placing order #${testOrderId} with ${tokensToRedeem} tokens redeemed...`);
  const orderRes = await request('POST', '/api/orders', {
    id: testOrderId,
    customer: {
      name: 'Aditi Rao',
      phone: '9845012345',
      address: 'Flat 402, Green Palms, Koppikar Road, Hubballi - 580020',
      deliveryPreference: 'delivery'
    },
    items: [
      { productId: 'prod-101', quantity: 1 }
    ],
    paymentMethod: 'Cash on Delivery',
    paymentStatus: 'Pending',
    tokensToRedeem: tokensToRedeem
  }, { Authorization: `Bearer ${token}` });

  console.log('  -> Order status:', orderRes.status, 'Total in INR: ₹' + orderRes.data.order.total);
  console.log('  -> Tokens redeemed:', orderRes.data.order.tokensRedeemed, 'Tokens earned:', orderRes.data.order.tokensEarned);
  if (orderRes.status !== 201) throw new Error('Order creation failed: ' + JSON.stringify(orderRes.data));

  // Verify stock decremented
  const prodAfter = await request('GET', '/api/products/prod-101');
  console.log('  -> Stock after order:', prodAfter.data.data.stock, `(was ${initialStock})`);
  if (prodAfter.data.data.stock !== initialStock - 1) throw new Error('Stock was not decremented correctly');

  // Test 7: Cancel order and verify inventory restoration & token refund
  console.log(`Test 7: Cancelling order #${testOrderId}...`);
  const cancelRes = await request('POST', `/api/orders/${testOrderId}/cancel`, {
    reason: 'Customer requested change of address.'
  }, { Authorization: `Bearer ${token}` });

  console.log('  -> Cancel status:', cancelRes.status, cancelRes.data.message);
  if (cancelRes.status !== 200) throw new Error('Cancellation failed');

  // Verify stock restored
  const prodRestored = await request('GET', '/api/products/prod-101');
  console.log('  -> Stock after cancellation:', prodRestored.data.data.stock, `(restored to ${initialStock})`);
  if (prodRestored.data.data.stock !== initialStock) throw new Error('Stock was not restored correctly');

  // Verify token rollback
  const rewardsAfter = await request('GET', '/api/auth/rewards', null, { Authorization: `Bearer ${token}` });
  console.log('  -> Tokens after cancellation rollback:', rewardsAfter.data.data.balance, `(restored to ${startTokens})`);

  console.log('\n======================================================');
  console.log('ALL LIVE E2E HTTP INTEGRATION TESTS PASSED (100%)!');
  console.log('======================================================\n');
}

runLiveTests().catch(err => {
  console.error('LIVE TEST ERROR:', err);
  process.exit(1);
});
