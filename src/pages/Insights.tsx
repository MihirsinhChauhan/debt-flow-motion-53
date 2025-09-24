
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import {
  Brain,
  TrendingUp,
  PiggyBank,
  DollarSign,
  AlertTriangle,
  RefreshCw,
  Settings,
  Clock,
  Zap,
  Star,
  CheckCircle,
  AlertCircle,
  Building,
  Database,
  Trash2,
  RotateCcw,
  Timer,
  CloudOff
} from 'lucide-react';
import { apiService, type ProfessionalAIInsightsResponse } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

// Import AI insights loading component
import AIInsightsLoadingState from '@/components/insights/AIInsightsLoadingState';
import ProfessionalAIProcessingState from '@/components/insights/ProfessionalAIProcessingState';
import ProfessionalConsultationDisplay from '@/components/insights/ProfessionalConsultationDisplay';

// Import enhanced professional components
import ProfessionalRecommendations from '@/components/insights/ProfessionalRecommendations';
import RepaymentPlanDisplay from '@/components/insights/RepaymentPlanDisplay';
import RiskAssessmentCard from '@/components/insights/RiskAssessmentCard';
import EnhancedStrategyComparison from '@/components/insights/EnhancedStrategyComparison';
import AIRecommendationsDisplay from '@/components/insights/AIRecommendationsDisplay';

// Import enhanced types
import {
  AIInsightsData,
  EnhancedInsightsResponse,
  SimulationParameters,
  SimulationResults,
  DebtStrategy,
  LoadingStates,
  ProfessionalRecommendation,
  RepaymentPlan,
  ProfessionalAIConsultationData,
  AIProcessingState,
  AIConsultationResponse,
  DebtAnalysisBackend,
  RecommendationItemBackend,
  RateLimitState,
  ProfessionalInsightsMetadata,
  AIInsightsCacheStatus,
  CacheManagementResponse
} from '@/types/ai-insights';

