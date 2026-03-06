import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import api from '../services/api';
import './Dashboard.css';

const COLORS = ['#ff6b00', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

function StatCard({ icon, label, value, color, bg }) {
  return (
    <div className="stat-card" style={{ borderLeftColor: color }}>
      <div className="stat-icon" style={{ background: bg }}>
        {icon}
      </div>
      <div className="stat-info">
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  );
}

function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/api/admin/dashboard');
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  const { stats, recentBookings, upcomingEvents } = data || {};

  const statusData = [
    { name: 'Confirmed', value: (stats?.totalBookings || 0) - (stats?.cancelledBookings || 0) },
    { name: 'Cancelled', value: stats?.cancelledBookings || 0 },
  ].filter(d => d.value > 0);

  const revenueChartData = recentBookings
    ? Object.values(
        recentBookings.reduce((acc, b) => {
          const date = new Date(b.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          if (!acc[date]) acc[date] = { date, revenue: 0, bookings: 0 };
          acc[date].revenue += b.totalAmount || 0;
          acc[date].bookings += 1;
          return acc;
        }, {})
      ).slice(-7)
    : [];

  const formatCurrency = (val) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  const getStatusBadge = (status) => {
    const map = { confirmed: 'badge-success', pending: 'badge-warning', cancelled: 'badge-danger' };
    return map[status] || 'badge-gray';
  };

  return (
    <div className="dashboard">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Welcome back! Here's what's happening.</p>
        </div>
        <div className="dashboard-date">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <StatCard icon="🎪" label="Total Events" value={stats?.totalEvents || 0} color="#ff6b00" bg="#fff3e8" />
        <StatCard icon="👥" label="Total Users" value={stats?.totalUsers || 0} color="#3b82f6" bg="#dbeafe" />
        <StatCard icon="🎟️" label="Total Bookings" value={stats?.totalBookings || 0} color="#10b981" bg="#d1fae5" />
        <StatCard icon="📦" label="Tickets Sold" value={stats?.ticketsSold || 0} color="#f59e0b" bg="#fef3c7" />
        <StatCard icon="❌" label="Cancelled" value={stats?.cancelledBookings || 0} color="#ef4444" bg="#fee2e2" />
        <StatCard icon="💰" label="Total Revenue" value={formatCurrency(stats?.totalRevenue || 0)} color="#8b5cf6" bg="#ede9fe" />
      </div>

      {/* Charts row */}
      <div className="dashboard-charts">
        <div className="card chart-card">
          <div className="card-header">
            <span className="card-title">Recent Bookings Revenue</span>
          </div>
          <div className="card-body">
            {revenueChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={revenueChartData} margin={{ top: 5, left: 5, right: 5, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v) => formatCurrency(v)} />
                  <Bar dataKey="revenue" fill="#ff6b00" radius={[4, 4, 0, 0]} name="Revenue" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon">📊</div>
                <div className="empty-state-text">No booking data yet</div>
              </div>
            )}
          </div>
        </div>

        <div className="card chart-card">
          <div className="card-header">
            <span className="card-title">Booking Status</span>
          </div>
          <div className="card-body">
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {statusData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon">🥧</div>
                <div className="empty-state-text">No booking data yet</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="dashboard-bottom">
        {/* Recent Bookings */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Recent Bookings</span>
            <Link to="/bookings" className="btn btn-sm btn-outline">View All</Link>
          </div>
          <div className="table-container">
            {recentBookings && recentBookings.length > 0 ? (
              <table>
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Event</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentBookings.slice(0, 8).map((b) => (
                    <tr key={b._id}>
                      <td>
                        <div className="user-cell">
                          <span className="user-avatar-sm">{b.userId?.name?.[0]?.toUpperCase() || '?'}</span>
                          <div>
                            <div style={{ fontWeight: 500 }}>{b.userId?.name || 'Unknown'}</div>
                            <div style={{ fontSize: 11, color: 'var(--gray-500)' }}>{b.userId?.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>{b.eventId?.title || 'N/A'}</td>
                      <td>{formatCurrency(b.totalAmount || 0)}</td>
                      <td>
                        <span className={`badge ${getStatusBadge(b.status)}`}>
                          {b.status}
                        </span>
                      </td>
                      <td>{new Date(b.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon">🎟️</div>
                <div className="empty-state-text">No bookings yet</div>
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="card upcoming-card">
          <div className="card-header">
            <span className="card-title">Upcoming Events</span>
            <Link to="/events" className="btn btn-sm btn-outline">View All</Link>
          </div>
          <div className="card-body upcoming-list">
            {upcomingEvents && upcomingEvents.length > 0 ? (
              upcomingEvents.map((event) => (
                <div key={event._id} className="upcoming-event-item">
                  <div className="upcoming-date">
                    <span className="upcoming-day">
                      {new Date(event.date).toLocaleDateString('en-US', { day: '2-digit' })}
                    </span>
                    <span className="upcoming-month">
                      {new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}
                    </span>
                  </div>
                  <div className="upcoming-info">
                    <div className="upcoming-title">{event.title}</div>
                    <div className="upcoming-meta">
                      <span>📍 {event.location}</span>
                      <span>🎟️ {event.availableSeats} seats</span>
                    </div>
                  </div>
                  <span className="badge badge-success">{event.category}</span>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon">📅</div>
                <div className="empty-state-text">No upcoming events</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
