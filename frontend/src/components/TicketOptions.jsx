import React from 'react';
import { useBooking } from '../context/BookingContext';

export const TicketOptions = ({ event, onProceedToPayment }) => {
  const {
    pickupOption,
    setPickupOption,
    selectedTickets,
    subtotalAmount,
    bookingFee,
    totalAmount,
  } = useBooking();

  return (
    <div className="booking-step-options">
      {/* Left Section - Pickup Options */}
      <div className="options-section">
        <h3>Ticket Collection Options</h3>

        <div className="option-card">
          <div className="option-radio">
            <input
              type="radio"
              id="box-office"
              name="pickup"
              value="box-office"
              checked={pickupOption === 'box-office'}
              onChange={(e) => setPickupOption(e.target.value)}
            />
            <label htmlFor="box-office" className="radio-label">
              <span className="radio-custom"></span>
              <span className="option-title">Pickup from Box Office</span>
            </label>
          </div>

          {pickupOption === 'box-office' && (
            <div className="option-details">
              <div className="pickup-instructions">
                <h4>Pickup Instructions</h4>
                <p>
                  {event.pickupInstructions ||
                    'Please collect your tickets from the box office 30 minutes before the event starts. Bring this QR code reference with you.'}
                </p>
                <div className="venue-info">
                  <p>
                    <strong>Venue:</strong> {event.location}
                  </p>
                  <p>
                    <strong>Event Date:</strong>{' '}
                    {new Date(event.date).toLocaleDateString('en-US', {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                  <p>
                    <strong>Event Time:</strong> {event.time}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Section - Order Summary */}
      <div className="order-summary-section">
        <div className="summary-panel">
          <h3>Order Summary</h3>

          <div className="summary-items">
            {selectedTickets.map((ticket, index) => (
              <div key={index} className="summary-item">
                <span className="item-name">
                  {ticket.categoryName} ×{ticket.quantity}
                </span>
                <span className="item-price">
                  LKR{' '}
                  {(ticket.subtotal || ticket.price * ticket.quantity).toLocaleString(
                    'en-US',
                    { minimumFractionDigits: 2 }
                  )}
                </span>
              </div>
            ))}
          </div>

          <div className="summary-divider"></div>

          <div className="breakdown">
            <div className="breakdown-row">
              <span>Subtotal</span>
              <span>
                LKR{' '}
                {subtotalAmount.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
            <div className="breakdown-row">
              <span>Booking Fee</span>
              <span>
                LKR{' '}
                {bookingFee.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <div className="summary-divider"></div>

          <div className="total-row">
            <span>Total Amount</span>
            <span className="total-price">
              LKR{' '}
              {totalAmount.toLocaleString('en-US', {
                minimumFractionDigits: 2,
              })}
            </span>
          </div>

          <button
            className="btn btn-primary btn-full"
            onClick={onProceedToPayment}
          >
            Proceed to Pay
          </button>
        </div>
      </div>
    </div>
  );
};
