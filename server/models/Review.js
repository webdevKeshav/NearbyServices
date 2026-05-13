const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
      unique: true, // One review per booking
    },
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
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: [true, 'Review comment is required'],
      maxlength: [500, 'Comment cannot exceed 500 characters'],
    },
    images: [String],
    isVisible: { type: Boolean, default: true },
    providerReply: {
      text: String,
      repliedAt: Date,
    },
  },
  { timestamps: true }
);

// After saving a review, update service and provider ratings
reviewSchema.post('save', async function () {
  await updateRatings(this.service, this.provider);
});

reviewSchema.post('remove', async function () {
  await updateRatings(this.service, this.provider);
});

async function updateRatings(serviceId, providerId) {
  const Review = mongoose.model('Review');
  const Service = mongoose.model('Service');
  const ServiceProvider = mongoose.model('ServiceProvider');

  // Update service rating
  const serviceStats = await Review.aggregate([
    { $match: { service: serviceId, isVisible: true } },
    { $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  if (serviceStats.length > 0) {
    await Service.findByIdAndUpdate(serviceId, {
      'rating.average': Math.round(serviceStats[0].avgRating * 10) / 10,
      'rating.count': serviceStats[0].count,
    });
  }

  // Update provider rating
  const providerStats = await Review.aggregate([
    { $match: { provider: providerId, isVisible: true } },
    { $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  if (providerStats.length > 0) {
    await ServiceProvider.findByIdAndUpdate(providerId, {
      'rating.average': Math.round(providerStats[0].avgRating * 10) / 10,
      'rating.count': providerStats[0].count,
    });
  }
}

module.exports = mongoose.model('Review', reviewSchema);
