import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Target, Calendar, TrendingUp, DollarSign, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { OnboardingCard } from '../components/OnboardingCard';
import { StepNavigation } from '../components/StepNavigation';
import { useOnboarding } from '@/context/OnboardingContext';
import { useStepValidation } from '../hooks/useStepValidation';
import { OnboardingGoalData } from '@/types/debt';

const goalOptions = [
  {
    value: 'debt_freedom',
    label: 'Become Debt-Free',
    description: 'Pay off all debts as quickly as possible',
    icon: '🎯'
  },
  {
    value: 'reduce_interest',
    label: 'Minimize Interest Payments',
    description: 'Focus on saving money on interest charges',
    icon: '💰'
  },
  {
    value: 'specific_amount',
    label: 'Save a Specific Amount',
    description: 'Reach a target savings or payoff amount',
    icon: '📊'
  },
  {
    value: 'improve_credit',
    label: 'Improve Credit Score',
    description: 'Build better credit history',
    icon: '📈'
  }
];

const strategyOptions = [
  {
    value: 'snowball',
    label: 'Debt Snowball',
    description: 'Pay off smallest debts first for psychological wins',
    recommended: 'Good for motivation'
  },
  {
    value: 'avalanche',
    label: 'Debt Avalanche',
    description: 'Pay off highest interest debts first to save money',
    recommended: 'Mathematically optimal'
  },
  {
    value: 'custom',
    label: 'Custom Strategy',
    description: 'Mix of different approaches based on your situation',
    recommended: 'Flexible approach'
  }
];

