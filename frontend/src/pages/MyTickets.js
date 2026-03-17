import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { PageContainer, Section, Card } from '../components/Layout';
import { QRCodeDisplay } from '../components/QRCodeDisplay';
import { DownloadIcon, QrCodeIcon, XIcon } from '../components/Icons';


const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const MyTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('upcoming'); // upcoming or past
  const [expandedQR, setExpandedQR] = useState(null); // bookingId of expanded QR
  const [cancellingId, setCancellingId] = useState(null);
  const [downloadingInvoiceId, setDownloadingInvoiceId] = useState(null);

  const fetchTickets = async () => {
    try {
      const res = await api.get('/api/bookings');
      const allBookings = res.data.bookings || [];
      
      // Transform bookings to ticket format
      const now = new Date();
      const formattedTickets = allBookings
        .filter(b => b.status !== 'cancelled')
        .map(booking => ({
          id: booking._id,
          bookingId: booking.bookingId,
          invoiceNumber: booking.invoiceNumber || '',
          eventName: booking.eventId?.title || 'Unknown Event',
          date: new Date(booking.eventId?.date).toLocaleDateString('en-US', { 
            weekday: 'long',
            month: 'long', 
            day: 'numeric', 
            year: 'numeric' 
          }),
          time: booking.eventId?.time || 'TBD',
          location: booking.eventId?.location || 'TBD',
          image: booking.eventId?.image ? `${API_BASE}${booking.eventId.image}` : null,
          quantity: booking.ticketQuantity,
          totalAmount: booking.totalAmount,
          eventDate: new Date(booking.eventId?.date),
          status: booking.status,
          qrCode: booking.qrCode || '',
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

  useEffect(() => {
    fetchTickets();
    const interval = setInterval(fetchTickets, 20000);
    return () => clearInterval(interval);
  }, []);

  const handleCancelBooking = async (ticketId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    setCancellingId(ticketId);
    try {
      await api.delete(`/api/bookings/${ticketId}`);
      await fetchTickets();
    } catch (err) {
      console.error('Failed to cancel booking:', err);
      alert('Failed to cancel booking. Please try again.');
    } finally {
      setCancellingId(null);
    }
  };

  const handleDownloadInvoice = async (ticket) => {
    setDownloadingInvoiceId(ticket.id);

    try {
      const response = await api.get(`/api/bookings/${ticket.id}/invoice`, {
        responseType: 'blob',
      });

      const contentDisposition = response.headers['content-disposition'] || '';
      const filenameMatch = contentDisposition.match(/filename="?([^";]+)"?/i);
      const filename = filenameMatch?.[1] || `invoice-${ticket.bookingId}.pdf`;

      const blobUrl = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error('Failed to download invoice:', err);
      alert('Failed to download invoice. Please try again.');
    } finally {
      setDownloadingInvoiceId(null);
    }
  };

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
                  {ticket.image ? (
                    <img src={ticket.image} alt={ticket.eventName} className="ticket-image" />
                  ) : (
                    <div className="ticket-image ticket-image-placeholder">🎫</div>
                  )}
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
                    {ticket.invoiceNumber && (
                      <div className="info-item">
                        <span className="info-label">🧾 Invoice:</span>
                        <span className="booking-id">{ticket.invoiceNumber}</span>
                      </div>
                    )}
                  </div>

                  {/* QR Code Section (toggled) */}
                  {expandedQR === ticket.id && (
                    <div className="ticket-qr-section" style={{ marginTop: '1rem', padding: '1rem', background: '#f8fafc', borderRadius: 8, textAlign: 'center' }}>
                      <QRCodeDisplay qrCode={ticket.qrCode} bookingId={ticket.bookingId} size={180} />
                      <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.5rem' }}>
                        Show this QR code at the venue box office
                      </p>
                    </div>
                  )}
                </div>
                <div className="ticket-actions">
                  {!ticket.isPast && ticket.status === 'confirmed' && (
                    <>
                      <button
                        className={`btn btn-secondary btn-sm ${expandedQR === ticket.id ? 'active' : ''}`}
                        onClick={() => setExpandedQR(expandedQR === ticket.id ? null : ticket.id)}
                      >
                        <QrCodeIcon width={16} height={16} /> {expandedQR === ticket.id ? 'Hide QR' : 'View QR'}
                      </button>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handleDownloadInvoice(ticket)}
                        disabled={downloadingInvoiceId === ticket.id}
                      >
                        <DownloadIcon size={16} /> {downloadingInvoiceId === ticket.id ? 'Downloading...' : 'Download Invoice'}
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleCancelBooking(ticket.id)}
                        disabled={cancellingId === ticket.id}
                      >
                        <XIcon width={16} height={16} /> {cancellingId === ticket.id ? 'Cancelling...' : 'Cancel'}
                      </button>
                    </>
                  )}
                  {!ticket.isPast && ticket.status === 'pending' && (
                    <span className="badge badge-warning" style={{ padding: '0.25rem 0.75rem', borderRadius: 12, background: '#fef3c7', color: '#92400e', fontSize: '0.8rem' }}>
                      Payment Pending
                    </span>
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
