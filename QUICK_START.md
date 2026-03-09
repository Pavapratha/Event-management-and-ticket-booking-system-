# 🚀 Quick Start Guide - Admin Portal

## 1️⃣ Create Admin User

```bash
cd backend
npm run seed:admin
```

**Credentials:**
- Email: `lycaonstaff123@gmail.com`
- Password: `ABCabc123#@`

## 2️⃣ Start All Servers

**Terminal 1 - Backend (Port 5000):**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend (Port 3000):**
```bash
cd frontend
npm start
```

**Terminal 3 - Admin Portal (Port 3001):**
```bash
cd admin
npm start
```

## 3️⃣ Login to Admin Portal

Open: **http://localhost:3001/login**

Use credentials from Step 1

## ✅ Key Features Now Working

### Admin Portal (`3001`)
- ✅ **Dashboard** - Real-time stats, revenue tracking, upcoming events
- ✅ **Event Management** - Create, edit, delete events with image upload
- ✅ **User Management** - View users, block/unblock, track user bookings
- ✅ **Ticket Management** - Complete booking control, cancellation, status updates
- ✅ **Payment Tracking** - Revenue analytics, transaction history
- ✅ **Reports & Analytics** - Performance metrics, revenue trends
- ✅ **Auto-Refresh** - All pages update every 15-30 seconds

### Frontend (`3000`)
- ✅ Events instantly appear when admin creates them
- ✅ Event details update in real-time
- ✅ Available seats decrease when users book
- ✅ Search and filter by category

### Integration
- ✅ Admin actions → Frontend updates instantly
- ✅ User bookings → Admin dashboard updates
- ✅ Payment tracking fully functional
- ✅ Stats synchronized across all pages

## 📊 Test The Full Flow

### Step 1: Create Event in Admin
1. Go to Admin → Events → "+ Add New Event"
2. Fill details (title, category, date, price, seats, image)
3. Click "Create Event"

### Step 2: Verify on Frontend
1. Go to Frontend → Events
2. **Your event should appear immediately!**

### Step 3: Book as User
1. Click event → "Book Tickets"
2. Select quantity and complete booking

### Step 4: Admin Dashboard Updates
1. Go to Admin → Dashboard
2. Click "Refresh" or wait 30 seconds
3. **Stats updated:**
   - Total events +1
   - Total bookings +1
   - Tickets sold +quantity
   - Total revenue increased

## 📱 Admin Features Checklist

| Feature | Status | Location |
|---------|--------|----------|
| Dashboard Stats | ✅ | `/admin/dashboard` |
| Event Creation | ✅ | `/admin/events/add` |
| Event Editing | ✅ | `/admin/events/edit/:id` |
| Event Deletion | ✅ | `/admin/events` |
| User Management | ✅ | `/admin/users` |
| Ticket Management | ✅ | `/admin/tickets` |
| Booking Management | ✅ | `/admin/bookings` |
| Payment Tracking | ✅ | `/admin/payments` |
| Reports & Analytics | ✅ | `/admin/reports` |
| Real-time Updates | ✅ | All pages |

## 🔄 Auto-Refresh Times

- Dashboard: 30 seconds
- Events: 15 seconds
- Tickets: 20 seconds
- Bookings: 20 seconds
- Payments: 25 seconds
- Users: 30 seconds
- Reports: 30 seconds

## 🚨 Troubleshooting

### "Invalid credentials" on login
→ Run `npm run seed:admin` in backend folder

### Events not showing on frontend
→ Make sure event status is "active" (not cancelled)

### Dashboard stats not updating
→ Click "Refresh" button or wait 30 seconds

### Image upload fails
→ Ensure file is PNG/JPG and under 5MB

## 📚 Full Documentation

See **ADMIN_PORTAL_SETUP.md** for comprehensive details on:
- All API endpoints
- Feature exhaustive walkthrough
- Environment variables setup
- Advanced troubleshooting

## 🎉 You're All Set!

Your admin portal is fully functional with:
- Complete event management
- Real-time dashboard
- Full booking control
- Payment analytics
- Complete frontend integration

Start creating events now! 🚀
