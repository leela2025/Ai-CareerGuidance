const express = require('express');
const router = express.Router();

const { getAdminStats } = require('../controllers/adminController');
const {
  verifyMentor,
  rejectMentor,
  getAdminPendingMentors,
  getAdminAllMentors,
} = require('../controllers/mentorController');
const {
  getAdminPendingStories,
  moderateStory,
} = require('../controllers/storyController');
const { getAdminPlatformFeedback } = require('../controllers/feedbackController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

// Only authenticated users with role 'admin' can access admin routes
router.get('/stats', protect, authorizeRoles('admin'), getAdminStats);

// Mentor verification & moderation endpoints
router.get('/mentors/pending', protect, authorizeRoles('admin'), getAdminPendingMentors);
router.get('/mentors/all', protect, authorizeRoles('admin'), getAdminAllMentors);
router.patch('/mentors/:id/verify', protect, authorizeRoles('admin'), verifyMentor);
router.patch('/mentors/:id/reject', protect, authorizeRoles('admin'), rejectMentor);

// Story moderation endpoints
router.get('/stories/pending', protect, authorizeRoles('admin'), getAdminPendingStories);
router.patch('/stories/:id/moderate', protect, authorizeRoles('admin'), moderateStory);

// Platform feedback review endpoint
router.get('/feedback/platform', protect, authorizeRoles('admin'), getAdminPlatformFeedback);

module.exports = router;

