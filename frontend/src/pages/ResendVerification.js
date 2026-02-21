import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import '../styles/Auth.css';

const MailIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="16" x="2" y="4" rx="2"/>
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
  </svg>
);

const CheckCircleIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="48"
    height="48"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ color: '#10b981', marginTop: '10px', marginBottom: '10px' }}
  >
    <path d="M22 11.08v.5a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14"/>
    <path d="m12 5 7 7-7 7"/>
  </svg>
);

export const ResendVerification = () => {
  const location = useLocation();
  const [email, setEmail] = useState(location.state?.email || '');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/auth/resend-verification`,
        {
          email,
        }
      );

      if (response.data.success) {
        setSuccess(response.data.message);
        setEmail('');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to resend verification email. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-logo">
              <img src="/logo.png" alt="Logo" className="auth-logo-image" />
            </div>
            <h1>Resend Verification</h1>
            <p>Get a new verification link</p>
          </div>

          {success && (
            <div className="alert alert-success">
              <CheckCircleIcon />
              <div style={{ marginLeft: '10px' }}>
                {success}
              </div>
            </div>
          )}
          {error && <div className="alert alert-error">{error}</div>}

          {!success && (
            <>
              <form onSubmit={handleSubmit} className="auth-form">
                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <div className="input-wrapper">
                    <span className="input-icon input-icon-left">
                      <MailIcon />
                    </span>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="input-with-icon"
                      disabled={loading}
                    />
                  </div>
                </div>

                <button type="submit" className="btn btn-primary" disabled={loading}>
                  <span className="btn-arrow"><ArrowRightIcon /></span>
                  {loading ? 'Sending...' : 'Resend Verification Link'}
                </button>
              </form>

              <div className="auth-footer">
                <p>
                  Remember your password?{' '}
                  <Link to="/login" className="link">
                    Sign in
                  </Link>
                </p>
                <p style={{ marginTop: '10px' }}>
                  Don't have an account?{' '}
                  <Link to="/register" className="link">
                    Create one
                  </Link>
                </p>
              </div>
            </>
          )}

          {success && (
            <div className="auth-footer">
              <p>
                <Link to="/login" className="link">
                  Back to Login
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
