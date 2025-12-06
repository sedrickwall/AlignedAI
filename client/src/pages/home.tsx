import { Header } from "@/components/header";
import { DailyDashboard } from "@/components/daily-dashboard";
import { WeeklyOverview } from "@/components/weekly-overview";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { EnergyLevel, Task, Pillar, TimeBlock } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

interface DailyData {
  energyLevel: EnergyLevel;
  tasks: Task[];
  schedule: TimeBlock[];
  verse: { text: string; reference: string };
}

interface WeeklyData {
  pillars: Pillar[];
  focusStatement: string;
  topFive: string[];
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6 lg:space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 mb-8">
        <div className="space-y-4">
          <Card className="shadow-md">
            <CardContent className="p-5 space-y-3">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-16 w-full" />
            </CardContent>
          </Card>
          <Card className="shadow-md">
            <CardContent className="p-5 space-y-4">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-24 w-full" />
            </CardContent>
          </Card>
        </div>
        <div className="space-y-4">
          <Card className="shadow-md">
            <CardContent className="p-5 space-y-3">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
          <Card className="shadow-md">
            <CardContent className="p-5">
              <Skeleton className="h-16 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        <Card className="shadow-md">
          <CardContent className="p-5 space-y-3">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
        <Card className="shadow-md">
          <CardContent className="p-5 space-y-3">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function Home() {
  const { toast } = useToast();

  const { data: dailyData, isLoading: isDailyLoading } = useQuery<DailyData>({
    queryKey: ["/api/daily"],
  });

  const { data: weeklyData, isLoading: isWeeklyLoading } = useQuery<WeeklyData>({
    queryKey: ["/api/weekly"],
  });

  const energyMutation = useMutation({
    mutationFn: async (level: EnergyLevel) => {
      return apiRequest("PATCH", "/api/daily/energy", { level });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/daily"] });
    },
  });

  const taskMutation = useMutation({
    mutationFn: async ({ taskId, completed }: { taskId: string; completed: boolean }) => {
      return apiRequest("PATCH", `/api/tasks/${taskId}`, { completed });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/daily"] });
    },
  });

  const handleEnergyChange = (level: EnergyLevel) => {
    energyMutation.mutate(level);
  };

  const handleTaskToggle = (taskId: string) => {
    const task = dailyData?.tasks.find(t => t.id === taskId);
    if (task) {
      taskMutation.mutate({ taskId, completed: !task.completed });
    }
  };

  const handleReset = () => {
    toast({
      title: "Reset Time",
      description: "Take a 5-minute break. Breathe deeply. You've got this.",
    });
  };

  const isLoading = isDailyLoading || isWeeklyLoading;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Header />
        <main>
          {isLoading ? (
            <DashboardSkeleton />
          ) : dailyData && weeklyData ? (
            <div className="space-y-6 lg:space-y-8">
              <DailyDashboard
                verse={dailyData.verse}
                energyLevel={dailyData.energyLevel}
                onEnergyChange={handleEnergyChange}
                tasks={dailyData.tasks}
                onTaskToggle={handleTaskToggle}
                schedule={dailyData.schedule}
                onReset={handleReset}
              />
              <WeeklyOverview
                pillars={weeklyData.pillars}
                focusStatement={weeklyData.focusStatement}
                topFive={weeklyData.topFive}
              />
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Failed to load data. Please refresh.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
