
import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  Bell,
  CheckCircle,
  CalendarDays,
  PlusCircle,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency, formatDate } from '@/lib/utils';
import PaymentConfetti from '@/components/celebrations/PaymentConfetti';
import { toast } from '@/hooks/use-toast';
import { apiService } from '@/lib/api';
import { Debt } from '@/types/debt';
import { useAuth } from '@/context/AuthContext';

interface Reminder {
  id: string;
  debtId: string;
  dueDate: string;
  amount: number;
  message: string;
  isPast: boolean;
  isToday: boolean;
}

const Reminders = () => {
  const { user } = useAuth();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get today's date for highlighting
  const today = new Date();

  // Format date as YYYY-MM-DD for comparison
  const formattedToday = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  // Load data on component mount
  useEffect(() => {
    if (user) {
      loadRemindersData();
    }
  }, [user]);

  const loadRemindersData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Load debts from API
      const debtsData = await apiService.getDebts();

      setDebts(debtsData);

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
      setError(err instanceof Error ? err.message : 'Failed to load reminders data');
      console.error('Error loading reminders data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsPaid = (reminderId: string) => {
    // Mark as paid logic
    setReminders(reminders.filter(reminder => reminder.id !== reminderId));
    setShowConfetti(true);
    toast({
      title: "Payment marked as complete",
      description: "Great job! Your payment has been recorded successfully.",
    });
  };

  // Group reminders by month
  const groupedReminders = reminders.reduce((acc, reminder) => {
    const date = new Date(reminder.dueDate);
    const monthYear = `${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`;
    
    if (!acc[monthYear]) {
      acc[monthYear] = [];
    }
    
    acc[monthYear].push(reminder);
    return acc;
  }, {} as Record<string, typeof reminders>);

  return (
    <div className="space-y-6">
      <PaymentConfetti 
        isVisible={showConfetti} 
        onComplete={() => setShowConfetti(false)} 
      />
      
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payment Reminders</h1>
          <p className="text-muted-foreground mt-1">
            Track and manage your upcoming payments
          </p>
        </div>
        
        <Button className="w-full md:w-auto gap-2">
          <PlusCircle className="h-4 w-4" />
          Add New Reminder
        </Button>
      </div>
      
      <Card className="bg-white">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-blue-100 p-2 rounded-full">
              <CalendarIcon className="h-5 w-5 text-finance-blue" />
            </div>
            <h2 className="text-xl font-semibold">Upcoming Payments</h2>
          </div>
          
          <div className="space-y-8">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                <span className="ml-2 text-gray-500">Loading reminders...</span>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-500 mb-4">{error}</p>
                <Button onClick={loadRemindersData} variant="outline">
                  Try Again
                </Button>
              </div>
            ) : Object.entries(groupedReminders).length > 0 ? (
              Object.entries(groupedReminders).map(([monthYear, monthReminders]) => (
                <div key={monthYear}>
                  <h3 className="font-medium text-gray-500 mb-4">{monthYear}</h3>
                  <div className="space-y-4">
                    {monthReminders.map(reminder => {
                      // Find the associated debt
                      const debt = debts.find(d => d.id === reminder.debtId);
                      const isDueToday = reminder.dueDate === formattedToday;
                      
                      return (
                        <div 
                          key={reminder.id}
                          className={`flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg ${
                            isDueToday ? 'border-finance-yellow bg-yellow-50' : 'border-gray-200'
                          }`}
                        >
                          <div className="flex items-center gap-4 mb-3 md:mb-0">
                            <div className={`p-2 rounded-full ${isDueToday ? 'bg-yellow-100' : 'bg-gray-100'}`}>
                              <CalendarDays className={`h-5 w-5 ${isDueToday ? 'text-finance-yellow' : 'text-gray-600'}`} />
                            </div>
                            <div>
                              <h4 className="font-medium">{debt?.name}</h4>
                              <p className="text-sm text-gray-500">{debt?.lender}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-6">
                            <div className="text-right md:text-left">
                              <p className="text-sm text-gray-500">Due Date</p>
                              <p className={`font-medium ${isDueToday ? 'text-finance-yellow' : ''}`}>{formatDate(reminder.dueDate)}</p>
                            </div>
                            
                            <div className="text-right">
                              <p className="text-sm text-gray-500">Amount</p>
                              <p className="font-medium">{formatCurrency(reminder.amount)}</p>
                            </div>
                            
                            <Button 
                              variant={isDueToday ? "default" : "outline"} 
                              size="sm" 
                              onClick={() => handleMarkAsPaid(reminder.id)}
                              className="whitespace-nowrap gap-1.5"
                            >
                              <CheckCircle className="h-4 w-4" />
                              Mark Paid
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <div className="bg-gray-100 p-3 rounded-full w-fit mx-auto mb-4">
                  <Bell className="h-6 w-6 text-gray-500" />
                </div>
                <h3 className="font-medium text-lg">No upcoming payments</h3>
                <p className="text-gray-500 mt-1">You're all caught up on your payments!</p>
                <Button variant="outline" className="mt-6">
                  Set Up New Reminder
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reminders;
