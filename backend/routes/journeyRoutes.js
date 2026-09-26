const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { journeyAiLimiter } = require('../middleware/rateLimiter');
const {
  startJourney,
  getJourney,
  choosePath,
  branchJourney,
  setSatisfaction,
  compareStageAlternatives,
} = require('../controllers/journeyController');

// All journey routes are strictly private & protected by JWT auth
router.use(protect);

// 1. Initialize or retrieve the lifelong career journey
router.post('/start', journeyAiLimiter, startJourney);

// 2. Retrieve user's full ongoing career journey tree
router.get('/', getJourney);

// 3. Commit to an alternative path at a stage (advances to next decision point)
router.post('/:stageId/choose', journeyAiLimiter, choosePath);

// 4. Branch from ANY past or current decision point ("Not satisfied, give me alternatives")
router.post('/:stageId/branch', journeyAiLimiter, branchJourney);

// 5. Update satisfaction rating for a committed stage
router.patch('/:stageId/satisfaction', setSatisfaction);

// 6. Compare alternative paths at a given stage side-by-side
router.get('/:stageId/compare', compareStageAlternatives);

module.exports = router;
