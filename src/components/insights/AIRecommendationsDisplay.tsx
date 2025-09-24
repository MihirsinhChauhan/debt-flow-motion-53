import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  TrendingUp,
  PiggyBank,
  AlertTriangle,
  Lightbulb,
  Star,
  CheckCircle
} from 'lucide-react';
import { RecommendationItemBackend, DebtAnalysisBackend } from '@/types/ai-insights';

interface AIRecommendationsDisplayProps {
  debtAnalysis: DebtAnalysisBackend;
  recommendations: RecommendationItemBackend[];
  className?: string;
}

const AIRecommendationsDisplay: React.FC<AIRecommendationsDisplayProps> = ({
  debtAnalysis,
  recommendations,
  className = ''
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

  // Get icon for recommendation type
  const getRecommendationIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'avalanche':
      case 'debt_avalanche':
        return TrendingUp;
      case 'snowball':
      case 'debt_snowball':
        return Star;
      case 'emergency_fund':
        return PiggyBank;
      case 'consolidation':
        return CheckCircle;
      default:
        return Lightbulb;
    }
  };

  // Get priority color
  const getPriorityColor = (score: number) => {
    if (score >= 9) return 'bg-red-100 text-red-800 border-red-200';
    if (score >= 7) return 'bg-orange-100 text-orange-800 border-orange-200';
    if (score >= 5) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-blue-100 text-blue-800 border-blue-200';
  };

  // Sort recommendations by priority score
  const sortedRecommendations = [...recommendations].sort((a, b) => b.priority_score - a.priority_score);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Debt Analysis Overview */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <TrendingUp className="h-5 w-5" />
            AI Debt Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="text-center p-3 sm:p-0">
              <div className="text-xl sm:text-2xl font-bold text-blue-900">
                {formatCurrency(debtAnalysis.total_debt)}
              </div>
              <div className="text-xs sm:text-sm text-blue-700">Total Debt</div>
            </div>
            <div className="text-center p-3 sm:p-0">
              <div className="text-xl sm:text-2xl font-bold text-blue-900">
                {debtAnalysis.debt_count}
              </div>
              <div className="text-xs sm:text-sm text-blue-700">Active Debts</div>
            </div>
            <div className="text-center p-3 sm:p-0">
              <div className="text-xl sm:text-2xl font-bold text-blue-900">
                {debtAnalysis.average_interest_rate.toFixed(1)}%
              </div>
              <div className="text-xs sm:text-sm text-blue-700">Avg Interest</div>
            </div>
            <div className="text-center p-3 sm:p-0">
              <div className="text-xl sm:text-2xl font-bold text-blue-900">
                {debtAnalysis.high_priority_count}
              </div>
              <div className="text-xs sm:text-sm text-blue-700">High Priority</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Recommendations */}
      <div className="space-y-4">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 flex flex-col sm:flex-row sm:items-center gap-2">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-600" />
            <span>AI-Generated Recommendations</span>
          </div>
          <Badge variant="secondary" className="w-fit">
            {recommendations.length} insights
          </Badge>
        </h3>

        {sortedRecommendations.map((recommendation, index) => {
          const Icon = getRecommendationIcon(recommendation.recommendation_type);
          const priorityColor = getPriorityColor(recommendation.priority_score);

          return (
            <Card key={recommendation.id} className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <CardTitle className="text-base sm:text-lg text-gray-900 leading-tight">
                        {recommendation.title}
                      </CardTitle>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-2">
                        <Badge className={`text-xs w-fit ${priorityColor}`}>
                          Priority {recommendation.priority_score}/10
                        </Badge>
                        <Badge variant="outline" className="text-xs w-fit">
                          {recommendation.recommendation_type.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="text-left sm:text-right flex-shrink-0">
                    <div className="text-lg sm:text-xl font-bold text-green-700">
                      {formatCurrency(recommendation.potential_savings)}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-500">Potential Savings</div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <p className="text-sm sm:text-base text-gray-700 mb-4 leading-relaxed">
                  {recommendation.description}
                </p>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                  <div className="text-xs sm:text-sm text-gray-500">
                    Generated: {new Date(recommendation.created_at).toLocaleDateString('en-IN')}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-2">
                    <Button variant="outline" size="sm" className="w-full sm:w-auto min-h-[44px]">
                      Learn More
                    </Button>
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto min-h-[44px]">
                      Apply Strategy
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Summary Footer */}
      <Card className="bg-green-50 border-green-200">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="font-medium text-green-900 text-sm sm:text-base">
                Total Potential Savings
              </span>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-green-700">
              {formatCurrency(
                recommendations.reduce((sum, rec) => sum + rec.potential_savings, 0)
              )}
            </div>
          </div>
          <div className="text-xs sm:text-sm text-green-700 mt-2 leading-relaxed">
            By implementing all AI recommendations, you could save this amount in interest and fees.
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIRecommendationsDisplay;