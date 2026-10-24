/**
 * OneMarket - Protected Administrative REST API
 * Provides platform-wide management, moderation, analytics, and audit logging.
 * Enforces server-side authentication and admin role authorization (requireAdmin).
 */

const express = require('express');
const { query } = require('../config/db');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Apply requireAdmin to all routes in this router
router.use(requireAdmin);

/**
 * Log an administrative action to the audit trail
 */
async function recordAuditLog(adminId, action, targetType, targetId, details) {
  try {
    await query(
      `INSERT INTO admin_audit_logs (admin_id, action, target_type, target_id, details)
       VALUES (?, ?, ?, ?, ?)`,
      [adminId, action, targetType, targetId, typeof details === 'object' ? JSON.stringify(details) : details]
    );
  } catch (err) {
    console.error('Failed to write admin audit log:', err.message);
  }
}

/**
 * GET /api/admin/stats
 * Platform overview KPIs and sales metrics calculated from real database records
 */
router.get('/stats', async (req, res, next) => {
  try {
    const users = await query('SELECT id, role, status FROM users');
    const shops = await query('SELECT id FROM shops');
    const products = await query('SELECT id, price, stock, status FROM products');
    const orders = await query('SELECT id, total, status, payment_status, created_at FROM orders');
    const auditLogs = await query('SELECT * FROM admin_audit_logs ORDER BY id DESC LIMIT 5');

    const totalCustomers = users.filter(u => u.role === 'customer').length;
    const totalSellers = users.filter(u => u.role === 'seller').length;
    const totalShops = shops.length;
    const activeProducts = products.filter(p => p.status !== 'inactive').length;
    const totalOrders = orders.length;

    // Calculate real sales totals (excluding cancelled orders)
    const paidOrders = orders.filter(o => o.status !== 'Cancelled');
    const totalSales = paidOrders.reduce((acc, o) => acc + (parseFloat(o.total) || 0), 0);

    // Order status breakdown
    const ordersByStatus = {
      pending: orders.filter(o => o.status === 'Pending').length,
      confirmed: orders.filter(o => o.status === 'Confirmed' || o.status === 'Packed').length,
      outForDelivery: orders.filter(o => o.status === 'Out for Delivery').length,
      delivered: orders.filter(o => o.status === 'Delivered').length,
      cancelled: orders.filter(o => o.status === 'Cancelled').length
    };

    res.json({
      success: true,
      stats: {
        totalCustomers,
        totalSellers,
        totalShops,
        activeProducts,
        totalProducts: products.length,
        totalOrders,
        totalSales: Math.round(totalSales * 100) / 100,
        ordersByStatus,
        recentAuditLogs: auditLogs
      }
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/admin/users
 * Returns list of registered customers and sellers with shop details and account status
 */
router.get('/users', async (req, res, next) => {
  try {
    const { role, search } = req.query;
    let users = await query(`
      SELECT u.id, u.name, u.email, u.phone, u.role, u.status, u.reward_tokens, 
             u.shop_id, u.address, u.city, u.pincode, u.created_at,
             s.name as shop_name, s.category as shop_category, s.area as shop_area
      FROM users u
      LEFT JOIN shops s ON u.shop_id = s.id
      ORDER BY u.created_at DESC
    `);

    if (role && role !== 'all') {
      users = users.filter(u => u.role === role);
    }

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      users = users.filter(u => 
        (u.name && u.name.toLowerCase().includes(q)) ||
        (u.email && u.email.toLowerCase().includes(q)) ||
        (u.shop_name && u.shop_name.toLowerCase().includes(q)) ||
        (u.phone && u.phone.includes(q))
      );
    }

    res.json({
      success: true,
      users: users.map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        phone: u.phone,
        role: u.role,
        status: u.status || 'active',
        reward_tokens: u.reward_tokens || 0,
        shop_id: u.shop_id,
        shop_name: u.shop_name,
        shop_category: u.shop_category,
        shop_area: u.shop_area,
        address: u.address,
        city: u.city,
        pincode: u.pincode,
        created_at: u.created_at
      }))
    });
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /api/admin/users/:id/status
 * Activate, suspend, or reactivate a user account
 */
router.patch('/users/:id/status', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;

    if (!['active', 'suspended'].includes(status)) {
      return res.status(400).json({ success: false, error: 'InvalidStatus', message: 'Status must be active or suspended.' });
    }

    // Safety check: Cannot suspend yourself
    if (id === req.user.id) {
      return res.status(400).json({ success: false, error: 'SelfModification', message: 'You cannot suspend your own admin account.' });
    }

    const [user] = await query('SELECT id, name, email, role, status FROM users WHERE id = ?', [id]);
    if (!user) {
      return res.status(404).json({ success: false, error: 'UserNotFound', message: 'User not found.' });
    }

    await query('UPDATE users SET status = ? WHERE id = ?', [status, id]);

    // Record audit trail
    await recordAuditLog(
      req.user.id,
      status === 'suspended' ? 'SUSPEND_USER' : 'ACTIVATE_USER',
      'user',
      id,
      {
        userName: user.name,
        userEmail: user.email,
        userRole: user.role,
        previousStatus: user.status || 'active',
        newStatus: status,
        reason: reason || 'Administrative action'
      }
    );

    res.json({
      success: true,
      message: `User account for ${user.name} has been ${status === 'suspended' ? 'suspended' : 'activated'}.`,
      user: { id, status }
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/admin/products
 * View all marketplace products with seller shop info and moderation status
 */
router.get('/products', async (req, res, next) => {
  try {
    const { search, category, status } = req.query;

    let products = await query(`
      SELECT p.*, s.name as shop_name, s.area as shop_area, s.category as shop_category
      FROM products p
      LEFT JOIN shops s ON p.shop_id = s.id
      ORDER BY p.id DESC
    `);

    if (category && category !== 'all') {
      products = products.filter(p => p.category === category);
    }

    if (status && status !== 'all') {
      if (status === 'active') {
        products = products.filter(p => p.status !== 'inactive');
      } else if (status === 'inactive') {
        products = products.filter(p => p.status === 'inactive');
      }
    }

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      products = products.filter(p =>
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q)) ||
        (p.shop_name && p.shop_name.toLowerCase().includes(q))
      );
    }

    res.json({
      success: true,
      products
    });
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /api/admin/products/:id/status
 * Moderates/deactivates or reactivates a product listing with moderation reason
 */
router.patch('/products/:id/status', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;

    if (!['active', 'inactive'].includes(status)) {
      return res.status(400).json({ success: false, error: 'InvalidStatus', message: 'Status must be active or inactive.' });
    }

    const [product] = await query('SELECT id, name, shop_id, status FROM products WHERE id = ?', [id]);
    if (!product) {
      return res.status(404).json({ success: false, error: 'ProductNotFound', message: 'Product not found.' });
    }

    await query('UPDATE products SET status = ? WHERE id = ?', [status, id]);

    // Record audit trail
    await recordAuditLog(
      req.user.id,
      status === 'inactive' ? 'MODERATE_DEACTIVATE_PRODUCT' : 'REACTIVATE_PRODUCT',
      'product',
      id,
      {
        productName: product.name,
        shopId: product.shop_id,
        previousStatus: product.status || 'active',
        newStatus: status,
        reason: reason || 'Listing deactivated by marketplace administrator'
      }
    );

    res.json({
      success: true,
      message: `Product "${product.name}" listing has been ${status === 'inactive' ? 'deactivated' : 'activated'}.`,
      product: { id, status }
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/admin/orders
 * Returns all marketplace orders with customer and shop details
 */
router.get('/orders', async (req, res, next) => {
  try {
    const { status, search } = req.query;

    let orders = await query(`
      SELECT o.*, u.name as customer_account_name, u.email as customer_email, u.phone as customer_account_phone
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
    `);

    if (status && status !== 'all') {
      orders = orders.filter(o => o.status === status);
    }

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      orders = orders.filter(o =>
        (o.id && o.id.toLowerCase().includes(q)) ||
        (o.customer_name && o.customer_name.toLowerCase().includes(q)) ||
        (o.customer_address && o.customer_address.toLowerCase().includes(q))
      );
    }

    res.json({
      success: true,
      orders
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/admin/audit-logs
 * Retrieves the administrative audit log trail
 */
router.get('/audit-logs', async (req, res, next) => {
  try {
    const logs = await query(`
      SELECT l.*, u.name as admin_name, u.email as admin_email
      FROM admin_audit_logs l
      LEFT JOIN users u ON l.admin_id = u.id
      ORDER BY l.created_at DESC
      LIMIT 100
    `);

    res.json({
      success: true,
      logs
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
