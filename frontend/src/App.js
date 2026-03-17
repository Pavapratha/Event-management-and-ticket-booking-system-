import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { BookingProvider } from './context/BookingContext';
import { useAuth } from './hooks/useAuth';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { EmailVerification } from './pages/EmailVerification';
import { ResendVerification } from './pages/ResendVerification';
import { Dashboard } from './pages/Dashboard';
import { Events } from './pages/Events';
import { EventDetails } from './pages/EventDetails';
import { Home } from './pages/Home';
import { MyTickets } from './pages/MyTickets';
import { Notifications } from './pages/Notifications';
import Feedback from './pages/Feedback';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import './styles/index.css';

// Layout wrapper for public pages
const PublicLayout = ({ children, showFooter = true }) => {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      {showFooter && <Footer />}
    </>
  );
};

// Layout wrapper for protected pages
const ProtectedLayout = ({ children }) => {
  return (
    <>
      <Navbar />
      <main>{children}</main>
    </>
  );
};

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route 
        path="/" 
        element={
          <PublicLayout>
            <Home />
          </PublicLayout>
        } 
      />
      <Route 
        path="/events" 
        element={
          <PublicLayout>
            <Events />
          </PublicLayout>
        } 
      />
      <Route 
        path="/events/:id" 
        element={
          <PublicLayout>
            <EventDetails />
          </PublicLayout>
        } 
      />
      
      {/* Auth Routes (redirect if logged in) */}
      <Route 
        path="/login" 
        element={
          user ? <Navigate to="/dashboard" /> : (
            <PublicLayout showFooter={false}>
              <Login />
            </PublicLayout>
          )
        } 
      />
      <Route 
        path="/register" 
        element={
          user ? <Navigate to="/dashboard" /> : (
            <PublicLayout showFooter={false}>
              <Register />
            </PublicLayout>
          )
        } 
      />
      <Route 
        path="/verify-email" 
        element={
          <PublicLayout showFooter={false}>
            <EmailVerification />
          </PublicLayout>
        }
      />
      <Route 
        path="/resend-verification" 
        element={
          <PublicLayout showFooter={false}>
            <ResendVerification />
          </PublicLayout>
        }
      />
      
      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <ProtectedLayout>
              <Dashboard />
            </ProtectedLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/tickets"
        element={
          <ProtectedRoute>
            <ProtectedLayout>
              <MyTickets />
            </ProtectedLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <ProtectedLayout>
              <Notifications />
            </ProtectedLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/feedback"
        element={
          <ProtectedRoute>
            <ProtectedLayout>
              <Feedback />
            </ProtectedLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-tickets"
        element={<Navigate to="/tickets" />}
      />
      
      {/* Catch all - redirect to home */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <BookingProvider>
          <AppRoutes />
        </BookingProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
