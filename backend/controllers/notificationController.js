const Notification = require('../models/Notification');
const User = require('../models/User');
const Event = require('../models/Event');
const Booking = require('../models/Booking');

const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000;

const parseEventTime = (timeValue) => {
  if (!timeValue || typeof timeValue !== 'string') {
    return { hours: 0, minutes: 0 };
  }

  const trimmed = timeValue.trim();
  const twelveHourMatch = trimmed.match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)$/i);
  if (twelveHourMatch) {
    let hours = Number(twelveHourMatch[1]);
    const minutes = Number(twelveHourMatch[2] || 0);
    const meridiem = twelveHourMatch[3].toUpperCase();

    if (meridiem === 'PM' && hours < 12) {
      hours += 12;
    }

    if (meridiem === 'AM' && hours === 12) {
      hours = 0;
    }

    return { hours, minutes };
  }

  const twentyFourHourMatch = trimmed.match(/^(\d{1,2})(?::(\d{2}))$/);
  if (twentyFourHourMatch) {
    return {
      hours: Number(twentyFourHourMatch[1]),
      minutes: Number(twentyFourHourMatch[2] || 0),
    };
  }

  return { hours: 0, minutes: 0 };
};

const getEventStartDate = (event) => {
  const startDate = new Date(event.date);
  const { hours, minutes } = parseEventTime(event.time);

  startDate.setHours(hours, minutes, 0, 0);
  return startDate;
};

const formatEventDate = (value) => {
  if (!value) {
    return 'TBD';
  }

  return new Date(value).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
};

const getEventLocation = (event) => event?.location || event?.venue || 'TBD';

const buildBookingConfirmationMessage = (booking) => {
  const eventName = booking.eventId?.title || 'your event';
  const eventDate = formatEventDate(booking.eventId?.date);

  return `Your ticket for ${eventName} on ${eventDate} has been successfully booked.`;
};

const buildUpcomingEventSummary = (booking) => ({
  _id: booking._id,
  bookingId: booking.bookingId,
  ticketQuantity: booking.ticketQuantity,
  event: booking.eventId,
  startDateTime: getEventStartDate(booking.eventId),
});

const getUpcomingEventsHappeningWithinWindow = async (windowStart, windowEnd) => {
  const eventQueryStart = new Date(windowStart);
  eventQueryStart.setHours(0, 0, 0, 0);

  const candidateEvents = await Event.find({
    status: 'active',
    date: {
      $gte: eventQueryStart,
      $lte: windowEnd,
    },
  })
    .select('title date time venue location status')
    .lean();

  return candidateEvents
    .map((event) => ({
      ...event,
      startDateTime: getEventStartDate(event),
    }))
    .filter((event) => event.startDateTime > windowStart && event.startDateTime <= windowEnd);
};

const getConfirmedBookingsForEvents = async (eventIds) => Booking.find({
  eventId: { $in: eventIds },
  status: 'confirmed',
})
  .select('userId eventId bookingId status')
  .lean();

const getUpcomingBookedEventsForUser = async (userId) => {
  const bookings = await Booking.find({
    userId,
    status: 'confirmed',
  })
    .populate('eventId', 'title date time venue location image')
    .select('bookingId ticketQuantity eventId createdAt')
    .lean();

  const now = new Date();

  return bookings
    .filter((booking) => booking.eventId)
    .map((booking) => buildUpcomingEventSummary(booking))
    .filter((booking) => booking.startDateTime >= now)
    .sort((left, right) => left.startDateTime - right.startDateTime)
    .slice(0, 10);
};

