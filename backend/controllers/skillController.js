const SkillAssessment = require('../models/SkillAssessment');
const Roadmap = require('../models/Roadmap');
const Profile = require('../models/Profile');
const aiService = require('../services/aiService');
const skillGraphService = require('../services/skillGraphService');

// @desc    Check prerequisite dependencies for a skill against user's completed skills
// @route   POST /api/skills/check-dependencies
// @access  Private
const checkDependencies = async (req, res, next) => {
  try {
    const { skillName } = req.body;

    if (!skillName || typeof skillName !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Skill name is required for dependency check.',
      });
    }

    // Retrieve user's completed skills from active roadmap and profile
    const roadmap = await Roadmap.findOne({ user: req.user._id }).sort({ updatedAt: -1 });
    const profile = await Profile.findOne({ user: req.user._id });

    const completedFromRoadmap = roadmap
      ? roadmap.milestones.filter((m) => m.status === 'completed').map((m) => m.skillName)
      : [];
    const profileSkills = profile?.currentSkills || [];

    const userCompletedSkills = Array.from(new Set([...completedFromRoadmap, ...profileSkills]));

    const checkResult = skillGraphService.checkDependencyGaps(userCompletedSkills, skillName);

    res.status(200).json({
      success: true,
      hasGaps: checkResult.hasGaps,
      targetSkill: checkResult.targetSkill,
      missingPrerequisites: checkResult.missingPrerequisites,
      riskExplanation: checkResult.riskExplanation,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Full dependency health report across user's entire learning roadmap
// @route   GET /api/skills/dependency-report
// @access  Private
const getDependencyReport = async (req, res, next) => {
  try {
    const roadmap = await Roadmap.findOne({ user: req.user._id }).sort({ updatedAt: -1 });

    if (!roadmap || !roadmap.milestones || roadmap.milestones.length === 0) {
      return res.status(200).json({
        success: true,
        roadmapGoal: null,
        totalMilestones: 0,
        totalGaps: 0,
        highRiskCount: 0,
        verifiedCount: 0,
        completedCount: 0,
        reports: [],
        message: 'No active roadmap found. Generate a roadmap to audit skill health.',
      });
    }

    const gapScan = skillGraphService.checkAllRoadmapGaps(roadmap.milestones);
    const verifiedCount = roadmap.milestones.filter((m) => m.verified).length;
    const completedCount = roadmap.milestones.filter((m) => m.status === 'completed').length;

    res.status(200).json({
      success: true,
      roadmapGoal: roadmap.careerGoal,
      totalMilestones: roadmap.milestones.length,
      completedCount,
      verifiedCount,
      totalGaps: gapScan.totalGaps,
      highRiskCount: gapScan.highRiskCount,
      reports: gapScan.reports,
      milestones: roadmap.milestones,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get skill graph nodes and prerequisite relationships
// @route   GET /api/skills/graph
// @access  Private
const getSkillGraph = async (req, res, next) => {
  try {
    const skills = skillGraphService.getAllSkills();
    res.status(200).json({
      success: true,
      count: skills.length,
      skills,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Start an AI-generated verification assessment (Quiz or Practical Task)
// @route   POST /api/skills/:skillName/start-assessment
// @access  Private
const startAssessment = async (req, res, next) => {
  try {
    const { skillName } = req.params;
    const { difficultyLevel = 'intermediate' } = req.body;

    if (!skillName) {
      return res.status(400).json({
        success: false,
        message: 'Skill name is required.',
      });
    }

    // Determine assessment type from skill metadata
    const metadata = skillGraphService.getSkillMetadata(skillName);
    const assessmentType = metadata.assessmentType || 'quiz';

    // Count past attempts by this user for this skill
    const previousAttemptsCount = await SkillAssessment.countDocuments({
      userId: req.user._id,
      skillName: { $regex: new RegExp(`^${skillName}$`, 'i') },
    });

    const attemptNumber = previousAttemptsCount + 1;

    let quizResult = null;
    let practicalResult = null;
    let clientQuestions = [];

    if (assessmentType === 'quiz') {
      quizResult = await aiService.generateSkillQuiz(metadata.skill, difficultyLevel);
      // Sanitize questions for client: omit correctAnswer & explanation before submission!
      clientQuestions = (quizResult.questions || []).map((q, idx) => ({
        questionIndex: idx,
        question: q.question,
        type: q.type || 'mcq',
        options: q.options || [],
      }));
    } else {
      practicalResult = await aiService.generatePracticalTask(metadata.skill);
    }

    // Create SkillAssessment document
    const assessment = await SkillAssessment.create({
      userId: req.user._id,
      skillName: metadata.skill,
      assessmentType,
      status: 'in-progress',
      score: 0,
      questions: quizResult ? quizResult.questions : [],
      practicalTask: practicalResult || null,
      attemptNumber,
    });

    res.status(201).json({
      success: true,
      message: `Skill verification assessment started for '${metadata.skill}'`,
      assessmentId: assessment._id,
      skillName: metadata.skill,
      category: metadata.category,
      assessmentType,
      attemptNumber,
      questions: clientQuestions,
      practicalTask: practicalResult,
      createdAt: assessment.createdAt,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit answers for evaluation and update verification status
// @route   POST /api/skills/:skillName/submit-assessment
// @access  Private
const submitAssessment = async (req, res, next) => {
  try {
    const { skillName } = req.params;
    const { assessmentId, answers } = req.body;

    if (!assessmentId) {
      return res.status(400).json({
        success: false,
        message: 'Assessment ID is required for submission.',
      });
    }

    // Validate ownership
    const assessment = await SkillAssessment.findOne({
      _id: assessmentId,
      userId: req.user._id,
    });

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Assessment session not found or does not belong to you.',
      });
    }

    if (assessment.status === 'passed') {
      return res.status(400).json({
        success: false,
        message: 'This assessment has already been passed.',
      });
    }

    // Call AI Evaluation
    const evaluation = await aiService.evaluateSkillSubmission(
      assessment.skillName,
      assessment.assessmentType,
      answers,
      assessment.practicalTask || { questions: assessment.questions }
    );

    const score = evaluation.score;
    const passed = evaluation.passed;

    assessment.score = score;
    assessment.status = passed ? 'passed' : 'failed';
    assessment.attemptData = answers;
    assessment.aiEvaluation = {
      score,
      passed,
      specificFeedback: evaluation.specificFeedback || [],
      gapsIdentified: evaluation.gapsIdentified || [],
      evaluatedAt: new Date(),
    };

    // If passed: mark the roadmap skill as verified ✓
    let roadmapUpdated = false;
    if (passed) {
      const roadmap = await Roadmap.findOne({ user: req.user._id }).sort({ updatedAt: -1 });
      if (roadmap && roadmap.milestones) {
        const milestone = roadmap.milestones.find(
          (m) =>
            m.skillName.toLowerCase() === assessment.skillName.toLowerCase() ||
            skillGraphService.normalizeSkillName(m.skillName) ===
              skillGraphService.normalizeSkillName(assessment.skillName)
        );

        if (milestone) {
          milestone.verified = true;
          milestone.verifiedAt = new Date();
          if (milestone.status !== 'completed') {
            milestone.status = 'completed';
            milestone.completedAt = new Date();
          }
          roadmap.recalculateProgress();
          await roadmap.save();
          roadmapUpdated = true;
        }
      }
    }

    // FEATURE 3: Learning Mistake Detector
    // If failed and attemptNumber >= 2, analyze cross-attempt patterns for root misconception
    let mistakeAnalysis = null;
    if (!passed && assessment.attemptNumber >= 2) {
      try {
        const pastAttempts = await SkillAssessment.find({
          userId: req.user._id,
          skillName: assessment.skillName,
        }).sort({ createdAt: 1 });

        const mistakeResult = await aiService.detectLearningMistakePattern(
          assessment.skillName,
          pastAttempts
        );

        if (mistakeResult && mistakeResult.rootCauseMisconception) {
          assessment.mistakeAnalysis = {
            rootCauseMisconception: mistakeResult.rootCauseMisconception,
            affectedConcepts: mistakeResult.affectedConcepts || [],
            targetedExplanation: mistakeResult.targetedExplanation || '',
            suggestedMicroResource: mistakeResult.suggestedMicroResource || '',
            analyzedAt: new Date(),
          };
          mistakeAnalysis = assessment.mistakeAnalysis;
        }
      } catch (mistakeErr) {
        console.error('Error generating mistake pattern analysis:', mistakeErr.message);
      }
    }

    await assessment.save();

    res.status(200).json({
      success: true,
      message: passed
        ? `Skill '${assessment.skillName}' verified successfully!`
        : `Assessment completed. Score: ${score}/100. Review gaps and retry.`,
      assessment: {
        _id: assessment._id,
        skillName: assessment.skillName,
        assessmentType: assessment.assessmentType,
        attemptNumber: assessment.attemptNumber,
        status: assessment.status,
        score: assessment.score,
        aiEvaluation: assessment.aiEvaluation,
        mistakeAnalysis: assessment.mistakeAnalysis,
      },
      roadmapUpdated,
      mistakeAnalysis,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get assessment history for a specific skill
// @route   GET /api/skills/:skillName/assessment-history
// @access  Private
const getAssessmentHistory = async (req, res, next) => {
  try {
    const { skillName } = req.params;

    const history = await SkillAssessment.find({
      userId: req.user._id,
      skillName: { $regex: new RegExp(`^${skillName}$`, 'i') },
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: history.length,
      history,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get root-cause learning mistake analysis for a skill
// @route   GET /api/skills/:skillName/mistake-analysis
// @access  Private
const getMistakeAnalysis = async (req, res, next) => {
  try {
    const { skillName } = req.params;

    const latestAnalysis = await SkillAssessment.findOne({
      userId: req.user._id,
      skillName: { $regex: new RegExp(`^${skillName}$`, 'i') },
      'mistakeAnalysis.rootCauseMisconception': { $exists: true, $ne: '' },
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      mistakeAnalysis: latestAnalysis ? latestAnalysis.mistakeAnalysis : null,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get skill verification aggregate stats for Dashboard widget
// @route   GET /api/skills/stats
// @access  Private
const getSkillStats = async (req, res, next) => {
  try {
    const roadmap = await Roadmap.findOne({ user: req.user._id }).sort({ updatedAt: -1 });

    const totalMilestones = roadmap?.milestones?.length || 0;
    const completedMilestones = roadmap?.milestones?.filter((m) => m.status === 'completed').length || 0;
    const verifiedMilestones = roadmap?.milestones?.filter((m) => m.verified).length || 0;

    const totalPassedAssessments = await SkillAssessment.countDocuments({
      userId: req.user._id,
      status: 'passed',
    });

    res.status(200).json({
      success: true,
      totalMilestones,
      completedMilestones,
      verifiedMilestones,
      verificationPercentage: totalMilestones > 0 ? Math.round((verifiedMilestones / totalMilestones) * 100) : 0,
      totalPassedAssessments,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  checkDependencies,
  getDependencyReport,
  getSkillGraph,
  startAssessment,
  submitAssessment,
  getAssessmentHistory,
  getMistakeAnalysis,
  getSkillStats,
};
