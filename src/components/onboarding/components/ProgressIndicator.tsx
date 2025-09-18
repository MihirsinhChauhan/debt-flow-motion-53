import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { OnboardingStep } from '@/types/debt';

interface ProgressIndicatorProps {
  currentStep: OnboardingStep;
  completedSteps: string[];
  className?: string;
}

const steps: { key: OnboardingStep; label: string; description: string }[] = [
  { key: 'welcome', label: 'Welcome', description: 'Get started' },
  { key: 'profile_setup', label: 'Profile', description: 'Your financial info' },
  { key: 'debt_collection', label: 'Debts', description: 'Add your debts' },
  { key: 'goal_setting', label: 'Goals', description: 'Set your targets' },
  { key: 'dashboard_intro', label: 'Dashboard', description: 'Explore features' },
];

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  currentStep,
  completedSteps,
  className
}) => {
  const getStepStatus = (stepKey: OnboardingStep) => {
    if (completedSteps.includes(stepKey)) return 'completed';
    if (stepKey === currentStep) return 'current';
    return 'pending';
  };

  const getStepIndex = (stepKey: OnboardingStep) => {
    return steps.findIndex(step => step.key === stepKey);
  };

  return (
    <div className={cn("w-full max-w-2xl mx-auto", className)}>
      <div className="flex items-center justify-between mb-2">
        {steps.map((step, index) => {
          const status = getStepStatus(step.key);
          const isCompleted = status === 'completed';
          const isCurrent = status === 'current';

          return (
            <>
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border-2 transition-colors",
                    {
                      "bg-primary border-primary text-primary-foreground": isCompleted,
                      "bg-primary/10 border-primary text-primary": isCurrent,
                      "bg-muted border-muted-foreground/20 text-muted-foreground": status === 'pending'
                    }
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
                <div className="text-center mt-2 max-w-20">
                  <div className={cn(
                    "text-xs font-medium",
                    isCurrent ? "text-primary" : isCompleted ? "text-foreground" : "text-muted-foreground"
                  )}>
                    {step.label}
                  </div>
                  <div className="text-xs text-muted-foreground hidden sm:block">
                    {step.description}
                  </div>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className="flex-1 mx-2">
                  <div
                    className={cn(
                      "h-0.5 rounded transition-colors",
                      getStepIndex(currentStep) > index ? "bg-primary" : "bg-muted"
                    )}
                  />
                </div>
              )}
            </>
          );
        })}
      </div>
    </div>
  );
};

