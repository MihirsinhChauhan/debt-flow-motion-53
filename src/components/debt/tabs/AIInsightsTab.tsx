import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  TrendingUp,
  TrendingDown,
  Zap,
  Target,
  Calculator,
  AlertCircle,
  CheckCircle,
  DollarSign,
  Calendar,
  Lightbulb,
  BarChart3
} from 'lucide-react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Debt, DebtSummary } from '@/types/debt';
import { formatCurrency } from '@/lib/utils';
import { apiService } from '@/lib/api';

interface AIInsightsTabProps {
  debts: Debt[];
  summary: DebtSummary | null;
  isLoading?: boolean;
}

interface RepaymentPlan {
  id: string;
  name: string;
  strategy: 'snowball' | 'avalanche' | 'custom';
  totalInterest: number;
  payoffTime: number; // months
  monthlyPayment: number;
  timeline: Array<{
    month: number;
    totalBalance: number;
    totalPaid: number;
    interestPaid: number;
  }>;
  description: string;
  savings?: number;
}

interface SimulationState {
  extraPayment: number;
  targetDate: string;
  strategy: 'snowball' | 'avalanche' | 'custom';
}

const AIInsightsTab: React.FC<AIInsightsTabProps> = ({
  debts,
  summary,
  isLoading = false
}) => {
  const [aiInsights, setAiInsights] = useState<any>(null);
  const [repaymentPlans, setRepaymentPlans] = useState<RepaymentPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<RepaymentPlan | null>(null);
  const [simulation, setSimulation] = useState<SimulationState>({
    extraPayment: 0,
    targetDate: '',
    strategy: 'avalanche'
  });
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);

  // Load AI insights
  useEffect(() => {
    const loadAIInsights = async () => {
      if (debts.length === 0) return;

      try {
        setIsLoadingInsights(true);
        const insights = await apiService.getAIInsights(
          simulation.extraPayment || undefined,
          simulation.strategy,
          true
        );
        setAiInsights(insights);

        // Generate repayment plans
        generateRepaymentPlans();
      } catch (error) {
        console.error('Failed to load AI insights:', error);
      } finally {
        setIsLoadingInsights(false);
      }
    };

    loadAIInsights();
  }, [debts, simulation.strategy]);

  // Generate repayment plans based on current debts
  const generateRepaymentPlans = () => {
    if (debts.length === 0) return;

    const totalDebt = debts.reduce((sum, debt) => sum + debt.current_balance, 0);
    const minPayments = debts.reduce((sum, debt) => sum + debt.minimum_payment, 0);

    const plans: RepaymentPlan[] = [
      {
        id: 'avalanche',
        name: 'Debt Avalanche',
        strategy: 'avalanche',
        totalInterest: totalDebt * 0.15, // Estimated
        payoffTime: 36,
        monthlyPayment: minPayments,
        timeline: generateTimeline(totalDebt, minPayments, 36),
        description: 'Pay minimums on all debts, then target highest interest rate first. Saves the most money.',
        savings: totalDebt * 0.05
      },
      {
        id: 'snowball',
        name: 'Debt Snowball',
        strategy: 'snowball',
        totalInterest: totalDebt * 0.18,
        payoffTime: 38,
        monthlyPayment: minPayments,
        timeline: generateTimeline(totalDebt, minPayments, 38),
        description: 'Pay minimums on all debts, then target smallest balance first. Builds momentum.',
      },
      {
        id: 'accelerated',
        name: 'Accelerated Payoff',
        strategy: 'custom',
        totalInterest: totalDebt * 0.12,
        payoffTime: 28,
        monthlyPayment: minPayments + simulation.extraPayment,
        timeline: generateTimeline(totalDebt, minPayments + simulation.extraPayment, 28),
        description: `Add ₹${simulation.extraPayment.toLocaleString()} extra monthly payment to pay off debt faster.`,
        savings: totalDebt * 0.08
      }
    ];

    setRepaymentPlans(plans);
    if (!selectedPlan) {
      setSelectedPlan(plans[0]);
    }
  };

  // Generate timeline data for chart
  const generateTimeline = (totalDebt: number, monthlyPayment: number, months: number) => {
    const timeline = [];
    let remainingBalance = totalDebt;
    let totalPaid = 0;
    let totalInterest = 0;

    for (let month = 0; month <= months; month++) {
      const interestPayment = remainingBalance * 0.01; // Simplified 1% monthly
      const principalPayment = Math.min(monthlyPayment - interestPayment, remainingBalance);

      if (month > 0) {
        remainingBalance -= principalPayment;
        totalPaid += monthlyPayment;
        totalInterest += interestPayment;
      }

      timeline.push({
        month,
        totalBalance: Math.max(remainingBalance, 0),
        totalPaid,
        interestPaid: totalInterest
      });

      if (remainingBalance <= 0) break;
    }

    return timeline;
  };

  // Update simulation when slider changes
  const updateSimulation = (field: keyof SimulationState, value: any) => {
    setSimulation(prev => ({ ...prev, [field]: value }));
    generateRepaymentPlans();
  };

  // Calculate potential savings
  const calculateSavings = useMemo(() => {
    if (!selectedPlan || repaymentPlans.length < 2) return null;

    const basePlan = repaymentPlans.find(p => p.strategy === 'snowball');
    if (!basePlan || selectedPlan.id === basePlan.id) return null;

    const timeSaved = basePlan.payoffTime - selectedPlan.payoffTime;
    const moneySaved = basePlan.totalInterest - selectedPlan.totalInterest;

    return { timeSaved, moneySaved };
  }, [selectedPlan, repaymentPlans]);

  const InsightCard = ({
    title,
    description,
    value,
    change,
    icon: Icon,
    color = 'blue',
    action
  }: {
    title: string;
    description: string;
    value: string;
    change?: { value: string; positive: boolean };
    icon: React.ComponentType<any>;
    color?: 'blue' | 'green' | 'red' | 'yellow';
    action?: React.ReactNode;
  }) => (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="h-full">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <Icon className={`h-5 w-5 text-${color}-600 mt-1`} />
            {change && (
              <Badge
                variant={change.positive ? "default" : "destructive"}
                className="text-xs"
              >
                {change.positive ? '↗' : '↘'} {change.value}
              </Badge>
            )}
          </div>
          <div className="text-lg font-bold text-gray-900 mb-1">{value}</div>
          <div className="text-sm font-medium text-gray-700 mb-2">{title}</div>
          <div className="text-xs text-gray-500 mb-3">{description}</div>
          {action}
        </CardContent>
      </Card>
    </motion.div>
  );

  if (isLoading || isLoadingInsights) {
    return (
      <div className="space-y-6">
        {/* Loading skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="h-32">
              <CardContent className="p-4">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* AI Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InsightCard
          title="Recommended Strategy"
          description="Based on your debt profile and financial goals"
          value="Debt Avalanche"
          icon={Target}
          color="green"
          change={{ value: "Save ₹45,000", positive: true }}
          action={
            <Button size="sm" className="w-full">
              Apply Strategy
            </Button>
          }
        />

        <InsightCard
          title="Early Payoff Potential"
          description="With an extra ₹5,000 monthly payment"
          value="8 months earlier"
          icon={TrendingUp}
          color="blue"
          change={{ value: "Save ₹23,000", positive: true }}
        />

        <InsightCard
          title="Debt Consolidation"
          description="Combine high-interest debts for better rates"
          value="12.5% → 8.9%"
          icon={Calculator}
          color="yellow"
          action={
            <Button variant="outline" size="sm" className="w-full">
              Explore Options
            </Button>
          }
        />

        <InsightCard
          title="Emergency Fund Status"
          description="Recommended 3-6 months of expenses"
          value="2.1 months"
          icon={AlertCircle}
          color="red"
          change={{ value: "Build ₹50,000", positive: false }}
        />
      </div>

      {/* Interactive Simulation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-blue-600" />
            Interactive Debt Simulator
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Simulation Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Extra Monthly Payment
                </label>
                <div className="space-y-2">
                  <Slider
                    value={[simulation.extraPayment]}
                    onValueChange={([value]) => updateSimulation('extraPayment', value)}
                    max={20000}
                    step={500}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>₹0</span>
                    <span className="font-medium">₹{simulation.extraPayment.toLocaleString()}</span>
                    <span>₹20,000</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Repayment Strategy
                </label>
                <Tabs
                  value={simulation.strategy}
                  onValueChange={(value) => updateSimulation('strategy', value)}
                >
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="avalanche">Avalanche</TabsTrigger>
                    <TabsTrigger value="snowball">Snowball</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>

            {/* Results */}
            {selectedPlan && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-lg font-bold text-blue-900">
                    {selectedPlan.payoffTime} months
                  </div>
                  <div className="text-xs text-blue-600">Payoff Time</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-lg font-bold text-green-900">
                    {formatCurrency(selectedPlan.totalInterest)}
                  </div>
                  <div className="text-xs text-green-600">Total Interest</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-lg font-bold text-purple-900">
                    {formatCurrency(selectedPlan.monthlyPayment)}
                  </div>
                  <div className="text-xs text-purple-600">Monthly Payment</div>
                </div>
                {calculateSavings && (
                  <div className="text-center p-3 bg-yellow-50 rounded-lg">
                    <div className="text-lg font-bold text-yellow-900">
                      {formatCurrency(calculateSavings.moneySaved)}
                    </div>
                    <div className="text-xs text-yellow-600">
                      Save vs Snowball
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Debt Decline Chart */}
      {selectedPlan && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              Debt Payoff Projection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={selectedPlan.timeline}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis
                    dataKey="month"
                    label={{ value: 'Months', position: 'insideBottom', offset: -5 }}
                  />
                  <YAxis
                    tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`}
                    label={{ value: 'Amount', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip
                    formatter={(value, name) => [
                      formatCurrency(Number(value)),
                      name === 'totalBalance' ? 'Remaining Debt' :
                      name === 'totalPaid' ? 'Total Paid' : 'Interest Paid'
                    ]}
                    labelFormatter={(month) => `Month ${month}`}
                  />
                  <Line
                    type="monotone"
                    dataKey="totalBalance"
                    stroke="#ef4444"
                    strokeWidth={2}
                    name="totalBalance"
                  />
                  <Line
                    type="monotone"
                    dataKey="totalPaid"
                    stroke="#22c55e"
                    strokeWidth={2}
                    name="totalPaid"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Repayment Plan Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-blue-600" />
            Repayment Plan Comparison
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {repaymentPlans.map((plan) => (
              <motion.div
                key={plan.id}
                whileHover={{ scale: 1.01 }}
                transition={{ duration: 0.2 }}
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  selectedPlan?.id === plan.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedPlan(plan)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">{plan.name}</h3>
                      {plan.savings && (
                        <Badge variant="outline" className="text-green-600 border-green-200">
                          Save {formatCurrency(plan.savings)}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{plan.description}</p>

                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-gray-500">Payoff Time</div>
                        <div className="font-medium">{plan.payoffTime} months</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Total Interest</div>
                        <div className="font-medium">{formatCurrency(plan.totalInterest)}</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Monthly Payment</div>
                        <div className="font-medium">{formatCurrency(plan.monthlyPayment)}</div>
                      </div>
                    </div>
                  </div>

                  {selectedPlan?.id === plan.id && (
                    <CheckCircle className="h-5 w-5 text-blue-600 ml-4" />
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {selectedPlan && (
            <div className="mt-6 pt-6 border-t">
              <Button className="w-full">
                Apply {selectedPlan.name} Strategy
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AIInsightsTab;