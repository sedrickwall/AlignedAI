import type { VercelRequest, VercelResponse } from "@vercel/node";
import { evaluateTaskAgainstMission } from "../server/taskAnalyzer";
import type { MissionContext } from "../shared/taskEval";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const { task, mission } = req.body as {
      task: string;
      mission: MissionContext;
    };

    if (!task || !mission) {
      return res.status(400).json({ error: "task and mission required" });
    }

    const result = await evaluateTaskAgainstMission(task, mission);
    return res.status(200).json(result);
  } catch (error: any) {
    console.error("Error evaluating task:", error);
    return res.status(500).json({ error: error.message || "Server error" });
  }
}
// api/evaluate-task.ts