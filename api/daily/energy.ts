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
  res.setHeader("Access-Control-Allow-Methods", "PATCH, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "PATCH") return res.status(405).json({ error: "Method not allowed" });

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) return res.status(401).json({ error: "Unauthorized" });
    const decoded = await getAuth().verifyIdToken(authHeader.split("Bearer ")[1]);
    const db = getFirestore();
    await db.collection("daily").doc(decoded.uid).set({ energyLevel: req.body.level }, { merge: true });
    return res.status(200).json({ success: true });
  } catch (error: any) {
    console.error("Energy API error:", error);
    return res.status(500).json({ error: error.message });
  }
}
