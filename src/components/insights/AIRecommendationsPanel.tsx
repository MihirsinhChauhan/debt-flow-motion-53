// AI Recommendations Panel Component
// Displays personalized AI recommendations with filtering, sorting, and actions

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  Filter,
  Clock,
  DollarSign,
  TrendingUp,
  CheckCircle,
  X,
  ChevronDown,
  ChevronUp,
  Star,
  AlertTriangle,
  Target,
  Lightbulb,
  ArrowRight,
  Search,
  SortAsc,
  SortDesc,
  MoreHorizontal
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RecommendationItem } from '@/types/ai-insights';

interface AIRecommendationsPanelProps {
  recommendations: RecommendationItem[];
  isLoading?: boolean;
  onDismiss?: (recommendationId: string) => void;
  onImplement?: (recommendation: RecommendationItem) => void;
  onViewDetails?: (recommendation: RecommendationItem) => void;
  className?: string;
  showFilters?: boolean;
  maxRecommendations?: number;
}

type SortOption = 'priority' | 'savings' | 'difficulty' | 'created_at';
type FilterOption = 'all' | 'high_priority' | 'easy' | 'high_savings';

const AIRecommendationsPanel: React.FC<AIRecommendationsPanelProps> = ({
  recommendations,
  isLoading = false,
  onDismiss,
  onImplement,
  onViewDetails,
  className = '',
  showFilters = true,
  maxRecommendations = 10
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('priority');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [expandedRecommendations, setExpandedRecommendations] = useState<Set<string>>(new Set());

  // Format currency for Indian market
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Get recommendation type color and icon
  const getRecommendationTypeStyle = (type: string) => {
    const typeStyles: Record<string, any> = {
      'payment_strategy': {
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        textColor: 'text-blue-700',
        icon: <Target className="h-4 w-4" />
      },
      'debt_consolidation': {
        bgColor: 'bg-purple-50',
        borderColor: 'border-purple-200',
        textColor: 'text-purple-700',
        icon: <TrendingUp className="h-4 w-4" />
      },
      'refinancing': {
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        textColor: 'text-green-700',
        icon: <DollarSign className="h-4 w-4" />
      },
      'budget_optimization': {
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200',
        textColor: 'text-orange-700',
        icon: <Lightbulb className="h-4 w-4" />
      },
      'investment_strategy': {
        bgColor: 'bg-indigo-50',
        borderColor: 'border-indigo-200',
        textColor: 'text-indigo-700',
        icon: <Star className="h-4 w-4" />
      }
    };

    return typeStyles[type] || {
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
      textColor: 'text-gray-700',
      icon: <Lightbulb className="h-4 w-4" />
    };
  };

  // Get difficulty badge style
  const getDifficultyStyle = (difficulty?: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'complex':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Filter and sort recommendations
  const filteredAndSortedRecommendations = useMemo(() => {
    let filtered = recommendations.filter(rec => !rec.is_dismissed);

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(rec =>
        rec.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rec.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rec.recommendation_type.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply category filter
    if (filterBy !== 'all') {
      switch (filterBy) {
        case 'high_priority':
          filtered = filtered.filter(rec => rec.priority_score >= 8);
          break;
        case 'easy':
          filtered = filtered.filter(rec => rec.implementation_difficulty === 'easy');
          break;
        case 'high_savings':
          filtered = filtered.filter(rec =>
            (rec.potential_savings || rec.estimated_savings || 0) >= 50000
          );
          break;
      }
    }

    // Sort recommendations
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'priority':
          comparison = a.priority_score - b.priority_score;
          break;
        case 'savings':
          const savingsA = a.potential_savings || a.estimated_savings || 0;
          const savingsB = b.potential_savings || b.estimated_savings || 0;
          comparison = savingsA - savingsB;
          break;
        case 'difficulty':
          const difficultyOrder = { easy: 1, moderate: 2, complex: 3 };
          const diffA = difficultyOrder[a.implementation_difficulty as keyof typeof difficultyOrder] || 2;
          const diffB = difficultyOrder[b.implementation_difficulty as keyof typeof difficultyOrder] || 2;
          comparison = diffA - diffB;
          break;
        case 'created_at':
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
        default:
          comparison = 0;
      }

      return sortDirection === 'desc' ? -comparison : comparison;
    });

    return filtered.slice(0, maxRecommendations);
  }, [recommendations, searchTerm, sortBy, sortDirection, filterBy, maxRecommendations]);

  // Toggle recommendation expansion
  const toggleExpansion = (recommendationId: string) => {
    const newExpanded = new Set(expandedRecommendations);
    if (newExpanded.has(recommendationId)) {
      newExpanded.delete(recommendationId);
    } else {
      newExpanded.add(recommendationId);
    }
    setExpandedRecommendations(newExpanded);
  };

  if (isLoading) {
    return (
      <Card className={`w-full ${className}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-blue-600" />
            AI Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse border rounded-lg p-4">
              <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!recommendations.length) {
    return (
      <Card className={`w-full ${className}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-gray-600" />
            AI Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">No recommendations available</p>
            <p className="text-sm text-gray-500">
              AI recommendations will appear here once your debt data is analyzed
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between mb-4">
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-blue-600" />
            AI Recommendations
          </CardTitle>
          <Badge variant="secondary" className="text-xs">
            {filteredAndSortedRecommendations.length} of {recommendations.filter(r => !r.is_dismissed).length}
          </Badge>
        </div>

        {/* Filters and Search */}
        {showFilters && (
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search recommendations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filter and Sort Controls */}
            <div className="flex flex-wrap gap-2">
              <Select value={filterBy} onValueChange={(value) => setFilterBy(value as FilterOption)}>
                <SelectTrigger className="w-40">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Recommendations</SelectItem>
                  <SelectItem value="high_priority">High Priority</SelectItem>
                  <SelectItem value="easy">Easy to Implement</SelectItem>
                  <SelectItem value="high_savings">High Savings</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="priority">Priority</SelectItem>
                  <SelectItem value="savings">Savings</SelectItem>
                  <SelectItem value="difficulty">Difficulty</SelectItem>
                  <SelectItem value="created_at">Date</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
              >
                {sortDirection === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        <AnimatePresence>
          {filteredAndSortedRecommendations.map((recommendation, index) => {
            const typeStyle = getRecommendationTypeStyle(recommendation.recommendation_type);
            const isExpanded = expandedRecommendations.has(recommendation.id);
            const potentialSavings = recommendation.potential_savings || recommendation.estimated_savings;

            return (
              <motion.div
                key={recommendation.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className={`border ${typeStyle.borderColor} ${typeStyle.bgColor}`}>
                  <CardContent className="p-4">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className="bg-blue-600 text-white text-xs">
                            Priority {recommendation.priority_score}/10
                          </Badge>
                          {recommendation.implementation_difficulty && (
                            <Badge
                              variant="outline"
                              className={`text-xs ${getDifficultyStyle(recommendation.implementation_difficulty)}`}
                            >
                              {recommendation.implementation_difficulty}
                            </Badge>
                          )}
                          <Badge variant="outline" className={`text-xs ${typeStyle.textColor}`}>
                            {typeStyle.icon}
                            <span className="ml-1 capitalize">
                              {recommendation.recommendation_type.replace('_', ' ')}
                            </span>
                          </Badge>
                        </div>

                        <h3 className="font-semibold text-gray-900 mb-1">
                          {recommendation.title}
                        </h3>
                        <p className="text-sm text-gray-700 mb-3">
                          {recommendation.description}
                        </p>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {onViewDetails && (
                            <DropdownMenuItem onClick={() => onViewDetails(recommendation)}>
                              View Details
                            </DropdownMenuItem>
                          )}
                          {onDismiss && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => onDismiss(recommendation.id)}
                                className="text-red-600"
                              >
                                Dismiss
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Key Metrics */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      {potentialSavings && (
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 mb-1">
                            <DollarSign className="h-4 w-4 text-green-600" />
                            <span className="text-xs text-gray-600">Potential Savings</span>
                          </div>
                          <p className="font-semibold text-green-700">
                            {formatCurrency(potentialSavings)}
                          </p>
                        </div>
                      )}

                      {recommendation.timeline && (
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 mb-1">
                            <Clock className="h-4 w-4 text-blue-600" />
                            <span className="text-xs text-gray-600">Timeline</span>
                          </div>
                          <p className="font-semibold text-blue-700">
                            {recommendation.timeline}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Expandable Details */}
                    {(recommendation.action_steps || recommendation.benefits || recommendation.risk_factors) && (
                      <>
                        <Button
                          onClick={() => toggleExpansion(recommendation.id)}
                          variant="ghost"
                          className="w-full justify-between p-0 h-auto mb-3"
                        >
                          <span className="text-sm text-blue-600">
                            {isExpanded ? 'Hide Details' : 'Show Details'}
                          </span>
                          {isExpanded ?
                            <ChevronUp className="h-4 w-4" /> :
                            <ChevronDown className="h-4 w-4" />
                          }
                        </Button>

                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="space-y-4 mb-4"
                            >
                              {/* Action Steps */}
                              {recommendation.action_steps && recommendation.action_steps.length > 0 && (
                                <div>
                                  <h4 className="font-medium text-gray-900 mb-2">Action Steps</h4>
                                  <ol className="space-y-1">
                                    {recommendation.action_steps.map((step, stepIndex) => (
                                      <li key={stepIndex} className="flex items-start gap-3 text-sm">
                                        <div className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium mt-0.5">
                                          {stepIndex + 1}
                                        </div>
                                        <span className="text-gray-700">{step}</span>
                                      </li>
                                    ))}
                                  </ol>
                                </div>
                              )}

                              {/* Benefits */}
                              {recommendation.benefits && recommendation.benefits.length > 0 && (
                                <div>
                                  <h4 className="font-medium text-gray-900 mb-2">Benefits</h4>
                                  <ul className="space-y-1">
                                    {recommendation.benefits.map((benefit, benefitIndex) => (
                                      <li key={benefitIndex} className="flex items-start gap-2 text-sm">
                                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                        <span className="text-gray-700">{benefit}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {/* Risk Factors */}
                              {recommendation.risk_factors && recommendation.risk_factors.length > 0 && (
                                <div>
                                  <h4 className="font-medium text-gray-900 mb-2">Risk Factors</h4>
                                  <ul className="space-y-1">
                                    {recommendation.risk_factors.map((risk, riskIndex) => (
                                      <li key={riskIndex} className="flex items-start gap-2 text-sm">
                                        <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                                        <span className="text-gray-700">{risk}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {/* Professional Reasoning */}
                              {recommendation.professional_reasoning && (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                  <h4 className="font-medium text-blue-900 mb-1">Professional Analysis</h4>
                                  <p className="text-sm text-blue-800">
                                    {recommendation.professional_reasoning}
                                  </p>
                                </div>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </>
                    )}

                    {/* Action Buttons */}
                    <Separator className="mb-4" />
                    <div className="flex gap-2">
                      {onViewDetails && (
                        <Button
                          onClick={() => onViewDetails(recommendation)}
                          variant="outline"
                          size="sm"
                          className="flex-1"
                        >
                          View Details
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      )}

                      {onImplement && (
                        <Button
                          onClick={() => onImplement(recommendation)}
                          size="sm"
                          className="flex-1"
                        >
                          Implement
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* No Results Message */}
        {filteredAndSortedRecommendations.length === 0 && !isLoading && (
          <div className="text-center py-8">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">No recommendations match your filters</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchTerm('');
                setFilterBy('all');
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}

        {/* Show More Button */}
        {recommendations.filter(r => !r.is_dismissed).length > maxRecommendations && (
          <div className="text-center pt-4">
            <p className="text-sm text-gray-600">
              Showing {Math.min(maxRecommendations, filteredAndSortedRecommendations.length)} of{' '}
              {recommendations.filter(r => !r.is_dismissed).length} recommendations
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AIRecommendationsPanel;