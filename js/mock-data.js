/**
 * OneMarket - Synchronized Mock Seed Data (Reflects MySQL DB)
 */

const DEMO_LOCATIONS = [
  {
    "id": "loc-1",
    "name": "Koppikar Road, Hubballi",
    "pincode": "580020"
  },
  {
    "id": "loc-2",
    "name": "Vidyanagar, Hubballi",
    "pincode": "580021"
  },
  {
    "id": "loc-3",
    "name": "Gokul Road, Hubballi",
    "pincode": "580030"
  },
  {
    "id": "loc-4",
    "name": "Keshwapur, Hubballi",
    "pincode": "580023"
  },
  {
    "id": "loc-5",
    "name": "Unkal, Hubballi",
    "pincode": "580031"
  },
  {
    "id": "loc-6",
    "name": "Shirur Park, Hubballi",
    "pincode": "580021"
  }
];

const CATEGORIES = [
  {
    "id": "cat-books",
    "name": "Books & Stationery",
    "icon": "books",
    "description": "Local publishers, journals & archival fountain pens"
  },
  {
    "id": "cat-care",
    "name": "Personal Care",
    "icon": "care",
    "description": "Ayurvedic soaps, cold-pressed oils & natural grooming"
  },
  {
    "id": "cat-electronics",
    "name": "Electronics",
    "icon": "electronics",
    "description": "Gadgets, chargers, audio & smart home accessories"
  },
  {
    "id": "cat-fashion",
    "name": "Fashion",
    "icon": "fashion",
    "description": "Khadi cotton, handcrafted apparel & daily accessories"
  },
  {
    "id": "cat-groceries",
    "name": "Groceries",
    "icon": "groceries",
    "description": "Fresh spices, organic staples & gourmet condiments"
  },
  {
    "id": "cat-home",
    "name": "Home & Living",
    "icon": "home",
    "description": "Terracotta ceramics, brassware & organic textiles"
  },
  {
    "id": "cat-sports",
    "name": "Sports & Lifestyle",
    "icon": "sports",
    "description": "Yoga mats, badminton gear, fitness accessories & active wear"
  }
];

const INITIAL_SHOPS = [
  {
    "id": "shop-1",
    "name": "Malabar Heritage Spices & Pantry",
    "category": "Groceries",
    "area": "Koppikar Road",
    "address": "Koppikar Road Market, Near Durgadbail, Hubballi - 580020",
    "description": "Specialty family-owned grocer sourcing single-origin spices, cold-pressed oils, and traditional grains directly from southern farms.",
    "rating": 4.800000190734863,
    "reviewsCount": 142,
    "image": "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=600&q=80",
    "phone": "+91 98451 22345",
    "timing": "8:30 AM - 9:00 PM"
  },
  {
    "id": "shop-2",
    "name": "Apex Tech & Gadget Hub",
    "category": "Electronics",
    "area": "Vidyanagar",
    "address": "Opp. KLE Tech University, Vidyanagar, Hubballi - 580021",
    "description": "Trusted neighbourhood electronics store offering warranty-backed tech accessories, audio gear, cables, and smart home essentials.",
    "rating": 4.699999809265137,
    "reviewsCount": 98,
    "image": "https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=600&q=80",
    "phone": "+91 98802 33411",
    "timing": "10:00 AM - 9:30 PM"
  },
  {
    "id": "shop-3",
    "name": "Vogue Craft & Handloom Studio",
    "category": "Fashion",
    "area": "Koppikar Road",
    "address": "Near Cotton Market, Koppikar Road, Hubballi - 580020",
    "description": "Boutique studio celebrating Karnataka and South Indian handloom weaves, pure cotton everyday wear, and eco-conscious canvas totes.",
    "rating": 4.900000095367432,
    "reviewsCount": 76,
    "image": "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=600&q=80",
    "phone": "+91 97412 88902",
    "timing": "10:30 AM - 8:30 PM"
  },
  {
    "id": "shop-4",
    "name": "Saraswati Book Haven & Fine Papers",
    "category": "Books & Stationery",
    "area": "Keshwapur",
    "address": "Kusugal Road, Keshwapur, Hubballi - 580023",
    "description": "Iconic independent bookstore carrying Indian literature, academic titles, vintage fountain pen inks, and handmade cotton journals.",
    "rating": 4.900000095367432,
    "reviewsCount": 210,
    "image": "https://images.unsplash.com/photo-1507842229450-79779f62a6b2?auto=format&fit=crop&w=600&q=80",
    "phone": "+91 98440 11988",
    "timing": "9:30 AM - 8:30 PM"
  },
  {
    "id": "shop-5",
    "name": "Prakriti Home & Sustainable Living",
    "category": "Home & Living",
    "area": "Shirur Park",
    "address": "Shirur Park 2nd Cross, Vidyanagar, Hubballi - 580021",
    "description": "Conscious home lifestyle store curating artisanal terracotta planters, brass decor, soy wax aromatherapy candles, and handwoven mats.",
    "rating": 4.599999904632568,
    "reviewsCount": 65,
    "image": "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80",
    "phone": "+91 99003 44521",
    "timing": "10:00 AM - 8:00 PM"
  },
  {
    "id": "shop-6",
    "name": "Veda Botanics & Apothecary",
    "category": "Personal Care",
    "area": "Gokul Road",
    "address": "Near Airport Bypass, Gokul Road, Hubballi - 580030",
    "description": "Clean personal care apothecary formulating small-batch herbal soaps, pure floral hydrosols, and therapeutic scalp elixirs.",
    "rating": 4.800000190734863,
    "reviewsCount": 114,
    "image": "https://images.unsplash.com/photo-1608248597359-54848378216c?auto=format&fit=crop&w=600&q=80",
    "phone": "+91 96118 77203",
    "timing": "10:00 AM - 9:00 PM"
  },
  {
    "id": "shop-7",
    "name": "DecaPulse Sports & Outdoor Hub",
    "category": "Sports & Lifestyle",
    "area": "Unkal",
    "address": "Unkal Lake Promenade, PB Road, Hubballi - 580031",
    "description": "Neighbourhood destination for high-grade badminton rackets, eco-friendly cork yoga mats, cycling gear, and endurance fitness accessories.",
    "rating": 4.800000190734863,
    "reviewsCount": 89,
    "image": "https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=600&q=80",
    "phone": "+91 98860 45678",
    "timing": "9:00 AM - 9:30 PM"
  }
];

