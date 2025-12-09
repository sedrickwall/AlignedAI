// client/src/App.tsx
import { Switch, Route, useLocation, Redirect } from "wouter";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";

import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { Skeleton } from "@/components/ui/skeleton";

import { useAuth } from "@/hooks/useAuth";

import Home from "@/pages/home";
import Landing from "@/pages/landing";
import Onboarding from "@/pages/onboarding";
import Signup from "@/pages/signup";
import Login from "@/pages/login";
import NotFound from "@/pages/not-found";

import { getOnboardingProgress, type FirestoreOnboardingProgress } from "@/lib/onboardingFirebase";

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
  const { user } = useAuth(); // Firebase user

  // Load Firestore onboarding progress once we have a user
  const { data: onboardingProgress, isLoading: isOnboardingLoading } =
    useQuery<FirestoreOnboardingProgress>({
      queryKey: ["onboarding-progress", user?.uid],
      enabled: !!user,
      queryFn: async () => {
        if (!user) throw new Error("No user");
        return getOnboardingProgress(user.uid);
      },
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
        <Route path="/login" component={Login} />
        <Route path="/signup" component={Signup} />
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
