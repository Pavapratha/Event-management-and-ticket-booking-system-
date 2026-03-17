const User = require('../models/User');
const Booking = require('../models/Booking');
const Category = require('../models/Category');
const Settings = require('../models/Settings');
const jwt = require('jsonwebtoken');

const DEFAULT_CATEGORIES = [
  { name: 'Music', icon: '🎵', color: '#8b5cf6' },
  { name: 'Sports', icon: '⚽', color: '#10b981' },
  { name: 'Technology', icon: '💻', color: '#3b82f6' },
  { name: 'Food & Drink', icon: '🍕', color: '#f59e0b' },
  { name: 'Arts', icon: '🎨', color: '#ec4899' },
  { name: 'Business', icon: '💼', color: '#6b7280' },
  { name: 'Education', icon: '📚', color: '#14b8a6' },
  { name: 'Other', icon: '🎪', color: '#ff6b00' },
];

const DEFAULT_SETTINGS = {
  siteName: 'EventHub',
  siteDescription: 'Your one-stop destination for event tickets',
  contactEmail: 'admin@eventhub.com',
  supportPhone: '',
  maintenanceMode: false,
  allowRegistrations: true,
  maxTicketsPerBooking: 10,
  currency: 'USD',
  timezone: 'UTC',
};

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// @desc    Admin login
// @route   POST /api/admin/login
// @access  Public
exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password +role');

    if (!user || user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      admin: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get admin profile
// @route   GET /api/admin/me
// @access  Admin
exports.getAdminProfile = async (req, res) => {
  res.json({
    success: true,
    admin: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
    },
  });
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Admin
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: 'user' }).sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Block / unblock a user
// @route   PUT /api/admin/users/:id/block
// @access  Admin
exports.blockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || user.role === 'admin')
      return res.status(404).json({ success: false, message: 'User not found' });

    user.isBlocked = !user.isBlocked;
    await user.save();
    res.json({ success: true, user: { _id: user._id, isBlocked: user.isBlocked } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get bookings for a specific user
// @route   GET /api/admin/users/:id/bookings
// @access  Admin
exports.getUserBookings = async (req, res) => {
  try {
    const Booking = require('../models/Booking');
    const bookings = await Booking.find({ userId: req.params.id })
      .populate('eventId', 'title date location price')
      .sort({ createdAt: -1 });
    res.json({ success: true, bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─── PAYMENTS ──────────────────────────────────────────────────────────────────

// @desc    Get all payments (from bookings)
// @route   GET /api/admin/payments
// @access  Admin
exports.getPayments = async (req, res) => {
  try {
    const Booking = require('../models/Booking');
    const payments = await Booking.find()
      .populate('userId', 'name email')
      .populate('eventId', 'title date')
      .sort({ createdAt: -1 });

    const confirmed = payments.filter((p) => p.status === 'confirmed');
    const pending = payments.filter((p) => p.status === 'pending');
    const cancelled = payments.filter((p) => p.status === 'cancelled');

    res.json({
      success: true,
      payments,
      stats: {
        totalRevenue: confirmed.reduce((s, p) => s + (p.totalAmount || 0), 0),
        completedCount: confirmed.length,
        completedRevenue: confirmed.reduce((s, p) => s + (p.totalAmount || 0), 0),
        pendingCount: pending.length,
        pendingRevenue: pending.reduce((s, p) => s + (p.totalAmount || 0), 0),
        cancelledCount: cancelled.length,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─── CATEGORIES ────────────────────────────────────────────────────────────────

exports.getCategories = async (req, res) => {
  try {
    let categories = await Category.find().sort({ name: 1 });
    if (categories.length === 0) {
      await Category.insertMany(DEFAULT_CATEGORIES);
      categories = await Category.find().sort({ name: 1 });
    }
    res.json({ success: true, categories });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const { name, icon, color } = req.body;
    if (!name)
      return res.status(400).json({ success: false, message: 'Category name is required' });
    const exists = await Category.findOne({ name: name.trim() });
    if (exists)
      return res.status(400).json({ success: false, message: 'Category already exists' });
    const category = await Category.create({ name: name.trim(), icon: icon || '🎪', color: color || '#ff6b00' });
    res.status(201).json({ success: true, category });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!category)
      return res.status(404).json({ success: false, message: 'Category not found' });
    res.json({ success: true, category });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category)
      return res.status(404).json({ success: false, message: 'Category not found' });
    res.json({ success: true, message: 'Category deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─── SETTINGS ──────────────────────────────────────────────────────────────────

exports.getSettings = async (req, res) => {
  try {
    const docs = await Settings.find();
    if (docs.length === 0) {
      const entries = Object.entries(DEFAULT_SETTINGS).map(([key, value]) => ({ key, value }));
      await Settings.insertMany(entries);
      return res.json({ success: true, settings: DEFAULT_SETTINGS });
    }
    const settings = docs.reduce((acc, s) => { acc[s.key] = s.value; return acc; }, {});
    res.json({ success: true, settings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const updates = req.body;
    const ops = Object.entries(updates).map(([key, value]) =>
      Settings.findOneAndUpdate({ key }, { value }, { upsert: true, new: true })
    );
    await Promise.all(ops);
    res.json({ success: true, message: 'Settings updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
