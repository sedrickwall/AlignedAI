import { useState } from "react";
import { VerseCard } from "./verse-card";
import { AlignmentCard } from "./alignment-card";
import { ScheduleCard } from "./schedule-card";
import { ResetCard } from "./reset-card";
import { AISuggestionCard } from "./ai-suggestion-card";
import type { EnergyLevel, Task, TimeBlock } from "@shared/schema";
import { useTaskEvaluator, type TaskEvaluationResponse } from "@/hooks/useTaskEvaluator";
import type { MissionContext } from "../../../shared/taskEval.ts";


interface AISuggestion {
  suggestion: string;
  reasoning: string;
  focusPillar: string;
}

interface DailyDashboardProps {
  verse: { text: string; reference: string };
  energyLevel: EnergyLevel;
  onEnergyChange: (level: EnergyLevel) => void;
  tasks: Task[];
  onTaskToggle: (taskId: string) => void;
  onTaskAdd: (title: string) => void;
  onTaskUpdate: (taskId: string, title: string) => void;
  onTaskDelete: (taskId: string) => void;
  schedule: TimeBlock[];
  onBlockAdd: (startTime: string, endTime: string, activity: string) => void;
  onBlockUpdate: (blockId: string, startTime: string, endTime: string, activity: string) => void;
  onBlockDelete: (blockId: string) => void;
  onReset: () => void;
  aiSuggestion?: AISuggestion;
  isAILoading: boolean;
  onRefreshAI: () => void;
  isAIRefreshing: boolean;
  hasAIError: boolean;
  newlyCreatedTask?: Task | null;
  onClearNewTask?: () => void;
}

export function DailyDashboard({
  verse,
  energyLevel,
  onEnergyChange,
  tasks,
  onTaskToggle,
  onTaskAdd,
  onTaskUpdate,
  onTaskDelete,
  schedule,
  onBlockAdd,
  onBlockUpdate,
  onBlockDelete,
  onReset,
  aiSuggestion,
  isAILoading,
  onRefreshAI,
  isAIRefreshing,
  hasAIError,
  newlyCreatedTask,
  onClearNewTask,
}: DailyDashboardProps) {
  return (
    <section className="mb-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        <div className="space-y-4">
          <VerseCard text={verse.text} reference={verse.reference} />
          <AISuggestionCard
            suggestion={aiSuggestion?.suggestion || ""}
            reasoning={aiSuggestion?.reasoning || ""}
            focusPillar={aiSuggestion?.focusPillar || ""}
            isLoading={isAILoading}
            onRefresh={onRefreshAI}
            isRefreshing={isAIRefreshing}
            hasError={hasAIError}
          />
          <AlignmentCard
            energyLevel={energyLevel}
            onEnergyChange={onEnergyChange}
            tasks={tasks}
            onTaskToggle={onTaskToggle}
            onTaskAdd={onTaskAdd}
            onTaskUpdate={onTaskUpdate}
            onTaskDelete={onTaskDelete}
            newlyCreatedTask={newlyCreatedTask}
            onClearNewTask={onClearNewTask}
          />
        </div>
        <div className="space-y-4">
          <ScheduleCard
            schedule={schedule}
            onBlockAdd={onBlockAdd}
            onBlockUpdate={onBlockUpdate}
            onBlockDelete={onBlockDelete}
          />
          <ResetCard onReset={onReset} />
        </div>
      </div>
    </section>
  );
}

const missionContext: MissionContext = {
  dayMission: "Serve the men God has given me today with depth, not distraction.",
  bigThree: [
    "Prepare Men on Mission message",
    "Deep work on Nucleus dashboard",
    "Family connection evening",
  ],
  impactLevel: 8,
  timeBudgetMinutes: 480,
};

function TaskAdder({ onTaskAdd }: { onTaskAdd: (task: string) => void }) {
  const [taskText, setTaskText] = useState("");
  const [evaluation, setEvaluation] = useState<null | TaskEvaluationResponse>(null);

  const { evaluateTask, isEvaluating, error } = useTaskEvaluator();

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskText.trim()) return;

    const result = await evaluateTask(taskText.trim(), missionContext);
    if (!result) return;

    setEvaluation(result);

    if (result.missionEvaluation.missionKiller) {
      // show warning but DO NOT auto-add
      return;
    }

    onTaskAdd(taskText.trim());
    setTaskText("");
  };

  const handleForceAdd = () => {
    onTaskAdd(taskText.trim());
    setTaskText("");
  };

  return (
    <div className="space-y-3">
      <form onSubmit={handleAddTask} className="flex gap-2">
        <input
          className="flex-1 border rounded px-2 py-1"
          placeholder="Add a task…"
          value={taskText}
          onChange={(e) => setTaskText(e.target.value)}
        />
        <button
          type="submit"
          className="px-3 py-1 rounded bg-primary text-white text-sm"
          disabled={isEvaluating}
        >
          {isEvaluating ? "Checking…" : "Add"}
        </button>
      </form>

      {error && <p className="text-xs text-red-500">{error}</p>}

      {evaluation && (
        <div className="border rounded p-3 text-xs space-y-1">
          <p>
            <strong>Summary:</strong> {evaluation.taskAnalysis.short_summary}
          </p>
          <p>
            <strong>Mission Score:</strong>{" "}
            {evaluation.missionEvaluation.missionKiller
              ? "🚫 Mission Killer"
              : "✅ Mission-aligned"}
          </p>
          <p>
            <strong>Reason:</strong> {evaluation.missionEvaluation.reason}
          </p>
          <p>
            <strong>Recommendation:</strong>{" "}
            {evaluation.missionEvaluation.recommendation}
          </p>
          <p>
            <strong>Scripture:</strong>{" "}
            {evaluation.missionEvaluation.scriptureRefs.join(", ")}
          </p>

          {evaluation.missionEvaluation.missionKiller && (
            <button
              type="button"
              className="mt-2 text-xs px-3 py-1 rounded border"
              onClick={handleForceAdd}
            >
              Add anyway (override)
            </button>
          )}
        </div>
      )}
    </div>
  );
}
