-- ============================================================================
-- OneMarket (formerly LocalLoop) - Supabase Postgres Initial Migration
-- Version: 20261024_000001
-- Tables: locations, categories, shops, users, products, orders, order_items,
--         order_status_history, cart_items, reviews, reward_transactions,
--         payments, admin_audit_logs, product_moderation_records
-- Includes: Constraints, Indexes, Row Level Security (RLS), and Atomic Functions
-- ============================================================================

-- 1. Locations
CREATE TABLE IF NOT EXISTS locations (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    pincode VARCHAR(10) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_locations_pincode ON locations(pincode);

-- 2. Categories
CREATE TABLE IF NOT EXISTS categories (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    icon VARCHAR(50) DEFAULT NULL,
    description TEXT DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Shops
CREATE TABLE IF NOT EXISTS shops (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    category VARCHAR(100) NOT NULL,
    area VARCHAR(100) NOT NULL,
    address TEXT NOT NULL,
    description TEXT DEFAULT NULL,
    rating DECIMAL(3,1) DEFAULT 0.0,
    reviews_count INT DEFAULT 0,
    image VARCHAR(500) DEFAULT NULL,
    phone VARCHAR(30) DEFAULT NULL,
    timing VARCHAR(100) DEFAULT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_shops_area ON shops(area);
CREATE INDEX IF NOT EXISTS idx_shops_category ON shops(category);

-- 4. Users / Profiles
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    phone VARCHAR(30) DEFAULT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(30) NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'seller', 'admin')),
    shop_id VARCHAR(50) REFERENCES shops(id) ON DELETE SET NULL,
    address TEXT DEFAULT NULL,
    city VARCHAR(100) DEFAULT 'Hubballi',
    pincode VARCHAR(10) DEFAULT NULL,
    reward_tokens INT NOT NULL DEFAULT 0,
    status VARCHAR(30) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'pending')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_shop ON users(shop_id);

-- 5. Products
CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    shop_id VARCHAR(50) NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
    price DECIMAL(10,2) NOT NULL,
    original_price DECIMAL(10,2) DEFAULT NULL,
    discount_percent INT DEFAULT 0,
    stock INT NOT NULL DEFAULT 0,
    rating DECIMAL(3,1) DEFAULT 0.0,
    reviews_count INT DEFAULT 0,
    description TEXT DEFAULT NULL,
    attributes JSONB DEFAULT '{}'::jsonb,
    tags JSONB DEFAULT '[]'::jsonb,
    image VARCHAR(500) DEFAULT NULL,
    is_featured BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    moderation_status VARCHAR(30) NOT NULL DEFAULT 'approved' CHECK (moderation_status IN ('approved', 'flagged', 'deactivated')),
    moderation_reason TEXT DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_products_shop ON products(shop_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_stock ON products(stock);

-- 6. Orders
CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) REFERENCES users(id) ON DELETE SET NULL,
    customer_name VARCHAR(150) NOT NULL,
    customer_phone VARCHAR(30) NOT NULL,
    customer_address TEXT DEFAULT NULL,
    delivery_preference VARCHAR(30) DEFAULT 'delivery',
    payment_method VARCHAR(50) DEFAULT 'Cash on Delivery',
    payment_status VARCHAR(50) DEFAULT 'Pending',
    notes TEXT DEFAULT NULL,
    subtotal DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    delivery_fee DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    taxes DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    total DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    tokens_earned INT NOT NULL DEFAULT 0,
    tokens_redeemed INT NOT NULL DEFAULT 0,
    token_discount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    status VARCHAR(30) NOT NULL DEFAULT 'Pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);

-- 7. Order Items (Immutable Snapshots)
CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id VARCHAR(50) NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id VARCHAR(50) NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    image VARCHAR(500) DEFAULT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) DEFAULT NULL,
    price DECIMAL(10,2) NOT NULL,
    original_price DECIMAL(10,2) DEFAULT NULL,
    discount DECIMAL(5,2) DEFAULT 0.00,
    quantity INT NOT NULL DEFAULT 1,
    shop_id VARCHAR(50) NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
    shop_name VARCHAR(150) DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product ON order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_order_items_shop ON order_items(shop_id);

