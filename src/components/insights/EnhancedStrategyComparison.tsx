import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  TrendingUp,
  TrendingDown,
  Clock,
  DollarSign,
  Target,
  CheckCircle,
  Crown,
  Zap,
  Brain,
  Star,
  ArrowRight,
  Calculator,
  Heart,
  Trophy,
  Gauge
} from 'lucide-react';
import { StrategyComparison, ProfessionalStrategy } from '@/types/ai-insights';

interface EnhancedStrategyComparisonProps {
  comparison: StrategyComparison;
  professionalStrategies?: {
    avalanche?: ProfessionalStrategy;
    snowball?: ProfessionalStrategy;
  };
  onSelectStrategy?: (strategy: 'avalanche' | 'snowball') => void;
  className?: string;
}

const EnhancedStrategyComparison: React.FC<EnhancedStrategyComparisonProps> = ({
  comparison,
  professionalStrategies,
  onSelectStrategy,
  className = ''
}) => {
  const [selectedStrategy, setSelectedStrategy] = useState<'avalanche' | 'snowball' | null>(
    comparison.recommended as 'avalanche' | 'snowball'
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatTime = (months: number) => {
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    if (years === 0) return `${remainingMonths}m`;
    if (remainingMonths === 0) return `${years}y`;
    return `${years}y ${remainingMonths}m`;
  };

  const handleStrategySelect = (strategy: 'avalanche' | 'snowball') => {
    setSelectedStrategy(strategy);
    onSelectStrategy?.(strategy);
  };

  const getStrategyScore = (strategy: 'avalanche' | 'snowball') => {
    const strategyData = comparison[strategy];
    const isRecommended = comparison.recommended === strategy;

    // Calculate score based on multiple factors
    let score = 50; // Base score

    // Time efficiency (faster = higher score)
    if (strategy === 'avalanche') {
      score += 25; // Mathematical efficiency bonus
    } else {
      score += 15; // Psychological motivation bonus
    }

    // Recommended strategy bonus
    if (isRecommended) {
      score += 20;
    }

    // Interest savings bonus
    if (strategyData.totalInterestSaved > 0) {
      score += Math.min(20, strategyData.totalInterestSaved / 1000);
    }

    return Math.min(100, Math.max(0, score));
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 60) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (score >= 40) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  return (
    <Card className={`bg-card border-0 shadow-sm ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <Brain className="h-5 w-5 text-primary" />
          Professional Strategy Analysis
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Comprehensive comparison of debt elimination methodologies
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Quick Comparison Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Debt Avalanche Card */}
          <Card
            className={`cursor-pointer transition-all duration-200 border-2 ${
              selectedStrategy === 'avalanche'
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
            }`}
            onClick={() => handleStrategySelect('avalanche')}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-blue-600" />
                  <CardTitle className="text-base">Debt Avalanche</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  {comparison.recommended === 'avalanche' && (
                    <Crown className="h-4 w-4 text-amber-500" />
                  )}
                  <Badge className={`text-xs ${getScoreColor(getStrategyScore('avalanche'))}`}>
                    {getStrategyScore('avalanche')}% match
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Mathematical optimization approach - highest interest rates first
              </p>

              {/* Key Metrics */}
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="bg-muted/30 p-2 rounded">
                  <div className="text-lg font-semibold text-foreground">
                    {formatTime(comparison.avalanche.timeToDebtFree)}
                  </div>
                  <div className="text-xs text-muted-foreground">Time to Freedom</div>
                </div>
                <div className="bg-muted/30 p-2 rounded">
                  <div className="text-lg font-semibold text-green-600">
                    {formatCurrency(comparison.avalanche.totalInterestSaved)}
                  </div>
                  <div className="text-xs text-muted-foreground">Interest Saved</div>
                </div>
              </div>

              {/* Professional Insights */}
              {professionalStrategies?.avalanche && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium">Professional Benefits</span>
                  </div>
                  <div className="space-y-1">
                    {professionalStrategies.avalanche.benefits.slice(0, 2).map((benefit, index) => (
                      <div key={index} className="flex items-start gap-2 text-xs">
                        <CheckCircle className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Strategy Effectiveness Score */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span>Mathematical Efficiency</span>
                  <span className="font-medium">95%</span>
                </div>
                <Progress value={95} className="h-1.5" />
              </div>
            </CardContent>
          </Card>

          {/* Debt Snowball Card */}
          <Card
            className={`cursor-pointer transition-all duration-200 border-2 ${
              selectedStrategy === 'snowball'
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
            }`}
            onClick={() => handleStrategySelect('snowball')}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-pink-600" />
                  <CardTitle className="text-base">Debt Snowball</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  {comparison.recommended === 'snowball' && (
                    <Crown className="h-4 w-4 text-amber-500" />
                  )}
                  <Badge className={`text-xs ${getScoreColor(getStrategyScore('snowball'))}`}>
                    {getStrategyScore('snowball')}% match
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Behavioral psychology approach - smallest balances first
              </p>

              {/* Key Metrics */}
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="bg-muted/30 p-2 rounded">
                  <div className="text-lg font-semibold text-foreground">
                    {formatTime(comparison.snowball.timeToDebtFree)}
                  </div>
                  <div className="text-xs text-muted-foreground">Time to Freedom</div>
                </div>
                <div className="bg-muted/30 p-2 rounded">
                  <div className="text-lg font-semibold text-green-600">
                    {formatCurrency(comparison.snowball.totalInterestSaved)}
                  </div>
                  <div className="text-xs text-muted-foreground">Interest Saved</div>
                </div>
              </div>

              {/* Professional Insights */}
              {professionalStrategies?.snowball && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Heart className="h-4 w-4 text-pink-600" />
                    <span className="text-sm font-medium">Psychological Benefits</span>
                  </div>
                  <div className="space-y-1">
                    {professionalStrategies.snowball.benefits.slice(0, 2).map((benefit, index) => (
                      <div key={index} className="flex items-start gap-2 text-xs">
                        <CheckCircle className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Strategy Effectiveness Score */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span>Motivational Impact</span>
                  <span className="font-medium">88%</span>
                </div>
                <Progress value={88} className="h-1.5" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Analysis Tabs */}
        <Tabs defaultValue="comparison" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="comparison">Side-by-Side</TabsTrigger>
            <TabsTrigger value="insights">Professional Insights</TabsTrigger>
            <TabsTrigger value="decision">Decision Guide</TabsTrigger>
          </TabsList>

          <TabsContent value="comparison" className="space-y-4">
            <Card>
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-3">
                    <h4 className="font-medium text-foreground">Financial Impact</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Time Difference:</span>
                        <span className="font-medium">
                          {Math.abs(comparison.differences.timeDifference)} months
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Interest Difference:</span>
                        <span className="font-medium">
                          {formatCurrency(Math.abs(comparison.differences.interestDifference))}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Payment Difference:</span>
                        <span className="font-medium">
                          {formatCurrency(Math.abs(comparison.differences.paymentDifference))}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium text-foreground">Strategy Strengths</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Calculator className="h-4 w-4 text-blue-600" />
                        <span>Avalanche: Mathematical Optimal</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Heart className="h-4 w-4 text-pink-600" />
                        <span>Snowball: Psychological Wins</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium text-foreground">Recommendation</h4>
                    <div className="space-y-2">
                      <Badge
                        variant="secondary"
                        className="bg-primary/10 text-primary border-primary/20"
                      >
                        {comparison.recommended === 'avalanche' ? 'Debt Avalanche' : 'Debt Snowball'} Recommended
                      </Badge>
                      <p className="text-xs text-muted-foreground">
                        Based on your debt profile and financial situation
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insights" className="space-y-4">
            {professionalStrategies && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(professionalStrategies).map(([strategyKey, strategy]) => (
                  <Card key={strategyKey}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        {strategyKey === 'avalanche' ? (
                          <Calculator className="h-4 w-4 text-blue-600" />
                        ) : (
                          <Heart className="h-4 w-4 text-pink-600" />
                        )}
                        {strategy.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground">{strategy.description}</p>

                      {strategy.reasoning && (
                        <div className="bg-muted/30 p-3 rounded-lg">
                          <h5 className="text-sm font-medium mb-2">Professional Reasoning</h5>
                          <p className="text-xs text-muted-foreground">{strategy.reasoning}</p>
                        </div>
                      )}

                      {strategy.ideal_for && strategy.ideal_for.length > 0 && (
                        <div className="space-y-2">
                          <h5 className="text-sm font-medium">Best For:</h5>
                          <div className="flex flex-wrap gap-1">
                            {strategy.ideal_for.map((criteria, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {criteria}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="decision" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Strategy Selection Guide
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-medium text-foreground flex items-center gap-2">
                      <Calculator className="h-4 w-4 text-blue-600" />
                      Choose Avalanche If:
                    </h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        You want to minimize total interest paid
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        You're motivated by mathematical optimization
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        You have discipline to stick to the plan
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        You want to be debt-free fastest
                      </li>
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium text-foreground flex items-center gap-2">
                      <Heart className="h-4 w-4 text-pink-600" />
                      Choose Snowball If:
                    </h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        You need psychological motivation
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        You want to see quick wins
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        You have struggled with debt in the past
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        You prefer emotional momentum
                      </li>
                    </ul>
                  </div>
                </div>

                <Separator />

                <div className="bg-primary/5 p-4 rounded-lg border border-primary/10">
                  <div className="flex items-start gap-3">
                    <Brain className="h-5 w-5 text-primary mt-0.5" />
                    <div className="flex-1">
                      <h5 className="font-medium text-foreground mb-2">AI Recommendation</h5>
                      <p className="text-sm text-muted-foreground">
                        Based on your financial profile, debt structure, and behavioral patterns,
                        the <strong>{comparison.recommended === 'avalanche' ? 'Debt Avalanche' : 'Debt Snowball'}</strong> strategy
                        is recommended for optimal results in your situation.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-4">
          <Button
            onClick={() => handleStrategySelect('avalanche')}
            variant={selectedStrategy === 'avalanche' ? 'default' : 'outline'}
            className="flex-1"
          >
            Select Avalanche Strategy
          </Button>
          <Button
            onClick={() => handleStrategySelect('snowball')}
            variant={selectedStrategy === 'snowball' ? 'default' : 'outline'}
            className="flex-1"
          >
            Select Snowball Strategy
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedStrategyComparison;