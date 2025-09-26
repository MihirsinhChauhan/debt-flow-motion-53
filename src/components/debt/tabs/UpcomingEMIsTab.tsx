import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Calendar,
  CreditCard,
  AlertTriangle,
  CheckCircle,
  Clock,
  Bell,
  IndianRupee,
  Filter,
  ArrowRight,
  Home,
  GraduationCap,
  User,
  Car,
  Heart
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Debt } from '@/types/debt';
import { formatCurrency, formatDate, cn } from '@/lib/utils';
import PaymentDialog from '@/components/payments/PaymentDialog';
import { usePaymentOperations } from '@/hooks/usePaymentOperations';

interface UpcomingPayment {
  id: string;
  debt_id: string;
  debt_name: string;
  debt_type: string;
  lender: string;
  amount: number;
  due_date: string;
  status: 'upcoming' | 'due_today' | 'overdue' | 'paid';
  payment_type: 'minimum' | 'extra' | 'full';
  is_automated?: boolean;
  reminder_set?: boolean;
  days_until_due: number;
}

interface UpcomingEMIsTabProps {
  debts: Debt[];
  isLoading?: boolean;
  onDebtUpdate?: () => void;
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

const getStatusConfig = (status: string, daysUntilDue: number) => {
  switch (status) {
    case 'paid':
      return {
        color: 'green',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        textColor: 'text-green-800',
        icon: CheckCircle,
        label: 'Paid'
      };
    case 'overdue':
      return {
        color: 'red',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-300',
        textColor: 'text-red-800',
        icon: AlertTriangle,
        label: `${Math.abs(daysUntilDue)} days overdue`
      };
    case 'due_today':
      return {
        color: 'orange',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-300',
        textColor: 'text-orange-800',
        icon: Clock,
        label: 'Due today'
      };
    case 'upcoming':
      return {
        color: daysUntilDue <= 7 ? 'yellow' : 'gray',
        bgColor: daysUntilDue <= 7 ? 'bg-yellow-50' : 'bg-gray-50',
        borderColor: daysUntilDue <= 7 ? 'border-yellow-300' : 'border-gray-200',
        textColor: daysUntilDue <= 7 ? 'text-yellow-800' : 'text-gray-600',
        icon: Calendar,
        label: daysUntilDue <= 7 ? `Due in ${daysUntilDue} days` : `Due in ${daysUntilDue} days`
      };
    default:
      return {
        color: 'gray',
        bgColor: 'bg-gray-50',
        borderColor: 'border-gray-200',
        textColor: 'text-gray-600',
        icon: Calendar,
        label: 'Unknown'
      };
  }
};

const UpcomingEMIsTab: React.FC<UpcomingEMIsTabProps> = ({
  debts,
  isLoading = false,
  onDebtUpdate
}) => {
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'overdue' | 'due_today'>('all');

  // Payment operations hook
  const { processPayment, isLoading: isPaymentLoading } = usePaymentOperations(
    (debtId: string, newBalance: number) => {
      // Callback when payment is successful
      onDebtUpdate?.();
    }
  );

  // Generate upcoming payments from debts
  const upcomingPayments = useMemo(() => {
    const payments: UpcomingPayment[] = [];
    const today = new Date();

    debts.forEach(debt => {
      const dueDate = new Date(debt.due_date);
      const timeDiff = dueDate.getTime() - today.getTime();
      const daysUntilDue = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

      let status: UpcomingPayment['status'] = 'upcoming';
      if (daysUntilDue < 0) status = 'overdue';
      else if (daysUntilDue === 0) status = 'due_today';

      // Generate next few payments for each debt
      for (let i = 0; i < 3; i++) {
        const paymentDate = new Date(dueDate);

        // Add months based on payment frequency
        const monthsToAdd = debt.payment_frequency === 'monthly' ? i :
                           debt.payment_frequency === 'quarterly' ? i * 3 :
                           debt.payment_frequency === 'weekly' ? 0 : i;

        if (debt.payment_frequency === 'weekly') {
          paymentDate.setDate(paymentDate.getDate() + (i * 7));
        } else {
          paymentDate.setMonth(paymentDate.getMonth() + monthsToAdd);
        }

        const paymentTimeDiff = paymentDate.getTime() - today.getTime();
        const paymentDaysUntilDue = Math.ceil(paymentTimeDiff / (1000 * 60 * 60 * 24));

        let paymentStatus: UpcomingPayment['status'] = 'upcoming';
        if (paymentDaysUntilDue < 0) paymentStatus = 'overdue';
        else if (paymentDaysUntilDue === 0) paymentStatus = 'due_today';

        // Only include payments within next 90 days
        if (paymentDaysUntilDue <= 90) {
          payments.push({
            id: `${debt.id}-${i}`,
            debt_id: debt.id,
            debt_name: debt.name,
            debt_type: debt.debt_type,
            lender: debt.lender,
            amount: debt.minimum_payment,
            due_date: paymentDate.toISOString().split('T')[0],
            status: paymentStatus,
            payment_type: 'minimum',
            is_automated: false,
            reminder_set: false,
            days_until_due: paymentDaysUntilDue
          });
        }
      }
    });

    return payments.sort((a, b) => a.days_until_due - b.days_until_due);
  }, [debts]);

  // Filter payments
  const filteredPayments = useMemo(() => {
    if (filter === 'all') return upcomingPayments;
    return upcomingPayments.filter(payment => payment.status === filter);
  }, [upcomingPayments, filter]);

  // Group payments by date
  const groupedPayments = useMemo(() => {
    const groups = new Map<string, UpcomingPayment[]>();

    filteredPayments.forEach(payment => {
      const date = payment.due_date;
      if (!groups.has(date)) {
        groups.set(date, []);
      }
      groups.get(date)!.push(payment);
    });

    return Array.from(groups.entries()).map(([date, payments]) => ({
      date,
      payments: payments.sort((a, b) => b.amount - a.amount)
    }));
  }, [filteredPayments]);

  // Calculate summary stats
  const summaryStats = useMemo(() => {
    const stats = {
      totalUpcoming: 0,
      totalOverdue: 0,
      totalDueToday: 0,
      amountUpcoming: 0,
      amountOverdue: 0,
      amountDueToday: 0
    };

    upcomingPayments.forEach(payment => {
      switch (payment.status) {
        case 'upcoming':
          stats.totalUpcoming++;
          stats.amountUpcoming += payment.amount;
          break;
        case 'overdue':
          stats.totalOverdue++;
          stats.amountOverdue += payment.amount;
          break;
        case 'due_today':
          stats.totalDueToday++;
          stats.amountDueToday += payment.amount;
          break;
      }
    });

    return stats;
  }, [upcomingPayments]);

  const PaymentCard = ({ payment }: { payment: UpcomingPayment }) => {
    const Icon = getDebtIcon(payment.debt_type);
    const StatusIcon = getStatusConfig(payment.status, payment.days_until_due).icon;
    const config = getStatusConfig(payment.status, payment.days_until_due);

    // Find the corresponding debt for this payment
    const correspondingDebt = debts.find(debt => debt.id === payment.debt_id);

    // Handle payment submission
    const handlePaymentSubmit = async (paymentData: any) => {
      if (!correspondingDebt) {
        console.error('Debt not found for payment:', payment.debt_id);
        return false;
      }
      return await processPayment(correspondingDebt, paymentData);
    };

    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className={cn(
          'p-3 sm:p-4 rounded-lg border-l-4 transition-all hover:shadow-md',
          config.bgColor,
          config.borderColor
        )}
      >
        {/* Mobile-optimized layout */}
        <div className="space-y-2 sm:space-y-3">
          {/* Header Section */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2 flex-1 min-w-0">
              <div className="p-1.5 sm:p-2 bg-white rounded-md shadow-sm flex-shrink-0">
                <Icon className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1 sm:gap-2 mb-1 flex-wrap">
                  <h4 className="font-semibold text-gray-900 text-xs sm:text-sm truncate max-w-[100px] sm:max-w-none">{payment.debt_name}</h4>
                  <Badge variant="outline" className="text-[10px] sm:text-xs px-1 py-0">
                    {payment.payment_type}
                  </Badge>
                </div>

                <p className="text-[10px] sm:text-xs text-gray-600 mb-1 sm:mb-2 truncate max-w-[80px] sm:max-w-none">{payment.lender}</p>

                {/* Mobile: Stack badges vertically */}
                <div className="flex items-center gap-1 sm:gap-2 text-[10px] sm:text-xs text-gray-500 flex-wrap">
                  <span className="capitalize">{payment.debt_type.replace('_', ' ')}</span>
                  {payment.is_automated && (
                    <Badge variant="secondary" className="text-[10px] sm:text-xs px-1 py-0">
                      Auto-pay
                    </Badge>
                  )}
                  {payment.reminder_set && (
                    <Badge variant="outline" className="text-[10px] sm:text-xs px-1 py-0">
                      <Bell className="h-2 w-2 sm:h-3 sm:w-3 mr-0.5" />
                      Reminder
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Amount and Status - Mobile responsive */}
            <div className="text-right flex-shrink-0 min-w-0">
              <div className="text-xs sm:text-sm lg:text-base font-bold text-gray-900 mb-0.5 sm:mb-1">
                {formatCurrency(payment.amount)}
              </div>
              <div className={cn('flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-xs justify-end', config.textColor)}>
                <StatusIcon className="h-2 w-2 sm:h-3 sm:w-3 flex-shrink-0" />
                <span className="whitespace-nowrap">{config.label}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons - Improved Mobile Layout */}
          <div className="flex items-center justify-between gap-2">
            {/* Secondary actions - Mobile layout */}
            <div className="flex gap-1 sm:gap-2 sm:hidden">
              <Button variant="outline" size="sm" className="h-6 text-[10px] px-2">
                <Bell className="h-2 w-2 mr-0.5" />
                <span className="hidden xs:inline">Remind</span>
              </Button>
              <Button variant="ghost" size="sm" className="h-6 text-[10px] px-2">
                <ArrowRight className="h-2 w-2 mr-0.5" />
                <span className="hidden xs:inline">Details</span>
              </Button>
            </div>

            {/* Primary action - Compact mobile button */}
            <div className="flex-shrink-0">
              {correspondingDebt ? (
                <PaymentDialog
                  debt={correspondingDebt}
                  onPaymentSubmit={handlePaymentSubmit}
                  isLoading={isPaymentLoading}
                  trigger={
                    <Button size="sm" className="h-6 sm:h-8 text-[10px] sm:text-xs px-2 sm:px-3">
                      <IndianRupee className="h-2 w-2 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" />
                      Pay
                    </Button>
                  }
                />
              ) : (
                <Button size="sm" className="h-6 sm:h-8 text-[10px] sm:text-xs px-2 sm:px-3" disabled>
                  <IndianRupee className="h-2 w-2 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" />
                  Pay
                </Button>
              )}
            </div>

            {/* Desktop layout */}
            <div className="hidden sm:flex items-center gap-2">
              <Button variant="outline" size="sm" className="h-8 text-xs">
                Set Reminder
              </Button>
              <Button variant="ghost" size="sm" className="h-8 text-xs">
                Details
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Loading skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
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
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards - Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <Clock className="h-5 w-5 text-yellow-600" />
              <Badge variant="outline" className="text-yellow-700 border-yellow-300">
                {summaryStats.totalUpcoming}
              </Badge>
            </div>
            <div className="text-lg font-bold text-yellow-900 mt-2">
              {formatCurrency(summaryStats.amountUpcoming)}
            </div>
            <div className="text-sm text-yellow-700">Upcoming Payments</div>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <Badge variant="outline" className="text-orange-700 border-orange-300">
                {summaryStats.totalDueToday}
              </Badge>
            </div>
            <div className="text-lg font-bold text-orange-900 mt-2">
              {formatCurrency(summaryStats.amountDueToday)}
            </div>
            <div className="text-sm text-orange-700">Due Today</div>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <Badge variant="destructive">
                {summaryStats.totalOverdue}
              </Badge>
            </div>
            <div className="text-lg font-bold text-red-900 mt-2">
              {formatCurrency(summaryStats.amountOverdue)}
            </div>
            <div className="text-sm text-red-700">Overdue</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          {/* Mobile: Stack title and tabs vertically */}
          <div className="space-y-3 sm:space-y-0">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
              Payment Timeline
            </CardTitle>
            <Tabs value={filter} onValueChange={(value: any) => setFilter(value)} className="w-full">
              <TabsList className="w-full sm:w-auto grid grid-cols-4 sm:flex">
                <TabsTrigger value="all" className="text-xs sm:text-sm px-2 sm:px-3">All</TabsTrigger>
                <TabsTrigger value="overdue" className="text-xs sm:text-sm px-2 sm:px-3">Overdue</TabsTrigger>
                <TabsTrigger value="due_today" className="text-xs sm:text-sm px-2 sm:px-3">Due Today</TabsTrigger>
                <TabsTrigger value="upcoming" className="text-xs sm:text-sm px-2 sm:px-3">Upcoming</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>

        <CardContent>
          {groupedPayments.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 mb-2">No payments found</p>
              <p className="text-sm text-gray-400">
                {filter === 'all'
                  ? 'No upcoming payments in the next 90 days'
                  : `No ${filter.replace('_', ' ')} payments`
                }
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {groupedPayments.map(({ date, payments }) => (
                <div key={date} className="space-y-3">
                  {/* Date Header */}
                  <div className="flex items-center gap-3">
                    <div className="text-sm font-semibold text-gray-900">
                      {new Date(date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                    <div className="flex-1 h-px bg-gray-200"></div>
                    <div className="text-xs text-gray-500">
                      {payments.length} payment{payments.length !== 1 ? 's' : ''}
                    </div>
                  </div>

                  {/* Payments for this date */}
                  <div className="space-y-3">
                    {payments.map((payment) => (
                      <PaymentCard key={payment.id} payment={payment} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader className="pb-2 sm:pb-3">
          <CardTitle className="text-sm sm:text-base">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-6">
          <div className="space-y-2 sm:space-y-3">
            {/* Mobile: Compact grid */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
              <Button variant="outline" className="flex items-center justify-center gap-1 sm:gap-2 h-8 sm:h-10">
                <IndianRupee className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="text-xs sm:text-sm">Pay All</span>
              </Button>
              <Button variant="outline" className="flex items-center justify-center gap-1 sm:gap-2 h-8 sm:h-10">
                <Bell className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="text-xs sm:text-sm">Reminders</span>
              </Button>
              <Button variant="outline" className="flex items-center justify-center gap-1 sm:gap-2 h-8 sm:h-10">
                <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="text-xs sm:text-sm">Schedule</span>
              </Button>
              <Button variant="outline" className="flex items-center justify-center gap-1 sm:gap-2 h-8 sm:h-10">
                <Filter className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="text-xs sm:text-sm">Auto-pay</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UpcomingEMIsTab;