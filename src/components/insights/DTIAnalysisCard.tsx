// DTI Analysis Card Component
// Displays detailed debt-to-income ratio analysis with health indicators and recommendations

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Info,
  IndianRupee,
  PieChart,
  Target,
  ChevronDown,
  ChevronUp,
  Calculator
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';

interface DTIAnalysis {
  frontend_dti: number;
  backend_dti: number;
  total_monthly_debt_payments: number;
  monthly_income: number;
  is_healthy: boolean;
  risk_level?: string;
}

interface DTIAnalysisCardProps {
  dtiData: DTIAnalysis;
  className?: string;
  showDetails?: boolean;
  onOptimize?: () => void;
}

const DTIAnalysisCard: React.FC<DTIAnalysisCardProps> = ({
  dtiData,
  className = '',
  showDetails = true,
  onOptimize
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Format currency for Indian market
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Get DTI health status and color
  const getDTIStatus = (dti: number) => {
    if (dti <= 20) {
      return {
        status: 'Excellent',
        color: 'bg-green-500',
        textColor: 'text-green-700',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200'
      };
    } else if (dti <= 36) {
      return {
        status: 'Good',
        color: 'bg-blue-500',
        textColor: 'text-blue-700',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200'
      };
    } else if (dti <= 43) {
      return {
        status: 'Manageable',
        color: 'bg-yellow-500',
        textColor: 'text-yellow-700',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200'
      };
    } else {
      return {
        status: 'High Risk',
        color: 'bg-red-500',
        textColor: 'text-red-700',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200'
      };
    }
  };

  const dtiStatus = getDTIStatus(dtiData.frontend_dti);
  const remainingIncome = dtiData.monthly_income - dtiData.total_monthly_debt_payments;
  const disposableIncomePercentage = (remainingIncome / dtiData.monthly_income) * 100;

  // DTI benchmarks and targets
  const excellentThreshold = 20;
  const goodThreshold = 36;
  const manageableThreshold = 43;

  // Calculate improvement targets
  const getImprovementTarget = () => {
    const currentDTI = dtiData.frontend_dti;

    if (currentDTI > manageableThreshold) {
      return {
        target: manageableThreshold,
        label: 'Manageable Range',
        improvement: currentDTI - manageableThreshold,
        monthlyReduction: ((currentDTI - manageableThreshold) / 100) * dtiData.monthly_income
      };
    } else if (currentDTI > goodThreshold) {
      return {
        target: goodThreshold,
        label: 'Good Range',
        improvement: currentDTI - goodThreshold,
        monthlyReduction: ((currentDTI - goodThreshold) / 100) * dtiData.monthly_income
      };
    } else if (currentDTI > excellentThreshold) {
      return {
        target: excellentThreshold,
        label: 'Excellent Range',
        improvement: currentDTI - excellentThreshold,
        monthlyReduction: ((currentDTI - excellentThreshold) / 100) * dtiData.monthly_income
      };
    }

    return null;
  };

  const improvementTarget = getImprovementTarget();

  // Get recommendations based on DTI level
  const getRecommendations = () => {
    const currentDTI = dtiData.frontend_dti;

    if (currentDTI <= excellentThreshold) {
      return [
        'Maintain current debt levels',
        'Consider investing surplus income',
        'Build emergency fund to 6 months expenses'
      ];
    } else if (currentDTI <= goodThreshold) {
      return [
        'Focus on paying down high-interest debt',
        'Avoid taking on new debt',
        'Consider debt consolidation for better rates'
      ];
    } else if (currentDTI <= manageableThreshold) {
      return [
        'Prioritize debt reduction immediately',
        'Consider increasing income sources',
        'Review and cut non-essential expenses'
      ];
    } else {
      return [
        'Urgent debt reduction required',
        'Seek professional financial counseling',
        'Consider debt restructuring options',
        'Increase income through side work'
      ];
    }
  };

  const recommendations = getRecommendations();

  return (
    <Card className={`w-full ${dtiStatus.borderColor} ${className}`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <PieChart className="h-5 w-5 text-blue-600" />
            Debt-to-Income Analysis
          </CardTitle>

          <Badge
            className={`${dtiStatus.bgColor} ${dtiStatus.textColor} border-0`}
          >
            {dtiStatus.status}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Main DTI Display */}
        <div className={`${dtiStatus.bgColor} rounded-xl p-6 border ${dtiStatus.borderColor}`}>
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-900 mb-2">
              {dtiData.frontend_dti.toFixed(1)}%
            </div>
            <p className="text-sm text-gray-600 mb-4">
              of your income goes to debt payments
            </p>

            {/* Visual Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-gray-600">
                <span>0%</span>
                <span>20%</span>
                <span>36%</span>
                <span>43%</span>
                <span>50%+</span>
              </div>
              <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
                {/* Background segments for different ranges */}
                <div className="absolute inset-0 flex">
                  <div className="bg-green-200 flex-1 max-w-[40%]"></div>
                  <div className="bg-blue-200 flex-1 max-w-[32%]"></div>
                  <div className="bg-yellow-200 flex-1 max-w-[14%]"></div>
                  <div className="bg-red-200 flex-1"></div>
                </div>

                {/* Current DTI indicator */}
                <div
                  className={`absolute top-0 h-full ${dtiStatus.color} rounded-full transition-all duration-500`}
                  style={{ width: `${Math.min(dtiData.frontend_dti * 2, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Income vs Debt Breakdown */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <IndianRupee className="h-4 w-4 text-green-600" />
              <span className="text-sm text-gray-600">Monthly Income</span>
            </div>
            <p className="text-xl font-semibold">
              {formatCurrency(dtiData.monthly_income)}
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-red-600" />
              <span className="text-sm text-gray-600">Debt Payments</span>
            </div>
            <p className="text-xl font-semibold">
              {formatCurrency(dtiData.total_monthly_debt_payments)}
            </p>
          </div>
        </div>

        {/* Disposable Income */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Disposable Income</span>
            <span className="text-sm text-gray-600">
              {disposableIncomePercentage.toFixed(1)}% of income
            </span>
          </div>
          <div className="text-xl font-bold text-gray-900">
            {formatCurrency(remainingIncome)}
          </div>
          <p className="text-xs text-gray-600 mt-1">
            Available for living expenses and savings
          </p>
        </div>

        {/* Improvement Target */}
        {improvementTarget && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Target className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">
                Target: {improvementTarget.label}
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-blue-700">Reduce DTI by:</span>
                <span className="font-medium text-blue-800">
                  {improvementTarget.improvement.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-blue-700">Monthly payment reduction needed:</span>
                <span className="font-medium text-blue-800">
                  {formatCurrency(improvementTarget.monthlyReduction)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* DTI Health Alert */}
        {!dtiData.is_healthy && (
          <Alert className="bg-amber-50 border-amber-200">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              Your debt-to-income ratio is above the recommended 36% threshold.
              Consider prioritizing debt reduction to improve your financial health.
            </AlertDescription>
          </Alert>
        )}

        {/* Expandable Details */}
        {showDetails && (
          <>
            <Separator />

            <Button
              onClick={() => setIsExpanded(!isExpanded)}
              variant="ghost"
              className="w-full justify-between"
            >
              <span>DTI Recommendations & Guidelines</span>
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
                  className="space-y-4"
                >
                  {/* DTI Guidelines */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">DTI Guidelines</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span>0-20%: Excellent</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span>21-36%: Good</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <span>37-43%: Manageable</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <span>44%+: High Risk</span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Recommendations */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">Recommendations</h4>
                    <ul className="space-y-2">
                      {recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Action Button */}
                  {onOptimize && (
                    <>
                      <Separator />
                      <Button onClick={onOptimize} className="w-full">
                        <Calculator className="h-4 w-4 mr-2" />
                        Optimize My Debt Strategy
                      </Button>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default DTIAnalysisCard;