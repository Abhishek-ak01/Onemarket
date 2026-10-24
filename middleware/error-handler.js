/**
 * LocalLoop - API Error Handling Middleware
 * Provides consistent JSON error responses and prevents sensitive leakages.
 */

function notFoundHandler(req, res, next) {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({
      success: false,
      message: `API endpoint ${req.method} ${req.path} not found.`
    });
  }
  next();
}

function errorHandler(err, req, res, next) {
  console.error(`[API Error] ${req.method} ${req.path}:`, err.message);

  const statusCode = err.status || err.statusCode || 500;
  
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(err.code && { code: err.code }),
    ...(err.details && { details: err.details })
  });
}

module.exports = {
  notFoundHandler,
  errorHandler
};
