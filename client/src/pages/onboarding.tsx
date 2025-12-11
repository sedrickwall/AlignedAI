// client/src/pages/onboarding.tsx

import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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

import type {
  IdentityProfile,
  PurposeProfile,
  SeasonPillar,
  VisionMap,
  CapacityProfile,
} from "@shared/schema";

import {
  getOnboardingAll,
  updateOnboardingProgress,
  markOnboardingComplete,
  saveIdentity,
  savePurpose,
  saveVision,
  saveCapacity,
  saveSeasonPillars,
  type FirestoreOnboardingDocument,
} from "@/lib/onboardingFirebase";

import { useAuth } from "@/hooks/useAuth";
import { auth } from "@/lib/firebase";

//-----------------------------------------------------
// STEP INFO
//-----------------------------------------------------

const stepInfo = [
  {
    number: 1,
    title: "Your Identity",
    description: "Discover your God-given gifts and developed skills",
    icon: Sparkles,
  },
  {
    number: 2,
    title: "Your Purpose",
    description: "Define who you're called to serve and bless",
    icon: Heart,
  },
  {
    number: 3,
    title: "Season Pillars",
    description: "Set your focus areas for this season of life",
    icon: Target,
  },
  {
    number: 4,
    title: "Your Vision",
    description: "Map out your year with intentional goals",
    icon: Calendar,
  },
  {
    number: 5,
    title: "Your Capacity",
    description: "Understand your energy and availability",
    icon: Battery,
  },
];

//-----------------------------------------------------
// TAG INPUT
//-----------------------------------------------------

function TagInput({
  value,
  onChange,
  placeholder,
  testId,
}: {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder: string;
  testId: string;
}) {
  const [inputValue, setInputValue] = useState("");

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue.trim()) {
      e.preventDefault();
      if (!value.includes(inputValue.trim())) {
        onChange([...value, inputValue.trim()]);
      }
      setInputValue("");
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {value.map((tag) => (
          <Badge key={tag} variant="secondary" className="gap-1">
            {tag}
            <button
              type="button"
              onClick={() => onChange(value.filter((t) => t !== tag))}
              data-testid={`button-remove-tag-${tag}`}
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>
      <Input
        value={inputValue}
        placeholder={placeholder}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        data-testid={testId}
      />
      <p className="text-xs text-muted-foreground">Press Enter to add</p>
    </div>
  );
}

//-----------------------------------------------------
// IDENTITY STEP
//-----------------------------------------------------

function IdentityStep({
  data,
  onUpdate,
}: {
  data: Partial<IdentityProfile>;
  onUpdate: (updates: Partial<IdentityProfile>) => void;
}) {
  const [gifts, setGifts] = useState<string[]>(data.gifts ?? []);
  const [skills, setSkills] = useState<string[]>(data.skills ?? []);
  const [interests, setInterests] = useState<string[]>(data.interests ?? []);
  const [passions, setPassions] = useState<string[]>(data.passions ?? []);
  const [strongestTalent, setStrongestTalent] = useState(
    data.strongestTalent ?? ""
  );

  useEffect(() => {
    onUpdate({ gifts, skills, interests, passions, strongestTalent });
  }, [gifts, skills, interests, passions, strongestTalent, onUpdate]);

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <Sparkles className="h-12 w-12 mx-auto text-primary mb-4" />
        <h2 className="text-2xl font-semibold">Discover Your Identity</h2>
        <p className="text-muted-foreground mt-2">
          God has uniquely designed you with gifts and abilities.
        </p>
      </div>

      <TagInput
        value={gifts}
        onChange={setGifts}
        placeholder="Add a gift..."
        testId="input-gift"
      />
      <TagInput
        value={skills}
        onChange={setSkills}
        placeholder="Add a skill..."
        testId="input-skill"
      />
      <TagInput
        value={interests}
        onChange={setInterests}
        placeholder="Add an interest..."
        testId="input-interest"
      />
      <TagInput
        value={passions}
        onChange={setPassions}
        placeholder="Add a passion..."
        testId="input-passion"
      />

      <Textarea
        className="min-h-[120px]"
        value={strongestTalent}
        placeholder="Describe your strongest talent..."
        onChange={(e) => setStrongestTalent(e.target.value)}
        data-testid="textarea-strongest-talent"
      />
    </div>
  );
}

//-----------------------------------------------------
// PURPOSE STEP
//-----------------------------------------------------

function PurposeStep({
  data,
  onUpdate,
}: {
  data: Partial<PurposeProfile>;
  onUpdate: (updates: Partial<PurposeProfile>) => void;
}) {
  const [whoToBlessing, setWhoToBlessing] = useState<string[]>(
    data.whoToBlessing ?? []
  );
  const [generosityTargets, setGenerosityTargets] = useState<
    Record<string, number>
  >(
    (data.generosityTargets as Record<string, number>) ?? {
      lovedOnes: 25,
      strangers: 25,
      community: 25,
      kingdom: 25,
    }
  );
  const [purposeStatement, setPurposeStatement] = useState(
    data.purposeStatement ?? ""
  );

  useEffect(() => {
    onUpdate({ whoToBlessing, generosityTargets, purposeStatement });
  }, [whoToBlessing, generosityTargets, purposeStatement, onUpdate]);

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <Heart className="h-12 w-12 mx-auto text-primary mb-4" />
        <h2 className="text-2xl font-semibold">Define Your Purpose</h2>
      </div>

      <TagInput
        value={whoToBlessing}
        onChange={setWhoToBlessing}
        placeholder="Add a group to bless..."
        testId="input-who"
      />

      {Object.keys(generosityTargets).map((key) => (
        <div key={key}>
          <Label className="text-sm capitalize">{key}</Label>
          <input
            type="range"
            min="0"
            max="100"
            value={generosityTargets[key]}
            onChange={(e) =>
              setGenerosityTargets({
                ...generosityTargets,
                [key]: parseInt(e.target.value),
              })
            }
          />
        </div>
      ))}

      <Textarea
        className="min-h-[120px]"
        value={purposeStatement}
        placeholder="I exist to..."
        onChange={(e) => setPurposeStatement(e.target.value)}
        data-testid="textarea-purpose"
      />
    </div>
  );
}

