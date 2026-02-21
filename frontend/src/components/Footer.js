import React from 'react';
import { Link } from 'react-router-dom';
import { MailIcon, TwitterIcon, InstagramIcon, FacebookIcon, LinkedInIcon, MapPinIcon, ArrowRightIcon } from './Icons';
import './Footer.css';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    events: {
      title: 'Events',
      links: [
        { label: 'All Events', path: '/events' },
        { label: 'Concerts', path: '/events?category=concerts' },
        { label: 'Festivals', path: '/events?category=festivals' },
        { label: 'Conferences', path: '/events?category=conferences' },
        { label: 'Sports', path: '/events?category=sports' },
      ],
    },
    company: {
      title: 'Company',
      links: [
        { label: 'About Us', path: '/about' },
        { label: 'Careers', path: '/careers' },
        { label: 'Press', path: '/press' },
        { label: 'Blog', path: '/blog' },
        { label: 'Contact', path: '/contact' },
      ],
    },
    support: {
      title: 'Support',
      links: [
        { label: 'Help Center', path: '/help' },
        { label: 'FAQs', path: '/faqs' },
        { label: 'Refund Policy', path: '/refund-policy' },
        { label: 'Terms of Service', path: '/terms' },
        { label: 'Privacy Policy', path: '/privacy' },
      ],
    },
  };

  const socialLinks = [
    { icon: TwitterIcon, href: 'https://twitter.com', label: 'Twitter' },
    { icon: InstagramIcon, href: 'https://instagram.com', label: 'Instagram' },
    { icon: FacebookIcon, href: 'https://facebook.com', label: 'Facebook' },
    { icon: LinkedInIcon, href: 'https://linkedin.com', label: 'LinkedIn' },
  ];

  return (
    <footer className="footer">
      {/* Newsletter Section */}
      <div className="footer-newsletter">
        <div className="container">
          <div className="newsletter-content">
            <div className="newsletter-text">
              <h3>Stay in the loop</h3>
              <p>Get the latest events and exclusive offers delivered to your inbox</p>
            </div>
            <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
              <div className="newsletter-input-wrapper">
                <MailIcon size={20} className="newsletter-icon" />
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="newsletter-input"
                />
              </div>
              <button type="submit" className="btn btn-primary">
                Subscribe
                <ArrowRightIcon size={18} />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="footer-main">
        <div className="container">
          <div className="footer-grid">
            {/* Brand Column */}
            <div className="footer-brand">
              <Link to="/" className="footer-logo">
                <div className="logo-icon">
                  <svg width="36" height="36" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="32" height="32" rx="8" fill="url(#footer-logo-gradient)"/>
                    <path d="M16 8L22 12V20L16 24L10 20V12L16 8Z" stroke="white" strokeWidth="2" fill="none"/>
                    <circle cx="16" cy="16" r="3" fill="white"/>
                    <defs>
                      <linearGradient id="footer-logo-gradient" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#9333ea"/>
                        <stop offset="1" stopColor="#c084fc"/>
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
                <span className="logo-text">Lycaon</span>
              </Link>
              
              <p className="footer-description">
                Discover and book unforgettable experiences. From concerts to conferences, 
                find your next event with Lycaon.
              </p>
              
              <div className="footer-location">
                <MapPinIcon size={16} />
                <span>San Francisco, CA</span>
              </div>

              {/* Social Links */}
              <div className="footer-social">
                {socialLinks.map((social, index) => {
                  const Icon = social.icon;
                  return (
                    <a 
                      key={index}
                      href={social.href} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="social-link"
                      aria-label={social.label}
                    >
                      <Icon size={20} />
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Links Columns */}
            {Object.entries(footerLinks).map(([key, section]) => (
              <div key={key} className="footer-links-column">
                <h4 className="footer-links-title">{section.title}</h4>
                <ul className="footer-links">
                  {section.links.map((link, index) => (
                    <li key={index}>
                      <Link to={link.path} className="footer-link">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="footer-bottom">
        <div className="container">
          <div className="footer-bottom-content">
            <p className="footer-copyright">
              © {currentYear} Lycaon Entertainment. All rights reserved.
            </p>
            <div className="footer-bottom-links">
              <Link to="/terms">Terms</Link>
              <Link to="/privacy">Privacy</Link>
              <Link to="/cookies">Cookies</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
