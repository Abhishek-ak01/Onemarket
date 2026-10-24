/**
 * OneMarket - Admin & UPI Payment Verification Test
 */

const http = require('http');

function postJSON(path, payload, token = null) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(payload);
    const headers = {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data)
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path,
      method: 'POST',
      headers
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, text: body });
        }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function getJSON(path, token = null) {
  return new Promise((resolve, reject) => {
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path,
      method: 'GET',
      headers
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, text: body });
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function runTests() {
  console.log('--- STARTING ADMIN & PAYMENT ENDPOINT TESTS ---');

  // Test 1: Unauthorized access to admin stats
  const unauthStats = await getJSON('/api/admin/stats');
  console.log('1. Unauthorized access to /api/admin/stats status:', unauthStats.status);
  if (unauthStats.status !== 401) throw new Error('Expected 401 for unauthenticated admin access');

  // Test 2: Admin login
  const loginRes = await postJSON('/api/auth/login', {
    email: 'admin@onemarket.in',
    password: 'Admin@OneMarket2026!'
  });
  console.log('2. Admin login status:', loginRes.status, 'Role:', loginRes.data?.user?.role);
  if (loginRes.status !== 200 || loginRes.data?.user?.role !== 'admin') {
    throw new Error('Admin login failed: ' + JSON.stringify(loginRes.data));
  }
  const adminToken = loginRes.data.token;

  // Test 3: Authorized admin stats
  const authStats = await getJSON('/api/admin/stats', adminToken);
  console.log('3. Authorized stats:', authStats.data?.stats);
  if (authStats.status !== 200 || authStats.data?.stats?.totalOrders === undefined) {
    throw new Error('Stats retrieval failed');
  }

  // Test 4: List users
  const usersRes = await getJSON('/api/admin/users', adminToken);
  console.log('4. Registered users count:', usersRes.data?.users?.length);
  if (usersRes.status !== 200 || !Array.isArray(usersRes.data?.users)) {
    throw new Error('Users retrieval failed');
  }

  // Test 5: List products
  const prodsRes = await getJSON('/api/admin/products', adminToken);
  console.log('5. Marketplace products count:', prodsRes.data?.products?.length);

  // Test 6: Payment config
  const payConfig = await getJSON('/api/payments/config');
  console.log('6. Payment config:', payConfig.data);
  if (!payConfig.data?.upiVpa) throw new Error('Payment config failed');

  // Test 7: Create a fresh order to test payment creation and verification
  const newOrderRes = await postJSON('/api/orders', {
    customer: {
      name: 'Priya Sharma',
      phone: '9876543210',
      address: 'Vidyanagar, Hubballi - 580021'
    },
    items: [
      {
        productId: 'prod-101',
        quantity: 1,
        price: 245
      }
    ],
    paymentMethod: 'UPI Payment',
    paymentStatus: 'Pending'
  });
  const testOrderId = newOrderRes.data?.order?.id || 'LL-2026-1044';

  const createPayRes = await postJSON('/api/payments/create-order', {
    orderId: testOrderId,
    method: 'UPI'
  });
  console.log('7. Create payment request:', createPayRes.data);
  if (createPayRes.status !== 200 || !createPayRes.data?.upiUri) {
    throw new Error('Payment create-order failed: ' + JSON.stringify(createPayRes.data));
  }

  // Test 8: Verify payment
  const verifyRes = await postJSON('/api/payments/verify', {
    orderId: testOrderId,
    gatewayOrderId: createPayRes.data.gatewayOrderId,
    gatewayPaymentId: 'pay_test_' + Date.now(),
    gatewaySignature: 'sandbox_test_sig'
  });
  console.log('8. Verify payment status:', verifyRes.status, verifyRes.data?.message);
  if (verifyRes.status !== 200 || verifyRes.data?.paymentStatus !== 'Paid') {
    throw new Error('Payment verification failed');
  }

  // Test 9: Check audit logs
  const auditRes = await getJSON('/api/admin/audit-logs', adminToken);
  console.log('9. Audit logs count:', auditRes.data?.logs?.length);

  console.log('✓ ALL ADMIN & PAYMENT TESTS PASSED SUCCESSFULLY!');
}

runTests().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
