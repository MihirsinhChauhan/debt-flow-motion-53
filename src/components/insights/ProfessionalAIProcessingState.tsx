import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Brain,
  Clock,
  Zap,
  CheckCircle,
  AlertCircle,
  Star,
  Building,
  TrendingUp
} from 'lucide-react';
import { AIProcessingState, RateLimitState } from '@/types/ai-insights';

interface ProfessionalAIProcessingStateProps {
  processingState: AIProcessingState;
  rateLimitState?: RateLimitState;
  className?: string;
}

const ProfessionalAIProcessingState: React.FC<ProfessionalAIProcessingStateProps> = ({
  processingState,
  rateLimitState,
  className
}) => {
  const getStageIcon = (stage: string) => {
    switch (stage) {
      case 'initializing':
        return <Brain className="h-5 w-5 animate-pulse" />;
      case 'analyzing_debt':
        return <TrendingUp className="h-5 w-5 animate-bounce" />;
      case 'generating_recommendations':
        return <Zap className="h-5 w-5 animate-spin" />;
      case 'finalizing':
        return <Star className="h-5 w-5 animate-pulse" />;
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-success" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-destructive" />;
      default:
        return <Brain className="h-5 w-5" />;
    }
  };

  const getStageTitle = (stage: string) => {
    switch (stage) {
      case 'initializing':
        return 'Initializing AI Consultation';
      case 'analyzing_debt':
        return 'Analyzing Debt Portfolio';
      case 'generating_recommendations':
        return 'Generating Professional Recommendations';
      case 'finalizing':
        return 'Finalizing Consultation Report';
      case 'completed':
        return 'Professional Consultation Complete';
      case 'error':
        return 'Consultation Error';
      default:
        return 'Processing...';
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress < 30) return 'bg-blue-500';
    if (progress < 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  if (rateLimitState?.isLimited) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="text-center py-12">
          <Card className="max-w-md mx-auto border-orange-200 bg-orange-50">
            <CardHeader>
              <div className="mx-auto w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
              <CardTitle className="text-center text-orange-800">
                AI Service Rate Limited
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-orange-700">
                Professional AI consultation is temporarily rate-limited.
              </p>
              <div className="bg-orange-100 rounded-lg p-3">
                <p className="text-sm text-orange-800">
                  Retry in: {Math.ceil((rateLimitState.retryAfter || 3600) / 60)} minutes
                </p>
                <p className="text-xs text-orange-600 mt-1">
                  Limit type: {rateLimitState.limitType || 'hourly'}
                </p>
              </div>
              <p className="text-sm text-orange-600">
                Showing expert-curated recommendations instead.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (processingState.stage === 'error') {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="text-center py-12">
          <Card className="max-w-md mx-auto border-red-200 bg-red-50">
            <CardHeader>
              <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <CardTitle className="text-center text-red-800">
                Consultation Error
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-red-700">
                {processingState.message || 'Failed to generate professional consultation'}
              </p>
              <p className="text-sm text-red-600">
                Falling back to basic recommendations...
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight flex items-center justify-center gap-3">
          <div className="text-primary">
            <Brain className="h-8 w-8" />
          </div>
          Professional AI Consultation
          <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
            <Building className="h-3 w-3 mr-1" />
            Indian Banking
          </Badge>
        </h1>
        <p className="text-muted-foreground">
          Generating personalized debt optimization strategies using certified financial planning methodologies
        </p>
      </div>

      {/* Main Processing Card */}
      <Card className="max-w-2xl mx-auto border-primary/20 bg-gradient-to-br from-primary/5 to-background">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            {getStageIcon(processingState.stage)}
          </div>
          <CardTitle className="text-xl text-primary">
            {getStageTitle(processingState.stage)}
          </CardTitle>
          {processingState.message && (
            <p className="text-muted-foreground mt-2">
              {processingState.message}
            </p>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span className="font-medium">{processingState.progress}%</span>
            </div>
            <Progress
              value={processingState.progress}
              className="h-3"
            />
          </div>

          {/* Processing Stages */}
          <div className="space-y-3">
            <h4 className="font-medium text-foreground">AI Processing Stages</h4>
            <div className="space-y-2">
              {[
                { key: 'initializing', label: 'Initialization', progress: 0 },
                { key: 'analyzing_debt', label: 'Debt Portfolio Analysis', progress: 25 },
                { key: 'generating_recommendations', label: 'Professional Recommendations', progress: 65 },
                { key: 'finalizing', label: 'Report Finalization', progress: 90 }
              ].map((stage) => {
                const isActive = processingState.stage === stage.key;
                const isCompleted = processingState.progress > stage.progress;

                return (
                  <div
                    key={stage.key}
                    className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-primary/10 border border-primary/20'
                        : isCompleted
                          ? 'bg-success/10'
                          : 'bg-muted/50'
                    }`}
                  >
                    <div className={`w-2 h-2 rounded-full ${
                      isActive
                        ? 'bg-primary animate-pulse'
                        : isCompleted
                          ? 'bg-success'
                          : 'bg-muted-foreground/30'
                    }`} />
                    <span className={`text-sm ${
                      isActive
                        ? 'text-primary font-medium'
                        : isCompleted
                          ? 'text-success'
                          : 'text-muted-foreground'
                    }`}>
                      {stage.label}
                    </span>
                    {isActive && (
                      <Zap className="h-3 w-3 text-primary animate-pulse ml-auto" />
                    )}
                    {isCompleted && !isActive && (
                      <CheckCircle className="h-3 w-3 text-success ml-auto" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Processing Info */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Estimated completion: 60-90 seconds</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Star className="h-4 w-4" />
              <span>Professional-grade analysis in progress</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Building className="h-4 w-4" />
              <span>Optimized for Indian banking systems (HDFC, ICICI, SBI, Axis)</span>
            </div>
          </div>

          {/* Quality Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
              <Brain className="h-6 w-6 text-blue-600 mx-auto mb-2" />
              <div className="text-sm font-medium text-blue-800">AI-Powered</div>
              <div className="text-xs text-blue-600">Advanced algorithms</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
              <Star className="h-6 w-6 text-green-600 mx-auto mb-2" />
              <div className="text-sm font-medium text-green-800">Professional</div>
              <div className="text-xs text-green-600">Certified methodologies</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg border border-purple-200">
              <Building className="h-6 w-6 text-purple-600 mx-auto mb-2" />
              <div className="text-sm font-medium text-purple-800">India-Specific</div>
              <div className="text-xs text-purple-600">Local banking context</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Info */}
      <div className="text-center text-sm text-muted-foreground space-y-1">
        <p>This professional consultation includes DTI analysis, risk assessment, and Indian banking optimization.</p>
        <p>Results will include priority-sorted recommendations with potential savings in ₹ (Indian Rupees).</p>
      </div>
    </div>
  );
};

export default ProfessionalAIProcessingState;