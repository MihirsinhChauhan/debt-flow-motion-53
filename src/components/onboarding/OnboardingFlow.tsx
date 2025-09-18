import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { StepSelector } from './components/StepSelector';
import { WelcomeStep } from './steps/WelcomeStep';
import { ProfileSetupStep } from './steps/ProfileSetupStep';
import { DebtCollectionStep } from './steps/DebtCollectionStep';
import { GoalSettingStep } from './steps/GoalSettingStep';
import { DashboardIntroStep } from './steps/DashboardIntroStep';
import { useOnboarding } from '@/context/OnboardingContext';
import { OnboardingStep } from '@/types/debt';

export const OnboardingFlow: React.FC = () => {
  const { currentStep, completedSteps, progressPercentage, isCompleted, navigateToStep, isLoading } = useOnboarding();

  // Log completion status for debugging
  useEffect(() => {
    if (isCompleted) {
      console.log('OnboardingFlow: User has completed onboarding, should redirect to dashboard');
    }
  }, [isCompleted]);

  // If onboarding is completed or current step is "completed", redirect to dashboard immediately
  if (isCompleted || currentStep === 'completed') {
    console.log('OnboardingFlow: Redirecting to dashboard - isCompleted:', isCompleted, 'currentStep:', currentStep);
    return <Navigate to="/dashboard" replace />;
  }

  const handleStepSelect = async (step: OnboardingStep) => {
    try {
      await navigateToStep(step);
    } catch (error) {
      console.error('Failed to navigate to step:', error);
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'welcome':
        return <WelcomeStep />;
      case 'profile_setup':
        return <ProfileSetupStep />;
      case 'debt_collection':
        return <DebtCollectionStep />;
      case 'goal_setting':
        return <GoalSettingStep />;
      case 'dashboard_intro':
        return <DashboardIntroStep />;
      default:
        return <WelcomeStep />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header with Progress */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-center mb-4">
            <h1 className="text-xl font-bold text-primary">DebtEase Setup</h1>
          </div>
          <StepSelector
            currentStep={currentStep}
            completedSteps={completedSteps as OnboardingStep[]}
            onStepSelect={handleStepSelect}
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[600px]">
          {renderCurrentStep()}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t bg-muted/30">
        <div className="container mx-auto px-4 py-4">
          <div className="text-center text-xs text-muted-foreground">
            <p>Step {getStepNumber(currentStep)} of 5 • {progressPercentage}% Complete</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to get step number
const getStepNumber = (step: OnboardingStep): number => {
  const stepOrder: OnboardingStep[] = ['welcome', 'profile_setup', 'debt_collection', 'goal_setting', 'dashboard_intro'];
  return stepOrder.indexOf(step) + 1;
};

