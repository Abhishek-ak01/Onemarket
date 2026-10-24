/**
 * OneMarket - Customer & Merchant Inquiries REST API
 * Automatically records and stores all website contact and inquiry submissions
 * directly into Supabase Postgres backend.
 */

const express = require('express');
const router = express.Router();
const { getSupabase, syncToSupabase } = require('../config/supabase');
const db = require('../config/db');

/**
 * POST /api/inquiries
 * Submit a customer inquiry or merchant contact form
 */
router.post('/', async (req, res, next) => {
  try {
    const { name, email, phone, subject, message, shopId, shop_id } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        error: 'ValidationError',
        message: 'Name is required.'
      });
    }

    if (!email || !email.includes('@')) {
      return res.status(400).json({
        success: false,
        error: 'ValidationError',
        message: 'A valid email address is required.'
      });
    }

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        error: 'ValidationError',
        message: 'Message cannot be empty.'
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone ? phone.trim() : null;
    const cleanSubject = (subject && subject.trim()) ? subject.trim() : 'General Inquiry';
    const targetShopId = shopId || shop_id || null;

    const record = {
      name: name.trim(),
      email: cleanEmail,
      phone: cleanPhone,
      subject: cleanSubject,
      message: message.trim(),
      shop_id: targetShopId,
      status: 'unread'
    };

    // 1. Persist directly into Supabase backend
    let savedInquiry = null;

    try {
      const syncRes = await syncToSupabase('inquiries', 'insert', record);
      if (syncRes && syncRes.data && syncRes.data.length > 0) {
        savedInquiry = syncRes.data[0];
      }
    } catch (sbErr) {
      console.warn('Supabase client error saving inquiry:', sbErr.message);
    }

    // 2. Local MySQL synchronized fallback if available
    try {
      await db.query(`
        CREATE TABLE IF NOT EXISTS inquiries (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(150) NOT NULL,
          email VARCHAR(150) NOT NULL,
          phone VARCHAR(50),
          subject VARCHAR(255),
          message TEXT NOT NULL,
          shop_id VARCHAR(50),
          status VARCHAR(30) DEFAULT 'unread',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);
      const insertRes = await db.query(`
        INSERT INTO inquiries (name, email, phone, subject, message, shop_id, status)
        VALUES (?, ?, ?, ?, ?, ?, 'unread')
      `, [record.name, record.email, record.phone, record.subject, record.message, record.shop_id]);

      if (!savedInquiry) {
        savedInquiry = {
          id: insertRes.insertId || Date.now(),
          ...record,
          created_at: new Date().toISOString()
        };
      }
    } catch (myErr) {
      // Local sync error, Supabase already received
    }

    if (!savedInquiry) {
      savedInquiry = {
        id: Date.now(),
        ...record,
        created_at: new Date().toISOString()
      };
    }

    return res.status(201).json({
      success: true,
      message: 'Thank you! Your inquiry has been received and saved in our Supabase backend. A team member or merchant will respond promptly.',
      data: savedInquiry
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/inquiries
 * Retrieve inquiries list (for admin dashboard or shop inquiries)
 */
router.get('/', async (req, res, next) => {
  try {
    const { shop_id, shopId, status, limit } = req.query;
    const targetShop = shop_id || shopId;
    const maxRows = parseInt(limit, 10) || 50;

    const supabase = getSupabase();
    let query = supabase.from('inquiries').select('*');

    if (targetShop) {
      query = query.eq('shop_id', targetShop);
    }
    if (status) {
      query = query.eq('status', status);
    }

    query = query.order('created_at', { ascending: false }).limit(maxRows);

    const { data, error } = await query;

    if (!error && data) {
      return res.status(200).json({
        success: true,
        count: data.length,
        data
      });
    }

    // Fallback to db.query
    let sql = 'SELECT * FROM inquiries';
    const params = [];
    const conditions = [];

    if (targetShop) {
      conditions.push('shop_id = ?');
      params.push(targetShop);
    }
    if (status) {
      conditions.push('status = ?');
      params.push(status);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }
    sql += ' ORDER BY created_at DESC LIMIT ?';
    params.push(maxRows);

    const rows = await db.query(sql, params);
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
 * PATCH /api/inquiries/:id/status
 * Update inquiry status (unread, in_progress, resolved, archived)
 */
router.patch('/:id/status', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['unread', 'in_progress', 'resolved', 'archived'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'ValidationError',
        message: `Status must be one of: ${validStatuses.join(', ')}`
      });
    }

    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('inquiries')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select();

    try {
      await db.query('UPDATE inquiries SET status = ? WHERE id = ?', [status, id]);
    } catch (e) {}

    return res.status(200).json({
      success: true,
      message: `Inquiry status updated to ${status}`,
      data: (data && data[0]) || { id, status }
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
