const Event = require('../models/Event');
const Booking = require('../models/Booking');

const CATEGORY_KEYWORDS = ['music', 'sports', 'technology', 'food', 'drink', 'arts', 'business', 'education'];
const BOOKING_LINK = '/my-bookings';
const CANCELLATION_POLICY = 'Cancellations are handled before the event starts. Refund timing depends on the organizer and payment flow.';
const GUEST_OPTIONS = [
  { id: '1', label: 'View Events', prompt: 'What events are available?' },
  { id: '2', label: 'Book Ticket', prompt: 'How do I book a ticket?' },
  { id: '3', label: 'Payment Help', prompt: 'How do I pay for tickets?' },
];

const AUTH_OPTIONS = [
  { id: '1', label: 'View Events', prompt: 'What events are available?' },
  { id: '2', label: 'Book Ticket', prompt: 'How do I book a ticket?' },
  { id: '3', label: 'My Bookings', prompt: 'Where are my bookings?' },
  { id: '4', label: 'Cancel Ticket', prompt: 'How do I cancel a ticket?' },
  { id: '5', label: 'Payment Help', prompt: 'How do I pay for tickets?' },
];

const INTENT_PATTERNS = {
  greetingIntent: [/(hello|hi|hey)\b/],
  refundIntent: [/refund/],
  cancelIntent: [
    /cancel/,
    /cancellation/,
    /cancel my booking/,
    /cancel booking/,
    /cancel a booking/,
    /cancel my ticket/,
    /cancel ticket/,
    /how to cancel/,
    /refund/,
  ],
  bookingIntent: [
    /where can i see my bookings/,
    /where can i find my bookings/,
    /where are my bookings/,
    /where are my tickets/,
    /show my bookings/,
    /see my booking/,
    /booking history/,
    /my bookings/,
    /my tickets/,
    /booking status/,
    /manage my bookings/,
  ],
  bookingGuideIntent: [
    /how can i book/,
    /how do i book/,
    /book a ticket/,
    /book tickets/,
    /buy a ticket/,
    /ticket booking/,
    /booking tickets/,
  ],
  paymentIntent: [
    /how do i pay/,
    /payment/,
    /pay for tickets/,
    /ticket payment/,
    /checkout/,
    /payment method/,
  ],
  recommendationIntent: [/(recommend|suggest an event)/],
  eventsIntent: [
    /what events are available/,
    /upcoming events/,
    /available events/,
    /show events/,
    /find events/,
    /events available/,
    /what events do you have/,
  ],
  accountIntent: [/(login|log in|register|account|sign in|sign up)/],
};

const PROTECTED_INTENTS = new Set(['bookingIntent', 'cancelIntent']);
const GUEST_RESTRICTED_REPLY = 'You need to log in to view or manage your bookings.';

const normalizeMessage = (message = '') => message.trim().toLowerCase();

const matchesAny = (message, patterns) => patterns.some((pattern) => pattern.test(message));

const formatEventDate = (value) =>
  new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

