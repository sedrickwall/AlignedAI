import type { VercelRequest, VercelResponse } from "@vercel/node";
import * as admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

if (!admin.apps.length) {
  const key = process.env.FIREBASE_ADMIN_KEY;
  if (key) {
    const sa = key.trim().startsWith("{") ? JSON.parse(key) : JSON.parse(Buffer.from(key, "base64").toString("utf-8"));
    if (sa.private_key) sa.private_key = sa.private_key.replace(/\\n/g, "\n");
    admin.initializeApp({ credential: admin.credential.cert(sa) });
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, PATCH, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) return res.status(401).json({ error: "Unauthorized" });
    const decoded = await getAuth().verifyIdToken(authHeader.split("Bearer ")[1]);
    const db = getFirestore();
    const ref = db.collection("weekly").doc(decoded.uid);

    if (req.method === "GET") {
      const snap = await ref.get();
      if (!snap.exists) return res.status(200).json({ pillars: [], focusStatement: "", topFive: [] });
      return res.status(200).json(snap.data());
    }
    if (req.method === "PATCH") {
      await ref.set(req.body, { merge: true });
      return res.status(200).json({ success: true });
    }
    return res.status(405).json({ error: "Method not allowed" });
  } catch (error: any) {
    console.error("Weekly API error:", error);
    return res.status(500).json({ error: error.message });
  }
}
