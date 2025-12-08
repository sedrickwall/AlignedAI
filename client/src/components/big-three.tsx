import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TaskDiscernmentButton, TaskDiscernmentDialog } from "@/components/task-discernment";
import type { Task } from "@shared/schema";
import { Target, Plus, X, Pencil, Check } from "lucide-react";

interface BigThreeProps {
  tasks: Task[];
  onToggle: (taskId: string) => void;
  onAdd: (title: string) => void;
  onUpdate: (taskId: string, title: string) => void;
  onDelete: (taskId: string) => void;
  newlyCreatedTask?: Task | null;
  onClearNewTask?: () => void;
}

export function BigThree({ tasks, onToggle, onAdd, onUpdate, onDelete, newlyCreatedTask, onClearNewTask }: BigThreeProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");

  const handleStartEdit = (task: Task) => {
    setEditingId(task.id);
    setEditValue(task.title);
  };

  const handleSaveEdit = () => {
    if (editingId && editValue.trim()) {
      onUpdate(editingId, editValue.trim());
      setEditingId(null);
      setEditValue("");
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditValue("");
  };

  const handleAddTask = () => {
    if (newTaskTitle.trim()) {
      onAdd(newTaskTitle.trim());
      setNewTaskTitle("");
      setIsAdding(false);
    }
  };

  const handleCancelAdd = () => {
    setNewTaskTitle("");
    setIsAdding(false);
  };

  const canAddMore = tasks.length < 3;

  return (
    <div>
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-primary" />
          <p className="text-sm font-medium text-foreground">Today's Big 3</p>
        </div>
        {canAddMore && !isAdding && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsAdding(true)}
            data-testid="button-add-task"
          >
            <Plus className="h-4 w-4" />
          </Button>
        )}
      </div>
      <ul className="space-y-2.5">
        {tasks.map((task, index) => (
          <li key={task.id} className="flex items-start gap-3 group">
            {editingId === task.id ? (
              <div className="flex items-center gap-2 flex-1">
                <span className="font-medium text-muted-foreground text-sm">{index + 1}.</span>
                <Input
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSaveEdit();
                    if (e.key === "Escape") handleCancelEdit();
                  }}
                  className="flex-1 h-8 text-sm"
                  autoFocus
                  data-testid={`input-edit-task-${task.id}`}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleSaveEdit}
                  data-testid={`button-save-task-${task.id}`}
                >
                  <Check className="h-4 w-4 text-green-600" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCancelEdit}
                  data-testid={`button-cancel-edit-${task.id}`}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <>
                <Checkbox
                  id={`task-${task.id}`}
                  checked={task.completed}
                  onCheckedChange={() => onToggle(task.id)}
                  className="mt-0.5"
                  data-testid={`checkbox-task-${task.id}`}
                />
                <label
                  htmlFor={`task-${task.id}`}
                  className={`text-sm leading-snug cursor-pointer flex-1 ${
                    task.completed
                      ? "text-muted-foreground line-through"
                      : "text-foreground"
                  }`}
                  data-testid={`text-task-${task.id}`}
                >
                  <span className="font-medium text-muted-foreground mr-1.5">{index + 1}.</span>
                  {task.title}
                </label>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" style={{ visibility: 'visible' }}>
                  <TaskDiscernmentButton task={task} />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleStartEdit(task)}
                    className="h-7 w-7"
                    data-testid={`button-edit-task-${task.id}`}
                  >
                    <Pencil className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(task.id)}
                    className="h-7 w-7"
                    data-testid={`button-delete-task-${task.id}`}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </>
            )}
          </li>
        ))}
        {isAdding && (
          <li className="flex items-center gap-3">
            <span className="font-medium text-muted-foreground text-sm">{tasks.length + 1}.</span>
            <Input
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="What needs to get done?"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAddTask();
                if (e.key === "Escape") handleCancelAdd();
              }}
              className="flex-1 h-8 text-sm"
              autoFocus
              data-testid="input-new-task"
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={handleAddTask}
              data-testid="button-confirm-add-task"
            >
              <Check className="h-4 w-4 text-green-600" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCancelAdd}
              data-testid="button-cancel-add-task"
            >
              <X className="h-4 w-4" />
            </Button>
          </li>
        )}
        {tasks.length === 0 && !isAdding && (
          <li className="text-sm text-muted-foreground italic">
            No tasks yet. Click the + button to add your first priority.
          </li>
        )}
      </ul>

      {newlyCreatedTask && (
        <TaskDiscernmentDialog
          task={newlyCreatedTask}
          isOpen={!!newlyCreatedTask}
          onClose={() => onClearNewTask?.()}
          autoEvaluate={true}
        />
      )}
    </div>
  );
}
