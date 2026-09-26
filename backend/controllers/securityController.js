const SecurityLog = require('../models/SecurityLog');

/**
 * @desc    Get user's personal security & activity audit trail
 * @route   GET /api/security/my-activity
 * @access  Private
 */
const getMyActivity = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const logs = await SecurityLog.find({ user: userId })
      .sort({ timestamp: -1 })
      .limit(30)
      .lean();

    res.status(200).json({
      success: true,
      count: logs.length,
      logs: logs.map((log) => ({
        id: log._id,
        action: log.action,
        timestamp: log.timestamp,
        ipAddress: log.ipAddress,
        userAgent: log.userAgent,
        details: log.details || {},
      })),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyActivity,
};
