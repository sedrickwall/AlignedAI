import { Switch, Route, useLocation, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Landing from "@/pages/landing";
import Onboarding from "@/pages/onboarding";
import { Skeleton } from "@/components/ui/skeleton";
import type { OnboardingProgress } from "@shared/schema";

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="space-y-4 w-full max-w-md px-4">
        <Skeleton className="h-8 w-48 mx-auto" />
        <Skeleton className="h-4 w-64 mx-auto" />
        <Skeleton className="h-32 w-full" />
      </div>
    </div>
  );
}

function AuthenticatedRoutes() {
  const [location] = useLocation();
  
  const { data: onboardingProgress, isLoading: isOnboardingLoading } = useQuery<OnboardingProgress>({
    queryKey: ["/api/onboarding/progress"],
  });

  if (isOnboardingLoading) {
    return <LoadingScreen />;
  }

  const needsOnboarding = !onboardingProgress?.onboardingComplete;
  const isOnOnboardingPage = location === "/onboarding";

  if (needsOnboarding && !isOnOnboardingPage) {
    return <Redirect to="/onboarding" />;
  }

  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/onboarding" component={Onboarding} />
      <Route component={NotFound} />
    </Switch>
  );
}

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return (
      <Switch>
        <Route path="/" component={Landing} />
        <Route component={NotFound} />
      </Switch>
    );
  }

  return <AuthenticatedRoutes />;
}

function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
