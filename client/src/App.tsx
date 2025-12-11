// client/src/App.tsx
import { Switch, Route, Redirect, useLocation } from "wouter";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";

import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Skeleton } from "@/components/ui/skeleton";

import { useAuth } from "@/hooks/useAuth";

import Home from "@/pages/home";
import Onboarding from "@/pages/onboarding";
import Landing from "@/pages/landing";
import Login from "@/pages/login";
import Signup from "@/pages/signup";
import NotFound from "@/pages/not-found";

import type { FirestoreOnboardingProgress } from "@/lib/onboardingFirebase";

// -----------------------------------------------------
// LOADING SCREEN
// -----------------------------------------------------

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="space-y-3 w-full max-w-md px-4">
        <Skeleton className="h-8 w-44 mx-auto" />
        <Skeleton className="h-4 w-64 mx-auto" />
        <Skeleton className="h-32 w-full" />
      </div>
    </div>
  );
}

// -----------------------------------------------------
// AUTHENTICATED ROUTES
// -----------------------------------------------------

function AuthenticatedRoutes() {
  const [location] = useLocation();
  const { user } = useAuth(); // Firebase user

  // -------- Load onboarding progress from API --------
  const { data: progress, isLoading } = useQuery<
    FirestoreOnboardingProgress
  >({
    queryKey: ["onboarding-progress"],
    enabled: !!user,
    refetchOnMount: "always",
    staleTime: 0,
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/onboarding/get");
      return res.json();
    },
  });

  // Still loading?
  if (isLoading) return <LoadingScreen />;

  // If API errors → treat as onboarding NOT complete (safe fallback)
  const onboardingComplete = progress?.onboardingComplete === true;
  const isOnboardingPage = location === "/onboarding";

  // -------- Gating Logic --------
  // If onboarding complete and on onboarding page, redirect to home
  if (onboardingComplete && isOnboardingPage) {
    return <Redirect to="/" />;
  }
  
  // If onboarding not complete and not on onboarding page, redirect to onboarding
  if (!onboardingComplete && !isOnboardingPage) {
    return <Redirect to="/onboarding" />;
  }

  // -------- Normal Application Routing --------
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/onboarding" component={Onboarding} />
      <Route component={NotFound} />
    </Switch>
  );
}

// -----------------------------------------------------
// ROUTER WRAPPER
// -----------------------------------------------------

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <LoadingScreen />;

  // ---------- Unauthenticated Visitors ----------
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

  // ---------- Authenticated Users ----------
  return <AuthenticatedRoutes />;
}

// -----------------------------------------------------
// ROOT APP
// -----------------------------------------------------

export default function App() {
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
