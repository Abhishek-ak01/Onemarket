/**
 * LocalLoop - Export DB state into js/mock-data.js so mock-data matches MySQL
 */

const fs = require('fs');
const db = require('../config/db');

async function sync() {
  const locs = await db.query('SELECT id, name, pincode FROM locations ORDER BY id ASC');
  const cats = await db.query('SELECT id, name, icon, description FROM categories ORDER BY id ASC');
  const shops = await db.query('SELECT id, name, category, area, address, description, CAST(rating AS FLOAT) as rating, reviews_count as reviewsCount, image, phone, timing FROM shops ORDER BY id ASC');
  const prods = await db.query('SELECT p.id, p.name, p.category, p.shop_id as shopId, s.name as shopName, s.area as shopArea, CAST(p.price AS DOUBLE) as price, CAST(COALESCE(p.original_price, p.price * 1.25) AS DOUBLE) as originalPrice, COALESCE(p.discount_percent, 20) as discountPercent, p.stock, CAST(p.rating AS FLOAT) as rating, p.reviews_count as reviewsCount, p.description, p.attributes, p.tags, p.image, p.is_featured as isFeatured, p.is_active as isActive FROM products p LEFT JOIN shops s ON p.shop_id = s.id ORDER BY p.id ASC');

  const formattedProds = prods.map(p => {
    let attrs = p.attributes;
    if (typeof attrs === 'string') try { attrs = JSON.parse(attrs); } catch (e) { attrs = {}; }
    let tags = p.tags;
    if (typeof tags === 'string') try { tags = JSON.parse(tags); } catch (e) { tags = []; }

    const price = Number(p.price);
    const origPrice = Number(p.originalPrice) || Math.round(price * 1.25);
    const disc = Number(p.discountPercent) || Math.round(((origPrice - price) / origPrice) * 100);

    return {
      id: p.id,
      name: p.name,
      category: p.category,
      shopId: p.shopId,
      shopName: p.shopName || '',
      shopArea: p.shopArea || '',
      price,
      originalPrice: origPrice,
      discountPercent: disc,
      stock: p.stock,
      rating: p.rating,
      reviewsCount: p.reviewsCount,
      description: p.description,
      attributes: attrs || {},
      tags: tags || [],
      image: p.image,
      isFeatured: Boolean(p.isFeatured),
      isActive: Boolean(p.isActive !== undefined ? p.isActive : 1)
    };
  });

  const demoUsers = [
    { id: 'user-cust-1', name: 'Aditi Rao', email: 'customer@localloop.in', role: 'customer', phone: '+91 98450 12345', address: 'Flat 402, Green Palms Apts, Koppikar Road', city: 'Hubballi', pincode: '580020' },
    { id: 'user-cust-2', name: 'Rohan Mehra', email: 'rohan@localloop.in', role: 'customer', phone: '+91 98802 99881', address: 'Villa 18, Vidyanagar, Hubballi', city: 'Hubballi', pincode: '580021' },
    { id: 'user-sell-1', name: 'Narayanan Nambiar', email: 'seller@malabarspices.in', role: 'seller', shopId: 'shop-1', phone: '+91 98451 22345', address: 'Koppikar Road Market, Near Durgadbail, Hubballi' },
    { id: 'user-sell-2', name: 'Vikramaditya Hegde', email: 'seller@apextech.in', role: 'seller', shopId: 'shop-2', phone: '+91 98802 33411', address: 'Opp. KLE Tech University, Vidyanagar, Hubballi' },
    { id: 'user-sell-3', name: 'Ananya Sharma', email: 'seller@voguecraft.in', role: 'seller', shopId: 'shop-3', phone: '+91 97412 88902', address: 'Near Cotton Market, Koppikar Road, Hubballi' },
    { id: 'user-sell-4', name: 'Murali Krishna', email: 'seller@saraswatibooks.in', role: 'seller', shopId: 'shop-4', phone: '+91 98440 11988', address: 'Kusugal Road, Keshwapur, Hubballi' },
    { id: 'user-sell-5', name: 'Sunita Reddy', email: 'seller@prakritihome.in', role: 'seller', shopId: 'shop-5', phone: '+91 99003 44521', address: 'Shirur Park 2nd Cross, Vidyanagar, Hubballi' },
    { id: 'user-sell-6', name: 'Dr. Meenakshi Iyer', email: 'seller@vedabotanics.in', role: 'seller', shopId: 'shop-6', phone: '+91 96118 77203', address: 'Near Airport Bypass, Gokul Road, Hubballi' },
    { id: 'user-sell-7', name: 'Karthik Gowda', email: 'seller@decapulse.in', role: 'seller', shopId: 'shop-7', phone: '+91 98860 45678', address: 'Unkal Lake Promenade, PB Road, Hubballi' }
  ];

  const content = `/**
 * OneMarket - Synchronized Mock Seed Data (Reflects MySQL DB)
 */

const DEMO_LOCATIONS = ${JSON.stringify(locs, null, 2)};

const CATEGORIES = ${JSON.stringify(cats, null, 2)};

const INITIAL_SHOPS = ${JSON.stringify(shops, null, 2)};

const DEMO_USERS = ${JSON.stringify(demoUsers, null, 2)};

const INITIAL_PRODUCTS = ${JSON.stringify(formattedProds, null, 2)};

const INITIAL_ORDERS = [
  {
    id: "LL-2026-1042",
    userId: "user-cust-1",
    date: "2026-10-21T14:32:00.000Z",
    customer: { name: "Aditi Rao", phone: "9845012345", address: "Flat 402, Green Palms Apts, Koppikar Road, Hubballi", deliveryPreference: "delivery", notes: "Please ring the doorbell twice. Demo order." },
    paymentMethod: "Cash on Delivery (Demo)",
    paymentStatus: "Pending",
    items: [
      { productId: "prod-101", name: "Wayanad Cardamom Pods (Grade 8mm)", category: "Groceries", price: 340, originalPrice: 425, discount: 85, quantity: 2, shopId: "shop-1", shopName: "Malabar Heritage Spices & Pantry", image: "assets/product-images/prod-101.jpg" },
      { productId: "prod-601", name: "Neem & Tulsi Cold-Processed Bathing Bar", category: "Personal Care", price: 180, originalPrice: 225, discount: 45, quantity: 1, shopId: "shop-6", shopName: "Veda Botanics & Apothecary", image: "assets/product-images/prod-601.jpg" }
    ],
    subtotal: 860, deliveryFee: 0, taxes: 43, total: 903, status: "Completed",
    statusHistory: [
      { status: "Confirmed", timestamp: "2026-10-21T14:32:00.000Z" },
      { status: "Packed", timestamp: "2026-10-21T14:45:00.000Z" },
      { status: "Delivered", timestamp: "2026-10-21T16:10:00.000Z" }
    ]
  },
  {
    id: "LL-2026-1043",
    userId: "user-cust-2",
    date: "2026-10-22T11:15:00.000Z",
    customer: { name: "Rohan Mehra", phone: "9880299881", address: "Villa 18, Vidyanagar, Hubballi", deliveryPreference: "pickup", notes: "Will pick up in the evening around 6 PM." },
    paymentMethod: "Demo UPI",
    paymentStatus: "Demo Payment Successful",
    items: [
      { productId: "prod-201", name: "BoltStream 65W GaN Fast Wall Charger", category: "Electronics", price: 1899, originalPrice: 2374, discount: 475, quantity: 1, shopId: "shop-2", shopName: "Apex Tech & Gadget Hub", image: "assets/product-images/prod-201.jpg" }
    ],
    subtotal: 1899, deliveryFee: 0, taxes: 95, total: 1994, status: "Accepted",
    statusHistory: [
      { status: "Confirmed", timestamp: "2026-10-22T11:15:00.000Z" },
      { status: "Packed", timestamp: "2026-10-22T11:30:00.000Z" }
    ]
  }
];

const LOW_STOCK_THRESHOLD = 3;
`;;

  fs.writeFileSync('js/mock-data.js', content, 'utf8');
  console.log(`✓ Synchronized js/mock-data.js with ${formattedProds.length} products, ${shops.length} shops, ${cats.length} categories.`);
}

sync().then(() => process.exit(0)).catch(err => {
  console.error(err);
  process.exit(1);
});