const formatReminderMessage = (event) => {
  const now = new Date();
  const eventStart = getEventStartDate(event);

  const nowStartOfDay = new Date(now);
  nowStartOfDay.setHours(0, 0, 0, 0);

  const eventStartOfDay = new Date(eventStart);
  eventStartOfDay.setHours(0, 0, 0, 0);

  const diffInDays = Math.round((eventStartOfDay - nowStartOfDay) / (24 * 60 * 60 * 1000));
  const dayLabel = diffInDays === 0
    ? 'today'
    : diffInDays === 1
      ? 'tomorrow'
      : `on ${eventStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;

  return `Reminder: Your event ${event.title} will start ${dayLabel} at ${event.time}.`;
};

exports.createBookingConfirmationNotification = async (booking) => {
  if (!booking?.userId?._id || !booking?.eventId?._id) {
    return null;
  }

  const notificationPayload = {
    userId: booking.userId._id,
    eventId: booking.eventId._id,
    bookingId: booking._id,
    title: 'Event Booking Confirmation',
    message: buildBookingConfirmationMessage(booking),
    type: 'booking_confirmation',
    scheduledFor: booking.createdAt || new Date(),
    read: false,
    targetAll: false,
  };

  await Notification.findOneAndUpdate(
    {
      userId: booking.userId._id,
      bookingId: booking._id,
      type: 'booking_confirmation',
    },
    {
      $setOnInsert: notificationPayload,
    },
    {
      upsert: true,
      new: true,
    }
  );

  return notificationPayload;
};

exports.createEventReminderNotifications = async (options = {}) => {
  const windowStart = options.windowStart ? new Date(options.windowStart) : new Date();
  const windowEnd = options.windowEnd
    ? new Date(options.windowEnd)
    : new Date(windowStart.getTime() + ONE_DAY_IN_MS);

  const upcomingEvents = await getUpcomingEventsHappeningWithinWindow(windowStart, windowEnd);

  if (upcomingEvents.length === 0) {
    return {
      checkedEvents: 0,
      candidateBookings: 0,
      notificationsCreated: 0,
    };
  }

  const eventIds = upcomingEvents.map((event) => event._id);
  const bookings = await getConfirmedBookingsForEvents(eventIds);

  if (bookings.length === 0) {
    return {
      checkedEvents: upcomingEvents.length,
      candidateBookings: 0,
      notificationsCreated: 0,
    };
  }

  const eventMap = new Map(
    upcomingEvents.map((event) => [String(event._id), event])
  );
  const reminderTargets = new Map();

  bookings.forEach((booking) => {
    const event = eventMap.get(String(booking.eventId));
    if (!event) {
      return;
    }

    const key = `${booking.userId}:${booking.eventId}`;
    if (!reminderTargets.has(key)) {
      reminderTargets.set(key, {
        userId: booking.userId,
        eventId: booking.eventId,
        scheduledFor: event.startDateTime,
        title: 'Event Reminder',
        message: formatReminderMessage(event),
      });
    }
  });

  const operations = Array.from(reminderTargets.values()).map((target) => ({
    updateOne: {
      filter: {
        userId: target.userId,
        eventId: target.eventId,
        type: 'event_reminder',
        scheduledFor: target.scheduledFor,
      },
      update: {
        $setOnInsert: {
          userId: target.userId,
          eventId: target.eventId,
          title: target.title,
          message: target.message,
          type: 'event_reminder',
          scheduledFor: target.scheduledFor,
          read: false,
          targetAll: false,
        },
      },
      upsert: true,
    },
  }));

  if (operations.length === 0) {
    return {
      checkedEvents: upcomingEvents.length,
      candidateBookings: bookings.length,
      notificationsCreated: 0,
    };
  }

  const result = await Notification.bulkWrite(operations, { ordered: false });

  return {
    checkedEvents: upcomingEvents.length,
    candidateBookings: bookings.length,
    notificationsCreated: result.upsertedCount || 0,
  };
};

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
      eventId: req.body.eventId || null,
      title,
      message,
      type: type || 'general',
      scheduledFor: req.body.scheduledFor || null,
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
    const [notifications, upcomingEvents] = await Promise.all([
      Notification.find({ userId: req.userId })
      .populate('eventId', 'title date time venue location')
      .sort({ createdAt: -1 })
      .limit(50),
      getUpcomingBookedEventsForUser(req.userId),
    ]);

    res.json({ success: true, notifications, upcomingEvents });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getEventsHappeningInNext24Hours = async (windowStart = new Date()) => {
  const startDate = new Date(windowStart);
  const endDate = new Date(startDate.getTime() + ONE_DAY_IN_MS);

  return getUpcomingEventsHappeningWithinWindow(startDate, endDate);
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Protected (user)
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    res.json({ success: true, notification });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
