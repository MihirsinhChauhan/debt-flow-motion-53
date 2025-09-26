/**
 * Smart Payment Suggestions and Debt Consolidation Recommendations
 * AI-powered insights for optimal debt management strategies
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  Lightbulb,
  Target,
  TrendingDown,
  TrendingUp,
  Calendar,
  DollarSign,
  Zap,
  Shield,
  CheckCircle,
  AlertTriangle,
  Clock,
  ArrowRight,
  Sparkles,
  Calculator,
  PiggyBank,
  CreditCard,
  Building2,
  FileText,
  Star,
  ThumbsUp,
  ThumbsDown,
  Info,
  ExternalLink
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';

import { Debt } from '@/types/debt';
import { debtUtils } from '@/lib/debt-utils';

interface SmartPaymentSuggestionsProps {
  debts: Debt[];
  monthlyIncome?: number;
  monthlyExpenses?: number;
  availableAmount?: number;
}

interface PaymentSuggestion {
  id: string;
  type: 'payment_increase' | 'debt_prioritization' | 'consolidation' | 'refinancing' | 'strategy_change';
  title: string;
  description: string;
  impact: {
    timeSaved: number; // months
    moneySaved: number; // rupees
    riskReduction: number; // percentage
  };
  effort: 'low' | 'medium' | 'high';
  priority: 'urgent' | 'high' | 'medium' | 'low';
  actionSteps: string[];
  pros: string[];
  cons: string[];
  requirements?: string[];
}

interface ConsolidationOption {
  id: string;
  provider: string;
  loanType: 'personal_loan' | 'home_loan' | 'balance_transfer' | 'debt_consolidation';
  estimatedRate: number;
  estimatedAmount: number;
  qualification: {
    minIncome: number;
    maxDTI: number;
    minCreditScore?: number;
  };
  benefits: string[];
  considerations: string[];
  estimatedSavings: {
    monthly: number;
    total: number;
  };
  processingTime: string;
  fees: {
    processing: number;
    prepayment?: number;
  };
}

interface CashFlowAnalysis {
  totalMonthlyPayments: number;
  availableCashFlow: number;
  dtiRatio: number;
  recommendedBudget: {
    minimum: number;
    optimal: number;
    aggressive: number;
  };
  emergencyFundStatus: 'insufficient' | 'adequate' | 'excellent';
}

const SmartPaymentSuggestions: React.FC<SmartPaymentSuggestionsProps> = ({
  debts,
  monthlyIncome = 0,
  monthlyExpenses = 0,
  availableAmount = 0
}) => {
  const [activeTab, setActiveTab] = useState('suggestions');
  const [selectedSuggestion, setSelectedSuggestion] = useState<string | null>(null);
  const [feedbackGiven, setFeedbackGiven] = useState<Set<string>>(new Set());

  // Calculate cash flow analysis
  const cashFlowAnalysis = useMemo((): CashFlowAnalysis => {
    const totalMonthlyPayments = debts.reduce((sum, debt) => {
      let monthlyPayment = debt.minimum_payment;
      switch (debt.payment_frequency) {
        case 'weekly': monthlyPayment = debt.minimum_payment * 4.33; break;
        case 'biweekly': monthlyPayment = debt.minimum_payment * 2.17; break;
        case 'quarterly': monthlyPayment = debt.minimum_payment / 3; break;
      }
      return sum + monthlyPayment;
    }, 0);

    const dtiRatio = monthlyIncome > 0 ? (totalMonthlyPayments / monthlyIncome) * 100 : 0;
    const availableCashFlow = monthlyIncome - monthlyExpenses - totalMonthlyPayments;

    const recommendedBudget = {
      minimum: Math.max(totalMonthlyPayments, availableCashFlow * 0.1),
      optimal: availableCashFlow * 0.3,
      aggressive: availableCashFlow * 0.5
    };

    const emergencyFundStatus: CashFlowAnalysis['emergencyFundStatus'] =
      availableAmount >= monthlyExpenses * 6 ? 'excellent' :
      availableAmount >= monthlyExpenses * 3 ? 'adequate' : 'insufficient';

    return {
      totalMonthlyPayments,
      availableCashFlow,
      dtiRatio,
      recommendedBudget,
      emergencyFundStatus
    };
  }, [debts, monthlyIncome, monthlyExpenses, availableAmount]);

  // Generate smart payment suggestions
  const paymentSuggestions = useMemo((): PaymentSuggestion[] => {
    const suggestions: PaymentSuggestion[] = [];

    if (debts.length === 0) return suggestions;

    // High interest debt prioritization
    const highInterestDebts = debts.filter(debt => debt.interest_rate > 18);
    if (highInterestDebts.length > 0) {
      const totalHighInterest = highInterestDebts.reduce((sum, debt) => sum + debt.current_balance, 0);
      const potentialSavings = totalHighInterest * 0.12; // Assume 12% average reduction

      suggestions.push({
        id: 'prioritize_high_interest',
        type: 'debt_prioritization',
        title: 'Focus on High-Interest Debts',
        description: `You have ${highInterestDebts.length} debt${highInterestDebts.length > 1 ? 's' : ''} with rates above 18%. Prioritizing these can save significant money.`,
        impact: {
          timeSaved: 6,
          moneySaved: potentialSavings,
          riskReduction: 25
        },
        effort: 'low',
        priority: 'high',
        actionSteps: [
          'List all debts by interest rate (highest first)',
          'Pay minimums on all debts',
          'Direct extra payments to highest rate debt',
          'Continue until paid off, then move to next highest'
        ],
        pros: [
          'Minimizes total interest paid',
          'Mathematically optimal approach',
          'Faster overall debt elimination'
        ],
        cons: [
          'May take longer to see initial progress',
          'Requires discipline to stick with strategy'
        ]
      });
    }

    // Payment increase suggestion
    if (cashFlowAnalysis.availableCashFlow > 2000) {
      const extraAmount = Math.min(cashFlowAnalysis.recommendedBudget.optimal, 10000);
      const timeSavings = debts.reduce((sum, debt) => {
        const basePayoff = debtUtils.calculations.estimatePayoffTime(debt);
        const acceleratedDebt = { ...debt, minimum_payment: debt.minimum_payment + (extraAmount / debts.length) };
        const acceleratedPayoff = debtUtils.calculations.estimatePayoffTime(acceleratedDebt);
        return sum + (basePayoff.months - acceleratedPayoff.months);
      }, 0);

      suggestions.push({
        id: 'increase_payments',
        type: 'payment_increase',
        title: 'Increase Monthly Payments',
        description: `Based on your cash flow, you could add ₹${extraAmount.toLocaleString()} to monthly debt payments.`,
        impact: {
          timeSaved: timeSavings / debts.length,
          moneySaved: timeSavings * 2000, // Rough estimate
          riskReduction: 15
        },
        effort: 'low',
        priority: 'medium',
        actionSteps: [
          'Review your monthly budget',
          'Identify areas to reduce expenses',
          `Allocate an extra ₹${extraAmount.toLocaleString()} to debt payments`,
          'Set up automatic transfers to maintain consistency'
        ],
        pros: [
          'Significantly reduces payoff time',
          'Builds good financial habits',
          'Reduces total interest paid'
        ],
        cons: [
          'Reduces available spending money',
          'Requires budget discipline'
        ]
      });
    }

    // Debt consolidation suggestion
    if (debts.length >= 3) {
      const totalBalance = debts.reduce((sum, debt) => sum + debt.current_balance, 0);
      const weightedAvgRate = debts.reduce((sum, debt) =>
        sum + (debt.interest_rate * debt.current_balance / totalBalance), 0
      );

      if (weightedAvgRate > 15 && totalBalance > 50000) {
        suggestions.push({
          id: 'debt_consolidation',
          type: 'consolidation',
          title: 'Consider Debt Consolidation',
          description: `Consolidating ${debts.length} debts could reduce your average interest rate and simplify payments.`,
          impact: {
            timeSaved: 12,
            moneySaved: totalBalance * 0.08,
            riskReduction: 30
          },
          effort: 'medium',
          priority: 'high',
          actionSteps: [
            'Check your credit score',
            'Research consolidation loan options',
            'Compare interest rates and terms',
            'Apply for pre-approval',
            'Calculate total costs including fees'
          ],
          pros: [
            'Single monthly payment',
            'Potentially lower interest rate',
            'Simplified debt management',
            'Fixed payment schedule'
          ],
          cons: [
            'May require good credit score',
            'Processing fees apply',
            'Temptation to accumulate new debt'
          ],
          requirements: [
            'Stable income verification',
            'Good credit history',
            'Debt-to-income ratio below 40%'
          ]
        });
      }
    }

    // Balance transfer suggestion for credit cards
    const creditCardDebts = debts.filter(debt => debt.debt_type === 'credit_card');
    if (creditCardDebts.length > 0) {
      const totalCCBalance = creditCardDebts.reduce((sum, debt) => sum + debt.current_balance, 0);
      const avgCCRate = creditCardDebts.reduce((sum, debt) =>
        sum + (debt.interest_rate * debt.current_balance / totalCCBalance), 0
      );

      if (avgCCRate > 20) {
        suggestions.push({
          id: 'balance_transfer',
          type: 'refinancing',
          title: 'Balance Transfer Opportunity',
          description: `Transfer credit card balances to a lower-rate card or personal loan to reduce interest burden.`,
          impact: {
            timeSaved: 8,
            moneySaved: totalCCBalance * 0.15,
            riskReduction: 20
          },
          effort: 'medium',
          priority: 'high',
          actionSteps: [
            'Research 0% APR balance transfer offers',
            'Calculate transfer fees vs. interest savings',
            'Apply for balance transfer card',
            'Transfer balances strategically',
            'Avoid using old cards'
          ],
          pros: [
            'Potential 0% interest period',
            'Lower ongoing interest rates',
            'Consolidated payments'
          ],
          cons: [
            'Balance transfer fees (3-5%)',
            'Limited promotional periods',
            'Requires good credit'
          ]
        });
      }
    }

    // Strategy change suggestion (Snowball vs Avalanche)
    if (debts.length >= 2) {
      const strategies = debtUtils.calculations.compareDebtStrategies(debts, 0);
      const savings = strategies.snowball.totalInterest - strategies.avalanche.totalInterest;

      if (savings > 10000) {
        suggestions.push({
          id: 'strategy_change',
          type: 'strategy_change',
          title: 'Switch to Avalanche Method',
          description: `Changing from smallest-balance-first to highest-interest-first could save ₹${savings.toLocaleString()}.`,
          impact: {
            timeSaved: strategies.snowball.totalTime - strategies.avalanche.totalTime,
            moneySaved: savings,
            riskReduction: 10
          },
          effort: 'low',
          priority: 'medium',
          actionSteps: [
            'List debts by interest rate (highest first)',
            'Redirect extra payments to highest rate debt',
            'Continue current minimum payments on others',
            'Track progress and savings'
          ],
          pros: [
            'Mathematically optimal',
            'Minimizes total interest',
            'Faster overall debt freedom'
          ],
          cons: [
            'Less immediate psychological wins',
            'Requires patience and discipline'
          ]
        });
      }
    }

    return suggestions.sort((a, b) => {
      const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }, [debts, cashFlowAnalysis]);

  // Generate consolidation options
  const consolidationOptions = useMemo((): ConsolidationOption[] => {
    if (debts.length < 2) return [];

    const totalBalance = debts.reduce((sum, debt) => sum + debt.current_balance, 0);
    const weightedAvgRate = debts.reduce((sum, debt) =>
      sum + (debt.interest_rate * debt.current_balance / totalBalance), 0
    );

    const options: ConsolidationOption[] = [];

    // Personal loan option
    if (totalBalance <= 1000000) {
      const estimatedRate = Math.max(10.5, weightedAvgRate - 3);
      const monthlySavings = (weightedAvgRate - estimatedRate) / 100 * totalBalance / 12;

      options.push({
        id: 'personal_loan',
        provider: 'Various Banks',
        loanType: 'personal_loan',
        estimatedRate,
        estimatedAmount: totalBalance,
        qualification: {
          minIncome: 25000,
          maxDTI: 50,
          minCreditScore: 650
        },
        benefits: [
          'Fixed interest rate',
          'Predictable monthly payments',
          'No collateral required',
          'Quick processing (3-7 days)'
        ],
        considerations: [
          'Higher rates than secured loans',
          'Shorter repayment terms',
          'Processing fees apply'
        ],
        estimatedSavings: {
          monthly: monthlySavings,
          total: monthlySavings * 24
        },
        processingTime: '3-7 business days',
        fees: {
          processing: totalBalance * 0.02,
          prepayment: 0.05
        }
      });
    }

    // Home loan top-up option (if applicable)
    const hasHomeLoan = debts.some(debt => debt.debt_type === 'home_loan');
    if (hasHomeLoan && totalBalance >= 100000) {
      const estimatedRate = 8.5;
      const monthlySavings = (weightedAvgRate - estimatedRate) / 100 * totalBalance / 12;

      options.push({
        id: 'home_loan_topup',
        provider: 'Home Loan Bank',
        loanType: 'home_loan',
        estimatedRate,
        estimatedAmount: totalBalance,
        qualification: {
          minIncome: 50000,
          maxDTI: 60
        },
        benefits: [
          'Lowest interest rates',
          'Tax benefits under Section 24',
          'Longer repayment terms available',
          'Existing relationship with bank'
        ],
        considerations: [
          'Property as collateral',
          'Longer processing time',
          'Additional documentation required'
        ],
        estimatedSavings: {
          monthly: monthlySavings,
          total: monthlySavings * 60
        },
        processingTime: '7-15 business days',
        fees: {
          processing: totalBalance * 0.005,
          prepayment: 0.02
        }
      });
    }

    // Balance transfer option for credit cards
    const creditCardBalance = debts
      .filter(debt => debt.debt_type === 'credit_card')
      .reduce((sum, debt) => sum + debt.current_balance, 0);

    if (creditCardBalance > 0) {
      const estimatedRate = 12;
      const currentCCRate = debts
        .filter(debt => debt.debt_type === 'credit_card')
        .reduce((sum, debt) => sum + debt.interest_rate, 0) /
        debts.filter(debt => debt.debt_type === 'credit_card').length;

      const monthlySavings = (currentCCRate - estimatedRate) / 100 * creditCardBalance / 12;

      options.push({
        id: 'balance_transfer',
        provider: 'Credit Card Companies',
        loanType: 'balance_transfer',
        estimatedRate,
        estimatedAmount: creditCardBalance,
        qualification: {
          minIncome: 20000,
          maxDTI: 45,
          minCreditScore: 700
        },
        benefits: [
          '0% APR introductory offers',
          'No collateral required',
          'Instant online approval',
          'Retain existing credit limits'
        ],
        considerations: [
          'Promotional rates are temporary',
          'Balance transfer fees apply',
          'Requires excellent credit'
        ],
        estimatedSavings: {
          monthly: monthlySavings,
          total: monthlySavings * 12
        },
        processingTime: '1-3 business days',
        fees: {
          processing: creditCardBalance * 0.03
        }
      });
    }

    return options.sort((a, b) => b.estimatedSavings.total - a.estimatedSavings.total);
  }, [debts]);

  const handleFeedback = (suggestionId: string, isPositive: boolean) => {
    setFeedbackGiven(prev => new Set([...prev, suggestionId]));
    // In a real app, send feedback to analytics
    console.log(`Feedback for ${suggestionId}: ${isPositive ? 'positive' : 'negative'}`);
  };

  const getPriorityColor = (priority: PaymentSuggestion['priority']) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-700 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  const getEffortColor = (effort: PaymentSuggestion['effort']) => {
    switch (effort) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-red-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Cash Flow Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Smart Financial Analysis
          </CardTitle>
          <CardDescription>
            AI-powered insights based on your debt profile and cash flow
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">
                {debtUtils.formatting.formatCurrency(cashFlowAnalysis.totalMonthlyPayments)}
              </div>
              <div className="text-sm text-muted-foreground">Monthly Payments</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {debtUtils.formatting.formatCurrency(cashFlowAnalysis.availableCashFlow)}
              </div>
              <div className="text-sm text-muted-foreground">Available Cash Flow</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {cashFlowAnalysis.dtiRatio.toFixed(1)}%
              </div>
              <div className="text-sm text-muted-foreground">Debt-to-Income</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${
                cashFlowAnalysis.emergencyFundStatus === 'excellent' ? 'text-green-600' :
                cashFlowAnalysis.emergencyFundStatus === 'adequate' ? 'text-yellow-600' :
                'text-red-600'
              }`}>
                {cashFlowAnalysis.emergencyFundStatus}
              </div>
              <div className="text-sm text-muted-foreground">Emergency Fund</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="suggestions">Smart Suggestions</TabsTrigger>
          <TabsTrigger value="consolidation">Consolidation</TabsTrigger>
          <TabsTrigger value="budget">Budget Optimizer</TabsTrigger>
        </TabsList>

        <TabsContent value="suggestions" className="space-y-4">
          {paymentSuggestions.length > 0 ? (
            <div className="space-y-4">
              {paymentSuggestions.map((suggestion) => (
                <Card
                  key={suggestion.id}
                  className={`border-2 hover:shadow-md transition-shadow ${
                    selectedSuggestion === suggestion.id ? 'border-primary' : ''
                  }`}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-primary/10 rounded-full">
                          {suggestion.type === 'payment_increase' && <TrendingUp className="h-5 w-5 text-primary" />}
                          {suggestion.type === 'debt_prioritization' && <Target className="h-5 w-5 text-primary" />}
                          {suggestion.type === 'consolidation' && <Building2 className="h-5 w-5 text-primary" />}
                          {suggestion.type === 'refinancing' && <CreditCard className="h-5 w-5 text-primary" />}
                          {suggestion.type === 'strategy_change' && <Zap className="h-5 w-5 text-primary" />}
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-lg">{suggestion.title}</CardTitle>
                          <CardDescription className="mt-1">
                            {suggestion.description}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Badge className={getPriorityColor(suggestion.priority)}>
                          {suggestion.priority} priority
                        </Badge>
                        <div className={`text-xs font-medium ${getEffortColor(suggestion.effort)}`}>
                          {suggestion.effort} effort
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Impact Summary */}
                    <div className="grid grid-cols-3 gap-4 mb-4 p-3 bg-secondary/30 rounded-lg">
                      <div className="text-center">
                        <div className="font-semibold text-green-600">
                          {suggestion.impact.timeSaved} months
                        </div>
                        <div className="text-xs text-muted-foreground">Time Saved</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-green-600">
                          {debtUtils.formatting.formatCurrency(suggestion.impact.moneySaved)}
                        </div>
                        <div className="text-xs text-muted-foreground">Money Saved</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-blue-600">
                          {suggestion.impact.riskReduction}%
                        </div>
                        <div className="text-xs text-muted-foreground">Risk Reduction</div>
                      </div>
                    </div>

                    {/* Expandable Details */}
                    <AnimatePresence>
                      {selectedSuggestion === suggestion.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="space-y-4"
                        >
                          <Separator />

                          {/* Action Steps */}
                          <div>
                            <h4 className="font-medium mb-2 flex items-center gap-2">
                              <CheckCircle className="h-4 w-4" />
                              Action Steps
                            </h4>
                            <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                              {suggestion.actionSteps.map((step, index) => (
                                <li key={index}>{step}</li>
                              ))}
                            </ol>
                          </div>

                          {/* Pros and Cons */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-medium mb-2 flex items-center gap-2 text-green-600">
                                <ThumbsUp className="h-4 w-4" />
                                Benefits
                              </h4>
                              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                                {suggestion.pros.map((pro, index) => (
                                  <li key={index}>{pro}</li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <h4 className="font-medium mb-2 flex items-center gap-2 text-orange-600">
                                <AlertTriangle className="h-4 w-4" />
                                Considerations
                              </h4>
                              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                                {suggestion.cons.map((con, index) => (
                                  <li key={index}>{con}</li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          {/* Requirements */}
                          {suggestion.requirements && (
                            <div>
                              <h4 className="font-medium mb-2 flex items-center gap-2">
                                <Shield className="h-4 w-4" />
                                Requirements
                              </h4>
                              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                                {suggestion.requirements.map((req, index) => (
                                  <li key={index}>{req}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between mt-4 pt-4 border-t">
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedSuggestion(
                            selectedSuggestion === suggestion.id ? null : suggestion.id
                          )}
                        >
                          {selectedSuggestion === suggestion.id ? 'Hide Details' : 'View Details'}
                        </Button>
                        <Button size="sm">
                          Implement
                          <ArrowRight className="ml-1 h-3 w-3" />
                        </Button>
                      </div>

                      {/* Feedback buttons */}
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleFeedback(suggestion.id, true)}
                          disabled={feedbackGiven.has(suggestion.id)}
                          className="p-2"
                        >
                          <ThumbsUp className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleFeedback(suggestion.id, false)}
                          disabled={feedbackGiven.has(suggestion.id)}
                          className="p-2"
                        >
                          <ThumbsDown className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-8 text-center">
                <Lightbulb className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">No Suggestions Available</h3>
                <p className="text-muted-foreground">
                  Add more debt information to get personalized recommendations.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="consolidation" className="space-y-4">
          {consolidationOptions.length > 0 ? (
            <div className="space-y-4">
              {consolidationOptions.map((option) => (
                <Card key={option.id} className="border-2 hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Building2 className="h-5 w-5" />
                          {option.provider} - {option.loanType.replace('_', ' ').toUpperCase()}
                        </CardTitle>
                        <CardDescription>
                          Estimated rate: {option.estimatedRate.toFixed(1)}% •
                          Amount: {debtUtils.formatting.formatCurrency(option.estimatedAmount)}
                        </CardDescription>
                      </div>
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        Save {debtUtils.formatting.formatCurrency(option.estimatedSavings.total)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Key Metrics */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-3 bg-secondary/30 rounded-lg">
                      <div className="text-center">
                        <div className="font-semibold">{option.estimatedRate.toFixed(1)}%</div>
                        <div className="text-xs text-muted-foreground">Interest Rate</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold">
                          {debtUtils.formatting.formatCurrency(option.estimatedSavings.monthly)}
                        </div>
                        <div className="text-xs text-muted-foreground">Monthly Savings</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold">{option.processingTime}</div>
                        <div className="text-xs text-muted-foreground">Processing Time</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold">
                          {debtUtils.formatting.formatCurrency(option.fees.processing)}
                        </div>
                        <div className="text-xs text-muted-foreground">Processing Fee</div>
                      </div>
                    </div>

                    {/* Qualification Requirements */}
                    <div className="border rounded-lg p-3">
                      <h4 className="font-medium mb-2">Qualification Requirements</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                        <div>Min Income: {debtUtils.formatting.formatCurrency(option.qualification.minIncome)}/month</div>
                        <div>Max DTI: {option.qualification.maxDTI}%</div>
                        {option.qualification.minCreditScore && (
                          <div>Min Credit Score: {option.qualification.minCreditScore}</div>
                        )}
                      </div>
                    </div>

                    {/* Benefits and Considerations */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-2 text-green-600">Benefits</h4>
                        <ul className="text-sm space-y-1">
                          {option.benefits.map((benefit, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <CheckCircle className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                              {benefit}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2 text-orange-600">Considerations</h4>
                        <ul className="text-sm space-y-1">
                          {option.considerations.map((consideration, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <Info className="h-3 w-3 text-orange-600 mt-0.5 flex-shrink-0" />
                              {consideration}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t">
                      <Button variant="outline" size="sm">
                        Learn More
                        <ExternalLink className="ml-1 h-3 w-3" />
                      </Button>
                      <Button size="sm">
                        Check Eligibility
                        <ArrowRight className="ml-1 h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-8 text-center">
                <Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">No Consolidation Options</h3>
                <p className="text-muted-foreground">
                  You need multiple debts to explore consolidation opportunities.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="budget" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Recommended Debt Payment Budget
              </CardTitle>
              <CardDescription>
                Optimize your monthly payments based on available cash flow
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Budget Scenarios */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-2">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-blue-600">Conservative</CardTitle>
                    <CardDescription>Maintain financial safety</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold mb-2">
                      {debtUtils.formatting.formatCurrency(cashFlowAnalysis.recommendedBudget.minimum)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      10% of available cash flow
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-2 border-primary">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-primary">Balanced</CardTitle>
                    <CardDescription>Recommended approach</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold mb-2">
                      {debtUtils.formatting.formatCurrency(cashFlowAnalysis.recommendedBudget.optimal)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      30% of available cash flow
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-2">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-orange-600">Aggressive</CardTitle>
                    <CardDescription>Fast debt elimination</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold mb-2">
                      {debtUtils.formatting.formatCurrency(cashFlowAnalysis.recommendedBudget.aggressive)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      50% of available cash flow
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Emergency Fund Warning */}
              {cashFlowAnalysis.emergencyFundStatus === 'insufficient' && (
                <Alert className="border-orange-200 bg-orange-50">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="font-medium mb-1">Build Emergency Fund First</div>
                    <div className="text-sm">
                      Consider building at least 3 months of expenses (₹{(monthlyExpenses * 3).toLocaleString()})
                      before aggressively paying down debt.
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {/* DTI Warning */}
              {cashFlowAnalysis.dtiRatio > 40 && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="font-medium mb-1">High Debt-to-Income Ratio</div>
                    <div className="text-sm">
                      Your DTI ratio of {cashFlowAnalysis.dtiRatio.toFixed(1)}% is above the recommended 40%.
                      Consider debt consolidation or increasing income.
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {/* Budget Breakdown */}
              <div className="space-y-4">
                <h4 className="font-medium">Monthly Cash Flow Breakdown</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>Monthly Income</span>
                    <span className="font-medium">{debtUtils.formatting.formatCurrency(monthlyIncome)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Monthly Expenses</span>
                    <span className="font-medium">-{debtUtils.formatting.formatCurrency(monthlyExpenses)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Current Debt Payments</span>
                    <span className="font-medium">-{debtUtils.formatting.formatCurrency(cashFlowAnalysis.totalMonthlyPayments)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center font-medium">
                    <span>Available for Extra Payments</span>
                    <span className={cashFlowAnalysis.availableCashFlow > 0 ? 'text-green-600' : 'text-red-600'}>
                      {debtUtils.formatting.formatCurrency(cashFlowAnalysis.availableCashFlow)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SmartPaymentSuggestions;