const Review = require('../models/Review');
const Booking = require('../models/Booking');


exports.createReview = async (req, res, next) => {
  try {
    const { bookingId, rating, comment } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found.' });
    if (booking.user.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    if (booking.status !== 'completed')
      return res.status(400).json({ success: false, message: 'Can only review completed bookings.' });
    if (booking.isReviewed)
      return res.status(400).json({ success: false, message: 'Already reviewed this booking.' });

    const review = await Review.create({
      booking: bookingId,
      user: req.user._id,
      service: booking.service,
      provider: booking.provider,
      rating,
      comment,
    });

    booking.isReviewed = true;
    await booking.save();

    res.status(201).json({ success: true, review });
  } catch (error) {
    next(error);
  }
};


exports.getServiceReviews = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const query = { service: req.params.serviceId, isVisible: true };
    const total = await Review.countDocuments(query);
    const reviews = await Review.find(query)
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.status(200).json({ success: true, total, reviews });
  } catch (error) {
    next(error);
  }
};


exports.getProviderReviews = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const query = { provider: req.params.providerId, isVisible: true };
    const total = await Review.countDocuments(query);
    const reviews = await Review.find(query)
      .populate('user', 'name avatar')
      .populate('service', 'title')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.status(200).json({ success: true, total, reviews });
  } catch (error) {
    next(error);
  }
};


exports.replyToReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id).populate('provider');
    if (!review) return res.status(404).json({ success: false, message: 'Review not found.' });

    if (review.provider.user.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: 'Not authorized.' });

    review.providerReply = { text: req.body.reply, repliedAt: new Date() };
    await review.save();
    res.status(200).json({ success: true, review });
  } catch (error) {
    next(error);
  }
};


exports.deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found.' });

    if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin')
      return res.status(403).json({ success: false, message: 'Not authorized.' });

    await review.deleteOne();
    res.status(200).json({ success: true, message: 'Review deleted.' });
  } catch (error) {
    next(error);
  }
};
