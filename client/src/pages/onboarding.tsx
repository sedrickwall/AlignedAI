import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

import type {
  IdentityProfile,
  PurposeProfile,
  SeasonPillar,
  VisionMap,
  CapacityProfile,
  OnboardingProgress,
} from "@shared/schema";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  Sparkles,
  Heart,
  Target,
  Calendar,
  Battery,
} from "lucide-react";

const stepInfo = [
  { number: 1, title: "Identity", icon: Sparkles },
  { number: 2, title: "Purpose", icon: Heart },
  { number: 3, title: "Season Pillars", icon: Target },
  { number: 4, title: "Vision", icon: Calendar },
  { number: 5, title: "Capacity", icon: Battery },
];

function TagInput({
  value,
  onChange,
  placeholder,
}: {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder: string;
}) {
  const [input, setInput] = useState("");

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && input.trim()) {
      e.preventDefault();
      if (!value.includes(input.trim())) {
        onChange([...value, input.trim()]);
      }
      setInput("");
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {value.map((tag) => (
          <Badge key={tag} variant="secondary">
            {tag}
            <button onClick={() => onChange(value.filter((t) => t !== tag))}>
              <X className="h-3 w-3 ml-1" />
            </button>
          </Badge>
        ))}
      </div>

      <Input
        value={input}
        placeholder={placeholder}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
        onKeyDown={onKeyDown}
        data-testid="input-tag"
      />
    </div>
  );
}

interface StepProps {
  data: any;
  onUpdate: (data: any) => void;
}

function IdentityStep({ data, onUpdate }: StepProps) {
  const [gifts, setGifts] = useState<string[]>(data?.gifts || []);
  const [skills, setSkills] = useState<string[]>(data?.skills || []);
  const [interests, setInterests] = useState<string[]>(data?.interests || []);
  const [passions, setPassions] = useState<string[]>(data?.passions || []);
  const [strongestTalent, setStrongestTalent] = useState(
    data?.strongestTalent || ""
  );

  useEffect(() => {
    onUpdate({ gifts, skills, interests, passions, strongestTalent });
  }, [gifts, skills, interests, passions, strongestTalent]);

  return (
    <div className="space-y-6">
      <div>
        <Label className="text-sm text-muted-foreground mb-2 block">Your Gifts</Label>
        <TagInput value={gifts} onChange={setGifts} placeholder="Add a gift and press Enter..." />
      </div>
      <div>
        <Label className="text-sm text-muted-foreground mb-2 block">Your Skills</Label>
        <TagInput value={skills} onChange={setSkills} placeholder="Add a skill and press Enter..." />
      </div>
      <div>
        <Label className="text-sm text-muted-foreground mb-2 block">Your Interests</Label>
        <TagInput value={interests} onChange={setInterests} placeholder="Add an interest and press Enter..." />
      </div>
      <div>
        <Label className="text-sm text-muted-foreground mb-2 block">Your Passions</Label>
        <TagInput value={passions} onChange={setPassions} placeholder="Add a passion and press Enter..." />
      </div>
      <div>
        <Label className="text-sm text-muted-foreground mb-2 block">Your Strongest Talent</Label>
        <Textarea
          className="min-h-[120px]"
          value={strongestTalent}
          placeholder="Describe your strongest talent..."
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setStrongestTalent(e.target.value)}
          data-testid="textarea-strongest-talent"
        />
      </div>
    </div>
  );
}

function PurposeStep({ data, onUpdate }: StepProps) {
  const [who, setWho] = useState<string[]>(data?.whoToBlessing || []);
  const [purposeStatement, setPurposeStatement] = useState(
    data?.purposeStatement || ""
  );

  useEffect(() => {
    onUpdate({ whoToBlessing: who, purposeStatement });
  }, [who, purposeStatement]);

  return (
    <div className="space-y-6">
      <div>
        <Label className="text-sm text-muted-foreground mb-2 block">Who You Feel Called to Bless</Label>
        <TagInput
          value={who}
          onChange={setWho}
          placeholder="Add who you feel called to bless and press Enter..."
        />
      </div>
      <div>
        <Label className="text-sm text-muted-foreground mb-2 block">Purpose Statement</Label>
        <Textarea
          className="min-h-[120px]"
          value={purposeStatement}
          placeholder="I exist to..."
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setPurposeStatement(e.target.value)}
          data-testid="textarea-purpose"
        />
      </div>
    </div>
  );
}

interface PillarsStepProps {
  data: SeasonPillar[];
  onUpdate: (id: string, updates: Partial<SeasonPillar>) => void;
  onCreatePillar: (name: string) => void;
  onDeletePillar: (id: string) => void;
}

