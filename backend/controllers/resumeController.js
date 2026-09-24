const ResumeFeedback = require('../models/ResumeFeedback');
const Profile = require('../models/Profile');
const aiService = require('../services/aiService');

// @desc    Analyze pasted resume text with Claude AI
// @route   POST /api/resume/analyze
// @access  Private
const analyzeResume = async (req, res, next) => {
  try {
    const { resumeText, targetRole } = req.body;

    if (!resumeText || resumeText.trim().length < 30) {
      return res.status(400).json({
        success: false,
        message: 'Please paste your resume text (at least 30 characters) for analysis.',
      });
    }

    const role = targetRole || 'Software Engineer';

    // Call Claude AI service
    const aiResult = await aiService.analyzeResume({
      resumeText: resumeText.trim(),
      targetRole: role,
    });

    if (!aiResult || typeof aiResult.aiScore !== 'number') {
      return res.status(500).json({
        success: false,
        message: 'Could not complete resume analysis from AI service. Please try again.',
      });
    }

    // Save to ResumeFeedback collection
    const feedback = await ResumeFeedback.create({
      user: req.user._id,
      submittedResumeText: resumeText.trim(),
      aiScore: aiResult.aiScore,
      targetRole: role,
      strengths: aiResult.strengths || [],
      improvements: aiResult.improvements || [],
      summary: aiResult.summary || '',
      createdAt: new Date(),
    });

    // Optionally update student profile with latest resume text
    await Profile.findOneAndUpdate(
      { user: req.user._id },
      { $set: { resumeText: resumeText.trim() } }
    );

    res.status(201).json({
      success: true,
      message: 'Resume analyzed successfully',
      feedback,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's past resume evaluations
// @route   GET /api/resume/history
// @access  Private
const getResumeHistory = async (req, res, next) => {
  try {
    const history = await ResumeFeedback.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      count: history.length,
      history,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  analyzeResume,
  getResumeHistory,
};
