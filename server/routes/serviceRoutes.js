const express = require('express');
const router = express.Router();
const {
  getServices, getService, createService,
  updateService, deleteService, getMyServices,
} = require('../controllers/serviceController');
const { protect, authorize } = require('../middleware/auth');
const { uploadServiceImage } = require('../config/cloudinary');


router.get('/', getServices);
router.get('/my-services', protect, authorize('provider'), getMyServices);
router.get('/:id', getService);


router.post('/', protect, authorize('provider'), uploadServiceImage.array('images', 5), createService);
router.put('/:id', protect, authorize('provider', 'admin'), uploadServiceImage.array('images', 5), updateService);
router.delete('/:id', protect, authorize('provider', 'admin'), deleteService);

module.exports = router;
