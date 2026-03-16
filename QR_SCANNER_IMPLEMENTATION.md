# QR Code Scanner - Implementation & Troubleshooting Guide

## Overview
This guide explains the fixed QR code scanning implementation for the Event Ticket Booking System admin panel.

---

## What Was Fixed

### Before ❌
- QR raw data was displayed but not processed
- No automatic API call to validate the ticket
- Manual JSON parsing required
- No duplicate scan prevention
- Camera kept running after detection

### After ✅
- QR automatically detected and extracted
- Instant API call to backend for validation
- JSON parsing handled automatically
- Duplicate scan prevention built-in
- Proper camera cleanup and state management
- Real-time scanning status feedback

---

## Installation Requirements

### Step 1: Install jsQR Library

You must install the `jsQR` library for automatic QR code scanning:

```bash
cd admin
npm install jsqr
```

This library provides the decoding functionality for QR codes captured from the camera.

### Step 2: Verify Installation

```bash
npm list jsqr
```

Expected output:
```
admin@0.1.0 C:\Event\...\admin
└── jsqr@1.4.0
```

---

## Implementation Details

### 1. **QR Code Detection Flow**

```
Camera Feed
    ↓
Video Frame Capture (every 100ms)
    ↓
Canvas Rendering
    ↓
jsQR Library Processing
    ↓
QR Data Detected
    ↓
Extract bookingId
    ↓
API Call to Backend
    ↓
Display Validation Result
    ↓
Auto-stop Camera
```

### 2. **Key Functions Explained**

#### **startCamera()**
```javascript
const startCamera = async () => {
  // Request camera access
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { 
      facingMode: 'environment',     // Back camera on mobile
      width: { ideal: 1280 },
      height: { ideal: 720 }
    },
  });
  
  // Display in video element
  videoRef.current.srcObject = stream;
  
  // Start scanning when ready
  videoRef.current.onloadedmetadata = () => {
    startQRScanning();
  };
};
```

**Key Points:**
- `facingMode: 'environment'` uses back camera (better for QR scanning)
- High resolution (1280x720) for better QR detection
- Scanning starts automatically when video is ready

#### **startQRScanning()**
```javascript
const startQRScanning = () => {
  scanIntervalRef.current = setInterval(async () => {
    // Get video dimensions
    const canvas = canvasRef.current;
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;

    // Draw video frame to canvas
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    // Get pixel data
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    // Decode QR code using jsQR
    const code = jsQR(imageData.data, imageData.width, imageData.height);

    if (code && code.data) {
      handleQRCodeDetected(code.data);
    }
  }, 100); // Scan every 100ms
};
```

**Key Points:**
- Scans 10 times per second for responsive detection
- Uses canvas to extract pixel data from video
- jsQR returns `null` if no QR found, object if found
- Continuous loop stops when QR is detected

#### **handleQRCodeDetected(qrData)**
```javascript
const handleQRCodeDetected = (qrData) => {
  // Parse QR data - could be JSON or plain text
  let parsedData;
  
  try {
    parsedData = JSON.parse(qrData);  // Try JSON
  } catch {
    parsedData = { bookingId: qrData }; // Fallback to plain text
  }

  const detectedBookingId = parsedData.bookingId || qrData;

  // Prevent duplicate scans
  if (scannedCodesRef.current.has(detectedBookingId)) {
    return;  // Skip if already scanned
  }

  // Mark as scanned
  scannedCodesRef.current.add(detectedBookingId);

  // Auto-validate the ticket
  validateScannedTicket(detectedBookingId);
};
```

**Key Points:**
- Handles both JSON and plain text QR data
- `scannedCodesRef` prevents duplicate processing
- Automatically calls validation API

#### **validateScannedTicket(bookingId)**
```javascript
const validateScannedTicket = async (scannedBookingId) => {
  setLoading(true);

  try {
    // Send API request
    const response = await api.post(
      '/api/admin/bookings/qrcode/validate',
      { bookingId: scannedBookingId.trim() }
    );

    if (response.data.success) {
      // Display success results
      setValidationResult(response.data.booking);
      setSuccess(response.data.message);
      stopCamera();  // Auto-close camera
    }
  } catch (err) {
    // Display error message
    const errorMsg = err.response?.data?.message;
    setError(errorMsg);
    
    // Keep scanning for next ticket
    setIsScanning(true);
  }
};
```

