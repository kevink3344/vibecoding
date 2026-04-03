# Google OAuth Setup Guide

This app uses Google OAuth 2.0 for authentication. Follow these steps to set up Google login.

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Sign in with your Google account
3. Create a new project:
   - Click project selector dropdown
   - Click "NEW PROJECT"
   - Enter: `vibecoding`
   - Click "CREATE"

## Step 2: Enable Google+ API

1. In the sidebar, go to "APIs & Services" > "Library"
2. Search for "Google+ API"
3. Click on it and hit "ENABLE"

## Step 3: Create OAuth Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. Choose "Web application"
4. Under "Authorized JavaScript origins", add:
   - `http://localhost:5172` (development)
   - `http://localhost:3000` (dev server)
   - `https://your-domain.com` (production)
5. Under "Authorized redirect URIs", add:
   - `http://localhost:5172` (development)
   - `http://localhost:3000` (dev server)
   - `https://your-domain.com` (production)
6. Click "CREATE"
7. Copy the **Client ID**

## Step 4: Add Client ID to Environment

1. Open `.env` file
2. Replace `your_google_client_id_here` with your Client ID:
   ```
   GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
   ```

3. Also create `.env.local` for Vite development:
   ```
   VITE_GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
   ```

## Step 5: Test Locally

```bash
npm run dev
```

Visit `http://localhost:5172` and you should see the Google login button.

## Step 6: Deploy to Production

Update your environment variables in Azure:

1. Go to Azure Portal
2. Navigate to your Static Web App
3. Settings > Environment variables
4. Add:
   ```
   GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
   JWT_SECRET=a-very-secure-random-string
   ```

## Security Notes

- ✅ JWT tokens expire after 7 days
- ✅ Passwords never sent to client
- ✅ HTTPS required in production
- ✅ Same-site cookie security enabled
- ⚠️ Change `JWT_SECRET` in production to a strong random value
- ⚠️ Keep `DB_PASSWORD` secure in production env variables

## Troubleshooting

### "Invalid Client ID" error
- Verify Client ID matches in `.env`
- Check `Authorized JavaScript origins` includes your domain

### "Redirect URI mismatch"
- Add your domain to `Authorized redirect URIs` in Google Console

### Login button not appearing
- Check `.env.local` has correct `VITE_GOOGLE_CLIENT_ID`
- Check browser console for errors
- Verify Vite is reloaded after env changes
