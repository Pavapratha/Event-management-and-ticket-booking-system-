const express = require('express');
const router = express.Router();
const { register, login, getCurrentUser } = require('../controllers/authController');
const protect = require('../config/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getCurrentUser);

module.exports = router;
