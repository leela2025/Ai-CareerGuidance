const mongoose = require('mongoose');

const platformFeedbackSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required for platform feedback'],
      index: true,
    },
    overallRating: {
      type: Number,
      required: [true, 'Overall rating between 1 and 5 is required'],
      min: [1, 'Minimum rating is 1'],
      max: [5, 'Maximum rating is 5'],
    },
    featureRatings: {
      aiAccuracy: {
        type: Number,
        min: 1,
        max: 5,
        default: null,
      },
      roadmapUsefulness: {
        type: Number,
        min: 1,
        max: 5,
        default: null,
      },
      uiExperience: {
        type: Number,
        min: 1,
        max: 5,
        default: null,
      },
    },
    comment: {
      type: String,
      trim: true,
      maxlength: [2000, 'Comment cannot exceed 2000 characters'],
      default: '',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Index for user search and sorting
platformFeedbackSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('PlatformFeedback', platformFeedbackSchema);
