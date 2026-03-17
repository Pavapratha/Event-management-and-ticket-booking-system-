import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  LineChart, Line,
} from 'recharts';
import api from '../services/api';
import { formatLkr, formatLkrCompact } from '../utils/currency';

const COLORS = ['#ff6b00','#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#ec4899','#14b8a6'];

function Reports() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    try {
      const res = await api.get('/api/admin/reports');
      setData(res.data);
    } catch (err) {
      console.error('Failed to fetch reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
    
    // Auto-refresh reports every 30 seconds
    const interval = setInterval(fetchReports, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;

  const summary = data?.summary || {};
  const visibility = data?.visibility || {};
  const monthlyData = data?.monthlyPerformance || [];
  const statusData = data?.statusDistribution || [];
  const categoryData = data?.categoryRevenue || [];
  const eventData = (data?.eventPerformance || []).map((event) => ({
    ...event,
    name: event.eventTitle?.length > 20 ? `${event.eventTitle.slice(0, 18)}...` : event.eventTitle,
    tickets: event.totalTickets,
    revenue: event.totalRevenue,
  }));
  const eventRevenueRows = data?.eventRevenueTable || [];
  const showMonthlyPerformance = Boolean(visibility.monthlyPerformance) && monthlyData.some((item) => item.revenue > 0 || item.bookings > 0);
  const showStatusDistribution = Boolean(visibility.statusDistribution) && statusData.length > 0;
  const showCategoryRevenue = Boolean(visibility.categoryRevenue) && categoryData.length > 0;
  const showEventPerformance = Boolean(visibility.eventPerformance) && eventData.length > 0;
  const showEventRevenueTable = Boolean(visibility.eventRevenueTable) && eventRevenueRows.length > 0;
  const hasRenderableSections = [
    showMonthlyPerformance,
    showStatusDistribution,
    showCategoryRevenue,
    showEventPerformance,
    showEventRevenueTable,
  ].some(Boolean);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Reports & Analytics</h1>
          <p className="page-subtitle">Overview of system performance and revenue</p>
        </div>
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 20 }}>
        <div className="stat-card" style={{ borderLeftColor: '#8b5cf6' }}>
          <div className="stat-icon" style={{ background: '#ede9fe', fontSize: 22 }}>💰</div>
          <div className="stat-info">
            <div className="stat-value">{formatLkr(summary.totalRevenue || 0, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</div>
            <div className="stat-label">Total Revenue</div>
          </div>
        </div>
        <div className="stat-card" style={{ borderLeftColor: '#10b981' }}>
          <div className="stat-icon" style={{ background: '#d1fae5', fontSize: 22 }}>🎟️</div>
          <div className="stat-info">
            <div className="stat-value">{summary.totalBookings || 0}</div>
            <div className="stat-label">Total Bookings</div>
          </div>
        </div>
        <div className="stat-card" style={{ borderLeftColor: '#3b82f6' }}>
          <div className="stat-icon" style={{ background: '#dbeafe', fontSize: 22 }}>✅</div>
          <div className="stat-info">
            <div className="stat-value">{summary.completedBookings || 0}</div>
            <div className="stat-label">Completed Bookings</div>
          </div>
        </div>
        <div className="stat-card" style={{ borderLeftColor: '#f59e0b' }}>
          <div className="stat-icon" style={{ background: '#fef3c7', fontSize: 22 }}>🏷️</div>
          <div className="stat-info">
            <div className="stat-value">{summary.topCategory || '—'}</div>
            <div className="stat-label">Top Revenue Category</div>
          </div>
        </div>
      </div>

      {showMonthlyPerformance ? (
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-header">
            <span className="card-title">📈 Monthly Revenue & Bookings (Last 6 Months)</span>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis yAxisId="left" tick={{ fontSize: 12 }} tickFormatter={(v) => formatLkrCompact(v)} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v, name) => name === 'Revenue' ? formatLkr(v) : v} />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#ff6b00" strokeWidth={2} name="Revenue" dot={{ r: 4 }} />
                <Line yAxisId="right" type="monotone" dataKey="bookings" stroke="#3b82f6" strokeWidth={2} name="Bookings" dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : null}

      {showStatusDistribution || showCategoryRevenue ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
          {showStatusDistribution ? (
            <div className="card">
              <div className="card-header">
                <span className="card-title">🥧 Booking Status Distribution</span>
              </div>
              <div className="card-body">
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" outerRadius={90} dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}>
                    {statusData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
              </div>
            </div>
          ) : null}

          {showCategoryRevenue ? (
            <div className="card">
              <div className="card-header">
                <span className="card-title">🏷️ Revenue by Category</span>
              </div>
              <div className="card-body">
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={categoryData} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => formatLkrCompact(v)} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={80} />
                  <Tooltip formatter={(v) => formatLkr(v)} />
                  <Bar dataKey="revenue" fill="#ff6b00" radius={[0, 4, 4, 0]} name="Revenue" />
                </BarChart>
              </ResponsiveContainer>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      {showEventPerformance ? (
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-header">
            <span className="card-title">🎪 Event Performance</span>
          </div>
          <div className="card-body" style={{ padding: '10px 20px 20px' }}>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={eventData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} tickFormatter={(v) => formatLkrCompact(v)} />
                <Tooltip formatter={(v, name) => name === 'Revenue' ? formatLkr(v) : v} />
                <Legend />
                <Bar yAxisId="left" dataKey="tickets" fill="#ff6b00" name="Tickets" radius={[4,4,0,0]} />
                <Bar yAxisId="right" dataKey="revenue" fill="#3b82f6" name="Revenue" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : null}

      {showEventRevenueTable ? (
        <div className="card">
          <div className="card-header">
            <span className="card-title">📋 Event-wise Revenue Table</span>
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Event</th>
                  <th>Category</th>
                  <th>Total Bookings</th>
                  <th>Tickets Sold</th>
                  <th>Occupancy</th>
                  <th>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {eventRevenueRows.map((e, i) => (
                  <tr key={i}>
                    <td>{i + 1}</td>
                    <td style={{ fontWeight: 600 }}>{e.eventTitle}</td>
                    <td>{e.category}</td>
                    <td>{e.totalBookings}</td>
                    <td>{e.totalTickets}</td>
                    <td>{e.occupancyRate}%</td>
                    <td style={{ color: 'var(--primary)', fontWeight: 600 }}>{formatLkr(e.totalRevenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {!hasRenderableSections ? (
        <div className="card">
          <div className="empty-state" style={{ padding: '3rem 1.5rem' }}>
            <div className="empty-state-icon">📊</div>
            <div className="empty-state-text">No report data is available yet.</div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default Reports;
