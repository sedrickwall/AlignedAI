// -----------------------------------------------------
// CLEAN + CORRECTED ONBOARDING FLOW (FINAL VERSION)
// -----------------------------------------------------

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
  Sparkles,
  Heart,
  Target,
  Calendar,
  Battery,
  Plus,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import {
  getOnboardingProgress,
  getOnboardingAll,
  updateOnboardingProgress,
  markOnboardingComplete,
  saveIdentity,
  savePurpose,
  saveVision,
  saveCapacity,
  saveSeasonPillars,
  type FirestoreOnboardingProgress,
} from "@/lib/onboardingFirebase";

import type {
  IdentityProfile,
  PurposeProfile,
  SeasonPillar,
  VisionMap,
  CapacityProfile,
} from "@shared/schema";

import { useAuth } from "@/hooks/useAuth";

// -----------------------------------------------------
// TAG INPUT COMPONENT
// -----------------------------------------------------
function TagInput({ value, onChange, placeholder }: any) {
  const [input, setInput] = useState("");

  const handleAdd = (e: any) => {
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
        {value.map((v: string) => (
          <Badge key={v} variant="secondary">
            {v}
            <button
              type="button"
              onClick={() => onChange(value.filter((t: string) => t !== v))}
            >
              <X className="h-3 w-3 ml-1" />
            </button>
          </Badge>
        ))}
      </div>

      <Input
        value={input}
        placeholder={placeholder}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleAdd}
      />

      <p className="text-xs text-muted-foreground">Press Enter to add</p>
    </div>
  );
}

// -----------------------------------------------------
// STEP 1 — IDENTITY
// -----------------------------------------------------
function IdentityStep({ data, onUpdate }: any) {
  const [gifts, setGifts] = useState(data.gifts ?? []);
  const [skills, setSkills] = useState(data.skills ?? []);
  const [interests, setInterests] = useState(data.interests ?? []);
  const [passions, setPassions] = useState(data.passions ?? []);
  const [strongestTalent, setStrongestTalent] = useState(
    data.strongestTalent ?? ""
  );

  useEffect(() => {
    onUpdate({
      gifts,
      skills,
      interests,
      passions,
      strongestTalent,
    });
  }, [gifts, skills, interests, passions, strongestTalent]);

  return (
    <div className="space-y-6">
      <SectionHeader icon={Sparkles} title="Discover Your Identity" />

      <TagInput value={gifts} onChange={setGifts} placeholder="Add gift…" />
      <TagInput value={skills} onChange={setSkills} placeholder="Add skill…" />
      <TagInput
        value={interests}
        onChange={setInterests}
        placeholder="Add interest…"
      />
      <TagInput
        value={passions}
        onChange={setPassions}
        placeholder="Add passion…"
      />

      <Textarea
        value={strongestTalent}
        placeholder="Describe your strongest talent…"
        onChange={(e) => setStrongestTalent(e.target.value)}
      />
    </div>
  );
}

