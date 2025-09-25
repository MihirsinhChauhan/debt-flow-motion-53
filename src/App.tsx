import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import React, { useMemo } from "react";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { OnboardingProvider, useOnboarding } from "@/context/OnboardingContext";
import { EnvironmentSwitcher } from "@/components/EnvironmentSwitcher";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import AppLayout from "./components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import Insights from "./pages/Insights";
import Reminders from "./pages/Reminders";
import Security from "./pages/Security";
import DebtDetailView from "./pages/DebtDetailView";

const queryClient = new QueryClient();

const ProtectedRoute = React.memo(({ children, requireOnboarding = true }: { children: React.ReactNode, requireOnboarding?: boolean }) => {
  const { user, isLoading: authLoading, error: authError } = useAuth();
  const { isCompleted, isLoading: onboardingLoading, currentStep, error: onboardingError } = useOnboarding();

  // Memoize loading components to prevent unnecessary re-renders
  const authLoadingComponent = useMemo(() => (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="text-2xl font-bold text-primary mb-2">DebtEase</div>
        <div className="text-muted-foreground">Authenticating...</div>
      </div>
    </div>
  ), []);

  const onboardingLoadingComponent = useMemo(() => (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="text-2xl font-bold text-primary mb-2">DebtEase</div>
        <div className="text-muted-foreground">Checking onboarding status...</div>
      </div>
    </div>
  ), []);

  // Handle authentication errors
  if (authError && authError.includes('session has expired')) {
    console.log('ProtectedRoute: Authentication error detected, redirecting to auth');
    return <Navigate to="/auth" replace />;
  }

  // Early returns for loading states
  if (authLoading) {
    return authLoadingComponent;
  }

  if (!user) {
    console.log('ProtectedRoute: No user found, redirecting to auth');
    return <Navigate to="/auth" replace />;
  }

  // Skip onboarding check if not required (e.g., for dashboard when accessed via login)
  if (!requireOnboarding) {
    console.log('ProtectedRoute: Onboarding not required, allowing access');
    return <>{children}</>;
  }

  // Handle onboarding authentication errors
  if (onboardingError && (onboardingError.includes('session has expired') || onboardingError.includes('Authentication issue'))) {
    console.log('ProtectedRoute: Onboarding authentication error, redirecting to auth');
    return <Navigate to="/auth" replace />;
  }

  // Only redirect to onboarding if we're sure the user hasn't completed it
  // Wait for onboarding status to load first, but only if auth is complete
  if (onboardingLoading) {
    return onboardingLoadingComponent;
  }

  // Check if user needs onboarding - also check currentStep to avoid race conditions
  if (!isCompleted && currentStep !== 'completed') {
    console.log('ProtectedRoute: Redirecting to onboarding - isCompleted:', isCompleted, 'currentStep:', currentStep);
    return <Navigate to="/onboarding" replace />;
  }

  console.log('ProtectedRoute: Allowing access to protected route - isCompleted:', isCompleted, 'currentStep:', currentStep);
  return <>{children}</>;
});

const AppContent = () => {
  const { user } = useAuth();
  
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={!user ? <Auth /> : <Navigate to="/dashboard" replace />} />
        <Route path="/onboarding" element={
          user ? <Onboarding /> : <Navigate to="/auth" replace />
        } />
        <Route path="/" element={
          !user ? <Index /> : <Navigate to="/dashboard" replace />
        } />
        <Route path="/dashboard" element={
          <ProtectedRoute requireOnboarding={false}>
            <AppLayout>
              <Dashboard />
            </AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/insights" element={
          <ProtectedRoute>
            <AppLayout>
              <Insights />
            </AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/reminders" element={
          <ProtectedRoute>
            <AppLayout>
              <Reminders />
            </AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/security" element={
          <ProtectedRoute>
            <AppLayout>
              <Security />
            </AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/debt-details" element={
          <ProtectedRoute>
            <DebtDetailView />
          </ProtectedRoute>
        } />
        <Route path="/debt-details/:debtId" element={
          <ProtectedRoute>
            <DebtDetailView />
          </ProtectedRoute>
        } />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <OnboardingProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <AppContent />
            <EnvironmentSwitcher />
          </TooltipProvider>
        </OnboardingProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;