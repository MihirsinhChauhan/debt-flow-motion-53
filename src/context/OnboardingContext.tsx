import React, { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import { apiService } from '../lib/api';
import { OnboardingStep, OnboardingProgress, OnboardingData, OnboardingProfileData, OnboardingGoalData } from '../types/debt';

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
        // If no onboarding exists yet, that's fine - user hasn't started
        if (err instanceof Error && !err.message.includes('404') && !err.message.includes('401') && !err.message.includes('Invalid or expired')) {
          setError(err.message);
          console.error('Onboarding status error:', err.message);
        }
        hasCheckedStatusRef.current = true;
      } finally {
        setIsLoading(false);
        currentRequestRef.current = null; // Clear the request reference
      }
    })();

    currentRequestRef.current = requestPromise;
    return requestPromise;
  }, []); // Empty dependency array to prevent infinite loop

  // Load onboarding status on mount - only once
  useEffect(() => {
    if (!isInitialLoadRef.current) {
      isInitialLoadRef.current = true;
      refreshStatus();
    }
  }, []); // Empty dependency array ensures this only runs once

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
    try {
      setIsLoading(true);
      setError(null);
      const progress = await apiService.startOnboarding();
      updateStateFromProgress(progress);
      hasCheckedStatusRef.current = true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start onboarding';

      // Handle authentication errors specifically
      if (errorMessage.includes('401') || errorMessage.includes('Invalid or expired') || errorMessage.includes('Bad Request')) {
        setError('Please log in again to continue with onboarding');
      } else {
        setError(errorMessage);
      }
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
  };

  return (
    <OnboardingContext.Provider value={contextValue}>
      {children}
    </OnboardingContext.Provider>
  );
};
