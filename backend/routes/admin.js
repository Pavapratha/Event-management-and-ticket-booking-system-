const express = require('express');
const router = express.Router();
const adminProtect = require('../config/adminAuth');
const upload = require('../config/multer');

const {
  adminLogin,
  getAdminProfile,
  getAllUsers,
  blockUser,
  getUserBookings,
  getPayments,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getReviews,
  toggleReviewVisibility,
  deleteReview,
  getSettings,
  updateSettings,
} = require('../controllers/adminController');
const {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
} = require('../controllers/eventController');
const {
  getAllBookings,
  getBookingById,
  cancelBooking,
  updateBookingStatus,
  validateQRCode,
} = require('../controllers/bookingController');
const { getDashboardStats, getReports, getEventReportData, downloadEventCSV, downloadEventPDF } = require('../controllers/reportController');
const {
  getAllNotifications,
  createNotification,
  deleteNotification,
} = require('../controllers/notificationController');

// Auth
router.post('/login', adminLogin);
router.get('/me', adminProtect, getAdminProfile);

// Dashboard
router.get('/dashboard', adminProtect, getDashboardStats);

// Users
router.get('/users', adminProtect, getAllUsers);
router.put('/users/:id/block', adminProtect, blockUser);
router.get('/users/:id/bookings', adminProtect, getUserBookings);

// Events
router.get('/events', adminProtect, getAllEvents);
router.get('/events/:id', adminProtect, getEventById);
router.post('/events', adminProtect, upload.single('image'), createEvent);
router.put('/events/:id', adminProtect, upload.single('image'), updateEvent);
router.delete('/events/:id', adminProtect, deleteEvent);
router.get('/events/:id/download-csv', adminProtect, downloadEventCSV);
router.get('/events/:id/download-pdf', adminProtect, downloadEventPDF);

// Bookings / Tickets
router.get('/bookings', adminProtect, getAllBookings);
router.get('/bookings/:id', adminProtect, getBookingById);
router.put('/bookings/:id/cancel', adminProtect, cancelBooking);
router.put('/bookings/:id/status', adminProtect, updateBookingStatus);
router.post('/bookings/qrcode/validate', adminProtect, validateQRCode);

// Payments
router.get('/payments', adminProtect, getPayments);

// Reports
router.get('/reports', adminProtect, getReports);

// Notifications
router.get('/notifications', adminProtect, getAllNotifications);
router.post('/notifications', adminProtect, createNotification);
router.delete('/notifications/:id', adminProtect, deleteNotification);

// Categories
router.get('/categories', adminProtect, getCategories);
router.post('/categories', adminProtect, createCategory);
router.put('/categories/:id', adminProtect, updateCategory);
router.delete('/categories/:id', adminProtect, deleteCategory);

// Reviews
router.get('/reviews', adminProtect, getReviews);
router.put('/reviews/:id/toggle', adminProtect, toggleReviewVisibility);
router.delete('/reviews/:id', adminProtect, deleteReview);

// Settings
router.get('/settings', adminProtect, getSettings);
router.put('/settings', adminProtect, updateSettings);

module.exports = router;

