import type { VercelRequest, VercelResponse } from "@vercel/node";
import * as admin from "firebase-admin";
import { getAuth } from "firebase-admin/auth";

if (!admin.apps.length) {
  const key = process.env.FIREBASE_ADMIN_KEY;
  if (key) {
    const sa = key.trim().startsWith("{") ? JSON.parse(key) : JSON.parse(Buffer.from(key, "base64").toString("utf-8"));
    if (sa.private_key) sa.private_key = sa.private_key.replace(/\\n/g, "\n");
    admin.initializeApp({ credential: admin.credential.cert(sa) });
  }
}

interface MissionContext {
  identity?: string;
  purpose?: string;
  pillars?: string[];
  vision?: string;
}

function evaluateTask(task: string, mission: MissionContext): { alignment: string; score: number; reasoning: string } {
  const taskLower = task.toLowerCase();
  const missionKeywords: string[] = [];
  
  if (mission.identity) missionKeywords.push(...mission.identity.toLowerCase().split(/\s+/));
  if (mission.purpose) missionKeywords.push(...mission.purpose.toLowerCase().split(/\s+/));
  if (mission.pillars) mission.pillars.forEach(p => missionKeywords.push(...p.toLowerCase().split(/\s+/)));
  if (mission.vision) missionKeywords.push(...mission.vision.toLowerCase().split(/\s+/));
  
  const matches = missionKeywords.filter(kw => kw.length > 3 && taskLower.includes(kw));
  const score = Math.min(100, matches.length * 20);
  
  let alignment = "low";
  if (score >= 60) alignment = "high";
  else if (score >= 30) alignment = "medium";
  
  return {
    alignment,
    score,
    reasoning: matches.length > 0 
      ? `Task aligns with: ${matches.slice(0, 3).join(", ")}` 
      : "Consider how this task connects to your mission"
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) return res.status(401).json({ error: "Unauthorized" });
    await getAuth().verifyIdToken(authHeader.split("Bearer ")[1]);

    const { task, mission } = req.body as { task: string; mission: MissionContext };
    if (!task || !mission) return res.status(400).json({ error: "task and mission required" });

    const result = evaluateTask(task, mission);
    return res.status(200).json(result);
  } catch (error: any) {
    console.error("Evaluate task error:", error);
    return res.status(500).json({ error: error.message });
  }
}
