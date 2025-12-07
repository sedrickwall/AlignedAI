import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PillarBar } from "./pillar-bar";
import type { Pillar } from "@shared/schema";
import { BarChart3 } from "lucide-react";

interface PillarsCardProps {
  pillars: Pillar[];
  onPillarUpdate?: (pillarId: string, current: number, target: number) => void;
}

export function PillarsCard({ pillars, onPillarUpdate }: PillarsCardProps) {
  return (
    <Card className="shadow-md">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <BarChart3 className="h-4 w-4 text-primary" />
          This Week's Pillars
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {pillars.map((pillar) => (
            <PillarBar
              key={pillar.id}
              pillar={pillar}
              onUpdate={onPillarUpdate}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
