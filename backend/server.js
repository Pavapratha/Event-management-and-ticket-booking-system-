require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const userRoutes = require('./routes/user');
const { startEventReminderScheduler } = require('./jobs/eventReminderScheduler');
const { startDatabaseBackupScheduler } = require('./jobs/databaseBackupScheduler');

const app = express();

console.log('\n' + '='.repeat(60));
console.log('🚀 Event Management Application Starting...');
console.log('='.repeat(60));
console.log('Mode:', process.env.NODE_ENV || 'development');
console.log('Port:', process.env.PORT || 5000);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
}));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', userRoutes);

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

// Function to start server with port fallback logic
function startServer(port, maxRetries = 5) {
  const server = app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });

  // Handle port already in use error
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`\n⚠️  Port ${port} is already in use. Trying port ${port + 1}...\n`);
      
      if (port - PORT < maxRetries - 1) {
        // Try next port
        server.close();
        startServer(port + 1, maxRetries);
      } else {
        console.error(`\n❌ Failed to find an available port after ${maxRetries} attempts.`);
        console.error(`   Port range tried: ${PORT} - ${port}`);
        console.error(`   Please kill the process using port ${PORT} and try again.`);
        console.error(`   Use: Get-Process -Id (Get-NetTCPConnection -LocalPort ${PORT}).OwningProcess | Stop-Process -Force\n`);
        process.exit(1);
      }
    } else {
      console.error('Server error:', err);
      process.exit(1);
    }
  });

  return server;
}

async function bootstrap() {
  console.log('\n📦 Connecting to database...');
  await connectDB();

  console.log('\n📧 Loading email configuration...');
  require('./config/email');

  startEventReminderScheduler();
  startDatabaseBackupScheduler();
  startServer(PORT);
}

bootstrap().catch((error) => {
  console.error('Failed to start application:', error);
  process.exit(1);
});
