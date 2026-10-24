/**
 * LocalLoop - Orders Routes
 * Transactional order placement, status transitions, inventory deduction, and audit history.
 */

const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { syncToSupabase } = require('../config/supabase');
const { optionalAuth } = require('../middleware/auth');

/**
 * Format raw order rows into the unified customer/items/statusHistory structure
 */
async function populateOrderDetails(orders) {
  if (!orders || orders.length === 0) return [];

  const orderIds = orders.map(o => o.id);
  const placeholders = orderIds.map(() => '?').join(', ');

  const items = await db.query(
    `SELECT 
      id, 
      order_id AS orderId, 
      product_id AS productId, 
      image,
      name, 
      category, 
      CAST(price AS DOUBLE) AS price, 
      CAST(original_price AS DOUBLE) AS originalPrice,
      CAST(discount AS DOUBLE) AS discount,
      quantity, 
      shop_id AS shopId, 
      shop_name AS shopName 
     FROM order_items 
     WHERE order_id IN (${placeholders}) 
     ORDER BY id ASC`,
    orderIds
  );

  const history = await db.query(
    `SELECT 
      order_id AS orderId, 
      status, 
      \`timestamp\`, 
      note 
     FROM order_status_history 
     WHERE order_id IN (${placeholders}) 
     ORDER BY id ASC`,
    orderIds
  );

  const itemsMap = {};
  const historyMap = {};
  for (const item of items) {
    if (!itemsMap[item.orderId]) itemsMap[item.orderId] = [];
    itemsMap[item.orderId].push(item);
  }
  for (const h of history) {
    if (!historyMap[h.orderId]) historyMap[h.orderId] = [];
    historyMap[h.orderId].push({
      status: h.status,
      timestamp: h.timestamp ? new Date(h.timestamp).toISOString() : new Date().toISOString(),
      note: h.note || ''
    });
  }

  return orders.map(order => ({
    id: order.id,
    userId: order.user_id || null,
    date: order.created_at ? new Date(order.created_at).toISOString() : new Date().toISOString(),
    customer: {
      name: order.customer_name,
      phone: order.customer_phone,
      address: order.customer_address || '',
      deliveryPreference: order.delivery_preference || 'delivery',
      notes: order.notes || ''
    },
    paymentMethod: order.payment_method || 'Cash on Delivery (Demo)',
    paymentStatus: order.payment_status || 'Pending',
    subtotal: Number(order.subtotal || order.total),
    deliveryFee: Number(order.delivery_fee || 0),
    taxes: Number(order.taxes || 0),
    tokensEarned: parseInt(order.tokens_earned || 0, 10),
    tokensRedeemed: parseInt(order.tokens_redeemed || 0, 10),
    tokenDiscount: Number(order.token_discount || 0),
    items: itemsMap[order.id] || [],
    total: Number(order.total),
    status: order.status,
    statusHistory: historyMap[order.id] || [
      { status: order.status, timestamp: new Date(order.created_at).toISOString() }
    ],
    createdAt: order.created_at,
    updatedAt: order.updated_at
  }));
}

/**
 * GET /api/orders
 * Retrieve orders list, optionally filtered by seller shop (?shop_id=...) or customer (?user_id=... / ?phone=...)
 */
