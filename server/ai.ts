import OpenAI from "openai";
import type { EnergyLevel, Task, Pillar } from "@shared/schema";

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
