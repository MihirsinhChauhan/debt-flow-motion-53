
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CreditCard, Landmark, GraduationCap, Home, BriefcaseBusiness } from 'lucide-react';
import { Debt } from '@/types/debt';
import { cn, formatCurrency } from '@/lib/utils';

interface DebtCardProps {
  debt: Debt;
}

const DebtCard = ({ debt }: DebtCardProps) => {
  // Calculate progress percentage
  const progressPercentage = ((debt.amount - debt.remainingAmount) / debt.amount) * 100;
  
  // Set progress bar color based on interest rate
  const getProgressColor = (rate: number) => {
    if (rate > 10) return 'bg-finance-red';
    if (rate > 5) return 'bg-finance-yellow';
    return 'bg-finance-green';
  };

  // Get appropriate icon based on debt type
  const getDebtIcon = (type: string) => {
    switch (type) {
      case 'credit_card':
        return <CreditCard className="h-5 w-5 text-finance-blue" />;
      case 'student_loan':
        return <GraduationCap className="h-5 w-5 text-finance-green" />;
      case 'mortgage':
        return <Home className="h-5 w-5 text-finance-yellow" />;
      case 'personal_loan':
      case 'auto_loan':
      case 'family_loan':
        return <BriefcaseBusiness className="h-5 w-5 text-finance-red" />;
      default:
        return <Landmark className="h-5 w-5 text-gray-600" />;
    }
  };

  // Calculate days until due
  const dueDate = new Date(debt.due_date);
  const today = new Date();
  const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  const getDueStatus = () => {
    if (daysUntilDue < 0) return { label: "Overdue!", className: "text-finance-red font-medium" };
    if (daysUntilDue === 0) return { label: "Due today!", className: "text-finance-yellow font-medium" };
    if (daysUntilDue <= 7) return { label: `Due in ${daysUntilDue} days`, className: "text-finance-yellow" };
    return { label: `Due in ${daysUntilDue} days`, className: "text-gray-500" };
  };

  const dueStatus = getDueStatus();

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow duration-300 animate-scale-in">
      <CardContent className="p-0">
        <div className="flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-gray-100">
                {getDebtIcon(debt.debt_type)}
              </div>
              <div>
                <h3 className="font-medium">{debt.name}</h3>
                <p className="text-xs text-gray-500">{debt.lender}</p>
              </div>
            </div>
            {debt.is_high_priority && (
              <div className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                High Priority
              </div>
            )}
          </div>
          
          <div className="p-4">
            <div className="flex justify-between mb-1">
              <span className="text-sm text-gray-500">Remaining</span>
              <span className="text-sm font-medium">{formatCurrency(debt.remainingAmount)}</span>
            </div>
            
            <div className="progress-bar mb-3">
              <div 
                className={`progress-bar-fill ${getProgressColor(debt.interest_rate)}`}
                style={{width: `${progressPercentage}%`, '--progress-width': `${progressPercentage}%`} as React.CSSProperties}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-x-4 mt-4 text-sm">
              <div>
                <p className="text-gray-500">Interest Rate</p>
                <p className="font-medium">{debt.interest_rate}%</p>
              </div>
              <div>
                <p className="text-gray-500">Min Payment</p>
                <p className="font-medium">{formatCurrency(debt.minimum_payment)}</p>
              </div>
            </div>
            
            <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
              <p className={cn("text-sm", dueStatus.className)}>{dueStatus.label}</p>
              <button className="text-sm font-medium text-finance-blue hover:underline">
                Make Payment
              </button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DebtCard;
