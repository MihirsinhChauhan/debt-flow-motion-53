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
  DollarSign,
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
  isLoading = false
}) => {
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'overdue' | 'due_today'>('all');

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

    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className={cn(
          'p-4 rounded-lg border-l-4 transition-all hover:shadow-md',
          config.bgColor,
          config.borderColor
        )}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-white rounded-lg shadow-sm">
              <Icon className="h-4 w-4 text-gray-600" />
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold text-gray-900">{payment.debt_name}</h4>
                <Badge variant="outline" className="text-xs">
                  {payment.payment_type}
                </Badge>
              </div>

              <p className="text-sm text-gray-600 mb-2">{payment.lender}</p>

              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span className="capitalize">{payment.debt_type.replace('_', ' ')}</span>
                {payment.is_automated && (
                  <Badge variant="secondary" className="text-xs">
                    Auto-pay
                  </Badge>
                )}
                {payment.reminder_set && (
                  <Badge variant="outline" className="text-xs">
                    <Bell className="h-3 w-3 mr-1" />
                    Reminder
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-lg font-bold text-gray-900 mb-1">
              {formatCurrency(payment.amount)}
            </div>
            <div className={cn('flex items-center gap-1 text-xs', config.textColor)}>
              <StatusIcon className="h-3 w-3" />
              <span>{config.label}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-4">
          <Button size="sm" className="flex-1">
            Pay Now
          </Button>
          <Button variant="outline" size="sm">
            Set Reminder
          </Button>
          <Button variant="ghost" size="sm">
            Details
          </Button>
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
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              Payment Timeline
            </CardTitle>
            <Tabs value={filter} onValueChange={(value: any) => setFilter(value)}>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="overdue">Overdue</TabsTrigger>
                <TabsTrigger value="due_today">Due Today</TabsTrigger>
                <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
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
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button variant="outline" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Pay All Due
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Set Reminders
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Schedule Payments
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Setup Auto-pay
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UpcomingEMIsTab;