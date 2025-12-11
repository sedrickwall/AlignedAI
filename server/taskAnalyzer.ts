// server/taskAnalyzer.ts
import type {
  TaskAnalysis,
  MissionContext,
  MissionEvaluation,
  TaskEvaluationResponse
} from "../shared/taskEval.js";

const HF_API_URL = "https://router.huggingface.co/hf-inference/models/mistralai/Mistral-7B-Instruct-v0.3";
const HF_TOKEN = process.env.HF_TOKEN;

if (!HF_TOKEN) {
  console.warn("[TaskAnalyzer] Missing HF_TOKEN - will use local analysis only.");
}

/**
 * Try HuggingFace API for task analysis
 */
async function analyzeTaskWithHF(task: string): Promise<TaskAnalysis | null> {
  if (!HF_TOKEN) return null;

  const prompt = `<s>[INST] You are a task classifier for Christian productivity. Classify this task and respond with ONLY valid JSON, no other text.

Task: "${task}"

Respond with this exact JSON structure:
{"type":"errand","urgency":"medium","emotional_weight":5,"strategic_value":5,"short_summary":"brief description"}

Where type is one of: errand, admin, relationship, money, health, spiritual, distraction, maintenance, opportunity, other
And urgency is: low, medium, or high
And emotional_weight and strategic_value are numbers 1-10 [/INST]</s>`;

  try {
    const res = await fetch(HF_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${HF_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ 
        inputs: prompt,
        parameters: {
          max_new_tokens: 150,
          return_full_text: false,
        }
      }),
    });

    if (!res.ok) {
      console.warn("[HF] Non-200 response:", res.status);
      return null;
    }

    const json = await res.json();
    const raw = Array.isArray(json) ? json[0]?.generated_text ?? "" : JSON.stringify(json);

    const match = raw.match(/\{[\s\S]*?\}/);
    if (!match) {
      console.warn("[HF] Could not parse JSON from response");
      return null;
    }

    const parsed = JSON.parse(match[0]);

    return {
      type: parsed.type ?? "other",
      urgency: parsed.urgency ?? "medium",
      emotional_weight: clampNumber(parsed.emotional_weight, 1, 10, 5),
      strategic_value: clampNumber(parsed.strategic_value, 1, 10, 5),
      short_summary: parsed.short_summary ?? task,
    };
  } catch (err) {
    console.warn("[HF] API error:", err);
    return null;
  }
}

/**
 * Keyword-based task classification (works offline, no API needed)
 */
function classifyTaskLocally(task: string): TaskAnalysis {
  const lowerTask = task.toLowerCase();
  
  const typePatterns: Record<string, string[]> = {
    spiritual: ["pray", "bible", "church", "worship", "devotion", "scripture", "faith", "god", "jesus", "meditation", "fasting", "sermon"],
    relationship: ["call", "meet", "visit", "text", "email", "friend", "family", "mom", "dad", "wife", "husband", "kid", "child", "lunch", "dinner", "coffee", "date", "love"],
    health: ["gym", "workout", "exercise", "run", "walk", "jog", "yoga", "sleep", "doctor", "dentist", "medicine", "eat", "diet", "water", "rest"],
    money: ["pay", "bill", "bank", "budget", "invest", "save", "buy", "purchase", "sell", "invoice", "expense", "income", "tax", "finance", "salary"],
    admin: ["file", "organize", "clean", "schedule", "plan", "review", "update", "fix", "maintain", "setup", "configure", "register", "renew", "cancel"],
    errand: ["grocery", "store", "shop", "pick up", "drop off", "mail", "post", "return", "drive", "rental", "gas", "dry clean", "laundry"],
    opportunity: ["launch", "start", "create", "build", "design", "write", "publish", "pitch", "present", "interview", "apply", "network", "grow"],
    distraction: ["scroll", "browse", "social media", "netflix", "youtube", "game", "binge", "random", "news"],
    maintenance: ["repair", "replace", "check", "inspect", "service", "backup", "clean up"],
  };

  let detectedType: TaskAnalysis["type"] = "other";
  for (const [type, keywords] of Object.entries(typePatterns)) {
    if (keywords.some(k => lowerTask.includes(k))) {
      detectedType = type as TaskAnalysis["type"];
      break;
    }
  }

  const urgentKeywords = ["urgent", "asap", "now", "today", "deadline", "emergency", "immediately", "critical"];
  const lowUrgencyKeywords = ["someday", "whenever", "maybe", "eventually", "later"];
  
  let urgency: "low" | "medium" | "high" = "medium";
  if (urgentKeywords.some(k => lowerTask.includes(k))) {
    urgency = "high";
  } else if (lowUrgencyKeywords.some(k => lowerTask.includes(k))) {
    urgency = "low";
  }

  const highEmotionalTypes = ["relationship", "spiritual", "health"];
  const emotional_weight = highEmotionalTypes.includes(detectedType) ? 7 : 
    detectedType === "distraction" ? 8 : 4;

  const strategicValues: Record<string, number> = {
    spiritual: 9,
    relationship: 8,
    opportunity: 8,
    health: 7,
    money: 6,
    admin: 5,
    errand: 4,
    maintenance: 4,
    distraction: 2,
    other: 5,
  };
  const strategic_value = strategicValues[detectedType] || 5;

  return {
    type: detectedType,
    urgency,
    emotional_weight,
    strategic_value,
    short_summary: task,
  };
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
    mission.bigThree.length > 0 && mission.bigThree.some((goal) =>
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
    scriptureRefs.push("Luke 10:38-42", "Ephesians 5:15-16");
  } else if (severity === "yellow") {
    scriptureRefs.push("1 Corinthians 10:23", "Proverbs 4:25-27");
  } else {
    scriptureRefs.push("Colossians 3:23");
  }

  const reason =
    severity === "red"
      ? "This task significantly pulls you away from today's assignment and likely reduces Kingdom impact."
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
 * Tries HuggingFace API first, falls back to local analysis if it fails
 */
export async function evaluateTaskAgainstMission(
  task: string,
  mission: MissionContext
): Promise<TaskEvaluationResponse> {
  // Try API first, fall back to local
  let taskAnalysis = await analyzeTaskWithHF(task);
  
  if (!taskAnalysis) {
    console.log("[TaskAnalyzer] Using local fallback analysis");
    taskAnalysis = classifyTaskLocally(task);
  } else {
    console.log("[TaskAnalyzer] Using HuggingFace API analysis");
  }

  const missionEvaluation = evaluateMissionImpact(taskAnalysis, mission);
  return { taskAnalysis, missionEvaluation };
}
