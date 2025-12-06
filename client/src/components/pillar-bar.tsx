import type { Pillar } from "@shared/schema";
import { cn } from "@/lib/utils";

interface PillarBarProps {
  pillar: Pillar;
}

export function PillarBar({ pillar }: PillarBarProps) {
  const percentage = Math.min((pillar.current / pillar.target) * 100, 100);
  const isComplete = pillar.current >= pillar.target;

  return (
    <div
      className="flex items-center gap-3 text-sm"
      data-testid={`pillar-row-${pillar.id}`}
    >
      <div className="w-24 text-muted-foreground shrink-0 truncate">
        {pillar.name}
      </div>
      <div className="flex-1 bg-muted/60 rounded-full h-1.5 overflow-hidden">
        <div
          className={cn(
            "h-1.5 rounded-full transition-all duration-500 ease-out",
            isComplete ? "bg-success" : "bg-primary"
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div
        className={cn(
          "w-12 text-right text-xs",
          isComplete ? "text-success font-medium" : "text-muted-foreground"
        )}
        data-testid={`pillar-progress-${pillar.id}`}
      >
        {pillar.current}/{pillar.target}h
      </div>
    </div>
  );
}
