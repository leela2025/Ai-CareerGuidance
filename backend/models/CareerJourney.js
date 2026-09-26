const mongoose = require('mongoose');

const alternativePathSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    reasoning: {
      type: String,
      required: true,
    },
    matchScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 85,
    },
    nextSteps: {
      type: [String],
      default: [],
    },
    estimatedTimeframe: {
      type: String,
      default: '3-6 Months',
    },
  },
  { _id: false }
);

const chosenPathSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    reasoning: {
      type: String,
      default: '',
    },
    matchScore: {
      type: Number,
      min: 0,
      max: 100,
    },
    nextSteps: {
      type: [String],
      default: [],
    },
    estimatedTimeframe: {
      type: String,
      default: '3-6 Months',
    },
    chosenAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const journeyStageNodeSchema = new mongoose.Schema(
  {
    stageId: {
      type: String,
      required: true,
    },
    lifeStageAtTime: {
      type: String,
      enum: [
        'school',
        'undergraduate',
        'fresher',
        'working-professional',
        'career-shift',
        're-entering',
      ],
      required: true,
    },
    decisionPoint: {
      type: String,
      required: true,
    },
    chosenPath: {
      type: chosenPathSchema,
      default: null,
    },
    alternativePaths: {
      type: [alternativePathSchema],
      validate: {
        validator: function (paths) {
          // Always ensure at least 3 alternatives as per product rule
          return Array.isArray(paths) && paths.length >= 3;
        },
        message: 'A journey node must offer at least 3 alternative paths.',
      },
      default: [],
    },
    status: {
      type: String,
      enum: ['exploring', 'committed', 'abandoned', 'revisited'],
      default: 'exploring',
    },
    satisfactionRating: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
    },
    satisfactionNote: {
      type: String,
      default: '',
    },
    branchReason: {
      type: String,
      default: '',
    },
    parentStageId: {
      type: String,
      default: null,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const careerJourneySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    stages: {
      type: [journeyStageNodeSchema],
      default: [],
    },
    currentStageId: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('CareerJourney', careerJourneySchema);
