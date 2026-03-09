import React, { useState } from 'react';
import { CreditCardIcon, CheckCircleIcon } from './Icons';
import './PaymentGateway.css';

export const PaymentGateway = ({ amount, eventTitle, onSuccess, onCancel, loading = false }) => {
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [processing, setProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [transactionId, setTransactionId] = useState('');

  // Format card number with spaces
  const handleCardNumberChange = (e) => {
    const value = e.target.value.replace(/\s/g, '');
    const formatted = value.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardNumber(formatted);
  };

  // Format expiry date MM/YY
  const handleExpiryChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
      value = value.slice(0, 2) + '/' + value.slice(2, 4);
    }
    setExpiryDate(value);
  };

  // Format CVV - only digits
  const handleCvvChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    setCvv(value.slice(0, 3));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate inputs
    if (!cardNumber.replace(/\s/g, '').match(/^\d{16}$/)) {
      alert('Please enter a valid 16-digit card number');
      return;
    }
    if (!cardHolder.trim()) {
      alert('Please enter cardholder name');
      return;
    }
    if (!expiryDate.match(/^\d{2}\/\d{2}$/)) {
      alert('Please enter expiry date in MM/YY format');
      return;
    }
    if (!cvv.match(/^\d{3}$/)) {
      alert('Please enter a valid 3-digit CVV');
      return;
    }

    setProcessing(true);

    // Simulate payment processing (fake gateway)
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Generate fake transaction ID
      const tid = 'TXN' + Date.now() + Math.random().toString(36).substr(2, 9).toUpperCase();
      setTransactionId(tid);
      setPaymentSuccess(true);

      // Call success callback after showing confirmation
      setTimeout(() => {
        onSuccess({
          transactionId: tid,
          cardLast4: cardNumber.slice(-4),
          amount: amount,
          timestamp: new Date().toISOString()
        });
      }, 1500);
    } catch (err) {
      alert('Payment processing failed. Please try again.');
      setProcessing(false);
    }
  };

  if (paymentSuccess) {
    return (
      <div className="payment-success">
        <div className="success-icon">
          <CheckCircleIcon size={64} />
        </div>
        <h3>Payment Successful!</h3>
        <p>Your payment has been processed</p>
        <div className="success-details">
          <div className="detail-row">
            <span className="label">Transaction ID:</span>
            <span className="value">{transactionId}</span>
          </div>
          <div className="detail-row">
            <span className="label">Amount:</span>
            <span className="value">Rs. {amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="detail-row">
            <span className="label">Card:</span>
            <span className="value">****{cardNumber.slice(-4)}</span>
          </div>
        </div>
        <p className="success-message">Booking confirmation will be sent to your email</p>
      </div>
    );
  }

  return (
    <div className="payment-gateway">
      <div className="payment-header">
        <h2 className="payment-title">
          <CreditCardIcon size={24} /> Complete Payment
        </h2>
        <p className="payment-event">{eventTitle}</p>
        <div className="payment-amount">
          Total: <span className="amount-value">Rs. {amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="payment-form">
        <div className="form-section">
          <h3 className="section-title">Card Details</h3>
          
          <div className="form-group">
            <label htmlFor="cardNumber">Card Number</label>
            <input
              id="cardNumber"
              type="text"
              placeholder="1234 5678 9012 3456"
              value={cardNumber}
              onChange={handleCardNumberChange}
              maxLength="19"
              required
              disabled={processing}
            />
            <small className="help-text">💡 Demo: Use any 16-digit number</small>
          </div>

          <div className="form-group">
            <label htmlFor="cardHolder">Cardholder Name</label>
            <input
              id="cardHolder"
              type="text"
              placeholder="John Doe"
              value={cardHolder}
              onChange={(e) => setCardHolder(e.target.value)}
              required
              disabled={processing}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="expiry">Expiry Date</label>
              <input
                id="expiry"
                type="text"
                placeholder="MM/YY"
                value={expiryDate}
                onChange={handleExpiryChange}
                maxLength="5"
                required
                disabled={processing}
              />
            </div>
            <div className="form-group">
              <label htmlFor="cvv">CVV</label>
              <input
                id="cvv"
                type="text"
                placeholder="123"
                value={cvv}
                onChange={handleCvvChange}
                maxLength="3"
                required
                disabled={processing}
              />
            </div>
          </div>
        </div>

        <div className="payment-info">
          <div className="info-box">
            <p>🔒 <strong>Secure Payment</strong></p>
            <p>This is a demo payment gateway. All data is simulated for demonstration purposes only.</p>
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={processing}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={processing || loading}
          >
            {processing ? 'Processing...' : `Pay Rs. ${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          </button>
        </div>
      </form>

      <div className="payment-footer">
        <p className="info-small">
          💡 This is a <strong>fake payment gateway</strong> for demo purposes. 
          No real payments will be processed. Use any card details to test.
        </p>
      </div>
    </div>
  );
};
