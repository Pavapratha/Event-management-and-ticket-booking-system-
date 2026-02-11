# Quick Reference Card

## 🚀 Quick Start (5 minutes)

### Terminal 1: Backend
```bash
cd backend
npm install
npm run dev
# Should see: "Server running on port 5000"
```

### Terminal 2: Frontend
```bash
cd frontend
npm install
npm start
# Should see: "Compiled successfully!" at http://localhost:3000
```

## 📝 Files & Directories

### Backend
```
backend/
├── .env                    # Environment config
├── server.js              # Main server file
├── config/db.js           # MongoDB connection
├── config/auth.js         # JWT middleware
├── models/User.js         # User schema
├── controllers/auth.js    # Auth handlers
└── routes/auth.js         # Route definitions
```

### Frontend
```
frontend/
├── .env                   # Environment config
├── src/
│   ├── App.js            # Main routes
│   ├── index.js          # Entry point
│   ├── pages/
│   │   ├── Login.js
│   │   ├── Register.js
│   │   └── Dashboard.js
│   ├── context/AuthContext.js    # State
│   ├── services/api.js           # API calls
│   └── styles/           # CSS files
└── public/index.html     # HTML template
```

## 🔑 Key Endpoints

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | `/api/auth/register` | No | Create account |
| POST | `/api/auth/login` | No | Sign in |
| GET | `/api/auth/me` | Yes | Get user data |

## 🔐 Authentication Token

- **Type**: JWT
- **Expiry**: 30 days
- **Storage**: localStorage
- **Header**: `Authorization: Bearer <token>`

## 📱 Pages

| Page | URL | Auth Required | Purpose |
|------|-----|---|---------|
| Login | `/login` | No | Sign in |
| Register | `/register` | No | Create account |
| Dashboard | `/dashboard` | Yes | User home |

## 🛠️ Useful Commands

```bash
# Backend
npm install              # Install deps
npm run dev             # Start with auto-reload
npm start               # Start production

# Frontend
npm install             # Install deps
npm start               # Development server (port 3000)
npm run build           # Production build

# MongoDB
mongosh                 # Connect to MongoDB
use lycaon-auth         # Select database
db.users.find()         # View all users
db.users.deleteMany({}) # Clear users
```

## 🐛 Common Issues

| Problem | Solution |
|---------|----------|
| Port 5000 in use | `netstat -ano \| findstr :5000` then `taskkill /PID <PID> /F` |
| MongoDB error | Start MongoDB: `mongod` |
| CORS error | Ensure both servers running |
| Token invalid | Clear localStorage, login again |
| Build error | `rm -rf node_modules` then `npm install` |

## 📊 Form Validation

### Register Form
- ✓ Name: 2+ characters
- ✓ Email: valid format, unique
- ✓ Password: 6+ characters
- ✓ Confirm: must match password

### Login Form
- ✓ Email: required
- ✓ Password: required

## 🎨 Theme Colors

```css
--primary-color: #7c3aed    (Purple)
--primary-dark: #6d28d9
--secondary-color: #0f172a  (Dark)
--success-color: #10b981    (Green)
--error-color: #ef4444      (Red)
```

## 🧪 Test Login Data

After creating an account, use:
- Email: your_email@example.com
- Password: whatever_you_set

## 📚 Documentation Files

- `README.md` - Main documentation
- `INSTALLATION_GUIDE.md` - Full setup steps
- `API_REFERENCE.md` - API details
- `backend/SETUP.md` - Backend guide
- `frontend/SETUP.md` - Frontend guide

## 🚢 Deployment

### Backend
Update `.env`:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/lycaon-auth
JWT_SECRET=strong_random_secret_key
NODE_ENV=production
```

Deploy to: Heroku, AWS, DigitalOcean

### Frontend
Update `.env`:
```env
REACT_APP_API_URL=https://your-api.com
```

Deploy to: Netlify, Vercel, GitHub Pages

## 💾 Database

### MongoDB Collections
- **users**: Stores user accounts

### User Document
```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  password: String (hashed),
  createdAt: Date,
  updatedAt: Date
}
```

## ✅ Verification Checklist

- [ ] Backend starts: `npm run dev`
- [ ] Frontend starts: `npm start`
- [ ] Can register account
- [ ] Can login with account
- [ ] Dashboard shows user name
- [ ] Can logout
- [ ] Protected routes work
- [ ] API errors display correctly

## 🔗 Links

- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- API Endpoint: http://localhost:5000/api/auth

## 📞 Need Help?

1. Check browser console: `F12`
2. Check backend logs in terminal
3. Read documentation files
4. Verify `.env` files exist
5. Ensure both servers running

---

**Always run both backend and frontend together!**

Backend: Terminal 1 (port 5000)
Frontend: Terminal 2 (port 3000)
