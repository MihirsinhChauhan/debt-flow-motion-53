
import React from 'react';
import { motion } from 'framer-motion';
import { 
  CreditCard, 
  GraduationCap, 
  Home, 
  User, 
  Car, 
  Heart,
  AlertTriangle,
  TrendingUp,
  Calendar,
  Percent
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Debt, DebtType } from '@/types/debt';

interface EnhancedDebtCardProps {
  debt: Debt;
  onClick?: () => void;
}

const getDebtIcon = (type: DebtType) => {
  const icons = {
    credit_card: CreditCard,
    student_loan: GraduationCap,
    mortgage: Home,
    personal_loan: User,
    auto_loan: Car,
    family_loan: Heart,
    other: User
  };
  return icons[type] || User;
};

const getDebtColor = (type: DebtType) => {
  const colors = {
    credit_card: 'bg-red-100 text-red-700 border-red-200',
    student_loan: 'bg-blue-100 text-blue-700 border-blue-200',
    mortgage: 'bg-green-100 text-green-700 border-green-200',
    personal_loan: 'bg-purple-100 text-purple-700 border-purple-200',
    auto_loan: 'bg-gray-100 text-gray-700 border-gray-200',
    family_loan: 'bg-pink-100 text-pink-700 border-pink-200',
    other: 'bg-yellow-100 text-yellow-700 border-yellow-200'
  };
  return colors[type] || colors.other;
};

const EnhancedDebtCard: React.FC<EnhancedDebtCardProps> = ({ debt, onClick }) => {
  const Icon = getDebtIcon(debt.debt_type);
  const colorClass = getDebtColor(debt.debt_type);
  
  const progress = debt.principal_amount > 0 
    ? ((debt.principal_amount - debt.current_balance) / debt.principal_amount) * 100 
    : 0;

  const isOverdue = debt.days_past_due > 0;
  const isDueSoon = new Date(debt.due_date) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
    >
      <Card 
        className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
          isOverdue ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'
        }`}
        onClick={onClick}
      >
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${colorClass}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{debt.name}</h3>
                <p className="text-sm text-gray-500">{debt.lender}</p>
              </div>
            </div>
            
            <div className="flex flex-col items-end gap-1">
              {debt.is_high_priority && (
                <Badge variant="destructive" className="text-xs">
                  High Priority
                </Badge>
              )}
              {debt.is_tax_deductible && (
                <Badge variant="secondary" className="text-xs">
                  Tax Deductible
                </Badge>
              )}
              {isOverdue && (
                <Badge variant="destructive" className="text-xs">
                  {debt.days_past_due} days overdue
                </Badge>
              )}
              {isDueSoon && !isOverdue && (
                <Badge variant="outline" className="text-xs border-yellow-300 text-yellow-700">
                  Due Soon
                </Badge>
              )}
            </div>
          </div>

          {/* Balance and Progress */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-2xl font-bold text-gray-900">
                {formatCurrency(debt.current_balance)}
              </span>
              <div className="text-right">
                <p className="text-sm text-gray-500">of {formatCurrency(debt.principal_amount)}</p>
                <p className="text-xs text-green-600 font-medium">{progress.toFixed(1)}% paid</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-finance-blue to-finance-lightBlue"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <Percent className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Interest Rate</p>
                <p className="font-medium">
                  {debt.interest_rate}%
                  {debt.is_variable_rate && <span className="text-xs text-orange-600 ml-1">Variable</span>}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Due Date</p>
                <p className="font-medium">{formatDate(debt.due_date)}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Min Payment</p>
                <p className="font-medium">{formatCurrency(debt.minimum_payment)}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Frequency</p>
                <p className="font-medium capitalize">{debt.payment_frequency.replace('_', ' ')}</p>
              </div>
            </div>
          </div>

          {/* Term Info */}
          {debt.remaining_term_months && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="h-4 w-4" />
                <span>{debt.remaining_term_months} months remaining</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default EnhancedDebtCard;
