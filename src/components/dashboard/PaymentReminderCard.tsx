
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, CheckCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface Reminder {
  id: string;
  debtId: string;
  dueDate: string;
  amount: number;
  message: string;
  isPast: boolean;
  isToday: boolean;
}

interface PaymentReminderCardProps {
  reminder: Reminder;
  onMarkPaid: (id: string) => void;
}

const PaymentReminderCard = ({ reminder, onMarkPaid }: PaymentReminderCardProps) => {
  const handleMarkPaid = () => {
    onMarkPaid(reminder.id);
  };
  
  // Calculate days remaining
  const dueDate = new Date(reminder.dueDate);
  const today = new Date();
  const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  const getStatusClass = () => {
    if (reminder.isPast) return "bg-destructive/5 border-destructive/20";
    if (reminder.isToday) return "bg-warning/5 border-warning/20";
    return "bg-primary/5 border-primary/20";
  };

  const getStatusColor = () => {
    if (reminder.isPast) return "text-destructive";
    if (reminder.isToday) return "text-warning";
    return "text-primary";
  };

  const getDueDateText = () => {
    if (reminder.isPast) return "Past due";
    if (reminder.isToday) return "Due today";
    if (daysUntilDue === 1) return "Due tomorrow";
    return `Due in ${daysUntilDue} days`;
  };

  return (
    <Card className={`border ${getStatusClass()} animate-fade-in w-full`}>
      <CardContent className="p-4 sm:p-6">
        {/* Mobile-first header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-3">
            <Calendar className={`h-5 w-5 ${getStatusColor()}`} />
            <div>
              <span className={`text-mobile-body sm:text-base font-semibold ${getStatusColor()}`}>
                {getDueDateText()}
              </span>
            </div>
          </div>
          <div className={`text-lg sm:text-xl font-bold ${getStatusColor()}`}>
            {formatCurrency(reminder.amount)}
          </div>
        </div>

        {/* Message */}
        <p className="text-mobile-body text-muted-foreground mt-3 leading-relaxed">
          {reminder.message}
        </p>

        {/* Action button - Full width on mobile */}
        <div className="mt-4 pt-3 border-t border-border/30">
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkPaid}
            className="w-full sm:w-auto gap-2"
          >
            <CheckCircle className="h-4 w-4" />
            Mark as Paid
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentReminderCard;
