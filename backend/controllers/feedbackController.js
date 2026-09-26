const PlatformFeedback = require('../models/PlatformFeedback');
const SecurityLog = require('../models/SecurityLog');

// Strip HTML tags / script tags to prevent stored XSS
const sanitizeText = (str) => {
  if (typeof str !== 'string') return '';
  return str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .trim();
};

/**
 * @desc    Submit or update overall platform feedback
 * @route   POST /api/feedback/platform
 * @access  Private
 */
const submitPlatformFeedback = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { overallRating, featureRatings, comment } = req.body;

    const numRating = Number(overallRating);
    if (!numRating || numRating < 1 || numRating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Overall rating is required and must be an integer between 1 and 5.',
      });
    }

    const sanitizedComment = sanitizeText(comment || '');

    // Validate feature ratings if provided
    const cleanFeatureRatings = {
      aiAccuracy: null,
      roadmapUsefulness: null,
      uiExperience: null,
    };

    if (featureRatings && typeof featureRatings === 'object') {
      ['aiAccuracy', 'roadmapUsefulness', 'uiExperience'].forEach((key) => {
        if (featureRatings[key] !== undefined && featureRatings[key] !== null) {
          const val = Number(featureRatings[key]);
          if (val >= 1 && val <= 5) {
            cleanFeatureRatings[key] = val;
          }
        }
      });
    }

    // Check if user submitted feedback in the last 30 days (soft limit)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentFeedback = await PlatformFeedback.findOne({
      user: userId,
      createdAt: { $gte: thirtyDaysAgo },
    }).sort({ createdAt: -1 });

    let feedbackDoc;
    let isUpdate = false;

    if (recentFeedback) {
      // Update existing submission
      recentFeedback.overallRating = numRating;
      recentFeedback.featureRatings = cleanFeatureRatings;
      recentFeedback.comment = sanitizedComment;
      recentFeedback.updatedAt = new Date();
      await recentFeedback.save();
      feedbackDoc = recentFeedback;
      isUpdate = true;
    } else {
      // Create new feedback
      feedbackDoc = await PlatformFeedback.create({
        user: userId,
        overallRating: numRating,
        featureRatings: cleanFeatureRatings,
        comment: sanitizedComment,
      });
    }

    // Log security activity
    await SecurityLog.logAction({
      userId,
      action: 'platform-feedback',
      req,
      details: {
        feedbackId: feedbackDoc._id,
        isUpdate,
        overallRating: numRating,
      },
    });

    res.status(isUpdate ? 200 : 201).json({
      success: true,
      message: isUpdate
        ? 'Your platform feedback has been updated! Thank you for helping us improve.'
        : 'Thank you for your feedback! Your insights directly guide our engineering roadmap.',
      isUpdate,
      feedback: feedbackDoc,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get aggregated platform feedback statistics (Public)
 * @route   GET /api/feedback/platform/summary
 * @access  Public
 */
const getPlatformFeedbackSummary = async (req, res, next) => {
  try {
    const allFeedback = await PlatformFeedback.find({}).lean();

    if (!allFeedback || allFeedback.length === 0) {
      return res.status(200).json({
        success: true,
        summary: {
          totalCount: 0,
          averageOverall: 0,
          distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
          averageFeatures: {
            aiAccuracy: null,
            roadmapUsefulness: null,
            uiExperience: null,
          },
        },
      });
    }

    const totalCount = allFeedback.length;
    let sumOverall = 0;
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

    let aiSum = 0,
      aiCount = 0;
    let roadmapSum = 0,
      roadmapCount = 0;
    let uiSum = 0,
      uiCount = 0;

    allFeedback.forEach((f) => {
      sumOverall += f.overallRating;
      const rounded = Math.round(f.overallRating);
      if (distribution[rounded] !== undefined) {
        distribution[rounded]++;
      }

      if (f.featureRatings?.aiAccuracy) {
        aiSum += f.featureRatings.aiAccuracy;
        aiCount++;
      }
      if (f.featureRatings?.roadmapUsefulness) {
        roadmapSum += f.featureRatings.roadmapUsefulness;
        roadmapCount++;
      }
      if (f.featureRatings?.uiExperience) {
        uiSum += f.featureRatings.uiExperience;
        uiCount++;
      }
    });

    const averageOverall = Number((sumOverall / totalCount).toFixed(1));
    const averageFeatures = {
      aiAccuracy: aiCount > 0 ? Number((aiSum / aiCount).toFixed(1)) : null,
      roadmapUsefulness:
        roadmapCount > 0 ? Number((roadmapSum / roadmapCount).toFixed(1)) : null,
      uiExperience: uiCount > 0 ? Number((uiSum / uiCount).toFixed(1)) : null,
    };

    res.status(200).json({
      success: true,
      summary: {
        totalCount,
        averageOverall,
        distribution,
        averageFeatures,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current user's existing feedback (to pre-fill form)
 * @route   GET /api/feedback/platform/mine
 * @access  Private
 */
const getMyPlatformFeedback = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const feedback = await PlatformFeedback.findOne({ user: userId })
      .sort({ updatedAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      feedback: feedback || null,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Admin: get all platform feedback with user info & full details
 * @route   GET /api/admin/feedback/platform
 * @access  Private/Admin
 */
const getAdminPlatformFeedback = async (req, res, next) => {
  try {
    const feedbackList = await PlatformFeedback.find({})
      .populate('user', 'name email avatar role')
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: feedbackList.length,
      feedback: feedbackList,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitPlatformFeedback,
  getPlatformFeedbackSummary,
  getMyPlatformFeedback,
  getAdminPlatformFeedback,
};
