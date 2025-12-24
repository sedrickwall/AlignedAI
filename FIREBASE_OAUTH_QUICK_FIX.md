# Quick Firebase OAuth Setup Checklist

## What to Do RIGHT NOW

The 404 error on Google login means Firebase can't redirect back to your app. Here's the step-by-step fix:

### 1️⃣ Go to Firebase Console
- Project name: Your Firebase Project
- URL: https://console.firebase.google.com

### 2️⃣ Add Authorized Domains
Navigate to: **Authentication** → **Settings** (gear icon) → **Authorized domains**

Click **Add domain** and add these:
- ✅ `aligned.vercel.app` (production)
- ✅ `localhost` (local development)
- ✅ `localhost:5173` (with port for dev)

### 3️⃣ Configure OAuth Redirects in Google Cloud
Navigate to: **Google Cloud Console** → **APIs & Services** → **Credentials**

Find your OAuth 2.0 Client ID (should say "Web application")

In **Authorized redirect URIs**, add:
- ✅ `https://aligned.vercel.app/__/auth/handler`
- ✅ `http://localhost:5173/__/auth/handler`

### 4️⃣ Verify Vercel Environment Variables
Go to: Vercel Dashboard → Your Project → Settings → Environment Variables

Make sure these exist in **Production**, **Preview**, and **Development**:

```
VITE_FIREBASE_API_KEY = [your key]
VITE_FIREBASE_AUTH_DOMAIN = [your-project].firebaseapp.com
VITE_FIREBASE_PROJECT_ID = [your-project]
VITE_FIREBASE_STORAGE_BUCKET = [your-project].appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID = [your id]
VITE_FIREBASE_APP_ID = [your id]
```

**CRITICAL**: Must start with `VITE_` and be in ALL environments!

### 5️⃣ Redeploy
```bash
vercel --prod --force
```

Or push to GitHub and Vercel will auto-deploy.

### 6️⃣ Test Locally First
```bash
npm run dev
# Go to http://localhost:5173
# Try Google login
```

## If It Still Doesn't Work

1. **Hard refresh browser**: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
2. **Check browser console** (F12) for specific errors
3. **Check Vercel logs**: Run `vercel logs`
4. **Verify domain was added**: Go back to Firebase Console and confirm it's there
5. **Wait 5 minutes**: Sometimes Firebase takes a moment to propagate changes

## The Fix Explained

When you click "Continue with Google":
1. ✅ User sees Google login popup
2. ✅ User signs in with Google
3. ❌ Google tries to redirect to: `https://your-app.com/__/auth/handler`
4. ❌ **Error 404 because domain not whitelisted**
5. ❌ Firebase can't complete the callback

**Your fix**: Add the domain to Firebase → Problem solved!
