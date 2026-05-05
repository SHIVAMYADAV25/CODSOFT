const Cart = require('../models/Cart');
const Product = require('../models/Product');

// @desc    Get cart
// @route   GET /api/cart
// @access  Private
const getCart = async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id }).populate('items.product', 'name images price stock slug');
  res.json({ cart: cart || { items: [], subtotal: 0 } });
};

// @desc    Add/update item in cart
// @route   POST /api/cart
// @access  Private
const addToCart = async (req, res) => {
  const { productId, quantity = 1 } = req.body;

  const product = await Product.findById(productId);
  if (!product || !product.isActive) {
    return res.status(404).json({ error: 'Product not found' });
  }
  if (product.stock < quantity) {
    return res.status(400).json({ error: 'Not enough stock available' });
  }

  let cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    cart = new Cart({ user: req.user._id, items: [] });
  }

  const existingItem = cart.items.find(
    (item) => item.product.toString() === productId
  );

  if (existingItem) {
    existingItem.quantity = quantity;
    existingItem.price = product.price;
  } else {
    cart.items.push({ product: productId, quantity, price: product.price });
  }

  await cart.save();
  await cart.populate('items.product', 'name images price stock slug');

  res.json({ message: 'Cart updated', cart });
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/:productId
// @access  Private
const removeFromCart = async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) return res.status(404).json({ error: 'Cart not found' });

  cart.items = cart.items.filter(
    (item) => item.product.toString() !== req.params.productId
  );
  await cart.save();
  await cart.populate('items.product', 'name images price stock slug');

  res.json({ message: 'Item removed', cart });
};

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private
const clearCart = async (req, res) => {
  await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });
  res.json({ message: 'Cart cleared' });
};

module.exports = { getCart, addToCart, removeFromCart, clearCart };
