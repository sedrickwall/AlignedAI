import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { BookOpen, Save, Loader2 } from "lucide-react";
import type { Reflection } from "@shared/schema";

interface ReflectionCardProps {
  reflection: Reflection | null;
  onSave: (data: {
    wins?: string;
    challenges?: string;
    gratitude?: string;
    nextWeekIntention?: string;
  }) => void;
  isSaving?: boolean;
}

const reflectionPrompts = [
  {
    key: "gratitude" as const,
    label: "What am I most grateful for this week?",
    placeholder: "Reflect on the blessings and moments of grace...",
  },
  {
    key: "wins" as const,
    label: "Where did I see God working in my life?",
    placeholder: "Consider the small and big victories, answered prayers...",
  },
  {
    key: "challenges" as const,
    label: "What challenged me and how did I grow?",
    placeholder: "Think about obstacles faced and lessons learned...",
  },
  {
    key: "nextWeekIntention" as const,
    label: "What do I want to focus on next week?",
    placeholder: "Set your intention for staying aligned with your calling...",
  },
];

export function ReflectionCard({ reflection, onSave, isSaving }: ReflectionCardProps) {
  const [formData, setFormData] = useState({
    wins: "",
    challenges: "",
    gratitude: "",
    nextWeekIntention: "",
  });
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (reflection) {
      setFormData({
        wins: reflection.wins || "",
        challenges: reflection.challenges || "",
        gratitude: reflection.gratitude || "",
        nextWeekIntention: reflection.nextWeekIntention || "",
      });
      setHasChanges(false);
    }
  }, [reflection]);

  const handleChange = (key: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    onSave(formData);
    setHasChanges(false);
  };

  return (
    <Card className="shadow-md" data-testid="card-reflection">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-primary" />
            <CardTitle className="text-base font-semibold">Weekly Reflection</CardTitle>
          </div>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
            data-testid="button-save-reflection"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span className="ml-1">Save</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Take a moment to pause and reflect on your week. These prompts help you stay connected to your purpose and aligned with your calling.
        </p>
        
        {reflectionPrompts.map((prompt) => (
          <div key={prompt.key} className="space-y-2">
            <Label htmlFor={`reflection-${prompt.key}`} className="text-sm font-medium">
              {prompt.label}
            </Label>
            <Textarea
              id={`reflection-${prompt.key}`}
              placeholder={prompt.placeholder}
              value={formData[prompt.key]}
              onChange={(e) => handleChange(prompt.key, e.target.value)}
              className="min-h-[80px] resize-none"
              data-testid={`input-reflection-${prompt.key}`}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
