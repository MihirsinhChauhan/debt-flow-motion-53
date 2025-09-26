// Enhanced AI Insights Page - Comprehensive AI-powered debt management experience
// Integrates all advanced AI features: coaching, simulation, analytics, and gamification

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  ArrowLeft,
  Settings,
  Download,
  Share2,
  RefreshCw,
  MessageCircle,
  BarChart3,
  Calculator,
  Trophy,
  Target,
  Zap,
  Sparkles,
  Bell,
  Eye,
  Users,
  TrendingUp,
  Activity,
  Layers
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

// Enhanced AI Components
import useAIInsights from '@/hooks/useAIInsights';
import AICoachingInterface from '@/components/ai-coaching/AICoachingInterface';
import StrategyComparisonWidget from '@/components/strategy/StrategyComparisonWidget';
import DebtSimulator from '@/components/simulation/DebtSimulator';
import SmartNotificationSystem from '@/components/ai-actionable/SmartNotificationSystem';
import AIGoalSettingInterface from '@/components/ai-actionable/AIGoalSettingInterface';
import EnhancedAnalyticsDashboard from '@/components/analytics/EnhancedAnalyticsDashboard';
import DebtGameificationSystem from '@/components/gamification/DebtGameificationSystem';

// Original AI Components
import AIRecommendationsPanel from '@/components/insights/AIRecommendationsPanel';
import DTIAnalysisCard from '@/components/insights/DTIAnalysisCard';
import DebtOptimizationSuggestions from '@/components/insights/DebtOptimizationSuggestions';
import RepaymentPlanDisplay from '@/components/insights/RepaymentPlanDisplay';
import AIProcessingStatusSection from '@/components/insights/AIProcessingStatusSection';

// Types
import { RecommendationItem, DebtOptimizationSuggestion, DebtStrategy, SimulationParameters } from '@/types/ai-insights';

interface EnhancedFeatureStats {
  activeUsers: number;
  aiInteractions: number;
  successRate: number;
  avgSavings: number;
}

