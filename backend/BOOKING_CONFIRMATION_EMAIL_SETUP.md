# Booking Confirmation Email System

## Overview
This system automatically sends booking confirmation emails to users immediately after they successfully book event tickets and payment is confirmed. Confirmation emails include comprehensive booking details, and in-app notifications are also created for users.

## Features

✅ **Automatic Email Sending**
- Triggered immediately after booking confirmation (after payment)
- Non-blocking: Email failures do not prevent booking confirmation
- Includes comprehensive booking details in professional HTML template

✅ **Email Content Includes**
- Event name and date/time
- Venue/location information
- Ticket types and quantities
- Booking ID/Reference number
- Total amount paid
- Booking date
- QR code section with booking ID
- Thank you message and event entry instructions
- Support contact information

✅ **In-App Notifications**
- Booking confirmation notification created in MongoDB
- Displayed in user's Notifications page
- Users can mark as read

✅ **Frontend Feedback**
- Success toast shows: "✅ Booking confirmed! A confirmation email has been sent to [user email]"
- Auto-dismisses after 5 seconds
- Can be manually closed

## Architecture

### Backend Components

#### 1. **Email Transporter** (`config/email.js`)
- Configures Nodemailer with SMTP settings
- Validates environment variables on startup
- Supports Gmail, SendGrid, AWS SES, and custom SMTP providers
- Error handling and logging

#### 2. **Email Controller** (`controllers/emailController.js`)
- **`sendConfirmationEmail(booking)`**: Main function to send booking confirmation emails
  - Accepts populated booking object with userId and eventId details
  - Generates HTML email with inline styles
  - Handles errors gracefully (non-blocking)
  - Returns true/false based on success

#### 3. **Booking Controller** (`controllers/bookingController.js`)
- **`confirmBooking()`**: Enhanced to call email functions
  - After booking.save() and payment confirmation:
    1. Calls `sendConfirmationEmail(populatedBooking)`
    2. Creates `booking_confirmation` notification
  - Both email and notification calls are wrapped in try/catch
  - Email/notification failures do not block booking response

#### 4. **Notification Model** (`models/Notification.js`)
- Stores booking confirmations with type: `'booking_confirmation'`
- Fields: userId, eventId, title, message, type, read, targetAll, scheduledFor
- Unique sparse index prevents duplicate notifications

### Frontend Components

#### 1. **BookingModal** (`frontend/src/components/BookingModal.js`)
- Enhanced `handlePaymentSuccess()`:
  - Extracts user email from response
  - Sets success message with email
  - Auto-hides after 5 seconds
  - Navigates to confirmation step

#### 2. **Success Banner** (`frontend/src/components/BookingModal.css`)
- Green banner with slide-down animation
- Shows confirmation message with user email
- Manual close button (×)

#### 3. **Notifications Page** (`frontend/src/pages/Notifications.js`)
- Displays all booking confirmation notifications
- Users can mark as read
- Shows booking details in notification

## Setup Instructions

### 1. Environment Variables

Configure the following in `.env` file:

```env
# Email Configuration (SMTP)
SMTP_HOST=smtp.gmail.com              # SMTP server host
SMTP_PORT=587                         # SMTP port (587 for TLS, 465 for SSL)
SMTP_SECURE=false                     # false for port 587, true for port 465
SMTP_USER=your_email@gmail.com        # SMTP username
SMTP_PASSWORD=xxxx xxxx xxxx xxxx     # SMTP password (see below for Gmail app password)
SMTP_FROM_EMAIL=noreply@yourdomain.com # Sender email address

FRONTEND_URL=http://localhost:3000    # Frontend URL (for dashboard links in email)
```

### 2. Gmail Setup (Recommended for Development)

1. **Enable 2-Step Verification**:
   - Go to https://myaccount.google.com/
   - Click "Security" in the left menu
   - Enable "2-Step Verification" (if not already enabled)

2. **Generate App Password**:
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" as the app
   - Select "Windows Computer" (or your device type)
   - Google will generate a 16-character password
   - Copy this password to `SMTP_PASSWORD` in `.env`

3. **Example Configuration**:
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your_email@gmail.com
   SMTP_PASSWORD=xxxx xxxx xxxx xxxx  # 16-character app password
   SMTP_FROM_EMAIL=your_email@gmail.com
   ```

### 3. Alternative SMTP Providers

#### SendGrid
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASSWORD=SG.your_sendgrid_api_key_here
SMTP_FROM_EMAIL=noreply@yourdomain.com
```

#### AWS SES
```env
SMTP_HOST=email-smtp.region.amazonaws.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_ses_username
SMTP_PASSWORD=your_ses_password
SMTP_FROM_EMAIL=verified_email@yourdomain.com
```

### 4. Dependencies

Required packages (already installed):
- `nodemailer` (^6.9.7)
- `express`, `mongoose`, `bcryptjs`, etc.

Verify installation:
```bash
cd backend
npm list nodemailer
```

## Testing

### Test 1: Verify Email Configuration

```bash
# Check email transporter verification on startup
npm start
# Look for: "✅ EMAIL TRANSPORTER VERIFIED" in console
```

### Test 2: Make a Booking and Check Email

1. **Start Backend & Frontend**:
   ```bash
   # Terminal 1: Backend
   cd backend
   npm start

   # Terminal 2: Frontend
   cd frontend
   npm start
   ```

