/**
 * LocalLoop - Shops Routes
 * CRUD and search operations for verified neighbourhood merchants.
 */

const express = require('express');
const router = express.Router();
const db = require('../config/db');

/**
 * GET /api/shops
 * List shops with optional query filters: area, category, search (or q).
 */
router.get('/', async (req, res, next) => {
  try {
    const { area, category, search, q } = req.query;
    const searchTerm = search || q;

    let sql = `
      SELECT 
        id, 
        name, 
        category, 
        area, 
        address, 
        description, 
        CAST(rating AS FLOAT) AS rating, 
        reviews_count AS reviewsCount, 
        image, 
        phone, 
        timing, 
        created_at AS createdAt,
        updated_at AS updatedAt 
      FROM shops 
      WHERE 1=1
    `;
    const params = [];

    if (area && area !== 'all') {
      sql += ' AND LOWER(area) = LOWER(?)';
      params.push(area.trim());
    }

    if (category && category !== 'All') {
      sql += ' AND LOWER(category) = LOWER(?)';
      params.push(category.trim());
    }

    if (searchTerm) {
      sql += ' AND (LOWER(name) LIKE ? OR LOWER(description) LIKE ? OR LOWER(area) LIKE ?)';
      const term = `%${searchTerm.toLowerCase().trim()}%`;
      params.push(term, term, term);
    }

    sql += ' ORDER BY name ASC';

    const rows = await db.query(sql, params);
    res.json({
      success: true,
      count: rows.length,
      data: rows
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/shops/:id
 * Retrieve single shop profile by ID.
 */
router.get('/:id', async (req, res, next) => {
  try {
    const rows = await db.query(
      `SELECT 
        id, 
        name, 
        category, 
        area, 
        address, 
        description, 
        CAST(rating AS FLOAT) AS rating, 
        reviews_count AS reviewsCount, 
        image, 
        phone, 
        timing, 
        created_at AS createdAt,
        updated_at AS updatedAt 
      FROM shops 
      WHERE id = ?`,
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Shop with ID "${req.params.id}" not found.`
      });
    }

    res.json({
      success: true,
      data: rows[0]
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/shops
 * Create a new neighbourhood merchant shop profile.
 */
router.post('/', async (req, res, next) => {
  try {
    const { name, category, area, address, description, phone, timing, image } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Shop name is required.' });
    }
    if (!category || !category.trim()) {
      return res.status(400).json({ success: false, message: 'Shop category is required.' });
    }
    if (!area || !area.trim()) {
      return res.status(400).json({ success: false, message: 'Neighbourhood area is required.' });
    }
    if (!address || !address.trim()) {
      return res.status(400).json({ success: false, message: 'Store address is required.' });
    }

    const id = req.body.id || `shop-${Date.now().toString().slice(-6)}`;
    const shopImage = image?.trim() || 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=600&q=80';

    await db.query(
      `INSERT INTO shops (id, name, category, area, address, description, rating, reviews_count, image, phone, timing)
       VALUES (?, ?, ?, ?, ?, ?, 4.5, 1, ?, ?, ?)`,
      [
        id,
        name.trim(),
        category.trim(),
        area.trim(),
        address.trim(),
        description?.trim() || '',
        shopImage,
        phone?.trim() || '',
        timing?.trim() || '9:00 AM - 9:00 PM'
      ]
    );

    const [created] = await db.query('SELECT * FROM shops WHERE id = ?', [id]);
    res.status(201).json({
      success: true,
      message: 'Shop created successfully.',
      data: created
    });
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/shops/:id
 * Update shop information.
 */
router.put('/:id', async (req, res, next) => {
  try {
    const shopId = req.params.id;
    const [existing] = await db.query('SELECT id FROM shops WHERE id = ?', [shopId]);

    if (!existing) {
      return res.status(404).json({ success: false, message: `Shop with ID "${shopId}" not found.` });
    }

    const { name, category, area, address, description, phone, timing, image } = req.body;
    const updates = [];
    const params = [];

    if (name !== undefined) { updates.push('name = ?'); params.push(name.trim()); }
    if (category !== undefined) { updates.push('category = ?'); params.push(category.trim()); }
    if (area !== undefined) { updates.push('area = ?'); params.push(area.trim()); }
    if (address !== undefined) { updates.push('address = ?'); params.push(address.trim()); }
    if (description !== undefined) { updates.push('description = ?'); params.push(description.trim()); }
    if (phone !== undefined) { updates.push('phone = ?'); params.push(phone.trim()); }
    if (timing !== undefined) { updates.push('timing = ?'); params.push(timing.trim()); }
    if (image !== undefined) { updates.push('image = ?'); params.push(image.trim()); }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields provided for update.' });
    }

    params.push(shopId);
    await db.query(`UPDATE shops SET ${updates.join(', ')} WHERE id = ?`, params);

    const [updated] = await db.query('SELECT * FROM shops WHERE id = ?', [shopId]);
    res.json({
      success: true,
      message: 'Shop updated successfully.',
      data: updated
    });
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/shops/:id
 * Delete a shop. Foreign keys in products/orders handle cascade safely if configured.
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const shopId = req.params.id;
    const [existing] = await db.query('SELECT id FROM shops WHERE id = ?', [shopId]);

    if (!existing) {
      return res.status(404).json({ success: false, message: `Shop with ID "${shopId}" not found.` });
    }

    await db.query('DELETE FROM shops WHERE id = ?', [shopId]);
    res.json({
      success: true,
      message: `Shop "${shopId}" and related listings deleted successfully.`
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
