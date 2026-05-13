const express = require('express');
const router = express.Router();
const {
  createReview, getServiceReviews, getProviderReviews,
  replyToReview, deleteReview,
} = require('../controllers/reviewController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, authorize('user'), createReview);
router.get('/service/:serviceId', getServiceReviews);
router.get('/provider/:providerId', getProviderReviews);
router.put('/:id/reply', protect, authorize('provider'), replyToReview);
router.delete('/:id', protect, deleteReview);

module.exports = router;
