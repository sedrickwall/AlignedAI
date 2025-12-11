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
import { 
  Sparkles, 
  Target, 
  AlertTriangle,
  CheckCircle2,
  XCircle,
  BookOpen,
  Loader2,
  ShieldAlert
} from "lucide-react";
import type { Task } from "@shared/schema";
import { useTaskEvaluator, type TaskEvaluationResponse } from "@/hooks/useTaskEvaluator";
import type { MissionContext } from "../../../shared/taskEval";

interface TaskDiscernmentProps {
  task: Task;
  onClose: () => void;
  isOpen: boolean;
  autoEvaluate?: boolean;
}

const defaultMissionContext: MissionContext = {
  dayMission: "Serve the purpose God has given me today with depth, not distraction.",
  bigThree: [],
  impactLevel: 7,
  timeBudgetMinutes: 480,
};

const severityConfig = {
  green: { 
    label: "Mission Aligned", 
    color: "bg-green-500/10 text-green-700 border-green-200 dark:bg-green-500/20 dark:text-green-400",
    icon: CheckCircle2
  },
  yellow: { 
    label: "Use Discernment", 
    color: "bg-yellow-500/10 text-yellow-700 border-yellow-200 dark:bg-yellow-500/20 dark:text-yellow-400",
    icon: AlertTriangle
  },
  red: { 
    label: "Mission Killer", 
    color: "bg-red-500/10 text-red-700 border-red-200 dark:bg-red-500/20 dark:text-red-400",
    icon: ShieldAlert
  },
};

export function TaskDiscernmentDialog({ task, onClose, isOpen, autoEvaluate = false }: TaskDiscernmentProps) {
  const [result, setResult] = useState<TaskEvaluationResponse | null>(null);
  const [hasAutoTriggered, setHasAutoTriggered] = useState(false);
  const { evaluateTask, isEvaluating, error } = useTaskEvaluator();

  useEffect(() => {
    if (isOpen && autoEvaluate && !hasAutoTriggered && !result && !isEvaluating) {
      setHasAutoTriggered(true);
      handleEvaluate();
    }
  }, [isOpen, autoEvaluate, hasAutoTriggered, result, isEvaluating]);

  const handleEvaluate = async () => {
    const evalResult = await evaluateTask(task.title, defaultMissionContext);
    if (evalResult) {
      setResult(evalResult);
    }
  };

  const handleClose = () => {
    setResult(null);
    setHasAutoTriggered(false);
    onClose();
  };

  const severity = result?.missionEvaluation.severity || "green";
  const SeverityIcon = severityConfig[severity].icon;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Mission Discernment
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

          {!result && !isEvaluating && (
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

          {isEvaluating && (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-2" />
              <p className="text-sm text-muted-foreground">Discerning alignment...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 rounded-md p-3 text-center">
              <XCircle className="h-5 w-5 text-red-500 mx-auto mb-2" />
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              <Button variant="outline" size="sm" className="mt-2" onClick={handleEvaluate}>
                Try Again
              </Button>
            </div>
          )}

          {result && (
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2 py-2">
                <Badge 
                  variant="outline" 
                  className={`text-sm px-3 py-1.5 ${severityConfig[severity].color}`}
                  data-testid="badge-severity"
                >
                  <SeverityIcon className="h-4 w-4 mr-1.5" />
                  {severityConfig[severity].label}
                </Badge>
              </div>

              {result.missionEvaluation.missionKiller && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3">
                  <div className="flex items-start gap-2">
                    <ShieldAlert className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-red-700 dark:text-red-400">
                        Warning: This could derail your mission today
                      </p>
                      <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                        Mission Killer Index: {result.missionEvaluation.MKI.toFixed(1)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <Target className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <span className="text-sm text-muted-foreground">Task Type</span>
                    <Badge variant="secondary" className="ml-2 text-xs capitalize" data-testid="badge-task-type">
                      {result.taskAnalysis.type}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground flex-1 ml-6">Urgency</span>
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${
                      result.taskAnalysis.urgency === 'high' 
                        ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' 
                        : result.taskAnalysis.urgency === 'medium'
                        ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                        : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    }`}
                    data-testid="badge-urgency"
                  >
                    {result.taskAnalysis.urgency}
                  </Badge>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground flex-1 ml-6">Strategic Value</span>
                  <span className="text-sm font-medium">{result.taskAnalysis.strategic_value}/10</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground flex-1 ml-6">Emotional Weight</span>
                  <span className="text-sm font-medium">{result.taskAnalysis.emotional_weight}/10</span>
                </div>
              </div>

              <div className="bg-accent/50 rounded-md p-3 border border-accent">
                <p className="text-sm font-medium text-foreground mb-1">Summary</p>
                <p className="text-sm text-muted-foreground" data-testid="text-summary">
                  {result.taskAnalysis.short_summary}
                </p>
              </div>

              <div className="bg-muted/50 rounded-md p-3">
                <p className="text-sm font-medium text-foreground mb-1">Reason</p>
                <p className="text-sm text-muted-foreground" data-testid="text-reason">
                  {result.missionEvaluation.reason}
                </p>
              </div>

              <div className="bg-primary/5 rounded-md p-3 border border-primary/20">
                <p className="text-sm font-medium text-foreground mb-1">Recommendation</p>
                <p className="text-sm text-muted-foreground" data-testid="text-recommendation">
                  {result.missionEvaluation.recommendation}
                </p>
              </div>

              {result.missionEvaluation.scriptureRefs.length > 0 && (
                <div className="bg-amber-50 dark:bg-amber-900/20 rounded-md p-3 border border-amber-200 dark:border-amber-800">
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    <p className="text-sm font-medium text-amber-700 dark:text-amber-400">Scripture References</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {result.missionEvaluation.scriptureRefs.map((ref, idx) => (
                      <Badge 
                        key={idx} 
                        variant="outline" 
                        className="text-xs bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700"
                        data-testid={`badge-scripture-${idx}`}
                      >
                        {ref}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={handleClose}>
                  Close
                </Button>
              </div>
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
