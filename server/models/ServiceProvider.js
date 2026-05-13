const mongoose = require('mongoose');

const serviceProviderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    businessName: {
      type: String,
      required: [true, 'Business name is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['plumbing', 'electrical', 'cleaning', 'carpentry', 'painting', 'ac', 'gardening', 'pest', 'other'],
    },
    bio: {
      type: String,
      maxlength: [500, 'Bio cannot exceed 500 characters'],
    },
    experience: {
      type: Number, // in years
      default: 0,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
      address: String,
      city: String,
      state: String,
      pincode: String,
    },
    serviceRadius: {
      type: Number, // in kilometers
      default: 10,
    },
    rating: {
      average: { type: Number, default: 0, min: 0, max: 5 },
      count: { type: Number, default: 0 },
    },
    isVerified: { type: Boolean, default: false },
    isAvailable: { type: Boolean, default: true },
    documents: {
      idProof: String,
      addressProof: String,
    },
    bankDetails: {
      accountNumber: String,
      ifscCode: String,
      accountHolderName: String,
    },
    totalEarnings: { type: Number, default: 0 },
    completedJobs: { type: Number, default: 0 },
  },
  { timestamps: true }
);

serviceProviderSchema.index({ location: '2dsphere' });
serviceProviderSchema.index({ category: 1, 'rating.average': -1 });

module.exports = mongoose.model('ServiceProvider', serviceProviderSchema);
