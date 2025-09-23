import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Progress } from '@/components/ui/progress';
import {
  TrendingUp,
  DollarSign,
  Percent,
  Calendar,
  ChevronDown,
  ChevronUp,
  CreditCard,
  Home,
  GraduationCap,
  User,
  Car,
  Heart,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Debt, DebtSummary } from '@/types/debt';
import { formatCurrency, formatDate } from '@/lib/utils';
import DebtProgressRing from '@/components/debt/DebtProgressRing';

interface DebtOverviewTabProps {
  debts: Debt[];
  summary: DebtSummary | null;
  isLoading?: boolean;
  onDebtClick?: (debt: Debt) => void;
}

const getDebtIcon = (type: string) => {
  const icons = {
    credit_card: CreditCard,
    home_loan: Home,
    mortgage: Home,
    education_loan: GraduationCap,
    student_loan: GraduationCap,
    personal_loan: User,
    vehicle_loan: Car,
    auto_loan: Car,
    family_loan: Heart,
    other: User
  };
  return icons[type] || User;
};

const getDebtTypeColor = (type: string) => {
  const colors = {
    credit_card: 'bg-red-100 text-red-700 border-red-200',
    home_loan: 'bg-green-100 text-green-700 border-green-200',
    mortgage: 'bg-green-100 text-green-700 border-green-200',
    education_loan: 'bg-blue-100 text-blue-700 border-blue-200',
    student_loan: 'bg-blue-100 text-blue-700 border-blue-200',
    personal_loan: 'bg-purple-100 text-purple-700 border-purple-200',
    vehicle_loan: 'bg-gray-100 text-gray-700 border-gray-200',
    auto_loan: 'bg-gray-100 text-gray-700 border-gray-200',
    family_loan: 'bg-pink-100 text-pink-700 border-pink-200',
    other: 'bg-yellow-100 text-yellow-700 border-yellow-200'
  };
  return colors[type] || colors.other;
};

