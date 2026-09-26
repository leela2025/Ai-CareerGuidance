const rateLimit = require('express-rate-limit');

/**
 * Rate limiter for AI-intensive endpoints (Anthropic Claude API invocations).
 * Enforces a strict budget to prevent quota exhaustion and API abuse.
 */
const journeyAiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // limit each user or IP to 15 AI-calling requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  validate: false,
  keyGenerator: (req) => {
    // Prefer authenticated user id; fall back to client IP address
    return req.user?._id ? req.user._id.toString() : (req.ip || 'anonymous');
  },
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message:
        'Too many career guidance AI generation requests from this account. Please wait 15 minutes before exploring new branches.',
      retryAfterMinutes: 15,
    });
  },
});

/**
 * Rate limiter for connection requests to prevent mentor spam.
 * Max 20 requests per 24 hours per user.
 */
const connectionRequestLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  validate: false,
  keyGenerator: (req) => {
    return req.user?._id ? req.user._id.toString() : (req.ip || 'anonymous');
  },
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'You have reached the maximum of 20 mentor connection requests per day. Please try again tomorrow.',
    });
  },
});

/**
 * Rate limiter for story submissions to prevent spam.
 * Max 5 submissions per 24 hours per user.
 */
const storySubmissionLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  validate: false,
  keyGenerator: (req) => {
    return req.user?._id ? req.user._id.toString() : (req.ip || 'anonymous');
  },
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'You have reached the maximum of 5 story submissions per day. Please try again tomorrow.',
    });
  },
});

/**
 * Rate limiter for platform feedback.
 * Max 10 submissions/updates per 24 hours per user.
 */
const feedbackLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  validate: false,
  keyGenerator: (req) => {
    return req.user?._id ? req.user._id.toString() : (req.ip || 'anonymous');
  },
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many feedback submissions. Please try again tomorrow.',
    });
  },
});

/**
 * Rate limiter for Skill Assessment generation & starts.
 * Max 15 assessment starts per hour per user.
 */
const assessmentLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  validate: false,
  keyGenerator: (req) => {
    return req.user?._id ? req.user._id.toString() : (req.ip || 'anonymous');
  },
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'You have reached the limit of 15 assessment starts per hour. Please take time to study and review before attempting more assessments.',
      retryAfterMinutes: 60,
    });
  },
});

module.exports = {
  journeyAiLimiter,
  connectionRequestLimiter,
  storySubmissionLimiter,
  feedbackLimiter,
  assessmentLimiter,
};


