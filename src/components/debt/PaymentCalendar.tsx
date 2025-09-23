import React, { useState, useMemo } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface PaymentEvent {
  id: string;
  date: string; // YYYY-MM-DD format
  amount: number;
  debt_name: string;
  status: 'paid' | 'overdue' | 'upcoming' | 'due_today';
  type: 'payment' | 'emi' | 'reminder';
}

interface PaymentCalendarProps {
  payments: PaymentEvent[];
  selectedDate?: Date;
  onDateSelect?: (date: Date | undefined) => void;
  className?: string;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

const PaymentCalendar: React.FC<PaymentCalendarProps> = ({
  payments = [],
  selectedDate,
  onDateSelect,
  className = '',
  isCollapsed = false,
  onToggleCollapse
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Create a map of dates to payment events
  const paymentsByDate = useMemo(() => {
    const map = new Map<string, PaymentEvent[]>();
    payments.forEach(payment => {
      const dateKey = payment.date;
      if (!map.has(dateKey)) {
        map.set(dateKey, []);
      }
      map.get(dateKey)!.push(payment);
    });
    return map;
  }, [payments]);

  // Get the most important status for a date (for dot color)
  const getDateStatus = (date: Date): string | null => {
    const dateStr = date.toISOString().split('T')[0];
    const dayPayments = paymentsByDate.get(dateStr);

    if (!dayPayments || dayPayments.length === 0) return null;

    // Priority: overdue > due_today > upcoming > paid
    if (dayPayments.some(p => p.status === 'overdue')) return 'overdue';
    if (dayPayments.some(p => p.status === 'due_today')) return 'due_today';
    if (dayPayments.some(p => p.status === 'upcoming')) return 'upcoming';
    if (dayPayments.some(p => p.status === 'paid')) return 'paid';

    return null;
  };

  // Get status color
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'paid': return 'bg-green-500';
      case 'overdue': return 'bg-red-500';
      case 'due_today': return 'bg-orange-500';
      case 'upcoming': return 'bg-yellow-500';
      default: return 'bg-gray-300';
    }
  };

  // Custom day component to show status dots
  const DayContent = ({ date }: { date: Date }) => {
    const status = getDateStatus(date);

    return (
      <div className="relative w-full h-full flex items-center justify-center">
        <span>{date.getDate()}</span>
        {status && (
          <div
            className={cn(
              'absolute -bottom-1 -right-1 w-2 h-2 rounded-full',
              getStatusColor(status)
            )}
          />
        )}
      </div>
    );
  };

  // Calculate payment counts
  const paymentCounts = useMemo(() => {
    const counts = {
      upcoming: 0,
      overdue: 0,
      paid: 0
    };

    payments.forEach(payment => {
      if (payment.status === 'upcoming' || payment.status === 'due_today') {
        counts.upcoming++;
      } else if (payment.status === 'overdue') {
        counts.overdue++;
      } else if (payment.status === 'paid') {
        counts.paid++;
      }
    });

    return counts;
  }, [payments]);

  if (isCollapsed) {
    return (
      <motion.div
        initial={{ height: 'auto' }}
        animate={{ height: 60 }}
        transition={{ duration: 0.3 }}
        className={cn('overflow-hidden', className)}
      >
        <Card className="h-full border-b-0">
          <CardContent className="p-4 h-full">
            <div className="flex items-center justify-between h-full">
              <div className="flex items-center gap-4">
                <div className="text-sm font-medium">
                  {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </div>

                {/* Status indicators */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                    <span className="text-xs text-gray-600">Upcoming: ₹{paymentCounts.upcoming}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-red-500 rounded-full" />
                    <span className="text-xs text-gray-600">Overdue: ₹{paymentCounts.overdue}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-green-500 rounded-full" />
                    <span className="text-xs text-gray-600">Paid: ₹{paymentCounts.paid}</span>
                  </div>
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleCollapse}
                className="p-1"
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ height: 60 }}
      animate={{ height: 'auto' }}
      transition={{ duration: 0.3 }}
      className={cn('overflow-hidden', className)}
    >
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Payment Calendar</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleCollapse}
              className="p-1"
            >
              <ChevronUp className="h-4 w-4" />
            </Button>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-500 rounded-full" />
              <span>Paid</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-red-500 rounded-full" />
              <span>Overdue</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-orange-500 rounded-full" />
              <span>Due Today</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-yellow-500 rounded-full" />
              <span>Upcoming</span>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={onDateSelect}
            month={currentMonth}
            onMonthChange={setCurrentMonth}
            className="rounded-md border-0"
            components={{
              DayContent
            }}
            modifiers={{
              hasPayment: (date) => {
                const dateStr = date.toISOString().split('T')[0];
                return paymentsByDate.has(dateStr);
              }
            }}
            modifiersClassNames={{
              hasPayment: 'font-semibold'
            }}
          />

          {/* Selected date details */}
          <AnimatePresence>
            {selectedDate && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="mt-4 pt-4 border-t"
              >
                <div className="text-sm font-medium mb-2">
                  {selectedDate.toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>

                {(() => {
                  const dateStr = selectedDate.toISOString().split('T')[0];
                  const dayPayments = paymentsByDate.get(dateStr);

                  if (!dayPayments || dayPayments.length === 0) {
                    return (
                      <p className="text-sm text-gray-500">No payments scheduled for this date</p>
                    );
                  }

                  return (
                    <div className="space-y-2">
                      {dayPayments.map((payment) => (
                        <div
                          key={payment.id}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className={cn(
                                'w-2 h-2 rounded-full',
                                getStatusColor(payment.status)
                              )}
                            />
                            <div>
                              <div className="text-sm font-medium">{payment.debt_name}</div>
                              <div className="text-xs text-gray-500 capitalize">
                                {payment.type} • {payment.status.replace('_', ' ')}
                              </div>
                            </div>
                          </div>
                          <div className="text-sm font-semibold">
                            ₹{payment.amount.toLocaleString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default PaymentCalendar;