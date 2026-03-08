import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import QRCode from 'react-qr-code';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import api from '../services/api';
import './BookingDetails.css';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function BookingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const res = await api.get(`/api/admin/bookings/${id}`);
        setBooking(res.data.booking);
      } catch (err) {
        console.error(err);
        navigate('/admin/bookings');
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [id, navigate]);

  const handleCancel = async () => {
    if (!window.confirm('Cancel this booking?')) return;
    try {
      await api.put(`/api/admin/bookings/${id}/cancel`);
      setBooking((prev) => ({ ...prev, status: 'cancelled' }));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel');
    }
  };

  const downloadQR = () => {
    const svg = document.getElementById('booking-qr');
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0);
      const link = document.createElement('a');
      link.download = `qr-${booking.bookingId}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  const generateInvoice = () => {
    const doc = new jsPDF();

    // Header
    doc.setFillColor(255, 107, 0);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('EVENT TICKET INVOICE', 105, 22, { align: 'center' });
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text('Event Management Platform', 105, 33, { align: 'center' });

    // Reset color
    doc.setTextColor(0, 0, 0);

    // Invoice details
    doc.setFontSize(11);
    doc.text(`Invoice #: ${booking.bookingId}`, 20, 55);
    doc.text(`Date: ${new Date(booking.createdAt).toLocaleDateString()}`, 20, 63);

    doc.setDrawColor(255, 107, 0);
    doc.setLineWidth(0.5);
    doc.line(20, 70, 190, 70);

    // Booking info table
    doc.autoTable({
      startY: 78,
      head: [['Field', 'Details']],
      body: [
        ['Booking ID', booking.bookingId],
        ['User Name', booking.userId?.name || 'N/A'],
        ['User Email', booking.userId?.email || 'N/A'],
        ['Event Name', booking.eventId?.title || 'N/A'],
        ['Event Date', booking.eventId?.date ? new Date(booking.eventId.date).toLocaleDateString() : 'N/A'],
        ['Event Time', booking.eventId?.time || 'N/A'],
        ['Location', booking.eventId?.location || 'N/A'],
        ['Ticket Quantity', booking.ticketQuantity?.toString()],
        ['Unit Price', `$${booking.eventId?.price || 0}`],
        ['Total Amount', `$${booking.totalAmount}`],
        ['Status', booking.status?.toUpperCase()],
      ],
      headStyles: { fillColor: [255, 107, 0], textColor: 255 },
      alternateRowStyles: { fillColor: [255, 245, 235] },
      styles: { fontSize: 10 },
    });

    // Footer
    const finalY = doc.lastAutoTable.finalY + 20;
    doc.setTextColor(150);
    doc.setFontSize(9);
    doc.text('Thank you for your booking! Scan the QR code at the event entrance.', 105, finalY, { align: 'center' });
    doc.text('Event Management Platform | support@eventmanagement.com', 105, finalY + 7, { align: 'center' });

    doc.save(`invoice-${booking.bookingId}.pdf`);
  };

  const formatCurrency = (val) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

  const getStatusBadge = (status) => {
    const map = { confirmed: 'badge-success', pending: 'badge-warning', cancelled: 'badge-danger' };
    return map[status] || 'badge-gray';
  };

  if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;
  if (!booking) return null;

  const qrValue = JSON.stringify({
    bookingId: booking.bookingId,
    event: booking.eventId?.title,
    user: booking.userId?.name,
    tickets: booking.ticketQuantity,
    total: booking.totalAmount,
    status: booking.status,
  });

  return (
    <div className="booking-details">
      <div className="page-header">
        <div>
          <h1 className="page-title">Booking Details</h1>
          <p className="page-subtitle">
            <span style={{ fontFamily: 'monospace', color: 'var(--primary)', fontWeight: 600 }}>
              {booking.bookingId}
            </span>
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary" onClick={() => navigate('/admin/bookings')}>← Back</button>
          <button className="btn btn-primary" onClick={generateInvoice}>📄 Download Invoice</button>
          {booking.status !== 'cancelled' && (
            <button className="btn btn-danger" onClick={handleCancel}>Cancel Booking</button>
          )}
        </div>
      </div>

      <div className="booking-details-grid">
        {/* Booking Info */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Booking Information</span>
            <span className={`badge ${getStatusBadge(booking.status)}`}>{booking.status}</span>
          </div>
          <div className="card-body">
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Booking ID</span>
                <span className="info-value mono">{booking.bookingId}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Booking Date</span>
                <span className="info-value">{new Date(booking.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Tickets</span>
                <span className="info-value">{booking.ticketQuantity}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Total Amount</span>
                <span className="info-value" style={{ color: 'var(--primary)', fontWeight: 700, fontSize: 18 }}>
                  {formatCurrency(booking.totalAmount)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">User Information</span>
          </div>
          <div className="card-body">
            <div className="user-profile">
              <div className="user-avatar-lg">
                {booking.userId?.name?.[0]?.toUpperCase() || '?'}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 16 }}>{booking.userId?.name || 'Unknown'}</div>
                <div style={{ color: 'var(--gray-500)', fontSize: 13 }}>{booking.userId?.email}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Event Info */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Event Information</span>
          </div>
          <div className="card-body">
            {booking.eventId?.image && (
              <img
                src={`${API_BASE}${booking.eventId.image}`}
                alt={booking.eventId.title}
                className="event-detail-img"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            )}
            <div className="info-grid" style={{ marginTop: 12 }}>
              <div className="info-item">
                <span className="info-label">Event Name</span>
                <span className="info-value">{booking.eventId?.title || 'N/A'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Date</span>
                <span className="info-value">{booking.eventId?.date ? new Date(booking.eventId.date).toLocaleDateString() : 'N/A'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Time</span>
                <span className="info-value">{booking.eventId?.time || 'N/A'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Location</span>
                <span className="info-value">{booking.eventId?.location || 'N/A'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Price/Ticket</span>
                <span className="info-value">{formatCurrency(booking.eventId?.price || 0)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* QR Code */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">QR Code E-Ticket</span>
          </div>
          <div className="card-body qr-section">
            <div className="qr-wrapper">
              <QRCode
                id="booking-qr"
                value={qrValue}
                size={200}
                style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
                viewBox="0 0 256 256"
              />
            </div>
            <p style={{ fontSize: 13, color: 'var(--gray-500)', textAlign: 'center', marginTop: 12 }}>
              Scan this QR code at the event entrance
            </p>
            <button className="btn btn-outline" style={{ marginTop: 12, width: '100%' }} onClick={downloadQR}>
              ⬇️ Download QR Code
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookingDetails;
