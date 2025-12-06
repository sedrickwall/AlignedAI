import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EnergySelector } from "./energy-selector";
import { BigThree } from "./big-three";
import type { EnergyLevel, Task } from "@shared/schema";
import { Compass } from "lucide-react";

interface AlignmentCardProps {
  energyLevel: EnergyLevel;
  onEnergyChange: (level: EnergyLevel) => void;
  tasks: Task[];
  onTaskToggle: (taskId: string) => void;
}

export function AlignmentCard({
  energyLevel,
  onEnergyChange,
  tasks,
  onTaskToggle,
}: AlignmentCardProps) {
  return (
    <Card className="shadow-md">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <Compass className="h-4 w-4 text-primary" />
          Today's Alignment
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-5">
        <EnergySelector value={energyLevel} onChange={onEnergyChange} />
        <div className="h-px bg-border" />
        <BigThree tasks={tasks} onToggle={onTaskToggle} />
      </CardContent>
    </Card>
  );
}
