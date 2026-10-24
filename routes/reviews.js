/**
 * LocalLoop - Verified Customer Reviews REST API
 * Allows customers with completed purchases to submit ratings and feedback.
 */

const express = require('express');
const { query } = require('../config/db');
const { syncToSupabase } = require('../config/supabase');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

/**
 * GET /api/reviews?product_id=...
 * Fetch verified reviews for a specific product
 */
router.get('/', async (req, res, next) => {
  try {
    const { product_id, productId } = req.query;
    const targetProdId = product_id || productId;

    let sql = 'SELECT * FROM reviews';
    const params = [];

    if (targetProdId) {
      sql += ' WHERE product_id = ?';
      params.push(targetProdId);
    }

    sql += ' ORDER BY created_at DESC LIMIT 50';

    const rows = await query(sql, params);

    return res.status(200).json({
      success: true,
      count: rows.length,
      data: rows
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/reviews
 * Submit a verified customer review
 */
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const { productId, product_id, rating, comment } = req.body;
    const targetProdId = productId || product_id;

    if (!targetProdId) {
      return res.status(400).json({ success: false, error: 'ValidationError', message: 'productId is required.' });
    }

    const numRating = parseInt(rating, 10);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      return res.status(400).json({ success: false, error: 'ValidationError', message: 'Rating must be an integer between 1 and 5.' });
    }

    if (!comment || comment.trim().length < 5) {
      return res.status(400).json({ success: false, error: 'ValidationError', message: 'Review comment must be at least 5 characters long.' });
    }

    // 1. Prevent duplicate reviews by the same authenticated user
    const existingReviews = await query(
      'SELECT id FROM reviews WHERE product_id = ? AND user_id = ? LIMIT 1',
      [targetProdId, req.user.id]
    );

    if (existingReviews && existingReviews.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'DuplicateReview',
        message: 'You have already submitted a verified review for this product.'
      });
    }

    // 2. Check if customer has an actual valid/completed purchase of this product
    const orderRows = await query(`
      SELECT oi.id 
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      WHERE oi.product_id = ? 
        AND (o.user_id = ? OR o.customer_phone = ?)
        AND o.status NOT IN ('Cancelled', 'Rejected')
      LIMIT 1
    `, [targetProdId, req.user.id, req.user.phone || '']);

    if (!orderRows || orderRows.length === 0) {
      return res.status(403).json({
        success: false,
        error: 'PurchaseRequired',
        message: 'Only verified customers who have purchased this product can submit a review.'
      });
    }

    await query(`
      INSERT INTO reviews (product_id, user_id, customer_name, rating, comment, is_verified_purchase)
      VALUES (?, ?, ?, ?, ?, 1)
    `, [targetProdId, req.user.id, req.user.name, numRating, comment.trim()]);

    await syncToSupabase('reviews', 'insert', {
      product_id: targetProdId,
      user_id: req.user.id,
      customer_name: req.user.name || 'Verified Customer',
      rating: numRating,
      comment: comment.trim(),
      is_verified_purchase: true
    });

    // Recalculate product rating
    const statsRows = await query(`
      SELECT AVG(rating) as avg_rating, COUNT(*) as count 
      FROM reviews 
      WHERE product_id = ?
    `, [targetProdId]);

    const stats = statsRows && statsRows.length > 0 ? statsRows[0] : null;
    const newAvg = stats && stats.avg_rating ? Math.round(stats.avg_rating * 10) / 10 : numRating;
    const newCount = stats ? stats.count : 1;

    await query('UPDATE products SET rating = ?, reviews_count = ? WHERE id = ?', [newAvg, newCount, targetProdId]);

    return res.status(201).json({
      success: true,
      message: 'Thank you! Your verified purchase review has been published.',
      isVerifiedPurchase: true,
      productRating: newAvg,
      reviewsCount: newCount
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
