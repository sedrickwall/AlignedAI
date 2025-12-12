import type { VercelRequest, VercelResponse } from "@vercel/node";
import { initAdmin } from "../_lib/initAdmin";
import { getAuth } from "firebase-admin/auth";

initAdmin();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) return res.status(401).json({ error: "Unauthorized" });
    await getAuth().verifyIdToken(authHeader.split("Bearer ")[1]);

    return res.status(200).json({
      suggestion: "Stay steady and tackle your priorities one at a time.",
      reasoning: "Focus on what matters most today.",
      focusPillar: "Faith"
    });
  } catch (error: any) {
    console.error("AI Prioritize error:", error);
    return res.status(500).json({ error: error.message });
  }
}
