import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { IndianRupee, Briefcase, TrendingUp, AlertCircle } from 'lucide-react';
import { OnboardingCard } from '../components/OnboardingCard';
import { StepNavigation } from '../components/StepNavigation';
import { useOnboarding } from '@/context/OnboardingContext';
import { useStepValidation } from '../hooks/useStepValidation';
import { EmploymentStatus, FinancialExperience, IncomeFrequency, OnboardingProfileData } from '@/types/debt';

const employmentOptions: { value: EmploymentStatus; label: string; icon: string }[] = [
  { value: 'employed', label: 'Employed', icon: '💼' },
  { value: 'self_employed', label: 'Self-employed', icon: '🏢' },
  { value: 'unemployed', label: 'Unemployed', icon: '🔍' },
  { value: 'retired', label: 'Retired', icon: '🏖️' },
  { value: 'student', label: 'Student', icon: '🎓' },
];

const experienceOptions: { value: FinancialExperience; label: string; description: string }[] = [
  {
    value: 'beginner',
    label: 'Beginner',
    description: 'New to debt management and personal finance'
  },
  {
    value: 'intermediate',
    label: 'Intermediate',
    description: 'Some experience with budgeting and debt payoff'
  },
  {
    value: 'advanced',
    label: 'Advanced',
    description: 'Experienced with multiple debt strategies and financial planning'
  },
];

const incomeFrequencyOptions: { value: IncomeFrequency; label: string }[] = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'biweekly', label: 'Bi-weekly' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'annually', label: 'Annually' },
];

export const ProfileSetupStep: React.FC = () => {
  const { updateProfile, navigateToStep, onboardingData, isLoading } = useOnboarding();
  const { validateProfileData, errors, clearErrors } = useStepValidation();

  const [formData, setFormData] = useState<OnboardingProfileData>({
    monthly_income: onboardingData.profile?.monthly_income || undefined,
    income_frequency: onboardingData.profile?.income_frequency || 'monthly',
    employment_status: onboardingData.profile?.employment_status || undefined,
    financial_experience: onboardingData.profile?.financial_experience || undefined,
  });

  useEffect(() => {
    clearErrors();
  }, [clearErrors]);

  const handleInputChange = (field: keyof OnboardingProfileData, value: string | number | EmploymentStatus | FinancialExperience | IncomeFrequency | undefined) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      clearErrors();
    }
  };

  const handleNext = async () => {
    const validation = validateProfileData(formData);
    if (!validation.isValid) {
      return;
    }

    try {
      // Update the profile data first
      await updateProfile(formData);
      // Then navigate to the next step
      await navigateToStep('debt_collection');
    } catch (error) {
      console.error('Failed to update profile or navigate:', error);
    }
  };

  const handleBack = async () => {
    try {
      await navigateToStep('welcome');
    } catch (error) {
      console.error('Failed to navigate back:', error);
    }
  };

  const getMonthlyEquivalent = (amount: number, frequency: IncomeFrequency): number => {
    switch (frequency) {
      case 'weekly': return amount * 4.33;
      case 'biweekly': return amount * 2.17;
      case 'monthly': return amount;
      case 'annually': return amount / 12;
      default: return amount;
    }
  };

  const monthlyEquivalent = formData.monthly_income && formData.income_frequency
    ? getMonthlyEquivalent(formData.monthly_income, formData.income_frequency)
    : 0;

  return (
    <OnboardingCard
      title="Let's build your financial profile"
      description="This information helps us provide personalized debt strategies and insights"
    >
      <div className="space-y-6">
        {/* Monthly Income */}
        <div className="space-y-3">
          <Label htmlFor="income" className="text-sm font-medium">
            What's your monthly income?
          </Label>
          <div className="relative">
            <IndianRupee className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="income"
              type="number"
              placeholder="e.g., 50000"
              value={formData.monthly_income || ''}
              onChange={(e) => handleInputChange('monthly_income', parseFloat(e.target.value) || undefined)}
              className={`pl-10 ${errors.monthly_income ? 'border-destructive' : ''}`}
            />
          </div>
          {errors.monthly_income && (
            <p className="text-xs text-destructive">{errors.monthly_income}</p>
          )}
        </div>

        {/* Income Frequency */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">How often do you get paid?</Label>
          <Select
            value={formData.income_frequency}
            onValueChange={(value: IncomeFrequency) => handleInputChange('income_frequency', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select frequency" />
            </SelectTrigger>
            <SelectContent>
              {incomeFrequencyOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Monthly Equivalent Display */}
        {formData.monthly_income && formData.income_frequency && formData.income_frequency !== 'monthly' && (
          <Alert>
            <TrendingUp className="h-4 w-4" />
            <AlertDescription className="text-sm">
              That's approximately ₹{monthlyEquivalent.toLocaleString('en-IN')} per month
            </AlertDescription>
          </Alert>
        )}

        {/* Employment Status */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">What's your employment status?</Label>
          <div className="grid gap-2">
            {employmentOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleInputChange('employment_status', option.value)}
                className={`flex items-center gap-3 p-3 rounded-lg border text-left transition-all ${
                  formData.employment_status === option.value
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <span className="text-lg">{option.icon}</span>
                <span className="text-sm font-medium">{option.label}</span>
              </button>
            ))}
          </div>
          {errors.employment_status && (
            <p className="text-xs text-destructive">{errors.employment_status}</p>
          )}
        </div>

        {/* Financial Experience */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">What's your experience with personal finance?</Label>
          <div className="grid gap-3">
            {experienceOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleInputChange('financial_experience', option.value)}
                className={`p-4 rounded-lg border text-left transition-all ${
                  formData.financial_experience === option.value
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="font-medium text-sm mb-1">{option.label}</div>
                <div className="text-xs text-muted-foreground">{option.description}</div>
              </button>
            ))}
          </div>
          {errors.financial_experience && (
            <p className="text-xs text-destructive">{errors.financial_experience}</p>
          )}
        </div>

        {/* Privacy Notice */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-xs">
            Your information is encrypted and used only to provide personalized financial insights.
            We never share your data with third parties.
          </AlertDescription>
        </Alert>
      </div>

      <StepNavigation
        onNext={handleNext}
        onBack={handleBack}
        canGoNext={!!(formData.monthly_income && formData.employment_status && formData.financial_experience)}
        canGoBack={true}
        isLoading={isLoading}
      />
    </OnboardingCard>
  );
};