// -----------------------------------------------------
// STEP 2 — PURPOSE
// -----------------------------------------------------
function PurposeStep({ data, onUpdate }: any) {
  const [whoToBlessing, setWhoToBlessing] = useState(
    data.whoToBlessing ?? []
  );
  const [purposeStatement, setPurposeStatement] = useState(
    data.purposeStatement ?? ""
  );
  const [generosityTargets, setGenerosityTargets] = useState(
    data.generosityTargets ?? {
      lovedOnes: 25,
      strangers: 25,
      community: 25,
      kingdom: 25,
    }
  );

  useEffect(() => {
    onUpdate({ whoToBlessing, purposeStatement, generosityTargets });
  }, [whoToBlessing, purposeStatement, generosityTargets]);

  return (
    <div className="space-y-6">
      <SectionHeader icon={Heart} title="Define Your Purpose" />

      <TagInput
        value={whoToBlessing}
        onChange={setWhoToBlessing}
        placeholder="Add person/group to bless…"
      />

      {Object.keys(generosityTargets).map((key) => (
        <div key={key}>
          <Label>{key}</Label>
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
        placeholder="I exist to…"
        value={purposeStatement}
        onChange={(e) => setPurposeStatement(e.target.value)}
      />
    </div>
  );
}

// -----------------------------------------------------
// STEP 3 — SEASON PILLARS
// -----------------------------------------------------
function PillarsStep({ data, onChange }: any) {
  const [newPillar, setNewPillar] = useState("");

  const addPillar = () => {
    if (!newPillar.trim()) return;
    const pillar = {
      id: crypto.randomUUID(),
      name: newPillar.trim(),
      description: "",
      weeklyHoursBudget: 0,
    };
    onChange([...data, pillar]);
    setNewPillar("");
  };

  return (
    <div className="space-y-6">
      <SectionHeader icon={Target} title="Season Pillars" />

      {data.map((pillar: SeasonPillar) => (
        <Card key={pillar.id}>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span>{pillar.name}</span>
              <Button
                size="icon"
                variant="ghost"
                onClick={() =>
                  onChange(data.filter((p: any) => p.id !== pillar.id))
                }
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <Textarea
              value={pillar.description ?? ""}
              onChange={(e) =>
                onChange(
                  data.map((p: any) =>
                    p.id === pillar.id
                      ? { ...p, description: e.target.value }
                      : p
                  )
                )
              }
            />

            <Input
              type="number"
              placeholder="Weekly hours"
              value={pillar.weeklyHoursBudget ?? 0}
              onChange={(e) =>
                onChange(
                  data.map((p: any) =>
                    p.id === pillar.id
                      ? {
                          ...p,
                          weeklyHoursBudget: parseInt(e.target.value) || 0,
                        }
                      : p
                  )
                )
              }
            />
          </CardContent>
        </Card>
      ))}

      <div className="flex gap-2">
        <Input
          value={newPillar}
          placeholder="New Pillar"
          onChange={(e) => setNewPillar(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addPillar()}
        />
        <Button onClick={addPillar}>
          <Plus />
        </Button>
      </div>
    </div>
  );
}

// -----------------------------------------------------
// STEP 4 — VISION
// -----------------------------------------------------
function VisionStep({ data, onUpdate }: any) {
  const [yearVision, setYearVision] = useState(data.yearVision ?? "");
  const [quarterlyOutcomes, setQuarterlyOutcomes] = useState(
    data.quarterlyOutcomes ?? { Q1: "", Q2: "", Q3: "", Q4: "" }
  );

  useEffect(() => {
    onUpdate({
      year: new Date().getFullYear(),
      yearVision,
      quarterlyOutcomes,
    });
  }, [yearVision, quarterlyOutcomes]);

  return (
    <div className="space-y-6">
      <SectionHeader icon={Calendar} title="Your Vision" />

      <Textarea
        value={yearVision}
        onChange={(e) => setYearVision(e.target.value)}
        placeholder="This year I will…"
      />

      <div className="grid grid-cols-2 gap-4">
        {Object.keys(quarterlyOutcomes).map((q) => (
          <Textarea
            key={q}
            placeholder={`${q} outcomes…`}
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

// -----------------------------------------------------
// STEP 5 — CAPACITY
// -----------------------------------------------------
function CapacityStep({ data, onUpdate }: any) {
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
  }, [weeklyAvailableHours, emotionalBandwidth, seasonOfLife]);

  return (
    <div className="space-y-6">
      <SectionHeader icon={Battery} title="Your Capacity" />

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
      <p>{weeklyAvailableHours} hours/week</p>

      <Label>Emotional Bandwidth</Label>
      <div className="flex gap-2">
        {["low", "medium", "high"].map((level) => (
          <Button
            key={level}
            variant={emotionalBandwidth === level ? "default" : "outline"}
            onClick={() => setEmotionalBandwidth(level)}
          >
            {level}
          </Button>
        ))}
      </div>

      <Label>Season of Life</Label>
      <Textarea
        value={seasonOfLife}
        onChange={(e) => setSeasonOfLife(e.target.value)}
      />
    </div>
  );
}

// -----------------------------------------------------
// REUSABLE HEADER
// -----------------------------------------------------
function SectionHeader({ icon: Icon, title }: any) {
  return (
    <div className="text-center mb-8">
      <Icon className="h-12 w-12 mx-auto text-primary mb-4" />
      <h2 className="text-2xl font-semibold">{title}</h2>
    </div>
  );
}

// -----------------------------------------------------
// MAIN ONBOARDING COMPONENT
// -----------------------------------------------------
export default function Onboarding() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const [currentStep, setCurrentStep] = useState(1);

  const [identity, setIdentity] = useState({});
  const [purpose, setPurpose] = useState({});
  const [pillars, setPillars] = useState<SeasonPillar[]>([]);
  const [vision, setVision] = useState({});
  const [capacity, setCapacity] = useState({});

  // ---------------------------------------
  // LOAD SERVER DATA
  // ---------------------------------------
  const { data, isLoading } = useQuery({
    queryKey: ["onboarding-all", user?.uid],
    enabled: !!user,
    queryFn: async () => getOnboardingAll(user!.uid),
  });

  // ---------------------------------------
  // LOAD FIREBASE PROGRESS
  // ---------------------------------------
  const { data: progress } = useQuery({
    queryKey: ["onboarding-progress", user?.uid],
    enabled: !!user,
    queryFn: async () => {
      return await getOnboardingProgress(user!.uid);
    },
  });

  // ---------------------------------------
  // HYDRATE DATA
  // ---------------------------------------
  useEffect(() => {
    if (!data) return;

    setIdentity(data.identity ?? {});
    setPurpose(data.purpose ?? {});
    setPillars(data.seasonPillars ?? []);
    setVision(data.vision ?? {});
    setCapacity(data.capacity ?? {});
  }, [data]);

  // ---------------------------------------
  // HYDRATE STEP FROM FIRESTORE
  // ---------------------------------------
  useEffect(() => {
    if (progress?.currentStep) {
      setCurrentStep(progress.currentStep);
    }
  }, [progress]);

  // ---------------------------------------
  // SAVE FUNCTION (writes directly to Firestore)
  // ---------------------------------------
  const saveCurrentStep = async () => {
    if (!user?.uid) return;
    
    switch (currentStep) {
      case 1:
        await saveIdentity(user.uid, identity);
        await updateOnboardingProgress(user.uid, {
          identityComplete: true,
        });
        break;

      case 2:
        await savePurpose(user.uid, purpose);
        await updateOnboardingProgress(user.uid, {
          purposeComplete: true,
        });
        break;

      case 3:
        await saveSeasonPillars(user.uid, pillars);
        await updateOnboardingProgress(user.uid, {
          pillarsComplete: true,
        });
        break;

      case 4:
        await saveVision(user.uid, vision);
        await updateOnboardingProgress(user.uid, {
          visionComplete: true,
        });
        break;

      case 5:
        await saveCapacity(user.uid, capacity);
        await updateOnboardingProgress(user.uid, {
          capacityComplete: true,
        });
        break;
    }

    queryClient.invalidateQueries();
  };

  // ---------------------------------------
  // NEXT STEP
  // ---------------------------------------
  const handleNext = async () => {
    try {
      await saveCurrentStep();
      const nextStep = Math.min(currentStep + 1, 5);

      await updateOnboardingProgress(user!.uid, {
        currentStep: nextStep,
      });

      setCurrentStep(nextStep);
    } catch (err) {
      toast({
        title: "Error",
        description: "Could not save.",
        variant: "destructive",
      });
    }
  };

  // ---------------------------------------
  // COMPLETE
  // ---------------------------------------
  const handleComplete = async () => {
    try {
      await saveCurrentStep();

      await updateOnboardingProgress(user!.uid, {
        onboardingComplete: true,
      });

      await markOnboardingComplete(user!.uid);

      toast({
        title: "Welcome to Aligned!",
        description: "Your rhythm is ready.",
      });

      navigate("/");
    } catch (err) {
      toast({
        title: "Error",
        description: "Could not finish setup.",
        variant: "destructive",
      });
    }
  };

  // ---------------------------------------
  // SKIP
  // ---------------------------------------
  const handleSkip = async () => {
    await updateOnboardingProgress(user!.uid, {
      onboardingComplete: true,
    });
    await markOnboardingComplete(user!.uid);
    navigate("/");
  };

  // ---------------------------------------
  // LOADING
  // ---------------------------------------
  if (isLoading || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Skeleton className="h-10 w-10" />
      </div>
    );
  }

  const progressPercent = (currentStep / 5) * 100;

  // ---------------------------------------
  // RENDER
  // ---------------------------------------
  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between">
            <h1 className="text-lg font-semibold">Getting Started</h1>
            <Button variant="ghost" size="sm" onClick={handleSkip}>
              Skip for now
            </Button>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>

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

            {/* Navigation */}
            <div className="flex justify-between mt-8 pt-6 border-t">
              <Button
                variant="outline"
                disabled={currentStep === 1}
                onClick={() =>
                  setCurrentStep((prev) => Math.max(prev - 1, 1))
                }
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
