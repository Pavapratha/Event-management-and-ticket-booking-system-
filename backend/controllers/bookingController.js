const Booking = require('../models/Booking');
const Event = require('../models/Event');
const User = require('../models/User');
const { v4: uuidv4 } = require('uuid');
const QRCode = require('qrcode');
const { sendConfirmationEmail } = require('./emailController');
const { createBookingConfirmationNotification } = require('./notificationController');
const { buildInvoiceFilename, generateInvoicePdf } = require('../utils/invoiceGenerator');

const ensureInvoiceMetadata = (booking) => {
  if (!booking.invoiceNumber) {
    booking.invoiceNumber = `INV-${booking.bookingId || String(booking._id).slice(-6).toUpperCase()}`;
  }

  if (!booking.invoiceGeneratedAt) {
    booking.invoiceGeneratedAt = new Date();
  }
};

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
// @route   GET /api/bookings/:id
// @access  Protected (user)
exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('userId', 'name email')
      .populate('eventId', 'title date time location price image venue pickupInstructions');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Ensure user can only access their own bookings
    if (booking.userId._id.toString() !== req.userId && req.userRole !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    res.json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Create pending booking with ticket categories
// @route   POST /api/bookings
// @access  Protected (user)
exports.createBooking = async (req, res) => {
  try {
    const { eventId, ticketDetails } = req.body;

    if (!eventId || !ticketDetails || !Array.isArray(ticketDetails) || ticketDetails.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Event ID and ticket details are required',
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

    // Validate ticket details and calculate totals
    let totalQuantity = 0;
    let subtotalAmount = 0;
    const validatedTickets = [];

    // If event has no ticketCategories, use base price as default
    const hasCategories = event.ticketCategories && event.ticketCategories.length > 0;

    for (const ticket of ticketDetails) {
      let category;

      if (hasCategories) {
        category = event.ticketCategories.find(
          (cat) => cat._id.toString() === ticket.categoryId
        );
      } else if (ticket.categoryId === 'default') {
        // Fallback: event has no categories, use base event price
        category = {
          _id: 'default',
          name: 'General Admission',
          price: event.price || 0,
          availableQuantity: event.availableSeats || 0,
        };
      }

      if (!category) {
        return res.status(400).json({
          success: false,
          message: `Ticket category ${ticket.categoryId} not found`,
        });
      }

      if (ticket.quantity < 1) {
        return res.status(400).json({
          success: false,
          message: 'Ticket quantity must be at least 1',
        });
      }

      if (category.availableQuantity < ticket.quantity) {
        return res.status(400).json({
          success: false,
          message: `Only ${category.availableQuantity} ${category.name} tickets available`,
        });
      }

      const subtotal = category.price * ticket.quantity;
      validatedTickets.push({
        categoryId: category._id.toString(),
        categoryName: category.name,
        price: category.price,
        quantity: ticket.quantity,
        subtotal: subtotal,
      });

      totalQuantity += ticket.quantity;
      subtotalAmount += subtotal;
    }

    const bookingFee = 100; // Fixed booking fee
    const totalAmount = subtotalAmount + bookingFee;
    const bookingId = 'BK-' + uuidv4().split('-')[0].toUpperCase();

    // Create pending booking (seats not deducted yet)
    const booking = await Booking.create({
      bookingId,
      userId: req.userId,
      eventId,
      ticketDetails: validatedTickets,
      ticketQuantity: totalQuantity,
      subtotalAmount,
      bookingFee,
      totalAmount,
      status: 'pending',
    });

    const populatedBooking = await Booking.findById(booking._id)
      .populate('eventId', 'title date time location price image venue');

    res.status(201).json({ success: true, booking: populatedBooking });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Confirm pending booking (after payment)
// @route   PATCH /api/bookings/:id/confirm
// @access  Protected (user)
exports.confirmBooking = async (req, res) => {
  try {
    const { paymentDetails } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Ensure user owns this booking
    if (booking.userId.toString() !== req.userId) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    if (booking.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending bookings can be confirmed',
      });
    }

    // Verify availability one more time
    const event = await Event.findById(booking.eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    const hasCategories = event.ticketCategories && event.ticketCategories.length > 0;

    for (const ticket of booking.ticketDetails) {
      if (hasCategories) {
        const category = event.ticketCategories.find(
          (cat) => cat._id.toString() === ticket.categoryId
        );
        if (!category || category.availableQuantity < ticket.quantity) {
          return res.status(400).json({
            success: false,
            message: `${ticket.categoryName} tickets no longer available`,
          });
        }
      } else {
        // Default category — check overall availableSeats
        if (event.availableSeats < ticket.quantity) {
          return res.status(400).json({
            success: false,
            message: `${ticket.categoryName} tickets no longer available`,
          });
        }
      }
    }

    // Deduct from available quantities
    for (const ticket of booking.ticketDetails) {
      if (hasCategories) {
        const category = event.ticketCategories.find(
          (cat) => cat._id.toString() === ticket.categoryId
        );
        if (category) {
          category.availableQuantity -= ticket.quantity;
        }
      }
    }

    event.availableSeats -= booking.ticketQuantity;
    await event.save();

    // Generate QR code
    const qrData = JSON.stringify({
      bookingId: booking.bookingId,
      eventTitle: event.title,
      eventDate: event.date,
      ticketQuantity: booking.ticketQuantity,
      totalAmount: booking.totalAmount,
    });
    const qrCode = await QRCode.toDataURL(qrData);

    // Update booking status
    booking.status = 'confirmed';
    booking.qrCode = qrCode;
    booking.paymentDetails = paymentDetails;
    ensureInvoiceMetadata(booking);
    await booking.save();

    const populatedBooking = await Booking.findById(booking._id)
      .populate('userId', 'name email')
      .populate('eventId', 'title date time location price image venue pickupInstructions');

    // Send confirmation email (non-blocking)
    try {
      await sendConfirmationEmail(populatedBooking);
    } catch (emailErr) {
      console.error('❌ Email sending failed:', emailErr.message);
      // Don't block booking response if email fails
    }

    // Create booking confirmation notification
    try {
      await createBookingConfirmationNotification(populatedBooking);
    } catch (notifErr) {
      console.error('❌ Notification creation failed:', notifErr.message);
      // Don't block booking response if notification creation fails
    }

    res.json({ success: true, booking: populatedBooking });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Download booking invoice PDF
// @route   GET /api/bookings/:id/invoice
// @access  Protected (user)
exports.downloadBookingInvoice = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('userId', 'name email role')
      .populate('eventId', 'title date time location venue price');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.userId._id.toString() !== req.userId && req.userRole !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    if (booking.status !== 'confirmed') {
      return res.status(400).json({
        success: false,
        message: 'Invoice is available only for confirmed bookings',
      });
    }

    let requiresSave = false;
    if (!booking.invoiceNumber || !booking.invoiceGeneratedAt) {
      ensureInvoiceMetadata(booking);
      requiresSave = true;
    }

    if (requiresSave) {
      await booking.save();
    }

    const filename = buildInvoiceFilename(booking);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    res.on('error', (streamError) => {
      console.error('Invoice response stream error:', streamError.message);
    });

    generateInvoicePdf(booking, res);
  } catch (error) {
    console.error('Invoice download failed:', error);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: 'Failed to generate invoice PDF' });
    }
  }
};

