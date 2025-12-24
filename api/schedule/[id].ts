import type { VercelRequest, VercelResponse } from "@vercel/node";
import { initAdmin } from "../_lib/initAdmin";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

initAdmin();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, PATCH, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) return res.status(401).json({ error: "Unauthorized" });
    const decoded = await getAuth().verifyIdToken(authHeader.split("Bearer ")[1]);
    const blockId = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;
    const db = getFirestore();
    const ref = db.collection("daily").doc(decoded.uid);

    if (req.method === "PATCH") {
      const snap = await ref.get();
      const schedule = (snap.data()?.schedule || []).map((b: any) => 
        b.id === blockId 
          ? { ...b, ...req.body, updatedAt: new Date().toISOString() } 
          : b
      );
      await ref.set({ schedule }, { merge: true });
      return res.status(200).json({ success: true });
    }
    
    if (req.method === "DELETE") {
      const snap = await ref.get();
      const schedule = (snap.data()?.schedule || []).filter((b: any) => b.id !== blockId);
      await ref.set({ schedule }, { merge: true });
      return res.status(200).json({ success: true });
    }
    
    return res.status(405).json({ error: "Method not allowed" });
  } catch (error: any) {
    console.error("Schedule API error:", error);
    return res.status(500).json({ error: error.message });
  }
}