const formatCurrency = (value) => {
  const amount = Number(value || 0);
  return amount === 0
    ? 'Free'
    : `Rs. ${amount.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
};

const detectCategory = (message) => {
  const matched = CATEGORY_KEYWORDS.find((category) => message.includes(category));
  if (!matched) {
    return null;
  }

  if (matched === 'food' || matched === 'drink') {
    return 'Food & Drink';
  }

  return matched.charAt(0).toUpperCase() + matched.slice(1);
};

const fetchUpcomingEvents = async ({ limit = 5, category = null } = {}) => {
  const query = {
    status: 'active',
    date: { $gte: new Date() },
  };

  if (category) {
    query.category = category;
  }

  return Event.find(query)
    .sort({ date: 1 })
    .limit(limit)
    .select('title date location price availableSeats category');
};

const fetchUserBookings = async (userId) =>
  Booking.find({ userId })
    .populate('eventId', 'title date location')
    .sort({ createdAt: -1 })
    .limit(5);

const buildEventLine = (event) => {
  const availability = event.availableSeats > 0 ? `${event.availableSeats} seats left` : 'Sold out';
  return `${event.title} · ${formatEventDate(event.date)} · ${event.location} · ${formatCurrency(event.price)} · ${availability}`;
};

const buildBookingLine = (booking) => {
  const title = booking.eventId?.title || 'Unknown event';
  const when = booking.eventId?.date ? formatEventDate(booking.eventId.date) : 'Date unavailable';
  return `${booking.bookingId} · ${title} · ${when} · ${booking.status}`;
};

const createGreetingResponse = (isLoggedIn, userName) => {
  if (isLoggedIn && userName) {
    return {
      reply: `Hello ${userName} 👋 How can I help you today?`,
    };
  }

  if (isLoggedIn) {
    return {
      reply: 'Hello 👋 How can I help you today?',
    };
  }

  return {
    reply: 'Hello 👋 How can I help you today?',
  };
};

const createEventsResponse = async (message) => {
  const category = detectCategory(message);
  const upcomingEvents = await fetchUpcomingEvents({ limit: 5, category });

  if (!upcomingEvents.length) {
    return {
      reply: category
        ? `I could not find any upcoming ${category} events right now.`
        : 'I could not find any upcoming events right now.',
      data: { upcomingEvents: [] },
    };
  }

  const heading = category ? `Upcoming ${category} events:` : 'Upcoming events:';

  return {
    reply: `${heading}\n- ${upcomingEvents.map(buildEventLine).join('\n- ')}`,
    data: {
      upcomingEvents: upcomingEvents.map((event) => ({
        id: event._id,
        title: event.title,
        date: event.date,
        location: event.location,
        price: event.price,
        availableSeats: event.availableSeats,
        category: event.category,
      })),
    },
  };
};

const createRecommendationResponse = async () => {
  const upcomingEvents = await fetchUpcomingEvents({ limit: 3 });

  if (!upcomingEvents.length) {
    return {
      reply: 'I do not have any upcoming events to recommend right now.',
      data: { upcomingEvents: [] },
    };
  }

  return {
    reply: `Recommended events:\n- ${upcomingEvents.map(buildEventLine).join('\n- ')}`,
    data: {
      upcomingEvents: upcomingEvents.map((event) => ({
        id: event._id,
        title: event.title,
        date: event.date,
        location: event.location,
      })),
    },
  };
};

const createBookingGuideResponse = () => ({
  reply:
    'How to book:\n1. Open the Events page.\n2. Select your event.\n3. Choose ticket quantity or category.\n4. Complete checkout.\n5. After payment, your QR ticket and invoice appear in /my-bookings.',
});

const createPaymentResponse = () => ({
  reply:
    'To pay for tickets:\n1. Choose your event and ticket quantity.\n2. Continue to checkout.\n3. Complete the payment step shown on screen.\n4. After successful payment, your booking is confirmed and appears in /my-bookings.',
});

const createRefundResponse = () => ({
  reply:
    `Refunds are available depending on the event's cancellation policy. Check the booking in ${BOOKING_LINK}, review the event terms, and use the cancel option if it is available.`,
});

const createGuestRestrictedResponse = () => ({
  reply: GUEST_RESTRICTED_REPLY,
});

const createBookingsResponse = async (isLoggedIn, userId) => {
  if (!isLoggedIn || !userId) {
    return createGuestRestrictedResponse();
  }

  const userBookings = await fetchUserBookings(userId);

  if (!userBookings.length) {
    return {
      reply: `You do not have any bookings yet. Once you book an event, you can manage it at ${BOOKING_LINK}.`,
      data: { userBookings: [] },
    };
  }

  return {
    reply: `Your current bookings:\n- ${userBookings.map(buildBookingLine).join('\n- ')}\nOpen ${BOOKING_LINK} to view details, invoices, or cancellations.`,
    data: {
      userBookings: userBookings.map((booking) => ({
        id: booking._id,
        bookingId: booking.bookingId,
        status: booking.status,
        eventTitle: booking.eventId?.title || null,
        eventDate: booking.eventId?.date || null,
      })),
    },
  };
};

