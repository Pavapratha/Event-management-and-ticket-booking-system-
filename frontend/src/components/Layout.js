import React from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import './Layout.css';

export const Layout = ({ children, showFooter = true }) => {
  return (
    <div className="layout">
      <Navbar />
      <main className="layout-main">
        {children}
      </main>
      {showFooter && <Footer />}
    </div>
  );
};

// Page Container for consistent padding
export const PageContainer = ({ children, className = '' }) => {
  return (
    <div className={`page-container ${className}`}>
      {children}
    </div>
  );
};

// Section Component for page sections
export const Section = ({ children, className = '', dark = false }) => {
  return (
    <section className={`section ${dark ? 'section-dark' : ''} ${className}`}>
      <div className="section-container">
        {children}
      </div>
    </section>
  );
};

// Card Component
export const Card = ({ children, className = '', hover = false, onClick }) => {
  return (
    <div 
      className={`card ${hover ? 'card-hover' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};
