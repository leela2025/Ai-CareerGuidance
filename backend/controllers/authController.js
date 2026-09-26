const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Profile = require('../models/Profile');
const SecurityLog = require('../models/SecurityLog');

// Helper to generate JWT token
const generateToken = (id, role) => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET || 'career_compass_default_secret_key_2026',
    { expiresIn: '7d' }
  );
};

// @desc    Register a new student or admin user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email address already exists. Please log in.',
      });
    }

    // Default to student role unless explicitly admin
    const userRole = role === 'admin' ? 'admin' : 'student';

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      role: userRole,
    });

    // Automatically create an initial blank profile for the user
    let userProfile = null;
    try {
      userProfile = await Profile.create({
        user: user._id,
        educationLevel: 'B.Tech / B.E.',
        branch: 'Computer Science & Engineering',
        graduationYear: new Date().getFullYear().toString(),
        currentSkills: [],
        interests: [],
      });
    } catch (profileErr) {
      console.warn('Initial profile creation note:', profileErr.message);
    }

    const token = generateToken(user._id, user.role);

    // Audit log
    await SecurityLog.logAction({
      userId: user._id,
      action: 'register',
      req,
      details: { email: user.email, role: user.role },
    });

    res.status(201).json({
      success: true,
      message: 'Account registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      profile: userProfile || null,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get JWT token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password',
      });
    }

    // Explicitly select password field as it is excluded in schema
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. User not found.',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Password does not match.',
      });
    }

    const token = generateToken(user._id, user.role);

    // Audit log
    await SecurityLog.logAction({
      userId: user._id,
      action: 'login',
      req,
      details: { email: user.email },
    });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get currently authenticated user details & profile
// @route   GET /api/auth/me
// @access  Private (JWT Protected)
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile no longer exists in database.',
      });
    }

    const profile = await Profile.findOne({ user: req.user._id });

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
      profile: profile || null,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Initiate password reset (Generate token & 6-digit OTP)
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a registered email address.',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No registered account found with this email address.',
      });
    }

    // Generate reset token and 6-digit verification code
    const { resetToken, resetCode } = user.getResetPasswordData();
    await user.save({ validateBeforeSave: false });

    // Audit log
    await SecurityLog.logAction({
      userId: user._id,
      action: 'forgot-password',
      req,
      details: { email: user.email },
    });

    res.status(200).json({
      success: true,
      message: 'Password reset code has been generated successfully.',
      resetToken,
      resetCode,
      email: user.email,
      expiresInMinutes: 15,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify reset OTP code or token validity
// @route   POST /api/auth/verify-reset-code
// @access  Public
const verifyResetCode = async (req, res, next) => {
  try {
    const crypto = require('crypto');
    const { email, code, token } = req.body;

    let user = null;

    if (token) {
      const hashedToken = crypto.createHash('sha256').update(token.trim()).digest('hex');
      user = await User.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { $gt: Date.now() },
      });
    } else if (email && code) {
      const hashCode = crypto.createHash('sha256').update(code.trim()).digest('hex');
      user = await User.findOne({
        email: email.trim().toLowerCase(),
        resetPasswordCode: hashCode,
        resetPasswordExpires: { $gt: Date.now() },
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Please provide either a reset token or email and 6-digit code.',
      });
    }

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Verification code is invalid or has expired (valid for 15 minutes).',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Code verified successfully. You may now enter your new password.',
      valid: true,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset user password using token or 6-digit code
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res, next) => {
  try {
    const crypto = require('crypto');
    const { token, email, code, newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long.',
      });
    }

    let user = null;

    if (token) {
      const hashedToken = crypto.createHash('sha256').update(token.trim()).digest('hex');
      user = await User.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { $gt: Date.now() },
      }).select('+password');
    } else if (email && code) {
      const hashCode = crypto.createHash('sha256').update(code.trim()).digest('hex');
      user = await User.findOne({
        email: email.trim().toLowerCase(),
        resetPasswordCode: hashCode,
        resetPasswordExpires: { $gt: Date.now() },
      }).select('+password');
    } else {
      return res.status(400).json({
        success: false,
        message: 'Verification credentials (token or email + code) are required.',
      });
    }

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Password reset link or verification code is invalid or has expired.',
      });
    }

    // Set new password
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordCode = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    // Audit log
    await SecurityLog.logAction({
      userId: user._id,
      action: 'reset-password',
      req,
      details: { email: user.email },
    });

    const jwtToken = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      message: 'Password has been reset successfully! You can now log in.',
      token: jwtToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  forgotPassword,
  verifyResetCode,
  resetPassword,
};
