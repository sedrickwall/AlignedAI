# 🔴 Login 404 Error - Root Cause & Fix

## What's Happening

The 404 error during login means **your Firebase environment variables are NOT set in Vercel**. 

When you deploy to Vercel:
1. ❌ Build runs: `npm run vite-build`
2. ❌ Vite tries to load `VITE_FIREBASE_*` variables
3. ❌ Variables don't exist in Vercel environment
4. ❌ Build completes but Firebase isn't configured
5. ❌ App loads but can't authenticate
6. ❌ 404 error when trying to use Firebase

## The Fix (5 Minutes)

### Step 1: Get Your Firebase Credentials

1. Go to https://console.firebase.google.com
2. Select your project
3. Click gear icon → **Project Settings**
4. Under "Your apps" section, find your web app
5. Copy these values:

```
VITE_FIREBASE_API_KEY = [your-api-key]
VITE_FIREBASE_AUTH_DOMAIN = [project-id].firebaseapp.com
VITE_FIREBASE_PROJECT_ID = [project-id]
VITE_FIREBASE_STORAGE_BUCKET = [project-id].appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID = [sender-id]
VITE_FIREBASE_APP_ID = [app-id]
```

### Step 2: Add to Vercel

1. Go to https://vercel.com/dashboard
2. Select your **AlignedAI** project
3. Click **Settings**
4. Go to **Environment Variables**
5. For each of the 6 variables above:
   - Click **Add New**
   - Paste the key and value
   - Select **All Environments** (Production, Preview, Development)
   - Click **Save**

**CRITICAL**: Must be in ALL three environments!

### Step 3: Redeploy

Option A - Using GitHub:
```bash
git add .
git commit -m "Environment variables configured"
git push
# Vercel will auto-redeploy
```

Option B - Using Vercel CLI:
```bash
npm install -g vercel
vercel --prod --force
```

### Step 4: Test

1. Go to your live deployment: https://aligned.vercel.app
2. Try email login
3. Should work now ✅

## Why This Happens

Your `vite.config.ts` builds the React app with:
```typescript
build: {
  outDir: path.resolve(import.meta.dirname, "dist/public"),
  emptyOutDir: true,
}
```

Vite needs these variables at build time to embed them in the JavaScript bundle. Without them:
- Firebase initialization fails silently
- Auth attempts return 404
- Login page appears to work but nothing happens

## Verification Checklist

- [ ] Have Firebase config values from Project Settings
- [ ] Added 6 environment variables to Vercel
- [ ] Variables added to **ALL environments** (Production, Preview, Development)
- [ ] Redeployed to Vercel (either via git push or `vercel --prod`)
- [ ] Hard refresh browser: Cmd+Shift+R (Mac) / Ctrl+Shift+R (Windows)
- [ ] Try email login on https://aligned.vercel.app/login
- [ ] Try signing up on https://aligned.vercel.app/signup

## Still Not Working?

1. **Clear Vercel Cache**:
   ```bash
   vercel env pull
   vercel --prod --force
   ```

2. **Check Build Logs** in Vercel dashboard:
   - Go to Deployments tab
   - Click latest deployment
   - Check "Build Logs" for errors

3. **Verify Variables Were Saved**:
   - Go back to Settings → Environment Variables
   - Confirm all 6 are listed
   - Check they show `***` (hidden value)

4. **Check Browser Console**:
   - Open DevTools (F12)
   - Go to Console tab
   - Look for Firebase initialization errors

## Quick Reference: Where to Find Each Value

| Variable | Location |
|----------|----------|
| API_KEY | Firebase Console → Project Settings → Web App Config → apiKey |
| AUTH_DOMAIN | Firebase Console → Project Settings → Web App Config → authDomain |
| PROJECT_ID | Firebase Console → Project Settings → Project ID |
| STORAGE_BUCKET | Firebase Console → Project Settings → Web App Config → storageBucket |
| MESSAGING_SENDER_ID | Firebase Console → Project Settings → Web App Config → messagingSenderId |
| APP_ID | Firebase Console → Project Settings → Web App Config → appId |

## Local Development (Optional)

If you want to run locally, create `.env.local`:

```bash
cat > .env.local << 'EOF'
VITE_FIREBASE_API_KEY=your_value_here
VITE_FIREBASE_AUTH_DOMAIN=your_value_here
VITE_FIREBASE_PROJECT_ID=your_value_here
VITE_FIREBASE_STORAGE_BUCKET=your_value_here
VITE_FIREBASE_MESSAGING_SENDER_ID=your_value_here
VITE_FIREBASE_APP_ID=your_value_here
EOF
```

Then: `npm run dev`

But the priority is fixing Vercel first!
