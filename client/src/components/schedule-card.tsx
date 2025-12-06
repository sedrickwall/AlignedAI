import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { TimeBlock } from "@shared/schema";
import { Clock } from "lucide-react";

interface ScheduleCardProps {
  schedule: TimeBlock[];
}

export function ScheduleCard({ schedule }: ScheduleCardProps) {
  return (
    <Card className="shadow-md">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <Clock className="h-4 w-4 text-primary" />
          Time-Blocked Schedule
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <ul className="space-y-2.5">
          {schedule.map((block) => (
            <li
              key={block.id}
              className="flex items-baseline gap-2 text-sm"
              data-testid={`schedule-block-${block.id}`}
            >
              <span className="font-medium text-foreground whitespace-nowrap">
                {block.startTime}–{block.endTime}
              </span>
              <span className="text-muted-foreground">—</span>
              <span className="text-foreground">{block.activity}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
