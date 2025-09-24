import React from 'react';
import { Check, Circle, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { OnboardingStep } from '@/types/debt';

interface StepInfo {
  key: OnboardingStep;
  label: string;
  description: string;
  icon: string;
}

interface StepSelectorProps {
  currentStep: OnboardingStep;
  completedSteps: OnboardingStep[];
  onStepSelect: (step: OnboardingStep) => void;
  isLoading?: boolean;
  className?: string;
}

const stepOrder: OnboardingStep[] = [
  'welcome',
  'profile_setup', 
  'debt_collection',
  'goal_setting',
  'dashboard_intro'
];

const stepInfo: Record<OnboardingStep, StepInfo> = {
  welcome: {
    key: 'welcome',
    label: 'Welcome',
    description: 'Get started',
    icon: '👋'
  },
  profile_setup: {
    key: 'profile_setup',
    label: 'Profile',
    description: 'Financial profile',
    icon: '👤'
  },
  debt_collection: {
    key: 'debt_collection',
    label: 'Debts',
    description: 'Add your debts',
    icon: '💳'
  },
  goal_setting: {
    key: 'goal_setting',
    label: 'Goals',
    description: 'Set financial goals',
    icon: '🎯'
  },
  dashboard_intro: {
    key: 'dashboard_intro',
    label: 'Dashboard',
    description: 'Tour & complete',
    icon: '📊'
  }
};

export const StepSelector: React.FC<StepSelectorProps> = ({
  currentStep,
  completedSteps,
  onStepSelect,
  isLoading = false,
  className
}) => {
  const getCurrentStepIndex = () => {
    return stepOrder.indexOf(currentStep);
  };

  const getStepIndex = (step: OnboardingStep) => {
    return stepOrder.indexOf(step);
  };

  const isStepCompleted = (step: OnboardingStep) => {
    return completedSteps.includes(step);
  };

  const isStepAccessible = (step: OnboardingStep) => {
    const stepIndex = getStepIndex(step);
    const currentIndex = getCurrentStepIndex();
    
    // Current step is always accessible
    if (step === currentStep) return true;
    
    // Completed steps are always accessible
    if (isStepCompleted(step)) return true;
    
    // Next step is accessible if current step is completed
    if (stepIndex === currentIndex + 1 && isStepCompleted(currentStep)) return true;
    
    // Previous steps are accessible if we've progressed past them
    if (stepIndex < currentIndex) return true;
    
    return false;
  };

  const getStepStatus = (step: OnboardingStep) => {
    if (isStepCompleted(step)) return 'completed';
    if (step === currentStep) return 'current';
    if (isStepAccessible(step)) return 'accessible';
    return 'locked';
  };

  return (
    <div className={cn("w-full bg-background border-b pb-4 mb-6", className)}>
      <div className="flex items-center justify-between max-w-4xl mx-auto px-4">
        {stepOrder.map((step, index) => {
          const info = stepInfo[step];
          const status = getStepStatus(step);
          const isClickable = isStepAccessible(step) && !isLoading;
          
          return (
            <React.Fragment key={step}>
              <div className="flex flex-col items-center gap-2">
                {/* Step Circle */}
                <button
                  onClick={() => isClickable && onStepSelect(step)}
                  disabled={!isClickable}
                  className={cn(
                    "relative w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-200",
                    "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                    {
                      // Completed step
                      "bg-primary border-primary text-primary-foreground hover:bg-primary/90": 
                        status === 'completed',
                      
                      // Current step
                      "bg-primary border-primary text-primary-foreground ring-2 ring-primary ring-offset-2": 
                        status === 'current',
                      
                      // Accessible step
                      "border-muted-foreground hover:border-primary hover:bg-primary/5 cursor-pointer": 
                        status === 'accessible',
                      
                      // Locked step
                      "border-muted-foreground/50 text-muted-foreground/50 cursor-not-allowed": 
                        status === 'locked'
                    }
                  )}
                >
                  {status === 'completed' ? (
                    <Check className="w-5 h-5" />
                  ) : status === 'current' ? (
                    <Circle className="w-5 h-5 fill-current" />
                  ) : (
                    <span className="text-xs font-medium">{index + 1}</span>
                  )}
                </button>
                
                {/* Step Info */}
                <div className="text-center">
                  <div className={cn(
                    "text-xs font-medium",
                    status === 'current' ? "text-primary" : 
                    status === 'completed' ? "text-foreground" : 
                    status === 'accessible' ? "text-foreground hover:text-primary" :
                    "text-muted-foreground"
                  )}>
                    {info.icon} {info.label}
                  </div>
                  <div className="text-xs text-muted-foreground hidden sm:block">
                    {info.description}
                  </div>
                </div>
              </div>
              
              {/* Connector Line */}
              {index < stepOrder.length - 1 && (
                <div className={cn(
                  "flex-1 h-0.5 mx-2 transition-colors",
                  getStepIndex(currentStep) > index ? "bg-primary" : "bg-muted-foreground/20"
                )} />
              )}
            </React.Fragment>
          );
        })}
      </div>
      
      {/* Current Step Indicator */}
      <div className="text-center mt-4">
        <div className="text-sm text-muted-foreground">
          Step {getCurrentStepIndex() + 1} of {stepOrder.length}
        </div>
      </div>
    </div>
  );
};

export default StepSelector;







