const express = require('express');
const router = express.Router();

const { analyzeCareer, getCareerSuggestions } = require('../controllers/careerController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // All career routes are protected

router.post('/analyze', analyzeCareer);
router.get('/suggestions', getCareerSuggestions);

module.exports = router;
