import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Target, 
  RefreshCw, 
  Sparkles, 
  Calendar, 
  CheckCircle2,
  Clock,
  TrendingUp,
  Heart,
  Lightbulb,
  ArrowRight
} from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";

interface MonetizationResult {
  primaryPath: string;
  rationale: {
    giftAlignment: number;
    skillAlignment: number;
    impactPotential: number;
    effortLevel: number;
    explanation: string;
  };
  monthPlans: {
    month1: { focus: string; milestones: string[] };
    month2: { focus: string; milestones: string[] };
    month3: { focus: string; milestones: string[] };
  };
  weeklyActions: string[];
  secondaryOpportunities: string[];
  deferredItems: string[];
  encouragement: string;
}

function MonetizationSkeleton() {
  return (
    <Card className="shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5" />
          <Skeleton className="h-6 w-48" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-24 w-full" />
      </CardContent>
    </Card>
  );
}

function AlignmentScore({ label, score, icon: Icon }: { label: string; score: number; icon: React.ElementType }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-4 w-4 text-muted-foreground" />
      <span className="text-sm text-muted-foreground flex-1">{label}</span>
      <div className="flex items-center gap-2">
        <Progress value={score * 10} className="w-16 h-2" />
        <span className="text-sm font-medium w-6">{score}</span>
      </div>
    </div>
  );
}

function MonthCard({ 
  month, 
  focus, 
  milestones,
  isActive 
}: { 
  month: string; 
  focus: string; 
  milestones: string[];
  isActive: boolean;
}) {
  return (
    <div className={`p-4 rounded-md border ${isActive ? 'border-primary bg-primary/5' : 'border-border'}`}>
      <div className="flex items-center gap-2 mb-2">
        <Calendar className="h-4 w-4 text-primary" />
        <span className="font-medium text-sm">{month}</span>
        {isActive && <Badge variant="secondary" className="text-xs">Current</Badge>}
      </div>
      <p className="text-sm text-foreground mb-2">{focus}</p>
      <ul className="space-y-1">
        {milestones.slice(0, 3).map((milestone, i) => (
          <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
            <CheckCircle2 className="h-3 w-3 mt-0.5 text-primary/60 flex-shrink-0" />
            <span>{milestone}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function MonetizationDashboard() {
  const currentMonth = new Date().getMonth();
  const currentQuarterMonth = currentMonth % 3;

  const { data, isLoading, isError } = useQuery<MonetizationResult>({
    queryKey: ["/api/ai/monetization"],
    staleTime: 10 * 60 * 1000,
  });

  const generateMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/ai/monetization/generate", {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ai/monetization"] });
    },
  });

  if (isLoading) {
    return <MonetizationSkeleton />;
  }

  if (isError || !data) {
    return (
      <Card className="shadow-md">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg" data-testid="text-monetization-title">
                90-Day Income Path
              </CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 space-y-3">
            <p className="text-muted-foreground">
              Generate your personalized income pathway based on your gifts, skills, and capacity.
            </p>
            <Button 
              onClick={() => generateMutation.mutate()}
              disabled={generateMutation.isPending}
              data-testid="button-generate-monetization"
            >
              {generateMutation.isPending ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate My Path
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg" data-testid="text-monetization-title">
              90-Day Income Path
            </CardTitle>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => generateMutation.mutate()}
            disabled={generateMutation.isPending}
            data-testid="button-refresh-monetization"
          >
            <RefreshCw className={`h-4 w-4 ${generateMutation.isPending ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-primary/5 rounded-md p-4 border border-primary/10">
          <div className="flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-foreground mb-1" data-testid="text-primary-path">
                {data.primaryPath}
              </h4>
              <p className="text-sm text-muted-foreground" data-testid="text-path-explanation">
                {data.rationale.explanation}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-medium text-foreground">Alignment Scores</h4>
          <div className="space-y-2">
            <AlignmentScore label="Gift Alignment" score={data.rationale.giftAlignment} icon={Heart} />
            <AlignmentScore label="Skill Alignment" score={data.rationale.skillAlignment} icon={Lightbulb} />
            <AlignmentScore label="Impact Potential" score={data.rationale.impactPotential} icon={TrendingUp} />
            <AlignmentScore label="Effort Level" score={10 - data.rationale.effortLevel} icon={Clock} />
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-medium text-foreground">Your 90-Day Journey</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <MonthCard 
              month="Month 1" 
              focus={data.monthPlans.month1.focus} 
              milestones={data.monthPlans.month1.milestones}
              isActive={currentQuarterMonth === 0}
            />
            <MonthCard 
              month="Month 2" 
              focus={data.monthPlans.month2.focus} 
              milestones={data.monthPlans.month2.milestones}
              isActive={currentQuarterMonth === 1}
            />
            <MonthCard 
              month="Month 3" 
              focus={data.monthPlans.month3.focus} 
              milestones={data.monthPlans.month3.milestones}
              isActive={currentQuarterMonth === 2}
            />
          </div>
        </div>

        {data.weeklyActions && data.weeklyActions.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-foreground">This Week's Revenue Actions</h4>
            <ul className="space-y-2">
              {data.weeklyActions.slice(0, 5).map((action, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <ArrowRight className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                  <span data-testid={`text-weekly-action-${i}`}>{action}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {data.encouragement && (
          <div className="bg-accent/50 rounded-md p-4 border border-accent">
            <p className="text-sm text-foreground italic" data-testid="text-encouragement">
              {data.encouragement}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
