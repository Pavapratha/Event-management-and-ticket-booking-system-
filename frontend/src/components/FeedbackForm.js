import React, { useState } from 'react';
import api from '../services/api';
import './FeedbackForm.css';

const FeedbackForm = ({ onFeedbackSubmitted }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    // Validation
    if (!rating) {
      setError('Please select a rating');
      setLoading(false);
      return;
    }

    if (!message.trim()) {
      setError('Please enter your feedback');
      setLoading(false);
      return;
    }

    if (message.trim().length < 10) {
      setError('Feedback must be at least 10 characters long');
      setLoading(false);
      return;
    }

    try {
      const response = await api.post('/api/feedback', {
        rating,
        title: title.trim(),
        message: message.trim(),
      });

      if (response.data.success) {
        setSuccess(true);
        setRating(0);
        setTitle('');
        setMessage('');

        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccess(false);
          if (onFeedbackSubmitted) {
            onFeedbackSubmitted(response.data.feedback);
          }
        }, 3000);
      } else {
        setError(response.data.message || 'Failed to submit feedback');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Error submitting feedback. Please try again.';
      console.error('Feedback submission error:', errorMsg);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="feedback-form-container">
      <div className="feedback-form-header">
        <h2>Share Your Feedback</h2>
        <p>Help us improve our service by sharing your thoughts and experience</p>
      </div>

      {success && (
        <div className="feedback-success-message">
          ✓ {' '}
          Thank you for your feedback! Your input helps us improve our service.
        </div>
      )}

      {error && (
        <div className="feedback-error-message">
          ⚠ {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="feedback-form">
        {/* Star Rating */}
        <div className="form-group">
          <label>Rating *</label>
          <div className="star-rating">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className={`star ${
                  star <= (hoverRating || rating) ? 'active' : ''
                }`}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                title={`${star} Star${star > 1 ? 's' : ''}`}
              >
                ★
              </button>
            ))}
          </div>
          <div className="rating-text">
            {rating > 0 && <span>{rating} out of 5 stars</span>}
          </div>
        </div>

        {/* Title */}
        <div className="form-group">
          <label htmlFor="title">Feedback Title (Optional)</label>
          <input
            type="text"
            id="title"
            placeholder="e.g., Great Service, Needs Improvement"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={100}
            className="form-input"
          />
          <small className="char-count">{title.length}/100</small>
        </div>

        {/* Message */}
        <div className="form-group">
          <label htmlFor="message">Your Feedback *</label>
          <textarea
            id="message"
            placeholder="Please share your detailed feedback (minimum 10 characters)..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={1000}
            rows={6}
            className="form-textarea"
          />
          <small className="char-count">
            {message.length}/1000 characters ({message.trim().length >= 10 ? '✓' : '✗'})
          </small>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="submit-btn"
        >
          {loading ? 'Submitting...' : 'Submit Feedback'}
        </button>
      </form>
    </div>
  );
};

export default FeedbackForm;
