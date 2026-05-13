const express = require('express');
const router = express.Router();
const {
  getNearbyProviders, getProvider, getMyProfile,
  updateMyProfile, toggleAvailability, getAllProviders,
} = require('../controllers/providerController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getAllProviders);
router.get('/nearby', getNearbyProviders);
router.get('/my-profile', protect, authorize('provider'), getMyProfile);
router.put('/my-profile', protect, authorize('provider'), updateMyProfile);
router.put('/availability', protect, authorize('provider'), toggleAvailability);
router.get('/:id', getProvider);

module.exports = router;
