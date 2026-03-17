import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './UserFeedback.css';

const UserFeedback = ({ feedbackSubmitted }) => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [averageRating, setAverageRating] = useState(0);

  useEffect(() => {
    fetchUserFeedback();
  }, [feedbackSubmitted]);

  const fetchUserFeedback = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/feedback/user/my-feedback');
      if (response.data.success) {
        setFeedbacks(response.data.feedback);

        // Calculate average rating
        if (response.data.feedback.length > 0) {
          const avgRating =
            response.data.feedback.reduce((sum, f) => sum + f.rating, 0) /
            response.data.feedback.length;
          setAverageRating(avgRating.toFixed(2));
        }
      }
    } catch (err) {
      setError('Failed to load your feedback');
      console.error('Error fetching feedback:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span
        key={i}
        className={`star ${i < rating ? 'filled' : 'empty'}`}
        title={`${rating} out of 5 stars`}
      >
        ★
      </span>
    ));
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="user-feedback-container">
        <div className="loading">Loading your feedback...</div>
      </div>
    );
  }

  return (
    <div className="user-feedback-container">
      <div className="feedback-header">
        <h3>Your Feedback History</h3>
        {feedbacks.length > 0 && (
          <div className="feedback-stats">
            <span className="stat-item">
              <strong>{feedbacks.length}</strong> feedback(s) submitted
            </span>
            <span className="stat-item">
              Average rating: <strong>{averageRating} ★</strong>
            </span>
          </div>
        )}
      </div>

      {error && <div className="feedback-error">{error}</div>}

      {feedbacks.length === 0 ? (
        <div className="no-feedback">
          <p>You haven't submitted any feedback yet.</p>
          <small>Share your experience to help us improve!</small>
        </div>
      ) : (
        <div className="feedback-list">
          {feedbacks.map((feedback) => (
            <div key={feedback._id} className="feedback-item">
              <div className="feedback-item-header">
                <div className="feedback-rating">
                  <span className="stars">
                    {renderStars(feedback.rating)}
                  </span>
                  <span className="rating-value">{feedback.rating}/5</span>
                </div>
                <div className="feedback-date">
                  {formatDate(feedback.createdAt)}
                </div>
              </div>

              {feedback.title && (
                <h4 className="feedback-title">{feedback.title}</h4>
              )}

              <p className="feedback-message">{feedback.message}</p>

              <div className="feedback-item-footer">
                <span
                  className={`status-badge status-${feedback.status}`}
                >
                  {feedback.status === 'pending' && '⏳ Under Review'}
                  {feedback.status === 'reviewed' && '✓ Reviewed'}
                  {feedback.status === 'resolved' && '✓ Resolved'}
                </span>
                {feedback.isReviewed && (
                  <span className="reviewed-badge">
                    Reviewed by admin
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserFeedback;
