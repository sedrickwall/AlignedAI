import type { VercelRequest, VercelResponse } from "@vercel/node";
import { initAdmin } from "./_lib/initAdmin";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

initAdmin();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) return res.status(401).json({ error: "Unauthorized" });
    const decoded = await getAuth().verifyIdToken(authHeader.split("Bearer ")[1]);
    const db = getFirestore();
    const ref = db.collection("daily").doc(decoded.uid);

    const snap = await ref.get();
    const schedule = snap.data()?.schedule || [];
    
    const newBlock = {
      id: `block-${Date.now()}`,
      startTime: req.body.startTime || "",
      endTime: req.body.endTime || "",
      activity: req.body.activity || "Untitled Activity",
      createdAt: new Date().toISOString()
    };
    
    schedule.push(newBlock);
    await ref.set({ schedule }, { merge: true });
    
    return res.status(200).json(newBlock);
  } catch (error: any) {
    console.error("Create schedule error:", error);
    return res.status(500).json({ error: error.message });
  }
}
