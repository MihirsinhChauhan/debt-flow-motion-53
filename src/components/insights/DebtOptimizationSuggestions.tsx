// Debt Optimization Suggestions Component
// Displays AI-powered optimization strategies with actionable recommendations

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingDown,
  Clock,
  DollarSign,
  Target,
  ChevronRight,
  ChevronDown,
  CheckCircle,
  AlertCircle,
  Lightbulb,
  ArrowUpRight,
  Calculator,
  PiggyBank,
  CreditCard,
  RefreshCw,
  Star
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface OptimizationSuggestion {
  id: string;
  name: string;
  description: string;
  timeToDebtFree: number; // months
  totalInterestSaved: number;
  monthlyPaymentIncrease?: number;
  implementationSteps: string[];
  priority: 'high' | 'medium' | 'low';
  category: 'payment_increase' | 'strategy_change' | 'refinancing' | 'consolidation';
  difficulty?: 'easy' | 'moderate' | 'complex';
  riskLevel?: 'low' | 'medium' | 'high';
  estimatedSavings?: number;
  timeline?: string;
  benefits?: string[];
  considerations?: string[];
}

interface DebtOptimizationSuggestionsProps {
  suggestions: OptimizationSuggestion[];
  isLoading?: boolean;
  onApplySuggestion?: (suggestion: OptimizationSuggestion) => void;
  onSimulate?: (suggestion: OptimizationSuggestion) => void;
  className?: string;
  maxSuggestions?: number;
}

