const express = require('express');
const router = express.Router();
const adminProtect = require('../config/adminAuth');
const upload = require('../config/multer');

const { adminLogin, getAdminProfile, getAllUsers } = require('../controllers/adminController');
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
} = require('../controllers/bookingController');
const { getDashboardStats, getReports } = require('../controllers/reportController');
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

// Events
router.get('/events', adminProtect, getAllEvents);
router.get('/events/:id', adminProtect, getEventById);
router.post('/events', adminProtect, upload.single('image'), createEvent);
router.put('/events/:id', adminProtect, upload.single('image'), updateEvent);
router.delete('/events/:id', adminProtect, deleteEvent);

// Bookings
router.get('/bookings', adminProtect, getAllBookings);
router.get('/bookings/:id', adminProtect, getBookingById);
router.put('/bookings/:id/cancel', adminProtect, cancelBooking);
router.put('/bookings/:id/status', adminProtect, updateBookingStatus);

// Reports
router.get('/reports', adminProtect, getReports);

// Notifications
router.get('/notifications', adminProtect, getAllNotifications);
router.post('/notifications', adminProtect, createNotification);
router.delete('/notifications/:id', adminProtect, deleteNotification);

module.exports = router;
