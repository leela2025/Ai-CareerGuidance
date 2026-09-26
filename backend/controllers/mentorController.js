const Mentor = require('../models/Mentor');
const User = require('../models/User');
const ConnectionRequest = require('../models/ConnectionRequest');
const Conversation = require('../models/Conversation');
const MentorFeedback = require('../models/MentorFeedback');
const SecurityLog = require('../models/SecurityLog');
const { sendNotification } = require('../services/notificationService');

/**
 * @desc    Get all mentors with filtering (type, tag, verified, search)
 * @route   GET /api/mentors
 * @access  Public
 */
const getMentors = async (req, res, next) => {
  try {
    const { type, tag, verified, search } = req.query;

    const query = {};

    if (type && ['expert', 'peer'].includes(type.toLowerCase())) {
      query.type = type.toLowerCase();
    }

    if (tag) {
      query.expertiseTags = { $in: [new RegExp(tag, 'i')] };
    }

    // Exclude rejected mentors from public directory
    query.status = { $ne: 'rejected' };

    // In public directory: experts must be verified; peers can be active
    if (!type && verified === undefined) {
      query.$or = [{ type: 'expert', verified: true }, { type: 'peer' }];
    } else if (type === 'expert' && verified === undefined) {
      query.verified = true;
    }

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { headline: searchRegex },
        { bio: searchRegex },
        { expertiseTags: searchRegex },
        { companyOrCollege: searchRegex },
      ];
    }

    const mentors = await Mentor.find(query)
      .populate('user', 'name avatar role')
      .sort({ rating: -1, totalConversations: -1, createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: mentors.length,
      mentors: mentors.map((m) => ({
        id: m._id,
        user: {
          id: m.user?._id,
          name: m.user?.name || 'Mentor',
          avatar: m.user?.avatar || '',
        },
        type: m.type,
        headline: m.headline,
        bio: m.bio,
        expertiseTags: m.expertiseTags,
        verified: m.verified,
        availability: m.availability,
        rating: m.rating,
        totalReviews: m.totalReviews,
        totalConversations: m.totalConversations,
        companyOrCollege: m.companyOrCollege,
        yearsOfExperience: m.yearsOfExperience,
        createdAt: m.createdAt,
      })),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single mentor profile with bio, rating, reviews
 * @route   GET /api/mentors/:id
 * @access  Public
 */
const getMentorById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const mentor = await Mentor.findById(id).populate('user', 'name avatar role');
    if (!mentor) {
      return res.status(404).json({
        success: false,
        message: 'Mentor profile not found.',
      });
    }

    // Fetch past reviews/feedback
    const reviews = await MentorFeedback.find({ mentor: id })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(15)
      .lean();

    res.status(200).json({
      success: true,
      mentor: {
        id: mentor._id,
        user: {
          id: mentor.user?._id,
          name: mentor.user?.name || 'Mentor',
          avatar: mentor.user?.avatar || '',
        },
        type: mentor.type,
        headline: mentor.headline,
        bio: mentor.bio,
        expertiseTags: mentor.expertiseTags,
        verified: mentor.verified,
        availability: mentor.availability,
        rating: mentor.rating,
        totalReviews: mentor.totalReviews,
        totalConversations: mentor.totalConversations,
        companyOrCollege: mentor.companyOrCollege,
        yearsOfExperience: mentor.yearsOfExperience,
        createdAt: mentor.createdAt,
      },
      reviews: reviews.map((r) => ({
        id: r._id,
        user: {
          name: r.user?.name || 'Student',
          avatar: r.user?.avatar || '',
        },
        rating: r.rating,
        comment: r.comment,
        createdAt: r.createdAt,
      })),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Apply to become a mentor (peer or expert)
 * @route   POST /api/mentors/apply
 * @access  Private
 */
const applyMentor = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const {
      type,
      headline,
      bio,
      expertiseTags,
      availability,
      companyOrCollege,
      yearsOfExperience,
    } = req.body;

    if (!type || !['expert', 'peer'].includes(type.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: "Mentor type must be either 'expert' or 'peer'.",
      });
    }

    if (!headline || !bio) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both a headline and a bio.',
      });
    }

    // Check if user is already a mentor
    let mentor = await Mentor.findOne({ user: userId });
    if (mentor) {
      return res.status(400).json({
        success: false,
        message: 'You already have an active mentor profile on CareerCompassAI.',
      });
    }

    // Parse expertise tags
    let tagsArray = [];
    if (Array.isArray(expertiseTags)) {
      tagsArray = expertiseTags.map((t) => (typeof t === 'string' ? t.trim() : t)).filter(Boolean);
    } else if (typeof expertiseTags === 'string') {
      tagsArray = expertiseTags.split(',').map((t) => t.trim()).filter(Boolean);
    }

    // Peer mentors are auto-approved; expert mentors require admin verification
    const isPeer = type.toLowerCase() === 'peer';
    const isVerified = isPeer ? true : false;
    const initialStatus = isPeer ? 'approved' : 'pending';

    mentor = await Mentor.create({
      user: userId,
      type: type.toLowerCase(),
      headline: headline.trim(),
      bio: bio.trim(),
      expertiseTags: tagsArray,
      verified: isVerified,
      status: initialStatus,
      availability: availability?.trim() || 'Flexible / Weekday Evenings',
      companyOrCollege: companyOrCollege?.trim() || '',
      yearsOfExperience: yearsOfExperience?.trim() || '',
    });

    // Update user record
    await User.findByIdAndUpdate(userId, {
      isMentor: true,
      mentorProfileId: mentor._id,
    });

    // Audit log
    await SecurityLog.logAction({
      userId,
      action: 'mentor-apply',
      req,
      details: {
        mentorId: mentor._id,
        type: mentor.type,
        verified: mentor.verified,
      },
    });

    res.status(201).json({
      success: true,
      message: isPeer
        ? 'Congratulations! Your Peer Motivator profile is now active and live.'
        : 'Your Expert Mentor application has been submitted and is pending admin credential verification.',
      mentor,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all pending expert mentor applications (Admin Only)
 * @route   GET /api/admin/mentors/pending
 * @access  Private / Admin
 */
const getAdminPendingMentors = async (req, res, next) => {
  try {
    const pendingMentors = await Mentor.find({
      type: 'expert',
      $or: [{ status: 'pending' }, { verified: false, status: { $ne: 'rejected' } }],
    })
      .populate('user', 'name email avatar role')
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: pendingMentors.length,
      mentors: pendingMentors.map((m) => ({
        id: m._id,
        user: {
          id: m.user?._id,
          name: m.user?.name || 'Applicant',
          email: m.user?.email || '',
          avatar: m.user?.avatar || '',
        },
        type: m.type,
        headline: m.headline,
        bio: m.bio,
        expertiseTags: m.expertiseTags || [],
        verified: m.verified,
        status: m.status || (m.verified ? 'approved' : 'pending'),
        availability: m.availability,
        companyOrCollege: m.companyOrCollege,
        yearsOfExperience: m.yearsOfExperience,
        createdAt: m.createdAt,
      })),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all mentors with stats for admin overview (Admin Only)
 * @route   GET /api/admin/mentors/all
 * @access  Private / Admin
 */
const getAdminAllMentors = async (req, res, next) => {
  try {
    const mentors = await Mentor.find({})
      .populate('user', 'name email avatar role')
      .sort({ createdAt: -1 })
      .lean();

    const totalMentors = mentors.length;
    const totalExperts = mentors.filter((m) => m.type === 'expert').length;
    const totalPeers = mentors.filter((m) => m.type === 'peer').length;
    const pendingCount = mentors.filter(
      (m) =>
        m.type === 'expert' &&
        (!m.verified || m.status === 'pending') &&
        m.status !== 'rejected'
    ).length;
    const verifiedExpertsCount = mentors.filter((m) => m.type === 'expert' && m.verified).length;
    const rejectedCount = mentors.filter((m) => m.status === 'rejected').length;

    res.status(200).json({
      success: true,
      stats: {
        totalMentors,
        totalExperts,
        totalPeers,
        pendingCount,
        verifiedExpertsCount,
        rejectedCount,
      },
      mentors: mentors.map((m) => ({
        id: m._id,
        user: {
          id: m.user?._id,
          name: m.user?.name || 'Mentor',
          email: m.user?.email || '',
          avatar: m.user?.avatar || '',
        },
        type: m.type,
        headline: m.headline,
        bio: m.bio,
        expertiseTags: m.expertiseTags || [],
        verified: m.verified,
        status: m.status || (m.verified ? 'approved' : 'pending'),
        rejectionReason: m.rejectionReason || '',
        availability: m.availability,
        rating: m.rating,
        totalReviews: m.totalReviews,
        totalConversations: m.totalConversations,
        companyOrCollege: m.companyOrCollege,
        yearsOfExperience: m.yearsOfExperience,
        createdAt: m.createdAt,
        verifiedAt: m.verifiedAt,
        rejectedAt: m.rejectedAt,
      })),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Verify or unverify an expert mentor (Admin Only)
 * @route   PATCH /api/admin/mentors/:id/verify
 * @access  Private / Admin
 */
const verifyMentor = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { verified } = req.body;

    const mentor = await Mentor.findById(id).populate('user', 'name email');
    if (!mentor) {
      return res.status(404).json({
        success: false,
        message: 'Mentor not found.',
      });
    }

    const isVerifying = verified !== false;
    mentor.verified = isVerifying;
    mentor.status = isVerifying ? 'approved' : 'rejected';
    if (isVerifying) {
      mentor.verifiedAt = new Date();
      mentor.verifiedBy = req.user._id;
      mentor.rejectionReason = '';
    }
    await mentor.save();

    // Trigger In-App Notification to Applicant
    if (isVerifying) {
      await sendNotification({
        userId: mentor.user?._id || mentor.user,
        title: 'Verified Expert Mentor Approved! 🎉',
        message:
          'Congratulations! Your Expert Mentor application has been officially verified by an administrator. You now have the Verified Expert badge in the mentor directory.',
        type: 'mentor-status',
        link: '/mentors',
      });
    }

    res.status(200).json({
      success: true,
      message: `Mentor verification status updated to ${mentor.verified ? 'Verified' : 'Unverified'}.`,
      mentor,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Reject a mentor application with reason (Admin Only)
 * @route   PATCH /api/admin/mentors/:id/reject
 * @access  Private / Admin
 */
const rejectMentor = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;

    const mentor = await Mentor.findById(id).populate('user', 'name email');
    if (!mentor) {
      return res.status(404).json({
        success: false,
        message: 'Mentor not found.',
      });
    }

    mentor.verified = false;
    mentor.status = 'rejected';
    mentor.rejectionReason =
      rejectionReason?.trim() ||
      'Application details did not meet our expert verification criteria.';
    mentor.rejectedAt = new Date();
    mentor.rejectedBy = req.user._id;
    await mentor.save();

    // Trigger In-App Notification to Applicant
    await sendNotification({
      userId: mentor.user?._id || mentor.user,
      title: 'Mentor Application Update',
      message: `Your Expert Mentor application was reviewed. Status: Rejected.${
        mentor.rejectionReason ? ' Reason: ' + mentor.rejectionReason : ''
      } You may update your profile credentials and reapply.`,
      type: 'mentor-status',
      link: '/mentors/apply',
    });

    res.status(200).json({
      success: true,
      message: 'Mentor application has been rejected.',
      mentor,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Send a connection request to a mentor
 * @route   POST /api/connections/request
 * @access  Private
 */
const createConnectionRequest = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { mentorId, message } = req.body;

    if (!mentorId || !message?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Mentor ID and an introductory guidance request message are required.',
      });
    }

    const mentor = await Mentor.findById(mentorId);
    if (!mentor) {
      return res.status(404).json({
        success: false,
        message: 'Mentor profile not found.',
      });
    }

    if (mentor.user.toString() === userId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot send a mentorship connection request to yourself.',
      });
    }

    // Check for duplicate pending request
    const existingPending = await ConnectionRequest.findOne({
      user: userId,
      mentor: mentorId,
      status: 'pending',
    });

    if (existingPending) {
      return res.status(400).json({
        success: false,
        message: 'You already have a pending connection request with this mentor. Please await their reply.',
      });
    }

    const connectionRequest = await ConnectionRequest.create({
      user: userId,
      mentor: mentorId,
      mentorUser: mentor.user,
      message: message.trim(),
      status: 'pending',
    });

    // Audit log
    await SecurityLog.logAction({
      userId,
      action: 'connection-request',
      req,
      details: {
        mentorId,
        requestId: connectionRequest._id,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Connection request sent successfully! You will be notified when the mentor responds.',
      connectionRequest,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current user's connection requests (both sent & incoming)
 * @route   GET /api/connections/mine
 * @access  Private
 */
const getMyConnections = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const [sentRequests, incomingRequests] = await Promise.all([
      ConnectionRequest.find({ user: userId })
        .populate({
          path: 'mentor',
          select: 'headline bio type rating verified companyOrCollege',
        })
        .populate('mentorUser', 'name avatar')
        .sort({ createdAt: -1 })
        .lean(),
      ConnectionRequest.find({ mentorUser: userId })
        .populate('user', 'name avatar')
        .populate('mentor', 'type headline')
        .sort({ createdAt: -1 })
        .lean(),
    ]);

    res.status(200).json({
      success: true,
      sentRequests,
      incomingRequests,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Accept or decline a connection request (Mentor action)
 * @route   PATCH /api/connections/:id/respond
 * @access  Private
 */
const respondConnectionRequest = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    const { status } = req.body; // 'accepted' | 'declined'

    if (!['accepted', 'declined'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be either 'accepted' or 'declined'.",
      });
    }

    const request = await ConnectionRequest.findById(id);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Connection request not found.',
      });
    }

    // Enforce that only the target mentor can respond
    if (request.mentorUser.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to respond to this request.',
      });
    }

    request.status = status;
    request.respondedAt = new Date();

    let conversation = null;

    if (status === 'accepted') {
      // Auto-create Conversation if it doesn't already exist
      conversation = await Conversation.findOne({ connectionRequest: request._id });
      if (!conversation) {
        conversation = await Conversation.create({
          connectionRequest: request._id,
          participants: [request.user, request.mentorUser],
          messages: [
            {
              sender: request.user,
              text: `Guidance Request: "${request.message}"`,
              timestamp: request.createdAt,
              read: true,
            },
            {
              sender: request.mentorUser,
              text: 'Hello! I accepted your mentorship connection request. How can I help guide your career path?',
              timestamp: new Date(),
              read: false,
            },
          ],
          status: 'active',
          lastMessageAt: new Date(),
        });

        // Increment mentor totalConversations count
        await Mentor.findByIdAndUpdate(request.mentor, {
          $inc: { totalConversations: 1 },
        });
      }

      request.conversation = conversation._id;

      // In-app notification to student
      await sendNotification({
        userId: request.user,
        title: 'Mentorship Request Accepted! 💬',
        message: 'Your mentorship connection request has been accepted. You can now chat directly with your mentor.',
        type: 'connection-accepted',
        link: '/connections',
      });
    }

    await request.save();

    // Audit log
    await SecurityLog.logAction({
      userId,
      action: 'connection-respond',
      req,
      details: {
        requestId: request._id,
        status,
        conversationId: conversation?._id || null,
      },
    });

    res.status(200).json({
      success: true,
      message: `Connection request has been ${status}.`,
      request,
      conversationId: conversation?._id || null,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get conversation and message history (Participants Only)
 * @route   GET /api/conversations/:id
 * @access  Private
 */
const getConversationById = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const conversation = await Conversation.findById(id).populate(
      'participants',
      'name avatar role isMentor'
    );

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found.',
      });
    }

    // STRICT SECURITY: User must be one of the participants
    const isParticipant = conversation.participants.some(
      (p) => p._id.toString() === userId.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You are not a participant in this conversation.',
      });
    }

    // Mark messages sent by the other participant as read
    let updatedRead = false;
    conversation.messages.forEach((msg) => {
      if (msg.sender.toString() !== userId.toString() && !msg.read) {
        msg.read = true;
        updatedRead = true;
      }
    });

    if (updatedRead) {
      await conversation.save();
    }

    // Also fetch associated mentor profile if applicable
    const connRequest = await ConnectionRequest.findById(conversation.connectionRequest).populate(
      'mentor'
    );

    res.status(200).json({
      success: true,
      conversation,
      mentor: connRequest?.mentor || null,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    REST fallback endpoint to post a message to a conversation
 * @route   POST /api/conversations/:id/messages
 * @access  Private
 */
const sendMessageRest = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message text cannot be empty.',
      });
    }

    const conversation = await Conversation.findById(id);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found.',
      });
    }

    // Enforce participant check
    const isParticipant = conversation.participants.some(
      (p) => p.toString() === userId.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You cannot send messages to this conversation.',
      });
    }

    const newMessage = {
      sender: userId,
      text: text.trim(),
      timestamp: new Date(),
      read: false,
    };

    conversation.messages.push(newMessage);
    conversation.lastMessageAt = new Date();
    await conversation.save();

    res.status(201).json({
      success: true,
      message: newMessage,
      conversation,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Submit feedback & rating for a mentor
 * @route   POST /api/mentors/:id/feedback
 * @access  Private
 */
const leaveMentorFeedback = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    const { rating, comment, conversationId } = req.body;

    const numRating = Number(rating);
    if (!numRating || numRating < 1 || numRating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be an integer between 1 and 5.',
      });
    }

    const mentor = await Mentor.findById(id);
    if (!mentor) {
      return res.status(404).json({
        success: false,
        message: 'Mentor not found.',
      });
    }

    const feedback = await MentorFeedback.create({
      mentor: id,
      user: userId,
      conversation: conversationId || null,
      rating: numRating,
      comment: comment?.trim() || '',
    });

    // Recalculate mentor's average rating
    await mentor.recalculateRating();

    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully! Thank you for rating your mentor.',
      feedback,
      newMentorRating: mentor.rating,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMentors,
  getMentorById,
  applyMentor,
  verifyMentor,
  rejectMentor,
  getAdminPendingMentors,
  getAdminAllMentors,
  createConnectionRequest,
  getMyConnections,
  respondConnectionRequest,
  getConversationById,
  sendMessageRest,
  leaveMentorFeedback,
};
