# SYSTEM ARCHITECTURE & FLOW DIAGRAMS

## 1️⃣ System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    LYCAON AUTHENTICATION SYSTEM                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────┐                      ┌──────────────────┐
│   FRONTEND      │                      │    BACKEND       │
│  (React App)    │                      │ (Express Server) │
│                 │                      │                  │
│  Port: 3000     │◄────── HTTP ────────►│  Port: 5000      │
│                 │      JSON API       │                  │
└─────────────────┘                      └──────────────────┘
        │                                        │
        │                                        │
        ▼                                        ▼
    ┌────────────┐                      ┌──────────────┐
    │ localStorage│                      │  MongoDB     │
    │ (JWT Token) │                      │  Database    │
    └────────────┘                      └──────────────┘
```

---

## 2️⃣ Frontend Architecture

```
┌──────────────────────────────────────────────────────┐
│              REACT FRONTEND (localhost:3000)         │
└──────────────────────────────────────────────────────┘

    ┌─────────────────────────────────────────┐
    │         React Router (BrowserRouter)    │
    │  - /login     → Login page              │
    │  - /register  → Register page           │
    │  - /dashboard → Dashboard (Protected)   │
    └─────────────────────────────────────────┘
              ▲
              │
    ┌─────────┴─────────┐
    │                   │
    ▼                   ▼
┌──────────────┐   ┌──────────────────┐
│ Auth Context │   │ Protected Routes │
│              │   │                  │
│ - user state │   │ - Verify token   │
│ - functions  │   │ - Redirect login │
│ - loading    │   └──────────────────┘
│ - errors     │
└──────────────┘
    ▲
    │
    ├─→ Pages/
    │   ├─ Login.js      (Form input)
    │   ├─ Register.js   (Form input)
    │   └─ Dashboard.js  (User display)
    │
    └─→ Services/
        └─ api.js        (Axios + Interceptor)
```

---

## 3️⃣ Backend Architecture

```
┌──────────────────────────────────────────────────────┐
│           BACKEND SERVER (localhost:5000)            │
└──────────────────────────────────────────────────────┘

    ┌─────────────────────────────────────┐
    │     Express Server (server.js)      │
    │                                     │
    │  - CORS middleware                  │
    │  - JSON parser                      │
    │  - Route handlers                   │
    └─────────────────────────────────────┘
              ▲
              │
    ┌─────────┴────────────────┬──────────────┐
    │                          │              │
    ▼                          ▼              ▼
┌──────────────┐       ┌──────────────┐  ┌──────────┐
│ Routes       │       │ Controllers  │  │ Middleware│
│              │       │              │  │           │
│ /api/auth/   │◄─────►│ register()   │  │ protect() │
│ register     │       │ login()      │  │ (JWT)     │
│              │       │ getCurrentUser()─┤           │
│ /api/auth/   │       └──────────────┘  └──────────┘
│ login        │              ▲
│              │              │
│ /api/auth/   │       ┌──────┴────────┐
│ me           │       │              │
└──────────────┘       ▼              ▼
                    ┌─────────┐   ┌─────────┐
                    │ Models  │   │ Config  │
                    │         │   │         │
                    │User.js  │   │ db.js   │
                    │ Schema  │   │ MongoDB │
                    │ Hashing │   │ Conn    │
                    └─────────┘   └─────────┘
```

---

## 4️⃣ Authentication Flow

### Registration Flow
```
User Input (Register Form)
    │
    ▼
Frontend Validation
    │ (name, email, password, confirmPassword)
    ▼
API Call: POST /api/auth/register
    │
    ▼ (axios)
Backend: authController.register()
    │
    ├─→ Validate all fields
    │
    ├─→ Check password match
    │
    ├─→ Check password length (min 6)
    │
    ├─→ Check email format
    │
    ├─→ Check email uniqueness
    │
    ├─→ Hash password (bcryptjs)
    │
    ├─→ Create User document
    │
    ├─→ Generate JWT token (30 days)
    │
    └─→ Response: {token, user}
          │
          ▼
Frontend: Store token in localStorage
          │
          ▼
Redirect to Dashboard
          │
          ▼
Success! User logged in
```

### Login Flow
```
User Input (Login Form)
    │
    ▼
Frontend Validation
    │ (email, password)
    ▼
API Call: POST /api/auth/login
    │
    ▼
Backend: authController.login()
    │
    ├─→ Validate fields provided
    │
    ├─→ Find user by email
    │
    ├─→ Compare passwords (bcrypt)
    │
    ├─→ Generate JWT token
    │
    └─→ Response: {token, user}
          │
          ▼
Frontend: Store token in localStorage
          │
          ▼
Redirect to Dashboard
          │
          ▼
Success! User logged in
```

### Protected Request Flow
```
Authenticated Request
    │
    ▼
Token from localStorage
    │
    ▼
Add to headers: Authorization: Bearer <token>
    │
    ▼
API Request: GET /api/auth/me
    │
    ▼
Backend: Middleware protect()
    │
    ├─→ Get token from header
    │
    ├─→ Verify token with JWT_SECRET
    │
    ├─→ Extract userId from token
    │
    └─→ Pass to next middleware
          │
          ▼
Controller: getCurrentUser()
          │
          ├─→ Query User by ID
          │
          └─→ Return user data
                │
                ▼
Frontend: Update state with user data
          │
          ▼
Dashboard displays user info
```

---

## 5️⃣ Data Flow Diagram

```
┌─────────────┐
│   Browser   │
│             │
│ State:      │◄──┐
│ - user      │   │
│ - token     │   │
│ - loading   │   │ localStorage
│             │   │
└──────┬──────┘   │
       │          │
       ▼          │
   ┌──────────────┘
   │
   ▼
┌──────────────────┐
│ Axios Interceptor│
│ Add Token Header │
└────────┬─────────┘
         │
         ▼
    ┌────────────┐
    │  Express   │
    │  Server    │
    └────┬───────┘
         │
         ├─→ Parse JSON
         ├─→ Validate input
         ├─→ Check auth
         ├─→ Process request
         ├─→ Query/Update DB
         │
         ▼
    ┌──────────────┐
    │   MongoDB    │
    │  Database    │
    │              │
    │ Collections: │
    │  - users     │
    └──────────────┘
         │
         ▼ (Response)
    ┌──────────────┐
    │   Express    │
    │   Response   │
    └──────┬───────┘
           │
           ▼
    ┌─────────────────┐
    │ Browser         │
    │ Update State    │
    │ Re-render UI    │
    │ Display Result  │
    └─────────────────┘
```

---

## 6️⃣ Component Hierarchy

```
App.js (Root)
│
├─ AuthProvider (Context)
│  │
│  ├─ BrowserRouter
│  │  │
│  │  ├─ Route /login
│  │  │  └─ Login
│  │  │     ├─ Form (controls)
│  │  │     └─ Alerts
│  │  │
│  │  ├─ Route /register
│  │  │  └─ Register
│  │  │     ├─ Form (controls)
│  │  │     └─ Alerts
│  │  │
│  │  └─ Route /dashboard
│  │     └─ ProtectedRoute
│  │        └─ Dashboard
│  │           ├─ Header
│  │           ├─ User Info
│  │           └─ Sections
```

---

## 7️⃣ State Management Flow

```
AuthContext.js (Global State)
│
├─ State:
│  ├─ user: {id, name, email} | null
│  ├─ loading: boolean
│  ├─ error: string | null
│  └─ token: jwt (in localStorage)
│
├─ Actions:
│  ├─ register(name, email, password, confirmPassword)
│  ├─ login(email, password)
│  ├─ logout()
│  └─ getCurrentUser()
│
└─ Usage:
   └─ const {user, login, loading} = useAuth()
```

---

## 8️⃣ Database Operations

### Create User (Registration)
```
Input: {name, email, password}
         │
         ▼
Hash password with bcrypt
         │
         ▼
new User({
  name,
  email,
  password (hashed),
  createdAt,
  updatedAt
})
         │
         ▼
user.save()
         │
         ▼
__v: 0, MongoDB ID assigned
```

### Find User (Login)
```
Input: {email, password}
         │
         ▼
User.findOne({email})
         │
         ▼
bcrypt.compare(password, hashedPassword)
         │
         ├─ Match → Generate JWT
         │
         └─ No Match → Error 401
```

### Update User
```
Input: user._id, updates
       │
       ▼
User.findByIdAndUpdate(_id, updates)
       │
       ▼
Returns updated user
```

---

## 9️⃣ Error Handling Flow

```
Request
   │
   ▼
Try Block
   │
   ├─ Execute operation
   │
   └─ Error occurs
       │
       ▼
Catch Block
       │
       ├─ Check error type
       │
       ├─ Validation error?
       │  └─ 400 Bad Request
       │
       ├─ Auth error?
       │  └─ 401 Unauthorized
       │
       ├─ DB error?
       │  └─ 500 Server Error
       │
       └─ Format error response
           │
           ▼
       Send to client
           │
           ▼
Frontend displays alert
           └─ User sees error message
```

---

## 🔟 Security Layers

```
┌────────────────────────────────────────┐
│         SECURITY IMPLEMENTATION        │
├────────────────────────────────────────┤
│                                        │
│ Layer 1: Client Validation             │
│ - Email format check                   │
│ - Password confirmation                │
│ - Required field validation            │
│                                        │
│ Layer 2: API Request                   │
│ - CORS policy                          │
│ - Content-Type check                   │
│ - Rate limiting (future)               │
│                                        │
│ Layer 3: Server Validation             │
│ - Email uniqueness                     │
│ - Password strength                    │
│ - Input sanitization                   │
│                                        │
│ Layer 4: Authentication                │
│ - Bcrypt password hashing              │
│ - JWT token generation                 │
│ - Token expiration (30 days)           │
│                                        │
│ Layer 5: Authorization                 │
│ - JWT verification middleware          │
│ - Protected routes                     │
│ - Token-based access control           │
│                                        │
│ Layer 6: Data Protection               │
│ - HTTPS (production)                   │
│ - Secure token storage                 │
│ - Password never returned              │
│                                        │
└────────────────────────────────────────┘
```

---

## Deployment Architecture

```
PRODUCTION ENVIRONMENT

┌──────────────────────────────────────────────┐
│          Frontend (Netlify/Vercel)            │
│          http://yourdomain.com                │
└────────────────┬─────────────────────────────┘
                 │
                 │ HTTPS
                 │
┌────────────────▼─────────────────────────────┐
│    Backend (Heroku/AWS/DigitalOcean)         │
│    http://api.yourdomain.com                 │
└────────────────┬─────────────────────────────┘
                 │
                 │
┌────────────────▼─────────────────────────────┐
│  MongoDB Atlas Cloud Database                │
│  mongodb+srv://user:pass@cluster.mongodb.net│
└──────────────────────────────────────────────┘
```

---

These diagrams illustrate the complete architecture and flow of the authentication system!
