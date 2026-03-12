const transporter = require('../config/email');

// @desc    Send booking confirmation email
// @param   booking - populated booking object with userId, eventId details
exports.sendConfirmationEmail = async (booking) => {
  try {
    if (!booking.userId || !booking.userId.email) {
      console.warn('Booking missing user email, skipping confirmation email');
      return;
    }

    const eventTitle = booking.eventId?.title || 'Event';
    const eventDate = booking.eventId?.date || 'TBD';
    const totalAmount = booking.totalAmount || 0;
    const bookingId = booking.bookingId || booking._id;

    // Create confirmation email HTML
    const confirmationHTML = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Booking Confirmation</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
          }
          .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          .email-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
          }
          .email-header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 600;
          }
          .email-body {
            padding: 40px;
          }
          .email-body h2 {
            color: #333;
            font-size: 20px;
            margin-top: 0;
            margin-bottom: 20px;
          }
          .email-body p {
            color: #666;
            margin-bottom: 15px;
            font-size: 14px;
          }
          .booking-details {
            background-color: #f9f9f9;
            border: 1px solid #ddd;
            padding: 20px;
            border-radius: 6px;
            margin: 20px 0;
          }
          .detail-row {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #eee;
          }
          .detail-row:last-child {
            border-bottom: none;
          }
          .detail-label {
            font-weight: 600;
            color: #333;
          }
          .detail-value {
            color: #666;
          }
          .total-row {
            display: flex;
            justify-content: space-between;
            padding: 15px 0;
            border-top: 2px solid #667eea;
            margin-top: 10px;
          }
          .total-label {
            font-weight: 700;
            color: #333;
            font-size: 16px;
          }
          .total-value {
            font-weight: 700;
            color: #667eea;
            font-size: 16px;
          }
          .ticket-section {
            background-color: #e8f4f8;
            border: 1px solid #b3d9e8;
            color: #004085;
            padding: 15px;
            border-radius: 4px;
            margin: 20px 0;
            font-size: 14px;
          }
          .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 6px;
            margin-top: 20px;
            text-align: center;
            font-weight: 600;
          }
          .email-footer {
            background-color: #f9f9f9;
            padding: 20px;
            text-align: center;
            border-top: 1px solid #ddd;
          }
          .email-footer p {
            margin: 5px 0;
            color: #999;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="email-header">
            <h1>✅ Booking Confirmed!</h1>
          </div>
          <div class="email-body">
            <h2>Thank you for your purchase, ${booking.userId.name}!</h2>
            <p>Your booking has been successfully confirmed. Below are your booking details:</p>
            
            <div class="booking-details">
              <div class="detail-row">
                <span class="detail-label">Booking ID:</span>
                <span class="detail-value">${bookingId}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Event:</span>
                <span class="detail-value">${eventTitle}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Event Date:</span>
                <span class="detail-value">${new Date(eventDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Number of Tickets:</span>
                <span class="detail-value">${booking.ticketQuantity || 'See confirmation'}</span>
              </div>
              <div class="total-row">
                <span class="total-label">Total Amount:</span>
                <span class="total-value">₹${totalAmount.toFixed(2)}</span>
              </div>
            </div>
            
            <div class="ticket-section">
              <strong>📱 Your digital tickets are ready!</strong> You can view and download your tickets from your dashboard.
            </div>
            
            <p>Please save this email for your records. You'll need your Booking ID when checking in at the event.</p>
            
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard" class="cta-button">View Your Booking</a>
            
            <p style="margin-top: 30px; color: #999; font-size: 13px;">
              If you have any questions, please contact our support team.
            </p>
          </div>
          <div class="email-footer">
            <p>&copy; ${new Date().getFullYear()} Event Management System. All rights reserved.</p>
            <p>This is an automated email. Please do not reply directly.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: process.env.SMTP_FROM_EMAIL,
      to: booking.userId.email,
      subject: `Booking Confirmation - ${eventTitle}`,
      html: confirmationHTML,
    };

    // Send the email
    await transporter.sendMail(mailOptions);
    console.log(`✅ Confirmation email sent to ${booking.userId.email}`);

    return true;
  } catch (error) {
    console.error('❌ Error sending confirmation email:', error.message);
    // Don't throw - email failure shouldn't block booking confirmation
    return false;
  }
};

// @desc    Send password reset email
exports.sendPasswordResetEmail = async (email, resetToken, userName) => {
  try {
    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

    const resetHTML = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset Request</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
          }
          .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          .email-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
          }
          .email-body {
            padding: 40px;
          }
          .warning-box {
            background-color: #fff3cd;
            border: 1px solid #ffc107;
            color: #856404;
            padding: 15px;
            border-radius: 4px;
            margin: 20px 0;
            font-size: 14px;
          }
          .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 6px;
            margin-top: 20px;
            text-align: center;
            font-weight: 600;
          }
          .email-footer {
            background-color: #f9f9f9;
            padding: 20px;
            text-align: center;
            border-top: 1px solid #ddd;
          }
          .email-footer p {
            margin: 5px 0;
            color: #999;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="email-header">
            <h1>Password Reset Request</h1>
          </div>
          <div class="email-body">
            <p>Hi ${userName || 'User'},</p>
            <p>We received a request to reset your password. Click the button below to set a new password.</p>
            
            <a href="${resetLink}" class="cta-button">Reset Password</a>
            
            <div class="warning-box">
              <strong>⚠️ Security Notice:</strong> This link will expire in 30 minutes. If you didn't request a password reset, please ignore this email or contact support immediately.
            </div>
            
            <p>Not able to click the button? Copy and paste this link in your browser:</p>
            <p style="word-break: break-all; color: #667eea; font-size: 12px;">${resetLink}</p>
          </div>
          <div class="email-footer">
            <p>&copy; ${new Date().getFullYear()} Event Management System. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: process.env.SMTP_FROM_EMAIL,
      to: email,
      subject: 'Password Reset Request',
      html: resetHTML,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Password reset email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('❌ Error sending password reset email:', error.message);
    return false;
  }
};

// @desc    Send welcome email to new user
exports.sendWelcomeEmail = async (email, userName) => {
  try {
    const welcomeHTML = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
          }
          .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          .email-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
          }
          .email-body {
            padding: 40px;
          }
          .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 6px;
            margin-top: 20px;
            text-align: center;
            font-weight: 600;
          }
          .email-footer {
            background-color: #f9f9f9;
            padding: 20px;
            text-align: center;
            border-top: 1px solid #ddd;
          }
          .email-footer p {
            margin: 5px 0;
            color: #999;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="email-header">
            <h1>Welcome, ${userName}! 🎉</h1>
          </div>
          <div class="email-body">
            <p>Thank you for joining our Event Management Platform!</p>
            <p>You can now browse events and purchase tickets. Explore amazing events in your area and create unforgettable memories.</p>
            
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" class="cta-button">Browse Events</a>
            
            <p style="margin-top: 30px; color: #999; font-size: 13px;">
              If you need any assistance, our support team is here to help.
            </p>
          </div>
          <div class="email-footer">
            <p>&copy; ${new Date().getFullYear()} Event Management System. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: process.env.SMTP_FROM_EMAIL,
      to: email,
      subject: `Welcome to Our Platform, ${userName}!`,
      html: welcomeHTML,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Welcome email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('❌ Error sending welcome email:', error.message);
    return false;
  }
};
