import React, { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useBooking } from '../context/BookingContext';
import { DownloadIcon, CheckCircleIcon } from './Icons';

export const TicketConfirmation = ({ event, booking, onDownloadComplete }) => {
  const { booking: bookingData, qrCode } = useBooking();
  const ticketRef = useRef();
  const [downloading, setDownloading] = useState(false);

  const displayBooking = booking || bookingData;

  const handleDownloadPDF = async () => {
    if (!ticketRef.current) return;

    setDownloading(true);
    try {
      const canvas = await html2canvas(ticketRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`ticket-${displayBooking.bookingId}.pdf`);
    } catch (error) {
      console.error('PDF download failed:', error);
      alert('Failed to download ticket');
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadPNG = async () => {
    if (!ticketRef.current) return;

    setDownloading(true);
    try {
      const canvas = await html2canvas(ticketRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
      });

      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = `ticket-${displayBooking.bookingId}.png`;
      link.click();
    } catch (error) {
      console.error('PNG download failed:', error);
      alert('Failed to download ticket');
    } finally {
      setDownloading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getTotalTickets = () => {
    return displayBooking.ticketDetails?.reduce((sum, t) => sum + t.quantity, 0) || 0;
  };

  return (
    <div className="booking-step-confirmation">
      <div className="confirmation-header">
        <div className="success-badge">
          <CheckCircleIcon size={48} />
        </div>
        <h3>Ticket Confirmed!</h3>
        <p>Your booking has been successfully confirmed</p>
      </div>

      {/* Digital Ticket Display */}
      <div className="digital-ticket-wrapper">
        <div
          ref={ticketRef}
          className="digital-ticket"
          style={{ padding: '20px', backgroundColor: '#fff' }}
        >
          <div className="ticket-header">
            <div className="ticket-gradient-top"></div>
          </div>

          <div className="ticket-content">
            {/* Event Info Section */}
            <div className="ticket-event-section">
              <h2 className="ticket-event-title">{event.title}</h2>

              <div className="ticket-event-grid">
                <div className="ticket-field">
                  <span className="ticket-label">📅 Date</span>
                  <span className="ticket-value">{formatDate(event.date)}</span>
                </div>
                <div className="ticket-field">
                  <span className="ticket-label">🕐 Time</span>
                  <span className="ticket-value">{event.time}</span>
                </div>
                <div className="ticket-field">
                  <span className="ticket-label">📍 Venue</span>
                  <span className="ticket-value">{event.location}</span>
                </div>
                <div className="ticket-field">
                  <span className="ticket-label">🎫 Qty</span>
                  <span className="ticket-value">{getTotalTickets()}</span>
                </div>
              </div>
            </div>

            {/* Tickets Breakdown */}
            {displayBooking.ticketDetails && displayBooking.ticketDetails.length > 0 && (
              <div className="ticket-breakdown-section">
                <h3>Tickets Breakdown</h3>
                <div className="ticket-types-list">
                  {displayBooking.ticketDetails.map((ticket, index) => (
                    <div key={index} className="ticket-type-row">
                      <span>{ticket.categoryName}</span>
                      <span>×{ticket.quantity}</span>
                      <span>
                        LKR{' '}
                        {(ticket.subtotal || ticket.price * ticket.quantity).toLocaleString(
                          'en-US',
                          { minimumFractionDigits: 2 }
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* QR Code Section */}
            <div className="ticket-qr-section">
              <h3>Your Booking Reference</h3>
              <div className="booking-id-display">
                <span className="label">Booking ID:</span>
                <span className="booking-id">{displayBooking.bookingId}</span>
              </div>

              {qrCode && (
                <div className="qr-code-container">
                  <img
                    src={qrCode}
                    alt="QR Code"
                    className="qr-code-image"
                  />
                  <p className="qr-instruction">
                    Show this QR code at the box office
                  </p>
                </div>
              )}
            </div>

            {/* Price Summary */}
            <div className="ticket-summary-section">
              <div className="summary-breakdown">
                <div className="breakdown-line">
                  <span>Subtotal:</span>
                  <span>
                    LKR{' '}
                    {displayBooking.subtotalAmount.toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>
                <div className="breakdown-line">
                  <span>Booking Fee:</span>
                  <span>
                    LKR{' '}
                    {displayBooking.bookingFee.toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>
                <div className="breakdown-line total">
                  <span>Total Paid:</span>
                  <span>
                    LKR{' '}
                    {displayBooking.totalAmount.toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* Pickup Instructions */}
            <div className="ticket-instructions-section">
              <h3>Collection Instructions</h3>
              <div className="instructions-box">
                <p>
                  {event.pickupInstructions ||
                    'Please collect your tokens from the box office 30 minutes before the event starts.'}
                </p>
              </div>
            </div>

            <div className="ticket-footer">
              <p>Thank you for your booking!</p>
            </div>
          </div>
        </div>
      </div>

      {/* Download Actions */}
      <div className="download-actions">
        <button
          className="btn btn-secondary"
          onClick={handleDownloadPNG}
          disabled={downloading}
        >
          <DownloadIcon size={16} />
          {downloading ? 'Downloading...' : 'Download as PNG'}
        </button>
        <button
          className="btn btn-primary"
          onClick={handleDownloadPDF}
          disabled={downloading}
        >
          <DownloadIcon size={16} />
          {downloading ? 'Downloading...' : 'Download as PDF'}
        </button>
      </div>

      {/* Additional Info */}
      <div className="confirmation-info">
        <p>
          A confirmation email has been sent to your registered email address with
          your ticket details.
        </p>
        <p>You can view your bookings anytime in your dashboard.</p>
      </div>

      <div className="booking-completed-actions">
        <button className="btn btn-primary" onClick={onDownloadComplete}>
          View My Tickets
        </button>
      </div>
    </div>
  );
};
