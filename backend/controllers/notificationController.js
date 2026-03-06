const Notification = require('../models/Notification');
const User = require('../models/User');

// @desc    Get all notifications (admin)
// @route   GET /api/admin/notifications
// @access  Admin
exports.getAllNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Create notification (admin sends to users)
// @route   POST /api/admin/notifications
// @access  Admin
exports.createNotification = async (req, res) => {
  try {
    const { title, message, type, userId, targetAll } = req.body;

    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: 'Title and message are required',
      });
    }

    if (targetAll) {
      // Get all regular users
      const users = await User.find({ role: 'user' }).select('_id');
      const notifications = users.map((u) => ({
        userId: u._id,
        title,
        message,
        type: type || 'general',
        targetAll: true,
      }));

      await Notification.insertMany(notifications);
      return res.status(201).json({
        success: true,
        message: `Notification sent to ${users.length} users`,
      });
    }

    const notification = await Notification.create({
      userId: userId || null,
      title,
      message,
      type: type || 'general',
    });

    res.status(201).json({ success: true, notification });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Delete notification
// @route   DELETE /api/admin/notifications/:id
// @access  Admin
exports.deleteNotification = async (req, res) => {
  try {
    await Notification.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Notification deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Protected (user)
exports.getUserNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({ success: true, notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Protected (user)
exports.markAsRead = async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { read: true });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
