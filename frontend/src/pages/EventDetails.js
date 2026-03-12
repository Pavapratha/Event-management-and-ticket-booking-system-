import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { BookingModal } from '../components/BookingModal';
import {
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  TicketIcon,
  ArrowRightIcon,
  UsersIcon,
} from '../components/Icons';
import './EventDetails.css';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showBookingModal, setShowBookingModal] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await api.get(`/api/events/${id}`);
        if (res.data.success && res.data.event) {
          setEvent(res.data.event);
        } else {
          setError('Event not found');
        }
      } catch (err) {
        if (err.response?.status === 404) {
          setError('Event not found');
        } else {
          setError('Failed to load event details');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  const handleBookTicket = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setShowBookingModal(true);
  };

  const handleBookingSuccess = () => {
    setShowBookingModal(false);
    navigate('/tickets');
  };

  if (loading) {
    return (
      <div className="event-details-page">
        <div className="container">
          <div className="event-details-loading">
            <div className="spinner"></div>
            <p>Loading event details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="event-details-page">
        <div className="container">
          <div className="event-details-error">
            <h2>{error || 'Event not found'}</h2>
            <p>The event you're looking for doesn't exist or has been removed.</p>
            <Link to="/events" className="btn btn-primary">
              Browse Events
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const eventDate = new Date(event.date);
  const formattedDate = eventDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
  const imageUrl = event.image ? `${API_BASE}${event.image}` : null;
  const isSoldOut = event.availableSeats <= 0;

  return (
    <div className="event-details-page">
      <div className="container">
        {/* Breadcrumb */}
        <div className="event-breadcrumb">
          <Link to="/">Home</Link>
          <span className="breadcrumb-sep">/</span>
          <Link to="/events">Events</Link>
          <span className="breadcrumb-sep">/</span>
          <span>{event.title}</span>
        </div>

        <div className="event-details-layout">
          {/* Left: Image + Description */}
          <div className="event-details-main">
            <div className="event-details-image">
              {imageUrl ? (
                <img src={imageUrl} alt={event.title} />
              ) : (
                <div className="event-image-placeholder">
                  <TicketIcon size={64} />
                </div>
              )}
              {event.category && (
                <span className="event-details-category">{event.category}</span>
              )}
            </div>

            <div className="event-details-description">
              <h2>About This Event</h2>
              <p>{event.description}</p>
            </div>
          </div>

          {/* Right: Info + Actions */}
          <div className="event-details-sidebar">
            <div className="event-details-card">
              <h1 className="event-details-title">{event.title}</h1>

              <div className="event-details-meta">
                <div className="meta-item">
                  <CalendarIcon size={20} />
                  <div>
                    <span className="meta-label">Date</span>
                    <span className="meta-value">{formattedDate}</span>
                  </div>
                </div>
                <div className="meta-item">
                  <ClockIcon size={20} />
                  <div>
                    <span className="meta-label">Time</span>
                    <span className="meta-value">{event.time}</span>
                  </div>
                </div>
                <div className="meta-item">
                  <MapPinIcon size={20} />
                  <div>
                    <span className="meta-label">Venue</span>
                    <span className="meta-value">{event.venue || event.location}</span>
                  </div>
                </div>
                <div className="meta-item">
                  <UsersIcon size={20} />
                  <div>
                    <span className="meta-label">Available Tickets</span>
                    <span className="meta-value">
                      {isSoldOut ? (
                        <span style={{ color: 'var(--danger)' }}>Sold Out</span>
                      ) : (
                        `${event.availableSeats} / ${event.totalSeats}`
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Price */}
              <div className="event-details-price">
                <span className="price-label">Ticket Price</span>
                <span className="price-value">
                  {event.price === 0
                    ? 'Free'
                    : `Rs. ${parseFloat(event.price).toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}`}
                </span>
              </div>

              {/* Ticket Categories */}
              {event.ticketCategories && event.ticketCategories.length > 0 && (
                <div className="event-details-categories">
                  <h3>Ticket Types</h3>
                  {event.ticketCategories.map((cat) => (
                    <div key={cat._id} className="category-row">
                      <span className="cat-name">{cat.name}</span>
                      <span className="cat-price">
                        LKR {cat.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                      <span className="cat-avail">
                        {cat.availableQuantity > 0
                          ? `${cat.availableQuantity} left`
                          : 'Sold out'}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Book Button */}
              <button
                className="btn btn-primary btn-lg btn-full"
                onClick={handleBookTicket}
                disabled={isSoldOut}
              >
                {isSoldOut ? (
                  'Tickets Sold Out'
                ) : (
                  <>
                    <TicketIcon size={20} />
                    Book Ticket
                  </>
                )}
              </button>

              {!user && (
                <p className="login-hint">
                  <Link to="/login">Log in</Link> to book tickets
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <BookingModal
          eventId={event._id}
          onClose={() => setShowBookingModal(false)}
          onBookingSuccess={handleBookingSuccess}
        />
      )}
    </div>
  );
};
