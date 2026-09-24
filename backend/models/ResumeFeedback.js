const mongoose = require('mongoose');

const resumeFeedbackSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    submittedResumeText: {
      type: String,
      required: [true, 'Resume text is required for analysis'],
    },
    aiScore: {
      type: Number,
      required: true,
      min: [0, 'Score cannot be less than 0'],
      max: [100, 'Score cannot exceed 100'],
    },
    targetRole: {
      type: String,
      default: 'Software Engineer',
      trim: true,
    },
    strengths: {
      type: [String],
      default: [],
    },
    improvements: {
      type: [String],
      default: [],
    },
    summary: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('ResumeFeedback', resumeFeedbackSchema);
