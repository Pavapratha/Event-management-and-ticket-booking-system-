import React, { createContext, useState, useCallback } from 'react';

export const BookingContext = createContext();

export const BookingProvider = ({ children }) => {
  const [bookingState, setBookingState] = useState({
    event: null,
    currentStep: 'eventInfo', // eventInfo, selectCategory, summary, payment, confirmation
    selectedTickets: [], // Array of { categoryId, categoryName, price, quantity, subtotal }
    bookingId: null,
    subtotalAmount: 0,
    bookingFee: 100,
    totalAmount: 0,
    pickupOption: 'box-office',
    qrCode: null,
    booking: null,
    loading: false,
    error: null,
  });

  const updateSelectedTickets = useCallback((ticketDetails) => {
    let subtotal = 0;
    let totalQuantity = 0;

    ticketDetails.forEach((ticket) => {
      subtotal += ticket.subtotal || ticket.price * ticket.quantity;
      totalQuantity += ticket.quantity;
    });

    const fee = 100;
    const total = subtotal + fee;

    setBookingState((prev) => ({
      ...prev,
      selectedTickets: ticketDetails,
      subtotalAmount: subtotal,
      bookingFee: fee,
      totalAmount: total,
    }));
  }, []);

  const setCurrentStep = useCallback((step) => {
    setBookingState((prev) => ({
      ...prev,
      currentStep: step,
    }));
  }, []);

  const setEvent = useCallback((event) => {
    setBookingState((prev) => ({
      ...prev,
      event,
    }));
  }, []);

  const setBookingId = useCallback((id) => {
    setBookingState((prev) => ({
      ...prev,
      bookingId: id,
    }));
  }, []);

  const setQRCode = useCallback((qrCode) => {
    setBookingState((prev) => ({
      ...prev,
      qrCode,
    }));
  }, []);

  const setBooking = useCallback((booking) => {
    setBookingState((prev) => ({
      ...prev,
      booking,
      qrCode: booking?.qrCode || prev.qrCode,
    }));
  }, []);

  const setLoading = useCallback((loading) => {
    setBookingState((prev) => ({
      ...prev,
      loading,
    }));
  }, []);

  const setError = useCallback((error) => {
    setBookingState((prev) => ({
      ...prev,
      error,
    }));
  }, []);

  const setPickupOption = useCallback((option) => {
    setBookingState((prev) => ({
      ...prev,
      pickupOption: option,
    }));
  }, []);

  const resetBooking = useCallback(() => {
    setBookingState({
      event: null,
      currentStep: 'eventInfo',
      selectedTickets: [],
      bookingId: null,
      subtotalAmount: 0,
      bookingFee: 100,
      totalAmount: 0,
      pickupOption: 'box-office',
      qrCode: null,
      booking: null,
      loading: false,
      error: null,
    });
  }, []);

  const value = {
    ...bookingState,
    updateSelectedTickets,
    setCurrentStep,
    setEvent,
    setBookingId,
    setQRCode,
    setBooking,
    setLoading,
    setError,
    setPickupOption,
    resetBooking,
  };

  return (
    <BookingContext.Provider value={value}>
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => {
  const context = React.useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within BookingProvider');
  }
  return context;
};
