import { Checkbox } from "@/components/ui/checkbox";
import type { Task } from "@shared/schema";
import { Target } from "lucide-react";

interface BigThreeProps {
  tasks: Task[];
  onToggle: (taskId: string) => void;
}

export function BigThree({ tasks, onToggle }: BigThreeProps) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Target className="h-4 w-4 text-primary" />
        <p className="text-sm font-medium text-foreground">Today's Big 3</p>
      </div>
      <ul className="space-y-2.5">
        {tasks.map((task, index) => (
          <li key={task.id} className="flex items-start gap-3">
            <Checkbox
              id={`task-${task.id}`}
              checked={task.completed}
              onCheckedChange={() => onToggle(task.id)}
              className="mt-0.5"
              data-testid={`checkbox-task-${task.id}`}
            />
            <label
              htmlFor={`task-${task.id}`}
              className={`text-sm leading-snug cursor-pointer ${
                task.completed
                  ? "text-muted-foreground line-through"
                  : "text-foreground"
              }`}
              data-testid={`text-task-${task.id}`}
            >
              <span className="font-medium text-muted-foreground mr-1.5">{index + 1}.</span>
              {task.title}
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}
