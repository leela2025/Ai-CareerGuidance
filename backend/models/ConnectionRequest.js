const mongoose = require('mongoose');

const connectionRequestSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    mentor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Mentor',
      required: true,
      index: true,
    },
    mentorUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined', 'completed'],
      default: 'pending',
      index: true,
    },
    message: {
      type: String,
      required: [true, 'Please include an initial message describing what guidance you are seeking'],
      trim: true,
      maxlength: [1000, 'Message cannot exceed 1000 characters'],
    },
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
      default: null,
    },
    respondedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate pending requests from same user to same mentor
connectionRequestSchema.index({ user: 1, mentor: 1, status: 1 });

module.exports = mongoose.model('ConnectionRequest', connectionRequestSchema);