const createCancellationResponse = async (isLoggedIn, userId) => {
  if (!isLoggedIn || !userId) {
    return createGuestRestrictedResponse();
  }

  const userBookings = await fetchUserBookings(userId);

  if (!userBookings.length) {
    return {
      reply: `I could not find any bookings to cancel. You can check ${BOOKING_LINK} after you make a booking.`,
      data: { userBookings: [] },
    };
  }

  const activeBookings = userBookings.filter((booking) => booking.status !== 'cancelled');
  const candidateBookings = activeBookings.length ? activeBookings : userBookings;
  const firstBooking = candidateBookings[0];
  const firstTitle = firstBooking.eventId?.title || 'your event';
  const firstDate = firstBooking.eventId?.date ? formatEventDate(firstBooking.eventId.date) : 'the scheduled date';

  return {
    reply:
      `I see you have a booking for ${firstTitle} on ${firstDate}. Would you like to cancel ${firstBooking.bookingId}?\n\nYour bookings:\n- ${candidateBookings
        .map(buildBookingLine)
        .join('\n- ')}\n\nPolicy: ${CANCELLATION_POLICY}\n\nSteps:\n1. Open ${BOOKING_LINK}.\n2. Select the booking you want to cancel.\n3. Tap the cancel action and confirm.`,
    data: {
      userBookings: candidateBookings.map((booking) => ({
        id: booking._id,
        bookingId: booking.bookingId,
        status: booking.status,
        eventTitle: booking.eventId?.title || null,
        eventDate: booking.eventId?.date || null,
      })),
    },
  };
};

const createAccountHelpResponse = (isLoggedIn) => ({
  reply: isLoggedIn
    ? `You are already logged in. You can manage bookings in ${BOOKING_LINK} and notifications from your dashboard.`
    : 'For account access, use Login or Register from the top navigation. After login, you can manage bookings and notifications from your dashboard.',
});

const createFallbackResponse = () => ({
  reply: 'I can help with events, ticket booking, payments, and booking support. Ask about one of those topics.',
});

const detectIntent = (message) => {
  if (!message) {
    return 'fallbackIntent';
  }

  const allOptions = [...GUEST_OPTIONS, ...AUTH_OPTIONS];
  const selectedOption = allOptions.find((option) => option.id === message);
  if (selectedOption) {
    return detectIntent(normalizeMessage(selectedOption.prompt));
  }

  if (matchesAny(message, INTENT_PATTERNS.greetingIntent)) {
    return 'greetingIntent';
  }

  if (matchesAny(message, INTENT_PATTERNS.cancelIntent)) {
    return 'cancelIntent';
  }

  if (matchesAny(message, INTENT_PATTERNS.refundIntent)) {
    return 'refundIntent';
  }

  if (matchesAny(message, INTENT_PATTERNS.bookingIntent)) {
    return 'bookingIntent';
  }

  if (matchesAny(message, INTENT_PATTERNS.bookingGuideIntent)) {
    return 'bookingGuideIntent';
  }

  if (matchesAny(message, INTENT_PATTERNS.paymentIntent)) {
    return 'paymentIntent';
  }

  if (matchesAny(message, INTENT_PATTERNS.recommendationIntent)) {
    return 'recommendationIntent';
  }

  if (matchesAny(message, INTENT_PATTERNS.eventsIntent)) {
    return 'eventsIntent';
  }

  if (matchesAny(message, INTENT_PATTERNS.accountIntent)) {
    return 'accountIntent';
  }

  return 'fallbackIntent';
};

const processMessage = async ({ message, userId = null, userName = '' }) => {
  const normalizedMessage = normalizeMessage(message);
  const isLoggedIn = Boolean(userId);
  const intent = detectIntent(normalizedMessage);

  switch (intent) {
    case 'greetingIntent':
      return createGreetingResponse(isLoggedIn, userName);
    case 'eventsIntent':
      return createEventsResponse(normalizedMessage);
    case 'recommendationIntent':
      return createRecommendationResponse();
    case 'bookingGuideIntent':
      return createBookingGuideResponse();
    case 'paymentIntent':
      return createPaymentResponse();
    case 'refundIntent':
      return createRefundResponse();
    case 'cancelIntent':
      return createCancellationResponse(isLoggedIn, userId);
    case 'bookingIntent':
      return createBookingsResponse(isLoggedIn, userId);
    case 'accountIntent':
      return createAccountHelpResponse(isLoggedIn);
    default:
      return createFallbackResponse();
  }
};

module.exports = {
  detectIntent,
  PROTECTED_INTENTS,
  GUEST_OPTIONS,
  AUTH_OPTIONS,
  processMessage,
};