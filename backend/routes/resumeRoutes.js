const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const { analyzeResume, getResumeHistory } = require('../controllers/resumeController');
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

module.exports = router;
