import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Plus, FileText, CheckCircle, ArrowRight, Trash2, Edit2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { OnboardingCard } from '../components/OnboardingCard';
import { StepNavigation } from '../components/StepNavigation';
import { SkipOption } from '../components/SkipOption';
import { useOnboarding } from '@/context/OnboardingContext';
import AddDebtDialog from '@/components/debt/AddDebtDialog';
import { apiService } from '@/lib/api';
import { Debt } from '@/types/debt';
import { toast } from 'sonner';

export const DebtCollectionStep: React.FC = () => {
  const navigate = useNavigate();
  const { skipDebtEntry, navigateToStep, isLoading } = useOnboarding();
  const [selectedOption, setSelectedOption] = useState<'add_debts' | 'skip' | null>(null);
  const [addedDebts, setAddedDebts] = useState<Debt[]>([]);
  const [savingDebt, setSavingDebt] = useState(false);
  const [loadingDebts, setLoadingDebts] = useState(false);

  const handleSkip = async () => {
    try {
      await skipDebtEntry();
      await navigateToStep('goal_setting');
    } catch (error) {
      console.error('Failed to skip debt entry or navigate:', error);
      toast.error('Failed to skip debt entry');
    }
  };

  const handleAddDebts = () => {
    setSelectedOption('add_debts');
  };

  const handleDebtAdded = async (debt: Debt) => {
    try {
      setSavingDebt(true);
      // Save debt to backend
      const savedDebt = await apiService.createDebt(debt);
      setAddedDebts(prev => [...prev, savedDebt]);
      toast.success('Debt added successfully!');

      // Optional: Refresh the debt list to ensure consistency
      // await loadUserDebts();
    } catch (error) {
      console.error('Failed to save debt:', error);
      toast.error('Failed to save debt. Please try again.');
    } finally {
      setSavingDebt(false);
    }
  };

  const loadUserDebts = async () => {
    try {
      setLoadingDebts(true);
      const debts = await apiService.getDebts(true);
      setAddedDebts(debts);
    } catch (error) {
      console.error('Failed to load debts:', error);
      // Don't show error toast for initial load
    } finally {
      setLoadingDebts(false);
    }
  };

  // Load existing debts when component mounts
  useEffect(() => {
    if (selectedOption === 'add_debts') {
      loadUserDebts();
    }
  }, [selectedOption]);

  const handleDeleteDebt = async (debtId: string) => {
    try {
      await apiService.deleteDebt(debtId);
      setAddedDebts(prev => prev.filter(debt => debt.id !== debtId));
      toast.success('Debt removed successfully!');
    } catch (error) {
      console.error('Failed to delete debt:', error);
      toast.error('Failed to remove debt');
    }
  };

  const handleContinue = async () => {
    await navigateToStep('goal_setting');
  };

  const handleBackToChoice = () => {
    setSelectedOption(null);
  };

  const debtTypes = [
    { name: 'Credit Cards', icon: '💳', count: 'Most common' },
    { name: 'Personal Loans', icon: '🏦', count: 'Student & personal' },
    { name: 'Home Loans', icon: '🏠', count: 'Mortgage & home equity' },
    { name: 'Vehicle Loans', icon: '🚗', count: 'Auto & bike loans' },
    { name: 'Business Loans', icon: '💼', count: 'SME & business debt' },
  ];

  const benefits = [
    'Get personalized payoff strategies (Snowball vs Avalanche)',
    'Track interest savings and payoff timelines',
    'Receive AI-powered debt optimization suggestions',
    'Monitor progress with detailed analytics',
    'Set up payment reminders and goals'
  ];

  if (selectedOption === 'add_debts') {
    return (
      <OnboardingCard
        title="Add Your Debts"
        description="Add all your debts to get personalized insights and strategies"
      >
        <div className="space-y-6">
          {/* Added Debts List */}
          {loadingDebts ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground text-sm">Loading your debts...</p>
            </div>
          ) : addedDebts.length > 0 ? (
            <div className="space-y-4">
              <h3 className="font-medium text-sm">Your Debts ({addedDebts.length})</h3>
              <div className="space-y-3">
                {addedDebts.map((debt) => (
                  <Card key={debt.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-sm">{debt.name}</h4>
                          <Badge variant="secondary" className="text-xs">
                            {debt.debt_type.replace('_', ' ')}
                          </Badge>
                          {debt.is_high_priority && (
                            <Badge variant="destructive" className="text-xs">High Priority</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                          <span>Balance: ₹{debt.current_balance.toLocaleString('en-IN')}</span>
                          <span>Min Payment: ₹{debt.minimum_payment.toLocaleString('en-IN')}</span>
                          <span>Lender: {debt.lender}</span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteDebt(debt.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ) : null}

          {/* Add Debt Action */}
          <div className="flex flex-col gap-4">
            <AddDebtDialog onAddDebt={handleDebtAdded} />

            {/* Refresh Button */}
            <Button
              variant="outline"
              onClick={loadUserDebts}
              disabled={loadingDebts}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${loadingDebts ? 'animate-spin' : ''}`} />
              Refresh Debts
            </Button>
          </div>

          {/* Continue Actions */}
          <div className="flex flex-col gap-3 pt-4 border-t">
            {addedDebts.length > 0 && (
              <Button onClick={handleContinue} className="w-full" size="lg">
                Continue with {addedDebts.length} debt{addedDebts.length > 1 ? 's' : ''}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
            
            <Button 
              variant="outline" 
              onClick={handleBackToChoice}
              className="w-full"
            >
              ← Back to Options
            </Button>
            
            {/* Skip option */}
            <div className="text-center">
              <Button
                variant="ghost"
                onClick={handleSkip}
                className="text-muted-foreground text-sm"
                disabled={isLoading}
              >
                Skip and add debts later
              </Button>
            </div>
          </div>
        </div>
      </OnboardingCard>
    );
  }

  return (
    <OnboardingCard
      title="Tell us about your debts"
      description="Adding your debts unlocks AI-powered insights and personalized strategies"
    >
      <div className="space-y-6">
        {/* Benefits Section */}
        <div className="bg-primary/5 rounded-lg p-4">
          <h3 className="font-medium text-sm mb-3 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-primary" />
            What you'll get with debt data:
          </h3>
          <ul className="space-y-2">
            {benefits.map((benefit, index) => (
              <li key={index} className="text-xs text-muted-foreground flex items-start gap-2">
                <div className="w-1 h-1 bg-primary rounded-full mt-2 flex-shrink-0" />
                {benefit}
              </li>
            ))}
          </ul>
        </div>

        {/* Debt Types Preview */}
        <div className="space-y-3">
          <h3 className="font-medium text-sm">Common debt types we support:</h3>
          <div className="grid gap-2 sm:grid-cols-2">
            {debtTypes.map((type, index) => (
              <div key={index} className="flex items-center gap-3 p-3 rounded-lg border bg-card">
                <span className="text-lg">{type.icon}</span>
                <div>
                  <div className="text-sm font-medium">{type.name}</div>
                  <div className="text-xs text-muted-foreground">{type.count}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Options */}
        <div className="space-y-4">
          <Button
            onClick={handleAddDebts}
            className="w-full flex items-center justify-center gap-2"
            size="lg"
          >
            <Plus className="w-4 h-4" />
            Add My Debts Now
          </Button>

          <div className="text-center">
            <span className="text-sm text-muted-foreground">or</span>
          </div>

          <SkipOption
            onSkip={handleSkip}
            title="Skip debt entry for now"
            description="You can always add debts later from your dashboard. Some AI features will be limited until you add debt information."
            buttonText="Continue Without Debts"
            isLoading={isLoading}
          />
        </div>

        {/* Info Note */}
        <div className="bg-muted/50 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <FileText className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div className="text-xs text-muted-foreground">
              <strong>Privacy first:</strong> Your debt information is encrypted and stored securely.
              We use this data solely to provide you with personalized financial insights.
            </div>
          </div>
        </div>
      </div>

      <StepNavigation
        canGoNext={false}
        canGoBack={true}
      />
    </OnboardingCard>
  );
};

