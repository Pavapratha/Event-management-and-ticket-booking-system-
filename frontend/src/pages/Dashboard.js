import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { 
  TicketIcon, CalendarIcon, HeartIcon, ClockIcon,
  TrendingUpIcon, UserIcon, SettingsIcon, ChevronRightIcon,
  MapPinIcon
} from '../components/Icons';
import '../styles/Dashboard.css';

export const Dashboard = () => {
  const { user } = useAuth();

  // Sample stats - in production these would come from an API
  const stats = [
    { 
      icon: TicketIcon, 
      label: 'My Tickets', 
      value: '5', 
      change: '+2 this month',
      color: 'primary' 
    },
    { 
      icon: CalendarIcon, 
      label: 'Upcoming Events', 
      value: '3', 
      change: 'Next: Tomorrow',
      color: 'secondary' 
    },
    { 
      icon: HeartIcon, 
      label: 'Saved Events', 
      value: '12', 
      change: '+4 this week',
      color: 'pink' 
    },
    { 
      icon: TrendingUpIcon, 
      label: 'Events Attended', 
      value: '28', 
      change: 'All time',
      color: 'green' 
    },
  ];

  // Sample upcoming events
  const upcomingEvents = [
    {
      id: 1,
      title: 'Summer Music Festival 2024',
      date: 'Jun 15, 2024',
      time: '6:00 PM',
      location: 'Central Park, NYC',
      image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=100&h=100&fit=crop',
      ticketType: 'VIP Pass'
    },
    {
      id: 2,
      title: 'Tech Conference 2024',
      date: 'Jun 20, 2024',
      time: '9:00 AM',
      location: 'Convention Center',
      image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=100&h=100&fit=crop',
      ticketType: 'General Admission'
    },
    {
      id: 3,
      title: 'Food & Wine Festival',
      date: 'Jun 25, 2024',
      time: '12:00 PM',
      location: 'Waterfront Plaza',
      image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=100&h=100&fit=crop',
      ticketType: 'Weekend Pass'
    }
  ];

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
