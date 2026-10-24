/**
 * LocalLoop - Health & Connectivity Routes
 * Provides system status and safe database connectivity verification.
 */

const express = require('express');
const router = express.Router();
const db = require('../config/db');

/**
 * GET /api/health
 * Returns service uptime and server status.
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    service: 'OneMarket Express REST API',
    version: '1.0.0',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

/**
 * GET /api/db-health
 * Safely checks MySQL connection and database responsiveness without leaking credentials.
 */
router.get('/db-health', async (req, res) => {
  const result = await db.testConnection();

  if (result.success) {
    return res.status(200).json({
      success: true,
      status: 'healthy',
      database: {
        connected: true,
        name: result.database,
        host: result.host,
        port: result.port,
        version: result.version
      },
      message: result.message,
      timestamp: new Date().toISOString()
    });
  }

  return res.status(503).json({
    success: false,
    status: 'degraded',
    database: {
      connected: false
    },
    message: result.message,
    code: result.code,
    timestamp: new Date().toISOString()
  });
});

/**
 * POST /api/demo-reset
 * Safely resets transient demo orders, order items, and shopping cart records
 * and restores product stock back to seed baseline without dropping tables or wiping accounts.
 */
router.post('/demo-reset', async (req, res, next) => {
  const { confirm } = req.body;
  if (confirm !== 'RESET_ONEMARKET_DEMO') {
    return res.status(400).json({
      success: false,
      error: 'ConfirmationRequired',
      message: 'Explicit confirmation required. Send { confirm: "RESET_ONEMARKET_DEMO" }.'
    });
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // 1. Clear shopping cart records
    await conn.query('DELETE FROM cart_items');

    // 2. Remove test orders created during demo sessions (preserve seeded baseline orders)
    const baselineOrderIds = ['LL-2026-1042', 'LL-2026-1043', 'LL-2026-1044'];
    const placeholders = baselineOrderIds.map(() => '?').join(', ');

    await conn.query(`DELETE FROM order_status_history WHERE order_id NOT IN (${placeholders})`, baselineOrderIds);
    await conn.query(`DELETE FROM order_items WHERE order_id NOT IN (${placeholders})`, baselineOrderIds);
    await conn.query(`DELETE FROM orders WHERE id NOT IN (${placeholders})`, baselineOrderIds);

    // 3. Reset baseline stock quantities
    const stockMap = {
      'prod-101': 18, 'prod-102': 12, 'prod-103': 22, 'prod-104': 3, 'prod-105': 0, 'prod-106': 15, 'prod-107': 20,
      'prod-201': 14, 'prod-202': 8, 'prod-203': 25, 'prod-204': 2, 'prod-205': 9, 'prod-206': 16, 'prod-207': 10,
      'prod-301': 7, 'prod-302': 16, 'prod-303': 2, 'prod-304': 11, 'prod-305': 8, 'prod-306': 14, 'prod-307': 5,
      'prod-401': 20, 'prod-402': 15, 'prod-403': 5, 'prod-404': 3, 'prod-405': 18, 'prod-406': 12, 'prod-407': 9,
      'prod-501': 14, 'prod-502': 19, 'prod-503': 6, 'prod-504': 0, 'prod-505': 11, 'prod-506': 7, 'prod-507': 15,
      'prod-601': 24, 'prod-602': 9, 'prod-603': 2, 'prod-604': 17, 'prod-605': 12, 'prod-606': 8, 'prod-607': 14,
      'prod-701': 15, 'prod-702': 4, 'prod-703': 11, 'prod-704': 6, 'prod-705': 8, 'prod-706': 20, 'prod-707': 12
    };

    for (const [prodId, stock] of Object.entries(stockMap)) {
      await conn.query('UPDATE products SET stock = ? WHERE id = ?', [stock, prodId]);
    }

    await conn.commit();

    return res.status(200).json({
      success: true,
      message: 'OneMarket demo environment restored safely. Test orders and shopping carts cleared, baseline inventory restored.',
      baselineOrdersRemaining: baselineOrderIds.length,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    await conn.rollback();
    next(err);
  } finally {
    conn.release();
  }
});

module.exports = router;
