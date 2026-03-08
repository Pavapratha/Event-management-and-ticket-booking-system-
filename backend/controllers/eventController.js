const Event = require('../models/Event');
const Booking = require('../models/Booking');
const path = require('path');
const fs = require('fs');

// @desc    Get all events
// @route   GET /api/admin/events
// @access  Admin
exports.getAllEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ createdAt: -1 });

    // Attach tickets sold count
    const eventsWithStats = await Promise.all(
      events.map(async (event) => {
        const ticketsSold = await Booking.aggregate([
          { $match: { eventId: event._id, status: { $ne: 'cancelled' } } },
          { $group: { _id: null, total: { $sum: '$ticketQuantity' } } },
        ]);
        return {
          ...event.toObject(),
          ticketsSold: ticketsSold[0]?.total || 0,
        };
      })
    );

    res.json({ success: true, events: eventsWithStats });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get single event
// @route   GET /api/admin/events/:id
// @access  Admin
exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    res.json({ success: true, event });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Create event
// @route   POST /api/admin/events
// @access  Admin
exports.createEvent = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      date,
      time,
      location,
      price,
      totalSeats,
    } = req.body;

    // Validation with detailed error messages
    if (!title || title.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid event title',
        field: 'title',
      });
    }

    if (!description || description.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid event description',
        field: 'description',
      });
    }

    if (!category) {
      return res.status(400).json({
        success: false,
        message: 'Please select a valid category',
        field: 'category',
      });
    }

    const validCategories = ['Music', 'Sports', 'Technology', 'Food & Drink', 'Arts', 'Business', 'Education', 'Other'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: `Invalid category. Must be one of: ${validCategories.join(', ')}`,
        field: 'category',
      });
    }

    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an event date',
        field: 'date',
      });
    }

    const eventDate = new Date(date);
    if (isNaN(eventDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid event date',
        field: 'date',
      });
    }

    if (!time || time.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Please provide an event time',
        field: 'time',
      });
    }

    if (!location || location.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Please provide an event location',
        field: 'location',
      });
    }

    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice < 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid ticket price (must be a number >= 0)',
        field: 'price',
      });
    }

    const numSeats = Number(totalSeats);
    if (isNaN(numSeats) || numSeats < 1) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid total seats (must be a number >= 1)',
        field: 'totalSeats',
      });
    }

    console.log('\n' + '='.repeat(60));
    console.log('📝 EVENT CREATION STARTED');
    console.log('='.repeat(60));
    console.log('Admin User ID:', req.user._id);
    console.log('Event Title:', title);
    console.log('Category:', category);
    console.log('Date:', date);
    console.log('Price (LKR):', numPrice);
    console.log('Total Seats:', numSeats);
    console.log('Image Upload:', req.file ? `Yes - ${req.file.filename}` : 'No');

    const imageUrl = req.file
      ? `/uploads/events/${req.file.filename}`
      : '';

    const event = await Event.create({
      title: title.trim(),
      description: description.trim(),
      category,
      date: eventDate,
      time,
      location: location.trim(),
      price: numPrice,
      totalSeats: numSeats,
      availableSeats: numSeats,
      image: imageUrl,
      createdBy: req.user._id,
    });

    console.log('✅ Event created successfully');
    console.log('Event ID:', event._id);
    console.log('='.repeat(60) + '\n');

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      event,
    });
  } catch (error) {
    console.error('\n' + '='.repeat(60));
    console.error('❌ EVENT CREATION ERROR');
    console.error('='.repeat(60));
    console.error('Error Message:', error.message);
    console.error('Error Stack:', error.stack);
    console.error('='.repeat(60) + '\n');

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: messages,
      });
    }

    // Handle duplicate field error (shouldn't happen for events, but just in case)
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'An event with that title already exists',
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create event',
    });
  }
};

// @desc    Update event
// @route   PUT /api/admin/events/:id
// @access  Admin
exports.updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    const {
      title,
      description,
      category,
      date,
      time,
      location,
      price,
      totalSeats,
      status,
    } = req.body;

    console.log('\n' + '='.repeat(60));
    console.log('📝 EVENT UPDATE STARTED');
    console.log('='.repeat(60));
    console.log('Event ID:', req.params.id);
    console.log('Previous Title:', event.title);

    // Handle image update
    if (req.file) {
      // Delete old image if it exists and is local
      if (event.image && event.image.startsWith('/uploads/')) {
        const oldPath = path.join(__dirname, '..', event.image);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
          console.log('Old image deleted:', oldPath);
        }
      }
      event.image = `/uploads/events/${req.file.filename}`;
      console.log('New image set:', event.image);
    }

    if (title) {
      event.title = title.trim();
      console.log('Title updated:', event.title);
    }
    if (description) {
      event.description = description.trim();
    }
    if (category) {
      event.category = category;
      console.log('Category updated:', event.category);
    }
    if (date) {
      event.date = new Date(date);
      console.log('Date updated:', event.date);
    }
    if (time) {
      event.time = time;
    }
    if (location) {
      event.location = location.trim();
      console.log('Location updated:', event.location);
    }
    if (price !== undefined) {
      event.price = Number(price);
      console.log('Price updated (LKR):', event.price);
    }
    if (status) {
      event.status = status;
      console.log('Status updated:', event.status);
    }

    // If total seats changed, update available seats proportionally
    if (totalSeats !== undefined) {
      const soldSeats = event.totalSeats - event.availableSeats;
      const newTotalSeats = Number(totalSeats);
      event.totalSeats = newTotalSeats;
      event.availableSeats = Math.max(0, newTotalSeats - soldSeats);
      console.log('Seats updated. Total:', event.totalSeats, 'Available:', event.availableSeats);
    }

    await event.save();

    console.log('✅ Event updated successfully');
    console.log('='.repeat(60) + '\n');

    res.json({ success: true, message: 'Event updated successfully', event });
  } catch (error) {
    console.error('\n' + '='.repeat(60));
    console.error('❌ EVENT UPDATE ERROR');
    console.error('='.repeat(60));
    console.error('Error:', error.message);
    console.error('='.repeat(60) + '\n');

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: messages,
      });
    }

    res.status(500).json({ success: false, message: error.message || 'Failed to update event' });
  }
};

// @desc    Delete event
// @route   DELETE /api/admin/events/:id
// @access  Admin
exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    console.log('\n' + '='.repeat(60));
    console.log('🗑️  EVENT DELETION STARTED');
    console.log('='.repeat(60));
    console.log('Event ID:', req.params.id);
    console.log('Event Title:', event.title);

    // Delete image if local
    if (event.image && event.image.startsWith('/uploads/')) {
      const imgPath = path.join(__dirname, '..', event.image);
      if (fs.existsSync(imgPath)) {
        fs.unlinkSync(imgPath);
        console.log('Image deleted:', imgPath);
      }
    }

    // Delete all bookings for this event
    const deletedBookings = await Booking.deleteMany({ eventId: req.params.id });
    console.log(`${deletedBookings.deletedCount} booking(s) deleted`);

    // Delete the event
    await Event.findByIdAndDelete(req.params.id);

    console.log('✅ Event deleted successfully');
    console.log('='.repeat(60) + '\n');

    res.json({
      success: true,
      message: 'Event deleted successfully',
      bookingsDeleted: deletedBookings.deletedCount,
    });
  } catch (error) {
    console.error('\n' + '='.repeat(60));
    console.error('❌ EVENT DELETION ERROR');
    console.error('='.repeat(60));
    console.error('Error:', error.message);
    console.error('='.repeat(60) + '\n');

    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete event',
    });
  }
};