const DebtOptimizationSuggestions: React.FC<DebtOptimizationSuggestionsProps> = ({
  suggestions,
  isLoading = false,
  onApplySuggestion,
  onSimulate,
  className = '',
  maxSuggestions = 5
}) => {
  const [expandedSuggestions, setExpandedSuggestions] = useState<Set<string>>(new Set());

  // Format currency for Indian market
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Format duration
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

  // Get priority color and icon
  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'high':
        return {
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-700',
          badgeColor: 'bg-red-600',
          icon: <AlertCircle className="h-4 w-4" />
        };
      case 'medium':
        return {
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          textColor: 'text-yellow-700',
          badgeColor: 'bg-yellow-600',
          icon: <Clock className="h-4 w-4" />
        };
      case 'low':
        return {
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          textColor: 'text-green-700',
          badgeColor: 'bg-green-600',
          icon: <CheckCircle className="h-4 w-4" />
        };
      default:
        return {
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          textColor: 'text-gray-700',
          badgeColor: 'bg-gray-600',
          icon: <Lightbulb className="h-4 w-4" />
        };
    }
  };

  // Get category icon and label
  const getCategoryInfo = (category: string) => {
    switch (category) {
      case 'payment_increase':
        return {
          icon: <ArrowUpRight className="h-4 w-4" />,
          label: 'Payment Increase',
          color: 'text-blue-600'
        };
      case 'strategy_change':
        return {
          icon: <Target className="h-4 w-4" />,
          label: 'Strategy Change',
          color: 'text-purple-600'
        };
      case 'refinancing':
        return {
          icon: <RefreshCw className="h-4 w-4" />,
          label: 'Refinancing',
          color: 'text-green-600'
        };
      case 'consolidation':
        return {
          icon: <CreditCard className="h-4 w-4" />,
          label: 'Consolidation',
          color: 'text-orange-600'
        };
      default:
        return {
          icon: <Lightbulb className="h-4 w-4" />,
          label: 'Optimization',
          color: 'text-gray-600'
        };
    }
  };

  // Toggle suggestion expansion
  const toggleExpansion = (suggestionId: string) => {
    const newExpanded = new Set(expandedSuggestions);
    if (newExpanded.has(suggestionId)) {
      newExpanded.delete(suggestionId);
    } else {
      newExpanded.add(suggestionId);
    }
    setExpandedSuggestions(newExpanded);
  };

  // Calculate impact score for sorting
  const calculateImpactScore = (suggestion: OptimizationSuggestion) => {
    const savingsWeight = suggestion.totalInterestSaved / 100000; // Normalize to 100k
    const timeWeight = Math.max(0, 60 - suggestion.timeToDebtFree) / 60; // Favor shorter time
    const priorityWeight = suggestion.priority === 'high' ? 1 : suggestion.priority === 'medium' ? 0.7 : 0.4;

    return (savingsWeight * 0.4 + timeWeight * 0.3 + priorityWeight * 0.3);
  };

  // Sort suggestions by impact and priority
  const sortedSuggestions = [...suggestions]
    .sort((a, b) => calculateImpactScore(b) - calculateImpactScore(a))
    .slice(0, maxSuggestions);

  if (isLoading) {
    return (
      <Card className={`w-full ${className}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-blue-600" />
            Optimization Suggestions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!suggestions.length) {
    return (
      <Card className={`w-full ${className}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-gray-600" />
            Optimization Suggestions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <PiggyBank className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">No optimization suggestions available</p>
            <p className="text-sm text-gray-500">
              Add more debt information to get personalized recommendations
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-blue-600" />
            Optimization Suggestions
          </div>
          <Badge variant="secondary" className="text-xs">
            {suggestions.length} suggestion{suggestions.length !== 1 ? 's' : ''}
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {sortedSuggestions.map((suggestion, index) => {
          const priorityStyle = getPriorityStyle(suggestion.priority);
          const categoryInfo = getCategoryInfo(suggestion.category);
          const isExpanded = expandedSuggestions.has(suggestion.id);
          const savingsPercentage = suggestion.estimatedSavings
            ? (suggestion.totalInterestSaved / suggestion.estimatedSavings) * 100
            : 0;

          return (
            <motion.div
              key={suggestion.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`border ${priorityStyle.borderColor} ${priorityStyle.bgColor}`}>
                <CardContent className="p-4">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={`${priorityStyle.badgeColor} text-white text-xs`}>
                          {suggestion.priority.toUpperCase()}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          <span className={categoryInfo.color}>
                            {categoryInfo.icon}
                          </span>
                          <span className="ml-1">{categoryInfo.label}</span>
                        </Badge>
                        {index === 0 && (
                          <Badge className="bg-yellow-500 text-white text-xs">
                            <Star className="h-3 w-3 mr-1" />
                            Recommended
                          </Badge>
                        )}
                      </div>

                      <h3 className="font-semibold text-gray-900 mb-1">
                        {suggestion.name}
                      </h3>
                      <p className="text-sm text-gray-700 mb-3">
                        {suggestion.description}
                      </p>
                    </div>
                  </div>

                  {/* Key Metrics */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <TrendingDown className="h-4 w-4 text-green-600" />
                        <span className="text-xs text-gray-600">Interest Saved</span>
                      </div>
                      <p className="font-semibold text-green-700">
                        {formatCurrency(suggestion.totalInterestSaved)}
                      </p>
                    </div>

                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Clock className="h-4 w-4 text-blue-600" />
                        <span className="text-xs text-gray-600">Time Saved</span>
                      </div>
                      <p className="font-semibold text-blue-700">
                        {formatDuration(suggestion.timeToDebtFree)}
                      </p>
                    </div>

                    {suggestion.monthlyPaymentIncrease && (
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <DollarSign className="h-4 w-4 text-orange-600" />
                          <span className="text-xs text-gray-600">Extra Payment</span>
                        </div>
                        <p className="font-semibold text-orange-700">
                          {formatCurrency(suggestion.monthlyPaymentIncrease)}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Savings Progress */}
                  {savingsPercentage > 0 && (
                    <div className="mb-4">
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>Potential Savings</span>
                        <span>{savingsPercentage.toFixed(1)}%</span>
                      </div>
                      <Progress value={Math.min(savingsPercentage, 100)} className="h-2" />
                    </div>
                  )}

                  {/* Expandable Details */}
                  <Collapsible open={isExpanded} onOpenChange={() => toggleExpansion(suggestion.id)}>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                        <span className="text-sm text-blue-600">
                          {isExpanded ? 'Hide Details' : 'View Implementation Plan'}
                        </span>
                        {isExpanded ?
                          <ChevronDown className="h-4 w-4" /> :
                          <ChevronRight className="h-4 w-4" />
                        }
                      </Button>
                    </CollapsibleTrigger>

                    <CollapsibleContent className="mt-4">
                      <AnimatePresence>
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-4"
                        >
                          {/* Implementation Steps */}
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Implementation Steps</h4>
                            <ol className="space-y-2">
                              {suggestion.implementationSteps.map((step, stepIndex) => (
                                <li key={stepIndex} className="flex items-start gap-3 text-sm">
                                  <div className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium mt-0.5">
                                    {stepIndex + 1}
                                  </div>
                                  <span className="text-gray-700">{step}</span>
                                </li>
                              ))}
                            </ol>
                          </div>

                          {/* Benefits */}
                          {suggestion.benefits && suggestion.benefits.length > 0 && (
                            <div>
                              <h4 className="font-medium text-gray-900 mb-2">Benefits</h4>
                              <ul className="space-y-1">
                                {suggestion.benefits.map((benefit, benefitIndex) => (
                                  <li key={benefitIndex} className="flex items-start gap-2 text-sm">
                                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                    <span className="text-gray-700">{benefit}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Considerations */}
                          {suggestion.considerations && suggestion.considerations.length > 0 && (
                            <div>
                              <h4 className="font-medium text-gray-900 mb-2">Considerations</h4>
                              <ul className="space-y-1">
                                {suggestion.considerations.map((consideration, considerationIndex) => (
                                  <li key={considerationIndex} className="flex items-start gap-2 text-sm">
                                    <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                                    <span className="text-gray-700">{consideration}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Difficulty and Risk */}
                          <div className="flex gap-4">
                            {suggestion.difficulty && (
                              <div>
                                <span className="text-xs text-gray-600">Difficulty:</span>
                                <Badge
                                  variant="outline"
                                  className={`ml-1 text-xs ${
                                    suggestion.difficulty === 'easy' ? 'text-green-600' :
                                    suggestion.difficulty === 'moderate' ? 'text-yellow-600' :
                                    'text-red-600'
                                  }`}
                                >
                                  {suggestion.difficulty}
                                </Badge>
                              </div>
                            )}

                            {suggestion.riskLevel && (
                              <div>
                                <span className="text-xs text-gray-600">Risk:</span>
                                <Badge
                                  variant="outline"
                                  className={`ml-1 text-xs ${
                                    suggestion.riskLevel === 'low' ? 'text-green-600' :
                                    suggestion.riskLevel === 'medium' ? 'text-yellow-600' :
                                    'text-red-600'
                                  }`}
                                >
                                  {suggestion.riskLevel}
                                </Badge>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      </AnimatePresence>
                    </CollapsibleContent>
                  </Collapsible>

                  {/* Action Buttons */}
                  <Separator className="my-4" />
                  <div className="flex gap-2">
                    {onSimulate && (
                      <Button
                        onClick={() => onSimulate(suggestion)}
                        variant="outline"
                        size="sm"
                        className="flex-1"
                      >
                        <Calculator className="h-4 w-4 mr-2" />
                        Simulate
                      </Button>
                    )}

                    {onApplySuggestion && (
                      <Button
                        onClick={() => onApplySuggestion(suggestion)}
                        size="sm"
                        className="flex-1"
                      >
                        Apply Strategy
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}

        {suggestions.length > maxSuggestions && (
          <div className="text-center py-4">
            <p className="text-sm text-gray-600">
              Showing top {maxSuggestions} of {suggestions.length} suggestions
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DebtOptimizationSuggestions;