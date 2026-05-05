const User = require('../models/User');
const { generateToken } = require('../middleware/auth');

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  const { name, email, password } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(409).json({ error: 'Email already registered' });
  }

  const user = await User.create({ name, email, password });
  const token = generateToken(user._id);

  res.status(201).json({
    message: 'Registration successful',
    token,
    user,
  });
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  if (!user.isActive) {
    return res.status(403).json({ error: 'Account has been deactivated' });
  }

  // Update last login
  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  const token = generateToken(user._id);

  res.json({
    message: 'Login successful',
    token,
    user,
  });
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  const user = await User.findById(req.user._id).populate('wishlist', 'name price images slug');
  res.json({ user });
};

// @desc    Update profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  const { name, phone, addresses } = req.body;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { name, phone, addresses },
    { new: true, runValidators: true }
  );

  res.json({ message: 'Profile updated', user });
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select('+password');
  if (!(await user.comparePassword(currentPassword))) {
    return res.status(401).json({ error: 'Current password is incorrect' });
  }

  user.password = newPassword;
  await user.save();

  res.json({ message: 'Password changed successfully' });
};

// @desc    Toggle wishlist
// @route   POST /api/auth/wishlist/:productId
// @access  Private
const toggleWishlist = async (req, res) => {
  const user = await User.findById(req.user._id);
  const { productId } = req.params;

  const idx = user.wishlist.indexOf(productId);
  let action;

  if (idx === -1) {
    user.wishlist.push(productId);
    action = 'added';
  } else {
    user.wishlist.splice(idx, 1);
    action = 'removed';
  }

  await user.save({ validateBeforeSave: false });
  res.json({ message: `Product ${action} from wishlist`, wishlist: user.wishlist });
};

module.exports = { register, login, getMe, updateProfile, changePassword, toggleWishlist };
