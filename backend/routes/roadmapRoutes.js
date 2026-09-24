const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const {
  generateRoadmap,
  getRoadmap,
  updateMilestoneStatus,
} = require('../controllers/roadmapController');
const { protect } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validateMiddleware');

router.use(protect);

router.post('/generate', generateRoadmap);
router.get('/', getRoadmap);
router.patch(
  '/:skillId',
  [
    body('status')
      .isIn(['pending', 'in-progress', 'completed'])
      .withMessage("Status must be 'pending', 'in-progress', or 'completed'"),
    validate,
  ],
  updateMilestoneStatus
);

module.exports = router;
