const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getMentors,
  getMentorById,
  applyMentor,
  leaveMentorFeedback,
} = require('../controllers/mentorController');

// Public mentor discovery
router.get('/', getMentors);
router.get('/:id', getMentorById);

// Protected mentor actions
router.post('/apply', protect, applyMentor);
router.post('/:id/feedback', protect, leaveMentorFeedback);

module.exports = router;
