const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController.js');
const { authenticate } = require('../middleware/auth.js');
const { validate, authValidators } = require('../middleware/validate.js');
const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { success: false, message: 'Too many attempts. Try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Public routes
router.post('/register', authLimiter, authValidators.register, validate, authController.register);
router.post('/login', authLimiter, authValidators.login, validate, authController.login);
router.post('/refresh', authController.refreshToken);

// Protected routes
router.use(authenticate);
router.post('/logout', authController.logout);
router.get('/me', authController.getMe);
router.put('/update-profile', authController.updateProfile);
router.put('/change-password', authController.changePassword);

module.exports = router;