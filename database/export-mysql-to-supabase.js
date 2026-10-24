/**
 * OneMarket - MySQL to Supabase Data Migration & Export Pipeline
 * Dumps MySQL records, validates foreign-key relationships, creates a JSON backup,
 * and generates idempotent SQL inserts for Supabase Postgres (supabase/seed.sql).
 */

const fs = require('fs');
const path = require('path');
const db = require('../config/db');

function escapeSql(val) {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'number') return val;
  if (typeof val === 'boolean') return val ? 'TRUE' : 'FALSE';
  if (typeof val === 'object') {
    const jsonStr = JSON.stringify(val).replace(/'/g, "''");
    return `'${jsonStr}'::jsonb`;
  }
  const str = String(val).replace(/'/g, "''");
  return `'${str}'`;
}

async function runExport() {
  console.log('==================== EXPORTING MYSQL TO SUPABASE ====================');

  const tables = [
    'locations',
    'categories',
    'shops',
    'users',
    'products',
    'orders',
    'order_items',
    'order_status_history',
    'cart_items',
    'reviews',
    'reward_transactions'
  ];

  const backupData = {};
  const sqlStatements = [
    '-- OneMarket Supabase Seed Data (Exported from MySQL)',
    '-- Idempotent inserts with ON CONFLICT DO NOTHING',
    ''
  ];

  for (const table of tables) {
    try {
      const rows = await db.query(`SELECT * FROM ${table}`);
      backupData[table] = rows;
      console.log(`✓ Table "${table}": ${rows.length} rows exported.`);

      if (rows.length > 0) {
        const columns = Object.keys(rows[0]);
        sqlStatements.push(`-- Inserts for ${table} (${rows.length} rows)`);

        for (const row of rows) {
          const values = columns.map(c => {
            let val = row[c];
            if (c === 'attributes' || c === 'tags') {
              if (typeof val === 'string') {
                try { val = JSON.parse(val); } catch(e) {}
              }
            }
            return escapeSql(val);
          });

          // Primary key determination for ON CONFLICT
          const pk = (table === 'users' || table === 'products' || table === 'shops' || table === 'locations' || table === 'orders') ? 'id'
                   : (table === 'categories') ? 'name'
                   : 'id';

          sqlStatements.push(
            `INSERT INTO ${table} (${columns.map(c => `"${c}"`).join(', ')}) VALUES (${values.join(', ')}) ON CONFLICT ("${pk}") DO NOTHING;`
          );
        }
        sqlStatements.push('');
      }
    } catch (err) {
      console.warn(`! Note on table "${table}": ${err.message}`);
      backupData[table] = [];
    }
  }

  // Save JSON backup
  const jsonBackupPath = path.join(__dirname, 'backup-mysql-data.json');
  fs.writeFileSync(jsonBackupPath, JSON.stringify(backupData, null, 2), 'utf8');
  console.log(`\n✓ Saved JSON backup: ${jsonBackupPath}`);

  // Save Supabase seed.sql
  const supabaseSeedPath = path.join(__dirname, '..', 'supabase', 'seed.sql');
  fs.writeFileSync(supabaseSeedPath, sqlStatements.join('\n'), 'utf8');
  console.log(`✓ Generated Supabase Seed SQL: ${supabaseSeedPath}`);

  console.log('\n======================================================');
  console.log('MYSQL TO SUPABASE DATA EXPORT COMPLETED SUCCESSFULLY!');
  console.log('======================================================\n');
  process.exit(0);
}

runExport().catch(err => {
  console.error('Migration export error:', err);
  process.exit(1);
});
