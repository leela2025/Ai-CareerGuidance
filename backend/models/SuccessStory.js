const mongoose = require('mongoose');

const successStorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required for success story'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Story title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    storyText: {
      type: String,
      required: [true, 'Story narrative is required'],
      trim: true,
      maxlength: [3000, 'Story text cannot exceed 3000 characters'],
    },
    lifeStageJourney: {
      type: String,
      trim: true,
      default: '',
      maxlength: [200, 'Life stage journey tag cannot exceed 200 characters'],
    },
    beforeAfter: {
      before: {
        type: String,
        trim: true,
        default: '',
        maxlength: [300, 'Before description cannot exceed 300 characters'],
      },
      after: {
        type: String,
        trim: true,
        default: '',
        maxlength: [300, 'After description cannot exceed 300 characters'],
      },
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      index: true,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    featured: {
      type: Boolean,
      default: false,
      index: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    approvedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for public approved query sorted by featured and createdAt
successStorySchema.index({ status: 1, featured: -1, createdAt: -1 });

module.exports = mongoose.model('SuccessStory', successStorySchema);
