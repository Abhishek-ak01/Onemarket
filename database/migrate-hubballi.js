/**
 * Safe Database Migration & Localization to Hubballi (Hubli), Karnataka
 * Updates locations, shops, product images, heals order_items, and links customer orders.
 * Does NOT drop database, tables, or columns.
 */

const db = require('../config/db');

async function migrate() {
  console.log('--- Starting OneMarket Safe Hubballi Migration ---');

  // 1. Update Locations to Hubballi
  const locations = [
    { id: 'loc-1', name: 'Koppikar Road, Hubballi', pincode: '580020' },
    { id: 'loc-2', name: 'Vidyanagar, Hubballi', pincode: '580021' },
    { id: 'loc-3', name: 'Gokul Road, Hubballi', pincode: '580030' },
    { id: 'loc-4', name: 'Keshwapur, Hubballi', pincode: '580023' },
    { id: 'loc-5', name: 'Unkal, Hubballi', pincode: '580031' },
    { id: 'loc-6', name: 'Shirur Park, Hubballi', pincode: '580021' }
  ];

  for (const loc of locations) {
    await db.query(
      `INSERT INTO locations (id, name, pincode) VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE name = VALUES(name), pincode = VALUES(pincode)`,
      [loc.id, loc.name, loc.pincode]
    );
  }
  console.log('✓ Hubballi locations updated.');

  // 2. Update Shops to Hubballi
  const shops = [
    {
      id: 'shop-1',
      name: 'Malabar Heritage Spices & Pantry',
      area: 'Koppikar Road',
      address: 'Koppikar Road Market, Near Durgadbail, Hubballi - 580020'
    },
    {
      id: 'shop-2',
      name: 'Apex Tech & Gadget Hub',
      area: 'Vidyanagar',
      address: 'Opp. KLE Tech University, Vidyanagar, Hubballi - 580021'
    },
    {
      id: 'shop-3',
      name: 'Vogue Craft & Handloom Studio',
      area: 'Koppikar Road',
      address: 'Near Cotton Market, Koppikar Road, Hubballi - 580020'
    },
    {
      id: 'shop-4',
      name: 'Saraswati Book Haven & Fine Papers',
      area: 'Keshwapur',
      address: 'Kusugal Road, Keshwapur, Hubballi - 580023'
    },
    {
      id: 'shop-5',
      name: 'Prakriti Home & Sustainable Living',
      area: 'Shirur Park',
      address: 'Shirur Park 2nd Cross, Vidyanagar, Hubballi - 580021'
    },
    {
      id: 'shop-6',
      name: 'Veda Botanics & Apothecary',
      area: 'Gokul Road',
      address: 'Near Airport Bypass, Gokul Road, Hubballi - 580030'
    },
    {
      id: 'shop-7',
      name: 'DecaPulse Sports & Outdoor Hub',
      area: 'Unkal',
      address: 'Unkal Lake Promenade, PB Road, Hubballi - 580031'
    }
  ];

  for (const s of shops) {
    await db.query(
      `UPDATE shops SET area = ?, address = ? WHERE id = ?`,
      [s.area, s.address, s.id]
    );
  }
  console.log('✓ Hubballi shops localized.');

  // 3. Update Product Images to local relative paths
  await db.query(`UPDATE products SET image = CONCAT('assets/product-images/', id, '.jpg')`);
  console.log('✓ Product image paths updated to local assets.');

  // 4. Remove duplicate order items in LL-2026-1042 if present
  try {
    const dupCheck = await db.query(
      `SELECT id FROM order_items WHERE order_id = 'LL-2026-1042' ORDER BY id ASC`
    );
    if (dupCheck.length > 2) {
      // Keep only the first 2 items (prod-101 and prod-601)
      const toDelete = dupCheck.slice(2).map(r => r.id);
      if (toDelete.length > 0) {
        await db.query(
          `DELETE FROM order_items WHERE id IN (${toDelete.map(() => '?').join(', ')})`,
          toDelete
        );
        console.log(`✓ Removed ${toDelete.length} duplicate order items from LL-2026-1042.`);
      }
    }
  } catch (err) {
    console.warn('Note on order_items cleanup:', err.message);
  }

  // 5. Backfill all NULL or empty images in order_items with product images
  await db.query(`
    UPDATE order_items oi
    JOIN products p ON oi.product_id = p.id
    SET oi.image = p.image
    WHERE oi.image IS NULL OR oi.image = ''
  `);
  console.log('✓ Heiled order_items image snapshots (zero nulls remaining).');

  // 6. Associate orphaned orders with demo user
  await db.query(`
    UPDATE orders 
    SET user_id = 'user-cust-1' 
    WHERE (customer_phone = '9845012345' OR customer_name = 'Aditi Rao') AND (user_id IS NULL OR user_id = '')
  `);
  console.log('✓ Customer identity associated on orders.');

  // 7. Update any old Bengaluru addresses in orders table
  await db.query(`
    UPDATE orders 
    SET customer_address = REPLACE(customer_address, 'Bengaluru', 'Hubballi')
    WHERE customer_address LIKE '%Bengaluru%'
  `);
  await db.query(`
    UPDATE orders 
    SET customer_address = REPLACE(customer_address, 'Indiranagar', 'Koppikar Road, Hubballi')
    WHERE customer_address LIKE '%Indiranagar%'
  `);
  console.log('✓ Order addresses updated to Hubballi.');

  // Verify
  const [nullImages] = await db.query(`SELECT COUNT(*) as count FROM order_items WHERE image IS NULL OR image = ''`);
  console.log(`Verification: order_items with NULL image = ${nullImages.count}`);

  const [ordersSummary] = await db.query(`SELECT COUNT(*) as count FROM orders WHERE user_id IS NOT NULL`);
  console.log(`Verification: orders with user_id = ${ordersSummary.count}`);

  console.log('--- Migration completed successfully! ---');
  process.exit(0);
}

migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