function PillarsStep({ data, onUpdate, onCreatePillar, onDeletePillar }: PillarsStepProps) {
  const [newPillarName, setNewPillarName] = useState("");

  const handleCreate = () => {
    if (newPillarName.trim()) {
      onCreatePillar(newPillarName.trim());
      setNewPillarName("");
    }
  };

  return (
    <div className="space-y-4">
      <Label className="text-sm text-muted-foreground mb-2 block">
        Your Season Pillars - Focus areas for this season of life
      </Label>
      
      {data.map((pillar) => (
        <Card key={pillar.id}>
          <CardContent className="p-4 space-y-3">
            <div className="flex justify-between items-center gap-2">
              <span className="font-medium">{pillar.name}</span>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => onDeletePillar(pillar.id)}
                data-testid={`button-delete-pillar-${pillar.id}`}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <Textarea
              value={pillar.description || ""}
              placeholder="Describe this pillar..."
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                onUpdate(pillar.id, { description: e.target.value })
              }
              data-testid={`textarea-pillar-description-${pillar.id}`}
            />

            <Input
              type="number"
              value={pillar.weeklyHoursBudget ?? ""}
              placeholder="Hours/week budget"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                onUpdate(pillar.id, {
                  weeklyHoursBudget: parseInt(e.target.value) || undefined,
                })
              }
              data-testid={`input-pillar-hours-${pillar.id}`}
            />
          </CardContent>
        </Card>
      ))}

      <div className="flex gap-2">
        <Input
          value={newPillarName}
          placeholder="New pillar name..."
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPillarName(e.target.value)}
          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === "Enter" && handleCreate()}
          data-testid="input-new-pillar"
        />
        <Button onClick={handleCreate} data-testid="button-add-pillar">
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function VisionStep({ data, onUpdate }: StepProps) {
  const [yearVision, setYearVision] = useState(data?.yearVision || "");
  const [quarterly, setQuarterly] = useState(
    data?.quarterlyOutcomes || { Q1: "", Q2: "", Q3: "", Q4: "" }
  );

  useEffect(() => {
    onUpdate({ yearVision, quarterlyOutcomes: quarterly, year: new Date().getFullYear() });
  }, [yearVision, quarterly]);

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-sm text-muted-foreground mb-2 block">Your Vision for This Year</Label>
        <Textarea
          value={yearVision}
          placeholder="This year I will..."
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setYearVision(e.target.value)}
          data-testid="textarea-year-vision"
        />
      </div>

      <Label className="text-sm text-muted-foreground block">Quarterly Outcomes</Label>
      <div className="grid grid-cols-2 gap-4">
        {(["Q1", "Q2", "Q3", "Q4"] as const).map((q) => (
          <Textarea
            key={q}
            value={quarterly[q] || ""}
            placeholder={`${q} outcomes`}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              setQuarterly({ ...quarterly, [q]: e.target.value })
            }
            data-testid={`textarea-${q.toLowerCase()}`}
          />
        ))}
      </div>
    </div>
  );
}

