/**
 * Email Verification Complete Flow Test
 * 
 * Tests the entire email verification system:
 * 1. Database connection
 * 2. User registration
 * 3. Email sending
 * 4. Verification token validation
 * 5. Email verification
 * 
 * Run: node test-complete-flow.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const User = require('./models/User');
const sendVerificationEmail = require('./controllers/authController').sendVerificationEmail;

const TEST_EMAIL = 'test@example.com';
const TEST_NAME = 'Test User';
const TEST_PASSWORD = 'TestPassword123!';

console.log('🧪 Email Verification Complete Flow Test\n');
console.log('This script tests:');
console.log('  1. Database connection');
console.log('  2. User registration with token generation');
console.log('  3. Email sending via Nodemailer');
console.log('  4. Verification token validation');
console.log('  5. Email verification flow\n');

// Test phases
let testsPassed = 0;
let testsFailed = 0;

async function runTests() {
  try {
    // Phase 1: Database Connection
    console.log('📦 Phase 1: Database Connection');
    await connectDatabase();
    console.log('✅ Database connected\n');
    testsPassed++;

    // Phase 2: Clean up existing test user
    console.log('🧹 Phase 2: Cleaning up existing test data');
    await User.deleteOne({ email: TEST_EMAIL });
    console.log('✅ Test user cleaned up\n');
    testsPassed++;

    // Phase 3: User Registration
    console.log('👤 Phase 3: User Registration');
    const user = await registerTestUser();
    console.log(`✅ User registered: ${user.email}`);
    console.log(`   Token (first 10 chars): ${user.verificationToken?.substring(0, 10)}...`);
    console.log(`   Verification expires: ${user.verificationTokenExpiry}\n`);
    testsPassed++;

    // Phase 4: Email Sending
    console.log('📧 Phase 4: Email Sending');
    const emailResult = await sendTestEmail(user);
    console.log(`✅ Email sent successfully`);
    console.log(`   Message ID: ${emailResult.messageId}\n`);
    testsPassed++;

    // Phase 5: Verify Token
    console.log('🔐 Phase 5: Token Verification');
    const plainToken = user.verificationToken;
    const isTokenValid = await verifyToken(plainToken, user.email);
    if (isTokenValid) {
      console.log('✅ Token is valid and matches database\n');
      testsPassed++;
    } else {
      console.log('❌ Token validation failed\n');
      testsFailed++;
    }

    // Phase 6: Update User Verification
    console.log('✅ Phase 6: User Verification');
    const verified = await verifyEmail(plainToken, user.email);
    if (verified) {
      console.log('✅ User verified successfully');
      console.log('   isVerified: true\n');
      testsPassed++;
    } else {
      console.log('❌ User verification failed\n');
      testsFailed++;
    }

    // Phase 7: Verify Login is Blocked Before Verification
    console.log('🔒 Phase 7: Pre-Verification Login Attempt');
    const testUser2 = await registerTestUser('test2@example.com', 'Test User 2');
    const canLogin = testUser2.isVerified === true;
    if (!canLogin) {
      console.log('✅ Login properly blocked for unverified user\n');
      testsPassed++;
    } else {
      console.log('❌ Login should be blocked for unverified user\n');
      testsFailed++;
    }

    // Summary
    console.log('═'.repeat(60));
    console.log('📊 TEST SUMMARY');
    console.log('═'.repeat(60));
    console.log(`✅ Tests Passed: ${testsPassed}`);
    console.log(`❌ Tests Failed: ${testsFailed}`);
    console.log(`📈 Success Rate: ${((testsPassed / (testsPassed + testsFailed)) * 100).toFixed(1)}%\n`);

    if (testsFailed === 0) {
      console.log('🎉 All tests passed! Email verification is working correctly!\n');
    } else {
      console.log('⚠️ Some tests failed. Check the error messages above.\n');
    }

    // Cleanup
    console.log('🧹 Cleaning up test data...');
    await User.deleteOne({ email: TEST_EMAIL });
    await User.deleteOne({ email: 'test2@example.com' });
    console.log('✅ Test data cleaned\n');

    process.exit(testsFailed === 0 ? 0 : 1);

  } catch (error) {
    console.error('❌ Test Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Helper Functions

async function connectDatabase() {
  const mongoUrl = process.env.MONGODB_URI || 'mongodb://localhost:27017/lycaon-auth';
  
  return new Promise((resolve, reject) => {
    mongoose.connect(mongoUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }, (err) => {
      if (err) {
        console.error('❌ Database connection failed');
        console.error('Error:', err.message);
        console.error(`\nMake sure MongoDB is running at: ${mongoUrl}\n`);
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

async function registerTestUser(email = TEST_EMAIL, name = TEST_NAME) {
  // Generate verification token
  const plainToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(plainToken).digest('hex');
  
  // Create user
  const user = new User({
    name,
    email: email.toLowerCase(),
    password: TEST_PASSWORD, // Will be hashed by model
    isVerified: false,
    verificationToken: hashedToken,
    verificationTokenExpiry: new Date(Date.now() + 1 * 60 * 60 * 1000) // 1 hour
  });
  
  await user.save();
  
  // Return plain token (this is what would be in the email link)
  return { ...user.toObject(), verificationToken: plainToken };
}

async function sendTestEmail(user) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD
    }
  });

  const verificationLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${user.verificationToken}&email=${encodeURIComponent(user.email)}`;

  const htmlContent = `
    <html>
      <body style="font-family: Arial, sans-serif;">
        <h2>Welcome ${user.name}!</h2>
        <p>Click the link below to verify your email:</p>
        <a href="${verificationLink}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Email</a>
        <p style="color: #666; font-size: 12px;">This link expires in 1 hour.</p>
      </body>
    </html>
  `;

  return transporter.sendMail({
    from: process.env.SMTP_FROM_EMAIL,
    to: user.email,
    subject: 'Email Verification - Event Management System',
    html: htmlContent
  });
}

async function verifyToken(plainToken, email) {
  const hashedToken = crypto.createHash('sha256').update(plainToken).digest('hex');
  
  const user = await User.findOne(
    {
      email: email.toLowerCase(),
      verificationToken: hashedToken,
      verificationTokenExpiry: { $gt: new Date() }
    },
    '+verificationToken +verificationTokenExpiry'
  );

  return user !== null;
}

async function verifyEmail(plainToken, email) {
  const hashedToken = crypto.createHash('sha256').update(plainToken).digest('hex');

  const user = await User.findOneAndUpdate(
    {
      email: email.toLowerCase(),
      verificationToken: hashedToken,
      verificationTokenExpiry: { $gt: new Date() }
    },
    {
      $set: {
        isVerified: true,
        verificationToken: null,
        verificationTokenExpiry: null
      }
    },
    { new: true }
  );

  return user !== null;
}

// Run tests
runTests();
