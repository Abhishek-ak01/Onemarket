/**
 * LocalLoop - Safe Additive Database Migration & Seed Expansion
 * Adds users, cart_items, reviews tables and additive columns to products/orders/order_items.
 * Expands catalogue to 7+ categories with 6-7 sample items each and genuine Unsplash images.
 */

const bcrypt = require('bcryptjs');
const db = require('../config/db');

async function migrate() {
  console.log('Starting safe additive migration on database:', process.env.DB_NAME || 'localloop');

  const connection = await db.getConnection();
  try {
    // 1. Users Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(50) NOT NULL,
        name VARCHAR(150) NOT NULL,
        email VARCHAR(150) NOT NULL,
        phone VARCHAR(30) DEFAULT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role ENUM('customer', 'seller') NOT NULL DEFAULT 'customer',
        shop_id VARCHAR(50) DEFAULT NULL,
        address TEXT DEFAULT NULL,
        city VARCHAR(100) DEFAULT 'Bengaluru',
        pincode VARCHAR(10) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY uq_users_email (email),
        INDEX idx_users_role (role),
        INDEX idx_users_shop (shop_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('✓ Verified table: users');

    // 2. Additive columns for products
    const [prodCols] = await connection.query('DESCRIBE products');
    const prodColNames = prodCols.map(c => c.Field);
    if (!prodColNames.includes('original_price')) {
      await connection.query('ALTER TABLE products ADD COLUMN original_price DECIMAL(10,2) DEFAULT NULL AFTER price');
      console.log('✓ Added original_price to products');
    }
    if (!prodColNames.includes('discount_percent')) {
      await connection.query('ALTER TABLE products ADD COLUMN discount_percent INT DEFAULT 0 AFTER original_price');
      console.log('✓ Added discount_percent to products');
    }
    if (!prodColNames.includes('is_active')) {
      await connection.query('ALTER TABLE products ADD COLUMN is_active BOOLEAN DEFAULT TRUE AFTER is_featured');
      console.log('✓ Added is_active to products');
    }

    // 3. Additive columns for order_items (Image and discount snapshot)
    const [itemCols] = await connection.query('DESCRIBE order_items');
    const itemColNames = itemCols.map(c => c.Field);
    if (!itemColNames.includes('image')) {
      await connection.query('ALTER TABLE order_items ADD COLUMN image VARCHAR(500) DEFAULT NULL AFTER product_id');
      console.log('✓ Added image snapshot to order_items');
    }
    if (!itemColNames.includes('original_price')) {
      await connection.query('ALTER TABLE order_items ADD COLUMN original_price DECIMAL(10,2) DEFAULT NULL AFTER price');
      console.log('✓ Added original_price to order_items');
    }
    if (!itemColNames.includes('discount')) {
      await connection.query('ALTER TABLE order_items ADD COLUMN discount DECIMAL(5,2) DEFAULT 0.00 AFTER original_price');
      console.log('✓ Added discount to order_items');
    }

    // 4. Additive columns for orders
    const [orderCols] = await connection.query('DESCRIBE orders');
    const orderColNames = orderCols.map(c => c.Field);
    if (!orderColNames.includes('user_id')) {
      await connection.query('ALTER TABLE orders ADD COLUMN user_id VARCHAR(50) DEFAULT NULL AFTER id');
      console.log('✓ Added user_id to orders');
    }
    if (!orderColNames.includes('payment_method')) {
      await connection.query("ALTER TABLE orders ADD COLUMN payment_method VARCHAR(50) DEFAULT 'Cash on Delivery (Demo)' AFTER delivery_preference");
      console.log('✓ Added payment_method to orders');
    }
    if (!orderColNames.includes('payment_status')) {
      await connection.query("ALTER TABLE orders ADD COLUMN payment_status VARCHAR(50) DEFAULT 'Pending' AFTER payment_method");
      console.log('✓ Added payment_status to orders');
    }
    if (!orderColNames.includes('subtotal')) {
      await connection.query('ALTER TABLE orders ADD COLUMN subtotal DECIMAL(10,2) DEFAULT 0.00 AFTER notes');
      console.log('✓ Added subtotal to orders');
    }
    if (!orderColNames.includes('delivery_fee')) {
      await connection.query('ALTER TABLE orders ADD COLUMN delivery_fee DECIMAL(10,2) DEFAULT 0.00 AFTER subtotal');
      console.log('✓ Added delivery_fee to orders');
    }
    if (!orderColNames.includes('taxes')) {
      await connection.query('ALTER TABLE orders ADD COLUMN taxes DECIMAL(10,2) DEFAULT 0.00 AFTER delivery_fee');
      console.log('✓ Added taxes to orders');
    }

    // 5. Cart Items Table (Database-backed cart for authenticated customer)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS cart_items (
        id INT UNSIGNED NOT NULL AUTO_INCREMENT,
        user_id VARCHAR(50) NOT NULL,
        product_id VARCHAR(50) NOT NULL,
        quantity INT UNSIGNED NOT NULL DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY uq_user_product (user_id, product_id),
        INDEX idx_cart_user (user_id),
        CONSTRAINT fk_cart_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        CONSTRAINT fk_cart_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('✓ Verified table: cart_items');

    // 6. Verified Reviews Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id INT UNSIGNED NOT NULL AUTO_INCREMENT,
        product_id VARCHAR(50) NOT NULL,
        user_id VARCHAR(50) NOT NULL,
        customer_name VARCHAR(150) NOT NULL,
        rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
        comment TEXT NOT NULL,
        is_verified_purchase BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        INDEX idx_reviews_product (product_id),
        INDEX idx_reviews_user (user_id),
        CONSTRAINT fk_reviews_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        CONSTRAINT fk_reviews_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('✓ Verified table: reviews');

    // 7. Seed Categories
    await connection.query(`
      INSERT IGNORE INTO categories (id, name, icon, description) VALUES
      ('cat-sports', 'Sports & Lifestyle', 'sports', 'Yoga mats, badminton gear, fitness accessories & active wear')
    `);

    // 8. Seed Shop 7 (Sports)
    await connection.query(`
      INSERT IGNORE INTO shops (id, name, category, area, address, description, rating, reviews_count, image, phone, timing) VALUES
      ('shop-7', 'DecaPulse Sports & Outdoor Hub', 'Sports & Lifestyle', 'Koramangala', '80ft Road, 4th Block, Koramangala', 'Neighbourhood destination for high-grade badminton rackets, eco-friendly cork yoga mats, cycling gear, and endurance fitness accessories.', 4.8, 89, 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=600&q=80', '+91 98860 45678', '9:00 AM - 9:30 PM')
    `);

    // 9. Seed Demo Users (Bcrypt hashed)
    const salt = await bcrypt.genSalt(10);
    const customerHash = await bcrypt.hash('Customer@123', salt);
    const sellerHash = await bcrypt.hash('Seller@123', salt);

    await connection.query(`
      INSERT IGNORE INTO users (id, name, email, phone, password_hash, role, shop_id, address, city, pincode) VALUES
      ('user-cust-1', 'Aditi Rao', 'customer@localloop.in', '+91 98450 12345', ?, 'customer', NULL, 'Flat 402, Green Palms Apts, 100ft Road, Indiranagar', 'Bengaluru', '560038'),
      ('user-cust-2', 'Rohan Mehra', 'rohan@localloop.in', '+91 98802 99881', ?, 'customer', NULL, 'Villa 18, Koramangala 4th Block', 'Bengaluru', '560034'),
      ('user-sell-1', 'Narayanan Nambiar', 'seller@malabarspices.in', '+91 98451 22345', ?, 'seller', 'shop-1', '100 Feet Road, 12th Main, Indiranagar', 'Bengaluru', '560038'),
      ('user-sell-2', 'Vikramaditya Hegde', 'seller@apextech.in', '+91 98802 33411', ?, 'seller', 'shop-2', '5th Block, Sony World Junction, Koramangala', 'Bengaluru', '560034'),
      ('user-sell-3', 'Ananya Sharma', 'seller@voguecraft.in', '+91 97412 88902', ?, 'seller', 'shop-3', '8th Cross, Margosa Road, Malleshwaram', 'Bengaluru', '560003'),
      ('user-sell-4', 'Murali Krishna', 'seller@saraswatibooks.in', '+91 98440 11988', ?, 'seller', 'shop-4', '4th Block, Near Jayanagar BDA Complex', 'Bengaluru', '560011'),
      ('user-sell-5', 'Sunita Reddy', 'seller@prakritihome.in', '+91 99003 44521', ?, 'seller', 'shop-5', 'Sector 2, 27th Main, HSR Layout', 'Bengaluru', '560102'),
      ('user-sell-6', 'Dr. Meenakshi Iyer', 'seller@vedabotanics.in', '+91 96118 77203', ?, 'seller', 'shop-6', '12th Main Road, HAL 2nd Stage, Indiranagar', 'Bengaluru', '560038'),
      ('user-sell-7', 'Karthik Gowda', 'seller@decapulse.in', '+91 98860 45678', ?, 'seller', 'shop-7', '80ft Road, 4th Block, Koramangala', 'Bengaluru', '560034')
    `, [customerHash, customerHash, sellerHash, sellerHash, sellerHash, sellerHash, sellerHash, sellerHash, sellerHash]);
    console.log('✓ Seeded demo customer and seller accounts');

    // 10. Populate Additional Sample Products (to guarantee 6-7 items per category)
    const extraProducts = [
      // Groceries extra
      {
        id: 'prod-106',
        name: 'Single Estate Coorg Arabica Coffee Beans (Medium Roast)',
        category: 'Groceries',
        shop_id: 'shop-1',
        price: 360,
        original_price: 450,
        discount_percent: 20,
        stock: 14,
        rating: 4.8,
        reviews_count: 29,
        description: 'Shade-grown 100% Arabica coffee beans hand-picked from Coorg hillside estates. Balanced medium roast with hazelnut and caramelized cane sugar notes.',
        attributes: JSON.stringify({ "Net Weight": "250g Whole Bean", "Roast": "Medium", "Altitude": "1100m", "Flavour Notes": "Nutty, Cocoa, Cane Sugar" }),
        tags: JSON.stringify(["coffee", "arabica", "coorg", "artisanal"]),
        image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=600&q=80',
        is_featured: 1
      },
      {
        id: 'prod-107',
        name: 'Organic Salem Turmeric Powder (Curcumin 5%)',
        category: 'Groceries',
        shop_id: 'shop-1',
        price: 160,
        original_price: 200,
        discount_percent: 20,
        stock: 25,
        rating: 4.9,
        reviews_count: 34,
        description: 'Naturally cultivated Salem heirloom turmeric with certified 5% active curcumin potency. Ground in stone mills without artificial colorants.',
        attributes: JSON.stringify({ "Net Weight": "200g", "Curcumin": "5% Certified", "Cultivation": "Chemical-free heirloom", "Origin": "Salem, TN" }),
        tags: JSON.stringify(["spices", "turmeric", "curcumin", "immunity"]),
        image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=80',
        is_featured: 0
      },
      // Electronics extra
      {
        id: 'prod-206',
        name: 'Ergonomic Vertical Silent Wireless Mouse',
        category: 'Electronics',
        shop_id: 'shop-2',
        price: 999,
        original_price: 1299,
        discount_percent: 23,
        stock: 11,
        rating: 4.7,
        reviews_count: 38,
        description: 'Natural handshake 57-degree vertical ergonomic mouse designed to alleviate wrist strain. Silent click switches with adjustable DPI up to 2400.',
        attributes: JSON.stringify({ "Connectivity": "2.4GHz USB + Bluetooth 5.0", "DPI Levels": "800/1200/1600/2400", "Battery": "Rechargeable 500mAh", "Weight": "110g" }),
        tags: JSON.stringify(["mouse", "ergonomics", "desk setup", "wireless"]),
        image: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=600&q=80',
        is_featured: 1
      },
      {
        id: 'prod-207',
        name: 'Magnetic MagSafe Wireless Power Bank (10000mAh)',
        category: 'Electronics',
        shop_id: 'shop-2',
        price: 2199,
        original_price: 2799,
        discount_percent: 21,
        stock: 9,
        rating: 4.8,
        reviews_count: 22,
        description: 'Snap-on magnetic 15W fast wireless battery pack with 20W PD Type-C bi-directional port. Soft silicone anti-scratch backing with LED power level display.',
        attributes: JSON.stringify({ "Capacity": "10000mAh", "Wireless Output": "15W Max", "Wired Output": "20W PD", "Pass-Through Charging": "Supported" }),
        tags: JSON.stringify(["power bank", "magsafe", "wireless", "portable"]),
        image: 'https://images.unsplash.com/photo-1609592426815-585a06c54784?auto=format&fit=crop&w=600&q=80',
        is_featured: 0
      },
      // Fashion extra
      {
        id: 'prod-305',
        name: 'Handcrafted Brass & Silver Temple Pendant Necklace',
        category: 'Fashion',
        shop_id: 'shop-3',
        price: 1450,
        original_price: 1800,
        discount_percent: 19,
        stock: 5,
        rating: 4.9,
        reviews_count: 17,
        description: 'Antique oxidized finish pendant handcrafted by traditional Udupi metalsmiths. Embellished with semi-precious kemp cabochons on an adjustable silk cord.',
        attributes: JSON.stringify({ "Material": "Pure Brass with Silver Dip", "Stones": "Reconstructed Kemp Ruby", "Cord": "Black woven silk with tassel", "Care": "Wipe dry" }),
        tags: JSON.stringify(["jewellery", "handcrafted", "temple", "brass"]),
        image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80',
        is_featured: 1
      },
      {
        id: 'prod-306',
        name: 'Pure Linen Relaxed Casual Trousers',
        category: 'Fashion',
        shop_id: 'shop-3',
        price: 1890,
        original_price: 2400,
        discount_percent: 21,
        stock: 8,
        rating: 4.8,
        reviews_count: 24,
        description: 'Tailored from breathable 60-lea natural European flax linen. Features an elasticated drawstring waistband, deep slant pockets, and tapered hems.',
        attributes: JSON.stringify({ "Fabric": "100% Pure Flax Linen", "Fit": "Relaxed Tapered", "Pockets": "4 Deep Utility Pockets", "Colour": "Oatmeal Beige" }),
        tags: JSON.stringify(["linen", "trousers", "apparel", "breathable", "sustainable"]),
        image: 'https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?auto=format&fit=crop&w=600&q=80',
        is_featured: 0
      },
      {
        id: 'prod-307',
        name: 'Organic Cotton Indigo Hand-Block Printed Scarf',
        category: 'Fashion',
        shop_id: 'shop-3',
        price: 550,
        original_price: 700,
        discount_percent: 21,
        stock: 14,
        rating: 4.7,
        reviews_count: 19,
        description: 'Featherlight mulmul cotton scarf dyed in heritage mud-resist Dabu and natural indigo vats with geometric floral hand-carved woodblocks.',
        attributes: JSON.stringify({ "Fabric": "100% Mulmul Cotton", "Length": "1.8 Metres", "Dye": "Organic Fermented Indigo", "Edge": "Hand-rolled hems" }),
        tags: JSON.stringify(["scarf", "indigo", "block print", "accessories"]),
        image: 'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?auto=format&fit=crop&w=600&q=80',
        is_featured: 0
      },
      // Books & Stationery extra
      {
        id: 'prod-405',
        name: 'Japanese Steel Calligraphy Dip Pen Set with 5 Nibs',
        category: 'Books & Stationery',
        shop_id: 'shop-4',
        price: 850,
        original_price: 1100,
        discount_percent: 23,
        stock: 7,
        rating: 4.9,
        reviews_count: 21,
        description: 'Ergonomic polished rosewood dip pen holder accompanied by 5 interchangeable precision stainless steel nibs for copperplate and modern calligraphy.',
        attributes: JSON.stringify({ "Holder": "Natural Polished Rosewood", "Nibs": "5 Stainless Steel Variants", "Usage": "Inks, Watercolors, Gouache", "Packaging": "Kraft Gift Box" }),
        tags: JSON.stringify(["calligraphy", "stationery", "art", "nibs"]),
        image: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=600&q=80',
        is_featured: 1
      },
      {
        id: 'prod-406',
        name: 'The Trees of Bangalore: A Field Companion Guide',
        category: 'Books & Stationery',
        shop_id: 'shop-4',
        price: 495,
        original_price: 595,
        discount_percent: 17,
        stock: 12,
        rating: 4.9,
        reviews_count: 36,
        description: 'Full-color illustrated handbook classifying over 120 canopy and blooming trees of Bengaluru, documenting blooming seasons and planting folklore.',
        attributes: JSON.stringify({ "Format": "Flexi-bound Field Guide", "Pages": "240 Color Pages", "Publisher": "Urban Ecology Trust", "Language": "English" }),
        tags: JSON.stringify(["books", "nature", "bangalore", "ecology"]),
        image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=600&q=80',
        is_featured: 0
      },
      {
        id: 'prod-407',
        name: 'Handmade Cotton Rag Watercolour Sketchbook (300 GSM Cold Press)',
        category: 'Books & Stationery',
        shop_id: 'shop-4',
        price: 680,
        original_price: 850,
        discount_percent: 20,
        stock: 8,
        rating: 4.8,
        reviews_count: 18,
        description: 'Square 8x8 inch artist sketchbook bound with acid-free 300 GSM deckle-edge 100% cotton paper. Opens 180 degrees flat for panoramic urban sketching.',
        attributes: JSON.stringify({ "Paper": "300 GSM Cold Press 100% Cotton", "Sheets": "40 Sheets (80 Pages)", "Binding": "Exposed Belgian Stitch", "Cover": "Raw Khadi Canvas" }),
        tags: JSON.stringify(["sketchbook", "watercolour", "stationery", "handmade"]),
        image: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=600&q=80',
        is_featured: 0
      },
      // Home & Living extra
      {
        id: 'prod-505',
        name: 'Hand-Carved Sheesham Wood Serving Platter',
        category: 'Home & Living',
        shop_id: 'shop-5',
        price: 950,
        original_price: 1200,
        discount_percent: 21,
        stock: 6,
        rating: 4.8,
        reviews_count: 25,
        description: 'Food-safe live edge Indian rosewood serving board hand-planed and conditioned with organic beeswax and cold-pressed walnut oil.',
        attributes: JSON.stringify({ "Wood": "Sustainably Harvested Sheesham", "Finish": "Pure Beeswax & Food Mineral Oil", "Dimensions": "35cm x 22cm x 2.5cm", "Handle": "Brass inlay loop" }),
        tags: JSON.stringify(["wood", "kitchen", "home decor", "handmade"]),
        image: 'https://images.unsplash.com/photo-1590736969955-71cc94801759?auto=format&fit=crop&w=600&q=80',
        is_featured: 1
      },
      {
        id: 'prod-506',
        name: 'Handwoven Sabai Grass Storage Basket (Set of 2)',
        category: 'Home & Living',
        shop_id: 'shop-5',
        price: 820,
        original_price: 1050,
        discount_percent: 22,
        stock: 10,
        rating: 4.7,
        reviews_count: 14,
        description: 'Sturdy nesting storage baskets coiled with natural wild sabai grass and cotton cord. Ideal for organizing books, craft supplies, and vanity essentials.',
        attributes: JSON.stringify({ "Material": "Natural Sabai Grass & Cotton", "Set Sizes": "Large (25x15cm) & Medium (20x12cm)", "Eco-friendly": "100% Biodegradable", "Origin": "Mayurbhanj Artisans" }),
        tags: JSON.stringify(["storage", "basket", "sustainable", "decor"]),
        image: 'https://images.unsplash.com/photo-1595908129746-57ca1a6b9b90?auto=format&fit=crop&w=600&q=80',
        is_featured: 0
      },
      {
        id: 'prod-507',
        name: 'Pure Brass Hanging Bell Wind Chime with Peacock Motif',
        category: 'Home & Living',
        shop_id: 'shop-5',
        price: 740,
        original_price: 900,
        discount_percent: 18,
        stock: 8,
        rating: 4.8,
        reviews_count: 31,
        description: 'Traditional resonant cast brass temple bell with antique verdigris patina. Produces deep meditative resonance when caught by balcony breezes.',
        attributes: JSON.stringify({ "Material": "Pure Bell Metal Brass", "Total Height": "45cm with hanging chain", "Weight": "550g", "Finishing": "Antique Patina" }),
        tags: JSON.stringify(["brass", "bell", "wind chime", "balcony", "decor"]),
        image: 'https://images.unsplash.com/photo-1545239351-ef35f43d514b?auto=format&fit=crop&w=600&q=80',
        is_featured: 0
      },
      // Personal Care extra
      {
        id: 'prod-605',
        name: 'Wild Himalayan Apricot Kernel Cold-Pressed Facial Oil',
        category: 'Personal Care',
        shop_id: 'shop-6',
        price: 650,
        original_price: 800,
        discount_percent: 19,
        stock: 13,
        rating: 4.9,
        reviews_count: 39,
        description: 'Single-press wild apricot oil cold-churned by mountain women cooperatives. Exceptionally rich in Vitamin E and Oleic Acid for deep cellular nourishment.',
        attributes: JSON.stringify({ "Volume": "50ml Amber Dropper Bottle", "Botanical": "Prunus Armeniaca (Chuli)", "Origin": "Garhwal Himalayas", "Method": "Cold Stone Pressed" }),
        tags: JSON.stringify(["facial oil", "skincare", "ayurvedic", "vitamin e"]),
        image: 'https://images.unsplash.com/photo-1608248597359-54848378216c?auto=format&fit=crop&w=600&q=80',
        is_featured: 1
      },
      {
        id: 'prod-606',
        name: 'Vetiver & Sandalwood Clarifying Clay Face Ubtan',
        category: 'Personal Care',
        shop_id: 'shop-6',
        price: 340,
        original_price: 420,
        discount_percent: 19,
        stock: 19,
        rating: 4.8,
        reviews_count: 27,
        description: 'Micro-pulverized raw Multani Mitti clay blended with khus roots, sandalwood powder, and wild kasturi manjal. Absorbs oil and smooths skin texture.',
        attributes: JSON.stringify({ "Net Weight": "100g Glass Jar", "Key Ingredients": "South Indian Vetiver, Pure Sandalwood, Multani Mitti", "Free From": "Fragrance, Talc, Fillers" }),
        tags: JSON.stringify(["face mask", "ubtan", "ayurveda", "sandalwood"]),
        image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&q=80',
        is_featured: 0
      },
      {
        id: 'prod-607',
        name: 'Organic Rosemary & Cedarwood Botanical Shampoo Bar',
        category: 'Personal Care',
        shop_id: 'shop-6',
        price: 240,
        original_price: 300,
        discount_percent: 20,
        stock: 16,
        rating: 4.7,
        reviews_count: 33,
        description: 'Zero-waste concentrated solid hair shampoo bar formulated with soapnuts (reetha), shikakai, rosemary essential oil, and unrefined coconut butter.',
        attributes: JSON.stringify({ "Weight": "90g Solid Bar", "Equivalent": "To 2x 250ml liquid shampoo bottles", "Packaging": "100% Recycled Paper", "pH": "Balanced 5.5" }),
        tags: JSON.stringify(["shampoo bar", "zero waste", "haircare", "natural"]),
        image: 'https://images.unsplash.com/photo-1607006314591-628d6896200d?auto=format&fit=crop&w=600&q=80',
        is_featured: 0
      },
      // Sports & Lifestyle (Shop 7)
      {
        id: 'prod-701',
        name: 'Eco-Friendly Natural Tree Rubber & Cork Yoga Mat (6mm)',
        category: 'Sports & Lifestyle',
        shop_id: 'shop-7',
        price: 1999,
        original_price: 2600,
        discount_percent: 23,
        stock: 12,
        rating: 4.9,
        reviews_count: 45,
        description: 'Premium non-slip yoga mat made from sustainably harvested Portuguese cork top and high-density biodegradable natural tree rubber base. Sweat-activated grip.',
        attributes: JSON.stringify({ "Thickness": "6mm High Cushioning", "Dimensions": "183cm x 66cm", "Material": "Organic Cork + Natural Tree Rubber", "Strap": "Includes cotton carry strap" }),
        tags: JSON.stringify(["yoga", "fitness", "eco friendly", "cork mat", "active"]),
        image: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=600&q=80',
        is_featured: 1
      },
      {
        id: 'prod-702',
        name: 'Titanium Graphite High-Tension Badminton Racket (4U)',
        category: 'Sports & Lifestyle',
        shop_id: 'shop-7',
        price: 1750,
        original_price: 2250,
        discount_percent: 22,
        stock: 9,
        rating: 4.8,
        reviews_count: 33,
        description: 'Isometric lightweight 82g graphite badminton racket strung at 28 lbs tension with BG65 high-resilience strings. Delivers crisp smashes and swift net recovery.',
        attributes: JSON.stringify({ "Weight Category": "4U (80-84g)", "Frame": "High Modulus Graphite + Titanium Mesh", "String Tension": "Pre-strung 28 lbs", "Cover": "Full Thermal Bag Included" }),
        tags: JSON.stringify(["badminton", "racket", "sports", "graphite"]),
        image: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=600&q=80',
        is_featured: 1
      },
      {
        id: 'prod-703',
        name: 'Stainless Steel Insulated Sports Flask with Chug Cap (1L)',
        category: 'Sports & Lifestyle',
        shop_id: 'shop-7',
        price: 890,
        original_price: 1150,
        discount_percent: 23,
        stock: 20,
        rating: 4.7,
        reviews_count: 41,
        description: 'Double-wall vacuum-insulated 18/8 food-grade stainless steel bottle. Keeps water chilled for 24 hours or steaming hot for 12 hours with sweat-proof powder coating.',
        attributes: JSON.stringify({ "Capacity": "1000ml (1 Litre)", "Insulation": "Cold 24h / Hot 12h", "Lid": "One-touch leakproof chug cap", "BPA Free": "100% Non-toxic" }),
        tags: JSON.stringify(["water bottle", "fitness", "outdoor", "flask"]),
        image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=600&q=80',
        is_featured: 0
      },
      {
        id: 'prod-704',
        name: 'Pro-Grade Speed Jump Rope with Ball Bearings',
        category: 'Sports & Lifestyle',
        shop_id: 'shop-7',
        price: 499,
        original_price: 650,
        discount_percent: 23,
        stock: 22,
        rating: 4.8,
        reviews_count: 28,
        description: 'Tangle-free 360-degree dual ball bearing steel wire speed rope. Features knurled anti-slip aluminum alloy handles and adjustable 3-metre coated cable.',
        attributes: JSON.stringify({ "Cable": "3m Coated Steel Wire", "Bearings": "360 Smooth Precision Ball Bearings", "Handles": "Knurled Aluminum Alloy", "Adjustment": "Tool-less thumb screws" }),
        tags: JSON.stringify(["jump rope", "cardio", "fitness", "workout"]),
        image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=600&q=80',
        is_featured: 0
      },
      {
        id: 'prod-705',
        name: 'Natural Latex Resistance Loop Bands (Set of 5 Levels)',
        category: 'Sports & Lifestyle',
        shop_id: 'shop-7',
        price: 599,
        original_price: 799,
        discount_percent: 25,
        stock: 18,
        rating: 4.7,
        reviews_count: 36,
        description: 'Set of 5 color-coded resistance loop exercise bands varying from X-Light (5 lbs) to X-Heavy (40 lbs). Molded from 100% natural Malaysian latex.',
        attributes: JSON.stringify({ "Resistance Levels": "5-10-20-30-40 lbs", "Material": "100% Natural Latex", "Includes": "5 Bands + Waterproof Carry Pouch + Exercise Guide" }),
        tags: JSON.stringify(["resistance bands", "home workout", "strength", "fitness"]),
        image: 'https://images.unsplash.com/photo-1598289431512-b97b0917affc?auto=format&fit=crop&w=600&q=80',
        is_featured: 0
      },
      {
        id: 'prod-706',
        name: 'Deep Tissue High-Density Trigger Point Foam Roller',
        category: 'Sports & Lifestyle',
        shop_id: 'shop-7',
        price: 799,
        original_price: 999,
        discount_percent: 20,
        stock: 11,
        rating: 4.8,
        reviews_count: 24,
        description: 'Multi-density grid foam roller constructed with an EVA foam exterior over a hollow rigid PVC core. Releases myofascial tension in back, glutes, and IT bands.',
        attributes: JSON.stringify({ "Length": "33cm x 14cm Diameter", "Density": "High Firmness Grid", "Core": "Heavy-Duty Reinforced PVC", "Max Load": "200 kg" }),
        tags: JSON.stringify(["foam roller", "recovery", "physiotherapy", "fitness"]),
        image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=600&q=80',
        is_featured: 0
      },
      {
        id: 'prod-707',
        name: 'Reflective Breathable Running & Hydration Waist Belt',
        category: 'Sports & Lifestyle',
        shop_id: 'shop-7',
        price: 450,
        original_price: 600,
        discount_percent: 25,
        stock: 15,
        rating: 4.6,
        reviews_count: 19,
        description: 'Bounce-free waterproof lycra running belt fitting phones up to 6.8 inches. Features dual 250ml flask holsters, key clip, and 360-degree reflective visibility bands.',
        attributes: JSON.stringify({ "Waist Fit": "Adjustable 24 to 44 inches", "Waterproof": "Sweat and rainproof TPU lining", "Pockets": "Zippered phone pouch + 2 flask sleeves", "Visibility": "Reflective strips" }),
        tags: JSON.stringify(["running", "waist pack", "marathon", "accessories"]),
        image: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=600&q=80',
        is_featured: 0
      }
    ];

    for (const p of extraProducts) {
      await connection.query(`
        INSERT INTO products (id, name, category, shop_id, price, original_price, discount_percent, stock, rating, reviews_count, description, attributes, tags, image, is_featured, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          original_price = VALUES(original_price),
          discount_percent = VALUES(discount_percent),
          is_active = 1
      `, [p.id, p.name, p.category, p.shop_id, p.price, p.original_price, p.discount_percent, p.stock, p.rating, p.reviews_count, p.description, p.attributes, p.tags, p.image, p.is_featured, 1]);
    }
    console.log(`✓ Seeded ${extraProducts.length} additional catalog products`);

    // 11. Update existing products with realistic original prices & discounts
    await connection.query(`
      UPDATE products SET original_price = ROUND(price * 1.25, 0), discount_percent = 20 WHERE original_price IS NULL
    `);
    console.log('✓ Updated discount pricing on original products');

    // 12. Seed Verified Reviews
    await connection.query(`
      INSERT IGNORE INTO reviews (id, product_id, user_id, customer_name, rating, comment, is_verified_purchase) VALUES
      (1, 'prod-101', 'user-cust-1', 'Aditi Rao', 5, 'Phenomenal aroma! The pods are large and bursting with seeds. Brewed with afternoon chai and the difference from supermarket cardamom is night and day.', 1),
      (2, 'prod-201', 'user-cust-2', 'Rohan Mehra', 5, 'Powers my MacBook Pro and Pixel 8 simultaneously without heating up. Compact enough to carry in my jacket pocket.', 1),
      (3, 'prod-301', 'user-cust-1', 'Aditi Rao', 5, 'The khadi weave is soft, authentic, and supremely breathable in Bengaluru weather. Stitching is immaculate.', 1),
      (4, 'prod-401', 'user-cust-2', 'Rohan Mehra', 5, 'The deckle-edge handmade paper handles fountain pen inks with zero bleed or feathering. Truly archival quality.', 1),
      (5, 'prod-501', 'user-cust-1', 'Aditi Rao', 5, 'Earthy terracotta planter with excellent drainage. Arrived carefully wrapped with not a single chip.', 1),
      (6, 'prod-601', 'user-cust-2', 'Rohan Mehra', 5, 'Gentle on skin and does not strip moisture. Lasts a good 3-4 weeks of daily use. Highly recommended apothecary!', 1)
    `);
    console.log('✓ Seeded verified customer reviews');

    console.log('\n======================================================');
    console.log('DATABASE MIGRATION & CATALOG EXPANSION COMPLETE!');
    console.log('======================================================\n');
  } finally {
    connection.release();
  }
}

if (require.main === module) {
  migrate().then(() => process.exit(0)).catch(err => {
    console.error('Migration error:', err);
    process.exit(1);
  });
}

module.exports = migrate;
