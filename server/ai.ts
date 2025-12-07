import OpenAI from "openai";
import type { 
  EnergyLevel, 
  Task, 
  Pillar, 
  IdentityProfile, 
  PurposeProfile, 
  SeasonPillar, 
  CapacityProfile 
} from "@shared/schema";

let openaiClient: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    openaiClient = new OpenAI();
  }
  return openaiClient;
}

interface PrioritizationInput {
  energyLevel: EnergyLevel;
  tasks: Task[];
  pillars: Pillar[];
}

interface AISuggestion {
  suggestion: string;
  reasoning: string;
  focusPillar: string;
}

export async function getAIPrioritization(input: PrioritizationInput): Promise<AISuggestion> {
  const energyLevel = input.energyLevel || "normal";
  const tasks = input.tasks || [];
  const pillars = input.pillars || [];

  const incompleteTasks = tasks.filter(t => !t.completed);
  
  const pillarSummary = pillars.length > 0 
    ? pillars.map(p => {
        const progress = p.target > 0 ? Math.round((p.current / p.target) * 100) : 0;
        return `${p.name}: ${p.current}/${p.target} hours (${progress}% complete)`;
      }).join("\n")
    : "No pillars set yet.";

  const taskList = incompleteTasks.length > 0 
    ? incompleteTasks.map((t, i) => `${i + 1}. ${t.title}`).join("\n")
    : "No tasks set for today yet.";

  const lowestPillar = pillars.length > 0 
    ? pillars.reduce((lowest, p) => {
        const lowestProgress = lowest.target > 0 ? lowest.current / lowest.target : 1;
        const currentProgress = p.target > 0 ? p.current / p.target : 1;
        return currentProgress < lowestProgress ? p : lowest;
      }, pillars[0])
    : null;

  const prompt = `You are a faith-centered productivity coach helping a multi-gifted woman align her day with her calling. 

Current context:
- Energy level: ${energyLevel}
- Day of week: ${new Date().toLocaleDateString('en-US', { weekday: 'long' })}

Weekly pillar progress:
${pillarSummary}

Today's tasks:
${taskList}

Based on this context, provide brief, encouraging guidance in JSON format:
{
  "suggestion": "A 1-2 sentence actionable suggestion for what to focus on based on energy and pillar balance",
  "reasoning": "A brief explanation of why this focus makes sense right now",
  "focusPillar": "The name of the pillar that needs the most attention"
}

Consider:
- If energy is low, suggest gentler activities or shorter focus blocks
- If energy is high, suggest tackling challenging deep work
- Prioritize pillars that are behind their targets
- Keep the tone warm, supportive, and faith-aligned`;

  try {
    const response = await getOpenAIClient().chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      max_tokens: 300,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from AI");
    }

    const parsed = JSON.parse(content);
    const defaultPillarName = lowestPillar?.name || "Faith";
    return {
      suggestion: parsed.suggestion || "Focus on your highest priority task with intention.",
      reasoning: parsed.reasoning || "Start with what matters most to you today.",
      focusPillar: parsed.focusPillar || defaultPillarName,
    };
  } catch (error) {
    console.error("AI prioritization error:", error);
    const defaultPillarName = lowestPillar?.name || "Faith";
    return {
      suggestion: energyLevel === "low" 
        ? "Take it gently today. Focus on one small task that moves you forward."
        : energyLevel === "high"
        ? "Channel your energy into deep, focused work on your most important task."
        : "Stay steady and tackle your priorities one at a time.",
      reasoning: `With ${energyLevel} energy, pace yourself accordingly.`,
      focusPillar: defaultPillarName,
    };
  }
}

// Monetization Engine Types
interface MonetizationInput {
  identity: IdentityProfile | null;
  purpose: PurposeProfile | null;
  seasonPillars: SeasonPillar[];
  capacity: CapacityProfile | null;
}

