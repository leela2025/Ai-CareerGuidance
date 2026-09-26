const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const {
  analyzeResume,
  getResumeHistory,
  startResumeDefense,
  submitResumeDefense,
  getResumeDefense,
} = require('../controllers/resumeController');
const { protect } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validateMiddleware');

router.use(protect);

router.post(
  '/analyze',
  [
    body('resumeText')
      .trim()
      .isLength({ min: 30 })
      .withMessage('Resume text must be at least 30 characters long'),
    validate,
  ],
  analyzeResume
);

router.get('/history', getResumeHistory);

// Feature 4: Resume Defense Test Routes
router.post('/:resumeFeedbackId/defense/start', startResumeDefense);
router.post('/:resumeFeedbackId/defense/submit', submitResumeDefense);
router.get('/:resumeFeedbackId/defense', getResumeDefense);

module.exports = router;

