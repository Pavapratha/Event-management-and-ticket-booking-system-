import React, { useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import { CalendarIcon, ClockIcon, MailIcon, MapPinIcon, TicketIcon } from '../components/Icons';
import '../styles/Notifications.css';

const formatDate = (value) => {
  if (!value) {
    return 'TBD';
  }

  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const getEventDateTime = (dateValue, timeValue) => {
  if (!dateValue) {
    return null;
  }

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  if (!timeValue || typeof timeValue !== 'string') {
    return date;
  }

  const normalizedTime = timeValue.trim();
  const twelveHourMatch = normalizedTime.match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)$/i);
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

    date.setHours(hours, minutes, 0, 0);
    return date;
  }

  const twentyFourHourMatch = normalizedTime.match(/^(\d{1,2})(?::(\d{2}))$/);
  if (twentyFourHourMatch) {
    date.setHours(Number(twentyFourHourMatch[1]), Number(twentyFourHourMatch[2] || 0), 0, 0);
  }

  return date;
};

const formatTime = (notification) => {
  if (notification.eventId?.time) {
    return notification.eventId.time;
  }

  if (notification.scheduledFor) {
    return new Date(notification.scheduledFor).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  }

  return 'TBD';
};

const formatUpcomingLabel = (event) => {
  const eventDateTime = getEventDateTime(event?.date, event?.time);
  if (!eventDateTime) {
    return 'Date to be announced';
  }

  const now = new Date();
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  const eventDay = new Date(eventDateTime);
  eventDay.setHours(0, 0, 0, 0);

  const differenceInDays = Math.round((eventDay - today) / (24 * 60 * 60 * 1000));
  if (differenceInDays === 0) {
    return `Today ${event.time || ''}`.trim();
  }

  if (differenceInDays === 1) {
    return `Tomorrow ${event.time || ''}`.trim();
  }

  const shortDate = eventDateTime.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
  });

  return `${shortDate} ${event.time || ''}`.trim();
};

const getNotificationTypeLabel = (type) => {
  if (type === 'booking_confirmation') {
    return 'Confirmation';
  }

  if (type === 'event_reminder') {
    return 'Reminder';
  }

  return 'Notification';
};

