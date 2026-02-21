const getVerificationEmailTemplate = (userName, verificationCode, tokenExpiry = '10 minutes') => {
  const currentYear = new Date().getFullYear();

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Verification Code</title>
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
                margin-bottom: 20px;
                font-size: 14px;
            }
            .verification-code {
                text-align: center;
                margin: 30px 0;
            }
            .verification-code .code {
                display: inline-block;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 20px 40px;
                font-size: 36px;
                font-weight: bold;
                letter-spacing: 8px;
                border-radius: 10px;
                font-family: 'Courier New', monospace;
            }
            .verification-code .label {
                display: block;
                margin-bottom: 15px;
                color: #666;
                font-size: 14px;
            }
            .expiry-warning {
                background-color: #fff3cd;
                border: 1px solid #ffc107;
                color: #856404;
                padding: 12px;
                border-radius: 4px;
                margin: 20px 0;
                font-size: 14px;
                text-align: center;
            }
            .technical-note {
                background-color: #e8f4f8;
                border: 1px solid #b3d9e8;
                color: #004085;
                padding: 12px;
                border-radius: 4px;
                margin: 20px 0;
                font-size: 13px;
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
            .social-links {
                margin-top: 10px;
            }
            .social-links a {
                display: inline-block;
                margin: 0 10px;
                color: #667eea;
                text-decoration: none;
                font-size: 12px;
            }
        </style>
    </head>
    <body>
        <div class="email-container">
            <!-- Header -->
            <div class="email-header">
                <h1>Welcome to Our Event Platform!</h1>
            </div>

            <!-- Body -->
            <div class="email-body">
                <h2>Verify Your Email Address</h2>
                
                <p>Hi <strong>${userName}</strong>,</p>

                <p>Thank you for registering with us! To complete your registration and gain full access to our platform, please enter the following verification code:</p>

                <div class="verification-code">
                    <span class="label">Your Verification Code</span>
                    <span class="code">${verificationCode}</span>
                </div>

                <div class="expiry-warning">
                    <strong>⏰ Important:</strong> This code will expire in <strong>${tokenExpiry}</strong>. If the code expires, you can request a new one.
                </div>

                <p>If you did not create this account, please ignore this email or contact our support team immediately.</p>

                <div class="technical-note">
                    <strong>Why are we asking for this?</strong> Email verification helps us ensure that your account is secure and that you have access to the email address you provided.
                </div>

                <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
                    Best regards,<br>
                    <strong>Event Management Team</strong>
                </p>
            </div>

            <!-- Footer -->
            <div class="email-footer">
                <p>&copy; ${currentYear} Event Management & Ticket Booking. All rights reserved.</p>
                <p>If you have any questions, contact our <a href="mailto:support@eventmanagement.com" style="color: #667eea; text-decoration: none;">support team</a></p>
                <div class="social-links">
                    <a href="#">Privacy Policy</a> | <a href="#">Terms of Service</a>
                </div>
            </div>
        </div>
    </body>
    </html>
  `;
};

module.exports = { getVerificationEmailTemplate };
