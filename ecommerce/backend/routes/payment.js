const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { createPaymentIntent, webhook } = require('../controllers/paymentController');

router.post('/intent', protect, createPaymentIntent);
router.post('/webhook', webhook); // raw body handled in server.js

module.exports = router;
