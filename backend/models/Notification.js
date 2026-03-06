const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null, // null = broadcast to all users
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
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Notification', notificationSchema);
