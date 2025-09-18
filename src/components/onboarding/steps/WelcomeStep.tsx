import React from 'react';
import { Sparkles, Target, TrendingUp, Shield } from 'lucide-react';
import { OnboardingCard } from '../components/OnboardingCard';
import { StepNavigation } from '../components/StepNavigation';
import { useOnboarding } from '@/context/OnboardingContext';

export const WelcomeStep: React.FC = () => {
  const { startOnboarding, navigateToStep, currentStep, isLoading, error } = useOnboarding();

  const handleStart = async () => {
    // If we're already on the welcome step (onboarding started), navigate to next step
    if (currentStep === 'welcome') {
      await navigateToStep('profile_setup');
    } else {
      // Otherwise, start the onboarding first
      await startOnboarding();
    }
  };

  const features = [
    {
      icon: Target,
      title: 'Personalized Debt Strategy',
      description: 'Get AI-powered recommendations tailored to your financial situation'
    },
    {
      icon: TrendingUp,
      title: 'Track Your Progress',
      description: 'Monitor your debt payoff journey with detailed analytics and insights'
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Your financial data is encrypted and never shared with third parties'
    },
    {
      icon: Sparkles,
      title: 'Smart AI Assistant',
      description: 'Receive intelligent suggestions to optimize your debt repayment plan'
    }
  ];

  return (
    <OnboardingCard
      title="Welcome to DebtEase"
      description="Your AI-powered companion for debt management and financial freedom"
    >
      <div className="space-y-6">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
          <p className="text-muted-foreground max-w-md mx-auto">
            Let's get you set up with a personalized debt management plan.
            We'll guide you through collecting the information needed for AI-powered insights.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex items-start gap-3 p-4 rounded-lg border bg-card hover:shadow-sm transition-shadow"
            >
              <div className="flex-shrink-0">
                <feature.icon className="w-5 h-5 text-primary mt-0.5" />
              </div>
              <div>
                <h3 className="font-medium text-sm mb-1">{feature.title}</h3>
                <p className="text-xs text-muted-foreground">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-muted/50 rounded-lg p-4">
          <h4 className="font-medium text-sm mb-2">What we'll need:</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Your monthly income and employment details</li>
            <li>• Information about your debts (optional to skip)</li>
            <li>• Your financial goals and preferred strategies</li>
          </ul>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-4">
          <p className="text-sm text-destructive font-medium">Authentication Required</p>
          <p className="text-sm text-destructive/80 mt-1">{error}</p>
        </div>
      )}

      <StepNavigation
        onNext={handleStart}
        nextLabel="Get Started"
        canGoBack={false}
        isLoading={isLoading}
      />
    </OnboardingCard>
  );
};

