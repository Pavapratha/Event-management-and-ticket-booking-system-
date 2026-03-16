# QR Code Scanner - Code Snippets & Examples

## 📋 Table of Contents

1. [React Component Snippets](#react-component-snippets)
2. [Backend API Examples](#backend-api-examples)
3. [Axios Request Examples](#axios-request-examples)
4. [Error Handling Patterns](#error-handling-patterns)
5. [Testing Examples](#testing-examples)
6. [QR Code Generation](#qr-code-generation)
7. [Database Queries](#database-queries)

---

## React Component Snippets

### 1. Basic QR Scanner Setup

```javascript
import React, { useState, useRef, useEffect } from 'react';
import api from '../services/api';

function QRValidation() {
  const [bookingId, setBookingId] = useState('');
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      setCameraStream(stream);
      videoRef.current.srcObject = stream;
      setShowCamera(true);
    } catch (err) {
      alert('Camera access denied');
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
      setShowCamera(false);
    }
  };

  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraStream]);

  return (
    <div>
      {!showCamera ? (
        <button onClick={startCamera}>Start Camera</button>
      ) : (
        <>
          <video ref={videoRef} autoPlay playsInline />
          <button onClick={stopCamera}>Stop Camera</button>
        </>
      )}
    </div>
  );
}

export default QRValidation;
```

### 2. QR Detection with jsQR

```javascript
import jsQR from 'jsqr';

const startQRScanning = () => {
  const scanInterval = setInterval(() => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;

      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height);

      if (code) {
        console.log('QR Code Data:', code.data);
        handleQRCodeDetected(code.data);
      }
    }
  }, 100);

  return () => clearInterval(scanInterval);
};
```

### 3. Duplicate Prevention

```javascript
const scannedCodesRef = useRef(new Set());

const handleQRCodeDetected = (qrData) => {
  let parsedData;
  
  try {
    parsedData = JSON.parse(qrData);
  } catch {
    parsedData = { bookingId: qrData };
  }

  const bookingId = parsedData.bookingId;

  // Prevent duplicate
  if (scannedCodesRef.current.has(bookingId)) {
    console.log('Already scanned:', bookingId);
    return;
  }

  scannedCodesRef.current.add(bookingId);
  validateTicket(bookingId);
};

const resetForNewScan = () => {
  scannedCodesRef.current.clear();
};
```

### 4. State Management Pattern

```javascript
const [validationState, setValidationState] = useState({
  loading: false,
  result: null,
  error: null,
  success: false,
  scanMessage: ''
});

const updateValidationState = (updates) => {
  setValidationState(prev => ({
    ...prev,
    ...updates
  }));
};

// Usage:
updateValidationState({
  loading: true,
  error: null,
  scanMessage: 'Validating...'
});
```

---

## Backend API Examples

### 1. Express Route Handler

```javascript
// routes/admin.js
const express = require('express');
const router = express.Router();
const adminProtect = require('../config/adminAuth');
const { validateQRCode } = require('../controllers/bookingController');

router.post('/bookings/qrcode/validate', adminProtect, validateQRCode);

module.exports = router;
```

### 2. Controller Function

```javascript
// controllers/bookingController.js
exports.validateQRCode = async (req, res) => {
  try {
    const { bookingId } = req.body;

    // Validation
    if (!bookingId) {
      return res.status(400).json({
        success: false,
        message: 'Booking ID is required'
      });
    }

    // Find booking
    const booking = await Booking.findOne({ bookingId })
      .populate('userId', 'name email phone')
      .populate('eventId', 'title date time location venue');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check status
    if (booking.status !== 'confirmed') {
      return res.status(400).json({
        success: false,
        message: `Cannot validate. Status is ${booking.status}`
      });
    }

    // Check if already used
    if (booking.isUsed) {
      return res.status(400).json({
        success: false,
        message: 'This ticket has already been used',
        usedAt: booking.usedAt
      });
    }

    // Mark as used
    booking.isUsed = true;
    booking.usedAt = new Date();
    booking.validatedBy = req.userId;
    await booking.save();

    // Return response
    res.json({
      success: true,
      message: 'Ticket validated successfully',
      booking: {
        bookingId: booking.bookingId,
        userName: booking.userId.name,
        userEmail: booking.userId.email,
        userPhone: booking.userId.phone,
        eventTitle: booking.eventId.title,
        ticketQuantity: booking.ticketQuantity,
        totalAmount: booking.totalAmount,
        validatedAt: booking.usedAt,
        ticketDetails: booking.ticketDetails
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};
```

---

## Axios Request Examples

### 1. Basic Validation Request

```javascript
import api from '../services/api';

const validateBooking = async (bookingId) => {
  try {
    const response = await api.post('/api/admin/bookings/qrcode/validate', {
      bookingId: bookingId
    });
    
    console.log('Success:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error:', error.response.data.message);
    throw error;
  }
};
```

### 2. With Loading State

```javascript
const validateWithLoader = async (bookingId) => {
  setLoading(true);
  setError(null);

  try {
    const response = await api.post(
      '/api/admin/bookings/qrcode/validate',
      { bookingId }
    );
    
    setResult(response.data.booking);
    setSuccess(true);
  } catch (error) {
    setError(error.response?.data?.message || 'Validation failed');
  } finally {
    setLoading(false);
  }
};
```

### 3. With Retry Logic

```javascript
const validateWithRetry = async (bookingId, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await api.post(
        '/api/admin/bookings/qrcode/validate',
        { bookingId }
      );
      return response.data;
    } catch (error) {
      if (i === retries - 1) throw error;
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
};
```

### 4. With Timeout

```javascript
const validateWithTimeout = async (bookingId, timeout = 5000) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await api.post(
      '/api/admin/bookings/qrcode/validate',
      { bookingId },
      { signal: controller.signal }
    );
    return response.data;
  } catch (error) {
    if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout');
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
};
```

---

## Error Handling Patterns

### 1. Basic Error Handling

```javascript
try {
  const response = await api.post('/api/admin/bookings/qrcode/validate', {
    bookingId: 'BK-test'
  });
} catch (error) {
  if (error.response) {
    // Server responded with error
    console.log('Status:', error.response.status);
    console.log('Message:', error.response.data.message);
  } else if (error.request) {
    // Request was made but no response
    console.log('No response received');
  } else {
    // Error in request setup
    console.log('Error:', error.message);
  }
}
```

### 2. Specific Error Handling

```javascript
const handleValidationError = (error) => {
  if (!error.response) {
    return 'Network error - check connection';
  }

  const { status, data } = error.response;

  switch (status) {
    case 400:
      return data.message || 'Invalid request';
    case 404:
      return 'Booking not found';
    case 401:
    case 403:
      return 'Unauthorized access';
    case 500:
      return 'Server error';
    default:
      return 'Validation failed';
  }
};
```

### 3. Error Recovery

```javascript
const validateWithRecovery = async (bookingId) => {
  try {
    return await api.post('/api/admin/bookings/qrcode/validate', {
      bookingId
    });
  } catch (error) {
    // Log error
    console.error('Validation failed:', error);

    // Use fallback
    const storedResult = localStorage.getItem(`booking_${bookingId}`);
    if (storedResult) {
      console.log('Using cached result');
      return JSON.parse(storedResult);
    }

    // Throw if no fallback
    throw error;
  }
};
```

---

## Testing Examples

### 1. Jest Unit Test

```javascript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import QRValidation from './QRValidation';
import api from './services/api';

jest.mock('./services/api');

describe('QRValidation', () => {
  test('validates booking on successful scan', async () => {
    api.post.mockResolvedValueOnce({
      data: {
        success: true,
        booking: { bookingId: 'BK-test' }
      }
    });

    render(<QRValidation />);
    
    const input = screen.getByDisplayValue('');
    fireEvent.change(input, { target: { value: 'BK-test' } });
    fireEvent.click(screen.getByText('Validate'));

    await waitFor(() => {
      expect(screen.getByText('✅ Ticket Valid')).toBeInTheDocument();
    });
  });

  test('shows error on invalid booking', async () => {
    api.post.mockRejectedValueOnce({
      response: {
        status: 404,
        data: { message: 'Booking not found' }
      }
    });

    render(<QRValidation />);
    
    // ... test error display
  });
});
```

### 2. Manual Testing Script

```bash
#!/bin/bash
# test-qr-validation.sh

ADMIN_TOKEN="your_admin_token"
API_URL="http://localhost:5000"

echo "Testing QR Validation API..."

# Test 1: Valid booking
echo "Test 1: Valid booking"
curl -X POST $API_URL/api/admin/bookings/qrcode/validate \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"bookingId": "BK-valid123"}'

echo ""

# Test 2: Invalid booking
echo "Test 2: Invalid booking"
curl -X POST $API_URL/api/admin/bookings/qrcode/validate \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"bookingId": "BK-invalid"}'
```

---

## QR Code Generation

### 1. Generate QR Code in React

```javascript
import QRCode from 'qrcode.react';

export function GenerateQRCode({ booking }) {
  const qrData = JSON.stringify({
    bookingId: booking.bookingId,
    eventTitle: booking.eventId.title,
    eventDate: booking.eventId.date,
    ticketQuantity: booking.ticketQuantity,
    totalAmount: booking.totalAmount
  });

  return (
    <div>
      <QRCode
        value={qrData}
        size={256}
        level="H"
        includeMargin={true}
      />
      <button onClick={() => {
        const canvas = document.querySelector('canvas');
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = `${booking.bookingId}.png`;
        link.click();
      }}>
        Download QR Code
      </button>
    </div>
  );
}
```

### 2. Generate QR Code in Node.js

```javascript
const QRCode = require('qrcode');

async function generateQRCode(booking) {
  const qrData = JSON.stringify({
    bookingId: booking.bookingId,
    eventTitle: booking.eventTitle,
    eventDate: booking.eventDate,
    ticketQuantity: booking.ticketQuantity,
    totalAmount: booking.totalAmount
  });

  try {
    // Save to file
    await QRCode.toFile(
      `qr_${booking.bookingId}.png`,
      qrData,
      {
        errorCorrectionLevel: 'H',
        type: 'image/png',
        width: 300,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      }
    );

    // Or generate data URL
    const qrDataUrl = await QRCode.toDataURL(qrData, {
      errorCorrectionLevel: 'H'
    });

    return qrDataUrl;
  } catch (error) {
    console.error('QR generation error:', error);
  }
}
```

### 3. Generate QR Code in Backend

```javascript
// In confirmBooking controller
const QRCode = require('qrcode');

const qrData = JSON.stringify({
  bookingId: booking.bookingId,
  eventTitle: event.title,
  eventDate: event.date,
  ticketQuantity: booking.ticketQuantity,
  totalAmount: booking.totalAmount
});

const qrCode = await QRCode.toDataURL(qrData);

// Store in booking
booking.qrCode = qrCode;
await booking.save();
```

---

## Database Queries

### 1. Find Validated Bookings

```javascript
// Find all validated bookings for an event
const validated = await Booking.find({
  eventId: eventId,
  isUsed: true
}).sort({ usedAt: -1 });
```

### 2. Count Validations

```javascript
// Count validated tickets
const count = await Booking.countDocuments({
  eventId: eventId,
  isUsed: true
});

// Count today's validations
const today = new Date();
today.setHours(0, 0, 0, 0);

const todayCount = await Booking.countDocuments({
  eventId: eventId,
  isUsed: true,
  usedAt: { $gte: today }
});
```

### 3. Get Validation Report

```javascript
// Get validation statistics
const stats = await Booking.aggregate([
  {
    $match: {
      eventId: ObjectId(eventId),
      isUsed: true
    }
  },
  {
    $group: {
      _id: '$eventId',
      totalValidated: { $sum: '$ticketQuantity' },
      revenue: { $sum: '$totalAmount' },
      count: { $sum: 1 }
    }
  }
]);
```

### 4. Get Validation History

```javascript
// Get who validated what and when
const history = await Booking.find({
  eventId: eventId,
  isUsed: true
})
  .populate('userId', 'name email')
  .populate('validatedBy', 'name email')
  .select('bookingId ticketQuantity usedAt validatedBy')
  .sort({ usedAt: -1 })
  .limit(100);
```

### 5. Find Non-Validated Tickets

```javascript
// Find tickets that haven't been used yet
const unused = await Booking.find({
  eventId: eventId,
  status: 'confirmed',
  isUsed: false
});
```

---

## Advanced Patterns

### 1. Rate Limiting

```javascript
const rateLimit = require('express-rate-limit');

const validateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: 'Too many validation attempts, try again later'
});

router.post(
  '/bookings/qrcode/validate',
  adminProtect,
  validateLimiter,
  validateQRCode
);
```

### 2. Logging

```javascript
const logger = require('winston');

exports.validateQRCode = async (req, res) => {
  try {
    const { bookingId } = req.body;

    // Log attempt
    logger.info('QR validation attempt', {
      bookingId,
      adminId: req.userId,
      timestamp: new Date()
    });

    const booking = await Booking.findOne({ bookingId });
    
    if (booking.isUsed) {
      // Log duplicate attempt
      logger.warn('Duplicate validation attempt', {
        bookingId,
        adminId: req.userId,
        previousValidation: booking.usedAt
      });
    }

    // ... validation logic
  } catch (error) {
    logger.error('Validation error', {
      bookingId: req.body.bookingId,
      error: error.message
    });
  }
};
```

### 3. Cache Management

```javascript
const redis = require('redis');
const client = redis.createClient();

const getCachedBooking = async (bookingId) => {
  const cached = await client.get(`booking:${bookingId}`);
  if (cached) return JSON.parse(cached);
  
  const booking = await Booking.findOne({ bookingId });
  await client.setEx(`booking:${bookingId}`, 300, JSON.stringify(booking));
  
  return booking;
};
```

---

## Installation Commands

```bash
# Install dependencies for QR scanning
npm install jsqr             # QR detection
npm install qrcode           # QR generation
npm install qrcode.react     # React component
npm install axios            # HTTP client
npm install express-rate-limit  # Rate limiting
npm install winston          # Logging
npm install redis            # Caching
```

---

**Last Updated:** March 16, 2026
