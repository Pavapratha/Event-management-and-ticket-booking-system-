import React, { useState, useRef, useEffect } from 'react';
import api from '../services/api';
import '../styles/QRValidation.css';

// Dynamically import jsQR library
let jsQR;
(async () => {
  try {
    jsQR = (await import('jsqr')).default;
  } catch (err) {
    console.warn('jsQR not installed. Install with: npm install jsqr');
  }
})();

function QRValidation() {
  const [bookingId, setBookingId] = useState('');
  const [validationResult, setValidationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [scanMessage, setScanMessage] = useState('');
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const scannedCodesRef = useRef(new Set()); // Prevent duplicate scans
  const scanIntervalRef = useRef(null);

  // Initialize camera for QR scanning
  const startCamera = async () => {
    try {
      setError(null);
      setScanMessage('Initializing camera...');
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
      });
      
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setShowCamera(true);
        setIsScanning(true);
        setScanMessage('Camera ready. Point at QR code...');
        
        // Start scanning when video is ready
        videoRef.current.onloadedmetadata = () => {
          startQRScanning();
        };
      }
    } catch (err) {
      console.error('Camera error:', err);
      setError('Unable to access camera. Please check permissions and ensure HTTPS is enabled.');
      setShowCamera(false);
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
      setShowCamera(false);
      setIsScanning(false);
      setScanMessage('');
      
      // Clear scan interval
      if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current);
        scanIntervalRef.current = null;
      }
    }
  };

  // Continuous QR code scanning from video
  const startQRScanning = () => {
    if (!jsQR) {
      setError('QR scanner library not available. Please install jsQR: npm install jsqr');
      return;
    }

    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
    }

    scanIntervalRef.current = setInterval(async () => {
      if (videoRef.current && canvasRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
        const canvas = canvasRef.current;
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;

        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);

        if (code && code.data) {
          handleQRCodeDetected(code.data);
        }
      }
    }, 100); // Scan every 100ms
  };

  // Handle detected QR code
  const handleQRCodeDetected = (qrData) => {
    try {
      // Parse QR data - it could be JSON or plain text
      let parsedData;
      
      try {
        parsedData = JSON.parse(qrData);
      } catch {
        // If not JSON, treat as booking ID directly
        parsedData = { bookingId: qrData };
      }

      const detectedBookingId = parsedData.bookingId || qrData;

      // Prevent duplicate scans
      if (scannedCodesRef.current.has(detectedBookingId)) {
        return;
      }

      // Mark as scanned
      scannedCodesRef.current.add(detectedBookingId);

      setScanMessage(`QR detected: ${detectedBookingId}`);
      
      // Auto-validate the scanned booking ID
      validateScannedTicket(detectedBookingId);
      
      // Stop scanning after successful QR detection
      setIsScanning(false);
    } catch (err) {
      console.error('Error parsing QR data:', err);
      setError('Invalid QR code format');
    }
  };

  // Validate ticket from QR scan (internal function)
  const validateScannedTicket = async (scannedBookingId) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    setValidationResult(null);

    try {
      const response = await api.post('/api/admin/bookings/qrcode/validate', {
        bookingId: scannedBookingId.trim(),
      });

      if (response.data.success) {
        setValidationResult(response.data.booking);
        setSuccess(response.data.message);
        setScanMessage('✅ Ticket validated successfully');
        stopCamera();
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to validate ticket';
      setError(errorMsg);
      setScanMessage(`❌ ${errorMsg}`);
      
      if (err.response?.data?.usedAt) {
        setValidationResult({
          error: true,
          message: errorMsg,
          usedAt: err.response.data.usedAt,
        });
      }
      
      // Continue scanning on error
      setIsScanning(true);
    } finally {
      setLoading(false);
    }
  };

  // Manual validation (form submission)
  const validateTicket = async (e) => {
    e.preventDefault();
    
    if (!bookingId.trim()) {
      setError('Please enter a Booking ID');
      return;
    }

    if (scannedCodesRef.current.has(bookingId.trim())) {
      setError('This booking has already been validated in this session');
      return;
    }

    await validateScannedTicket(bookingId);
    setBookingId(''); // Clear input after validation
  };

  // Reset for new scan
  const resetForNewScan = () => {
    setValidationResult(null);
    setSuccess(null);
    setError(null);
    setBookingId('');
    setScanMessage('');
    scannedCodesRef.current.clear(); // Clear scanned codes cache
    
    if (showCamera) {
      setIsScanning(true);
      setScanMessage('Camera ready. Point at QR code...');
      startQRScanning();
    }
  };

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

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">QR Code Validation</h1>
          <p className="page-subtitle">Scan tickets at venue entry</p>
        </div>
      </div>

      <div className="qr-validation-container">
        {/* Input/Camera Section */}
        <div className="qr-input-section">
          <div className="qr-card">
            <h2 className="qr-section-title">Validate Ticket</h2>
            
            <form onSubmit={validateTicket} className="qr-form">
              <div className="form-group">
                <label htmlFor="bookingId" className="form-label">
                  Booking ID
                </label>
                <div className="input-group">
                  <input
                    type="text"
                    id="bookingId"
                    value={bookingId}
                    onChange={(e) => setBookingId(e.target.value)}
                    placeholder="Enter Booking ID (e.g., BK-XXXXXXXX)"
                    className="form-input"
                    disabled={loading || showCamera}
                  />
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading || showCamera}
                  >
                    {loading ? 'Validating...' : 'Validate'}
                  </button>
                </div>
              </div>

              <div className="form-divider">
                <span>OR</span>
              </div>

              <div className="camera-section">
                {!showCamera ? (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={startCamera}
                    disabled={loading}
                  >
                    📷 Start QR Scanner
                  </button>
                ) : (
                  <>
                    <div className="camera-status">
                      <div className={`status-indicator ${isScanning ? 'active' : 'inactive'}`} />
                      <span className="status-text">
                        {scanMessage || (isScanning ? 'Scanning...' : 'Ready')}
                      </span>
                    </div>

                    <div className="camera-container">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="camera-video"
                      />
                      <canvas
                        ref={canvasRef}
                        style={{ display: 'none' }}
                      />
                      <div className="qr-scanner-overlay">
                        <div className="scanner-frame" />
                      </div>
                    </div>
                    
                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={stopCamera}
                    >
                      ✕ Close Camera
                    </button>
                  </>
                )}
              </div>
            </form>

            {error && (
              <div className="alert alert-danger">
                <strong>❌ Error:</strong> {error}
              </div>
            )}

            {success && !validationResult?.error && (
              <div className="alert alert-success">
                <strong>✅ Success:</strong> {success}
              </div>
            )}
          </div>
        </div>

        {/* Validation Result Section */}
        {validationResult && (
          <div className="qr-result-section">
            <div className="qr-card">
              {validationResult.error ? (
                <div className="result-invalid">
                  <h2 className="result-title error">❌ Invalid Ticket</h2>
                  <p className="result-message">{validationResult.message}</p>
                  {validationResult.usedAt && (
                    <div className="result-detail">
                      <strong>Previously Used At:</strong>
                      <span>{new Date(validationResult.usedAt).toLocaleString()}</span>
                    </div>
                  )}
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={resetForNewScan}
                    style={{ marginTop: '16px' }}
                  >
                    Scan Another Ticket
                  </button>
                </div>
              ) : (
                <div className="result-valid">
                  <h2 className="result-title success">✅ Ticket Valid</h2>
                  <p className="validation-status-badge">VALID</p>
                  
                  <div className="result-details-grid">
                    {/* Booking Info */}
                    <div className="result-section">
                      <h3 className="result-subtitle">Booking Information</h3>
                      <div className="result-detail">
                        <span className="label">Booking ID:</span>
                        <span className="value">{validationResult.bookingId}</span>
                      </div>
                      <div className="result-detail">
                        <span className="label">Total Amount:</span>
                        <span className="value price">
                          ${validationResult.totalAmount?.toFixed(2) || '0.00'}
                        </span>
                      </div>
                      <div className="result-detail">
                        <span className="label">Tickets:</span>
                        <span className="value">{validationResult.ticketQuantity}</span>
                      </div>
                      <div className="result-detail">
                        <span className="label">Validated At:</span>
                        <span className="value">
                          {new Date(validationResult.validatedAt).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* User Info */}
                    <div className="result-section">
                      <h3 className="result-subtitle">Customer Information</h3>
                      <div className="result-detail">
                        <span className="label">Name:</span>
                        <span className="value">{validationResult.userName}</span>
                      </div>
                      <div className="result-detail">
                        <span className="label">Email:</span>
                        <span className="value email">{validationResult.userEmail}</span>
                      </div>
                      {validationResult.userPhone && (
                        <div className="result-detail">
                          <span className="label">Phone:</span>
                          <span className="value">{validationResult.userPhone}</span>
                        </div>
                      )}
                    </div>

                    {/* Event Info */}
                    <div className="result-section">
                      <h3 className="result-subtitle">Event Information</h3>
                      <div className="result-detail">
                        <span className="label">Event:</span>
                        <span className="value">{validationResult.eventTitle}</span>
                      </div>
                      <div className="result-detail">
                        <span className="label">Date:</span>
                        <span className="value">
                          {new Date(validationResult.eventDate).toLocaleDateString()}
                        </span>
                      </div>
                      {validationResult.eventTime && (
                        <div className="result-detail">
                          <span className="label">Time:</span>
                          <span className="value">{validationResult.eventTime}</span>
                        </div>
                      )}
                      {validationResult.eventVenue && (
                        <div className="result-detail">
                          <span className="label">Venue:</span>
                          <span className="value">{validationResult.eventVenue}</span>
                        </div>
                      )}
                    </div>

                    {/* Ticket Details */}
                    {validationResult.ticketDetails && validationResult.ticketDetails.length > 0 && (
                      <div className="result-section full-width">
                        <h3 className="result-subtitle">Ticket Details</h3>
                        <div className="ticket-details-table">
                          {validationResult.ticketDetails.map((ticket, idx) => (
                            <div key={idx} className="ticket-row">
                              <span className="category">{ticket.categoryName}</span>
                              <span className="quantity">Qty: {ticket.quantity}</span>
                              <span className="price">
                                ${ticket.price.toFixed(2)} × {ticket.quantity} = ${ticket.subtotal.toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={resetForNewScan}
                    style={{ marginTop: '20px', width: '100%' }}
                  >
                    🔄 Scan Another Ticket
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default QRValidation;
