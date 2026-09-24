const mongoose = require('mongoose');

const careerPathSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    matchScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    description: {
      type: String,
      required: true,
    },
    targetRoles: {
      type: [String],
      default: [],
    },
    marketDemand: {
      type: String,
      enum: ['Moderate', 'High', 'Very High', 'Exponential'],
      default: 'High',
    },
  },
  { _id: true }
);

const careerSuggestionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    suggestedPaths: {
      type: [careerPathSchema],
      validate: [
        (val) => val.length > 0,
        'Career suggestion must contain at least one suggested path',
      ],
    },
    skillGaps: {
      type: [String],
      default: [],
    },
    aiReasoning: {
      type: String,
      default: '',
    },
    generatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('CareerSuggestion', careerSuggestionSchema);