2. **Create Test Event** (Admin):
   - Log in as admin at http://localhost:3001/admin
   - Create an event with available tickets

3. **Book Ticket** (User):
   - Log in as regular user at http://localhost:3000
   - View event details
   - Select tickets and proceed to checkout
   - Enter test payment details (see below)
   - Complete booking

4. **Verify Success**:
   - Green success banner displays with email
   - Check email inbox for confirmation (may take 1-2 minutes)
   - Check frontend Notifications page for in-app notification

### Test 3: Test Payment Details (Fake Payment Gateway)

**Valid Test Card Numbers**:
```
Card Number: 4111 1111 1111 1111
Cardholder: Any Name
Expiry: Any valid MM/YY (e.g., 12/25)
CVV: Any 3 digits (e.g., 123)
```

### Test 4: Check MongoDB Notification

```bash
# Connect to MongoDB and verify notification created
db.notifications.find({ type: 'booking_confirmation' })

# Expected output:
{
  "_id": ObjectId("..."),
  "userId": ObjectId("..."),
  "eventId": ObjectId("..."),
  "title": "Booking Confirmed",
  "message": "Your booking for \"Event Name\" is confirmed! Booking ID: BK-...",
  "type": "booking_confirmation",
  "read": false,
  "targetAll": false,
  "createdAt": ISODate("2026-03-16T..."),
  "updatedAt": ISODate("2026-03-16T...")
}
```

## Email Template Features

### Professional Layout
- Gradient header with "✅ Booking Confirmed!" title
- Clean white background with subtle shadow
- Responsive design (works on mobile/desktop)
- Inline CSS (no external stylesheet required)

### Booking Details Section
- Booking ID
- Event name and date
- Ticket quantity and breakdown
- Total amount paid with currency formatting

### Additional Sections
- Digital ticket reminder
- Call-to-action button to view booking on dashboard
- Footer with copyright and support note

### CSS Features
- Gradient backgrounds
- Flexible box layouts
- Color-coded sections (info, totals, warnings)
- Professional typography

## Troubleshooting

### Email Not Sending

1. **Check email configuration**:
   ```bash
   # Review console output on startup
   npm start
   # Should show: "✅ EMAIL TRANSPORTER VERIFIED"
   ```

2. **Verify environment variables**:
   ```bash
   # Check .env file
   cat .env | grep SMTP
   ```

3. **Enable less secure apps** (Gmail):
   - If you still get errors, try enabling "Less secure app access"
   - Go to https://myaccount.google.com/lesssecureapps
   - This is less secure, so use app passwords instead if possible

4. **Check logs**:
   ```bash
   # Look for specific error messages
   npm start 2>&1 | grep -i email
   ```

### Notification Not Created

1. **Verify Notification model has required fields**:
   - userId, eventId, title, message, type fields

2. **Check MongoDB connection**:
   ```bash
   # Verify booking confirmation is in database
   db.notifications.countDocuments({ type: 'booking_confirmation' })
   ```

### Success Banner Not Showing on Frontend

1. **Check browser console** for errors
2. **Verify API response includes userId.email**:
   ```javascript
   // In browser console
   // The booking response should include:
   // booking.userId.email
   ```

3. **Check BookingModal is properly rendering**:
   - Ensure success banner CSS is loaded

## Code Examples

### Sending Email Manually

```javascript
// In any controller or service
const { sendConfirmationEmail } = require('../controllers/emailController');

const booking = await Booking.findById(bookingId)
  .populate('userId', 'name email')
  .populate('eventId', 'title date time location venue');

try {
  const success = await sendConfirmationEmail(booking);
  if (success) {
    console.log('Email sent successfully');
  }
} catch (error) {
  console.error('Email sending failed:', error);
}
```

### Accessing User Email on Frontend

```javascript
// In BookingModal or any component
const userEmail = data.booking.userId?.email || 'your email';
console.log(`Email sent to: ${userEmail}`);
```

## API Response Example

When booking is confirmed via `PATCH /api/bookings/:id/confirm`:

```json
{
  "success": true,
  "booking": {
    "_id": "...",
    "bookingId": "BK-a1b2c3d4",
    "userId": {
      "_id": "...",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "eventId": {
      "_id": "...",
      "title": "Concert 2026",
      "date": "2026-04-15",
      "time": "19:00",
      "location": "Madison Square Garden",
      "venue": "Madison Square Garden, New York"
    },
    "ticketDetails": [...],
    "status": "confirmed",
    "totalAmount": 150.00,
    "qrCode": "data:image/png;base64,..."
  }
}
```

## Future Enhancements

- [ ] SMS reminder notifications
- [ ] Multiple email templates (corporate, casual, etc.)
- [ ] Email preview feature in admin panel
- [ ] Schedule emails for later sending
- [ ] Resend confirmation email from dashboard
- [ ] Email analytics (open/click tracking)
- [ ] Multilingual email templates
- [ ] PDF ticket attachment in email

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review console logs for specific error messages
3. Verify all environment variables are set correctly
4. Check MongoDB connection and notifications collection
5. Test email configuration separately using test-email.js script

## References

- [Nodemailer Documentation](https://nodemailer.com/)
- [Gmail App Passwords](https://myaccount.google.com/apppasswords)
- [SendGrid Documentation](https://docs.sendgrid.com/)
- [AWS SES Documentation](https://docs.aws.amazon.com/ses/)
