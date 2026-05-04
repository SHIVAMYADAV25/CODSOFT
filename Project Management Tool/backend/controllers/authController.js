const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiResponse = require('../utils/apiResponse');
const logger = require('../utils/logger');

const generateTokens = (userId) => {
  const accessToken = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
  const refreshToken = jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  });
  return { accessToken, refreshToken };
};

const authController = {
  // POST /api/auth/register
  async register(req, res, next) {
    try {
      const { name, email, password } = req.body;

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return ApiResponse.error(res, 'An account with this email already exists', 409);
      }

      const user = await User.create({ name, email, password });
      const { accessToken, refreshToken } = generateTokens(user._id);

      user.refreshToken = refreshToken;
      user.lastLogin = new Date();
      await user.save({ validateBeforeSave: false });

      logger.info(`New user registered: ${email}`);

      return ApiResponse.created(res, {
        user: user.toJSON(),
        accessToken,
        refreshToken,
      }, 'Account created successfully');
    } catch (error) {
      next(error);
    }
  },

  // POST /api/auth/login
  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email }).select('+password');
      if (!user) {
        return ApiResponse.unauthorized(res, 'Invalid email or password');
      }

      if (!user.isActive) {
        return ApiResponse.unauthorized(res, 'Account has been deactivated. Contact support.');
      }

      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return ApiResponse.unauthorized(res, 'Invalid email or password');
      }

      const { accessToken, refreshToken } = generateTokens(user._id);

      user.refreshToken = refreshToken;
      user.lastLogin = new Date();
      await user.save({ validateBeforeSave: false });

      logger.info(`User logged in: ${email}`);

      return ApiResponse.success(res, {
        user: user.toJSON(),
        accessToken,
        refreshToken,
      }, 'Login successful');
    } catch (error) {
      next(error);
    }
  },

  // POST /api/auth/refresh
  async refreshToken(req, res, next) {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        return ApiResponse.unauthorized(res, 'Refresh token required');
      }

      let decoded;
      try {
        decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      } catch {
        return ApiResponse.unauthorized(res, 'Invalid or expired refresh token');
      }

      const user = await User.findById(decoded.id).select('+refreshToken');
      if (!user || user.refreshToken !== refreshToken) {
        return ApiResponse.unauthorized(res, 'Invalid refresh token');
      }

      const tokens = generateTokens(user._id);
      user.refreshToken = tokens.refreshToken;
      await user.save({ validateBeforeSave: false });

      return ApiResponse.success(res, tokens, 'Tokens refreshed');
    } catch (error) {
      next(error);
    }
  },

  // POST /api/auth/logout
  async logout(req, res, next) {
    try {
      req.user.refreshToken = null;
      await req.user.save({ validateBeforeSave: false });

      logger.info(`User logged out: ${req.user.email}`);
      return ApiResponse.success(res, null, 'Logged out successfully');
    } catch (error) {
      next(error);
    }
  },

  // GET /api/auth/me
  async getMe(req, res, next) {
    try {
      return ApiResponse.success(res, { user: req.user.toJSON() });
    } catch (error) {
      next(error);
    }
  },

  // PUT /api/auth/update-profile
  async updateProfile(req, res, next) {
    try {
      const { name, avatar } = req.body;
      const updates = {};
      if (name) updates.name = name;
      if (avatar !== undefined) updates.avatar = avatar;

      const user = await User.findByIdAndUpdate(req.user._id, updates, {
        new: true,
        runValidators: true,
      });

      return ApiResponse.success(res, { user: user.toJSON() }, 'Profile updated successfully');
    } catch (error) {
      next(error);
    }
  },

  // PUT /api/auth/change-password
  async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;

      const user = await User.findById(req.user._id).select('+password');
      const isValid = await user.comparePassword(currentPassword);
      if (!isValid) {
        return ApiResponse.error(res, 'Current password is incorrect', 400);
      }

      user.password = newPassword;
      await user.save();

      return ApiResponse.success(res, null, 'Password changed successfully');
    } catch (error) {
      next(error);
    }
  },
};

module.exports = authController;