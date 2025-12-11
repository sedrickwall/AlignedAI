// shared/ta.ts

export type MissionPriority = "low" | "medium" | "high";

export interface TaskAnalysis {
  type: 
    | "errand"
    | "admin"
    | "relationship"
    | "money"
    | "health"
    | "spiritual"
    | "distraction"
    | "maintenance"
    | "opportunity"
    | "other";

  urgency: "low" | "medium" | "high";
  emotional_weight: number;      // 1–10
  strategic_value: number;       // 1–10
  short_summary: string;
}

export interface MissionContext {
  dayMission: string;            // “Serve 3 men deeply…”
  bigThree: string[];            // Today’s Big 3 tasks
  impactLevel: number;           // 1–10 (how big today is)
  timeBudgetMinutes: number;     // available today
}

export interface MissionEvaluation {
  MKI: number;                   // mission killer index
  missionKiller: boolean;
  severity: "green" | "yellow" | "red";
  reason: string;
  recommendation: string;
  scriptureRefs: string[];       // e.g. ["Luke 10:38–42", "Eph 5:15–16"]
}

export interface TaskEvaluationResponse {
  taskAnalysis: TaskAnalysis;
  missionEvaluation: MissionEvaluation;
}
