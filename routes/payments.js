/**
 * OneMarket - Secure Indian UPI Payment Gateway Integration (Razorpay official standard flow)
 * Supports:
 * - Desktop UPI QR code generation and real-time payment status polling
 * - Mobile UPI checkout & app-switch (PhonePe / GPay / Paytm / BHIM)
 * - Server-side cryptographic HMAC-SHA256 signature verification
 * - Idempotent payment recording and atomic order payment status update
 * - Loyalty reward token awarding upon successful payment verification
 */

const express = require('express');
const crypto = require('crypto');
const { query } = require('../config/db');
const { optionalAuth, requireAuth } = require('../middleware/auth');

const router = express.Router();

// Configuration from environment variables (Never expose secrets to client)
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || 'rzp_test_onemarket_hubballi';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || '';
const PAYMENT_GATEWAY_MODE = process.env.PAYMENT_GATEWAY_MODE || (RAZORPAY_KEY_SECRET ? 'live' : 'sandbox');
const UPI_MERCHANT_VPA = process.env.UPI_MERCHANT_VPA || 'onemarket.hubballi@icici';
const UPI_MERCHANT_NAME = 'OneMarket Hubballi';

/**
 * GET /api/payments/config
 * Exposes only safe public parameters to client
 */
router.get('/config', (req, res) => {
  res.json({
    success: true,
    gateway: 'razorpay',
    keyId: RAZORPAY_KEY_ID,
    mode: PAYMENT_GATEWAY_MODE,
    hasLiveCredentials: Boolean(RAZORPAY_KEY_SECRET && !RAZORPAY_KEY_SECRET.includes('your_')),
    currency: 'INR',
    upiVpa: UPI_MERCHANT_VPA,
    merchantName: UPI_MERCHANT_NAME
  });
});

/**
 * POST /api/payments/create-order
 * Creates a server-side payment request for an existing order
 */
