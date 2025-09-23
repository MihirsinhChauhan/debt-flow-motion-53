import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingDown, Plus, Lightbulb, MoreHorizontal, Bell, TrendingUp, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import DebtProgressRing from '@/components/debt/DebtProgressRing';
import DTIIndicator from '@/components/debt/DTIIndicator';
import EnhancedDebtCard from '@/components/debt/EnhancedDebtCard';
import AiSuggestionCard from '../AiSuggestionCard';
import PaymentReminderCard from '../PaymentReminderCard';
import { apiService } from '@/lib/api';
import { Debt, DebtSummary, AIRecommendation } from '@/types/debt';
import { useAuth } from '@/context/AuthContext';

// Helper function for formatting currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const DebtWidget = () => {
  const { user } = useAuth();
  const [debts, setDebts] = useState<Debt[]>([]);
  const [debtSummary, setDebtSummary] = useState<DebtSummary | null>(null);
  const [aiRecommendations, setAiRecommendations] = useState<AIRecommendation[]>([]);
  const [reminders, setReminders] = useState<any[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load data on component mount
  useEffect(() => {
    if (user) {
      loadDebtData();
    }
  }, [user]);

  const loadDebtData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Load debts, summary, and AI recommendations in parallel
      const [debtsData, summaryData, recommendationsData] = await Promise.all([
        apiService.getDebts(),
        apiService.getDebtSummary(),
        apiService.getAIRecommendations()
      ]);

      setDebts(debtsData);
      setDebtSummary(summaryData);
      setAiRecommendations(recommendationsData);

      // Generate reminders from debts (debts due soon)
      const upcomingReminders = debtsData
        .filter(debt => debt.due_date && debt.days_past_due >= -7 && debt.days_past_due <= 7)
        .map(debt => ({
          id: debt.id,
          debtId: debt.id,
          dueDate: debt.due_date,
          amount: debt.minimum_payment,
          message: debt.days_past_due < 0
            ? `${debt.name} payment due in ${Math.abs(debt.days_past_due)} days`
            : `${debt.name} payment was due ${debt.days_past_due} days ago`,
          isPast: debt.days_past_due > 0,
          isToday: debt.days_past_due === 0
        }));

      setReminders(upcomingReminders);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load debt data');
      console.error('Error loading debt data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate totals from real data
  const totalDebt = debts.reduce((sum, debt) => sum + debt.current_balance, 0);
  const totalOriginalDebt = debts.reduce((sum, debt) => sum + debt.principal_amount, 0);
  const progress = totalOriginalDebt > 0 ? ((totalOriginalDebt - totalDebt) / totalOriginalDebt) * 100 : 0;

  // Use real user data and debt payments
  const monthlyIncome = user?.monthly_income || 0;
  const totalDebtPayments = debts.reduce((sum, debt) => sum + debt.minimum_payment, 0);
  const housingPayments = monthlyIncome * 0.3; // Estimate 30% for housing

  const handleMarkAsPaid = (reminderId: string) => {
    setReminders(reminders.filter(reminder => reminder.id !== reminderId));
  };

  const toggleExpanded = useCallback(() => {
    setIsExpanded(!isExpanded);
  }, [isExpanded]);

  // Skeleton loader component with accessibility
  const SkeletonLoader = ({ className = '', ariaLabel = 'Loading...' }: { className?: string; ariaLabel?: string }) => (
    <div className={`animate-pulse ${className}`} role="status" aria-label={ariaLabel}>
      <div className="bg-gray-200 rounded h-4 w-3/4 mb-2"></div>
      <div className="bg-gray-200 rounded h-3 w-1/2"></div>
      <span className="sr-only">{ariaLabel}</span>
    </div>
  );

  // Error display component with accessibility
  const ErrorDisplay = ({
    error,
    onRetry,
    retryCount: currentRetries,
    title = 'Failed to load data',
    showRetry = true
  }: {
    error: string;
    onRetry?: () => void;
    retryCount?: number;
    title?: string;
    showRetry?: boolean;
  }) => (
    <div className="text-center py-4" role="alert" aria-live="polite">
      <AlertCircle className="h-8 w-8 text-red-400 mx-auto mb-2" aria-hidden="true" />
      <p className="text-sm font-medium text-red-600 mb-1" id="error-title">{title}</p>
      <p className="text-xs text-red-500 mb-3" id="error-message">{error}</p>
      {showRetry && onRetry && currentRetries < 3 && (
        <Button
          onClick={onRetry}
          size="sm"
          variant="outline"
          className="gap-1"
          disabled={currentRetries >= 3}
          aria-describedby="error-title error-message"
        >
          <RefreshCw className="h-3 w-3" aria-hidden="true" />
          Try Again {currentRetries > 0 && `(${currentRetries}/3)`}
        </Button>
      )}
      {currentRetries >= 3 && (
        <p className="text-xs text-gray-500" role="status">
          Max retries reached. Please refresh the page.
        </p>
      )}
    </div>
  );

  // Collapsed view content
  const collapsedContent = (
    <div className="space-y-4">
      {isLoading ? (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      ) : error ? (
        <div className="text-center py-4">
          <p className="text-sm text-red-500">{error}</p>
          <Button onClick={loadDebtData} size="sm" variant="outline" className="mt-2">
            Retry
          </Button>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Debt</p>
              <p className="text-2xl font-semibold text-gray-900">{formatCurrency(totalDebt)}</p>
            </div>
            <DebtProgressRing
              progress={progress}
              size={80}
              strokeWidth={8}
              showPercentage={true}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500">Monthly Payments</p>
              <p className="text-lg font-medium">{formatCurrency(totalDebtPayments)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Debts</p>
              <p className="text-lg font-medium">{debts.length}</p>
            </div>
          </div>
        </>
      )}
    </div>
  );

  // Expanded view content
  const expandedContent = (
    <div className="h-[600px] flex flex-col">
      <Tabs defaultValue="insights" className="h-full flex flex-col">
        <TabsList className="grid w-full grid-cols-3 m-4 mb-0">
          <TabsTrigger value="insights" className="text-xs">AI Insights</TabsTrigger>
          <TabsTrigger value="debts" className="text-xs">Your Debts</TabsTrigger>
          <TabsTrigger value="reminders" className="text-xs">Reminders</TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-hidden">
          <TabsContent value="insights" className="h-full m-0 data-[state=active]:flex data-[state=active]:flex-col">
            <div className="p-4 flex-1 overflow-y-auto">
              <div className="space-y-4">
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                    <span className="ml-2 text-gray-500">Loading AI insights...</span>
                  </div>
                ) : error ? (
                  <div className="text-center py-8">
                    <p className="text-red-500">{error}</p>
                    <Button onClick={loadDebtData} className="mt-2">
                      Try Again
                    </Button>
                  </div>
                ) : aiRecommendations.length > 0 ? (
                  aiRecommendations.map((recommendation) => (
                    <AiSuggestionCard key={recommendation.id} suggestion={{
                      id: recommendation.id,
                      title: recommendation.title,
                      description: recommendation.description,
                      savingsAmount: recommendation.potential_savings,
                      type: recommendation.recommendation_type
                    }} />
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Lightbulb className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No AI recommendations available</p>
                    <p className="text-sm text-gray-400">Add some debts to get personalized insights!</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="debts" className="h-full m-0 data-[state=active]:flex data-[state=active]:flex-col">
            <div className="p-4 flex-1 overflow-y-auto space-y-4">
              {/* DTI Indicator */}
              {monthlyIncome > 0 && (
                <DTIIndicator
                  monthlyIncome={monthlyIncome}
                  totalMonthlyDebtPayments={totalDebtPayments}
                  housingPayments={housingPayments}
                />
              )}

              {/* Add Debt Button */}
              <div className="flex justify-between items-center">
                <h4 className="font-medium">Your Debts</h4>
                <Button size="sm" variant="outline" className="gap-1">
                  <Plus className="h-3 w-3" />
                  Add Debt
                </Button>
              </div>

              {/* Debt List */}
              <div className="space-y-3">
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                    <span className="ml-2 text-gray-500">Loading debts...</span>
                  </div>
                ) : debts.length > 0 ? (
                  debts.map((debt) => (
                    <EnhancedDebtCard key={debt.id} debt={debt} />
                  ))
                ) : (
                  <div className="text-center py-8">
                    <TrendingDown className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No debts found</p>
                    <p className="text-sm text-gray-400">Add your first debt to get started!</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="reminders" className="h-full m-0 data-[state=active]:flex data-[state=active]:flex-col">
            <div className="p-4 flex-1 overflow-y-auto">
              <div className="space-y-4">
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                    <span className="ml-2 text-gray-500">Loading reminders...</span>
                  </div>
                ) : reminders.length > 0 ? (
                  reminders.map((reminder) => (
                    <PaymentReminderCard
                      key={reminder.id}
                      reminder={reminder}
                      onMarkPaid={handleMarkAsPaid}
                    />
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Bell className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No upcoming payments</p>
                    <p className="text-sm text-gray-400">You're all caught up! 🎉</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );

  return (
    <>
      {/* Collapsed View */}
      {!isExpanded && (
        <Card
          className="bg-card border-0 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
          onClick={toggleExpanded}
        >
          <CardContent className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="text-muted-foreground">
                  <TrendingDown className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-medium text-foreground">Debts</h3>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
              </Button>
            </div>

            {/* Collapsed Content */}
            <div className="space-y-4">
              {isInitialLoading ? (
                <div className="flex items-center justify-center py-4" role="status" aria-live="polite">
                  <Loader2 className="h-6 w-6 animate-spin text-gray-400" aria-hidden="true" />
                  <span className="ml-2 text-sm text-gray-500">Loading your debt data...</span>
                </div>
              ) : errors.debts && !hasAnyData ? (
                <ErrorDisplay
                  error={errors.debts}
                  onRetry={() => retryLoad('debts')}
                  retryCount={retryCount.debts}
                  title="Unable to load debt data"
                />
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Debt</p>
                      {loading.debts ? (
                        <SkeletonLoader className="h-9 w-32" ariaLabel="Loading total debt amount" />
                      ) : (
                        <p className="text-3xl font-semibold text-foreground">
                          {formatCurrency(debtMetrics.totalDebt)}
                        </p>
                      )}
                      {errors.debts && (
                        <p className="text-xs text-orange-500 mt-1">Using cached data</p>
                      )}
                    </div>
                    {loading.debts ? (
                      <div className="w-20 h-20 bg-gray-200 rounded-full animate-pulse" />
                    ) : (
                      <DebtProgressRing
                        progress={debtMetrics.progress}
                        size={80}
                        strokeWidth={8}
                        showPercentage={true}
                      />
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Monthly Payments</p>
                      {loading.debts ? (
                        <SkeletonLoader className="h-6 w-20" ariaLabel="Loading monthly payment amount" />
                      ) : (
                        <p className="text-lg font-medium text-foreground">
                          {formatCurrency(debtMetrics.totalDebtPayments)}
                        </p>
                      )}
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Debts</p>
                      {loading.debts ? (
                        <SkeletonLoader className="h-6 w-8" ariaLabel="Loading debt count" />
                      ) : (
                        <p className="text-lg font-medium text-foreground">{debtMetrics.debtCount}</p>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Expanded View - Full Screen Overlay */}
      {isExpanded && (
        <div className="fixed inset-0 bg-white z-50 overflow-hidden">
          {/* Header */}
          <div className="border-b border-fold-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={toggleExpanded}
                  className="p-2"
                >
                  ←
                </Button>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-fold-gray-100">
                    <TrendingDown className="h-5 w-5 text-fold-gray-600" />
                  </div>
                  <h3 className="font-medium text-fold-gray-900">Debts</h3>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="h-full flex flex-col">
            <Tabs defaultValue="insights" className="h-full flex flex-col">
              <TabsList className="grid w-full grid-cols-3 mx-6 mt-4 mb-0">
                <TabsTrigger value="insights">AI Insights</TabsTrigger>
                <TabsTrigger value="debts">Your Debts</TabsTrigger>
                <TabsTrigger value="reminders">Reminders</TabsTrigger>
              </TabsList>
              
              <div className="flex-1 overflow-hidden">
                <TabsContent value="insights" className="h-full m-0 data-[state=active]:flex data-[state=active]:flex-col">
                  <div className="p-4 md:p-6 flex-1 overflow-y-auto">
                    <div className="space-y-4 md:space-y-6">
                      {/* Key Metrics Cards */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                        <Card className="bg-gradient-to-br from-fold-blue-600 to-fold-blue-500 text-white">
                          <CardContent className="p-4">
                            <div className="text-lg md:text-xl font-semibold mb-1">Debt Analysis</div>
                            <div className="text-2xl md:text-3xl font-bold">6.5%</div>
                            <p className="text-xs md:text-sm opacity-90">Average Interest Rate</p>
                            <div className="mt-4 flex justify-between items-end">
                              <div className="text-xs opacity-75">Based on {debts.length} active debts</div>
                              <TrendingUp size={20} className="md:hidden" />
                              <TrendingUp size={24} className="hidden md:block" />
                            </div>
                          </CardContent>
                        </Card>
                        
                        <Card>
                          <CardContent className="p-4">
                            <div className="text-lg md:text-xl font-semibold mb-1 text-fold-gray-900">Potential Savings</div>
                            <div className="text-2xl md:text-3xl font-bold text-fold-success-600">{formatCurrency(490)}</div>
                            <p className="text-xs md:text-sm text-fold-gray-500">If you follow all recommendations</p>
                            <div className="mt-4 flex justify-between items-end">
                              <div className="text-xs text-fold-gray-400">Annual interest savings</div>
                              <div className="p-1 rounded-full bg-fold-success-100">
                                <Lightbulb size={16} className="text-fold-success-600 md:hidden" />
                                <Lightbulb size={20} className="text-fold-success-600 hidden md:block" />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                        
                        <Card className="sm:col-span-2 lg:col-span-1">
                          <CardContent className="p-4">
                            <div className="text-lg md:text-xl font-semibold mb-1 text-fold-gray-900">Debt Freedom</div>
                            <div className="text-2xl md:text-3xl font-bold text-fold-gray-900">4.8 years</div>
                            <p className="text-xs md:text-sm text-fold-gray-500">Estimated time to debt-free</p>
                            <div className="mt-4 flex justify-between items-end">
                              <div className="text-xs text-fold-gray-400">With current payment strategy</div>
                              <div className="p-1 rounded-full bg-fold-gray-100">
                                <TrendingDown size={16} className="text-fold-gray-600 md:hidden" />
                                <TrendingDown size={20} className="text-fold-gray-600 hidden md:block" />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                      
                      {/* Optimized Repayment Plan */}
                      <Card>
                        <CardContent className="p-4 md:p-6">
                          <div className="mb-4 md:mb-6">
                            <h2 className="text-lg md:text-xl font-semibold mb-2 text-fold-gray-900">Optimized Repayment Plan</h2>
                            <p className="text-sm md:text-base text-fold-gray-600">Our AI recommends this payment schedule to minimize interest</p>
                          </div>
                          
                          <div className="space-y-4 md:space-y-6">
                            <div className="border-b border-fold-gray-200 pb-4">
                              <h3 className="font-medium mb-3 md:mb-4 text-fold-gray-900">Step 1: Focus on High Interest Debt</h3>
                              <div className="relative pl-4 md:pl-6 ml-2 md:ml-4 border-l-2 border-fold-gray-200">
                                <div className="absolute w-3 h-3 md:w-4 md:h-4 bg-fold-blue-600 rounded-full -left-[7px] md:-left-[9px] top-1"></div>
                                <p className="font-semibold text-sm md:text-base text-fold-gray-900">Credit Card ({formatCurrency(3200)} remaining)</p>
                                <p className="text-xs md:text-sm text-fold-gray-600 mt-1">
                                  Pay {formatCurrency(350)}/month (additional {formatCurrency(200)} to minimum) to eliminate this debt in 10 months and save {formatCurrency(320)} in interest.
                                </p>
                              </div>
                            </div>
                            
                            <div className="border-b border-fold-gray-200 pb-4">
                              <h3 className="font-medium mb-3 md:mb-4 text-fold-gray-900">Step 2: Pay off Personal Loans</h3>
                              <div className="space-y-3 md:space-y-4">
                                <div className="relative pl-4 md:pl-6 ml-2 md:ml-4 border-l-2 border-fold-gray-200">
                                  <div className="absolute w-3 h-3 md:w-4 md:h-4 bg-fold-gray-300 rounded-full -left-[7px] md:-left-[9px] top-1"></div>
                                  <p className="font-semibold text-sm md:text-base text-fold-gray-900">Family Loan ({formatCurrency(1200)} remaining)</p>
                                  <p className="text-xs md:text-sm text-fold-gray-600 mt-1">
                                    Maintain {formatCurrency(500)}/month payments to clear this debt in just over 2 months.
                                  </p>
                                </div>
                                <div className="relative pl-4 md:pl-6 ml-2 md:ml-4 border-l-2 border-fold-gray-200">
                                  <div className="absolute w-3 h-3 md:w-4 md:h-4 bg-fold-gray-300 rounded-full -left-[7px] md:-left-[9px] top-1"></div>
                                  <p className="font-semibold text-sm md:text-base text-fold-gray-900">Car Loan ({formatCurrency(10500)} remaining)</p>
                                  <p className="text-xs md:text-sm text-fold-gray-600 mt-1">
                                    After Credit Card is paid off, add {formatCurrency(200)}/month to your car payment to pay it off faster.
                                  </p>
                                </div>
                              </div>
                            </div>
                            
                            <div className="pb-4">
                              <h3 className="font-medium mb-3 md:mb-4 text-fold-gray-900">Step 3: Target Long-term Debts</h3>
                              <div className="space-y-3 md:space-y-4">
                                <div className="relative pl-4 md:pl-6 ml-2 md:ml-4 border-l-2 border-fold-gray-200">
                                  <div className="absolute w-3 h-3 md:w-4 md:h-4 bg-fold-gray-300 rounded-full -left-[7px] md:-left-[9px] top-1"></div>
                                  <p className="font-semibold text-sm md:text-base text-fold-gray-900">Student Loan ({formatCurrency(12000)} remaining)</p>
                                  <p className="text-xs md:text-sm text-fold-gray-600 mt-1">
                                    Consider refinancing to lower your rate, then allocate additional funds after previous debts are paid.
                                  </p>
                                </div>
                                <div className="relative pl-4 md:pl-6 ml-2 md:ml-4">
                                  <div className="absolute w-3 h-3 md:w-4 md:h-4 bg-fold-gray-300 rounded-full -left-[7px] md:-left-[9px] top-1"></div>
                                  <p className="font-semibold text-sm md:text-base text-fold-gray-900">Home Mortgage ({formatCurrency(320000)} remaining)</p>
                                  <p className="text-xs md:text-sm text-fold-gray-600 mt-1">
                                    Continue regular payments while focusing on higher-interest debts.
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      {/* Recommended Actions */}
                      <Card>
                        <CardContent className="p-4 md:p-6">
                          <h2 className="text-lg md:text-xl font-semibold mb-4 text-fold-gray-900">Recommended Actions</h2>
                          <div className="space-y-3">
                            {aiRecommendations.map((suggestion, index) => (
                              <div key={suggestion.id} className="flex p-3 md:p-4 rounded-lg bg-fold-gray-50 hover:bg-fold-gray-100 transition-colors">
                                <div className="mr-3 md:mr-4 bg-fold-blue-100 text-fold-blue-800 h-5 w-5 md:h-6 md:w-6 flex items-center justify-center rounded-full font-semibold text-xs md:text-sm">
                                  {index + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-semibold text-sm md:text-base text-fold-gray-900">{suggestion.title}</h3>
                                  <p className="text-xs md:text-sm text-fold-gray-600 mt-0.5">{suggestion.description}</p>
                                </div>
                                <Button variant="ghost" size="sm" className="self-start shrink-0 text-xs md:text-sm">
                                  Apply
                                </Button>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="debts" className="h-full m-0 data-[state=active]:flex data-[state=active]:flex-col">
                  <div className="p-6 flex-1 overflow-y-auto space-y-4">
                    {/* DTI Indicator */}
                    <DTIIndicator
                      monthlyIncome={monthlyIncome}
                      totalMonthlyDebtPayments={totalDebtPayments}
                      housingPayments={housingPayments}
                    />
                    
                    {/* Add Debt Button */}
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">Your Debts</h4>
                      <Button size="sm" variant="outline" className="gap-1">
                        <Plus className="h-3 w-3" />
                        Add Debt
                      </Button>
                    </div>
                    
                    {/* Debt List */}
                    <div className="space-y-3">
                      {loading.debts ? (
                        <div className="space-y-3">
                          {[...Array(3)].map((_, i) => (
                            <div key={i} className="p-4 border rounded-lg">
                              <SkeletonLoader className="mb-2" />
                              <SkeletonLoader className="w-1/2" />
                            </div>
                          ))}
                        </div>
                      ) : errors.debts && debts.length === 0 ? (
                        <ErrorDisplay
                          error={errors.debts}
                          onRetry={() => retryLoad('debts')}
                          retryCount={retryCount.debts}
                          title="Failed to load debts"
                        />
                      ) : debts.length > 0 ? (
                        <>
                          {errors.debts && (
                            <div className="bg-orange-50 border border-orange-200 rounded p-3 mb-4">
                              <p className="text-xs text-orange-600">Using cached debt data</p>
                            </div>
                          )}
                          {debts.map((debt) => (
                            <EnhancedDebtCard key={debt.id} debt={debt} />
                          ))}
                        </>
                      ) : (
                        <div className="text-center py-8">
                          <TrendingDown className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                          <p className="text-gray-500">No debts found</p>
                          <p className="text-sm text-gray-400">Add your first debt to get started!</p>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="reminders" className="h-full m-0 data-[state=active]:flex data-[state=active]:flex-col">
                  <div className="p-6 flex-1 overflow-y-auto">
                    <div className="space-y-4">
                      {loading.debts ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                          <span className="ml-2 text-gray-500">Loading reminders...</span>
                        </div>
                      ) : reminders.length > 0 ? (
                        <>
                          {errors.debts && (
                            <div className="bg-orange-50 border border-orange-200 rounded p-3 mb-4">
                              <p className="text-xs text-orange-600">Reminders based on cached debt data</p>
                            </div>
                          )}
                          {reminders.map((reminder) => (
                            <PaymentReminderCard
                              key={reminder.id}
                              reminder={reminder}
                              onMarkPaid={handleMarkAsPaid}
                            />
                          ))}
                        </>
                      ) : (
                        <div className="text-center py-8">
                          <Bell className="h-12 w-12 text-fold-gray-300 mx-auto mb-3" />
                          <p className="text-fold-gray-500">No upcoming payments</p>
                          <p className="text-sm text-fold-gray-400">You're all caught up! 🎉</p>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      )}
    </>
  );
};

export default DebtWidget;