//-----------------------------------------------------
// PILLARS STEP
//-----------------------------------------------------

function PillarsStep({
  data,
  onChange,
}: {
  data: SeasonPillar[];
  onChange: (pillars: SeasonPillar[]) => void;
}) {
  const [newPillarName, setNewPillarName] = useState("");

  const addPillar = () => {
    if (!newPillarName.trim()) return;
    const pillar: SeasonPillar = {
      id: crypto.randomUUID(),
      name: newPillarName.trim(),
      description: "",
      weeklyHoursBudget: 0,
    } as SeasonPillar;
    onChange([...data, pillar]);
    setNewPillarName("");
  };

  const updatePillar = (id: string, updates: Partial<SeasonPillar>) => {
    onChange(
      data.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
  };

  const deletePillar = (id: string) => {
    onChange(data.filter((p) => p.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <Target className="h-12 w-12 mx-auto text-primary mb-4" />
        <h2 className="text-2xl font-semibold">Season Pillars</h2>
      </div>

      <div className="space-y-4">
        <Label className="text-base font-medium">Your Pillars</Label>

        {data.map((pillar) => (
          <Card key={pillar.id}>
            <CardContent className="p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span>{pillar.name}</span>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => deletePillar(pillar.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <Textarea
                value={pillar.description || ""}
                onChange={(e) =>
                  updatePillar(pillar.id, { description: e.target.value })
                }
              />

              <Input
                type="number"
                placeholder="Hours per week"
                value={pillar.weeklyHoursBudget ?? ""}
                onChange={(e) =>
                  updatePillar(pillar.id, {
                    weeklyHoursBudget: parseInt(e.target.value) || 0,
                  })
                }
              />
            </CardContent>
          </Card>
        ))}

        <div className="flex gap-2">
          <Input
            value={newPillarName}
            placeholder="New Pillar"
            onChange={(e) => setNewPillarName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addPillar()}
          />
          <Button onClick={addPillar}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

//-----------------------------------------------------
// VISION STEP
//-----------------------------------------------------

function VisionStep({
  data,
  onUpdate,
}: {
  data: Partial<VisionMap>;
  onUpdate: (updates: Partial<VisionMap>) => void;
}) {
  const currentYear = new Date().getFullYear();
  const [yearVision, setYearVision] = useState(data.yearVision ?? "");
  const [quarterlyOutcomes, setQuarterlyOutcomes] = useState<
    Record<string, string>
  >(
    (data.quarterlyOutcomes as Record<string, string>) ?? {
      Q1: "",
      Q2: "",
      Q3: "",
      Q4: "",
    }
  );

  useEffect(() => {
    onUpdate({
      year: currentYear,
      yearVision,
      quarterlyOutcomes,
    });
  }, [yearVision, quarterlyOutcomes, onUpdate, currentYear]);

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <Calendar className="h-12 w-12 mx-auto text-primary mb-4" />
        <h2 className="text-2xl font-semibold">Year Vision</h2>
      </div>

      <Textarea
        className="min-h-[120px]"
        value={yearVision}
        onChange={(e) => setYearVision(e.target.value)}
        placeholder="This year I will..."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.keys(quarterlyOutcomes).map((q) => (
          <Textarea
            key={q}
            className="min-h-[80px]"
            placeholder={`${q} outcomes...`}
            value={quarterlyOutcomes[q]}
            onChange={(e) =>
              setQuarterlyOutcomes({
                ...quarterlyOutcomes,
                [q]: e.target.value,
              })
            }
          />
        ))}
      </div>
    </div>
  );
}

//-----------------------------------------------------
// CAPACITY STEP
//-----------------------------------------------------

function CapacityStep({
  data,
  onUpdate,
}: {
  data: Partial<CapacityProfile>;
  onUpdate: (updates: Partial<CapacityProfile>) => void;
}) {
  const [weeklyAvailableHours, setWeeklyAvailableHours] = useState(
    data.weeklyAvailableHours ?? 40
  );

  const [emotionalBandwidth, setEmotionalBandwidth] = useState(
    data.emotionalBandwidth ?? "medium"
  );

  const [seasonOfLife, setSeasonOfLife] = useState(
    data.seasonOfLife ?? ""
  );

  useEffect(() => {
    onUpdate({
      weeklyAvailableHours,
      emotionalBandwidth,
      seasonOfLife,
    });
  }, [weeklyAvailableHours, emotionalBandwidth, seasonOfLife, onUpdate]);

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <Battery className="h-12 w-12 mx-auto text-primary mb-4" />
        <h2 className="text-2xl font-semibold">Your Capacity</h2>
      </div>

      <div>
        <Label>Weekly Available Hours</Label>
        <input
          type="range"
          min="5"
          max="60"
          value={weeklyAvailableHours}
          onChange={(e) =>
            setWeeklyAvailableHours(parseInt(e.target.value))
          }
        />
        <p className="text-sm mt-1">{weeklyAvailableHours} hours/week</p>
      </div>

      <div>
        <Label>Emotional Bandwidth</Label>
        <div className="flex gap-2">
          {["low", "medium", "high"].map((level) => (
            <Button
              key={level}
              variant={
                emotionalBandwidth === level ? "default" : "outline"
              }
              onClick={() => setEmotionalBandwidth(level)}
            >
              {level}
            </Button>
          ))}
        </div>
      </div>

      <div>
        <Label>Season of Life</Label>
        <Textarea
          className="min-h-[100px]"
          value={seasonOfLife}
          onChange={(e) => setSeasonOfLife(e.target.value)}
        />
      </div>
    </div>
  );
}

//-----------------------------------------------------
// MAIN ONBOARDING COMPONENT
//-----------------------------------------------------

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();

  const [currentStep, setCurrentStep] = useState(1);
  const [identity, setIdentity] = useState<Partial<IdentityProfile>>({});
  const [purpose, setPurpose] = useState<Partial<PurposeProfile>>({});
  const [pillars, setPillars] = useState<SeasonPillar[]>([]);
  const [vision, setVision] = useState<Partial<VisionMap>>({});
  const [capacity, setCapacity] = useState<Partial<CapacityProfile>>({});

  const { data, isLoading } = useQuery<FirestoreOnboardingDocument>({
    queryKey: ["onboarding-all", user?.uid],
    enabled: !!user,
    queryFn: async () => {
      if (!user) throw new Error("No user");
      return await getOnboardingAll(user.uid);
    },
  });

  // hydrate local state when data loads
  useEffect(() => {
    if (!data) return;
    setIdentity(data.identity ?? {});
    setPurpose(data.purpose ?? {});
    setPillars(data.seasonPillars ?? []);
    setVision(data.vision ?? {});
    setCapacity(data.capacity ?? {});
    if (data.progress?.currentStep) {
      setCurrentStep(data.progress.currentStep);
    }
  }, [data]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>You must be logged in to complete onboarding.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Skeleton className="h-10 w-10 mx-auto" />
      </div>
    );
  }

  const progressPercent = (currentStep / 5) * 100;

  const saveCurrentStep = async () => {
    const uid = user.uid;
    switch (currentStep) {
      case 1:
        await saveIdentity(uid, identity);
        await updateOnboardingProgress(uid, { identityComplete: true });
        break;
      case 2:
        await savePurpose(uid, purpose);
        await updateOnboardingProgress(uid, { purposeComplete: true });
        break;
      case 3:
        await saveSeasonPillars(uid, pillars);
        await updateOnboardingProgress(uid, { pillarsComplete: true });
        break;
      case 4:
        await saveVision(uid, vision);
        await updateOnboardingProgress(uid, { visionComplete: true });
        break;
      case 5:
        await saveCapacity(uid, capacity);
        await updateOnboardingProgress(uid, { capacityComplete: true });
        break;
    }
  };

  const handleNext = async () => {
    try {
      await saveCurrentStep();
      const nextStep = Math.min(currentStep + 1, 5);
      await updateOnboardingProgress(user.uid, { currentStep: nextStep });
      setCurrentStep(nextStep);
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Could not save. Try again.",
        variant: "destructive",
      });
    }
  };

  const handleComplete = async () => {
    try {
      await saveCurrentStep();
      await updateOnboardingProgress(user.uid, {
        onboardingComplete: true,
        capacityComplete: true,
      });
      await markOnboardingComplete(user.uid);

      // Invalidate the cache so App.tsx gets the updated status
      await queryClient.invalidateQueries({ queryKey: ["onboarding-progress"] });

      toast({
        title: "Welcome to Aligned!",
        description: "Your profile is set up. Let's start your journey.",
      });
      setLocation("/");
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to complete setup. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSkip = async () => {
    try {
      await updateOnboardingProgress(user.uid, {
        onboardingComplete: true,
      });
      await markOnboardingComplete(user.uid);
      
      // Invalidate the cache so App.tsx gets the updated status
      await queryClient.invalidateQueries({ queryKey: ["onboarding-progress"] });
      
      setLocation("/");
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to skip onboarding. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <h1 className="text-lg font-semibold">Getting Started</h1>
            <Button variant="ghost" size="sm" onClick={handleSkip}>
              Skip for now
            </Button>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>

        {/* Card */}
        <Card className="shadow-lg">
          <CardContent className="p-6 md:p-8">
            {currentStep === 1 && (
              <IdentityStep data={identity} onUpdate={setIdentity} />
            )}

            {currentStep === 2 && (
              <PurposeStep data={purpose} onUpdate={setPurpose} />
            )}

            {currentStep === 3 && (
              <PillarsStep data={pillars} onChange={setPillars} />
            )}

            {currentStep === 4 && (
              <VisionStep data={vision} onUpdate={setVision} />
            )}

            {currentStep === 5 && (
              <CapacityStep data={capacity} onUpdate={setCapacity} />
            )}

            {/* Navigation buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t">
              <Button
                variant="outline"
                disabled={currentStep === 1}
                onClick={() => setCurrentStep((prev) => prev - 1)}
              >
                <ChevronLeft className="h-4 w-4 mr-1" /> Back
              </Button>

              {currentStep < 5 ? (
                <Button onClick={handleNext}>
                  Next <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              ) : (
                <Button onClick={handleComplete}>Complete Setup</Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
