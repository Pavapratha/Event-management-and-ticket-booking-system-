import React, { useState } from 'react';
import { useBooking } from '../context/BookingContext';

export const SelectCategory = ({ event, onProceed }) => {
  const { updateSelectedTickets } = useBooking();
  const [quantities, setQuantities] = useState({});
  const [error, setError] = useState('');

  // Guard: Check if event has required data
  if (!event || !event.ticketCategories || event.ticketCategories.length === 0) {
    console.error('[SelectCategory] Invalid event data:', { 
      hasEvent: !!event, 
      hasCategories: !!event?.ticketCategories,
      categoriesCount: event?.ticketCategories?.length || 0
    });
    return (
      <div className="booking-step-category">
        <div className="no-categories">
          <p>Error: Event data is missing or corrupted. Please refresh and try again.</p>
        </div>
      </div>
    );
  }

  const handleQuantityChange = (categoryId, delta) => {
    setQuantities((prev) => {
      const current = prev[categoryId] || 0;
      const newQuantity = current + delta;

      const category = event.ticketCategories.find(
        (cat) => cat._id === categoryId
      );

      if (newQuantity < 0) return prev;
      if (newQuantity > category.availableQuantity) {
        setError(
          `Only ${category.availableQuantity} ${category.name} tickets available`
        );
        return prev;
      }

      setError('');
      return {
        ...prev,
        [categoryId]: newQuantity,
      };
    });
  };

  const getTotalQuantity = () => {
    return Object.values(quantities).reduce((sum, qty) => sum + qty, 0);
  };

  const handleProceed = () => {
    const totalQty = getTotalQuantity();
    if (totalQty === 0) {
      setError('Please select at least one ticket');
      return;
    }

    // Build ticket details array
    const ticketDetails = Object.entries(quantities)
      .filter(([, qty]) => qty > 0)
      .map(([categoryId, qty]) => {
        const category = event.ticketCategories.find(
          (cat) => cat._id === categoryId
        );
        return {
          categoryId: category._id,
          categoryName: category.name,
          price: category.price,
          quantity: qty,
          subtotal: category.price * qty,
        };
      });

    updateSelectedTickets(ticketDetails);
    onProceed();
  };

  const totalQuantity = getTotalQuantity();
  const isDisabled = totalQuantity === 0;

  return (
    <div className="booking-step-category">
      <h3>Select Ticket Type & Quantity</h3>

      {error && <div className="booking-error">{error}</div>}

      <div className="categories-grid">
        {event.ticketCategories && event.ticketCategories.length > 0 ? (
          event.ticketCategories.map((category) => {
            const isSelected = quantities[category._id] && quantities[category._id] > 0;
            return (
              <div
                key={category._id}
                className={`category-card ${
                  category.availableQuantity === 0 ? 'sold-out' : ''
                } ${isSelected ? 'selected' : ''}`}
              >
                {/* Header Section */}
                <div className="card-section-header">
                  <h4 className="category-name">{category.name}</h4>
                </div>

                {/* Price Section */}
                <div className="card-section-price">
                  <div className="price-label">Starting at</div>
                  <div className="category-price">
                    LKR {category.price.toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                    })}
                  </div>
                </div>

                {/* Divider */}
                <div className="card-divider"></div>

                {/* Availability Section */}
                <div className="card-section-availability">
                  {category.availableQuantity > 0 ? (
                    <span className="availability-badge">
                      {category.availableQuantity} tickets available
                    </span>
                  ) : (
                    <span className="sold-out-badge">Sold Out</span>
                  )}
                </div>

                {/* Divider */}
                <div className="card-divider"></div>

                {/* Quantity Control Section */}
                <div className="card-section-quantity">
                  <button
                    className="qty-control-btn minus"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleQuantityChange(category._id, -1);
                    }}
                    disabled={!quantities[category._id] || quantities[category._id] === 0 || category.availableQuantity === 0}
                    title="Remove ticket"
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>

                  <div className="qty-counter">
                    <span className="qty-value">
                      {quantities[category._id] || 0}
                    </span>
                  </div>

                  <button
                    className="qty-control-btn plus"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleQuantityChange(category._id, 1);
                    }}
                    disabled={category.availableQuantity === 0}
                    title="Add ticket"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>

                {/* Subtotal (only show if selected) */}
                {isSelected && (
                  <div className="card-section-subtotal">
                    Subtotal: LKR{' '}
                    {(
                      (quantities[category._id] || 0) * category.price
                    ).toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                    })}
                  </div>
                )}

                {/* Selected Badge (corner indicator) */}
                {isSelected && (
                  <span className="ticket-count-badge">
                    {quantities[category._id]}
                  </span>
                )}
              </div>
            );
          })
        ) : (
          <div className="no-categories">
            <p>No ticket types available for this event</p>
          </div>
        )}
      </div>

      <div className="booking-summary">
        <div className="summary-row">
          <span>Total Tickets Selected:</span>
          <span className="summary-value">{totalQuantity}</span>
        </div>
        {totalQuantity > 0 && (
          <>
            <div className="summary-row">
              <span>Subtotal:</span>
              <span className="summary-value">
                LKR{' '}
                {Object.entries(quantities)
                  .reduce((sum, [categoryId, qty]) => {
                    const category = event.ticketCategories.find(
                      (cat) => cat._id === categoryId
                    );
                    return sum + (category?.price || 0) * qty;
                  }, 0)
                  .toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </>
        )}
      </div>

      <div className="booking-actions">
        <button
          className="btn btn-primary"
          onClick={handleProceed}
          disabled={isDisabled}
        >
          Proceed {totalQuantity > 0 ? `(${totalQuantity} ticket${totalQuantity !== 1 ? 's' : ''})` : ''}
        </button>
      </div>
    </div>
  );
};
