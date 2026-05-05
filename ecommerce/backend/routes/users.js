const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const User = require('../models/User');

// All routes require admin
router.use(protect, authorize('admin'));

// GET /api/users - all users
router.get('/', async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const [users, total] = await Promise.all([
    User.find().sort('-createdAt').skip(skip).limit(Number(limit)),
    User.countDocuments(),
  ]);
  res.json({ users, pagination: { total, page: Number(page), pages: Math.ceil(total / limit) } });
});

// GET /api/users/:id
router.get('/:id', async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ user });
});

// PUT /api/users/:id - update role or status
router.put('/:id', async (req, res) => {
  const { role, isActive } = req.body;
  const user = await User.findByIdAndUpdate(
    req.params.id, { role, isActive }, { new: true }
  );
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ message: 'User updated', user });
});

module.exports = router;
