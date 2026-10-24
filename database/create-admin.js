/**
 * OneMarket - Safe First-Admin Bootstrap Utility
 * Creates or resets the initial administrator account.
 * This script runs locally or via administrative deployment only;
 * it cannot be triggered through public signup endpoints or client requests.
 */

const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

async function bootstrapAdmin() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@onemarket.in';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@OneMarket2026!';
  const adminName = 'Platform Administrator';
  const adminId = 'user-admin-01';

  console.log(`[OneMarket Admin Bootstrap] Bootstrapping first admin: ${adminEmail}...`);

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(adminPassword, salt);

  // 1. Check and update backup-mysql-data.json so the offline adapter knows this admin
  const backupPath = path.join(__dirname, 'backup-mysql-data.json');
  if (fs.existsSync(backupPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
      if (Array.isArray(data.users)) {
        const existingIdx = data.users.findIndex(u => u.email === adminEmail || u.role === 'admin');
        const adminObj = {
          id: adminId,
          name: adminName,
          email: adminEmail,
          phone: '+91 98765 00000',
          password_hash: passwordHash,
          role: 'admin',
          status: 'active',
          reward_tokens: 0,
          shop_id: null,
          address: 'Marketplace Headquarters, Station Road',
          city: 'Hubballi',
          pincode: '580020',
          created_at: new Date().toISOString()
        };

        if (existingIdx >= 0) {
          data.users[existingIdx] = { ...data.users[existingIdx], ...adminObj };
          console.log(`[OneMarket Admin Bootstrap] Updated existing admin record in backup-mysql-data.json.`);
        } else {
          data.users.push(adminObj);
          console.log(`[OneMarket Admin Bootstrap] Appended new admin record to backup-mysql-data.json.`);
        }
        fs.writeFileSync(backupPath, JSON.stringify(data, null, 2), 'utf8');
      }
    } catch (e) {
      console.error('[OneMarket Admin Bootstrap] Could not update backup-mysql-data.json:', e.message);
    }
  }

  // 2. Also execute query if database/supabase adapter is connected
  try {
    const { query } = require('../config/db');
    const existing = await query('SELECT id, email, role FROM users WHERE email = ?', [adminEmail]);
    if (existing && existing.length > 0) {
      await query('UPDATE users SET role = ?, password_hash = ?, status = ? WHERE email = ?', [
        'admin',
        passwordHash,
        'active',
        adminEmail
      ]);
      console.log(`[OneMarket Admin Bootstrap] Updated existing database record for ${adminEmail}.`);
    } else {
      await query(
        `INSERT INTO users (id, name, email, phone, password_hash, role, status, reward_tokens, address, city, pincode)
         VALUES (?, ?, ?, ?, ?, 'admin', 'active', 0, ?, 'Hubballi', '580020')`,
        [adminId, adminName, adminEmail, '+91 98765 00000', passwordHash, 'Marketplace Headquarters, Station Road']
      );
      console.log(`[OneMarket Admin Bootstrap] Successfully created admin user ${adminEmail} in database.`);
    }
  } catch (err) {
    console.warn(`[OneMarket Admin Bootstrap] DB query note: ${err.message}`);
  }

  console.log(`====================================================`);
  console.log(`  OneMarket Admin Bootstrap Complete`);
  console.log(`  Email:    ${adminEmail}`);
  console.log(`  Password: ${adminPassword}`);
  console.log(`  Role:     admin`);
  console.log(`====================================================`);
}

if (require.main === module) {
  bootstrapAdmin().then(() => process.exit(0)).catch(err => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = { bootstrapAdmin };
