// Enhanced Analytics Dashboard - Comprehensive AI-powered analytics and insights
// Provides detailed visualizations, predictive analytics, and actionable intelligence

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3,
  LineChart,
  PieChart,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Target,
  Zap,
  Brain,
  Eye,
  Filter,
  Download,
  Share2,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Activity,
  Layers,
  MousePointer
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  ResponsiveContainer,
  LineChart as RechartsLineChart,
  AreaChart,
  BarChart as RechartsBarChart,
  PieChart as RechartsPieChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Line,
  Area,
  Bar,
  Cell,
  Pie
} from 'recharts';

interface AnalyticsData {
  debtReduction: DebtReductionData[];
  paymentHistory: PaymentHistoryData[];
  strategyPerformance: StrategyPerformanceData[];
  projections: ProjectionData[];
  debtBreakdown: DebtBreakdownData[];
  monthlyTrends: MonthlyTrendData[];
  aiInsights: AIInsightData[];
}

interface DebtReductionData {
  month: string;
  totalDebt: number;
  paidOff: number;
  remaining: number;
  target: number;
  projection: number;
}

interface PaymentHistoryData {
  date: string;
  amount: number;
  principal: number;
  interest: number;
  category: string;
  efficiency: number;
}

interface StrategyPerformanceData {
  strategy: string;
  timeToDebtFree: number;
  totalInterest: number;
  efficiency: number;
  savings: number;
  confidence: number;
}

interface ProjectionData {
  month: string;
  conservative: number;
  realistic: number;
  optimistic: number;
  current: number;
}

interface DebtBreakdownData {
  name: string;
  value: number;
  interestRate: number;
  color: string;
  category: string;
}

interface MonthlyTrendData {
  month: string;
  income: number;
  expenses: number;
  debtPayments: number;
  savings: number;
  dtiRatio: number;
}

interface AIInsightData {
  id: string;
  type: 'opportunity' | 'warning' | 'achievement' | 'prediction';
  title: string;
  description: string;
  impact: number;
  confidence: number;
  timeframe: string;
  category: string;
}

interface EnhancedAnalyticsDashboardProps {
  userId: string;
  timeRange: '3m' | '6m' | '1y' | '2y' | 'all';
  onTimeRangeChange?: (range: string) => void;
  className?: string;
}

