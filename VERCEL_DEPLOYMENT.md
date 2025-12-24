# Vercel Deployment Guide for AlignedAI

## Issues Fixed

### 1. ✅ Fixed `vercel.json` Configuration
- Added proper build command and output directory
- Configured API route handling
- Added CORS headers for API endpoints

### 2. ✅ Created Missing API Endpoints
- `/api/tasks.ts` - POST endpoint for creating tasks
- `/api/schedule.ts` - POST endpoint for creating schedule blocks
- `/api/schedule/[id].ts` - PATCH/DELETE for schedule blocks
- `/api/pillars/[id].ts` - PATCH for updating pillars

### 3. ✅ Environment Variables Template
Created `.env.example` with all required variables

## Deployment Steps

### Step 1: Set Environment Variables in Vercel

Go to your Vercel project settings → Environment Variables and add:

#### Required for API Functions (Firebase Admin):
```
FIREBASE_ADMIN_KEY=<your-firebase-service-account-json-base64-or-raw>
```

To get this:
1. Go to Firebase Console → Project Settings → Service Accounts
2. Click "Generate New Private Key"
3. Either:
   - Paste the entire JSON as-is, OR
   - Base64 encode it: `cat service-account.json | base64` and paste the result

#### Required for Frontend (Vite):
```
VITE_FIREBASE_API_KEY=<your-api-key>
VITE_FIREBASE_AUTH_DOMAIN=<your-project>.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=<your-project-id>
VITE_FIREBASE_STORAGE_BUCKET=<your-project>.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=<your-sender-id>
VITE_FIREBASE_APP_ID=<your-app-id>
```

Get these from: Firebase Console → Project Settings → General → Your apps

#### Optional (if using):
```
DATABASE_URL=<postgresql-connection-string>
OPENAI_API_KEY=<your-openai-key>
```

**Important**: Add these variables to ALL environments (Production, Preview, Development)

### Step 2: Deploy to Vercel

#### Option A: Deploy from CLI
```bash
npm install -g vercel
vercel --prod
```

#### Option B: Deploy from Git
1. Push your changes to GitHub
2. Vercel will auto-deploy from your connected repository

### Step 3: Verify Deployment

After deployment, test these endpoints:

1. **Health check**: `https://your-app.vercel.app/health` (should return "ok")
2. **API test** (with auth): `https://your-app.vercel.app/api/daily`

## Troubleshooting

### Error: "FIREBASE_ADMIN_KEY missing"
- Check that the environment variable is set in Vercel
- Make sure it's added to the correct environment (Production/Preview)
- Redeploy after adding environment variables

### Error: 404 on API routes
- Verify `vercel.json` is in the project root
- Check that API files are in the `/api` folder
- Ensure files export a default handler function

### Error: CORS issues
- The `vercel.json` now includes CORS headers
- If issues persist, check the browser console for specific errors

### Build fails
- Check build logs in Vercel dashboard
- Verify all dependencies are in `package.json`
- Ensure TypeScript has no errors: `npm run check`

## Architecture Overview

```
AlignedAI/
├── api/                    # Vercel serverless functions
│   ├── _lib/
│   │   └── initAdmin.ts   # Firebase Admin initialization
│   ├── daily.ts           # Daily data endpoint
│   ├── weekly.ts          # Weekly data endpoint
│   ├── reflections.ts     # Reflections endpoint
│   ├── evaluate-task.ts   # Task evaluation endpoint
│   ├── tasks.ts           # Create tasks (NEW)
│   ├── schedule.ts        # Create schedule blocks (NEW)
│   ├── tasks/[id].ts      # Task CRUD operations
│   ├── schedule/[id].ts   # Schedule CRUD operations (NEW)
│   ├── pillars/[id].ts    # Pillar updates (NEW)
│   └── ai/
│       └── prioritize.ts  # AI prioritization
├── client/                # React frontend
│   └── src/
├── server/                # Express server (NOT used in Vercel)
├── vercel.json            # Vercel configuration (FIXED)
└── vite.config.ts         # Vite build config

```

## Key Changes Made

1. **vercel.json**:
   - Set `buildCommand` to `npm run vite-build`
   - Set `outputDirectory` to `dist/public`
   - Added API route rewrite rules
   - Added CORS headers

2. **New API Endpoints**:
   - All endpoints follow Vercel serverless function pattern
   - Use Firebase Admin SDK for backend operations
   - Include proper CORS headers and auth checks

3. **Environment Variables**:
   - Created `.env.example` as reference
   - All sensitive data moved to environment variables

## Next Steps

1. ✅ Push changes to your repository
2. ✅ Set environment variables in Vercel dashboard
3. ✅ Deploy and test
4. ✅ Monitor logs for any issues

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Check browser console for frontend errors
3. Use `vercel logs` command for real-time logs
4. Verify all environment variables are set correctly
