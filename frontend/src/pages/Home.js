import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { HeroSection } from '../components/HeroSection';
import { EventCard } from '../components/EventCard';
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
  StarIcon,
  UsersIcon,
  TrendingUpIcon
} from '../components/Icons';
import './Home.css';

// Sample events data
const featuredEvents = [
  {
    id: 1,
    title: 'Summer Music Festival 2026',
    date: 'August 15-17, 2026',
    time: '4:00 PM',
    location: 'Los Angeles',
    venue: 'Sunset Beach Arena',
    image: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=600&h=400&fit=crop',
    price: '$149',
    originalPrice: '$199',
    category: 'Music',
    attendees: 1250,
    spotsLeft: 45,
    isHot: true,
    isFeatured: true,
  },
  {
    id: 2,
    title: 'Tech Innovation Summit',
    date: 'September 20, 2026',
    time: '9:00 AM',
    location: 'San Francisco',
    venue: 'Moscone Center',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&h=400&fit=crop',
    price: '$299',
    category: 'Conference',
    attendees: 850,
    spotsLeft: 120,
    isFeatured: true,
  },
  {
    id: 3,
    title: 'Art & Design Exhibition',
    date: 'October 5, 2026',
    time: '10:00 AM',
    location: 'New York',
    venue: 'Metropolitan Gallery',
    image: 'https://images.unsplash.com/photo-1531058020387-3be344556be6?w=600&h=400&fit=crop',
    price: '$45',
    category: 'Art',
    attendees: 420,
    isFeatured: true,
  },
  {
    id: 4,
    title: 'Comedy Night Live',
    date: 'October 12, 2026',
    time: '8:00 PM',
    location: 'Chicago',
    venue: 'Laugh Factory',
    image: 'https://images.unsplash.com/photo-1585699324551-f6c309eedeca?w=600&h=400&fit=crop',
    price: '$35',
    category: 'Comedy',
    attendees: 180,
    isHot: true,
  },
];

const upcomingEvents = [
  {
    id: 5,
    title: 'Jazz Night at Blue Note',
    date: 'March 15, 2026',
    time: '7:30 PM',
    location: 'New York',
    venue: 'Blue Note Jazz Club',
    image: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=600&h=400&fit=crop',
    price: '$65',
    category: 'Music',
  },
  {
    id: 6,
    title: 'Startup Pitch Competition',
    date: 'March 22, 2026',
    time: '2:00 PM',
    location: 'Austin',
    venue: 'Capital Factory',
    image: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=600&h=400&fit=crop',
    price: 'Free',
    category: 'Business',
  },
  {
    id: 7,
    title: 'Food & Wine Festival',
    date: 'April 8, 2026',
    time: '12:00 PM',
    location: 'Napa Valley',
    venue: 'Vineyard Estate',
    image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600&h=400&fit=crop',
    price: '$85',
    category: 'Food',
    isHot: true,
  },
  {
    id: 8,
    title: 'Electronic Music Rave',
    date: 'April 15, 2026',
    time: '10:00 PM',
    location: 'Miami',
    venue: 'Warehouse District',
    image: 'https://images.unsplash.com/photo-1571266028243-e4733b0f0bb0?w=600&h=400&fit=crop',
    price: '$75',
    category: 'Music',
  },
];

const categories = [
  { name: 'Concerts', icon: MusicIcon, count: 245, color: '#a855f7' },
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

const stats = [
  { value: '10K+', label: 'Events Listed' },
  { value: '500K+', label: 'Tickets Sold' },
  { value: '50+', label: 'Cities' },
  { value: '99%', label: 'Happy Customers' },
];

export const Home = () => {
  return (
    <div className="home-page">
      <Navbar />
      
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
            {featuredEvents.map((event) => (
              <EventCard key={event.id} event={event} variant="featured" />
            ))}
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
            {upcomingEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="section stats-section">
        <div className="container">
          <div className="stats-grid">
            {stats.map((stat, index) => (
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
              <div className="cta-stats">
                <div className="cta-stat">
                  <UsersIcon size={20} />
                  <span>500K+ Happy Users</span>
                </div>
                <div className="cta-stat">
                  <TrendingUpIcon size={20} />
                  <span>Growing Every Day</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
