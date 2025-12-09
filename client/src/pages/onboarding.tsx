// -----------------------------------------------------
// ONBOARDING PAGE — PARTIAL FIREBASE INTEGRATION (OPTION A)
// -----------------------------------------------------

import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
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
  OnboardingProgress,
  IdentityProfile,
  PurposeProfile,
  SeasonPillar,
  VisionMap,
  CapacityProfile,
} from "@shared/schema";

import {
  getOnboardingProgress,
  updateOnboardingProgress,
  markOnboardingComplete,
} from "@/lib/onboardingFirebase";
import { useAuth } from "@/hooks/useAuth";


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
  data: IdentityProfile | null;
  onUpdate: (updates: Partial<IdentityProfile>) => void;
}) {
  const [gifts, setGifts] = useState(data?.gifts || []);
  const [skills, setSkills] = useState(data?.skills || []);
  const [interests, setInterests] = useState(data?.interests || []);
  const [passions, setPassions] = useState(data?.passions || []);
  const [strongestTalent, setStrongestTalent] = useState(
    data?.strongestTalent || ""
  );

  useEffect(() => {
    onUpdate({ gifts, skills, interests, passions, strongestTalent });
  }, [gifts, skills, interests, passions, strongestTalent]);

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
  data: PurposeProfile | null;
  onUpdate: (updates: Partial<PurposeProfile>) => void;
}) {
  const [whoToBlessing, setWhoToBlessing] = useState(
    data?.whoToBlessing || []
  );
  const [generosityTargets, setGenerosityTargets] = useState<Record<string, number>>(
    (data?.generosityTargets as Record<string, number>) ?? {
      lovedOnes: 25,
      strangers: 25,
      community: 25,
      kingdom: 25,
    }
  );
  const [purposeStatement, setPurposeStatement] = useState(
    data?.purposeStatement || ""
  );

  useEffect(() => {
    onUpdate({ whoToBlessing, generosityTargets, purposeStatement });
  }, [whoToBlessing, generosityTargets, purposeStatement]);

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
  onUpdate,
  onCreatePillar,
  onDeletePillar,
}: {
  data: SeasonPillar[];
  onUpdate: (id: string, updates: Partial<SeasonPillar>) => void;
  onCreatePillar: (name: string) => void;
  onDeletePillar: (id: string) => void;
}) {
  const [newPillarName, setNewPillarName] = useState("");

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
                  onClick={() => onDeletePillar(pillar.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <Textarea
                value={pillar.description || ""}
                onChange={(e) =>
                  onUpdate(pillar.id, { description: e.target.value })
                }
              />

              <Input
                type="number"
                placeholder="Hours per week"
                value={pillar.weeklyHoursBudget ?? ""}
                onChange={(e) =>
                  onUpdate(pillar.id, {
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
          />
          <Button onClick={() => onCreatePillar(newPillarName)}>
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
  data: VisionMap | null;
  onUpdate: (updates: Partial<VisionMap>) => void;
}) {
  const currentYear = new Date().getFullYear();
  const [yearVision, setYearVision] = useState(data?.yearVision || "");
  const [quarterlyOutcomes, setQuarterlyOutcomes] = useState<Record<string, string>>(
    (data?.quarterlyOutcomes as Record<string, string>) ?? {
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
  }, [yearVision, quarterlyOutcomes]);

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
  data: CapacityProfile | null;
  onUpdate: (updates: Partial<CapacityProfile>) => void;
}) {
  const [weeklyAvailableHours, setWeeklyAvailableHours] = useState(
    data?.weeklyAvailableHours || 40
  );

  const [emotionalBandwidth, setEmotionalBandwidth] = useState(
    data?.emotionalBandwidth || "medium"
  );

  const [seasonOfLife, setSeasonOfLife] = useState(
    data?.seasonOfLife || ""
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

  //-----------------------------------------------------
  // LOAD ALL ONBOARDING DATA FROM SERVER
  //-----------------------------------------------------

  interface OnboardingAllData {
    identity: IdentityProfile | null;
    purpose: PurposeProfile | null;
    seasonPillars: SeasonPillar[];
    vision: VisionMap | null;
    capacity: CapacityProfile | null;
  }

  const { data, isLoading: apiLoading } = useQuery<OnboardingAllData>({
    queryKey: ["/api/onboarding/all"],
  });

  //-----------------------------------------------------
  // LOAD PROGRESS FROM FIRESTORE
  //-----------------------------------------------------

  const { data: progress, isLoading: progressLoading, error: progressError } = useQuery({
    queryKey: ["onboarding-progress", user?.uid],
    enabled: !!user,
    queryFn: async () => {
      if (!user) return null;
      try {
        return await getOnboardingProgress(user.uid);
      } catch (err) {
        console.error("Failed to load onboarding progress:", err);
        // Return default state if Firestore fails
        return { onboardingComplete: false, currentStep: 1 };
      }
    },
  });

  // Log any errors for debugging
  if (progressError) {
    console.error("Onboarding progress query error:", progressError);
  }

  //-----------------------------------------------------
  // WHEN FIRESTORE PROGRESS IS LOADED, SYNC STEP
  //-----------------------------------------------------

  useEffect(() => {
    if (progress?.currentStep) {
      setCurrentStep(progress.currentStep);
    }
  }, [progress?.currentStep]);

  //-----------------------------------------------------
  // API MUTATIONS (unchanged)
  //-----------------------------------------------------

  const identityMutation = useMutation({
    mutationFn: async (profileData: Partial<IdentityProfile>) =>
      apiRequest("PATCH", "/api/profile/identity", profileData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/onboarding/all"] });
    },
  });

  const purposeMutation = useMutation({
    mutationFn: async (profileData: Partial<PurposeProfile>) =>
      apiRequest("PATCH", "/api/profile/purpose", profileData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/onboarding/all"] });
    },
  });

  const createPillarMutation = useMutation({
    mutationFn: async (name: string) =>
      apiRequest("POST", "/api/profile/season-pillars", { name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/onboarding/all"] });
    },
  });

  const updatePillarMutation = useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<SeasonPillar>;
    }) => apiRequest("PATCH", `/api/profile/season-pillars/${id}`, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/onboarding/all"] });
    },
  });

  const deletePillarMutation = useMutation({
    mutationFn: async (id: string) =>
      apiRequest("DELETE", `/api/profile/season-pillars/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/onboarding/all"] });
    },
  });

  const visionMutation = useMutation({
    mutationFn: async (visionData: Partial<VisionMap>) =>
      apiRequest("PATCH", "/api/profile/vision", visionData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/onboarding/all"] });
    },
  });

  const capacityMutation = useMutation({
    mutationFn: async (capacityData: Partial<CapacityProfile>) =>
      apiRequest("PATCH", "/api/profile/capacity", capacityData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/onboarding/all"] });
    },
  });

  //-----------------------------------------------------
  // FIREBASE MUTATION (REPLACED progressMutation)
  //-----------------------------------------------------

  const updateProgress = async (updates: Partial<OnboardingProgress>) => {
    if (!user) return;
    await updateOnboardingProgress(user.uid, updates);
    queryClient.invalidateQueries({ queryKey: ["onboarding-progress", user.uid] });
  };

  //-----------------------------------------------------
  // SAVE CURRENT STEP
  //-----------------------------------------------------

  const saveCurrentStep = async () => {
    switch (currentStep) {
      case 1:
        await identityMutation.mutateAsync(pendingData.identity);
        break;
      case 2:
        await purposeMutation.mutateAsync(pendingData.purpose);
        break;
      case 4:
        await visionMutation.mutateAsync(pendingData.vision);
        break;
      case 5:
        await capacityMutation.mutateAsync(pendingData.capacity);
        break;
    }
  };

  //-----------------------------------------------------
  // NEXT STEP
  //-----------------------------------------------------

  const handleNext = async () => {
    try {
      await saveCurrentStep();

      const stepCompletionKey = [
        "identityComplete",
        "purposeComplete",
        "pillarsComplete",
        "visionComplete",
        "capacityComplete",
      ][currentStep - 1];

      await updateProgress({
        currentStep: currentStep + 1,
        [stepCompletionKey]: true,
      });

      setCurrentStep((prev) => prev + 1);
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not save. Try again.",
        variant: "destructive",
      });
    }
  };

  //-----------------------------------------------------
  // COMPLETE SETUP
  //-----------------------------------------------------

  const handleComplete = async () => {
    try {
      await saveCurrentStep();

      await updateProgress({
        capacityComplete: true,
        onboardingComplete: true,
      });

      // ✅ Also mark in Firestore for gating in App.tsx
      if (user?.uid) {
        await markOnboardingComplete(user.uid);
      }

      toast({
        title: "Welcome to Aligned!",
        description: "Your profile is set up. Let's start your journey.",
      });
      setLocation("/");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to complete setup. Please try again.",
        variant: "destructive",
      });
    }
  };


  //-----------------------------------------------------
  // SKIP ONBOARDING
  //-----------------------------------------------------

  const handleSkip = async () => {
    try {
      await updateProgress({ onboardingComplete: true });

      if (user?.uid) {
        await markOnboardingComplete(user.uid);
      }

      setLocation("/");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to skip onboarding. Please try again.",
        variant: "destructive",
      });
    }
  };

  //-----------------------------------------------------
  // LOADING
  //-----------------------------------------------------

  if (apiLoading || progressLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Skeleton className="h-10 w-10 mx-auto" />
      </div>
    );
  }

  //-----------------------------------------------------
  // MAIN RENDER
  //-----------------------------------------------------

  const progressPercent = (currentStep / 5) * 100;

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
              <IdentityStep
                data={data?.identity || null}
                onUpdate={(updates) =>
                  setPendingData((prev) => ({
                    ...prev,
                    identity: { ...prev.identity, ...updates },
                  }))
                }
              />
            )}

            {currentStep === 2 && (
              <PurposeStep
                data={data?.purpose || null}
                onUpdate={(updates) =>
                  setPendingData((prev) => ({
                    ...prev,
                    purpose: { ...prev.purpose, ...updates },
                  }))
                }
              />
            )}

            {currentStep === 3 && (
              <PillarsStep
                data={data?.seasonPillars || []}
                onUpdate={(id, updates) =>
                  updatePillarMutation.mutate({ id, updates })
                }
                onCreatePillar={(name) =>
                  createPillarMutation.mutate(name)
                }
                onDeletePillar={(id) =>
                  deletePillarMutation.mutate(id)
                }
              />
            )}

            {currentStep === 4 && (
              <VisionStep
                data={data?.vision || null}
                onUpdate={(updates) =>
                  setPendingData((prev) => ({
                    ...prev,
                    vision: { ...prev.vision, ...updates },
                  }))
                }
              />
            )}

            {currentStep === 5 && (
              <CapacityStep
                data={data?.capacity || null}
                onUpdate={(updates) =>
                  setPendingData((prev) => ({
                    ...prev,
                    capacity: { ...prev.capacity, ...updates },
                  }))
                }
              />
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
                <Button onClick={handleComplete}>
                  Complete Setup
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
