import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  TrendingUp,
  Calendar,
  DollarSign,
  Target,
  CheckCircle,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { StrategyDetails } from '@/types/ai-insights';

interface RecommendedStrategyCardProps {
  strategy: StrategyDetails;
  isRecommended?: boolean;
  totalDebt: number;
  onApplyStrategy?: () => void;
  onLearnMore?: () => void;
  className?: string;
}

const RecommendedStrategyCard: React.FC<RecommendedStrategyCardProps> = ({
  strategy,
  isRecommended = true,
  totalDebt,
  onApplyStrategy,
  onLearnMore,
  className
}) => {
  // Format currency for Indian locale
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Format time duration
  const formatDuration = (months: number) => {
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;

    if (years === 0) {
      return `${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`;
    } else if (remainingMonths === 0) {
      return `${years} year${years !== 1 ? 's' : ''}`;
    } else {
      return `${years}y ${remainingMonths}m`;
    }
  };

  // Calculate progress percentage (assuming a baseline of debt reduction)
  const progressPercentage = totalDebt > 0 ? ((totalDebt - (totalDebt - strategy.totalInterestSaved)) / totalDebt) * 100 : 0;

  // Calculate monthly savings
  const monthlySavings = strategy.totalInterestSaved / strategy.timeToDebtFree;

  const debtFreeDate = new Date(strategy.debtFreeDate);
  const formattedDebtFreeDate = debtFreeDate.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <Card className={`relative overflow-hidden transition-all duration-200 hover:shadow-lg ${
      isRecommended
        ? 'border-2 border-finance-blue bg-gradient-to-br from-blue-50 to-white'
        : 'border border-gray-200 bg-white'
    } ${className}`}>
      {isRecommended && (
        <div className="absolute top-0 right-0 bg-finance-blue text-white px-3 py-1 text-xs font-medium rounded-bl-lg flex items-center gap-1">
          <Sparkles className="h-3 w-3" />
          AI Recommended
        </div>
      )}

      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-gray-900 mb-2">
              {strategy.name} Strategy
            </CardTitle>
            {strategy.description && (
              <p className="text-sm text-gray-600 leading-relaxed">
                {strategy.description}
              </p>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Key metrics grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4 border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4 text-finance-blue" />
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Time to Debt-Free
              </span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {formatDuration(strategy.timeToDebtFree)}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              By {formattedDebtFreeDate}
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-finance-green" />
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Total Savings
              </span>
            </div>
            <div className="text-2xl font-bold text-finance-green">
              {formatCurrency(strategy.totalInterestSaved)}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              vs. minimum payments
            </div>
          </div>
        </div>

        {/* Monthly payment breakdown */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-finance-blue" />
              <span className="font-medium text-gray-900">Monthly Payment Plan</span>
            </div>
            <Badge variant="outline" className="text-xs">
              {formatCurrency(strategy.monthlyPayment)}/month
            </Badge>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Current minimum payments</span>
              <span className="font-medium">{formatCurrency(strategy.monthlyPayment - monthlySavings)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Additional payment</span>
              <span className="font-medium text-finance-blue">+{formatCurrency(monthlySavings)}</span>
            </div>
            <div className="border-t pt-2">
              <div className="flex justify-between font-medium">
                <span>Total monthly payment</span>
                <span className="text-finance-blue">{formatCurrency(strategy.monthlyPayment)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Progress visualization */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Debt Reduction Progress</span>
            <span className="text-sm text-gray-500">{Math.round(progressPercentage)}% efficiency</span>
          </div>
          <Progress value={Math.min(progressPercentage, 100)} className="h-2" />
          <div className="flex justify-between text-xs text-gray-500">
            <span>Start</span>
            <span>Debt-Free</span>
          </div>
        </div>

        {/* Benefits highlights */}
        <div className="grid grid-cols-1 gap-2">
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <CheckCircle className="h-4 w-4 text-finance-green" />
            <span>Save {formatCurrency(monthlySavings)}/month in interest</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <CheckCircle className="h-4 w-4 text-finance-green" />
            <span>Become debt-free {Math.floor(strategy.timeToDebtFree / 12)} years faster</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <CheckCircle className="h-4 w-4 text-finance-green" />
            <span>Mathematically optimized payment order</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 pt-2">
          <Button
            onClick={onApplyStrategy}
            className="flex-1 bg-finance-blue hover:bg-finance-lightBlue text-white"
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            Apply This Strategy
          </Button>
          <Button
            variant="outline"
            onClick={onLearnMore}
            className="px-4"
          >
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecommendedStrategyCard;