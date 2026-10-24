/**
 * LocalLoop - Database Seed Runner
 * Connects to MySQL using .env configuration and executes schema.sql followed by seed.sql.
 * Usage: node database/seed.js (or npm run db:seed)
 */

const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function runSeed() {
  console.log('--- LocalLoop Database Setup & Seeding ---');
  console.log(`Connecting to MySQL host: ${process.env.DB_HOST || 'localhost'}, user: ${process.env.DB_USER || 'root'}...`);

  // Connect without database first to ensure CREATE DATABASE localloop succeeds
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT, 10) || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      multipleStatements: true
    });
    console.log('✓ Connected to MySQL server.');
  } catch (err) {
    console.error('✗ Failed to connect to MySQL:', err.message);
    console.error('  Please verify your .env file credentials and ensure MySQL Server is running.');
    process.exit(1);
  }

  try {
    // 1. Run schema.sql
    console.log('Executing database/schema.sql...');
    const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    await connection.query(schemaSql);
    console.log('✓ Schema created: Database "localloop" and tables initialized.');

    // 2. Run seed.sql
    console.log('Executing database/seed.sql...');
    const seedSql = fs.readFileSync(path.join(__dirname, 'seed.sql'), 'utf8');
    await connection.query(seedSql);
    console.log('✓ Seed data inserted: 6 shops, 26 products, categories, locations, and initial orders.');

    console.log('\n======================================================');
    console.log('Database setup and seeding completed successfully!');
    console.log('======================================================\n');
  } catch (err) {
    console.error('✗ Error executing SQL:', err.message);
  } finally {
    if (connection) await connection.end();
  }
}

runSeed();