**Key Points:**
- Automatic API call when QR is detected
- Closes camera on success
- Continues scanning if error occurs
- Proper error message display

### 3. **State Management**

```javascript
// For form input
const [bookingId, setBookingId] = useState('');

// For scanning
const [isScanning, setIsScanning] = useState(false);
const [showCamera, setShowCamera] = useState(false);

// For results
const [validationResult, setValidationResult] = useState(null);
const [success, setSuccess] = useState(null);
const [error, setError] = useState(null);

// Real-time status message
const [scanMessage, setScanMessage] = useState('');

// DOM references
const videoRef = useRef(null);
const canvasRef = useRef(null);

// Duplicate prevention
const scannedCodesRef = useRef(new Set());

// Cleanup on unmount
useEffect(() => {
  return () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
    }
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
    }
  };
}, [cameraStream]);
```

---

## API Integration

### Backend Endpoint

**URL:** `POST /api/admin/bookings/qrcode/validate`

**Request:**
```javascript
{
  bookingId: "BK-a1b2c3d4"
}
```

**Response (Success):**
```javascript
{
  success: true,
  message: "Ticket validated successfully",
  booking: {
    bookingId: "BK-a1b2c3d4",
    userName: "John Doe",
    userEmail: "john@example.com",
    userPhone: "+1234567890",
    eventTitle: "Summer Festival",
    eventDate: "2024-06-15T00:00:00Z",
    eventTime: "18:00",
    eventVenue: "Central Park",
    ticketQuantity: 3,
    totalAmount: 450,
    validatedAt: "2024-06-15T18:20:00Z",
    ticketDetails: [...]
  }
}
```

**Response (Already Used):**
```javascript
{
  success: false,
  message: "This ticket has already been used",
  usedAt: "2024-06-15T18:10:00Z"
}
```

**Response (Not Found):**
```javascript
{
  success: false,
  message: "Booking not found"
}
```

### Axios Implementation

**File:** `admin/src/services/api.js`

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
});

// Add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

**Using in Component:**

```javascript
const response = await api.post('/api/admin/bookings/qrcode/validate', {
  bookingId: 'BK-abc123'
});

// Handle response
console.log(response.data.booking);
```

---

## Usage Instructions

### 1. **Start Scanner**

1. Navigate to `/admin/validate-qr`
2. Click **"📷 Start QR Scanner"** button
3. Grant camera permissions
4. Point camera at QR code

### 2. **What Happens**

- Camera displays with orientation guide overlay
- Status indicator shows "Scanning..." (green with animation)
- QR code is detected automatically
- Booking validation happens instantly
- Results display immediately
- Camera closes automatically

### 3. **Scan Again**

- Click **"🔄 Scan Another Ticket"** button
- Brings form back to scanning ready state
- `scannedCodesRef` is cleared
- Ready for next QR code

### 4. **Manual Entry** (Optional)

- Type booking ID in text field: `BK-XXXXXXXX`
- Click **"Validate"** button
- Same validation flow as QR scan

---

## QR Code Format

### Format in Database

When you generate a QR code for a booking, it contains JSON:

```javascript
// From bookingController.js confirmBooking()
const qrData = JSON.stringify({
  bookingId: booking.bookingId,
  eventTitle: event.title,
  eventDate: event.date,
  ticketQuantity: booking.ticketQuantity,
  totalAmount: booking.totalAmount,
});

const qrCode = await QRCode.toDataURL(qrData);
```

### What Scanner Extracts

```javascript
// QR contains:
{
  bookingId: "BK-a1b2c3d4",
  eventTitle: "Summer Festival",
  eventDate: "2024-06-15T00:00:00Z",
  ticketQuantity: 3,
  totalAmount: 450
}

// Scanner extracts only bookingId:
"BK-a1b2c3d4"

// Sends to API:
POST /api/admin/bookings/qrcode/validate
{ bookingId: "BK-a1b2c3d4" }
```

---

## Duplicate Scan Prevention

### How It Works

```javascript
const scannedCodesRef = useRef(new Set());

const handleQRCodeDetected = (qrData) => {
  const detectedBookingId = parsedData.bookingId;

  // Check if already scanned
  if (scannedCodesRef.current.has(detectedBookingId)) {
    return;  // Skip this scan
  }

  // Add to scanned set
  scannedCodesRef.current.add(detectedBookingId);

  // Process validation
  validateScannedTicket(detectedBookingId);
};
```

### Reset

```javascript
const resetForNewScan = () => {
  setValidationResult(null);
  scannedCodesRef.current.clear(); // Clear the cache
  setIsScanning(true);
};
```

---

## Troubleshooting

### Issue 1: Camera Permission Denied

**Error:** "Unable to access camera. Please check permissions."

**Solutions:**
- ✅ Grant browser permission to access camera
- ✅ Check if using HTTPS (required for camera access)
- ✅ Try different browser (Chrome, Firefox, Safari)
- ✅ Restart browser and try again

**For Development (HTTP):**
```javascript
// Chrome allows camera on localhost only
http://localhost:3000  // ✅ Works
http://192.168.1.100:3000  // ❌ Fails - needs HTTPS
```

### Issue 2: jsQR Not Installed

**Error:**
```
QR scanner library not available. Please install jsQR: npm install jsqr
```

**Solution:**
```bash
cd admin
npm install jsqr
npm start
```

### Issue 3: QR Code Not Detected

**Possible Causes:**
- Poor lighting conditions
- QR code too small
- Camera focus issues
- QR code is damaged/blurred

**Solutions:**
- ✅ Improve lighting
- ✅ Increase QR code size (at least 5cm)
- ✅ Keep QR code at distance (15-30cm)
- ✅ Ensure QR code is clear and not wrinkled
- ✅ Try reloading page

### Issue 4: API Validation Fails

**Error:** "Booking not found"

**Possible Causes:**
- QR code from different system
- Booking ID doesn't exist
- Typo in QR generation

**Solutions:**
- ✅ Verify booking ID format: `BK-XXXXXXXX`
- ✅ Check booking exists in database
- ✅ Regenerate QR code if needed

### Issue 5: "Already Used" Error on First Scan

**Error:** "This ticket has already been used"

**Possible Causes:**
- Ticket was validated previously
- Duplicate entry in scanning session

**Solutions:**
- ✅ Click "Scan Another Ticket" to reset
- ✅ Check validation history in admin bookings
- ✅ Verify ticket wasn't manually marked as used

### Issue 6: Multiple API Calls for Same QR

**Problem:** API called multiple times for one QR code

**Root Cause:** Duplicate scan prevention wasn't working

**Solution:** Already fixed! Uses `scannedCodesRef` to track scanned codes

---

## Performance Optimization

### Camera Frame Rate
```javascript
// Current: Scans 10 times per second
setInterval(() => { ... }, 100); // 100ms = 10 FPS

// For faster detection:
setInterval(() => { ... }, 50); // 50ms = 20 FPS (more CPU usage)

// For slower devices:
setInterval(() => { ... }, 200); // 200ms = 5 FPS (less CPU usage)
```

### Video Resolution

```javascript
// Can be adjusted based on device capability
const stream = await navigator.mediaDevices.getUserMedia({
  video: { 
    facingMode: 'environment',
    width: { ideal: 1280 },   // Adjust for performance
    height: { ideal: 720 }
  },
});
```

### Resource Cleanup

```javascript
useEffect(() => {
  return () => {
    // Stop all camera tracks
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
    }
    
    // Clear scanning interval
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
    }
  };
}, [cameraStream]);
```

---

## Testing Checklist

- [ ] Install jsQR library (`npm install jsqr`)
- [ ] Camera permission granted in browser
- [ ] QR scanner starts when button clicked
- [ ] Real-time scanning status displayed
- [ ] QR code detected within 2-3 seconds
- [ ] API call sent automatically
- [ ] Validation result displays correctly
- [ ] Customer info shown in results
- [ ] "Scan Another" button works
- [ ] Duplicate scans prevented
- [ ] Camera closes after success
- [ ] Error messages display properly
- [ ] Manual booking ID entry works
- [ ] Works on mobile devices
- [ ] HTTPS enabled for production

---

## Code Examples

### Example 1: Manual Testing

```javascript
// In browser DevTools Console
// Simulate QR detection
const bookingId = 'BK-test12345';
// This would normally come from QR scan
```

### Example 2: Generate Test QR Code

```bash
# Install QR generator
npm install qrcode-terminal

# Generate test QR in Node.js
const QRCode = require('qrcode');
const testData = JSON.stringify({
  bookingId: 'BK-TEST9999',
  eventTitle: 'Test Event',
  eventDate: '2024-06-15T00:00:00Z',
  ticketQuantity: 1,
  totalAmount: 100
});

QRCode.toString(testData, { type: 'terminal' }, (err, qr) => {
  console.log(qr);
});
```

### Example 3: Error Handling Patterns

```javascript
try {
  const response = await api.post('/api/admin/bookings/qrcode/validate', {
    bookingId: 'BK-abc123'
  });
  
  if (response.data.success) {
    console.log('Validation successful:', response.data.booking);
  }
} catch (error) {
  // Network error
  if (!error.response) {
    console.error('Network error:', error.message);
  }
  // API error (400, 404, etc.)
  else if (error.response.status === 404) {
    console.error('Booking not found');
  }
  // Server error (500, etc.)
  else if (error.response.status >= 500) {
    console.error('Server error:', error.response.data.message);
  }
}
```

---

## React Hook Dependencies

### Critical Dependencies

```javascript
// Must track camera stream for cleanup
useEffect(() => {
  return () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
    }
  };
}, [cameraStream]); // Include in dependency array
```

### Ref-based Tracking (not dependencies)

```javascript
// These are refs, not state - don't need dependencies
const scannedCodesRef = useRef(new Set());
const scanIntervalRef = useRef(null);
const videoRef = useRef(null);
const canvasRef = useRef(null);
```

---

## Browser Compatibility

| Browser | Desktop | Mobile | Notes |
|---------|---------|--------|-------|
| Chrome | ✅ | ✅ | Best support |
| Firefox | ✅ | ✅ | Good support |
| Safari | ✅ | ✅ | iOS 14.5+ |
| Edge | ✅ | ✅ | Chromium-based |

**Requirements:**
- HTTPS (or localhost)
- Camera permissions granted
- JavaScript enabled

---

## Security Considerations

### 1. **Authentication**
- API endpoint requires admin token (in Authorization header)
- Only admin/staff can validate tickets

### 2. **Validation Checks**
- Never trust QR data directly
- Always validate `bookingId` on backend
- Check booking status before marking as used

### 3. **Duplicate Prevention**
- Frontend: `scannedCodesRef` prevents UI from calling API twice
- Backend: `isUsed` flag prevents double-scanning across sessions

### 4. **Data Privacy**
- QR contains only non-sensitive booking info
- No payment details in QR code
- Personal info only shown to authorized staff

---

## Version History

- **v2.0** (Mar 16, 2026) - Fixed implementation
  - ✅ Added jsQR integration
  - ✅ Auto-detection and validation
  - ✅ Proper state management
  - ✅ Duplicate prevention
  - ✅ Real-time status updates
  - ✅ Error handling

- **v1.0** (Mar 16, 2026) - Initial release
  - Basic UI structure
  - Manual booking ID input

---

## Support

For issues or questions:
1. Check Troubleshooting section above
2. Verify jsQR installation
3. Check browser console for errors
4. Test on different device/browser
5. Review API endpoint logs

---

## Next Steps

1. ✅ Install jsQR: `npm install jsqr`
2. ✅ Test in development
3. ✅ Grant camera permissions
4. ✅ Scan sample QR codes
5. ✅ Monitor validation results
6. ✅ Deploy to production with HTTPS
