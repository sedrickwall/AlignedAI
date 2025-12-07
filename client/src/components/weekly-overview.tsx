import { PillarsCard } from "./pillars-card";
import { WeeklyFocusCard } from "./weekly-focus-card";
import type { Pillar } from "@shared/schema";

interface WeeklyOverviewProps {
  pillars: Pillar[];
  focusStatement: string;
  topFive: string[];
  onPillarUpdate?: (pillarId: string, current: number, target: number) => void;
}

export function WeeklyOverview({ pillars, focusStatement, topFive, onPillarUpdate }: WeeklyOverviewProps) {
  return (
    <section>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        <PillarsCard pillars={pillars} onPillarUpdate={onPillarUpdate} />
        <WeeklyFocusCard focusStatement={focusStatement} topFive={topFive} />
      </div>
    </section>
  );
}
