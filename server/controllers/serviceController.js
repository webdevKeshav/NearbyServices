const Service = require('../models/Service');
const ServiceProvider = require('../models/ServiceProvider');


exports.getServices = async (req, res, next) => {
  try {
    const {
      category, search, minPrice, maxPrice, rating,
      popular, verified, sortBy, page = 1, limit = 12,
      lat, lng, radius = 10,
    } = req.query;

    let query = { isAvailable: true };

    
    if (category) query.category = category;

    
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    
    if (rating) query['rating.average'] = { $gte: Number(rating) };

    
    if (popular === 'true') query.isPopular = true;

    
    if (search) {
      query.$text = { $search: search };
    }

    
    let providerFilter = {};
    if (lat && lng) {
      const nearbyProviders = await ServiceProvider.find({
        location: {
          $near: {
            $geometry: { type: 'Point', coordinates: [Number(lng), Number(lat)] },
            $maxDistance: Number(radius) * 1000, // convert km to meters
          },
        },
        isAvailable: true,
        ...(verified === 'true' && { isVerified: true }),
      }).select('_id');
      providerFilter = { provider: { $in: nearbyProviders.map((p) => p._id) } };
    } else if (verified === 'true') {
      const verifiedProviders = await ServiceProvider.find({ isVerified: true }).select('_id');
      providerFilter = { provider: { $in: verifiedProviders.map((p) => p._id) } };
    }

    query = { ...query, ...providerFilter };

    
    let sort = {};
    switch (sortBy) {
      case 'price_asc': sort = { price: 1 }; break;
      case 'price_desc': sort = { price: -1 }; break;
      case 'rating': sort = { 'rating.average': -1 }; break;
      case 'popular': sort = { totalBookings: -1 }; break;
      default: sort = { createdAt: -1 };
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Service.countDocuments(query);

    const services = await Service.find(query)
      .populate({
        path: 'provider',
        populate: { path: 'user', select: 'name avatar' },
        select: 'businessName category isVerified rating location user',
      })
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      count: services.length,
      total,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      services,
    });
  } catch (error) {
    next(error);
  }
};

exports.getService = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id).populate({
      path: 'provider',
      populate: { path: 'user', select: 'name avatar phone' },
    });

    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found.' });
    }

    res.status(200).json({ success: true, service });
  } catch (error) {
    next(error);
  }
};


exports.createService = async (req, res, next) => {
  try {
    const provider = await ServiceProvider.findOne({ user: req.user._id });
    if (!provider) {
      return res.status(404).json({ success: false, message: 'Provider profile not found.' });
    }

    const { title, description, category, price, priceType, duration, tags } = req.body;


    const images = req.files
      ? req.files.map((f) => ({ url: f.path, publicId: f.filename }))
      : [];

    const service = await Service.create({
      provider: provider._id,
      title, description, category, price,
      priceType: priceType || 'fixed',
      duration, tags: tags ? tags.split(',').map((t) => t.trim()) : [],
      images,
    });

    res.status(201).json({ success: true, service });
  } catch (error) {
    next(error);
  }
};


exports.updateService = async (req, res, next) => {
  try {
    let service = await Service.findById(req.params.id).populate('provider');

    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found.' });
    }


    if (service.provider.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this service.' });
    }

    const updateData = { ...req.body };
    if (updateData.tags && typeof updateData.tags === 'string') {
      updateData.tags = updateData.tags.split(',').map((t) => t.trim());
    }
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((f) => ({ url: f.path, publicId: f.filename }));
      updateData.images = [...(service.images || []), ...newImages];
    }

    service = await Service.findByIdAndUpdate(req.params.id, updateData, {
      new: true, runValidators: true,
    });

    res.status(200).json({ success: true, service });
  } catch (error) {
    next(error);
  }
};


exports.deleteService = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id).populate('provider');

    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found.' });
    }

    if (service.provider.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    await service.deleteOne();
    res.status(200).json({ success: true, message: 'Service deleted successfully.' });
  } catch (error) {
    next(error);
  }
};


exports.getMyServices = async (req, res, next) => {
  try {
    const provider = await ServiceProvider.findOne({ user: req.user._id });
    if (!provider) {
      return res.status(404).json({ success: false, message: 'Provider profile not found.' });
    }

    const services = await Service.find({ provider: provider._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: services.length, services });
  } catch (error) {
    next(error);
  }
};
