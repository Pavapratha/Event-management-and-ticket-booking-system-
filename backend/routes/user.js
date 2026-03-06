const express = require('express');
const router = express.Router();
const protect = require('../config/auth');
const { createBooking, getUserBookings } = require('../controllers/bookingController');
const { getUserNotifications, markAsRead } = require('../controllers/notificationController');

// Public event browsing
const Event = require('../models/Event');

// Get all active events (public)
router.get('/events', async (req, res) => {
  try {
    const { search, category, date } = req.query;
    const query = { status: 'active' };

    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }
    if (category && category !== 'All') {
      query.category = category;
    }
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      query.date = { $gte: startOfDay, $lte: endOfDay };
    }

    const events = await Event.find(query).sort({ date: 1 });
    res.json({ success: true, events });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get single event (public)
router.get('/events/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    res.json({ success: true, event });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Bookings (protected)
router.post('/bookings', protect, createBooking);
router.get('/bookings/my', protect, getUserBookings);

// Notifications (user)
router.get('/notifications', protect, getUserNotifications);
router.put('/notifications/:id/read', protect, markAsRead);

module.exports = router;
