const Product = require('../models/Product');

// @desc    Get all products (with filtering, sorting, pagination)
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  const {
    search, category, minPrice, maxPrice,
    sort = '-createdAt', page = 1, limit = 12,
    featured, brand,
  } = req.query;

  const query = { isActive: true };

  if (search) {
    query.$text = { $search: search };
  }
  if (category) query.category = category;
  if (brand) query.brand = brand;
  if (featured === 'true') query.featured = true;
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }

  const skip = (Number(page) - 1) * Number(limit);
  const [products, total] = await Promise.all([
    Product.find(query).sort(sort).skip(skip).limit(Number(limit)),
    Product.countDocuments(query),
  ]);

  res.json({
    products,
    pagination: {
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      limit: Number(limit),
    },
  });
};

// @desc    Get single product
// @route   GET /api/products/:slug
// @access  Public
const getProduct = async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug, isActive: true })
    .populate('reviews.user', 'name avatar');

  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  res.json({ product });
};

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
const getFeatured = async (req, res) => {
  const products = await Product.find({ featured: true, isActive: true }).limit(8);
  res.json({ products });
};

// @desc    Create product (admin)
// @route   POST /api/products
// @access  Admin
const createProduct = async (req, res) => {
  const product = await Product.create(req.body);
  res.status(201).json({ message: 'Product created', product });
};

// @desc    Update product (admin)
// @route   PUT /api/products/:id
// @access  Admin
const updateProduct = async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json({ message: 'Product updated', product });
};

// @desc    Delete product (admin)
// @route   DELETE /api/products/:id
// @access  Admin
const deleteProduct = async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, { isActive: false });
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json({ message: 'Product deleted' });
};

// @desc    Add product review
// @route   POST /api/products/:id/reviews
// @access  Private
const addReview = async (req, res) => {
  const { rating, comment } = req.body;
  const product = await Product.findById(req.params.id);

  if (!product) return res.status(404).json({ error: 'Product not found' });

  const alreadyReviewed = product.reviews.find(
    (r) => r.user.toString() === req.user._id.toString()
  );
  if (alreadyReviewed) {
    return res.status(400).json({ error: 'You already reviewed this product' });
  }

  product.reviews.push({ user: req.user._id, name: req.user.name, rating, comment });
  product.updateRating();
  await product.save();

  res.status(201).json({ message: 'Review added', rating: product.rating });
};

// @desc    Get categories
// @route   GET /api/products/categories
// @access  Public
const getCategories = async (req, res) => {
  const categories = await Product.distinct('category', { isActive: true });
  res.json({ categories });
};

module.exports = {
  getProducts, getProduct, getFeatured, createProduct,
  updateProduct, deleteProduct, addReview, getCategories,
};
