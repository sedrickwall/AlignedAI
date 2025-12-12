import * as admin from "firebase-admin";

export function initAdmin() {
  try {
    admin.app(); // already initialized
    return;
  } catch {}

  const key = process.env.FIREBASE_ADMIN_KEY;
  if (!key) throw new Error("FIREBASE_ADMIN_KEY missing");

  const serviceAccount = key.trim().startsWith("{")
    ? JSON.parse(key)
    : JSON.parse(Buffer.from(key, "base64").toString("utf-8"));

  if ((serviceAccount as any).private_key) {
    (serviceAccount as any).private_key =
      (serviceAccount as any).private_key.replace(/\\n/g, "\n");
  }

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}
