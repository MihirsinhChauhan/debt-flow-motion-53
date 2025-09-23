import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Separator } from '@/components/ui/separator';
import {
  Lightbulb,
  ChevronDown,
  ChevronRight,
  DollarSign,
  Clock,
  TrendingUp,
  Zap,
  RefreshCw,
  PiggyBank,
  CreditCard,
  Target,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { DebtOptimizationSuggestion } from '@/types/ai-insights';

interface AlternativeStrategiesSectionProps {
  suggestions: DebtOptimizationSuggestion[];
  onApplySuggestion?: (suggestionId: string) => void;
  onSimulateSuggestion?: (suggestionId: string) => void;
  onViewDetails?: (suggestionId: string) => void;
  className?: string;
}

const AlternativeStrategiesSection: React.FC<AlternativeStrategiesSectionProps> = ({
  suggestions,
  onApplySuggestion,
  onSimulateSuggestion,
  onViewDetails,
  className
}) => {
  const [expandedSuggestions, setExpandedSuggestions] = useState<string[]>([]);

  // Format currency
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

  // Toggle expanded state
  const toggleExpanded = (suggestionId: string) => {
    setExpandedSuggestions(prev =>
      prev.includes(suggestionId)
        ? prev.filter(id => id !== suggestionId)
        : [...prev, suggestionId]
    );
  };

  // Get priority color and icon
  const getPriorityConfig = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high':
        return {
          color: 'bg-red-100 text-red-700 border-red-200',
          icon: AlertTriangle,
          label: 'High Impact'
        };
      case 'medium':
        return {
          color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
          icon: Clock,
          label: 'Medium Impact'
        };
      case 'low':
        return {
          color: 'bg-blue-100 text-blue-700 border-blue-200',
          icon: CheckCircle,
          label: 'Low Impact'
        };
    }
  };

  // Get category icon
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'payment_increase':
        return TrendingUp;
      case 'strategy_change':
        return RefreshCw;
      case 'refinancing':
        return CreditCard;
      case 'consolidation':
        return Target;
      default:
        return Lightbulb;
    }
  };

  // Sort suggestions by priority
  const sortedSuggestions = [...suggestions].sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });

  return (
    <Card className={`transition-all duration-200 ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-finance-blue" />
          Alternative Optimization Strategies
        </CardTitle>
        <p className="text-sm text-gray-600">
          Explore additional ways to accelerate your debt freedom journey with AI-powered recommendations
        </p>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {sortedSuggestions.length === 0 ? (
            <div className="text-center py-8">
              <Sparkles className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 mb-2">No alternative strategies available</p>
              <p className="text-sm text-gray-400">Your current plan is already well optimized!</p>
            </div>
          ) : (
            sortedSuggestions.map((suggestion) => {
              const isExpanded = expandedSuggestions.includes(suggestion.id);
              const priorityConfig = getPriorityConfig(suggestion.priority);
              const CategoryIcon = getCategoryIcon(suggestion.category);
              const PriorityIcon = priorityConfig.icon;

              return (
                <Collapsible key={suggestion.id} open={isExpanded}>
                  <Card className="border-l-4 border-l-finance-blue/30 hover:shadow-md transition-all duration-200">
                    <CollapsibleTrigger asChild>
                      <CardHeader
                        className="cursor-pointer hover:bg-gray-50 transition-colors pb-3"
                        onClick={() => toggleExpanded(suggestion.id)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            <div className="bg-finance-blue/10 p-2 rounded-lg">
                              <CategoryIcon className="h-5 w-5 text-finance-blue" />
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-gray-900 truncate">
                                  {suggestion.name}
                                </h3>
                                <Badge className={`text-xs ${priorityConfig.color} border`}>
                                  <PriorityIcon className="h-3 w-3 mr-1" />
                                  {priorityConfig.label}
                                </Badge>
                              </div>

                              <p className="text-sm text-gray-600 line-clamp-2">
                                {suggestion.description}
                              </p>

                              <div className="flex items-center gap-4 mt-2">
                                <div className="flex items-center gap-1 text-xs text-finance-green">
                                  <DollarSign className="h-3 w-3" />
                                  <span className="font-medium">
                                    {formatCurrency(suggestion.totalInterestSaved)} saved
                                  </span>
                                </div>
                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                  <Clock className="h-3 w-3" />
                                  <span>
                                    {formatDuration(suggestion.timeToDebtFree)} to debt-free
                                  </span>
                                </div>
                                {suggestion.monthlyPaymentIncrease && (
                                  <div className="flex items-center gap-1 text-xs text-blue-600">
                                    <TrendingUp className="h-3 w-3" />
                                    <span>
                                      +{formatCurrency(suggestion.monthlyPaymentIncrease)}/month
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 ml-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                onSimulateSuggestion?.(suggestion.id);
                              }}
                              className="text-xs"
                            >
                              <Zap className="h-3 w-3 mr-1" />
                              Simulate
                            </Button>

                            <div className="transition-transform duration-200">
                              {isExpanded ? (
                                <ChevronDown className="h-4 w-4 text-gray-400" />
                              ) : (
                                <ChevronRight className="h-4 w-4 text-gray-400" />
                              )}
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>

                    <CollapsibleContent>
                      <CardContent className="pt-0">
                        <Separator className="mb-4" />

                        {/* Implementation steps */}
                        <div className="space-y-4">
                          <div>
                            <h4 className="text-sm font-medium text-gray-900 mb-3">
                              Implementation Steps
                            </h4>
                            <div className="space-y-2">
                              {suggestion.implementationSteps.map((step, index) => (
                                <div key={index} className="flex items-start gap-2">
                                  <div className="bg-finance-blue text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium mt-0.5">
                                    {index + 1}
                                  </div>
                                  <p className="text-sm text-gray-700 flex-1">
                                    {step}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Benefits summary */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div className="bg-finance-green/10 p-3 rounded-lg text-center">
                              <PiggyBank className="h-5 w-5 text-finance-green mx-auto mb-1" />
                              <div className="text-sm font-semibold text-finance-green">
                                {formatCurrency(suggestion.totalInterestSaved)}
                              </div>
                              <div className="text-xs text-gray-600">Interest Savings</div>
                            </div>

                            <div className="bg-blue-50 p-3 rounded-lg text-center">
                              <Clock className="h-5 w-5 text-finance-blue mx-auto mb-1" />
                              <div className="text-sm font-semibold text-finance-blue">
                                {formatDuration(suggestion.timeToDebtFree)}
                              </div>
                              <div className="text-xs text-gray-600">Time to Debt-Free</div>
                            </div>

                            <div className="bg-purple-50 p-3 rounded-lg text-center">
                              <Target className="h-5 w-5 text-purple-600 mx-auto mb-1" />
                              <div className="text-sm font-semibold text-purple-600 capitalize">
                                {suggestion.priority}
                              </div>
                              <div className="text-xs text-gray-600">Priority Level</div>
                            </div>
                          </div>

                          {/* Action buttons */}
                          <div className="flex gap-3 pt-2">
                            <Button
                              onClick={() => onApplySuggestion?.(suggestion.id)}
                              className="flex-1 bg-finance-blue hover:bg-finance-lightBlue text-white"
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Apply Strategy
                            </Button>

                            <Button
                              variant="outline"
                              onClick={() => onViewDetails?.(suggestion.id)}
                              className="px-4"
                            >
                              <ArrowRight className="h-4 w-4" />
                            </Button>
                          </div>

                          {/* Warning for high-impact changes */}
                          {suggestion.priority === 'high' && suggestion.monthlyPaymentIncrease && suggestion.monthlyPaymentIncrease > 5000 && (
                            <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg mt-4">
                              <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                              <div className="text-sm">
                                <span className="font-medium text-yellow-800">Budget Impact:</span>
                                <span className="text-gray-700"> This strategy requires a significant monthly payment increase. Ensure it fits your budget before applying.</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              );
            })
          )}

          {/* Generate more suggestions button */}
          {suggestions.length > 0 && (
            <div className="pt-4 border-t">
              <Button variant="outline" className="w-full">
                <RefreshCw className="h-4 w-4 mr-2" />
                Generate More Strategies
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AlternativeStrategiesSection;