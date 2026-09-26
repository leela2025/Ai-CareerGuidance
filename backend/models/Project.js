const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Project title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Project description is required'],
      trim: true,
    },
    techStack: {
      type: [String],
      default: [],
    },
    userRole: {
      type: String,
      default: 'Lead Developer / Core Contributor',
      trim: true,
    },
    claimedComplexity: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'intermediate',
    },
    // AI Reality Check Result (evaluates if claims/architecture match realistic implementation)
    realityCheckResult: {
      realismScore: { type: Number, default: null },
      consistencyFlags: { type: [String], default: [] },
      honestAssessment: { type: String, default: '' },
      suggestedFramingImprovements: { type: [String], default: [] },
      checkedAt: { type: Date, default: null },
    },
    // Mock Project Interview Result (pressure-tests technical decisions & trade-offs)
    interviewResult: {
      questions: { type: Array, default: [] },
      answers: { type: Array, default: [] },
      overallScore: { type: Number, default: null },
      perQuestionFeedback: { type: Array, default: [] },
      readinessVerdict: { type: String, default: '' },
      completedAt: { type: Date, default: null },
    },
  },
  {
    timestamps: true,
  }
);

projectSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Project', projectSchema);
