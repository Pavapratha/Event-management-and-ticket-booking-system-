# QR Code Scanner - Quick Start Guide

## ✅ Installation & Setup Checklist

### Step 1: Install jsQR Library
```bash
cd admin
npm install jsqr
```
✅ **Status:** Completed - jsQR v1.4.0 installed

### Step 2: Verify Updated Files
- ✅ `admin/src/pages/QRValidation.js` - Updated with QR scanning logic
- ✅ `admin/src/styles/QRValidation.css` - Updated with camera status styles
- ✅ `admin/src/components/AdminLayout.js` - Navigation integrated
- ✅ `admin/src/App.js` - Route configured at `/admin/validate-qr`
- ✅ `backend/routes/admin.js` - API endpoint: `POST /api/admin/bookings/qrcode/validate`
- ✅ `backend/controllers/bookingController.js` - validateQRCode function implemented

### Step 3: Start Services

**Terminal 1 - Backend:**
```bash
cd backend
npm start
# Should run on http://localhost:5000
```

**Terminal 2 - Admin Frontend:**
```bash
cd admin
npm start
# Should run on http://localhost:3000
```

### Step 4: Access QR Validation Page
```
http://localhost:3000/admin/validate-qr
```

---

## 🚀 How QR Scanning Works

### Flow Diagram

```
┌─────────────────┐
│ Click "Start QR │
│   Scanner"      │
└────────┬────────┘
         │
         ▼
┌─────────────────────┐
│ Request Camera      │
│ Permission          │
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│ Display Video Feed  │
│ Start Scanning      │
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│ Scan Every 100ms    │
│ (10 FPS)            │
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│ QR Code Detected?   │
└────────┬────────────┘
         │ Yes
         ▼
┌─────────────────────┐
│ Extract bookingId   │
│ from QR Data        │
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│ Prevent Duplicates  │
│ (Check scanned set) │
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│ Send API Request    │
│ POST /validate      │
└────────┬────────────┘
         │
         ▼
    ┌────┴─────┐
    │           │
   ✅ Valid   ❌ Error
    │           │
    ▼           ▼
┌──────┐    ┌──────────┐
│Close │    │Continue  │
│Cam   │    │Scanning  │
└──────┘    └──────────┘
```

---

## 🎯 Testing the System

### Test 1: Manual Booking ID Entry

**Steps:**
1. Navigate to `/admin/validate-qr`
2. Don't use camera - just enter booking ID manually
3. Click "Validate" button

**Expected Result:**
- If booking exists and confirmed: ✅ Shows validation details
- If already used: ❌ Shows "already used" error
- If not found: ❌ Shows "not found" error

### Test 2: QR Code Scanning

**Prerequisite:**
- Generate a valid QR code with booking data
- Or use existing QR code from customer ticket

**Steps:**
1. Navigate to `/admin/validate-qr`
2. Click "📷 Start QR Scanner"
3. Grant camera permission
4. Point camera at QR code
5. Hold steady for 2-3 seconds

**Expected Result:**
- Status changes to "Scanning..." (green indicator)
- QR detected and booking ID extracted
- API call sent automatically
- Results displayed on right side
- "Scan Another Ticket" button appears

### Test 3: Duplicate Scan Prevention

**Steps:**
1. Scan a QR code successfully
2. Try to scan the same QR code again
3. Result should be ignored (not API called again)

**Expected Result:**
- Second scan ignored due to duplicate prevention
- No duplicate API calls
- "Scan Another Ticket" button must be clicked to reset

### Test 4: Camera Permissions

**Steps:**
1. Deny camera permission
2. Click "Start QR Scanner"

**Expected Result:**
- Error message: "Unable to access camera. Please check permissions."
- Camera doesn't start

---

## 📱 Mobile Testing

### iPhone/iPad
```
Requirements:
- iOS 14.5+
- Safari or Chrome browser
- HTTPS enabled (required for camera)
- Camera permissions granted
```

### Android
```
Requirements:
- Android 5.0+
- Chrome or Firefox browser
- HTTPS enabled (required for camera)
- Camera permissions granted
- Back camera (more suitable for QR scanning)
```

### Desktop
```
Requirements:
- Chrome, Firefox, Safari, or Edge
- Localhost OK for development
- External access requires HTTPS
- Webcam connected
```

---

## 🔧 API Testing with cURL

### Test 1: Valid Booking Validation

```bash
curl -X POST http://localhost:5000/api/admin/bookings/qrcode/validate \
  -H "Authorization: Bearer <YOUR_ADMIN_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "bookingId": "BK-a1b2c3d4"
  }'
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Ticket validated successfully",
  "booking": {
    "bookingId": "BK-a1b2c3d4",
    "userName": "John Doe",
    "userEmail": "john@example.com",
    "eventTitle": "Summer Festival",
    "ticketQuantity": 2,
    "totalAmount": 250,
    "validatedAt": "2024-06-15T19:25:00Z"
  }
}
```

### Test 2: Already Used Booking

