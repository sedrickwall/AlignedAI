import { VerseCard } from "./verse-card";
import { AlignmentCard } from "./alignment-card";
import { ScheduleCard } from "./schedule-card";
import { ResetCard } from "./reset-card";
import { AISuggestionCard } from "./ai-suggestion-card";
import type { EnergyLevel, Task, TimeBlock } from "@shared/schema";

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
