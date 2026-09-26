const Project = require('../models/Project');
const aiService = require('../services/aiService');

// @desc    Submit a new project for reality-check and interview preparation
// @route   POST /api/projects
// @access  Private
const createProject = async (req, res, next) => {
  try {
    const { title, description, techStack, userRole, claimedComplexity } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Project title is required.',
      });
    }

    if (!description || description.trim().length < 20) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a descriptive explanation (at least 20 characters) of the project.',
      });
    }

    let parsedTechStack = [];
    if (Array.isArray(techStack)) {
      parsedTechStack = techStack;
    } else if (typeof techStack === 'string') {
      parsedTechStack = techStack.split(',').map((s) => s.trim()).filter(Boolean);
    }

    const project = await Project.create({
      userId: req.user._id,
      title: title.trim(),
      description: description.trim(),
      techStack: parsedTechStack,
      userRole: userRole ? userRole.trim() : 'Lead Developer / Core Contributor',
      claimedComplexity: ['beginner', 'intermediate', 'advanced'].includes(claimedComplexity)
        ? claimedComplexity
        : 'intermediate',
    });

    res.status(201).json({
      success: true,
      message: 'Project submitted successfully. Ready for reality-check audit.',
      project,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's submitted projects with reality-check and mock interview status
// @route   GET /api/projects/mine
// @access  Private
const getMyProjects = async (req, res, next) => {
  try {
    const projects = await Project.find({ userId: req.user._id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: projects.length,
      projects,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single project detail
// @route   GET /api/projects/:id
// @access  Private
const getProjectById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const project = await Project.findOne({ _id: id, userId: req.user._id });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found.',
      });
    }

    res.status(200).json({
      success: true,
      project,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Run AI Reality-Check on project claims & architecture
// @route   POST /api/projects/:id/reality-check
// @access  Private
const runProjectRealityCheck = async (req, res, next) => {
  try {
    const { id } = req.params;

    const project = await Project.findOne({ _id: id, userId: req.user._id });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found.',
      });
    }

    const realityResult = await aiService.assessProjectReality({
      title: project.title,
      description: project.description,
      techStack: project.techStack,
      userRole: project.userRole,
      claimedComplexity: project.claimedComplexity,
    });

    project.realityCheckResult = {
      realismScore: realityResult.realismScore,
      consistencyFlags: realityResult.consistencyFlags || [],
      honestAssessment: realityResult.honestAssessment || '',
      suggestedFramingImprovements: realityResult.suggestedFramingImprovements || [],
      checkedAt: new Date(),
    };

    await project.save();

    res.status(200).json({
      success: true,
      message: 'Project reality-check completed successfully',
      realityCheckResult: project.realityCheckResult,
      project,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Start technical mock interview for project
// @route   POST /api/projects/:id/interview/start
// @access  Private
const startProjectInterview = async (req, res, next) => {
  try {
    const { id } = req.params;

    const project = await Project.findOne({ _id: id, userId: req.user._id });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found.',
      });
    }

    const interviewData = await aiService.conductProjectInterview({
      title: project.title,
      description: project.description,
      techStack: project.techStack,
      claimedComplexity: project.claimedComplexity,
    });

    const questions = (interviewData.questions || []).map((q, idx) => ({
      questionId: q.questionId || `q-${idx + 1}`,
      question: q.question,
      focusArea: q.focusArea || 'Technical Implementation',
    }));

    project.interviewResult = project.interviewResult || {};
    project.interviewResult.questions = questions;
    await project.save();

    res.status(200).json({
      success: true,
      message: 'Mock project interview started',
      projectId: project._id,
      title: project.title,
      questions,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit answers for mock project interview and evaluate readiness
// @route   POST /api/projects/:id/interview/submit
// @access  Private
const submitProjectInterview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { answers } = req.body;

    if (!answers || (!Array.isArray(answers) && typeof answers !== 'object')) {
      return res.status(400).json({
        success: false,
        message: 'Interview answers are required for evaluation.',
      });
    }

    const project = await Project.findOne({ _id: id, userId: req.user._id });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found.',
      });
    }

    const storedQuestions = project.interviewResult?.questions || [];
    if (storedQuestions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No active interview session found. Please start an interview session first.',
      });
    }

    // Format answers array
    const formattedAnswers = storedQuestions.map((q, idx) => {
      let ansText = '';
      if (Array.isArray(answers)) {
        const found = answers.find((a) => a.questionId === q.questionId || a.index === idx);
        ansText = found ? (found.answer || found.text || '') : (answers[idx]?.answer || '');
      } else if (typeof answers === 'object') {
        ansText = answers[q.questionId] || answers[idx] || '';
      }
      return {
        questionId: q.questionId,
        question: q.question,
        focusArea: q.focusArea,
        answer: ansText,
      };
    });

    const evalResult = await aiService.evaluateProjectInterviewAnswers(
      storedQuestions,
      formattedAnswers,
      {
        title: project.title,
        description: project.description,
        techStack: project.techStack,
      }
    );

    project.interviewResult.answers = formattedAnswers;
    project.interviewResult.overallScore = evalResult.overallScore;
    project.interviewResult.perQuestionFeedback = evalResult.perQuestionFeedback || [];
    project.interviewResult.readinessVerdict = evalResult.readinessVerdict || 'Interview Ready';
    project.interviewResult.completedAt = new Date();

    await project.save();

    res.status(200).json({
      success: true,
      message: 'Mock project interview evaluated successfully!',
      interviewResult: project.interviewResult,
      project,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createProject,
  getMyProjects,
  getProjectById,
  runProjectRealityCheck,
  startProjectInterview,
  submitProjectInterview,
};