```bash
curl -X POST http://localhost:5000/api/admin/bookings/qrcode/validate \
  -H "Authorization: Bearer <YOUR_ADMIN_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "bookingId": "BK-already-used"
  }'
```

**Expected Response (400):**
```json
{
  "success": false,
  "message": "This ticket has already been used",
  "usedAt": "2024-06-15T19:10:00Z"
}
```

### Test 3: Booking Not Found

```bash
curl -X POST http://localhost:5000/api/admin/bookings/qrcode/validate \
  -H "Authorization: Bearer <YOUR_ADMIN_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "bookingId": "BK-nonexistent"
  }'
```

**Expected Response (404):**
```json
{
  "success": false,
  "message": "Booking not found"
}
```

---

## 🐛 Common Issues & Fixes

### Issue 1: "Cannot find module 'jsqr'"
**Solution:**
```bash
cd admin
npm install jsqr
npm start
```

### Issue 2: Camera Not Starting
**Checklist:**
- [ ] Using HTTPS or localhost
- [ ] Browser has camera permission
- [ ] Device has webcam/camera
- [ ] Try different browser
- [ ] Restart browser

### Issue 3: QR Not Detected
**Checklist:**
- [ ] QR code is in focus
- [ ] Good lighting
- [ ] QR code is not too small
- [ ] Camera is steady
- [ ] Page is fully loaded
- [ ] No console errors (F12)

### Issue 4: API Returns 401/403
**Checklist:**
- [ ] Admin token is valid
- [ ] Token is in LocalStorage
- [ ] Token hasn't expired
- [ ] Using correct auth header format

---

## 📊 Live Testing with Sample Data

### Create Test Booking

```bash
# 1. Login as admin
curl -X POST http://localhost:5000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }'

# Copy the returned token

# 2. Create a test booking manually in Postman or use existing booking
```

### Generate Test QR Code

```javascript
// In Node.js console
const QRCode = require('qrcode');

const testData = JSON.stringify({
  bookingId: 'BK-TEST1234',
  eventTitle: 'Test Event',
  eventDate: '2024-06-15T00:00:00Z',
  ticketQuantity: 1,
  totalAmount: 100
});

QRCode.toDataURL(testData, (err, url) => {
  console.log(url); // Print QR code data URL
});
```

### Display on Screen

```html
<img src="<DATA_URL_FROM_ABOVE>" alt="Test QR Code" />
```

---

## 🔒 Security Checklist

- [ ] Backend validates auth token
- [ ] Backend checks booking exists
- [ ] Backend checks booking is confirmed
- [ ] Backend prevents double-scan (isUsed flag)
- [ ] Frontend prevents duplicate API calls (scannedCodesRef)
- [ ] API returns only necessary info
- [ ] HTTPS enabled in production
- [ ] Rate limiting on API endpoint
- [ ] Admin logs validation events

---

## 📈 Monitoring & Logs

### Backend Logs
```javascript
// In bookingController.js
console.log('QR Validation Request:', {
  bookingId: req.body.bookingId,
  adminId: req.userId,
  timestamp: new Date()
});
```

### Frontend Logs
```javascript
// Open DevTools (F12) and check Console
// Watch for:
- Camera permission granted
- QR detected: BK-XXXXXXXX
- API request sent
- API response received
```

### Database Logs
```javascript
// Check isUsed and usedAt fields
db.bookings.findOne({ bookingId: 'BK-test' })
// Should show:
{
  bookingId: "BK-test",
  isUsed: true,
  usedAt: ISODate("2024-06-15T19:25:00Z"),
  validatedBy: ObjectId("...")
}
```

---

## ✨ Features Implemented

- ✅ Real-time QR code detection
- ✅ Automatic booking validation
- ✅ Duplicate scan prevention
- ✅ Live status feedback
- ✅ Manual booking ID entry
- ✅ Comprehensive error handling
- ✅ Responsive camera UI
- ✅ Auto camera cleanup
- ✅ Success/failure display
- ✅ Detailed validation results
- ✅ Customer information display
- ✅ Ticket details breakdown

---

## 🎓 Next Steps

1. ✅ jsQR installed
2. ✅ Backend API ready
3. ✅ Frontend component ready
4. 📝 Start admin server: `cd admin && npm start`
5. 📝 Start backend server: `cd backend && npm start`
6. 📝 Test with sample QR codes
7. 📝 Deploy to production

---

## 📞 Support Resources

- **QR Scanner Guide:** `QR_SCANNER_IMPLEMENTATION.md`
- **Validation API Docs:** `QR_VALIDATION_SYSTEM.md`
- **Backend Routes:** `backend/routes/admin.js`
- **React Component:** `admin/src/pages/QRValidation.js`
- **GitHub Issues:** Check project repo

---

## Version Info

- **jsQR:** v1.4.0 ✅
- **React:** v18+ ✅
- **Node.js:** v14+ ✅
- **Backend:** Express.js ✅
- **Database:** MongoDB ✅

---

Last Updated: March 16, 2026