export const GoalSettingStep: React.FC = () => {
  const { setGoals, navigateToStep, onboardingData, isLoading } = useOnboarding();
  const { validateGoalData, errors, clearErrors } = useStepValidation();

  const [formData, setFormData] = useState<OnboardingGoalData>({
    goal_type: onboardingData.goals?.goal_type || undefined,
    target_amount: onboardingData.goals?.target_amount || undefined,
    target_date: onboardingData.goals?.target_date || undefined,
    preferred_strategy: onboardingData.goals?.preferred_strategy || undefined,
    monthly_extra_payment: onboardingData.goals?.monthly_extra_payment || 0,
    priority_level: onboardingData.goals?.priority_level || 5,
    description: onboardingData.goals?.description || '',
  });

  useEffect(() => {
    clearErrors();
  }, [clearErrors]);

  const handleInputChange = (field: keyof OnboardingGoalData, value: string | number | Date | undefined) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      clearErrors();
    }
  };

  const handleNext = async () => {
    const validation = validateGoalData(formData);
    if (!validation.isValid) {
      return;
    }

    try {
      // Set the goals first
      await setGoals(formData);
      // Then navigate to the next step
      await navigateToStep('dashboard_intro');
    } catch (error) {
      console.error('Failed to set goals or navigate:', error);
    }
  };

  const handleBack = async () => {
    try {
      await navigateToStep('debt_collection');
    } catch (error) {
      console.error('Failed to navigate back:', error);
    }
  };

  const calculateMonthsToGoal = () => {
    if (!formData.target_amount || !formData.monthly_extra_payment || formData.monthly_extra_payment <= 0) {
      return null;
    }
    return Math.ceil(formData.target_amount / formData.monthly_extra_payment);
  };

  const monthsToGoal = calculateMonthsToGoal();
  const estimatedYears = monthsToGoal ? Math.floor(monthsToGoal / 12) : null;
  const remainingMonths = monthsToGoal ? monthsToGoal % 12 : null;

  const canGoNext = !!(formData.goal_type && formData.preferred_strategy);

  return (
    <OnboardingCard
      title="Set your financial goals"
      description="Define what you want to achieve and how you'd like to get there"
    >
      <div className="space-y-6">
        {/* Primary Goal */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">What's your primary financial goal?</Label>
          <div className="grid gap-3">
            {goalOptions.map((goal) => (
              <button
                key={goal.value}
                type="button"
                onClick={() => handleInputChange('goal_type', goal.value)}
                className={`p-4 rounded-lg border text-left transition-all ${
                  formData.goal_type === goal.value
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{goal.icon}</span>
                  <div className="flex-1">
                    <div className="font-medium text-sm mb-1">{goal.label}</div>
                    <div className="text-xs text-muted-foreground">{goal.description}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
          {errors.goal_type && (
            <p className="text-xs text-destructive">{errors.goal_type}</p>
          )}
        </div>

        {/* Target Amount (for specific amount goal) */}
        {formData.goal_type === 'specific_amount' && (
          <div className="space-y-2">
            <Label htmlFor="target_amount" className="text-sm font-medium">
              What's your target amount? (₹)
            </Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="target_amount"
                type="number"
                placeholder="e.g., 500000"
                value={formData.target_amount || ''}
                onChange={(e) => handleInputChange('target_amount', parseFloat(e.target.value) || undefined)}
                className={`pl-10 ${errors.target_amount ? 'border-destructive' : ''}`}
              />
            </div>
            {errors.target_amount && (
              <p className="text-xs text-destructive">{errors.target_amount}</p>
            )}
          </div>
        )}

        {/* Target Date (optional) */}
        <div className="space-y-2">
          <Label htmlFor="target_date" className="text-sm font-medium">
            Target completion date (optional)
          </Label>
          <Input
            id="target_date"
            type="date"
            value={formData.target_date || ''}
            onChange={(e) => handleInputChange('target_date', e.target.value || undefined)}
            min={new Date().toISOString().split('T')[0]}
          />
          <p className="text-xs text-muted-foreground">
            Leave empty if you don't have a specific timeline in mind
          </p>
        </div>

        {/* Repayment Strategy */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Which repayment strategy appeals to you?</Label>
          <div className="grid gap-3">
            {strategyOptions.map((strategy) => (
              <button
                key={strategy.value}
                type="button"
                onClick={() => handleInputChange('preferred_strategy', strategy.value)}
                className={`p-4 rounded-lg border text-left transition-all ${
                  formData.preferred_strategy === strategy.value
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="font-medium text-sm mb-1">{strategy.label}</div>
                <div className="text-xs text-muted-foreground mb-1">{strategy.description}</div>
                <div className="text-xs text-primary font-medium">{strategy.recommended}</div>
              </button>
            ))}
          </div>
          {errors.preferred_strategy && (
            <p className="text-xs text-destructive">{errors.preferred_strategy}</p>
          )}
        </div>

        {/* Monthly Extra Payment */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">
            How much extra can you pay monthly? (₹)
          </Label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              type="number"
              placeholder="e.g., 5000"
              value={formData.monthly_extra_payment || ''}
              onChange={(e) => handleInputChange('monthly_extra_payment', parseFloat(e.target.value) || 0)}
              className="pl-10"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Extra amount beyond minimum payments
          </p>
        </div>

        {/* Goal Priority */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">
            How important is this goal to you? ({formData.priority_level}/10)
          </Label>
          <Slider
            value={[formData.priority_level || 5]}
            onValueChange={(value) => handleInputChange('priority_level', value[0])}
            max={10}
            min={1}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Low Priority</span>
            <span>High Priority</span>
          </div>
        </div>

        {/* Goal Description */}
        <div className="space-y-2">
          <Label htmlFor="description" className="text-sm font-medium">
            Any additional notes about your goal? (optional)
          </Label>
          <Textarea
            id="description"
            placeholder="Share your motivation or specific circumstances..."
            value={formData.description || ''}
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows={3}
          />
        </div>

        {/* Goal Summary */}
        {canGoNext && (
          <Alert>
            <Target className="h-4 w-4" />
            <AlertDescription>
              <div className="text-sm">
                <strong>Goal Summary:</strong> {
                  goalOptions.find(g => g.value === formData.goal_type)?.label
                }
                {formData.target_amount && ` (₹${formData.target_amount.toLocaleString('en-IN')})`}
                {monthsToGoal && (
                  <div className="mt-1 text-xs">
                    Estimated time: {estimatedYears} year{estimatedYears !== 1 ? 's' : ''} {remainingMonths} month{remainingMonths !== 1 ? 's' : ''}
                  </div>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}
      </div>

      <StepNavigation
        onNext={handleNext}
        onBack={handleBack}
        canGoNext={canGoNext}
        canGoBack={true}
        isLoading={isLoading}
      />
    </OnboardingCard>
  );
};
