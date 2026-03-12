# Complete Booking Flow Implementation Guide

## Overview
This guide documents the complete 4-step booking flow (Steps 3-6) implemented for the event management and ticket booking system.

## Architecture

### Backend Changes

#### 1. **Event Model Enhancement** (`backend/models/Event.js`)
Added support for multiple ticket categories per event:

```javascript
{
  ticketCategories: [{
    name: "General Admission",
    price: 1500,
    totalQuantity: 100,
    availableQuantity: 75
  }],
  venue: "String",
  pickupInstructions: "String"
}
```

#### 2. **Booking Model Update** (`backend/models/Booking.js`)
Updated to support category-based bookings with pending/confirmed status flow:

```javascript
{
  bookingId: "BK-XXXXX",
  ticketDetails: [{
    categoryId: "ObjectId",
    categoryName: "General Admission",
    price: 1500,
    quantity: 2,
    subtotal: 3000
  }],
  ticketQuantity: 2,
  subtotalAmount: 3000,
  bookingFee: 100,
  totalAmount: 3100,
  status: "pending" | "confirmed" | "cancelled",
  qrCode: "data:image/png;base64,...",
  paymentDetails: {
    transactionId: "TXN-123",
    method: "fake-payment-gateway",
    status: "completed",
    cardLast4: "1234"
  }
}
```

#### 3. **Updated API Endpoints** (`backend/routes/user.js`)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/bookings` | Create pending booking |
| GET | `/api/bookings` | Get user's bookings |
| GET | `/api/bookings/:id` | Get specific booking details |
| PATCH | `/api/bookings/:id/confirm` | Confirm booking after payment |
| DELETE | `/api/bookings/:id` | Cancel booking |

#### 4. **Booking Controller Logic** (`backend/controllers/bookingController.js`)

**CreateBooking**
- Validates ticket availability
- Creates booking in "pending" status
- Does NOT deduct seats yet

**ConfirmBooking**
- Verifies availability again
- Generates QR code
- Updates booking to "confirmed" status
- Deducts tickets from event
- Sends confirmation email

**CancelBooking**
- Restores seats if booking was confirmed
- Sets booking to "cancelled"
- Applies to both pending and confirmed bookings

### Frontend Changes

#### 1. **BookingContext** (`frontend/src/context/BookingContext.js`)
Global state management for the entire booking flow:

```javascript
{
  event: Object,
  currentStep: "selectCategory" | "summary" | "options" | "confirmation",
  selectedTickets: Array,
  bookingId: String,
  subtotalAmount: Number,
  bookingFee: 100,
  totalAmount: Number,
  pickupOption: "box-office",
  qrCode: String,
  booking: Object,
  loading: Boolean,
  error: String
}
```

#### 2. **Step Components**

**Step 3: SelectCategory** (`SelectCategory.jsx`)
- Displays all ticket categories from event
- Shows price and availability per category
- +/- quantity controls
- Live total calculation
- Disabled "Proceed" button until tickets selected
- Creates pending booking via POST /api/bookings

**Step 4: TicketSummary** (`TicketSummary.jsx`)
- Shows event details (name, date, time, venue)
- Lists selected tickets with quantities
- Price breakdown (subtotal + fee)
- Cancel Transaction button (calls DELETE /api/bookings/:id)
- Resets flow on cancel

**Step 5: TicketOptions** (`TicketOptions.jsx`)
- Displays pickup option (radio selection)
- Shows pickup instructions from backend
- Right-side sticky order summary panel
- Shows subtotal, booking fee, total
- "Proceed to Pay" button

**Step 6: TicketConfirmation** (`TicketConfirmation.jsx`)
- Success badge and message
- Styled digital ticket display with:
  - Event details
  - Ticket breakdown
  - Booking ID reference
  - Inline QR code (from backend)
  - Price summary
  - Collection instructions
- Download actions (PNG/PDF)
- Confirmation info message

#### 3. **Updated BookingModal** (`BookingModal.js`)
- Orchestrates all step transitions
- Manages API calls for each step
- Shows error handling and loading states
- Step indicator (3/4/5/6)
- Coordinates between BookingContext and API

#### 4. **Styling** (`BookingModal.css`)
Comprehensive CSS with:
- Modal overlay and animations
- Step indicator styling
- Category card grid layout
- Summary sections
- Digital ticket display
- Download action buttons
- Responsive design (mobile-first)

