const Order = require('../models/Order');
const Product = require('../models/Product');

// @desc    Create order
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res) => {
  const { items, shippingAddress, paymentMethod, notes } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ error: 'No items in order' });
  }

  // Verify products and stock
  const orderItems = [];
  let subtotal = 0;

  for (const item of items) {
    const product = await Product.findById(item.product);
    if (!product || !product.isActive) {
      return res.status(404).json({ error: `Product not found: ${item.product}` });
    }
    if (product.stock < item.quantity) {
      return res.status(400).json({ error: `Insufficient stock for: ${product.name}` });
    }

    orderItems.push({
      product: product._id,
      name: product.name,
      image: product.images[0],
      price: product.price,
      quantity: item.quantity,
    });
    subtotal += product.price * item.quantity;

    // Deduct stock
    product.stock -= item.quantity;
    await product.save();
  }

  const shippingCost = subtotal > 75 ? 0 : 9.99;
  const tax = Math.round(subtotal * 0.08 * 100) / 100;
  const total = Math.round((subtotal + shippingCost + tax) * 100) / 100;

  const order = await Order.create({
    user: req.user._id,
    items: orderItems,
    shippingAddress,
    paymentMethod,
    subtotal,
    shippingCost,
    tax,
    total,
    notes,
  });

  res.status(201).json({ message: 'Order placed successfully', order });
};

// @desc    Get my orders
// @route   GET /api/orders/my
// @access  Private
const getMyOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user._id })
    .sort('-createdAt')
    .populate('items.product', 'name images slug');
  res.json({ orders });
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
const getOrder = async (req, res) => {
  const order = await Order.findById(req.params.id).populate('items.product');

  if (!order) return res.status(404).json({ error: 'Order not found' });

  // Only owner or admin can view
  if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Not authorized' });
  }

  res.json({ order });
};

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
const markPaid = async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });

  order.isPaid = true;
  order.paidAt = new Date();
  order.status = 'processing';
  order.paymentResult = req.body.paymentResult;
  await order.save();

  res.json({ message: 'Order marked as paid', order });
};

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
const cancelOrder = async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });

  if (['shipped', 'delivered'].includes(order.status)) {
    return res.status(400).json({ error: 'Cannot cancel order that has been shipped' });
  }

  order.status = 'cancelled';

  // Restore stock
  for (const item of order.items) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: item.quantity },
    });
  }

  await order.save();
  res.json({ message: 'Order cancelled', order });
};

// @desc    Get all orders (admin)
// @route   GET /api/orders
// @access  Admin
const getAllOrders = async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const query = status ? { status } : {};
  const skip = (Number(page) - 1) * Number(limit);

  const [orders, total] = await Promise.all([
    Order.find(query)
      .sort('-createdAt')
      .skip(skip)
      .limit(Number(limit))
      .populate('user', 'name email'),
    Order.countDocuments(query),
  ]);

  res.json({ orders, pagination: { total, page: Number(page), pages: Math.ceil(total / limit) } });
};

// @desc    Update order status (admin)
// @route   PUT /api/orders/:id/status
// @access  Admin
const updateOrderStatus = async (req, res) => {
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status, ...(req.body.status === 'delivered' ? { isDelivered: true, deliveredAt: new Date() } : {}) },
    { new: true }
  );
  if (!order) return res.status(404).json({ error: 'Order not found' });
  res.json({ message: 'Status updated', order });
};

module.exports = { createOrder, getMyOrders, getOrder, markPaid, cancelOrder, getAllOrders, updateOrderStatus };
