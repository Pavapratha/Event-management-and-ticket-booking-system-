import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { HeroSection } from '../components/HeroSection';
import { EventCard, EventCardSkeleton } from '../components/EventCard';
import { 
  ArrowRightIcon, 
  MusicIcon, 
  CameraIcon, 
  PartyPopperIcon, 
  GraduationCapIcon,
  TicketIcon,
  ShieldCheckIcon,
  ZapIcon,
  QrCodeIcon,
  StarIcon
} from '../components/Icons';
import './Home.css';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Transform database event to EventCard format
const transformEvent = (event, isFeatured = false) => {
  const dateObj = new Date(event.date);
  const formattedDate = dateObj.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
  const spotsLeft = event.availableSeats;
  const totalSeats = event.totalSeats;
  const soldSeats = totalSeats - spotsLeft;

  return {
    id: event._id,
    title: event.title,
    date: formattedDate,
    time: event.time,
    location: event.location,
    venue: event.location,
    image: event.image ? `${API_BASE}${event.image}` : null,
    price: event.price === 0 ? 'Free' : `Rs. ${parseFloat(event.price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    category: event.category,
    spotsLeft,
    attendees: soldSeats,
    isHot: spotsLeft < 20 && spotsLeft > 0,
    isFeatured,
  };
};

const categoryDefs = [
  { name: 'Concerts', icon: MusicIcon, color: '#ec4899' },
  { name: 'Festivals', icon: PartyPopperIcon, color: '#f97316' },
  { name: 'Conferences', icon: GraduationCapIcon, color: '#3b82f6' },
  { name: 'Exhibitions', icon: CameraIcon, color: '#22c55e' },
];

const features = [
  {
    icon: TicketIcon,
    title: 'Easy Booking',
    description: 'Book tickets in seconds with our streamlined checkout process.',
  },
  {
    icon: QrCodeIcon,
    title: 'QR Code Access',
    description: 'Get instant QR code tickets delivered to your phone.',
  },
  {
    icon: ShieldCheckIcon,
    title: 'Secure Payments',
    description: '100% secure transactions with bank-level encryption.',
  },
  {
    icon: ZapIcon,
    title: 'Instant Confirmation',
    description: 'Receive instant confirmation and calendar invites.',
  },
];

const getInitials = (name = 'Guest User') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');

export const Home = () => {
  const navigate = useNavigate();
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [feedbackEntries, setFeedbackEntries] = useState([]);
  const [feedbackStats, setFeedbackStats] = useState({ averageRating: '0.00', totalFeedback: 0 });
  const [homeStats, setHomeStats] = useState([]);
  const [categories, setCategories] = useState(categoryDefs.map(c => ({ ...c, count: 0 })));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch events
        const eventsRes = await api.get('/api/events');
        const events = eventsRes.data.events || [];
        const sorted = events.sort((a, b) => new Date(a.date) - new Date(b.date));
        const featured = sorted.slice(0, 4).map((e) => transformEvent(e, true));
        const upcoming = sorted.slice(4, 8).map((e) => transformEvent(e, false));
        setFeaturedEvents(featured);
        setUpcomingEvents(upcoming);

        const feedbackRes = await api.get('/api/feedback/public?limit=6').catch(() => ({
          data: { feedback: [], stats: { averageRating: '0.00', totalFeedback: 0 } },
        }));
        setFeedbackEntries(feedbackRes.data.feedback || []);
        setFeedbackStats(feedbackRes.data.stats || { averageRating: '0.00', totalFeedback: 0 });

        // Fetch stats
        try {
          // Get all bookings to count tickets sold
          const bookingsRes = await api.get('/api/admin/bookings', {
            headers: { Authorization: localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : '' }
          }).catch(() => ({ data: { bookings: [] } }));
          
          const allBookings = bookingsRes.data.bookings || [];
          const ticketsSold = allBookings
            .filter(b => b.status !== 'cancelled')
            .reduce((sum, b) => sum + b.ticketQuantity, 0);

          // Compute category counts from real data
          const catCounts = {};
          events.forEach(e => {
            const cat = (e.category || '').toLowerCase();
            catCounts[cat] = (catCounts[cat] || 0) + 1;
          });
          setCategories(categoryDefs.map(c => ({
            ...c,
            count: catCounts[c.name.toLowerCase()] || 0,
          })));

          setHomeStats([
            { value: events.length.toString(), label: 'Events Listed' },
            { value: ticketsSold.toString(), label: 'Tickets Sold' },
          ]);
        } catch (err) {
          console.log('Could not fetch detailed stats (okay for non-admin users)');
        }
      } catch (err) {
        console.error('Failed to fetch events:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="home-page">
      {/* Hero Section */}
      <HeroSection />

      {/* Categories Section */}
      <section className="section categories-section">
        <div className="container">
          <div className="section-header">
            <div>
              <h2 className="section-title">Browse by Category</h2>
              <p className="section-subtitle">Explore events that match your interests</p>
            </div>
          </div>
          
          <div className="categories-grid">
            {categories.map((category, index) => {
              const Icon = category.icon;
              return (
                <Link 
                  key={index} 
                  to={`/events?category=${category.name.toLowerCase()}`}
                  className="category-card"
                  style={{ '--category-color': category.color }}
                >
                  <div className="category-icon">
                    <Icon size={28} />
                  </div>
                  <div className="category-info">
                    <h3 className="category-name">{category.name}</h3>
                    <p className="category-count">{category.count} event{category.count !== 1 ? 's' : ''}</p>
                  </div>
                  <ArrowRightIcon size={20} className="category-arrow" />
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Events Section */}
      <section className="section featured-section">
        <div className="container">
          <div className="section-header">
            <div>
              <h2 className="section-title">Featured Events</h2>
              <p className="section-subtitle">Don't miss out on these trending experiences</p>
            </div>
            <Link to="/events" className="btn btn-outline">
              View All Events
              <ArrowRightIcon size={18} />
            </Link>
          </div>
          
          <div className="events-grid events-grid-featured">
            {loading ? (
              [...Array(4)].map((_, i) => <EventCardSkeleton key={i} variant="featured" />)
            ) : featuredEvents.length > 0 ? (
              featuredEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  variant="featured"
                  onClick={() => navigate(`/events/${event.id}`)}
                />
              ))
            ) : (
              <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--text-muted)' }}>
                No featured events yet. Check back soon!
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section features-section">
        <div className="container">
          <div className="section-header section-header-center">
            <h2 className="section-title">Why Choose Lycaon</h2>
            <p className="section-subtitle">The easiest way to discover and book events</p>
          </div>
          
          <div className="features-grid">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="feature-card">
                  <div className="feature-icon">
                    <Icon size={28} />
                  </div>
                  <h3 className="feature-title">{feature.title}</h3>
                  <p className="feature-description">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Upcoming Events Section */}
      <section className="section upcoming-section">
        <div className="container">
          <div className="section-header">
            <div>
              <h2 className="section-title">Upcoming Events</h2>
              <p className="section-subtitle">Plan ahead and secure your spot</p>
            </div>
            <Link to="/events" className="btn btn-outline">
              View All
              <ArrowRightIcon size={18} />
            </Link>
          </div>
          
          <div className="events-grid">
            {loading ? (
              [...Array(4)].map((_, i) => <EventCardSkeleton key={i} />)
            ) : upcomingEvents.length > 0 ? (
              upcomingEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onClick={() => navigate(`/events/${event.id}`)}
                />
              ))
            ) : (
              <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--text-muted)' }}>
                No upcoming events yet.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="section stats-section">
        <div className="container">
          <div className="stats-grid">
            {homeStats.map((stat, index) => (
              <div key={index} className="stat-card">
                <span className="stat-card-value">{stat.value}</span>
                <span className="stat-card-label">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="section testimonials-section">
        <div className="container">
          <div className="section-header section-header-center">
            <h2 className="section-title">What Our Users Say</h2>
            <p className="section-subtitle">
              Real feedback from verified users of the platform
              {feedbackStats.totalFeedback > 0
                ? ` · ${feedbackStats.totalFeedback} reviewed feedback entries · ${feedbackStats.averageRating}/5 average`
                : ''}
            </p>
          </div>

          {feedbackEntries.length > 0 ? (
            <div className="testimonials-grid">
              {feedbackEntries.map((feedback) => (
                <div key={feedback._id} className="testimonial-card">
                  <div className="testimonial-rating-row">
                    <div className="testimonial-rating">
                      {[...Array(feedback.rating)].map((_, i) => (
                        <StarIcon key={i} size={16} filled />
                      ))}
                    </div>
                    <span className="testimonial-date">
                      {new Date(feedback.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  {feedback.title && <h3 className="testimonial-title">{feedback.title}</h3>}
                  <p className="testimonial-content">"{feedback.message}"</p>
                  <div className="testimonial-author">
                    <div className="testimonial-avatar testimonial-avatar-fallback">
                      {getInitials(feedback.userName)}
                    </div>
                    <div>
                      <p className="testimonial-name">{feedback.userName}</p>
                      <p className="testimonial-role">Verified attendee feedback</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="testimonials-empty">
              <p>No user feedback has been reviewed yet.</p>
            </div>
          )}
        </div>
      </section>

    </div>
  );
};

export default Home;
