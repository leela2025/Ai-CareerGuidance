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
    // Lifelong Career Navigator: Life stage categorization
    lifeStage: {
      type: String,
      enum: [
        'school',
        'undergraduate',
        'fresher',
        'working-professional',
        'career-shift',
        're-entering',
      ],
      default: 'undergraduate',
      required: true,
    },
    // Flexible object capturing life stage specific attributes:
    // e.g. for school: { grade, schoolBoard, favoriteSubjects }
    // e.g. for working-professional: { currentRole, yearsOfExperience, currentIndustry }
    // e.g. for career-shift: { fromField, targetField, reason }
    // e.g. for re-entering: { previousRole, gapYears, focusArea }
    currentStageDetails: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    // Constraints array (budget limits, relocation limits, time availability)
    constraints: {
      type: [String],
      default: [],
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
