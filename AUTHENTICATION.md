# Google OAuth Authentication Setup

Your stock dashboard is now set up with Google authentication! Follow these steps to complete the setup and start using it.

## What's Been Added

✅ **Frontend**
- Google login component with beautiful UI
- Protected routes (entire app requires authentication)
- User profile display with logout button
- Automatic token management

✅ **Backend**
- Google OAuth token verification
- JWT token generation (7-day expiry)
- User management (create/update users on first login)
- Protected API endpoints (authenticated requests only)

✅ **Database**
- New `Users` table with:
  - Google ID (unique identifier)
  - Email and Name
  - Profile picture
  - Login timestamps

## Next Steps

### 1. Get Google OAuth Credentials

Go to **[Google Cloud Console](https://console.cloud.google.com/)** and follow [GOOGLE_OAUTH_SETUP.md](./GOOGLE_OAUTH_SETUP.md)

You'll get a **Client ID** that looks like:
```
1234567890-abcdefghijklmnop.apps.googleusercontent.com
```

### 2. Configure Your App

**In `.env`** (backend):
```
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
JWT_SECRET=a-strong-random-string-change-in-production
```

**In `.env.local`** (frontend):
```
VITE_GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
```

### 3. Test Locally

```bash
# Terminal 1: Start React dev server
npm run dev

# Terminal 2: Start backend API server
npm start
```

Visit: **http://localhost:5172**

You should see:
1. Login page with Google button
2. Click "Sign in with Google"
3. Authorize the app
4. Redirected to dashboard with your profile

### 4. Deploy to Production

When deploying to Azure:

1. **Add environment variables** in Azure Portal:
   - `GOOGLE_CLIENT_ID`
   - `JWT_SECRET` (strong random value)
   - DB credentials

2. **Update Google Console**:
   - Add your production domain to:
     - Authorized JavaScript origins
     - Authorized redirect URIs

## File Structure

```
src/
├── components/
│   ├── Login.tsx          (NEW) - Google login component
│   └── StockDashboard.tsx (UPDATED) - Protected dashboard
├── styles/
│   ├── Login.css          (NEW) - Login page styling
│   └── StockDashboard.css (UPDATED) - Added logout button
├── middleware/
│   └── auth.ts            (NEW) - JWT verification
├── utils/
│   └── auth.ts            (NEW) - Token generation
└── App.tsx                (UPDATED) - Auth state management

server.ts                   (UPDATED) - Google OAuth endpoint
.env                        (UPDATED) - Google OAuth credentials
.env.local                  (NEW) - Frontend credentials
.env.example                (UPDATED) - Template
```

## API Endpoints

### Authentication

**Login with Google**
```
POST /api/auth/google
Body: { token: "google_id_token_from_client" }
Response: { token: "jwt_token", user: {...} }
```

**Verify Token**
```
GET /api/auth/verify
Headers: { Authorization: "Bearer jwt_token" }
Response: { valid: true, user: {...} }
```

### Protected Endpoints

All stock endpoints now require authentication:
```
GET /api/stocks
GET /api/stocks/:symbol
Headers: { Authorization: "Bearer jwt_token" }
```

## How Authentication Works

1. **User clicks "Sign in with Google"**
   - Google provides a credential token

2. **Frontend sends token to backend**
   - `POST /api/auth/google`

3. **Backend verifies token with Google**
   - Verifies authenticity
   - Extracts user info (name, email, picture)

4. **User created/updated in database**
   - First login: new user created
   - Subsequent logins: last login timestamp updated

5. **JWT token returned to frontend**
   - Stored in localStorage
   - Sent with every API request
   - Expires in 7 days

6. **Frontend uses JWT token**
   - Routes protected by checking token validity
   - Token refreshes on page reload

## Security Features

✅ **JWT Tokens**: Signed and verified on backend
✅ **7-Day Expiry**: Automatic token rotation
✅ **HTTPS Only**: Required for production
✅ **CORS Protection**: Restricted origins
✅ **Database Separation**: Users table isolated
✅ **No Passwords**: Google OAuth handles security

## Troubleshooting

### "Invalid Client ID" Error
- Check `GOOGLE_CLIENT_ID` in `.env` and `.env.local`
- Verify Client ID matches Google Console
- Restart dev server after changing .env

### "Login button not appearing"
- Ensure `VITE_GOOGLE_CLIENT_ID` is set in `.env.local`
- Check browser console for errors
- Clear browser cache

### "Token verification failed"
- Verify `JWT_SECRET` is set in `.env`
- Check token hasn't expired (7 days)
- Ensure Authorization header format: `Bearer token`

### "User not found" in database
- Check `Users` table exists
- Ensure database connection credentials are correct
- Check SQL Server can be accessed from your machine

## Environment Variables Checklist

| Variable | Where | Example | Notes |
|----------|-------|---------|-------|
| `GOOGLE_CLIENT_ID` | `.env` & `.env.local` | `xxx.apps.googleusercontent.com` | Required for auth |
| `VITE_GOOGLE_CLIENT_ID` | `.env.local` | `xxx.apps.googleusercontent.com` | Frontend only |
| `JWT_SECRET` | `.env` | Strong random string | Change in production |
| `DB_SERVER` | `.env` | `*.database.windows.net` | Azure SQL Server |
| `DB_DATABASE` | `.env` | Database name | Your database |
| `DB_USER` | `.env` | Username | Database user |
| `DB_PASSWORD` | `.env` | Password | Database password |

## Next Features

Consider adding:
- [ ] User profile page
- [ ] Logout confirmation
- [ ] Remember me checkbox
- [ ] Watchlist for multiple stocks
- [ ] Stock alerts/notifications
- [ ] Historical data charts
- [ ] Export data to CSV

## Support

- Google OAuth: https://developers.google.com/identity/protocols/oauth2
- JWT.io: https://jwt.io/
- Azure docs: https://docs.microsoft.com/en-us/azure/
