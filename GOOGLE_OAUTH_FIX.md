# Google OAuth Login Fix Guide

## Problem: 404 Error on Google Login

The error `Failed to load resource: net::ERR_FILE_NOT_FOUND` with Chrome extension issues indicates that **Firebase OAuth redirect URIs are not configured correctly** in your Firebase Console.

## Root Cause

When you click "Continue with Google", Firebase tries to redirect back to your app, but your Vercel deployment URL is not whitelisted in Firebase Console.

## Solution

### Step 1: Get Your Deployment URLs

Your app is deployed at:
- **Production**: `https://aligned.vercel.app`
- **Preview**: `https://aligned-*.vercel.app` (any preview deployments)
- **Local Dev**: `http://localhost:5173` (for testing)

### Step 2: Configure Firebase Console

1. Go to **Firebase Console** → Your Project
2. Navigate to **Authentication** → **Settings** (gear icon)
3. Go to **Authorized domains** tab
4. Add all these domains:
   - `aligned.vercel.app`
   - `aligned-*.vercel.app` (for previews)
   - `localhost` (for local development)

### Step 3: Configure Google OAuth Consent

1. Go to **Google Cloud Console** → Your Project
2. Navigate to **APIs & Services** → **OAuth 2.0 consent screen**
3. Under **Authorized redirect URIs**, add:
   - `https://aligned.vercel.app/__/auth/handler`
   - `https://aligned-*.vercel.app/__/auth/handler`
   - `http://localhost:5173/__/auth/handler`

### Step 4: Environment Variables

Make sure these are set in Vercel (Production, Preview, and Development):

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

**Note**: These must be environment variables in Vercel dashboard with `VITE_` prefix so they're available at build time.

### Step 5: Redeploy

After updating Firebase configuration:

```bash
# Option 1: Force Vercel to rebuild
vercel --prod --force

# Option 2: Push to GitHub and let Vercel auto-deploy
git add .
git commit -m "Fix Google OAuth configuration"
git push
```

### Step 6: Test Locally First

Before redeploying to Vercel:

```bash
npm run dev
# Navigate to http://localhost:5173
# Try Google login
```

## Troubleshooting

### Error: "Popup was blocked"
- Check browser popup settings
- Some browsers block auth popups - ensure they're allowed

### Error: "auth/invalid-origin"
- Domain NOT in Firebase Authorized domains
- Follow Step 2 above

### Error: "The message port closed before a response was received"
- The redirect URI is wrong or not configured
- Follow Step 3 above - specifically the `__/auth/handler` part

### Chrome Extension Error
- This is often a side effect of misconfigured redirect URIs
- Fix the redirect URI configuration and the error should disappear

## How Google OAuth Works in Firebase

```
1. User clicks "Continue with Google"
   ↓
2. Browser opens Google login popup
   ↓
3. User authenticates with Google
   ↓
4. Google redirects to: https://your-domain.com/__/auth/handler
   ↓
5. Firebase handles the callback at /__/auth/handler (built-in)
   ↓
6. Firebase redirects back to your app
   ↓
7. User is logged in ✓
```

If step 4 URL is not whitelisted, Firebase can't complete the flow → Error 404.

## Verification Checklist

- [ ] Added all Vercel URLs to Firebase Authorized Domains
- [ ] Configured Google OAuth redirect URIs in Google Cloud Console
- [ ] Set all `VITE_FIREBASE_*` environment variables in Vercel
- [ ] Environment variables are in Production, Preview, AND Development environments
- [ ] Redeployed to Vercel after changes
- [ ] Tested locally first with `npm run dev`
- [ ] Browser popup permissions are enabled

## Still Having Issues?

1. **Check Firebase Console Logs**:
   - Firebase Console → Authentication → Sign-in method → Logs

2. **Check Browser Console**:
   - Open DevTools (F12) → Console tab
   - Look for specific error messages

3. **Check Vercel Logs**:
   - `vercel logs` in terminal
   - Look for environment variable or deployment issues

4. **Verify Environment Variables**:
   - Check Vercel dashboard that all `VITE_FIREBASE_*` vars are set
   - Variables must be added to correct environment (Production/Preview/Dev)

5. **Clear Cache**:
   - Hard refresh browser: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
   - Clear Vercel cache: `vercel env pull` then redeploy
