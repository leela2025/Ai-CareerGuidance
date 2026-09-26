const express = require('express');
const router = express.Router();
const {
  submitStory,
  getApprovedStories,
  getStoryById,
  getMyStories,
  toggleLikeStory,
} = require('../controllers/storyController');
const { protect } = require('../middleware/authMiddleware');
const { storySubmissionLimiter } = require('../middleware/rateLimiter');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Optional auth middleware so public detail view can know who is viewing for likes / ownership
const optionalAuth = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'career_compass_default_secret_key_2026'
      );
      req.user = await User.findById(decoded.id).select('-password');
    } catch (e) {
      // Continue without user
    }
  }
  next();
};

// Public feed of approved stories (optional auth to populate likedByCurrentUser)
router.get('/', optionalAuth, getApprovedStories);

// Authenticated user's own stories
router.get('/mine', protect, getMyStories);

// Public single story detail (optional auth for ownership / like status)
router.get('/:id', optionalAuth, getStoryById);

// Submit story (rate limited & protected)
router.post('/', protect, storySubmissionLimiter, submitStory);

// Toggle like
router.patch('/:id/like', protect, toggleLikeStory);

module.exports = router;
