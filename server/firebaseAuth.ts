import type { RequestHandler } from "express";
import { initializeApp, getApps, cert, getApp, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";

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
      firebaseApp = initializeApp({
        projectId,
      });
      console.log("Firebase Admin initialized with project:", projectId);
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
    return res.status(401).json({ message: "Unauthorized - No token provided" });
  }
  
  const idToken = authHeader.slice(7);
  
  if (!idToken) {
    return res.status(401).json({ message: "Unauthorized - Empty token" });
  }
  
  const auth = getFirebaseAdmin();
  if (!auth) {
    return res.status(500).json({ message: "Authentication service unavailable" });
  }
  
  try {
    const decodedToken = await auth.verifyIdToken(idToken);
    req.user = {
      claims: {
        sub: decodedToken.uid,
        email: decodedToken.email,
      },
    };
    return next();
  } catch (error: any) {
    console.error("Token verification failed:", error.message);
    return res.status(401).json({ message: "Unauthorized - Invalid token" });
  }
};

export { firebaseAuthMiddleware as firebaseAuth };
