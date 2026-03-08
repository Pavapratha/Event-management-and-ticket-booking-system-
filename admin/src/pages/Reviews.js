import React, { useState, useEffect } from 'react';
import api from '../services/api';

function StarRating({ value }) {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} style={{ fontSize: 14, color: s <= value ? '#f59e0b' : '#d1d5db' }}>★</span>
      ))}
    </div>
  );
}

function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [visibilityFilter, setVisibilityFilter] = useState('all');

  const fetchReviews = async () => {
    try {
      const res = await api.get('/api/admin/reviews');
      setReviews(res.data.reviews);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReviews(); }, []);

  const handleToggle = async (id) => {
    try {
      const res = await api.put(`/api/admin/reviews/${id}/toggle`);
      setReviews((prev) =>
        prev.map((r) => r._id === id ? { ...r, isHidden: res.data.review.isHidden } : r)
      );
    } catch (err) {
      alert('Failed to update review visibility');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this review permanently?')) return;
    try {
      await api.delete(`/api/admin/reviews/${id}`);
      setReviews((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      alert('Failed to delete review');
    }
  };

  const filtered = reviews.filter((r) => {
    const q = search.toLowerCase();
    const matchSearch =
      r.userId?.name?.toLowerCase().includes(q) ||
      r.eventId?.title?.toLowerCase().includes(q) ||
      r.comment?.toLowerCase().includes(q);
    const matchRating = ratingFilter === 'all' || r.rating === parseInt(ratingFilter);
    const matchVis =
      visibilityFilter === 'all' ||
      (visibilityFilter === 'visible' && !r.isHidden) ||
      (visibilityFilter === 'hidden' && r.isHidden);
    return matchSearch && matchRating && matchVis;
  });

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : 0;
  const hidden = reviews.filter((r) => r.isHidden).length;
  const fiveStar = reviews.filter((r) => r.rating === 5).length;

  if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Reviews & Feedback</h1>
          <p className="page-subtitle">{reviews.length} total reviews</p>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 24 }}>
        <div className="stat-card" style={{ borderLeftColor: '#f59e0b' }}>
          <div className="stat-icon" style={{ background: '#fef3c7', fontSize: 22 }}>⭐</div>
          <div className="stat-info">
            <div className="stat-value">{avgRating}</div>
            <div className="stat-label">Avg Rating</div>
          </div>
        </div>
        <div className="stat-card" style={{ borderLeftColor: '#ff6b00' }}>
          <div className="stat-icon" style={{ background: '#fff3e8', fontSize: 22 }}>💬</div>
          <div className="stat-info">
            <div className="stat-value">{reviews.length}</div>
            <div className="stat-label">Total Reviews</div>
          </div>
        </div>
        <div className="stat-card" style={{ borderLeftColor: '#10b981' }}>
          <div className="stat-icon" style={{ background: '#d1fae5', fontSize: 22 }}>🌟</div>
          <div className="stat-info">
            <div className="stat-value">{fiveStar}</div>
            <div className="stat-label">5-Star Reviews</div>
          </div>
        </div>
        <div className="stat-card" style={{ borderLeftColor: '#6b7280' }}>
          <div className="stat-icon" style={{ background: '#f3f4f6', fontSize: 22 }}>🙈</div>
          <div className="stat-info">
            <div className="stat-value">{hidden}</div>
            <div className="stat-label">Hidden Reviews</div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header" style={{ gap: 12, flexWrap: 'wrap' }}>
          <span className="card-title">All Reviews</span>
          <div style={{ display: 'flex', gap: 10, marginLeft: 'auto', flexWrap: 'wrap' }}>
            <select
              className="form-control"
              style={{ width: 130 }}
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
            >
              <option value="all">All Ratings</option>
              {[5, 4, 3, 2, 1].map((r) => (
                <option key={r} value={r}>{'★'.repeat(r)} ({r} star)</option>
              ))}
            </select>
            <select
              className="form-control"
              style={{ width: 130 }}
              value={visibilityFilter}
              onChange={(e) => setVisibilityFilter(e.target.value)}
            >
              <option value="all">All</option>
              <option value="visible">Visible</option>
              <option value="hidden">Hidden</option>
            </select>
            <input
              type="text"
              className="form-control"
              placeholder="Search reviews..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: 200 }}
            />
          </div>
        </div>

        <div className="table-container">
          {filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">⭐</div>
              <div className="empty-state-text">No reviews found</div>
              <div className="empty-state-hint">Reviews submitted by users on booked events will appear here.</div>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Reviewer</th>
                  <th>Event</th>
                  <th>Rating</th>
                  <th>Comment</th>
                  <th>Date</th>
                  <th>Visibility</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r._id} style={{ opacity: r.isHidden ? 0.6 : 1 }}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: '50%', background: 'var(--primary)',
                          color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 13, fontWeight: 700, flexShrink: 0,
                        }}>
                          {r.userId?.name?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <div style={{ fontWeight: 500, fontSize: 13 }}>{r.userId?.name || 'Unknown'}</div>
                          <div style={{ fontSize: 11, color: 'var(--gray-500)' }}>{r.userId?.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontSize: 13, fontWeight: 500 }}>{r.eventId?.title || 'N/A'}</td>
                    <td><StarRating value={r.rating} /></td>
                    <td style={{ maxWidth: 280 }}>
                      <div style={{ fontSize: 13, color: 'var(--gray-700)', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                        {r.comment?.length > 100 ? r.comment.slice(0, 100) + '…' : r.comment}
                      </div>
                    </td>
                    <td style={{ fontSize: 13 }}>{new Date(r.createdAt).toLocaleDateString()}</td>
                    <td>
                      <span className={`badge ${r.isHidden ? 'badge-gray' : 'badge-success'}`}>
                        {r.isHidden ? 'Hidden' : 'Visible'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          className={`btn btn-sm ${r.isHidden ? 'btn-success' : 'btn-secondary'}`}
                          onClick={() => handleToggle(r._id)}
                          title={r.isHidden ? 'Show review' : 'Hide review'}
                        >
                          {r.isHidden ? '👁️' : '🙈'}
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(r._id)}
                          title="Delete review"
                        >
                          🗑️
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
    </div>
  );
}

export default Reviews;
