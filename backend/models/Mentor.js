const mongoose = require('mongoose');

const mentorSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    // Category: Verified Expert/Counsellor vs. Relatable Peer Motivator
    type: {
      type: String,
      enum: {
        values: ['expert', 'peer'],
        message: '{VALUE} is not a valid mentor type',
      },
      required: [true, 'Mentor type (expert or peer) is required'],
      index: true,
    },
    headline: {
      type: String,
      required: [true, 'Headline is required'],
      trim: true,
      maxlength: [140, 'Headline cannot exceed 140 characters'],
    },
    bio: {
      type: String,
      required: [true, 'Bio is required'],
      maxlength: [2000, 'Bio cannot exceed 2000 characters'],
    },
    expertiseTags: {
      type: [String],
      default: [],
      index: true,
    },
    // Verified by admin (relevant for expert type; peers can be auto-approved)
    verified: {
      type: Boolean,
      default: false,
      index: true,
    },
    // Application moderation status
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      index: true,
    },
    verifiedAt: {
      type: Date,
      default: null,
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    rejectionReason: {
      type: String,
      trim: true,
      default: '',
    },
    rejectedAt: {
      type: Date,
      default: null,
    },
    rejectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    availability: {
      type: String,
      default: 'Flexible / Weekday Evenings',
      trim: true,
    },
    rating: {
      type: Number,
      default: 5.0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    totalConversations: {
      type: Number,
      default: 0,
    },
    companyOrCollege: {
      type: String,
      default: '',
      trim: true,
    },
    yearsOfExperience: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Method to recalculate average rating from feedback
mentorSchema.methods.recalculateRating = async function () {
  const MentorFeedback = mongoose.model('MentorFeedback');
  const feedbacks = await MentorFeedback.find({ mentor: this._id });

  if (feedbacks.length === 0) {
    this.rating = 5.0;
    this.totalReviews = 0;
  } else {
    const sum = feedbacks.reduce((acc, f) => acc + f.rating, 0);
    this.rating = Math.round((sum / feedbacks.length) * 10) / 10;
    this.totalReviews = feedbacks.length;
  }

  await this.save();
  return this.rating;
};

module.exports = mongoose.model('Mentor', mentorSchema);
