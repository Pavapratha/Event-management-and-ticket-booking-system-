# Frontend Setup Guide

## Prerequisites
- Node.js v14 or higher
- npm or yarn
- Backend server running on http://localhost:5000

## Installation Steps

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Environment Configuration
Create a `.env` file in the frontend directory:

```env
REACT_APP_API_URL=http://localhost:5000
```

For production, update to your backend URL:
```env
REACT_APP_API_URL=https://api.yourdomain.com
```

### 3. Start Development Server
```bash
npm start
```

The app will open at `http://localhost:3000`

### 4. Build for Production
```bash
npm run build
```

This creates an optimized production build in the `build/` directory.

## Features

### Pages

**Login Page** (`/login`)
- Email and password input
- Form validation with error messages
- Loading state during API call
- Redirect to dashboard on success

**Registration Page** (`/register`)
- Full name, email, password fields
- Password confirmation
- Real-time validation
- Duplicate email detection
- Redirect to dashboard on success

**Dashboard** (`/dashboard`)
- Protected route (requires login)
- Displays user information
- Logout functionality

### Components

**ProtectedRoute**
- Wraps routes that require authentication
- Redirects to login if not authenticated
- Prevents unauthorized access

**AuthContext**
- Global state management for authentication
- Provides user data across app
- Manages loading and error states
- Handles token storage

## Project Structure

```
src/
├── components/
│   └── ProtectedRoute.js       # Route protection wrapper
├── context/
│   └── AuthContext.js          # Auth state & logic
├── hooks/
│   └── useAuth.js              # Auth context hook
├── pages/
│   ├── Login.js
│   ├── Register.js
│   └── Dashboard.js
├── services/
│   └── api.js                  # Axios API setup & calls
├── styles/
│   ├── index.css               # Global styles
│   ├── Auth.css                # Auth pages styles
│   └── Dashboard.css           # Dashboard styles
├── App.js                      # Main app component with routing
└── index.js                    # App entry point
```

## Key Technologies

- **React 18**: UI library
- **React Router v6**: Client-side routing
- **Axios**: HTTP client for API calls
- **Context API**: State management

## Available Scripts

### `npm start`
Runs the app in development mode.
Open [http://localhost:3000](http://localhost:3000)

### `npm run build`
Builds the app for production to the `build` folder.

### `npm test`
Launches the test runner in interactive watch mode.

## Styling

The project uses CSS with CSS variables for theming:
- Primary Color: `#7c3aed` (Purple)
- Secondary Color: `#0f172a` (Dark)
- Success: `#10b981` (Green)
- Error: `#ef4444` (Red)

All components are responsive and mobile-friendly.

## API Integration

### Authentication Flow

1. User submits login/register form
2. Frontend validates input locally
3. Form data sent to backend API
4. Backend validates and processes
5. JWT token returned on success
6. Token stored in localStorage
7. Token automatically added to API requests
8. Protected routes verify authentication

### Error Handling

- API errors displayed to user
- Form validation prevents invalid submissions
- Network errors caught and displayed
- Token expiration handled gracefully

## Troubleshooting

### Backend Not Connecting
1. Ensure backend is running on port 5000
2. Check REACT_APP_API_URL in .env
3. Verify no CORS issues in console

### Blank Page or Errors
1. Clear browser cache: Ctrl+Shift+Delete
2. Clear localStorage: Open DevTools > Application > Storage
3. Restart development server: Ctrl+C then `npm start`

### Build Errors
```bash
# Clear dependencies and reinstall
rm -rf node_modules
npm install
npm start
```

### Port 3000 Already in Use
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :3000
kill -9 <PID>
```

## Performance Tips

- Forms validate input before submission
- Loading states prevent double-submissions
- Routing uses lazy loading patterns
- CSS uses efficient selectors and animations

## Deployment Options

### Netlify
```bash
npm run build
# Drag build folder to Netlify
```

### Vercel
```bash
npm install -g vercel
vercel
```

### GitHub Pages
Update package.json homepage and deploy

### Traditional Hosting
Upload `build/` folder contents

## Security Notes

- Tokens stored in localStorage (consider httpOnly cookies)
- Never commit .env files
- Validate all inputs server-side
- HTTPS recommended in production
- Sanitize any user-generated content

## Next Steps

1. Ensure backend is running
2. Both frontend and backend must be running simultaneously
3. Test the complete authentication flow
4. Customize styling as needed
5. Add additional features as required

## Support

For issues, check:
- Browser console for errors (F12)
- Network tab to inspect API calls
- Backend logs for server errors
- React DevTools extension for component inspection
