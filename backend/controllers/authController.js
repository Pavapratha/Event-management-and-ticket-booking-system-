const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const transporter = require('../config/email');
const { getVerificationEmailTemplate } = require('../utils/emailTemplate');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// Generate Verification Token (using crypto)
const generateVerificationToken = () => {
  const token = crypto.randomBytes(32).toString('hex');
  const hash = crypto.createHash('sha256').update(token).digest('hex');
  return { token, hash };
};

// Generate 6-digit verification code
const generateVerificationCode = () => {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const hash = crypto.createHash('sha256').update(code).digest('hex');
  return { code, hash };
};

// Send verification email with 6-digit code
const sendVerificationEmail = async (user, verificationCode) => {
  try {
    console.log('\n📧 Sending verification email...');
    console.log('   To:', user.email);
    console.log('   User ID:', user._id);
    console.log('   Code:', verificationCode);
    
    if (!process.env.SMTP_FROM_EMAIL) {
      throw new Error('SMTP_FROM_EMAIL is not configured in environment variables');
    }

    const emailContent = getVerificationEmailTemplate(
      user.name,
      verificationCode,
      '10 minutes'
    );

    const mailOptions = {
      from: process.env.SMTP_FROM_EMAIL,
      to: user.email,
      subject: 'Your Verification Code - Event Management Platform',
      html: emailContent,
      text: `Your verification code is: ${verificationCode}. This code expires in 10 minutes.`,
    };

    console.log('   Mail options prepared');
    
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Verification email sent successfully');
    console.log('   Message ID:', info.messageId);
    console.log('   Response:', info.response);
    
    return info;
  } catch (error) {
    console.error('\n❌ Error sending verification email:');
    console.error('   Message:', error.message);
    console.error('   Code:', error.code);
    if (error.response) {
      console.error('   SMTP Response:', error.response);
    }
    throw error;
  }
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    // Validation
    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters',
      });
    }

    console.log('\n📝 User registration started');
    console.log('   Email:', email);
    console.log('   Name:', name);

    // Check if user already exists
    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      console.warn('⚠️ User already exists:', email);
      return res.status(400).json({
        success: false,
        message: 'Email already registered',
      });
    }

    // Generate 6-digit verification code
    const { code, hash } = generateVerificationCode();
    console.log('\n' + '='.repeat(60));
    console.log('🔐 VERIFICATION CODE GENERATION');
    console.log('='.repeat(60));
    console.log('Plain code (will be sent via email):', code);
    console.log('Plain code type:', typeof code);
    console.log('Hash (will be stored in DB):', hash);
    console.log('Hash type:', typeof hash);
    console.log('Hash length:', hash.length);
    console.log('='.repeat(60) + '\n');

    // Create expiry time (10 minutes for 6-digit code)
    const expiryTime = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now
    console.log('   Code expires at:', expiryTime.toISOString());

    // Create user with isVerified: false
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      isVerified: false,
      verificationToken: hash,
      verificationTokenExpiry: expiryTime,
    });
    
    // Verify what was actually saved
    const savedUser = await User.findById(user._id).select('+verificationToken +verificationTokenExpiry');
    console.log('\n--- VERIFICATION: What was actually saved ---');
    console.log('Saved verificationToken:', savedUser.verificationToken);
    console.log('Saved token matches hash?:', savedUser.verificationToken === hash);
    console.log('Saved tokenExpiry:', savedUser.verificationTokenExpiry ? savedUser.verificationTokenExpiry.toISOString() : 'NULL');
    
    console.log('✅ User created in database');
    console.log('   User ID:', user._id);
    console.log('   isVerified:', user.isVerified);

    try {
      // Send verification email with 6-digit code
      console.log('\n📧 Attempting to send verification email...');
      await sendVerificationEmail(user, code);

      console.log('\n✅ Registration flow completed successfully');
      res.status(201).json({
        success: true,
        message: 'User registered successfully. Please check your email for the 6-digit verification code.',
        requiresVerification: true,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          isVerified: user.isVerified,
        },
      });
    } catch (emailError) {
      console.error('\n❌ Email sending failed:');
      console.error('   Error:', emailError.message);
      console.error('   Deleting user from database...');
      // If email fails, delete the user and return error
      await User.findByIdAndDelete(user._id);
      return res.status(500).json({
        success: false,
        message: 'Failed to send verification email. Please try registering again.',
        debug: process.env.NODE_ENV === 'development' ? emailError.message : undefined,
      });
    }
  } catch (error) {
    console.error('\n❌ Registration error:', error.message);
    res.status(500).json({
      success: false,
      message: error.message,
      debug: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Check if user is verified
    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: 'Please verify your email before logging in. Check your inbox for the verification link.',
        isVerified: false,
      });
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Verify user email
// @route   POST /api/auth/verify-email
// @access  Public
exports.verifyEmail = async (req, res) => {
  try {
    let { code, email } = req.body;

    console.log('\n' + '='.repeat(60));
    console.log('📧 EMAIL VERIFICATION ATTEMPT');
    console.log('='.repeat(60));
    console.log('Email received:', email);
    console.log('Code received (raw):', `"${code}"`);
    console.log('Code type:', typeof code);
    console.log('Code length (raw):', code ? code.length : 'N/A');

    // Trim and convert to string
    if (code) {
      code = String(code).trim();
      console.log('Code after trim:', `"${code}"`);
      console.log('Code length (trimmed):', code.length);
    }

    // Validate code and email
    if (!code || !email) {
      console.error('❌ Missing required fields');
      return res.status(400).json({
        success: false,
        message: 'Verification code and email are required',
      });
    }

    // Validate code format (6 digits)
    if (!/^\d{6}$/.test(code)) {
      console.error('❌ Invalid code format - must be exactly 6 digits');
      console.error('   Code received:', `"${code}"`);
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid 6-digit code',
      });
    }

    // Hash the code to compare with stored hash
    const hashedCode = crypto.createHash('sha256').update(code).digest('hex');
    console.log('\n--- HASH COMPUTATION ---');
    console.log('Plain code being hashed:', `"${code}"`);
    console.log('Computed hash (FULL):', hashedCode);

    // First, find user by email ONLY to get stored token
    console.log('\n--- DATABASE LOOKUP ---');
    const existingUser = await User.findOne({ email: email.toLowerCase() }).select('+verificationToken +verificationTokenExpiry');
    
    if (!existingUser) {
      console.error('❌ User does NOT exist in database for email:', email.toLowerCase());
      return res.status(400).json({
        success: false,
        message: 'Invalid verification code. Please try again.',
      });
    }

    console.log('User found in database:');
    console.log('   User ID:', existingUser._id);
    console.log('   User email:', existingUser.email);
    console.log('   isVerified:', existingUser.isVerified);
    console.log('   Stored verificationToken (FULL):', existingUser.verificationToken);
    console.log('   Stored token type:', typeof existingUser.verificationToken);
    console.log('   Token expiry:', existingUser.verificationTokenExpiry ? existingUser.verificationTokenExpiry.toISOString() : 'NULL');

    // Now compare the hashes
    console.log('\n--- HASH COMPARISON ---');
    console.log('Computed hash:', hashedCode);
    console.log('Stored hash:  ', existingUser.verificationToken);
    console.log('Are they equal?:', hashedCode === existingUser.verificationToken);
    console.log('Computed hash length:', hashedCode.length);
    console.log('Stored hash length:', existingUser.verificationToken ? existingUser.verificationToken.length : 'N/A');

    // Check if token is null
    if (existingUser.verificationToken === null || existingUser.verificationToken === undefined) {
      console.error('❌ Verification token is NULL - user may already be verified');
      return res.status(400).json({
        success: false,
        message: existingUser.isVerified ? 
          'This email is already verified. You can now log in.' : 
          'Invalid verification code. Please request a new code.',
      });
    }

    // Compare hashes
    if (hashedCode !== existingUser.verificationToken) {
      console.error('\n❌ HASH MISMATCH!');
      console.error('Expected (stored):', existingUser.verificationToken);
      console.error('Got (computed):   ', hashedCode);
      
      // Check character by character
      console.log('\n--- CHARACTER-BY-CHARACTER COMPARISON ---');
      const stored = existingUser.verificationToken;
      const computed = hashedCode;
      for (let i = 0; i < Math.max(stored.length, computed.length); i++) {
        if (stored[i] !== computed[i]) {
          console.log(`First diff at index ${i}: stored="${stored[i]}" computed="${computed[i]}"`);
          break;
        }
      }
      
      return res.status(400).json({
        success: false,
        message: 'Invalid verification code. Please try again.',
      });
    }

    console.log('\n✅ HASH MATCH! Code is valid.');

    // Check if code has expired
    const now = new Date();
    if (existingUser.verificationTokenExpiry && existingUser.verificationTokenExpiry < now) {
      console.error('❌ Verification code has EXPIRED');
      console.error('   Code expired at:', existingUser.verificationTokenExpiry.toISOString());
      console.error('   Current time:', now.toISOString());
      return res.status(400).json({
        success: false,
        message: 'Verification code has expired. Please request a new code.',
      });
    }

    console.log('✅ Code has not expired');

    // Check if already verified
    if (existingUser.isVerified) {
      console.warn('⚠️ User email is ALREADY verified');
      return res.status(400).json({
        success: false,
        message: 'This email is already verified. You can now log in.',
      });
    }

    // Update user as verified
    console.log('\n--- UPDATING USER ---');
    existingUser.isVerified = true;
    existingUser.verificationToken = null;
    existingUser.verificationTokenExpiry = null;
    
    await existingUser.save();
    console.log('✅ User verification completed successfully');
    console.log('   Updated isVerified:', existingUser.isVerified);

    console.log('='.repeat(60));
    console.log('✅ VERIFICATION SUCCESS');
    console.log('='.repeat(60) + '\n');

    res.status(200).json({
      success: true,
      message: 'Email verified successfully! You can now log in.',
      user: {
        id: existingUser._id,
        name: existingUser.name,
        email: existingUser.email,
        isVerified: existingUser.isVerified,
      },
    });
  } catch (error) {
    console.error('\n❌ Verification error:');
    console.error('   Error message:', error.message);
    console.error('   Stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'An error occurred during verification',
      debug: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// @desc    Resend verification email
// @route   POST /api/auth/resend-verification
// @access  Public
exports.resendVerificationEmail = async (req, res) => {
  try {
    let { email } = req.body;

    console.log('\n🔃 Resend verification email request');
    console.log('   Email (raw):', email);

    // Trim email
    if (email) {
      email = email.trim();
      console.log('   Email (trimmed):', email);
    }

    // Validation
    if (!email) {
      console.error('❌ Email not provided');
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      });
    }

    // Find user (with token fields for proper update)
    const user = await User.findOne({ email: email.toLowerCase() }).select('+verificationToken +verificationTokenExpiry');

    if (!user) {
      console.error('❌ User not found:', email);
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    console.log('✅ User found');
    console.log('   User ID:', user._id);
    console.log('   Current isVerified:', user.isVerified);
    console.log('   Current verificationToken:', user.verificationToken);

    // Check if already verified
    if (user.isVerified) {
      console.warn('⚠️ User already verified');
      return res.status(400).json({
        success: false,
        message: 'This email is already verified',
      });
    }

    // Generate new 6-digit verification code
    console.log('\n' + '='.repeat(60));
    console.log('🔐 RESEND - NEW CODE GENERATION');
    console.log('='.repeat(60));
    const { code, hash } = generateVerificationCode();
    console.log('New plain code:', code);
    console.log('New hash:', hash);
    console.log('='.repeat(60) + '\n');

    // Update user with new code (10 minutes expiry)
    const expiryTime = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now
    user.verificationToken = hash;
    user.verificationTokenExpiry = expiryTime;
    await user.save();
    
    // Verify what was actually saved
    const updatedUser = await User.findById(user._id).select('+verificationToken +verificationTokenExpiry');
    console.log('--- VERIFICATION: What was actually saved ---');
    console.log('Saved verificationToken:', updatedUser.verificationToken);
    console.log('Saved token matches hash?:', updatedUser.verificationToken === hash);
    console.log('Saved tokenExpiry:', updatedUser.verificationTokenExpiry ? updatedUser.verificationTokenExpiry.toISOString() : 'NULL');
    
    console.log('✅ User updated with new code');
    console.log('   Code expires at:', expiryTime.toISOString());

    try {
      // Send verification email with code
      console.log('📧 Sending verification email...');
      await sendVerificationEmail(user, code);

      console.log('✅ Resend verification completed successfully');
      res.status(200).json({
        success: true,
        message: 'Verification code sent successfully. Please check your inbox.',
      });
    } catch (emailError) {
      console.error('❌ Failed to send verification email:', emailError.message);
      return res.status(500).json({
        success: false,
        message: 'Failed to send verification email. Please try again later.',
        debug: process.env.NODE_ENV === 'development' ? emailError.message : undefined,
      });
    }
  } catch (error) {
    console.error('❌ Resend verification error:', error.message);
    res.status(500).json({
      success: false,
      message: error.message,
      debug: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
};
