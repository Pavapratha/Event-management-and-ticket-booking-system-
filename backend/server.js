require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');

const app = express();

console.log('\n' + '='.repeat(60));
console.log('🚀 Event Management Application Starting...');
console.log('='.repeat(60));
console.log('Mode:', process.env.NODE_ENV || 'development');
console.log('Port:', process.env.PORT || 5000);

// Connect to database
console.log('\n📦 Connecting to database...');
connectDB();

// Import and verify email configuration
console.log('\n📧 Loading email configuration...');
require('./config/email');  // This will log verification results

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Routes
app.use('/api/auth', authRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
