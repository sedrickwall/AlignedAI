import type { VercelRequest, VercelResponse } from "@vercel/node";
import { initAdmin } from "../_lib/initAdmin";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

initAdmin();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, PATCH, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "PATCH") return res.status(405).json({ error: "Method not allowed" });

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) return res.status(401).json({ error: "Unauthorized" });
    const decoded = await getAuth().verifyIdToken(authHeader.split("Bearer ")[1]);
    const pillarId = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;
    const db = getFirestore();
    const ref = db.collection("weekly").doc(decoded.uid);

    const snap = await ref.get();
    const pillars = (snap.data()?.pillars || []).map((p: any) => 
      p.id === pillarId 
        ? { 
            ...p, 
            current: req.body.current ?? p.current,
            target: req.body.target ?? p.target,
            updatedAt: new Date().toISOString() 
          } 
        : p
    );
    
    await ref.set({ pillars }, { merge: true });
    return res.status(200).json({ success: true });
  } catch (error: any) {
    console.error("Pillar API error:", error);
    return res.status(500).json({ error: error.message });
  }
}
