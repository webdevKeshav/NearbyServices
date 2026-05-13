const ServiceProvider = require('../models/ServiceProvider');
const Service = require('../models/Service');


exports.getNearbyProviders = async (req, res, next) => {
  try {
    const { lat, lng, radius = 10, category } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ success: false, message: 'Latitude and longitude are required.' });
    }

    const query = {
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [Number(lng), Number(lat)] },
          $maxDistance: Number(radius) * 1000,
        },
      },
      isAvailable: true,
    };

    if (category) query.category = category;

    const providers = await ServiceProvider.find(query)
      .populate('user', 'name avatar')
      .limit(20);

    res.status(200).json({ success: true, count: providers.length, providers });
  } catch (error) {
    next(error);
  }
};


exports.getProvider = async (req, res, next) => {
  try {
    const provider = await ServiceProvider.findById(req.params.id).populate('user', 'name avatar email phone');
    if (!provider) return res.status(404).json({ success: false, message: 'Provider not found.' });

    const services = await Service.find({ provider: provider._id, isAvailable: true });
    res.status(200).json({ success: true, provider, services });
  } catch (error) {
    next(error);
  }
};


exports.getMyProfile = async (req, res, next) => {
  try {
    const provider = await ServiceProvider.findOne({ user: req.user._id }).populate('user', 'name avatar email phone');
    if (!provider) return res.status(404).json({ success: false, message: 'Provider profile not found.' });
    res.status(200).json({ success: true, provider });
  } catch (error) {
    next(error);
  }
};


exports.updateMyProfile = async (req, res, next) => {
  try {
    const { businessName, bio, experience, serviceRadius, category, city, state, pincode, lat, lng } = req.body;

    const updateData = { businessName, bio, experience, serviceRadius, category };

    if (lat && lng) {
      updateData.location = {
        type: 'Point',
        coordinates: [Number(lng), Number(lat)],
        city: city || '',
        state: state || '',
        pincode: pincode || '',
      };
    }

    const provider = await ServiceProvider.findOneAndUpdate(
      { user: req.user._id },
      updateData,
      { new: true, runValidators: true }
    ).populate('user', 'name avatar email phone');

    if (!provider) return res.status(404).json({ success: false, message: 'Provider profile not found.' });

    res.status(200).json({ success: true, provider });
  } catch (error) {
    next(error);
  }
};


exports.toggleAvailability = async (req, res, next) => {
  try {
    const provider = await ServiceProvider.findOne({ user: req.user._id });
    if (!provider) return res.status(404).json({ success: false, message: 'Provider not found.' });

    provider.isAvailable = !provider.isAvailable;
    await provider.save();

    res.status(200).json({
      success: true,
      isAvailable: provider.isAvailable,
      message: `You are now ${provider.isAvailable ? 'available' : 'unavailable'} for bookings.`,
    });
  } catch (error) {
    next(error);
  }
};


exports.getAllProviders = async (req, res, next) => {
  try {
    const { category, verified, page = 1, limit = 12 } = req.query;
    const query = {};
    if (category) query.category = category;
    if (verified === 'true') query.isVerified = true;

    const total = await ServiceProvider.countDocuments(query);
    const providers = await ServiceProvider.find(query)
      .populate('user', 'name avatar')
      .sort({ 'rating.average': -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.status(200).json({ success: true, total, providers });
  } catch (error) {
    next(error);
  }
};
