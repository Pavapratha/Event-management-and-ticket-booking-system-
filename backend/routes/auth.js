const express = require('express');
const router = express.Router();
const { register, login, getCurrentUser, verifyEmail, resendVerificationEmail } = require('../controllers/authController');
const protect = require('../config/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getCurrentUser);
router.post('/verify-email', verifyEmail);
router.post('/resend-verification', resendVerificationEmail);

module.exports = router;