const DebtOverviewTab: React.FC<DebtOverviewTabProps> = ({
  debts,
  summary,
  isLoading = false,
  onDebtClick
}) => {
  const [expandedDebts, setExpandedDebts] = useState<Set<string>>(new Set());

  const toggleDebtExpansion = (debtId: string) => {
    const newExpanded = new Set(expandedDebts);
    if (newExpanded.has(debtId)) {
      newExpanded.delete(debtId);
    } else {
      newExpanded.add(debtId);
    }
    setExpandedDebts(newExpanded);
  };

  // Calculate metrics
  const totalDebt = summary?.total_debt || debts.reduce((sum, debt) => sum + debt.current_balance, 0);
  const totalOriginal = debts.reduce((sum, debt) => sum + debt.principal_amount, 0);
  const averageInterest = summary?.average_interest_rate ||
    (debts.length > 0 ? debts.reduce((sum, debt) => sum + debt.interest_rate, 0) / debts.length : 0);
  const progressPercentage = totalOriginal > 0 ? ((totalOriginal - totalDebt) / totalOriginal) * 100 : 0;

  // Calculate DTI (assuming monthly income - this would come from user profile)
  const monthlyPayments = summary?.total_minimum_payments ||
    debts.reduce((sum, debt) => sum + debt.minimum_payment, 0);

  // Sort debts by balance (highest first)
  const sortedDebts = [...debts].sort((a, b) => b.current_balance - a.current_balance);

  const MetricCard = ({
    title,
    value,
    icon: Icon,
    subtitle,
    color = 'blue',
    progress
  }: {
    title: string;
    value: string | number;
    icon: React.ComponentType<any>;
    subtitle?: string;
    color?: 'blue' | 'green' | 'red' | 'yellow';
    progress?: number;
  }) => (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="h-full">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <Icon className={`h-5 w-5 text-${color}-600`} />
            {progress !== undefined && (
              <div className="text-right">
                <div className="text-xs text-gray-500 mb-1">{progress.toFixed(1)}%</div>
                <div className={`w-12 h-1 bg-gray-200 rounded-full overflow-hidden`}>
                  <div
                    className={`h-full bg-${color}-500 transition-all duration-300`}
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>
          <div className="text-lg font-bold text-gray-900">{value}</div>
          <div className="text-xs text-gray-500">{title}</div>
          {subtitle && <div className="text-xs text-gray-400 mt-1">{subtitle}</div>}
        </CardContent>
      </Card>
    </motion.div>
  );

  const DebtCard = ({ debt }: { debt: Debt }) => {
    const Icon = getDebtIcon(debt.debt_type);
    const colorClass = getDebtTypeColor(debt.debt_type);
    const progress = debt.principal_amount > 0
      ? ((debt.principal_amount - debt.current_balance) / debt.principal_amount) * 100
      : 0;
    const isExpanded = expandedDebts.has(debt.id);
    const isOverdue = debt.days_past_due > 0;
    const isDueSoon = new Date(debt.due_date) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className={`overflow-hidden ${isOverdue ? 'border-red-300 bg-red-50' : ''}`}>
          <Collapsible open={isExpanded} onOpenChange={() => toggleDebtExpansion(debt.id)}>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${colorClass}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{debt.name}</CardTitle>
                      <p className="text-sm text-gray-500">{debt.lender}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <div className="text-lg font-bold">
                        {formatCurrency(debt.current_balance)}
                      </div>
                      <div className="text-xs text-gray-500">
                        of {formatCurrency(debt.principal_amount)}
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                </div>

                {/* Status badges */}
                <div className="flex items-center gap-2 mt-2">
                  {debt.is_high_priority && (
                    <Badge variant="destructive" className="text-xs">
                      High Priority
                    </Badge>
                  )}
                  {isOverdue && (
                    <Badge variant="destructive" className="text-xs">
                      {debt.days_past_due} days overdue
                    </Badge>
                  )}
                  {isDueSoon && !isOverdue && (
                    <Badge variant="outline" className="text-xs border-yellow-300 text-yellow-700">
                      Due Soon
                    </Badge>
                  )}
                  {debt.is_tax_deductible && (
                    <Badge variant="secondary" className="text-xs">
                      Tax Deductible
                    </Badge>
                  )}
                  {progress >= 50 && !isOverdue && (
                    <Badge variant="outline" className="text-xs border-green-300 text-green-700">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      On Track
                    </Badge>
                  )}
                </div>

                {/* Progress bar */}
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Progress</span>
                    <span>{progress.toFixed(1)}% paid</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              </CardHeader>
            </CollapsibleTrigger>

            <CollapsibleContent>
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="space-y-3">
                    <div>
                      <div className="text-xs text-gray-500">Interest Rate</div>
                      <div className="font-medium">
                        {debt.interest_rate}%
                        {debt.is_variable_rate && (
                          <span className="text-xs text-orange-600 ml-1">Variable</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Minimum Payment</div>
                      <div className="font-medium">{formatCurrency(debt.minimum_payment)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Payment Frequency</div>
                      <div className="font-medium capitalize">
                        {debt.payment_frequency.replace('_', ' ')}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="text-xs text-gray-500">Due Date</div>
                      <div className="font-medium">{formatDate(debt.due_date)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Remaining Term</div>
                      <div className="font-medium">
                        {debt.remaining_term_months ? `${debt.remaining_term_months} months` : 'N/A'}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Debt Type</div>
                      <div className="font-medium capitalize">
                        {debt.debt_type.replace('_', ' ')}
                      </div>
                    </div>
                  </div>
                </div>

                {debt.notes && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <div className="text-xs text-gray-500 mb-1">Notes</div>
                    <div className="text-sm">{debt.notes}</div>
                  </div>
                )}

                <div className="flex gap-2 mt-4">
                  <Button size="sm" onClick={() => onDebtClick?.(debt)}>
                    Make Payment
                  </Button>
                  <Button variant="outline" size="sm">
                    Edit Details
                  </Button>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>
      </motion.div>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Loading skeleton for metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="h-24">
              <CardContent className="p-4">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Loading skeleton for debts */}
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="h-32">
              <CardContent className="p-4">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Quick Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          title="Total Debt"
          value={formatCurrency(totalDebt)}
          icon={DollarSign}
          color="red"
          subtitle={`${debts.length} active debts`}
        />
        <MetricCard
          title="Average Interest"
          value={`${averageInterest.toFixed(1)}%`}
          icon={Percent}
          color="yellow"
        />
        <MetricCard
          title="Monthly Payments"
          value={formatCurrency(monthlyPayments)}
          icon={Calendar}
          color="blue"
          subtitle="Minimum required"
        />
        <MetricCard
          title="Debt Progress"
          value={`${progressPercentage.toFixed(1)}%`}
          icon={TrendingUp}
          color="green"
          progress={progressPercentage}
          subtitle="Total debt paid"
        />
      </div>

      {/* Progress Ring */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <DebtProgressRing
                progress={progressPercentage}
                size={150}
                strokeWidth={8}
                showPercentage={true}
              />
              <div className="mt-4">
                <div className="text-sm text-gray-500">Overall Progress</div>
                <div className="text-lg font-semibold">
                  {formatCurrency(totalOriginal - totalDebt)} paid
                </div>
                <div className="text-sm text-gray-400">
                  {formatCurrency(totalDebt)} remaining
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Debt List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Your Debts</h3>
          <div className="text-sm text-gray-500">
            Sorted by balance (highest first)
          </div>
        </div>

        {sortedDebts.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="text-gray-400 mb-2">No debts found</div>
              <div className="text-sm text-gray-500">
                Add your first debt to start tracking your progress
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {sortedDebts.map((debt) => (
              <DebtCard key={debt.id} debt={debt} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DebtOverviewTab;