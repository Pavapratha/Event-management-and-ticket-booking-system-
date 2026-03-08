import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

function Tickets() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const navigate = useNavigate();

  const fetchTickets = async () => {
    try {
      const res = await api.get('/api/admin/bookings');
      setBookings(res.data.bookings);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTickets(); }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this ticket?')) return;
    try {
      await api.put(`/api/admin/bookings/${id}/cancel`);
      setBookings((prev) => prev.map((b) => b._id === id ? { ...b, status: 'cancelled' } : b));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel');
    }
  };

  const filtered = bookings.filter((b) => {
    const q = search.toLowerCase();
    const matchSearch =
      b.bookingId?.toLowerCase().includes(q) ||
      b.userId?.name?.toLowerCase().includes(q) ||
      b.eventId?.title?.toLowerCase().includes(q);
    return matchSearch && (statusFilter === 'all' || b.status === statusFilter);
  });

  const totalTickets = bookings.reduce((s, b) => s + (b.ticketQuantity || 0), 0);
  const soldTickets = bookings
    .filter((b) => b.status !== 'cancelled')
    .reduce((s, b) => s + (b.ticketQuantity || 0), 0);
  const cancelledTickets = bookings
    .filter((b) => b.status === 'cancelled')
    .reduce((s, b) => s + (b.ticketQuantity || 0), 0);
  const pendingTickets = bookings
    .filter((b) => b.status === 'pending')
    .reduce((s, b) => s + (b.ticketQuantity || 0), 0);

  const fmt = (v) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v);

  const badgeClass = (s) =>
    ({ confirmed: 'badge-success', pending: 'badge-warning', cancelled: 'badge-danger' }[s] || 'badge-gray');

  if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Ticket Management</h1>
          <p className="page-subtitle">{totalTickets} total tickets issued across {bookings.length} bookings</p>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 24 }}>
        <div className="stat-card" style={{ borderLeftColor: '#ff6b00' }}>
          <div className="stat-icon" style={{ background: '#fff3e8', fontSize: 22 }}>🎟️</div>
          <div className="stat-info">
            <div className="stat-value">{totalTickets}</div>
            <div className="stat-label">Total Tickets</div>
          </div>
        </div>
        <div className="stat-card" style={{ borderLeftColor: '#10b981' }}>
          <div className="stat-icon" style={{ background: '#d1fae5', fontSize: 22 }}>✅</div>
          <div className="stat-info">
            <div className="stat-value">{soldTickets}</div>
            <div className="stat-label">Active Tickets</div>
          </div>
        </div>
        <div className="stat-card" style={{ borderLeftColor: '#f59e0b' }}>
          <div className="stat-icon" style={{ background: '#fef3c7', fontSize: 22 }}>⏳</div>
          <div className="stat-info">
            <div className="stat-value">{pendingTickets}</div>
            <div className="stat-label">Pending</div>
          </div>
        </div>
        <div className="stat-card" style={{ borderLeftColor: '#ef4444' }}>
          <div className="stat-icon" style={{ background: '#fee2e2', fontSize: 22 }}>❌</div>
          <div className="stat-info">
            <div className="stat-value">{cancelledTickets}</div>
            <div className="stat-label">Cancelled</div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <div className="card-header" style={{ gap: 12, flexWrap: 'wrap' }}>
          <span className="card-title">All Tickets</span>
          <div style={{ display: 'flex', gap: 10, marginLeft: 'auto', flexWrap: 'wrap' }}>
            <select
              className="form-control"
              style={{ width: 150 }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <input
              type="text"
              className="form-control"
              placeholder="Search tickets..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: 220 }}
            />
          </div>
        </div>
        <div className="table-container">
          {filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🎟️</div>
              <div className="empty-state-text">No tickets found</div>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Ticket / Booking ID</th>
                  <th>Customer</th>
                  <th>Event</th>
                  <th>Date</th>
                  <th>Qty</th>
                  <th>Unit Price</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((booking) => (
                  <tr key={booking._id}>
                    <td>
                      <span style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 600, color: 'var(--primary)' }}>
                        {booking.bookingId}
                      </span>
                      <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>
                        {new Date(booking.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: '50%', background: 'var(--primary)',
                          color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 13, fontWeight: 700, flexShrink: 0,
                        }}>
                          {booking.userId?.name?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <div style={{ fontWeight: 500, fontSize: 13 }}>{booking.userId?.name || 'Unknown'}</div>
                          <div style={{ fontSize: 11, color: 'var(--gray-500)' }}>{booking.userId?.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 500, fontSize: 13 }}>{booking.eventId?.title || 'N/A'}</div>
                      <div style={{ fontSize: 11, color: 'var(--gray-500)' }}>
                        {booking.eventId?.location || ''}
                      </div>
                    </td>
                    <td style={{ fontSize: 13 }}>
                      {booking.eventId?.date
                        ? new Date(booking.eventId.date).toLocaleDateString()
                        : '—'}
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: 600 }}>{booking.ticketQuantity}</td>
                    <td style={{ fontSize: 13 }}>
                      {booking.eventId?.price != null ? fmt(booking.eventId.price) : '—'}
                    </td>
                    <td style={{ fontWeight: 600, color: 'var(--gray-900)' }}>
                      {fmt(booking.totalAmount || 0)}
                    </td>
                    <td>
                      <span className={`badge ${badgeClass(booking.status)}`}>{booking.status}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          className="btn btn-sm btn-outline"
                          onClick={() => navigate(`/bookings/${booking._id}`)}
                          title="View Details"
                        >
                          👁️
                        </button>
                        {booking.status !== 'cancelled' && (
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleCancel(booking._id)}
                            title="Cancel Ticket"
                          >
                            ✕
                          </button>
                        )}
                      </div>
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

export default Tickets;
