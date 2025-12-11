// client/src/hooks/useTaskEvaluator.ts
import { useState } from "react";
import type { MissionContext, TaskEvaluationResponse } from "../../../shared/ta";

export function useTaskEvaluator() {
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const evaluateTask = async (task: string, mission: MissionContext): Promise<TaskEvaluationResponse | null> => {
    setIsEvaluating(true);
    setError(null);
    try {
      const res = await fetch("/api/evaluate-task", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task, mission }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Evaluation failed");
      }

      const data = (await res.json()) as TaskEvaluationResponse;
      return data;
    } catch (err: any) {
      console.error("[useTaskEvaluator]", err);
      setError(err?.message ?? "Unknown error");
      return null;
    } finally {
      setIsEvaluating(false);
    }
  };

  return { evaluateTask, isEvaluating, error };
}
