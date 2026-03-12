const mongoose = require('mongoose');

const ticketCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  totalQuantity: {
    type: Number,
    required: true,
    min: 1,
  },
  availableQuantity: {
    type: Number,
    required: true,
    min: 0,
  },
});

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Event description is required'],
    },
    category: {
      type: String,
      required: [true, 'Event category is required'],
      enum: ['Music', 'Sports', 'Technology', 'Food & Drink', 'Arts', 'Business', 'Education', 'Other'],
    },
    date: {
      type: Date,
      required: [true, 'Event date is required'],
    },
    time: {
      type: String,
      required: [true, 'Event time is required'],
    },
    location: {
      type: String,
      required: [true, 'Event location is required'],
    },
    venue: {
      type: String,
      default: '',
    },
    price: {
      type: Number,
      required: [true, 'Ticket price is required'],
      min: 0,
    },
    totalSeats: {
      type: Number,
      required: [true, 'Total seats is required'],
      min: 1,
    },
    availableSeats: {
      type: Number,
      required: true,
    },
    ticketCategories: [ticketCategorySchema],
    image: {
      type: String,
      default: '',
    },
    pickupInstructions: {
      type: String,
      default: 'Please collect your tickets from the box office 30 minutes before the event starts.',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    status: {
      type: String,
      enum: ['active', 'cancelled', 'completed'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Event', eventSchema);
