/**
 * LocalLoop - Products Routes
 * Search, multi-criteria filtering, inventory tracking, and merchant product CRUD.
 */

const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { optionalAuth } = require('../middleware/auth');

/**
 * Format raw database row to match frontend object structure
 */
function formatProduct(row) {
  if (!row) return null;
  let attrs = row.attributes;
  if (typeof attrs === 'string') {
    try { attrs = JSON.parse(attrs); } catch (e) { attrs = {}; }
  }
  let tags = row.tags;
  if (typeof tags === 'string') {
    try { tags = JSON.parse(tags); } catch (e) { tags = []; }
  }

  const price = Number(row.price);
  const origPrice = row.originalPrice !== undefined ? Number(row.originalPrice) : (row.original_price ? Number(row.original_price) : Math.round(price * 1.25));
  const discountPercent = row.discountPercent !== undefined ? parseInt(row.discountPercent, 10) : (row.discount_percent !== undefined ? parseInt(row.discount_percent, 10) : (origPrice > price ? Math.round(((origPrice - price) / origPrice) * 100) : 0));

  return {
    id: row.id,
    name: row.name,
    category: row.category,
    shopId: row.shopId || row.shop_id,
    shopName: row.shopName || row.shop_name || '',
    shopArea: row.shopArea || row.shop_area || '',
    price,
    originalPrice: origPrice,
    discountPercent,
    stock: parseInt(row.stock, 10),
    rating: row.rating ? Number(row.rating) : 4.5,
    reviewsCount: parseInt(row.reviewsCount || row.reviews_count || 1, 10),
    description: row.description || '',
    attributes: attrs || {},
    tags: tags || [],
    image: row.image || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
    isFeatured: Boolean(row.isFeatured !== undefined ? row.isFeatured : row.is_featured),
    isActive: Boolean(row.isActive !== undefined ? row.isActive : (row.is_active !== undefined ? row.is_active : true)),
    createdAt: row.createdAt || row.created_at,
    updatedAt: row.updatedAt || row.updated_at
  };
}

/**
 * GET /api/products
 * List products with multi-criteria filtering:
 * - ?shop_id=... (or shopId)
 * - ?category=...
 * - ?search=... (or q)
 * - ?min_price=... & ?max_price=...
 * - ?in_stock=true
 * - ?sort=price_asc | price_desc | rating | name | discount
 * - ?featured=true
 */