#### 5. **Utilities** (`utils/ticketUtils.js`)
- `downloadTicketAsPNG()` - Uses html2canvas
- `downloadTicketAsPDF()` - Uses jsPDF
- `formatCurrency()` - LKR formatting
- `formatDate()` - Date formatting

## Booking Flow Steps

### Step 3: Select Ticket Categories
```
User clicks "Book Event" → SelectCategory component opens
↓
User selects qty for each category
↓
Live total updates
↓
"Proceed" button POST to /api/bookings
↓
Server creates booking in "pending" status
↓
bookingId stored in context
↓
Advance to Step 4
```

### Step 4: Ticket Summary
```
Display summary of selected tickets
↓
Show event details and pricing
↓
User can "Cancel Transaction" → DELETE /api/bookings/:id
↓
Or "Proceed" to Step 5
```

### Step 5: Ticket Options & Payment
```
Show pickup options (box office)
↓
Display pickup instructions
↓
Right panel shows final price breakdown
↓
"Proceed to Pay" → Show PaymentGateway component
↓
User enters card details (mock)
↓
On success → PATCH /api/bookings/:id/confirm
↓
Server deducts tickets, generates QR, changes status to "confirmed"
↓
Advance to Step 6
```

### Step 6: QR Ticket Confirmation
```
Show success badge
↓
Display digital ticket with:
  - Event data
  - QR code (data URL from backend)
  - Booking reference
  - Price breakdown
↓
Download actions (PNG/PDF using html2canvas/jsPDF)
↓
Show confirmation message
↓
"Back to Events" closes modal
```

## Key Features

### 1. **Two-Phase Booking**
- Step 1: Create pending booking (no seats deducted)
- Step 2: Confirm booking after payment (deduct seats)

### 2. **Availability Guarantee**
- Validated at creation time
- Re-checked at confirmation time
- Handles race conditions gracefully

### 3. **QR Code Generation**
- Generated on backend using `qrcode` npm package
- Encoded as data URL
- Contains booking ID, event, quantity, amount
- Displayed in confirmation step
- User can download with ticket

### 4. **Ticket Download**
- PNG download via `html2canvas`
- PDF download via `jsPDF`
- Preserves styling and layout
- Includes all booking details

### 5. **Responsive Design**
- Mobile-friendly step indicators
- Collapsible summary panel on mobile
- Touch-friendly buttons and controls
- Full-width layout on small screens

### 6. **Error Handling**
- Network failure recovery
- Availability changes between steps
- User-friendly error messages
- Ability to cancel and retry

## Setup Instructions

### Backend Setup

1. **Update Event Documents** (Add ticket categories to existing events):
```javascript
db.events.updateOne(
  { _id: ObjectId("...") },
  {
    $set: {
      ticketCategories: [
        {
          name: "General Admission",
          price: 1500,
          totalQuantity: 100,
          availableQuantity: 100
        },
        {
          name: "VIP",
          price: 2500,
          totalQuantity: 30,
          availableQuantity: 30
        }
      ],
      venue: "Colombo City Centre",
      pickupInstructions: "Collect from box office 30 mins before event"
    }
  }
)
```

2. **Verify Routes** are accessible:
```bash
# The following should all work:
POST   /api/bookings
GET    /api/bookings
GET    /api/bookings/:id
PATCH  /api/bookings/:id/confirm
DELETE /api/bookings/:id
```

### Frontend Setup

1. **Install Dependencies**:
```bash
cd frontend
npm install
```

2. **BookingProvider Wrapping**:
Already added to App.js - wraps AuthProvider

3. **Environment Variables**:
Ensure `REACT_APP_API_URL` is set in `.env`:
```
REACT_APP_API_URL=http://localhost:5000
```

4. **Update EventCard or Home Component**:
```jsx
import { BookingModal } from './components/BookingModal';

// In component:
const [bookingEvent, setBookingEvent] = useState(null);

<BookingModal
  event={bookingEvent}
  onClose={() => setBookingEvent(null)}
  onBookingSuccess={(booking) => {
    // Refresh event list or show notification
  }}
/>
```

## API Contract Examples

### Create Pending Booking
```bash
POST /api/bookings
Authorization: Bearer <token>
Content-Type: application/json

{
  "eventId": "64f1a2b3c4d5e6f7g8h9i0j1",
  "ticketDetails": [
    {
      "categoryId": "64f1a2b3c4d5e6f7g8h9i0j2",
      "quantity": 2
    },
    {
      "categoryId": "64f1a2b3c4d5e6f7g8h9i0j3",
      "quantity": 1
    }
  ]
}

Response (201):
{
  "success": true,
  "booking": {
    "_id": "64f1a2b3c4d5e6f7g8h9i0j4",
    "bookingId": "BK-A1B2C3D4",
    "userId": "...",
    "eventId": {...},
    "ticketDetails": [...],
    "ticketQuantity": 3,
    "subtotalAmount": 5500,
    "bookingFee": 100,
    "totalAmount": 5600,
    "status": "pending",
    "qrCode": null,
    "createdAt": "2024-03-12T10:30:00Z"
  }
}
```

