const Profile = require('../models/Profile');
const SecurityLog = require('../models/SecurityLog');

// @desc    Get current user profile
// @route   GET /api/profile
// @access  Private
const getProfile = async (req, res, next) => {
  try {
    let profile = await Profile.findOne({ user: req.user._id }).populate('user', 'name email role');

    if (!profile) {
      // Auto-create default profile if not already present
      profile = await Profile.create({
        user: req.user._id,
        lifeStage: 'undergraduate',
        currentStageDetails: {},
        constraints: [],
        educationLevel: 'B.Tech / B.E.',
        branch: 'Computer Science & Engineering',
        graduationYear: '2026',
        currentSkills: [],
        interests: [],
      });
      profile = await profile.populate('user', 'name email role');
    }

    res.status(200).json({
      success: true,
      profile,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create or update user profile
// @route   PUT /api/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const {
      lifeStage,
      currentStageDetails,
      constraints,
      educationLevel,
      branch,
      graduationYear,
      currentSkills,
      interests,
      resumeText,
    } = req.body;

    const profileFields = {
      user: req.user._id,
    };

    if (lifeStage !== undefined) profileFields.lifeStage = lifeStage;
    if (currentStageDetails !== undefined) profileFields.currentStageDetails = currentStageDetails;
    if (Array.isArray(constraints)) {
      profileFields.constraints = constraints.map((c) => (typeof c === 'string' ? c.trim() : c)).filter(Boolean);
    }
    if (educationLevel !== undefined) profileFields.educationLevel = educationLevel;
    if (branch !== undefined) profileFields.branch = branch;
    if (graduationYear !== undefined) profileFields.graduationYear = graduationYear;
    if (resumeText !== undefined) profileFields.resumeText = resumeText;

    if (Array.isArray(currentSkills)) {
      profileFields.currentSkills = currentSkills.map((s) => s.trim()).filter(Boolean);
    }
    if (Array.isArray(interests)) {
      profileFields.interests = interests.map((i) => i.trim()).filter(Boolean);
    }

    const profile = await Profile.findOneAndUpdate(
      { user: req.user._id },
      { $set: profileFields },
      { new: true, upsert: true, runValidators: true }
    ).populate('user', 'name email role');

    // Audit log
    await SecurityLog.logAction({
      userId: req.user._id,
      action: 'profile-update',
      req,
      details: {
        lifeStage: profile.lifeStage,
        updatedFields: Object.keys(profileFields).filter((k) => k !== 'user'),
      },
    });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      profile,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
};
