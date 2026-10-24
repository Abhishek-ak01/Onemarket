# LocalLoop — Your City. Your Shops. One Local Marketplace

> **CODEFEST 2026 Hackathon Entry**  
> **Category:** Full-Stack Web Applications × E-Commerce  
> **Tech Stack:** HTML5, CSS3, Vanilla JavaScript (ES6+), Node.js, Express, MySQL (`mysql2/promise`)  

---

## 1. Project Overview

### The Problem
Local customers often struggle to discover products available at nearby neighbourhood shops, compare prices across local sellers, and understand true product availability without calling multiple stores or walking between alleys.

At the same time, small brick-and-mortar merchants lack a simple, friction-free digital interface to showcase items, manage physical inventory, and handle customer order requests without exorbitant platform commissions.

### The Solution
**LocalLoop** connects customers with neighbourhood shops through a unified local commerce interface:
- **For Customers:** Discover authentic products across groceries, electronics, handlooms, books, home essentials, and personal care. Compare products side-by-side, find items within strict budgets via **Budget Buddy**, and place demo order requests without upfront payment.
- **For Merchants:** A lightweight, non-technical dashboard to manage shop listings, track inventory with configurable low-stock alerts, inspect customer order requests, and accept or reject orders with real-time stock deduction.

---

## 2. Quick Start: Database Setup & Server Execution

### Prerequisites
- **Node.js** (v18+; tested on v22)
- **MySQL Server 8.0+** & **MySQL Workbench**

---

### Step-by-Step Setup Guide (Windows PowerShell)

#### Step 1: Install Dependencies
Open Windows PowerShell in the project directory:
```powershell
npm install
```

#### Step 2: Configure Your Local `.env` File
Create your local environment file from the template:
```powershell
Copy-Item .env.example .env
```
Open `.env` in VS Code or Notepad and verify your MySQL credentials:
```ini
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_actual_mysql_password
DB_NAME=localloop
DB_CONNECTION_LIMIT=10
```
> **Note:** `.env` is listed in `.gitignore` so your personal credentials are never tracked or committed.

#### Step 3: Run Database Schema & Seed Data
You can initialize the database using either **Automated CLI** or **MySQL Workbench**:

**Option A — Automated CLI (Recommended):**
```powershell
npm run db:seed
```
*Result:* Connects to MySQL, executes `database/schema.sql` (creates `localloop` database and all 7 tables with foreign keys and indexes), and populates `database/seed.sql`.

**Option B — MySQL Workbench GUI:**
1. Launch **MySQL Workbench** and connect to your instance (`Local instance MySQL80`).
2. Go to **File ➔ Open SQL Script...** (`Ctrl + O`) and select `database/schema.sql`.
3. Press **Execute** (`Ctrl + Shift + Enter`) to run the entire script.  
   *(Notice: `USE localloop;` at line 5 ensures the target database is selected for all subsequent `CREATE TABLE` statements).*
4. In the left **Navigator** pane, right-click **Schemas** ➔ **Refresh All**. Expand `localloop` ➔ **Tables** and verify all 7 tables exist:
   - `locations`
   - `categories`
   - `shops`
   - `products`
   - `orders`
   - `order_items`
   - `order_status_history`
5. Open `database/seed.sql` and click **Execute** to insert the seed dataset.

#### Step 4: Run Automated Tests
Verify both frontend store logic and the full backend REST API suite:
```powershell
npm test
```
*Result:* Runs both `test-app.js` (frontend business logic) and `test-backend.js` (live REST API, database connectivity, and transactional stock deductions) with 100% pass rate.

#### Step 5: Start the Server
Launch the unified full-stack application:
```powershell
npm start
```

