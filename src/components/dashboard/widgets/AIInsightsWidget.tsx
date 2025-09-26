// AI Insights Widget for Dashboard Integration
// Displays AI-powered debt optimization insights with loading states and error handling

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  TrendingDown,
  Calendar,
  IndianRupee,
  Clock,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  BarChart3,
  Zap,
  ArrowRight,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import useAIInsights from '@/hooks/useAIInsights';

interface AIInsightsWidgetProps {
  className?: string;
  compact?: boolean;
  showActions?: boolean;
  onViewDetails?: () => void;
}

const AIInsightsWidget: React.FC<AIInsightsWidgetProps> = ({
  className = '',
  compact = false,
  showActions = true,
  onViewDetails
}) => {
  const {
    data,
    isLoading,
    isRefreshing,
    error,
    processingState,
    qualityMetrics,
    lastUpdated,
    hasData,
    canRetry,
    isProcessing,
    cacheAge,
    isStale,
    fetchInsights,
    refreshInsights,
    retry,
    dismissError
  } = useAIInsights({ enableAutoRefresh: true, refreshInterval: 30 });

  const [showFullInsights, setShowFullInsights] = useState(false);

  // Format currency for Indian market
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Format time duration
  const formatDuration = (months: number) => {
    if (months < 12) {
      return `${months} month${months !== 1 ? 's' : ''}`;
    }
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    if (remainingMonths === 0) {
      return `${years} year${years !== 1 ? 's' : ''}`;
    }
    return `${years}y ${remainingMonths}m`;
  };

  // Get cache status badge
  const getCacheStatusBadge = () => {
    if (isProcessing) {
      return <Badge variant="secondary" className="text-xs">Processing...</Badge>;
    }
    if (isStale) {
      return <Badge variant="outline" className="text-xs">Stale</Badge>;
    }
    if (cacheAge && cacheAge < 300) { // Less than 5 minutes
      return <Badge variant="secondary" className="text-xs text-green-600">Fresh</Badge>;
    }
    return null;
  };

  // Loading state
  if (isLoading && !hasData) {
    return (
      <Card className={`w-full ${className}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Brain className="h-5 w-5 text-blue-600" />
              AI Insights
            </CardTitle>
            <Badge variant="secondary" className="text-xs">
              {processingState.stage === 'initializing' && 'Initializing...'}
              {processingState.stage === 'analyzing_debt' && 'Analyzing Debt...'}
              {processingState.stage === 'generating_recommendations' && 'Generating Recommendations...'}
              {processingState.stage === 'finalizing' && 'Finalizing...'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Analyzing your debt portfolio...</span>
              <span>{processingState.progress}%</span>
            </div>
            <Progress value={processingState.progress} className="h-2" />
          </div>

          <div className="space-y-3">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/3"></div>
            </div>
          </div>

          <Alert className="bg-blue-50 border-blue-200">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              Our AI is analyzing your debt data to provide personalized optimization strategies. This may take 60-90 seconds.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error && !hasData) {
    return (
      <Card className={`w-full ${className}`}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Brain className="h-5 w-5 text-red-600" />
            AI Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="bg-red-50 border-red-200 mb-4">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>

          <div className="flex gap-2">
            {canRetry && (
              <Button onClick={retry} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            )}
            <Button onClick={dismissError} variant="ghost" size="sm">
              Dismiss
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // No data state
  if (!hasData) {
    return (
      <Card className={`w-full ${className}`}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Brain className="h-5 w-5 text-gray-600" />
            AI Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">Get AI-powered debt optimization insights</p>
            <Button onClick={fetchInsights} size="sm">
              <Zap className="h-4 w-4 mr-2" />
              Generate Insights
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Main content with data
  const debtAnalysis = data?.debt_analysis;
  const recommendations = data?.recommendations?.slice(0, compact ? 2 : 3) || [];
  const dtiAnalysis = data?.dtiAnalysis;
  const repaymentPlan = data?.repaymentPlan;

  const topRecommendation = recommendations[0];
  const potentialSavings = topRecommendation?.potential_savings || topRecommendation?.estimated_savings;

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Brain className="h-5 w-5 text-blue-600" />
            AI Insights
            {getCacheStatusBadge()}
          </CardTitle>

          <div className="flex items-center gap-2">
            {qualityMetrics && (
              <Badge variant="outline" className="text-xs">
                Quality: {qualityMetrics.professionalQualityScore}%
              </Badge>
            )}

            {showActions && (
              <Button
                onClick={refreshInsights}
                variant="ghost"
                size="sm"
                disabled={isRefreshing}
                className="h-8 w-8 p-0"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>
            )}
          </div>
        </div>

        {lastUpdated && (
          <p className="text-xs text-muted-foreground">
            Updated {lastUpdated.toLocaleTimeString('en-IN')}
          </p>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Error overlay for existing data */}
        <AnimatePresence>
          {error && hasData && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <Alert className="bg-amber-50 border-amber-200">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-800 text-sm">
                  {error}
                  <Button onClick={dismissError} variant="ghost" size="sm" className="ml-2 h-auto p-0 text-amber-600">
                    Dismiss
                  </Button>
                </AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4">
          {debtAnalysis && (
            <>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <IndianRupee className="h-4 w-4 text-gray-600" />
                  <span className="text-sm text-gray-600">Total Debt</span>
                </div>
                <p className="text-lg font-semibold">
                  {formatCurrency(debtAnalysis.total_debt)}
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-gray-600" />
                  <span className="text-sm text-gray-600">Avg. Interest</span>
                </div>
                <p className="text-lg font-semibold">
                  {debtAnalysis.average_interest_rate.toFixed(1)}%
                </p>
              </div>
            </>
          )}
        </div>

        {/* DTI Analysis */}
        {dtiAnalysis && (
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Debt-to-Income Ratio</span>
              <Badge
                variant={dtiAnalysis.is_healthy ? "secondary" : "destructive"}
                className="text-xs"
              >
                {dtiAnalysis.is_healthy ? "Healthy" : "High Risk"}
              </Badge>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {dtiAnalysis.frontend_dti.toFixed(1)}%
            </div>
            <p className="text-xs text-gray-600">
              {formatCurrency(dtiAnalysis.total_monthly_debt_payments)} / month
            </p>
          </div>
        )}

        {/* Top Recommendation */}
        {topRecommendation && (
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-medium text-blue-900 text-sm">
                {topRecommendation.title}
              </h4>
              <Badge className="bg-blue-600 text-white text-xs">
                Priority {topRecommendation.priority_score}/10
              </Badge>
            </div>

            <p className="text-sm text-blue-800 mb-3 line-clamp-2">
              {topRecommendation.description}
            </p>

            {potentialSavings && (
              <div className="flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-700">
                  Save up to {formatCurrency(potentialSavings)}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Repayment Plan Summary */}
        {repaymentPlan && (
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-gray-600">Strategy:</span>
              <p className="font-medium">{repaymentPlan.primary_strategy.name}</p>
            </div>
            <div>
              <span className="text-gray-600">Time to debt-free:</span>
              <p className="font-medium">{formatDuration(repaymentPlan.time_to_debt_free)}</p>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        {showActions && (
          <>
            <Separator />
            <div className="flex justify-between items-center">
              <div className="text-xs text-gray-600">
                {recommendations.length} recommendation{recommendations.length !== 1 ? 's' : ''} available
              </div>

              {onViewDetails && (
                <Button
                  onClick={onViewDetails}
                  variant="ghost"
                  size="sm"
                  className="text-blue-600 hover:text-blue-700"
                >
                  View All
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              )}
            </div>
          </>
        )}

        {/* Processing indicator for refresh */}
        <AnimatePresence>
          {isRefreshing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center rounded-lg"
            >
              <div className="flex items-center gap-2 text-blue-600">
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span className="text-sm">Updating insights...</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};

export default AIInsightsWidget;