const EnhancedAIInsights: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // AI insights hook with auto-refresh enabled
  const {
    data,
    isLoading,
    isRefreshing,
    error,
    processingState,
    qualityMetrics,
    lastUpdated,
    hasData,
    recommendations,
    debtAnalysis,
    dtiAnalysis,
    repaymentPlan,
    riskAssessment,
    canRetry,
    isProcessing,
    cacheAge,
    isStale,
    fetchInsights,
    refreshInsights,
    retry,
    dismissError
  } = useAIInsights({
    enableAutoRefresh: true,
    refreshInterval: 30,
    enableCaching: true,
    maxRetries: 3
  });

  const [activeMainTab, setActiveMainTab] = useState('overview');
  const [activeFeature, setActiveFeature] = useState<string | null>(null);
  const [showAdvancedMode, setShowAdvancedMode] = useState(false);
  const [timeRange, setTimeRange] = useState('6m');
  const [featureStats, setFeatureStats] = useState<EnhancedFeatureStats>({
    activeUsers: 12847,
    aiInteractions: 156234,
    successRate: 94.8,
    avgSavings: 45000
  });

  // Mock user data
  const [userProgress, setUserProgress] = useState({
    debtReduced: 125000,
    totalPayments: 15,
    consecutiveDays: 45,
    currentIncome: 75000,
    currentStrategy: 'snowball' as DebtStrategy
  });

  // Feature access control
  const [enabledFeatures, setEnabledFeatures] = useState({
    coaching: true,
    simulation: true,
    analytics: true,
    gamification: true,
    notifications: true,
    goals: true,
    social: false // Premium feature
  });

  // Initialize enhanced features
  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      setFeatureStats(prev => ({
        ...prev,
        aiInteractions: prev.aiInteractions + Math.floor(Math.random() * 5),
        activeUsers: prev.activeUsers + Math.floor(Math.random() * 3) - 1
      }));
    }, 10000);

    return () => clearInterval(interval);
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

  // Convert recommendations to optimization suggestions format
  const convertToOptimizationSuggestions = (recommendations: RecommendationItem[]): DebtOptimizationSuggestion[] => {
    return recommendations.map((rec) => ({
      id: rec.id,
      name: rec.title,
      description: rec.description,
      timeToDebtFree: 24,
      totalInterestSaved: rec.potential_savings || rec.estimated_savings || 0,
      monthlyPaymentIncrease: 5000,
      implementationSteps: rec.action_steps || [
        'Review your current debt portfolio',
        'Implement the recommended strategy',
        'Monitor progress monthly'
      ],
      priority: rec.priority_score >= 8 ? 'high' : rec.priority_score >= 5 ? 'medium' : 'low',
      category: rec.recommendation_type.includes('payment') ? 'payment_increase' :
               rec.recommendation_type.includes('consolidation') ? 'consolidation' :
               rec.recommendation_type.includes('refinanc') ? 'refinancing' : 'strategy_change'
    }));
  };

  // Handle feature actions
  const handleStrategySelect = (strategy: DebtStrategy) => {
    setUserProgress(prev => ({ ...prev, currentStrategy: strategy }));
  };

  const handleSimulationApply = (parameters: SimulationParameters) => {
    console.log('Applying simulation parameters:', parameters);
  };

  const handleGoalCreated = (goal: any) => {
    console.log('New goal created:', goal);
  };

  const handleAchievementShare = (achievement: any) => {
    console.log('Sharing achievement:', achievement);
  };

  const handleNotificationAction = (notificationId: string, actionId: string) => {
    console.log('Notification action:', notificationId, actionId);
  };

  // Handle recommendation actions
  const handleDismissRecommendation = async (recommendationId: string) => {
    console.log('Dismissing recommendation:', recommendationId);
  };

  const handleImplementRecommendation = async (recommendation: RecommendationItem) => {
    console.log('Implementing recommendation:', recommendation);
  };

  const handleViewRecommendationDetails = (recommendation: RecommendationItem) => {
    console.log('Viewing recommendation details:', recommendation);
  };

  const handleApplySuggestion = (suggestion: DebtOptimizationSuggestion) => {
    console.log('Applying suggestion:', suggestion);
  };

  const handleSimulateSuggestion = (suggestion: DebtOptimizationSuggestion) => {
    console.log('Simulating suggestion:', suggestion);
  };

  const handleOptimizeDTI = () => {
    setActiveFeature('goals');
    setActiveMainTab('features');
  };

  const optimizationSuggestions = convertToOptimizationSuggestions(recommendations);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Enhanced Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/dashboard')}
                className="p-2"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>

              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Brain className="h-6 w-6 text-blue-600" />
                  Enhanced AI Insights
                  <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Premium
                  </Badge>
                </h1>
                <p className="text-sm text-gray-600">
                  AI-powered debt optimization with advanced features for {user?.full_name || 'you'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Feature Stats */}
              <div className="hidden md:flex items-center gap-4 text-xs text-gray-600">
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  <span>{featureStats.activeUsers.toLocaleString()} users</span>
                </div>
                <div className="flex items-center gap-1">
                  <Activity className="h-3 w-3" />
                  <span>{featureStats.successRate}% success rate</span>
                </div>
              </div>

              {/* Notifications */}
              {enabledFeatures.notifications && (
                <SmartNotificationSystem
                  userId={user?.id || ''}
                  onActionTaken={handleNotificationAction}
                  onNotificationDismiss={(id) => console.log('Dismissed:', id)}
                />
              )}

              {/* Quality indicator */}
              {qualityMetrics && (
                <Badge variant="outline" className="text-xs">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Quality: {qualityMetrics.professionalQualityScore}%
                </Badge>
              )}

              {/* Cache status */}
              {isStale && (
                <Badge variant="outline" className="text-xs text-amber-600">
                  Data is stale
                </Badge>
              )}

              {/* Action buttons */}
              <Button
                onClick={refreshInsights}
                variant="outline"
                size="sm"
                disabled={isRefreshing}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>

              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>

              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAdvancedMode(!showAdvancedMode)}
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {lastUpdated && (
            <p className="text-xs text-gray-500 mt-2">
              Last updated: {lastUpdated.toLocaleString('en-IN')}
              {cacheAge && ` (${Math.floor(cacheAge / 60)} minutes ago)`}
            </p>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Error State */}
        {error && !hasData && (
          <Alert className="mb-6 bg-red-50 border-red-200">
            <Brain className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {error}
              {canRetry && (
                <Button onClick={retry} variant="ghost" size="sm" className="ml-4">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry
                </Button>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Processing State */}
        {isProcessing && (
          <div className="mb-6">
            <AIProcessingStatusSection
              processingState={processingState}
              rateLimitState={{
                isLimited: false,
                fallbackAvailable: canRetry
              }}
              qualityMetrics={qualityMetrics || undefined}
              onRetry={retry}
            />
          </div>
        )}

        {/* Enhanced Features Overview Cards */}
        {debtAnalysis && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageCircle className="h-4 w-4 text-blue-600" />
                    <span className="text-sm text-blue-700">AI Coaching</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-800">24/7</p>
                  <p className="text-xs text-blue-600">Personal AI advisor</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Calculator className="h-4 w-4 text-purple-600" />
                    <span className="text-sm text-purple-700">Smart Simulation</span>
                  </div>
                  <p className="text-2xl font-bold text-purple-800">{formatCurrency(45000)}</p>
                  <p className="text-xs text-purple-600">Potential savings</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 border-green-200 bg-gradient-to-br from-green-50 to-green-100">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-700">Analytics</span>
                  </div>
                  <p className="text-2xl font-bold text-green-800">{featureStats.successRate}%</p>
                  <p className="text-xs text-green-600">Success rate</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 border-yellow-200 bg-gradient-to-br from-yellow-50 to-yellow-100">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Trophy className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm text-yellow-700">Gamification</span>
                  </div>
                  <p className="text-2xl font-bold text-yellow-800">{userProgress.consecutiveDays}</p>
                  <p className="text-xs text-yellow-600">Day streak</p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        )}

        {/* Enhanced Tabs for different sections */}
        <Tabs value={activeMainTab} onValueChange={setActiveMainTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="coaching">AI Coaching</TabsTrigger>
            <TabsTrigger value="strategy">Strategy & Simulation</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="features">Goals & Actions</TabsTrigger>
            <TabsTrigger value="gamification">Achievements</TabsTrigger>
          </TabsList>

          {/* Overview Tab - Enhanced */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* DTI Analysis */}
              {dtiAnalysis && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <DTIAnalysisCard
                    dtiData={dtiAnalysis}
                    onOptimize={handleOptimizeDTI}
                  />
                </motion.div>
              )}

              {/* Repayment Plan */}
              {repaymentPlan && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 }}
                >
                  <RepaymentPlanDisplay
                    repaymentPlan={repaymentPlan}
                    riskAssessment={riskAssessment}
                  />
                </motion.div>
              )}
            </div>

            {/* Strategy Comparison Preview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <StrategyComparisonWidget
                currentStrategy={userProgress.currentStrategy}
                onStrategySelect={handleStrategySelect}
                onSimulateStrategy={(strategy) => {
                  setActiveMainTab('strategy');
                }}
              />
            </motion.div>

            {/* Top Recommendations Preview */}
            {recommendations.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-blue-600" />
                        AI Recommendations
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setActiveMainTab('coaching')}
                      >
                        View All
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {recommendations.slice(0, 3).map((rec, index) => (
                        <div key={rec.id} className="flex items-start gap-3 p-3 border rounded-lg">
                          <Badge className="bg-blue-600 text-white text-xs">
                            {rec.priority_score}/10
                          </Badge>
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">{rec.title}</h4>
                            <p className="text-xs text-gray-600 mt-1">
                              {rec.description.substring(0, 100)}...
                            </p>
                          </div>
                          {(rec.potential_savings || rec.estimated_savings) && (
                            <div className="text-right">
                              <p className="text-sm font-medium text-green-600">
                                {formatCurrency(rec.potential_savings || rec.estimated_savings || 0)}
                              </p>
                              <p className="text-xs text-gray-500">savings</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </TabsContent>

          {/* AI Coaching Tab */}
          <TabsContent value="coaching" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* AI Coaching Interface */}
              <div className="lg:col-span-2">
                <Card className="h-[600px]">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2">
                      <MessageCircle className="h-5 w-5 text-blue-600" />
                      AI Debt Coach
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 h-[530px]">
                    {enabledFeatures.coaching && (
                      <AICoachingInterface
                        userId={user?.id || ''}
                        debtData={debtAnalysis}
                      />
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Recommendations Panel */}
              <div>
                <AIRecommendationsPanel
                  recommendations={recommendations}
                  isLoading={isLoading}
                  onDismiss={handleDismissRecommendation}
                  onImplement={handleImplementRecommendation}
                  onViewDetails={handleViewRecommendationDetails}
                  showFilters={true}
                  maxRecommendations={10}
                />
              </div>
            </div>
          </TabsContent>

          {/* Strategy & Simulation Tab */}
          <TabsContent value="strategy" className="space-y-6">
            <div className="space-y-6">
              {/* Debt Simulator */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {enabledFeatures.simulation && (
                  <DebtSimulator
                    currentMonthlyPayment={12000}
                    currentStrategy={userProgress.currentStrategy}
                    onApplyChanges={handleSimulationApply}
                  />
                )}
              </motion.div>

              {/* Optimization Suggestions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <DebtOptimizationSuggestions
                  suggestions={optimizationSuggestions}
                  isLoading={isLoading}
                  onApplySuggestion={handleApplySuggestion}
                  onSimulate={handleSimulateSuggestion}
                  maxSuggestions={10}
                />
              </motion.div>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            {enabledFeatures.analytics && (
              <EnhancedAnalyticsDashboard
                userId={user?.id || ''}
                timeRange={timeRange as any}
                onTimeRangeChange={setTimeRange}
              />
            )}
          </TabsContent>

          {/* Goals & Actions Tab */}
          <TabsContent value="features" className="space-y-6">
            <div className="space-y-6">
              {enabledFeatures.goals && (
                <AIGoalSettingInterface
                  userId={user?.id || ''}
                  debtData={debtAnalysis}
                  currentIncome={userProgress.currentIncome}
                  onGoalCreated={handleGoalCreated}
                />
              )}
            </div>
          </TabsContent>

          {/* Gamification Tab */}
          <TabsContent value="gamification" className="space-y-6">
            {enabledFeatures.gamification && (
              <DebtGameificationSystem
                userId={user?.id || ''}
                currentDebtReduced={userProgress.debtReduced}
                totalPayments={userProgress.totalPayments}
                consecutiveDays={userProgress.consecutiveDays}
                onShareAchievement={handleAchievementShare}
              />
            )}
          </TabsContent>
        </Tabs>

        {/* No Data State */}
        {!hasData && !isLoading && !isProcessing && (
          <div className="text-center py-12">
            <Brain className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-600 mb-2">Enhanced AI insights not available</h2>
            <p className="text-gray-500 mb-6">
              Generate AI-powered debt optimization insights to unlock advanced features
            </p>
            <Button onClick={fetchInsights} size="lg">
              <Sparkles className="h-4 w-4 mr-2" />
              Generate Enhanced AI Insights
            </Button>
          </div>
        )}
      </div>

      {/* Advanced Mode Panel */}
      <AnimatePresence>
        {showAdvancedMode && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="fixed right-0 top-0 h-full w-80 bg-white shadow-xl border-l z-50 overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold">Advanced Settings</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAdvancedMode(false)}
                >
                  ×
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Feature Controls</h4>
                  <div className="space-y-2">
                    {Object.entries(enabledFeatures).map(([feature, enabled]) => (
                      <div key={feature} className="flex items-center justify-between">
                        <span className="text-sm capitalize">{feature.replace('_', ' ')}</span>
                        <input
                          type="checkbox"
                          checked={enabled}
                          onChange={(e) =>
                            setEnabledFeatures(prev => ({
                              ...prev,
                              [feature]: e.target.checked
                            }))
                          }
                          className="rounded"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">AI Settings</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Processing Mode:</span>
                      <span className="text-blue-600">Enhanced</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Confidence Threshold:</span>
                      <span className="text-green-600">85%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Auto-refresh:</span>
                      <span className="text-blue-600">Enabled</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Performance Stats</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Cache hit rate:</span>
                      <span className="text-green-600">94.2%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Avg response time:</span>
                      <span className="text-blue-600">1.2s</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Success rate:</span>
                      <span className="text-green-600">98.7%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EnhancedAIInsights;