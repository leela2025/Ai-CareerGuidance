const mongoose = require('mongoose');

const securityLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    action: {
      type: String,
      required: true,
      enum: [
        'login',
        'register',
        'forgot-password',
        'reset-password',
        'profile-update',
        'journey-start',
        'journey-choose',
        'journey-branch',
        'journey-satisfaction',
        'resume-scan',
        'mentor-apply',
        'connection-request',
        'connection-respond',
        'platform-feedback',
        'story-submit',
        'story-moderate',
        'story-like',
      ],
      index: true,
    },
    ipAddress: {
      type: String,
      default: '127.0.0.1',
    },
    userAgent: {
      type: String,
      default: '',
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: false,
  }
);

// Helper static method for clean logging
securityLogSchema.statics.logAction = async function ({
  userId,
  action,
  req,
  details = {},
}) {
  try {
    const ipAddress =
      req?.headers?.['x-forwarded-for']?.split(',')[0]?.trim() ||
      req?.socket?.remoteAddress ||
      req?.ip ||
      '127.0.0.1';
    const userAgent = req?.headers?.['user-agent'] || '';

    return await this.create({
      user: userId,
      action,
      ipAddress,
      userAgent,
      details,
      timestamp: new Date(),
    });
  } catch (err) {
    console.warn(`⚠️ [SecurityLog Warning] Failed to record log: ${err.message}`);
    return null;
  }
};

module.exports = mongoose.model('SecurityLog', securityLogSchema);