router.get('/', async (req, res, next) => {
  try {
    const { shop_id, shopId, category, search, q, min_price, max_price, in_stock, sort, featured } = req.query;
    const filterShopId = shop_id || shopId;
    const searchTerm = search || q;

    let sql = `
      SELECT 
        p.id, 
        p.name, 
        p.category, 
        p.shop_id AS shopId, 
        s.name AS shopName, 
        s.area AS shopArea,
        CAST(p.price AS DOUBLE) AS price, 
        CAST(p.original_price AS DOUBLE) AS originalPrice,
        p.discount_percent AS discountPercent,
        p.stock, 
        CAST(p.rating AS FLOAT) AS rating, 
        p.reviews_count AS reviewsCount, 
        p.description, 
        p.attributes, 
        p.tags, 
        p.image, 
        p.is_featured AS isFeatured, 
        p.is_active AS isActive,
        p.created_at AS createdAt, 
        p.updated_at AS updatedAt 
      FROM products p 
      LEFT JOIN shops s ON p.shop_id = s.id 
      WHERE 1=1
    `;
    const params = [];

    if (filterShopId && filterShopId !== 'all') {
      sql += ' AND p.shop_id = ?';
      params.push(filterShopId.trim());
    }

    if (category && category !== 'All') {
      sql += ' AND LOWER(p.category) = LOWER(?)';
      params.push(category.trim());
    }

    if (searchTerm) {
      sql += ' AND (LOWER(p.name) LIKE ? OR LOWER(p.description) LIKE ? OR LOWER(p.category) LIKE ? OR LOWER(s.name) LIKE ?)';
      const term = `%${searchTerm.toLowerCase().trim()}%`;
      params.push(term, term, term, term);
    }

    if (min_price !== undefined && min_price !== '') {
      const min = Number(min_price);
      if (!isNaN(min)) {
        sql += ' AND p.price >= ?';
        params.push(min);
      }
    }

    if (max_price !== undefined && max_price !== '') {
      const max = Number(max_price);
      if (!isNaN(max)) {
        sql += ' AND p.price <= ?';
        params.push(max);
      }
    }

    if (in_stock === 'true' || in_stock === '1') {
      sql += ' AND p.stock > 0';
    }

    if (featured === 'true' || featured === '1') {
      sql += ' AND p.is_featured = 1';
    }

    // Sorting
    switch (sort) {
      case 'price_asc':
        sql += ' ORDER BY p.price ASC, p.id ASC';
        break;
      case 'price_desc':
        sql += ' ORDER BY p.price DESC, p.id ASC';
        break;
      case 'rating':
        sql += ' ORDER BY p.rating DESC, p.reviews_count DESC';
        break;
      case 'name':
        sql += ' ORDER BY p.name ASC';
        break;
      case 'discount':
        sql += ' ORDER BY p.discount_percent DESC, p.price ASC';
        break;
      default:
        sql += ' ORDER BY p.is_featured DESC, p.created_at DESC, p.id DESC';
        break;
    }

    const rows = await db.query(sql, params);
    const formatted = rows.map(formatProduct);

    res.json({
      success: true,
      count: formatted.length,
      data: formatted
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/products/:id
 * Retrieve a single product by ID with full shop metadata.
 */
router.get('/:id', async (req, res, next) => {
  try {
    const rows = await db.query(
      `SELECT 
        p.id, 
        p.name, 
        p.category, 
        p.shop_id AS shopId, 
        s.name AS shopName, 
        s.area AS shopArea,
        CAST(p.price AS DOUBLE) AS price, 
        CAST(p.original_price AS DOUBLE) AS originalPrice,
        p.discount_percent AS discountPercent,
        p.stock, 
        CAST(p.rating AS FLOAT) AS rating, 
        p.reviews_count AS reviewsCount, 
        p.description, 
        p.attributes, 
        p.tags, 
        p.image, 
        p.is_featured AS isFeatured, 
        p.is_active AS isActive,
        p.created_at AS createdAt, 
        p.updated_at AS updatedAt 
      FROM products p 
      LEFT JOIN shops s ON p.shop_id = s.id 
      WHERE p.id = ?`,
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Product with ID "${req.params.id}" not found.`
      });
    }

    res.json({
      success: true,
      data: formatProduct(rows[0])
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/products
 * Merchant adds a new product listing. Validates fields and verifies shop existence.
 */
router.post('/', optionalAuth, async (req, res, next) => {
  try {
    const { name, category, shopId, shop_id, price, originalPrice, original_price, discountPercent, stock, description, attributes, tags, image, isFeatured, rating } = req.body;
    let finalShopId = shopId || shop_id;

    // Enforce role authorization: If authenticated, must be seller and assigned to shop
    if (req.user) {
      if (req.user.role !== 'seller') {
        return res.status(403).json({ success: false, error: 'Forbidden', message: 'Only registered sellers can list products.' });
      }
      if (req.user.shop_id) {
        finalShopId = req.user.shop_id;
      }
    }

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Product name is required.' });
    }
    if (!category || !category.trim()) {
      return res.status(400).json({ success: false, message: 'Product category is required.' });
    }
    if (!finalShopId) {
      return res.status(400).json({ success: false, message: 'shopId is required.' });
    }

    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice <= 0) {
      return res.status(400).json({ success: false, message: 'Valid positive price in INR is required.' });
    }

    const numStock = parseInt(stock, 10);
    if (isNaN(numStock) || numStock < 0) {
      return res.status(400).json({ success: false, message: 'Stock quantity must be a non-negative integer.' });
    }

    // Verify referenced shop exists
    const [shop] = await db.query('SELECT id, name FROM shops WHERE id = ?', [finalShopId]);
    if (!shop) {
      return res.status(404).json({
        success: false,
        message: `Referenced shop "${finalShopId}" does not exist in marketplace.`
      });
    }

    const id = req.body.id || `prod-${Date.now().toString().slice(-6)}`;
    const productRating = rating ? Number(rating) : 4.8;
    const productImg = image?.trim() || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80';
    const numOrigPrice = Number(originalPrice || original_price) || Math.round(numPrice * 1.25);
    const numDiscount = discountPercent !== undefined ? parseInt(discountPercent, 10) : Math.round(((numOrigPrice - numPrice) / numOrigPrice) * 100);
    const attrsJson = JSON.stringify(attributes || {});
    const tagsJson = JSON.stringify(tags || [category.toLowerCase()]);
    const featuredFlag = Boolean(isFeatured);

    await db.query(
      `INSERT INTO products (id, name, category, shop_id, price, original_price, discount_percent, stock, rating, reviews_count, description, attributes, tags, image, is_featured, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?, ?, 1)`,
      [
        id,
        name.trim(),
        category.trim(),
        finalShopId,
        numPrice,
        numOrigPrice,
        numDiscount,
        numStock,
        productRating,
        description?.trim() || '',
        attrsJson,
        tagsJson,
        productImg,
        featuredFlag ? 1 : 0
      ]
    );

    const [created] = await db.query(
      `SELECT p.*, s.name AS shopName, s.area AS shopArea FROM products p LEFT JOIN shops s ON p.shop_id = s.id WHERE p.id = ?`,
      [id]
    );

    res.status(201).json({
      success: true,
      message: 'Product listed successfully.',
      data: formatProduct(created)
    });
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/products/:id
 * Merchant updates product details and stock.
 */
router.put('/:id', optionalAuth, async (req, res, next) => {
  try {
    const prodId = req.params.id;
    const [existing] = await db.query('SELECT * FROM products WHERE id = ?', [prodId]);

    if (!existing) {
      return res.status(404).json({ success: false, message: `Product with ID "${prodId}" not found.` });
    }

    // Role check: Seller can only edit their own shop's products
    if (req.user && req.user.role === 'seller' && req.user.shop_id && existing.shop_id !== req.user.shop_id) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'You are not authorized to modify products belonging to another seller.'
      });
    }

    const { name, category, shopId, shop_id, price, originalPrice, original_price, discountPercent, stock, description, attributes, tags, image, isFeatured, isActive, rating } = req.body;
    const updates = [];
    const params = [];

    if (name !== undefined) {
      if (!name.trim()) return res.status(400).json({ success: false, message: 'Name cannot be empty.' });
      updates.push('name = ?');
      params.push(name.trim());
    }

    if (category !== undefined) {
      updates.push('category = ?');
      params.push(category.trim());
    }

    const newShopId = shopId || shop_id;
    if (newShopId !== undefined) {
      const [shop] = await db.query('SELECT id FROM shops WHERE id = ?', [newShopId]);
      if (!shop) {
        return res.status(404).json({ success: false, message: `Shop "${newShopId}" does not exist.` });
      }
      updates.push('shop_id = ?');
      params.push(newShopId);
    }

    if (price !== undefined) {
      const numPrice = Number(price);
      if (isNaN(numPrice) || numPrice <= 0) {
        return res.status(400).json({ success: false, message: 'Price must be a positive number.' });
      }
      updates.push('price = ?');
      params.push(numPrice);
    }

    if (originalPrice !== undefined || original_price !== undefined) {
      const numOrig = Number(originalPrice || original_price);
      updates.push('original_price = ?');
      params.push(numOrig);
    }

    if (discountPercent !== undefined) {
      updates.push('discount_percent = ?');
      params.push(parseInt(discountPercent, 10));
    }

    if (stock !== undefined) {
      const numStock = parseInt(stock, 10);
      if (isNaN(numStock) || numStock < 0) {
        return res.status(400).json({ success: false, message: 'Stock must be a non-negative integer.' });
      }
      updates.push('stock = ?');
      params.push(numStock);
    }

    if (description !== undefined) {
      updates.push('description = ?');
      params.push(description.trim());
    }

    if (attributes !== undefined) {
      updates.push('attributes = ?');
      params.push(JSON.stringify(attributes));
    }

    if (tags !== undefined) {
      updates.push('tags = ?');
      params.push(JSON.stringify(tags));
    }

    if (image !== undefined) {
      updates.push('image = ?');
      params.push(image.trim());
    }

    if (isFeatured !== undefined) {
      updates.push('is_featured = ?');
      params.push(isFeatured ? 1 : 0);
    }

    if (isActive !== undefined) {
      updates.push('is_active = ?');
      params.push(isActive ? 1 : 0);
    }

    if (rating !== undefined) {
      updates.push('rating = ?');
      params.push(Number(rating));
    }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields provided to update.' });
    }

    params.push(prodId);
    await db.query(`UPDATE products SET ${updates.join(', ')} WHERE id = ?`, params);

    const [updated] = await db.query(
      `SELECT p.*, s.name AS shopName, s.area AS shopArea FROM products p LEFT JOIN shops s ON p.shop_id = s.id WHERE p.id = ?`,
      [prodId]
    );

    res.json({
      success: true,
      message: 'Product updated successfully.',
      data: formatProduct(updated)
    });
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/products/:id
 * Remove product from catalog.
 */
router.delete('/:id', optionalAuth, async (req, res, next) => {
  try {
    const prodId = req.params.id;
    const [existing] = await db.query('SELECT id, shop_id FROM products WHERE id = ?', [prodId]);

    if (!existing) {
      return res.status(404).json({ success: false, message: `Product with ID "${prodId}" not found.` });
    }

    // Role check: Seller can only delete their own shop's products
    if (req.user && req.user.role === 'seller' && req.user.shop_id && existing.shop_id !== req.user.shop_id) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'You are not authorized to delete products belonging to another seller.'
      });
    }

    await db.query('DELETE FROM products WHERE id = ?', [prodId]);
    res.json({
      success: true,
      message: `Product "${prodId}" removed from catalog.`
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
