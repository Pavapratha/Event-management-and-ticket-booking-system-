# 🚀 Quick Start - 5 Minute Setup

Get the system running in 5 minutes with these quick commands.

---

## Prerequisites Check
```bash
node --version     # Should be v14+
npm --version      # Should be v6+
mongod --version   # Should be installed
```

---

## Step 1: Install Dependencies (2 min)
```bash
# In backend directory
cd backend
npm install

# In frontend directory
cd frontend
npm install

# In admin directory
cd admin
npm install
```

---

## Step 2: Start MongoDB (1 min)
```bash
# In a new terminal/tab
mongod
```

---

## Step 3: Start Services (2 min)

### Terminal 1 - Backend
```bash
cd backend
npm run dev
# Output should say: Server running on port 5000
```

### Terminal 2 - Frontend
```bash
cd frontend
npm start
# Should open http://localhost:3000 automatically
```

### Terminal 3 - Admin
```bash
cd admin
npm start
# Should open http://localhost:3001 automatically
```

---

## Step 4: Quick Test (1 min)

### Access Admin Panel:
```
URL: http://localhost:3001
Email: lycaonstaff123@gmail.com
Password: ABCabc123#@
Login → Events → Add New Event → Create
```

### Check User Side:
```
URL: http://localhost:3000
Events page → Should see new event within 30 seconds
Price shows as: Rs. XXXX.XX
```

### Download Report:
```
Admin Events → Find event → Click 📊 (CSV) or 📄 (PDF)
File auto-downloads
```

---

## All Done! ✅

| Component | Status | URL |
|-----------|--------|-----|
| Backend | ✅ Running | http://localhost:5000 |
| Frontend | ✅ Running | http://localhost:3000 |
| Admin | ✅ Running | http://localhost:3001 |
| MongoDB | ✅ Running | localhost:27017 |

---

## Key Features Ready:
- ✅ Event Creation with validation
- ✅ Event List with LKR currency
- ✅ Real-time sync (30-second auto-refresh)
- ✅ CSV/PDF report downloads
- ✅ Edit and delete events
- ✅ Admin CRUD completely working

---

## Troubleshooting Quick Fixes:

### Backend won't start:
```bash
# Port 5000 in use?
# Change port in backend/.env: PORT=5001
# Then restart: npm run dev
```

### Frontend won't start:
```bash
# Port 3000 in use?
# Kill process or wait a moment
# Or change port (set PORT=3002 before npm start)
```

### MongoDB not connecting:
```bash
# Make sure mongod is running in separate terminal
mongod
# Then try backend again
```

### npm install fails:
```bash
# Clear cache and try again
npm cache clean --force
npm install --legacy-peer-deps
```

---

## What to Test First:

1. **Create Event** (Admin)
   - Add New Event → Fill form → Create
   - See it in Events list

2. **View Event** (User)
   - Go to homepage
   - See event with "Rs. X,XXX.XX" price
   - Wait 30 seconds for auto-update

3. **Download Report** (Admin)
   - Find event → Click 📊 or 📄
   - Open downloaded file

---

## Key Endpoints:

```
Backend:
POST   /api/admin/events            - Create event
GET    /api/admin/events            - List events
PUT    /api/admin/events/:id        - Update event
DELETE /api/admin/events/:id        - Delete event
GET    /api/admin/events/:id/download-csv   - CSV report
GET    /api/admin/events/:id/download-pdf   - PDF report

Frontend:
GET    /api/events    - Get all active events
GET    /api/events/:id - Get single event
```

---

## Stop Everything:

```bash
# In each terminal: Ctrl+C

# Or kill processes:
kill $(lsof -t -i :5000)   # Backend
kill $(lsof -t -i :3000)   # Frontend
kill $(lsof -t -i :3001)   # Admin
```

---

## Documentation:

- **Setup Guide**: See `SETUP_GUIDE.md` for detailed setup
- **Changes Made**: See `IMPROVEMENTS_CHANGELOG.md` for full details
- **Summary**: See `IMPLEMENTATION_SUMMARY.md` for quick reference

---

## Success! 🎉

Your Event Management System is ready to use!

- Admin create/edit/delete events
- Users see events auto-updated
- Download PDF/CSV reports
- All prices in LKR currency
- Full CRUD operations working

Start creating events! 🚀
