import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, RefreshCw, Lightbulb } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface AISuggestionCardProps {
  suggestion: string;
  reasoning: string;
  focusPillar: string;
  isLoading: boolean;
  onRefresh: () => void;
  isRefreshing: boolean;
  hasError?: boolean;
}

export function AISuggestionCard({
  suggestion,
  reasoning,
  focusPillar,
  isLoading,
  onRefresh,
  isRefreshing,
  hasError = false,
}: AISuggestionCardProps) {
  if (isLoading) {
    return (
      <Card className="shadow-md bg-primary/5 border-primary/10">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-4 w-4 text-primary" />
            <Skeleton className="h-5 w-32" />
          </div>
          <Skeleton className="h-16 w-full mb-3" />
          <Skeleton className="h-4 w-48" />
        </CardContent>
      </Card>
    );
  }

  const hasSuggestion = suggestion && suggestion.trim().length > 0;

  return (
    <Card className="shadow-md bg-primary/5 border-primary/10">
      <CardContent className="p-5">
        <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <h3 className="font-medium text-foreground" data-testid="text-ai-heading">
              Today's Focus
            </h3>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onRefresh}
            disabled={isRefreshing}
            data-testid="button-refresh-ai"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        
        {hasSuggestion ? (
          <>
            <p className="text-foreground mb-3" data-testid="text-ai-suggestion">
              {suggestion}
            </p>
            
            <div className="flex items-start gap-2 text-sm text-muted-foreground">
              <Lightbulb className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <p data-testid="text-ai-reasoning">{reasoning}</p>
            </div>
            
            {focusPillar && (
              <div className="mt-3 pt-3 border-t border-primary/10">
                <span className="text-xs text-muted-foreground">Priority pillar: </span>
                <span className="text-xs font-medium text-primary" data-testid="text-focus-pillar">
                  {focusPillar}
                </span>
              </div>
            )}
          </>
        ) : hasError ? (
          <p className="text-destructive" data-testid="text-ai-error">
            Unable to get AI suggestions right now. Click refresh to try again.
          </p>
        ) : (
          <p className="text-muted-foreground" data-testid="text-ai-unavailable">
            AI suggestions are being prepared. Click refresh to try again.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
