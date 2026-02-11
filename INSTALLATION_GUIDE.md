# Complete Installation & Testing Guide

## 🚀 Full System Setup

This guide walks you through setting up both backend and frontend for the Lycaon Authentication System.

## Part 1: Backend Setup

### Step 1: Navigate to Backend
```bash
cd backend
```

### Step 2: Install Dependencies
```bash
npm install
```

This installs:
- express (web framework)
- mongoose (MongoDB ODM)
- bcryptjs (password hashing)
- jsonwebtoken (JWT tokens)
- dotenv (environment variables)
- cors (cross-origin requests)
- nodemon (development auto-reload)

### Step 3: Verify .env File
Check that `backend/.env` exists with:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/lycaon-auth
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
NODE_ENV=development
```

### Step 4: Start Backend Server
```bash
npm run dev
```

Expected output:
```
Server running on port 5000
MongoDB Connected: localhost
```

✅ **Backend is ready!**

---

## Part 2: Frontend Setup (New Terminal)

### Step 1: Navigate to Frontend
```bash
cd frontend
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Verify .env File
Check that `frontend/.env` exists with:
```env
REACT_APP_API_URL=http://localhost:5000
```

### Step 4: Start Frontend Server
```bash
npm start
```

Expected output:
```
Compiled successfully!

You can now view lycaon-auth-frontend in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://xxx.xxx.x.xxx:3000

Note that the development build is not optimized.
```

✅ **Frontend is ready!**

---

## Part 3: Testing the System

### Test 1: Registration

1. Go to `http://localhost:3000`
2. You should see the Login page
3. Click "Create one"
4. Fill in the form:
   - Full Name: `John Doe`
   - Email: `john@example.com`
   - Password: `securepass123`
   - Confirm Password: `securepass123`
5. Click "Create Account"
6. Success message appears
7. Auto-redirects to Dashboard

✅ **New user created successfully**

### Test 2: Login with New Account

1. From Dashboard, click "Logout"
2. Go to Login page
3. Enter:
   - Email: `john@example.com`
   - Password: `securepass123`
4. Click "Sign In"
5. Success message appears
6. Redirected to Dashboard

✅ **Login works correctly**

### Test 3: Error Validation

Test the validation by trying:

**Invalid Email**:
- Email: `invalidemail`
- Error: "Please enter a valid email"

**Password Too Short**:
- Password: `pass`
- Error: "Password must be at least 6 characters"

**Passwords Don't Match**:
- Password: `securepass123`
- Confirm Password: `securepass456`
- Error: "Passwords do not match"

**Duplicate Email**:
- Try registering with `john@example.com` again
- Error: "Email already registered"

**Wrong Password on Login**:
- Email: `john@example.com`
- Password: `wrongpassword`
- Error: "Invalid credentials"

✅ **All validation works**

### Test 4: Protected Route

1. Clear browser storage: `F12` → Application tab
2. Delete token from localStorage
3. Try to access `http://localhost:3000/dashboard`
4. Auto-redirects to login page

✅ **Protected routes working**

---

## Part 4: API Testing with cURL

### Test Registration Endpoint
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Smith",
    "email": "jane@example.com",
    "password": "securepass123",
    "confirmPassword": "securepass123"
  }'
```

Expected response:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Jane Smith",
    "email": "jane@example.com"
  }
}
```

### Test Login Endpoint
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jane@example.com",
    "password": "securepass123"
  }'
```

### Test Protected Route (Get Current User)
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## Part 5: MongoDB Verification

### Connect to MongoDB
```bash
mongosh  # or 'mongo' for older versions
```

### Check Database
```javascript
use lycaon-auth
db.users.find()
```

You should see registered users with hashed passwords.

---

## 📊 Project Verification Checklist

- [ ] Backend starts without errors
- [ ] Frontend starts and compiles successfully
- [ ] Can access http://localhost:3000
- [ ] Registration page loads
- [ ] Can create new account
- [ ] Password validation works
- [ ] Can login with credentials
- [ ] Dashboard displays user name
- [ ] Logout button works
- [ ] Protected routes redirect to login
- [ ] Can't access dashboard without token
- [ ] MongoDB has user records
- [ ] API returns JWT tokens
- [ ] Error messages display correctly

---

## 🔧 Development Workflow

### Terminal Setup (Recommended)
```
Terminal 1: Backend
$ cd backend
$ npm run dev

Terminal 2: Frontend
$ cd frontend
$ npm start

Terminal 3: Optional - MongoDB monitoring
$ mongosh
```

### Code Changes
- **Backend changes**: Automatically reload with nodemon
- **Frontend changes**: Hot reload via React scripts
- **Browser refresh**: May be needed for some CSS changes

---

## 🐛 Common Issues & Solutions

### Issue: "MongoDB connection failed"
**Solution**: 
- Start MongoDB: `mongod`
- Check connection string in `.env`
- For MongoDB Atlas, verify IP whitelisting

### Issue: "CORS policy blocked"
**Solution**:
- Ensure backend CORS is enabled
- Check REACT_APP_API_URL matches running server
- Verify both servers are running

### Issue: "Cannot find module"
**Solution**:
```bash
rm -rf node_modules package-lock.json
npm install
```

### Issue: "Address already in use"
**Solution**: Kill process on port 5000/3000
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID [PID] /F
```

### Issue: "Token not working"
**Solution**:
- Check localStorage for token: `localStorage.getItem('token')`
- Verify JWT_SECRET matches between parts
- Check token hasn't expired

---

## 📱 Testing on Different Devices

### Mobile Testing (Same Network)
1. Get your computer IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
2. On mobile, access: `http://[your-ip]:3000`

### Responsive Testing
- DevTools in Chrome/Firefox: `F12` → Toggle device toolbar
- Test at: 320px, 768px, 1024px, 1440px

---

## 📈 Performance Testing

### Test with Multiple Users
```bash
# Create 10 test users
for i in {1..10}; do
  curl -X POST http://localhost:5000/api/auth/register \
    -H "Content-Type: application/json" \
    -d "{
      \"name\": \"User $i\",
      \"email\": \"user$i@example.com\",
      \"password\": \"password123\",
      \"confirmPassword\": \"password123\"
    }"
done
```

### Monitor Database Growth
```javascript
db.users.countDocuments()
```

---

## ✅ Next Steps

1. **Customize UI**: Modify colors in `src/styles/index.css`
2. **Add Features**: Password reset, email verification, etc.
3. **Deploy**: Follow deployment guide in main README
4. **Integrate**: Connect to event booking system
5. **Test**: Comprehensive testing before production

---

## 📞 Support Resources

- Check browser console: `F12` → Console tab
- Check backend logs: Terminal where backend is running
- Check network requests: `F12` → Network tab
- Debug with React DevTools extension

---

**Ready to go! 🚀 Your authentication system is complete.**
