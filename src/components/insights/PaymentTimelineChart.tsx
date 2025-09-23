import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import {
  TrendingDown,
  Calendar,
  DollarSign,
  BarChart3,
  Download,
  Maximize,
  Filter,
  Info
} from 'lucide-react';
import { PaymentTimelineEntry, ChartTimeframe, DebtStrategy } from '@/types/ai-insights';

interface PaymentTimelineChartProps {
  timelineData: PaymentTimelineEntry[];
  strategies?: DebtStrategy[];
  currentStrategy?: DebtStrategy;
  className?: string;
  onTimeframeChange?: (timeframe: ChartTimeframe) => void;
  onExport?: () => void;
}

const PaymentTimelineChart: React.FC<PaymentTimelineChartProps> = ({
  timelineData,
  strategies = ['avalanche', 'snowball'],
  currentStrategy = 'avalanche',
  className,
  onTimeframeChange,
  onExport
}) => {
  const [activeTab, setActiveTab] = useState('debt');
  const [timeframe, setTimeframe] = useState<ChartTimeframe>('all');
  const [selectedStrategy, setSelectedStrategy] = useState<string>('all');

  // Format currency for Indian locale
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Format currency for tooltip (shorter format)
  const formatCurrencyShort = (amount: number) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(1)}Cr`;
    } else if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    } else if (amount >= 1000) {
      return `₹${(amount / 1000).toFixed(1)}K`;
    }
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  // Filter data based on timeframe
  const filteredData = useMemo(() => {
    let monthsToShow = timelineData.length;

    switch (timeframe) {
      case '6m':
        monthsToShow = 6;
        break;
      case '1y':
        monthsToShow = 12;
        break;
      case '2y':
        monthsToShow = 24;
        break;
      case '5y':
        monthsToShow = 60;
        break;
      case 'all':
      default:
        monthsToShow = timelineData.length;
        break;
    }

    return timelineData.slice(0, monthsToShow);
  }, [timelineData, timeframe]);

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 mb-2">
            Month {label} - {new Date(data.date).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
          </p>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-gray-600">Remaining Debt:</span>
              <span className="font-medium text-red-600">{formatCurrencyShort(data.totalDebt)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-gray-600">Monthly Payment:</span>
              <span className="font-medium">{formatCurrencyShort(data.monthlyPayment)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-gray-600">Interest Paid:</span>
              <span className="font-medium text-orange-600">{formatCurrencyShort(data.interestPaid)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-gray-600">Principal Paid:</span>
              <span className="font-medium text-finance-green">{formatCurrencyShort(data.principalPaid)}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Calculate summary metrics
  const summaryMetrics = useMemo(() => {
    const totalInterest = filteredData.reduce((sum, entry) => sum + entry.interestPaid, 0);
    const totalPrincipal = filteredData.reduce((sum, entry) => sum + entry.principalPaid, 0);
    const finalDebt = filteredData.length > 0 ? filteredData[filteredData.length - 1].totalDebt : 0;
    const initialDebt = filteredData.length > 0 ? filteredData[0].totalDebt : 0;

    return {
      totalInterest,
      totalPrincipal,
      debtReduction: initialDebt - finalDebt,
      progressPercentage: initialDebt > 0 ? ((initialDebt - finalDebt) / initialDebt) * 100 : 0
    };
  }, [filteredData]);

  return (
    <Card className={`transition-all duration-200 ${className}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 mb-2">
              <TrendingDown className="h-5 w-5 text-finance-blue" />
              Debt Repayment Timeline
            </CardTitle>
            <p className="text-sm text-gray-600">
              Visual projection of your debt elimination journey over time
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onExport}>
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
            <Button variant="outline" size="sm">
              <Maximize className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4 mt-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <Select value={timeframe} onValueChange={(value: ChartTimeframe) => {
              setTimeframe(value);
              onTimeframeChange?.(value);
            }}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="6m">6 Months</SelectItem>
                <SelectItem value="1y">1 Year</SelectItem>
                <SelectItem value="2y">2 Years</SelectItem>
                <SelectItem value="5y">5 Years</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Summary metrics */}
          <div className="flex items-center gap-4 ml-auto">
            <Badge variant="outline" className="text-xs">
              {filteredData.length} months shown
            </Badge>
            <Badge variant="outline" className="text-xs text-finance-green">
              {summaryMetrics.progressPercentage.toFixed(1)}% reduction
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="debt">Debt Balance</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
            <TabsTrigger value="comparison">Compare</TabsTrigger>
          </TabsList>

          <TabsContent value="debt" className="mt-6">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={filteredData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="month"
                    stroke="#666"
                    fontSize={12}
                    tickFormatter={(value) => `M${value}`}
                  />
                  <YAxis
                    stroke="#666"
                    fontSize={12}
                    tickFormatter={formatCurrencyShort}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="totalDebt"
                    stroke="#dc2626"
                    fill="url(#debtGradient)"
                    strokeWidth={2}
                  />
                  <defs>
                    <linearGradient id="debtGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#dc2626" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#dc2626" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <ReferenceLine y={0} stroke="#10b981" strokeDasharray="5 5" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {formatCurrency(summaryMetrics.debtReduction)}
                </div>
                <div className="text-xs text-gray-500">Debt Reduced</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {filteredData.length}
                </div>
                <div className="text-xs text-gray-500">Months</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-finance-green">
                  {summaryMetrics.progressPercentage.toFixed(1)}%
                </div>
                <div className="text-xs text-gray-500">Progress</div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="payments" className="mt-6">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={filteredData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="month"
                    stroke="#666"
                    fontSize={12}
                    tickFormatter={(value) => `M${value}`}
                  />
                  <YAxis
                    stroke="#666"
                    fontSize={12}
                    tickFormatter={formatCurrencyShort}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey="monthlyPayment"
                    fill="#3b82f6"
                    radius={[2, 2, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="breakdown" className="mt-6">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={filteredData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="month"
                    stroke="#666"
                    fontSize={12}
                    tickFormatter={(value) => `M${value}`}
                  />
                  <YAxis
                    stroke="#666"
                    fontSize={12}
                    tickFormatter={formatCurrencyShort}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="principalPaid"
                    stackId="1"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.6}
                    name="Principal"
                  />
                  <Area
                    type="monotone"
                    dataKey="interestPaid"
                    stackId="1"
                    stroke="#f59e0b"
                    fill="#f59e0b"
                    fillOpacity={0.6}
                    name="Interest"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t">
              <div className="text-center p-3 bg-finance-green/10 rounded-lg">
                <div className="text-lg font-bold text-finance-green">
                  {formatCurrency(summaryMetrics.totalPrincipal)}
                </div>
                <div className="text-xs text-gray-600">Total Principal Paid</div>
              </div>
              <div className="text-center p-3 bg-orange-100 rounded-lg">
                <div className="text-lg font-bold text-orange-600">
                  {formatCurrency(summaryMetrics.totalInterest)}
                </div>
                <div className="text-xs text-gray-600">Total Interest Paid</div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="comparison" className="mt-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-4 bg-blue-50 rounded-lg">
                <Info className="h-4 w-4 text-finance-blue" />
                <span className="text-sm text-finance-blue">
                  Strategy comparison view shows multiple repayment approaches side by side
                </span>
              </div>

              <div className="h-80 bg-gray-50 rounded-lg flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Strategy comparison visualization</p>
                  <p className="text-xs">Available with multiple strategy data</p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default PaymentTimelineChart;