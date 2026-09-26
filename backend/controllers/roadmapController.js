const Roadmap = require('../models/Roadmap');
const CareerSuggestion = require('../models/CareerSuggestion');
const Profile = require('../models/Profile');
const aiService = require('../services/aiService');
const skillGraphService = require('../services/skillGraphService');

// @desc    Generate personalized learning roadmap from skill gaps
// @route   POST /api/roadmap/generate
// @access  Private
const generateRoadmap = async (req, res, next) => {
  try {
    let { careerGoal, skillGaps } = req.body;

    // If careerGoal or skillGaps not explicitly passed, inspect latest CareerSuggestion
    if (!careerGoal || !skillGaps || skillGaps.length === 0) {
      const latestSuggestion = await CareerSuggestion.findOne({ user: req.user._id }).sort({ generatedAt: -1 });

      if (latestSuggestion) {
        if (!careerGoal && latestSuggestion.suggestedPaths.length > 0) {
          careerGoal = latestSuggestion.suggestedPaths[0].title;
        }
        if (!skillGaps || skillGaps.length === 0) {
          skillGaps = latestSuggestion.skillGaps;
        }
      }
    }

    if (!careerGoal) {
      careerGoal = 'Full Stack Software Engineer';
    }

    // Retrieve user's current skills from profile
    const profile = await Profile.findOne({ user: req.user._id });
    const currentSkills = profile ? profile.currentSkills : [];

    // Call Claude AI service
    const aiResult = await aiService.generateRoadmap({
      careerGoal,
      skillGaps: skillGaps || [],
      currentSkills,
    });

    if (!aiResult || !Array.isArray(aiResult.milestones)) {
      return res.status(500).json({
        success: false,
        message: 'Could not generate learning roadmap from AI service. Please try again.',
      });
    }

    // Format milestones with status and order
    const formattedMilestones = aiResult.milestones.map((ms, index) => ({
      skillId: ms.skillId || `skill-${index + 1}`,
      skillName: ms.skillName || `Milestone ${index + 1}`,
      category: ms.category || 'Core Skill',
      status: 'pending',
      resources: Array.isArray(ms.resources) ? ms.resources : [],
      order: ms.order || index + 1,
      completedAt: null,
    }));

    // Create new roadmap document
    const roadmap = await Roadmap.create({
      user: req.user._id,
      careerGoal: aiResult.careerGoal || careerGoal,
      milestones: formattedMilestones,
      overallProgress: 0,
    });

    res.status(201).json({
      success: true,
      message: 'Personalized roadmap created successfully',
      roadmap,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get active/latest roadmap for logged-in user
// @route   GET /api/roadmap
// @access  Private
const getRoadmap = async (req, res, next) => {
  try {
    const roadmap = await Roadmap.findOne({ user: req.user._id }).sort({ updatedAt: -1 });

    if (!roadmap) {
      return res.status(200).json({
        success: true,
        roadmap: null,
        message: 'No active roadmap found. Please generate one to start learning.',
      });
    }

    res.status(200).json({
      success: true,
      roadmap,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update milestone completion status & recalculate progress %
// @route   PATCH /api/roadmap/:skillId
// @access  Private
const updateMilestoneStatus = async (req, res, next) => {
  try {
    const { skillId } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'in-progress', 'completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status '${status}'. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const roadmap = await Roadmap.findOne({ user: req.user._id }).sort({ updatedAt: -1 });

    if (!roadmap) {
      return res.status(404).json({
        success: false,
        message: 'No active roadmap found for user.',
      });
    }

    // Match by skillId or Mongo _id
    const milestone = roadmap.milestones.find(
      (m) => m.skillId === skillId || m._id.toString() === skillId
    );

    if (!milestone) {
      return res.status(404).json({
        success: false,
        message: `Milestone with ID '${skillId}' was not found in active roadmap.`,
      });
    }

    // Check dependency gaps if user is marking this milestone as completed
    let dependencyWarning = null;
    if (status === 'completed') {
      const otherCompletedSkills = roadmap.milestones
        .filter((m) => m.status === 'completed' && m.skillId !== skillId && m._id.toString() !== skillId)
        .map((m) => m.skillName);

      const gapCheck = skillGraphService.checkDependencyGaps(otherCompletedSkills, milestone.skillName);
      if (gapCheck.hasGaps) {
        dependencyWarning = {
          hasGaps: true,
          targetSkill: gapCheck.targetSkill,
          missingPrerequisites: gapCheck.missingPrerequisites,
          riskExplanation: gapCheck.riskExplanation,
        };
      }
    }

    milestone.status = status;
    milestone.completedAt = status === 'completed' ? new Date() : null;

    // Recalculate progress percentage
    roadmap.recalculateProgress();
    await roadmap.save();

    res.status(200).json({
      success: true,
      message: `Milestone '${milestone.skillName}' updated to '${status}'`,
      overallProgress: roadmap.overallProgress,
      dependencyWarning,
      roadmap,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  generateRoadmap,
  getRoadmap,
  updateMilestoneStatus,
};