const EnhancedAnalyticsDashboard: React.FC<EnhancedAnalyticsDashboardProps> = ({
  userId,
  timeRange = '6m',
  onTimeRangeChange,
  className = ''
}) => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeView, setActiveView] = useState('overview');
  const [selectedMetric, setSelectedMetric] = useState('debt_reduction');
  const [showProjections, setShowProjections] = useState(true);
  const [aiInsightsEnabled, setAiInsightsEnabled] = useState(true);

  // Color schemes for charts
  const colorSchemes = {
    primary: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'],
    debt: ['#EF4444', '#F97316', '#F59E0B', '#84CC16', '#10B981'],
    performance: ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444'],
    neutral: ['#6B7280', '#9CA3AF', '#D1D5DB', '#E5E7EB', '#F3F4F6']
  };

  // Generate mock analytics data
  const generateMockData = (): AnalyticsData => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

    return {
      debtReduction: months.map((month, index) => ({
        month,
        totalDebt: 250000 - (index * 25000),
        paidOff: index * 25000,
        remaining: 250000 - (index * 25000),
        target: 250000 - (index * 30000),
        projection: 250000 - (index * 27000)
      })),

      paymentHistory: Array.from({ length: 30 }, (_, index) => ({
        date: new Date(Date.now() - index * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        amount: 8000 + Math.random() * 4000,
        principal: 5000 + Math.random() * 2000,
        interest: 2000 + Math.random() * 1000,
        category: ['Credit Card', 'Personal Loan', 'Auto Loan'][Math.floor(Math.random() * 3)],
        efficiency: 70 + Math.random() * 30
      })),

      strategyPerformance: [
        {
          strategy: 'Debt Avalanche',
          timeToDebtFree: 24,
          totalInterest: 45000,
          efficiency: 92,
          savings: 25000,
          confidence: 95
        },
        {
          strategy: 'Debt Snowball',
          timeToDebtFree: 26,
          totalInterest: 52000,
          efficiency: 85,
          savings: 18000,
          confidence: 88
        },
        {
          strategy: 'Custom Mix',
          timeToDebtFree: 25,
          totalInterest: 48000,
          efficiency: 89,
          savings: 22000,
          confidence: 82
        }
      ],

      projections: months.map((month, index) => ({
        month,
        conservative: 250000 - (index * 20000),
        realistic: 250000 - (index * 25000),
        optimistic: 250000 - (index * 30000),
        current: 250000 - (index * 25000)
      })),

      debtBreakdown: [
        { name: 'Credit Cards', value: 125000, interestRate: 18.5, color: '#EF4444', category: 'High Interest' },
        { name: 'Personal Loan', value: 85000, interestRate: 14.2, color: '#F97316', category: 'Medium Interest' },
        { name: 'Auto Loan', value: 65000, interestRate: 8.9, color: '#F59E0B', category: 'Low Interest' }
      ],

      monthlyTrends: months.map((month, index) => ({
        month,
        income: 75000,
        expenses: 45000 + Math.random() * 5000,
        debtPayments: 12000 + Math.random() * 2000,
        savings: 8000 + Math.random() * 3000,
        dtiRatio: 35 - (index * 2)
      })),

      aiInsights: [
        {
          id: '1',
          type: 'opportunity',
          title: 'Payment Optimization Available',
          description: 'Increasing your monthly payment by ₹2,000 could save ₹15,000 in interest',
          impact: 85,
          confidence: 92,
          timeframe: 'Next payment cycle',
          category: 'optimization'
        },
        {
          id: '2',
          type: 'achievement',
          title: 'Debt Reduction Milestone',
          description: 'You\'ve successfully reduced debt by 25% - ahead of schedule!',
          impact: 75,
          confidence: 100,
          timeframe: 'Current',
          category: 'progress'
        },
        {
          id: '3',
          type: 'prediction',
          title: 'Early Payoff Projection',
          description: 'Current trends suggest debt freedom 3 months earlier than planned',
          impact: 90,
          confidence: 88,
          timeframe: '3 months ahead',
          category: 'projection'
        }
      ]
    };
  };

  // Initialize data
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const data = generateMockData();
      setAnalyticsData(data);
      setIsLoading(false);
    };

    loadData();
  }, [timeRange]);

  // Format currency for Indian market
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Calculate key metrics
  const keyMetrics = useMemo(() => {
    if (!analyticsData) return null;

    const currentDebt = analyticsData.debtReduction[analyticsData.debtReduction.length - 1]?.totalDebt || 0;
    const initialDebt = analyticsData.debtReduction[0]?.totalDebt || 0;
    const debtReduced = initialDebt - currentDebt;
    const reductionPercentage = initialDebt > 0 ? (debtReduced / initialDebt) * 100 : 0;

    const avgPayment = analyticsData.paymentHistory.slice(0, 6).reduce((sum, p) => sum + p.amount, 0) / 6;
    const totalInterestPaid = analyticsData.paymentHistory.slice(0, 6).reduce((sum, p) => sum + p.interest, 0);

    const currentDti = analyticsData.monthlyTrends[analyticsData.monthlyTrends.length - 1]?.dtiRatio || 0;
    const previousDti = analyticsData.monthlyTrends[0]?.dtiRatio || 0;
    const dtiImprovement = previousDti - currentDti;

    return {
      debtReduced,
      reductionPercentage,
      avgPayment,
      totalInterestPaid,
      currentDti,
      dtiImprovement,
      projectedSavings: 25000 // From strategy performance
    };
  }, [analyticsData]);

  if (isLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="animate-pulse">
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2].map(i => (
            <div key={i} className="animate-pulse">
              <Card>
                <CardContent className="p-6">
                  <div className="h-64 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!analyticsData) return null;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-blue-600" />
            Analytics Dashboard
          </h2>
          <p className="text-gray-600">AI-powered insights and performance analytics</p>
        </div>

        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={(value) => onTimeRangeChange?.(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3m">3 Months</SelectItem>
              <SelectItem value="6m">6 Months</SelectItem>
              <SelectItem value="1y">1 Year</SelectItem>
              <SelectItem value="2y">2 Years</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>

          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      {keyMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-gray-600">Debt Reduced</span>
                </div>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(keyMetrics.debtReduced)}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-sm text-green-600">
                    {keyMetrics.reductionPercentage.toFixed(1)}%
                  </span>
                  <span className="text-xs text-gray-500">of total debt</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-gray-600">Avg. Monthly Payment</span>
                </div>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(keyMetrics.avgPayment)}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <ArrowUpRight className="h-3 w-3 text-green-500" />
                  <span className="text-xs text-green-600">8% vs last period</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-4 w-4 text-purple-600" />
                  <span className="text-sm text-gray-600">DTI Ratio</span>
                </div>
                <p className="text-2xl font-bold text-purple-600">
                  {keyMetrics.currentDti.toFixed(1)}%
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <ArrowDownRight className="h-3 w-3 text-green-500" />
                  <span className="text-xs text-green-600">
                    -{keyMetrics.dtiImprovement.toFixed(1)}% improved
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm text-gray-600">Projected Savings</span>
                </div>
                <p className="text-2xl font-bold text-yellow-600">
                  {formatCurrency(keyMetrics.projectedSavings)}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-xs text-gray-500">Interest savings</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}

      {/* Main Analytics Content */}
      <Tabs value={activeView} onValueChange={setActiveView} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="debt">Debt Analysis</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="projections">Projections</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Debt Reduction Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="h-5 w-5" />
                  Debt Reduction Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsLineChart data={analyticsData.debtReduction}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`} />
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="totalDebt"
                      stroke="#3B82F6"
                      strokeWidth={3}
                      name="Actual Debt"
                    />
                    <Line
                      type="monotone"
                      dataKey="target"
                      stroke="#10B981"
                      strokeDasharray="5 5"
                      name="Target"
                    />
                    {showProjections && (
                      <Line
                        type="monotone"
                        dataKey="projection"
                        stroke="#8B5CF6"
                        strokeDasharray="3 3"
                        name="AI Projection"
                      />
                    )}
                  </RechartsLineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Monthly Trends */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Monthly Financial Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={analyticsData.monthlyTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`} />
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="income"
                      stackId="1"
                      stroke="#10B981"
                      fill="#10B981"
                      fillOpacity={0.6}
                      name="Income"
                    />
                    <Area
                      type="monotone"
                      dataKey="expenses"
                      stackId="2"
                      stroke="#EF4444"
                      fill="#EF4444"
                      fillOpacity={0.6}
                      name="Expenses"
                    />
                    <Area
                      type="monotone"
                      dataKey="debtPayments"
                      stackId="2"
                      stroke="#F59E0B"
                      fill="#F59E0B"
                      fillOpacity={0.6}
                      name="Debt Payments"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Debt Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Debt Composition
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={analyticsData.debtBreakdown}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${formatCurrency(value)}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {analyticsData.debtBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Debt Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.debtBreakdown.map((debt, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: debt.color }}
                        />
                        <div>
                          <p className="font-medium text-sm">{debt.name}</p>
                          <p className="text-xs text-gray-500">{debt.interestRate}% APR</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-sm">{formatCurrency(debt.value)}</p>
                        <Badge
                          className={
                            debt.category === 'High Interest' ? 'bg-red-100 text-red-700' :
                            debt.category === 'Medium Interest' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'
                          }
                        >
                          {debt.category}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Debt Analysis Tab */}
        <TabsContent value="debt" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Payment Efficiency */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Efficiency Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsBarChart data={analyticsData.paymentHistory.slice(0, 10)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickFormatter={(date) => new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} />
                    <YAxis />
                    <Tooltip
                      labelFormatter={(date) => new Date(date).toLocaleDateString('en-IN')}
                      formatter={(value) => formatCurrency(value as number)}
                    />
                    <Legend />
                    <Bar dataKey="principal" stackId="a" fill="#10B981" name="Principal" />
                    <Bar dataKey="interest" stackId="a" fill="#EF4444" name="Interest" />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* DTI Ratio Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Debt-to-Income Ratio Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsLineChart data={analyticsData.monthlyTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis domain={[0, 50]} />
                    <Tooltip formatter={(value) => `${value}%`} />
                    <Line
                      type="monotone"
                      dataKey="dtiRatio"
                      stroke="#8B5CF6"
                      strokeWidth={3}
                      name="DTI Ratio"
                    />
                  </RechartsLineChart>
                </ResponsiveContainer>
                <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-600">Excellent</p>
                    <p className="text-xs text-gray-500">≤ 20%</p>
                  </div>
                  <div className="p-3 bg-yellow-50 rounded-lg">
                    <p className="text-sm text-yellow-600">Good</p>
                    <p className="text-xs text-gray-500">21-35%</p>
                  </div>
                  <div className="p-3 bg-red-50 rounded-lg">
                    <p className="text-sm text-red-600">Needs Work</p>
                    <p className="text-xs text-gray-500">> 35%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Strategy Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Strategy Performance Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsBarChart data={analyticsData.strategyPerformance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="strategy" />
                    <YAxis />
                    <Tooltip formatter={(value) => value} />
                    <Legend />
                    <Bar dataKey="efficiency" fill="#10B981" name="Efficiency %" />
                    <Bar dataKey="confidence" fill="#3B82F6" name="AI Confidence %" />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Savings Potential */}
            <Card>
              <CardHeader>
                <CardTitle>Savings Potential by Strategy</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.strategyPerformance.map((strategy, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium">{strategy.strategy}</h4>
                        <Badge className="bg-blue-100 text-blue-700">
                          {strategy.efficiency}% efficient
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Time to freedom:</span>
                          <p className="font-medium">{strategy.timeToDebtFree} months</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Interest savings:</span>
                          <p className="font-medium text-green-600">{formatCurrency(strategy.savings)}</p>
                        </div>
                      </div>

                      <div className="mt-3">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>AI Confidence</span>
                          <span>{strategy.confidence}%</span>
                        </div>
                        <Progress value={strategy.confidence} className="h-2" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Projections Tab */}
        <TabsContent value="projections" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                AI-Powered Debt Projections
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={analyticsData.projections}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`} />
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="optimistic"
                    stroke="#10B981"
                    fill="#10B981"
                    fillOpacity={0.2}
                    name="Optimistic Scenario"
                  />
                  <Area
                    type="monotone"
                    dataKey="realistic"
                    stroke="#3B82F6"
                    fill="#3B82F6"
                    fillOpacity={0.3}
                    name="Realistic Scenario"
                  />
                  <Area
                    type="monotone"
                    dataKey="conservative"
                    stroke="#8B5CF6"
                    fill="#8B5CF6"
                    fillOpacity={0.2}
                    name="Conservative Scenario"
                  />
                  <Line
                    type="monotone"
                    dataKey="current"
                    stroke="#F59E0B"
                    strokeWidth={3}
                    name="Current Track"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Insights Tab */}
        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {analyticsData.aiInsights.map((insight, index) => (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={`border-l-4 ${
                  insight.type === 'opportunity' ? 'border-l-green-500 bg-green-50' :
                  insight.type === 'warning' ? 'border-l-red-500 bg-red-50' :
                  insight.type === 'achievement' ? 'border-l-blue-500 bg-blue-50' :
                  'border-l-purple-500 bg-purple-50'
                }`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-sm">{insight.title}</h3>
                        <Badge
                          className={`mt-1 text-xs ${
                            insight.type === 'opportunity' ? 'bg-green-100 text-green-700' :
                            insight.type === 'warning' ? 'bg-red-100 text-red-700' :
                            insight.type === 'achievement' ? 'bg-blue-100 text-blue-700' :
                            'bg-purple-100 text-purple-700'
                          }`}
                        >
                          {insight.type}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-500">Impact</div>
                        <div className="font-semibold text-sm">{insight.impact}%</div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-700 mb-3">{insight.description}</p>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">Timeframe: {insight.timeframe}</span>
                      <div className="flex items-center gap-1">
                        <Sparkles className="h-3 w-3 text-blue-500" />
                        <span className="text-blue-600">{insight.confidence}% confidence</span>
                      </div>
                    </div>

                    <div className="mt-3">
                      <Button size="sm" className="w-full text-xs">
                        <MousePointer className="h-3 w-3 mr-2" />
                        Take Action
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedAnalyticsDashboard;