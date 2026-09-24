const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    educationLevel: {
      type: String,
      required: [true, 'Education level is required'],
      trim: true,
      default: 'B.Tech / B.E.',
    },
    branch: {
      type: String,
      required: [true, 'Branch / Stream of study is required'],
      trim: true,
      default: 'Computer Science and Engineering',
    },
    graduationYear: {
      type: String,
      trim: true,
      default: '2026',
    },
    currentSkills: {
      type: [String],
      default: [],
    },
    interests: {
      type: [String],
      default: [],
    },
    resumeText: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Profile', profileSchema);
