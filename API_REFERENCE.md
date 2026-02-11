# API Reference Documentation

## Base URL
```
http://localhost:5000
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## Endpoints

### 1. Register User

**POST** `/api/auth/register`

Register a new user account.

#### Request Headers
```
Content-Type: application/json
```

#### Request Body
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepass123",
  "confirmPassword": "securepass123"
}
```

#### Request Body Schema
| Field | Type | Required | Rules |
|-------|------|----------|-------|
| name | string | Yes | Min 2 characters |
| email | string | Yes | Valid email format, unique |
| password | string | Yes | Min 6 characters |
| confirmPassword | string | Yes | Must match password |

#### Response (201 Created)
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1YzFhMjU4OWZhYmMxMjM0NTY3ODlhYiIsImlhdCI6MTcwNzY0MDAwMCwiZXhwIjoxNzEwMjMyMDAwfQ.abc123def456",
  "user": {
    "id": "65c1a2589fabc1234567890ab",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

#### Error Responses
```json
{
  "success": false,
  "message": "Please provide all required fields"
}
```

Common errors:
- `400`: Missing fields, password mismatch, email invalid, password too short
- `400`: Email already registered
- `500`: Server error

#### Example cURL
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "securepass123",
    "confirmPassword": "securepass123"
  }'
```

---

### 2. Login User

**POST** `/api/auth/login`

Authenticate user credentials and receive JWT token.

#### Request Headers
```
Content-Type: application/json
```

#### Request Body
```json
{
  "email": "john@example.com",
  "password": "securepass123"
}
```

#### Request Body Schema
| Field | Type | Required |
|-------|------|----------|
| email | string | Yes |
| password | string | Yes |

#### Response (200 OK)
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1YzFhMjU4OWZhYmMxMjM0NTY3ODlhYiIsImlhdCI6MTcwNzY0MDAwMCwiZXhwIjoxNzEwMjMyMDAwfQ.abc123def456",
  "user": {
    "id": "65c1a2589fabc1234567890ab",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

#### Error Responses
```json
{
  "success": false,
  "message": "Please provide email and password"
}
```

Common errors:
- `400`: Missing email or password
- `401`: Invalid credentials (wrong email or password)
- `500`: Server error

#### Example cURL
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "securepass123"
  }'
```

---

### 3. Get Current User

**GET** `/api/auth/me`

Retrieve the profile of the authenticated user.

#### Request Headers
```
Content-Type: application/json
Authorization: Bearer <your_jwt_token>
```

#### Response (200 OK)
```json
{
  "success": true,
  "user": {
    "_id": "65c1a2589fabc1234567890ab",
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2026-02-11T10:30:45.123Z",
    "updatedAt": "2026-02-11T10:30:45.123Z",
    "__v": 0
  }
}
```

#### Error Responses
```json
{
  "success": false,
  "message": "Not authorized to access this route"
}
```

Common errors:
- `401`: No token provided
- `401`: Invalid or expired token
- `500`: Server error

#### Example cURL
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## Authentication Token Details

### JWT Token Structure
- **Algorithm**: HS256 (HMAC with SHA-256)
- **Expiration**: 30 days from issue
- **Header**:
  ```json
  {
    "alg": "HS256",
    "typ": "JWT"
  }
  ```
- **Payload**:
  ```json
  {
    "id": "user_id_here",
    "iat": 1707640000,
    "exp": 1710232000
  }
  ```

### Token Usage
Store the token in localStorage:
```javascript
localStorage.setItem('token', token);
```

Add to request headers:
```javascript
headers: {
  'Authorization': `Bearer ${token}`
}
```

---

## User Schema

### User Document Structure
```json
{
  "_id": "ObjectId",
  "name": "string",
  "email": "string",
  "password": "string (hashed)",
  "createdAt": "datetime",
  "updatedAt": "datetime",
  "__v": 0
}
```

### Password Security
- **Algorithm**: bcryptjs
- **Salt Rounds**: 10
- **Never returned**: Password field is excluded by default

---

## Status Codes

| Code | Meaning | Use |
|------|---------|-----|
| 200 | OK | Successful GET request |
| 201 | Created | Successful POST request (resource created) |
| 400 | Bad Request | Invalid input, validation failed |
| 401 | Unauthorized | Missing/invalid token, wrong credentials |
| 404 | Not Found | Resource doesn't exist |
| 500 | Server Error | Internal server error |

---

## Validation Rules

### Email Validation
- Valid email format: `username@domain.extension`
- Must be unique in database
- Case-insensitive storage
- Regex: `/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/`

### Password Validation
- Minimum 6 characters
- No maximum length limit
- Hashed with bcrypt before storage
- Case-sensitive

### Name Validation
- Minimum 2 characters
- Whitespace trimmed
- No specific format required

---

## Error Handling

### Success Response Format
```json
{
  "success": true,
  "token": "...",
  "user": {...}
}
```

### Error Response Format
```json
{
  "success": false,
  "message": "Error description"
}
```

### Common Error Messages

| Message | Cause | Solution |
|---------|-------|----------|
| "Please provide all required fields" | Missing field | Check all fields filled |
| "Passwords do not match" | Pass != confirmPass | Ensure passwords match |
| "Please provide a valid email" | Invalid email format | Enter valid email |
| "Email already registered" | Duplicate email | Use different email |
| "Password must be at least 6 characters" | Password < 6 chars | Use longer password |
| "Invalid credentials" | Wrong email/password | Check login info |
| "Not authorized to access this route" | Missing/invalid token | Login and get valid token |

---

## Rate Limiting

Currently not implemented. For production, add rate limiting:
```javascript
npm install express-rate-limit
```

---

## CORS Policy

Frontend must match CORS configuration:
- **Allowed Origin**: http://localhost:3000
- **Allowed Methods**: GET, POST, PUT, DELETE, OPTIONS
- **Allowed Headers**: Content-Type, Authorization

---

## Examples

### Complete Registration Flow
```javascript
// Step 1: Register
const registerResponse = await fetch('http://localhost:5000/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Jane Doe',
    email: 'jane@example.com',
    password: 'securepass123',
    confirmPassword: 'securepass123'
  })
});

const data = await registerResponse.json();
const token = data.token;

// Step 2: Store token
localStorage.setItem('token', token);

// Step 3: Use token for authenticated requests
const meResponse = await fetch('http://localhost:5000/api/auth/me', {
  headers: { 'Authorization': `Bearer ${token}` }
});

const user = await meResponse.json();
console.log(user);
```

### Complete Login Flow
```javascript
// Step 1: Login
const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'john@example.com',
    password: 'securepass123'
  })
});

const data = await loginResponse.json();
const token = data.token;

// Step 2: Store token and redirect
localStorage.setItem('token', token);
window.location.href = '/dashboard';
```

---

## Postman Collection

Import this into Postman for easy testing:

**Register**: POST http://localhost:5000/api/auth/register
**Login**: POST http://localhost:5000/api/auth/login
**Get User**: GET http://localhost:5000/api/auth/me

Set token from register/login response in Authorization header for Get User request.

---

## Troubleshooting

### Token Expired
- Error: `401 Not authorized`
- Solution: Login again to get new token
- Tokens expire after 30 days

### CORS Errors
- Check frontend URL matches CORS config
- Both servers must be running
- Check browser console for details

### Database Connection
- Verify MongoDB running
- Check connection string in .env
- Ensure correct credentials

---

**Last Updated**: February 11, 2026