const DEMO_USERS = [
  {
    "id": "user-cust-1",
    "name": "Aditi Rao",
    "email": "customer@localloop.in",
    "role": "customer",
    "phone": "+91 98450 12345",
    "address": "Flat 402, Green Palms Apts, Koppikar Road",
    "city": "Hubballi",
    "pincode": "580020"
  },
  {
    "id": "user-cust-2",
    "name": "Rohan Mehra",
    "email": "rohan@localloop.in",
    "role": "customer",
    "phone": "+91 98802 99881",
    "address": "Villa 18, Vidyanagar, Hubballi",
    "city": "Hubballi",
    "pincode": "580021"
  },
  {
    "id": "user-sell-1",
    "name": "Narayanan Nambiar",
    "email": "seller@malabarspices.in",
    "role": "seller",
    "shopId": "shop-1",
    "phone": "+91 98451 22345",
    "address": "Koppikar Road Market, Near Durgadbail, Hubballi"
  },
  {
    "id": "user-sell-2",
    "name": "Vikramaditya Hegde",
    "email": "seller@apextech.in",
    "role": "seller",
    "shopId": "shop-2",
    "phone": "+91 98802 33411",
    "address": "Opp. KLE Tech University, Vidyanagar, Hubballi"
  },
  {
    "id": "user-sell-3",
    "name": "Ananya Sharma",
    "email": "seller@voguecraft.in",
    "role": "seller",
    "shopId": "shop-3",
    "phone": "+91 97412 88902",
    "address": "Near Cotton Market, Koppikar Road, Hubballi"
  },
  {
    "id": "user-sell-4",
    "name": "Murali Krishna",
    "email": "seller@saraswatibooks.in",
    "role": "seller",
    "shopId": "shop-4",
    "phone": "+91 98440 11988",
    "address": "Kusugal Road, Keshwapur, Hubballi"
  },
  {
    "id": "user-sell-5",
    "name": "Sunita Reddy",
    "email": "seller@prakritihome.in",
    "role": "seller",
    "shopId": "shop-5",
    "phone": "+91 99003 44521",
    "address": "Shirur Park 2nd Cross, Vidyanagar, Hubballi"
  },
  {
    "id": "user-sell-6",
    "name": "Dr. Meenakshi Iyer",
    "email": "seller@vedabotanics.in",
    "role": "seller",
    "shopId": "shop-6",
    "phone": "+91 96118 77203",
    "address": "Near Airport Bypass, Gokul Road, Hubballi"
  },
  {
    "id": "user-sell-7",
    "name": "Karthik Gowda",
    "email": "seller@decapulse.in",
    "role": "seller",
    "shopId": "shop-7",
    "phone": "+91 98860 45678",
    "address": "Unkal Lake Promenade, PB Road, Hubballi"
  }
];