### Confirm Booking
```bash
PATCH /api/bookings/64f1a2b3c4d5e6f7g8h9i0j4/confirm
Authorization: Bearer <token>
Content-Type: application/json

{
  "paymentDetails": {
    "transactionId": "TXN-12345",
    "method": "fake-payment-gateway",
    "status": "completed",
    "cardLast4": "1234"
  }
}

Response (200):
{
  "success": true,
  "booking": {
    ...
    "status": "confirmed",
    "qrCode": "data:image/png;base64,...",
    "paymentDetails": {...}
  }
}
```

### Cancel Booking
```bash
DELETE /api/bookings/64f1a2b3c4d5e6f7g8h9i0j4
Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "message": "Booking cancelled successfully",
  "booking": {
    ...
    "status": "cancelled"
  }
}
```

## Testing the Flow

### 1. **Create a Test Event** with ticket categories:
```bash
POST /api/admin/events
{
  "title": "Test Concert",
  "description": "A test event for booking flow",
  "category": "Music",
  "date": "2024-04-15T19:00:00Z",
  "time": "7:00 PM",
  "location": "Colombo City Centre",
  "venue": "Main Hall",
  "price": 1500,
  "totalSeats": 150,
  "availableSeats": 150,
  "ticketCategories": [
    {
      "name": "General Admission",
      "price": 1500,
      "totalQuantity": 100,
      "availableQuantity": 100
    },
    {
      "name": "VIP",
      "price": 2500,
      "totalQuantity": 30,
      "availableQuantity": 30
    }
  ]
}
```

### 2. **Test Complete Booking Flow**:
1. Login as user
2. Browse events
3. Click "Book Event"
4. Select ticket categories and quantities
5. Review summary
6. Enter pickup options
7. Process payment (mock)
8. Download ticket (PNG/PDF)
9. Verify booking appears in /tickets dashboard

### 3. **Test Error Cases**:
- Sold out category
- Network failure (cancel)
- Invalid quantities
- Duplicate booking attempts

## Database Indexes

For optimal performance, add these indexes:

```javascript
// Booking collection
db.bookings.createIndex({ userId: 1, createdAt: -1 })
db.bookings.createIndex({ eventId: 1 })
db.bookings.createIndex({ status: 1 })
db.bookings.createIndex({ bookingId: 1 }, { unique: true })

// Event collection
db.events.createIndex({ status: 1, date: 1 })
db.events.createIndex({ category: 1 })
```

## Performance Considerations

1. **Pagination**: For user bookings list, implement pagination on GET /api/bookings
2. **Caching**: Cache event details with ticket categories
3. **Async Email**: Send confirmation emails asynchronously
4. **QR Generation**: Pre-generate QR codes for better performance

## Future Enhancements

1. **Email Notifications**: Send booking confirmation with ticket attachment
2. **Multiple Payment Methods**: Stripe, PayPal, Local Cards
3. **Group Bookings**: Discount for bulk ticket purchases
4. **Dynamic Pricing**: Time-based or demand-based pricing
5. **Seat Selection**: Choose specific seats (for venue-based events)
6. **Ticket Transfer**: Allow users to transfer tickets
7. **Cancellation Policies**: Refund policies and grace periods
8. **Analytics**: Booking funnel analysis and conversion tracking

## Troubleshooting

### QR Code Not Showing
- Check that `qrcode` npm package is installed on backend
- Verify QRCode.toDataURL() is being called
- Check browser console for CORS errors

### Download Not Working
- Ensure `html2canvas` and `jspdf` are installed
- Check browser console for errors
- Verify ticket ref element is properly mounted

### Booking Status Not Updating
- Check database connection
- Verify JWT token is valid
- Check backend logs for errors
- Ensure event has ticketCategories array

### Styles Not Showing
- Clear browser cache
- Restart frontend dev server
- Verify BookingModal.css is imported
- Check for CSS conflicts

## Support
For issues or questions regarding the booking flow implementation, refer to the IMPLEMENTATION_COMPLETE.md and ARCHITECTURE_GUIDE.md files.
