import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Brain,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Target,
  Lightbulb,
  ArrowRight,
  Star
} from 'lucide-react';
import { ProfessionalRecommendation } from '@/types/ai-insights';

interface ProfessionalRecommendationsProps {
  recommendations: ProfessionalRecommendation[];
  className?: string;
}

const ProfessionalRecommendations: React.FC<ProfessionalRecommendationsProps> = ({
  recommendations,
  className = ''
}) => {
  const [expandedRecommendation, setExpandedRecommendation] = useState<string | null>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getPriorityColor = (score: number) => {
    if (score >= 8) return 'bg-red-100 text-red-800 border-red-200';
    if (score >= 6) return 'bg-orange-100 text-orange-800 border-orange-200';
    if (score >= 4) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-green-100 text-green-800 border-green-200';
  };

  const getPriorityLabel = (score: number) => {
    if (score >= 8) return 'Critical';
    if (score >= 6) return 'High Priority';
    if (score >= 4) return 'Medium Priority';
    return 'Low Priority';
  };

  const getDifficultyIcon = (difficulty?: string) => {
    switch (difficulty) {
      case 'easy':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'moderate':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'complex':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <Target className="h-4 w-4 text-blue-600" />;
    }
  };

  const getRecommendationTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'emergency_fund':
        return <TrendingUp className="h-5 w-5 text-blue-600" />;
      case 'cash_flow':
        return <DollarSign className="h-5 w-5 text-green-600" />;
      case 'avalanche':
      case 'snowball':
        return <Target className="h-5 w-5 text-purple-600" />;
      case 'behavioral':
        return <Brain className="h-5 w-5 text-indigo-600" />;
      default:
        return <Lightbulb className="h-5 w-5 text-amber-600" />;
    }
  };

  if (!recommendations || recommendations.length === 0) {
    return (
      <Card className={`bg-card border-0 shadow-sm ${className}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Brain className="h-5 w-5 text-primary" />
            Professional Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            No professional recommendations available at this time.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Sort recommendations by priority score (highest first)
  const sortedRecommendations = [...recommendations].sort((a, b) => b.priority_score - a.priority_score);

  return (
    <Card className={`bg-card border-0 shadow-sm ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <Brain className="h-5 w-5 text-primary" />
          Professional Debt Consultation
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          AI-powered recommendations from certified financial planning methodologies
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {sortedRecommendations.map((recommendation, index) => (
          <Card
            key={recommendation.id}
            className="border border-border/50 hover:border-primary/50 transition-colors"
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className="mt-1">
                    {getRecommendationTypeIcon(recommendation.recommendation_type)}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-foreground">{recommendation.title}</h3>
                      <Badge
                        variant="secondary"
                        className={`text-xs ${getPriorityColor(recommendation.priority_score)}`}
                      >
                        <Star className="h-3 w-3 mr-1" />
                        {recommendation.priority_score}/10
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {getPriorityLabel(recommendation.priority_score)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {recommendation.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Key metrics row */}
              <div className="flex items-center gap-4 pt-2">
                {recommendation.potential_savings && (
                  <div className="flex items-center gap-1 text-sm">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-green-700">
                      {formatCurrency(recommendation.potential_savings)} savings
                    </span>
                  </div>
                )}
                {recommendation.implementation_difficulty && (
                  <div className="flex items-center gap-1 text-sm">
                    {getDifficultyIcon(recommendation.implementation_difficulty)}
                    <span className="text-muted-foreground capitalize">
                      {recommendation.implementation_difficulty}
                    </span>
                  </div>
                )}
                {recommendation.timeline && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{recommendation.timeline}</span>
                  </div>
                )}
              </div>
            </CardHeader>

            {/* Expandable details */}
            {(recommendation.action_steps?.length ||
              recommendation.benefits?.length ||
              recommendation.risk_factors?.length ||
              recommendation.professional_reasoning) && (
              <CardContent className="pt-0">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="details" className="border-none">
                    <AccordionTrigger className="text-sm font-medium text-primary hover:no-underline py-2">
                      View Implementation Details
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-2">
                      {/* Professional reasoning */}
                      {recommendation.professional_reasoning && (
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                            <Brain className="h-4 w-4" />
                            Professional Analysis
                          </h4>
                          <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
                            {recommendation.professional_reasoning}
                          </p>
                        </div>
                      )}

                      {/* Action steps */}
                      {recommendation.action_steps?.length && (
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                            <CheckCircle className="h-4 w-4" />
                            Implementation Steps
                          </h4>
                          <div className="space-y-2">
                            {recommendation.action_steps.map((step, stepIndex) => (
                              <div key={stepIndex} className="flex items-start gap-2 text-sm">
                                <span className="font-medium text-primary min-w-[20px]">
                                  {stepIndex + 1}.
                                </span>
                                <span className="text-muted-foreground">{step}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Benefits */}
                      {recommendation.benefits?.length && (
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                            <TrendingUp className="h-4 w-4" />
                            Key Benefits
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {recommendation.benefits.map((benefit, benefitIndex) => (
                              <div key={benefitIndex} className="flex items-start gap-2 text-sm">
                                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                <span className="text-muted-foreground">{benefit}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Risk factors */}
                      {recommendation.risk_factors?.length && (
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4" />
                            Risk Factors & Mitigation
                          </h4>
                          <div className="space-y-2">
                            {recommendation.risk_factors.map((risk, riskIndex) => (
                              <div key={riskIndex} className="flex items-start gap-2 text-sm">
                                <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                                <span className="text-muted-foreground">{risk}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Ideal for */}
                      {recommendation.ideal_for?.length && (
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                            <Target className="h-4 w-4" />
                            Best Suited For
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {recommendation.ideal_for.map((criteria, criteriaIndex) => (
                              <Badge key={criteriaIndex} variant="outline" className="text-xs">
                                {criteria}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            )}
          </Card>
        ))}

        {/* Professional consultation footer */}
        <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/10">
          <div className="flex items-start gap-3">
            <Brain className="h-5 w-5 text-primary mt-0.5" />
            <div className="flex-1">
              <h4 className="font-medium text-foreground mb-2">Professional Quality Assurance</h4>
              <p className="text-sm text-muted-foreground">
                These recommendations integrate methodologies from certified financial planners,
                debt counselors, and behavioral finance experts to provide comprehensive,
                actionable guidance for your unique financial situation.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfessionalRecommendations;