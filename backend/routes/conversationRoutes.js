const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getConversationById,
  sendMessageRest,
} = require('../controllers/mentorController');

router.use(protect);

// Get conversation messages (participants only)
router.get('/:id', getConversationById);

// Send message via REST (fallback & companion to WebSockets)
router.post('/:id/messages', sendMessageRest);

module.exports = router;
