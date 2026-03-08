# 🚀 Event Management System - Setup & Installation Guide

Complete setup instructions for the Event Management and Ticket Booking System with all improvements applied.

---

## Prerequisites

Before you begin, make sure you have:
- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- **MongoDB** (v4.4 or higher) - [Download](https://www.mongodb.com/try/download/community)
- **Git** - [Download](https://git-scm.com/)
- **Gmail Account** (for email verification) - [Create](https://accounts.google.com/)

### Verify Installations:
```bash
node --version
npm --version
mongod --version
git --version
```

---

## Part 1: Gmail App Password Setup

### Step 1: Enable 2-Step Verification
1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Click **"Security"** in the left sidebar
3. Scroll to **"2-Step Verification"**
4. Click **"Enable"** and follow the steps
5. Verify your identity using phone or recovery email

### Step 2: Generate App Password
1. Go to [App Passwords](https://myaccount.google.com/apppasswords)
2. Select **"Mail"** from the first dropdown
3. Select **"Windows Computer"** (or your device type) from second dropdown
4. Click **"Generate"**
5. Google shows a 16-character password like: `abcd efgh ijkl mnop`
6. **Copy this password** (we'll use it in .env file)

### Step 3: Note Your Credentials
```
Gmail Email: pavithramathiyalagon@gmail.com
Gmail App Password: [The 16-character code - WITHOUT SPACES]
```

---

## Part 2: MongoDB Setup

### Option 1: Local MongoDB Installation
```bash
# Windows - MongoDB will start automatically after installation
# macOS
brew install mongodb-community

# Ubuntu/Linux
sudo apt-get install -y mongodb

# Start MongoDB
mongod
```

### Option 2: MongoDB Atlas (Cloud)
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create free account
3. Create a cluster
4. Get connection string
5. Update `MONGODB_URI` in `.env` file

### Verify MongoDB is Running:
```bash
# Open new terminal and run
mongo

# If connected, you'll see: >
# Type: exit
```

---

## Part 3: Backend Setup

### Step 1: Navigate to Backend Directory
```bash
cd backend
```

### Step 2: Install Dependencies
```bash
npm install
```

This installs:
- express (web framework)
- mongoose (MongoDB connection)
- jsonwebtoken (authentication)
- nodemailer (email sending)
- **pdfkit** (PDF generation) ← NEW
- multer (file uploads)
- cors (cross-origin requests)
- dotenv (environment variables)
- bcryptjs (password hashing)
- qrcode (QR code generation)
- uuid (unique ID generation)

### Step 3: Configure Environment Variables

Create/Update `.env` file in backend directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/lycaon-auth
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
NODE_ENV=development

# Frontend URL (for verification links)
FRONTEND_URL=http://localhost:3000

# Gmail SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=pavithramathiyalagon@gmail.com
SMTP_PASSWORD=xxxxxxxxxxxxx  # Your 16-char Gmail App Password (NO SPACES)
SMTP_FROM_EMAIL=noreply@eventmanagement.com
```

**Important**: Replace `xxxxxxxxxxxxx` with your actual Gmail App Password (without spaces).

### Step 4: Seed Admin User

Create an admin user to log into admin panel:
```bash
npm run seed:admin
```

**Output:**
```
✅ Admin user created successfully!
   Email: lycaonstaff123@gmail.com
   Password: ABCabc123#@
   Role: admin
```

**Save these credentials** - you'll use them to log into admin panel.

### Step 5: Verify Uploads Directory

The system needs `/uploads/events/` directory for event images:
```bash
# If it doesn't exist, multer will create it automatically
# But you can create manually:
mkdir -p uploads/events
```

### Step 6: Start Backend Server

**Development (with auto-reload):**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

**Expected Output:**
```
============================================================
🚀 Event Management Application Starting...
============================================================
Mode: development
Port: 5000

📦 Connecting to database...
✅ MongoDB Connected

📧 Loading email configuration...
======================================================================
✅ EMAIL TRANSPORTER VERIFICATION SUCCESSFUL
======================================================================
...
Server running on port 5000
```

✅ **Backend is ready when you see "Server running on port 5000"**

---

## Part 4: Frontend Setup

### Step 1: Navigate to Frontend Directory
```bash
# In a NEW terminal
cd frontend
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Create `.env` file (if needed)
```env
REACT_APP_API_URL=http://localhost:5000
```

### Step 4: Start Frontend
```bash
npm start
```

**Expected Output:**
```
Compiled successfully!

You can now view lycaon-frontend in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://192.168.x.x:3000

Note that the development build is not optimized.
```

✅ **Frontend opens automatically at http://localhost:3000**

---

## Part 5: Admin Panel Setup

### Step 1: Navigate to Admin Directory
```bash
# In a NEW terminal
cd admin
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Create `.env` file
```env
REACT_APP_API_URL=http://localhost:5000
```

### Step 4: Start Admin Panel
```bash
npm start
```

✅ **Admin panel opens automatically at http://localhost:3001**

---

## Part 6: Test the Complete System

### Open All Three in Separate Browser Tabs/Windows:
1. **User Frontend**: [http://localhost:3000](http://localhost:3000)
2. **Admin Panel**: [http://localhost:3001](http://localhost:3001)
3. **Backend API**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

### Quick Test Sequence:

#### 1. Admin Login
```
👉 Go to Admin Panel (localhost:3001)
   Email: lycaonstaff123@gmail.com
   Password: ABCabc123#@
   Click "Login"
```

#### 2. Create Event
```
👉 Admin Panel → Events → Add New Event

Fill in:
- Event Name: "Tech Meetup 2026"
- Category: "Technology"
- Description: "Learn latest tech trends"
- Date: [Select future date]
- Time: "18:00"
- Location: "Tech Hub, Colombo"
- Ticket Price (LKR): "2500"
- Total Seats: "100"
- Image: [Optional - upload image]

✅ Click "Create Event"
✅ Should see success message
✅ Event appears in Events list
```

#### 3. View on User Side
```
👉 Go to User Frontend (localhost:3000)
   Events page or Home page
   
✅ Should see the event you created
✅ Price shown as "Rs. 2,500.00"
✅ Wait up to 30 seconds for auto-refresh
```

#### 4. Download Report
```
👉 Admin Panel → Events
   Find the event you created
   
✅ Click 📊 (CSV button)
   ✓ File downloads as CSV
   ✓ Open in Excel/Sheets
   
✅ Click 📄 (PDF button)
   ✓ File downloads as PDF
   ✓ Open in PDF reader
   ✓ Verify event details and formatting
```

#### 5. Edit Event
```
👉 Admin Panel → Events
   Click ✏️ (Edit) button
   
✅ Change some details (price, title, etc.)
✅ Click "Update Event"
✅ Changes appear in list
✅ Wait 30 seconds to see changes on user side
```

#### 6. Delete Event
```
👉 Admin Panel → Events
   Click 🗑️ (Delete) button
   
✅ Confirm deletion
✅ Event disappears from admin list
✅ Wait 30 seconds to see disappear from user side
```

---

## Common Issues & Solutions

### MongoDB Connection Failed
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution:**
```bash
# Start MongoDB
mongod

# Or if using MongoDB Atlas, check connection string in .env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
```

### Port Already in Use
```
Error: listen EADDRINUSE :::5000 or :::3000
```
**Solution:**
```bash
# Find process using port 5000
lsof -i :5000

# Kill the process
kill -9 <PID>

# Or change port in .env or use different port
PORT=5001
```

### Email Not Sending
```
Error: 535 5.7.8 BadCredentials
```
**Solution:**
1. Verify Gmail App Password is generated (not regular Gmail password)
2. Check .env has correct password WITHOUT SPACES
3. Ensure 2-Step Verification is enabled on Gmail account
4. Test by registering new user (should receive verification email)

### Frontend Can't Connect to Backend
```
Error: Network request failed / CORS error
```
**Solution:**
```bash
# In frontend .env, ensure correct API URL:
REACT_APP_API_URL=http://localhost:5000

# In backend .env, ensure CORS origins include frontend:
# (Already configured for localhost:3000 and localhost:3001)
```

### Node Modules Issues
```
npm ERR! code ERESOLVE
```
**Solution:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# If still issues, use legacy peer deps
npm install --legacy-peer-deps
```

### Multer/Image Upload Not Working
```
Error: uploads/events directory not found
```
**Solution:**
```bash
# Multer auto-creates directory, but manually create if needed:
mkdir -p uploads/events
chmod 755 uploads/events  # Linux/macOS only
```

---

## Directory Structure Verification

After setup, your project should look like:
```
Event-management-and-ticket-booking-system-/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── uploads/           ← Images stored here
│   │   └── events/
│   ├── .env               ← Environment variables
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── hooks/         ← useEventRefresh hook
│   │   ├── utils/         ← currency utilities
│   │   └── services/
│   ├── .env
│   └── package.json
├── admin/
│   ├── src/
│   │   ├── pages/
│   │   ├── services/
│   │   └── App.js
│   ├── .env
│   └── package.json
└── IMPROVEMENTS_CHANGELOG.md  ← Documentation
```

---

## Environment Variables Checklist

### Backend `.env`
- [ ] PORT=5000
- [ ] MONGODB_URI=mongodb://localhost:27017/lycaon-auth
- [ ] JWT_SECRET=[Something unique and long]
- [ ] NODE_ENV=development
- [ ] FRONTEND_URL=http://localhost:3000
- [ ] SMTP_HOST=smtp.gmail.com
- [ ] SMTP_PORT=587
- [ ] SMTP_SECURE=false
- [ ] SMTP_USER=[Your Gmail]
- [ ] SMTP_PASSWORD=[16-char App Password, NO SPACES]
- [ ] SMTP_FROM_EMAIL=noreply@eventmanagement.com

### Frontend `.env`
- [ ] REACT_APP_API_URL=http://localhost:5000

### Admin `.env`
- [ ] REACT_APP_API_URL=http://localhost:5000

---

## Running Services

### Terminal 1 - MongoDB
```bash
mongod
```

### Terminal 2 - Backend
```bash
cd backend
npm run dev
```

### Terminal 3 - Frontend
```bash
cd frontend
npm start
```

### Terminal 4 - Admin
```bash
cd admin
npm start
```

All services should now be running and connected!

---

## Default Admin Credentials

After running `npm run seed:admin`:
```
Email:    lycaonstaff123@gmail.com
Password: ABCabc123#@
```

⚠️ **Change these in production!**

---

## Production Deployment Notes

### Before Going Live:
1. ✅ Change JWT_SECRET to something unique and long
2. ✅ Change ADMIN password after first login
3. ✅ Set NODE_ENV=production
4. ✅ Use proper MongoDB connection (not localhost)
5. ✅ Use environment variables from secure storage
6. ✅ Enable HTTPS
7. ✅ Set proper CORS origins
8. ✅ Configure proper email sender
9. ✅ Set up backups

### Environment for Production:
```env
NODE_ENV=production
PORT=[Your production port]
MONGODB_URI=[Your MongoDB Atlas URI]
JWT_SECRET=[Long, random, unique string]
FRONTEND_URL=[Your production frontend URL]
# ... other variables
```

---

## Verification Checklist

After setup, verify everything works:

```
Backend:
✅ Server running on port 5000
✅ Database connected
✅ Email configuration verified
✅ Uploads directory exists
✅ API endpoints respond

Frontend:
✅ Loads at localhost:3000
✅ Can navigate pages
✅ Can see Events list
✅ Prices show in LKR (Rs.)

Admin:
✅ Loads at localhost:3001
✅ Can log in with seeded credentials
✅ Can create events
✅ Can edit events
✅ Can delete events
✅ Can download CSV/PDF reports

Integration:
✅ New event appears on user side within 30 seconds
✅ Updated event shows on user side within 30 seconds
✅ Deleted event disappears on user side within 30 seconds
✅ Email verification works
```

---

## Getting Help

### Check Logs For:
1. **Backend console** - Shows all API requests and errors
2. **Browser console** (F12) - Frontend errors
3. **MongoDB Compass** - Database inspection
4. **Network tab** (F12) - API request/response details

### Common Debug Steps:
1. Check all .env variables are set correctly
2. Verify all services are running
3. Clear browser cache (Ctrl+Shift+Delete)
4. Restart services in order: Backend → Frontend → Admin
5. Check console logs for specific error messages

---

## Next Steps

After successful setup:

1. **Explore Admin Features**:
   - Create multiple events
   - Test all CRUD operations
   - Download reports in various formats
   - Try bulk operations

2. **Test User Features**:
   - Browse events
   - Register and log in
   - Book tickets
   - Download e-tickets

3. **Test Email System**:
   - Register new account
   - Verify email address
   - Check email template quality

4. **Monitor Logs**:
   - Watch backend logs during operations
   - Note performance and any errors
   - Verify event sync timing

---

## Troubleshooting Commands

```bash
# Check if port is in use
netstat -ano | findstr :5000  # Windows
lsof -i :5000                  # macOS/Linux

# View all running processes
tasklist                        # Windows
ps aux                         # macOS/Linux

# Force kill process (use carefully)
taskkill /PID <PID> /F        # Windows
kill -9 <PID>                 # macOS/Linux

# Restart MongoDB
mongod --dbpath /path/to/data

# View MongoDB databases
mongo
> show databases
> use lycaon-auth
> show collections
> exit

# Test API endpoint
curl http://localhost:5000/api/health

# Clear npm cache
npm cache clean --force

# Reinstall all dependencies
rm -rf node_modules
npm install
```

---

## Support Resources

- **MongoDB Documentation**: https://docs.mongodb.com/
- **Express.js Guide**: https://expressjs.com/
- **React Documentation**: https://react.dev/
- **Nodemailer Setup**: https://nodemailer.com/
- **JWT Explanation**: https://jwt.io/introduction
- **PDFKit Docs**: https://pdfkit.org/docs/getting_started.html

---

✅ **Setup Complete!**

Your Event Management and Ticket Booking System is now ready to use. Enjoy! 🎉
