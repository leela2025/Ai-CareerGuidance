const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getMyActivity } = require('../controllers/securityController');

// All security routes are private
router.use(protect);

router.get('/my-activity', getMyActivity);

module.exports = router;
