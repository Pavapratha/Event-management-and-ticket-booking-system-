import React from 'react';
import { Link } from 'react-router-dom';
import { SearchIcon, CalendarIcon, MapPinIcon, ArrowRightIcon, SparklesIcon } from './Icons';
import './HeroSection.css';

export const HeroSection = () => {
  return (
    <section className="hero">
      {/* Background Elements */}
      <div className="hero-bg">
        <div className="hero-gradient hero-gradient-1"></div>
        <div className="hero-gradient hero-gradient-2"></div>
        <div className="hero-grid"></div>
        <div className="hero-glow"></div>
      </div>

      <div className="container">
        <div className="hero-content">
          {/* Badge */}
          <div className="hero-badge animate-fadeInDown">
            <SparklesIcon size={14} />
            <span>Discover Amazing Events Near You</span>
          </div>

          {/* Main Heading */}
          <h1 className="hero-title animate-fadeInUp">
            Find & Book
            <span className="text-gradient"> Unforgettable </span>
            Experiences
          </h1>

          {/* Subtitle */}
          <p className="hero-subtitle animate-fadeInUp stagger-1">
            Explore thousands of concerts, festivals, conferences, and more. 
            Get your tickets instantly with QR code access.
          </p>

          {/* Search Bar */}
          <div className="hero-search animate-fadeInUp stagger-2">
            <div className="search-wrapper">
              <div className="search-input-group">
                <SearchIcon size={20} className="search-icon" />
                <input 
                  type="text" 
                  placeholder="Search events, artists, venues..."
                  className="search-input"
                />
              </div>
              
              <div className="search-divider hidden-mobile"></div>
              
              <div className="search-input-group hidden-mobile">
                <MapPinIcon size={20} className="search-icon" />
                <input 
                  type="text" 
                  placeholder="Location"
                  className="search-input search-input-sm"
                />
              </div>
              
              <div className="search-divider hidden-mobile"></div>
              
              <div className="search-input-group hidden-mobile">
                <CalendarIcon size={20} className="search-icon" />
                <input 
                  type="text" 
                  placeholder="Any date"
                  className="search-input search-input-sm"
                />
              </div>
              
              <button className="search-btn">
                <SearchIcon size={20} />
                <span className="hidden-mobile">Search</span>
              </button>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="hero-actions animate-fadeInUp stagger-3">
            <Link to="/events" className="btn btn-primary btn-lg">
              Explore Events
              <ArrowRightIcon size={20} />
            </Link>
            <Link to="/register" className="btn btn-outline btn-lg">
              Create Account
            </Link>
          </div>

          {/* Stats */}
          <div className="hero-stats animate-fadeInUp stagger-4">
            <div className="stat-item">
              <span className="stat-value">10K+</span>
              <span className="stat-label">Events</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-value">500K+</span>
              <span className="stat-label">Tickets Sold</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-value">50+</span>
              <span className="stat-label">Cities</span>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Elements */}
      <div className="hero-floating">
        <div className="floating-card floating-card-1 animate-float">
          <div className="floating-card-icon">🎵</div>
          <div className="floating-card-text">Live Music</div>
        </div>
        <div className="floating-card floating-card-2 animate-float" style={{ animationDelay: '0.5s' }}>
          <div className="floating-card-icon">🎭</div>
          <div className="floating-card-text">Theater</div>
        </div>
        <div className="floating-card floating-card-3 animate-float" style={{ animationDelay: '1s' }}>
          <div className="floating-card-icon">🎨</div>
          <div className="floating-card-text">Art Shows</div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
