const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;
  const authHeader = req.headers.authorization || req.headers.Authorization;

  if (authHeader && authHeader.toLowerCase().startsWith('bearer ')) {
    try {
      token = authHeader.split(/\s+/)[1];

      if (!token) {
        return res.status(401).json({
          success: false,
          message: 'Access denied. No authentication token provided.',
        });
      }

      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'career_compass_default_secret_key_2026'
      );

      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User belonging to this token no longer exists.',
        });
      }

      req.user = user;
      next();
    } catch (error) {
      console.error('JWT Verification Error:', error.message);
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired authentication token. Please log in again.',
      });
    }
  } else {
    return res.status(401).json({
      success: false,
      message: 'Access denied. Authorization Bearer token required.',
    });
  }
};

module.exports = { protect };
