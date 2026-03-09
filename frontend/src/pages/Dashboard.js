import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import { 
  TicketIcon, CalendarIcon, HeartIcon, ClockIcon,
  TrendingUpIcon, UserIcon, SettingsIcon, ChevronRightIcon,
  MapPinIcon
} from '../components/Icons';
import '../styles/Dashboard.css';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch user's bookings
        const bookingsRes = await api.get('/api/user/bookings');
        const allBookings = bookingsRes.data.bookings || [];
        
        // Filter non-cancelled bookings for current and future dates
        const now = new Date();
        const upcomingBookings = allBookings.filter(booking => {
          const eventDate = new Date(booking.eventId?.date);
          return booking.status !== 'cancelled' && eventDate >= now;
        }).sort((a, b) => new Date(a.eventId.date) - new Date(b.eventId.date));

        // Get only next 3 upcoming events
        const displayUpcoming = upcomingBookings.slice(0, 3).map(booking => ({
          id: booking.eventId?._id,
          title: booking.eventId?.title || 'Unknown Event',
          date: new Date(booking.eventId?.date).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
          }),
          time: booking.eventId?.time || 'TBD',
          location: booking.eventId?.location || 'TBD',
          image: booking.eventId?.image ? `${API_BASE}${booking.eventId.image}` : 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=100&h=100&fit=crop',
          ticketType: `${booking.ticketQuantity} Ticket${booking.ticketQuantity > 1 ? 's' : ''}`,
          bookingId: booking.bookingId
        }));

        // Calculate stats from real data
        const totalTickets = allBookings
          .filter(b => b.status !== 'cancelled')
          .reduce((sum, b) => sum + b.ticketQuantity, 0);

        const upcomingCount = upcomingBookings.length;

        const pastBookings = allBookings.filter(booking => {
          const eventDate = new Date(booking.eventId?.date);
          return booking.status !== 'cancelled' && eventDate < now;
        }).length;

        setStats([
          { 
            icon: TicketIcon, 
            label: 'My Tickets', 
            value: totalTickets.toString(), 
            change: allBookings.length > 0 ? `${allBookings.length} bookings total` : 'No bookings yet',
            color: 'primary' 
          },
          { 
            icon: CalendarIcon, 
            label: 'Upcoming Events', 
            value: upcomingCount.toString(), 
            change: upcomingCount > 0 ? `Next: ${upcomingBookings[0]?.eventId?.title?.substring(0, 20)}...` : 'No upcoming events',
            color: 'secondary' 
          },
          { 
            icon: HeartIcon, 
            label: 'Saved Events', 
            value: '0', 
            change: 'Feature coming soon',
            color: 'pink' 
          },
          { 
            icon: TrendingUpIcon, 
            label: 'Events Attended', 
            value: pastBookings.toString(), 
            change: 'All time',
            color: 'green' 
          },
        ]);

        setUpcomingEvents(displayUpcoming);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        // Fallback to empty data
        setStats([
          { icon: TicketIcon, label: 'My Tickets', value: '0', change: 'No bookings yet', color: 'primary' },
          { icon: CalendarIcon, label: 'Upcoming Events', value: '0', change: 'No upcoming events', color: 'secondary' },
          { icon: HeartIcon, label: 'Saved Events', value: '0', change: 'Feature coming soon', color: 'pink' },
          { icon: TrendingUpIcon, label: 'Events Attended', value: '0', change: 'All time', color: 'green' },
        ]);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
      // Refresh every 30 seconds
      const interval = setInterval(fetchDashboardData, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  // Quick actions
  const quickActions = [
    { icon: CalendarIcon, label: 'Browse Events', link: '/events' },
    { icon: TicketIcon, label: 'My Tickets', link: '/tickets' },
    { icon: HeartIcon, label: 'Saved Events', link: '/saved' },
    { icon: SettingsIcon, label: 'Settings', link: '/settings' },
  ];

  return (
    <div className="dashboard-page">
      <div className="container">
        {/* Header */}
        <div className="dashboard-header">
          <div className="dashboard-welcome">
            <div className="welcome-avatar">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="welcome-text">
              <h1>Welcome back, {user?.name?.split(' ')[0] || 'User'}!</h1>
              <p>Here's what's happening with your events</p>
            </div>
          </div>
          <div className="dashboard-actions">
            <Link to="/events" className="btn btn-primary">
              <CalendarIcon size={18} />
              Explore Events
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          {stats.map((stat, index) => (
            <div key={index} className={`stat-card stat-${stat.color}`}>
              <div className="stat-icon">
                <stat.icon size={24} />
              </div>
              <div className="stat-content">
                <span className="stat-value">{stat.value}</span>
                <span className="stat-label">{stat.label}</span>
                <span className="stat-change">{stat.change}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="dashboard-content">
          {/* Upcoming Events */}
          <div className="dashboard-section upcoming-events-section">
            <div className="section-header">
              <h2>Upcoming Events</h2>
              <Link to="/tickets" className="view-all">
                View All <ChevronRightIcon size={16} />
              </Link>
            </div>
            <div className="upcoming-events-list">
              {upcomingEvents.map(event => (
                <div key={event.id} className="upcoming-event-item">
                  <img 
                    src={event.image} 
                    alt={event.title}
                    className="event-thumbnail"
                  />
                  <div className="event-details">
                    <h3>{event.title}</h3>
                    <div className="event-meta">
                      <span className="meta-item">
                        <CalendarIcon size={14} />
                        {event.date}
                      </span>
                      <span className="meta-item">
                        <ClockIcon size={14} />
                        {event.time}
                      </span>
                    </div>
                    <div className="event-location">
                      <MapPinIcon size={14} />
                      {event.location}
                    </div>
                  </div>
                  <div className="event-ticket-badge">
                    {event.ticketType}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="dashboard-sidebar">
            {/* Profile Card */}
            <div className="dashboard-section profile-card">
              <div className="profile-header">
                <div className="profile-avatar">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="profile-info">
                  <h3>{user?.name || 'User'}</h3>
                  <p>{user?.email || 'user@example.com'}</p>
                </div>
              </div>
              <div className="profile-stats">
                <div className="profile-stat">
                  <span className="value">28</span>
                  <span className="label">Events</span>
                </div>
                <div className="profile-stat">
                  <span className="value">12</span>
                  <span className="label">Saved</span>
                </div>
                <div className="profile-stat">
                  <span className="value">4.9</span>
                  <span className="label">Rating</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="dashboard-section quick-actions-card">
              <h3>Quick Actions</h3>
              <div className="quick-actions-grid">
                {quickActions.map((action, index) => (
                  <Link key={index} to={action.link} className="quick-action-item">
                    <action.icon size={20} />
                    <span>{action.label}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Account Status */}
            <div className="dashboard-section account-status-card">
              <div className="status-header">
                <UserIcon size={20} />
                <h3>Account Status</h3>
              </div>
              <div className="status-item">
                <span className="status-label">Email Verified</span>
                <span className="status-badge success">Verified</span>
              </div>
              <div className="status-item">
                <span className="status-label">Account Security</span>
                <span className="status-badge success">Secure</span>
              </div>
              <div className="status-item">
                <span className="status-label">Member Since</span>
                <span className="status-value">June 2024</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
