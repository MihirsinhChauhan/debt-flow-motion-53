import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  IndianRupee,
  Calendar,
  Calculator,
  CreditCard,
  CheckCircle,
  AlertTriangle,
  Info,
  Loader2
} from 'lucide-react';
import { formatCurrency, cn } from '@/lib/utils';
import { Debt } from '@/types/debt';

interface PaymentDialogProps {
  debt: Debt;
  trigger: React.ReactNode;
  onPaymentSubmit: (paymentData: PaymentFormData) => Promise<boolean>;
  isLoading?: boolean;
}

export interface PaymentFormData {
  amount: number;
  paymentDate: string;
  principalPortion: number;
  interestPortion: number;
  notes?: string;
}

interface PaymentBreakdown {
  interestPortion: number;
  principalPortion: number;
  newBalance: number;
  isFullPayoff: boolean;
}

const PaymentDialog: React.FC<PaymentDialogProps> = ({
  debt,
  trigger,
  onPaymentSubmit,
  isLoading = false
}) => {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(debt.minimum_payment.toString());
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [breakdown, setBreakdown] = useState<PaymentBreakdown | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Calculate payment breakdown when amount changes
  useEffect(() => {
    const paymentAmount = parseFloat(amount) || 0;
    if (paymentAmount > 0) {
      const calculated = calculatePaymentBreakdown(
        paymentAmount,
        debt.current_balance,
        debt.interest_rate
      );
      setBreakdown(calculated);
    } else {
      setBreakdown(null);
    }
  }, [amount, debt]);

  const calculatePaymentBreakdown = (
    paymentAmount: number,
    currentBalance: number,
    interestRate: number
  ): PaymentBreakdown => {
    const monthlyInterestRate = interestRate / 100 / 12;
    const interestPortion = currentBalance * monthlyInterestRate;
    const principalPortion = Math.max(0, paymentAmount - interestPortion);
    const newBalance = Math.max(0, currentBalance - principalPortion);

    return {
      interestPortion: Math.min(interestPortion, paymentAmount),
      principalPortion,
      newBalance,
      isFullPayoff: newBalance === 0
    };
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    const paymentAmount = parseFloat(amount);

    if (!paymentAmount || paymentAmount <= 0) {
      newErrors.amount = 'Payment amount must be greater than 0';
    } else if (paymentAmount > debt.current_balance) {
      newErrors.amount = 'Payment cannot exceed current balance';
    }

    if (!paymentDate) {
      newErrors.paymentDate = 'Payment date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm() || !breakdown) return;

    const paymentData: PaymentFormData = {
      amount: parseFloat(amount),
      paymentDate,
      principalPortion: breakdown.principalPortion,
      interestPortion: breakdown.interestPortion,
      notes: notes || undefined
    };

    const success = await onPaymentSubmit(paymentData);
    if (success) {
      setOpen(false);
      // Reset form
      setAmount(debt.minimum_payment.toString());
      setNotes('');
      setErrors({});
    }
  };

  const getQuickAmountButtons = () => {
    const amounts = [
      { label: 'Minimum', value: debt.minimum_payment },
      { label: '2x Min', value: debt.minimum_payment * 2 },
      { label: 'Half Balance', value: debt.current_balance / 2 },
      { label: 'Full Balance', value: debt.current_balance }
    ];

    return amounts.filter(({ value }) => value <= debt.current_balance);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>

      <DialogContent className="sm:max-w-md w-[95vw] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader className="pb-3">
          <DialogTitle className="flex items-center gap-2 text-sm sm:text-base">
            <CreditCard className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
            Make Payment
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 sm:space-y-4">
          {/* Debt Info */}
          <Card className="bg-gray-50">
            <CardContent className="p-3">
              <div className="space-y-1 sm:space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm">{debt.name}</h4>
                    <p className="text-xs text-gray-600">{debt.lender}</p>
                  </div>
                  <Badge variant="outline" className="text-[10px] px-1 py-0">
                    {debt.interest_rate}% APR
                  </Badge>
                </div>
                <div className="text-xs sm:text-sm text-gray-600">
                  Current Balance: <span className="font-semibold text-gray-900">
                    {formatCurrency(debt.current_balance)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Amount Buttons */}
          <div>
            <Label className="text-xs sm:text-sm font-medium">Quick Amounts</Label>
            <div className="grid grid-cols-2 gap-1 sm:gap-2 mt-1 sm:mt-2">
              {getQuickAmountButtons().map(({ label, value }) => (
                <Button
                  key={label}
                  variant="outline"
                  size="sm"
                  onClick={() => setAmount(value.toString())}
                  className="text-[10px] sm:text-xs h-6 sm:h-8 px-1 sm:px-2"
                >
                  <span className="truncate">{label}: {formatCurrency(value)}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Payment Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-sm font-medium">
              Payment Amount
            </Label>
            <div className="relative">
              <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className={cn(
                  "pl-10",
                  errors.amount && "border-red-500"
                )}
                placeholder="0.00"
                step="0.01"
                min="0"
                max={debt.current_balance}
              />
            </div>
            {errors.amount && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                {errors.amount}
              </p>
            )}
          </div>

          {/* Payment Date */}
          <div className="space-y-2">
            <Label htmlFor="paymentDate" className="text-sm font-medium">
              Payment Date
            </Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="paymentDate"
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className={cn(
                  "pl-10",
                  errors.paymentDate && "border-red-500"
                )}
              />
            </div>
            {errors.paymentDate && (
              <p className="text-sm text-red-600">{errors.paymentDate}</p>
            )}
          </div>

          {/* Payment Breakdown */}
          {breakdown && (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Calculator className="h-4 w-4 text-blue-600" />
                  <h4 className="font-semibold text-blue-900">Payment Breakdown</h4>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Interest Portion:</span>
                    <span className="font-medium">{formatCurrency(breakdown.interestPortion)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Principal Portion:</span>
                    <span className="font-medium">{formatCurrency(breakdown.principalPortion)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-gray-600">New Balance:</span>
                    <span className={cn(
                      "font-semibold",
                      breakdown.isFullPayoff ? "text-green-600" : "text-gray-900"
                    )}>
                      {formatCurrency(breakdown.newBalance)}
                    </span>
                  </div>

                  {breakdown.isFullPayoff && (
                    <div className="flex items-center gap-2 mt-2 p-2 bg-green-100 rounded-md">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-800">
                        🎉 This payment will pay off this debt completely!
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm font-medium">
              Notes (Optional)
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add a note about this payment..."
              className="resize-none h-20"
              maxLength={200}
            />
            <p className="text-xs text-gray-500">
              {notes.length}/200 characters
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex gap-2 sm:gap-3 pt-1 sm:pt-2">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1 h-8 sm:h-10 text-xs sm:text-sm"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!breakdown || isLoading || Object.keys(errors).length > 0}
              className="flex-1 h-8 sm:h-10 text-xs sm:text-sm"
            >
              {isLoading ? (
                <div className="flex items-center gap-1 sm:gap-2">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span className="truncate">Processing...</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 sm:gap-2">
                  <IndianRupee className="h-3 w-3" />
                  <span className="truncate">Pay {formatCurrency(parseFloat(amount) || 0)}</span>
                  {breakdown?.isFullPayoff && " 🎉"}
                </div>
              )}
            </Button>
          </div>

          {/* Info Note */}
          <div className="flex items-start gap-2 p-3 bg-yellow-50 rounded-md">
            <Info className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-yellow-800">
              Payment will be processed immediately and your debt balance will be updated.
              This action cannot be undone.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentDialog;