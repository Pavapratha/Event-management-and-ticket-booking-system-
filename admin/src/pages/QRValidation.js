import React, { useState, useRef, useEffect } from 'react';
import api from '../services/api';
import '../styles/QRValidation.css';

function QRValidation() {
  // Manual Entry
  const [bookingId, setBookingId] = useState('');
  
  // Image Upload
  const [uploadedImage, setUploadedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const imageInputRef = useRef(null);
  const canvasRef = useRef(null);
  const videoRef = useRef(null);
  
  // Camera Scanner
  const cameraStreamRef = useRef(null);
  const cameraAnimationFrameRef = useRef(null);
  const cameraSessionRef = useRef(0);
  const jsQrLoaderRef = useRef(null);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraStatus, setCameraStatus] = useState('');
  
  // Validation State
  const [validationResult, setValidationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const [manualError, setManualError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [activeTab, setActiveTab] = useState('camera');
  
  // Prevent duplicate validations
  const scannedCodesRef = useRef(new Set());
  const scanningActiveRef = useRef(false);
  const tabSessionRef = useRef(0);

  const clearTabErrors = () => {
    setCameraError(null);
    setUploadError(null);
    setManualError(null);
  };

  const setErrorForTab = (tab, message) => {
    if (tab === 'camera') {
      setCameraError(message);
    } else if (tab === 'upload') {
      setUploadError(message);
    } else if (tab === 'manual') {
      setManualError(message);
    }
  };

  const clearErrorForTab = (tab) => {
    if (tab === 'camera') {
      setCameraError(null);
    } else if (tab === 'upload') {
      setUploadError(null);
    } else if (tab === 'manual') {
      setManualError(null);
    }
  };

  const isStaleSession = (sessionId) => sessionId !== tabSessionRef.current;

  const handleTabChange = async (tab) => {
    tabSessionRef.current += 1;
    await stopCamera();
    setActiveTab(tab);
    setLoading(false);
    setValidationResult(null);
    setSuccess(null);
    clearTabErrors();
    setCameraStatus('');
    setBookingId('');
    setUploadedImage(null);
    setImagePreview(null);
    setDragActive(false);
    scannedCodesRef.current.clear();

    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  };

  const loadJsQR = async () => {
    if (window.jsQR) {
      return window.jsQR;
    }

    if (!jsQrLoaderRef.current) {
      jsQrLoaderRef.current = new Promise((resolve, reject) => {
        const existingScript = document.querySelector('script[data-jsqr-loader="true"]');

        if (existingScript) {
          existingScript.addEventListener('load', () => resolve(window.jsQR));
          existingScript.addEventListener('error', () => reject(new Error('Failed to load jsQR library')));
          return;
        }

        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js';
        script.async = true;
        script.dataset.jsqrLoader = 'true';
        script.onload = () => resolve(window.jsQR);
        script.onerror = () => reject(new Error('Failed to load jsQR library'));
        document.body.appendChild(script);
      }).catch((err) => {
        jsQrLoaderRef.current = null;
        throw err;
      });
    }

    return jsQrLoaderRef.current;
  };

  const stopCameraStream = () => {
    if (cameraAnimationFrameRef.current) {
      cancelAnimationFrame(cameraAnimationFrameRef.current);
      cameraAnimationFrameRef.current = null;
    }

    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach((track) => track.stop());
      cameraStreamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.srcObject = null;
    }
  };

  const requestCameraStream = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('MediaDevices API unavailable');
    }

    try {
      return await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      });
    } catch (preferredError) {
      if (preferredError.name === 'NotAllowedError' || preferredError.name === 'NotReadableError') {
        throw preferredError;
      }

      try {
        return await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      } catch (fallbackError) {
        throw fallbackError;
      }
    }
  };

  const scanCameraFrame = (sessionId) => {
    if (!scanningActiveRef.current || isStaleSession(sessionId)) {
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas || video.readyState < 2) {
      cameraAnimationFrameRef.current = requestAnimationFrame(() => scanCameraFrame(sessionId));
      return;
    }

    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) {
      setErrorForTab('camera', 'Unable to start camera. Please try again.');
      stopCamera();
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const qrCode = window.jsQR(imageData.data, imageData.width, imageData.height);

    if (qrCode?.data) {
      handleQRDetected(qrCode.data, sessionId);
      return;
    }

    cameraAnimationFrameRef.current = requestAnimationFrame(() => scanCameraFrame(sessionId));
  };

  /**
   * MECHANISM 1: CAMERA QR SCANNING
   * Uses native camera access + jsQR for reliable QR detection
   */
  const startCamera = async () => {
    // Prevent duplicate initialization
    if (scanningActiveRef.current) {
      return;
    }
    const sessionId = tabSessionRef.current;
    
    try {
      clearErrorForTab('camera');
      setCameraStatus('Initializing camera...');
      scanningActiveRef.current = true;
      cameraSessionRef.current = sessionId;

      await loadJsQR();
      if (isStaleSession(sessionId)) {
        scanningActiveRef.current = false;
        return;
      }

      const stream = await requestCameraStream();
      if (isStaleSession(sessionId)) {
        stream.getTracks().forEach((track) => track.stop());
        scanningActiveRef.current = false;
        return;
      }

      cameraStreamRef.current = stream;
      setShowCamera(true);

      requestAnimationFrame(async () => {
        if (isStaleSession(sessionId) || !videoRef.current || !cameraStreamRef.current) {
          stopCameraStream();
          scanningActiveRef.current = false;
          return;
        }

        const video = videoRef.current;
        video.srcObject = cameraStreamRef.current;

        try {
          await video.play();
          if (isStaleSession(sessionId)) {
            stopCameraStream();
            scanningActiveRef.current = false;
            return;
          }

          setCameraStatus('📷 Camera active - Point at QR code');
          cameraAnimationFrameRef.current = requestAnimationFrame(() => scanCameraFrame(sessionId));
        } catch (playError) {
          console.error('Video playback error:', playError);
          setErrorForTab('camera', 'Unable to start camera. Please try again.');
          stopCamera();
        }
      });
    } catch (err) {
      console.error('Camera error:', err);
      stopCameraStream();
      scanningActiveRef.current = false;
      if (isStaleSession(sessionId)) {
        return;
      }
      setShowCamera(false);
      setCameraStatus('');
      
      if (err.name === 'NotAllowedError') {
        setErrorForTab('camera', 'Camera permission was denied. Please allow camera access in your browser settings.');
      } else if (err.name === 'NotFoundError') {
        setErrorForTab('camera', 'No camera found on this device.');
      } else if (err.name === 'NotReadableError') {
        setErrorForTab('camera', 'Camera is already in use by another application.');
      } else {
        setErrorForTab('camera', 'Unable to start camera. Please try again.');
      }
    }
  };

  const stopCamera = async () => {
    try {
      stopCameraStream();
      scanningActiveRef.current = false;
      setShowCamera(false);
      setCameraStatus('');
    } catch (err) {
      console.error('Error stopping camera:', err);
      scanningActiveRef.current = false;
    }
  };

  const handleQRDetected = async (qrData, sessionId = tabSessionRef.current) => {
    if (isStaleSession(sessionId)) {
      return;
    }

    try {
      // Extract bookingId from QR data
      let detectedBookingId = extractBookingId(qrData);
      
      // Prevent duplicate validations
      if (scannedCodesRef.current.has(detectedBookingId)) {
        setCameraStatus('⚠️ Duplicate scan - Already validated');
        return;
      }
      
      scannedCodesRef.current.add(detectedBookingId);
      setCameraStatus(`✅ QR detected: ${detectedBookingId}`);
      scanningActiveRef.current = false;
      await stopCamera();
      
      // Auto-validate
      validateTicketCommon(detectedBookingId, 'camera', sessionId);
    } catch (err) {
      console.error('Error handling QR:', err);
      setErrorForTab('camera', 'Invalid QR code format');
    }
  };

  /**
   * MECHANISM 2: IMAGE UPLOAD & QR DECODING
   * Staff uploads QR code image or drags & drops it
   */
  
  const handleImageUpload = (file) => {
    if (!file) return;
    
    // Validate file is an image
    if (!file.type.startsWith('image/')) {
      setErrorForTab('upload', 'Please select a valid image file (PNG, JPG, etc.)');
      return;
    }
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrorForTab('upload', 'Image is too large. Please choose an image under 5MB.');
      return;
    }
    
    clearErrorForTab('upload');
    setUploadedImage(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
      // Auto-scan the image
      setTimeout(() => scanImageQR(e.target.result), 200);
    };
    reader.readAsDataURL(file);
  };
  
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };
  
  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleImageUpload(files[0]);
    }
  };
  
  const scanImageQR = async (imageDataUrl) => {
    const sessionId = tabSessionRef.current;
    try {
      setLoading(true);
      clearErrorForTab('upload');
      
      // Try html5-qrcode's scanFile method first (most reliable)
      try {
        const { Html5Qrcode } = await import('html5-qrcode');
        if (isStaleSession(sessionId)) {
          return;
        }
        const result = await Html5Qrcode.scanFile(imageDataUrl, true);
        if (isStaleSession(sessionId)) {
          return;
        }
        const detectedBookingId = extractBookingId(result.decodedText);
        
        // Prevent duplicate validations
        if (scannedCodesRef.current.has(detectedBookingId)) {
          setErrorForTab('upload', 'This booking has already been validated in this session');
          setLoading(false);
          return;
        }
        
        scannedCodesRef.current.add(detectedBookingId);
        validateTicketCommon(detectedBookingId, 'upload', sessionId);
        return;
      } catch (html5QrcodeErr) {
        // If html5-qrcode fails, try jsQR as fallback
        console.warn('html5-qrcode scanFile failed, trying jsQR:', html5QrcodeErr);
        decodeQRFromImageJsQR(imageDataUrl, sessionId);
      }
    } catch (err) {
      console.error('Error in scanImageQR:', err);
      if (!isStaleSession(sessionId)) {
        setErrorForTab('upload', 'Error processing image. Please try again.');
        setLoading(false);
      }
    }
  };
  
  const decodeQRFromImageJsQR = async (imageDataUrl, sessionId) => {
    try {
      // Load jsQR dynamically from CDN if not already loaded
      if (!window.jsQR) {
        await loadJsQR();
      }
      if (isStaleSession(sessionId)) {
        return;
      }
      
      // Now decode with jsQR
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        try {
          if (isStaleSession(sessionId)) {
            return;
          }
          // Draw image to canvas
          const canvas = canvasRef.current;
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d', { willReadFrequently: true });
          
          if (!ctx) {
            throw new Error('Unable to get canvas context');
          }
          
          ctx.drawImage(img, 0, 0);
          
          // Get image data
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          
          // Scan QR code with jsQR
          if (!window.jsQR) {
            throw new Error('jsQR library failed to load');
          }
          
          const code = window.jsQR(imageData.data, imageData.width, imageData.height);
          
          if (code && code.data) {
            const detectedBookingId = extractBookingId(code.data);
            
            // Prevent duplicate validations
            if (scannedCodesRef.current.has(detectedBookingId)) {
              setErrorForTab('upload', 'This booking has already been validated in this session');
              setLoading(false);
              return;
            }
            
            scannedCodesRef.current.add(detectedBookingId);
            validateTicketCommon(detectedBookingId, 'upload', sessionId);
          } else {
            setErrorForTab('upload', 'Could not detect a QR code in this image. Please try a clearer image.');
            setLoading(false);
          }
        } catch (err) {
          console.error('Error decoding QR with jsQR:', err);
          if (!isStaleSession(sessionId)) {
            setErrorForTab('upload', 'Error reading QR code from image. Please try another image.');
          }
          setLoading(false);
        }
      };
      
      img.onerror = () => {
        if (!isStaleSession(sessionId)) {
          setErrorForTab('upload', 'Failed to load image. Please try again.');
          setLoading(false);
        }
      };
      
      img.src = imageDataUrl;
    } catch (err) {
      console.error('Error in jsQR decoding:', err);
      if (!isStaleSession(sessionId)) {
        setErrorForTab('upload', err.message || 'Failed to process image. Please try again.');
        setLoading(false);
      }
    }
  };
  
  const removeUploadedImage = () => {
    setUploadedImage(null);
    setImagePreview(null);
    clearErrorForTab('upload');
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  };

  /**
   * MECHANISM 3: MANUAL ENTRY
   * Staff types booking ID directly
   */
  const handleManualEntry = async (e) => {
    e.preventDefault();
    
    try {
      clearErrorForTab('manual');
      
      if (!bookingId.trim()) {
        setErrorForTab('manual', 'Please enter a Booking ID');
        return;
      }
      
      const id = bookingId.trim().toUpperCase();
      
      // Prevent duplicate validations
      if (scannedCodesRef.current.has(id)) {
        setErrorForTab('manual', 'This booking has already been validated in this session');
        return;
      }
      
      scannedCodesRef.current.add(id);
      
      // Validate
      validateTicketCommon(id, 'manual', tabSessionRef.current);
      setBookingId(''); // Clear after validation
    } catch (err) {
      setErrorForTab('manual', 'Invalid Booking ID format');
    }
  };

  /**
   * Helper: Extract bookingId from various formats
   */
  const extractBookingId = (data) => {
    try {
      // Try parsing as JSON
      const parsed = JSON.parse(data);
      if (parsed.bookingId) {
        return parsed.bookingId.trim().toUpperCase();
      }
    } catch {
      // Not JSON, treat as plain text
    }
    
    // Return trimmed uppercase string
    const cleaned = data.trim().toUpperCase();
    if (!cleaned) throw new Error('Empty data');
    return cleaned;
  };

  /**
   * Common validation function
   * Used by all three mechanisms
   */
  const validateTicketCommon = async (ticketId, sourceTab, sessionId = tabSessionRef.current) => {
    setLoading(true);
    clearErrorForTab(sourceTab);
    setSuccess(null);
    setValidationResult(null);
    
    try {
      const response = await api.post('/api/admin/bookings/qrcode/validate', {
        bookingId: ticketId,
      });
      if (isStaleSession(sessionId)) {
        return;
      }
      
      const { success: isSuccess, message, booking } = response.data;
      
      if (isSuccess) {
        setSuccess(message);
        setValidationResult({
          ...booking,
          status: 'valid'
        });
      } else {
        setErrorForTab(sourceTab, message || 'Validation failed');
        setValidationResult({
          status: 'invalid',
          message: message || 'Ticket is invalid',
        });
      }
    } catch (err) {
      if (isStaleSession(sessionId)) {
        return;
      }
      const errorMsg = err.response?.data?.message || 'Failed to validate ticket';
      const errorStatus = err.response?.status;
      
      setErrorForTab(sourceTab, errorMsg);
      
      // Handle different error types
      if (errorStatus === 400) {
        // Already used
        setValidationResult({
          status: 'already-used',
          message: errorMsg,
          usedAt: err.response?.data?.usedAt,
        });
      } else if (errorStatus === 404) {
        // Not found
        setValidationResult({
          status: 'invalid',
          message: 'Booking ID not found',
        });
      } else {
        setValidationResult({
          status: 'error',
          message: errorMsg,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Reset for new validation
  const resetForNewValidation = () => {
    tabSessionRef.current += 1;
    setValidationResult(null);
    setSuccess(null);
    clearTabErrors();
    setLoading(false);
    setBookingId('');
    setUploadedImage(null);
    setImagePreview(null);
    setCameraStatus('');
    setDragActive(false);
    scannedCodesRef.current.clear();
    
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
    
    stopCamera();
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCameraStream();
      scanningActiveRef.current = false;
      scannedCodesRef.current.clear();
    };
  }, []);

  return (
    <div>
      {/* Hidden Canvas for Image QR Decoding */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">QR Code Validation System</h1>
          <p className="page-subtitle">Scan, upload, or enter booking IDs at venue entry</p>
        </div>
      </div>

      <div className="qr-validation-container">
        {/* Tabs */}
        <div className="validation-tabs">
          <button
            className={`tab-button ${activeTab === 'camera' ? 'active' : ''}`}
            onClick={() => handleTabChange('camera')}
          >
            📷 Camera Scan
          </button>
          <button
            className={`tab-button ${activeTab === 'upload' ? 'active' : ''}`}
            onClick={() => handleTabChange('upload')}
          >
            📤 Upload QR Image
          </button>
          <button
            className={`tab-button ${activeTab === 'manual' ? 'active' : ''}`}
            onClick={() => handleTabChange('manual')}
          >
            ⌨️ Manual Entry
          </button>
        </div>

        {/* Tab Content */}
        <div className="tabs-content">
          {/* MECHANISM 1: Camera Scanning */}
          {activeTab === 'camera' && (
            <div className="tab-panel active">
              <div className="qr-card">
                <h2 className="section-title">📷 QR Code Scanner</h2>
                
                {!showCamera ? (
                  <div className="camera-init">
                    <p className="instruction-text">
                      Point your device camera at the QR code on the ticket
                    </p>
                    <button
                      className="btn btn-primary btn-large"
                      onClick={startCamera}
                      disabled={loading}
                    >
                      🎥 Start Camera
                    </button>
                  </div>
                ) : (
                  <div className="camera-active">
                    {/* Camera Status */}
                    <div className={`camera-status ${cameraStatus.includes('✅') ? 'success' : 'scanning'}`}>
                      <span className="status-indicator"></span>
                      <span className="status-text">{cameraStatus || 'Scanning...'}</span>
                    </div>

                    {/* HTML5 QR Code Scanner Container */}
                    <div className="scanner-container">
                      <video
                        ref={videoRef}
                        className="camera-video"
                        autoPlay
                        muted
                        playsInline
                      />
                    </div>

                    {/* Controls */}
                    <button
                      className="btn btn-danger"
                      onClick={stopCamera}
                    >
                      ✕ Stop Camera
                    </button>
                  </div>
                )}

                {/* Error Message */}
                {cameraError && (
                  <div className="alert alert-danger">
                    <strong>❌ Error:</strong> {cameraError}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* MECHANISM 2: Image Upload & QR Decoding */}
          {activeTab === 'upload' && (
            <div className="tab-panel active">
              <div className="qr-card">
                <h2 className="section-title">📤 Upload QR Code Image</h2>
                
                <div className="upload-section">
                  <p className="instruction-text">
                    Upload or drag & drop a QR code image to scan
                  </p>
                  
                  {!imagePreview ? (
                    <div
                      className={`upload-zone ${dragActive ? 'drag-active' : ''}`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                    >
                      <div className="upload-content">
                        <div className="upload-icon">📸</div>
                        <p className="upload-text">Drag & drop your QR image here</p>
                        <p className="upload-subtext">or</p>
                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={() => imageInputRef.current?.click()}
                          disabled={loading}
                        >
                          Choose File
                        </button>
                        <p className="upload-hint">
                          Accepted formats: PNG, JPG, GIF, WebP (Max 5MB)
                        </p>
                      </div>
                      <input
                        ref={imageInputRef}
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            handleImageUpload(e.target.files[0]);
                          }
                        }}
                        style={{ display: 'none' }}
                      />
                    </div>
                  ) : (
                    <div className="image-preview-section">
                      <div className="image-preview-container">
                        <img
                          src={imagePreview}
                          alt="Uploaded QR"
                          className="image-preview"
                        />
                        {loading && (
                          <div className="scanning-overlay">
                            <div className="spinner"></div>
                            <p>Scanning QR code...</p>
                          </div>
                        )}
                      </div>
                      
                      <div className="preview-actions">
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={removeUploadedImage}
                          disabled={loading}
                        >
                          Choose Different Image
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Error Message */}
                {uploadError && (
                  <div className="alert alert-danger">
                    <strong>❌ Error:</strong> {uploadError}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* MECHANISM 3: Manual Entry */}
          {activeTab === 'manual' && (
            <div className="tab-panel active">
              <div className="qr-card">
                <h2 className="section-title">⌨️ Manual Entry</h2>
                
                <form onSubmit={handleManualEntry} className="manual-form">
                  <div className="form-group">
                    <label htmlFor="manualBookingId" className="form-label">
                      Booking ID
                    </label>
                    <div className="input-group">
                      <input
                        type="text"
                        id="manualBookingId"
                        value={bookingId}
                        onChange={(e) => setBookingId(e.target.value)}
                        placeholder="e.g., BK-XXXXXXXX"
                        className="form-input"
                        disabled={loading}
                        autoComplete="off"
                      />
                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading || !bookingId.trim()}
                      >
                        {loading ? '⏳ Validating...' : '✓ Validate'}
                      </button>
                    </div>
                  </div>
                </form>

                {/* Error Message */}
                {manualError && (
                  <div className="alert alert-danger">
                    <strong>❌ Error:</strong> {manualError}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Validation Result */}
        {validationResult && (
          <div className={`validation-result status-${validationResult.status}`}>
            <div className="qr-card result-card">
              {/* Result Status Badge */}
              {validationResult.status === 'valid' && (
                <div className="result-header success">
                  <h2 className="result-title">✅ Ticket Valid</h2>
                  <span className="status-badge valid">VALID</span>
                </div>
              )}
              
              {validationResult.status === 'already-used' && (
                <div className="result-header warning">
                  <h2 className="result-title">⚠️ Already Used</h2>
                  <span className="status-badge already-used">ALREADY USED</span>
                  {validationResult.usedAt && (
                    <p className="used-at">
                      Previously used: {new Date(validationResult.usedAt).toLocaleString()}
                    </p>
                  )}
                </div>
              )}
              
              {validationResult.status === 'invalid' && (
                <div className="result-header error">
                  <h2 className="result-title">❌ Invalid Ticket</h2>
                  <span className="status-badge invalid">INVALID</span>
                </div>
              )}

              {validationResult.status === 'error' && (
                <div className="result-header error">
                  <h2 className="result-title">❌ Error</h2>
                  <span className="status-badge error">ERROR</span>
                </div>
              )}

              {/* Result Details (Only for Valid Tickets) */}
              {validationResult.status === 'valid' && validationResult.bookingId && (
                <div className="result-details">
                  <div className="result-columns">
                    {/* Booking Info */}
                    <div className="result-column">
                      <h3 className="column-title">📦 Booking</h3>
                      <div className="detail-row">
                        <span className="detail-label">Booking ID:</span>
                        <span className="detail-value">{validationResult.bookingId}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Amount:</span>
                        <span className="detail-value amount">
                          ${validationResult.totalAmount?.toFixed(2) || '0.00'}
                        </span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Tickets:</span>
                        <span className="detail-value">{validationResult.ticketQuantity} ticket(s)</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Validated:</span>
                        <span className="detail-value">
                          {new Date(validationResult.validatedAt).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>

                    {/* Customer Info */}
                    <div className="result-column">
                      <h3 className="column-title">👤 Customer</h3>
                      <div className="detail-row">
                        <span className="detail-label">Name:</span>
                        <span className="detail-value">{validationResult.userName}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Email:</span>
                        <span className="detail-value email">{validationResult.userEmail}</span>
                      </div>
                      {validationResult.userPhone && (
                        <div className="detail-row">
                          <span className="detail-label">Phone:</span>
                          <span className="detail-value">{validationResult.userPhone}</span>
                        </div>
                      )}
                    </div>

                    {/* Event Info */}
                    <div className="result-column">
                      <h3 className="column-title">🎭 Event</h3>
                      <div className="detail-row">
                        <span className="detail-label">Event:</span>
                        <span className="detail-value">{validationResult.eventTitle}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Date:</span>
                        <span className="detail-value">
                          {new Date(validationResult.eventDate).toLocaleDateString()}
                        </span>
                      </div>
                      {validationResult.eventTime && (
                        <div className="detail-row">
                          <span className="detail-label">Time:</span>
                          <span className="detail-value">{validationResult.eventTime}</span>
                        </div>
                      )}
                      {validationResult.eventVenue && (
                        <div className="detail-row">
                          <span className="detail-label">Venue:</span>
                          <span className="detail-value">{validationResult.eventVenue}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Ticket Details Table */}
                  {validationResult.ticketDetails && validationResult.ticketDetails.length > 0 && (
                    <div className="ticket-details-section">
                      <h3 className="column-title">🎟️ Ticket Breakdown</h3>
                      <div className="ticket-table">
                        <div className="ticket-header">
                          <span>Ticket Type</span>
                          <span>Quantity</span>
                          <span>Price</span>
                          <span>Subtotal</span>
                        </div>
                        {validationResult.ticketDetails.map((ticket, idx) => (
                          <div key={idx} className="ticket-row">
                            <span>{ticket.categoryName}</span>
                            <span>{ticket.quantity}</span>
                            <span>${ticket.price?.toFixed(2) || '0.00'}</span>
                            <span>${ticket.subtotal?.toFixed(2) || '0.00'}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="result-actions">
                <button
                  className="btn btn-secondary btn-large"
                  onClick={resetForNewValidation}
                >
                  🔄 Validate Another Ticket
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default QRValidation;
