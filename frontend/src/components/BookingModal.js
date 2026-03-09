import React, { useState, useEffect } from 'react';
import { PaymentGateway } from './PaymentGateway';
import { XIcon, MinusIcon, PlusIcon } from './Icons';
import './BookingModal.css';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const BookingModal = ({ event, onClose, onBookingSuccess }) => {
  const [quantity, setQuantity] = useState(1);
  const [step, setStep] = useState('quantity'); // quantity or payment
  const [totalAmount, setTotalAmount] = useState(0);
  const [bookingInProgress, setBookingInProgress] = useState(false);

  useEffect(() => {
    const price = event.priceNum || parseFloat(event.price?.replace(/Rs\.|,/g, '')) || 0;
    setTotalAmount(price * quantity);
  }, [quantity, event]);

  const handleQuantityChange = (delta) => {
    const maxSeats = event.spotsLeft || 1;
    const newQuantity = quantity + delta;
    if (newQuantity > 0 && newQuantity <= maxSeats) {
      setQuantity(newQuantity);
    }
  };

  const handlePaymentSuccess = async (paymentData) => {
    setBookingInProgress(true);
    try {
      // Create booking in database
      const bookingResponse = await fetch(
        `${API_BASE}/api/user/bookings`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            eventId: event.id,
            ticketQuantity: quantity,
            totalAmount: totalAmount,
            paymentDetails: {
              transactionId: paymentData.transactionId,
              method: 'fake-payment-gateway',
              status: 'completed',
              cardLast4: paymentData.cardLast4
            }
          })
        }
      );

      if (!bookingResponse.ok) {
        throw new Error('Booking failed');
      }

      const bookingData = await bookingResponse.json();
      
      // Close modal and trigger success callback
      onBookingSuccess(bookingData.booking);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Booking error:', err);
      alert('Booking failed. Please try again.');
      setStep('payment');
    } finally {
      setBookingInProgress(false);
    }
  };

  const price = event.priceNum || parseFloat(event.price?.replace(/Rs\.|,/g, '')) || 0;

  return (
    <div className="booking-modal-overlay" onClick={onClose}>
      <div className="booking-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <XIcon size={24} />
        </button>

        {step === 'quantity' ? (
          <div className="booking-step-quantity">
            <div className="booking-event-info">
              <img src={event.image} alt={event.title} className="booking-event-image" />
              <div className="booking-event-details">
                <h2>{event.title}</h2>
                <div className="event-meta">
                  <span>📅 {event.date}</span>
                  <span>🕐 {event.time}</span>
                  <span>📍 {event.location}</span>
                </div>
                <div className="event-price">
                  Price per Ticket: <span className="price-value">Rs. {price.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="event-availability">
                  <span className={event.spotsLeft > 20 ? 'available' : event.spotsLeft > 0 ? 'limited' : 'sold-out'}>
                    {event.spotsLeft > 0 ? `${event.spotsLeft} seats available` : 'Sold Out'}
                  </span>
                </div>
              </div>
            </div>

            <div className="booking-form">
              <h3>Select Number of Tickets</h3>
              
              <div className="quantity-selector">
                <button 
                  className="qty-btn"
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                >
                  <MinusIcon size={20} />
                </button>
                <div className="qty-display">
                  <input 
                    type="number" 
                    min="1" 
                    max={event.spotsLeft}
                    value={quantity}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      if (val > 0 && val <= event.spotsLeft) setQuantity(val);
                    }}
                    className="qty-input"
                  />
                  <span className="qty-label">Ticket{quantity > 1 ? 's' : ''}</span>
                </div>
                <button 
                  className="qty-btn"
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= event.spotsLeft}
                >
                  <PlusIcon size={20} />
                </button>
              </div>

              <div className="booking-summary">
                <div className="summary-row">
                  <span>Ticket Price</span>
                  <span>Rs. {price.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="summary-row">
                  <span>Quantity</span>
                  <span>{quantity}</span>
                </div>
                <div className="summary-row total">
                  <span>Total Amount</span>
                  <span>Rs. {totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              <div className="terms">
                <input type="checkbox" id="terms" />
                <label htmlFor="terms">
                  I agree to the <strong>terms and conditions</strong>
                </label>
              </div>

              <div className="booking-actions">
                <button 
                  className="btn btn-secondary"
                  onClick={onClose}
                >
                  Cancel
                </button>
                <button 
                  className="btn btn-primary"
                  onClick={() => setStep('payment')}
                  disabled={quantity <= 0}
                >
                  Proceed to Payment
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="booking-step-payment">
            <PaymentGateway 
              amount={totalAmount}
              eventTitle={`${quantity} Ticket${quantity > 1 ? 's' : ''} - ${event.title}`}
              onSuccess={handlePaymentSuccess}
              onCancel={() => setStep('quantity')}
              loading={bookingInProgress}
            />
          </div>
        )}
      </div>
    </div>
  );
};
