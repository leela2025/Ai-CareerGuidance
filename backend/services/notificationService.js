const Notification = require('../models/Notification');

/**
 * Dispatch an in-app notification to a user
 */
const sendNotification = async ({ userId, title, message, type = 'system', link = '' }) => {
  try {
    if (!userId || !message) return null;
    return await Notification.create({
      user: userId,
      title: title || 'System Update',
      message: message.trim(),
      type,
      link,
    });
  } catch (error) {
    console.error('Failed to create in-app notification:', error.message);
    return null;
  }
};

module.exports = {
  sendNotification,
};
