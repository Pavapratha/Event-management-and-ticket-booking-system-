import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { formatLkr } from '../utils/currency';

function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const navigate = useNavigate();

  const fetchBookings = async () => {
    try {
      const res = await api.get('/api/admin/bookings');
      setBookings(res.data.bookings || []);
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
    
    // Auto-refresh bookings every 20 seconds
    const interval = setInterval(fetchBookings, 20000);
    return () => clearInterval(interval);
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this booking?')) return;
    try {
      await api.put(`/api/admin/bookings/${id}/cancel`);
      // Refresh bookings after cancellation
      await fetchBookings();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel');
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await api.put(`/api/admin/bookings/${id}/status`, { status });
      // Refresh bookings after status change
      await fetchBookings();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  const filtered = bookings.filter((b) => {
    const matchSearch =
      b.bookingId?.toLowerCase().includes(search.toLowerCase()) ||
      b.userId?.name?.toLowerCase().includes(search.toLowerCase()) ||
      b.eventId?.title?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || b.status === statusFilter;
    return matchSearch && matchStatus;
  });

  if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Booking Management</h1>
          <p className="page-subtitle">{bookings.length} total bookings</p>
        </div>
      </div>

      <div className="card">
        <div className="card-header" style={{ gap: 12, flexWrap: 'wrap' }}>
          <span className="card-title">All Bookings</span>
          <div style={{ display: 'flex', gap: 10, marginLeft: 'auto', flexWrap: 'wrap' }}>
            <select
              className="form-control"
              style={{ width: 140 }}
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
              placeholder="Search..."
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
              <div className="empty-state-text">No bookings found</div>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th>User</th>
                  <th>Event</th>
                  <th>Qty</th>
                  <th>Total</th>
                  <th>Booking Date</th>
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
                    </td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{booking.userId?.name || 'Unknown'}</div>
                      <div style={{ fontSize: 11, color: 'var(--gray-500)' }}>{booking.userId?.email}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{booking.eventId?.title || 'N/A'}</div>
                      <div style={{ fontSize: 11, color: 'var(--gray-500)' }}>
                        {booking.eventId?.date ? new Date(booking.eventId.date).toLocaleDateString() : ''}
                      </div>
                    </td>
                    <td style={{ textAlign: 'center' }}>{booking.ticketQuantity}</td>
                    <td style={{ fontWeight: 600 }}>{formatLkr(booking.totalAmount)}</td>
                    <td>{new Date(booking.createdAt).toLocaleDateString()}</td>
                    <td>
                      <select
                        className="form-control"
                        style={{ width: 120, padding: '4px 8px', fontSize: 12 }}
                        value={booking.status}
                        onChange={(e) => handleStatusChange(booking._id, e.target.value)}
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          className="btn btn-sm btn-outline"
                          onClick={() => navigate(`/admin/bookings/${booking._id}`)}
                          title="View Details"
                        >
                          👁️
                        </button>
                        {booking.status !== 'cancelled' && (
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleCancel(booking._id)}
                            title="Cancel Booking"
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

export default Bookings;
