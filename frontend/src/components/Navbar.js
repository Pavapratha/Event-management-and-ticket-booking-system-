import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { 
  MenuIcon, 
  XIcon, 
  HomeIcon, 
  CalendarIcon, 
  TicketIcon, 
  UserIcon, 
  LogOutIcon,
  ChevronDownIcon 
} from './Icons';
import './Navbar.css';

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
    setIsDropdownOpen(false);
  }, [location]);

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
  };

  const navLinks = [
    { path: '/', label: 'Home', icon: HomeIcon },
    { path: '/events', label: 'Events', icon: CalendarIcon },
    { path: '/my-tickets', label: 'My Tickets', icon: TicketIcon },
  ];

  return (
    <>
      <nav className={`navbar ${isScrolled ? 'navbar-scrolled' : ''} ${isMenuOpen ? 'menu-open' : ''}`}>
        <div className="navbar-container container">
          {/* Logo */}
          <Link to={user ? '/dashboard' : '/'} className="navbar-brand">
            <div className="navbar-logo">
              <div className="logo-icon">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="32" height="32" rx="8" fill="url(#logo-gradient)"/>
                  <path d="M16 8L22 12V20L16 24L10 20V12L16 8Z" stroke="white" strokeWidth="2" fill="none"/>
                  <circle cx="16" cy="16" r="3" fill="white"/>
                  <defs>
                    <linearGradient id="logo-gradient" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#9333ea"/>
                      <stop offset="1" stopColor="#c084fc"/>
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <span className="logo-text">Lycaon</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="navbar-links hidden-mobile">
            {navLinks.map((link) => (
              <Link 
                key={link.path}
                to={link.path} 
                className={`nav-link ${isActive(link.path) ? 'active' : ''}`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Auth Section */}
          <div className="navbar-auth hidden-mobile">
            {user ? (
              <div className="user-dropdown">
                <button 
                  className="user-dropdown-trigger"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  <div className="user-avatar">
                    {user.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="user-name">{user.name}</span>
                  <ChevronDownIcon size={16} className={`dropdown-arrow ${isDropdownOpen ? 'open' : ''}`} />
                </button>
                
                {isDropdownOpen && (
                  <div className="dropdown-menu animate-scaleIn">
                    <div className="dropdown-header">
                      <p className="dropdown-user-name">{user.name}</p>
                      <p className="dropdown-user-email">{user.email}</p>
                    </div>
                    <div className="dropdown-divider"></div>
                    <Link to="/dashboard" className="dropdown-item">
                      <HomeIcon size={16} />
                      Dashboard
                    </Link>
                    <Link to="/my-tickets" className="dropdown-item">
                      <TicketIcon size={16} />
                      My Tickets
                    </Link>
                    <Link to="/profile" className="dropdown-item">
                      <UserIcon size={16} />
                      Profile
                    </Link>
                    <div className="dropdown-divider"></div>
                    <button onClick={handleLogout} className="dropdown-item dropdown-item-danger">
                      <LogOutIcon size={16} />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="auth-buttons">
                <Link to="/login" className="btn btn-ghost">
                  Sign In
                </Link>
                <Link to="/register" className="btn btn-primary">
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="navbar-toggle hidden-desktop"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <XIcon size={24} /> : <MenuIcon size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div className={`mobile-menu-overlay ${isMenuOpen ? 'open' : ''}`} onClick={() => setIsMenuOpen(false)}></div>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${isMenuOpen ? 'open' : ''}`}>
        <div className="mobile-menu-content">
          {/* User Info (if logged in) */}
          {user && (
            <div className="mobile-user-info">
              <div className="user-avatar user-avatar-lg">
                {user.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div>
                <p className="mobile-user-name">{user.name}</p>
                <p className="mobile-user-email">{user.email}</p>
              </div>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="mobile-nav">
            {navLinks.map((link, index) => {
              const Icon = link.icon;
              return (
                <Link 
                  key={link.path}
                  to={link.path}
                  className={`mobile-nav-link ${isActive(link.path) ? 'active' : ''}`}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <Icon size={20} />
                  {link.label}
                </Link>
              );
            })}
            
            {user && (
              <>
                <Link to="/dashboard" className="mobile-nav-link">
                  <HomeIcon size={20} />
                  Dashboard
                </Link>
                <Link to="/profile" className="mobile-nav-link">
                  <UserIcon size={20} />
                  Profile
                </Link>
              </>
            )}
          </nav>

          {/* Auth Actions */}
          <div className="mobile-auth">
            {user ? (
              <button onClick={handleLogout} className="btn btn-outline w-full">
                <LogOutIcon size={18} />
                Sign Out
              </button>
            ) : (
              <>
                <Link to="/login" className="btn btn-outline w-full">
                  Sign In
                </Link>
                <Link to="/register" className="btn btn-primary w-full">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
