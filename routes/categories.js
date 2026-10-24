/**
 * LocalLoop - Categories Routes
 * Provides product categories and descriptions across the marketplace.
 */

const express = require('express');
const router = express.Router();
const db = require('../config/db');

/**
 * GET /api/categories
 * Returns all marketplace product categories.
 */
router.get('/', async (req, res, next) => {
  try {
    const rows = await db.query(
      'SELECT id, name, icon, description, created_at AS createdAt FROM categories ORDER BY name ASC'
    );
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
 * GET /api/categories/:id
 * Returns category details by ID or slug.
 */
router.get('/:id', async (req, res, next) => {
  try {
    const rows = await db.query(
      'SELECT id, name, icon, description, created_at AS createdAt FROM categories WHERE id = ? OR name = ?',
      [req.params.id, req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Category "${req.params.id}" not found.`
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

module.exports = router;
