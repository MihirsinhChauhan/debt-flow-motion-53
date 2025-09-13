
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { DebtSummary as DebtSummaryType } from '@/types/debt';

interface DebtSummaryCardProps {
  summary: DebtSummaryType;
}

const DebtSummaryCard = ({ summary }: DebtSummaryCardProps) => {
  return (
    <Card className="bg-white overflow-hidden animate-fade-in">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Debt Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Total Debt</p>
            <p className="text-2xl font-semibold">{formatCurrency(summary.total_debt)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Avg Interest Rate</p>
            <p className="text-2xl font-semibold">{summary.average_interest_rate.toFixed(1)}%</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Total Debts</p>
            <p className="text-2xl font-semibold">{summary.debt_count}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Upcoming Payments</p>
            <p className="text-2xl font-semibold">{summary.upcomingPaymentsCount}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DebtSummaryCard;
