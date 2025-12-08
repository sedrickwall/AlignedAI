import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { 
  Sparkles, 
  Target, 
  Clock, 
  Heart, 
  Brain,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Loader2
} from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Task } from "@shared/schema";

interface TaskDiscernmentResult {
  pillarAlignment: string;
  monetizationAlignment: boolean;
  purposeAlignment: boolean;
  impactScore: number;
  effortScore: number;
  energyRequirement: "high-brain" | "low-brain";
  decision: "do_today" | "do_this_week" | "next_week" | "backlog" | "assign" | "reject";
  bestTimeSlot: string;
  assignTo: string | null;
  peaceCheck: "aligned" | "stressed" | "unclear";
  reasoning: string;
}

interface TaskDiscernmentProps {
  task: Task;
  onClose: () => void;
  isOpen: boolean;
  autoEvaluate?: boolean;
}

const decisionLabels: Record<string, { label: string; color: string }> = {
  do_today: { label: "Do Today", color: "bg-green-500/10 text-green-700 border-green-200" },
  do_this_week: { label: "This Week", color: "bg-blue-500/10 text-blue-700 border-blue-200" },
  next_week: { label: "Next Week", color: "bg-yellow-500/10 text-yellow-700 border-yellow-200" },
  backlog: { label: "Save for Later", color: "bg-gray-500/10 text-gray-700 border-gray-200" },
  assign: { label: "Consider Delegating", color: "bg-purple-500/10 text-purple-700 border-purple-200" },
  reject: { label: "Let Go", color: "bg-red-500/10 text-red-700 border-red-200" },
};

const peaceLabels: Record<string, { label: string; icon: React.ReactNode }> = {
  aligned: { label: "Peace in your spirit", icon: <Heart className="h-4 w-4 text-green-600" /> },
  stressed: { label: "May cause stress", icon: <AlertCircle className="h-4 w-4 text-amber-600" /> },
  unclear: { label: "Unclear - pray about it", icon: <Brain className="h-4 w-4 text-muted-foreground" /> },
};

export function TaskDiscernmentDialog({ task, onClose, isOpen, autoEvaluate = false }: TaskDiscernmentProps) {
  const [result, setResult] = useState<TaskDiscernmentResult | null>(null);
  const [hasAutoTriggered, setHasAutoTriggered] = useState(false);

  const evaluateMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/ai/task/${task.id}/evaluate`, {});
      return response.json();
    },
    onSuccess: (data) => {
      setResult(data);
    },
  });

  useEffect(() => {
    if (isOpen && autoEvaluate && !hasAutoTriggered && !result && !evaluateMutation.isPending) {
      setHasAutoTriggered(true);
      evaluateMutation.mutate();
    }
  }, [isOpen, autoEvaluate, hasAutoTriggered, result, evaluateMutation]);

  const handleEvaluate = () => {
    evaluateMutation.mutate();
  };

  const handleClose = () => {
    setResult(null);
    setHasAutoTriggered(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Task Discernment
          </DialogTitle>
          <DialogDescription>
            AI evaluation to help you decide if this task aligns with your calling.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-muted/50 rounded-md p-3">
            <p className="text-sm font-medium text-foreground" data-testid="text-discernment-task-title">
              {task.title}
            </p>
          </div>

          {!result && !evaluateMutation.isPending && (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground mb-4">
                Get AI guidance on whether this task fits your current season and calling.
              </p>
              <Button onClick={handleEvaluate} data-testid="button-evaluate-task">
                <Sparkles className="h-4 w-4 mr-2" />
                Evaluate This Task
              </Button>
            </div>
          )}

          {evaluateMutation.isPending && (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-2" />
              <p className="text-sm text-muted-foreground">Discerning alignment...</p>
            </div>
          )}

          {result && (
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2 py-2">
                <Badge 
                  variant="outline" 
                  className={`text-sm px-3 py-1 ${decisionLabels[result.decision]?.color || ''}`}
                  data-testid="badge-decision"
                >
                  {decisionLabels[result.decision]?.label || result.decision}
                </Badge>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground flex-1">Pillar Alignment</span>
                  <Badge variant="secondary" className="text-xs" data-testid="badge-pillar">
                    {result.pillarAlignment || "None"}
                  </Badge>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground flex-1 ml-6">Impact Score</span>
                  <div className="flex items-center gap-2">
                    <Progress value={result.impactScore * 10} className="w-16 h-2" />
                    <span className="text-sm font-medium w-6">{result.impactScore}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground flex-1 ml-6">Effort Required</span>
                  <div className="flex items-center gap-2">
                    <Progress value={result.effortScore * 10} className="w-16 h-2" />
                    <span className="text-sm font-medium w-6">{result.effortScore}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Brain className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground flex-1">Energy Type</span>
                  <Badge variant="outline" className="text-xs" data-testid="badge-energy">
                    {result.energyRequirement === "high-brain" ? "Deep Focus" : "Light Work"}
                  </Badge>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground flex-1">Best Time</span>
                  <span className="text-sm text-foreground" data-testid="text-best-time">
                    {result.bestTimeSlot}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {peaceLabels[result.peaceCheck]?.icon}
                  <span className="text-sm" data-testid="text-peace-check">
                    {peaceLabels[result.peaceCheck]?.label || result.peaceCheck}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <CheckCircle2 className={`h-4 w-4 ${result.purposeAlignment ? 'text-green-600' : 'text-muted-foreground'}`} />
                  <span className="text-sm">
                    {result.purposeAlignment ? "Aligns with your purpose" : "May not align with purpose"}
                  </span>
                </div>

                {result.monetizationAlignment && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-700">Supports income goals</span>
                  </div>
                )}
              </div>

              <div className="bg-accent/50 rounded-md p-3 border border-accent">
                <p className="text-sm text-foreground" data-testid="text-reasoning">
                  {result.reasoning}
                </p>
              </div>

              {result.assignTo && (
                <p className="text-sm text-muted-foreground">
                  Consider delegating to: <span className="font-medium">{result.assignTo}</span>
                </p>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface TaskDiscernmentButtonProps {
  task: Task;
}

export function TaskDiscernmentButton({ task }: TaskDiscernmentButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(true)}
        className="h-7 w-7"
        title="Get AI guidance on this task"
        data-testid={`button-discern-task-${task.id}`}
      >
        <Sparkles className="h-3 w-3" />
      </Button>
      <TaskDiscernmentDialog 
        task={task} 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
      />
    </>
  );
}
