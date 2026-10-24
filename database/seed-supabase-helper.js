const fs = require('fs');
const d = require('./backup-mysql-data.json');

function esc(val) {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'number') return val;
  if (typeof val === 'boolean') return val ? 'TRUE' : 'FALSE';
  if (typeof val === 'object') {
    return `'${JSON.stringify(val).replace(/'/g, "''")}'::jsonb`;
  }
  return `'${String(val).replace(/'/g, "''")}'`;
}

// 1. Shops
const shopsSql = 'INSERT INTO shops (id, name, category, area, address, description, rating, reviews_count, image, phone, timing, status) VALUES\n' +
  d.shops.map(s => `(${esc(s.id)}, ${esc(s.name)}, ${esc(s.category)}, ${esc(s.area)}, ${esc(s.address)}, ${esc(s.description)}, ${s.rating || 0}, ${s.reviews_count || 0}, ${esc(s.image)}, ${esc(s.phone)}, ${esc(s.timing)}, ${esc(s.status || 'active')})`).join(',\n') +
  '\nON CONFLICT (id) DO NOTHING;';

// 2. Users
const usersSql = 'INSERT INTO users (id, name, email, phone, password_hash, role, shop_id, address, city, pincode, reward_tokens, status) VALUES\n' +
  d.users.map(u => `(${esc(u.id)}, ${esc(u.name)}, ${esc(u.email)}, ${esc(u.phone)}, ${esc(u.password_hash)}, ${esc(u.role)}, ${esc(u.shop_id)}, ${esc(u.address)}, ${esc(u.city || 'Hubballi')}, ${esc(u.pincode)}, ${u.reward_tokens || 0}, ${esc(u.status || 'active')})`).join(',\n') +
  '\nON CONFLICT (id) DO NOTHING;';

// 3. Products
const prodsSql = 'INSERT INTO products (id, name, category, shop_id, price, original_price, discount_percent, stock, rating, reviews_count, description, attributes, tags, image, is_featured, is_active, moderation_status) VALUES\n' +
  d.products.map(p => `(${esc(p.id)}, ${esc(p.name)}, ${esc(p.category)}, ${esc(p.shop_id)}, ${p.price}, ${esc(p.original_price)}, ${p.discount_percent || 0}, ${p.stock || 0}, ${p.rating || 0}, ${p.reviews_count || 0}, ${esc(p.description)}, ${esc(p.attributes)}, ${esc(p.tags)}, ${esc(p.image)}, ${p.is_featured ? 'TRUE' : 'FALSE'}, ${p.is_active ? 'TRUE' : 'FALSE'}, ${esc(p.moderation_status || 'approved')})`).join(',\n') +
  '\nON CONFLICT (id) DO NOTHING;';

// 4. Orders
const ordersSql = 'INSERT INTO orders (id, user_id, customer_name, customer_phone, customer_address, delivery_preference, payment_method, payment_status, notes, subtotal, delivery_fee, taxes, total, tokens_earned, tokens_redeemed, token_discount, status) VALUES\n' +
  d.orders.map(o => `(${esc(o.id)}, ${esc(o.user_id)}, ${esc(o.customer_name)}, ${esc(o.customer_phone)}, ${esc(o.customer_address)}, ${esc(o.delivery_preference || 'delivery')}, ${esc(o.payment_method || 'Cash on Delivery')}, ${esc(o.payment_status || 'Pending')}, ${esc(o.notes)}, ${o.subtotal || 0}, ${o.delivery_fee || 0}, ${o.taxes || 0}, ${o.total || 0}, ${o.tokens_earned || 0}, ${o.tokens_redeemed || 0}, ${o.token_discount || 0}, ${esc(o.status || 'Pending')})`).join(',\n') +
  '\nON CONFLICT (id) DO NOTHING;';

// 5. Order items
const orderItemsSql = 'INSERT INTO order_items (id, order_id, product_id, image, name, category, price, original_price, discount, quantity, shop_id, shop_name) VALUES\n' +
  d.order_items.map((it, idx) => `(${it.id || (idx + 1)}, ${esc(it.order_id)}, ${esc(it.product_id)}, ${esc(it.image)}, ${esc(it.name)}, ${esc(it.category)}, ${it.price || 0}, ${esc(it.original_price)}, ${it.discount || 0}, ${it.quantity || 1}, ${esc(it.shop_id)}, ${esc(it.shop_name)})`).join(',\n') +
  '\nON CONFLICT (id) DO NOTHING;';

// 6. Reviews
const reviewsSql = 'INSERT INTO reviews (id, product_id, user_id, customer_name, rating, comment, is_verified_purchase) VALUES\n' +
  d.reviews.map((r, idx) => `(${r.id || (idx + 1)}, ${esc(r.product_id)}, ${esc(r.user_id)}, ${esc(r.customer_name)}, ${r.rating || 5}, ${esc(r.comment)}, ${r.is_verified_purchase ? 'TRUE' : 'FALSE'})`).join(',\n') +
  '\nON CONFLICT (id) DO NOTHING;';

// 7. Reward transactions
const rewardsSql = 'INSERT INTO reward_transactions (id, user_id, order_id, amount, type, description) VALUES\n' +
  d.reward_transactions.map((rt, idx) => `(${rt.id || (idx + 1)}, ${esc(rt.user_id)}, ${esc(rt.order_id)}, ${rt.amount || 0}, ${esc(rt.type || 'EARNED')}, ${esc(rt.description)})`).join(',\n') +
  '\nON CONFLICT (id) DO NOTHING;';

fs.writeFileSync('database/shops.sql', shopsSql);
fs.writeFileSync('database/users.sql', usersSql);
fs.writeFileSync('database/products.sql', prodsSql);
fs.writeFileSync('database/orders.sql', ordersSql);
fs.writeFileSync('database/order_items.sql', orderItemsSql);
fs.writeFileSync('database/reviews.sql', reviewsSql);
fs.writeFileSync('database/rewards.sql', rewardsSql);
console.log('Generated all seed SQL snippets.');
