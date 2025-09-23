import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Settings,
  Play,
  RotateCcw,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Clock,
  Zap,
  AlertCircle
} from 'lucide-react';
import { SimulationParameters, SimulationResults, DebtStrategy } from '@/types/ai-insights';

interface SimulationControlsProps {
  currentMonthlyPayment: number;
  totalDebt: number;
  minimumPayment: number;
  onSimulate: (params: SimulationParameters) => Promise<SimulationResults>;
  simulationResults?: SimulationResults;
  isLoading?: boolean;
  className?: string;
}

const SimulationControls: React.FC<SimulationControlsProps> = ({
  currentMonthlyPayment,
  totalDebt,
  minimumPayment,
  onSimulate,
  simulationResults,
  isLoading = false,
  className
}) => {
  const [monthlyPayment, setMonthlyPayment] = useState(currentMonthlyPayment);
  const [strategy, setStrategy] = useState<DebtStrategy>('avalanche');
  const [extraPayment, setExtraPayment] = useState(0);
  const [isSimulating, setIsSimulating] = useState(false);

  // Debounced simulation trigger
  const [simulationTimeout, setSimulationTimeout] = useState<NodeJS.Timeout | null>(null);

  // Calculate payment ranges
  const maxPayment = Math.max(totalDebt * 0.1, currentMonthlyPayment * 3); // 10% of debt or 3x current payment
  const paymentStep = Math.max(100, Math.floor(currentMonthlyPayment * 0.05)); // 5% steps or ₹100 minimum

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Debounced simulation execution
  const debouncedSimulate = useCallback(
    (params: SimulationParameters) => {
      if (simulationTimeout) {
        clearTimeout(simulationTimeout);
      }

      const timeout = setTimeout(async () => {
        setIsSimulating(true);
        try {
          await onSimulate(params);
        } catch (error) {
          console.error('Simulation error:', error);
        } finally {
          setIsSimulating(false);
        }
      }, 500); // 500ms debounce

      setSimulationTimeout(timeout);
    },
    [onSimulate, simulationTimeout]
  );

  // Trigger simulation when parameters change
  useEffect(() => {
    const params: SimulationParameters = {
      monthlyPayment,
      strategy,
      extraPayment: extraPayment > 0 ? extraPayment : undefined,
    };

    debouncedSimulate(params);

    return () => {
      if (simulationTimeout) {
        clearTimeout(simulationTimeout);
      }
    };
  }, [monthlyPayment, strategy, extraPayment]);

  // Reset to defaults
  const handleReset = () => {
    setMonthlyPayment(currentMonthlyPayment);
    setStrategy('avalanche');
    setExtraPayment(0);
  };

  // Quick preset buttons
  const handleQuickPreset = (multiplier: number) => {
    const newPayment = Math.round(currentMonthlyPayment * multiplier);
    setMonthlyPayment(newPayment);
  };

  // Calculate impact preview
  const impactPreview = simulationResults ? {
    timeSavings: simulationResults.originalPlan.timeToDebtFree - simulationResults.optimizedPlan.timeToDebtFree,
    interestSavings: simulationResults.savings.interestAmount,
    percentageImprovement: simulationResults.savings.percentageImprovement
  } : null;

  return (
    <Card className={`transition-all duration-200 ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-finance-blue" />
          Payment Simulation
        </CardTitle>
        <p className="text-sm text-gray-600">
          Adjust your monthly payment to see real-time impact on your debt freedom timeline
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Monthly Payment Slider */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Monthly Payment Amount</Label>
            <Badge variant="outline" className="font-mono">
              {formatCurrency(monthlyPayment)}
            </Badge>
          </div>

          <div className="px-2">
            <Slider
              value={[monthlyPayment]}
              onValueChange={(value) => setMonthlyPayment(value[0])}
              max={maxPayment}
              min={minimumPayment}
              step={paymentStep}
              className="w-full"
            />
          </div>

          <div className="flex justify-between text-xs text-gray-500">
            <span>Min: {formatCurrency(minimumPayment)}</span>
            <span>Current: {formatCurrency(currentMonthlyPayment)}</span>
            <span>Max: {formatCurrency(maxPayment)}</span>
          </div>

          {/* Quick preset buttons */}
          <div className="flex gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickPreset(1.25)}
              className="text-xs"
            >
              +25%
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickPreset(1.5)}
              className="text-xs"
            >
              +50%
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickPreset(2)}
              className="text-xs"
            >
              Double
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="text-xs ml-auto"
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              Reset
            </Button>
          </div>
        </div>

        <Separator />

        {/* Strategy Selection */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Repayment Strategy</Label>
          <Select value={strategy} onValueChange={(value: DebtStrategy) => setStrategy(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="avalanche">
                Avalanche (Highest Interest First)
              </SelectItem>
              <SelectItem value="snowball">
                Snowball (Smallest Balance First)
              </SelectItem>
              <SelectItem value="custom">
                Custom Strategy
              </SelectItem>
            </SelectContent>
          </Select>

          <div className="text-xs text-gray-500">
            {strategy === 'avalanche' && 'Pay minimum on all debts, extra goes to highest interest rate'}
            {strategy === 'snowball' && 'Pay minimum on all debts, extra goes to smallest balance'}
            {strategy === 'custom' && 'Create your own payment priority order'}
          </div>
        </div>

        <Separator />

        {/* Extra Payment Input */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Additional One-time Payment</Label>
            <Badge variant="outline" className="font-mono">
              {formatCurrency(extraPayment)}
            </Badge>
          </div>

          <div className="px-2">
            <Slider
              value={[extraPayment]}
              onValueChange={(value) => setExtraPayment(value[0])}
              max={100000}
              min={0}
              step={1000}
              className="w-full"
            />
          </div>

          <div className="text-xs text-gray-500">
            Simulate a bonus payment, tax refund, or windfall
          </div>
        </div>

        {/* Real-time Impact Preview */}
        {impactPreview && (
          <>
            <Separator />
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-finance-green" />
                <span className="text-sm font-medium">Impact Preview</span>
                {(isSimulating || isLoading) && (
                  <div className="h-3 w-3 animate-spin rounded-full border-2 border-finance-blue border-t-transparent" />
                )}
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Clock className="h-3 w-3 text-gray-500" />
                  </div>
                  <div className="text-lg font-bold text-gray-900">
                    {impactPreview.timeSavings}
                  </div>
                  <div className="text-xs text-gray-500">months saved</div>
                </div>

                <div className="text-center p-3 bg-finance-green/10 rounded-lg">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <DollarSign className="h-3 w-3 text-finance-green" />
                  </div>
                  <div className="text-lg font-bold text-finance-green">
                    {formatCurrency(impactPreview.interestSavings)}
                  </div>
                  <div className="text-xs text-gray-500">interest saved</div>
                </div>

                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    {impactPreview.percentageImprovement > 0 ? (
                      <TrendingUp className="h-3 w-3 text-finance-blue" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-500" />
                    )}
                  </div>
                  <div className="text-lg font-bold text-finance-blue">
                    {impactPreview.percentageImprovement.toFixed(1)}%
                  </div>
                  <div className="text-xs text-gray-500">improvement</div>
                </div>
              </div>

              {impactPreview.percentageImprovement > 20 && (
                <div className="flex items-start gap-2 p-3 bg-finance-green/10 border border-finance-green/20 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-finance-green mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <span className="font-medium text-finance-green">Excellent optimization!</span>
                    <span className="text-gray-700"> This payment plan could significantly accelerate your debt freedom.</span>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Action Button */}
        <div className="pt-2">
          <Button
            className="w-full bg-finance-blue hover:bg-finance-lightBlue text-white"
            disabled={isSimulating || isLoading}
            onClick={() => {
              const params: SimulationParameters = {
                monthlyPayment,
                strategy,
                extraPayment: extraPayment > 0 ? extraPayment : undefined,
              };
              onSimulate(params);
            }}
          >
            {isSimulating || isLoading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                Calculating...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Run Detailed Analysis
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SimulationControls;