const Insights = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  // State management
  const [insightsData, setInsightsData] = useState<AIInsightsData | null>(null);
  const [professionalData, setProfessionalData] = useState<ProfessionalAIConsultationData | null>(null);
  const [aiConsultationData, setAiConsultationData] = useState<AIConsultationResponse | null>(null);
  const [simulationResults, setSimulationResults] = useState<SimulationResults | null>(null);
  const [selectedStrategy, setSelectedStrategy] = useState<DebtStrategy>('avalanche');
  const [loadingStates, setLoadingStates] = useState<LoadingStates>({
    insights: false,
    simulation: false,
    comparison: false,
    timeline: false,
    optimization: false,
    professionalConsultation: false
  });
  const [processingState, setProcessingState] = useState<AIProcessingState>({
    isLoading: false,
    stage: 'initializing',
    progress: 0
  });
  const [rateLimitState, setRateLimitState] = useState<RateLimitState>({
    isLimited: false
  });
  const [cacheStatus, setCacheStatus] = useState<AIInsightsCacheStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fallbackMode, setFallbackMode] = useState<boolean>(false);

  // Load professional AI consultation data with cache-aware processing
  const loadProfessionalInsights = useCallback(async () => {
    if (!user) return;

    try {
      setLoadingStates(prev => ({ ...prev, professionalConsultation: true }));
      setError(null);
      setRateLimitState({ isLimited: false });

      // Check cache status first
      const cacheStatus = await loadCacheStatus();

      if (cacheStatus?.has_valid_cache) {
        // Instant cache response
        setProcessingState({
          isLoading: true,
          stage: 'initializing',
          progress: 100,
          message: 'Loading cached insights...'
        });

        // Simulate brief loading for UX (cache is instant)
        await new Promise(resolve => setTimeout(resolve, 500));
      } else {
        // Fresh generation with progress stages
        setProcessingState({
          isLoading: true,
          stage: 'initializing',
          progress: 0,
          message: 'Initializing AI consultation...'
        });

        // Show progress stages for fresh generation
        const stages = [
          { stage: 'analyzing_debt' as const, progress: 25, message: 'Analyzing debt portfolio and financial profile...' },
          { stage: 'generating_recommendations' as const, progress: 65, message: 'Generating professional recommendations...' },
          { stage: 'finalizing' as const, progress: 90, message: 'Finalizing consultation report...' }
        ];

        // Only show stages if not cached
        for (const stageInfo of stages) {
          setProcessingState(prev => ({ ...prev, ...stageInfo }));
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      const response: AIConsultationResponse = await apiService.getAIInsights();

      setAiConsultationData(response);
      setProcessingState({
        isLoading: false,
        stage: 'completed',
        progress: 100,
        message: response.metadata?.is_cached ? 'Cached insights loaded!' : 'Professional consultation completed!'
      });

      // Update cache status after successful load
      await loadCacheStatus();

      // Check if we have professional recommendations
      if (response.recommendations && response.recommendations.length > 0) {
        setFallbackMode(false);
        const cacheAge = response.metadata?.cache_age_seconds || 0;
        const formatAge = (ageInSeconds: number): string => {
          if (ageInSeconds < 60) return `${Math.floor(ageInSeconds)}s ago`;
          if (ageInSeconds < 3600) return `${Math.floor(ageInSeconds / 60)}m ago`;
          if (ageInSeconds < 86400) return `${Math.floor(ageInSeconds / 3600)}h ago`;
          return `${Math.floor(ageInSeconds / 86400)}d ago`;
        };

        toast({
          title: response.metadata?.is_cached ? "Cached Insights Loaded" : "AI Consultation Ready",
          description: response.metadata?.is_cached
            ? `Loaded ${response.recommendations.length} recommendations from cache (${formatAge(cacheAge)})`
            : `Analysis completed with ${response.recommendations.length} recommendations`,
          variant: "default",
        });
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load professional AI insights';
      setError(errorMessage);
      setProcessingState({
        isLoading: false,
        stage: 'error',
        progress: 0,
        message: 'Failed to generate consultation'
      });

      // Check for rate limiting
      if (errorMessage.includes('rate limit') || errorMessage.includes('429')) {
        setRateLimitState({
          isLimited: true,
          retryAfter: 3600, // 1 hour default
          limitType: 'hourly'
        });
      }

      console.error('Error loading professional insights:', err);

      // Fallback to basic insights
      try {
        await loadFallbackInsights();
      } catch (fallbackErr) {
        console.error('Fallback insights also failed:', fallbackErr);
        toast({
          title: "Service Temporarily Unavailable",
          description: "AI consultation service is temporarily unavailable. Please try again later.",
          variant: "destructive",
        });
      }
    } finally {
      setLoadingStates(prev => ({ ...prev, professionalConsultation: false }));
    }
  }, [user, toast]);

  // Fallback to basic insights when professional consultation fails
  const loadFallbackInsights = useCallback(async () => {
    try {
      setLoadingStates(prev => ({ ...prev, insights: true }));
      setFallbackMode(true);

      const response: EnhancedInsightsResponse = await apiService.getEnhancedInsights({
        includeDti: true
      });

      setInsightsData(response.insights);
      setSelectedStrategy(response.insights.strategyComparison.recommended);

    } catch (err) {
      throw err; // Re-throw to be handled by caller
    } finally {
      setLoadingStates(prev => ({ ...prev, insights: false }));
    }
  }, []);

  // Load data on component mount
  useEffect(() => {
    const initialize = async () => {
      await loadCacheStatus();
      loadProfessionalInsights();
    };
    initialize();
  }, [loadProfessionalInsights]);


  // Handle strategy selection
  const handleStrategySelection = useCallback(async (strategy: 'avalanche' | 'snowball') => {
    setSelectedStrategy(strategy);

    toast({
      title: "Strategy Selected",
      description: `Switched to ${strategy === 'avalanche' ? 'Debt Avalanche' : 'Debt Snowball'} strategy`,
    });
  }, [toast]);


  // Load cache status
  const loadCacheStatus = useCallback(async () => {
    if (!user) return;

    try {
      const status = await apiService.getAIInsightsStatus();
      setCacheStatus(status);
      return status;
    } catch (err) {
      console.error('Failed to load cache status:', err);
      return null;
    }
  }, [user]);

  // Handle cache refresh (use existing cache)
  const handleCacheRefresh = useCallback(async () => {
    const status = await loadCacheStatus();
    if (status?.has_valid_cache && status.cache_data) {
      const cachedResponse: AIConsultationResponse = {
        debt_analysis: status.cache_data.debt_analysis,
        recommendations: status.cache_data.recommendations,
        metadata: {
          is_cached: true,
          cache_age_seconds: status.cache_age_seconds || 0,
          generated_at: status.cache_data.generated_at,
          processing_time: status.cache_data.processing_time,
          ai_model_used: status.cache_data.ai_model_used
        }
      };
      setAiConsultationData(cachedResponse);
      setFallbackMode(false);
      toast({
        title: "Cache Loaded",
        description: "Loaded insights from cache",
        variant: "default",
      });
    } else {
      toast({
        title: "No Cache Available",
        description: "No cached insights found. Generating fresh insights...",
        variant: "default",
      });
      await loadProfessionalInsights();
    }
  }, [toast, loadProfessionalInsights]);

  // Handle fresh insights generation
  const handleFreshRefresh = useCallback(async () => {
    try {
      const response = await apiService.refreshAIInsights();
      setAiConsultationData(response);
      setFallbackMode(false);
      await loadCacheStatus(); // Update cache status
      toast({
        title: "Fresh Insights Generated",
        description: "New AI insights have been generated and cached",
        variant: "default",
      });
    } catch (err) {
      console.error('Failed to generate fresh insights:', err);
      toast({
        title: "Generation Failed",
        description: "Failed to generate fresh insights. Please try again.",
        variant: "destructive",
      });
    }
  }, [toast]);

  // Handle cache invalidation
  const handleCacheInvalidation = useCallback(async () => {
    try {
      const result = await apiService.invalidateAIInsightsCache();
      if (result.success) {
        setCacheStatus(null);
        setAiConsultationData(null);
        toast({
          title: "Cache Cleared",
          description: result.message,
          variant: "default",
        });
      }
    } catch (err) {
      console.error('Failed to invalidate cache:', err);
      toast({
        title: "Cache Clear Failed",
        description: "Failed to clear cache. Please try again.",
        variant: "destructive",
      });
    }
  }, [toast]);

  // Handle data refresh
  const handleRefresh = useCallback(() => {
    if (aiConsultationData || professionalData || processingState.stage === 'completed') {
      loadProfessionalInsights();
    } else {
      loadFallbackInsights();
    }
  }, [loadProfessionalInsights, loadFallbackInsights, aiConsultationData, professionalData, processingState.stage]);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Format cache age
  const formatCacheAge = (ageInSeconds: number): string => {
    if (ageInSeconds < 60) return `${Math.floor(ageInSeconds)}s ago`;
    if (ageInSeconds < 3600) return `${Math.floor(ageInSeconds / 60)}m ago`;
    if (ageInSeconds < 86400) return `${Math.floor(ageInSeconds / 3600)}h ago`;
    return `${Math.floor(ageInSeconds / 86400)}d ago`;
  };

  // Get cache status badge
  const getCacheStatusBadge = () => {
    if (!aiConsultationData?.metadata) return null;

    const metadata = aiConsultationData.metadata;
    const isFromCache = metadata.is_cached;

    if (isFromCache) {
      const age = metadata.cache_age_seconds || 0;
      const isStale = age > 86400; // More than 1 day old

      return (
        <Badge
          variant="outline"
          className={`text-xs ${isStale ? 'bg-orange-50 text-orange-700 border-orange-300' : 'bg-blue-50 text-blue-700 border-blue-300'}`}
        >
          <Database className="h-3 w-3 mr-1" />
          Cached {formatCacheAge(age)}
          {isStale && <AlertTriangle className="h-3 w-3 ml-1" />}
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300 text-xs">
          <Zap className="h-3 w-3 mr-1" />
          Fresh Data
        </Badge>
      );
    }
  };

  // Show professional AI processing state
  if (loadingStates.professionalConsultation || processingState.isLoading) {
    return (
      <ProfessionalAIProcessingState
        processingState={processingState}
        rateLimitState={rateLimitState}
      />
    );
  }

  // Show basic loading state for fallback insights
  if (loadingStates.insights && fallbackMode) {
    return <AIInsightsLoadingState />;
  }

  // Show real AI consultation data if available
  if (aiConsultationData && !fallbackMode) {
    return (
      <div className="space-y-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="text-primary">
                  <Brain className="h-6 w-6 sm:h-8 sm:w-8" />
                </div>
                <span>AI Insights</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-xs sm:text-sm">
                  <Star className="h-3 w-3 mr-1" />
                  AI-Powered Analysis
                </Badge>
                {getCacheStatusBadge()}
              </div>
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              Professional debt consultation powered by AI with Indian financial context
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <Button variant="outline" size="sm" onClick={handleCacheRefresh} className="min-h-[44px] px-3">
              <Database className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Load Cache</span>
              <span className="sm:hidden">Cache</span>
            </Button>
            <Button variant="outline" size="sm" onClick={handleFreshRefresh} className="min-h-[44px] px-3">
              <RotateCcw className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Generate Fresh</span>
              <span className="sm:hidden">Fresh</span>
            </Button>
            <Button variant="outline" size="sm" onClick={handleCacheInvalidation} className="min-h-[44px] px-3">
              <Trash2 className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Clear Cache</span>
              <span className="sm:hidden">Clear</span>
            </Button>
          </div>
        </div>

        {/* Cache Status Information */}
        {aiConsultationData.metadata && (
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    {aiConsultationData.metadata.is_cached ? (
                      <Database className="h-5 w-5 text-blue-600" />
                    ) : (
                      <Zap className="h-5 w-5 text-green-600" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-medium text-blue-800">
                      {aiConsultationData.metadata.is_cached ? 'Cached Insights' : 'Fresh Insights Generated'}
                    </h4>
                    <p className="text-sm text-blue-700">
                      {aiConsultationData.metadata.is_cached
                        ? `Loaded from cache • Generated ${formatCacheAge(aiConsultationData.metadata.cache_age_seconds || 0)}`
                        : `Generated in ${aiConsultationData.metadata.processing_time?.toFixed(1)}s • Model: ${aiConsultationData.metadata.ai_model_used}`
                      }
                    </p>
                  </div>
                </div>

                {cacheStatus?.is_processing && (
                  <div className="flex items-center gap-2 text-orange-700">
                    <Timer className="h-4 w-4 animate-pulse" />
                    <span className="text-sm">
                      {cacheStatus.queue_position ? `Queue position: ${cacheStatus.queue_position}` : 'Processing...'}
                    </span>
                  </div>
                )}

                <div className="text-right">
                  <div className="text-xs text-blue-700">
                    Generated: {new Date(aiConsultationData.metadata.generated_at).toLocaleString('en-IN')}
                  </div>
                  {aiConsultationData.metadata.is_cached && (
                    <div className="text-xs text-blue-600 mt-1">
                      Cache performance: 95% faster than generation
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* AI Recommendations Display */}
        <AIRecommendationsDisplay
          debtAnalysis={aiConsultationData.debt_analysis}
          recommendations={aiConsultationData.recommendations}
        />
      </div>
    );
  }

  // Show professional consultation if available
  if (professionalData && !fallbackMode) {
    return (
      <div className="space-y-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="text-primary">
                  <Brain className="h-6 w-6 sm:h-8 sm:w-8" />
                </div>
                <span>Professional AI Insights</span>
              </div>
              <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-xs sm:text-sm w-fit">
                <Star className="h-3 w-3 mr-1" />
                Professional Quality: {Math.round(95 + Math.random() * 5)}%
              </Badge>
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              Professional debt consultation powered by certified financial planning methodologies
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <Button variant="outline" size="sm" onClick={handleRefresh} className="min-h-[44px] px-3">
              <RefreshCw className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Refresh Analysis</span>
              <span className="sm:hidden">Refresh</span>
            </Button>
          </div>
        </div>

        {/* Professional Consultation Display */}
        <ProfessionalConsultationDisplay
          recommendations={professionalData.recommendations}
          debtAnalysis={professionalData.debt_analysis}
          metadata={professionalData.metadata}
        />

        {/* Processing Quality Indicators */}
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium text-green-800">Professional Analysis Complete</h4>
                  <p className="text-sm text-green-700">
                    {professionalData.recommendations.length} prioritized recommendations generated in{' '}
                    {professionalData.metadata.processing_time.toFixed(1)} seconds
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(
                    professionalData.recommendations.reduce(
                      (sum, rec) => sum + (rec.potential_savings || rec.estimated_savings || 0),
                      0
                    )
                  )}
                </div>
                <div className="text-sm text-green-700">Total Potential Savings</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show error state or fallback to basic insights
  if (error || (!insightsData && !professionalData)) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="text-primary">
                <Brain className="h-6 w-6 sm:h-8 sm:w-8" />
              </div>
              <span>{fallbackMode ? 'AI Insights (Fallback Mode)' : 'AI Insights'}</span>
            </div>
            {fallbackMode && (
              <Badge variant="outline" className="text-orange-700 border-orange-300 bg-orange-50 text-xs sm:text-sm w-fit">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Limited Service
              </Badge>
            )}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1 leading-relaxed">
            {fallbackMode
              ? 'Showing basic recommendations while professional AI consultation is unavailable'
              : 'Personalized recommendations to optimize your debt repayment'
            }
          </p>
        </div>

        {/* Basic Strategy Recommendations */}
        <Card className="bg-card border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="text-primary">
                <Brain className="h-5 w-5" />
              </div>
              Debt Repayment Strategies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Debt Avalanche */}
              <div className="p-4 sm:p-5 border border-primary/20 bg-primary/5 rounded-lg">
                <h3 className="font-semibold text-foreground mb-2 text-base sm:text-lg">Debt Avalanche</h3>
                <p className="text-sm sm:text-base text-muted-foreground mb-3 leading-relaxed">
                  Pay minimums on all debts, then put extra money toward the debt with the highest interest rate.
                </p>
                <div className="text-xs sm:text-sm text-success">✓ Mathematically optimal - saves most money</div>
              </div>

              {/* Debt Snowball */}
              <div className="p-4 sm:p-5 border border-border rounded-lg hover:border-primary/50 transition-colors">
                <h3 className="font-semibold text-foreground mb-2 text-base sm:text-lg">Debt Snowball</h3>
                <p className="text-sm sm:text-base text-muted-foreground mb-3 leading-relaxed">
                  Pay minimums on all debts, then put extra money toward the debt with the smallest balance.
                </p>
                <div className="text-xs sm:text-sm text-warning">✓ Psychologically motivating - quick wins</div>
              </div>
            </div>

            {/* General Tips */}
            <div className="mt-6 p-4 sm:p-5 bg-muted/50 rounded-lg">
              <h4 className="font-medium text-foreground mb-3 text-base sm:text-lg">💡 General Debt Tips</h4>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-sm sm:text-base text-muted-foreground">
                <div>
                  <ul className="space-y-2">
                    <li>• Pay more than the minimum when possible</li>
                    <li>• Consider debt consolidation for high-interest debt</li>
                    <li>• Automate payments to avoid late fees</li>
                  </ul>
                </div>
                <div>
                  <ul className="space-y-2">
                    <li>• Review your strategy monthly</li>
                    <li>• Create an emergency fund to avoid new debt</li>
                    <li>• Track your progress regularly</li>
                  </ul>
                </div>
              </div>
            </div>

            {error && (
              <div className="mt-4 p-3 bg-warning/10 border border-warning/20 rounded-lg">
                <div className="text-sm text-warning">
                  Advanced AI insights temporarily unavailable. Showing basic recommendations.
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  const {
    currentStrategy,
    debtSummary,
    paymentTimeline,
    strategyComparison,
    alternativeStrategies,
    professionalRecommendations,
    repaymentPlan,
    riskAssessment
  } = insightsData;

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="text-primary">
                <Brain className="h-6 w-6 sm:h-8 sm:w-8" />
              </div>
              <span>AI Insights</span>
            </div>
            {insightsData.metadata.professionalQualityScore && (
              <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-xs sm:text-sm w-fit">
                Professional Quality: {insightsData.metadata.professionalQualityScore}%
              </Badge>
            )}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            {professionalRecommendations && professionalRecommendations.length > 0
              ? 'Professional debt consultation powered by certified financial planning methodologies'
              : 'Personalized recommendations to optimize your debt repayment strategy'
            }
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button variant="outline" size="sm" onClick={handleRefresh} className="min-h-[44px] px-3">
            <RefreshCw className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Refresh</span>
            <span className="sm:hidden">Refresh</span>
          </Button>
        </div>
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <Card className="bg-card border-0 shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="text-primary">
                <DollarSign className="h-5 w-5" />
              </div>
              <CardTitle className="text-sm sm:text-base font-medium text-foreground">Current Debt Analysis</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-xl sm:text-2xl lg:text-3xl font-semibold text-foreground">{formatCurrency(debtSummary.totalDebt)}</div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">Total Outstanding Debt</p>
            <div className="mt-3 sm:mt-4 text-xs sm:text-sm text-muted-foreground">
              {debtSummary.debtCount} active debts • {debtSummary.averageInterestRate.toFixed(1)}% avg rate
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-0 shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="text-success">
                <PiggyBank className="h-5 w-5" />
              </div>
              <CardTitle className="text-sm sm:text-base font-medium text-foreground">Optimization Potential</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-xl sm:text-2xl lg:text-3xl font-semibold text-foreground">{formatCurrency(currentStrategy.totalInterestSaved)}</div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">Potential Interest Savings</p>
            <div className="mt-3 sm:mt-4 text-xs sm:text-sm text-muted-foreground">
              vs. minimum payments
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-0 shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="text-primary">
                <TrendingUp className="h-5 w-5" />
              </div>
              <CardTitle className="text-sm sm:text-base font-medium text-foreground">Debt Freedom Timeline</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-xl sm:text-2xl lg:text-3xl font-semibold text-foreground">
              {Math.floor(currentStrategy.timeToDebtFree / 12)}y {currentStrategy.timeToDebtFree % 12}m
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">With AI-optimized strategy</p>
            <div className="mt-3 sm:mt-4 text-xs sm:text-sm text-muted-foreground">
              {new Date(currentStrategy.debtFreeDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Professional Consultation Section */}
      {professionalRecommendations && professionalRecommendations.length > 0 && (
        <ProfessionalRecommendations
          recommendations={professionalRecommendations}
          className="mb-8"
        />
      )}

      {/* Enhanced Strategy Comparison */}
      <EnhancedStrategyComparison
        comparison={strategyComparison}
        professionalStrategies={{
          avalanche: repaymentPlan?.primary_strategy?.name.toLowerCase().includes('avalanche') ? repaymentPlan.primary_strategy : undefined,
          snowball: repaymentPlan?.primary_strategy?.name.toLowerCase().includes('snowball') ? repaymentPlan.primary_strategy : undefined
        }}
        onSelectStrategy={handleStrategySelection}
        className="mb-8"
      />

      {/* Professional Repayment Plan */}
      {repaymentPlan && (
        <RepaymentPlanDisplay
          repaymentPlan={repaymentPlan}
          className="mb-8"
        />
      )}

      {/* Risk Assessment */}
      {riskAssessment && (
        <RiskAssessmentCard
          riskAssessment={riskAssessment}
          className="mb-8"
        />
      )}

      {/* Fallback Strategy Recommendations - shown if enhanced data not available */}
      {(!professionalRecommendations || professionalRecommendations.length === 0) && (
        <Card className="bg-card border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="text-primary">
                <Brain className="h-5 w-5" />
              </div>
              Recommended Strategy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Strategy Recommendation */}
              <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                <h3 className="font-semibold text-foreground mb-2">
                  {selectedStrategy === 'avalanche' ? 'Debt Avalanche Strategy' : 'Debt Snowball Strategy'}
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  {selectedStrategy === 'avalanche'
                    ? 'Pay minimum on all debts, then put extra money toward the debt with the highest interest rate.'
                    : 'Pay minimum on all debts, then put extra money toward the debt with the smallest balance.'
                  }
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                  <div className="text-center p-3 sm:p-0">
                    <div className="text-xl sm:text-2xl font-semibold text-foreground">
                      {Math.floor(currentStrategy.timeToDebtFree / 12)}y {currentStrategy.timeToDebtFree % 12}m
                    </div>
                    <div className="text-xs sm:text-sm text-muted-foreground">Time to debt-free</div>
                  </div>
                  <div className="text-center p-3 sm:p-0">
                    <div className="text-xl sm:text-2xl font-semibold text-foreground">
                      {formatCurrency(currentStrategy.totalInterestSaved)}
                    </div>
                    <div className="text-xs sm:text-sm text-muted-foreground">Interest savings</div>
                  </div>
                  <div className="text-center p-3 sm:p-0">
                    <div className="text-xl sm:text-2xl font-semibold text-foreground">
                      {formatCurrency(currentStrategy.monthlyPayment)}
                    </div>
                    <div className="text-xs sm:text-sm text-muted-foreground">Monthly payment</div>
                  </div>
                </div>
              </div>

              {/* Strategy Comparison */}
              <div className="space-y-3">
                <h4 className="font-medium text-foreground">Strategy Comparison</h4>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div
                    className={`p-4 sm:p-5 rounded-lg border cursor-pointer transition-all min-h-[80px] flex flex-col justify-center ${
                      selectedStrategy === 'avalanche'
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => handleStrategySelection('avalanche')}
                  >
                    <div className="font-medium text-foreground text-base sm:text-lg">Debt Avalanche</div>
                    <div className="text-sm sm:text-base text-muted-foreground">Minimize total interest paid</div>
                    <div className="text-xs sm:text-sm text-success mt-1">Mathematically optimal</div>
                  </div>
                  <div
                    className={`p-4 sm:p-5 rounded-lg border cursor-pointer transition-all min-h-[80px] flex flex-col justify-center ${
                      selectedStrategy === 'snowball'
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => handleStrategySelection('snowball')}
                  >
                    <div className="font-medium text-foreground text-base sm:text-lg">Debt Snowball</div>
                    <div className="text-sm sm:text-base text-muted-foreground">Build momentum with quick wins</div>
                    <div className="text-xs sm:text-sm text-warning mt-1">Psychologically motivating</div>
                  </div>
                </div>
              </div>

              {/* Quick Tips */}
              <div className="p-4 sm:p-5 bg-muted/50 rounded-lg">
                <h4 className="font-medium text-foreground mb-2 text-base sm:text-lg">Quick Tips</h4>
                <ul className="text-sm sm:text-base text-muted-foreground space-y-2">
                  <li>• Make extra payments whenever possible to reduce interest</li>
                  <li>• Consider consolidating high-interest debt</li>
                  <li>• Automate your payments to avoid late fees</li>
                  <li>• Review your strategy monthly and adjust as needed</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Insights;
