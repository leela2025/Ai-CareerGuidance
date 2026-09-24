const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const { getProfile, updateProfile } = require('../controllers/profileController');
const { protect } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validateMiddleware');

// Validation rules for updating profile
const profileValidation = [
  body('educationLevel').optional().trim().notEmpty().withMessage('Education level cannot be empty'),
  body('branch').optional().trim().notEmpty().withMessage('Branch cannot be empty'),
  body('currentSkills').optional().isArray().withMessage('Current skills must be an array of strings'),
  body('interests').optional().isArray().withMessage('Interests must be an array of strings'),
  validate,
];

router.use(protect); // Protect all profile routes

router.route('/')
  .get(getProfile)
  .put(profileValidation, updateProfile);

module.exports = router;
