import { PillarsCard } from "./pillars-card";
import { WeeklyFocusCard } from "./weekly-focus-card";
import { ReflectionCard } from "./reflection-card";
import type { Pillar, Reflection } from "@shared/schema";

interface WeeklyOverviewProps {
  pillars: Pillar[];
  focusStatement: string;
  topFive: string[];
  onPillarUpdate?: (pillarId: string, current: number, target: number) => void;
  reflection: Reflection | null;
  onReflectionSave: (data: {
    wins?: string;
    challenges?: string;
    gratitude?: string;
    nextWeekIntention?: string;
  }) => void;
  isReflectionSaving?: boolean;
}

export function WeeklyOverview({ 
  pillars, 
  focusStatement, 
  topFive, 
  onPillarUpdate,
  reflection,
  onReflectionSave,
  isReflectionSaving,
}: WeeklyOverviewProps) {
  return (
    <section className="space-y-4 lg:space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        <PillarsCard pillars={pillars} onPillarUpdate={onPillarUpdate} />
        <WeeklyFocusCard focusStatement={focusStatement} topFive={topFive} />
      </div>
      <ReflectionCard 
        reflection={reflection} 
        onSave={onReflectionSave}
        isSaving={isReflectionSaving}
      />
    </section>
  );
}
