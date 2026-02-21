import React, { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/Auth.css';

const CheckCircleIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="64"
    height="64"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ color: '#10b981', marginBottom: '20px' }}
  >
    <path d="M22 11.08v.5a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const AlertCircleIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="64"
    height="64"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ color: '#ef4444', marginBottom: '20px' }}
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

const LoadingSpinner = () => (
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
    style={{
      marginBottom: '20px',
      animation: 'spin 1s linear infinite',
      color: '#667eea',
    }}
  >
    <line x1="12" y1="2" x2="12" y2="6" />
    <line x1="12" y1="18" x2="12" y2="22" />
    <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" />
    <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
    <line x1="2" y1="12" x2="6" y2="12" />
    <line x1="18" y1="12" x2="22" y2="12" />
    <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" />
    <line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
  </svg>
);

export const EmailVerification = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [message, setMessage] = useState('Verifying your email...');
  const [detailedMessage, setDetailedMessage] = useState('Please wait while we verify your email address.');

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const token = searchParams.get('token');
        const email = searchParams.get('email');

        if (!token || !email) {
          setStatus('error');
          setMessage('Invalid verification link');
          setDetailedMessage('The verification link is missing required parameters. Please try registering again.');
          return;
        }

        const response = await axios.post(
          `${process.env.REACT_APP_API_URL}/api/auth/verify-email`,
          {
            token,
            email,
          }
        );

        if (response.data.success) {
          setStatus('success');
          setMessage('Email Verified Successfully!');
          setDetailedMessage('Your email has been verified. You can now log in to your account.');
        }
      } catch (error) {
        setStatus('error');
        const errorData = error.response?.data;

        if (error.response?.status === 400) {
          if (errorData?.message?.includes('expired')) {
            setMessage('Verification Link Expired');
            setDetailedMessage(
              'This verification link has expired. Please register again or request a new verification link.'
            );
          } else if (errorData?.message?.includes('already verified')) {
            setMessage('Email Already Verified');
            setDetailedMessage('This email is already verified. You can proceed to log in.');
          } else {
            setMessage('Verification Failed');
            setDetailedMessage(errorData?.message || 'Unable to verify your email. Please try again.');
          }
        } else {
          setMessage('Verification Error');
          setDetailedMessage('An error occurred while verifying your email. Please try again later.');
        }
      }
    };

    verifyEmail();
  }, [searchParams]);

  return (
    <div className="auth-page">
      <style>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .verification-container {
          text-align: center;
          padding: 40px 20px;
        }
        .verification-content {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .verification-message {
          margin-top: 20px;
          margin-bottom: 30px;
        }
        .verification-message h2 {
          font-size: 24px;
          margin-bottom: 10px;
          color: #333;
        }
        .verification-message p {
          color: #666;
          font-size: 14px;
          line-height: 1.6;
        }
        .verification-actions {
          margin-top: 30px;
          display: flex;
          gap: 10px;
          justify-content: center;
          flex-wrap: wrap;
        }
        .btn-link {
          padding: 10px 20px;
          border-radius: 5px;
          text-decoration: none;
          font-weight: 600;
          font-size: 14px;
          transition: all 0.3s ease;
          display: inline-block;
        }
        .btn-primary-link {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }
        .btn-primary-link:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }
        .btn-secondary-link {
          background: #f0f0f0;
          color: #333;
          border: 1px solid #ddd;
        }
        .btn-secondary-link:hover {
          background: #e8e8e8;
        }
      `}</style>

      <div className="auth-container">
        <div className="auth-card">
          <div className="verification-container">
            <div className="verification-content">
              {status === 'loading' && <LoadingSpinner />}
              {status === 'success' && <CheckCircleIcon />}
              {status === 'error' && <AlertCircleIcon />}

              <div className="verification-message">
                <h2>{message}</h2>
                <p>{detailedMessage}</p>
              </div>

              <div className="verification-actions">
                {status === 'success' && (
                  <>
                    <Link to="/login" className="btn-link btn-primary-link">
                      Go to Login
                    </Link>
                    <Link to="/" className="btn-link btn-secondary-link">
                      Back to Home
                    </Link>
                  </>
                )}

                {status === 'error' && (
                  <>
                    <Link to="/register" className="btn-link btn-primary-link">
                      Register Again
                    </Link>
                    <Link to="/resend-verification" className="btn-link btn-secondary-link">
                      Resend Link
                    </Link>
                  </>
                )}

                {status === 'loading' && (
                  <Link to="/" className="btn-link btn-secondary-link">
                    Back to Home
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
