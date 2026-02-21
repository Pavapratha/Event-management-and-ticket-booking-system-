const nodemailer = require('nodemailer');

// Validate required environment variables
const requiredEnvVars = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASSWORD', 'SMTP_FROM_EMAIL'];
const missingVars = requiredEnvVars.filter(v => !process.env[v]);

if (missingVars.length > 0) {
  console.error('❌ CRITICAL: Missing email configuration variables:', missingVars);
  console.error('❌ Please check your .env file and add the missing variables.');
  console.error('❌ Email sending will NOT work until these are configured.');
}

// Create transporter for sending emails
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT, 10),
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

// Verify transporter configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('\n❌ EMAIL TRANSPORTER VERIFICATION FAILED:');
    console.error('Error:', error.message);
    console.error('\nDebug Info:');
    console.error('  SMTP_HOST:', process.env.SMTP_HOST);
    console.error('  SMTP_PORT:', process.env.SMTP_PORT);
    console.error('  SMTP_SECURE:', process.env.SMTP_SECURE);
    console.error('  SMTP_USER:', process.env.SMTP_USER ? '***' : 'NOT SET');
    console.error('  SMTP_PASSWORD:', process.env.SMTP_PASSWORD ? '***' : 'NOT SET');
    console.error('\nCommon fixes:');
    console.error('  - For Gmail: Enable 2FA and generate an app password');
    console.error('  - Check that SMTP_PORT is correct (usually 587 for TLS)');
    console.error('  - Verify firewall allows outbound connection to SMTP_HOST');
  } else {
    console.log('✅ Email transporter verification successful');
    console.log('   Connection details:');
    console.log('   - Host:', process.env.SMTP_HOST);
    console.log('   - Port:', process.env.SMTP_PORT);
    console.log('   - User:', process.env.SMTP_USER);
    console.log('   - TLS:', process.env.SMTP_SECURE === 'true' ? 'Yes' : 'No');
  }
});

module.exports = transporter;
