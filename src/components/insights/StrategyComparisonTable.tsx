import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Clock,
  DollarSign,
  Target,
  CheckCircle,
  XCircle,
  ArrowRight,
  Crown,
  Zap,
  AlertTriangle
} from 'lucide-react';
import { StrategyComparison } from '@/types/ai-insights';

interface StrategyComparisonTableProps {
  comparison: StrategyComparison;
  onSelectStrategy?: (strategy: 'avalanche' | 'snowball') => void;
  onViewDetails?: (strategy: 'avalanche' | 'snowball') => void;
  className?: string;
}

const StrategyComparisonTable: React.FC<StrategyComparisonTableProps> = ({
  comparison,
  onSelectStrategy,
  onViewDetails,
  className
}) => {
  const [activeTab, setActiveTab] = useState('overview');

  // Early return if comparison data is incomplete
  if (!comparison || !comparison.avalanche || !comparison.snowball) {
    return (
      <Card className={`transition-all duration-200 ${className}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-finance-blue" />
            Strategy Comparison: Avalanche vs Snowball
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">Comparison Data Unavailable</h3>
              <p className="text-gray-500">Strategy comparison data is being processed. Please try again in a moment.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Format currency
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

  // Format percentage
  const formatPercentage = (value: number, showSign: boolean = true) => {
    const sign = showSign && value > 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

  // Determine which strategy is better for each metric
  const getBetterStrategy = (metric: 'time' | 'interest' | 'payment') => {
    const avalancheTime = comparison.avalanche?.timeToDebtFree || 0;
    const snowballTime = comparison.snowball?.timeToDebtFree || 0;
    const avalancheInterest = comparison.avalanche?.totalInterestPaid || 0;
    const snowballInterest = comparison.snowball?.totalInterestPaid || 0;
    const avalanchePayment = comparison.avalanche?.monthlyPayment || 0;
    const snowballPayment = comparison.snowball?.monthlyPayment || 0;

    switch (metric) {
      case 'time':
        return avalancheTime < snowballTime ? 'avalanche' : 'snowball';
      case 'interest':
        return avalancheInterest < snowballInterest ? 'avalanche' : 'snowball';
      case 'payment':
        return avalanchePayment === snowballPayment ? 'both' :
               avalanchePayment < snowballPayment ? 'avalanche' : 'snowball';
      default:
        return 'both';
    }
  };

  // Ensure differences object exists with default values
  const differences = comparison.differences || {
    timeDifference: (comparison.avalanche?.timeToDebtFree || 0) - (comparison.snowball?.timeToDebtFree || 0),
    interestDifference: (comparison.avalanche?.totalInterestPaid || 0) - (comparison.snowball?.totalInterestPaid || 0),
    paymentDifference: (comparison.avalanche?.monthlyPayment || 0) - (comparison.snowball?.monthlyPayment || 0)
  };

  // Calculate savings comparison with safety checks
  const avalancheSavings = (comparison.snowball?.totalInterestPaid || 0) - (comparison.avalanche?.totalInterestPaid || 0);
  const snowballAdvantage = (comparison.avalanche?.timeToDebtFree || 0) - (comparison.snowball?.timeToDebtFree || 0);

  return (
    <Card className={`transition-all duration-200 ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-finance-blue" />
          Strategy Comparison: Avalanche vs Snowball
        </CardTitle>
        <p className="text-sm text-gray-600">
          Compare the mathematical efficiency of debt avalanche against the psychological benefits of debt snowball
        </p>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="details">Detailed Breakdown</TabsTrigger>
            <TabsTrigger value="timeline">Payment Order</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-6">
            {/* Header with recommended strategy */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border">
              <div className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-finance-blue" />
                <span className="font-medium">AI Recommendation:</span>
                <Badge className="bg-finance-blue text-white">
                  {(comparison.recommended || 'avalanche') === 'avalanche' ? 'Debt Avalanche' : 'Debt Snowball'}
                </Badge>
              </div>
              <Button
                onClick={() => onSelectStrategy?.(comparison.recommended || 'avalanche')}
                size="sm"
                className="bg-finance-blue hover:bg-finance-lightBlue text-white"
              >
                Apply Recommended
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>

            {/* Main comparison table */}
            <div className="overflow-hidden rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-semibold">Metric</TableHead>
                    <TableHead className="text-center font-semibold">
                      <div className="flex items-center justify-center gap-2">
                        <Target className="h-4 w-4 text-red-500" />
                        Debt Avalanche
                      </div>
                    </TableHead>
                    <TableHead className="text-center font-semibold">
                      <div className="flex items-center justify-center gap-2">
                        <Zap className="h-4 w-4 text-blue-500" />
                        Debt Snowball
                      </div>
                    </TableHead>
                    <TableHead className="text-center font-semibold">Difference</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        Time to Debt-Free
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-col items-center">
                        <span className="font-semibold">{formatDuration(comparison.avalanche?.timeToDebtFree || 0)}</span>
                        {getBetterStrategy('time') === 'avalanche' && (
                          <CheckCircle className="h-4 w-4 text-finance-green mt-1" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-col items-center">
                        <span className="font-semibold">{formatDuration(comparison.snowball?.timeToDebtFree || 0)}</span>
                        {getBetterStrategy('time') === 'snowball' && (
                          <CheckCircle className="h-4 w-4 text-finance-green mt-1" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        {differences.timeDifference > 0 ? (
                          <TrendingUp className="h-4 w-4 text-red-500" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-finance-green" />
                        )}
                        <span className={`font-medium ${differences.timeDifference > 0 ? 'text-red-600' : 'text-finance-green'}`}>
                          {Math.abs(differences.timeDifference)} months
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-gray-500" />
                        Total Interest Paid
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-col items-center">
                        <span className="font-semibold">{formatCurrency(comparison.avalanche?.totalInterestPaid || 0)}</span>
                        {getBetterStrategy('interest') === 'avalanche' && (
                          <CheckCircle className="h-4 w-4 text-finance-green mt-1" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-col items-center">
                        <span className="font-semibold">{formatCurrency(comparison.snowball?.totalInterestPaid || 0)}</span>
                        {getBetterStrategy('interest') === 'snowball' && (
                          <CheckCircle className="h-4 w-4 text-finance-green mt-1" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        {differences.interestDifference > 0 ? (
                          <TrendingUp className="h-4 w-4 text-red-500" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-finance-green" />
                        )}
                        <span className={`font-medium ${differences.interestDifference > 0 ? 'text-red-600' : 'text-finance-green'}`}>
                          {formatCurrency(Math.abs(differences.interestDifference))}
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-gray-500" />
                        Monthly Payment
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="font-semibold">{formatCurrency(comparison.avalanche?.monthlyPayment || 0)}</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="font-semibold">{formatCurrency(comparison.snowball?.monthlyPayment || 0)}</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="text-gray-500 font-medium">Same</span>
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-gray-500" />
                        Debt-Free Date
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="text-sm">{comparison.avalanche?.debtFreeDate ? new Date(comparison.avalanche.debtFreeDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'short' }) : 'N/A'}</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="text-sm">{comparison.snowball?.debtFreeDate ? new Date(comparison.snowball.debtFreeDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'short' }) : 'N/A'}</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="text-gray-500 text-sm">
                        {Math.abs(differences.timeDifference)} months
                      </span>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            {/* Strategy benefits breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-red-200 bg-red-50">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-red-700">
                    <Target className="h-4 w-4" />
                    Debt Avalanche Benefits
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-finance-green" />
                    <span>Mathematically optimal</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-finance-green" />
                    <span>Saves {formatCurrency(avalancheSavings)} in interest</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-finance-green" />
                    <span>Faster debt elimination</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <XCircle className="h-4 w-4 text-red-500" />
                    <span>May feel slower initially</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-blue-200 bg-blue-50">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-blue-700">
                    <Zap className="h-4 w-4" />
                    Debt Snowball Benefits
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-finance-green" />
                    <span>Quick psychological wins</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-finance-green" />
                    <span>Builds momentum & motivation</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-finance-green" />
                    <span>Simplifies budget planning</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <XCircle className="h-4 w-4 text-red-500" />
                    <span>Costs {formatCurrency(avalancheSavings)} more</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={() => onSelectStrategy?.('avalanche')}
                variant={(comparison.recommended || 'avalanche') === 'avalanche' ? 'default' : 'outline'}
                className="flex-1"
              >
                <Target className="h-4 w-4 mr-2" />
                Choose Avalanche
              </Button>
              <Button
                onClick={() => onSelectStrategy?.('snowball')}
                variant={(comparison.recommended || 'avalanche') === 'snowball' ? 'default' : 'outline'}
                className="flex-1"
              >
                <Zap className="h-4 w-4 mr-2" />
                Choose Snowball
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="details" className="mt-6">
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Detailed financial breakdown showing the long-term impact of each strategy on your debt elimination journey.
              </p>

              {/* Detailed metrics would be displayed here */}
              <div className="p-6 border rounded-lg bg-gray-50 text-center">
                <p className="text-gray-500">Detailed breakdown view - Implementation in progress</p>
                <Button variant="outline" size="sm" className="mt-2">
                  View Full Analysis
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="timeline" className="mt-6">
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Payment order and timeline showing which debts get paid off first in each strategy.
              </p>

              {/* Payment timeline would be displayed here */}
              <div className="p-6 border rounded-lg bg-gray-50 text-center">
                <p className="text-gray-500">Payment timeline view - Implementation in progress</p>
                <Button variant="outline" size="sm" className="mt-2">
                  View Payment Schedule
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default StrategyComparisonTable;