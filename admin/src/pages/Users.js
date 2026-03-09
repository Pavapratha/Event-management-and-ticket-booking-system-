import React, { useState, useEffect } from 'react';
import api from '../services/api';

function UserBookingsModal({ user, onClose }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/api/admin/users/${user._id}/bookings`)
      .then((res) => setBookings(res.data.bookings))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user._id]);

  const fmt = (v) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v);

  const badgeClass = (s) =>
    ({ confirmed: 'badge-success', pending: 'badge-warning', cancelled: 'badge-danger' }[s] || 'badge-gray');

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 700 }}>
        <div className="modal-header">
          <span className="modal-title">Bookings — {user.name}</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body" style={{ padding: 0 }}>
          {loading ? (
            <div style={{ padding: 40, textAlign: 'center' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
          ) : bookings.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🎟️</div>
              <div className="empty-state-text">No bookings yet</div>
            </div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Booking ID</th>
                    <th>Event</th>
                    <th>Qty</th>
                    <th>Total</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b) => (
                    <tr key={b._id}>
                      <td>
                        <span style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--primary)', fontWeight: 600 }}>
                          {b.bookingId}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 500, fontSize: 13 }}>{b.eventId?.title || 'N/A'}</div>
                        <div style={{ fontSize: 11, color: 'var(--gray-500)' }}>
                          {b.eventId?.date ? new Date(b.eventId.date).toLocaleDateString() : ''}
                        </div>
                      </td>
                      <td style={{ textAlign: 'center' }}>{b.ticketQuantity}</td>
                      <td style={{ fontWeight: 600 }}>{fmt(b.totalAmount)}</td>
                      <td style={{ fontSize: 12 }}>{new Date(b.createdAt).toLocaleDateString()}</td>
                      <td><span className={`badge ${badgeClass(b.status)}`}>{b.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/api/admin/users');
      setUsers(res.data.users || []);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    
    // Auto-refresh users every 30 seconds
    const interval = setInterval(fetchUsers, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleBlock = async (userId) => {
    try {
      await api.put(`/api/admin/users/${userId}/block`);
      // Refresh users list after blocking/unblocking
      await fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update user');
    }
  };

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  const blocked = users.filter((u) => u.isBlocked).length;
  const verified = users.filter((u) => u.isVerified).length;

  if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Users Management</h1>
          <p className="page-subtitle">{users.length} registered users</p>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 24 }}>
        <div className="stat-card" style={{ borderLeftColor: '#ff6b00' }}>
          <div className="stat-icon" style={{ background: '#fff3e8', fontSize: 22 }}>👥</div>
          <div className="stat-info">
            <div className="stat-value">{users.length}</div>
            <div className="stat-label">Total Users</div>
          </div>
        </div>
        <div className="stat-card" style={{ borderLeftColor: '#10b981' }}>
          <div className="stat-icon" style={{ background: '#d1fae5', fontSize: 22 }}>✅</div>
          <div className="stat-info">
            <div className="stat-value">{verified}</div>
            <div className="stat-label">Verified</div>
          </div>
        </div>
        <div className="stat-card" style={{ borderLeftColor: '#f59e0b' }}>
          <div className="stat-icon" style={{ background: '#fef3c7', fontSize: 22 }}>⏳</div>
          <div className="stat-info">
            <div className="stat-value">{users.length - verified}</div>
            <div className="stat-label">Unverified</div>
          </div>
        </div>
        <div className="stat-card" style={{ borderLeftColor: '#ef4444' }}>
          <div className="stat-icon" style={{ background: '#fee2e2', fontSize: 22 }}>🚫</div>
          <div className="stat-info">
            <div className="stat-value">{blocked}</div>
            <div className="stat-label">Blocked</div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">All Users</span>
          <input
            type="text"
            className="form-control"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 240 }}
          />
        </div>
        <div className="table-container">
          {filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">👥</div>
              <div className="empty-state-text">No users found</div>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Verified</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((user) => (
                  <tr key={user._id} style={{ opacity: user.isBlocked ? 0.65 : 1 }}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 36, height: 36, borderRadius: '50%',
                          background: user.isBlocked ? 'var(--gray-400)' : 'var(--primary)',
                          color: 'white', display: 'flex', alignItems: 'center',
                          justifyContent: 'center', fontWeight: 700, fontSize: 14, flexShrink: 0,
                        }}>
                          {user.name?.[0]?.toUpperCase() || '?'}
                        </div>
                        <span style={{ fontWeight: 500 }}>{user.name}</span>
                      </div>
                    </td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`badge ${user.isVerified ? 'badge-success' : 'badge-warning'}`}>
                        {user.isVerified ? '✓ Verified' : 'Pending'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${user.isBlocked ? 'badge-danger' : 'badge-success'}`}>
                        {user.isBlocked ? '🚫 Blocked' : '✓ Active'}
                      </span>
                    </td>
                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          className="btn btn-sm btn-outline"
                          onClick={() => setSelectedUser(user)}
                          title="View booking history"
                        >
                          🎟️ History
                        </button>
                        <button
                          className={`btn btn-sm ${user.isBlocked ? 'btn-success' : 'btn-danger'}`}
                          onClick={() => handleBlock(user._id)}
                          title={user.isBlocked ? 'Unblock user' : 'Block user'}
                        >
                          {user.isBlocked ? '✓ Unblock' : '🚫 Block'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {selectedUser && (
        <UserBookingsModal user={selectedUser} onClose={() => setSelectedUser(null)} />
      )}
    </div>
  );
}

export default Users;
