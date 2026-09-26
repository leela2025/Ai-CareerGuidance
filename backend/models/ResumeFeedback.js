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
    defenseResult: {
      questions: [
        {
          questionId: { type: String },
          relatedClaim: { type: String },
          question: { type: String },
        },
      ],
      userAnswers: [
        {
          questionId: { type: String },
          question: { type: String },
          answer: { type: String },
        },
      ],
      overallCredibilityScore: { type: Number, default: null },
      perQuestionFeedback: [
        {
          question: { type: String },
          answer: { type: String },
          verdict: {
            type: String,
            enum: ['convincing', 'vague', 'concerning'],
          },
          feedback: { type: String },
        },
      ],
      recommendedResumeEdits: {
        type: [String],
        default: [],
      },
      completedAt: { type: Date, default: null },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('ResumeFeedback', resumeFeedbackSchema);