const INITIAL_PRODUCTS = [
  {
    "id": "prod-101",
    "name": "Wayanad Cardamom Pods (Grade 8mm)",
    "category": "Groceries",
    "shopId": "shop-1",
    "shopName": "Malabar Heritage Spices & Pantry",
    "shopArea": "Koppikar Road",
    "price": 10,
    "originalPrice": 425,
    "discountPercent": 20,
    "stock": 18,
    "rating": 4.900000095367432,
    "reviewsCount": 38,
    "description": "Sun-dried jumbo green cardamom pods sourced from Wayanad estates. Intensely aromatic, ideal for traditional desserts, biryanis, and spiced chai.",
    "attributes": {
      "Origin": "Wayanad, Kerala",
      "Net Weight": "100g",
      "Processing": "Hand-picked, sun dried",
      "Shelf Life": "12 Months"
    },
    "tags": [
      "spices",
      "organic",
      "chai",
      "aromatic"
    ],
    "image": "assets/product-images/prod-101.jpg",
    "isFeatured": true,
    "isActive": true
  },
  {
    "id": "prod-102",
    "name": "Cold-Pressed Sesame Oil (Wood Churned)",
    "category": "Groceries",
    "shopId": "shop-1",
    "shopName": "Malabar Heritage Spices & Pantry",
    "shopArea": "Koppikar Road",
    "price": 290,
    "originalPrice": 363,
    "discountPercent": 20,
    "stock": 4,
    "rating": 4.699999809265137,
    "reviewsCount": 24,
    "description": "Traditional wood-pressed (marachekku) sesame oil extracted at room temperature with palm jaggery. Rich in antioxidants and healthy fatty acids.",
    "attributes": {
      "Volume": "500ml",
      "Extraction": "Cold Wood Churned",
      "Shelf Life": "9 Months",
      "Preservatives": "Zero additives"
    },
    "tags": [
      "oil",
      "cooking",
      "healthy",
      "traditional"
    ],
    "image": "assets/product-images/prod-102.jpg",
    "isFeatured": false,
    "isActive": true
  },
  {
    "id": "prod-103",
    "name": "Organic Tellicherry Black Peppercorns",
    "category": "Groceries",
    "shopId": "shop-1",
    "shopName": "Malabar Heritage Spices & Pantry",
    "shopArea": "Koppikar Road",
    "price": 195,
    "originalPrice": 244,
    "discountPercent": 20,
    "stock": 22,
    "rating": 4.800000190734863,
    "reviewsCount": 19,
    "description": "World-renowned Tellicherry extra bold black pepper. Offers warm pungency and complex citrus notes when freshly cracked over dishes.",
    "attributes": {
      "Grade": "TGSEB Extra Bold",
      "Origin": "Thalassery, Kerala",
      "Harvest": "Late Season",
      "Net Weight": "150g"
    },
    "tags": [
      "spices",
      "pepper",
      "cooking"
    ],
    "image": "assets/product-images/prod-103.jpg",
    "isFeatured": false,
    "isActive": true
  },
  {
    "id": "prod-104",
    "name": "Raw Coorg Forest Wild Honey",
    "category": "Groceries",
    "shopId": "shop-1",
    "shopName": "Malabar Heritage Spices & Pantry",
    "shopArea": "Koppikar Road",
    "price": 450,
    "originalPrice": 563,
    "discountPercent": 20,
    "stock": 3,
    "rating": 4.900000095367432,
    "reviewsCount": 52,
    "description": "Unprocessed, multi-floral raw honey collected by tribal cooperatives in the Western Ghats forests. Naturally crystallized and unheated.",
    "attributes": {
      "Origin": "Coorg, Karnataka",
      "Purity": "100% Raw Unpasteurized",
      "Net Weight": "400g",
      "FSSAI Certified": "Yes"
    },
    "tags": [
      "honey",
      "organic",
      "sweetener",
      "immunity"
    ],
    "image": "assets/product-images/prod-104.jpg",
    "isFeatured": true,
    "isActive": true
  },
  {
    "id": "prod-105",
    "name": "Handcrafted Filter Coffee Blend (80:20)",
    "category": "Groceries",
    "shopId": "shop-1",
    "shopName": "Malabar Heritage Spices & Pantry",
    "shopArea": "Koppikar Road",
    "price": 240,
    "originalPrice": 300,
    "discountPercent": 20,
    "stock": 0,
    "rating": 4.900000095367432,
    "reviewsCount": 67,
    "description": "Freshly roasted Chikmagalur Arabica and Robusta beans blended with 20% high-grade chicory for that authentic South Indian decoction aroma.",
    "attributes": {
      "Blend": "80% Coffee, 20% Chicory",
      "Net Weight": "250g",
      "Bean Origin": "Chikmagalur",
      "Roast Level": "Dark Roast"
    },
    "tags": [
      "coffee",
      "filter coffee",
      "beverages",
      "chikmagalur"
    ],
    "image": "assets/product-images/prod-105.jpg",
    "isFeatured": false,
    "isActive": true
  },
  {
    "id": "prod-106",
    "name": "Single Estate Coorg Arabica Coffee Beans (Medium Roast)",
    "category": "Groceries",
    "shopId": "shop-1",
    "shopName": "Malabar Heritage Spices & Pantry",
    "shopArea": "Koppikar Road",
    "price": 360,
    "originalPrice": 450,
    "discountPercent": 20,
    "stock": 14,
    "rating": 4.800000190734863,
    "reviewsCount": 29,
    "description": "Shade-grown 100% Arabica coffee beans hand-picked from Coorg hillside estates. Balanced medium roast with hazelnut and caramelized cane sugar notes.",
    "attributes": {
      "Roast": "Medium",
      "Altitude": "1100m",
      "Net Weight": "250g Whole Bean",
      "Flavour Notes": "Nutty, Cocoa, Cane Sugar"
    },
    "tags": [
      "coffee",
      "arabica",
      "coorg",
      "artisanal"
    ],
    "image": "assets/product-images/prod-106.jpg",
    "isFeatured": true,
    "isActive": true
  },
  {
    "id": "prod-107",
    "name": "Organic Salem Turmeric Powder (Curcumin 5%)",
    "category": "Groceries",
    "shopId": "shop-1",
    "shopName": "Malabar Heritage Spices & Pantry",
    "shopArea": "Koppikar Road",
    "price": 160,
    "originalPrice": 200,
    "discountPercent": 20,
    "stock": 25,
    "rating": 4.900000095367432,
    "reviewsCount": 34,
    "description": "Naturally cultivated Salem heirloom turmeric with certified 5% active curcumin potency. Ground in stone mills without artificial colorants.",
    "attributes": {
      "Origin": "Salem, TN",
      "Curcumin": "5% Certified",
      "Net Weight": "200g",
      "Cultivation": "Chemical-free heirloom"
    },
    "tags": [
      "spices",
      "turmeric",
      "curcumin",
      "immunity"
    ],
    "image": "assets/product-images/prod-107.jpg",
    "isFeatured": false,
    "isActive": true
  },
  {
    "id": "prod-201",
    "name": "BoltStream 65W GaN Fast Wall Charger",
    "category": "Electronics",
    "shopId": "shop-2",
    "shopName": "Apex Tech & Gadget Hub",
    "shopArea": "Vidyanagar",
    "price": 1899,
    "originalPrice": 2374,
    "discountPercent": 20,
    "stock": 14,
    "rating": 4.800000190734863,
    "reviewsCount": 43,
    "description": "Ultra-compact Gallium Nitride dual Type-C and USB-A wall charger capable of powering laptops, tablets, and flagship smartphones at peak speed.",
    "attributes": {
      "Ports": "2x USB-C, 1x USB-A",
      "Warranty": "1 Year Seller Replacement",
      "Technology": "GaN III",
      "Power Output": "65W Max"
    },
    "tags": [
      "charger",
      "usb-c",
      "laptop",
      "gan"
    ],
    "image": "assets/product-images/prod-201.jpg",
    "isFeatured": true,
    "isActive": true
  },
  {
    "id": "prod-202",
    "name": "AcousticPure Wireless Earbuds (ANC)",
    "category": "Electronics",
    "shopId": "shop-2",
    "shopName": "Apex Tech & Gadget Hub",
    "shopArea": "Vidyanagar",
    "price": 2799,
    "originalPrice": 3499,
    "discountPercent": 20,
    "stock": 8,
    "rating": 4.599999904632568,
    "reviewsCount": 31,
    "description": "Active Noise Cancellation true wireless earbuds featuring 10mm titanium drivers, 32-hour playback battery case, and IPX5 splash resistance.",
    "attributes": {
      "Driver Size": "10mm Dynamic",
      "Battery Life": "32 Hours Total",
      "Connectivity": "Bluetooth 5.3",
      "Noise Control": "Hybrid ANC 28dB"
    },
    "tags": [
      "audio",
      "earbuds",
      "wireless",
      "anc"
    ],
    "image": "assets/product-images/prod-202.jpg",
    "isFeatured": true,
    "isActive": true
  },
  {
    "id": "prod-203",
    "name": "Braided 2M Type-C to Type-C 100W Cable",
    "category": "Electronics",
    "shopId": "shop-2",
    "shopName": "Apex Tech & Gadget Hub",
    "shopArea": "Vidyanagar",
    "price": 499,
    "originalPrice": 624,
    "discountPercent": 20,
    "stock": 25,
    "rating": 4.5,
    "reviewsCount": 18,
    "description": "Heavy-duty Kevlar-reinforced braided cable certified for Power Delivery 3.0 up to 100W with reinforced strain relief collars.",
    "attributes": {
      "Jacket": "Nylon Braided",
      "Length": "2 Metres",
      "Data Speed": "480 Mbps",
      "Power Delivery": "100W (20V/5A)"
    },
    "tags": [
      "cable",
      "usb-c",
      "charging",
      "accessories"
    ],
    "image": "assets/product-images/prod-203.jpg",
    "isFeatured": false,
    "isActive": true
  },
  {
    "id": "prod-204",
    "name": "Smart RGB Desk Ambient Light Bar",
    "category": "Electronics",
    "shopId": "shop-2",
    "shopName": "Apex Tech & Gadget Hub",
    "shopArea": "Vidyanagar",
    "price": 1450,
    "originalPrice": 1813,
    "discountPercent": 20,
    "stock": 2,
    "rating": 4.699999809265137,
    "reviewsCount": 15,
    "description": "Monitor-mounted or desk-standing smart light bar with sound-reactive music syncing and customizable warm-to-cool workspace illumination.",
    "attributes": {
      "Input": "USB 5V/2A",
      "Control": "Touch + App",
      "Lighting": "16M RGB + 2700K-6500K CCT",
      "Mounting": "Weighted Base"
    },
    "tags": [
      "lighting",
      "smart home",
      "desk setup",
      "gadget"
    ],
    "image": "assets/product-images/prod-204.jpg",
    "isFeatured": false,
    "isActive": true
  },
  {
    "id": "prod-205",
    "name": "Precision Aluminum Laptop Riser Stand",
    "category": "Electronics",
    "shopId": "shop-2",
    "shopName": "Apex Tech & Gadget Hub",
    "shopArea": "Vidyanagar",
    "price": 1199,
    "originalPrice": 1499,
    "discountPercent": 20,
    "stock": 9,
    "rating": 4.800000190734863,
    "reviewsCount": 27,
    "description": "Ergonomic CNC-machined sandblasted aluminum stand supporting laptops up to 16 inches. Improves airflow and posture during work hours.",
    "attributes": {
      "Weight": "420g",
      "Foldable": "Yes",
      "Material": "Anodized Aluminum Alloy",
      "Compatibility": "11 to 16 inch laptops"
    },
    "tags": [
      "laptop stand",
      "ergonomics",
      "work from home"
    ],
    "image": "assets/product-images/prod-205.jpg",
    "isFeatured": false,
    "isActive": true
  },
  {
    "id": "prod-206",
    "name": "Ergonomic Vertical Silent Wireless Mouse",
    "category": "Electronics",
    "shopId": "shop-2",
    "shopName": "Apex Tech & Gadget Hub",
    "shopArea": "Vidyanagar",
    "price": 999,
    "originalPrice": 1299,
    "discountPercent": 23,
    "stock": 11,
    "rating": 4.699999809265137,
    "reviewsCount": 38,
    "description": "Natural handshake 57-degree vertical ergonomic mouse designed to alleviate wrist strain. Silent click switches with adjustable DPI up to 2400.",
    "attributes": {
      "Weight": "110g",
      "Battery": "Rechargeable 500mAh",
      "DPI Levels": "800/1200/1600/2400",
      "Connectivity": "2.4GHz USB + Bluetooth 5.0"
    },
    "tags": [
      "mouse",
      "ergonomics",
      "desk setup",
      "wireless"
    ],
    "image": "assets/product-images/prod-206.jpg",
    "isFeatured": true,
    "isActive": true
  },
  {
    "id": "prod-207",
    "name": "Magnetic MagSafe Wireless Power Bank (10000mAh)",
    "category": "Electronics",
    "shopId": "shop-2",
    "shopName": "Apex Tech & Gadget Hub",
    "shopArea": "Vidyanagar",
    "price": 2199,
    "originalPrice": 2799,
    "discountPercent": 21,
    "stock": 9,
    "rating": 4.800000190734863,
    "reviewsCount": 22,
    "description": "Snap-on magnetic 15W fast wireless battery pack with 20W PD Type-C bi-directional port. Soft silicone anti-scratch backing with LED power level display.",
    "attributes": {
      "Capacity": "10000mAh",
      "Wired Output": "20W PD",
      "Wireless Output": "15W Max",
      "Pass-Through Charging": "Supported"
    },
    "tags": [
      "power bank",
      "magsafe",
      "wireless",
      "portable"
    ],
    "image": "assets/product-images/prod-207.jpg",
    "isFeatured": false,
    "isActive": true
  },
  {
    "id": "prod-301",
    "name": "Handspun Khadi Cotton Mandarin Kurta",
    "category": "Fashion",
    "shopId": "shop-3",
    "shopName": "Vogue Craft & Handloom Studio",
    "shopArea": "Koppikar Road",
    "price": 1290,
    "originalPrice": 1613,
    "discountPercent": 20,
    "stock": 6,
    "rating": 4.900000095367432,
    "reviewsCount": 41,
    "description": "Breathable, hand-spun and hand-woven pure khadi cotton shirt kurta in indigo weave. Features wooden buttons and side welt pockets.",
    "attributes": {
      "Dye": "Natural Indigo",
      "Fit": "Relaxed Comfort Fit",
      "Fabric": "100% Handloom Khadi Cotton",
      "Wash Care": "Gentle Hand Wash"
    },
    "tags": [
      "khadi",
      "handloom",
      "apparel",
      "cotton",
      "sustainable"
    ],
    "image": "assets/product-images/prod-301.jpg",
    "isFeatured": true,
    "isActive": true
  },
  {
    "id": "prod-302",
    "name": "Handmade Canvas & Jute Everyday Tote",
    "category": "Fashion",
    "shopId": "shop-3",
    "shopName": "Vogue Craft & Handloom Studio",
    "shopArea": "Koppikar Road",
    "price": 650,
    "originalPrice": 813,
    "discountPercent": 20,
    "stock": 16,
    "rating": 4.699999809265137,
    "reviewsCount": 22,
    "description": "Spacious heavy-gauge unbleached canvas tote with vegetable-tanned leather handles and an internal zip pocket for daily essentials.",
    "attributes": {
      "Closure": "Magnetic snap",
      "Capacity": "15 Litres",
      "Material": "14oz Cotton Canvas + Leather handles",
      "Dimensions": "38cm x 35cm x 10cm"
    },
    "tags": [
      "tote bag",
      "canvas",
      "eco friendly",
      "accessories"
    ],
    "image": "assets/product-images/prod-302.jpg",
    "isFeatured": false,
    "isActive": true
  },
  {
    "id": "prod-303",
    "name": "Kalamkari Handblock Print Dupatta",
    "category": "Fashion",
    "shopId": "shop-3",
    "shopName": "Vogue Craft & Handloom Studio",
    "shopArea": "Koppikar Road",
    "price": 890,
    "originalPrice": 1113,
    "discountPercent": 20,
    "stock": 2,
    "rating": 4.800000190734863,
    "reviewsCount": 16,
    "description": "Authentic Machilipatnam Kalamkari printed soft Chanderi silk-cotton scarf with heritage floral creepers and hand-knotted tassels.",
    "attributes": {
      "Dyes": "Vegetable derived",
      "Craft": "Kalamkari Wooden Block Print",
      "Fabric": "Chanderi Cotton Silk",
      "Length": "2.4 Metres"
    },
    "tags": [
      "kalamkari",
      "dupatta",
      "traditional",
      "artisan"
    ],
    "image": "assets/product-images/prod-303.jpg",
    "isFeatured": false,
    "isActive": true
  },
  {
    "id": "prod-304",
    "name": "Genuine Leather Minimalist Bifold Wallet",
    "category": "Fashion",
    "shopId": "shop-3",
    "shopName": "Vogue Craft & Handloom Studio",
    "shopArea": "Koppikar Road",
    "price": 990,
    "originalPrice": 1238,
    "discountPercent": 20,
    "stock": 11,
    "rating": 4.599999904632568,
    "reviewsCount": 19,
    "description": "Slim hand-stitched full-grain crazy horse leather wallet with RFID blocking lining, 6 card slots, and an easy-access currency sleeve.",
    "attributes": {
      "Finish": "Vintage Tan",
      "Material": "Full-Grain Vegetable Tanned Leather",
      "Card Capacity": "8-10 Cards",
      "RFID Blocking": "Yes"
    },
    "tags": [
      "wallet",
      "leather",
      "accessories",
      "gift"
    ],
    "image": "assets/product-images/prod-304.jpg",
    "isFeatured": false,
    "isActive": true
  },
  {
    "id": "prod-305",
    "name": "Handcrafted Brass & Silver Temple Pendant Necklace",
    "category": "Fashion",
    "shopId": "shop-3",
    "shopName": "Vogue Craft & Handloom Studio",
    "shopArea": "Koppikar Road",
    "price": 1450,
    "originalPrice": 1800,
    "discountPercent": 19,
    "stock": 5,
    "rating": 4.900000095367432,
    "reviewsCount": 17,
    "description": "Antique oxidized finish pendant handcrafted by traditional Udupi metalsmiths. Embellished with semi-precious kemp cabochons on an adjustable silk cord.",
    "attributes": {
      "Care": "Wipe dry",
      "Cord": "Black woven silk with tassel",
      "Stones": "Reconstructed Kemp Ruby",
      "Material": "Pure Brass with Silver Dip"
    },
    "tags": [
      "jewellery",
      "handcrafted",
      "temple",
      "brass"
    ],
    "image": "assets/product-images/prod-305.jpg",
    "isFeatured": true,
    "isActive": true
  },
  {
    "id": "prod-306",
    "name": "Pure Linen Relaxed Casual Trousers",
    "category": "Fashion",
    "shopId": "shop-3",
    "shopName": "Vogue Craft & Handloom Studio",
    "shopArea": "Koppikar Road",
    "price": 1890,
    "originalPrice": 2400,
    "discountPercent": 21,
    "stock": 8,
    "rating": 4.800000190734863,
    "reviewsCount": 24,
    "description": "Tailored from breathable 60-lea natural European flax linen. Features an elasticated drawstring waistband, deep slant pockets, and tapered hems.",
    "attributes": {
      "Fit": "Relaxed Tapered",
      "Colour": "Oatmeal Beige",
      "Fabric": "100% Pure Flax Linen",
      "Pockets": "4 Deep Utility Pockets"
    },
    "tags": [
      "linen",
      "trousers",
      "apparel",
      "breathable",
      "sustainable"
    ],
    "image": "assets/product-images/prod-306.jpg",
    "isFeatured": false,
    "isActive": true
  },
  {
    "id": "prod-307",
    "name": "Organic Cotton Indigo Hand-Block Printed Scarf",
    "category": "Fashion",
    "shopId": "shop-3",
    "shopName": "Vogue Craft & Handloom Studio",
    "shopArea": "Koppikar Road",
    "price": 550,
    "originalPrice": 700,
    "discountPercent": 21,
    "stock": 14,
    "rating": 4.699999809265137,
    "reviewsCount": 19,
    "description": "Featherlight mulmul cotton scarf dyed in heritage mud-resist Dabu and natural indigo vats with geometric floral hand-carved woodblocks.",
    "attributes": {
      "Dye": "Organic Fermented Indigo",
      "Edge": "Hand-rolled hems",
      "Fabric": "100% Mulmul Cotton",
      "Length": "1.8 Metres"
    },
    "tags": [
      "scarf",
      "indigo",
      "block print",
      "accessories"
    ],
    "image": "assets/product-images/prod-307.jpg",
    "isFeatured": false,
    "isActive": true
  },
  {
    "id": "prod-401",
    "name": "Hardbound Handmade Cotton Paper Journal (A5)",
    "category": "Books & Stationery",
    "shopId": "shop-4",
    "shopName": "Saraswati Book Haven & Fine Papers",
    "shopArea": "Keshwapur",
    "price": 450,
    "originalPrice": 563,
    "discountPercent": 20,
    "stock": 20,
    "rating": 4.900000095367432,
    "reviewsCount": 35,
    "description": "Artisanal blank journal crafted with deckle-edge 120 GSM recycled cotton rag paper, hand-bound in book-cloth with satin ribbon marker.",
    "attributes": {
      "Pages": "160 Pages (80 Sheets)",
      "Binding": "Smyth Sewn Hardcover",
      "Paper Weight": "120 GSM Deckle Edge",
      "Ink Compatibility": "Fountain Pen Friendly"
    },
    "tags": [
      "journal",
      "stationery",
      "handmade paper",
      "writing"
    ],
    "image": "assets/product-images/prod-401.jpg",
    "isFeatured": true,
    "isActive": true
  },
  {
    "id": "prod-402",
    "name": "Sulekha Archival Fountain Pen Ink (Black - 60ml)",
    "category": "Books & Stationery",
    "shopId": "shop-4",
    "shopName": "Saraswati Book Haven & Fine Papers",
    "shopArea": "Keshwapur",
    "price": 320,
    "originalPrice": 400,
    "discountPercent": 20,
    "stock": 15,
    "rating": 4.800000190734863,
    "reviewsCount": 29,
    "description": "Legendary Indian heritage fountain pen ink with neutral pH and deep archival saturation. Smooth flow without feathering on quality paper.",
    "attributes": {
      "pH": "Neutral 7.0",
      "Color": "Swadeshi Midnight Black",
      "Volume": "60ml Glass Bottle",
      "Water Resistance": "Moderate"
    },
    "tags": [
      "ink",
      "fountain pen",
      "calligraphy",
      "heritage"
    ],
    "image": "assets/product-images/prod-402.jpg",
    "isFeatured": false,
    "isActive": true
  },
  {
    "id": "prod-403",
    "name": "Bangalore: A History of an Indian Metropolis",
    "category": "Books & Stationery",
    "shopId": "shop-4",
    "shopName": "Saraswati Book Haven & Fine Papers",
    "shopArea": "Keshwapur",
    "price": 599,
    "originalPrice": 749,
    "discountPercent": 20,
    "stock": 5,
    "rating": 4.900000095367432,
    "reviewsCount": 44,
    "description": "Richly documented historical exploration of Bengaluru from Kempe Gowda’s mud fort, colonial cantonment to modern tech capital.",
    "attributes": {
      "Author": "Dr. K. Srinivas",
      "Format": "Paperback, 368 Pages",
      "Language": "English",
      "Publisher": "Heritage Press"
    },
    "tags": [
      "books",
      "history",
      "bangalore",
      "reading"
    ],
    "image": "assets/product-images/prod-403.jpg",
    "isFeatured": false,
    "isActive": true
  },
  {
    "id": "prod-404",
    "name": "Solid Brass Hexagonal Pocket Pen",
    "category": "Books & Stationery",
    "shopId": "shop-4",
    "shopName": "Saraswati Book Haven & Fine Papers",
    "shopArea": "Keshwapur",
    "price": 1350,
    "originalPrice": 1688,
    "discountPercent": 20,
    "stock": 3,
    "rating": 4.800000190734863,
    "reviewsCount": 17,
    "description": "Heavyweight machined solid brass pocket pen that develops a unique natural patina over time. Uses standard Schmidt rollerball refills.",
    "attributes": {
      "Body": "Solid Raw Machined Brass",
      "Length": "105mm (closed), 138mm (posted)",
      "Refill": "Schmidt P900 / Parker style",
      "Weight": "54g"
    },
    "tags": [
      "pen",
      "brass",
      "everyday carry",
      "luxury"
    ],
    "image": "assets/product-images/prod-404.jpg",
    "isFeatured": false,
    "isActive": true
  },
  {
    "id": "prod-405",
    "name": "Japanese Steel Calligraphy Dip Pen Set with 5 Nibs",
    "category": "Books & Stationery",
    "shopId": "shop-4",
    "shopName": "Saraswati Book Haven & Fine Papers",
    "shopArea": "Keshwapur",
    "price": 850,
    "originalPrice": 1100,
    "discountPercent": 23,
    "stock": 6,
    "rating": 4.900000095367432,
    "reviewsCount": 21,
    "description": "Ergonomic polished rosewood dip pen holder accompanied by 5 interchangeable precision stainless steel nibs for copperplate and modern calligraphy.",
    "attributes": {
      "Nibs": "5 Stainless Steel Variants",
      "Usage": "Inks, Watercolors, Gouache",
      "Holder": "Natural Polished Rosewood",
      "Packaging": "Kraft Gift Box"
    },
    "tags": [
      "calligraphy",
      "stationery",
      "art",
      "nibs"
    ],
    "image": "assets/product-images/prod-405.jpg",
    "isFeatured": true,
    "isActive": true
  },
  {
    "id": "prod-406",
    "name": "The Trees of Bangalore: A Field Companion Guide",
    "category": "Books & Stationery",
    "shopId": "shop-4",
    "shopName": "Saraswati Book Haven & Fine Papers",
    "shopArea": "Keshwapur",
    "price": 495,
    "originalPrice": 595,
    "discountPercent": 17,
    "stock": 12,
    "rating": 4.900000095367432,
    "reviewsCount": 36,
    "description": "Full-color illustrated handbook classifying over 120 canopy and blooming trees of Bengaluru, documenting blooming seasons and planting folklore.",
    "attributes": {
      "Pages": "240 Color Pages",
      "Format": "Flexi-bound Field Guide",
      "Language": "English",
      "Publisher": "Urban Ecology Trust"
    },
    "tags": [
      "books",
      "nature",
      "bangalore",
      "ecology"
    ],
    "image": "assets/product-images/prod-406.jpg",
    "isFeatured": false,
    "isActive": true
  },
  {
    "id": "prod-407",
    "name": "Handmade Cotton Rag Watercolour Sketchbook (300 GSM Cold Press)",
    "category": "Books & Stationery",
    "shopId": "shop-4",
    "shopName": "Saraswati Book Haven & Fine Papers",
    "shopArea": "Keshwapur",
    "price": 680,
    "originalPrice": 850,
    "discountPercent": 20,
    "stock": 8,
    "rating": 4.800000190734863,
    "reviewsCount": 18,
    "description": "Square 8x8 inch artist sketchbook bound with acid-free 300 GSM deckle-edge 100% cotton paper. Opens 180 degrees flat for panoramic urban sketching.",
    "attributes": {
      "Cover": "Raw Khadi Canvas",
      "Paper": "300 GSM Cold Press 100% Cotton",
      "Sheets": "40 Sheets (80 Pages)",
      "Binding": "Exposed Belgian Stitch"
    },
    "tags": [
      "sketchbook",
      "watercolour",
      "stationery",
      "handmade"
    ],
    "image": "assets/product-images/prod-407.jpg",
    "isFeatured": false,
    "isActive": true
  },
  {
    "id": "prod-501",
    "name": "Handcrafted Terracotta Indoor Planter (7 Inch)",
    "category": "Home & Living",
    "shopId": "shop-5",
    "shopName": "Prakriti Home & Sustainable Living",
    "shopArea": "Shirur Park",
    "price": 380,
    "originalPrice": 475,
    "discountPercent": 20,
    "stock": 14,
    "rating": 4.699999809265137,
    "reviewsCount": 23,
    "description": "Porous unglazed terracotta planter wheel-thrown by Ramanagara artisans. Promotes natural root aeration and includes matching drainage saucer.",
    "attributes": {
      "Craft": "Potters Guild Karnataka",
      "Diameter": "7 Inches (18cm)",
      "Material": "Natural Kiln-Fired Clay",
      "Drainage Hole": "Yes with saucer"
    },
    "tags": [
      "plants",
      "terracotta",
      "decor",
      "gardening"
    ],
    "image": "assets/product-images/prod-501.jpg",
    "isFeatured": true,
    "isActive": true
  },
  {
    "id": "prod-502",
    "name": "Sandalwood & Cardamom Soy Wax Candle",
    "category": "Home & Living",
    "shopId": "shop-5",
    "shopName": "Prakriti Home & Sustainable Living",
    "shopArea": "Shirur Park",
    "price": 520,
    "originalPrice": 650,
    "discountPercent": 20,
    "stock": 19,
    "rating": 4.900000095367432,
    "reviewsCount": 37,
    "description": "Clean-burning 100% natural soy wax candle hand-poured in a reusable amber glass jar. Scented with Mysore sandalwood and green cardamom essential oils.",
    "attributes": {
      "Wax": "Pure Soy Wax",
      "Wick": "Lead-free Cotton Wick",
      "Weight": "220g Net",
      "Burn Time": "40+ Hours"
    },
    "tags": [
      "candle",
      "aromatherapy",
      "home decor",
      "sandalwood"
    ],
    "image": "assets/product-images/prod-502.jpg",
    "isFeatured": false,
    "isActive": true
  },
  {
    "id": "prod-503",
    "name": "Hand-Hammered Pure Copper Water Bottle (950ml)",
    "category": "Home & Living",
    "shopId": "shop-5",
    "shopName": "Prakriti Home & Sustainable Living",
    "shopArea": "Shirur Park",
    "price": 890,
    "originalPrice": 1113,
    "discountPercent": 20,
    "stock": 6,
    "rating": 4.800000190734863,
    "reviewsCount": 49,
    "description": "Traditional Ayurvedic copper vessel with diamond hammered texture for better grip and leakproof silicone ring seal.",
    "attributes": {
      "Finish": "Hand Hammered",
      "Weight": "290g",
      "Capacity": "950ml",
      "Material": "99.2% Pure Certified Copper"
    },
    "tags": [
      "copper",
      "wellness",
      "water bottle",
      "ayurveda"
    ],
    "image": "assets/product-images/prod-503.jpg",
    "isFeatured": true,
    "isActive": true
  },
  {
    "id": "prod-504",
    "name": "Traditional Brass Diya Oil Lamp (Set of 2)",
    "category": "Home & Living",
    "shopId": "shop-5",
    "shopName": "Prakriti Home & Sustainable Living",
    "shopArea": "Shirur Park",
    "price": 680,
    "originalPrice": 850,
    "discountPercent": 20,
    "stock": 0,
    "rating": 4.599999904632568,
    "reviewsCount": 18,
    "description": "Cast solid brass tabletop diyas with ornate peacock finial. Perfect for daily festive rituals and serene ambient evening light.",
    "attributes": {
      "Height": "12cm Each",
      "Weight": "480g Total",
      "Material": "Heavy Cast Brass",
      "Set Includes": "2 Matching Lamps"
    },
    "tags": [
      "brass",
      "puja",
      "lamp",
      "festive"
    ],
    "image": "assets/product-images/prod-504.jpg",
    "isFeatured": false,
    "isActive": true
  },
  {
    "id": "prod-505",
    "name": "Hand-Carved Sheesham Wood Serving Platter",
    "category": "Home & Living",
    "shopId": "shop-5",
    "shopName": "Prakriti Home & Sustainable Living",
    "shopArea": "Shirur Park",
    "price": 950,
    "originalPrice": 1200,
    "discountPercent": 21,
    "stock": 6,
    "rating": 4.800000190734863,
    "reviewsCount": 25,
    "description": "Food-safe live edge Indian rosewood serving board hand-planed and conditioned with organic beeswax and cold-pressed walnut oil.",
    "attributes": {
      "Wood": "Sustainably Harvested Sheesham",
      "Finish": "Pure Beeswax & Food Mineral Oil",
      "Handle": "Brass inlay loop",
      "Dimensions": "35cm x 22cm x 2.5cm"
    },
    "tags": [
      "wood",
      "kitchen",
      "home decor",
      "handmade"
    ],
    "image": "assets/product-images/prod-505.jpg",
    "isFeatured": true,
    "isActive": true
  },
  {
    "id": "prod-506",
    "name": "Handwoven Sabai Grass Storage Basket (Set of 2)",
    "category": "Home & Living",
    "shopId": "shop-5",
    "shopName": "Prakriti Home & Sustainable Living",
    "shopArea": "Shirur Park",
    "price": 820,
    "originalPrice": 1050,
    "discountPercent": 22,
    "stock": 10,
    "rating": 4.699999809265137,
    "reviewsCount": 14,
    "description": "Sturdy nesting storage baskets coiled with natural wild sabai grass and cotton cord. Ideal for organizing books, craft supplies, and vanity essentials.",
    "attributes": {
      "Origin": "Mayurbhanj Artisans",
      "Material": "Natural Sabai Grass & Cotton",
      "Set Sizes": "Large (25x15cm) & Medium (20x12cm)",
      "Eco-friendly": "100% Biodegradable"
    },
    "tags": [
      "storage",
      "basket",
      "sustainable",
      "decor"
    ],
    "image": "assets/product-images/prod-506.jpg",
    "isFeatured": false,
    "isActive": true
  },
  {
    "id": "prod-507",
    "name": "Pure Brass Hanging Bell Wind Chime with Peacock Motif",
    "category": "Home & Living",
    "shopId": "shop-5",
    "shopName": "Prakriti Home & Sustainable Living",
    "shopArea": "Shirur Park",
    "price": 740,
    "originalPrice": 900,
    "discountPercent": 18,
    "stock": 8,
    "rating": 4.800000190734863,
    "reviewsCount": 31,
    "description": "Traditional resonant cast brass temple bell with antique verdigris patina. Produces deep meditative resonance when caught by balcony breezes.",
    "attributes": {
      "Weight": "550g",
      "Material": "Pure Bell Metal Brass",
      "Finishing": "Antique Patina",
      "Total Height": "45cm with hanging chain"
    },
    "tags": [
      "brass",
      "bell",
      "wind chime",
      "balcony",
      "decor"
    ],
    "image": "assets/product-images/prod-507.jpg",
    "isFeatured": false,
    "isActive": true
  },
  {
    "id": "prod-601",
    "name": "Neem & Tulsi Cold-Processed Bathing Bar",
    "category": "Personal Care",
    "shopId": "shop-6",
    "shopName": "Veda Botanics & Apothecary",
    "shopArea": "Gokul Road",
    "price": 180,
    "originalPrice": 225,
    "discountPercent": 20,
    "stock": 24,
    "rating": 4.900000095367432,
    "reviewsCount": 58,
    "description": "Gentle clarifying cold-process soap made with raw neem leaf paste, wild holy basil, coconut oil, and nourishing kokum butter.",
    "attributes": {
      "Weight": "125g Bar",
      "Free From": "SLS, Parabens, Palm Oil",
      "Skin Type": "All skin types / acne prone",
      "Key Botanicals": "Wild Neem & Holy Tulsi"
    },
    "tags": [
      "soap",
      "ayurvedic",
      "skincare",
      "natural"
    ],
    "image": "assets/product-images/prod-601.jpg",
    "isFeatured": true,
    "isActive": true
  },
  {
    "id": "prod-602",
    "name": "Bhringraj & Brahmi Herbal Scalp Oil",
    "category": "Personal Care",
    "shopId": "shop-6",
    "shopName": "Veda Botanics & Apothecary",
    "shopArea": "Gokul Road",
    "price": 490,
    "originalPrice": 613,
    "discountPercent": 20,
    "stock": 9,
    "rating": 4.800000190734863,
    "reviewsCount": 33,
    "description": "Slow-infused Ayurvedic hair tonic prepared via taila paka vidhi using organic sesame base, bhringraj herb, amla, and hibiscus blossoms.",
    "attributes": {
      "Method": "Traditional Kshira Paka Infusion",
      "Volume": "150ml Glass Pump",
      "Fragrance": "100% Botanical herbs",
      "Application": "Root massage twice weekly"
    },
    "tags": [
      "haircare",
      "oil",
      "ayurveda",
      "organic"
    ],
    "image": "assets/product-images/prod-602.jpg",
    "isFeatured": false,
    "isActive": true
  },
  {
    "id": "prod-603",
    "name": "Steam-Distilled Kannauj Rose Hydrosol Mist",
    "category": "Personal Care",
    "shopId": "shop-6",
    "shopName": "Veda Botanics & Apothecary",
    "shopArea": "Gokul Road",
    "price": 360,
    "originalPrice": 450,
    "discountPercent": 20,
    "stock": 2,
    "rating": 4.900000095367432,
    "reviewsCount": 42,
    "description": "Pure copper-still distilled hydrosol of Kannauj Damask roses. Instantly tones, calms redness, and hydrates tired skin throughout the day.",
    "attributes": {
      "Volume": "100ml Fine Mist Spray",
      "Botanical": "Rosa Damascena",
      "Distillation": "First steam distillate",
      "Alcohol Content": "0% Alcohol Free"
    },
    "tags": [
      "rose water",
      "toner",
      "facial mist",
      "organic"
    ],
    "image": "assets/product-images/prod-603.jpg",
    "isFeatured": true,
    "isActive": true
  },
  {
    "id": "prod-604",
    "name": "Kokum Butter & Mint Nourishing Lip Butter",
    "category": "Personal Care",
    "shopId": "shop-6",
    "shopName": "Veda Botanics & Apothecary",
    "shopArea": "Gokul Road",
    "price": 195,
    "originalPrice": 244,
    "discountPercent": 20,
    "stock": 13,
    "rating": 4.699999809265137,
    "reviewsCount": 26,
    "description": "Ultra-moisturizing lip balm in an eco-friendly slide tin. Blended with wild kokum butter, cold-pressed almond oil, and refreshing spearmint.",
    "attributes": {
      "Base": "Unrefined Kokum & Beeswax",
      "Flavour": "Subtle Field Mint",
      "Packaging": "100% Recyclable Aluminium",
      "Net Weight": "15g Slide Tin"
    },
    "tags": [
      "lip balm",
      "kokum",
      "natural",
      "moisturizer"
    ],
    "image": "assets/product-images/prod-604.jpg",
    "isFeatured": false,
    "isActive": true
  },
  {
    "id": "prod-605",
    "name": "Wild Himalayan Apricot Kernel Cold-Pressed Facial Oil",
    "category": "Personal Care",
    "shopId": "shop-6",
    "shopName": "Veda Botanics & Apothecary",
    "shopArea": "Gokul Road",
    "price": 650,
    "originalPrice": 800,
    "discountPercent": 19,
    "stock": 13,
    "rating": 4.900000095367432,
    "reviewsCount": 39,
    "description": "Single-press wild apricot oil cold-churned by mountain women cooperatives. Exceptionally rich in Vitamin E and Oleic Acid for deep cellular nourishment.",
    "attributes": {
      "Method": "Cold Stone Pressed",
      "Origin": "Garhwal Himalayas",
      "Volume": "50ml Amber Dropper Bottle",
      "Botanical": "Prunus Armeniaca (Chuli)"
    },
    "tags": [
      "facial oil",
      "skincare",
      "ayurvedic",
      "vitamin e"
    ],
    "image": "assets/product-images/prod-605.jpg",
    "isFeatured": true,
    "isActive": true
  },
  {
    "id": "prod-606",
    "name": "Vetiver & Sandalwood Clarifying Clay Face Ubtan",
    "category": "Personal Care",
    "shopId": "shop-6",
    "shopName": "Veda Botanics & Apothecary",
    "shopArea": "Gokul Road",
    "price": 340,
    "originalPrice": 420,
    "discountPercent": 19,
    "stock": 19,
    "rating": 4.800000190734863,
    "reviewsCount": 27,
    "description": "Micro-pulverized raw Multani Mitti clay blended with khus roots, sandalwood powder, and wild kasturi manjal. Absorbs oil and smooths skin texture.",
    "attributes": {
      "Free From": "Fragrance, Talc, Fillers",
      "Net Weight": "100g Glass Jar",
      "Key Ingredients": "South Indian Vetiver, Pure Sandalwood, Multani Mitti"
    },
    "tags": [
      "face mask",
      "ubtan",
      "ayurveda",
      "sandalwood"
    ],
    "image": "assets/product-images/prod-606.jpg",
    "isFeatured": false,
    "isActive": true
  },
  {
    "id": "prod-607",
    "name": "Organic Rosemary & Cedarwood Botanical Shampoo Bar",
    "category": "Personal Care",
    "shopId": "shop-6",
    "shopName": "Veda Botanics & Apothecary",
    "shopArea": "Gokul Road",
    "price": 240,
    "originalPrice": 300,
    "discountPercent": 20,
    "stock": 16,
    "rating": 4.699999809265137,
    "reviewsCount": 33,
    "description": "Zero-waste concentrated solid hair shampoo bar formulated with soapnuts (reetha), shikakai, rosemary essential oil, and unrefined coconut butter.",
    "attributes": {
      "pH": "Balanced 5.5",
      "Weight": "90g Solid Bar",
      "Packaging": "100% Recycled Paper",
      "Equivalent": "To 2x 250ml liquid shampoo bottles"
    },
    "tags": [
      "shampoo bar",
      "zero waste",
      "haircare",
      "natural"
    ],
    "image": "assets/product-images/prod-607.jpg",
    "isFeatured": false,
    "isActive": true
  },
  {
    "id": "prod-701",
    "name": "Eco-Friendly Natural Tree Rubber & Cork Yoga Mat (6mm)",
    "category": "Sports & Lifestyle",
    "shopId": "shop-7",
    "shopName": "DecaPulse Sports & Outdoor Hub",
    "shopArea": "Unkal",
    "price": 1999,
    "originalPrice": 2600,
    "discountPercent": 23,
    "stock": 12,
    "rating": 4.900000095367432,
    "reviewsCount": 45,
    "description": "Premium non-slip yoga mat made from sustainably harvested Portuguese cork top and high-density biodegradable natural tree rubber base. Sweat-activated grip.",
    "attributes": {
      "Strap": "Includes cotton carry strap",
      "Material": "Organic Cork + Natural Tree Rubber",
      "Thickness": "6mm High Cushioning",
      "Dimensions": "183cm x 66cm"
    },
    "tags": [
      "yoga",
      "fitness",
      "eco friendly",
      "cork mat",
      "active"
    ],
    "image": "assets/product-images/prod-701.jpg",
    "isFeatured": true,
    "isActive": true
  },
  {
    "id": "prod-702",
    "name": "Titanium Graphite High-Tension Badminton Racket (4U)",
    "category": "Sports & Lifestyle",
    "shopId": "shop-7",
    "shopName": "DecaPulse Sports & Outdoor Hub",
    "shopArea": "Unkal",
    "price": 1750,
    "originalPrice": 2250,
    "discountPercent": 22,
    "stock": 4,
    "rating": 4.800000190734863,
    "reviewsCount": 33,
    "description": "Isometric lightweight 82g graphite badminton racket strung at 28 lbs tension with BG65 high-resilience strings. Delivers crisp smashes and swift net recovery.",
    "attributes": {
      "Cover": "Full Thermal Bag Included",
      "Frame": "High Modulus Graphite + Titanium Mesh",
      "String Tension": "Pre-strung 28 lbs",
      "Weight Category": "4U (80-84g)"
    },
    "tags": [
      "badminton",
      "racket",
      "sports",
      "graphite"
    ],
    "image": "assets/product-images/prod-702.jpg",
    "isFeatured": true,
    "isActive": true
  },
  {
    "id": "prod-703",
    "name": "Stainless Steel Insulated Sports Flask with Chug Cap (1L)",
    "category": "Sports & Lifestyle",
    "shopId": "shop-7",
    "shopName": "DecaPulse Sports & Outdoor Hub",
    "shopArea": "Unkal",
    "price": 890,
    "originalPrice": 1150,
    "discountPercent": 23,
    "stock": 20,
    "rating": 4.699999809265137,
    "reviewsCount": 41,
    "description": "Double-wall vacuum-insulated 18/8 food-grade stainless steel bottle. Keeps water chilled for 24 hours or steaming hot for 12 hours with sweat-proof powder coating.",
    "attributes": {
      "Lid": "One-touch leakproof chug cap",
      "BPA Free": "100% Non-toxic",
      "Capacity": "1000ml (1 Litre)",
      "Insulation": "Cold 24h / Hot 12h"
    },
    "tags": [
      "water bottle",
      "fitness",
      "outdoor",
      "flask"
    ],
    "image": "assets/product-images/prod-703.jpg",
    "isFeatured": false,
    "isActive": true
  },
  {
    "id": "prod-704",
    "name": "Pro-Grade Speed Jump Rope with Ball Bearings",
    "category": "Sports & Lifestyle",
    "shopId": "shop-7",
    "shopName": "DecaPulse Sports & Outdoor Hub",
    "shopArea": "Unkal",
    "price": 499,
    "originalPrice": 650,
    "discountPercent": 23,
    "stock": 22,
    "rating": 4.800000190734863,
    "reviewsCount": 28,
    "description": "Tangle-free 360-degree dual ball bearing steel wire speed rope. Features knurled anti-slip aluminum alloy handles and adjustable 3-metre coated cable.",
    "attributes": {
      "Cable": "3m Coated Steel Wire",
      "Handles": "Knurled Aluminum Alloy",
      "Bearings": "360 Smooth Precision Ball Bearings",
      "Adjustment": "Tool-less thumb screws"
    },
    "tags": [
      "jump rope",
      "cardio",
      "fitness",
      "workout"
    ],
    "image": "assets/product-images/prod-704.jpg",
    "isFeatured": false,
    "isActive": true
  },
  {
    "id": "prod-705",
    "name": "Natural Latex Resistance Loop Bands (Set of 5 Levels)",
    "category": "Sports & Lifestyle",
    "shopId": "shop-7",
    "shopName": "DecaPulse Sports & Outdoor Hub",
    "shopArea": "Unkal",
    "price": 599,
    "originalPrice": 799,
    "discountPercent": 25,
    "stock": 18,
    "rating": 4.699999809265137,
    "reviewsCount": 36,
    "description": "Set of 5 color-coded resistance loop exercise bands varying from X-Light (5 lbs) to X-Heavy (40 lbs). Molded from 100% natural Malaysian latex.",
    "attributes": {
      "Includes": "5 Bands + Waterproof Carry Pouch + Exercise Guide",
      "Material": "100% Natural Latex",
      "Resistance Levels": "5-10-20-30-40 lbs"
    },
    "tags": [
      "resistance bands",
      "home workout",
      "strength",
      "fitness"
    ],
    "image": "assets/product-images/prod-705.jpg",
    "isFeatured": false,
    "isActive": true
  },
  {
    "id": "prod-706",
    "name": "Deep Tissue High-Density Trigger Point Foam Roller",
    "category": "Sports & Lifestyle",
    "shopId": "shop-7",
    "shopName": "DecaPulse Sports & Outdoor Hub",
    "shopArea": "Unkal",
    "price": 799,
    "originalPrice": 999,
    "discountPercent": 20,
    "stock": 11,
    "rating": 4.800000190734863,
    "reviewsCount": 24,
    "description": "Multi-density grid foam roller constructed with an EVA foam exterior over a hollow rigid PVC core. Releases myofascial tension in back, glutes, and IT bands.",
    "attributes": {
      "Core": "Heavy-Duty Reinforced PVC",
      "Length": "33cm x 14cm Diameter",
      "Density": "High Firmness Grid",
      "Max Load": "200 kg"
    },
    "tags": [
      "foam roller",
      "recovery",
      "physiotherapy",
      "fitness"
    ],
    "image": "assets/product-images/prod-706.jpg",
    "isFeatured": false,
    "isActive": true
  },
  {
    "id": "prod-707",
    "name": "Reflective Breathable Running & Hydration Waist Belt",
    "category": "Sports & Lifestyle",
    "shopId": "shop-7",
    "shopName": "DecaPulse Sports & Outdoor Hub",
    "shopArea": "Unkal",
    "price": 450,
    "originalPrice": 600,
    "discountPercent": 25,
    "stock": 15,
    "rating": 4.599999904632568,
    "reviewsCount": 19,
    "description": "Bounce-free waterproof lycra running belt fitting phones up to 6.8 inches. Features dual 250ml flask holsters, key clip, and 360-degree reflective visibility bands.",
    "attributes": {
      "Pockets": "Zippered phone pouch + 2 flask sleeves",
      "Waist Fit": "Adjustable 24 to 44 inches",
      "Visibility": "Reflective strips",
      "Waterproof": "Sweat and rainproof TPU lining"
    },
    "tags": [
      "running",
      "waist pack",
      "marathon",
      "accessories"
    ],
    "image": "assets/product-images/prod-707.jpg",
    "isFeatured": false,
    "isActive": true
  }
];

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
