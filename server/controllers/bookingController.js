const Booking = require('../models/Booking');
const Service = require('../models/Service');
const ServiceProvider = require('../models/ServiceProvider');


exports.createBooking = async (req, res, next) => {
  try {
    const { serviceId, bookingDate, timeSlot, address, specialInstructions, paymentMethod } = req.body;

    const service = await Service.findById(serviceId).populate('provider');
    if (!service || !service.isAvailable) {
      return res.status(404).json({ success: false, message: 'Service not available.' });
    }

    
    const existingBooking = await Booking.findOne({
      provider: service.provider._id,
      bookingDate: new Date(bookingDate),
      timeSlot,
      status: { $in: ['pending', 'confirmed'] },
    });

    if (existingBooking) {
      return res.status(400).json({ success: false, message: 'This time slot is already booked. Please choose another.' });
    }

    const booking = await Booking.create({
      user: req.user._id,
      service: serviceId,
      provider: service.provider._id,
      bookingDate: new Date(bookingDate),
      timeSlot,
      address,
      specialInstructions,
      payment: {
        amount: service.price,
        method: paymentMethod || 'cash',
        status: paymentMethod === 'cash' ? 'pending' : 'pending',
      },
    });

    
    await Service.findByIdAndUpdate(serviceId, { $inc: { totalBookings: 1 } });

    await booking.populate([
      { path: 'service', select: 'title price duration images' },
      { path: 'provider', populate: { path: 'user', select: 'name phone' } },
    ]);

    res.status(201).json({ success: true, booking });
  } catch (error) {
    next(error);
  }
};


exports.getMyBookings = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const query = { user: req.user._id };
    if (status) query.status = status;

    const total = await Booking.countDocuments(query);
    const bookings = await Booking.find(query)
      .populate('service', 'title price duration images category')
      .populate({ path: 'provider', populate: { path: 'user', select: 'name avatar' } })
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    res.status(200).json({ success: true, total, bookings });
  } catch (error) {
    next(error);
  }
};


exports.getProviderBookings = async (req, res, next) => {
  try {
    const provider = await ServiceProvider.findOne({ user: req.user._id });
    if (!provider) {
      return res.status(404).json({ success: false, message: 'Provider profile not found.' });
    }

    const { status, page = 1, limit = 10 } = req.query;
    const query = { provider: provider._id };
    if (status) query.status = status;

    const total = await Booking.countDocuments(query);
    const bookings = await Booking.find(query)
      .populate('service', 'title price duration')
      .populate('user', 'name phone avatar')
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    res.status(200).json({ success: true, total, bookings });
  } catch (error) {
    next(error);
  }
};


exports.getBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('service')
      .populate({ path: 'provider', populate: { path: 'user', select: 'name phone avatar' } })
      .populate('user', 'name phone avatar');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    
    const isUser = booking.user._id.toString() === req.user._id.toString();
    const provider = await ServiceProvider.findOne({ user: req.user._id });
    const isProvider = provider && booking.provider._id.toString() === provider._id.toString();

    if (!isUser && !isProvider && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    res.status(200).json({ success: true, booking });
  } catch (error) {
    next(error);
  }
};


exports.updateBookingStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['confirmed', 'in_progress', 'completed', 'cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status.' });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    const provider = await ServiceProvider.findOne({ user: req.user._id });
    if (!provider || booking.provider.toString() !== provider._id.toString()) {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Not authorized.' });
      }
    }

    booking.status = status;
    if (status === 'completed') {
      booking.completedAt = new Date();
      booking.payment.status = 'paid';
      // Update provider earnings
      await ServiceProvider.findByIdAndUpdate(booking.provider, {
        $inc: { totalEarnings: booking.payment.amount, completedJobs: 1 },
      });
    }

    await booking.save();
    res.status(200).json({ success: true, booking });
  } catch (error) {
    next(error);
  }
};


exports.cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    if (['completed', 'cancelled'].includes(booking.status)) {
      return res.status(400).json({ success: false, message: `Cannot cancel a ${booking.status} booking.` });
    }

    booking.status = 'cancelled';
    booking.cancellation = {
      cancelledBy: 'user',
      reason: req.body.reason || 'Cancelled by user',
      cancelledAt: new Date(),
    };

    await booking.save();
    res.status(200).json({ success: true, message: 'Booking cancelled.', booking });
  } catch (error) {
    next(error);
  }
};


exports.getBookedSlots = async (req, res, next) => {
  try {
    const { providerId, date } = req.query;
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const bookings = await Booking.find({
      provider: providerId,
      bookingDate: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: ['pending', 'confirmed'] },
    }).select('timeSlot');

    const bookedSlots = bookings.map((b) => b.timeSlot);
    res.status(200).json({ success: true, bookedSlots });
  } catch (error) {
    next(error);
  }
};


exports.getProviderStats = async (req, res, next) => {
  try {
    const provider = await ServiceProvider.findOne({ user: req.user._id });
    if (!provider) return res.status(404).json({ success: false, message: 'Provider not found.' });

    const [total, pending, confirmed, completed, cancelled] = await Promise.all([
      Booking.countDocuments({ provider: provider._id }),
      Booking.countDocuments({ provider: provider._id, status: 'pending' }),
      Booking.countDocuments({ provider: provider._id, status: 'confirmed' }),
      Booking.countDocuments({ provider: provider._id, status: 'completed' }),
      Booking.countDocuments({ provider: provider._id, status: 'cancelled' }),
    ]);

    res.status(200).json({
      success: true,
      stats: {
        total, pending, confirmed, completed, cancelled,
        totalEarnings: provider.totalEarnings,
        completedJobs: provider.completedJobs,
        rating: provider.rating,
      },
    });
  } catch (error) {
    next(error);
  }
};
