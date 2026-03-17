import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './AdminFeedback.css';

function StarRating({ value }) {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <span
          key={s}
          style={{
            fontSize: 14,
            color: s <= value ? '#fbbf24' : '#e5e7eb',
          }}
        >
          ★
        </span>
      ))}
    </div>
  );
}

function AdminFeedback() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/feedback/admin/all');
      setFeedbacks(res.data.feedback);
      setStats(res.data.stats);
    } catch (err) {
      console.error('Failed to fetch feedback:', err);
      alert('Failed to load feedback');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, []);

  const handleMarkAsReviewed = async (id) => {
    try {
      const res = await api.put(`/api/feedback/admin/${id}/review`);
      setFeedbacks((prev) =>
        prev.map((f) =>
          f._id === id ? { ...f, isReviewed: res.data.feedback.isReviewed } : f
        )
      );
      alert('Feedback marked as reviewed');
    } catch (err) {
      alert('Failed to update feedback');
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const res = await api.put(`/api/feedback/admin/${id}/status`, {
        status: newStatus,
      });
      setFeedbacks((prev) =>
        prev.map((f) => (f._id === id ? res.data.feedback : f))
      );
      alert('Status updated successfully');
      // Refresh stats
      fetchFeedback();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this feedback permanently?')) return;
    try {
      await api.delete(`/api/feedback/admin/${id}`);
      setFeedbacks((prev) => prev.filter((f) => f._id !== id));
      alert('Feedback deleted successfully');
      // Refresh stats
      fetchFeedback();
    } catch (err) {
      alert('Failed to delete feedback');
    }
  };

  const filtered = feedbacks.filter((f) => {
    const q = search.toLowerCase();
    const matchSearch =
      f.userName?.toLowerCase().includes(q) ||
      f.userEmail?.toLowerCase().includes(q) ||
      f.message?.toLowerCase().includes(q) ||
      f.title?.toLowerCase().includes(q);

    const matchRating = ratingFilter === 'all' || f.rating == ratingFilter;
    const matchStatus = statusFilter === 'all' || f.status === statusFilter;

    return matchSearch && matchRating && matchStatus;
  });

  if (loading) {
    return (
      <div className="admin-feedback-page">
        <div className="feedback-container">
          <div className="loading-spinner">Loading feedback...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-feedback-page">
      <div className="feedback-container">
        {/* Header */}
        <div className="page-header">
          <h1>Feedback Management</h1>
          <p>Monitor and manage user feedback</p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{stats.totalFeedback}</div>
              <div className="stat-label">Total Feedback</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.averageRating}</div>
              <div className="stat-label">Average Rating</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.totalReviewed}</div>
              <div className="stat-label">Reviewed</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">
                {stats.totalFeedback - stats.totalReviewed}
              </div>
              <div className="stat-label">Pending Review</div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="filters-section">
          <div className="filter-group">
            <input
              type="text"
              placeholder="Search by name, email, or message..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filter-group">
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>

          <div className="filter-group">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="reviewed">Reviewed</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        </div>

        {/* Feedback List */}
        <div className="feedback-list-section">
          <h2 className="section-title">
            Feedback ({filtered.length})
          </h2>

          {filtered.length === 0 ? (
            <div className="no-data">
              <p>No feedback found</p>
            </div>
          ) : (
            <div className="feedback-cards">
              {filtered.map((feedback) => (
                <div key={feedback._id} className="feedback-card">
                  <div className="feedback-card-header">
                    <div className="feedback-user-info">
                      <h3>{feedback.userName}</h3>
                      <p>{feedback.userEmail}</p>
                    </div>
                    <div className="feedback-rating">
                      <StarRating value={feedback.rating} />
                      <span className="rating-text">{feedback.rating}/5</span>
                    </div>
                  </div>

                  {feedback.title && (
                    <h4 className="feedback-title">{feedback.title}</h4>
                  )}

                  <p className="feedback-message">{feedback.message}</p>

                  <div className="feedback-meta">
                    <span className="meta-date">
                      {new Date(feedback.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    <span
                      className={`status-badge status-${feedback.status}`}
                    >
                      {feedback.status === 'pending' && 'Pending'}
                      {feedback.status === 'reviewed' && 'Reviewed'}
                      {feedback.status === 'resolved' && 'Resolved'}
                    </span>
                  </div>

                  <div className="feedback-actions">
                    {!feedback.isReviewed && (
                      <button
                        onClick={() => handleMarkAsReviewed(feedback._id)}
                        className="btn-primary"
                      >
                        Mark as Reviewed
                      </button>
                    )}

                    <select
                      value={feedback.status}
                      onChange={(e) =>
                        handleUpdateStatus(feedback._id, e.target.value)
                      }
                      className="status-select"
                    >
                      <option value="pending">Pending</option>
                      <option value="reviewed">Reviewed</option>
                      <option value="resolved">Resolved</option>
                    </select>

                    <button
                      onClick={() => handleDelete(feedback._id)}
                      className="btn-danger"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminFeedback;
