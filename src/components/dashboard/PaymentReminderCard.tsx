
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
    if (reminder.isPast) return "bg-red-50 border-red-200";
    if (reminder.isToday) return "bg-yellow-50 border-yellow-200";
    return "bg-blue-50 border-blue-200";
  };

  const getDueDateText = () => {
    if (reminder.isPast) return "Past due";
    if (reminder.isToday) return "Due today";
    if (daysUntilDue === 1) return "Due tomorrow";
    return `Due in ${daysUntilDue} days`;
  };

  return (
    <Card className={`border ${getStatusClass()} animate-fade-in`}>
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium">{getDueDateText()}</span>
          </div>
          <div className="text-sm font-semibold">{formatCurrency(reminder.amount)}</div>
        </div>
        
        <p className="text-sm mt-2">{reminder.message}</p>
        
        <div className="mt-3 flex justify-end">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleMarkPaid}
            className="gap-1.5 text-xs"
          >
            <CheckCircle className="h-3.5 w-3.5" />
            Mark as Paid
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentReminderCard;