router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const { shop_id, shopId, user_id, customer_phone, status } = req.query;
    const filterShopId = shop_id || shopId;

    let sql = 'SELECT DISTINCT o.* FROM orders o';
    const params = [];
    const conditions = [];

    if (filterShopId && filterShopId !== 'all') {
      sql += ' JOIN order_items oi ON o.id = oi.order_id';
      conditions.push('oi.shop_id = ?');
      params.push(filterShopId.trim());
    }

    if (req.user && req.user.role === 'customer' && !filterShopId) {
      conditions.push('(o.user_id = ? OR o.customer_phone = ?)');
      params.push(req.user.id, req.user.phone || '');
    } else if (user_id) {
      conditions.push('o.user_id = ?');
      params.push(user_id.trim());
    }

    if (customer_phone) {
      conditions.push('o.customer_phone = ?');
      params.push(customer_phone.trim());
    }

    if (status && status !== 'all') {
      conditions.push('o.status = ?');
      params.push(status.trim());
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    sql += ' ORDER BY o.created_at DESC';

    const orders = await db.query(sql, params);
    const populated = await populateOrderDetails(orders);

    res.json({
      success: true,
      count: populated.length,
      data: populated
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/orders/:id
 * Retrieve a single order with items and timeline history.
 */
router.get('/:id', optionalAuth, async (req, res, next) => {
  try {
    const orders = await db.query('SELECT * FROM orders WHERE id = ?', [req.params.id]);

    if (orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Order "${req.params.id}" not found.`
      });
    }

    const [populated] = await populateOrderDetails(orders);
    res.json({
      success: true,
      data: populated
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/orders
 * Atomically creates an order with row-level stock locking, server-calculated totals,
 * item insertions, and status history within a strict ACID transaction.
 */
router.post('/', optionalAuth, async (req, res, next) => {
  const connection = await db.getConnection();

  try {
    const { customer, items, notes, paymentMethod, paymentStatus } = req.body;

    // 1. Validation
    if (!customer || !customer.name || !customer.name.trim()) {
      return res.status(400).json({ success: false, message: 'Customer full name is required.' });
    }

    const cleanPhone = (customer.phone || '').toString().replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      return res.status(400).json({ success: false, message: 'A valid 10-digit mobile number is required.' });
    }

    const deliveryPref = customer.deliveryPreference === 'pickup' ? 'pickup' : 'delivery';
    if (deliveryPref === 'delivery' && (!customer.address || !customer.address.trim())) {
      return res.status(400).json({ success: false, message: 'Delivery address is required for home delivery.' });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Order must contain at least one item.' });
    }

    // 2. Begin Transaction
    await connection.beginTransaction();

    // 3. Lock products and verify existence and stock
    const requestedProductIds = items.map(item => item.productId || item.product_id || item.id);
    const placeholders = requestedProductIds.map(() => '?').join(', ');

    const [lockedProducts] = await connection.query(
      `SELECT p.id, p.name, p.category, p.shop_id, p.price, p.original_price, p.stock, p.image, s.name AS shop_name 
       FROM products p 
       LEFT JOIN shops s ON p.shop_id = s.id 
       WHERE p.id IN (${placeholders}) 
       FOR UPDATE`,
      requestedProductIds
    );

    const productMap = {};
    for (const prod of lockedProducts) {
      productMap[prod.id] = prod;
    }

    // Consolidate duplicate productId items if any
    const consolidatedMap = {};
    for (const item of items) {
      const pid = item.productId || item.product_id || item.id;
      if (!pid) continue;
      const q = parseInt(item.quantity, 10) || 1;
      if (consolidatedMap[pid]) {
        consolidatedMap[pid].quantity += q;
      } else {
        consolidatedMap[pid] = { ...item, productId: pid, quantity: q };
      }
    }
    const consolidatedItems = Object.values(consolidatedMap);

    // Check inventory and calculate true server totals
    let subtotal = 0;
    const validatedItems = [];

    for (const cartItem of consolidatedItems) {
      const prodId = cartItem.productId;
      const requestedQty = parseInt(cartItem.quantity, 10);

      if (isNaN(requestedQty) || requestedQty <= 0) {
        await connection.rollback();
        return res.status(400).json({
          success: false,
          message: `Invalid quantity "${cartItem.quantity}" for item.`
        });
      }

      const dbProduct = productMap[prodId];
      if (!dbProduct) {
        await connection.rollback();
        return res.status(404).json({
          success: false,
          message: `Product ID "${prodId}" no longer exists in catalog.`
        });
      }

      if (dbProduct.stock < requestedQty) {
        await connection.rollback();
        return res.status(409).json({
          success: false,
          insufficientStock: true,
          message: `Insufficient stock for "${dbProduct.name}". Only ${dbProduct.stock} units available (Requested: ${requestedQty}).`
        });
      }

      const itemPrice = Number(dbProduct.price);
      const origPrice = dbProduct.original_price ? Number(dbProduct.original_price) : itemPrice;
      const discount = Math.max(0, origPrice - itemPrice);
      subtotal += itemPrice * requestedQty;

      validatedItems.push({
        productId: dbProduct.id,
        name: dbProduct.name,
        category: dbProduct.category,
        image: dbProduct.image || '',
        price: itemPrice,
        originalPrice: origPrice,
        discount,
        quantity: requestedQty,
        shopId: dbProduct.shop_id,
        shopName: dbProduct.shop_name || 'Local Merchant'
      });
    }

    // 4. Loyalty tokens calculation and validation
    // Configurable reward policy:
    const REWARD_EARN_RATE = 100; // 1 token earned per ₹100 eligible merchandise spend
    const REWARD_TOKEN_VALUE = 1.0; // 1 token = ₹1 discount
    const MAX_REDEEM_PERCENT = 0.5; // Up to 50% of merchandise spend

    const requestedRedeemTokens = parseInt(req.body.tokensToRedeem || req.body.tokens_redeemed || 0, 10);
    let tokensRedeemed = 0;
    let tokenDiscount = 0;

    const finalUserId = req.user ? req.user.id : (customer.userId || null);

    if (requestedRedeemTokens > 0 && finalUserId) {
      const [userRows] = await connection.query('SELECT id, reward_tokens FROM users WHERE id = ? FOR UPDATE', [finalUserId]);
      if (userRows.length > 0) {
        const availableTokens = userRows[0].reward_tokens || 0;
        const maxRedeemTokens = Math.floor((subtotal * MAX_REDEEM_PERCENT) / REWARD_TOKEN_VALUE);
        tokensRedeemed = Math.min(requestedRedeemTokens, availableTokens, maxRedeemTokens);
        tokenDiscount = Math.round(tokensRedeemed * REWARD_TOKEN_VALUE * 100) / 100;
      }
    }

    // Calculate Final Total (Free delivery over ₹500, else ₹40; 5% taxes)
    const deliveryFee = subtotal > 0 ? (subtotal >= 500 ? 0 : 40) : 0;
    const taxes = Math.round(Math.max(0, subtotal - tokenDiscount) * 0.05 * 100) / 100;
    const total = Math.max(0, Math.round((subtotal - tokenDiscount + deliveryFee + taxes) * 100) / 100);

    // Calculate tokens earned for this order
    const tokensEarned = Math.floor(subtotal / REWARD_EARN_RATE);

    // 5. Generate Order ID
    const orderId = req.body.id || `LL-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const finalAddress = deliveryPref === 'delivery' ? customer.address.trim() : 'Self-Pickup at Store';
    const finalNotes = (notes || customer.notes || '').trim();
    const finalPayMethod = paymentMethod || 'Cash on Delivery (Demo)';
    const finalPayStatus = paymentStatus || (finalPayMethod.includes('UPI') || finalPayMethod.includes('Card') ? 'Demo Payment Successful' : 'Pending');

    // 6. Insert into orders table with reward token snapshots
    await connection.query(
      `INSERT INTO orders (id, user_id, customer_name, customer_phone, customer_address, delivery_preference, payment_method, payment_status, notes, subtotal, delivery_fee, taxes, total, tokens_earned, tokens_redeemed, token_discount, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending')`,
      [
        orderId,
        finalUserId,
        customer.name.trim(),
        cleanPhone,
        finalAddress,
        deliveryPref,
        finalPayMethod,
        finalPayStatus,
        finalNotes,
        subtotal,
        deliveryFee,
        taxes,
        total,
        tokensEarned,
        tokensRedeemed,
        tokenDiscount
      ]
    );

    // Deduct redeemed tokens from user balance & record ledger
    if (tokensRedeemed > 0 && finalUserId) {
      await connection.query('UPDATE users SET reward_tokens = GREATEST(0, reward_tokens - ?) WHERE id = ?', [tokensRedeemed, finalUserId]);
      await connection.query(
        'INSERT INTO reward_transactions (user_id, order_id, amount, type, description) VALUES (?, ?, ?, "REDEEMED", ?)',
        [finalUserId, orderId, -tokensRedeemed, `Redeemed ${tokensRedeemed} OneMarket tokens on Order #${orderId}`]
      );
    }

    // Award earned tokens & record ledger
    if (tokensEarned > 0 && finalUserId) {
      await connection.query('UPDATE users SET reward_tokens = reward_tokens + ? WHERE id = ?', [tokensEarned, finalUserId]);
      await connection.query(
        'INSERT INTO reward_transactions (user_id, order_id, amount, type, description) VALUES (?, ?, ?, "EARNED", ?)',
        [finalUserId, orderId, tokensEarned, `Earned ${tokensEarned} OneMarket tokens for order #${orderId}`]
      );
    }

    // 7. Insert Order Items (with image snapshot and original price/discount) & 8. Decrement stock
    for (const item of validatedItems) {
      await connection.query(
        `INSERT INTO order_items (order_id, product_id, image, name, category, price, original_price, discount, quantity, shop_id, shop_name)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          orderId,
          item.productId,
          item.image,
          item.name,
          item.category,
          item.price,
          item.originalPrice,
          item.discount,
          item.quantity,
          item.shopId,
          item.shopName
        ]
      );

      // Decrement stock without allowing negative stock
      await connection.query(
        `UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?`,
        [item.quantity, item.productId, item.quantity]
      );
    }

    // 9. Record initial status in order_status_history
    await connection.query(
      `INSERT INTO order_status_history (order_id, status, \`timestamp\`, note)
       VALUES (?, 'Pending', CURRENT_TIMESTAMP, ?)`,
      [orderId, `Order request placed with ${finalPayMethod}.`]
    );

    // 10. Clear user's database cart if customer is authenticated
    if (finalUserId) {
      await connection.query('DELETE FROM cart_items WHERE user_id = ?', [finalUserId]);
    }

    // 11. Commit transaction
    await connection.commit();

    // Sync newly created order and line items directly to Supabase
    await syncToSupabase('orders', 'insert', {
      id: orderId,
      user_id: finalUserId,
      customer_name: customer.name.trim(),
      customer_phone: cleanPhone,
      customer_address: finalAddress,
      delivery_preference: deliveryPref,
      payment_method: finalPayMethod,
      payment_status: finalPayStatus,
      notes: finalNotes,
      subtotal: subtotal,
      delivery_fee: deliveryFee,
      taxes: taxes,
      total: total,
      tokens_earned: tokensEarned,
      tokens_redeemed: tokensRedeemed,
      token_discount: tokenDiscount,
      status: 'Pending'
    });

    const sbItems = validatedItems.map(it => ({
      order_id: orderId,
      product_id: it.productId,
      image: it.image,
      name: it.name,
      category: it.category,
      price: it.price,
      original_price: it.originalPrice,
      discount: it.discount,
      quantity: it.quantity,
      shop_id: it.shopId,
      shop_name: it.shopName
    }));
    await syncToSupabase('order_items', 'insert', sbItems);

    await syncToSupabase('order_status_history', 'insert', {
      order_id: orderId,
      status: 'Pending',
      note: `Order request placed with ${finalPayMethod}.`
    });

    // 12. Fetch complete created order
    const [createdOrder] = await db.query('SELECT * FROM orders WHERE id = ?', [orderId]);
    const [formatted] = await populateOrderDetails([createdOrder]);

    res.status(201).json({
      success: true,
      message: 'Order created successfully!',
      order: formatted
    });
  } catch (err) {
    await connection.rollback();
    next(err);
  } finally {
    connection.release();
  }
});

/**
 * Handle cancellation and status updates securely
 */
async function processOrderStatusUpdate(orderId, status, note, reason, user) {
  const connection = await db.getConnection();

  try {
    const VALID_STATUSES = [
      'Pending',
      'Confirmed',
      'Accepted',
      'Processing',
      'Packed',
      'Shipped',
      'Out for Delivery',
      'Delivered',
      'Completed',
      'Cancelled',
      'Rejected'
    ];

    if (!status || !VALID_STATUSES.includes(status)) {
      throw { status: 400, message: `Invalid status "${status}". Allowed values: ${VALID_STATUSES.join(', ')}` };
    }

    await connection.beginTransaction();

    const [orders] = await connection.query('SELECT * FROM orders WHERE id = ? FOR UPDATE', [orderId]);
    if (orders.length === 0) {
      await connection.rollback();
      throw { status: 404, message: `Order "${orderId}" not found.` };
    }

    const currentOrder = orders[0];

    // Ownership check if customer is cancelling
    if (status === 'Cancelled' && user && user.role === 'customer') {
      const isOwner = (currentOrder.user_id === user.id) ||
                      (user.phone && currentOrder.customer_phone === user.phone);
      if (!isOwner) {
        await connection.rollback();
        throw { status: 403, message: 'You are not authorized to cancel an order belonging to another customer.' };
      }
    }

    // Cancellation eligibility check
    if (status === 'Cancelled') {
      const NON_CANCELLABLE = ['Shipped', 'Out for Delivery', 'Delivered', 'Completed', 'Cancelled', 'Rejected'];
      if (NON_CANCELLABLE.includes(currentOrder.status)) {
        await connection.rollback();
        throw {
          status: 400,
          message: `Cannot cancel Order #${orderId}. Current status is "${currentOrder.status}". Orders that are already shipped, out for delivery, or completed cannot be cancelled directly.`
        };
      }
    }

    // If order is transitioning to Cancelled or Rejected from an active state, restore inventory exactly once
    const isCancelling = (status === 'Cancelled' || status === 'Rejected') &&
                         currentOrder.status !== 'Cancelled' &&
                         currentOrder.status !== 'Rejected';

    if (isCancelling) {
      const [items] = await connection.query('SELECT product_id, quantity FROM order_items WHERE order_id = ?', [orderId]);
      for (const it of items) {
        await connection.query('UPDATE products SET stock = stock + ? WHERE id = ?', [it.quantity, it.product_id]);
      }

      // Reverse earned tokens and refund redeemed tokens in database
      if (currentOrder.user_id) {
        if (currentOrder.tokens_earned > 0) {
          await connection.query('UPDATE users SET reward_tokens = GREATEST(0, reward_tokens - ?) WHERE id = ?', [currentOrder.tokens_earned, currentOrder.user_id]);
          await connection.query(
            'INSERT INTO reward_transactions (user_id, order_id, amount, type, description) VALUES (?, ?, ?, "CANCELLED_REVERSAL", ?)',
            [currentOrder.user_id, orderId, -currentOrder.tokens_earned, `Reversal of ${currentOrder.tokens_earned} tokens earned on cancelled Order #${orderId}`]
          );
        }
        if (currentOrder.tokens_redeemed > 0) {
          await connection.query('UPDATE users SET reward_tokens = reward_tokens + ? WHERE id = ?', [currentOrder.tokens_redeemed, currentOrder.user_id]);
          await connection.query(
            'INSERT INTO reward_transactions (user_id, order_id, amount, type, description) VALUES (?, ?, ?, "REFUND", ?)',
            [currentOrder.user_id, orderId, currentOrder.tokens_redeemed, `Refund of ${currentOrder.tokens_redeemed} tokens redeemed on cancelled Order #${orderId}`]
          );
        }
      }
    }

    await connection.query(
      'UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [status, orderId]
    );

    const auditNote = note || reason || (status === 'Cancelled' ? 'Order cancelled by customer.' : `Status changed from ${currentOrder.status} to ${status}`);
    await connection.query(
      'INSERT INTO order_status_history (order_id, status, `timestamp`, note) VALUES (?, ?, CURRENT_TIMESTAMP, ?)',
      [orderId, status, auditNote]
    );

    await connection.commit();

    await syncToSupabase('orders', 'update', { status, updated_at: new Date().toISOString() }, 'id', orderId);
    await syncToSupabase('order_status_history', 'insert', {
      order_id: orderId,
      status,
      note: auditNote
    });

    const [updated] = await db.query('SELECT * FROM orders WHERE id = ?', [orderId]);
    const [formatted] = await populateOrderDetails([updated]);

    return {
      success: true,
      message: `Order #${orderId} status updated to "${status}".`,
      order: formatted
    };
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

/**
 * PATCH /api/orders/:id/status
 * Updates order fulfilment status with audit trail and inventory restoration on cancellation
 */
router.patch('/:id/status', optionalAuth, async (req, res, next) => {
  try {
    const { status, note, reason } = req.body;
    const result = await processOrderStatusUpdate(req.params.id, status, note, reason, req.user);
    res.json(result);
  } catch (err) {
    if (err.status) {
      return res.status(err.status).json({ success: false, message: err.message });
    }
    next(err);
  }
});

/**
 * POST /api/orders/:id/cancel
 * Dedicated customer order cancellation endpoint with inventory restoration and token refund
 */
router.post('/:id/cancel', optionalAuth, async (req, res, next) => {
  try {
    const reason = req.body.reason || req.body.note || 'Cancelled by customer.';
    const result = await processOrderStatusUpdate(req.params.id, 'Cancelled', reason, reason, req.user);
    res.json({
      ...result,
      message: `Order #${req.params.id} has been cancelled successfully. Any reserved inventory and reward tokens have been safely restored.`
    });
  } catch (err) {
    if (err.status) {
      return res.status(err.status).json({ success: false, message: err.message });
    }
    next(err);
  }
});

module.exports = router;
