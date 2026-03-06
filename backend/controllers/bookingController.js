const Booking = require('../models/Booking');
const Event = require('../models/Event');
const User = require('../models/User');
const { v4: uuidv4 } = require('uuid');
const QRCode = require('qrcode');

// @desc    Get all bookings (admin)
// @route   GET /api/admin/bookings
// @access  Admin
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('userId', 'name email')
      .populate('eventId', 'title date location price')
      .sort({ createdAt: -1 });

    res.json({ success: true, bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get single booking details
// @route   GET /api/admin/bookings/:id
// @access  Admin
exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('userId', 'name email')
      .populate('eventId', 'title date time location price image');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    res.json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Create booking (user-facing)
// @route   POST /api/bookings
// @access  Protected (user)
exports.createBooking = async (req, res) => {
  try {
    const { eventId, ticketQuantity } = req.body;

    if (!eventId || !ticketQuantity) {
      return res.status(400).json({
        success: false,
        message: 'Event ID and ticket quantity are required',
      });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    if (event.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'This event is not available for booking',
      });
    }

    if (event.availableSeats < ticketQuantity) {
      return res.status(400).json({
        success: false,
        message: `Only ${event.availableSeats} seats available`,
      });
    }

    const bookingId = 'BK-' + uuidv4().split('-')[0].toUpperCase();
    const totalAmount = event.price * ticketQuantity;

    // Generate QR code
    const qrData = JSON.stringify({
      bookingId,
      eventTitle: event.title,
      eventDate: event.date,
      ticketQuantity,
      totalAmount,
    });
    const qrCode = await QRCode.toDataURL(qrData);

    const booking = await Booking.create({
      bookingId,
      userId: req.userId,
      eventId,
      ticketQuantity,
      totalAmount,
      status: 'confirmed',
      qrCode,
    });

    // Decrement available seats
    event.availableSeats -= ticketQuantity;
    await event.save();

    const populatedBooking = await Booking.findById(booking._id)
      .populate('userId', 'name email')
      .populate('eventId', 'title date time location price image');

    res.status(201).json({ success: true, booking: populatedBooking });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get user bookings
// @route   GET /api/bookings/my
// @access  Protected (user)
exports.getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.userId })
      .populate('eventId', 'title date time location price image category')
      .sort({ createdAt: -1 });

    res.json({ success: true, bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Cancel booking (admin)
// @route   PUT /api/admin/bookings/:id/cancel
// @access  Admin
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Booking already cancelled' });
    }

    const event = await Event.findById(booking.eventId);
    if (event) {
      event.availableSeats += booking.ticketQuantity;
      await event.save();
    }

    booking.status = 'cancelled';
    await booking.save();

    res.json({ success: true, message: 'Booking cancelled successfully', booking });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update booking status (admin)
// @route   PUT /api/admin/bookings/:id/status
// @access  Admin
exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['pending', 'confirmed', 'cancelled'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Restore seats if transitioning to cancelled
    if (status === 'cancelled' && booking.status !== 'cancelled') {
      const event = await Event.findById(booking.eventId);
      if (event) {
        event.availableSeats += booking.ticketQuantity;
        await event.save();
      }
    }

    // Decrement seats if transitioning from cancelled to active
    if (booking.status === 'cancelled' && status !== 'cancelled') {
      const event = await Event.findById(booking.eventId);
      if (event && event.availableSeats >= booking.ticketQuantity) {
        event.availableSeats -= booking.ticketQuantity;
        await event.save();
      }
    }

    booking.status = status;
    await booking.save();

    res.json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
