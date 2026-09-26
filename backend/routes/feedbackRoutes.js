const express = require('express');
const router = express.Router();
const {
  submitPlatformFeedback,
  getPlatformFeedbackSummary,
  getMyPlatformFeedback,
  getAdminPlatformFeedback,
} = require('../controllers/feedbackController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const { feedbackLimiter } = require('../middleware/rateLimiter');

// Public route: Aggregated platform summary (averages, counts)
router.get('/platform/summary', getPlatformFeedbackSummary);

// Protected routes: Submit / update user feedback
router.post('/platform', protect, feedbackLimiter, submitPlatformFeedback);
router.get('/platform/mine', protect, getMyPlatformFeedback);

// Admin-only route: Full list of platform feedback
router.get('/admin/platform', protect, authorizeRoles('admin'), getAdminPlatformFeedback);

module.exports = router;
