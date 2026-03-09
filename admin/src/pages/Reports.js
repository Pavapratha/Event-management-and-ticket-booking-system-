import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  LineChart, Line,
} from 'recharts';
import api from '../services/api';

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
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

  const monthlyData = (data?.monthlyRevenue || []).map((m) => ({
    month: MONTH_NAMES[m._id.month - 1] + ' ' + m._id.year,
    revenue: m.revenue,
    bookings: m.bookings,
  }));

  const statusData = (data?.statusBreakdown || []).map((s) => ({
    name: s._id.charAt(0).toUpperCase() + s._id.slice(1),
    value: s.count,
  }));

  const categoryData = (data?.categoryBreakdown || []).map((c) => ({
    name: c._id || 'Other',
    bookings: c.count,
    revenue: c.revenue,
  }));

  const eventData = (data?.bookingsPerEvent || []).slice(0, 8).map((e) => ({
    name: e.eventTitle?.length > 20 ? e.eventTitle.slice(0, 18) + '...' : e.eventTitle,
    tickets: e.totalTickets,
    revenue: e.totalRevenue,
  }));

  const formatCurrency = (val) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Reports & Analytics</h1>
          <p className="page-subtitle">Overview of system performance and revenue</p>
        </div>
      </div>

      {/* Monthly Revenue Chart */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header">
          <span className="card-title">📈 Monthly Revenue & Bookings (Last 6 Months)</span>
        </div>
        <div className="card-body">
          {monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis yAxisId="left" tick={{ fontSize: 12 }} tickFormatter={(v) => `$${v}`} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v, name) => name === 'Revenue' ? formatCurrency(v) : v} />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#ff6b00" strokeWidth={2} name="Revenue" dot={{ r: 4 }} />
                <Line yAxisId="right" type="monotone" dataKey="bookings" stroke="#3b82f6" strokeWidth={2} name="Bookings" dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">📈</div>
              <div className="empty-state-text">No revenue data yet</div>
            </div>
          )}
        </div>
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
        {/* Booking Status */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">🥧 Booking Status Distribution</span>
          </div>
          <div className="card-body">
            {statusData.length > 0 ? (
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
            ) : (
              <div className="empty-state"><div className="empty-state-icon">🥧</div><div className="empty-state-text">No data</div></div>
            )}
          </div>
        </div>

        {/* Category Revenue */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">🏷️ Revenue by Category</span>
          </div>
          <div className="card-body">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={categoryData} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v}`} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={80} />
                  <Tooltip formatter={(v) => formatCurrency(v)} />
                  <Bar dataKey="revenue" fill="#ff6b00" radius={[0, 4, 4, 0]} name="Revenue" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state"><div className="empty-state-icon">🏷️</div><div className="empty-state-text">No data</div></div>
            )}
          </div>
        </div>
      </div>

      {/* Events Performance Table */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header">
          <span className="card-title">🎪 Event Performance</span>
        </div>
        {eventData.length > 0 ? (
          <div className="card-body" style={{ padding: '10px 20px 20px' }}>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={eventData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v}`} />
                <Tooltip formatter={(v, name) => name === 'Revenue' ? formatCurrency(v) : v} />
                <Legend />
                <Bar yAxisId="left" dataKey="tickets" fill="#ff6b00" name="Tickets" radius={[4,4,0,0]} />
                <Bar yAxisId="right" dataKey="revenue" fill="#3b82f6" name="Revenue" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="empty-state"><div className="empty-state-icon">🎪</div><div className="empty-state-text">No event data yet</div></div>
        )}
      </div>

      {/* Event Revenue Table */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">📋 Event-wise Revenue Table</span>
        </div>
        <div className="table-container">
          {(data?.bookingsPerEvent || []).length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📋</div>
              <div className="empty-state-text">No data available</div>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Event</th>
                  <th>Total Bookings</th>
                  <th>Tickets Sold</th>
                  <th>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {(data?.bookingsPerEvent || []).map((e, i) => (
                  <tr key={i}>
                    <td>{i + 1}</td>
                    <td style={{ fontWeight: 600 }}>{e.eventTitle}</td>
                    <td>{e.totalBookings}</td>
                    <td>{e.totalTickets}</td>
                    <td style={{ color: 'var(--primary)', fontWeight: 600 }}>{formatCurrency(e.totalRevenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default Reports;
