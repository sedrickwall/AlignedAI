import { Button } from "@/components/ui/button";
import type { EnergyLevel } from "@shared/schema";
import { Battery, BatteryLow, BatteryFull } from "lucide-react";

interface EnergySelectorProps {
  value: EnergyLevel;
  onChange: (level: EnergyLevel) => void;
}

const energyLevels: { level: EnergyLevel; label: string; icon: typeof Battery }[] = [
  { level: "low", label: "Low", icon: BatteryLow },
  { level: "normal", label: "Normal", icon: Battery },
  { level: "high", label: "High", icon: BatteryFull },
];

export function EnergySelector({ value, onChange }: EnergySelectorProps) {
  return (
    <div>
      <p className="text-sm text-muted-foreground mb-2">How is your energy today?</p>
      <div className="flex flex-wrap gap-2">
        {energyLevels.map(({ level, label, icon: Icon }) => (
          <Button
            key={level}
            variant={value === level ? "default" : "outline"}
            size="sm"
            onClick={() => onChange(level)}
            className="gap-1.5"
            data-testid={`button-energy-${level}`}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </Button>
        ))}
      </div>
    </div>
  );
}
