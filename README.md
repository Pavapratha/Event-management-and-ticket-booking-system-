# MERN Authentication System for Lycaon Entertainment

A complete Login and Registration system built with MongoDB, Express, React, and Node.js (MERN stack). Features JWT authentication, password hashing with bcrypt, and a modern responsive UI matching the Lycaon Entertainment theme.

## 📋 Features

✅ **User Registration** - Create new accounts with validation
✅ **User Login** - Secure authentication with JWT tokens
✅ **Password Security** - Bcrypt hashing and confirmation validation
✅ **JWT Tokens** - Secure token-based authentication
✅ **Protected Routes** - Dashboard only accessible to authenticated users
✅ **Form Validation** - Client and server-side validation
✅ **Error Handling** - Comprehensive error messages
✅ **Responsive Design** - Mobile-friendly UI
✅ **Modern UI** - Matches Lycaon Entertainment theme
✅ **Loading States** - Visual feedback during submission
✅ **Success/Error Alerts** - User feedback messages

## 🏗️ Project Structure

```
Event-management-and-ticket-booking-system-/
├── backend/
│   ├── config/
│   │   ├── db.js           # MongoDB connection
│   │   └── auth.js         # JWT middleware
│   ├── controllers/
│   │   └── authController.js   # Auth logic
│   ├── models/
│   │   └── User.js         # User schema
│   ├── routes/
│   │   └── auth.js         # Auth routes
│   ├── .env                # Environment variables
│   ├── package.json
│   └── server.js           # Express server
│
├── frontend/
│   ├── public/
│   │   └── index.html      # HTML entry point
│   ├── src/
│   │   ├── components/
│   │   │   └── ProtectedRoute.js
│   │   ├── context/
│   │   │   └── AuthContext.js   # Auth state management
│   │   ├── hooks/
│   │   │   └── useAuth.js       # Custom hook
│   │   ├── pages/
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   └── Dashboard.js
│   │   ├── services/
│   │   │   └── api.js           # API client
│   │   ├── styles/
│   │   │   ├── index.css
│   │   │   ├── Auth.css
│   │   │   └── Dashboard.css
│   │   ├── App.js
│   │   └── index.js
│   ├── .env                # Environment variables
│   └── package.json
│
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- Node.js (v14+)
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (already provided):
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/lycaon-auth
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
NODE_ENV=development
```

4. For MongoDB Atlas, update URI:
```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/lycaon-auth
```

5. Start the server:
```bash
npm run dev  # With nodemon for development
# or
npm start   # Production mode
```

Server runs on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (already provided):
```env
REACT_APP_API_URL=http://localhost:5000
```

4. Start the development server:
```bash
npm start
```

App runs on `http://localhost:3000`

## 📚 API Documentation

### Authentication Endpoints

#### Register User
```
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "confirmPassword": "SecurePass123"
}

Response:
{
  "success": true,
  "token": "eyJhbGc...",
  "user": {
    "id": "...",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

#### Login User
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123"
}

Response:
{
  "success": true,
  "token": "eyJhbGc...",
  "user": {
    "id": "...",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

#### Get Current User
```
GET /api/auth/me
Authorization: Bearer <token>

Response:
{
  "success": true,
  "user": {
    "_id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2026-02-11T...",
    "updatedAt": "2026-02-11T..."
  }
}
```

## 🔐 Security Features

- **Password Hashing**: Bcryptjs with salt rounds (10)
- **JWT Tokens**: Secure token-based authentication (30-day expiry)
- **Token Storage**: Stored in localStorage (can be upgraded to httpOnly cookies)
- **Email Validation**: Regex pattern validation
- **Password Validation**: Minimum 6 characters
- **Unique Email**: Email uniqueness constraint in MongoDB
- **Protected Routes**: JWT verification middleware
- **CORS**: Enabled for secure cross-origin requests

## 🎨 UI Components

### Login Page
- Email and password input fields
- Form validation with error messages
- Loading state during API call
- Success/error alerts
- Link to registration page

### Registration Page
- Full name, email, password, confirm password fields
- Real-time validation feedback
- Password match validation
- Loading state during submission
- Error alerts for duplicate emails, validation failures
- Link to login page

### Dashboard
- Welcome message with user name
- Display user email
- Logout functionality
- Placeholder for future features
- Responsive design

## 🎯 Form Validation

### Client-Side
- Required field validation
- Email format validation
- Password minimum length (6 characters)
- Password match confirmation
- Real-time error clearing

### Server-Side
- All fields required
- Email uniqueness check
- Password minimum length validation
- Email format validation using regex
- Comprehensive error handling

## 🌐 Responsive Design

- Mobile-first approach
- Tested on various screen sizes
- Touch-friendly form inputs
- Adaptive layouts for tablets and desktops

## 📱 Device Support

- ✅ Desktop (1024px+)
- ✅ Tablet (768px - 1023px)
- ✅ Mobile (< 768px)
- ✅ Landscape and portrait orientations

## 🔄 Authentication Flow

1. User enters credentials
2. Frontend validates input
3. Request sent to backend API
4. Backend validates and hashes password (register) or compares (login)
5. JWT token generated on success
6. Token stored in localStorage
7. Token sent with subsequent requests
8. Protected routes verify token
9. User redirected to dashboard

## ⚙️ Environment Variables

### Backend (.env)
```env
PORT                # Server port (default: 5000)
MONGODB_URI        # MongoDB connection string
JWT_SECRET         # Secret key for JWT signing
NODE_ENV           # Environment (development/production)
```

### Frontend (.env)
```env
REACT_APP_API_URL  # Backend API URL (default: http://localhost:5000)
```

## 🐛 Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running
- Check connection URI in .env
- For MongoDB Atlas, whitelist your IP

### JWT Token Errors
- Change `JWT_SECRET` in .env
- Clear localStorage and login again
- Check token expiration (30 days)

### CORS Errors
- Ensure frontend URL is allowed in backend
- Check CORS configuration in server.js

### API Not Connecting
- Verify backend is running on port 5000
- Check REACT_APP_API_URL in frontend .env
- Look for network issues

## 📦 Dependencies

### Backend
- **express**: Web framework
- **mongoose**: MongoDB ODM
- **bcryptjs**: Password hashing
- **jsonwebtoken**: JWT token generation
- **dotenv**: Environment variables
- **cors**: CORS middleware

### Frontend
- **react**: UI library
- **react-router-dom**: Routing
- **axios**: HTTP client
- **react-scripts**: Build tools

## 🚀 Deployment

### Backend (Node.js hosting)
1. Update MONGODB_URI for production database
2. Change JWT_SECRET to a strong random string
3. Set NODE_ENV=production
4. Deploy to Heroku, AWS, DigitalOcean, etc.

### Frontend (React hosting)
1. Build production bundle: `npm run build`
2. Update REACT_APP_API_URL
3. Deploy to Netlify, Vercel, GitHub Pages, etc.

## 📝 Future Enhancements

- [ ] Email verification
- [ ] Password reset functionality
- [ ] Google/Facebook OAuth
- [ ] Two-factor authentication
- [ ] User profile management
- [ ] Account deletion
- [ ] Session management
- [ ] Refresh tokens
- [ ] Rate limiting
- [ ] Activity logging

## 📄 License

This project is part of the Lycaon Entertainment Event Management system.

## 🤝 Support

For issues or questions, please contact the development team or create an issue in the repository.

---

**Built with ❤️ for Lycaon Entertainment**
