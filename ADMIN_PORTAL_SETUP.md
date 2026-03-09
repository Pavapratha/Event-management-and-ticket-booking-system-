# Admin Portal Complete Setup Guide

## Overview
This guide will help you set up and test the fully functional admin portal with complete integration between the admin panel, backend API, and frontend user interface.

---

## Step 1: Create Admin User

### Option A: Using Seed Script (Recommended)
```bash
cd backend
npm run seed:admin
```

You should see output:
```
✅ Admin user created successfully!
   Email: lycaonstaff123@gmail.com
   Password: ABCabc123#@
   Role: admin
```

### What This Does:
- Creates an admin user in MongoDB
- Sets role to 'admin'
- Marks account as verified (can log in immediately)
- Hashes password securely with bcryptjs

---

## Step 2: Start All Three Servers

### Terminal 1: Backend (Port 5000)
```bash
cd backend
npm run dev
```

Expected output:
```
🚀 Event Management Application Starting...
📦 Connecting to database...
✅ Connected to MongoDB
📧 Loading email configuration...
Server running on port 5000
```

### Terminal 2: Frontend (Port 3000)
```bash
cd frontend
npm start
```

### Terminal 3: Admin Portal (Port 3001)
```bash
cd admin
npm start
```

All three should start without errors.

---

## Step 3: Admin Login

Navigate to: `http://localhost:3001/login`

**Credentials:**
- Email: `lycaonstaff123@gmail.com`
- Password: `ABCabc123#@`

You should see the full admin dashboard with stats.

---

## Step 4: Complete Admin Portal Walkthrough

### 4.1 Dashboard (`/admin/dashboard`)
**What You See:**
- 6 stat cards showing:
  - Total Events
  - Total Users
  - Total Bookings
  - Tickets Sold
  - Cancelled Bookings
  - Total Revenue (in USD)
- Revenue chart (last 7 days)
- Booking status distribution pie chart
- Recent bookings table
- Upcoming events list

**Features:**
- Auto-refreshes every 30 seconds
- Manual refresh button (top right)
- Click "View All" to see more bookings or events

---

### 4.2 Event Management (`/admin/events`)

#### Create New Event
1. Click "+ Add New Event" button
2. Fill in all required fields:
   - **Event Name**: e.g., "Jazz Concert 2024"
   - **Category**: Select from dropdown
   - **Description**: Event details
   - **Date**: Select future date
   - **Time**: Event start time
   - **Location**: Venue address
   - **Ticket Price (LKR)**: e.g., 2500
   - **Total Seats**: e.g., 500
   - **Event Image**: Upload JPG/PNG (max 5MB)
3. Click "Create Event"
4. Success message appears → redirects to events list

#### What Happens:
- Event created in MongoDB with `status: 'active'`
- Appears immediately on **Frontend** Events page
- Contributes to Dashboard stats

#### Edit Event
1. From events list, click edit icon on any event
2. Modify any fields
3. Click "Update Event"

#### Delete Event
1. From events list, click delete icon
2. Confirm deletion
3. Event removed from database
4. Stats update automatically

---

### 4.3 User Management (`/admin/users`)

**View:**
- Total users count
- Verified users count
- Blocked users count
- Unverified users count

**Actions:**
- Block/Unblock users (toggle button)
- View user bookings in modal
- Search users by name or email
- Sort by creation date

---

### 4.4 Ticket Management (`/admin/tickets`)

**All Bookings Table Shows:**
- Booking ID
- User name
- Event title
- Ticket quantity
- Total amount
- Booking date
- Status (confirmed/pending/cancelled)

**Stats:**
- Total tickets issued
- Active/confirmed tickets
- Pending tickets
- Cancelled tickets

**Actions:**
- Filter by status
- Search by booking ID or user name
- Cancel tickets (refunds available seats to event)

---

### 4.5 Payment Management (`/admin/payments`)

**Displays:**
- Total revenue (all paid bookings)
- Completed payments count & revenue
- Pending payments count & revenue
- Cancelled/refunded count
- Monthly revenue chart (last 6 months)

**Payments Table:**
- Booking ID
- User email
- Event title
- Amount
- Status (Paid/Pending/Refunded)
- Transaction date

---

### 4.6 Reports & Analytics (`/admin/reports`)

**Charts & Data:**
- Monthly revenue & bookings trend (line chart)
- Booking status distribution (pie chart)
- Revenue by category (bar chart)
- Top 8 events by tickets sold
- Category performance metrics

**Use Case:**
- Analyze which events are most popular
- Track revenue trends over months
- Understand booking patterns

---

## Step 5: Test Full Integration (Frontend ↔ Admin)

### Test Case 1: Create Event and Verify on Frontend

**Do This:**
1. Open Admin Portal: `http://localhost:3001`
2. Go to Events → Add New Event
3. Fill in details:
   ```
   Title: "Summer Music Festival"
   Category: "Music"
   Date: [Select future date]
   Time: "18:00"
   Location: "Central Park"
   Price: "1500"
   Seats: "200"
   ```
4. Click "Create Event"
5. Open Frontend: `http://localhost:3000`
6. Go to "Discover Events" or "Events"
7. **Verify:** Event appears in list immediately!

### Test Case 2: Dashboard Stats Update

**Do This:**
1. Check Admin Dashboard stats (note the totals)
2. Create a new event in admin panel
3. Click "Refresh" button on dashboard
4. **Verify:** "Total Events" stat increased by 1

### Test Case 3: User Books Ticket (Full Flow)

**Do This:**
1. Frontend: Click on an event
2. Click "Book Tickets"
3. Select quantity and complete booking
4. Admin Panel: Go to Tickets page
5. **Verify:** New booking appears in table
6. Admin Dashboard: **Verify:** 
   - "Total Bookings" increased
   - "Tickets Sold" increased
   - "Total Revenue" increased

