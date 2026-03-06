import React, { useState, useEffect } from 'react';
import api from '../services/api';

const NOTIFICATION_TYPES = [
  { value: 'general', label: 'General' },
  { value: 'event_reminder', label: 'Event Reminder' },
  { value: 'booking_confirmation', label: 'Booking Confirmation' },
  { value: 'event_update', label: 'Event Update' },
  { value: 'cancellation', label: 'Cancellation' },
];

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: '',
    message: '',
    type: 'general',
    userId: '',
    targetAll: true,
  });
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const fetchData = async () => {
    try {
      const [notifRes, usersRes] = await Promise.all([
        api.get('/api/admin/notifications'),
        api.get('/api/admin/users'),
      ]);
      setNotifications(notifRes.data.notifications);
      setUsers(usersRes.data.users);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this notification?')) return;
    try {
      await api.delete(`/api/admin/notifications/${id}`);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
    } catch (err) {
      alert('Failed to delete');
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!form.title || !form.message) {
      setError('Title and message are required');
      return;
    }
    setSending(true);
    setError('');
    try {
      const payload = {
        title: form.title,
        message: form.message,
        type: form.type,
        targetAll: form.targetAll,
        userId: !form.targetAll ? form.userId : undefined,
      };
      const res = await api.post('/api/admin/notifications', payload);
      setSuccess(res.data.message || 'Notification sent!');
      setForm({ title: '', message: '', type: 'general', userId: '', targetAll: true });
      setShowForm(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send');
    } finally {
      setSending(false);
    }
  };

  const getTypeBadge = (type) => {
    const map = {
      event_reminder: 'badge-info',
      booking_confirmation: 'badge-success',
      event_update: 'badge-warning',
      general: 'badge-gray',
      cancellation: 'badge-danger',
    };
    return map[type] || 'badge-gray';
  };

  if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Notifications</h1>
          <p className="page-subtitle">{notifications.length} notifications total</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? '✕ Close' : '+ Send Notification'}
        </button>
      </div>

      {success && <div className="alert alert-success">{success}</div>}

      {/* Send Form */}
      {showForm && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-header">
            <span className="card-title">Send Notification</span>
          </div>
          <div className="card-body">
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={handleSend}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Title *</label>
                  <input
                    className="form-control"
                    placeholder="Notification title"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Type</label>
                  <select
                    className="form-control"
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                  >
                    {NOTIFICATION_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Message *</label>
                  <textarea
                    className="form-control"
                    placeholder="Notification message"
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Target</label>
                  <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14 }}>
                      <input
                        type="radio"
                        checked={form.targetAll}
                        onChange={() => setForm({ ...form, targetAll: true, userId: '' })}
                      />
                      All Users
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14 }}>
                      <input
                        type="radio"
                        checked={!form.targetAll}
                        onChange={() => setForm({ ...form, targetAll: false })}
                      />
                      Specific User
                    </label>
                  </div>
                </div>
                {!form.targetAll && (
                  <div className="form-group">
                    <label className="form-label">Select User</label>
                    <select
                      className="form-control"
                      value={form.userId}
                      onChange={(e) => setForm({ ...form, userId: e.target.value })}
                    >
                      <option value="">Choose a user...</option>
                      {users.map((u) => (
                        <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
              <div style={{ marginTop: 8 }}>
                <button type="submit" className="btn btn-primary" disabled={sending}>
                  {sending ? <><span className="btn-spinner"></span> Sending...</> : '📤 Send Notification'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Notifications Table */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">All Notifications</span>
        </div>
        <div className="table-container">
          {notifications.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🔔</div>
              <div className="empty-state-text">No notifications sent yet</div>
              <p className="empty-state-hint">
                <button className="btn btn-primary btn-sm" style={{ marginTop: 12 }} onClick={() => setShowForm(true)}>
                  Send your first notification
                </button>
              </p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Message</th>
                  <th>Type</th>
                  <th>Recipient</th>
                  <th>Sent At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {notifications.map((n) => (
                  <tr key={n._id}>
                    <td style={{ fontWeight: 600 }}>{n.title}</td>
                    <td style={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {n.message}
                    </td>
                    <td>
                      <span className={`badge ${getTypeBadge(n.type)}`}>
                        {n.type?.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td>
                      {n.userId ? (
                        <div>
                          <div style={{ fontWeight: 500, fontSize: 13 }}>{n.userId.name}</div>
                          <div style={{ fontSize: 11, color: 'var(--gray-500)' }}>{n.userId.email}</div>
                        </div>
                      ) : (
                        <span className="badge badge-primary">All Users</span>
                      )}
                    </td>
                    <td>{new Date(n.createdAt).toLocaleDateString()}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(n._id)}
                        title="Delete"
                      >
                        🗑️
                      </button>
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

export default Notifications;
