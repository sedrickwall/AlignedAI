import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Battery
} from "lucide-react";
import type { 
  OnboardingProgress, 
  IdentityProfile, 
  PurposeProfile, 
  SeasonPillar, 
  VisionMap, 
  CapacityProfile 
} from "@shared/schema";

interface OnboardingData {
  progress: OnboardingProgress | null;
  identity: IdentityProfile | null;
  purpose: PurposeProfile | null;
  seasonPillars: SeasonPillar[];
  vision: VisionMap | null;
  capacity: CapacityProfile | null;
}

const stepInfo = [
  { 
    number: 1, 
    title: "Your Identity", 
    description: "Discover your God-given gifts and developed skills",
    icon: Sparkles
  },
  { 
    number: 2, 
    title: "Your Purpose", 
    description: "Define who you're called to serve and bless",
    icon: Heart
  },
  { 
    number: 3, 
    title: "Season Pillars", 
    description: "Set your focus areas for this season of life",
    icon: Target
  },
  { 
    number: 4, 
    title: "Your Vision", 
    description: "Map out your year with intentional goals",
    icon: Calendar
  },
  { 
    number: 5, 
    title: "Your Capacity", 
    description: "Understand your energy and availability",
    icon: Battery
  },
];

function TagInput({ 
  value, 
  onChange, 
  placeholder,
  testId
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

  const removeTag = (tagToRemove: string) => {
    onChange(value.filter(tag => tag !== tagToRemove));
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {value.map((tag) => (
          <Badge key={tag} variant="secondary" className="gap-1">
            {tag}
            <button 
              type="button"
              onClick={() => removeTag(tag)}
              className="ml-1 hover:text-destructive"
              data-testid={`button-remove-tag-${tag}`}
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>
      <Input
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        data-testid={testId}
      />
      <p className="text-xs text-muted-foreground">Press Enter to add</p>
    </div>
  );
}

function IdentityStep({ 
  data, 
  onUpdate 
}: { 
  data: IdentityProfile | null; 
  onUpdate: (data: Partial<IdentityProfile>) => void;
}) {
  const [gifts, setGifts] = useState<string[]>(data?.gifts || []);
  const [skills, setSkills] = useState<string[]>(data?.skills || []);
  const [interests, setInterests] = useState<string[]>(data?.interests || []);
  const [passions, setPassions] = useState<string[]>(data?.passions || []);
  const [strongestTalent, setStrongestTalent] = useState(data?.strongestTalent || "");

  useEffect(() => {
    onUpdate({ gifts, skills, interests, passions, strongestTalent });
  }, [gifts, skills, interests, passions, strongestTalent]);

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <Sparkles className="h-12 w-12 mx-auto text-primary mb-4" />
        <h2 className="text-2xl font-semibold">Discover Your Identity</h2>
        <p className="text-muted-foreground mt-2">
          God has uniquely designed you with gifts and abilities. Let's explore them together.
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <Label className="text-base font-medium">Spiritual Gifts</Label>
          <p className="text-sm text-muted-foreground mb-2">
            Natural abilities given by God (e.g., teaching, encouragement, wisdom)
          </p>
          <TagInput 
            value={gifts} 
            onChange={setGifts} 
            placeholder="Add a gift..."
            testId="input-gift"
          />
        </div>

        <div>
          <Label className="text-base font-medium">Developed Skills</Label>
          <p className="text-sm text-muted-foreground mb-2">
            Abilities you've cultivated through practice (e.g., writing, design, coaching)
          </p>
          <TagInput 
            value={skills} 
            onChange={setSkills} 
            placeholder="Add a skill..."
            testId="input-skill"
          />
        </div>

        <div>
          <Label className="text-base font-medium">Interests</Label>
          <p className="text-sm text-muted-foreground mb-2">
            Topics and activities that light you up
          </p>
          <TagInput 
            value={interests} 
            onChange={setInterests} 
            placeholder="Add an interest..."
            testId="input-interest"
          />
        </div>

        <div>
          <Label className="text-base font-medium">Passions</Label>
          <p className="text-sm text-muted-foreground mb-2">
            Causes and issues that grab your heart
          </p>
          <TagInput 
            value={passions} 
            onChange={setPassions} 
            placeholder="Add a passion..."
            testId="input-passion"
          />
        </div>

        <div>
          <Label className="text-base font-medium">Your Strongest Talent</Label>
          <p className="text-sm text-muted-foreground mb-2">
            The unique combination of your gifts and skills that sets you apart
          </p>
          <Textarea
            value={strongestTalent}
            onChange={(e) => setStrongestTalent(e.target.value)}
            placeholder="Describe your strongest talent..."
            className="min-h-[100px]"
            data-testid="textarea-strongest-talent"
          />
        </div>
      </div>
    </div>
  );
}

function PurposeStep({ 
  data, 
  onUpdate 
}: { 
  data: PurposeProfile | null; 
  onUpdate: (data: Partial<PurposeProfile>) => void;
}) {
  const [whoToBlessing, setWhoToBlessing] = useState<string[]>(data?.whoToBlessing || []);
  const [generosityTargets, setGenerosityTargets] = useState<Record<string, number>>(
    (data?.generosityTargets as Record<string, number>) || {
      lovedOnes: 25,
      strangers: 25,
      community: 25,
      kingdom: 25
    }
  );
  const [purposeStatement, setPurposeStatement] = useState(data?.purposeStatement || "");

  useEffect(() => {
    onUpdate({ whoToBlessing, generosityTargets, purposeStatement });
  }, [whoToBlessing, generosityTargets, purposeStatement]);

  const updateGenerosity = (key: string, value: number) => {
    setGenerosityTargets(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <Heart className="h-12 w-12 mx-auto text-primary mb-4" />
        <h2 className="text-2xl font-semibold">Define Your Purpose</h2>
        <p className="text-muted-foreground mt-2">
          Who has God called you to serve and bless in this season?
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <Label className="text-base font-medium">Who Will You Bless?</Label>
          <p className="text-sm text-muted-foreground mb-2">
            Specific groups or types of people you feel called to serve
          </p>
          <TagInput 
            value={whoToBlessing} 
            onChange={setWhoToBlessing} 
            placeholder="Add a group (e.g., busy moms, entrepreneurs)..."
            testId="input-who-to-bless"
          />
        </div>

        <div>
          <Label className="text-base font-medium">Generosity Distribution</Label>
          <p className="text-sm text-muted-foreground mb-4">
            How do you want to distribute your time and resources?
          </p>
          <div className="grid grid-cols-2 gap-4">
            {[
              { key: "lovedOnes", label: "Loved Ones" },
              { key: "strangers", label: "Strangers" },
              { key: "community", label: "Community" },
              { key: "kingdom", label: "Kingdom Work" },
            ].map(({ key, label }) => (
              <div key={key} className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <Label className="text-sm">{label}</Label>
                  <span className="text-sm text-muted-foreground">{generosityTargets[key]}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={generosityTargets[key]}
                  onChange={(e) => updateGenerosity(key, parseInt(e.target.value))}
                  className="w-full accent-primary"
                  data-testid={`slider-generosity-${key}`}
                />
              </div>
            ))}
          </div>
        </div>

        <div>
          <Label className="text-base font-medium">Purpose Statement</Label>
          <p className="text-sm text-muted-foreground mb-2">
            A simple statement that captures your calling
          </p>
          <Textarea
            value={purposeStatement}
            onChange={(e) => setPurposeStatement(e.target.value)}
            placeholder="I exist to... (e.g., I exist to help women discover their God-given purpose and build sustainable businesses)"
            className="min-h-[120px]"
            data-testid="textarea-purpose-statement"
          />
        </div>
      </div>
    </div>
  );
}

function PillarsStep({ 
  data, 
  onUpdate,
  onCreatePillar,
  onDeletePillar
}: { 
  data: SeasonPillar[]; 
  onUpdate: (id: string, updates: Partial<SeasonPillar>) => void;
  onCreatePillar: (name: string) => void;
  onDeletePillar: (id: string) => void;
}) {
  const [newPillarName, setNewPillarName] = useState("");

  const defaultPillars = [
    "Faith", "Family", "Health", "Business", "Relationships", "Personal Growth"
  ];

  const handleAddPillar = () => {
    if (newPillarName.trim()) {
      onCreatePillar(newPillarName.trim());
      setNewPillarName("");
    }
  };

  const handleAddSuggested = (name: string) => {
    if (!data.some(p => p.name.toLowerCase() === name.toLowerCase())) {
      onCreatePillar(name);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <Target className="h-12 w-12 mx-auto text-primary mb-4" />
        <h2 className="text-2xl font-semibold">Set Your Season Pillars</h2>
        <p className="text-muted-foreground mt-2">
          Define 4-6 focus areas that represent your priorities for this season.
        </p>
      </div>

      <div className="space-y-4">
        <Label className="text-base font-medium">Suggested Pillars</Label>
        <div className="flex flex-wrap gap-2">
          {defaultPillars.map(name => (
            <Button
              key={name}
              variant="outline"
              size="sm"
              onClick={() => handleAddSuggested(name)}
              disabled={data.some(p => p.name.toLowerCase() === name.toLowerCase())}
              data-testid={`button-add-suggested-${name.toLowerCase()}`}
            >
              <Plus className="h-3 w-3 mr-1" />
              {name}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <Label className="text-base font-medium">Your Pillars ({data.length}/6)</Label>
        
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">
            Add pillars from suggestions above or create your own below.
          </p>
        ) : (
          <div className="space-y-3">
            {data.map((pillar) => (
              <Card key={pillar.id} className="shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium">{pillar.name}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDeletePillar(pillar.id)}
                          className="h-8 w-8"
                          data-testid={`button-delete-pillar-${pillar.id}`}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <div>
                        <Textarea
                          value={pillar.description || ""}
                          onChange={(e) => onUpdate(pillar.id, { description: e.target.value })}
                          placeholder="Describe what this pillar means to you..."
                          className="min-h-[60px] text-sm"
                          data-testid={`textarea-pillar-description-${pillar.id}`}
                        />
                      </div>
                      <div className="flex items-center gap-4">
                        <Label className="text-sm whitespace-nowrap">Weekly hours:</Label>
                        <Input
                          type="number"
                          min="0"
                          max="168"
                          value={pillar.weeklyHoursBudget || ""}
                          onChange={(e) => onUpdate(pillar.id, { weeklyHoursBudget: parseInt(e.target.value) || 0 })}
                          className="w-20"
                          data-testid={`input-pillar-hours-${pillar.id}`}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <Input
            value={newPillarName}
            onChange={(e) => setNewPillarName(e.target.value)}
            placeholder="Add a custom pillar..."
            onKeyDown={(e) => e.key === "Enter" && handleAddPillar()}
            data-testid="input-new-pillar"
          />
          <Button 
            onClick={handleAddPillar} 
            disabled={!newPillarName.trim() || data.length >= 6}
            data-testid="button-add-pillar"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function VisionStep({ 
  data, 
  onUpdate 
}: { 
  data: VisionMap | null; 
  onUpdate: (data: Partial<VisionMap>) => void;
}) {
  const currentYear = new Date().getFullYear();
  const [yearVision, setYearVision] = useState(data?.yearVision || "");
  const [quarterlyOutcomes, setQuarterlyOutcomes] = useState<Record<string, string>>(
    (data?.quarterlyOutcomes as Record<string, string>) || { Q1: "", Q2: "", Q3: "", Q4: "" }
  );

  useEffect(() => {
    onUpdate({ yearVision, quarterlyOutcomes, year: currentYear });
  }, [yearVision, quarterlyOutcomes]);

  const updateQuarter = (quarter: string, value: string) => {
    setQuarterlyOutcomes(prev => ({ ...prev, [quarter]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <Calendar className="h-12 w-12 mx-auto text-primary mb-4" />
        <h2 className="text-2xl font-semibold">Map Your Vision for {currentYear}</h2>
        <p className="text-muted-foreground mt-2">
          What do you want to accomplish this year?
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <Label className="text-base font-medium">Year Vision</Label>
          <p className="text-sm text-muted-foreground mb-2">
            Paint a picture of what success looks like at the end of this year
          </p>
          <Textarea
            value={yearVision}
            onChange={(e) => setYearVision(e.target.value)}
            placeholder="By the end of this year, I will have..."
            className="min-h-[120px]"
            data-testid="textarea-year-vision"
          />
        </div>

        <div>
          <Label className="text-base font-medium">Quarterly Outcomes</Label>
          <p className="text-sm text-muted-foreground mb-4">
            Break your vision into quarterly milestones
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {["Q1", "Q2", "Q3", "Q4"].map((quarter) => (
              <div key={quarter}>
                <Label className="text-sm font-medium mb-1 block">{quarter}</Label>
                <Textarea
                  value={quarterlyOutcomes[quarter] || ""}
                  onChange={(e) => updateQuarter(quarter, e.target.value)}
                  placeholder={`${quarter} focus and outcomes...`}
                  className="min-h-[80px]"
                  data-testid={`textarea-quarter-${quarter.toLowerCase()}`}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function CapacityStep({ 
  data, 
  onUpdate 
}: { 
  data: CapacityProfile | null; 
  onUpdate: (data: Partial<CapacityProfile>) => void;
}) {
  const [weeklyAvailableHours, setWeeklyAvailableHours] = useState(data?.weeklyAvailableHours || 40);
  const [emotionalBandwidth, setEmotionalBandwidth] = useState(data?.emotionalBandwidth || "medium");
  const [seasonOfLife, setSeasonOfLife] = useState(data?.seasonOfLife || "");
  const [energyWindows, setEnergyWindows] = useState<Record<string, string>>(
    (data?.energyWindows as Record<string, string>) || {
      peakHours: "",
      lowHours: ""
    }
  );
  const [fixedRoutines, setFixedRoutines] = useState<string[]>(
    Array.isArray(data?.fixedRoutines) ? data.fixedRoutines as string[] : []
  );
  const [newRoutine, setNewRoutine] = useState("");

  useEffect(() => {
    onUpdate({ weeklyAvailableHours, emotionalBandwidth, seasonOfLife, energyWindows, fixedRoutines });
  }, [weeklyAvailableHours, emotionalBandwidth, seasonOfLife, energyWindows, fixedRoutines]);

  const handleAddRoutine = () => {
    if (newRoutine.trim() && !fixedRoutines.includes(newRoutine.trim())) {
      setFixedRoutines([...fixedRoutines, newRoutine.trim()]);
      setNewRoutine("");
    }
  };

  const removeRoutine = (routine: string) => {
    setFixedRoutines(fixedRoutines.filter(r => r !== routine));
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <Battery className="h-12 w-12 mx-auto text-primary mb-4" />
        <h2 className="text-2xl font-semibold">Understand Your Capacity</h2>
        <p className="text-muted-foreground mt-2">
          Be honest about your current season and energy levels.
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <Label className="text-base font-medium">Season of Life</Label>
          <p className="text-sm text-muted-foreground mb-2">
            Describe your current life season
          </p>
          <Textarea
            value={seasonOfLife}
            onChange={(e) => setSeasonOfLife(e.target.value)}
            placeholder="e.g., New mom with a toddler, building a business while working full-time..."
            className="min-h-[80px]"
            data-testid="textarea-season-of-life"
          />
        </div>

        <div>
          <Label className="text-base font-medium">Weekly Available Hours</Label>
          <p className="text-sm text-muted-foreground mb-2">
            How many hours per week can you realistically dedicate to your goals?
          </p>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="5"
              max="60"
              value={weeklyAvailableHours}
              onChange={(e) => setWeeklyAvailableHours(parseInt(e.target.value))}
              className="flex-1 accent-primary"
              data-testid="slider-weekly-hours"
            />
            <span className="text-lg font-medium w-16 text-right">{weeklyAvailableHours}h</span>
          </div>
        </div>

        <div>
          <Label className="text-base font-medium">Emotional Bandwidth</Label>
          <p className="text-sm text-muted-foreground mb-2">
            How much emotional capacity do you have right now?
          </p>
          <div className="flex gap-2">
            {["low", "medium", "high"].map((level) => (
              <Button
                key={level}
                variant={emotionalBandwidth === level ? "default" : "outline"}
                onClick={() => setEmotionalBandwidth(level)}
                className="flex-1 capitalize"
                data-testid={`button-bandwidth-${level}`}
              >
                {level}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium">Peak Energy Hours</Label>
            <Input
              value={energyWindows.peakHours || ""}
              onChange={(e) => setEnergyWindows(prev => ({ ...prev, peakHours: e.target.value }))}
              placeholder="e.g., 6am-10am"
              data-testid="input-peak-hours"
            />
          </div>
          <div>
            <Label className="text-sm font-medium">Low Energy Hours</Label>
            <Input
              value={energyWindows.lowHours || ""}
              onChange={(e) => setEnergyWindows(prev => ({ ...prev, lowHours: e.target.value }))}
              placeholder="e.g., 2pm-4pm"
              data-testid="input-low-hours"
            />
          </div>
        </div>

        <div>
          <Label className="text-base font-medium">Fixed Commitments</Label>
          <p className="text-sm text-muted-foreground mb-2">
            Non-negotiable activities each week (e.g., church, kids activities)
          </p>
          <div className="flex flex-wrap gap-2 mb-2">
            {fixedRoutines.map((routine) => (
              <Badge key={routine} variant="secondary" className="gap-1">
                {routine}
                <button 
                  type="button"
                  onClick={() => removeRoutine(routine)}
                  className="ml-1 hover:text-destructive"
                  data-testid={`button-remove-routine-${routine}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={newRoutine}
              onChange={(e) => setNewRoutine(e.target.value)}
              placeholder="Add a commitment..."
              onKeyDown={(e) => e.key === "Enter" && handleAddRoutine()}
              data-testid="input-new-routine"
            />
            <Button onClick={handleAddRoutine} size="icon" data-testid="button-add-routine">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
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
    capacity: {}
  });

  const { data, isLoading } = useQuery<OnboardingData>({
    queryKey: ["/api/onboarding/all"],
  });

  useEffect(() => {
    if (data?.progress?.currentStep) {
      setCurrentStep(data.progress.currentStep);
    }
  }, [data?.progress?.currentStep]);

  const identityMutation = useMutation({
    mutationFn: async (profileData: Partial<IdentityProfile>) => {
      return apiRequest("PATCH", "/api/profile/identity", profileData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/onboarding/all"] });
    },
  });

  const purposeMutation = useMutation({
    mutationFn: async (profileData: Partial<PurposeProfile>) => {
      return apiRequest("PATCH", "/api/profile/purpose", profileData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/onboarding/all"] });
    },
  });

  const createPillarMutation = useMutation({
    mutationFn: async (name: string) => {
      return apiRequest("POST", "/api/profile/season-pillars", { name });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/onboarding/all"] });
    },
  });

  const updatePillarMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<SeasonPillar> }) => {
      return apiRequest("PATCH", `/api/profile/season-pillars/${id}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/onboarding/all"] });
    },
  });

  const deletePillarMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/profile/season-pillars/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/onboarding/all"] });
    },
  });

  const visionMutation = useMutation({
    mutationFn: async (visionData: Partial<VisionMap>) => {
      return apiRequest("PATCH", "/api/profile/vision", visionData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/onboarding/all"] });
    },
  });

  const capacityMutation = useMutation({
    mutationFn: async (capacityData: Partial<CapacityProfile>) => {
      return apiRequest("PATCH", "/api/profile/capacity", capacityData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/onboarding/all"] });
    },
  });

  const progressMutation = useMutation({
    mutationFn: async (progressData: Partial<OnboardingProgress>) => {
      return apiRequest("PATCH", "/api/onboarding/progress", progressData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/onboarding/all"] });
      queryClient.invalidateQueries({ queryKey: ["/api/onboarding/progress"] });
    },
  });

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

  const handleNext = async () => {
    try {
      await saveCurrentStep();
      
      const stepCompletionKey = [
        "identityComplete",
        "purposeComplete",
        "pillarsComplete",
        "visionComplete",
        "capacityComplete"
      ][currentStep - 1];

      await progressMutation.mutateAsync({
        currentStep: currentStep + 1,
        [stepCompletionKey]: true
      });

      if (currentStep < 5) {
        setCurrentStep(currentStep + 1);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save your progress. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    try {
      await saveCurrentStep();
      await progressMutation.mutateAsync({
        capacityComplete: true,
        onboardingComplete: true
      });
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

  const handleSkip = () => {
    progressMutation.mutate({ onboardingComplete: true });
    setLocation("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-full max-w-2xl px-4 space-y-6">
          <Skeleton className="h-2 w-full" />
          <Card className="shadow-lg">
            <CardContent className="p-8 space-y-6">
              <Skeleton className="h-12 w-12 mx-auto rounded-full" />
              <Skeleton className="h-8 w-48 mx-auto" />
              <Skeleton className="h-4 w-64 mx-auto" />
              <div className="space-y-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const progress = (currentStep / 5) * 100;

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="mb-8">
          <div className="flex items-center justify-between gap-4 mb-2">
            <h1 className="text-lg font-semibold text-foreground">Getting Started</h1>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleSkip}
              data-testid="button-skip-onboarding"
            >
              Skip for now
            </Button>
          </div>
          <Progress value={progress} className="h-2" data-testid="progress-onboarding" />
          <div className="flex justify-between mt-2">
            {stepInfo.map((step) => (
              <div 
                key={step.number}
                className={`text-xs ${currentStep >= step.number ? 'text-primary' : 'text-muted-foreground'}`}
              >
                {step.number}
              </div>
            ))}
          </div>
        </div>

        <Card className="shadow-lg">
          <CardContent className="p-6 md:p-8">
            {currentStep === 1 && (
              <IdentityStep 
                data={data?.identity || null} 
                onUpdate={(updates) => setPendingData(prev => ({ 
                  ...prev, 
                  identity: { ...prev.identity, ...updates } 
                }))}
              />
            )}
            {currentStep === 2 && (
              <PurposeStep 
                data={data?.purpose || null} 
                onUpdate={(updates) => setPendingData(prev => ({ 
                  ...prev, 
                  purpose: { ...prev.purpose, ...updates } 
                }))}
              />
            )}
            {currentStep === 3 && (
              <PillarsStep 
                data={data?.seasonPillars || []} 
                onUpdate={(id, updates) => updatePillarMutation.mutate({ id, updates })}
                onCreatePillar={(name) => createPillarMutation.mutate(name)}
                onDeletePillar={(id) => deletePillarMutation.mutate(id)}
              />
            )}
            {currentStep === 4 && (
              <VisionStep 
                data={data?.vision || null} 
                onUpdate={(updates) => setPendingData(prev => ({ 
                  ...prev, 
                  vision: { ...prev.vision, ...updates } 
                }))}
              />
            )}
            {currentStep === 5 && (
              <CapacityStep 
                data={data?.capacity || null} 
                onUpdate={(updates) => setPendingData(prev => ({ 
                  ...prev, 
                  capacity: { ...prev.capacity, ...updates } 
                }))}
              />
            )}

            <div className="flex items-center justify-between gap-4 mt-8 pt-6 border-t">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 1}
                data-testid="button-back"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back
              </Button>

              {currentStep < 5 ? (
                <Button 
                  onClick={handleNext}
                  disabled={identityMutation.isPending || purposeMutation.isPending || visionMutation.isPending}
                  data-testid="button-next"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              ) : (
                <Button 
                  onClick={handleComplete}
                  disabled={capacityMutation.isPending || progressMutation.isPending}
                  data-testid="button-complete"
                >
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
