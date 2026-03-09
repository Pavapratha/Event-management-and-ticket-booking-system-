import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { PageContainer, Section, Card } from '../components/Layout';
import { QrCodeIcon, XIcon } from '../components/Icons';


const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const MyTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('upcoming'); // upcoming or past

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const res = await api.get('/api/user/bookings');
        const allBookings = res.data.bookings || [];
        
        // Transform bookings to ticket format
        const now = new Date();
        const formattedTickets = allBookings
          .filter(b => b.status !== 'cancelled')
          .map(booking => ({
            id: booking._id,
            bookingId: booking.bookingId,
            eventName: booking.eventId?.title || 'Unknown Event',
            date: new Date(booking.eventId?.date).toLocaleDateString('en-US', { 
              weekday: 'long',
              month: 'long', 
              day: 'numeric', 
              year: 'numeric' 
            }),
            time: booking.eventId?.time || 'TBD',
            location: booking.eventId?.location || 'TBD',
            image: booking.eventId?.image ? `${API_BASE}${booking.eventId.image}` : 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=100&h=100&fit=crop',
            quantity: booking.ticketQuantity,
            totalAmount: booking.totalAmount,
            eventDate: new Date(booking.eventId?.date),
            status: booking.status,
            isPast: new Date(booking.eventId?.date) < now
          }))
          .sort((a, b) => b.eventDate - a.eventDate);

        setTickets(formattedTickets);
      } catch (err) {
        console.error('Failed to fetch tickets:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
    // Refresh every 20 seconds
    const interval = setInterval(fetchTickets, 20000);
    return () => clearInterval(interval);
  }, []);

  const filteredTickets = tickets.filter(ticket => {
    if (filter === 'upcoming') return !ticket.isPast;
    return ticket.isPast;
  });

  if (loading) {
    return (
      <PageContainer>
        <Section>
          <div className="tickets-header">
            <h1>My Tickets</h1>
          </div>
          <p>Loading your tickets...</p>
        </Section>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Section>
        <div className="tickets-header">
          <h1>My Tickets</h1>
          <p className="tickets-subtitle">View and manage your event tickets</p>
        </div>

        {/* Filter tabs */}
        <div className="tickets-filter-tabs">
          <button 
            className={`filter-tab ${filter === 'upcoming' ? 'active' : ''}`}
            onClick={() => setFilter('upcoming')}
          >
            Upcoming ({tickets.filter(t => !t.isPast).length})
          </button>
          <button 
            className={`filter-tab ${filter === 'past' ? 'active' : ''}`}
            onClick={() => setFilter('past')}
          >
            Past Events ({tickets.filter(t => t.isPast).length})
          </button>
        </div>

        {filteredTickets.length === 0 ? (
          <Card className="empty-state">
            <div className="empty-icon">🎫</div>
            <h3>{filter === 'upcoming' ? 'No Upcoming Tickets' : 'No Past Events'}</h3>
            <p>{filter === 'upcoming' ? "You haven't purchased any tickets yet. " : 'You have not attended any events yet. '}Browse our events to find something exciting!</p>
            <Link to="/events" className="btn btn-primary">
              Browse Events
            </Link>
          </Card>
        ) : (
          <div className="tickets-list">
            {filteredTickets.map((ticket) => (
              <Card key={ticket.id} className="ticket-card">
                <div className="ticket-image-container">
                  <img src={ticket.image} alt={ticket.eventName} className="ticket-image" />
                  {ticket.isPast && <div className="ticket-badge-past">Past Event</div>}
                </div>
                <div className="ticket-content">
                  <h3>{ticket.eventName}</h3>
                  <div className="ticket-info">
                    <div className="info-item">
                      <span className="info-label">📅 Date & Time:</span>
                      <span>{ticket.date} at {ticket.time}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">📍 Location:</span>
                      <span>{ticket.location}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">🎟️ Tickets:</span>
                      <span>{ticket.quantity} Ticket{ticket.quantity > 1 ? 's' : ''}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">💰 Total Amount:</span>
                      <span>Rs. {ticket.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">🆔 Booking ID:</span>
                      <span className="booking-id">{ticket.bookingId}</span>
                    </div>
                  </div>
                </div>
                <div className="ticket-actions">
                  {!ticket.isPast && (
                    <>
                      <button className="btn btn-secondary btn-sm">
                        <QrCodeIcon width={16} height={16} /> View QR
                      </button>
                      <button className="btn btn-danger btn-sm">
                        <XIcon width={16} height={16} /> Cancel
                      </button>
                    </>
                  )}
                  {ticket.isPast && (
                    <button className="btn btn-secondary btn-sm disabled">
                      Event Completed
                    </button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </Section>
    </PageContainer>
  );
};
