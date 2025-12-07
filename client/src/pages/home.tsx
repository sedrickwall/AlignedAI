import { Header } from "@/components/header";
import { DailyDashboard } from "@/components/daily-dashboard";
import { WeeklyOverview } from "@/components/weekly-overview";
import { MonetizationDashboard } from "@/components/monetization-dashboard";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { EnergyLevel, Task, Pillar, TimeBlock, Reflection } from "@shared/schema";
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

interface AISuggestion {
  suggestion: string;
  reasoning: string;
  focusPillar: string;
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

  const { data: aiSuggestion, isLoading: isAILoading, refetch: refetchAI, isFetching: isAIRefreshing, isError: aiError } = useQuery<AISuggestion>({
    queryKey: ["/api/ai/prioritize"],
    staleTime: 5 * 60 * 1000,
  });

  const { data: reflectionData } = useQuery<Reflection | null>({
    queryKey: ["/api/reflections"],
  });

  const handleRefreshAI = () => {
    refetchAI();
  };

  const energyMutation = useMutation({
    mutationFn: async (level: EnergyLevel) => {
      return apiRequest("PATCH", "/api/daily/energy", { level });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/daily"] });
    },
  });

  const taskToggleMutation = useMutation({
    mutationFn: async ({ taskId, completed }: { taskId: string; completed: boolean }) => {
      return apiRequest("PATCH", `/api/tasks/${taskId}`, { completed });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/daily"] });
    },
  });

  const taskAddMutation = useMutation({
    mutationFn: async (title: string) => {
      return apiRequest("POST", "/api/tasks", { title });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/daily"] });
    },
  });

  const taskUpdateMutation = useMutation({
    mutationFn: async ({ taskId, title }: { taskId: string; title: string }) => {
      return apiRequest("PATCH", `/api/tasks/${taskId}`, { title });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/daily"] });
    },
  });

  const taskDeleteMutation = useMutation({
    mutationFn: async (taskId: string) => {
      return apiRequest("DELETE", `/api/tasks/${taskId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/daily"] });
    },
  });

  const blockAddMutation = useMutation({
    mutationFn: async ({ startTime, endTime, activity }: { startTime: string; endTime: string; activity: string }) => {
      return apiRequest("POST", "/api/schedule", { startTime, endTime, activity });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/daily"] });
    },
  });

  const blockUpdateMutation = useMutation({
    mutationFn: async ({ blockId, startTime, endTime, activity }: { blockId: string; startTime: string; endTime: string; activity: string }) => {
      return apiRequest("PATCH", `/api/schedule/${blockId}`, { startTime, endTime, activity });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/daily"] });
    },
  });

  const blockDeleteMutation = useMutation({
    mutationFn: async (blockId: string) => {
      return apiRequest("DELETE", `/api/schedule/${blockId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/daily"] });
    },
  });

  const pillarUpdateMutation = useMutation({
    mutationFn: async ({ pillarId, current, target }: { pillarId: string; current: number; target: number }) => {
      return apiRequest("PATCH", `/api/pillars/${pillarId}`, { current, target });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/weekly"] });
    },
  });

  const reflectionMutation = useMutation({
    mutationFn: async (data: { wins?: string; challenges?: string; gratitude?: string; nextWeekIntention?: string }) => {
      return apiRequest("PATCH", "/api/reflections", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reflections"] });
      toast({
        title: "Reflection Saved",
        description: "Your weekly reflection has been saved.",
      });
    },
    onError: () => {
      toast({
        title: "Save Failed",
        description: "Could not save your reflection. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleEnergyChange = (level: EnergyLevel) => {
    energyMutation.mutate(level);
  };

  const handleTaskToggle = (taskId: string) => {
    const task = dailyData?.tasks.find(t => t.id === taskId);
    if (task) {
      taskToggleMutation.mutate({ taskId, completed: !task.completed });
    }
  };

  const handleTaskAdd = (title: string) => {
    taskAddMutation.mutate(title);
  };

  const handleTaskUpdate = (taskId: string, title: string) => {
    taskUpdateMutation.mutate({ taskId, title });
  };

  const handleTaskDelete = (taskId: string) => {
    taskDeleteMutation.mutate(taskId);
  };

  const handleBlockAdd = (startTime: string, endTime: string, activity: string) => {
    blockAddMutation.mutate({ startTime, endTime, activity });
  };

  const handleBlockUpdate = (blockId: string, startTime: string, endTime: string, activity: string) => {
    blockUpdateMutation.mutate({ blockId, startTime, endTime, activity });
  };

  const handleBlockDelete = (blockId: string) => {
    blockDeleteMutation.mutate(blockId);
  };

  const handlePillarUpdate = (pillarId: string, current: number, target: number) => {
    pillarUpdateMutation.mutate({ pillarId, current, target });
  };

  const handleReflectionSave = (data: { wins?: string; challenges?: string; gratitude?: string; nextWeekIntention?: string }) => {
    reflectionMutation.mutate(data);
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
                onTaskAdd={handleTaskAdd}
                onTaskUpdate={handleTaskUpdate}
                onTaskDelete={handleTaskDelete}
                schedule={dailyData.schedule}
                onBlockAdd={handleBlockAdd}
                onBlockUpdate={handleBlockUpdate}
                onBlockDelete={handleBlockDelete}
                onReset={handleReset}
                aiSuggestion={aiSuggestion}
                isAILoading={isAILoading}
                onRefreshAI={handleRefreshAI}
                isAIRefreshing={isAIRefreshing}
                hasAIError={aiError}
              />
              <MonetizationDashboard />
              <WeeklyOverview
                pillars={weeklyData.pillars}
                focusStatement={weeklyData.focusStatement}
                topFive={weeklyData.topFive}
                onPillarUpdate={handlePillarUpdate}
                reflection={reflectionData ?? null}
                onReflectionSave={handleReflectionSave}
                isReflectionSaving={reflectionMutation.isPending}
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