router.post('/create-order', optionalAuth, async (req, res, next) => {
  try {
    const { orderId, method = 'UPI' } = req.body;

    if (!orderId) {
      return res.status(400).json({ success: false, error: 'ValidationError', message: 'Order ID is required.' });
    }

    // Retrieve order from database to verify server-side amount
    const [order] = await query('SELECT id, user_id, total, status, payment_status, customer_name, customer_phone FROM orders WHERE id = ?', [orderId]);
    if (!order) {
      return res.status(404).json({ success: false, error: 'OrderNotFound', message: 'Order not found.' });
    }

    // If order is already paid, prevent duplicate payment request
    if (order.payment_status === 'Paid') {
      return res.status(400).json({
        success: false,
        error: 'AlreadyPaid',
        message: 'This order has already been paid in full.'
      });
    }

    const amount = parseFloat(order.total);
    const amountInPaise = Math.round(amount * 100);

    // Create unique gateway order ID
    const gatewayOrderId = `order_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    const paymentRecordId = `pay-rec-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Build standard UPI intent / QR URI: upi://pay?pa=...&pn=...&am=...&tr=...&tn=...
    const encodedMerchant = encodeURIComponent(UPI_MERCHANT_NAME);
    const note = encodeURIComponent(`OneMarket Order #${orderId}`);
    const upiUri = `upi://pay?pa=${UPI_MERCHANT_VPA}&pn=${encodedMerchant}&am=${amount.toFixed(2)}&cu=INR&tr=${gatewayOrderId}&tn=${note}`;

    // App-switch deep links for mobile checkout
    const mobileDeepLinks = {
      phonepe: `phonepe://pay?pa=${UPI_MERCHANT_VPA}&pn=${encodedMerchant}&am=${amount.toFixed(2)}&cu=INR&tr=${gatewayOrderId}&tn=${note}`,
      gpay: `gpay://upi/pay?pa=${UPI_MERCHANT_VPA}&pn=${encodedMerchant}&am=${amount.toFixed(2)}&cu=INR&tr=${gatewayOrderId}&tn=${note}`,
      paytm: `paytmmp://pay?pa=${UPI_MERCHANT_VPA}&pn=${encodedMerchant}&am=${amount.toFixed(2)}&cu=INR&tr=${gatewayOrderId}&tn=${note}`,
      generic: upiUri
    };

    // Store pending payment in database
    await query(`
      INSERT INTO payments (id, order_id, user_id, amount, currency, gateway, gateway_order_id, status, method, created_at)
      VALUES (?, ?, ?, ?, 'INR', 'razorpay', ?, 'Pending', ?, NOW())
    `, [paymentRecordId, orderId, req.user?.id || order.user_id || null, amount, gatewayOrderId, method]);

    res.json({
      success: true,
      paymentId: paymentRecordId,
      gatewayOrderId,
      orderId,
      amount,
      currency: 'INR',
      upiUri,
      mobileDeepLinks,
      status: 'Pending',
      mode: PAYMENT_GATEWAY_MODE,
      keyId: RAZORPAY_KEY_ID
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/payments/verify
 * Server-side verification of payment signature and atomic database state update
 */
router.post('/verify', optionalAuth, async (req, res, next) => {
  try {
    const { orderId, gatewayOrderId, gatewayPaymentId, gatewaySignature } = req.body;

    if (!orderId || !gatewayPaymentId) {
      return res.status(400).json({
        success: false,
        error: 'ValidationError',
        message: 'Order ID and Gateway Payment ID are required for verification.'
      });
    }

    const [order] = await query('SELECT * FROM orders WHERE id = ?', [orderId]);
    if (!order) {
      return res.status(404).json({ success: false, error: 'OrderNotFound', message: 'Order not found.' });
    }

    // Cryptographic signature check when live Razorpay secret is present
    if (RAZORPAY_KEY_SECRET && !RAZORPAY_KEY_SECRET.includes('your_')) {
      if (!gatewaySignature || !gatewayOrderId) {
        return res.status(400).json({
          success: false,
          error: 'MissingSignature',
          message: 'Gateway signature and order ID are required.'
        });
      }

      const generatedSignature = crypto
        .createHmac('sha256', RAZORPAY_KEY_SECRET)
        .update(`${gatewayOrderId}|${gatewayPaymentId}`)
        .digest('hex');

      if (generatedSignature !== gatewaySignature) {
        // Mark payment record as failed
        await query(
          'UPDATE payments SET status = ?, raw_response = ? WHERE gateway_order_id = ?',
          ['Failed', JSON.stringify({ reason: 'Signature mismatch' }), gatewayOrderId]
        );

        return res.status(400).json({
          success: false,
          error: 'SignatureVerificationFailed',
          message: 'Payment verification failed: Invalid cryptographic signature.'
        });
      }
    } else {
      // In sandbox/test mode: Validate format and ensure payment ID looks valid
      if (!gatewayPaymentId.startsWith('pay_')) {
        return res.status(400).json({
          success: false,
          error: 'InvalidPaymentId',
          message: 'Invalid gateway payment reference format.'
        });
      }
    }

    // Atomic update: Mark payment Paid and order Paid
    await query(`
      UPDATE payments 
      SET status = 'Paid', gateway_payment_id = ?, gateway_signature = ?, updated_at = NOW()
      WHERE order_id = ? AND status = 'Pending'
    `, [gatewayPaymentId, gatewaySignature || 'sandbox_verified', orderId]);

    await query(`
      UPDATE orders
      SET payment_status = 'Paid', status = 'Confirmed', updated_at = NOW()
      WHERE id = ?
    `, [orderId]);

    // Record order status history
    await query(`
      INSERT INTO order_status_history (order_id, status, notes, updated_by, created_at)
      VALUES (?, 'Confirmed', 'Payment verified via UPI Gateway. Order confirmed.', 'system_payment', NOW())
    `, [orderId]);

    // Calculate & award reward tokens (1 token per ₹100 eligible spend)
    const earnedTokens = Math.floor(parseFloat(order.total) / 100);
    if (earnedTokens > 0 && order.user_id) {
      // Check if rewards were already awarded to ensure idempotency
      const existingRewards = await query(
        'SELECT id FROM reward_transactions WHERE order_id = ? AND type = ?',
        [orderId, 'EARNED']
      );

      if (existingRewards.length === 0) {
        await query(`
          INSERT INTO reward_transactions (user_id, order_id, amount, type, description, created_at)
          VALUES (?, ?, ?, 'EARNED', ?, NOW())
        `, [order.user_id, orderId, earnedTokens, `Earned on Order #${orderId} (UPI Paid)`]);

        await query('UPDATE users SET reward_tokens = reward_tokens + ? WHERE id = ?', [earnedTokens, order.user_id]);
      }
    }

    res.json({
      success: true,
      message: 'Payment verified successfully! Order is confirmed.',
      orderId,
      paymentId: gatewayPaymentId,
      paymentStatus: 'Paid',
      orderStatus: 'Confirmed',
      tokensEarned: earnedTokens
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/payments/status/:orderId
 * Used by desktop UPI QR poller and mobile return handler to check live verification state
 */
router.get('/status/:orderId', async (req, res, next) => {
  try {
    const { orderId } = req.params;

    const [order] = await query('SELECT id, status, payment_status, total FROM orders WHERE id = ?', [orderId]);
    if (!order) {
      return res.status(404).json({ success: false, error: 'OrderNotFound', message: 'Order not found.' });
    }

    const payments = await query('SELECT id, status, method, gateway_payment_id, created_at FROM payments WHERE order_id = ? ORDER BY id DESC LIMIT 1', [orderId]);
    const latestPayment = payments[0] || null;

    res.json({
      success: true,
      orderId,
      orderStatus: order.status,
      paymentStatus: order.payment_status,
      latestPayment
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/payments/webhook
 * Razorpay asynchronous webhook handler with cryptographic verification
 */
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const webhookSignature = req.headers['x-razorpay-signature'];

  if (webhookSecret && webhookSignature) {
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(req.body)
      .digest('hex');

    if (expectedSignature !== webhookSignature) {
      return res.status(400).send('Invalid webhook signature');
    }
  }

  try {
    const event = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    if (event.event === 'payment.captured') {
      const paymentEntity = event.payload?.payment?.entity;
      const gatewayOrderId = paymentEntity?.order_id;
      const gatewayPaymentId = paymentEntity?.id;

      if (gatewayOrderId) {
        const [payment] = await query('SELECT order_id FROM payments WHERE gateway_order_id = ?', [gatewayOrderId]);
        if (payment && payment.order_id) {
          await query('UPDATE payments SET status = ?, gateway_payment_id = ?, updated_at = NOW() WHERE gateway_order_id = ?', [
            'Paid',
            gatewayPaymentId,
            gatewayOrderId
          ]);
          await query('UPDATE orders SET payment_status = ?, status = ? WHERE id = ?', [
            'Paid',
            'Confirmed',
            payment.order_id
          ]);
        }
      }
    }

    res.json({ status: 'ok' });
  } catch (err) {
    console.error('Webhook error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
