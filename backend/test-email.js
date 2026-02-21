/**
 * SMTP Connection Test
 * 
 * Tests if your email configuration is working correctly.
 * Run: node test-email.js
 * 
 * Expected output: "✅ Connection successful!"
 */

require('dotenv').config();
const nodemailer = require('nodemailer');

const { SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASSWORD, SMTP_FROM_EMAIL } = process.env;

console.log('🔍 SMTP Email Connection Test\n');

// Check environment variables
const missingVars = [];
if (!SMTP_HOST) missingVars.push('SMTP_HOST');
if (!SMTP_PORT) missingVars.push('SMTP_PORT');
if (SMTP_SECURE === undefined) missingVars.push('SMTP_SECURE');
if (!SMTP_USER) missingVars.push('SMTP_USER');
if (!SMTP_PASSWORD) missingVars.push('SMTP_PASSWORD');
if (!SMTP_FROM_EMAIL) missingVars.push('SMTP_FROM_EMAIL');

if (missingVars.length > 0) {
  console.error('❌ Missing environment variables:', missingVars);
  console.error('\nFix: Add these to your .env file:');
  console.error('  SMTP_HOST=smtp.gmail.com');
  console.error('  SMTP_PORT=587');
  console.error('  SMTP_SECURE=false');
  console.error('  SMTP_USER=your_email@gmail.com');
  console.error('  SMTP_PASSWORD=your_app_password');
  console.error('  SMTP_FROM_EMAIL=noreply@yourdomain.com\n');
  process.exit(1);
}

// Show configuration
console.log('✔️ Configuration found:');
console.log(`   Host: ${SMTP_HOST}`);
console.log(`   Port: ${SMTP_PORT}`);
console.log(`   Secure: ${SMTP_SECURE}`);
console.log(`   User: ${SMTP_USER}`);
console.log(`   From: ${SMTP_FROM_EMAIL}`);
console.log();

// Create transporter
const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: parseInt(SMTP_PORT),
  secure: SMTP_SECURE === 'true',
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASSWORD
  }
});

// Attempt connection
console.log('🔄 Testing SMTP connection...\n');

transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Connection FAILED!\n');
    console.error('Error Details:');
    console.error(`  Code: ${error.code}`);
    console.error(`  Message: ${error.message}`);
    console.error(`  Response: ${error.response}`);
    
    console.error('\n📋 Troubleshooting:');
    
    if (error.code === 'ENOTFOUND') {
      console.error('  • SMTP host not found');
      console.error('  • Check SMTP_HOST spelling');
      console.error('  • Check internet connection');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('  • Connection refused');
      console.error('  • Check SMTP_PORT is correct (usually 587 for Gmail)');
      console.error('  • Check firewall allows outgoing port 587');
    } else if (error.message.includes('535')) {
      console.error('  • Invalid login credentials');
      console.error('  • For Gmail: use App Password (not regular password)');
      console.error('  • Go to: https://myaccount.google.com/apppasswords');
      console.error('  • Generate new password, remove spaces, try again');
    } else if (error.message.includes('Invalid Greeting')) {
      console.error('  • SMTP server didn\'t respond properly');
      console.error('  • Verify SMTP_HOST is correct');
    }
    
    console.error('\n🔗 Setup Help:');
    console.error('  Gmail:  https://support.google.com/accounts/answer/185833');
    console.error('  SendGrid: https://sendgrid.com/docs/for-developers/sending-email/');
    console.error();
    
    process.exit(1);
  } else {
    console.log('✅ Connection successful!\n');
    console.log('✔️ SMTP Configuration:');
    console.log(`   Host: ${SMTP_HOST}`);
    console.log(`   Port: ${SMTP_PORT}`);
    console.log(`   Secure: ${SMTP_SECURE === 'true' ? 'Yes (SSL)' : 'No (TLS)'}`);
    console.log(`   Authenticated as: ${SMTP_USER}`);
    console.log();
    console.log('✅ You are ready to send emails!\n');
    console.log('Next steps:');
    console.log('  1. Run: npm run dev');
    console.log('  2. Go to: http://localhost:3000/register');
    console.log('  3. Register a new user');
    console.log('  4. Check email inbox for verification link\n');
    
    process.exit(0);
  }
});

// Timeout after 10 seconds
setTimeout(() => {
  console.error('⏱️ Connection test timed out after 10 seconds');
  console.error('This usually means the SMTP host is not accessible');
  console.error('Check your firewall or try a different Gmail account\n');
  process.exit(1);
}, 10000);
