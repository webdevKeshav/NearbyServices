const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema(
  {
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ServiceProvider',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Service title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    category: {
      type: String,
      required: true,
      enum: ['plumbing', 'electrical', 'cleaning', 'carpentry', 'painting', 'ac', 'gardening', 'pest', 'other'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    priceType: {
      type: String,
      enum: ['fixed', 'hourly', 'starting_from'],
      default: 'fixed',
    },
    duration: {
      type: String, // e.g. "2-3 hrs", "1 day"
      required: true,
    },
    images: [
      {
        url: String,
        publicId: String,
      },
    ],
    tags: [String],
    isAvailable: { type: Boolean, default: true },
    isPopular: { type: Boolean, default: false },
    rating: {
      average: { type: Number, default: 0 },
      count: { type: Number, default: 0 },
    },
    totalBookings: { type: Number, default: 0 },
  },
  { timestamps: true }
);

serviceSchema.index({ category: 1, price: 1 });
serviceSchema.index({ 'rating.average': -1 });
serviceSchema.index({ title: 'text', description: 'text', tags: 'text' }); // full-text search

module.exports = mongoose.model('Service', serviceSchema);
