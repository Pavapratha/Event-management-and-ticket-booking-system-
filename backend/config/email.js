const nodemailer = require('nodemailer');

// Validate required environment variables
const requiredEnvVars = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASSWORD', 'SMTP_FROM_EMAIL'];
const missingVars = requiredEnvVars.filter(v => !process.env[v]);

if (missingVars.length > 0) {
  console.error('\n' + '='.repeat(70));
  console.error('❌ CRITICAL: Missing email configuration variables');
  console.error('='.repeat(70));
  console.error('Missing variables:', missingVars);
  console.error('\nPlease update your .env file with:');
  console.error('  - SMTP_HOST (e.g., smtp.gmail.com)');
  console.error('  - SMTP_PORT (e.g., 587 for TLS)');
  console.error('  - SMTP_SECURE (e.g., false for port 587)');
  console.error('  - SMTP_USER (your Gmail address)');
  console.error('  - SMTP_PASSWORD (16-character Gmail App Password, NOT your Gmail password)');
  console.error('  - SMTP_FROM_EMAIL (sender email address)');
  console.error('\n📋 HOW TO GET GMAIL APP PASSWORD:');
  console.error('  1. Go to https://myaccount.google.com/');
  console.error('  2. Click "Security" in the left menu');
  console.error('  3. Enable "2-Step Verification" if not already enabled');
  console.error('  4. Search for "App passwords" and select it');
  console.error('  5. Choose "Mail" and "Windows Computer" (or your device)');
  console.error('  6. Google will generate a 16-character password');
  console.error('  7. Copy and paste that password as SMTP_PASSWORD in .env');
  console.error('='.repeat(70) + '\n');
}

// Create transporter for sending emails with enhanced error handling
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT, 10),
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
  // Timeout settings
  connectionTimeout: 5000, // wait 5 seconds before timing out
  socketTimeout: 5000,
  // Log level for debugging
  logger: process.env.NODE_ENV === 'development', // enable detailed logging in development
});

// Verify transporter configuration on startup
transporter.verify((error, success) => {
  if (error) {
    console.error('\n' + '='.repeat(70));
    console.error('❌ EMAIL TRANSPORTER VERIFICATION FAILED');
    console.error('='.repeat(70));
    console.error('Error Message:', error.message);
    console.error('Error Code:', error.code);
    
    if (error.response) {
      console.error('SMTP Response:', error.response);
    }
    
    console.error('\n🔍 Current Configuration:');
    console.error('  SMTP_HOST:', process.env.SMTP_HOST);
    console.error('  SMTP_PORT:', process.env.SMTP_PORT);
    console.error('  SMTP_SECURE:', process.env.SMTP_SECURE);
    console.error('  SMTP_USER:', process.env.SMTP_USER ? process.env.SMTP_USER.replace(/.(?=.{3})/g, '*') : 'NOT SET');
    console.error('  SMTP_PASSWORD: ', process.env.SMTP_PASSWORD ? '[SET - ' + process.env.SMTP_PASSWORD.length + ' characters]' : 'NOT SET');
    
    console.error('\n❓ Troubleshooting Steps:');
    if (error.code === 'EAUTH' || error.message.includes('BadCredentials') || error.message.includes('535')) {
      console.error('  ❌ Authentication Error (535 5.7.8 BadCredentials)');
      console.error('  ✅ SOLUTION:');
      console.error('     - Make sure you are using a 16-character GMAIL APP PASSWORD');
      console.error('     - NOT your actual Gmail password');
      console.error('     - Go to: https://myaccount.google.com/apppasswords');
      console.error('     - Must have 2-Step Verification enabled first: https://myaccount.google.com/security');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('  ❌ Connection Refused');
      console.error('  ✅ Check:');
      console.error('     - SMTP_HOST is correct (usually: smtp.gmail.com)');
      console.error('     - SMTP_PORT is correct (usually: 587 for TLS)');
      console.error('     - Firewall allows outbound connections to smtp.gmail.com:587');
    } else if (error.code === 'ETIMEDOUT') {
      console.error('  ❌ Connection Timeout');
      console.error('  ✅ Check:');
      console.error('     - Your internet connection');
      console.error('     - Firewall settings blocking SMTP');
      console.error('     - Try a different network');
    } else {
      console.error('  ❌ Unknown Error - Check the error message above');
    }
    console.error('\n📧 For Gmail SMTP, use these settings:');
    console.error('  SMTP_HOST=smtp.gmail.com');
    console.error('  SMTP_PORT=587');
    console.error('  SMTP_SECURE=false');
    console.error('='.repeat(70) + '\n');
  } else {
    console.log('\n' + '='.repeat(70));
    console.log('✅ EMAIL TRANSPORTER VERIFICATION SUCCESSFUL');
    console.log('='.repeat(70));
    console.log('Connection Details:');
    console.log('  📬 Host:', process.env.SMTP_HOST);
    console.log('  🔌 Port:', process.env.SMTP_PORT);
    console.log('  👤 User:', process.env.SMTP_USER?.replace(/.(?=.{3})/g, '*'));
    console.log('  🔒 TLS (Secure):', process.env.SMTP_SECURE === 'true' ? 'Yes (port 465)' : 'No (port 587 with STARTTLS)');
    console.log('  ✉️  From Email:', process.env.SMTP_FROM_EMAIL);
    console.log('='.repeat(70) + '\n');
  }
});

module.exports = transporter;
