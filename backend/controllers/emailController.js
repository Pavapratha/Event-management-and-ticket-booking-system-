const transporter = require('../config/email');

const formatEventDate = (eventDate) => {
  if (!eventDate) {
    return 'TBD';
  }

  return new Date(eventDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const getEventLocation = (event) => event?.location || event?.venue || 'TBD';

const buildBookingConfirmationText = (booking) => {
  const userName = booking.userId?.name || 'Customer';
  const eventName = booking.eventId?.title || 'Event';
  const eventDate = formatEventDate(booking.eventId?.date);
  const eventTime = booking.eventId?.time || 'TBD';
  const eventLocation = getEventLocation(booking.eventId);

  return `Hello ${userName},

Your ticket for ${eventName} has been successfully booked.

Event Details:
Event: ${eventName}
Date: ${eventDate}
Time: ${eventTime}
Location: ${eventLocation}

Booking ID: ${booking.bookingId || booking._id}

Thank you for booking with us!`;
};

const buildBookingConfirmationHtml = (booking) => {
  const userName = booking.userId?.name || 'Customer';
  const eventName = booking.eventId?.title || 'Event';
  const eventDate = formatEventDate(booking.eventId?.date);
  const eventTime = booking.eventId?.time || 'TBD';
  const eventLocation = getEventLocation(booking.eventId);

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Event Booking Confirmation</title>
      <style>
        body {
          margin: 0;
          padding: 24px;
          background: #f8fafc;
          color: #0f172a;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        .card {
          max-width: 640px;
          margin: 0 auto;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 18px 40px rgba(15, 23, 42, 0.08);
        }
        .header {
          padding: 28px 32px;
          background: linear-gradient(135deg, #ea580c, #fb923c);
          color: #ffffff;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
        }
        .body {
          padding: 32px;
          line-height: 1.7;
        }
        .details {
          margin: 24px 0;
          padding: 20px;
          border-radius: 12px;
          background: #fff7ed;
          border: 1px solid #fdba74;
        }
        .details p {
          margin: 0 0 8px;
        }
        .footer {
          padding: 0 32px 32px;
          color: #475569;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <h1>Event Booking Confirmation</h1>
        </div>
        <div class="body">
          <p>Hello ${userName},</p>
          <p>Your ticket for <strong>${eventName}</strong> has been successfully booked.</p>

          <div class="details">
            <p><strong>Event:</strong> ${eventName}</p>
            <p><strong>Date:</strong> ${eventDate}</p>
            <p><strong>Time:</strong> ${eventTime}</p>
            <p><strong>Location:</strong> ${eventLocation}</p>
            <p><strong>Booking ID:</strong> ${booking.bookingId || booking._id}</p>
          </div>

          <p>Thank you for booking with us!</p>
        </div>
        <div class="footer">
          This is an automated email from the Event Ticket Booking System.
        </div>
      </div>
    </body>
    </html>
  `;
};

// @desc    Send booking confirmation email
// @param   booking - populated booking object with userId, eventId details
exports.sendConfirmationEmail = async (booking) => {
  try {
    if (!booking.userId || !booking.userId.email) {
      console.warn('Booking missing user email, skipping confirmation email');
      return;
    }

    const mailOptions = {
      from: process.env.SMTP_FROM_EMAIL,
      to: booking.userId.email,
      subject: 'Event Booking Confirmation',
      text: buildBookingConfirmationText(booking),
      html: buildBookingConfirmationHtml(booking),
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
