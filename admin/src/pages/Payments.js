import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import api from '../services/api';

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function Payments() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    api.get('/api/admin/payments')
      .then((res) => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;

  const { payments = [], stats = {} } = data || {};

  const filtered = payments.filter((p) => {
    const q = search.toLowerCase();
    const match =
      p.bookingId?.toLowerCase().includes(q) ||
      p.userId?.name?.toLowerCase().includes(q) ||
      p.userId?.email?.toLowerCase().includes(q) ||
      p.eventId?.title?.toLowerCase().includes(q);
    return match && (statusFilter === 'all' || p.status === statusFilter);
  });

  // Build monthly chart data from payments
  const monthlyMap = {};
  payments.forEach((p) => {
    if (p.status === 'cancelled') return;
    const d = new Date(p.createdAt);
    const key = MONTH_NAMES[d.getMonth()] + ' ' + d.getFullYear();
    if (!monthlyMap[key]) monthlyMap[key] = { month: key, revenue: 0, count: 0 };
    monthlyMap[key].revenue += p.totalAmount || 0;
    monthlyMap[key].count += 1;
  });
  const chartData = Object.values(monthlyMap).slice(-6);

  const fmt = (v) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v);
  const fmtFull = (v) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v);

  const badgeClass = (s) =>
    ({ confirmed: 'badge-success', pending: 'badge-warning', cancelled: 'badge-danger' }[s] || 'badge-gray');

  const statusLabel = (s) =>
    ({ confirmed: 'Paid', pending: 'Pending', cancelled: 'Refunded' }[s] || s);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Payment Management</h1>
          <p className="page-subtitle">Track all transactions and revenue</p>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 24 }}>
        <div className="stat-card" style={{ borderLeftColor: '#ff6b00' }}>
          <div className="stat-icon" style={{ background: '#fff3e8', fontSize: 22 }}>💰</div>
          <div className="stat-info">
            <div className="stat-value" style={{ fontSize: 20 }}>{fmt(stats.totalRevenue || 0)}</div>
            <div className="stat-label">Total Revenue</div>
          </div>
        </div>
        <div className="stat-card" style={{ borderLeftColor: '#10b981' }}>
          <div className="stat-icon" style={{ background: '#d1fae5', fontSize: 22 }}>✅</div>
          <div className="stat-info">
            <div className="stat-value">{stats.completedCount || 0}</div>
            <div className="stat-label">Completed ({fmt(stats.completedRevenue || 0)})</div>
          </div>
        </div>
        <div className="stat-card" style={{ borderLeftColor: '#f59e0b' }}>
          <div className="stat-icon" style={{ background: '#fef3c7', fontSize: 22 }}>⏳</div>
          <div className="stat-info">
            <div className="stat-value">{stats.pendingCount || 0}</div>
            <div className="stat-label">Pending ({fmt(stats.pendingRevenue || 0)})</div>
          </div>
        </div>
        <div className="stat-card" style={{ borderLeftColor: '#ef4444' }}>
          <div className="stat-icon" style={{ background: '#fee2e2', fontSize: 22 }}>↩️</div>
          <div className="stat-info">
            <div className="stat-value">{stats.cancelledCount || 0}</div>
            <div className="stat-label">Cancelled / Refunded</div>
          </div>
        </div>
      </div>

      {/* Revenue Chart */}
      {chartData.length > 0 && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-header">
            <span className="card-title">Monthly Revenue</span>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData} margin={{ top: 5, left: 5, right: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `$${v}`} />
                <Tooltip formatter={(v) => fmt(v)} />
                <Bar dataKey="revenue" radius={[4, 4, 0, 0]} name="Revenue">
                  {chartData.map((_, i) => (
                    <Cell key={i} fill={i === chartData.length - 1 ? '#ff6b00' : '#ffb380'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Transactions Table */}
      <div className="card">
        <div className="card-header" style={{ gap: 12, flexWrap: 'wrap' }}>
          <span className="card-title">Transaction History</span>
          <div style={{ display: 'flex', gap: 10, marginLeft: 'auto', flexWrap: 'wrap' }}>
            <select
              className="form-control"
              style={{ width: 150 }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="confirmed">Paid</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Refunded</option>
            </select>
            <input
              type="text"
              className="form-control"
              placeholder="Search transactions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: 220 }}
            />
          </div>
        </div>
        <div className="table-container">
          {filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">💳</div>
              <div className="empty-state-text">No transactions found</div>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Transaction ID</th>
                  <th>Customer</th>
                  <th>Event</th>
                  <th>Tickets</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p._id}>
                    <td>
                      <span style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 600, color: 'var(--primary)' }}>
                        {p.bookingId}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 500, fontSize: 13 }}>{p.userId?.name || 'Unknown'}</div>
                      <div style={{ fontSize: 11, color: 'var(--gray-500)' }}>{p.userId?.email}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 500, fontSize: 13 }}>{p.eventId?.title || 'N/A'}</div>
                      <div style={{ fontSize: 11, color: 'var(--gray-500)' }}>
                        {p.eventId?.date ? new Date(p.eventId.date).toLocaleDateString() : ''}
                      </div>
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: 600 }}>{p.ticketQuantity}</td>
                    <td style={{ fontWeight: 700, color: 'var(--gray-900)' }}>
                      {fmtFull(p.totalAmount || 0)}
                    </td>
                    <td>
                      <span className="badge badge-info">Online</span>
                    </td>
                    <td style={{ fontSize: 13 }}>
                      {new Date(p.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <span className={`badge ${badgeClass(p.status)}`}>
                        {statusLabel(p.status)}
                      </span>
                    </td>
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

export default Payments;
