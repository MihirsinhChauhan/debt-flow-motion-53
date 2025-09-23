import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Brain,
  Star,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Building,
  IndianRupee,
  Lightbulb,
  Target,
  Shield,
  ChevronRight,
  Award
} from 'lucide-react';
import { ProfessionalRecommendation } from '@/types/ai-insights';

interface ProfessionalConsultationDisplayProps {
  recommendations: ProfessionalRecommendation[];
  debtAnalysis: {
    total_debt: number;
    debt_count: number;
    average_interest_rate: number;
    total_minimum_payments: number;
    high_priority_count: number;
  };
  metadata: {
    processing_time: number;
    fallback_used: boolean;
    errors: string[];
  };
  className?: string;
}

const ProfessionalConsultationDisplay: React.FC<ProfessionalConsultationDisplayProps> = ({
  recommendations,
  debtAnalysis,
  metadata,
  className
}) => {
  // Format currency in Indian Rupees
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Get priority color and icon
  const getPriorityBadge = (score: number) => {
    if (score >= 8) {
      return { variant: 'destructive' as const, label: 'High Priority', icon: AlertTriangle };
    } else if (score >= 6) {
      return { variant: 'default' as const, label: 'Medium Priority', icon: Clock };
    } else {
      return { variant: 'secondary' as const, label: 'Low Priority', icon: CheckCircle };
    }
  };

  // Get difficulty badge
  const getDifficultyBadge = (difficulty?: string) => {
    switch (difficulty) {
      case 'easy':
        return { variant: 'secondary' as const, label: 'Easy', color: 'text-green-600 bg-green-50 border-green-200' };
      case 'moderate':
        return { variant: 'default' as const, label: 'Moderate', color: 'text-yellow-600 bg-yellow-50 border-yellow-200' };
      case 'complex':
        return { variant: 'destructive' as const, label: 'Complex', color: 'text-red-600 bg-red-50 border-red-200' };
      default:
        return { variant: 'secondary' as const, label: 'Standard', color: 'text-gray-600 bg-gray-50 border-gray-200' };
    }
  };

  // Calculate total potential savings
  const totalPotentialSavings = recommendations.reduce((sum, rec) =>
    sum + (rec.potential_savings || rec.estimated_savings || 0), 0
  );

  // Sort recommendations by priority score
  const sortedRecommendations = [...recommendations].sort((a, b) => b.priority_score - a.priority_score);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Professional Consultation Header */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-background">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Brain className="h-6 w-6 text-primary" />
                </div>
                Professional AI Consultation
                {!metadata.fallback_used && (
                  <Badge className="bg-green-50 text-green-700 border-green-200">
                    <Award className="h-3 w-3 mr-1" />
                    AI-Generated
                  </Badge>
                )}
              </CardTitle>
              <p className="text-muted-foreground mt-2">
                {metadata.fallback_used
                  ? 'Expert-curated recommendations during AI rate limiting'
                  : 'Personalized debt optimization powered by certified financial planning methodologies'
                }
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">
                Processing time: {metadata.processing_time.toFixed(1)}s
              </div>
              {metadata.fallback_used && (
                <Badge variant="outline" className="mt-1">
                  <Shield className="h-3 w-3 mr-1" />
                  Fallback Mode
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Debt Analysis Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
              <IndianRupee className="h-6 w-6 text-blue-600 mx-auto mb-2" />
              <div className="text-lg font-semibold text-blue-800">
                {formatCurrency(debtAnalysis.total_debt)}
              </div>
              <div className="text-xs text-blue-600">Total Debt</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
              <TrendingUp className="h-6 w-6 text-green-600 mx-auto mb-2" />
              <div className="text-lg font-semibold text-green-800">
                {formatCurrency(totalPotentialSavings)}
              </div>
              <div className="text-xs text-green-600">Potential Savings</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg border border-purple-200">
              <Building className="h-6 w-6 text-purple-600 mx-auto mb-2" />
              <div className="text-lg font-semibold text-purple-800">
                {debtAnalysis.debt_count}
              </div>
              <div className="text-xs text-purple-600">Active Debts</div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg border border-orange-200">
              <Target className="h-6 w-6 text-orange-600 mx-auto mb-2" />
              <div className="text-lg font-semibold text-orange-800">
                {debtAnalysis.average_interest_rate.toFixed(1)}%
              </div>
              <div className="text-xs text-orange-600">Avg Interest Rate</div>
            </div>
          </div>

          {/* Indian Banking Context */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Building className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Indian Banking Context</span>
            </div>
            <p className="text-xs text-blue-700">
              Recommendations optimized for major Indian banks (HDFC, ICICI, SBI, Axis) and RBI regulations.
              All savings calculated in Indian Rupees with local financial practices considered.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Professional Recommendations */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Star className="h-5 w-5 text-primary" />
          Priority-Ranked Recommendations ({sortedRecommendations.length})
        </h3>

        {sortedRecommendations.map((recommendation, index) => {
          const priorityBadge = getPriorityBadge(recommendation.priority_score);
          const difficultyBadge = getDifficultyBadge(recommendation.implementation_difficulty);
          const PriorityIcon = priorityBadge.icon;

          return (
            <Card key={recommendation.id} className="border-l-4 border-l-primary/30 hover:border-l-primary transition-colors">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Lightbulb className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-foreground">{recommendation.title}</h4>
                          <Badge variant={priorityBadge.variant} className="text-xs">
                            <PriorityIcon className="h-3 w-3 mr-1" />
                            {priorityBadge.label}
                          </Badge>
                          <Badge className={`text-xs ${difficultyBadge.color}`}>
                            {difficultyBadge.label}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          {recommendation.description}
                        </p>
                      </div>
                    </div>

                    {/* Potential Savings */}
                    {(recommendation.potential_savings || recommendation.estimated_savings) && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                        <div className="flex items-center gap-2 mb-1">
                          <IndianRupee className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium text-green-800">Potential Savings</span>
                        </div>
                        <div className="text-lg font-semibold text-green-700">
                          {formatCurrency(recommendation.potential_savings || recommendation.estimated_savings || 0)}
                        </div>
                      </div>
                    )}

                    {/* Professional Reasoning */}
                    {recommendation.professional_reasoning && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Brain className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium text-blue-800">Professional Analysis</span>
                        </div>
                        <p className="text-sm text-blue-700">{recommendation.professional_reasoning}</p>
                      </div>
                    )}

                    {/* Action Steps */}
                    {recommendation.action_steps && recommendation.action_steps.length > 0 && (
                      <div className="space-y-2">
                        <h5 className="text-sm font-medium text-foreground flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-success" />
                          Implementation Steps
                        </h5>
                        <div className="space-y-1">
                          {recommendation.action_steps.map((step, stepIndex) => (
                            <div key={stepIndex} className="flex items-center gap-2 text-sm text-muted-foreground">
                              <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                              <span>{step}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Priority Score */}
                  <div className="text-center ml-4">
                    <div className="text-2xl font-bold text-primary">{recommendation.priority_score}</div>
                    <div className="text-xs text-muted-foreground">Priority Score</div>
                  </div>
                </div>
              </CardHeader>

              {/* Additional Details */}
              <CardContent className="pt-0">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Benefits */}
                  {recommendation.benefits && recommendation.benefits.length > 0 && (
                    <div>
                      <h6 className="text-xs font-medium text-success mb-2 flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Benefits
                      </h6>
                      <div className="space-y-1">
                        {recommendation.benefits.slice(0, 3).map((benefit, i) => (
                          <div key={i} className="text-xs text-muted-foreground">• {benefit}</div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Risk Factors */}
                  {recommendation.risk_factors && recommendation.risk_factors.length > 0 && (
                    <div>
                      <h6 className="text-xs font-medium text-warning mb-2 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        Risk Factors
                      </h6>
                      <div className="space-y-1">
                        {recommendation.risk_factors.slice(0, 3).map((risk, i) => (
                          <div key={i} className="text-xs text-muted-foreground">• {risk}</div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Timeline & Ideal For */}
                  <div>
                    {recommendation.timeline && (
                      <div className="mb-3">
                        <h6 className="text-xs font-medium text-primary mb-1 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Timeline
                        </h6>
                        <div className="text-xs text-muted-foreground">{recommendation.timeline}</div>
                      </div>
                    )}
                    {recommendation.ideal_for && recommendation.ideal_for.length > 0 && (
                      <div>
                        <h6 className="text-xs font-medium text-blue-600 mb-1 flex items-center gap-1">
                          <Target className="h-3 w-3" />
                          Ideal For
                        </h6>
                        <div className="text-xs text-muted-foreground">
                          {recommendation.ideal_for.slice(0, 2).join(', ')}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Button */}
                <div className="mt-4 pt-4 border-t">
                  <Button variant="outline" size="sm" className="text-primary border-primary/20 hover:bg-primary/5">
                    <ChevronRight className="h-4 w-4 mr-1" />
                    View Implementation Guide
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Consultation Summary */}
      <Card className="bg-muted/30">
        <CardContent className="pt-6">
          <div className="text-center space-y-2">
            <h4 className="font-medium text-foreground">Professional Consultation Summary</h4>
            <p className="text-sm text-muted-foreground">
              {sortedRecommendations.length} personalized recommendations with total potential savings of{' '}
              <span className="font-semibold text-success">{formatCurrency(totalPotentialSavings)}</span>
            </p>
            <div className="flex items-center justify-center gap-4 mt-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Brain className="h-3 w-3" />
                <span>AI-Powered Analysis</span>
              </div>
              <div className="flex items-center gap-1">
                <Building className="h-3 w-3" />
                <span>Indian Banking Optimized</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3" />
                <span>Professional Grade</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfessionalConsultationDisplay;