const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  createOrder, getMyOrders, getOrder, markPaid,
  cancelOrder, getAllOrders, updateOrderStatus,
} = require('../controllers/orderController');

router.post('/', protect, createOrder);
router.get('/my', protect, getMyOrders);
router.get('/:id', protect, getOrder);
router.put('/:id/pay', protect, markPaid);
router.put('/:id/cancel', protect, cancelOrder);

// Admin
router.get('/', protect, authorize('admin'), getAllOrders);
router.put('/:id/status', protect, authorize('admin'), updateOrderStatus);

module.exports = router;