function CapacityStep({ data, onUpdate }: StepProps) {
  const [weekly, setWeekly] = useState(data?.weeklyAvailableHours || 40);
  const [season, setSeason] = useState(data?.seasonOfLife || "");
  const [bandwidth, setBandwidth] = useState(data?.emotionalBandwidth || "medium");

  useEffect(() => {
    onUpdate({
      weeklyAvailableHours: weekly,
      seasonOfLife: season,
      emotionalBandwidth: bandwidth,
    });
  }, [weekly, season, bandwidth]);

  return (
    <div className="space-y-6">
      <div>
        <Label className="text-sm text-muted-foreground mb-2 block">
          Weekly Available Hours: {weekly}
        </Label>
        <Input
          type="range"
          min="5"
          max="60"
          value={weekly}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setWeekly(parseInt(e.target.value))}
          data-testid="input-weekly-hours"
        />
      </div>
      <div>
        <Label className="text-sm text-muted-foreground mb-2 block">Season of Life</Label>
        <Textarea
          value={season}
          placeholder="Describe your current season of life..."
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setSeason(e.target.value)}
          data-testid="textarea-season"
        />
      </div>
      <div>
        <Label className="text-sm text-muted-foreground mb-2 block">Emotional Bandwidth</Label>
        <div className="flex gap-2">
          {["low", "medium", "high"].map((level) => (
            <Button
              key={level}
              variant={bandwidth === level ? "default" : "outline"}
              onClick={() => setBandwidth(level)}
              data-testid={`button-bandwidth-${level}`}
            >
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Onboarding() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [, navigate] = useLocation();

  const [currentStep, setCurrentStep] = useState(1);

  const [pendingData, setPendingData] = useState<{
    identity: Partial<IdentityProfile>;
    purpose: Partial<PurposeProfile>;
    vision: Partial<VisionMap>;
    capacity: Partial<CapacityProfile>;
  }>({
    identity: {},
    purpose: {},
    vision: {},
    capacity: {},
  });

  const { data: serverData, isLoading: loadingServer } = useQuery({
    queryKey: ["/api/onboarding/all"],
    enabled: !!user,
  });

  const { data: progressData, isLoading: loadingProgress } = useQuery({
    queryKey: ["/api/onboarding/progress"],
    enabled: !!user,
  });

  useEffect(() => {
    if (progressData?.currentStep) {
      setCurrentStep(progressData.currentStep);
    }
  }, [progressData?.currentStep]);

  const updateProgress = useMutation({
    mutationFn: async (updates: Partial<OnboardingProgress>) =>
      apiRequest("PATCH", "/api/onboarding/progress", updates),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["/api/onboarding/progress"] }),
  });

  const completeOnboarding = useMutation({
    mutationFn: async () =>
      apiRequest("POST", "/api/onboarding/complete", {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/onboarding/progress"] });
      navigate("/");
    },
  });

  const saveStepData = async () => {
    try {
      if (currentStep === 1) {
        await apiRequest("PATCH", "/api/profile/identity", pendingData.identity);
      }
      if (currentStep === 2) {
        await apiRequest("PATCH", "/api/profile/purpose", pendingData.purpose);
      }
      if (currentStep === 4) {
        await apiRequest("PATCH", "/api/profile/vision", {
          ...pendingData.vision,
          year: new Date().getFullYear(),
        });
      }
      if (currentStep === 5) {
        await apiRequest("PATCH", "/api/profile/capacity", pendingData.capacity);
      }
      queryClient.invalidateQueries({ queryKey: ["/api/onboarding/all"] });
    } catch (error) {
      console.error("Error saving step data:", error);
      throw error;
    }
  };

  const handleNext = async () => {
    try {
      await saveStepData();

      const completionKeys = [
        "identityComplete",
        "purposeComplete",
        "pillarsComplete",
        "visionComplete",
        "capacityComplete",
      ] as const;

      await updateProgress.mutateAsync({
        currentStep: currentStep + 1,
        [completionKeys[currentStep - 1]]: true,
      });

      setCurrentStep((c) => c + 1);
    } catch (err) {
      toast({
        title: "Save failed",
        description: "Something went wrong saving this step.",
        variant: "destructive",
      });
    }
  };

  const handleComplete = async () => {
    try {
      await saveStepData();
      await completeOnboarding.mutateAsync();

      toast({
        title: "Welcome!",
        description: "Your alignment journey begins.",
      });
    } catch (err) {
      toast({
        title: "Completion failed",
        description: "Try again.",
        variant: "destructive",
      });
    }
  };

  const handlePillarUpdate = async (id: string, updates: Partial<SeasonPillar>) => {
    try {
      await apiRequest("PATCH", `/api/profile/season-pillars/${id}`, updates);
      queryClient.invalidateQueries({ queryKey: ["/api/onboarding/all"] });
    } catch (err) {
      console.error("Error updating pillar:", err);
    }
  };

  const handleCreatePillar = async (name: string) => {
    try {
      await apiRequest("POST", "/api/profile/season-pillars", { name });
      queryClient.invalidateQueries({ queryKey: ["/api/onboarding/all"] });
    } catch (err) {
      console.error("Error creating pillar:", err);
    }
  };

  const handleDeletePillar = async (id: string) => {
    try {
      await apiRequest("DELETE", `/api/profile/season-pillars/${id}`);
      queryClient.invalidateQueries({ queryKey: ["/api/onboarding/all"] });
    } catch (err) {
      console.error("Error deleting pillar:", err);
    }
  };

  if (loadingServer || loadingProgress) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Skeleton className="h-10 w-10" />
      </div>
    );
  }

  const step = currentStep;
  const progressPercent = (step / 5) * 100;
  const all = serverData || {};

  return (
    <div className="min-h-screen py-10 bg-background">
      <div className="max-w-2xl mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-lg font-semibold" data-testid="text-onboarding-title">
            {stepInfo[step - 1]?.title || "Getting Started"}
          </h1>
          <Progress value={progressPercent} className="h-2 mt-2" />
          <p className="text-sm text-muted-foreground mt-2">Step {step} of 5</p>
        </div>

        <Card className="shadow-lg">
          <CardContent className="p-6 space-y-8">
            {step === 1 && (
              <IdentityStep
                data={all.identity}
                onUpdate={(u) => setPendingData((p) => ({ ...p, identity: u }))}
              />
            )}

            {step === 2 && (
              <PurposeStep
                data={all.purpose}
                onUpdate={(u) => setPendingData((p) => ({ ...p, purpose: u }))}
              />
            )}

            {step === 3 && (
              <PillarsStep
                data={all.seasonPillars || []}
                onUpdate={handlePillarUpdate}
                onCreatePillar={handleCreatePillar}
                onDeletePillar={handleDeletePillar}
              />
            )}

            {step === 4 && (
              <VisionStep
                data={all.vision}
                onUpdate={(u) => setPendingData((p) => ({ ...p, vision: u }))}
              />
            )}

            {step === 5 && (
              <CapacityStep
                data={all.capacity}
                onUpdate={(u) => setPendingData((p) => ({ ...p, capacity: u }))}
              />
            )}

            <div className="flex justify-between pt-8 border-t gap-4">
              <Button
                variant="outline"
                disabled={step === 1}
                onClick={() => setCurrentStep((s) => s - 1)}
                data-testid="button-back"
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back
              </Button>

              {step < 5 ? (
                <Button onClick={handleNext} data-testid="button-next">
                  Next
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={handleComplete} data-testid="button-finish">
                  Finish
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
