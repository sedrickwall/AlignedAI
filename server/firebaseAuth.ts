import type { RequestHandler } from "express";
import { initializeApp, getApps, cert, getApp, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { storage } from "./storage";

let firebaseApp: App | null = null;
let firebaseAuth: Auth | null = null;

function getFirebaseAdmin(): Auth | null {
  if (firebaseAuth) return firebaseAuth;
  
  const projectId = process.env.VITE_FIREBASE_PROJECT_ID;
  if (!projectId) {
    console.error("VITE_FIREBASE_PROJECT_ID not set - Firebase auth will not work");
    return null;
  }
  
  try {
    if (getApps().length === 0) {
      // Try to use service account credentials if available
      const adminKey = process.env.FIREBASE_ADMIN_KEY;
      
      if (adminKey) {
        let serviceAccount;
        // Check if Base64 encoded
        if (!adminKey.trim().startsWith('{')) {
          const decoded = Buffer.from(adminKey, 'base64').toString('utf-8');
          serviceAccount = JSON.parse(decoded);
        } else {
          serviceAccount = JSON.parse(adminKey);
        }
        
        // Fix newlines in private key
        if (serviceAccount.private_key) {
          serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
        }
        
        firebaseApp = initializeApp({
          credential: cert(serviceAccount),
          projectId,
        });
        console.log("Firebase Admin initialized with service account");
      } else {
        // Fall back to project ID only (limited functionality)
        firebaseApp = initializeApp({
          projectId,
        });
        console.log("Firebase Admin initialized with project ID only (limited)");
      }
    } else {
      firebaseApp = getApp();
    }
    firebaseAuth = getAuth(firebaseApp);
    return firebaseAuth;
  } catch (error: any) {
    console.error("Firebase Admin initialization failed:", error.message);
    return null;
  }
}

/**
 * Firebase Auth middleware that verifies ID tokens
 * Requires a valid Bearer token in the Authorization header
 */
export const firebaseAuthMiddleware: RequestHandler = async (req: any, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.log("[Auth] No token provided");
    return res.status(401).json({ message: "Unauthorized - No token provided" });
  }
  
  const idToken = authHeader.slice(7);
  
  if (!idToken) {
    console.log("[Auth] Empty token");
    return res.status(401).json({ message: "Unauthorized - Empty token" });
  }
  
  const auth = getFirebaseAdmin();
  if (!auth) {
    console.error("[Auth] Firebase Admin not initialized - FIREBASE_ADMIN_KEY may be missing");
    return res.status(500).json({ message: "Authentication service unavailable" });
  }
  
  try {
    console.log("[Auth] Verifying token...");
    const decodedToken = await auth.verifyIdToken(idToken);
    console.log("[Auth] Token verified for user:", decodedToken.uid);
    
    // Upsert user in database so profile data can be saved
    try {
      await storage.upsertUser({
        id: decodedToken.uid,
        email: decodedToken.email || null,
        firstName: decodedToken.name?.split(' ')[0] || null,
        lastName: decodedToken.name?.split(' ').slice(1).join(' ') || null,
        profileImageUrl: decodedToken.picture || null,
      });
    } catch (upsertError: any) {
      console.error("[Auth] Failed to upsert user:", upsertError.message);
      // Continue anyway - user verification succeeded
    }
    
    req.user = {
      claims: {
        sub: decodedToken.uid,
        email: decodedToken.email,
      },
    };
    return next();
  } catch (error: any) {
    console.error("[Auth] Token verification failed:", error.message);
    return res.status(401).json({ message: "Unauthorized - Invalid token" });
  }
};

export { firebaseAuthMiddleware as firebaseAuth };
