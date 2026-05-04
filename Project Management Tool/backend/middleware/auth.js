const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiResponse = require('../utils/apiResponse');
const logger = require('../utils/logger');

const authenticate = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return ApiResponse.unauthorized(res, 'Access token required. Please login.');
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return ApiResponse.unauthorized(res, 'Token expired. Please login again.');
      }
      return ApiResponse.unauthorized(res, 'Invalid token. Please login again.');
    }

    const user = await User.findById(decoded.id).select('+refreshToken');
    if (!user) {
      return ApiResponse.unauthorized(res, 'User no longer exists.');
    }

    if (!user.isActive) {
      return ApiResponse.unauthorized(res, 'Account has been deactivated.');
    }

    req.user = user;
    next();
  } catch (error) {
    logger.error('Auth middleware error:', error);
    return ApiResponse.error(res, 'Authentication error');
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return ApiResponse.forbidden(res, 'You do not have permission to perform this action.');
    }
    next();
  };
};

module.exports = { authenticate, authorize };