export interface MonetizationResult {
  primaryPath: string;
  rationale: {
    giftAlignment: number;
    skillAlignment: number;
    impactPotential: number;
    effortLevel: number;
    explanation: string;
  };
  monthPlans: {
    month1: { focus: string; milestones: string[]; };
    month2: { focus: string; milestones: string[]; };
    month3: { focus: string; milestones: string[]; };
  };
  weeklyActions: string[];
  secondaryOpportunities: string[];
  deferredItems: string[];
  encouragement: string;
}

export async function generateMonetizationPlan(input: MonetizationInput): Promise<MonetizationResult> {
  const { identity, purpose, seasonPillars, capacity } = input;

  const gifts = identity?.gifts?.join(", ") || "Not specified";
  const skills = identity?.skills?.join(", ") || "Not specified";
  const interests = identity?.interests?.join(", ") || "Not specified";
  const passions = identity?.passions?.join(", ") || "Not specified";
  const strongestTalent = identity?.strongestTalent || "Not specified";
  
  const whoToBlessing = purpose?.whoToBlessing?.join(", ") || "Not specified";
  const purposeStatement = purpose?.purposeStatement || "Not specified";
  
  const pillarsText = seasonPillars.length > 0
    ? seasonPillars.map(p => `${p.name} (${p.weeklyHoursBudget || 0}h/week)`).join(", ")
    : "Not specified";
  
  const weeklyHours = capacity?.weeklyAvailableHours || 40;
  const bandwidth = capacity?.emotionalBandwidth || "medium";
  const seasonOfLife = capacity?.seasonOfLife || "Not specified";

  const prompt = `You are a faith-centered business strategist helping a multi-gifted woman create a sustainable income path aligned with her calling.

User Profile:
- Gifts: ${gifts}
- Skills: ${skills}
- Interests: ${interests}
- Passions: ${passions}
- Strongest Talent: ${strongestTalent}
- Who they want to bless: ${whoToBlessing}
- Purpose Statement: ${purposeStatement}
- Season Pillars: ${pillarsText}
- Weekly Available Hours: ${weeklyHours}
- Emotional Bandwidth: ${bandwidth}
- Season of Life: ${seasonOfLife}

Based on this profile, create a 90-day monetization plan. Return JSON:
{
  "primaryPath": "The ONE income path they should focus on (e.g., 'Coaching program for busy moms', 'Digital course on wellness')",
  "rationale": {
    "giftAlignment": 1-10 score,
    "skillAlignment": 1-10 score,
    "impactPotential": 1-10 score,
    "effortLevel": 1-10 (lower is better for their capacity),
    "explanation": "2-3 sentences on why this path fits them"
  },
  "monthPlans": {
    "month1": {
      "focus": "Foundation building theme",
      "milestones": ["3-4 specific milestones"]
    },
    "month2": {
      "focus": "Audience building theme",
      "milestones": ["3-4 specific milestones"]
    },
    "month3": {
      "focus": "Launch/revenue theme",
      "milestones": ["3-4 specific milestones"]
    }
  },
  "weeklyActions": ["5-7 specific revenue-focused weekly actions they should take"],
  "secondaryOpportunities": ["2-3 future opportunities to explore after primary path is established"],
  "deferredItems": ["2-3 good ideas to save for later, not now"],
  "encouragement": "A faith-based encouraging message about their journey (2-3 sentences)"
}

Consider their capacity constraints, emotional bandwidth, and season of life. Be realistic and specific.`;

  try {
    const response = await getOpenAIClient().chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      max_tokens: 1500,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from AI");
    }

    return JSON.parse(content) as MonetizationResult;
  } catch (error) {
    console.error("Monetization AI error:", error);
    return {
      primaryPath: "Digital products aligned with your strongest talent",
      rationale: {
        giftAlignment: 7,
        skillAlignment: 7,
        impactPotential: 8,
        effortLevel: 5,
        explanation: "Based on your profile, creating digital products allows you to serve many while honoring your capacity constraints."
      },
      monthPlans: {
        month1: {
          focus: "Foundation & Clarity",
          milestones: ["Define your ideal audience", "Outline your unique value proposition", "Create a simple landing page", "Start building an email list"]
        },
        month2: {
          focus: "Content & Connection",
          milestones: ["Create valuable free content", "Engage with your target audience", "Gather feedback and testimonials", "Refine your offering"]
        },
        month3: {
          focus: "Launch & Revenue",
          milestones: ["Finalize your product/service", "Plan your launch strategy", "Make your first sales", "Celebrate and iterate"]
        }
      },
      weeklyActions: [
        "Spend 30 minutes connecting with potential clients",
        "Create one piece of valuable content",
        "Review and update your goals",
        "Track your progress and wins",
        "Rest and recharge intentionally"
      ],
      secondaryOpportunities: [
        "Group coaching programs",
        "Speaking engagements",
        "Partnerships with aligned businesses"
      ],
      deferredItems: [
        "Complex membership sites",
        "Multiple product lines",
        "Podcast or video series"
      ],
      encouragement: "God has uniquely equipped you for this journey. Trust the gifts He's placed in you, take one step at a time, and watch how He multiplies your efforts for His glory."
    };
  }
}

