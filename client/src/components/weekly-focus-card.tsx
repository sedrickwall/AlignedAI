import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Focus, CheckCircle2 } from "lucide-react";

interface WeeklyFocusCardProps {
  focusStatement: string;
  topFive: string[];
}

export function WeeklyFocusCard({ focusStatement, topFive }: WeeklyFocusCardProps) {
  return (
    <Card className="shadow-md">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <Focus className="h-4 w-4 text-primary" />
          Weekly Focus
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-4">
        <p
          className="text-sm text-muted-foreground italic leading-relaxed"
          data-testid="text-focus-statement"
        >
          "{focusStatement}"
        </p>
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-medium">
            Top 5 This Week
          </p>
          <ul className="space-y-1.5">
            {topFive.map((item, index) => (
              <li
                key={index}
                className="flex items-start gap-2 text-sm text-foreground"
                data-testid={`top-five-item-${index}`}
              >
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
