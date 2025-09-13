import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { ArrowRight, ArrowLeft, IndianRupee, Target, CheckCircle } from 'lucide-react';

const Onboarding = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    monthly_income: '',
    financial_goal: '',
  });

  const totalSteps = 3;

  const handleNext = () => {
    if (currentStep === 1 && !formData.monthly_income) {
      toast.error('Please enter your monthly income');
      return;
    }
    if (currentStep === 2 && !formData.financial_goal) {
      toast.error('Please select your financial goal');
      return;
    }
    
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Save onboarding data
      const currentUser = JSON.parse(localStorage.getItem('debtease_user') || '{}');
      const updatedUser = {
        ...currentUser,
        monthly_income: parseFloat(formData.monthly_income),
        financial_goal: formData.financial_goal,
        onboarding_completed: true
      };
      localStorage.setItem('debtease_user', JSON.stringify(updatedUser));
      
      toast.success('Welcome to DebtEase! Let\'s start managing your debts.');
      navigate('/dashboard');
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <IndianRupee className="h-16 w-16 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold">What's your monthly income?</h2>
              <p className="text-muted-foreground mt-2">
                This helps us provide personalized debt management advice
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="income">Monthly Income (₹)</Label>
              <Input
                id="income"
                type="number"
                placeholder="e.g., 50000"
                value={formData.monthly_income}
                onChange={(e) => setFormData(prev => ({ ...prev, monthly_income: e.target.value }))}
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Target className="h-16 w-16 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold">What's your main goal?</h2>
              <p className="text-muted-foreground mt-2">
                Choose your primary financial objective
              </p>
            </div>
            
            <div className="grid gap-3">
              {[
                { value: 'debt_free', label: 'Become debt-free', desc: 'Pay off all debts as quickly as possible' },
                { value: 'save_interest', label: 'Save on interest', desc: 'Minimize total interest payments' },
                { value: 'improve_credit', label: 'Improve credit score', desc: 'Build better credit history' },
                { value: 'emergency_fund', label: 'Build emergency fund', desc: 'Save money while managing debts' }
              ].map((goal) => (
                <Card 
                  key={goal.value}
                  className={`cursor-pointer transition-all ${
                    formData.financial_goal === goal.value ? 'ring-2 ring-primary' : 'hover:shadow-md'
                  }`}
                  onClick={() => setFormData(prev => ({ ...prev, financial_goal: goal.value }))}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-4 h-4 rounded-full border-2 ${
                        formData.financial_goal === goal.value 
                          ? 'bg-primary border-primary' 
                          : 'border-muted-foreground'
                      }`} />
                      <div className="flex-1">
                        <h3 className="font-medium">{goal.label}</h3>
                        <p className="text-sm text-muted-foreground">{goal.desc}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold">You're all set!</h2>
              <p className="text-muted-foreground mt-2">
                Ready to start your debt-free journey with DebtEase
              </p>
            </div>
            
            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <h3 className="font-medium">Your Profile Summary:</h3>
              <div className="text-sm space-y-1">
                <p><span className="font-medium">Monthly Income:</span> ₹{parseInt(formData.monthly_income).toLocaleString('en-IN')}</p>
                <p><span className="font-medium">Primary Goal:</span> {
                  formData.financial_goal === 'debt_free' ? 'Become debt-free' :
                  formData.financial_goal === 'save_interest' ? 'Save on interest' :
                  formData.financial_goal === 'improve_credit' ? 'Improve credit score' :
                  'Build emergency fund'
                }</p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary">DebtEase</h1>
          <div className="flex items-center justify-center mt-4 space-x-2">
            {Array.from({ length: totalSteps }).map((_, index) => (
              <div
                key={index}
                className={`w-8 h-2 rounded-full ${
                  index + 1 <= currentStep ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Step {currentStep} of {totalSteps}
          </p>
        </div>

        <Card>
          <CardContent className="p-6">
            {renderStep()}
            
            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 1}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              
              <Button
                onClick={handleNext}
                className="flex items-center gap-2"
              >
                {currentStep === totalSteps ? 'Get Started' : 'Next'}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Onboarding;