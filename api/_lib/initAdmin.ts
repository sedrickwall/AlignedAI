import * as admin from "firebase-admin";

export function initAdmin() {
  if (admin.apps.length) return;

  const key = process.env.FIREBASE_ADMIN_KEY;
  if (!key) throw new Error("FIREBASE_ADMIN_KEY missing");

  const sa = key.trim().startsWith("{")
    ? JSON.parse(key)
    : JSON.parse(Buffer.from(key, "base64").toString("utf-8"));

  if (sa.private_key) {
    sa.private_key = sa.private_key.replace(/\\n/g, "\n");
  }

  admin.initializeApp({
    credential: admin.credential.cert(sa),
  });
}
