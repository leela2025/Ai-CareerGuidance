const express = require('express');
const router = express.Router();

const {
  createProject,
  getMyProjects,
  getProjectById,
  runProjectRealityCheck,
  startProjectInterview,
  submitProjectInterview,
} = require('../controllers/projectController');

const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/', createProject);
router.get('/mine', getMyProjects);
router.get('/:id', getProjectById);
router.post('/:id/reality-check', runProjectRealityCheck);
router.post('/:id/interview/start', startProjectInterview);
router.post('/:id/interview/submit', submitProjectInterview);

module.exports = router;
