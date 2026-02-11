import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './Navbar.css';

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/dashboard" className="navbar-brand">
          <div className="navbar-logo">
            <span className="logo-icon">🎭</span>
            <span className="logo-text">Lycaon</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="navbar-links">
          <Link 
            to="/dashboard" 
            className={`nav-link ${isActive('/') || isActive('/dashboard') ? 'active' : ''}`}
          >
            Dashboard
          </Link>
          <Link 
            to="/events" 
            className={`nav-link ${isActive('/events') ? 'active' : ''}`}
          >
            Events
          </Link>
          <Link 
            to="/my-tickets" 
            className={`nav-link ${isActive('/my-tickets') ? 'active' : ''}`}
          >
            My Tickets
          </Link>
        </div>

        {/* Auth Section */}
        <div className="navbar-auth">
          {user ? (
            <div className="user-menu">
              <div className="user-avatar">
                {user.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <span className="user-name">{user.name}</span>
              <button onClick={handleLogout} className="btn-logout">
                Logout
              </button>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn-nav btn-nav-secondary">
                Sign In
              </Link>
              <Link to="/register" className="btn-nav btn-nav-primary">
                Get Started
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className={`navbar-toggle ${isMenuOpen ? 'open' : ''}`}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={`navbar-mobile ${isMenuOpen ? 'open' : ''}`}>
        <Link 
          to="/dashboard" 
          className={`mobile-link ${isActive('/') ? 'active' : ''}`}
          onClick={() => setIsMenuOpen(false)}
        >
          Dashboard
        </Link>
        <Link 
          to="/events" 
          className={`mobile-link ${isActive('/events') ? 'active' : ''}`}
          onClick={() => setIsMenuOpen(false)}
        >
          Events
        </Link>
        <Link 
          to="/my-tickets" 
          className={`mobile-link ${isActive('/my-tickets') ? 'active' : ''}`}
          onClick={() => setIsMenuOpen(false)}
        >
          My Tickets
        </Link>
        
        <div className="mobile-auth">
          {user ? (
            <>
              <div className="mobile-user">
                <div className="user-avatar">{user.name?.charAt(0).toUpperCase()}</div>
                <span>{user.name}</span>
              </div>
              <button onClick={handleLogout} className="btn-nav btn-nav-secondary full-width">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link 
                to="/login" 
                className="btn-nav btn-nav-secondary full-width"
                onClick={() => setIsMenuOpen(false)}
              >
                Sign In
              </Link>
              <Link 
                to="/register" 
                className="btn-nav btn-nav-primary full-width"
                onClick={() => setIsMenuOpen(false)}
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};