### Test Case 4: Cancel Booking

**Do This:**
1. Admin Panel: Go to Tickets
2. Find a booking → Click "Cancel"
3. Confirm cancellation
4. **Verify:**
   - Booking status changes to "Cancelled"
   - Available seats increase on event
   - Revenue decreases on dashboard
5. Frontend: Check event → available seats increased

---

## Step 6: API Endpoints Reference

### Admin Endpoints (Protected - Requires Admin Token)

**Authentication:**
```
POST /api/admin/login
Body: { email, password }
Response: { success: true, token, admin: {...} }
```

**Dashboard:**
```
GET /api/admin/dashboard
Response: {
  stats: { totalEvents, totalUsers, totalBookings, ticketsSold, cancelledBookings, totalRevenue },
  recentBookings: [...],
  upcomingEvents: [...]
}
```

**Events:**
```
GET    /api/admin/events                    - Get all events
GET    /api/admin/events/:id                - Get single event
POST   /api/admin/events                    - Create event (multipart/form-data with image)
PUT    /api/admin/events/:id                - Update event
DELETE /api/admin/events/:id                - Delete event
```

**Bookings/Tickets:**
```
GET    /api/admin/bookings                  - Get all bookings
GET    /api/admin/bookings/:id              - Get single booking
PUT    /api/admin/bookings/:id/cancel       - Cancel booking
PUT    /api/admin/bookings/:id/status       - Update booking status
```

**Users:**
```
GET    /api/admin/users                     - Get all users
PUT    /api/admin/users/:id/block           - Block/unblock user
GET    /api/admin/users/:id/bookings        - Get user's bookings
```

**Payments:**
```
GET    /api/admin/payments                  - Get all payments with stats
```

**Reports:**
```
GET    /api/admin/reports                   - Get analytics data
```

### Public User Endpoints (No Auth Required)

**Events:**
```
GET /api/events                    - Get all active events
GET /api/events?search=jazz        - Search events
GET /api/events?category=Music     - Filter by category
GET /api/events/:id                - Get single event
```

---

## Step 7: Feature Checklist

### Admin Dashboard ✅
- [x] Real-time stat cards
- [x] Revenue chart
- [x] Booking status distribution
- [x] Recent bookings list
- [x] Upcoming events list
- [x] Auto-refresh every 30 seconds
- [x] Manual refresh button

### Event Management ✅
- [x] Create events with image upload
- [x] Edit events
- [x] Delete events
- [x] View event stats (tickets sold per event)
- [x] Auto-sync with frontend

### User Management ✅
- [x] View all users
- [x] Block/unblock users
- [x] View user bookings
- [x] Filter by verification status

### Ticket Management ✅
- [x] View all bookings/tickets
- [x] Cancel tickets
- [x] Restore available seats when cancelled
- [x] Update booking status (pending/confirmed/cancelled)
- [x] Filter by status
- [x] Search functionality

### Payments Tracking ✅
- [x] Track all transactions
- [x] Monthly revenue chart
- [x] Payment status breakdown
- [x] Revenue analytics

### Analytics & Reports ✅
- [x] Monthly revenue trends
- [x] Booking status distribution
- [x] Revenue by category
- [x] Top events performance
- [x] 6-month data view

### Integration ✅
- [x] Events created in admin appear on frontend
- [x] Dashboard stats update in real-time
- [x] User bookings sync between systems
- [x] Payment tracking accurate
- [x] Available seats update properly

---

## Troubleshooting

### Admin Can't Log In
**Solution:**
1. Run `npm run seed:admin` in backend folder
2. Check MongoDB is running
3. Verify `.env` file has `JWT_SECRET` set

### Events Not Appearing on Frontend
**Solution:**
1. Verify event status is "active" (not cancelled/completed)
2. Check frontend is fetching from `/api/events`
3. Refresh frontend page or wait 15 seconds (auto-refresh)

### Dashboard Stats Not Updating
**Solution:**
1. Click "Refresh" button manually
2. Wait 30 seconds for auto-refresh
3. Check backend console for errors
4. Verify MongoDB connection is active

### Image Upload Fails
**Solution:**
1. File must be PNG/JPG and under 5MB
2. Ensure `/backend/uploads/events/` folder exists
3. Check file permissions on backend folder

### Payment Stats Wrong
**Solution:**
1. Only confirmed bookings count toward revenue
2. Cancelled bookings decrease revenue
3. Refresh payments page to recalculate

---

## Environment Variables Checklist

`.env` file should contain:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
PORT=5000

# Email Config (optional for admin features)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
SMTP_FROM_EMAIL=noreply@yourdomain.com

# Frontend Config
REACT_APP_API_URL=http://localhost:5000
```

---

## Performance Notes

- Dashboard auto-refreshes every 30 seconds
- Events page auto-refreshes every 15 seconds
- Tickets page auto-refreshes every 20 seconds
- Payments page auto-refreshes every 25 seconds
- All pages have manual refresh buttons
- Search and filters are instant (client-side)

---

## Summary

Your admin portal now has:

1. ✅ **Full Event Management** - Create, edit, delete with instant frontend sync
2. ✅ **Real-time Dashboard** - Stats update every 30 seconds
3. ✅ **User Management** - Block/unblock and view user bookings
4. ✅ **Ticket Management** - Complete booking control and cancellation
5. ✅ **Payment Tracking** - Revenue analytics and transaction history
6. ✅ **Reports & Analytics** - Comprehensive performance metrics
7. ✅ **Complete Integration** - Admin actions reflect on frontend instantly

The application is now **fully functional** and ready for use!

---

**Need Help?** Check the error console in your browser (F12) or backend terminal for detailed error messages.
