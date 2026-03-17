import React from 'react';
import { Link } from 'react-router-dom';
import { TwitterIcon, InstagramIcon, FacebookIcon, LinkedInIcon, MapPinIcon } from './Icons';
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
      {/* Main Footer */}
      <div className="footer-main">
        <div className="container">
          <div className="footer-grid">
            {/* Brand Column */}
            <div className="footer-brand">
              <Link to="/" className="footer-logo">
                <div className="logo-icon">
                  <img src="/logo.png" alt="Logo" width="36" height="36" style={{ borderRadius: '8px', objectFit: 'contain' }} />
                </div>
                <span className="logo-text">Lycaon</span>
              </Link>
              
              <p className="footer-description">
                Discover and book unforgettable experiences. From concerts to conferences, 
                find your next event with Lycaon.
              </p>
              
              <div className="footer-location">
                <MapPinIcon size={16} />
                <span>Colombo, Sri Lanka</span>
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
