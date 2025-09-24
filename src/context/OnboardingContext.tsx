import React, { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import { apiService } from '../lib/api';
import { OnboardingStep, OnboardingProgress, OnboardingData, OnboardingProfileData, OnboardingGoalData } from '../types/debt';
import { useAuth } from './AuthContext';

interface OnboardingContextType {
  // State
  currentStep: OnboardingStep;
  completedSteps: string[];
  onboardingData: OnboardingData;
  progressPercentage: number;
  isCompleted: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  startOnboarding: () => Promise<void>;
  updateProfile: (data: OnboardingProfileData) => Promise<void>;
  skipDebtEntry: () => Promise<void>;
  setGoals: (goals: OnboardingGoalData) => Promise<void>;
  completeOnboarding: () => Promise<void>;
  goToStep: (step: OnboardingStep) => void;
  navigateToStep: (step: OnboardingStep) => Promise<void>;
  refreshStatus: () => Promise<void>;
  resetOnboardingState: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};

interface OnboardingProviderProps {
  children: ReactNode;
}

export const OnboardingProvider: React.FC<OnboardingProviderProps> = ({ children }) => {
  const { user, isLoading: authLoading } = useAuth();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome');
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({});
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use refs to track completion status without causing re-renders
  const hasCheckedStatusRef = useRef(false);
  const isCompletedRef = useRef(false);
  const isInitialLoadRef = useRef(false);
  const currentRequestRef = useRef<Promise<void> | null>(null);

  const refreshStatus = useCallback(async () => {
    // Critical: Don't attempt to fetch onboarding status if user is not authenticated
    if (authLoading || !user) {
      console.log('OnboardingContext: Skipping status fetch - authentication not ready', { authLoading, hasUser: !!user });
      return;
    }

    // Don't poll if we've already checked and onboarding is completed
    if (hasCheckedStatusRef.current && isCompletedRef.current) {
      console.log('Onboarding polling stopped - already completed');
      return;
    }

    // Return existing request if one is already in progress
    if (currentRequestRef.current) {
      console.log('Onboarding status request already in progress, returning existing request');
      return currentRequestRef.current;
    }

    // Create and store the request promise
    const requestPromise = (async () => {
      try {
        setIsLoading(true);
        setError(null);
        console.log('Fetching onboarding status...');
        const status = await apiService.getOnboardingStatus();
        console.log('Onboarding status received:', status);

        updateStateFromProgress(status);
        hasCheckedStatusRef.current = true;

        // Update ref when completion status changes and stop polling if completed
        if (status.is_completed) {
          isCompletedRef.current = true;
          console.log('Onboarding completed - polling will stop');
        }
      } catch (err) {
        console.error('Onboarding status fetch error:', err);

        // Handle different types of errors appropriately
        if (err instanceof Error) {
          if (err.message.includes('session has expired') || err.message.includes('log in again')) {
            // Session expired - this is a real authentication issue
            setError('Your session has expired. Please log in again.');
            console.log('OnboardingContext: Session expired, user needs to re-login');
          } else if (err.message.includes('404')) {
            // 404 means user hasn't started onboarding yet - this is normal
            console.log('OnboardingContext: No onboarding found (404) - user can start fresh');
            // Reset to initial state for fresh start
            setCurrentStep('welcome');
            setCompletedSteps([]);
            setOnboardingData({});
            setProgressPercentage(0);
            setIsCompleted(false);
          } else if (err.message.includes('401')) {
            // 401 during onboarding status fetch - could be auth issue or no session
            console.log('OnboardingContext: 401 error - authentication might be invalid');
            setError('Authentication issue. Please try logging in again.');
          } else {
            // Other errors
            setError(`Failed to load onboarding status: ${err.message}`);
            console.error('OnboardingContext: Unexpected error:', err.message);
          }
        }
        hasCheckedStatusRef.current = true;
      } finally {
        setIsLoading(false);
        currentRequestRef.current = null; // Clear the request reference
      }
    })();

    currentRequestRef.current = requestPromise;
    return requestPromise;
  }, [authLoading, user]); // Depend on auth state to prevent calling API before authentication

  // Load onboarding status when authentication is ready
  useEffect(() => {
    if (!isInitialLoadRef.current && !authLoading && user) {
      isInitialLoadRef.current = true;
      console.log('OnboardingContext: Authentication ready, fetching onboarding status');
      refreshStatus();
    }
  }, [authLoading, user, refreshStatus]);

  const updateStateFromProgress = useCallback((progress: OnboardingProgress) => {
    setCurrentStep(progress.current_step);
    setCompletedSteps(progress.completed_steps);
    setOnboardingData(progress.onboarding_data);
    setProgressPercentage(progress.progress_percentage);
    setIsCompleted(progress.is_completed);

    // Update ref to prevent future polling when completed
    isCompletedRef.current = progress.is_completed;

    // If completed, ensure we stop any further polling
    if (progress.is_completed && progress.current_step === 'completed') {
      hasCheckedStatusRef.current = true;
      console.log('Onboarding marked as completed, polling stopped');
    }
  }, []);

  const startOnboarding = async () => {
    // Check authentication before attempting onboarding operations
    if (authLoading || !user) {
      setError('Please wait for authentication to complete or log in again');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      console.log('OnboardingContext: Starting onboarding for user:', user.id);
      const progress = await apiService.startOnboarding();
      updateStateFromProgress(progress);
      hasCheckedStatusRef.current = true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start onboarding';

      // Handle authentication errors specifically
      if (errorMessage.includes('session has expired') || errorMessage.includes('log in again')) {
        setError('Your session has expired. Please log in again.');
      } else if (errorMessage.includes('401') || errorMessage.includes('Invalid or expired')) {
        setError('Authentication issue. Please try logging in again.');
      } else {
        setError(errorMessage);
      }
      console.error('OnboardingContext: Start onboarding error:', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (data: OnboardingProfileData) => {
    try {
      setIsLoading(true);
      setError(null);
      const progress = await apiService.updateProfile(data);
      updateStateFromProgress(progress);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const skipDebtEntry = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const progress = await apiService.skipDebtEntry();
      updateStateFromProgress(progress);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to skip debt entry');
    } finally {
      setIsLoading(false);
    }
  };

  const setGoals = async (goals: OnboardingGoalData) => {
    try {
      setIsLoading(true);
      setError(null);
      const progress = await apiService.setGoals(goals);
      updateStateFromProgress(progress);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set goals');
    } finally {
      setIsLoading(false);
    }
  };

  const completeOnboarding = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const progress = await apiService.completeOnboarding();
      updateStateFromProgress(progress);
      hasCheckedStatusRef.current = true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete onboarding');
    } finally {
      setIsLoading(false);
    }
  };

  const goToStep = (step: OnboardingStep) => {
    setCurrentStep(step);
  };

  const navigateToStep = async (step: OnboardingStep) => {
    try {
      setIsLoading(true);
      setError(null);
      const progress = await apiService.navigateToStep(step);
      updateStateFromProgress(progress);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to navigate to step');
    } finally {
      setIsLoading(false);
    }
  };

  const resetOnboardingState = useCallback(() => {
    console.log('OnboardingContext: Resetting onboarding state');
    setCurrentStep('welcome');
    setCompletedSteps([]);
    setOnboardingData({});
    setProgressPercentage(0);
    setIsCompleted(false);
    setIsLoading(false);
    setError(null);

    // Reset refs
    hasCheckedStatusRef.current = false;
    isCompletedRef.current = false;
    isInitialLoadRef.current = false;
    currentRequestRef.current = null;
  }, []);

  // Reset onboarding state when user logs out
  useEffect(() => {
    if (!user && !authLoading) {
      console.log('OnboardingContext: User logged out, resetting state');
      resetOnboardingState();
    }
  }, [user, authLoading, resetOnboardingState]);

  const contextValue: OnboardingContextType = {
    currentStep,
    completedSteps,
    onboardingData,
    progressPercentage,
    isCompleted,
    isLoading,
    error,
    startOnboarding,
    updateProfile,
    skipDebtEntry,
    setGoals,
    completeOnboarding,
    goToStep,
    navigateToStep,
    refreshStatus,
    resetOnboardingState,
  };

  return (
    <OnboardingContext.Provider value={contextValue}>
      {children}
    </OnboardingContext.Provider>
  );
};
