// ============================================================================
// COMPLETE NODEMAILER CONFIGURATION - GMAIL SMTP WITH APP PASSWORD
// ============================================================================
// 
// This file shows the complete, corrected Nodemailer setup for Gmail.
// Key: Use a 16-character Gmail App Password, NOT your Gmail password.
//
// ============================================================================

// ===== 1. ENVIRONMENT VARIABLES (.env) =====

/*
PORT=5000
NODE_ENV=development

# Gmail SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
# ⚠️  IMPORTANT: Use 16-character App Password from Google Account
# NOT your actual Gmail password!
SMTP_PASSWORD=abcdefghijklmnop
SMTP_FROM_EMAIL=noreply@eventmanagement.com
*/

// ===== 2. EMAIL CONFIGURATION FILE (config/email.js) =====

const nodemailer = require('nodemailer');

// Validate environment variables
const requiredEnvVars = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASSWORD'];
const missingVars = requiredEnvVars.filter(v => !process.env[v]);

if (missingVars.length > 0) {
  console.error('❌ Missing email configuration:', missingVars);
}

// Create transporter with proper Gmail settings
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || 587),
  secure: process.env.SMTP_SECURE === 'true', // false for 587 (TLS), true for 465 (SSL)
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD, // Use 16-char App Password here!
  },
  connectionTimeout: 5000,
  socketTimeout: 5000,
});

// Verify on startup
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Email configuration error:', error.message);
    if (error.code === 'EAUTH') {
      console.error('   → Check if using Gmail App Password (not Gmail password)');
      console.error('   → Visit: https://myaccount.google.com/apppasswords');
    }
  } else {
    console.log('✅ Email transporter ready');
  }
});

module.exports = transporter;

// ===== 3. SENDING EMAIL (Example) =====

// Example: Send verification email
async function sendVerificationEmail(userEmail, verificationCode) {
  try {
    const mailOptions = {
      from: process.env.SMTP_FROM_EMAIL,
      to: userEmail,
      subject: 'Verify Your Email',
      html: `<p>Your verification code: <strong>${verificationCode}</strong></p>`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('❌ Email error:', error.message);
    if (error.code === 'EAUTH') {
      console.error('   Likely cause: Wrong password or 2FA not enabled');
      console.error('   Steps:');
      console.error('   1. Enable 2-Step Verification: https://myaccount.google.com/security');
      console.error('   2. Generate App Password: https://myaccount.google.com/apppasswords');
      console.error('   3. Update SMTP_PASSWORD in .env');
      console.error('   4. Restart server');
    }
    throw error;
  }
}

module.exports = { transporter, sendVerificationEmail };

// ============================================================================
// GMAIL APP PASSWORD SETUP - STEP BY STEP
// ============================================================================

/*
STEP 1: Enable 2-Step Verification
  1. Go to: https://myaccount.google.com/
  2. Click: Security (left sidebar)
  3. Find: "2-Step Verification"
  4. Click: Enable and follow prompts

STEP 2: Generate App Password
  1. Go to: https://myaccount.google.com/apppasswords
  2. Select: "Mail" (first dropdown)
  3. Select: "Windows Computer" or your device (second dropdown)
  4. Click: "Generate"
  5. Copy: The 16-character password shown (e.g., "abcd efgh ijkl mnop")

STEP 3: Update .env
  SMTP_USER=your-email@gmail.com
  SMTP_PASSWORD=abcdefghijklmnop  ← Remove spaces from App Password

STEP 4: Restart Backend
  npm start

STEP 5: Verify
  Should see: ✅ Email transporter ready
*/

// ============================================================================
// TROUBLESHOOTING
// ============================================================================

/*
ERROR: Invalid login: 535-5.7.8 Username and Password not accepted
CAUSE: Using actual Gmail password instead of App Password
FIX: Generate 16-char App Password from myaccount.google.com/apppasswords

ERROR: 2-Step Verification not enabled
CAUSE: App Passwords only work with 2FA enabled
FIX: Enable at https://myaccount.google.com/security

ERROR: ECONNREFUSED
CAUSE: Can't connect to SMTP server
FIX: Check SMTP_HOST (smtp.gmail.com), SMTP_PORT (587), firewall

ERROR: ETIMEDOUT
CAUSE: Connection timeout to server
FIX: Network issue, firewall blocking, or wrong port

ERROR: ENOTFOUND
CAUSE: DNS resolution failed
FIX: Check internet connection, try different network
*/

// ============================================================================
// KEY DIFFERENCES - What Changed
// ============================================================================

/*
BEFORE (❌ WRONG):
- SMTP_PASSWORD=myActualGmailPassword
- Results in: 535 5.7.8 BadCredentials error

AFTER (✅ CORRECT):
- SMTP_PASSWORD=16charAppPasswordFromGoogle
- Results in: ✅ Email transporter ready

WHY:
- Gmail requires App Passwords for third-party apps
- App Passwords are more secure (unique, revocable, limited scope)
- Requires 2-Step Verification to be enabled
*/

// ============================================================================
// IMPORTANT SECURITY NOTES
// ============================================================================

/*
✅ DO:
- Use 16-character App Password from Google
- Store credentials in environment variables
- Never commit .env with real passwords to Git
- Use different App Passwords for development/production

❌ DON'T:
- Use your actual Gmail password in SMTP_PASSWORD
- Enable "Less secure app access" (deprecated)
- Share your App Password
- Hardcode credentials in code
- Commit .env files to version control
*/
