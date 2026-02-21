import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import '../styles/Auth.css';

// Icon components
const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const MailIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="16" x="2" y="4" rx="2"/>
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
  </svg>
);

const LockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

const EyeOffIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/>
    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/>
    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/>
    <line x1="2" x2="22" y1="2" y2="22"/>
  </svg>
);

const ArrowRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14"/>
    <path d="m12 5 7 7-7 7"/>
  </svg>
);

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="22,4 12,14.01 9,11.01"/>
  </svg>
);

export const Register = () => {
  const navigate = useNavigate();
  const { register, loading } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');
  
  // Verification state
  const [showVerification, setShowVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [resending, setResending] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  // Handle code input change
  const handleCodeChange = (index, value) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newCode = [...verificationCode];
    newCode[index] = value;
    setVerificationCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  // Handle backspace in code input
  const handleCodeKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  // Handle paste for code
  const handleCodePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pastedData.length === 6) {
      setVerificationCode(pastedData.split(''));
      const lastInput = document.getElementById('code-5');
      if (lastInput) lastInput.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const result = await register(
      formData.name,
      formData.email,
      formData.password,
      formData.confirmPassword
    );

    if (result.success) {
      setRegisteredEmail(formData.email);
      setShowVerification(true);
      setErrors({});
    } else {
      setErrors({ submit: result.error });
    }
  };

  // Verify the 6-digit code
  const handleVerify = async () => {
    const code = verificationCode.join('');
    
    if (code.length !== 6) {
      setErrors({ verify: 'Please enter the complete 6-digit code' });
      return;
    }

    setVerifying(true);
    setErrors({});

    try {
      const response = await api.post('/api/auth/verify-email', {
        email: registeredEmail,
        code: code
      });

      if (response.data.success) {
        setVerified(true);
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (error) {
      setErrors({ 
        verify: error.response?.data?.message || 'Invalid verification code. Please try again.' 
      });
      setVerificationCode(['', '', '', '', '', '']);
      const firstInput = document.getElementById('code-0');
      if (firstInput) firstInput.focus();
    } finally {
      setVerifying(false);
    }
  };

  // Resend verification code
  const handleResendCode = async () => {
    setResending(true);
    setErrors({});

    try {
      const response = await api.post('/api/auth/resend-verification', {
        email: registeredEmail
      });

      if (response.data.success) {
        setSuccess('New verification code sent! Check your email.');
        setVerificationCode(['', '', '', '', '', '']);
        setTimeout(() => setSuccess(''), 5000);
      }
    } catch (error) {
      setErrors({ 
        verify: error.response?.data?.message || 'Failed to resend code. Please try again.' 
      });
    } finally {
      setResending(false);
    }
  };

  // Verification success screen
  if (verified) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <div className="auth-card">
            <div className="auth-header" style={{ background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)' }}>
              <h1>Email Verified!</h1>
            </div>
            <div style={{ padding: '40px', textAlign: 'center' }}>
              <div style={{ color: '#28a745', marginBottom: '20px' }}>
                <CheckIcon />
              </div>
              <h2 style={{ marginBottom: '10px' }}>Success!</h2>
              <p style={{ color: '#666', marginBottom: '20px' }}>
                Your email has been verified successfully.
              </p>
              <p style={{ color: '#999', fontSize: '14px' }}>
                Redirecting to login...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Verification code entry screen
  if (showVerification) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <div className="auth-card">
            <div className="auth-header">
              <h1>Verify Your Email</h1>
              <p>Enter the 6-digit code sent to</p>
              <p style={{ fontWeight: 'bold', marginTop: '5px' }}>{registeredEmail}</p>
            </div>

            {success && <div className="alert alert-success">{success}</div>}
            {errors.verify && <div className="alert alert-error">{errors.verify}</div>}

            <div style={{ padding: '30px' }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                gap: '10px',
                marginBottom: '30px'
              }}>
                {verificationCode.map((digit, index) => (
                  <input
                    key={index}
                    id={`code-${index}`}
                    type="text"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleCodeChange(index, e.target.value)}
                    onKeyDown={(e) => handleCodeKeyDown(index, e)}
                    onPaste={index === 0 ? handleCodePaste : undefined}
                    style={{
                      width: '50px',
                      height: '60px',
                      fontSize: '24px',
                      textAlign: 'center',
                      border: '2px solid #ddd',
                      borderRadius: '8px',
                      outline: 'none',
                      transition: 'border-color 0.2s',
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#667eea'}
                    onBlur={(e) => e.target.style.borderColor = '#ddd'}
                    disabled={verifying}
                  />
                ))}
              </div>

              <button 
                onClick={handleVerify}
                className="btn btn-primary"
                disabled={verifying || verificationCode.join('').length !== 6}
                style={{ width: '100%', marginBottom: '15px' }}
              >
                {verifying ? 'Verifying...' : 'Verify Email'}
              </button>

              <div style={{ textAlign: 'center', marginTop: '20px' }}>
                <p style={{ color: '#666', fontSize: '14px', marginBottom: '10px' }}>
                  Didn't receive the code?
                </p>
                <button
                  onClick={handleResendCode}
                  disabled={resending}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#667eea',
                    cursor: 'pointer',
                    fontSize: '14px',
                    textDecoration: 'underline',
                  }}
                >
                  {resending ? 'Sending...' : 'Resend Code'}
                </button>
              </div>

              <div style={{ 
                marginTop: '25px', 
                padding: '15px', 
                backgroundColor: '#fff3cd', 
                borderRadius: '8px',
                fontSize: '13px',
                color: '#856404'
              }}>
                <strong>Note:</strong> The code expires in 10 minutes. Check your spam folder if you don't see the email.
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-logo">
              <img src="/logo.png" alt="Logo" className="auth-logo-image" />
            </div>
            <h1>Create Account</h1>
            <p>Join us today</p>
          </div>

          {success && <div className="alert alert-success">{success}</div>}
          {errors.submit && <div className="alert alert-error">{errors.submit}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <div className="input-wrapper">
                <span className="input-icon input-icon-left">
                  <UserIcon />
                </span>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className={`input-with-icon ${errors.name ? 'input-error' : ''}`}
                  disabled={loading}
                />
              </div>
              {errors.name && <span className="error-text">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <div className="input-wrapper">
                <span className="input-icon input-icon-left">
                  <MailIcon />
                </span>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className={`input-with-icon ${errors.email ? 'input-error' : ''}`}
                  disabled={loading}
                />
              </div>
              {errors.email && <span className="error-text">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <span className="input-icon input-icon-left">
                  <LockIcon />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={`input-with-icon input-with-right-icon ${errors.password ? 'input-error' : ''}`}
                  disabled={loading}
                />
                <button
                  type="button"
                  className="input-icon input-icon-right password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
              {errors.password && <span className="error-text">{errors.password}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <div className="input-wrapper">
                <span className="input-icon input-icon-left">
                  <LockIcon />
                </span>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={`input-with-icon input-with-right-icon ${errors.confirmPassword ? 'input-error' : ''}`}
                  disabled={loading}
                />
                <button
                  type="button"
                  className="input-icon input-icon-right password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
              {errors.confirmPassword && (
                <span className="error-text">{errors.confirmPassword}</span>
              )}
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              <span className="btn-arrow"><ArrowRightIcon /></span>
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Already have an account?{' '}
              <Link to="/login" className="link">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
