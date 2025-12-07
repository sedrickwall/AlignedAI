import { useState, useRef, useEffect } from "react";
import type { Pillar } from "@shared/schema";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, Check, X } from "lucide-react";

interface PillarBarProps {
  pillar: Pillar;
  onUpdate?: (pillarId: string, current: number, target: number) => void;
}

export function PillarBar({ pillar, onUpdate }: PillarBarProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [currentValue, setCurrentValue] = useState(pillar.current.toString());
  const [targetValue, setTargetValue] = useState(pillar.target.toString());
  const currentInputRef = useRef<HTMLInputElement>(null);

  const percentage = Math.min((pillar.current / pillar.target) * 100, 100);
  const isComplete = pillar.current >= pillar.target;

  useEffect(() => {
    if (isEditing && currentInputRef.current) {
      currentInputRef.current.focus();
      currentInputRef.current.select();
    }
  }, [isEditing]);

  useEffect(() => {
    setCurrentValue(pillar.current.toString());
    setTargetValue(pillar.target.toString());
  }, [pillar.current, pillar.target]);

  const handleSave = () => {
    const newCurrent = parseFloat(currentValue) || 0;
    const newTarget = parseFloat(targetValue) || 1;
    if (onUpdate && (newCurrent !== pillar.current || newTarget !== pillar.target)) {
      onUpdate(pillar.id, newCurrent, Math.max(newTarget, 0.5));
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setCurrentValue(pillar.current.toString());
    setTargetValue(pillar.target.toString());
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div
        className="flex items-center gap-2 text-sm"
        data-testid={`pillar-row-${pillar.id}`}
      >
        <div className="w-24 text-muted-foreground shrink-0 truncate">
          {pillar.name}
        </div>
        <div className="flex items-center gap-1 flex-1">
          <Input
            ref={currentInputRef}
            type="number"
            step="0.5"
            min="0"
            value={currentValue}
            onChange={(e) => setCurrentValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-16 h-7 text-xs text-center"
            data-testid={`input-pillar-current-${pillar.id}`}
          />
          <span className="text-muted-foreground">/</span>
          <Input
            type="number"
            step="0.5"
            min="0.5"
            value={targetValue}
            onChange={(e) => setTargetValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-16 h-7 text-xs text-center"
            data-testid={`input-pillar-target-${pillar.id}`}
          />
          <span className="text-muted-foreground text-xs">hrs</span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            size="icon"
            variant="ghost"
            onClick={handleSave}
            className="h-7 w-7"
            data-testid={`button-save-pillar-${pillar.id}`}
          >
            <Check className="h-3 w-3" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={handleCancel}
            className="h-7 w-7"
            data-testid={`button-cancel-pillar-${pillar.id}`}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="group flex items-center gap-3 text-sm"
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
      {onUpdate && (
        <Button
          size="icon"
          variant="ghost"
          onClick={() => setIsEditing(true)}
          className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ visibility: "visible" }}
          data-testid={`button-edit-pillar-${pillar.id}`}
        >
          <Pencil className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
}
