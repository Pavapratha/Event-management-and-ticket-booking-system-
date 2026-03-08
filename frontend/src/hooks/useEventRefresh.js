import { useEffect, useCallback } from 'react';
import api from '../services/api';

/**
 * Custom hook to auto-refresh events when admin makes changes
 * Uses polling to check for updated events
 * @param {function} setEvents - State setter for events
 * @param {function} setLoading - State setter for loading state
 * @param {number} pollInterval - Polling interval in milliseconds (default: 30000 = 30 seconds)
 */
export const useEventRefresh = (setEvents, setLoading, pollInterval = 30000) => {
  // Fetch events function
  const fetchEvents = useCallback(async () => {
    try {
      const res = await api.get('/api/events');
      if (res.data && res.data.events) {
        setEvents(res.data.events);
      }
    } catch (err) {
      console.error('Failed to fetch events:', err);
    }
  }, [setEvents]);

  // Set up polling when component mounts
  useEffect(() => {
    // Fetch immediately
    if (setLoading) setLoading(true);
    fetchEvents().finally(() => {
      if (setLoading) setLoading(false);
    });

    // Set up interval for polling
    const intervalId = setInterval(() => {
      fetchEvents();
    }, pollInterval);

    // Cleanup interval on unmount
    return () => clearInterval(intervalId);
  }, [fetchEvents, pollInterval, setLoading]);

  // Return refetch function in case manual refresh is needed
  return { refetch: fetchEvents };
};

/**
 * Custom hook to refresh user bookings
 * @param {function} setBookings - State setter for bookings
 * @param {number} pollInterval - Polling interval in milliseconds (default: 20000)
 */
export const useBookingRefresh = (setBookings, pollInterval = 20000) => {
  const fetchBookings = useCallback(async () => {
    try {
      const res = await api.get('/api/user/bookings');
      if (res.data && res.data.bookings) {
        setBookings(res.data.bookings);
      }
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
    }
  }, [setBookings]);

  useEffect(() => {
    fetchBookings();

    const intervalId = setInterval(() => {
      fetchBookings();
    }, pollInterval);

    return () => clearInterval(intervalId);
  }, [fetchBookings, pollInterval]);

  return { refetch: fetchBookings };
};

/**
 * Custom hook for event polling with smart caching
 * Only refetches if events have been updated since last fetch
 * @param {function} setEvents - State setter
 * @param {number} pollInterval - Polling interval
 */
export const useSmartEventRefresh = (setEvents, pollInterval = 30000) => {
  let lastFetchTime = 0;
  let cachedEvents = [];

  const fetchEvents = useCallback(async () => {
    try {
      const res = await api.get('/api/events');
      const newEvents = res.data?.events || [];

      // Simple cache validation: check if event count or first event changed
      if (
        newEvents.length !== cachedEvents.length ||
        (newEvents.length > 0 && newEvents[0]._id !== cachedEvents[0]?._id)
      ) {
        cachedEvents = newEvents;
        setEvents(newEvents);
        lastFetchTime = Date.now();
      }
    } catch (err) {
      console.error('Failed to fetch events:', err);
    }
  }, [setEvents]);

  useEffect(() => {
    fetchEvents();

    const intervalId = setInterval(() => {
      fetchEvents();
    }, pollInterval);

    return () => clearInterval(intervalId);
  }, [fetchEvents, pollInterval]);

  return { refetch: fetchEvents };
};
