import * as admin from "firebase-admin";

export function initAdmin() {
  if (admin.apps.length) return;

  const key = process.env.FIREBASE_ADMIN_KEY;
  if (!key) {
    throw new Error("FIREBASE_ADMIN_KEY is missing");
  }

  let serviceAccount: admin.ServiceAccount;

  try {
    if (key.trim().startsWith("{")) {
      serviceAccount = JSON.parse(key);
    } else {
      const decoded = Buffer.from(key, "base64").toString("utf-8");
      serviceAccount = JSON.parse(decoded);
    }

    if (serviceAccount.privateKey) {
      serviceAccount.privateKey = serviceAccount.privateKey.replace(/\\n/g, "\n");
    }

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

    console.log("[initAdmin] Firebase Admin initialized successfully");
  } catch (error: any) {
    console.error("[initAdmin] Failed to initialize:", error.message);
    throw error;
  }
}
