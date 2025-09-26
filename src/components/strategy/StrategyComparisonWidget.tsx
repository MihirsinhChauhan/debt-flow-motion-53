// Strategy Comparison Widget - Visual comparison of debt payoff strategies
// Provides side-by-side analysis of different debt repayment approaches

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  DollarSign,
  Target,
  Clock,
  BarChart3,
  ArrowRight,
  Zap,
  Shield,
  Award,
  AlertTriangle,
  Info,
  CheckCircle,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { apiService } from '@/lib/api';
import { StrategyComparison, DebtStrategy, StrategyDetails } from '@/types/ai-insights';

interface StrategyComparisonWidgetProps {
  currentStrategy?: DebtStrategy;
  monthlyBudget?: number;
  onStrategySelect?: (strategy: DebtStrategy) => void;
  onSimulateStrategy?: (strategy: DebtStrategy) => void;
  className?: string;
}

interface StrategyMetrics {
  timeToDebtFree: number;
  totalInterestPaid: number;
  monthlyPayment: number;
  totalSavings: number;
  debtFreeDate: string;
  paymentOrder: string[];
  pros: string[];
  cons: string[];
  idealFor: string[];
  difficulty: 'easy' | 'moderate' | 'challenging';
  psychologicalBenefit: number;
  financialOptimization: number;
}

interface StrategyCard {
  strategy: DebtStrategy;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  metrics: StrategyMetrics;
  isRecommended?: boolean;
  confidence?: number;
}

