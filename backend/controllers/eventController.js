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

    if (!title || !description || !category || !date || !time || !location || !price || !totalSeats) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
    }

    const imageUrl = req.file
      ? `/uploads/events/${req.file.filename}`
      : '';

    const event = await Event.create({
      title,
      description,
      category,
      date,
      time,
      location,
      price: Number(price),
      totalSeats: Number(totalSeats),
      availableSeats: Number(totalSeats),
      image: imageUrl,
      createdBy: req.user._id,
    });

    res.status(201).json({ success: true, event });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
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

    // Handle image update
    if (req.file) {
      // Delete old image if it exists and is local
      if (event.image && event.image.startsWith('/uploads/')) {
        const oldPath = path.join(__dirname, '..', event.image);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
      event.image = `/uploads/events/${req.file.filename}`;
    }

    if (title) event.title = title;
    if (description) event.description = description;
    if (category) event.category = category;
    if (date) event.date = date;
    if (time) event.time = time;
    if (location) event.location = location;
    if (price !== undefined) event.price = Number(price);
    if (status) event.status = status;

    // If total seats changed, update available seats proportionally
    if (totalSeats !== undefined) {
      const soldSeats = event.totalSeats - event.availableSeats;
      event.totalSeats = Number(totalSeats);
      event.availableSeats = Math.max(0, Number(totalSeats) - soldSeats);
    }

    await event.save();
    res.json({ success: true, event });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
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

    // Delete image if local
    if (event.image && event.image.startsWith('/uploads/')) {
      const imgPath = path.join(__dirname, '..', event.image);
      if (fs.existsSync(imgPath)) {
        fs.unlinkSync(imgPath);
      }
    }

    await Event.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
