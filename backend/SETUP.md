# Backend Setup Guide

## Prerequisites
- Node.js v14 or higher
- MongoDB (local installation or MongoDB Atlas account)
- npm or yarn

## Installation Steps

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Environment Configuration
Create a `.env` file in the backend directory with the following variables:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/lycaon-auth
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
NODE_ENV=development
```

#### For MongoDB Atlas (Cloud):
```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/lycaon-auth
```

Replace `<username>` and `<password>` with your MongoDB Atlas credentials.

### 3. Database Connection
Ensure MongoDB is running:
- **Local**: `mongod` command in terminal
- **Cloud**: No action needed, just ensure valid connection string

### 4. Start Development Server
```bash
npm run dev
```
This uses nodemon for automatic restart on file changes. The server will run on `http://localhost:5000`

### 5. Start Production Server
```bash
npm start
```

## API Endpoints

All endpoints expect JSON content type: `Content-Type: application/json`

### POST /api/auth/register
Register a new user account
- **Body**: name, email, password, confirmPassword
- **Returns**: JWT token and user data

### POST /api/auth/login
Authenticate user credentials
- **Body**: email, password
- **Returns**: JWT token and user data

### GET /api/auth/me
Get current authenticated user
- **Headers**: Authorization: Bearer <token>
- **Returns**: User profile data

## Troubleshooting

### MongoDB Connection Issues
1. Verify MongoDB is running: `mongo` or `mongosh`
2. Check connection string in .env
3. For Atlas, ensure IP is whitelisted in network access settings

### Port Already in Use
Change PORT in .env or kill process using port 5000:
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :5000
kill -9 <PID>
```

### JWT Errors
- Ensure JWT_SECRET is set in .env
- Clear localStorage on frontend and login again
- Check token hasn't expired (30 days)

## Project Structure Explained

- **config/db.js**: MongoDB connection setup
- **config/auth.js**: JWT verification middleware
- **models/User.js**: MongoDB User schema with password hashing
- **controllers/authController.js**: Auth logic (register, login, getCurrentUser)
- **routes/auth.js**: API route definitions
- **server.js**: Express app initialization

## Key Features Implemented

✅ Password hashing with bcryptjs (salt rounds: 10)
✅ JWT token generation (30-day expiry)
✅ Email uniqueness validation
✅ Form validation on both client and server
✅ Protected routes with token verification
✅ Comprehensive error handling
✅ CORS support

## Security Best Practices

1. **Change JWT_SECRET in production** to a strong random string
2. **Use HTTPS in production** (set via reverse proxy)
3. **Update MongoDB credentials** before deployment
4. **Implement rate limiting** for production use
5. **Use environment-specific configurations**
6. **Implement logging** for monitoring

## Next Steps

1. Set up frontend in another terminal
2. Ensure both servers are running
3. Test registration and login flows
4. Customize as needed for your requirements
