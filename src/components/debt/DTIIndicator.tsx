
import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';

interface DTIIndicatorProps {
  monthlyIncome: number;
  totalMonthlyDebtPayments: number;
  housingPayments: number;
}

const DTIIndicator: React.FC<DTIIndicatorProps> = ({
  monthlyIncome,
  totalMonthlyDebtPayments,
  housingPayments
}) => {
  const frontendDTI = monthlyIncome > 0 ? (housingPayments / monthlyIncome) * 100 : 0;
  const backendDTI = monthlyIncome > 0 ? (totalMonthlyDebtPayments / monthlyIncome) * 100 : 0;
  
  const getDTIStatus = (dti: number, type: 'frontend' | 'backend') => {
    const threshold = type === 'frontend' ? 28 : 36;
    if (dti <= threshold) return { status: 'healthy', color: 'green', icon: CheckCircle };
    if (dti <= threshold + 8) return { status: 'caution', color: 'yellow', icon: Info };
    return { status: 'danger', color: 'red', icon: AlertTriangle };
  };

  const frontendStatus = getDTIStatus(frontendDTI, 'frontend');
  const backendStatus = getDTIStatus(backendDTI, 'backend');

  return (
    <Card className="bg-white">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <div className="bg-blue-100 p-2 rounded-full">
            <Info className="h-4 w-4 text-finance-blue" />
          </div>
          Debt-to-Income Ratio
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Frontend DTI */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Housing DTI</span>
            <div className="flex items-center gap-2">
              <frontendStatus.icon className={`h-4 w-4 text-${frontendStatus.color}-600`} />
              <span className={`font-bold text-${frontendStatus.color}-600`}>
                {frontendDTI.toFixed(1)}%
              </span>
            </div>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className={`h-full bg-${frontendStatus.color}-500`}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(frontendDTI, 100)}%` }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
          </div>
          <p className="text-xs text-gray-500">Ideal: ≤28% | Your housing costs</p>
        </div>

        {/* Backend DTI */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Total DTI</span>
            <div className="flex items-center gap-2">
              <backendStatus.icon className={`h-4 w-4 text-${backendStatus.color}-600`} />
              <span className={`font-bold text-${backendStatus.color}-600`}>
                {backendDTI.toFixed(1)}%
              </span>
            </div>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className={`h-full bg-${backendStatus.color}-500`}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(backendDTI, 100)}%` }}
              transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
            />
          </div>
          <p className="text-xs text-gray-500">Ideal: ≤36% | All debt payments</p>
        </div>

        {/* Summary */}
        <div className="pt-2 border-t">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Monthly Income</p>
              <p className="font-medium">{formatCurrency(monthlyIncome)}</p>
            </div>
            <div>
              <p className="text-gray-500">Total Debt Payments</p>
              <p className="font-medium">{formatCurrency(totalMonthlyDebtPayments)}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DTIIndicator;
