const express = require('express');
const router = express.Router();

const {
  checkDependencies,
  getDependencyReport,
  getSkillGraph,
  startAssessment,
  submitAssessment,
  getAssessmentHistory,
  getMistakeAnalysis,
  getSkillStats,
} = require('../controllers/skillController');

const { protect } = require('../middleware/authMiddleware');
const { assessmentLimiter } = require('../middleware/rateLimiter');

// All skill verification routes are protected by JWT authentication
router.use(protect);

// Feature 1: Skill Dependency Failure Detector
router.post('/check-dependencies', checkDependencies);
router.get('/dependency-report', getDependencyReport);
router.get('/graph', getSkillGraph);
router.get('/stats', getSkillStats);

// Feature 2 & 3: Prove-It Skill Verification & Learning Mistake Detector
router.post('/:skillName/start-assessment', assessmentLimiter, startAssessment);
router.post('/:skillName/submit-assessment', submitAssessment);
router.get('/:skillName/assessment-history', getAssessmentHistory);
router.get('/:skillName/mistake-analysis', getMistakeAnalysis);

module.exports = router;
