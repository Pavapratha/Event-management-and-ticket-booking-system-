import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../context/BookingContext';
import { PaymentGateway } from './PaymentGateway';
import { SelectCategory } from './SelectCategory';
import { TicketSummary } from './TicketSummary';
import { TicketConfirmation } from './TicketConfirmation';
import { XIcon, CalendarIcon, ClockIcon, MapPinIcon, TicketIcon } from './Icons';
import './BookingModal.css';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const BookingModal = ({ eventId, onClose, onBookingSuccess }) => {
  const navigate = useNavigate();
  const {
    currentStep,
    setCurrentStep,
    selectedTickets,
    bookingId,
    totalAmount,
    setEvent,
    setBookingId,
    setBooking,
    setError,
    setLoading,
    loading,
    error,
    resetBooking,
  } = useBooking();

  const [eventData, setEventData] = useState(null);
  const [fetchError, setFetchError] = useState('');
  const [localError, setLocalError] = useState('');
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  // Fetch event data by ID
  useEffect(() => {
    if (!eventId) {
      setFetchError('No event ID provided');
      return;
    }

    const fetchEvent = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE}/api/events/${eventId}`);
        if (!response.ok) {
          throw new Error('Event not found');
        }
        const data = await response.json();
        if (data.success && data.event) {
          const ev = data.event;
          // If event has no ticketCategories, create a default one from base price
          if (!ev.ticketCategories || ev.ticketCategories.length === 0) {
            ev.ticketCategories = [{
              _id: 'default',
              name: 'General Admission',
              price: ev.price || 0,
              totalQuantity: ev.totalSeats || 0,
              availableQuantity: ev.availableSeats || 0,
            }];
          }
          setEventData(ev);
          setEvent(ev);
          setCurrentStep('eventInfo');
        } else {
          setFetchError('Event not found');
        }
      } catch (err) {
        setFetchError(err.message || 'Failed to load event');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  // Step 1: Proceed from event info to ticket selection
  const handleEventInfoProceed = () => {
    setCurrentStep('selectCategory');
  };

  // Step 2: Handle category selection completion → create booking
  const handleCategoryProceed = async () => {
    if (!selectedTickets || selectedTickets.length === 0) {
      setLocalError('Please select at least one ticket');
      return;
    }

    setLoading(true);
    setLocalError('');

    try {
      const response = await fetch(`${API_BASE}/api/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          eventId: eventData._id,
          ticketDetails: selectedTickets,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to create booking');
      }

      const data = await response.json();
      setBookingId(data.booking._id);
      setBooking(data.booking);
      setCurrentStep('summary');
    } catch (err) {
      console.error('Booking creation error:', err);
      setLocalError(err.message || 'Failed to create booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Handle summary → proceed to payment
  const handleSummaryProceed = () => {
    setCurrentStep('payment');
  };

  // Handle cancel booking
  const handleCancelBooking = () => {
    resetBooking();
    onClose();
  };

  // Step 4: Handle payment success
  const handlePaymentSuccess = async (paymentData) => {
    setPaymentProcessing(true);
    setLocalError('');

    try {
      const response = await fetch(
        `${API_BASE}/api/bookings/${bookingId}/confirm`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({
            paymentDetails: {
              transactionId: paymentData.transactionId,
              method: 'fake-payment-gateway',
              status: 'completed',
              cardLast4: paymentData.cardLast4,
            },
          }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to confirm booking');
      }

      const data = await response.json();
      setBooking(data.booking);
      setCurrentStep('confirmation');

      if (onBookingSuccess) {
        onBookingSuccess(data.booking);
      }
    } catch (err) {
      console.error('Payment confirmation error:', err);
      setLocalError(err.message || 'Payment failed. Please try again.');
      setCurrentStep('summary');
    } finally {
      setPaymentProcessing(false);
    }
  };

  // Step 4: Handle payment cancel
  const handlePaymentCancel = () => {
    setCurrentStep('summary');
  };

  // Step 5: Handle confirmation completion
  const handleConfirmationComplete = () => {
    resetBooking();
    onClose();
    navigate('/tickets');
  };

  // Render event info step
  const renderEventInfo = () => {
    if (!eventData) return null;
    const dateObj = new Date(eventData.date);
    const formattedDate = dateObj.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
    const imageUrl = eventData.image ? `${API_BASE}${eventData.image}` : null;
    const isSoldOut = eventData.availableSeats <= 0;

    return (
      <div className="booking-step-eventinfo">
        {imageUrl && (
          <div className="eventinfo-image">
            <img src={imageUrl} alt={eventData.title} />
          </div>
        )}
        <h3 className="eventinfo-title">{eventData.title}</h3>
        <p className="eventinfo-desc">{eventData.description}</p>
        <div className="eventinfo-meta">
          <div className="eventinfo-meta-item">
            <CalendarIcon size={16} />
            <span>{formattedDate}</span>
          </div>
          <div className="eventinfo-meta-item">
            <ClockIcon size={16} />
            <span>{eventData.time}</span>
          </div>
          <div className="eventinfo-meta-item">
            <MapPinIcon size={16} />
            <span>{eventData.venue || eventData.location}</span>
          </div>
          <div className="eventinfo-meta-item">
            <TicketIcon size={16} />
            <span>
              {isSoldOut
                ? 'Sold Out'
                : `${eventData.availableSeats} tickets available`}
            </span>
          </div>
        </div>
        {isSoldOut ? (
          <div className="booking-error">Tickets are sold out for this event.</div>
        ) : (
          <div className="booking-actions">
            <button className="btn btn-primary" onClick={handleEventInfoProceed}>
              Select Tickets
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderStep = () => {
    if (fetchError) {
      return (
        <div className="booking-step-error">
          <h3>{fetchError}</h3>
          <button className="btn btn-primary" onClick={onClose}>Close</button>
        </div>
      );
    }

    switch (currentStep) {
      case 'eventInfo':
        return renderEventInfo();
      case 'selectCategory':
        return (
          <SelectCategory
            event={eventData}
            onProceed={handleCategoryProceed}
          />
        );
      case 'summary':
        return (
          <TicketSummary
            event={eventData}
            bookingId={bookingId}
            onProceed={handleSummaryProceed}
            onCancel={handleCancelBooking}
          />
        );
      case 'payment':
        return (
          <div className="booking-step-payment">
            <PaymentGateway
              amount={totalAmount}
              eventTitle={eventData?.title}
              onSuccess={handlePaymentSuccess}
              onCancel={handlePaymentCancel}
              loading={paymentProcessing}
            />
          </div>
        );
      case 'confirmation':
        return (
          <TicketConfirmation
            event={eventData}
            booking={null}
            onDownloadComplete={handleConfirmationComplete}
          />
        );
      default:
        return null;
    }
  };

  const stepNames = ['eventInfo', 'selectCategory', 'summary', 'payment', 'confirmation'];
  const stepLabels = ['Event Info', 'Select Tickets', 'Summary', 'Payment', 'Confirmation'];
  const currentIndex = stepNames.indexOf(currentStep);

  return (
    <div className="booking-modal-overlay" onClick={onClose}>
      <div className="booking-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <XIcon size={24} />
        </button>

        {/* Error Banner */}
        {localError && (
          <div className="booking-error-banner">
            <span>{localError}</span>
            <button
              className="error-close"
              onClick={() => setLocalError('')}
            >
              ×
            </button>
          </div>
        )}

        {/* Loading Overlay */}
        {loading && (
          <div className="booking-loading">
            <div className="spinner"></div>
            <p>Please wait...</p>
          </div>
        )}

        {/* Step Indicator */}
        {currentStep !== 'confirmation' && (
          <div className="booking-steps">
            {stepLabels.slice(0, 4).map((label, idx) => (
              <div
                key={idx}
                className={`step ${idx === currentIndex ? 'active' : idx < currentIndex ? 'done' : ''}`}
              >
                <span className="step-number">{idx + 1}</span>
                <span className="step-label">{label}</span>
              </div>
            ))}
          </div>
        )}

        {/* Step Content */}
        <div className="booking-step-content">
          {renderStep()}
        </div>
      </div>
    </div>
  );
};
