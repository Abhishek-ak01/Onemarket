/**
 * LocalLoop - Shopping Cart REST API
 * Database-backed cart persistence for authenticated customers.
 * Validates stock, prevents overselling, and calculates authoritative pricing.
 */

const express = require('express');
const { query } = require('../config/db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

/**
 * Helper to compute authoritative cart pricing and item breakdown
 */
async function getCartBreakdown(userId) {
  const sql = `
    SELECT 
      ci.id as cart_item_id,
      ci.product_id,
      ci.quantity,
      p.name,
      p.category,
      p.price,
      p.original_price,
      p.discount_percent,
      p.stock,
      p.image,
      p.is_active,
      s.id as shop_id,
      s.name as shop_name,
      s.area as shop_area
    FROM cart_items ci
    JOIN products p ON ci.product_id = p.id
    JOIN shops s ON p.shop_id = s.id
    WHERE ci.user_id = ?
    ORDER BY ci.created_at ASC
  `;

  const rows = await query(sql, [userId]);

  let subtotal = 0;
  let totalDiscount = 0;
  const items = [];

  for (const row of rows) {
    const unitPrice = parseFloat(row.price);
    const origPrice = row.original_price ? parseFloat(row.original_price) : unitPrice;
    const quantity = parseInt(row.quantity, 10);
    const stock = parseInt(row.stock, 10);
    const lineTotal = unitPrice * quantity;
    const lineDiscount = Math.max(0, (origPrice - unitPrice) * quantity);

    subtotal += lineTotal;
    totalDiscount += lineDiscount;

    items.push({
      cartItemId: row.cart_item_id,
      productId: row.product_id,
      name: row.name,
      category: row.category,
      price: unitPrice,
      originalPrice: origPrice,
      discountPercent: row.discount_percent || 0,
      quantity,
      availableStock: stock,
      isAvailable: stock >= quantity && row.is_active === 1,
      image: row.image,
      shopId: row.shop_id,
      shopName: row.shop_name,
      shopArea: row.shop_area,
      lineTotal
    });
  }

  // Delivery charge rule: ₹40 standard delivery, Free for orders above ₹500
  const deliveryFee = subtotal > 0 ? (subtotal >= 500 ? 0 : 40) : 0;
  // Modest local GST estimate 5%
  const taxes = Math.round(subtotal * 0.05 * 100) / 100;
  const total = subtotal > 0 ? Math.round((subtotal + deliveryFee + taxes) * 100) / 100 : 0;

  return {
    items,
    count: items.reduce((acc, it) => acc + it.quantity, 0),
    subtotal: Math.round(subtotal * 100) / 100,
    totalDiscount: Math.round(totalDiscount * 100) / 100,
    deliveryFee,
    taxes,
    total
  };
}

/**
 * GET /api/cart
 * Returns the current authenticated customer's cart
 */
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const cart = await getCartBreakdown(req.user.id);
    return res.status(200).json({ success: true, cart });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/cart
 * Adds an item to the user's database cart or increments quantity
 */
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return res.status(400).json({ success: false, error: 'ValidationError', message: 'productId is required.' });
    }

    const requestedQty = parseInt(quantity, 10);
    if (isNaN(requestedQty) || requestedQty <= 0) {
      return res.status(400).json({ success: false, error: 'ValidationError', message: 'Quantity must be at least 1.' });
    }

    // Verify product exists and check stock
    const prods = await query('SELECT id, name, stock, is_active FROM products WHERE id = ?', [productId]);
    if (prods.length === 0) {
      return res.status(404).json({ success: false, error: 'NotFound', message: 'Product not found.' });
    }

    const prod = prods[0];
    if (prod.stock <= 0 || prod.is_active === 0) {
      return res.status(400).json({
        success: false,
        error: 'OutOfStock',
        message: `"${prod.name}" is currently out of stock.`
      });
    }

    // Check existing cart quantity
    const existing = await query('SELECT id, quantity FROM cart_items WHERE user_id = ? AND product_id = ?', [req.user.id, productId]);

    let newQty = requestedQty;
    if (existing.length > 0) {
      newQty = existing[0].quantity + requestedQty;
    }

    // Enforce stock ceiling
    let partial = false;
    if (newQty > prod.stock) {
      newQty = prod.stock;
      partial = true;
    }

    await query(`
      INSERT INTO cart_items (user_id, product_id, quantity)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE quantity = VALUES(quantity)
    `, [req.user.id, productId, newQty]);

    const updatedCart = await getCartBreakdown(req.user.id);

    return res.status(200).json({
      success: true,
      message: partial
        ? `Added maximum available stock (${newQty} units) of "${prod.name}".`
        : `Added ${requestedQty}x "${prod.name}" to cart.`,
      cart: updatedCart
    });
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/cart/:productId
 * Updates explicit quantity of a cart line item
 */
router.put('/:productId', requireAuth, async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    const targetQty = parseInt(quantity, 10);
    if (isNaN(targetQty)) {
      return res.status(400).json({ success: false, error: 'ValidationError', message: 'Valid quantity is required.' });
    }

    if (targetQty <= 0) {
      await query('DELETE FROM cart_items WHERE user_id = ? AND product_id = ?', [req.user.id, productId]);
      const updatedCart = await getCartBreakdown(req.user.id);
      return res.status(200).json({ success: true, message: 'Item removed from cart.', cart: updatedCart });
    }

    const prods = await query('SELECT stock, name FROM products WHERE id = ?', [productId]);
    if (prods.length === 0) {
      return res.status(404).json({ success: false, error: 'NotFound', message: 'Product not found.' });
    }

    const clampedQty = Math.min(targetQty, prods[0].stock);

    await query('UPDATE cart_items SET quantity = ? WHERE user_id = ? AND product_id = ?', [clampedQty, req.user.id, productId]);

    const updatedCart = await getCartBreakdown(req.user.id);

    return res.status(200).json({
      success: true,
      message: clampedQty < targetQty ? `Limited to available stock (${clampedQty} units).` : 'Cart updated.',
      cart: updatedCart
    });
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/cart/:productId
 * Removes single product from cart
 */
router.delete('/:productId', requireAuth, async (req, res, next) => {
  try {
    const { productId } = req.params;
    await query('DELETE FROM cart_items WHERE user_id = ? AND product_id = ?', [req.user.id, productId]);
    const updatedCart = await getCartBreakdown(req.user.id);
    return res.status(200).json({ success: true, message: 'Item removed from cart.', cart: updatedCart });
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/cart
 * Clears entire cart for the current user
 */
router.delete('/', requireAuth, async (req, res, next) => {
  try {
    await query('DELETE FROM cart_items WHERE user_id = ?', [req.user.id]);
    return res.status(200).json({
      success: true,
      message: 'Cart cleared successfully.',
      cart: { items: [], count: 0, subtotal: 0, totalDiscount: 0, deliveryFee: 0, taxes: 0, total: 0 }
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
