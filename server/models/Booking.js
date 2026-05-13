const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: true,
    },
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ServiceProvider',
      required: true,
    },
    bookingDate: {
      type: Date,
      required: [true, 'Booking date is required'],
    },
    timeSlot: {
      type: String,
      required: [true, 'Time slot is required'],
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'],
      default: 'pending',
    },
    address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: String,
      pincode: String,
      landmark: String,
    },
    specialInstructions: {
      type: String,
      maxlength: [300, 'Instructions cannot exceed 300 characters'],
    },
    payment: {
      amount: { type: Number, required: true },
      method: {
        type: String,
        enum: ['card', 'upi', 'netbanking', 'cash'],
        default: 'cash',
      },
      status: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'refunded'],
        default: 'pending',
      },
      transactionId: String,
      paidAt: Date,
    },
    cancellation: {
      cancelledBy: { type: String, enum: ['user', 'provider', 'admin'] },
      reason: String,
      cancelledAt: Date,
    },
    completedAt: Date,
    isReviewed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

bookingSchema.index({ user: 1, status: 1 });
bookingSchema.index({ provider: 1, status: 1 });
bookingSchema.index({ bookingDate: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