// Task Discernment Engine Types
interface TaskDiscernmentInput {
  task: Task;
  identity: IdentityProfile | null;
  purpose: PurposeProfile | null;
  seasonPillars: SeasonPillar[];
  capacity: CapacityProfile | null;
  currentEnergyLevel: EnergyLevel;
}

export interface TaskDiscernmentResult {
  pillarAlignment: string;
  monetizationAlignment: boolean;
  purposeAlignment: boolean;
  impactScore: number;
  effortScore: number;
  energyRequirement: "high-brain" | "low-brain";
  decision: "do_today" | "do_this_week" | "next_week" | "backlog" | "assign" | "reject";
  bestTimeSlot: string;
  assignTo: string | null;
  peaceCheck: "aligned" | "stressed" | "unclear";
  reasoning: string;
}

export async function evaluateTask(input: TaskDiscernmentInput): Promise<TaskDiscernmentResult> {
  const { task, identity, purpose, seasonPillars, capacity, currentEnergyLevel } = input;

  const pillarsText = seasonPillars.map(p => p.name).join(", ");
  const purposeStatement = purpose?.purposeStatement || "Not specified";
  const peakHours = (capacity?.energyWindows as { peakHours?: string })?.peakHours || "Morning";
  const bandwidth = capacity?.emotionalBandwidth || "medium";

  const prompt = `You are a faith-centered productivity advisor helping evaluate if a task aligns with the user's calling and capacity.

Task: "${task.title}"

User Context:
- Season Pillars: ${pillarsText}
- Purpose Statement: ${purposeStatement}
- Current Energy Level: ${currentEnergyLevel}
- Emotional Bandwidth: ${bandwidth}
- Peak Energy Hours: ${peakHours}

Evaluate this task and return JSON:
{
  "pillarAlignment": "Name of the pillar this supports (or 'none')",
  "monetizationAlignment": true/false if it supports income generation,
  "purposeAlignment": true/false if it aligns with their purpose,
  "impactScore": 1-10 rating of potential impact,
  "effortScore": 1-10 rating of effort required,
  "energyRequirement": "high-brain" or "low-brain",
  "decision": "do_today", "do_this_week", "next_week", "backlog", "assign", or "reject",
  "bestTimeSlot": "When to do this based on energy requirements",
  "assignTo": "Who else could do this (or null)",
  "peaceCheck": "aligned", "stressed", or "unclear",
  "reasoning": "Brief explanation of the recommendation"
}

Consider their current energy level and emotional bandwidth when making recommendations.`;

  try {
    const response = await getOpenAIClient().chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      max_tokens: 500,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from AI");
    }

    return JSON.parse(content) as TaskDiscernmentResult;
  } catch (error) {
    console.error("Task discernment AI error:", error);
    return {
      pillarAlignment: seasonPillars[0]?.name || "none",
      monetizationAlignment: false,
      purposeAlignment: true,
      impactScore: 5,
      effortScore: 5,
      energyRequirement: "low-brain",
      decision: "do_this_week",
      bestTimeSlot: "When energy allows",
      assignTo: null,
      peaceCheck: "unclear",
      reasoning: "Unable to fully evaluate. Consider if this task moves you toward your goals."
    };
  }
}
