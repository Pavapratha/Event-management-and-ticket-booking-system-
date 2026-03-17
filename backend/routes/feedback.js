const express = require('express');
const router = express.Router();
const protect = require('../config/auth');
const adminProtect = require('../config/adminAuth');
const {
  submitFeedback,
  getUserFeedback,
  getPublicFeedback,
  getAllFeedback,
  getFeedbackById,
  markAsReviewed,
  updateFeedbackStatus,
  deleteFeedback,
  getFeedbackStats,
} = require('../controllers/feedbackController');

// Public Routes
router.get('/public', getPublicFeedback);

// User Routes (Protected)
router.post('/', protect, submitFeedback);
router.get('/user/my-feedback', protect, getUserFeedback);

// Admin Routes (Admin Protected)
router.get('/admin/all', adminProtect, getAllFeedback);
router.get('/admin/stats', adminProtect, getFeedbackStats);
router.get('/admin/:id', adminProtect, getFeedbackById);
router.put('/admin/:id/review', adminProtect, markAsReviewed);
router.put('/admin/:id/status', adminProtect, updateFeedbackStatus);
router.delete('/admin/:id', adminProtect, deleteFeedback);

module.exports = router;
