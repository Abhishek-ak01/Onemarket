/**
 * LocalLoop - Authentication & Role-Based Authorization Middleware
 * Signs & verifies JSON Web Tokens (JWT) and enforces role-based permissions.
 */

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'localloop-codefest-2026-jwt-secret-key-production';

/**
 * Generate a signed JWT for an authenticated user
 * @param {object} user - User payload ({ id, email, role, shop_id, name })
 * @returns {string} Signed JWT token
 */
function signToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      shop_id: user.shop_id || null,
      name: user.name
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

/**
 * Optional authentication: Attaches req.user if a valid token is provided,
 * but does not reject the request if absent.
 */
function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
  } catch (err) {
    req.user = null;
  }
  next();
}

/**
 * Required authentication: Returns 401 Unauthorized if no valid token
 */
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'AuthenticationRequired',
      message: 'Access denied. Please log in to proceed.'
    });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: 'InvalidToken',
      message: 'Your session has expired or is invalid. Please log in again.'
    });
  }
}

/**
 * Role-based authorization: Ensures current user has one of allowed roles
 */
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'AuthenticationRequired',
        message: 'Access denied. Please log in.'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: `Forbidden. This operation requires ${allowedRoles.join(' or ')} privileges.`
      });
    }

    next();
  };
}

module.exports = {
  signToken,
  optionalAuth,
  requireAuth,
  requireRole,
  requireCustomer: [requireAuth, requireRole('customer')],
  requireSeller: [requireAuth, requireRole('seller')]
};
