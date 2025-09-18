import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  CreditCard,
  TrendingUp,
  Brain,
  Bell,
  Settings,
  CheckCircle,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { OnboardingCard } from '../components/OnboardingCard';
import { StepNavigation } from '../components/StepNavigation';
import { useOnboarding } from '@/context/OnboardingContext';

export const DashboardIntroStep: React.FC = () => {
  const navigate = useNavigate();
  const { completeOnboarding, navigateToStep, isLoading } = useOnboarding();

  const handleComplete = async () => {
    await completeOnboarding();
    // OnboardingFlow will handle the redirect when isCompleted becomes true
  };

  const handleBack = async () => {
    try {
      await navigateToStep('goal_setting');
    } catch (error) {
      console.error('Failed to navigate back:', error);
    }
  };

  const features = [
    {
      icon: LayoutDashboard,
      title: 'Dashboard Overview',
      description: 'Get a complete view of your financial health with debt summaries and progress tracking',
      highlight: 'Your central hub'
    },
    {
      icon: CreditCard,
      title: 'Debt Management',
      description: 'Add, edit, and track all your debts with detailed payment history',
      highlight: 'Organize everything'
    },
    {
      icon: Brain,
      title: 'AI Insights',
      description: 'Receive personalized recommendations powered by advanced AI analysis',
      highlight: 'Smart suggestions'
    },
    {
      icon: TrendingUp,
      title: 'Progress Tracking',
      description: 'Monitor your debt payoff journey with charts and milestone celebrations',
      highlight: 'Visual progress'
    },
    {
      icon: Bell,
      title: 'Smart Reminders',
      description: 'Get notified about upcoming payments and stay on track with your goals',
      highlight: 'Never miss a payment'
    },
    {
      icon: Settings,
      title: 'Flexible Settings',
      description: 'Customize your experience and update your financial information anytime',
      highlight: 'Fully customizable'
    }
  ];

  return (
    <OnboardingCard
      title="You're all set! Welcome to your dashboard"
      description="Here's what DebtEase can do for you"
    >
      <div className="space-y-6">
        {/* Welcome Message */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Setup Complete!</h3>
          <p className="text-muted-foreground text-sm">
            Your personalized debt management dashboard is ready. Let's explore what you can do.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid gap-4 sm:grid-cols-2">
          {features.map((feature, index) => (
            <Card key={index} className="border-border/50 hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <feature.icon className="w-5 h-5 text-primary" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm mb-1">{feature.title}</h4>
                    <p className="text-xs text-muted-foreground mb-2">{feature.description}</p>
                    <span className="inline-block px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded">
                      {feature.highlight}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Getting Started Tips */}
        <div className="bg-primary/5 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-sm mb-2">Quick Start Tips:</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Add your debts to unlock AI-powered insights</li>
                <li>• Set up payment reminders to stay on track</li>
                <li>• Check the AI recommendations for personalized strategies</li>
                <li>• Use the progress charts to visualize your journey</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Data Status */}
        <div className="bg-muted/50 rounded-lg p-4">
          <h4 className="font-medium text-sm mb-3">Your Setup Summary:</h4>
          <div className="grid gap-2 text-xs">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Financial profile configured</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Goals and preferences set</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-muted-foreground/30 rounded-full" />
              <span>Debt information (add anytime)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-muted-foreground/30 rounded-full" />
              <span>AI insights (available after adding debts)</span>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <Button
            onClick={handleComplete}
            size="lg"
            className="w-full sm:w-auto px-8 flex items-center gap-2"
            disabled={isLoading}
          >
            {isLoading ? 'Setting up...' : 'Enter My Dashboard'}
            <ArrowRight className="w-4 h-4" />
          </Button>
          <p className="text-xs text-muted-foreground mt-2">
            You can always update your information from dashboard settings
          </p>
        </div>
      </div>

      <StepNavigation
        onBack={handleBack}
        canGoNext={false}
        canGoBack={true}
        isLoading={isLoading}
      />
    </OnboardingCard>
  );
};

