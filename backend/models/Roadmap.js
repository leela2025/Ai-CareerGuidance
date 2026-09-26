const mongoose = require('mongoose');

const learningResourceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    url: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['course', 'documentation', 'video', 'project', 'article'],
      default: 'documentation',
    },
  },
  { _id: false }
);

const milestoneSchema = new mongoose.Schema(
  {
    skillId: {
      type: String,
      required: true,
      trim: true,
    },
    skillName: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      default: 'Core Skill',
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'completed'],
      default: 'pending',
    },
    resources: {
      type: [learningResourceSchema],
      default: [],
    },
    order: {
      type: Number,
      required: true,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    verifiedAt: {
      type: Date,
      default: null,
    },
  },
  { _id: true }
);

const roadmapSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    careerGoal: {
      type: String,
      required: [true, 'Career goal is required for roadmap'],
      trim: true,
    },
    milestones: {
      type: [milestoneSchema],
      default: [],
    },
    overallProgress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
  },
  {
    timestamps: true,
  }
);

// Method to recalculate overallProgress based on completed milestones
roadmapSchema.methods.recalculateProgress = function () {
  if (!this.milestones || this.milestones.length === 0) {
    this.overallProgress = 0;
    return this.overallProgress;
  }
  const completedCount = this.milestones.filter(
    (m) => m.status === 'completed'
  ).length;
  this.overallProgress = Math.round((completedCount / this.milestones.length) * 100);
  return this.overallProgress;
};

module.exports = mongoose.model('Roadmap', roadmapSchema);
