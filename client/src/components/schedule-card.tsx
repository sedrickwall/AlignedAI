import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { TimeBlock } from "@shared/schema";
import { Clock, Plus, Check, X, Pencil, Trash2 } from "lucide-react";

interface ScheduleCardProps {
  schedule: TimeBlock[];
  onBlockAdd: (startTime: string, endTime: string, activity: string) => void;
  onBlockUpdate: (blockId: string, startTime: string, endTime: string, activity: string) => void;
  onBlockDelete: (blockId: string) => void;
}

export function ScheduleCard({ schedule, onBlockAdd, onBlockUpdate, onBlockDelete }: ScheduleCardProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editStartTime, setEditStartTime] = useState("");
  const [editEndTime, setEditEndTime] = useState("");
  const [editActivity, setEditActivity] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [newStartTime, setNewStartTime] = useState("");
  const [newEndTime, setNewEndTime] = useState("");
  const [newActivity, setNewActivity] = useState("");

  const handleStartEdit = (block: TimeBlock) => {
    setEditingId(block.id);
    setEditStartTime(block.startTime);
    setEditEndTime(block.endTime);
    setEditActivity(block.activity);
  };

  const handleSaveEdit = () => {
    if (editingId && editStartTime.trim() && editEndTime.trim() && editActivity.trim()) {
      onBlockUpdate(editingId, editStartTime.trim(), editEndTime.trim(), editActivity.trim());
      setEditingId(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handleAddBlock = () => {
    if (newStartTime.trim() && newEndTime.trim() && newActivity.trim()) {
      onBlockAdd(newStartTime.trim(), newEndTime.trim(), newActivity.trim());
      setNewStartTime("");
      setNewEndTime("");
      setNewActivity("");
      setIsAdding(false);
    }
  };

  const handleCancelAdd = () => {
    setNewStartTime("");
    setNewEndTime("");
    setNewActivity("");
    setIsAdding(false);
  };

  return (
    <Card className="shadow-md">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-base font-semibold">
            <Clock className="h-4 w-4 text-primary" />
            Time-Blocked Schedule
          </div>
          {!isAdding && schedule.length < 10 && (
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setIsAdding(true)}
              data-testid="button-add-schedule-block"
            >
              <Plus className="h-4 w-4" />
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <ul className="space-y-2.5">
          {schedule.map((block) => (
            <li
              key={block.id}
              className="group"
              data-testid={`schedule-block-${block.id}`}
            >
              {editingId === block.id ? (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <Input
                      type="time"
                      value={editStartTime}
                      onChange={(e) => setEditStartTime(e.target.value)}
                      className="w-28"
                      data-testid="input-edit-start-time"
                    />
                    <span className="text-muted-foreground">to</span>
                    <Input
                      type="time"
                      value={editEndTime}
                      onChange={(e) => setEditEndTime(e.target.value)}
                      className="w-28"
                      data-testid="input-edit-end-time"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      value={editActivity}
                      onChange={(e) => setEditActivity(e.target.value)}
                      placeholder="Activity"
                      className="flex-1"
                      onKeyDown={(e) => e.key === "Enter" && handleSaveEdit()}
                      data-testid="input-edit-activity"
                    />
                    <Button size="icon" variant="ghost" onClick={handleSaveEdit} data-testid="button-save-edit-block">
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={handleCancelEdit} data-testid="button-cancel-edit-block">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-baseline gap-2 text-sm">
                  <span className="font-medium text-foreground whitespace-nowrap">
                    {block.startTime}–{block.endTime}
                  </span>
                  <span className="text-muted-foreground">—</span>
                  <span className="text-foreground flex-1">{block.activity}</span>
                  <div className="invisible group-hover:visible flex items-center gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleStartEdit(block)}
                      data-testid={`button-edit-block-${block.id}`}
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => onBlockDelete(block.id)}
                      data-testid={`button-delete-block-${block.id}`}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}
            </li>
          ))}
          {isAdding && (
            <li className="flex flex-col gap-2" data-testid="new-schedule-block-form">
              <div className="flex items-center gap-2">
                <Input
                  type="time"
                  value={newStartTime}
                  onChange={(e) => setNewStartTime(e.target.value)}
                  className="w-28"
                  placeholder="Start"
                  data-testid="input-new-start-time"
                />
                <span className="text-muted-foreground">to</span>
                <Input
                  type="time"
                  value={newEndTime}
                  onChange={(e) => setNewEndTime(e.target.value)}
                  className="w-28"
                  placeholder="End"
                  data-testid="input-new-end-time"
                />
              </div>
              <div className="flex items-center gap-2">
                <Input
                  value={newActivity}
                  onChange={(e) => setNewActivity(e.target.value)}
                  placeholder="Activity description"
                  className="flex-1"
                  onKeyDown={(e) => e.key === "Enter" && handleAddBlock()}
                  autoFocus
                  data-testid="input-new-activity"
                />
                <Button size="icon" variant="ghost" onClick={handleAddBlock} data-testid="button-save-new-block">
                  <Check className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" onClick={handleCancelAdd} data-testid="button-cancel-new-block">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </li>
          )}
        </ul>
        {schedule.length === 0 && !isAdding && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No time blocks yet. Click + to add your first block.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
