import { VerseCard } from "./verse-card";
import { AlignmentCard } from "./alignment-card";
import { ScheduleCard } from "./schedule-card";
import { ResetCard } from "./reset-card";
import type { EnergyLevel, Task, TimeBlock } from "@shared/schema";

interface DailyDashboardProps {
  verse: { text: string; reference: string };
  energyLevel: EnergyLevel;
  onEnergyChange: (level: EnergyLevel) => void;
  tasks: Task[];
  onTaskToggle: (taskId: string) => void;
  schedule: TimeBlock[];
  onReset: () => void;
}

export function DailyDashboard({
  verse,
  energyLevel,
  onEnergyChange,
  tasks,
  onTaskToggle,
  schedule,
  onReset,
}: DailyDashboardProps) {
  return (
    <section className="mb-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        <div className="space-y-4">
          <VerseCard text={verse.text} reference={verse.reference} />
          <AlignmentCard
            energyLevel={energyLevel}
            onEnergyChange={onEnergyChange}
            tasks={tasks}
            onTaskToggle={onTaskToggle}
          />
        </div>
        <div className="space-y-4">
          <ScheduleCard schedule={schedule} />
          <ResetCard onReset={onReset} />
        </div>
      </div>
    </section>
  );
}
