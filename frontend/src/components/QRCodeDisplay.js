import React from 'react';

export const QRCodeDisplay = ({ qrCode, bookingId, size = 200 }) => {
  if (!qrCode) {
    return (
      <div className="qr-placeholder" style={{
        width: size,
        height: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f5f5f5',
        borderRadius: 8,
        color: '#999',
        fontSize: '0.85rem',
      }}>
        QR Code unavailable
      </div>
    );
  }

  return (
    <div className="qr-code-display" style={{ textAlign: 'center' }}>
      <img
        src={qrCode}
        alt={`QR Code for booking ${bookingId || ''}`}
        style={{
          width: size,
          height: size,
          borderRadius: 8,
          border: '1px solid #e2e8f0',
        }}
      />
      {bookingId && (
        <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.5rem' }}>
          Booking: {bookingId}
        </p>
      )}
    </div>
  );
};
