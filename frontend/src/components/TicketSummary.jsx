import React, { useState } from 'react';
import { useBooking } from '../context/BookingContext';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const TicketSummary = ({ event, bookingId, onProceed, onCancel }) => {
  const { selectedTickets, subtotalAmount, bookingFee, totalAmount } = useBooking();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCancelTransaction = async () => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE}/api/bookings/${bookingId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to cancel booking');
      }

      // Reset the entire flow
      onCancel();
    } catch (err) {
      console.error('Cancel error:', err);
      setError(err.message || 'Failed to cancel booking');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="booking-step-summary">
      <h3>Ticket Summary</h3>

      {error && <div className="booking-error">{error}</div>}

      <div className="summary-details">
        {/* Event Info */}
        <div className="summary-section">
          <h4>Event Details</h4>
          <div className="event-info-box">
            {event.image && (
              <img
                src={event.image}
                alt={event.title}
                className="event-image-small"
              />
            )}
            <div className="event-info-text">
              <div className="info-row">
                <span className="label">Event:</span>
                <span className="value">{event.title}</span>
              </div>
              <div className="info-row">
                <span className="label">Date:</span>
                <span className="value">{formatDate(event.date)}</span>
              </div>
              <div className="info-row">
                <span className="label">Time:</span>
                <span className="value">{event.time}</span>
              </div>
              <div className="info-row">
                <span className="label">Venue:</span>
                <span className="value">{event.location}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tickets Selected */}
        <div className="summary-section">
          <h4>Tickets Selected</h4>
          <div className="tickets-list">
            {selectedTickets.map((ticket, index) => (
              <div key={index} className="ticket-item">
                <div className="ticket-type">
                  <span className="ticket-name">{ticket.categoryName}</span>
                  <span className="ticket-qty">×{ticket.quantity}</span>
                </div>
                <div className="ticket-price">
                  LKR{' '}
                  {(ticket.subtotal || ticket.price * ticket.quantity).toLocaleString(
                    'en-US',
                    { minimumFractionDigits: 2 }
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Price Breakdown */}
        <div className="summary-section price-breakdown">
          <div className="breakdown-row">
            <span>Subtotal:</span>
            <span>
              LKR{' '}
              {subtotalAmount.toLocaleString('en-US', {
                minimumFractionDigits: 2,
              })}
            </span>
          </div>
          <div className="breakdown-row">
            <span>Booking Fee:</span>
            <span>
              LKR{' '}
              {bookingFee.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="breakdown-row total">
            <span>Total Amount:</span>
            <span>
              LKR{' '}
              {totalAmount.toLocaleString('en-US', {
                minimumFractionDigits: 2,
              })}
            </span>
          </div>
        </div>
      </div>

      <div className="booking-actions">
        <button
          className="btn btn-secondary"
          onClick={handleCancelTransaction}
          disabled={loading}
        >
          {loading ? 'Cancelling...' : 'Cancel Transaction'}
        </button>
        <button className="btn btn-primary" onClick={onProceed} disabled={loading}>
          Proceed
        </button>
      </div>
    </div>
  );
};
