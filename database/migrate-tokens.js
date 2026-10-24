/**
 * Safe Database Migration for Reward Tokens and Auditable Loyalty Ledger
 * Adds reward_transactions table, reward_tokens column to users,
 * and token fields to orders table.
 * Preserves all existing tables and data.
 */

const db = require('../config/db');

async function migrateTokens() {
  console.log('--- Starting Safe Reward Tokens Migration ---');

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Add reward_tokens column to users if not present
    const [userCols] = await connection.query('DESCRIBE users');
    const userColNames = userCols.map(c => c.Field);
    if (!userColNames.includes('reward_tokens')) {
      await connection.query('ALTER TABLE users ADD COLUMN reward_tokens INT NOT NULL DEFAULT 0 AFTER role');
      console.log('✓ Added reward_tokens to users table.');
    }

    // 2. Add token fields to orders if not present
    const [orderCols] = await connection.query('DESCRIBE orders');
    const orderColNames = orderCols.map(c => c.Field);
    if (!orderColNames.includes('tokens_earned')) {
      await connection.query('ALTER TABLE orders ADD COLUMN tokens_earned INT NOT NULL DEFAULT 0 AFTER total');
      console.log('✓ Added tokens_earned to orders table.');
    }
    if (!orderColNames.includes('tokens_redeemed')) {
      await connection.query('ALTER TABLE orders ADD COLUMN tokens_redeemed INT NOT NULL DEFAULT 0 AFTER tokens_earned');
      console.log('✓ Added tokens_redeemed to orders table.');
    }
    if (!orderColNames.includes('token_discount')) {
      await connection.query('ALTER TABLE orders ADD COLUMN token_discount DECIMAL(10,2) NOT NULL DEFAULT 0.00 AFTER tokens_redeemed');
      console.log('✓ Added token_discount to orders table.');
    }

    // 3. Create reward_transactions ledger table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS reward_transactions (
        id INT UNSIGNED NOT NULL AUTO_INCREMENT,
        user_id VARCHAR(50) NOT NULL,
        order_id VARCHAR(50) DEFAULT NULL,
        amount INT NOT NULL,
        type ENUM('EARNED', 'REDEEMED', 'CANCELLED_REVERSAL', 'REFUND') NOT NULL,
        description VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        INDEX idx_reward_user (user_id),
        INDEX idx_reward_order (order_id),
        CONSTRAINT fk_reward_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('✓ Verified table: reward_transactions');

    // 4. Initialize demo customer (Aditi Rao: user-cust-1) with 45 baseline reward tokens
    const [txCount] = await connection.query('SELECT COUNT(*) as count FROM reward_transactions WHERE user_id = "user-cust-1"');
    if (txCount[0].count === 0) {
      await connection.query(`
        INSERT INTO reward_transactions (user_id, order_id, amount, type, description, created_at)
        VALUES 
          ('user-cust-1', 'LL-2026-1042', 8, 'EARNED', 'Earned from completed order #LL-2026-1042 (₹860 spend)', '2026-10-21 16:10:00'),
          ('user-cust-1', NULL, 37, 'EARNED', 'OneMarket Local Loyalty Welcome Bonus', '2026-10-20 10:00:00')
      `);
      await connection.query('UPDATE users SET reward_tokens = 45 WHERE id = "user-cust-1"');
      console.log('✓ Seeded initial reward tokens for demo customer (user-cust-1: 45 tokens = ₹45).');
    }

    await connection.commit();
    console.log('--- Reward Tokens Migration Completed Successfully ---');
    process.exit(0);
  } catch (err) {
    await connection.rollback();
    console.error('Migration failed:', err);
    process.exit(1);
  } finally {
    connection.release();
  }
}

migrateTokens();
