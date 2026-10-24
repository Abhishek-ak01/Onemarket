/**
 * LocalLoop - Locations Routes
 * Provides neighbourhood locations and pincodes in Bengaluru.
 */

const express = require('express');
const router = express.Router();
const db = require('../config/db');

/**
 * GET /api/locations
 * Returns all active neighbourhood shopping locations.
 */
router.get('/', async (req, res, next) => {
  try {
    const rows = await db.query(
      'SELECT id, name, pincode, created_at AS createdAt FROM locations ORDER BY name ASC'
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
 * GET /api/locations/:id
 * Returns a specific location by ID.
 */
router.get('/:id', async (req, res, next) => {
  try {
    const rows = await db.query(
      'SELECT id, name, pincode, created_at AS createdAt FROM locations WHERE id = ?',
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Location with ID "${req.params.id}" not found.`
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
