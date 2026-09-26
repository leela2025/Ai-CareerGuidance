const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { connectionRequestLimiter } = require('../middleware/rateLimiter');
const {
  createConnectionRequest,
  getMyConnections,
  respondConnectionRequest,
} = require('../controllers/mentorController');

router.use(protect);

// Send connection request (rate-limited: max 20 per day)
router.post('/request', connectionRequestLimiter, createConnectionRequest);

// Get user's sent and incoming connection requests
router.get('/mine', getMyConnections);

// Accept or decline request (mentor only)
router.patch('/:id/respond', respondConnectionRequest);

module.exports = router;
