import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Brain,
  Clock,
  Star,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Zap,
  AlertCircle,
  Timer,
  TrendingUp
} from 'lucide-react';
import { AIProcessingState, RateLimitState, QualityMetrics } from '@/types/ai-insights';

interface AIProcessingStatusSectionProps {
  processingState: AIProcessingState;
  rateLimitState: RateLimitState;
  qualityMetrics?: QualityMetrics;
  onRetry?: () => void;
  onRefresh?: () => void;
  className?: string;
}

const AIProcessingStatusSection: React.FC<AIProcessingStatusSectionProps> = ({
  processingState,
  rateLimitState,
  qualityMetrics,
  onRetry,
  onRefresh,
  className = ''
}) => {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [estimatedRemainingTime, setEstimatedRemainingTime] = useState(90);

  // Track elapsed time during processing
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (processingState.isLoading) {
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);

        // Update estimated remaining time based on progress
        const remainingProgress = 100 - processingState.progress;
        const estimatedTotal = processingState.progress > 0
          ? (elapsedTime / processingState.progress) * 100
          : 90;
        const remaining = Math.max(0, estimatedTotal - elapsedTime);
        setEstimatedRemainingTime(Math.round(remaining));
      }, 1000);
    } else {
      setElapsedTime(0);
    }

    return () => clearInterval(interval);
  }, [processingState.isLoading, processingState.progress, elapsedTime]);

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get stage display information
  const getStageInfo = () => {
    switch (processingState.stage) {
      case 'initializing':
        return {
          icon: <Brain className="h-5 w-5" />,
          title: 'Initializing AI Consultation',
          description: 'Preparing professional financial analysis...',
          color: 'text-blue-600',
          bgColor: 'bg-blue-50 border-blue-200'
        };
      case 'analyzing_debt':
        return {
          icon: <TrendingUp className="h-5 w-5" />,
          title: 'Analyzing Debt Portfolio',
          description: 'Examining debt structure, interest rates, and payment patterns...',
          color: 'text-orange-600',
          bgColor: 'bg-orange-50 border-orange-200'
        };
      case 'generating_recommendations':
        return {
          icon: <Zap className="h-5 w-5" />,
          title: 'Generating Professional Recommendations',
          description: 'Creating personalized strategies with Indian financial context...',
          color: 'text-purple-600',
          bgColor: 'bg-purple-50 border-purple-200'
        };
      case 'finalizing':
        return {
          icon: <Star className="h-5 w-5" />,
          title: 'Finalizing Consultation Report',
          description: 'Applying quality checks and professional validation...',
          color: 'text-indigo-600',
          bgColor: 'bg-indigo-50 border-indigo-200'
        };
      case 'completed':
        return {
          icon: <CheckCircle className="h-5 w-5" />,
          title: 'Professional Consultation Complete',
          description: 'Your personalized debt optimization strategy is ready!',
          color: 'text-green-600',
          bgColor: 'bg-green-50 border-green-200'
        };
      case 'error':
        return {
          icon: <AlertCircle className="h-5 w-5" />,
          title: 'Processing Error',
          description: processingState.message || 'An error occurred during AI processing',
          color: 'text-red-600',
          bgColor: 'bg-red-50 border-red-200'
        };
      case 'rate_limited':
        return {
          icon: <AlertTriangle className="h-5 w-5" />,
          title: 'Rate Limited',
          description: 'AI service is temporarily rate-limited. Using fallback recommendations.',
          color: 'text-amber-600',
          bgColor: 'bg-amber-50 border-amber-200'
        };
      default:
        return {
          icon: <Brain className="h-5 w-5" />,
          title: 'Processing',
          description: 'Working on your consultation...',
          color: 'text-gray-600',
          bgColor: 'bg-gray-50 border-gray-200'
        };
    }
  };

  const stageInfo = getStageInfo();

  // Show rate limit state
  if (rateLimitState.isLimited) {
    return (
      <Card className={`${stageInfo.bgColor} ${className}`}>
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className={`p-2 rounded-lg bg-amber-100 ${stageInfo.color}`}>
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-amber-800 mb-2">
                AI Service Rate Limited
              </h3>
              <p className="text-sm text-amber-700 mb-4">
                The professional AI consultation service has reached its rate limit.
                {rateLimitState.retryAfter && ` Please retry in ${Math.round(rateLimitState.retryAfter / 60)} minutes.`}
              </p>

              {rateLimitState.fallbackAvailable && (
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 mb-4">
                  <p className="text-sm text-blue-700">
                    💡 We're showing expert-curated recommendations while AI processing is unavailable.
                  </p>
                </div>
              )}

              <div className="flex items-center gap-2">
                {onRetry && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onRetry}
                    disabled={rateLimitState.retryAfter ? rateLimitState.retryAfter > 0 : false}
                  >
                    <RefreshCw className="h-4 w-4 mr-1" />
                    {rateLimitState.retryAfter ? `Retry in ${Math.round(rateLimitState.retryAfter / 60)}m` : 'Retry Now'}
                  </Button>
                )}
                {rateLimitState.requestsRemaining !== undefined && (
                  <Badge variant="outline" className="text-amber-700 border-amber-300">
                    {rateLimitState.requestsRemaining} requests remaining
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show processing state
  if (processingState.isLoading || processingState.stage !== 'completed') {
    return (
      <Card className={`${stageInfo.bgColor} ${className}`}>
        <CardContent className="pt-6">
          <div className="space-y-6">
            {/* Status Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className={`p-2 rounded-lg ${stageInfo.color.replace('text-', 'bg-').replace('-600', '-100')}`}>
                  <div className={stageInfo.color}>
                    {stageInfo.icon}
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-1">
                    {stageInfo.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {stageInfo.description}
                  </p>
                </div>
              </div>

              {processingState.qualityScore && (
                <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                  <Star className="h-3 w-3 mr-1" />
                  Quality: {processingState.qualityScore}%
                </Badge>
              )}
            </div>

            {/* Progress Bar */}
            {processingState.isLoading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Processing Progress</span>
                  <span className="font-medium">{processingState.progress}%</span>
                </div>
                <Progress
                  value={processingState.progress}
                  className="h-2"
                />
              </div>
            )}

            {/* Time Information */}
            {processingState.isLoading && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Timer className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Elapsed:</span>
                  <span className="font-medium">{formatTime(elapsedTime)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Est. Remaining:</span>
                  <span className="font-medium">{formatTime(estimatedRemainingTime)}</span>
                </div>
              </div>
            )}

            {/* Processing Notes */}
            <div className="p-3 bg-muted/50 rounded-lg">
              <h4 className="font-medium text-foreground mb-2 text-sm">🔍 What's Happening</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Analyzing your debt portfolio for optimization opportunities</li>
                <li>• Applying Indian banking context and financial regulations</li>
                <li>• Generating personalized recommendations with savings calculations</li>
                <li>• Quality-checking advice against professional standards</li>
              </ul>
            </div>

            {processingState.fallbackUsed && (
              <div className="p-3 bg-warning/10 border border-warning/20 rounded-lg">
                <p className="text-sm text-warning">
                  ⚠️ Using enhanced fallback recommendations while AI processing completes.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show completion state with quality metrics
  if (processingState.stage === 'completed' && qualityMetrics) {
    return (
      <Card className={`${stageInfo.bgColor} ${className}`}>
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-green-800 mb-1">
                  Professional Analysis Complete
                </h3>
                <p className="text-sm text-green-700">
                  {stageInfo.description}
                </p>
              </div>
            </div>

            <div className="text-right">
              <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 mb-2">
                <Star className="h-3 w-3 mr-1" />
                Quality: {qualityMetrics.professionalQualityScore}%
              </Badge>
              <div className="text-sm text-muted-foreground">
                Processed in {qualityMetrics.processingTime.toFixed(1)}s
              </div>
            </div>
          </div>

          {/* Quality Indicators */}
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div className="text-center">
              <div className="font-medium text-foreground">
                {qualityMetrics.recommendationConfidence}%
              </div>
              <div className="text-xs text-muted-foreground">Confidence</div>
            </div>
            <div className="text-center">
              <div className="font-medium text-foreground">
                {qualityMetrics.dataFreshness}
              </div>
              <div className="text-xs text-muted-foreground">Data Freshness</div>
            </div>
            <div className="text-center">
              <div className="font-medium text-foreground">
                {qualityMetrics.indianContextIncluded ? '✓' : '○'}
              </div>
              <div className="text-xs text-muted-foreground">Indian Context</div>
            </div>
            <div className="text-center">
              <div className="font-medium text-foreground">
                {qualityMetrics.fallbackUsed ? 'Enhanced' : 'Full AI'}
              </div>
              <div className="text-xs text-muted-foreground">Generation</div>
            </div>
          </div>

          {onRefresh && (
            <div className="mt-4 pt-4 border-t border-green-200">
              <Button variant="outline" size="sm" onClick={onRefresh}>
                <RefreshCw className="h-4 w-4 mr-1" />
                Refresh Analysis
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return null;
};

export default AIProcessingStatusSection;