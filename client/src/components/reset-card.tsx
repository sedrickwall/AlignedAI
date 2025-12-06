import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, Sparkles } from "lucide-react";

interface ResetCardProps {
  onReset: () => void;
}

export function ResetCard({ onReset }: ResetCardProps) {
  return (
    <Card className="shadow-md bg-accent/30 dark:bg-accent/20">
      <CardContent className="p-5">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="h-4 w-4 text-primary" />
              <p className="text-sm font-medium text-foreground">Feeling scattered?</p>
            </div>
            <p className="text-xs text-muted-foreground">
              Take a 5-minute reset to calm your mind and realign your focus.
            </p>
          </div>
          <Button
            onClick={onReset}
            className="shrink-0 rounded-full"
            data-testid="button-reset"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
