const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    bookingId: {
      type: String,
      required: true,
      unique: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    ticketDetails: [
      {
        categoryId: {
          type: String,
          required: true,
        },
        categoryName: {
          type: String,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        subtotal: {
          type: Number,
          required: true,
        },
      },
    ],
    ticketQuantity: {
      type: Number,
      required: true,
      min: 1,
    },
    subtotalAmount: {
      type: Number,
      required: true,
    },
    bookingFee: {
      type: Number,
      default: 100,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    pickupOption: {
      type: String,
      enum: ['box-office'],
      default: 'box-office',
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled'],
      default: 'pending',
    },
    qrCode: {
      type: String,
      default: '',
    },
    isUsed: {
      type: Boolean,
      default: false,
    },
    usedAt: {
      type: Date,
      default: null,
    },
    validatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    paymentDetails: {
      transactionId: String,
      method: String,
      status: String,
      cardLast4: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Booking', bookingSchema);

