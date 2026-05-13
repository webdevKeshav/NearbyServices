const express = require('express');
const router = express.Router();
const {
  createBooking, getMyBookings, getProviderBookings, getBooking,
  updateBookingStatus, cancelBooking, getBookedSlots, getProviderStats,
} = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/auth');

router.get('/slots', getBookedSlots); 
router.post('/', protect, authorize('user'), createBooking);
router.get('/my-bookings', protect, authorize('user'), getMyBookings);
router.get('/provider-bookings', protect, authorize('provider'), getProviderBookings);
router.get('/provider-stats', protect, authorize('provider'), getProviderStats);
router.get('/:id', protect, getBooking);
router.put('/:id/status', protect, authorize('provider', 'admin'), updateBookingStatus);
router.put('/:id/cancel', protect, authorize('user'), cancelBooking);

module.exports = router;
