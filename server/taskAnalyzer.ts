// server/taskAnalyzer.ts
import type {
  TaskAnalysis,
  MissionContext,
  MissionEvaluation,
  TaskEvaluationResponse
} from "../shared/taskEval.js";


const HF_API_URL = "https://router.huggingface.co/hf-inference/models/google/flan-t5-base";
const HF_TOKEN = process.env.HF_TOKEN;

if (!HF_TOKEN) {
  console.warn("[TaskAnalyzer] Missing HF_TOKEN in environment.");
}

/**
 * Call HuggingFace to semantically analyze the task.
 */
export async function analyzeTaskWithHF(task: string): Promise<TaskAnalysis> {
  const prompt = `
You are an assistant that classifies tasks for Christian productivity.
Return JSON ONLY. No explanation, no text, just JSON.

Task: "${task}"

Respond strictly in this JSON shape:
{
  "type": "errand | admin | relationship | money | health | spiritual | distraction | maintenance | opportunity | other",
  "urgency": "low | medium | high",
  "emotional_weight": 1-10,
  "strategic_value": 1-10,
  "short_summary": "one sentence"
}
  `.trim();

  const res = await fetch(HF_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${HF_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ inputs: prompt }),
  });

  if (!res.ok) {
    console.error("[HF] Non-200", await res.text());
    throw new Error("Task analysis model failed");
  }

  const json = await res.json();

  // HF often returns [{ generated_text: "..." }]
  const raw = Array.isArray(json) ? json[0]?.generated_text ?? "" : JSON.stringify(json);

  // Try to extract JSON blob safely
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) {
    console.warn("[HF] Could not parse JSON, raw:", raw);
    throw new Error("Model response not parseable as JSON");
  }

  const parsed = JSON.parse(match[0]);

  // Normalize to our type
  const taskAnalysis: TaskAnalysis = {
    type: parsed.type ?? "other",
    urgency: parsed.urgency ?? "low",
    emotional_weight: clampNumber(parsed.emotional_weight, 1, 10, 3),
    strategic_value: clampNumber(parsed.strategic_value, 1, 10, 5),
    short_summary: parsed.short_summary ?? task,
  };

  return taskAnalysis;
}

function clampNumber(
  value: number | string | undefined,
  min: number,
  max: number,
  fallback: number
): number {
  const n = typeof value === "string" ? parseFloat(value) : value;
  if (typeof n !== "number" || Number.isNaN(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

/**
 * Mission-Killer Engine: scoring logic.
 */
export function evaluateMissionImpact(
  taskAnalysis: TaskAnalysis,
  mission: MissionContext
): MissionEvaluation {
  const { strategic_value, urgency, emotional_weight, type, short_summary } = taskAnalysis;

  const urgencyScore = urgency === "high" ? 7 : urgency === "medium" ? 4 : 2;

  const alignedWithBigThree =
    mission.bigThree.some((goal) =>
      goal.toLowerCase().includes(short_summary.toLowerCase()) ||
      short_summary.toLowerCase().includes(goal.toLowerCase())
    );

  const alignmentScore = alignedWithBigThree ? 9 : strategic_value;

  const delayCostBase =
    type === "distraction"
      ? 9
      : type === "opportunity"
      ? 4
      : 6 - strategic_value / 2;

  const delayCost = delayCostBase + urgencyScore * 0.3;

  const drain = emotional_weight >= 7 ? emotional_weight : emotional_weight * 0.7;

  const oppLoss = mission.impactLevel * (1 - strategic_value / 10);

  const MKI = delayCost + drain + oppLoss - (alignmentScore + strategic_value);

  let severity: "green" | "yellow" | "red" = "green";
  if (MKI >= 8) severity = "red";
  else if (MKI >= 4) severity = "yellow";

  const scriptureRefs: string[] = [];

  if (severity === "red") {
    scriptureRefs.push("Luke 10:38–42", "Ephesians 5:15–16");
  } else if (severity === "yellow") {
    scriptureRefs.push("1 Corinthians 10:23", "Proverbs 4:25–27");
  } else {
    scriptureRefs.push("Colossians 3:23");
  }

  const reason =
    severity === "red"
      ? "This task significantly pulls you away from today’s assignment and likely reduces Kingdom impact."
      : severity === "yellow"
      ? "This task could be good, but may compete with your main assignment. Use discernment."
      : "This task aligns well with your mission or has manageable cost.";

  const recommendation =
    severity === "red"
      ? "Defer, delegate, or drop this. Protect your mission and focus on your Big 3."
      : severity === "yellow"
      ? "Consider doing this only after your Big 3 are complete, or shrinking its scope."
      : "Proceed with peace. Schedule it in a realistic slot.";

  return {
    MKI,
    missionKiller: MKI >= 4,
    severity,
    reason,
    recommendation,
    scriptureRefs,
  };
}

/**
 * Full pipeline: Task text + mission → analysis + evaluation
 */
export async function evaluateTaskAgainstMission(
  task: string,
  mission: MissionContext
): Promise<TaskEvaluationResponse> {
  const taskAnalysis = await analyzeTaskWithHF(task);
  const missionEvaluation = evaluateMissionImpact(taskAnalysis, mission);
  return { taskAnalysis, missionEvaluation };
}
