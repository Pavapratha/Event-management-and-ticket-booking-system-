import React, { createContext, useState, useCallback, useEffect } from 'react';
import { authAPI } from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const register = useCallback(async (name, email, password, confirmPassword) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authAPI.register({
        name,
        email,
        password,
        confirmPassword,
      });
      
      // For unverified registrations, don't auto-login
      // The verification page will handle the verification process
      if (response.data.requiresVerification) {
        return { 
          success: true, 
          requiresVerification: true,
          email: email.toLowerCase(),
          message: response.data.message 
        };
      }
      
      // If somehow token is returned (shouldn't happen with email verification)
      const { token, user } = response.data;
      if (token) {
        localStorage.setItem('token', token);
        setUser(user);
        setAuthChecked(true);
      }
      return { success: true, user };
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authAPI.login({ email, password });
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      setUser(user);
      setAuthChecked(true);
      return { success: true, user };
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setUser(null);
    setError(null);
    setAuthChecked(true);
  }, []);

  const getCurrentUser = useCallback(async () => {
    try {
      const response = await authAPI.getCurrentUser();
      setUser(response.data.user);
      return response.data.user;
    } catch (err) {
      logout();
      return null;
    }
  }, [logout]);

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      setAuthChecked(true);
      return;
    }

    getCurrentUser()
      .catch(() => null)
      .finally(() => {
        setAuthChecked(true);
      });
  }, [getCurrentUser]);

  return (
    <AuthContext.Provider
      value={{
        user,
        authChecked,
        loading,
        error,
        register,
        login,
        logout,
        getCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
