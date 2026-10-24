/**
 * LocalLoop - MySQL Database Configuration & Connection Pool
 * Uses mysql2/promise for async/await execution, parameterized queries, and connection pooling.
 * Reads environment variables safely via dotenv without leaking credentials.
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'localloop',
  waitForConnections: true,
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT, 10) || 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

/**
 * Execute parameterized query safely using the connection pool
 * @param {string} sql - SQL query with '?' placeholders
 * @param {Array} params - Bound query parameters
 * @returns {Promise<Array>} Query results
 */
async function query(sql, params = []) {
  const [results] = await pool.execute(sql, params);
  return results;
}

/**
 * Get a dedicated connection from pool for transaction handling
 * @returns {Promise<mysql.PoolConnection>} Dedicated connection
 */
async function getConnection() {
  return await pool.getConnection();
}

/**
 * Safe health-check helper to verify MySQL server connectivity
 * @returns {Promise<{success: boolean, message: string, details?: object}>}
 */
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT 1 as ping, VERSION() as version');
    connection.release();
    return {
      success: true,
      message: 'MySQL connection active and verified.',
      version: rows[0]?.version || '8.0+',
      database: process.env.DB_NAME || 'localloop',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT, 10) || 3306
    };
  } catch (err) {
    return {
      success: false,
      message: 'Failed to connect to MySQL database.',
      error: err.message,
      code: err.code
    };
  }
}

module.exports = {
  pool,
  query,
  getConnection,
  testConnection
};