// @desc    Get user bookings
// @route   GET /api/bookings
// @access  Protected (user)
exports.getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.userId })
      .populate('eventId', 'title date time location price image category venue')
      .sort({ createdAt: -1 });

    res.json({ success: true, bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Cancel booking (user or admin)
// @route   DELETE /api/bookings/:id
// @access  Protected (user/admin)
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Ensure user owns booking or is admin
    if (booking.userId.toString() !== req.userId && req.userRole !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Booking already cancelled' });
    }

    // Restore seats to event only if booking was confirmed
    if (booking.status === 'confirmed') {
      const event = await Event.findById(booking.eventId);
      if (event) {
        // Restore available quantities for each category
        for (const ticket of booking.ticketDetails) {
          const category = event.ticketCategories.find(
            (cat) => cat._id.toString() === ticket.categoryId
          );
          if (category) {
            category.availableQuantity += ticket.quantity;
          }
        }
        event.availableSeats += booking.ticketQuantity;
        await event.save();
      }
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

    const event = await Event.findById(booking.eventId);

    // Restore seats if transitioning to cancelled
    if (status === 'cancelled' && booking.status !== 'cancelled') {
      if (event) {
        for (const ticket of booking.ticketDetails) {
          const category = event.ticketCategories.find(
            (cat) => cat._id.toString() === ticket.categoryId
          );
          if (category) {
            category.availableQuantity += ticket.quantity;
          }
        }
        event.availableSeats += booking.ticketQuantity;
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

// @desc    Validate QR code at venue entry
// @route   POST /api/bookings/qrcode/validate
// @access  Admin (venue staff)
exports.validateQRCode = async (req, res) => {
  try {
    const { bookingId, qrCode } = req.body;

    if (!bookingId && !qrCode) {
      return res.status(400).json({
        success: false,
        message: 'Booking ID or QR code is required',
      });
    }

    let booking;

    if (bookingId) {
      // Search by booking ID
      booking = await Booking.findOne({ bookingId })
        .populate('userId', 'name email phone')
        .populate('eventId', 'title date time location venue');
    } else if (qrCode) {
      // If QR code is provided, it contains the booking data
      try {
        const qrData = JSON.parse(qrCode);
        booking = await Booking.findOne({ bookingId: qrData.bookingId })
          .populate('userId', 'name email phone')
          .populate('eventId', 'title date time location venue');
      } catch (parseError) {
        return res.status(400).json({
          success: false,
          message: 'Invalid QR code format',
        });
      }
    }

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    // Check if booking is confirmed
    if (booking.status !== 'confirmed') {
      return res.status(400).json({
        success: false,
        message: `Cannot validate ticket. Booking status is ${booking.status}`,
      });
    }

    // Check if ticket has already been used
    if (booking.isUsed) {
      return res.status(400).json({
        success: false,
        message: 'This ticket has already been used',
        usedAt: booking.usedAt,
      });
    }

    // Mark ticket as used
    booking.isUsed = true;
    booking.usedAt = new Date();
    booking.validatedBy = req.userId; // Admin/staff ID
    await booking.save();

    res.json({
      success: true,
      message: 'Ticket validated successfully',
      booking: {
        bookingId: booking.bookingId,
        userName: booking.userId.name,
        userEmail: booking.userId.email,
        userPhone: booking.userId.phone,
        eventTitle: booking.eventId.title,
        eventDate: booking.eventId.date,
        eventTime: booking.eventId.time,
        eventVenue: booking.eventId.venue,
        ticketQuantity: booking.ticketQuantity,
        totalAmount: booking.totalAmount,
        validatedAt: booking.usedAt,
        ticketDetails: booking.ticketDetails,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