const StrategyComparisonWidget: React.FC<StrategyComparisonWidgetProps> = ({
  currentStrategy = 'snowball',
  monthlyBudget = 10000,
  onStrategySelect,
  onSimulateStrategy,
  className = ''
}) => {
  const [comparison, setComparison] = useState<StrategyComparison | null>(null);
  const [selectedStrategies, setSelectedStrategies] = useState<DebtStrategy[]>(['avalanche', 'snowball']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'comparison' | 'detailed' | 'timeline'>('comparison');

  // Strategy configurations
  const strategies: StrategyCard[] = [
    {
      strategy: 'avalanche',
      name: 'Debt Avalanche',
      description: 'Pay off highest interest rate debts first',
      icon: TrendingUp,
      color: 'text-red-600 bg-red-50 border-red-200',
      metrics: {
        timeToDebtFree: 24,
        totalInterestPaid: 45000,
        monthlyPayment: 12000,
        totalSavings: 25000,
        debtFreeDate: '2026-09-26',
        paymentOrder: ['Credit Card A (24%)', 'Personal Loan (18%)', 'Credit Card B (15%)'],
        pros: [
          'Minimizes total interest paid',
          'Mathematically optimal',
          'Saves the most money overall'
        ],
        cons: [
          'May take longer to see progress',
          'Requires strong discipline',
          'Less psychological motivation'
        ],
        idealFor: [
          'Disciplined borrowers',
          'Those focused on minimizing costs',
          'High-interest debt holders'
        ],
        difficulty: 'moderate',
        psychologicalBenefit: 60,
        financialOptimization: 95
      },
      isRecommended: true,
      confidence: 92
    },
    {
      strategy: 'snowball',
      name: 'Debt Snowball',
      description: 'Pay off smallest balances first',
      icon: Award,
      color: 'text-blue-600 bg-blue-50 border-blue-200',
      metrics: {
        timeToDebtFree: 26,
        totalInterestPaid: 52000,
        monthlyPayment: 12000,
        totalSavings: 18000,
        debtFreeDate: '2026-11-26',
        paymentOrder: ['Credit Card B (₹35k)', 'Personal Loan (₹85k)', 'Credit Card A (₹125k)'],
        pros: [
          'Quick early wins boost motivation',
          'Simplifies debt management',
          'Builds momentum and confidence'
        ],
        cons: [
          'Higher total interest costs',
          'Not mathematically optimal',
          'May cost more in the long run'
        ],
        idealFor: [
          'Those needing motivation',
          'Multiple small debts',
          'Emotional debt struggles'
        ],
        difficulty: 'easy',
        psychologicalBenefit: 90,
        financialOptimization: 75
      },
      confidence: 85
    },
    {
      strategy: 'custom',
      name: 'Custom Strategy',
      description: 'Tailored approach based on your priorities',
      icon: Target,
      color: 'text-purple-600 bg-purple-50 border-purple-200',
      metrics: {
        timeToDebtFree: 25,
        totalInterestPaid: 48000,
        monthlyPayment: 12000,
        totalSavings: 22000,
        debtFreeDate: '2026-10-26',
        paymentOrder: ['Strategic mix based on rates and balances'],
        pros: [
          'Balanced approach',
          'Considers personal factors',
          'Flexible and adaptable'
        ],
        cons: [
          'Requires more planning',
          'May be complex to execute',
          'Results vary by execution'
        ],
        idealFor: [
          'Experienced debt managers',
          'Complex debt situations',
          'Those wanting control'
        ],
        difficulty: 'challenging',
        psychologicalBenefit: 75,
        financialOptimization: 85
      },
      confidence: 78
    }
  ];

  // Fetch comparison data
  const fetchComparison = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiService.compareStrategies();
      setComparison(response.comparison);
    } catch (err) {
      console.error('Failed to fetch strategy comparison:', err);
      setError('Failed to load strategy comparison. Using default data.');

      // Fallback to mock data
      setComparison({
        avalanche: strategies[0].metrics,
        snowball: strategies[1].metrics,
        recommended: 'avalanche',
        differences: {
          timeDifference: 2,
          interestDifference: 7000,
          paymentDifference: 0
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchComparison();
  }, []);

  // Format currency for Indian market
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Format duration
  const formatDuration = (months: number) => {
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;

    if (years === 0) return `${months} months`;
    if (remainingMonths === 0) return `${years} ${years === 1 ? 'year' : 'years'}`;
    return `${years}y ${remainingMonths}m`;
  };

  // Handle strategy selection
  const handleStrategySelect = (strategy: DebtStrategy) => {
    onStrategySelect?.(strategy);
  };

  // Handle strategy simulation
  const handleSimulateStrategy = (strategy: DebtStrategy) => {
    onSimulateStrategy?.(strategy);
  };

  // Toggle strategy in comparison
  const toggleStrategyComparison = (strategy: DebtStrategy) => {
    setSelectedStrategies(prev => {
      if (prev.includes(strategy)) {
        return prev.filter(s => s !== strategy);
      } else if (prev.length < 3) {
        return [...prev, strategy];
      }
      return prev;
    });
  };

  const getStrategyData = (strategy: DebtStrategy) => {
    return strategies.find(s => s.strategy === strategy);
  };

  const selectedStrategyData = selectedStrategies.map(getStrategyData).filter(Boolean);

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Strategy Comparison
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse">
                <div className="h-24 bg-gray-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Strategy Comparison
          </CardTitle>

          <div className="flex items-center gap-2">
            <Button
              onClick={fetchComparison}
              variant="outline"
              size="sm"
              disabled={isLoading}
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {error && (
          <Alert className="mt-4 bg-amber-50 border-amber-200">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              {error}
            </AlertDescription>
          </Alert>
        )}
      </CardHeader>

      <CardContent>
        <Tabs value={viewMode} onValueChange={(value: any) => setViewMode(value)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="comparison">Comparison</TabsTrigger>
            <TabsTrigger value="detailed">Detailed</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
          </TabsList>

          {/* Strategy Selection */}
          <div className="mt-4 mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Select strategies to compare (max 3):</h4>
            <div className="flex flex-wrap gap-2">
              {strategies.map((strategy) => (
                <Button
                  key={strategy.strategy}
                  variant={selectedStrategies.includes(strategy.strategy) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => toggleStrategyComparison(strategy.strategy)}
                  disabled={!selectedStrategies.includes(strategy.strategy) && selectedStrategies.length >= 3}
                  className="flex items-center gap-2"
                >
                  <strategy.icon className="h-4 w-4" />
                  {strategy.name}
                  {strategy.isRecommended && (
                    <Badge className="bg-green-100 text-green-700 text-xs ml-1">
                      Recommended
                    </Badge>
                  )}
                </Button>
              ))}
            </div>
          </div>

          <TabsContent value="comparison" className="mt-0">
            <div className="grid gap-4">
              {selectedStrategyData.map((strategy, index) => (
                <motion.div
                  key={strategy.strategy}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`border rounded-lg p-4 ${strategy.color} ${strategy.isRecommended ? 'ring-2 ring-green-300' : ''}`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${strategy.color}`}>
                        <strategy.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold flex items-center gap-2">
                          {strategy.name}
                          {strategy.isRecommended && (
                            <Badge className="bg-green-100 text-green-700 text-xs">
                              AI Recommended
                            </Badge>
                          )}
                        </h3>
                        <p className="text-sm text-gray-600">{strategy.description}</p>
                      </div>
                    </div>

                    {strategy.confidence && (
                      <div className="text-right">
                        <div className="text-xs text-gray-500 mb-1">Confidence</div>
                        <div className="flex items-center gap-1">
                          <Progress value={strategy.confidence} className="h-2 w-16" />
                          <span className="text-xs text-gray-600">{strategy.confidence}%</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span className="text-xs text-gray-500">Time to Freedom</span>
                      </div>
                      <p className="font-semibold">{formatDuration(strategy.metrics.timeToDebtFree)}</p>
                    </div>

                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <DollarSign className="h-4 w-4 text-gray-500" />
                        <span className="text-xs text-gray-500">Total Interest</span>
                      </div>
                      <p className="font-semibold">{formatCurrency(strategy.metrics.totalInterestPaid)}</p>
                    </div>

                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <TrendingDown className="h-4 w-4 text-gray-500" />
                        <span className="text-xs text-gray-500">Total Savings</span>
                      </div>
                      <p className="font-semibold text-green-600">{formatCurrency(strategy.metrics.totalSavings)}</p>
                    </div>

                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span className="text-xs text-gray-500">Debt Free Date</span>
                      </div>
                      <p className="font-semibold">{new Date(strategy.metrics.debtFreeDate).toLocaleDateString('en-IN')}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Psychological Benefit</h4>
                      <div className="flex items-center gap-2">
                        <Progress value={strategy.metrics.psychologicalBenefit} className="flex-1 h-2" />
                        <span className="text-sm text-gray-600">{strategy.metrics.psychologicalBenefit}%</span>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Financial Optimization</h4>
                      <div className="flex items-center gap-2">
                        <Progress value={strategy.metrics.financialOptimization} className="flex-1 h-2" />
                        <span className="text-sm text-gray-600">{strategy.metrics.financialOptimization}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleStrategySelect(strategy.strategy)}
                      className="flex-1"
                      variant={currentStrategy === strategy.strategy ? 'default' : 'outline'}
                    >
                      {currentStrategy === strategy.strategy ? (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Current Strategy
                        </>
                      ) : (
                        <>
                          <ArrowRight className="h-4 w-4 mr-2" />
                          Select Strategy
                        </>
                      )}
                    </Button>

                    <Button
                      onClick={() => handleSimulateStrategy(strategy.strategy)}
                      variant="outline"
                    >
                      <Zap className="h-4 w-4 mr-2" />
                      Simulate
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Quick Comparison Summary */}
            {selectedStrategyData.length > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border"
              >
                <h4 className="font-semibold text-gray-900 mb-3">Quick Comparison</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Fastest to debt freedom:</span>
                    <span className="font-medium">
                      {selectedStrategyData.reduce((fastest, strategy) =>
                        strategy.metrics.timeToDebtFree < fastest.metrics.timeToDebtFree ? strategy : fastest
                      ).name}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Lowest total interest:</span>
                    <span className="font-medium">
                      {selectedStrategyData.reduce((lowest, strategy) =>
                        strategy.metrics.totalInterestPaid < lowest.metrics.totalInterestPaid ? strategy : lowest
                      ).name}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Best psychological boost:</span>
                    <span className="font-medium">
                      {selectedStrategyData.reduce((best, strategy) =>
                        strategy.metrics.psychologicalBenefit > best.metrics.psychologicalBenefit ? strategy : best
                      ).name}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </TabsContent>

          <TabsContent value="detailed">
            <div className="space-y-6">
              {selectedStrategyData.map((strategy) => (
                <div key={strategy.strategy} className="border rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`p-2 rounded-lg ${strategy.color}`}>
                      <strategy.icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-semibold">{strategy.name}</h3>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6">
                    <div>
                      <h4 className="font-medium text-green-700 mb-2">✅ Pros</h4>
                      <ul className="space-y-1">
                        {strategy.metrics.pros.map((pro, index) => (
                          <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                            {pro}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-medium text-red-700 mb-2">❌ Cons</h4>
                      <ul className="space-y-1">
                        {strategy.metrics.cons.map((con, index) => (
                          <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                            <X className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                            {con}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-medium text-blue-700 mb-2">🎯 Ideal For</h4>
                      <ul className="space-y-1">
                        {strategy.metrics.idealFor.map((ideal, index) => (
                          <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                            <Target className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                            {ideal}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-700 mb-2">Payment Order</h4>
                    <div className="space-y-1">
                      {strategy.metrics.paymentOrder.map((order, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <Badge variant="outline" className="w-6 h-6 p-0 flex items-center justify-center text-xs">
                            {index + 1}
                          </Badge>
                          <span className="text-gray-700">{order}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Difficulty:</span>
                      <Badge
                        className={
                          strategy.metrics.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                          strategy.metrics.difficulty === 'moderate' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }
                      >
                        {strategy.metrics.difficulty}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="timeline">
            <div className="text-center py-8">
              <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">Timeline View</h3>
              <p className="text-gray-500 mb-4">
                Visual timeline comparison coming soon
              </p>
              <Button variant="outline">
                <Clock className="h-4 w-4 mr-2" />
                View Payment Timeline
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default StrategyComparisonWidget;