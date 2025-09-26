/**
 * Comprehensive Debt Dashboard with Health Indicators
 * Provides visual debt analysis, health metrics, and actionable insights
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Target,
  Calendar,
  DollarSign,
  Activity,
  Shield,
  Zap,
  Clock,
  Award,
  ArrowRight,
  RefreshCw,
  PieChart,
  BarChart3,
  LineChart
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { Debt, DebtSummary } from '@/types/debt';
import { debtUtils } from '@/lib/debt-utils';
import { useDebtOperations } from '@/hooks/useDebtOperations';
import AddDebtDialog from './AddDebtDialog';

interface DebtDashboardProps {
  debts: Debt[];
  summary: DebtSummary;
  onRefresh?: () => void;
  isLoading?: boolean;
}

interface DebtHealthMetrics {
  overallScore: number;
  riskLevel: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  criticalCount: number;
  improvingCount: number;
  totalInterestBurden: number;
  avgPayoffTime: number;
  dtiRatio?: number;
}

interface DebtInsight {
  type: 'warning' | 'tip' | 'success' | 'urgent';
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  impact?: {
    savings?: number;
    timeReduction?: number;
  };
}

const DebtDashboard: React.FC<DebtDashboardProps> = ({
  debts,
  summary,
  onRefresh,
  isLoading = false
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedTimeframe, setSelectedTimeframe] = useState<'1M' | '3M' | '6M' | '1Y'>('3M');

  // Calculate comprehensive debt health metrics
  const healthMetrics = useMemo((): DebtHealthMetrics => {
    if (!debts.length) {
      return {
        overallScore: 100,
        riskLevel: 'excellent',
        criticalCount: 0,
        improvingCount: 0,
        totalInterestBurden: 0,
        avgPayoffTime: 0
      };
    }

    let totalScore = 0;
    let criticalCount = 0;
    let improvingCount = 0;
    let totalPayoffMonths = 0;
    let totalInterestBurden = 0;

    debts.forEach(debt => {
      const priorityScore = debtUtils.status.getPriorityScore(debt);
      const payoffEstimate = debtUtils.calculations.estimatePayoffTime(debt);

      // Score based on interest rate, balance, and payment ratio
      let debtScore = 100;

      // High interest penalty
      if (debt.interest_rate > 25) debtScore -= 40;
      else if (debt.interest_rate > 18) debtScore -= 25;
      else if (debt.interest_rate > 12) debtScore -= 15;

      // Payment ratio assessment
      const paymentRatio = debt.minimum_payment / debt.current_balance;
      if (paymentRatio < 0.02) debtScore -= 30; // Less than 2% payment ratio
      else if (paymentRatio > 0.05) debtScore += 15; // Good payment ratio

      // Overdue penalty
      if (debtUtils.status.isOverdue(debt)) {
        debtScore -= 50;
        criticalCount++;
      } else if (priorityScore > 75) {
        criticalCount++;
      }

      // High priority debt
      if (debt.is_high_priority) debtScore -= 20;

      // Progress assessment (if we can determine improvement)
      const progress = debtUtils.calculations.calculateProgress(debt);
      if (progress > 25) improvingCount++;

      totalScore += Math.max(0, debtScore);
      totalPayoffMonths += payoffEstimate.months;
      totalInterestBurden += payoffEstimate.totalInterest;
    });

    const overallScore = Math.round(totalScore / debts.length);
    const avgPayoffTime = totalPayoffMonths / debts.length;

    let riskLevel: DebtHealthMetrics['riskLevel'];
    if (overallScore >= 80) riskLevel = 'excellent';
    else if (overallScore >= 65) riskLevel = 'good';
    else if (overallScore >= 50) riskLevel = 'fair';
    else if (overallScore >= 30) riskLevel = 'poor';
    else riskLevel = 'critical';

    return {
      overallScore,
      riskLevel,
      criticalCount,
      improvingCount,
      totalInterestBurden,
      avgPayoffTime
    };
  }, [debts]);

  // Generate actionable insights
  const insights = useMemo((): DebtInsight[] => {
    const insights: DebtInsight[] = [];

    // Critical debts warning
    if (healthMetrics.criticalCount > 0) {
      insights.push({
        type: 'urgent',
        title: `${healthMetrics.criticalCount} Critical Debt${healthMetrics.criticalCount > 1 ? 's' : ''}`,
        description: 'These debts require immediate attention due to high interest or overdue status.',
        action: {
          label: 'Review Critical Debts',
          onClick: () => setActiveTab('analysis')
        }
      });
    }

    // High interest rate optimization
    const highInterestDebts = debts.filter(d => d.interest_rate > 20);
    if (highInterestDebts.length > 0) {
      const potentialSavings = highInterestDebts.reduce((sum, debt) => {
        const payoff = debtUtils.calculations.estimatePayoffTime(debt);
        return sum + payoff.totalInterest * 0.3; // Assume 30% savings with optimization
      }, 0);

      insights.push({
        type: 'warning',
        title: 'High Interest Rate Alert',
        description: `${highInterestDebts.length} debt${highInterestDebts.length > 1 ? 's' : ''} with rates above 20%`,
        impact: { savings: potentialSavings },
        action: {
          label: 'Explore Refinancing',
          onClick: () => console.log('Navigate to refinancing options')
        }
      });
    }

    // Debt consolidation opportunity
    if (debts.length >= 3) {
      const totalBalance = debts.reduce((sum, debt) => sum + debt.current_balance, 0);
      const avgRate = debts.reduce((sum, debt) => sum + debt.interest_rate, 0) / debts.length;

      if (avgRate > 15 && totalBalance > 50000) {
        insights.push({
          type: 'tip',
          title: 'Consolidation Opportunity',
          description: 'Multiple debts could be consolidated for better rates and simplified payments.',
          impact: { savings: totalBalance * 0.05 }, // Estimate 5% savings
          action: {
            label: 'Learn More',
            onClick: () => console.log('Navigate to consolidation info')
          }
        });
      }
    }

    // Snowball vs Avalanche strategy
    if (debts.length >= 2) {
      const strategies = debtUtils.calculations.compareDebtStrategies(debts, 5000);
      if (strategies.savings > 10000) {
        insights.push({
          type: 'tip',
          title: 'Optimal Payment Strategy',
          description: 'Avalanche method could save significant interest compared to your current approach.',
          impact: { savings: strategies.savings },
          action: {
            label: 'View Strategy',
            onClick: () => setActiveTab('strategy')
          }
        });
      }
    }

    // Progress celebration
    if (healthMetrics.improvingCount > 0 && healthMetrics.riskLevel !== 'critical') {
      insights.push({
        type: 'success',
        title: 'Great Progress!',
        description: `${healthMetrics.improvingCount} debt${healthMetrics.improvingCount > 1 ? 's are' : ' is'} showing good progress.`,
        action: {
          label: 'View Progress',
          onClick: () => setActiveTab('progress')
        }
      });
    }

    return insights.slice(0, 4); // Limit to 4 insights
  }, [debts, healthMetrics]);

  // Health score color mapping
  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 65) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (score >= 50) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    if (score >= 30) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getRiskLevelIcon = (level: DebtHealthMetrics['riskLevel']) => {
    switch (level) {
      case 'excellent': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'good': return <TrendingUp className="h-5 w-5 text-blue-600" />;
      case 'fair': return <Activity className="h-5 w-5 text-yellow-600" />;
      case 'poor': return <TrendingDown className="h-5 w-5 text-orange-600" />;
      case 'critical': return <AlertTriangle className="h-5 w-5 text-red-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Health Score */}
      <Card className={`border-2 ${getHealthColor(healthMetrics.overallScore)}`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getRiskLevelIcon(healthMetrics.riskLevel)}
              <div>
                <CardTitle className="text-xl">Debt Health Score</CardTitle>
                <CardDescription>
                  Overall assessment of your debt portfolio
                </CardDescription>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{healthMetrics.overallScore}</div>
              <Badge className={getHealthColor(healthMetrics.overallScore)}>
                {healthMetrics.riskLevel.toUpperCase()}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={healthMetrics.overallScore} className="h-3 mb-4" />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="font-semibold text-lg">{summary.debt_count}</div>
              <div className="text-muted-foreground">Total Debts</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-lg">{healthMetrics.criticalCount}</div>
              <div className="text-muted-foreground">Critical</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-lg">{healthMetrics.improvingCount}</div>
              <div className="text-muted-foreground">Improving</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-lg">
                {debtUtils.formatting.formatDuration(healthMetrics.avgPayoffTime)}
              </div>
              <div className="text-muted-foreground">Avg Payoff</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Insights */}
      {insights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Key Insights & Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {insights.map((insight, index) => (
              <Alert
                key={index}
                className={`${
                  insight.type === 'urgent'
                    ? 'border-red-200 bg-red-50'
                    : insight.type === 'warning'
                    ? 'border-orange-200 bg-orange-50'
                    : insight.type === 'success'
                    ? 'border-green-200 bg-green-50'
                    : 'border-blue-200 bg-blue-50'
                }`}
              >
                <AlertDescription>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-medium mb-1">{insight.title}</div>
                      <div className="text-sm text-muted-foreground mb-2">
                        {insight.description}
                      </div>
                      {insight.impact && (
                        <div className="text-xs font-medium">
                          {insight.impact.savings && (
                            <span className="text-green-600">
                              Potential savings: {debtUtils.formatting.formatCurrency(insight.impact.savings)}
                            </span>
                          )}
                          {insight.impact.timeReduction && (
                            <span className="text-blue-600 ml-2">
                              Time saved: {insight.impact.timeReduction} months
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    {insight.action && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={insight.action.onClick}
                        className="ml-3"
                      >
                        {insight.action.label}
                        <ArrowRight className="ml-1 h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Detailed Dashboard Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="strategy">Strategy</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Total Debt */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Total Debt
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {debtUtils.formatting.formatCurrency(summary.total_debt)}
                </div>
                <div className="text-sm text-muted-foreground">
                  Across {summary.debt_count} debt{summary.debt_count > 1 ? 's' : ''}
                </div>
              </CardContent>
            </Card>

            {/* Monthly Payments */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Monthly Payments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {debtUtils.formatting.formatCurrency(summary.total_minimum_payments)}
                </div>
                <div className="text-sm text-muted-foreground">
                  Minimum required
                </div>
              </CardContent>
            </Card>

            {/* Average Interest */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Avg Interest Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {summary.average_interest_rate.toFixed(1)}%
                </div>
                <div className="text-sm text-muted-foreground">
                  Weighted average
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Debt Breakdown Chart Placeholder */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Debt Composition
                </CardTitle>
                <div className="flex gap-2">
                  {(['1M', '3M', '6M', '1Y'] as const).map((period) => (
                    <Button
                      key={period}
                      size="sm"
                      variant={selectedTimeframe === period ? 'default' : 'outline'}
                      onClick={() => setSelectedTimeframe(period)}
                    >
                      {period}
                    </Button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center border-2 border-dashed border-muted rounded-lg">
                <div className="text-center text-muted-foreground">
                  <PieChart className="h-12 w-12 mx-auto mb-2" />
                  <p>Debt composition chart</p>
                  <p className="text-sm">Coming soon...</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Detailed Debt Analysis
              </CardTitle>
              <CardDescription>
                Risk assessment and priority ranking of all debts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {debts
                  .sort((a, b) => debtUtils.status.getPriorityScore(b) - debtUtils.status.getPriorityScore(a))
                  .map((debt) => {
                    const priorityScore = debtUtils.status.getPriorityScore(debt);
                    const payoffEstimate = debtUtils.calculations.estimatePayoffTime(debt);
                    const progress = debtUtils.calculations.calculateProgress(debt);

                    return (
                      <div key={debt.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-medium">{debt.name}</h4>
                            <p className="text-sm text-muted-foreground">{debt.lender}</p>
                          </div>
                          <Badge
                            className={
                              priorityScore >= 100
                                ? 'bg-red-100 text-red-700'
                                : priorityScore >= 75
                                ? 'bg-orange-100 text-orange-700'
                                : priorityScore >= 50
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-green-100 text-green-700'
                            }
                          >
                            {priorityScore >= 100
                              ? 'Critical'
                              : priorityScore >= 75
                              ? 'High'
                              : priorityScore >= 50
                              ? 'Medium'
                              : 'Low'} Risk
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                          <div>
                            <div className="text-muted-foreground">Balance</div>
                            <div className="font-medium">
                              {debtUtils.formatting.formatCurrency(debt.current_balance)}
                            </div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Interest Rate</div>
                            <div className="font-medium">{debt.interest_rate}%</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Payoff Time</div>
                            <div className="font-medium">
                              {debtUtils.formatting.formatDuration(payoffEstimate.months)}
                            </div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Progress</div>
                            <div className="font-medium">{progress.toFixed(1)}%</div>
                          </div>
                        </div>

                        {progress > 0 && (
                          <Progress value={progress} className="mt-3 h-2" />
                        )}
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="progress" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChart className="h-5 w-5" />
                Debt Progress Tracking
              </CardTitle>
              <CardDescription>
                Monitor your debt reduction over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center border-2 border-dashed border-muted rounded-lg">
                <div className="text-center text-muted-foreground">
                  <LineChart className="h-12 w-12 mx-auto mb-2" />
                  <p>Progress visualization</p>
                  <p className="text-sm">Coming soon...</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="strategy" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Debt Payoff Strategy
              </CardTitle>
              <CardDescription>
                Compare different debt payoff approaches
              </CardDescription>
            </CardHeader>
            <CardContent>
              {debts.length >= 2 ? (
                <div className="space-y-4">
                  {(() => {
                    const strategies = debtUtils.calculations.compareDebtStrategies(debts, 5000);

                    return (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="border rounded-lg p-4">
                          <h4 className="font-medium mb-2 flex items-center gap-2">
                            <Award className="h-4 w-4" />
                            Snowball Method
                          </h4>
                          <div className="text-sm text-muted-foreground mb-3">
                            Pay off smallest balances first for psychological wins
                          </div>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Total time:</span>
                              <span>{debtUtils.formatting.formatDuration(strategies.snowball.totalTime)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Total interest:</span>
                              <span>{debtUtils.formatting.formatCurrency(strategies.snowball.totalInterest)}</span>
                            </div>
                          </div>
                        </div>

                        <div className="border rounded-lg p-4">
                          <h4 className="font-medium mb-2 flex items-center gap-2">
                            <TrendingDown className="h-4 w-4" />
                            Avalanche Method
                          </h4>
                          <div className="text-sm text-muted-foreground mb-3">
                            Pay off highest interest rates first to minimize cost
                          </div>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Total time:</span>
                              <span>{debtUtils.formatting.formatDuration(strategies.avalanche.totalTime)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Total interest:</span>
                              <span>{debtUtils.formatting.formatCurrency(strategies.avalanche.totalInterest)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  <Alert className="border-blue-200 bg-blue-50">
                    <AlertDescription>
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-medium mb-1">Recommended Strategy</div>
                          <div className="text-sm">
                            Based on your debt portfolio, the <strong>Avalanche method</strong> could save you
                            significant interest over time.
                          </div>
                        </div>
                        <Button size="sm" variant="outline">
                          Apply Strategy
                        </Button>
                      </div>
                    </AlertDescription>
                  </Alert>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Target className="h-12 w-12 mx-auto mb-2" />
                  <p>Add more debts to compare strategies</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <AddDebtDialog
              onAddDebt={(debt) => {
                console.log('New debt added:', debt);
                onRefresh?.();
              }}
              trigger={
                <Button variant="outline" className="gap-2">
                  <DollarSign className="h-4 w-4" />
                  Add New Debt
                </Button>
              }
            />

            <Button variant="outline" className="gap-2">
              <Clock className="h-4 w-4" />
              Record Payment
            </Button>

            <Button variant="outline" className="gap-2" onClick={onRefresh} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh Data
            </Button>

            <Button variant="outline" className="gap-2">
              <Shield className="h-4 w-4" />
              Set Goals
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DebtDashboard;