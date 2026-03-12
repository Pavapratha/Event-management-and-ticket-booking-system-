# Quick Reference: Booking Flow Components

## File Structure

```
frontend/src/
├── components/
│   ├── BookingModal.js          [UPDATED] Main booking orchestrator
│   ├── SelectCategory.jsx       [NEW] Step 3 - Category selection
│   ├── TicketSummary.jsx        [NEW] Step 4 - Order summary
│   ├── TicketOptions.jsx        [NEW] Step 5 - Pickup options & payment
│   ├── TicketConfirmation.jsx   [NEW] Step 6 - QR ticket display
│   ├── PaymentGateway.js        [EXISTING] Mock payment
│   ├── Icons.js                 [EXISTING] SVG icons
│   └── BookingModal.css         [UPDATED] All step styles
├── context/
│   ├── BookingContext.js        [NEW] Global booking state
│   └── AuthContext.js           [EXISTING]
├── utils/
│   └── ticketUtils.js           [NEW] Download & format utilities
└── App.js                       [UPDATED] Added BookingProvider

backend/
├── models/
│   ├── Event.js                 [UPDATED] Added ticketCategories
│   └── Booking.js               [UPDATED] New schema structure
├── controllers/
│   └── bookingController.js     [UPDATED] New logic for steps
└── routes/
    └── user.js                  [UPDATED] New endpoints
```

## Component Props

### BookingModal
```jsx
<BookingModal
  event={eventObject}           // Full event with ticketCategories
  onClose={handleClose}         // Called when modal closes
  onBookingSuccess={handleSuccess}  // Called on confirmed booking
/>
```

### SelectCategory
```jsx
<SelectCategory
  event={eventObject}
  onProceed={handleCategoryProceed}  // Called with ticketDetails
/>
```

### TicketSummary
```jsx
<TicketSummary
  event={eventObject}
  bookingId={bookingIdString}
  onProceed={handleSummaryProceed}   // Advance to options
  onCancel={handleCancelBooking}     // Cancel booking & reset
/>
```

### TicketOptions
```jsx
<TicketOptions
  event={eventObject}
  onProceedToPayment={handleProceedToPayment}
/>
```

### TicketConfirmation
```jsx
<TicketConfirmation
  event={eventObject}
  booking={bookingObject}
  onDownloadComplete={handleConfirmationComplete}
/>
```

## Context Hooks

```jsx
const {
  // State
  event,
  currentStep,
  selectedTickets,
  bookingId,
  subtotalAmount,
  bookingFee,
  totalAmount,
  pickupOption,
  qrCode,
  booking,
  loading,
  error,
  
  // Setters
  updateSelectedTickets,
  setCurrentStep,
  setEvent,
  setBookingId,
  setQRCode,
  setBooking,
  setLoading,
  setError,
  setPickupOption,
  resetBooking
} = useBooking();
```

## API Endpoints Summary

| Endpoint | Method | Payload | Response | Status |
|----------|--------|---------|----------|--------|
| `/api/bookings` | POST | `{eventId, ticketDetails}` | Pending booking | 201 |
| `/api/bookings/:id/confirm` | PATCH | `{paymentDetails}` | Confirmed booking + QR | 200 |
| `/api/bookings/:id` | DELETE | - | Cancelled booking | 200 |
| `/api/bookings` | GET | - | User's bookings | 200 |
| `/api/bookings/:id` | GET | - | Booking details | 200 |

## Key State Transitions

```
START
  ↓
[selectCategory] - User selects tickets
  ↓ POST /api/bookings
[summary] - Show booking summary
  ↓
[options] - Delivery & payment options
  ↓
[payment] - Payment gateway
  ↓ PATCH /api/bookings/:id/confirm
[confirmation] - QR ticket + download
  ↓
END
```

## Important Props & Attributes

### Event Object (ticketCategories)
```javascript
{
  _id: "ObjectId",
  title: "Concert Name",
  date: "2024-04-15T19:00:00Z",
  time: "7:00 PM",
  location: "Venue Name",
  venue: "Main Hall",
  image: "url",
  pickupInstructions: "Collect 30 mins before...",
  ticketCategories: [
    {
      _id: "ObjectId",
      name: "General Admission",
      price: 1500,
      totalQuantity: 100,
      availableQuantity: 75
    }
  ]
}
```

### Selected Tickets Array
```javascript
[
  {
    categoryId: "ObjectId",
    categoryName: "General Admission",
    price: 1500,
    quantity: 2,
    subtotal: 3000
  }
]
```

### Booking Object (Confirmed)
```javascript
{
  _id: "ObjectId",
  bookingId: "BK-A1B2C3D4",
  userId: "ObjectId",
  eventId: { ...event },
  ticketDetails: [...],
  ticketQuantity: 3,
  subtotalAmount: 4500,
  bookingFee: 100,
  totalAmount: 4600,
  status: "confirmed",
  qrCode: "data:image/png;base64,...",
  paymentDetails: {
    transactionId: "TXN-12345",
    method: "fake-payment-gateway",
    status: "completed",
    cardLast4: "1234"
  }
}
```

## CSS Class Names

### Layout Classes
- `.booking-modal-overlay` - Overlay background
- `.booking-modal` - Modal container
- `.booking-step-content` - Content area
- `.booking-steps` - Step indicator
- `.step` / `.step.active` / `.step.done` - Step items

### Step Classes
- `.booking-step-category` - Step 3
- `.booking-step-summary` - Step 4
- `.booking-step-options` - Step 5
- `.booking-step-payment` - Step 5 (payment)
- `.booking-step-confirmation` - Step 6

### Component Classes
- `.categories-grid` - Category cards
- `.category-card` - Individual category
- `.order-summary-section` - Right panel
- `.summary-panel` - Summary container
- `.digital-ticket` - Ticket display
- `.qr-code-container` - QR code area

## Import Statements

```jsx
// BookingContext
import { BookingProvider, useBooking } from './context/BookingContext';

// New Components
import { SelectCategory } from './components/SelectCategory';
import { TicketSummary } from './components/TicketSummary';
import { TicketOptions } from './components/TicketOptions';
import { TicketConfirmation } from './components/TicketConfirmation';

// Updated
import { BookingModal } from './components/BookingModal';

// Utilities
import { 
  downloadTicketAsPNG,
  downloadTicketAsPDF,
  formatCurrency,
  formatDate
} from './utils/ticketUtils';
```

## Common Errors & Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| "useBooking must be used within BookingProvider" | Context not wrapped | Wrap app with `<BookingProvider>` |
| QR code null in confirmation | QR not generated | Check backend confirmBooking endpoint |
| Download button not working | Missing html2canvas/jspdf | `npm install html2canvas jspdf` |
| Ticket details empty | Wrong API response | Check POST /api/bookings returns populated booking |
| Step indicator not showing | Missing CSS | Verify BookingModal.css is imported |
| Categories not showing | Event has no ticketCategories | Seed event with categories array |

## Testing Checklist

- [ ] Event has ticketCategories array
- [ ] SelectCategory component loads
- [ ] Qty controls work and update subtotal
- [ ] Cannot proceed without selecting tickets
- [ ] Booking created in pending status
- [ ] Summary shows correct prices
- [ ] Cancel restores availability
- [ ] Payment gateway shows correct amount
- [ ] Booking confirmed after payment
- [ ] QR code displays
- [ ] Download PNG works
- [ ] Download PDF works
- [ ] Booking ID references correct
- [ ] Pickup instructions display
- [ ] Fees calculated correctly

## Performance Tips

1. **Memoize Components**:
```jsx
const SelectCategory = React.memo(({ event, onProceed }) => {...});
```

2. **Lazy Load Modal**:
```jsx
const BookingModal = React.lazy(() => import('./BookingModal'));
```

3. **Optimize Images**:
- Compress event images
- Use next-gen formats (WebP)

4. **Debounce API Calls**:
```jsx
const handleQuantityChange = debounce(() => {
  // Call API
}, 300);
```

## Security Considerations

1. **JWT Token**: All API calls include `Authorization: Bearer {token}`
2. **User Validation**: Backend verifies booking belongs to user
3. **Price Validation**: Backend re-checks prices before confirmation
4. **Availability Check**: Verified twice (creation & confirmation)
5. **Payment Details**: Stored minimally, never full card data

## Deployment Checklist

- [ ] Backend has QRCode npm package
- [ ] Frontend has html2canvas, jspdf, qrcode packages
- [ ] Environment variables set correctly
- [ ] Database has indexes for performance
- [ ] CORS configured for API
- [ ] Email service configured (if notifications enabled)
- [ ] Event documents have ticketCategories
- [ ] Test complete flow in staging
- [ ] Monitor error logs in production
