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

// @desc    Start Resume Defense Test (generates pointed questions on resume claims)
// @route   POST /api/resume/:resumeFeedbackId/defense/start
// @access  Private
const startResumeDefense = async (req, res, next) => {
  try {
    const { resumeFeedbackId } = req.params;

    const feedback = await ResumeFeedback.findOne({
      _id: resumeFeedbackId,
      user: req.user._id,
    });

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Resume analysis not found or does not belong to you.',
      });
    }

    const defenseData = await aiService.generateResumeDefenseQuestions(
      feedback.submittedResumeText,
      feedback.targetRole || 'Software Engineer'
    );

    const questions = (defenseData.questions || []).map((q, idx) => ({
      questionId: q.questionId || `q-${idx + 1}`,
      relatedClaim: q.relatedClaim || 'Technical Experience Claim',
      question: q.question,
    }));

    feedback.defenseResult = feedback.defenseResult || {};
    feedback.defenseResult.questions = questions;
    await feedback.save();

    res.status(200).json({
      success: true,
      message: 'Resume Defense Test initialized with pointed recruiter questions',
      resumeFeedbackId: feedback._id,
      targetRole: feedback.targetRole,
      questions,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit answers for Resume Defense Test and evaluate credibility
// @route   POST /api/resume/:resumeFeedbackId/defense/submit
// @access  Private
const submitResumeDefense = async (req, res, next) => {
  try {
    const { resumeFeedbackId } = req.params;
    const { answers } = req.body;

    if (!answers || (!Array.isArray(answers) && typeof answers !== 'object')) {
      return res.status(400).json({
        success: false,
        message: 'Answers are required to complete resume defense evaluation.',
      });
    }

    const feedback = await ResumeFeedback.findOne({
      _id: resumeFeedbackId,
      user: req.user._id,
    });

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Resume analysis session not found.',
      });
    }

    const storedQuestions = feedback.defenseResult?.questions || [];
    if (storedQuestions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No active defense questions found for this resume. Start a defense session first.',
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
        answer: ansText,
      };
    });

    const evalResult = await aiService.evaluateResumeDefenseAnswers(
      storedQuestions,
      formattedAnswers,
      feedback.submittedResumeText
    );

    feedback.defenseResult.userAnswers = formattedAnswers;
    feedback.defenseResult.overallCredibilityScore = evalResult.overallCredibilityScore;
    feedback.defenseResult.perQuestionFeedback = evalResult.perQuestionFeedback;
    feedback.defenseResult.recommendedResumeEdits = evalResult.recommendedResumeEdits;
    feedback.defenseResult.completedAt = new Date();

    await feedback.save();

    res.status(200).json({
      success: true,
      message: 'Resume defense evaluation completed successfully!',
      defenseResult: feedback.defenseResult,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get latest Resume Defense Test result
// @route   GET /api/resume/:resumeFeedbackId/defense
// @access  Private
const getResumeDefense = async (req, res, next) => {
  try {
    const { resumeFeedbackId } = req.params;

    const feedback = await ResumeFeedback.findOne({
      _id: resumeFeedbackId,
      user: req.user._id,
    });

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Resume evaluation not found.',
      });
    }

    res.status(200).json({
      success: true,
      defenseResult: feedback.defenseResult || null,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  analyzeResume,
  getResumeHistory,
  startResumeDefense,
  submitResumeDefense,
  getResumeDefense,
};

