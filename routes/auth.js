/**
 * LocalLoop - Authentication REST API
 * Handles customer & seller registration, credential validation,
 * password hashing via bcrypt, and JWT session token generation.
 */

const express = require('express');
const bcrypt = require('bcryptjs');
const { query } = require('../config/db');
const { signToken, requireAuth } = require('../middleware/auth');

const router = express.Router();

/**
 * POST /api/auth/register-customer
 * Registers a new customer account
 */
router.post('/register-customer', async (req, res, next) => {
  try {
    const { name, email, phone, password, address, city, pincode } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, error: 'ValidationError', message: 'Full name is required.' });
    }
    if (!email || !email.includes('@')) {
      return res.status(400).json({ success: false, error: 'ValidationError', message: 'Valid email address is required.' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, error: 'ValidationError', message: 'Password must be at least 6 characters long.' });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check duplicate email
    const existing = await query('SELECT id FROM users WHERE email = ?', [cleanEmail]);
    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'DuplicateAccount',
        message: 'An account with this email address already exists. Please log in instead.'
      });
    }

    const userId = `user-cust-${Date.now()}`;
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    await query(`
      INSERT INTO users (id, name, email, phone, password_hash, role, address, city, pincode)
      VALUES (?, ?, ?, ?, ?, 'customer', ?, ?, ?)
    `, [userId, name.trim(), cleanEmail, phone ? phone.trim() : null, passwordHash, address ? address.trim() : null, city ? city.trim() : 'Bengaluru', pincode ? pincode.trim() : '560001']);

    const userPayload = {
      id: userId,
      name: name.trim(),
      email: cleanEmail,
      phone: phone ? phone.trim() : null,
      role: 'customer',
      address: address ? address.trim() : null,
      city: city ? city.trim() : 'Bengaluru',
      pincode: pincode ? pincode.trim() : '560001'
    };

    const token = signToken(userPayload);

    return res.status(201).json({
      success: true,
      message: 'Customer account created successfully!',
      user: userPayload,
      token
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/auth/register-seller
 * Registers a new local merchant and automatically provisions their neighbourhood storefront
 */
router.post('/register-seller', async (req, res, next) => {
  try {
    const { name, shopName, category, area, address, phone, email, password } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, error: 'ValidationError', message: 'Seller name is required.' });
    }
    if (!shopName || !shopName.trim()) {
      return res.status(400).json({ success: false, error: 'ValidationError', message: 'Shop name is required.' });
    }
    if (!email || !email.includes('@')) {
      return res.status(400).json({ success: false, error: 'ValidationError', message: 'Valid email address is required.' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, error: 'ValidationError', message: 'Password must be at least 6 characters long.' });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check duplicate email
    const existing = await query('SELECT id FROM users WHERE email = ?', [cleanEmail]);
    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'DuplicateAccount',
        message: 'An account with this email address already exists. Please log in instead.'
      });
    }

    const shopId = `shop-${Date.now()}`;
    const userId = `user-sell-${Date.now()}`;

    // Provision new Shop entry
    const chosenCategory = category || 'Groceries';
    const chosenArea = area || 'Indiranagar';
    const chosenAddress = address || `${shopName.trim()}, ${chosenArea}, Bengaluru`;
    const defaultImage = 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80';

    await query(`
      INSERT INTO shops (id, name, category, area, address, description, rating, reviews_count, image, phone, timing)
      VALUES (?, ?, ?, ?, ?, ?, 5.0, 1, ?, ?, '9:00 AM - 9:00 PM')
    `, [shopId, shopName.trim(), chosenCategory, chosenArea, chosenAddress, `Independent neighbourhood merchant offering authentic ${chosenCategory.toLowerCase()} in ${chosenArea}.`, defaultImage, phone ? phone.trim() : null]);

    // Hash password and provision seller user
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    await query(`
      INSERT INTO users (id, name, email, phone, password_hash, role, shop_id, address, city)
      VALUES (?, ?, ?, ?, ?, 'seller', ?, ?, 'Bengaluru')
    `, [userId, name.trim(), cleanEmail, phone ? phone.trim() : null, passwordHash, shopId, chosenAddress]);

    const userPayload = {
      id: userId,
      name: name.trim(),
      email: cleanEmail,
      phone: phone ? phone.trim() : null,
      role: 'seller',
      shop_id: shopId,
      shop: {
        id: shopId,
        name: shopName.trim(),
        category: chosenCategory,
        area: chosenArea,
        address: chosenAddress
      }
    };

    const token = signToken(userPayload);

    return res.status(201).json({
      success: true,
      message: 'Seller storefront registered successfully!',
      user: userPayload,
      token
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/auth/login
 * Validates credentials for both customers and sellers
 */
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'MissingCredentials',
        message: 'Both email and password are required.'
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const rows = await query('SELECT * FROM users WHERE email = ?', [cleanEmail]);

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'InvalidCredentials',
        message: 'Invalid email or password. Please try again.'
      });
    }

    const userRecord = rows[0];
    const match = await bcrypt.compare(password, userRecord.password_hash);
    if (!match) {
      return res.status(401).json({
        success: false,
        error: 'InvalidCredentials',
        message: 'Invalid email or password. Please try again.'
      });
    }

    let shopDetails = null;
    if (userRecord.role === 'seller' && userRecord.shop_id) {
      const shops = await query('SELECT * FROM shops WHERE id = ?', [userRecord.shop_id]);
      if (shops.length > 0) {
        shopDetails = shops[0];
      }
    }

    const userPayload = {
      id: userRecord.id,
      name: userRecord.name,
      email: userRecord.email,
      phone: userRecord.phone,
      role: userRecord.role,
      shop_id: userRecord.shop_id,
      address: userRecord.address,
      city: userRecord.city,
      pincode: userRecord.pincode,
      shop: shopDetails
    };

    const token = signToken(userPayload);

    return res.status(200).json({
      success: true,
      message: `Welcome back, ${userRecord.name}!`,
      user: userPayload,
      token
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/auth/me
 * Retrieves current authenticated user profile
 */
router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const rows = await query('SELECT id, name, email, phone, role, shop_id, address, city, pincode, created_at FROM users WHERE id = ?', [req.user.id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'UserNotFound', message: 'User not found.' });
    }

    const user = rows[0];
    let shop = null;
    if (user.role === 'seller' && user.shop_id) {
      const shops = await query('SELECT * FROM shops WHERE id = ?', [user.shop_id]);
      if (shops.length > 0) shop = shops[0];
    }

    return res.status(200).json({
      success: true,
      user: {
        ...user,
        shop
      }
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
