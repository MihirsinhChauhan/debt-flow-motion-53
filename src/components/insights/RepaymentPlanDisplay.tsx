import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Target,
  Calendar,
  DollarSign,
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  Lightbulb,
  Clock,
  ArrowRight,
  Shield,
  Zap
} from 'lucide-react';
import { RepaymentPlan } from '@/types/ai-insights';

interface RepaymentPlanDisplayProps {
  repaymentPlan: RepaymentPlan;
  className?: string;
}

const RepaymentPlanDisplay: React.FC<RepaymentPlanDisplayProps> = ({
  repaymentPlan,
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'details' | 'alternatives'>('overview');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatTimeToFreedom = (months: number) => {
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;

    if (years === 0) {
      return `${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`;
    } else if (remainingMonths === 0) {
      return `${years} year${years !== 1 ? 's' : ''}`;
    } else {
      return `${years}y ${remainingMonths}m`;
    }
  };

  return (
    <Card className={`bg-card border-0 shadow-sm ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <Target className="h-5 w-5 text-primary" />
          Professional Debt Elimination Plan
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Comprehensive strategy based on {repaymentPlan.primary_strategy.name}
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Key Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">
                {formatTimeToFreedom(repaymentPlan.time_to_debt_free)}
              </div>
              <div className="text-xs text-muted-foreground mt-1">To Debt Freedom</div>
            </CardContent>
          </Card>

          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-700">
                {formatCurrency(repaymentPlan.total_interest_saved)}
              </div>
              <div className="text-xs text-muted-foreground mt-1">Interest Saved</div>
            </CardContent>
          </Card>

          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-700">
                {formatCurrency(repaymentPlan.monthly_payment_amount)}
              </div>
              <div className="text-xs text-muted-foreground mt-1">Monthly Payment</div>
            </CardContent>
          </Card>

          <Card className="bg-amber-50 border-amber-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-amber-700">
                {new Date(repaymentPlan.expected_completion_date).toLocaleDateString('en-IN', {
                  month: 'short',
                  year: 'numeric'
                })}
              </div>
              <div className="text-xs text-muted-foreground mt-1">Freedom Date</div>
            </CardContent>
          </Card>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-muted p-1 rounded-lg">
          <Button
            variant={activeTab === 'overview' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('overview')}
            className="flex-1"
          >
            Strategy Overview
          </Button>
          <Button
            variant={activeTab === 'details' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('details')}
            className="flex-1"
          >
            Implementation
          </Button>
          <Button
            variant={activeTab === 'alternatives' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('alternatives')}
            className="flex-1"
          >
            Alternatives
          </Button>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Primary Strategy */}
            <Card className="border border-primary/20 bg-primary/5">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <Zap className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">{repaymentPlan.primary_strategy.name}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {repaymentPlan.primary_strategy.description}
                </p>

                {/* Strategy Benefits */}
                {repaymentPlan.primary_strategy.benefits?.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Strategic Benefits
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {repaymentPlan.primary_strategy.benefits.map((benefit, index) => (
                        <div key={index} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-muted-foreground">{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Professional Reasoning */}
                {repaymentPlan.primary_strategy.reasoning && (
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                      <Lightbulb className="h-4 w-4" />
                      Professional Reasoning
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {repaymentPlan.primary_strategy.reasoning}
                    </p>
                  </div>
                )}

                {/* Ideal For */}
                {repaymentPlan.primary_strategy.ideal_for?.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-foreground">Best Suited For:</h4>
                    <div className="flex flex-wrap gap-2">
                      {repaymentPlan.primary_strategy.ideal_for.map((criteria, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {criteria}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Key Insights */}
            {repaymentPlan.key_insights?.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Lightbulb className="h-4 w-4" />
                    Professional Insights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {repaymentPlan.key_insights.map((insight, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                        <div className="font-medium text-primary min-w-[24px] text-center">
                          {index + 1}
                        </div>
                        <p className="text-sm text-muted-foreground flex-1">{insight}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'details' && (
          <div className="space-y-6">
            {/* Action Items */}
            {repaymentPlan.action_items?.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Immediate Action Plan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {repaymentPlan.action_items.map((action, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 border border-border rounded-lg hover:border-primary/50 transition-colors">
                        <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-foreground">{action}</p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground mt-0.5" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Risk Factors */}
            {repaymentPlan.risk_factors?.length > 0 && (
              <Card className="border-amber-200 bg-amber-50/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Risk Management & Mitigation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {repaymentPlan.risk_factors.map((risk, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-white/50 rounded-lg border border-amber-200">
                        <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-muted-foreground flex-1">{risk}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'alternatives' && (
          <div className="space-y-4">
            {repaymentPlan.alternative_strategies?.length > 0 ? (
              repaymentPlan.alternative_strategies.map((strategy, index) => (
                <Card key={index} className="border border-border hover:border-primary/50 transition-colors">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-base">{strategy.name}</CardTitle>
                      {strategy.estimated_savings && (
                        <Badge variant="outline" className="text-xs">
                          <DollarSign className="h-3 w-3 mr-1" />
                          {formatCurrency(strategy.estimated_savings)} potential
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">{strategy.description}</p>

                    {strategy.ideal_for?.length > 0 && (
                      <div className="space-y-2">
                        <h5 className="text-sm font-medium text-foreground">Ideal for:</h5>
                        <div className="flex flex-wrap gap-2">
                          {strategy.ideal_for.map((criteria, criteriaIndex) => (
                            <Badge key={criteriaIndex} variant="secondary" className="text-xs">
                              {criteria}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {strategy.benefits?.length > 0 && (
                      <div className="space-y-2">
                        <h5 className="text-sm font-medium text-foreground">Benefits:</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                          {strategy.benefits.map((benefit, benefitIndex) => (
                            <div key={benefitIndex} className="flex items-start gap-2 text-sm">
                              <CheckCircle className="h-3 w-3 text-green-600 mt-1 flex-shrink-0" />
                              <span className="text-muted-foreground text-xs">{benefit}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No alternative strategies available. The recommended strategy is optimal for your situation.
              </p>
            )}
          </div>
        )}

        {/* Professional Footer */}
        <div className="bg-gradient-to-r from-primary/5 to-blue-50 p-4 rounded-lg border border-primary/10">
          <div className="flex items-start gap-3">
            <Target className="h-5 w-5 text-primary mt-0.5" />
            <div className="flex-1">
              <h4 className="font-medium text-foreground mb-2">Professional Debt Consultation</h4>
              <p className="text-sm text-muted-foreground">
                This comprehensive plan integrates proven methodologies from certified financial planners,
                behavioral economics, and debt management specialists to maximize your path to financial freedom.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RepaymentPlanDisplay;