import type { VercelRequest, VercelResponse } from "@vercel/node";
import { initAdmin } from "./utils/initAdmin";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

initAdmin();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const token = authHeader.split("Bearer ")[1];
    const decoded = await getAuth().verifyIdToken(token);
    const uid = decoded.uid;

    const db = getFirestore();
    const reflectionsRef = db.collection("reflections").doc(uid);

    if (req.method === "GET") {
      const snap = await reflectionsRef.get();
      
      if (!snap.exists) {
        return res.status(200).json(null);
      }

      return res.status(200).json(snap.data());
    }

    if (req.method === "POST") {
      const data = req.body;
      await reflectionsRef.set({ ...data, updatedAt: new Date().toISOString() }, { merge: true });
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error: any) {
    console.error("Reflections API error:", error);
    return res.status(500).json({ error: error.message });
  }
}
