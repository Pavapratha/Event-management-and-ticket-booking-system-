const Feedback = require('../models/Feedback');
const User = require('../models/User');

const buildFeedbackStats = async (match = {}) => {
  const [stats] = await Feedback.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalFeedback: { $sum: 1 },
        totalReviewed: {
          $sum: { $cond: ['$isReviewed', 1, 0] },
        },
      },
    },
  ]);

  return {
    averageRating: Number(stats?.averageRating || 0).toFixed(2),
    totalFeedback: stats?.totalFeedback || 0,
    totalReviewed: stats?.totalReviewed || 0,
  };
};

// @desc Submit feedback
// @route POST /api/feedback
// @access Private (logged-in users only)
exports.submitFeedback = async (req, res) => {
  try {
    const { rating, title, message } = req.body;
    const userId = req.userId;

    // Validation
    if (!rating || !message) {
      return res.status(400).json({
        success: false,
        message: 'Rating and message are required',
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5',
      });
    }

    if (message.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Message must be at least 10 characters long',
      });
    }

    // Get user details
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Create feedback
    const feedback = await Feedback.create({
      userId,
      userName: user.name,
      userEmail: user.email,
      rating,
      title: title || '',
      message: message.trim(),
    });

    res.status(201).json({
      success: true,
      message: 'Thank you for your feedback',
      feedback,
    });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting feedback',
      error: error.message,
    });
  }
};

// @desc Get user's own feedback
// @route GET /api/feedback/user
// @access Private
exports.getUserFeedback = async (req, res) => {
  try {
    const userId = req.userId;

    const feedback = await Feedback.find({ userId })
      .sort({ createdAt: -1 })
      .select('-__v');

    res.json({
      success: true,
      count: feedback.length,
      feedback,
    });
  } catch (error) {
    console.error('Error fetching user feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching feedback',
      error: error.message,
    });
  }
};

// @desc Get reviewed feedback for public display
// @route GET /api/feedback/public
// @access Public
exports.getPublicFeedback = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 6, 12);

    const feedback = await Feedback.find({ isReviewed: true })
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('userName rating title message createdAt');

    const stats = await buildFeedbackStats({ isReviewed: true });

    res.json({
      success: true,
      count: feedback.length,
      stats,
      feedback,
    });
  } catch (error) {
    console.error('Error fetching public feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching feedback',
      error: error.message,
    });
  }
};

// @desc Get all feedback (Admin access)
// @route GET /api/feedback
// @access Private (Admin only)
exports.getAllFeedback = async (req, res) => {
  try {
    const { sort = '-createdAt', rating, status } = req.query;

    let query = {};

    // Filter by rating if provided
    if (rating) {
      query.rating = parseInt(rating);
    }

    // Filter by status if provided
    if (status) {
      query.status = status;
    }

    const feedback = await Feedback.find(query)
      .sort(sort)
      .select('-__v')
      .populate('userId', 'name email');

    const stats = await buildFeedbackStats(query);

    res.json({
      success: true,
      count: feedback.length,
      stats,
      feedback,
    });
  } catch (error) {
    console.error('Error fetching all feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching feedback',
      error: error.message,
    });
  }
};

// @desc Get feedback by ID
// @route GET /api/feedback/:id
// @access Private (Admin only)
exports.getFeedbackById = async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id)
      .populate('userId', 'name email')
      .populate('reviewedBy', 'name email');

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found',
      });
    }

    res.json({
      success: true,
      feedback,
    });
  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching feedback',
      error: error.message,
    });
  }
};

// @desc Mark feedback as reviewed
// @route PUT /api/feedback/:id/review
// @access Private (Admin only)
exports.markAsReviewed = async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found',
      });
    }

    feedback.isReviewed = true;
    feedback.status = 'reviewed';
    feedback.reviewedBy = req.user.id;
    feedback.reviewedAt = new Date();

    await feedback.save();

    res.json({
      success: true,
      message: 'Feedback marked as reviewed',
      feedback,
    });
  } catch (error) {
    console.error('Error marking feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating feedback',
      error: error.message,
    });
  }
};

// @desc Update feedback status
// @route PUT /api/feedback/:id/status
// @access Private (Admin only)
exports.updateFeedbackStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['pending', 'reviewed', 'resolved'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status',
      });
    }

    const feedback = await Feedback.findByIdAndUpdate(
      req.params.id,
      { status, isReviewed: true, reviewedBy: req.user.id, reviewedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found',
      });
    }

    res.json({
      success: true,
      message: 'Feedback status updated',
      feedback,
    });
  } catch (error) {
    console.error('Error updating feedback status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating feedback',
      error: error.message,
    });
  }
};

// @desc Delete feedback
// @route DELETE /api/feedback/:id
// @access Private (Admin only)
exports.deleteFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findByIdAndDelete(req.params.id);

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found',
      });
    }

    res.json({
      success: true,
      message: 'Feedback deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting feedback',
      error: error.message,
    });
  }
};

// @desc Get feedback statistics for dashboard
// @route GET /api/feedback/stats/dashboard
// @access Private (Admin only)
exports.getFeedbackStats = async (req, res) => {
  try {
    const stats = await Feedback.aggregate([
      {
        $group: {
          _id: null,
          totalFeedback: { $sum: 1 },
          averageRating: { $avg: '$rating' },
          totalReviewed: { $sum: { $cond: ['$isReviewed', 1, 0] } },
          fiveStarCount: { $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] } },
          fourStarCount: { $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] } },
          threeStarCount: { $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] } },
          twoStarCount: { $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] } },
          oneStarCount: { $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] } },
        },
      },
    ]);

    const ratingDistribution = {
      5: stats[0]?.fiveStarCount || 0,
      4: stats[0]?.fourStarCount || 0,
      3: stats[0]?.threeStarCount || 0,
      2: stats[0]?.twoStarCount || 0,
      1: stats[0]?.oneStarCount || 0,
    };

    res.json({
      success: true,
      stats: {
        totalFeedback: stats[0]?.totalFeedback || 0,
        averageRating: (stats[0]?.averageRating || 0).toFixed(2),
        totalReviewed: stats[0]?.totalReviewed || 0,
        ratingDistribution,
      },
    });
  } catch (error) {
    console.error('Error fetching feedback stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: error.message,
    });
  }
};
