const mongoose = require('mongoose');

const skillAssessmentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    skillName: {
      type: String,
      required: [true, 'Skill name is required for assessment'],
      trim: true,
    },
    assessmentType: {
      type: String,
      enum: ['quiz', 'practical-task', 'dependency-check'],
      default: 'quiz',
    },
    status: {
      type: String,
      enum: ['not-started', 'in-progress', 'passed', 'failed'],
      default: 'not-started',
    },
    score: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    // Quiz questions generated for this assessment
    questions: {
      type: Array,
      default: [],
    },
    // Practical task details if assessmentType === 'practical-task'
    practicalTask: {
      type: Object,
      default: null,
    },
    // User submitted responses (quiz answers array or task solution text/code)
    attemptData: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    // AI Evaluation results (honest scoring, feedback, identified gaps)
    aiEvaluation: {
      score: { type: Number, default: 0 },
      passed: { type: Boolean, default: false },
      specificFeedback: { type: [String], default: [] },
      gapsIdentified: { type: [String], default: [] },
      evaluatedAt: { type: Date, default: null },
    },
    // Mistake pattern analysis (triggered on repeated failures to diagnose root misconception)
    mistakeAnalysis: {
      rootCauseMisconception: { type: String, default: '' },
      affectedConcepts: { type: [String], default: [] },
      targetedExplanation: { type: String, default: '' },
      suggestedMicroResource: { type: String, default: '' },
      analyzedAt: { type: Date, default: null },
    },
    attemptNumber: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for fast lookup of a user's attempts on a particular skill
skillAssessmentSchema.index({ userId: 1, skillName: 1, createdAt: -1 });

module.exports = mongoose.model('SkillAssessment', skillAssessmentSchema);
