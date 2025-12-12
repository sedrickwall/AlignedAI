import type { VercelRequest, VercelResponse } from "@vercel/node";
import { initAdmin } from "../utils/initAdmin.js";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

initAdmin();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, PATCH, DELETE, OPTIONS");
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

    const { id } = req.query;
    const taskId = Array.isArray(id) ? id[0] : id;

    const db = getFirestore();
    const dailyRef = db.collection("daily").doc(uid);

    if (req.method === "PATCH") {
      const { completed } = req.body;
      
      const snap = await dailyRef.get();
      const data = snap.data() || { tasks: [] };
      const tasks = data.tasks || [];
      
      const updatedTasks = tasks.map((task: any) => 
        task.id === taskId ? { ...task, completed } : task
      );
      
      await dailyRef.set({ tasks: updatedTasks }, { merge: true });
      
      return res.status(200).json({ success: true });
    }

    if (req.method === "DELETE") {
      const snap = await dailyRef.get();
      const data = snap.data() || { tasks: [] };
      const tasks = data.tasks || [];
      
      const filteredTasks = tasks.filter((task: any) => task.id !== taskId);
      
      await dailyRef.set({ tasks: filteredTasks }, { merge: true });
      
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error: any) {
    console.error("Task API error:", error);
    return res.status(500).json({ error: error.message });
  }
}
