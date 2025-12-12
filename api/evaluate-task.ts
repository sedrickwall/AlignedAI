import type { VercelRequest, VercelResponse } from "@vercel/node";
import { initAdmin } from "./_lib/initAdmin";
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
    await getAuth().verifyIdToken(authHeader.split("Bearer ")[1]);

    const { task, mission } = req.body;
    if (!task || !mission) return res.status(400).json({ error: "task and mission required" });

    const taskLower = task.toLowerCase();
    const keywords: string[] = [];
    if (mission.identity) keywords.push(...mission.identity.toLowerCase().split(/\s+/));
    if (mission.purpose) keywords.push(...mission.purpose.toLowerCase().split(/\s+/));
    if (mission.pillars) mission.pillars.forEach((p: string) => keywords.push(...p.toLowerCase().split(/\s+/)));
    
    const matches = keywords.filter(kw => kw.length > 3 && taskLower.includes(kw));
    const score = Math.min(100, matches.length * 20);
    
    return res.status(200).json({
      alignment: score >= 60 ? "high" : score >= 30 ? "medium" : "low",
      score,
      reasoning: matches.length > 0 ? `Aligns with: ${matches.slice(0, 3).join(", ")}` : "Consider how this connects to your mission"
    });
  } catch (error: any) {
    console.error("Evaluate task error:", error);
    return res.status(500).json({ error: error.message });
  }
}
