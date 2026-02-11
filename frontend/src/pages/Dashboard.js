import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { PageContainer, Section, Card } from '../components/Layout';
import '../styles/Dashboard.css';

export const Dashboard = () => {
  const { user } = useAuth();

  return (
    <PageContainer>
      <Section>
        <div className="dashboard-welcome">
          <h1>Welcome back, {user?.name}!</h1>
          <p className="dashboard-subtitle">Here's what's happening with your account</p>
        </div>

        <div className="dashboard-grid">
          <Card className="dashboard-card user-card">
            <div className="card-icon">👤</div>
            <h3>Your Profile</h3>
            <div className="user-info">
              <p><strong>Name:</strong> {user?.name}</p>
              <p><strong>Email:</strong> {user?.email}</p>
            </div>
          </Card>

          <Card className="dashboard-card">
            <div className="card-icon">🎫</div>
            <h3>My Tickets</h3>
            <p className="card-stat">0</p>
            <p className="card-label">Active tickets</p>
          </Card>

          <Card className="dashboard-card">
            <div className="card-icon">📅</div>
            <h3>Upcoming Events</h3>
            <p className="card-stat">0</p>
            <p className="card-label">Events registered</p>
          </Card>

          <Card className="dashboard-card">
            <div className="card-icon">🔐</div>
            <h3>Account Security</h3>
            <p className="card-label">Your account is secured with encrypted authentication</p>
            <span className="badge badge-success">Secure</span>
          </Card>
        </div>
      </Section>
    </PageContainer>
  );
};
