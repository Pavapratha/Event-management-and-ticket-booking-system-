import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const ProtectedRoute = ({ children }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else if (user.isVerified === false) {
      // Unverified users should go back to verification
      navigate('/resend-verification', { state: { email: user.email } });
    }
  }, [user, navigate]);

  if (!user || user.isVerified === false) {
    return <div>Loading...</div>;
  }

  return children;
};
