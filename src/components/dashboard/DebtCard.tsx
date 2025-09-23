
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreditCard, Landmark, GraduationCap, Home, BriefcaseBusiness, AlertCircle } from 'lucide-react';
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
    if (rate > 10) return 'bg-destructive';
    if (rate > 5) return 'bg-warning';
    return 'bg-success';
  };

  // Get appropriate icon based on debt type with consistent styling
  const getDebtIcon = (type: string) => {
    const iconClass = "h-5 w-5 sm:h-6 sm:w-6";
    switch (type) {
      case 'credit_card':
        return <CreditCard className={cn(iconClass, "text-primary")} />;
      case 'student_loan':
        return <GraduationCap className={cn(iconClass, "text-success")} />;
      case 'mortgage':
        return <Home className={cn(iconClass, "text-warning")} />;
      case 'personal_loan':
      case 'auto_loan':
      case 'family_loan':
        return <BriefcaseBusiness className={cn(iconClass, "text-destructive")} />;
      default:
        return <Landmark className={cn(iconClass, "text-muted-foreground")} />;
    }
  };

  // Calculate days until due
  const dueDate = new Date(debt.due_date);
  const today = new Date();
  const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  const getDueStatus = () => {
    if (daysUntilDue < 0) return {
      label: "Overdue!",
      className: "text-destructive font-medium",
      icon: <AlertCircle className="h-4 w-4" />
    };
    if (daysUntilDue === 0) return {
      label: "Due today!",
      className: "text-warning font-medium",
      icon: <AlertCircle className="h-4 w-4" />
    };
    if (daysUntilDue <= 7) return {
      label: `Due in ${daysUntilDue} days`,
      className: "text-warning",
      icon: null
    };
    return {
      label: `Due in ${daysUntilDue} days`,
      className: "text-muted-foreground",
      icon: null
    };
  };

  const dueStatus = getDueStatus();

  return (
    <Card className="w-full animate-scale-in">
      <CardContent className="p-0">
        {/* Mobile-first header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border/50">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="flex-shrink-0 p-2 sm:p-3 rounded-full bg-secondary/50">
              {getDebtIcon(debt.debt_type)}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-mobile-heading sm:text-lg truncate">
                {debt.name}
              </h3>
              <p className="text-sm text-muted-foreground truncate">{debt.lender}</p>
            </div>
          </div>
          {debt.is_high_priority && (
            <div className="flex-shrink-0 bg-destructive/10 text-destructive text-xs sm:text-sm px-2 py-1 rounded-full font-medium">
              High Priority
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-4">
          {/* Amount and Progress */}
          <div className="space-y-3">
            <div className="flex justify-between items-baseline">
              <span className="text-sm text-muted-foreground">Remaining</span>
              <span className="text-lg sm:text-xl font-bold">
                {formatCurrency(debt.remainingAmount)}
              </span>
            </div>

            {/* Mobile-optimized progress bar */}
            <div className="space-y-2">
              <div className="progress-bar">
                <div
                  className={cn("progress-bar-fill", getProgressColor(debt.interest_rate))}
                  style={{
                    width: `${progressPercentage}%`,
                    '--progress-width': `${progressPercentage}%`
                  } as React.CSSProperties}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{Math.round(progressPercentage)}% paid</span>
                <span>{formatCurrency(debt.amount)} total</span>
              </div>
            </div>
          </div>

          {/* Stats Grid - Mobile responsive */}
          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="space-y-1">
              <p className="text-xs sm:text-sm text-muted-foreground">Interest Rate</p>
              <p className="font-semibold text-mobile-body sm:text-base">
                {debt.interest_rate}%
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs sm:text-sm text-muted-foreground">Min Payment</p>
              <p className="font-semibold text-mobile-body sm:text-base">
                {formatCurrency(debt.minimum_payment)}
              </p>
            </div>
          </div>

          {/* Footer - Mobile responsive */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2 border-t border-border/30">
            <div className="flex items-center gap-2">
              {dueStatus.icon}
              <span className={cn("text-sm font-medium", dueStatus.className)}>
                {dueStatus.label}
              </span>
            </div>
            <Button size="sm" className="w-full sm:w-auto">
              Make Payment
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DebtCard;
