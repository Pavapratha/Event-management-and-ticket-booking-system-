# 🏗️ Complete System Architecture & Data Flow

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     EVENT MANAGEMENT SYSTEM                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────┐    ┌─────────────────┐   ┌─────────────┐ │
│  │   User Frontend │    │  Admin Portal   │   │   Backend   │ │
│  │  (Port 3000)    │    │  (Port 3001)    │   │ (Port 5000) │ │
│  │                 │    │                 │   │             │ │
│  │ - Browse Events │    │ - Create Events │   │ - Node.js   │ │
│  │ - Book Tickets  │──→─│ - Edit Events   │──→│ - Express   │ │
│  │ - View Bookings │    │ - Delete Events │   │ - MongoDB   │ │
│  │ - Manage Account│    │ - View Analytics│   │             │ │
│  └─────────────────┘    │ - Track Revenue │   └─────────────┘ │
│                         │ - Manage Users  │                    │
│                         │ - Control Tickets │                  │
│                         └─────────────────┘                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Database Schema

### Collections Overview

```
┌─────────────────────────────────────────────────┐
│              MongoDB Database                   │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌──────────────┐    ┌──────────────┐         │
│  │   USERS      │    │   EVENTS     │         │
│  ├──────────────┤    ├──────────────┤         │
│  │ • name       │    │ • title      │         │
│  │ • email      │    │ • description│         │
│  │ • password   │    │ • category   │         │
│  │ • role       │    │ • date/time  │         │
│  │ • isVerified │    │ • location   │         │
│  │ • isBlocked  │    │ • price      │         │
│  └──────────────┘    │ • totalSeats │         │
│         △            │ • availSeats │         │
│         │            │ • image      │         │
│         │            │ • status     │         │
│         │            └──────────────┘         │
│         │                   △                  │
│         │                   │                  │
│         └───────────────────┼──────────────┐  │
│                             │              │  │
│  ┌──────────────┐  ┌────────▼─────────┐  │  │
│  │  BOOKINGS    │  │   NOTIFICATIONS  │  │  │
│  ├──────────────┤  ├──────────────────┤  │  │
│  │ • bookingId  │  │ • userId (FK)    │  │  │
│  │ • userId(FK) │  │ • message        │  │  │
│  │ • eventId(FK)│  │ • read           │  │  │
│  │ • qty        │  │ • createdAt      │  │  │
│  │ • amount     │  └──────────────────┘  │  │
│  │ • status     │                         │  │
│  │ • qrCode     │  ┌──────────────────┐  │  │
│  │ • createdAt  │  │    REVIEWS       │  │  │
│  └──────────────┘  ├──────────────────┤  │  │
│                    │ • userId (FK)    │  │  │
│  ┌──────────────┐  │ • eventId (FK)   │  │  │
│  │ CATEGORIES   │  │ • rating         │  │  │
│  ├──────────────┤  │ • comment        │  │  │
│  │ • name       │  │ • createdAt      │  │  │
│  │ • icon       │  └──────────────────┘  │  │
│  │ • color      │                         │  │
│  └──────────────┘                         │  │
│                                           │  │
└───────────────────────────────────────────┼──┘
```

---

## Data Flow: Creating an Event