export const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [markingReadIds, setMarkingReadIds] = useState([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await api.get('/api/notifications');
        setNotifications(response.data.notifications || []);
        setUpcomingEvents(response.data.upcomingEvents || []);
      } catch (err) {
        console.error('Failed to fetch notifications:', err);
        setError('Unable to load notifications right now. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.read).length,
    [notifications]
  );

  const nextUpcomingEvent = useMemo(() => upcomingEvents[0] || null, [upcomingEvents]);

  const markAsRead = async (notificationId) => {
    if (markingReadIds.includes(notificationId)) {
      return;
    }

    try {
      setMarkingReadIds((current) => [...current, notificationId]);
      await api.put(`/api/notifications/${notificationId}/read`);
      setNotifications((current) =>
        current.map((notification) =>
          notification._id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      );
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
      setError('Unable to update notification status. Please try again.');
    } finally {
      setMarkingReadIds((current) => current.filter((id) => id !== notificationId));
    }
  };

  return (
    <div className="notifications-page">
      <div className="container notifications-container">
        <header className="notifications-hero">
          <div>
            <p className="notifications-eyebrow">Booking Activity</p>
            <h1>Notifications & Upcoming Events</h1>
            <p className="notifications-subtitle">
              Review ticket confirmations, automatic event reminders, and the next events on
              your calendar.
            </p>
          </div>

          <div className="notifications-summary-grid">
            <div className="notifications-summary-card">
              <span className="summary-label">Unread notifications</span>
              <span className="summary-value">{unreadCount}</span>
            </div>
            <div className="notifications-summary-card is-secondary">
              <span className="summary-label">Upcoming events</span>
              <span className="summary-value">{upcomingEvents.length}</span>
              <span className="summary-caption">
                {nextUpcomingEvent
                  ? formatUpcomingLabel(nextUpcomingEvent.event)
                  : 'No confirmed events yet'}
              </span>
            </div>
          </div>
        </header>

        {error && <div className="notifications-alert">{error}</div>}

        {loading ? (
          <div className="notifications-state-card">Loading notifications...</div>
        ) : (
          <div className="notifications-sections">
            <section className="notifications-panel">
              <div className="notifications-panel-header">
                <div>
                  <p className="section-eyebrow">Upcoming Events</p>
                  <div className="section-title-row">
                    <h2>Events you booked</h2>
                    <span className="section-count-badge">{upcomingEvents.length}</span>
                  </div>
                </div>
              </div>

              {upcomingEvents.length === 0 ? (
                <div className="notifications-empty-state is-inline">
                  <div className="empty-icon">
                    <TicketIcon size={28} />
                  </div>
                  <h3>No upcoming booked events</h3>
                  <p>Your confirmed bookings will appear here as soon as they are scheduled.</p>
                </div>
              ) : (
                <div className="upcoming-events-list">
                  {upcomingEvents.map((item) => (
                    <article key={item._id} className="upcoming-event-card">
                      <div className="upcoming-event-kicker">{formatUpcomingLabel(item.event)}</div>
                      <div className="upcoming-event-title-row">
                        <h3>{item.event?.title || 'Event'}</h3>
                        <span className="notification-type-badge is-confirmation">Booked</span>
                      </div>

                      <div className="notification-meta-grid">
                        <div className="meta-pill">
                          <CalendarIcon size={16} />
                          <span>{formatDate(item.event?.date)}</span>
                        </div>
                        <div className="meta-pill">
                          <ClockIcon size={16} />
                          <span>{item.event?.time || 'TBD'}</span>
                        </div>
                        <div className="meta-pill">
                          <MapPinIcon size={16} />
                          <span>{item.event?.venue || item.event?.location || 'Venue TBD'}</span>
                        </div>
                      </div>

                      <div className="upcoming-event-footer">
                        <span>Booking {item.bookingId}</span>
                        <span>{item.ticketQuantity} ticket{item.ticketQuantity > 1 ? 's' : ''}</span>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>

            <section className="notifications-panel">
              <div className="notifications-panel-header">
                <div>
                  <p className="section-eyebrow">Notifications</p>
                  <div className="section-title-row">
                    <h2>Booking confirmations & reminders</h2>
                    <span className="section-count-badge">{notifications.length}</span>
                  </div>
                </div>
              </div>

              {notifications.length === 0 ? (
                <div className="notifications-empty-state is-inline">
                  <div className="empty-icon">
                    <MailIcon size={28} />
                  </div>
                  <h3>No notifications yet</h3>
                  <p>
                    Booking confirmations and next-day reminder messages will appear here.
                  </p>
                </div>
              ) : (
                <section className="notifications-list">
                  {notifications.map((notification) => (
                    <article
                      key={notification._id}
                      className={`notification-card ${notification.read ? 'is-read' : 'is-unread'}`}
                    >
                      <div className="notification-card-header">
                        <div>
                          <span
                            className={`notification-type-badge ${
                              notification.type === 'booking_confirmation'
                                ? 'is-confirmation'
                                : notification.type === 'event_reminder'
                                  ? 'is-reminder'
                                  : ''
                            }`}
                          >
                            {getNotificationTypeLabel(notification.type)}
                          </span>
                          <h2>{notification.title}</h2>
                        </div>
                        <button
                          type="button"
                          className="notification-action"
                          disabled={notification.read || markingReadIds.includes(notification._id)}
                          onClick={() => markAsRead(notification._id)}
                        >
                          {notification.read ? 'Read' : 'Mark as read'}
                        </button>
                      </div>

                      <p className="notification-message">{notification.message}</p>

                      <div className="notification-meta-grid">
                        <div className="meta-pill">
                          <CalendarIcon size={16} />
                          <span>{formatDate(notification.eventId?.date || notification.scheduledFor)}</span>
                        </div>
                        <div className="meta-pill">
                          <ClockIcon size={16} />
                          <span>{formatTime(notification)}</span>
                        </div>
                        <div className="meta-pill">
                          <MapPinIcon size={16} />
                          <span>{notification.eventId?.venue || notification.eventId?.location || 'Venue TBD'}</span>
                        </div>
                      </div>

                      <div className="notification-footer">
                        <span className="footer-label">Created</span>
                        <span>{new Date(notification.createdAt).toLocaleString()}</span>
                      </div>
                    </article>
                  ))}
                </section>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
