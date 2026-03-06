const Event = require('../models/Event');
const Booking = require('../models/Booking');
const User = require('../models/User');

// @desc    Get dashboard stats
// @route   GET /api/admin/dashboard
// @access  Admin
exports.getDashboardStats = async (req, res) => {
  try {
    const totalEvents = await Event.countDocuments();
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalBookings = await Booking.countDocuments();
    const cancelledBookings = await Booking.countDocuments({ status: 'cancelled' });

    const ticketsSoldResult = await Booking.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$ticketQuantity' } } },
    ]);
    const ticketsSold = ticketsSoldResult[0]?.total || 0;

    const revenueResult = await Booking.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);
    const totalRevenue = revenueResult[0]?.total || 0;

    // Recent bookings (last 10)
    const recentBookings = await Booking.find()
      .populate('userId', 'name email')
      .populate('eventId', 'title date location')
      .sort({ createdAt: -1 })
      .limit(10);

    // Upcoming events (future events, active)
    const upcomingEvents = await Event.find({
      date: { $gte: new Date() },
      status: 'active',
    })
      .sort({ date: 1 })
      .limit(5);

    res.json({
      success: true,
      stats: {
        totalEvents,
        totalUsers,
        totalBookings,
        ticketsSold,
        cancelledBookings,
        totalRevenue,
      },
      recentBookings,
      upcomingEvents,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get reports data
// @route   GET /api/admin/reports
// @access  Admin
exports.getReports = async (req, res) => {
  try {
    // Bookings per event
    const bookingsPerEvent = await Booking.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      {
        $group: {
          _id: '$eventId',
          totalBookings: { $sum: 1 },
          totalTickets: { $sum: '$ticketQuantity' },
          totalRevenue: { $sum: '$totalAmount' },
        },
      },
      {
        $lookup: {
          from: 'events',
          localField: '_id',
          foreignField: '_id',
          as: 'event',
        },
      },
      { $unwind: { path: '$event', preserveNullAndEmpty: false } },
      {
        $project: {
          eventTitle: '$event.title',
          totalBookings: 1,
          totalTickets: 1,
          totalRevenue: 1,
        },
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 10 },
    ]);

    // Monthly revenue (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyRevenue = await Booking.aggregate([
      {
        $match: {
          status: { $ne: 'cancelled' },
          createdAt: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          revenue: { $sum: '$totalAmount' },
          bookings: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Booking status breakdown
    const statusBreakdown = await Booking.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    // Category breakdown
    const categoryBreakdown = await Booking.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      {
        $lookup: {
          from: 'events',
          localField: 'eventId',
          foreignField: '_id',
          as: 'event',
        },
      },
      { $unwind: { path: '$event', preserveNullAndEmpty: false } },
      {
        $group: {
          _id: '$event.category',
          count: { $sum: 1 },
          revenue: { $sum: '$totalAmount' },
        },
      },
    ]);

    res.json({
      success: true,
      bookingsPerEvent,
      monthlyRevenue,
      statusBreakdown,
      categoryBreakdown,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