#### Step 6: Verify Endpoints in Your Browser
- **Frontend Application:**  
  👉 [http://localhost:3000](http://localhost:3000) (Full interactive customer marketplace & seller portal)
- **API Health Check:**  
  👉 [http://localhost:3000/api/health](http://localhost:3000/api/health)
- **Database Connection Check:**  
  👉 [http://localhost:3000/api/db-health](http://localhost:3000/api/db-health)
- **Catalog Products:**  
  👉 [http://localhost:3000/api/products](http://localhost:3000/api/products)
- **Verified Shops:**  
  👉 [http://localhost:3000/api/shops](http://localhost:3000/api/shops)

---

## 3. Implemented REST API Endpoints

| Category | Method | Route | Description |
|:---|:---|:---|:---|
| **Health** | `GET` | `/api/health` | Server uptime and status |
| **Health** | `GET` | `/api/db-health` | Safe MySQL connection verification |
| **Locations** | `GET` | `/api/locations` | List all Bengaluru shopping zones |
| **Locations** | `GET` | `/api/locations/:id` | Get location by ID |
| **Categories** | `GET` | `/api/categories` | List all product categories |
| **Categories** | `GET` | `/api/categories/:id` | Get category details |
| **Shops** | `GET` | `/api/shops` | List shops with filters (`?area=...`, `?category=...`, `?search=...`) |
| **Shops** | `GET` | `/api/shops/:id` | Get store details by ID |
| **Shops** | `POST` | `/api/shops` | Create new shop profile |
| **Shops** | `PUT` | `/api/shops/:id` | Update shop information |
| **Shops** | `DELETE` | `/api/shops/:id` | Delete shop |
| **Products** | `GET` | `/api/products` | List products with filters (`?shop_id=...`, `?category=...`, `?search=...`, `?min_price=...`, `?max_price=...`, `?featured=true`) |
| **Products** | `GET` | `/api/products/:id` | Get single product with store metadata |
| **Products** | `POST` | `/api/products` | Add new product listing |
| **Products** | `PUT` | `/api/products/:id` | Update product details and inventory stock |
| **Products** | `DELETE` | `/api/products/:id` | Remove product listing |
| **Orders** | `GET` | `/api/orders` | List customer orders (optional `?shop_id=...` seller filter) |
| **Orders** | `GET` | `/api/orders/:id` | Get order with line items & status timeline |
| **Orders** | `POST` | `/api/orders` | **ACID Transaction:** validates stock, locks rows (`FOR UPDATE`), calculates totals on server, decrements inventory, creates line items, records status history |
| **Orders** | `PATCH` | `/api/orders/:id/status` | Update status (`Pending`, `Accepted`, `Completed`, `Rejected`) and record timeline note |

---

## 4. Project File & Folder Structure

```text
d:\hackthon\
├── config\                  # Dedicated Database Configuration
│   └── db.js                # MySQL connection pool (mysql2/promise) with query helpers
├── routes\                  # Modular REST API Route Controllers
│   ├── health.js            # /api/health and /api/db-health
│   ├── locations.js         # /api/locations
│   ├── categories.js        # /api/categories
│   ├── shops.js             # /api/shops CRUD & filters
│   ├── products.js          # /api/products CRUD & multi-criteria filters
│   └── orders.js            # /api/orders transactional checkout & status audit
├── middleware\              # Express Middleware
│   └── error-handler.js     # Consistent JSON error formatting & 404 handler
├── database\                # MySQL Database Scripts
│   ├── schema.sql           # DDL: Creates `localloop` database & 7 normalized tables
│   ├── seed.sql             # DML: Inserts 6 shops, 26 products, categories, orders
│   └── seed.js              # Automated Node runner (`npm run db:seed`)
├── index.html               # Main SPA shell
├── server.js                # Express web server mounting all API routes + static assets
├── test-app.js              # Frontend store & business logic test suite (100% pass)
├── test-backend.js          # Live Backend API & transaction test suite (100% pass)
├── package.json             # NPM metadata and scripts
├── .env.example             # Database configuration template
├── .gitignore               # Excludes node_modules and .env
└── README.md                # Full documentation & setup guide
│
├── database\                # MySQL Database Scripts
│   ├── schema.sql           # DDL: Creates `localloop` database and 7 relational tables
│   ├── seed.sql             # DML: Inserts 6 shops, 26 products, categories, orders
│   └── seed.js              # Optional automated Node runner (`npm run db:seed`)
│
├── css\                     # Modular CSS3 Design System

│   ├── variables.css        # Visual tokens: Forest green, soft sage, warm amber, typography
│   ├── base.css             # CSS reset, typography, buttons, badges, modals, toasts
│   ├── components.css       # Header, navigation, product cards, category cards, footer
│   ├── marketplace.css      # Hero, trust benefits, catalog toolbar, Budget Buddy
│   ├── features.css         # Product details, 3-way compare matrix, cart & checkout, orders
│   └── seller.css           # Merchant portal, KPI cards, CRUD data tables, sales analytics
│
└── js\                      # Pure Vanilla JavaScript Modules
    ├── mock-data.js         # Realistic seed data (6 Bengaluru shops, 26 products, 3 orders)
    ├── utils.js             # Currency formatting (INR ₹), dates, toast alerts, SVG icons
    ├── store.js             # Centralized reactive Store with localStorage sync & inventory logic
    ├── router.js            # Client-side hash router with parameter and query parsing
    ├── app.js               # Application bootstrap and global delegated event handling
    │
    ├── components\          # Reusable Component Renderers
    │   ├── navbar.js        # Global header with location selector & view mode toggle
    │   ├── product-card.js  # Standard card with stock indicators & compare toggle
    │   └── footer.js        # Comprehensive hackathon footer
    │
    └── views\               # Dedicated View Controllers
        ├── home-view.js     # Customer marketplace homepage & showcase
        ├── catalog-view.js  # Multi-faceted search, filters, and sorting
        ├── product-view.js  # Detailed specifications & stock-guarded quantity selector
        ├── compare-view.js  # 3-way product comparison matrix with lowest-price badge
        ├── budget-view.js   # Budget Buddy discovery within rupee thresholds
        ├── cart-view.js     # Shopping cart line items & demo order checkout form
        ├── orders-view.js   # Customer order tracking & modal timeline
        ├── seller-view.js   # Merchant dashboard (KPIs, Product CRUD, Order state transitions)
        └── about-view.js    # Architectural overview & demo reset action
```

---

## 4. Design Direction & Visual Identity

LocalLoop is styled with an intentional, premium local commercial identity:
- **Primary Color:** Deep Forest Green (`#1b4332`, `#2d6a4f`) — conveys trust, community, and longevity.
- **Secondary Color:** Soft Sage Green (`#52b788`, `#d8f3dc`) — subtle accents and category tags.
- **Accent Color:** Warm Amber (`#d97706`, `#fef3c7`) — highlights, ratings, and low-stock notices.
- **Background:** Warm Off-White (`#fbfbfa` / `#f4f6f4`) — clean and natural, avoiding stark corporate clinical grays.
- **Typography:** Google Fonts (`Outfit` for crisp modern commercial headers, `Plus Jakarta Sans` for clean UI body copy).
- **Icons:** 100% self-contained inline SVG icon system in `Utils.icons` — crisp, responsive, zero external icon CDN breakage.

---

## 5. Application Features & Architecture

### A. Customer Marketplace (`#home`)
- **Hero Section:** "Your neighbourhood has more to offer" with live Bengaluru demo location selector (Indiranagar, Koramangala, Malleshwaram, Jayanagar, HSR Layout, Whitefield).
- **Trust Props:** Three community benefits highlighting independent retail discovery, transparent price comparison, and direct merchant support.
- **Category Shortcuts:** 6 categories (Groceries, Electronics, Fashion, Books & Stationery, Home & Living, Personal Care) with dynamic inventory counts.
- **Featured Products & Local Shops:** Showcase cards linking directly to detail pages and shop catalogs.

### B. Product Search & Discovery (`#catalog`)
- Real-time search across product name, category, shop name, and description.
- Multi-faceted filters for Category, Shop/Merchant, Price Range (Min/Max ₹), In-Stock Only, and Customer Ratings.
- Sorting by Price (Low to High / High to Low), Alphabetical (A to Z), and Top Rated.
- Active filter pill tags with one-click removal and clear empty states.

### C. Smart 3-Way Product Comparison (`#compare`)
- Select up to **3 products** across different shops.
- Side-by-side comparison matrix displaying:
  - Product thumbnail and title
  - Price in INR with an automated **"Lowest Price"** green badge
  - Seller and neighbourhood location
  - Stock availability and customer rating
  - Technical product specifications (Weight, Origin, Warranty, Dimensions, etc.)
  - Direct "Add to Order" purchase action
- Prevents duplicate product additions and enforces the 3-item limit with friendly toasts.

### D. Budget Buddy (`#budget`)
- Distinctive discovery tool for budget-conscious shoppers.
- Enter any custom budget in Indian Rupees (₹) or click quick chips (Under ₹250, Under ₹500, Under ₹1,000, Under ₹1,500, Under ₹3,000).
- Filters products whose individual price is $\le \text{budget}$.
- Sort by lowest price or closest to budget limit.

### E. Product Details View (`#product/:id`)
- High-resolution product showcase with automatic SVG fallback if image loading fails.
- Direct seller information card (name, neighbourhood area, opening hours).
- Detailed specifications table.
- **Inventory-Guarded Quantity Stepper:** Automatically clamps between 1 and available physical stock (`p.stock`). The `+` button disables when maximum available stock is reached.
- Out-of-stock items disable the Add to Cart button.
- Related products grid from the same category.

### F. Cart & Demo Order Checkout (`#cart`)
- Real-time cart calculation in Indian Rupees (₹).
- Quantity adjustments respect available stock in real-time.
- **Demo Order Request Form:**
  - Customer name and 10-digit mobile number validation.
  - Fulfillment preference toggle (Home Delivery vs Store Pickup).
  - Delivery address field (conditionally displayed for home delivery).
  - Special delivery instructions/notes.
  - Submitting generates a unique ID (e.g. `LL-2026-1045`), saves order to `localStorage` with initial status `Pending`, clears the cart, and opens a confirmation receipt modal.

### G. Customer My Orders (`#orders`)
- Chronological list of orders placed in the current session.
- Status badges: `Pending` (amber), `Accepted` (blue/green), `Completed` (emerald), `Rejected` (red).
- "View Order Details & Timeline" modal with item breakdown and simulated progress milestones.

### H. Seller Portal & Merchant Dashboard (`#seller`)
- Switch active merchant persona (e.g., *Malabar Spices*, *Apex Tech*, *Vogue Handlooms*, or *All Shops Admin View*).
- **Overview Tab:** Real-time calculated KPI cards:
  - Total Listed Products
  - Total Physical Units in Stock
  - Pending Order Requests
  - Completed Orders Count
  - Completed Order Sales Total (₹)
  - Low-Stock Alerts Count ($\le 3$ units)
- **Product Management Tab:**
  - Desktop data table and mobile cards.
  - **Add Product Modal:** Validate name, category, shop, price, stock, and image with automatic fallback.
  - **Edit Product Modal:** Real-time updates reflecting immediately in the customer marketplace.
  - **Delete Product:** Safe removal with confirmation dialog.
- **Order Management Tab & Critical Inventory Rules:**
  - When the seller clicks **Accept Order**:
    1. The store checks whether sufficient stock exists for every requested item.
    2. If stock is available, it atomically deducts the required quantities from product stock, updates order status to `Accepted`, and syncs with `localStorage`.
    3. If stock is insufficient, acceptance is blocked with an alert detailing the shortage.
    4. Duplicate clicks cannot cause duplicate stock deductions.
  - When the seller clicks **Reject Order**: status becomes `Rejected` without any stock deduction.
  - When the seller clicks **Mark Completed**: status becomes `Completed`, incrementing completed sales revenue in the dashboard analytics.
- **Sales Insights Tab:**
  - Revenue summary and pipeline status bars.
  - Best-selling products ranked by completed unit volume.
  - Category inventory distribution breakdown.

---

## 6. How Mock Data & Persistence Works

1. **Seed Data:** `js/mock-data.js` contains 6 authentic shops, 26 diverse products across 6 categories, and 3 initial orders with timestamps.
2. **Central Store:** `js/store.js` manages state in-memory and mirrors mutations to the browser's `localStorage` under keys:
   - `localloop_products_v1`
   - `localloop_shops_v1`
   - `localloop_orders_v1`
   - `localloop_cart_v1`
   - `localloop_compare_v1`
3. **Data Consistency:** Both the customer marketplace and the seller portal read from and write to the same underlying state. Edits made by the seller (e.g., editing a price or accepting an order) immediately update customer catalog stock and orders.
4. **Reset Demo Data:** A "Reset Demo Data" action is conveniently located in the top banner and on the About page (`#about`). Clicking it restores all initial seed data and clears custom session changes.

---

## 7. Full-Stack Architecture & Security

LocalLoop is a production-grade full-stack application connecting Vanilla JavaScript to an Express REST API and a MySQL database:

```text
[ Modern Vanilla JS Frontend ]
         │ (JWT Bearer Token / Role-Based Access)
         ▼
[ Express REST API & Middleware ] ──► [ Auth / RBAC / Validation / Cart ]
         │
         ▼
[ MySQL 8 Database (Connection Pool) ] ──► [ ACID Transactions / Safe Migrations ]
```

### Complete API Endpoints
| HTTP Method | Route | Access | Description |
|:---|:---|:---|:---|
| `POST` | `/api/auth/register-customer` | Public | Customer registration with bcrypt password hash |
| `POST` | `/api/auth/register-seller` | Public | Seller registration with shop profile |
| `POST` | `/api/auth/login` | Public | Authenticates user and issues signed JWT |
| `GET` | `/api/auth/me` | Authenticated | Retrieves current authenticated profile & role |
| `GET` | `/api/products` | Public | Full catalogue with search, category, area, price & stock filters |
| `GET` | `/api/products/:id` | Public | Retrieves product details & specifications |
| `POST` | `/api/products` | Seller Only | Merchant adds a new product listing |
| `PUT` | `/api/products/:id` | Seller Only | Merchant updates price, discounts or stock units |
| `DELETE` | `/api/products/:id` | Seller Only | Merchant deactivates/removes a product |
| `GET` | `/api/cart` | Customer Only | Retrieves database-backed shopping cart with server-side pricing |
| `POST` | `/api/cart` | Customer Only | Adds/updates items with stock limit clamping |
| `DELETE` | `/api/cart/:productId` | Customer Only | Removes item from cart |
| `DELETE` | `/api/cart` | Customer Only | Clears entire cart |
| `GET` | `/api/orders` | Customer/Seller | Customer sees their orders; Sellers see only their shop's orders |
| `POST` | `/api/orders` | Customer Only | Transactional order placement with price & image snapshots |
| `PATCH` | `/api/orders/:id/status` | Seller Only | Updates order status (Confirmed ➔ Packed ➔ Shipped ➔ Delivered) |
| `GET` | `/api/reviews` | Public | Retrieves verified reviews for a product |
| `POST` | `/api/reviews` | Customer Only | Verified buyer submits rating and review comments |
| `GET` | `/api/health` | Public | Server uptime and health probe |
| `GET` | `/api/db-health` | Public | MySQL database connection status and table counts |

---

## 8. Test Suite & Evaluator Demonstration Guide

### Pre-Seeded Evaluator Accounts
For evaluation, use either the **1-Click Persona Buttons** in the top navigation bar or the credentials below:

- **Customer Account:**  
  Email: `customer@localloop.in`  
  Password: `Customer@123`
- **Seller Account (Malabar Heritage Spices):**  
  Email: `seller@malabarspices.in`  
  Password: `Seller@123`

### Verification & Automated Tests
Verify both the frontend application logic and the complete backend API suite:

```bash
npm test
```

**Results:**
- **`test-app.js`**: 10 / 10 test suites passed (100% success):
  - ✓ 49 genuine products across 7 categories verified
  - ✓ Out of stock purchase prevention
  - ✓ Quantity stock limit clamping
  - ✓ Transactional demo order creation & cart clearing
  - ✓ Seller order acceptance & atomic stock deduction
  - ✓ Double-acceptance prevention
  - ✓ Order completion and revenue calculations
  - ✓ Smart comparison engine (max 3 items)
  - ✓ Budget Buddy threshold calculation
  - ✓ Seller Product CRUD (Add, Edit, Delete)
- **`test-backend.js`**: 15 / 15 test suites passed (100% success):
  - ✓ Health & DB connectivity check
  - ✓ 6 Bangalore shopping zones & 7 categories verified
  - ✓ Search, category, and area filtering
  - ✓ ACID Transactional order creation & stock verification
  - ✓ Multi-step order status transitions
  - ✓ Concurrent overselling protection
  - ✓ 404 Route handling
  - ✓ Bcrypt + JWT authentication & role-based access control
  - ✓ Guest shopping restrictions enforcement (401 Unauthorized)
  - ✓ Database-backed cart operations
  - ✓ Customer reviews & purchase verification
  - ✓ Safe stock restoration on order cancellation

---

*LocalLoop — Built for CODEFEST 2026.*

