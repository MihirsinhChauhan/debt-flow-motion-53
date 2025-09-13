import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingDown, Plus, Lightbulb, CreditCard, Bell } from 'lucide-react';
import { motion } from 'framer-motion';
import WidgetCard from '../WidgetCard';
import DebtProgressRing from '@/components/debt/DebtProgressRing';
import DTIIndicator from '@/components/debt/DTIIndicator';
import EnhancedDebtCard from '@/components/debt/EnhancedDebtCard';
import AiSuggestionCard from '../AiSuggestionCard';
import PaymentReminderCard from '../PaymentReminderCard';
import { mockDebts, aiSuggestions, mockReminders } from '@/data/mockData';

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
  const [reminders, setReminders] = useState(mockReminders);
  
  // Calculate totals
  const totalDebt = mockDebts.reduce((sum, debt) => sum + debt.current_balance, 0);
  const totalOriginalDebt = mockDebts.reduce((sum, debt) => sum + debt.principal_amount, 0);
  const progress = ((totalOriginalDebt - totalDebt) / totalOriginalDebt) * 100;
  
  // Sample user data
  const monthlyIncome = 85000;
  const totalDebtPayments = mockDebts.reduce((sum, debt) => sum + debt.minimum_payment, 0);
  const housingPayments = 25000;

  const handleMarkAsPaid = (reminderId: string) => {
    setReminders(reminders.filter(reminder => reminder.id !== reminderId));
  };

  // Collapsed view content
  const collapsedContent = (
    <div className="space-y-4">
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
          <p className="text-lg font-medium">{mockDebts.length}</p>
        </div>
      </div>
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
                {aiSuggestions.map((suggestion) => (
                  <AiSuggestionCard key={suggestion.id} suggestion={suggestion} />
                ))}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="debts" className="h-full m-0 data-[state=active]:flex data-[state=active]:flex-col">
            <div className="p-4 flex-1 overflow-y-auto space-y-4">
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
                {mockDebts.map((debt) => (
                  <EnhancedDebtCard key={debt.id} debt={debt} />
                ))}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="reminders" className="h-full m-0 data-[state=active]:flex data-[state=active]:flex-col">
            <div className="p-4 flex-1 overflow-y-auto">
              <div className="space-y-4">
                {reminders.length > 0 ? (
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
    <WidgetCard
      title="Debts"
      icon={<TrendingDown className="h-4 w-4 text-gray-600" />}
      expandedContent={expandedContent}
    >
      {collapsedContent}
    </WidgetCard>
  );
};

export default DebtWidget;