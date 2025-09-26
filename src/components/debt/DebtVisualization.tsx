/**
 * Advanced Debt Visualization Charts and Payoff Projections
 * Interactive charts for debt analysis, projections, and scenario planning
 */

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  PieChart,
  BarChart3,
  LineChart,
  TrendingDown,
  TrendingUp,
  Calendar,
  DollarSign,
  Clock,
  Target,
  Zap,
  Activity,
  ArrowUp,
  ArrowDown,
  Minus,
  Play,
  Pause,
  SkipForward
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { Debt, PaymentHistoryItem } from '@/types/debt';
import { debtUtils } from '@/lib/debt-utils';

interface DebtVisualizationProps {
  debts: Debt[];
  paymentHistory?: PaymentHistoryItem[];
}

interface ChartDataPoint {
  month: number;
  balance: number;
  payment: number;
  interest: number;
  principal: number;
  cumulative: number;
}

interface PayoffScenario {
  id: string;
  name: string;
  description: string;
  extraPayment: number;
  strategy: 'minimum' | 'snowball' | 'avalanche' | 'custom';
  projectedMonths: number;
  totalInterest: number;
  totalPayments: number;
  monthlySavings: number;
}

interface DebtBreakdown {
  debtId: string;
  name: string;
  type: string;
  balance: number;
  percentage: number;
  interestRate: number;
  priority: number;
  color: string;
}

const DebtVisualization: React.FC<DebtVisualizationProps> = ({
  debts,
  paymentHistory = []
}) => {
  const [activeTab, setActiveTab] = useState('breakdown');
  const [selectedTimeframe, setSelectedTimeframe] = useState<'1Y' | '2Y' | '5Y' | '10Y'>('2Y');
  const [extraPayment, setExtraPayment] = useState(0);
  const [selectedStrategy, setSelectedStrategy] = useState<'minimum' | 'snowball' | 'avalanche' | 'custom'>('minimum');
  const [animationSpeed, setAnimationSpeed] = useState(1);
  const [isAnimating, setIsAnimating] = useState(false);

  // Color palette for charts
  const colors = [
    '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
    '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
    '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef'
  ];

  // Calculate debt breakdown for pie chart
  const debtBreakdown = useMemo((): DebtBreakdown[] => {
    const totalBalance = debts.reduce((sum, debt) => sum + debt.current_balance, 0);

    return debts
      .map((debt, index) => ({
        debtId: debt.id,
        name: debt.name,
        type: debtUtils.formatting.formatDebtType(debt.debt_type),
        balance: debt.current_balance,
        percentage: totalBalance > 0 ? (debt.current_balance / totalBalance) * 100 : 0,
        interestRate: debt.interest_rate,
        priority: debtUtils.status.getPriorityScore(debt),
        color: colors[index % colors.length]
      }))
      .sort((a, b) => b.balance - a.balance);
  }, [debts]);

  // Generate payoff scenarios
  const payoffScenarios = useMemo((): PayoffScenario[] => {
    if (debts.length === 0) return [];

    const scenarios: PayoffScenario[] = [];
    const totalMinimumPayments = debts.reduce((sum, debt) => sum + debt.minimum_payment, 0);

    // Minimum payments scenario
    const minimumProjection = calculateTotalPayoffTime(debts, 0, 'minimum');
    scenarios.push({
      id: 'minimum',
      name: 'Minimum Payments',
      description: 'Pay only minimum amounts',
      extraPayment: 0,
      strategy: 'minimum',
      projectedMonths: minimumProjection.months,
      totalInterest: minimumProjection.totalInterest,
      totalPayments: minimumProjection.totalPayments,
      monthlySavings: 0
    });

    // Extra payment scenarios
    const extraAmounts = [2500, 5000, 10000, 15000];
    extraAmounts.forEach(amount => {
      ['snowball', 'avalanche'].forEach(strategy => {
        const projection = calculateTotalPayoffTime(debts, amount, strategy as 'snowball' | 'avalanche');
        scenarios.push({
          id: `${strategy}_${amount}`,
          name: `${strategy === 'snowball' ? 'Snowball' : 'Avalanche'} + ₹${amount.toLocaleString()}`,
          description: `${strategy === 'snowball' ? 'Smallest first' : 'Highest rate first'} with ₹${amount.toLocaleString()} extra`,
          extraPayment: amount,
          strategy: strategy as 'snowball' | 'avalanche',
          projectedMonths: projection.months,
          totalInterest: projection.totalInterest,
          totalPayments: projection.totalPayments,
          monthlySavings: minimumProjection.totalInterest - projection.totalInterest
        });
      });
    });

    return scenarios.filter(s => isFinite(s.projectedMonths));
  }, [debts]);

  // Generate projection timeline data
  const projectionData = useMemo((): ChartDataPoint[] => {
    if (debts.length === 0) return [];

    const timeframeMonths = {
      '1Y': 12,
      '2Y': 24,
      '5Y': 60,
      '10Y': 120
    }[selectedTimeframe];

    return generateProjectionTimeline(debts, extraPayment, selectedStrategy, timeframeMonths);
  }, [debts, selectedTimeframe, extraPayment, selectedStrategy]);

  // Calculate total payoff time for given strategy
  function calculateTotalPayoffTime(
    debts: Debt[],
    extraPayment: number,
    strategy: 'minimum' | 'snowball' | 'avalanche'
  ) {
    let totalMonths = 0;
    let totalInterest = 0;
    let totalPayments = 0;

    if (strategy === 'minimum') {
      debts.forEach(debt => {
        const payoff = debtUtils.calculations.estimatePayoffTime(debt);
        totalMonths = Math.max(totalMonths, payoff.months);
        totalInterest += payoff.totalInterest;
        totalPayments += debt.current_balance + payoff.totalInterest;
      });
    } else {
      // Simplified calculation for snowball/avalanche
      const strategies = debtUtils.calculations.compareDebtStrategies(debts, extraPayment);
      const selectedResult = strategy === 'snowball' ? strategies.snowball : strategies.avalanche;
      totalMonths = selectedResult.totalTime;
      totalInterest = selectedResult.totalInterest;
      totalPayments = debts.reduce((sum, debt) => sum + debt.current_balance, 0) + totalInterest;
    }

    return { months: totalMonths, totalInterest, totalPayments };
  }

  // Generate detailed projection timeline
  function generateProjectionTimeline(
    debts: Debt[],
    extraPayment: number,
    strategy: string,
    months: number
  ): ChartDataPoint[] {
    const data: ChartDataPoint[] = [];
    let remainingDebts = [...debts];
    let totalBalance = debts.reduce((sum, debt) => sum + debt.current_balance, 0);
    let cumulativePayments = 0;

    for (let month = 0; month <= months && remainingDebts.length > 0; month++) {
      const monthlyPayment = remainingDebts.reduce((sum, debt) => sum + debt.minimum_payment, 0) + extraPayment;
      const monthlyInterest = remainingDebts.reduce((sum, debt) =>
        sum + (debt.current_balance * debt.interest_rate / 100 / 12), 0
      );
      const monthlyPrincipal = monthlyPayment - monthlyInterest;

      // Update balances (simplified)
      remainingDebts = remainingDebts.map(debt => ({
        ...debt,
        current_balance: Math.max(0, debt.current_balance - (monthlyPrincipal / remainingDebts.length))
      })).filter(debt => debt.current_balance > 1);

      const currentTotalBalance = remainingDebts.reduce((sum, debt) => sum + debt.current_balance, 0);
      cumulativePayments += monthlyPayment;

      data.push({
        month,
        balance: currentTotalBalance,
        payment: monthlyPayment,
        interest: monthlyInterest,
        principal: monthlyPrincipal,
        cumulative: cumulativePayments
      });
    }

    return data;
  }

  // Simple SVG Pie Chart Component
  const PieChartComponent: React.FC<{ data: DebtBreakdown[] }> = ({ data }) => {
    let cumulativePercentage = 0;

    return (
      <div className="relative">
        <svg width="300" height="300" viewBox="0 0 300 300" className="mx-auto">
          <circle cx="150" cy="150" r="100" fill="transparent" />
          {data.map((item, index) => {
            const percentage = item.percentage;
            const startAngle = cumulativePercentage * 3.6;
            const endAngle = (cumulativePercentage + percentage) * 3.6;

            const startAngleRad = (startAngle - 90) * (Math.PI / 180);
            const endAngleRad = (endAngle - 90) * (Math.PI / 180);

            const largeArcFlag = percentage > 50 ? 1 : 0;

            const x1 = 150 + 100 * Math.cos(startAngleRad);
            const y1 = 150 + 100 * Math.sin(startAngleRad);
            const x2 = 150 + 100 * Math.cos(endAngleRad);
            const y2 = 150 + 100 * Math.sin(endAngleRad);

            const pathData = [
              `M 150 150`,
              `L ${x1} ${y1}`,
              `A 100 100 0 ${largeArcFlag} 1 ${x2} ${y2}`,
              'Z'
            ].join(' ');

            cumulativePercentage += percentage;

            return (
              <motion.path
                key={item.debtId}
                d={pathData}
                fill={item.color}
                stroke="white"
                strokeWidth="2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                className="hover:opacity-80 cursor-pointer"
              />
            );
          })}
        </svg>

        {/* Legend */}
        <div className="mt-4 space-y-2">
          {data.map((item) => (
            <div key={item.debtId} className="flex items-center gap-2 text-sm">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="flex-1 truncate">{item.name}</span>
              <span className="font-medium">
                {debtUtils.formatting.formatCurrency(item.balance)}
              </span>
              <span className="text-muted-foreground">
                ({item.percentage.toFixed(1)}%)
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Simple SVG Line Chart Component
  const LineChartComponent: React.FC<{ data: ChartDataPoint[] }> = ({ data }) => {
    if (data.length === 0) return null;

    const maxBalance = Math.max(...data.map(d => d.balance));
    const maxMonth = Math.max(...data.map(d => d.month));

    const points = data.map(d => ({
      x: (d.month / maxMonth) * 260 + 20,
      y: 180 - (d.balance / maxBalance) * 140
    }));

    const pathData = points.map((point, index) =>
      `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
    ).join(' ');

    return (
      <div className="space-y-4">
        <svg width="300" height="200" viewBox="0 0 300 200" className="mx-auto border rounded">
          {/* Grid lines */}
          {[0, 1, 2, 3, 4].map(i => (
            <line
              key={i}
              x1="20"
              y1={40 + i * 35}
              x2="280"
              y2={40 + i * 35}
              stroke="#f0f0f0"
              strokeWidth="1"
            />
          ))}

          {/* Line */}
          <motion.path
            d={pathData}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="3"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, ease: "easeInOut" }}
          />

          {/* Points */}
          {points.map((point, index) => (
            <motion.circle
              key={index}
              cx={point.x}
              cy={point.y}
              r="4"
              fill="#3b82f6"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="hover:r-6 cursor-pointer"
            />
          ))}

          {/* Axes */}
          <line x1="20" y1="180" x2="280" y2="180" stroke="#666" strokeWidth="2" />
          <line x1="20" y1="20" x2="20" y2="180" stroke="#666" strokeWidth="2" />
        </svg>

        {/* Chart info */}
        <div className="text-center text-sm text-muted-foreground">
          <div>Debt balance reduction over {selectedTimeframe}</div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Visualization Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Debt Visualization Dashboard
          </CardTitle>
          <CardDescription>
            Interactive charts and projections for your debt portfolio
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Label htmlFor="timeframe">Timeframe:</Label>
              <Select value={selectedTimeframe} onValueChange={(value: any) => setSelectedTimeframe(value)}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1Y">1 Year</SelectItem>
                  <SelectItem value="2Y">2 Years</SelectItem>
                  <SelectItem value="5Y">5 Years</SelectItem>
                  <SelectItem value="10Y">10 Years</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Label htmlFor="strategy">Strategy:</Label>
              <Select value={selectedStrategy} onValueChange={(value: any) => setSelectedStrategy(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="minimum">Minimum</SelectItem>
                  <SelectItem value="snowball">Snowball</SelectItem>
                  <SelectItem value="avalanche">Avalanche</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Label htmlFor="extra">Extra Payment:</Label>
              <Input
                id="extra"
                type="number"
                value={extraPayment}
                onChange={(e) => setExtraPayment(Number(e.target.value))}
                className="w-24"
                placeholder="0"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Visualization Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
          <TabsTrigger value="projection">Projection</TabsTrigger>
          <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
          <TabsTrigger value="comparison">Comparison</TabsTrigger>
        </TabsList>

        <TabsContent value="breakdown" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Debt Composition Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Debt Composition
                </CardTitle>
              </CardHeader>
              <CardContent>
                {debtBreakdown.length > 0 ? (
                  <PieChartComponent data={debtBreakdown} />
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <PieChart className="h-12 w-12 mx-auto mb-2" />
                    <p>No debts to display</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Interest Rate Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Interest Rate Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {debtBreakdown.map((debt, index) => (
                  <div key={debt.debtId} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: debt.color }}
                        />
                        <span className="text-sm font-medium truncate">{debt.name}</span>
                      </div>
                      <Badge
                        variant={debt.interestRate > 20 ? 'destructive' :
                                debt.interestRate > 15 ? 'default' : 'secondary'}
                      >
                        {debt.interestRate.toFixed(1)}%
                      </Badge>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{debt.type}</span>
                      <span>{debtUtils.formatting.formatCurrency(debt.balance)}</span>
                    </div>
                  </div>
                ))}

                {debtBreakdown.length === 0 && (
                  <div className="text-center py-4 text-muted-foreground">
                    <Activity className="h-8 w-8 mx-auto mb-2" />
                    <p>No debt data available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="projection" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Balance Projection Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="h-5 w-5" />
                  Balance Projection
                </CardTitle>
                <CardDescription>
                  How your debt balance will change over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LineChartComponent data={projectionData} />
              </CardContent>
            </Card>

            {/* Projection Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Projection Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {(() => {
                  const projection = calculateTotalPayoffTime(debts, extraPayment, selectedStrategy);
                  return (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold">
                            {debtUtils.formatting.formatDuration(projection.months)}
                          </div>
                          <div className="text-sm text-muted-foreground">Payoff Time</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold">
                            {debtUtils.formatting.formatCurrency(projection.totalInterest)}
                          </div>
                          <div className="text-sm text-muted-foreground">Total Interest</div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Strategy:</span>
                          <Badge>{selectedStrategy.charAt(0).toUpperCase() + selectedStrategy.slice(1)}</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Extra Payment:</span>
                          <span>{debtUtils.formatting.formatCurrency(extraPayment)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total Payments:</span>
                          <span>{debtUtils.formatting.formatCurrency(projection.totalPayments)}</span>
                        </div>
                      </div>

                      {extraPayment > 0 && (
                        <div className="pt-2 border-t">
                          <div className="flex justify-between font-medium text-green-600">
                            <span>Interest Savings:</span>
                            <span>
                              {(() => {
                                const baseProjection = calculateTotalPayoffTime(debts, 0, 'minimum');
                                const savings = baseProjection.totalInterest - projection.totalInterest;
                                return debtUtils.formatting.formatCurrency(Math.max(0, savings));
                              })()}
                            </span>
                          </div>
                        </div>
                      )}
                    </>
                  );
                })()}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="scenarios" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Payoff Scenarios
              </CardTitle>
              <CardDescription>
                Compare different debt payoff strategies and extra payment amounts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {payoffScenarios.map((scenario) => (
                  <div
                    key={scenario.id}
                    className={`border rounded-lg p-4 hover:bg-secondary/50 transition-colors ${
                      scenario.strategy === selectedStrategy && scenario.extraPayment === extraPayment
                        ? 'border-primary bg-primary/5'
                        : ''
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-medium">{scenario.name}</h4>
                        <p className="text-sm text-muted-foreground">{scenario.description}</p>
                      </div>
                      <Badge
                        variant={scenario.monthlySavings > 50000 ? 'default' : 'secondary'}
                      >
                        {scenario.monthlySavings > 0
                          ? `Save ${debtUtils.formatting.formatCurrency(scenario.monthlySavings)}`
                          : 'Baseline'
                        }
                      </Badge>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Payoff Time</div>
                        <div className="font-medium">
                          {debtUtils.formatting.formatDuration(scenario.projectedMonths)}
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Total Interest</div>
                        <div className="font-medium">
                          {debtUtils.formatting.formatCurrency(scenario.totalInterest)}
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Total Payments</div>
                        <div className="font-medium">
                          {debtUtils.formatting.formatCurrency(scenario.totalPayments)}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 flex justify-end">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedStrategy(scenario.strategy);
                          setExtraPayment(scenario.extraPayment);
                        }}
                      >
                        Apply Scenario
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Strategy Comparison
              </CardTitle>
              <CardDescription>
                Side-by-side comparison of debt payoff strategies
              </CardDescription>
            </CardHeader>
            <CardContent>
              {debts.length >= 2 ? (
                <div className="space-y-6">
                  {(() => {
                    const strategies = debtUtils.calculations.compareDebtStrategies(debts, extraPayment);

                    return (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Snowball Method */}
                        <div className="border rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="p-2 bg-blue-100 rounded-full">
                              <TrendingUp className="h-4 w-4 text-blue-600" />
                            </div>
                            <h4 className="font-medium">Snowball Method</h4>
                          </div>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Payoff time:</span>
                              <span>{debtUtils.formatting.formatDuration(strategies.snowball.totalTime)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Total interest:</span>
                              <span>{debtUtils.formatting.formatCurrency(strategies.snowball.totalInterest)}</span>
                            </div>
                            <div className="text-xs text-muted-foreground pt-2">
                              Pay smallest balances first for psychological wins
                            </div>
                          </div>
                        </div>

                        {/* Avalanche Method */}
                        <div className="border rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="p-2 bg-green-100 rounded-full">
                              <TrendingDown className="h-4 w-4 text-green-600" />
                            </div>
                            <h4 className="font-medium">Avalanche Method</h4>
                          </div>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Payoff time:</span>
                              <span>{debtUtils.formatting.formatDuration(strategies.avalanche.totalTime)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Total interest:</span>
                              <span>{debtUtils.formatting.formatCurrency(strategies.avalanche.totalInterest)}</span>
                            </div>
                            <div className="text-xs text-muted-foreground pt-2">
                              Pay highest interest rates first to minimize cost
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Comparison Summary */}
                  <div className="bg-secondary/30 rounded-lg p-4">
                    <h4 className="font-medium mb-2">Comparison Summary</h4>
                    {(() => {
                      const strategies = debtUtils.calculations.compareDebtStrategies(debts, extraPayment);
                      const interestSavings = strategies.snowball.totalInterest - strategies.avalanche.totalInterest;
                      const timeSavings = strategies.snowball.totalTime - strategies.avalanche.totalTime;

                      return (
                        <div className="text-sm space-y-1">
                          <div className="flex justify-between">
                            <span>Interest savings (Avalanche vs Snowball):</span>
                            <span className={interestSavings > 0 ? 'text-green-600 font-medium' : 'text-red-600'}>
                              {interestSavings > 0 ? '+' : ''}{debtUtils.formatting.formatCurrency(Math.abs(interestSavings))}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Time difference:</span>
                            <span className={timeSavings > 0 ? 'text-green-600 font-medium' : 'text-red-600'}>
                              {timeSavings > 0 ? `${timeSavings} months faster` : `${Math.abs(timeSavings)} months slower`}
                            </span>
                          </div>
                          <div className="pt-2 text-xs text-muted-foreground">
                            {interestSavings > 1000
                              ? 'Avalanche method offers significant savings'
                              : 'Both methods are comparable - choose based on preference'
                            }
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="h-12 w-12 mx-auto mb-2" />
                  <p>Add more debts to compare strategies</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DebtVisualization;