```
┌─────────────────────────────────────────────────────────────────────┐
│ STEP 1: ADMIN CREATES EVENT                                         │
└─────────────────────────────────────────────────────────────────────┘

Admin Portal (React)
    │
    ├─→ EventForm Component
    │   └─→ Validates input
    │       ├─ Title, description
    │       ├─ Category, date/time
    │       ├─ Location, price
    │       ├─ Total seats
    │       └─ Image file (max 5MB)
    │
    └─→ POST /api/admin/events
        └─→ FormData (multipart)
            ├─ text fields
            └─ image file
                │
                ▼
┌─────────────────────────────────────────────────────────────────────┐
│ STEP 2: BACKEND PROCESSES                                           │
└─────────────────────────────────────────────────────────────────────┘

Backend/eventController.js
    │
    ├─→ Validation
    │   ├─ Check all fields present
    │   ├─ Validate dates/prices/seats
    │   └─ Check category in enum
    │
    ├─→ Image Upload
    │   ├─ Multer middleware processes image
    │   └─ Saves to /backend/uploads/events/
    │
    └─→ Database Insert
        └─→ Event.create({
            title, description, category,
            date, time, location,
            price, totalSeats, availableSeats,
            image (path), createdBy, status: 'active'
            })
            │
            ▼
        MongoDB Event Document
            {
              _id: ObjectId,
              title: "Jazz Concert",
              category: "Music",
              date: 2024-03-20T...,
              time: 18:00,
              location: "Central Park",
              price: 1500,
              totalSeats: 200,
              availableSeats: 200,
              image: "/uploads/events/xyz123.jpg",
              status: "active",
              createdAt: ...,
              updatedAt: ...
            }

┌─────────────────────────────────────────────────────────────────────┐
│ STEP 3: FRONTEND SHOWS EVENT INSTANTLY                              │
└─────────────────────────────────────────────────────────────────────┘

Frontend (React)
    │
    ├─→ GET /api/events (public endpoint)
    │   └─→ Returns all active events
    │       (status: 'active')
    │
    └─→ EventCard Component
        ├─ Displays title, image, date
        ├─ Shows available seats
        ├─ Shows price
        └─ "Book Now" button
            │
            ▼
        User can immediately book! ✅

┌─────────────────────────────────────────────────────────────────────┐
│ STEP 4: ADMIN DASHBOARD UPDATES                                    │
└─────────────────────────────────────────────────────────────────────┘

Admin Dashboard (Auto-Refresh every 30s)
    │
    └─→ GET /api/admin/dashboard
        └─→ Recalculates stats:
            ├─ totalEvents = Event.count() ✓ +1
            ├─ totalUsers = User.count({'role':'user'})
            ├─ totalBookings = Booking.count()
            ├─ ticketsSold = sum of all tickets
            └─ totalRevenue = sum of all payments
                │
                ▼
            Updated Dashboard! ✅
```

---

## Data Flow: User Books Tickets

```
┌─────────────────────────────────────────────────────────────────────┐
│ STEP 1: USER BOOKS                                                  │
└─────────────────────────────────────────────────────────────────────┘

Frontend
    │
    └─→ POST /api/bookings
        ├─ Body: { eventId, ticketQuantity }
        └─ Auth: User token
            │
            ▼
┌─────────────────────────────────────────────────────────────────────┐
│ STEP 2: BACKEND PROCESSES BOOKING                                   │
└─────────────────────────────────────────────────────────────────────┘

Backend/bookingController.js
    │
    ├─→ Validation
    │   ├─ Check event exists
    │   ├─ Check event is active
    │   └─ Check enough seats available
    │
    ├─→ Create Booking
    │   └─ Booking.create({
    │       bookingId: "BK-abc123",
    │       userId: req.userId,
    │       eventId: eventId,
    │       ticketQuantity: qty,
    │       totalAmount: price × qty,
    │       status: 'confirmed',
    │       qrCode: generated
    │   })
    │
    └─→ Update Available Seats
        └─ event.availableSeats -= ticketQuantity
           └─ event.save()
            │
            ▼
        Booking Created! ✅
        Seats Updated! ✅

┌─────────────────────────────────────────────────────────────────────┐
│ STEP 3: ADMIN SEES BOOKING                                          │
└─────────────────────────────────────────────────────────────────────┘

Admin Dashboard/Tickets (Auto-Refresh)
    │
    ├─→ GET /api/admin/bookings
    │   └─ New booking appears
    │
    └─→ GET /api/admin/dashboard
        └─ Stats updated:
            ├─ totalBookings +1
            ├─ ticketsSold +qty
            └─ totalRevenue +amount
                │
                ▼
            Admin Dashboard Updated! ✅
```

---

## Data Flow: Admin Cancels Booking

```
Admin Portal
    │
    └─→ PUT /api/admin/bookings/:id/cancel
        ├─ Body: empty
        └─ Auth: Admin token
            │
            ▼
Backend/bookingController.js
    │
    ├─→ Find booking
    ├─→ Check not already cancelled
    │
    ├─→ Update Booking Status
    │   └─ booking.status = 'cancelled'
    │       booking.save()
    │
    └─→ Restore Seats
        └─ event.availableSeats += booking.ticketQuantity
           └─ event.save()
            │
            ▼
        BootStrapped Booking Cancellation! ✅

Cascading Updates:
    │
    ├─→ Frontend
    │   ├─ User's "My Tickets" shows cancelled
    │   └─ Event shows more available seats
    │
    └─→ Admin
        ├─ Tickets page shows cancelled
        ├─ Dashboard stats decrease
        └─ Payments show refund
```

---

## API Endpoints Reference

### Public Endpoints (No Auth)
```
GET /api/events
→ Returns: [{ _id, title, date, location, price, image, ... }]

GET /api/events?search=jazz&category=Music
→ Filtered events

GET /api/events/:id
→ Single event details
```

### User Protected Endpoints
```
POST /api/bookings
→ Create booking (requires user token)

GET /api/bookings/my
→ Get user's bookings (requires user token)
```

### Admin Protected Endpoints (Require admin token)
```
─── DASHBOARD ───
GET /api/admin/dashboard
→ Stats, recent bookings, upcoming events

─── EVENTS ───
GET    /api/admin/events
POST   /api/admin/events (multipart/form-data)
PUT    /api/admin/events/:id
DELETE /api/admin/events/:id

─── BOOKINGS/TICKETS ───
GET  /api/admin/bookings
PUT  /api/admin/bookings/:id/cancel
PUT  /api/admin/bookings/:id/status

─── USERS ───
GET /api/admin/users
PUT /api/admin/users/:id/block
GET /api/admin/users/:id/bookings

─── PAYMENTS ───
GET /api/admin/payments
→ All transactions with stats

─── REPORTS ───
GET /api/admin/reports
→ Analytics, trends, performance data
```

---

## Real-Time Update Mechanism

### Auto-Refresh Strategy
```
Every Page Has Built-in Auto-Refresh:

Dashboard → 30 seconds
Events → 15 seconds
Tickets → 20 seconds
Bookings → 20 seconds
Payments → 25 seconds
Users → 30 seconds
Reports → 30 seconds

Why Different Intervals?
- High-activity pages refresh faster
- Less-active pages refresh slower
- Reduces server load while staying current
```

### Refresh Triggers
```
Manual Refresh:
- Every page has "Refresh" button
- Instant update (no delay)

Automatic Refresh:
- Background interval timer
- Doesn't block user interaction

Form Submission:
- After create/update/delete
- Automatically refetch list
- User sees changes immediately
```

---

## State Management Flow

```
┌─────────────────────────────────────────┐
│   React Component (Admin Page)          │
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ useState Hooks:                 │   │
│  │ - [data, setData]               │   │
│  │ - [loading, setLoading]         │   │
│  │ - [error, setError]             │   │
│  │ - [filter, setFilter]           │   │
│  └─────────────────────────────────┘   │
│            ▲                            │
│            │                            │
│  ┌─────────┴─────────────────────────┐ │
│  │ useEffect Hooks:                  │ │
│  │ - Fetch on mount                  │ │
│  │ - Setup auto-refresh interval     │ │
│  │ - Cleanup on unmount              │ │
│  └───────────────────────────────────┘ │
│            ▲                            │
│            │                            │
│  ┌─────────┴─────────────────────────┐ │
│  │ API Call (axios):                 │ │
│  │ - GET request                     │ │
│  │ - Auth token auto-added           │ │
│  │ - Response handling               │ │
│  └───────────────────────────────────┘ │
│            │                            │
│            ▼                            │
│  ┌─────────────────────────────────┐   │
│  │ Render:                         │   │
│  │ - Show loading spinner          │   │
│  │ - Display data in table/cards   │   │
│  │ - Show action buttons           │   │
│  │ - Handle user interaction       │   │
│  └─────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

---

## Authentication Flow

```
┌────────────────────────────────────────────┐
│ ADMIN LOGIN                                │
└────────────────────────────────────────────┘

Admin Portal Login Page
    │
    ├─→ Form Input
    │   ├─ Email: lycaonstaff123@gmail.com
    │   └─ Password: ABCabc123#@
    │
    └─→ POST /api/admin/login
        │
        ▼
Backend/adminController.js
    │
    ├─→ Find user by email
    ├─→ Compare password (bcryptjs)
    ├─→ Check user is admin
    │
    └─→ If valid:
        └─ Generate JWT token
           └ response.json({
               success: true,
               token: "eyJhbGc...",
               admin: { id, name, email, role }
             })
            │
            ▼
Admin Portal AuthContext
    │
    ├─→ Store token in localStorage
    ├─→ Store admin user in localStorage
    └─→ Set AuthContext state
        │
        ▼
API Interceptor
    │
    └─→ All future requests include:
        └─ Authorization: Bearer token
            │
            ▼
Protected Routes
    │
    └─→ Check if admin exists
        ├─ Yes → Allow access
        └─ No → Redirect to login
```

---

## Performance Optimization

### Database Queries
```
// Events list (cached in frontend state)
db.events.find({ status: 'active' })
 .sort({ date: 1 })
 .limit(100)
→ Returns only necessary fields
→ Indexed by status

// Bookings aggregation (pre-calculated)
db.bookings.aggregate([
  { $match: { status: { $ne: 'cancelled' } } },
  { $group: { _id: null, total: { $sum: '$ticketQuantity' } } }
])
→ Aggregation pipeline for efficiency
```

### Frontend Optimization
```
// Avoid unnecessary renders
- useCallback for handler functions
- useMemo for filtered lists
- Local state for filters/search

// Efficient updates
- Only fetch what changed
- Reuse existing data when possible
- Debounce search input (if implemented)
```

### Network Optimization
```
// Reduced requests
- Auto-refresh intervals optimized
- Combine related data in responses
- Pagination for large lists

// Payload optimization
- Only send needed fields
- Compress images on upload
- FormData for file uploads
```

---

## Error Handling Strategy

```
┌──────────────────────────────────────────┐
│ ERROR HANDLING LAYERS                    │
├──────────────────────────────────────────┤
│                                          │
│ 1. FRONTEND VALIDATION                   │
│    └─ Check fields before sending        │
│                                          │
│ 2. API ERROR CATCHING                    │
│    └─ Catch fails requests                │
│       └─ Display user-friendly message   │
│                                          │
│ 3. BACKEND VALIDATION                    │
│    └─ Validate on server                 │
│       └─ Return 400/422 with details     │
│                                          │
│ 4. DATABASE ERROR HANDLING               │
│    └─ Catch DB errors                    │
│       └─ Return 500 with safe message    │
│                                          │
│ 5. AUTHENTICATION ERRORS                 │
│    ├─ Invalid token → 401                │
│    ├─ Expired token → 401 + redirect     │
│    └─ No permission → 403                │
│                                          │
└──────────────────────────────────────────┘
```

---

## Deployment Considerations

```
When moving to production:

Frontend:
- Set REACT_APP_API_URL to production backend
- Build optimized bundle
- Deploy to hosting (Vercel, Netlify, etc.)

Backend:
- Use production MongoDB Atlas
- Set secure JWT_SECRET
- Enable CORS for production domain
- Use environment variables
- Enable rate limiting
- Setup error logging (Sentry)

Admin:
- Same as frontend
- Separate REACT_APP_API_URL if needed
- Admin on different subdomain recommended
```

---

## Summary

This system provides:
- ✅ Complete real-time integration
- ✅ Efficient data synchronization
- ✅ Secure authentication
- ✅ Scalable architecture
- ✅ User-friendly admin interface
- ✅ Comprehensive analytics
- ✅ Professional event management

The architecture ensures that admin actions immediately reflect on the frontend, users get instant updates, and all stakeholders have visibility into the system status!
