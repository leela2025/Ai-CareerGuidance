const SuccessStory = require('../models/SuccessStory');
const SecurityLog = require('../models/SecurityLog');

// Sanitize text to prevent stored XSS
const sanitizeText = (str) => {
  if (typeof str !== 'string') return '';
  return str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .trim();
};

/**
 * @desc    Submit a personal success story for moderation
 * @route   POST /api/stories
 * @access  Private
 */
const submitStory = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { title, storyText, lifeStageJourney, beforeAfter } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Story title is required.',
      });
    }

    if (!storyText || !storyText.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Story text narrative is required.',
      });
    }

    const cleanTitle = sanitizeText(title);
    const cleanStoryText = sanitizeText(storyText);
    const cleanLifeStage = sanitizeText(lifeStageJourney || '');
    const cleanBefore = sanitizeText(beforeAfter?.before || '');
    const cleanAfter = sanitizeText(beforeAfter?.after || '');

    const story = await SuccessStory.create({
      user: userId,
      title: cleanTitle,
      storyText: cleanStoryText,
      lifeStageJourney: cleanLifeStage,
      beforeAfter: {
        before: cleanBefore,
        after: cleanAfter,
      },
      status: 'pending',
      featured: false,
      likes: [],
    });

    // Audit log
    await SecurityLog.logAction({
      userId,
      action: 'story-submit',
      req,
      details: {
        storyId: story._id,
        title: cleanTitle,
      },
    });

    res.status(201).json({
      success: true,
      message:
        'Thank you for sharing your story! It will be reviewed by our team and published shortly.',
      story,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all approved success stories (Public)
 * @route   GET /api/stories
 * @access  Public
 */
const getApprovedStories = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const query = { status: 'approved' };

    // Optional tag / life stage filter
    if (req.query.tag) {
      query.lifeStageJourney = { $regex: req.query.tag, $options: 'i' };
    }

    const [stories, total] = await Promise.all([
      SuccessStory.find(query)
        .populate('user', 'name avatar role')
        .sort({ featured: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      SuccessStory.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: stories.length,
      total,
      totalPages: Math.ceil(total / limit) || 1,
      currentPage: page,
      stories: stories.map((s) => ({
        id: s._id,
        title: s.title,
        storyText: s.storyText,
        lifeStageJourney: s.lifeStageJourney,
        beforeAfter: s.beforeAfter,
        featured: s.featured,
        likesCount: s.likes?.length || 0,
        likedByCurrentUser: req.user
          ? s.likes?.some((id) => id.toString() === req.user._id.toString())
          : false,
        author: {
          id: s.user?._id,
          name: s.user?.name || 'Community Member',
          avatar: s.user?.avatar || '',
        },
        createdAt: s.createdAt,
      })),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single story detail view
 * @route   GET /api/stories/:id
 * @access  Public (with ownership check if not approved)
 */
const getStoryById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const story = await SuccessStory.findById(id).populate('user', 'name avatar role');

    if (!story) {
      return res.status(404).json({
        success: false,
        message: 'Success story not found.',
      });
    }

    // Security: If not approved, only the author or an admin can view it
    if (story.status !== 'approved') {
      const isAuthor =
        req.user && story.user?._id.toString() === req.user._id.toString();
      const isAdmin = req.user && req.user.role === 'admin';

      if (!isAuthor && !isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'This story is currently pending review and not yet public.',
        });
      }
    }

    const likedByCurrentUser = req.user
      ? story.likes?.some((uId) => uId.toString() === req.user._id.toString())
      : false;

    res.status(200).json({
      success: true,
      story: {
        id: story._id,
        title: story.title,
        storyText: story.storyText,
        lifeStageJourney: story.lifeStageJourney,
        beforeAfter: story.beforeAfter,
        status: story.status,
        featured: story.featured,
        likesCount: story.likes?.length || 0,
        likedByCurrentUser,
        author: {
          id: story.user?._id,
          name: story.user?.name || 'Community Member',
          avatar: story.user?.avatar || '',
        },
        createdAt: story.createdAt,
        approvedAt: story.approvedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current user's submitted stories
 * @route   GET /api/stories/mine
 * @access  Private
 */
const getMyStories = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const stories = await SuccessStory.find({ user: userId })
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: stories.length,
      stories: stories.map((s) => ({
        id: s._id,
        title: s.title,
        storyText: s.storyText,
        lifeStageJourney: s.lifeStageJourney,
        beforeAfter: s.beforeAfter,
        status: s.status,
        featured: s.featured,
        likesCount: s.likes?.length || 0,
        createdAt: s.createdAt,
        approvedAt: s.approvedAt,
      })),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Toggle like on a story (Add or remove user like)
 * @route   PATCH /api/stories/:id/like
 * @access  Private
 */
const toggleLikeStory = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const story = await SuccessStory.findById(id);
    if (!story) {
      return res.status(404).json({
        success: false,
        message: 'Story not found.',
      });
    }

    if (story.status !== 'approved') {
      return res.status(400).json({
        success: false,
        message: 'You can only like approved public stories.',
      });
    }

    const userIndex = story.likes.findIndex(
      (uId) => uId.toString() === userId.toString()
    );

    let isLiked = false;
    if (userIndex > -1) {
      // Unlike
      story.likes.splice(userIndex, 1);
      isLiked = false;
    } else {
      // Like
      story.likes.push(userId);
      isLiked = true;
    }

    await story.save();

    // Audit log
    await SecurityLog.logAction({
      userId,
      action: 'story-like',
      req,
      details: {
        storyId: story._id,
        isLiked,
        newLikeCount: story.likes.length,
      },
    });

    res.status(200).json({
      success: true,
      isLiked,
      likesCount: story.likes.length,
      message: isLiked ? 'Story liked!' : 'Story unliked.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Admin: get stories for moderation (pending, approved, rejected)
 * @route   GET /api/admin/stories/pending
 * @access  Private/Admin
 */
const getAdminPendingStories = async (req, res, next) => {
  try {
    const statusFilter = req.query.status || 'pending';
    const query = statusFilter === 'all' ? {} : { status: statusFilter };

    const stories = await SuccessStory.find(query)
      .populate('user', 'name email avatar role')
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: stories.length,
      statusFilter,
      stories: stories.map((s) => ({
        id: s._id,
        title: s.title,
        storyText: s.storyText,
        lifeStageJourney: s.lifeStageJourney,
        beforeAfter: s.beforeAfter,
        status: s.status,
        featured: s.featured,
        likesCount: s.likes?.length || 0,
        author: {
          id: s.user?._id,
          name: s.user?.name || 'Community Member',
          email: s.user?.email || '',
          avatar: s.user?.avatar || '',
        },
        createdAt: s.createdAt,
        approvedAt: s.approvedAt,
      })),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Admin: moderate story (approve/reject, toggle featured)
 * @route   PATCH /api/admin/stories/:id/moderate
 * @access  Private/Admin
 */
const moderateStory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, featured } = req.body;

    const story = await SuccessStory.findById(id).populate('user', 'name email');
    if (!story) {
      return res.status(404).json({
        success: false,
        message: 'Story not found.',
      });
    }

    if (status && !['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be 'pending', 'approved', or 'rejected'.",
      });
    }

    if (status) {
      story.status = status;
      if (status === 'approved' && !story.approvedAt) {
        story.approvedAt = new Date();
      }
    }

    if (featured !== undefined) {
      story.featured = Boolean(featured);
    }

    await story.save();

    // Audit log
    await SecurityLog.logAction({
      userId: req.user._id,
      action: 'story-moderate',
      req,
      details: {
        storyId: story._id,
        newStatus: story.status,
        featured: story.featured,
      },
    });

    res.status(200).json({
      success: true,
      message: `Story status updated to '${story.status}'${
        story.featured ? ' (Featured)' : ''
      }.`,
      story,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitStory,
  getApprovedStories,
  getStoryById,
  getMyStories,
  toggleLikeStory,
  getAdminPendingStories,
  moderateStory,
};
