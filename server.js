/**
 * LocalLoop - Express Web Server & Modular REST API
 * Serves the frontend static files and exposes backend API endpoints.
 * Integrates with MySQL via connection pool in config/db.js.
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Route Modules
const healthRoutes = require('./routes/health');
const authRoutes = require('./routes/auth');
const locationRoutes = require('./routes/locations');
const categoryRoutes = require('./routes/categories');
const shopRoutes = require('./routes/shops');
const productRoutes = require('./routes/products');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orders');
const reviewRoutes = require('./routes/reviews');
const adminRoutes = require('./routes/admin');
const paymentRoutes = require('./routes/payments');
const inquiryRoutes = require('./routes/inquiries');

// Middleware
const { notFoundHandler, errorHandler } = require('./middleware/error-handler');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for cross-origin development if needed
app.use(cors());

// Parse incoming JSON and URL-encoded request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend assets (HTML, CSS, JS, Images) from project root
app.use(express.static(path.join(__dirname)));

// ----------------------------------------------------------------------------
// Mount REST API Routes
// ----------------------------------------------------------------------------
app.use('/api', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/shops', shopRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/inquiries', inquiryRoutes);

// Catch-all 404 handler for unknown /api/* routes
app.use(notFoundHandler);

// ----------------------------------------------------------------------------
// Client-Side Routing Fallback
// ----------------------------------------------------------------------------
// For non-API routes, fall back to index.html to allow SPA hash routing
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api/')) {
    return res.sendFile(path.join(__dirname, 'index.html'));
  }
  next();
});

// Centralized API error handler
app.use(errorHandler);

// Start listening
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`OneMarket Server running at: http://localhost:${PORT}`);
    console.log(`API Health Check:   http://localhost:${PORT}/api/health`);
    console.log(`Database Health:    http://localhost:${PORT}/api/db-health`);
    console.log(`Products Endpoint:  http://localhost:${PORT}/api/products`);
    console.log(`Shops Endpoint:     http://localhost:${PORT}/api/shops`);
    console.log(`Orders Endpoint:    http://localhost:${PORT}/api/orders`);
    console.log(`======================================================\n`);
  });
}

module.exports = app;
