const CareerSuggestion = require('../models/CareerSuggestion');
const Profile = require('../models/Profile');
const aiService = require('../services/aiService');

// @desc    Analyze user profile and generate AI career suggestions & skill gaps
// @route   POST /api/career/analyze
// @access  Private
const analyzeCareer = async (req, res, next) => {
  try {
    const { customGoal } = req.body;

    // Fetch user profile
    const profile = await Profile.findOne({ user: req.user._id });

    if (!profile) {
      return res.status(400).json({
        success: false,
        message: 'Please complete your onboarding profile first before requesting AI career guidance.',
      });
    }

    const aiResult = await aiService.analyzeCareerPaths({
      educationLevel: profile.educationLevel,
      branch: profile.branch,
      currentSkills: profile.currentSkills,
      interests: profile.interests,
      resumeText: profile.resumeText,
      customGoal: customGoal || '',
    });

    if (!aiResult || !aiResult.suggestedPaths || aiResult.suggestedPaths.length === 0) {
      return res.status(500).json({
        success: false,
        message: 'Failed to generate career suggestions from AI service. Please try again.',
      });
    }

    // Persist to CareerSuggestion collection
    const careerSuggestion = await CareerSuggestion.create({
      user: req.user._id,
      suggestedPaths: aiResult.suggestedPaths,
      skillGaps: aiResult.skillGaps || [],
      aiReasoning: aiResult.aiReasoning || '',
      generatedAt: new Date(),
    });

    res.status(201).json({
      success: true,
      message: 'Career analysis completed successfully',
      suggestion: careerSuggestion,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's past career suggestions
// @route   GET /api/career/suggestions
// @access  Private
const getCareerSuggestions = async (req, res, next) => {
  try {
    const suggestions = await CareerSuggestion.find({ user: req.user._id })
      .sort({ generatedAt: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      count: suggestions.length,
      suggestions,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  analyzeCareer,
  getCareerSuggestions,
};
