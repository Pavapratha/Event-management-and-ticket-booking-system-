const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null, // null = broadcast to all users
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      default: null,
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      default: null,
    },
    message: {
      type: String,
      required: [true, 'Notification message is required'],
    },
    title: {
      type: String,
      required: [true, 'Notification title is required'],
    },
    type: {
      type: String,
      enum: ['event_reminder', 'booking_confirmation', 'event_update', 'general', 'cancellation'],
      default: 'general',
    },
    read: {
      type: Boolean,
      default: false,
    },
    targetAll: {
      type: Boolean,
      default: false,
    },
    scheduledFor: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

notificationSchema.index(
  { userId: 1, eventId: 1, type: 1, scheduledFor: 1 },
  { unique: true, sparse: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
