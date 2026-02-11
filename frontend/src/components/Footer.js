import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

export const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Main Footer Content */}
        <div className="footer-content">
          {/* Brand Section */}
          <div className="footer-brand">
            <div className="footer-logo">
              <span className="logo-icon">🎭</span>
              <span className="logo-text">Lycaon Entertainment</span>
            </div>
            <p className="footer-description">
              Your premier destination for unforgettable events. Discover, book, and experience the best entertainment in town.
            </p>
            <div className="footer-contact">
              <div className="contact-item">
                <span className="contact-icon">📧</span>
                <span>contact@lycaon.entertainment</span>
              </div>
              <div className="contact-item">
                <span className="contact-icon">📞</span>
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="contact-item">
                <span className="contact-icon">📍</span>
                <span>123 Entertainment Ave, Los Angeles, CA</span>
              </div>
            </div>
          </div>

          {/* Links Sections */}
          <div className="footer-links-section">
            <h4>Company</h4>
            <ul>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/careers">Careers</Link></li>
              <li><Link to="/press">Press</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </div>

          <div className="footer-links-section">
            <h4>Events</h4>
            <ul>
              <li><Link to="/events">Browse Events</Link></li>
              <li><Link to="/create-event">Create Event</Link></li>
              <li><Link to="/pricing">Pricing</Link></li>
              <li><Link to="/partners">Partner With Us</Link></li>
            </ul>
          </div>

          <div className="footer-links-section">
            <h4>Support</h4>
            <ul>
              <li><Link to="/help">Help Center</Link></li>
              <li><Link to="/faq">FAQs</Link></li>
              <li><Link to="/refund">Refund Policy</Link></li>
              <li><Link to="/terms">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <p>&copy; 2026 Lycaon Entertainment. All rights reserved.</p>
          <div className="footer-social">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-link">
              Facebook
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-link">
              Twitter
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-link">
              Instagram
            </a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="social-link">
              YouTube
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
