// Debt Simulator - Interactive debt payoff scenario simulator
// Allows users to experiment with different payment amounts and strategies

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calculator,
  Play,
  RotateCcw,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Zap,
  Target,
  AlertCircle,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight,
  Info,
  Sparkles,
  Clock,
  PiggyBank
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { apiService } from '@/lib/api';
import {
  DebtStrategy,
  SimulationParameters,
  SimulationResults,
  PaymentTimelineEntry
} from '@/types/ai-insights';

interface DebtSimulatorProps {
  currentMonthlyPayment?: number;
  currentStrategy?: DebtStrategy;
  onSimulationComplete?: (results: SimulationResults) => void;
  onApplyChanges?: (parameters: SimulationParameters) => void;
  className?: string;
}

interface SimulationConfig {
  monthlyPayment: number;
  strategy: DebtStrategy;
  extraPayment: number;
  targetDebtId?: string;
  timeframe: 'aggressive' | 'balanced' | 'conservative';
  includeInflation: boolean;
  emergencyFundTarget: number;
}

interface ScenarioCard {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  config: Partial<SimulationConfig>;
  impact: 'high' | 'medium' | 'low';
}

const DebtSimulator: React.FC<DebtSimulatorProps> = ({
  currentMonthlyPayment = 10000,
  currentStrategy = 'snowball',
  onSimulationComplete,
  onApplyChanges,
  className = ''
}) => {
  const [config, setConfig] = useState<SimulationConfig>({
    monthlyPayment: currentMonthlyPayment,
    strategy: currentStrategy,
    extraPayment: 0,
    timeframe: 'balanced',
    includeInflation: false,
    emergencyFundTarget: 50000
  });

  const [results, setResults] = useState<SimulationResults | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [simulationHistory, setSimulationHistory] = useState<SimulationResults[]>([]);
  const [activeScenario, setActiveScenario] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Predefined scenarios for quick simulation
  const scenarios: ScenarioCard[] = [
    {
      id: 'aggressive',
      name: 'Aggressive Payoff',
      description: 'Maximum payment, fastest debt freedom',
      icon: Zap,
      color: 'text-red-600 bg-red-50 border-red-200',
      config: {
        monthlyPayment: currentMonthlyPayment * 1.5,
        strategy: 'avalanche',
        extraPayment: 5000,
        timeframe: 'aggressive'
      },
      impact: 'high'
    },
    {
      id: 'balanced',
      name: 'Balanced Approach',
      description: 'Moderate increase, sustainable pace',
      icon: Target,
      color: 'text-blue-600 bg-blue-50 border-blue-200',
      config: {
        monthlyPayment: currentMonthlyPayment * 1.2,
        strategy: 'snowball',
        extraPayment: 2000,
        timeframe: 'balanced'
      },
      impact: 'medium'
    },
    {
      id: 'conservative',
      name: 'Conservative Plan',
      description: 'Minimal increase, steady progress',
      icon: PiggyBank,
      color: 'text-green-600 bg-green-50 border-green-200',
      config: {
        monthlyPayment: currentMonthlyPayment * 1.1,
        strategy: 'snowball',
        extraPayment: 1000,
        timeframe: 'conservative'
      },
      impact: 'low'
    },
    {
      id: 'emergency_first',
      name: 'Emergency Fund Priority',
      description: 'Build emergency fund while paying debt',
      icon: AlertCircle,
      color: 'text-purple-600 bg-purple-50 border-purple-200',
      config: {
        monthlyPayment: currentMonthlyPayment * 0.9,
        strategy: 'snowball',
        emergencyFundTarget: 100000,
        timeframe: 'conservative'
      },
      impact: 'medium'
    }
  ];

  // Run simulation
  const runSimulation = async (simulationConfig = config) => {
    setIsSimulating(true);
    setError(null);

    try {
      const parameters: SimulationParameters = {
        monthlyPayment: simulationConfig.monthlyPayment,
        strategy: simulationConfig.strategy,
        extraPayment: simulationConfig.extraPayment
      };

      const response = await apiService.simulatePayment(parameters);
      setResults(response.results);
      setSimulationHistory(prev => [response.results, ...prev.slice(0, 4)]); // Keep last 5
      onSimulationComplete?.(response.results);
    } catch (err) {
      console.error('Simulation failed:', err);
      setError('Failed to run simulation. Please try again.');

      // Fallback to mock simulation
      const mockResults = generateMockSimulation(simulationConfig);
      setResults(mockResults);
    } finally {
      setIsSimulating(false);
    }
  };

  // Generate mock simulation results
  const generateMockSimulation = (simulationConfig: SimulationConfig): SimulationResults => {
    const currentPlan = {
      name: 'Current Plan',
      timeToDebtFree: 36,
      totalInterestPaid: 85000,
      totalInterestSaved: 0,
      monthlyPayment: currentMonthlyPayment,
      debtFreeDate: new Date(Date.now() + 36 * 30 * 24 * 60 * 60 * 1000).toISOString()
    };

    const optimizedPlan = {
      name: 'Optimized Plan',
      timeToDebtFree: Math.max(12, Math.round(36 * (currentMonthlyPayment / simulationConfig.monthlyPayment))),
      totalInterestPaid: Math.round(85000 * (currentMonthlyPayment / simulationConfig.monthlyPayment) * 0.8),
      totalInterestSaved: 0,
      monthlyPayment: simulationConfig.monthlyPayment,
      debtFreeDate: new Date(Date.now() + Math.max(12, Math.round(36 * (currentMonthlyPayment / simulationConfig.monthlyPayment))) * 30 * 24 * 60 * 60 * 1000).toISOString()
    };

    optimizedPlan.totalInterestSaved = currentPlan.totalInterestPaid - optimizedPlan.totalInterestPaid;

    return {
      originalPlan: currentPlan,
      optimizedPlan: optimizedPlan,
      savings: {
        timeMonths: currentPlan.timeToDebtFree - optimizedPlan.timeToDebtFree,
        interestAmount: optimizedPlan.totalInterestSaved,
        percentageImprovement: Math.round((optimizedPlan.totalInterestSaved / currentPlan.totalInterestPaid) * 100)
      },
      timeline: [] // Mock timeline would be generated here
    };
  };

  // Auto-run simulation when config changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (config.monthlyPayment !== currentMonthlyPayment || config.strategy !== currentStrategy) {
        runSimulation();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [config]);

  // Format currency
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

  // Handle scenario selection
  const applyScenario = (scenario: ScenarioCard) => {
    setActiveScenario(scenario.id);
    setConfig(prev => ({
      ...prev,
      ...scenario.config
    }));
  };

  // Reset to defaults
  const resetSimulation = () => {
    setConfig({
      monthlyPayment: currentMonthlyPayment,
      strategy: currentStrategy,
      extraPayment: 0,
      timeframe: 'balanced',
      includeInflation: false,
      emergencyFundTarget: 50000
    });
    setActiveScenario(null);
    setResults(null);
  };

  // Calculate impact indicators
  const impactMetrics = useMemo(() => {
    if (!results) return null;

    const timeSavings = results.savings.timeMonths;
    const interestSavings = results.savings.interestAmount;
    const paymentIncrease = config.monthlyPayment - currentMonthlyPayment;
    const paymentIncreasePercent = (paymentIncrease / currentMonthlyPayment) * 100;

    return {
      timeSavings,
      interestSavings,
      paymentIncrease,
      paymentIncreasePercent,
      roi: paymentIncrease > 0 ? interestSavings / (paymentIncrease * 12) : 0
    };
  }, [results, config, currentMonthlyPayment]);

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Debt Payoff Simulator
          </CardTitle>

          <div className="flex items-center gap-2">
            <Button
              onClick={resetSimulation}
              variant="outline"
              size="sm"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>

            <Button
              onClick={() => runSimulation()}
              variant="default"
              size="sm"
              disabled={isSimulating}
            >
              {isSimulating ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Calculator className="h-4 w-4 mr-2" />
                </motion.div>
              ) : (
                <Play className="h-4 w-4 mr-2" />
              )}
              Simulate
            </Button>
          </div>
        </div>

        {error && (
          <Alert className="mt-4 bg-red-50 border-red-200">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="quick" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="quick">Quick Scenarios</TabsTrigger>
            <TabsTrigger value="custom">Custom Simulation</TabsTrigger>
            <TabsTrigger value="results">Results & Analysis</TabsTrigger>
          </TabsList>

          {/* Quick Scenarios */}
          <TabsContent value="quick" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {scenarios.map((scenario) => (
                <motion.div
                  key={scenario.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card
                    className={`cursor-pointer transition-all duration-200 ${
                      activeScenario === scenario.id
                        ? `${scenario.color} ring-2 ring-blue-300`
                        : 'hover:shadow-md'
                    }`}
                    onClick={() => applyScenario(scenario)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${scenario.color}`}>
                          <scenario.icon className="h-5 w-5" />
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold">{scenario.name}</h3>
                            <Badge
                              className={
                                scenario.impact === 'high' ? 'bg-red-100 text-red-700' :
                                scenario.impact === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-green-100 text-green-700'
                              }
                            >
                              {scenario.impact} impact
                            </Badge>
                          </div>

                          <p className="text-sm text-gray-600 mb-3">
                            {scenario.description}
                          </p>

                          <div className="space-y-1 text-xs">
                            {scenario.config.monthlyPayment && (
                              <div className="flex justify-between">
                                <span className="text-gray-500">Monthly Payment:</span>
                                <span className="font-medium">
                                  {formatCurrency(scenario.config.monthlyPayment)}
                                </span>
                              </div>
                            )}
                            {scenario.config.extraPayment && (
                              <div className="flex justify-between">
                                <span className="text-gray-500">Extra Payment:</span>
                                <span className="font-medium">
                                  {formatCurrency(scenario.config.extraPayment)}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Quick Results Preview */}
            {results && activeScenario && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border"
              >
                <h4 className="font-semibold text-gray-900 mb-3">Scenario Impact</h4>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {formatDuration(results.savings.timeMonths)}
                    </div>
                    <div className="text-sm text-gray-600">Time Saved</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {formatCurrency(results.savings.interestAmount)}
                    </div>
                    <div className="text-sm text-gray-600">Interest Saved</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-600">
                      {results.savings.percentageImprovement}%
                    </div>
                    <div className="text-sm text-gray-600">Improvement</div>
                  </div>
                </div>
              </motion.div>
            )}
          </TabsContent>

          {/* Custom Simulation */}
          <TabsContent value="custom" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Payment Configuration */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Payment Configuration</h4>

                <div className="space-y-3">
                  <div>
                    <Label htmlFor="monthlyPayment">Monthly Payment</Label>
                    <div className="mt-1">
                      <Input
                        id="monthlyPayment"
                        type="number"
                        value={config.monthlyPayment}
                        onChange={(e) => setConfig(prev => ({
                          ...prev,
                          monthlyPayment: parseInt(e.target.value) || 0
                        }))}
                        className="w-full"
                      />
                      <div className="mt-2">
                        <Slider
                          value={[config.monthlyPayment]}
                          onValueChange={([value]) => setConfig(prev => ({
                            ...prev,
                            monthlyPayment: value
                          }))}
                          max={currentMonthlyPayment * 3}
                          min={currentMonthlyPayment * 0.5}
                          step={500}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>{formatCurrency(currentMonthlyPayment * 0.5)}</span>
                          <span>{formatCurrency(currentMonthlyPayment * 3)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="extraPayment">Extra Payment (Optional)</Label>
                    <Input
                      id="extraPayment"
                      type="number"
                      value={config.extraPayment}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        extraPayment: parseInt(e.target.value) || 0
                      }))}
                      className="w-full mt-1"
                      placeholder="Additional monthly payment"
                    />
                  </div>

                  <div>
                    <Label htmlFor="strategy">Debt Strategy</Label>
                    <Select
                      value={config.strategy}
                      onValueChange={(value: DebtStrategy) => setConfig(prev => ({
                        ...prev,
                        strategy: value
                      }))}
                    >
                      <SelectTrigger className="w-full mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="avalanche">Debt Avalanche (Highest Interest First)</SelectItem>
                        <SelectItem value="snowball">Debt Snowball (Smallest Balance First)</SelectItem>
                        <SelectItem value="custom">Custom Strategy</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Advanced Options */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-gray-900">Advanced Options</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                  >
                    {showAdvanced ? 'Hide' : 'Show'} Advanced
                  </Button>
                </div>

                <AnimatePresence>
                  {showAdvanced && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-3"
                    >
                      <div>
                        <Label htmlFor="timeframe">Timeframe Preference</Label>
                        <Select
                          value={config.timeframe}
                          onValueChange={(value: any) => setConfig(prev => ({
                            ...prev,
                            timeframe: value
                          }))}
                        >
                          <SelectTrigger className="w-full mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="aggressive">Aggressive (Fast payoff)</SelectItem>
                            <SelectItem value="balanced">Balanced (Moderate pace)</SelectItem>
                            <SelectItem value="conservative">Conservative (Steady progress)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="emergencyFund">Emergency Fund Target</Label>
                        <Input
                          id="emergencyFund"
                          type="number"
                          value={config.emergencyFundTarget}
                          onChange={(e) => setConfig(prev => ({
                            ...prev,
                            emergencyFundTarget: parseInt(e.target.value) || 0
                          }))}
                          className="w-full mt-1"
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="inflation"
                          checked={config.includeInflation}
                          onChange={(e) => setConfig(prev => ({
                            ...prev,
                            includeInflation: e.target.checked
                          }))}
                          className="rounded"
                        />
                        <Label htmlFor="inflation" className="text-sm">
                          Include inflation adjustment (5% annually)
                        </Label>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Current vs New Comparison */}
                {config.monthlyPayment !== currentMonthlyPayment && (
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <h5 className="font-medium text-blue-900 mb-2">Payment Change</h5>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-blue-700">Current: {formatCurrency(currentMonthlyPayment)}</span>
                      <ArrowUpRight className="h-4 w-4 text-blue-600" />
                      <span className="text-blue-900 font-medium">New: {formatCurrency(config.monthlyPayment)}</span>
                    </div>
                    <div className="mt-1 text-xs text-blue-600">
                      {config.monthlyPayment > currentMonthlyPayment ? 'Increase' : 'Decrease'}: {formatCurrency(Math.abs(config.monthlyPayment - currentMonthlyPayment))}
                      ({Math.abs(((config.monthlyPayment - currentMonthlyPayment) / currentMonthlyPayment) * 100).toFixed(1)}%)
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Run Simulation Button */}
            <div className="flex justify-center">
              <Button
                onClick={() => runSimulation()}
                size="lg"
                disabled={isSimulating}
                className="w-full max-w-md"
              >
                {isSimulating ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Calculator className="h-5 w-5 mr-2" />
                    </motion.div>
                    Running Simulation...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5 mr-2" />
                    Run Simulation
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          {/* Results & Analysis */}
          <TabsContent value="results" className="space-y-6">
            {results ? (
              <>
                {/* Main Results */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Current Plan */}
                  <Card className="border border-gray-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Clock className="h-5 w-5 text-gray-600" />
                        Current Plan
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Time to debt free:</span>
                          <span className="font-semibold">{formatDuration(results.originalPlan.timeToDebtFree)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total interest:</span>
                          <span className="font-semibold">{formatCurrency(results.originalPlan.totalInterestPaid)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Monthly payment:</span>
                          <span className="font-semibold">{formatCurrency(results.originalPlan.monthlyPayment)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Debt free date:</span>
                          <span className="font-semibold">
                            {new Date(results.originalPlan.debtFreeDate).toLocaleDateString('en-IN')}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Optimized Plan */}
                  <Card className="border border-green-200 bg-green-50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-green-600" />
                        Optimized Plan
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Time to debt free:</span>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{formatDuration(results.optimizedPlan.timeToDebtFree)}</span>
                            {results.savings.timeMonths > 0 && (
                              <Badge className="bg-green-100 text-green-700 text-xs">
                                -{formatDuration(results.savings.timeMonths)}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total interest:</span>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{formatCurrency(results.optimizedPlan.totalInterestPaid)}</span>
                            {results.savings.interestAmount > 0 && (
                              <Badge className="bg-green-100 text-green-700 text-xs">
                                -{formatCurrency(results.savings.interestAmount)}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Monthly payment:</span>
                          <span className="font-semibold">{formatCurrency(results.optimizedPlan.monthlyPayment)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Debt free date:</span>
                          <span className="font-semibold">
                            {new Date(results.optimizedPlan.debtFreeDate).toLocaleDateString('en-IN')}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Savings Summary */}
                <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-green-600" />
                      Your Savings Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-green-600 mb-1">
                          {formatDuration(results.savings.timeMonths)}
                        </div>
                        <div className="text-sm text-gray-600">Time Saved</div>
                        <div className="text-xs text-gray-500 mt-1">
                          Get debt-free {results.savings.timeMonths} months earlier
                        </div>
                      </div>

                      <div className="text-center">
                        <div className="text-3xl font-bold text-green-600 mb-1">
                          {formatCurrency(results.savings.interestAmount)}
                        </div>
                        <div className="text-sm text-gray-600">Interest Saved</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {results.savings.percentageImprovement}% reduction in interest
                        </div>
                      </div>

                      <div className="text-center">
                        <div className="text-3xl font-bold text-blue-600 mb-1">
                          {impactMetrics && impactMetrics.paymentIncreasePercent > 0
                            ? `+${impactMetrics.paymentIncreasePercent.toFixed(1)}%`
                            : '0%'
                          }
                        </div>
                        <div className="text-sm text-gray-600">Payment Increase</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {impactMetrics && formatCurrency(impactMetrics.paymentIncrease)} per month
                        </div>
                      </div>
                    </div>

                    {/* ROI Calculation */}
                    {impactMetrics && impactMetrics.roi > 0 && (
                      <div className="mt-4 p-3 bg-white/60 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Return on Investment (ROI):</span>
                          <span className="font-semibold text-green-600">
                            {(impactMetrics.roi * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Every ₹1 extra payment saves ₹{impactMetrics.roi.toFixed(2)} in interest
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="flex gap-4 justify-center">
                  <Button
                    onClick={() => onApplyChanges?.(config)}
                    size="lg"
                    className="flex-1 max-w-sm"
                  >
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Apply This Plan
                  </Button>

                  <Button
                    onClick={() => runSimulation()}
                    variant="outline"
                    size="lg"
                  >
                    <Calculator className="h-5 w-5 mr-2" />
                    Run Again
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <Calculator className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No Simulation Results</h3>
                <p className="text-gray-500 mb-4">
                  Run a simulation to see your debt payoff projections
                </p>
                <Button onClick={() => runSimulation()}>
                  <Play className="h-4 w-4 mr-2" />
                  Run First Simulation
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default DebtSimulator;