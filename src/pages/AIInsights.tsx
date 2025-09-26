// AI Insights Page - Comprehensive debt optimization insights with AI recommendations
// Full-featured page for viewing and managing AI-powered debt optimization strategies

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Brain,
  RefreshCw,
  Download,
  Share2,
  Settings,
  TrendingUp,
  Target,
  Clock,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Filter,
  BarChart3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

// Import AI components
import useAIInsights from '@/hooks/useAIInsights';
import AIRecommendationsPanel from '@/components/insights/AIRecommendationsPanel';
import DTIAnalysisCard from '@/components/insights/DTIAnalysisCard';
import DebtOptimizationSuggestions from '@/components/insights/DebtOptimizationSuggestions';
import RepaymentPlanDisplay from '@/components/insights/RepaymentPlanDisplay';
import AIProcessingStatusSection from '@/components/insights/AIProcessingStatusSection';

// Types
import { RecommendationItem, DebtOptimizationSuggestion } from '@/types/ai-insights';

const AIInsights: React.FC = () => {
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

  const [activeTab, setActiveTab] = useState('overview');

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
    return recommendations.map((rec, index) => ({
      id: rec.id,
      name: rec.title,
      description: rec.description,
      timeToDebtFree: 24, // Default value, should come from backend
      totalInterestSaved: rec.potential_savings || rec.estimated_savings || 0,
      monthlyPaymentIncrease: 5000, // Default value, should come from backend
      implementationSteps: rec.action_steps || [
        'Review your current debt portfolio',
        'Implement the recommended strategy',
        'Monitor progress monthly'
      ],
      priority: rec.priority_score >= 8 ? 'high' : rec.priority_score >= 5 ? 'medium' : 'low',
      category: rec.recommendation_type.includes('payment') ? 'payment_increase' :
               rec.recommendation_type.includes('consolidation') ? 'consolidation' :
               rec.recommendation_type.includes('refinanc') ? 'refinancing' : 'strategy_change',
      difficulty: rec.implementation_difficulty || 'moderate',
      riskLevel: 'low',
      estimatedSavings: rec.potential_savings || rec.estimated_savings,
      timeline: rec.timeline || '3-6 months',
      benefits: rec.benefits || [],
      considerations: rec.risk_factors || []
    }));
  };

  const optimizationSuggestions = convertToOptimizationSuggestions(recommendations);

  // Handle recommendation actions
  const handleDismissRecommendation = async (recommendationId: string) => {
    // TODO: Implement dismiss recommendation API call
    console.log('Dismissing recommendation:', recommendationId);
  };

  const handleImplementRecommendation = async (recommendation: RecommendationItem) => {
    // TODO: Implement recommendation implementation flow
    console.log('Implementing recommendation:', recommendation);
  };

  const handleViewRecommendationDetails = (recommendation: RecommendationItem) => {
    // TODO: Open detailed recommendation modal or page
    console.log('Viewing recommendation details:', recommendation);
  };

  const handleApplySuggestion = (suggestion: DebtOptimizationSuggestion) => {
    // TODO: Implement suggestion application flow
    console.log('Applying suggestion:', suggestion);
  };

  const handleSimulateSuggestion = (suggestion: DebtOptimizationSuggestion) => {
    // TODO: Open simulation modal or navigate to simulation page
    console.log('Simulating suggestion:', suggestion);
  };

  const handleOptimizeDTI = () => {
    // TODO: Navigate to DTI optimization flow
    console.log('Optimizing DTI');
  };

  // Share insights
  const handleShareInsights = () => {
    // TODO: Implement sharing functionality
    console.log('Sharing insights');
  };

  // Download insights report
  const handleDownloadReport = () => {
    // TODO: Implement PDF report generation
    console.log('Downloading report');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-background border-b px-6 py-4">
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
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Brain className="h-6 w-6 text-blue-600" />
                AI Insights
              </h1>
              <p className="text-sm text-muted-foreground">
                AI-powered debt optimization strategies for {user?.full_name || 'your portfolio'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Quality indicator */}
            {qualityMetrics && (
              <Badge variant="outline" className="text-xs">
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

            <Button onClick={handleDownloadReport} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>

            <Button onClick={handleShareInsights} variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </div>

        {lastUpdated && (
          <p className="text-xs text-muted-foreground mt-2">
            Last updated: {lastUpdated.toLocaleString('en-IN')}
            {cacheAge && ` (${Math.floor(cacheAge / 60)} minutes ago)`}
          </p>
        )}
      </div>

      {/* Main Content */}
      <div className="px-6 py-6 max-w-7xl mx-auto">
        {/* Error State */}
        {error && !hasData && (
          <Alert className="mb-6 bg-red-50 border-red-200">
            <AlertCircle className="h-4 w-4 text-red-600" />
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

        {/* Overview Cards */}
        {debtAnalysis && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="h-4 w-4 text-gray-600" />
                    <span className="text-sm text-gray-600">Total Debt</span>
                  </div>
                  <p className="text-2xl font-bold">
                    {formatCurrency(debtAnalysis.total_debt)}
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 className="h-4 w-4 text-gray-600" />
                    <span className="text-sm text-gray-600">Avg. Interest</span>
                  </div>
                  <p className="text-2xl font-bold">
                    {debtAnalysis.average_interest_rate.toFixed(1)}%
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="h-4 w-4 text-gray-600" />
                    <span className="text-sm text-gray-600">Debt Count</span>
                  </div>
                  <p className="text-2xl font-bold">
                    {debtAnalysis.debt_count}
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-gray-600" />
                    <span className="text-sm text-gray-600">High Priority</span>
                  </div>
                  <p className="text-2xl font-bold">
                    {debtAnalysis.high_priority_count}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        )}

        {/* Tabs for different sections */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            <TabsTrigger value="optimization">Optimization</TabsTrigger>
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
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

            {/* Top Recommendations Preview */}
            {recommendations.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Top Recommendations</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setActiveTab('recommendations')}
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

          {/* Recommendations Tab */}
          <TabsContent value="recommendations">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <AIRecommendationsPanel
                recommendations={recommendations}
                isLoading={isLoading}
                onDismiss={handleDismissRecommendation}
                onImplement={handleImplementRecommendation}
                onViewDetails={handleViewRecommendationDetails}
                showFilters={true}
                maxRecommendations={20}
              />
            </motion.div>
          </TabsContent>

          {/* Optimization Tab */}
          <TabsContent value="optimization">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <DebtOptimizationSuggestions
                suggestions={optimizationSuggestions}
                isLoading={isLoading}
                onApplySuggestion={handleApplySuggestion}
                onSimulate={handleSimulateSuggestion}
                maxSuggestions={10}
              />
            </motion.div>
          </TabsContent>

          {/* Analysis Tab */}
          <TabsContent value="analysis" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* DTI Analysis */}
              {dtiAnalysis && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <DTIAnalysisCard
                    dtiData={dtiAnalysis}
                    onOptimize={handleOptimizeDTI}
                    showDetails={true}
                  />
                </motion.div>
              )}

              {/* Risk Assessment */}
              {riskAssessment && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-amber-600" />
                        Risk Assessment
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Risk Level</span>
                        <Badge
                          className={
                            riskAssessment.level === 'low' ? 'bg-green-600' :
                            riskAssessment.level === 'moderate' ? 'bg-yellow-600' :
                            'bg-red-600'
                          }
                        >
                          {riskAssessment.level.toUpperCase()}
                        </Badge>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Risk Factors</h4>
                        <ul className="space-y-1">
                          {riskAssessment.factors.map((factor, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm">
                              <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-700">{factor}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Mitigation Strategies</h4>
                        <ul className="space-y-1">
                          {riskAssessment.mitigation_strategies.map((strategy, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm">
                              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-700">{strategy}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* No Data State */}
        {!hasData && !isLoading && !isProcessing && (
          <div className="text-center py-12">
            <Brain className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-600 mb-2">No AI insights available</h2>
            <p className="text-gray-500 mb-6">
              Generate AI-powered debt optimization insights to see personalized recommendations
            </p>
            <Button onClick={fetchInsights}>
              <Brain className="h-4 w-4 mr-2" />
              Generate AI Insights
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIInsights;