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
    const tasks = snap.data()?.tasks || [];
    
    const newTask = {
      id: `task-${Date.now()}`,
      title: req.body.title || "Untitled Task",
      completed: false,
      createdAt: new Date().toISOString()
    };
    
    tasks.push(newTask);
    await ref.set({ tasks }, { merge: true });
    
    return res.status(200).json(newTask);
  } catch (error: any) {
    console.error("Create task error:", error);
    return res.status(500).json({ error: error.message });
  }
}
