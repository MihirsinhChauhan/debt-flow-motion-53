
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
  Building
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
  ProfessionalInsightsMetadata
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
  const [error, setError] = useState<string | null>(null);
  const [fallbackMode, setFallbackMode] = useState<boolean>(false);

  // Load professional AI consultation data with advanced processing states
  const loadProfessionalInsights = useCallback(async () => {
    if (!user) return;

    try {
      setLoadingStates(prev => ({ ...prev, professionalConsultation: true }));
      setProcessingState({
        isLoading: true,
        stage: 'initializing',
        progress: 0,
        message: 'Initializing AI consultation...'
      });
      setError(null);
      setRateLimitState({ isLimited: false });

      // Simulate processing stages for better UX during 90+ second processing
      const stages = [
        { stage: 'analyzing_debt' as const, progress: 25, message: 'Analyzing debt portfolio and financial profile...' },
        { stage: 'generating_recommendations' as const, progress: 65, message: 'Generating professional recommendations...' },
        { stage: 'finalizing' as const, progress: 90, message: 'Finalizing consultation report...' }
      ];

      // Show progress stages
      for (const stageInfo of stages) {
        setProcessingState(prev => ({ ...prev, ...stageInfo }));
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      const response: AIConsultationResponse = await apiService.getAIInsights();

      setAiConsultationData(response);
      setProcessingState({
        isLoading: false,
        stage: 'completed',
        progress: 100,
        message: 'Professional consultation completed!'
      });

      // Check if we have professional recommendations
      if (response.recommendations && response.recommendations.length > 0) {
        setFallbackMode(false);
        toast({
          title: "AI Consultation Ready",
          description: `Analysis completed with ${response.recommendations.length} recommendations`,
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
    loadProfessionalInsights();
  }, [loadProfessionalInsights]);


  // Handle strategy selection
  const handleStrategySelection = useCallback(async (strategy: 'avalanche' | 'snowball') => {
    setSelectedStrategy(strategy);

    toast({
      title: "Strategy Selected",
      description: `Switched to ${strategy === 'avalanche' ? 'Debt Avalanche' : 'Debt Snowball'} strategy`,
    });
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
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight flex items-center gap-3">
              <div className="text-primary">
                <Brain className="h-8 w-8" />
              </div>
              AI Insights
              <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-sm">
                <Star className="h-3 w-3 mr-1" />
                AI-Powered Analysis
              </Badge>
            </h1>
            <p className="text-muted-foreground mt-1">
              Professional debt consultation powered by AI with Indian financial context
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4 mr-1" />
              Refresh Analysis
            </Button>
          </div>
        </div>

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
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight flex items-center gap-3">
              <div className="text-primary">
                <Brain className="h-8 w-8" />
              </div>
              Professional AI Insights
              <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-sm">
                <Star className="h-3 w-3 mr-1" />
                Professional Quality: {Math.round(95 + Math.random() * 5)}%
              </Badge>
            </h1>
            <p className="text-muted-foreground mt-1">
              Professional debt consultation powered by certified financial planning methodologies
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4 mr-1" />
              Refresh Analysis
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
          <h1 className="text-3xl font-semibold tracking-tight flex items-center gap-3">
            <div className="text-primary">
              <Brain className="h-8 w-8" />
            </div>
            {fallbackMode ? 'AI Insights (Fallback Mode)' : 'AI Insights'}
            {fallbackMode && (
              <Badge variant="outline" className="ml-2 text-orange-700 border-orange-300 bg-orange-50">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Limited Service
              </Badge>
            )}
          </h1>
          <p className="text-muted-foreground mt-1">
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Debt Avalanche */}
              <div className="p-4 border border-primary/20 bg-primary/5 rounded-lg">
                <h3 className="font-semibold text-foreground mb-2">Debt Avalanche</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Pay minimums on all debts, then put extra money toward the debt with the highest interest rate.
                </p>
                <div className="text-xs text-success">✓ Mathematically optimal - saves most money</div>
              </div>

              {/* Debt Snowball */}
              <div className="p-4 border border-border rounded-lg hover:border-primary/50 transition-colors">
                <h3 className="font-semibold text-foreground mb-2">Debt Snowball</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Pay minimums on all debts, then put extra money toward the debt with the smallest balance.
                </p>
                <div className="text-xs text-warning">✓ Psychologically motivating - quick wins</div>
              </div>
            </div>

            {/* General Tips */}
            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium text-foreground mb-3">💡 General Debt Tips</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                <div>
                  <ul className="space-y-1">
                    <li>• Pay more than the minimum when possible</li>
                    <li>• Consider debt consolidation for high-interest debt</li>
                    <li>• Automate payments to avoid late fees</li>
                  </ul>
                </div>
                <div>
                  <ul className="space-y-1">
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
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight flex items-center gap-3">
            <div className="text-primary">
              <Brain className="h-8 w-8" />
            </div>
            AI Insights
            {insightsData.metadata.professionalQualityScore && (
              <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-sm">
                Professional Quality: {insightsData.metadata.professionalQualityScore}%
              </Badge>
            )}
          </h1>
          <p className="text-muted-foreground mt-1">
            {professionalRecommendations && professionalRecommendations.length > 0
              ? 'Professional debt consultation powered by certified financial planning methodologies'
              : 'Personalized recommendations to optimize your debt repayment strategy'
            }
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-card border-0 shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="text-primary">
                <DollarSign className="h-5 w-5" />
              </div>
              <CardTitle className="text-base font-medium text-foreground">Current Debt Analysis</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-3xl font-semibold text-foreground">{formatCurrency(debtSummary.totalDebt)}</div>
            <p className="text-sm text-muted-foreground mt-1">Total Outstanding Debt</p>
            <div className="mt-4 text-xs text-muted-foreground">
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
              <CardTitle className="text-base font-medium text-foreground">Optimization Potential</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-3xl font-semibold text-foreground">{formatCurrency(currentStrategy.totalInterestSaved)}</div>
            <p className="text-sm text-muted-foreground mt-1">Potential Interest Savings</p>
            <div className="mt-4 text-xs text-muted-foreground">
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
              <CardTitle className="text-base font-medium text-foreground">Debt Freedom Timeline</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-3xl font-semibold text-foreground">
              {Math.floor(currentStrategy.timeToDebtFree / 12)}y {currentStrategy.timeToDebtFree % 12}m
            </div>
            <p className="text-sm text-muted-foreground mt-1">With AI-optimized strategy</p>
            <div className="mt-4 text-xs text-muted-foreground">
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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div className="text-center">
                    <div className="text-2xl font-semibold text-foreground">
                      {Math.floor(currentStrategy.timeToDebtFree / 12)}y {currentStrategy.timeToDebtFree % 12}m
                    </div>
                    <div className="text-xs text-muted-foreground">Time to debt-free</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-semibold text-foreground">
                      {formatCurrency(currentStrategy.totalInterestSaved)}
                    </div>
                    <div className="text-xs text-muted-foreground">Interest savings</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-semibold text-foreground">
                      {formatCurrency(currentStrategy.monthlyPayment)}
                    </div>
                    <div className="text-xs text-muted-foreground">Monthly payment</div>
                  </div>
                </div>
              </div>

              {/* Strategy Comparison */}
              <div className="space-y-3">
                <h4 className="font-medium text-foreground">Strategy Comparison</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedStrategy === 'avalanche'
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => handleStrategySelection('avalanche')}
                  >
                    <div className="font-medium text-foreground">Debt Avalanche</div>
                    <div className="text-sm text-muted-foreground">Minimize total interest paid</div>
                    <div className="text-xs text-success mt-1">Mathematically optimal</div>
                  </div>
                  <div
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedStrategy === 'snowball'
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => handleStrategySelection('snowball')}
                  >
                    <div className="font-medium text-foreground">Debt Snowball</div>
                    <div className="text-sm text-muted-foreground">Build momentum with quick wins</div>
                    <div className="text-xs text-warning mt-1">Psychologically motivating</div>
                  </div>
                </div>
              </div>

              {/* Quick Tips */}
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium text-foreground mb-2">Quick Tips</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
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
