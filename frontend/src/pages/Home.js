import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { HeroSection } from '../components/HeroSection';
import { EventCard, EventCardSkeleton } from '../components/EventCard';
import { BookingModal } from '../components/BookingModal';
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

const categories = [
  { name: 'Concerts', icon: MusicIcon, count: 245, color: '#ec4899' },
  { name: 'Festivals', icon: PartyPopperIcon, count: 89, color: '#f97316' },
  { name: 'Conferences', icon: GraduationCapIcon, count: 156, color: '#3b82f6' },
  { name: 'Exhibitions', icon: CameraIcon, count: 78, color: '#22c55e' },
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

const testimonials = [
  {
    id: 1,
    name: 'Sarah Johnson',
    role: 'Music Enthusiast',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    content: 'Lycaon made finding and booking concert tickets so easy! The QR code feature is a game-changer.',
    rating: 5,
  },
  {
    id: 2,
    name: 'Michael Chen',
    role: 'Event Organizer',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    content: 'As an event organizer, Lycaon has streamlined our ticket sales and attendee management.',
    rating: 5,
  },
  {
    id: 3,
    name: 'Emily Rodriguez',
    role: 'Festival Goer',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
    content: "I've discovered so many amazing events through Lycaon. It's become my go-to for entertainment.",
    rating: 5,
  },
];

export const Home = () => {
  const { user } = useAuth();
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [homeStats, setHomeStats] = useState([
    { value: '0', label: 'Events Listed' },
    { value: '0', label: 'Tickets Sold' },
    { value: '0', label: 'Active Users' },
    { value: '99%', label: 'Happy Customers' },
  ]);
  const [loading, setLoading] = useState(true);
  const [selectedEventForBooking, setSelectedEventForBooking] = useState(null);

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
                    <p className="category-count">{category.count} events</p>
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
                <div
                  key={event.id}
                  onClick={() => {
                    if (user) {
                      setSelectedEventForBooking(event);
                    } else {
                      alert('Please log in to book tickets');
                      window.location.href = '/login';
                    }
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  <EventCard event={event} variant="featured" />
                </div>
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
                <div
                  key={event.id}
                  onClick={() => {
                    if (user) {
                      setSelectedEventForBooking(event);
                    } else {
                      alert('Please log in to book tickets');
                      window.location.href = '/login';
                    }
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  <EventCard event={event} />
                </div>
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
            <p className="section-subtitle">Join thousands of satisfied event-goers</p>
          </div>
          
          <div className="testimonials-grid">
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="testimonial-card">
                <div className="testimonial-rating">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <StarIcon key={i} size={16} filled />
                  ))}
                </div>
                <p className="testimonial-content">"{testimonial.content}"</p>
                <div className="testimonial-author">
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.name} 
                    className="testimonial-avatar"
                  />
                  <div>
                    <p className="testimonial-name">{testimonial.name}</p>
                    <p className="testimonial-role">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section cta-section">
        <div className="container">
          <div className="cta-card">
            <div className="cta-bg"></div>
            <div className="cta-content">
              <h2 className="cta-title">Ready to Experience Something Amazing?</h2>
              <p className="cta-subtitle">
                Join millions of users discovering and booking events with Lycaon
              </p>
              <div className="cta-buttons">
                <Link to="/events" className="btn btn-primary btn-xl">
                  Explore Events
                  <ArrowRightIcon size={20} />
                </Link>
                <Link to="/register" className="btn btn-outline btn-xl">
                  Create Account
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Booking Modal */}
      {selectedEventForBooking && (
        <BookingModal
          event={selectedEventForBooking}
          onClose={() => setSelectedEventForBooking(null)}
          onBookingSuccess={() => {
            // Refresh events after successful booking
            setSelectedEventForBooking(null);
          }}
        />
      )}
    </div>
  );
};

export default Home;