-- 8. Order Status History (Audit Trail)
CREATE TABLE IF NOT EXISTS order_status_history (
    id SERIAL PRIMARY KEY,
    order_id VARCHAR(50) NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    note TEXT DEFAULT NULL
);
CREATE INDEX IF NOT EXISTS idx_status_history_order ON order_status_history(order_id);

-- 9. Cart Items
CREATE TABLE IF NOT EXISTS cart_items (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id VARCHAR(50) NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_user_product UNIQUE (user_id, product_id)
);
CREATE INDEX IF NOT EXISTS idx_cart_user ON cart_items(user_id);

-- 10. Reviews
CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    product_id VARCHAR(50) NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    user_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    customer_name VARCHAR(150) NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    is_verified_purchase BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id);

-- 11. Reward Transactions (Loyalty Ledger)
CREATE TABLE IF NOT EXISTS reward_transactions (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    order_id VARCHAR(50) DEFAULT NULL,
    amount INT NOT NULL,
    type VARCHAR(30) NOT NULL CHECK (type IN ('EARNED', 'REDEEMED', 'REFUND', 'CANCELLED_REVERSAL', 'ADJUSTMENT')),
    description VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_user_rewards ON reward_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_order_rewards ON reward_transactions(order_id);

-- 12. Payments
CREATE TABLE IF NOT EXISTS payments (
    id VARCHAR(64) PRIMARY KEY,
    order_id VARCHAR(50) NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    user_id VARCHAR(50) REFERENCES users(id) ON DELETE SET NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'INR',
    gateway VARCHAR(30) NOT NULL DEFAULT 'razorpay',
    gateway_order_id VARCHAR(100) DEFAULT NULL,
    gateway_payment_id VARCHAR(100) DEFAULT NULL,
    gateway_signature VARCHAR(255) DEFAULT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Paid', 'Failed', 'Refunded')),
    method VARCHAR(50) DEFAULT 'UPI',
    upi_vpa VARCHAR(100) DEFAULT NULL,
    raw_response JSONB DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_payments_order ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_gateway_order ON payments(gateway_order_id);

-- 13. Admin Audit Logs
CREATE TABLE IF NOT EXISTS admin_audit_logs (
    id SERIAL PRIMARY KEY,
    admin_id VARCHAR(50) DEFAULT NULL,
    admin_email VARCHAR(150) NOT NULL,
    action VARCHAR(100) NOT NULL,
    target_type VARCHAR(50) NOT NULL,
    target_id VARCHAR(100) NOT NULL,
    details TEXT DEFAULT NULL,
    ip_address VARCHAR(50) DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_admin_audit_created ON admin_audit_logs(created_at);

-- 14. Inquiries & Form Submissions
CREATE TABLE IF NOT EXISTS inquiries (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL,
    phone VARCHAR(30) DEFAULT NULL,
    subject VARCHAR(200) DEFAULT NULL,
    message TEXT NOT NULL,
    shop_id VARCHAR(50) REFERENCES shops(id) ON DELETE SET NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'unread' CHECK (status IN ('unread', 'in_progress', 'resolved', 'archived')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_inquiries_email ON inquiries(email);
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON inquiries(status);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reward_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;

-- Public read for catalogue data
CREATE POLICY "Public read for locations" ON locations FOR SELECT USING (true);
CREATE POLICY "Public read for categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Public read for shops" ON shops FOR SELECT USING (true);
CREATE POLICY "Public read for active products" ON products FOR SELECT USING (is_active = true AND moderation_status = 'approved');
CREATE POLICY "Public read for reviews" ON reviews FOR SELECT USING (true);
CREATE POLICY "Public insert for inquiries" ON inquiries FOR INSERT WITH CHECK (true);
CREATE POLICY "Public select own inquiries" ON inquiries FOR SELECT USING (true);

-- User scoped policies
CREATE POLICY "Users view own profile" ON users FOR SELECT USING (auth.uid()::text = id OR role = 'admin');
CREATE POLICY "Users update own profile" ON users FOR UPDATE USING (auth.uid()::text = id);

-- Customer orders scoped policies
CREATE POLICY "Customers view own orders" ON orders FOR SELECT USING (auth.uid()::text = user_id);
CREATE POLICY "Customers view own cart" ON cart_items FOR ALL USING (auth.uid()::text = user_id);
CREATE POLICY "Users view own rewards" ON reward_transactions FOR SELECT USING (auth.uid()::text = user_id);
CREATE POLICY "Users view own payments" ON payments FOR SELECT USING (auth.uid()::text = user_id);

-- ============================================================================
-- ATOMIC POSTGRES FUNCTIONS (RPCs)
-- ============================================================================

-- Atomic Order Creation Function with Stock Deduction and Reward Tokens
CREATE OR REPLACE FUNCTION create_order_atomic(
    p_order_id VARCHAR,
    p_user_id VARCHAR,
    p_customer_name VARCHAR,
    p_customer_phone VARCHAR,
    p_customer_address TEXT,
    p_delivery_preference VARCHAR,
    p_payment_method VARCHAR,
    p_payment_status VARCHAR,
    p_notes TEXT,
    p_subtotal DECIMAL,
    p_delivery_fee DECIMAL,
    p_taxes DECIMAL,
    p_total DECIMAL,
    p_tokens_earned INT,
    p_tokens_redeemed INT,
    p_token_discount DECIMAL,
    p_items JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_item JSONB;
    v_product_id VARCHAR;
    v_qty INT;
    v_curr_stock INT;
    v_product_name VARCHAR;
BEGIN
    -- Check stock availability for all items first
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        v_product_id := v_item->>'productId';
        v_qty := (v_item->>'quantity')::INT;
        
        SELECT stock, name INTO v_curr_stock, v_product_name
        FROM products WHERE id = v_product_id FOR UPDATE;
        
        IF NOT FOUND THEN
            RAISE EXCEPTION 'Product % does not exist', v_product_id;
        END IF;
        
        IF v_curr_stock < v_qty THEN
            RAISE EXCEPTION 'Insufficient stock for "%". Only % units available (Requested: %)', v_product_name, v_curr_stock, v_qty;
        END IF;
    END LOOP;

    -- Insert order record
    INSERT INTO orders (
        id, user_id, customer_name, customer_phone, customer_address,
        delivery_preference, payment_method, payment_status, notes,
        subtotal, delivery_fee, taxes, total,
        tokens_earned, tokens_redeemed, token_discount, status
    ) VALUES (
        p_order_id, p_user_id, p_customer_name, p_customer_phone, p_customer_address,
        p_delivery_preference, p_payment_method, p_payment_status, p_notes,
        p_subtotal, p_delivery_fee, p_taxes, p_total,
        p_tokens_earned, p_tokens_redeemed, p_token_discount, 'Pending'
    );

    -- Insert order items and deduct stock atomically
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        v_product_id := v_item->>'productId';
        v_qty := (v_item->>'quantity')::INT;
        
        INSERT INTO order_items (
            order_id, product_id, image, name, category, price,
            original_price, discount, quantity, shop_id, shop_name
        ) VALUES (
            p_order_id,
            v_product_id,
            v_item->>'image',
            v_item->>'name',
            v_item->>'category',
            (v_item->>'price')::DECIMAL,
            NULLIF(v_item->>'originalPrice', '')::DECIMAL,
            COALESCE((v_item->>'discount')::DECIMAL, 0.00),
            v_qty,
            v_item->>'shopId',
            v_item->>'shopName'
        );

        UPDATE products SET stock = stock - v_qty WHERE id = v_product_id;
    END LOOP;

    -- Record initial status history
    INSERT INTO order_status_history (order_id, status, note)
    VALUES (p_order_id, 'Pending', 'Order created with ' || p_payment_method);

    -- Update user reward tokens ledger
    IF p_user_id IS NOT NULL THEN
        IF p_tokens_redeemed > 0 THEN
            UPDATE users SET reward_tokens = GREATEST(0, reward_tokens - p_tokens_redeemed) WHERE id = p_user_id;
            INSERT INTO reward_transactions (user_id, order_id, amount, type, description)
            VALUES (p_user_id, p_order_id, -p_tokens_redeemed, 'REDEEMED', 'Redeemed ' || p_tokens_redeemed || ' tokens on Order #' || p_order_id);
        END IF;

        IF p_tokens_earned > 0 THEN
            UPDATE users SET reward_tokens = reward_tokens + p_tokens_earned WHERE id = p_user_id;
            INSERT INTO reward_transactions (user_id, order_id, amount, type, description)
            VALUES (p_user_id, p_order_id, p_tokens_earned, 'EARNED', 'Earned ' || p_tokens_earned || ' tokens for Order #' || p_order_id);
        END IF;

        -- Clear user database cart
        DELETE FROM cart_items WHERE user_id = p_user_id;
    END IF;

    RETURN jsonb_build_object('success', true, 'orderId', p_order_id);
END;
$$;

-- Atomic Order Cancellation Function with Inventory & Token Restoration
CREATE OR REPLACE FUNCTION cancel_order_atomic(
    p_order_id VARCHAR,
    p_user_id VARCHAR,
    p_reason TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_order RECORD;
    v_item RECORD;
BEGIN
    SELECT * INTO v_order FROM orders WHERE id = p_order_id FOR UPDATE;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Order % not found', p_order_id;
    END IF;

    -- Idempotent check
    IF v_order.status = 'Cancelled' THEN
        RETURN jsonb_build_object('success', true, 'alreadyCancelled', true, 'message', 'Order is already cancelled');
    END IF;

    -- Eligibility check
    IF v_order.status IN ('Shipped', 'Out for Delivery', 'Delivered', 'Completed', 'Rejected') THEN
        RAISE EXCEPTION 'Cannot cancel Order #%. Current status is "%"', p_order_id, v_order.status;
    END IF;

    -- Ownership check if user_id provided
    IF p_user_id IS NOT NULL AND v_order.user_id IS NOT NULL AND v_order.user_id != p_user_id THEN
        RAISE EXCEPTION 'Unauthorized to cancel this order';
    END IF;

    -- Restore product stock exactly once
    FOR v_item IN SELECT product_id, quantity FROM order_items WHERE order_id = p_order_id
    LOOP
        UPDATE products SET stock = stock + v_item.quantity WHERE id = v_item.product_id;
    END LOOP;

    -- Reverse earned and refund redeemed reward tokens
    IF v_order.user_id IS NOT NULL THEN
        IF v_order.tokens_earned > 0 THEN
            UPDATE users SET reward_tokens = GREATEST(0, reward_tokens - v_order.tokens_earned) WHERE id = v_order.user_id;
            INSERT INTO reward_transactions (user_id, order_id, amount, type, description)
            VALUES (v_order.user_id, p_order_id, -v_order.tokens_earned, 'CANCELLED_REVERSAL', 'Reversal of ' || v_order.tokens_earned || ' tokens on cancelled Order #' || p_order_id);
        END IF;

        IF v_order.tokens_redeemed > 0 THEN
            UPDATE users SET reward_tokens = reward_tokens + v_order.tokens_redeemed WHERE id = v_order.user_id;
            INSERT INTO reward_transactions (user_id, order_id, amount, type, description)
            VALUES (v_order.user_id, p_order_id, v_order.tokens_redeemed, 'REFUND', 'Refund of ' || v_order.tokens_redeemed || ' redeemed tokens on cancelled Order #' || p_order_id);
        END IF;
    END IF;

    -- Update order status
    UPDATE orders SET status = 'Cancelled', updated_at = NOW() WHERE id = p_order_id;

    -- Insert status history note
    INSERT INTO order_status_history (order_id, status, note)
    VALUES (p_order_id, 'Cancelled', COALESCE(p_reason, 'Cancelled by customer'));

    RETURN jsonb_build_object('success', true, 'message', 'Order cancelled and inventory restored');
END;
$$;
