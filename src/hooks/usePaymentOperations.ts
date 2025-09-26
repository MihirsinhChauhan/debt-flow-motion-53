import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { apiService } from '@/lib/api';
import { Debt } from '@/types/debt';
import { PaymentFormData } from '@/components/payments/PaymentDialog';

interface PaymentOperationsState {
  isLoading: boolean;
  error: string | null;
}

export const usePaymentOperations = (
  onPaymentSuccess?: (debtId: string, newBalance: number) => void
) => {
  const [state, setState] = useState<PaymentOperationsState>({
    isLoading: false,
    error: null
  });

  const calculateNewBalance = useCallback((
    currentBalance: number,
    principalPortion: number
  ): number => {
    return Math.max(0, currentBalance - principalPortion);
  }, []);

  const processPayment = useCallback(async (
    debt: Debt,
    paymentData: PaymentFormData
  ): Promise<boolean> => {
    setState({ isLoading: true, error: null });

    try {
      // Step 1: Record the payment with breakdown
      const paymentRecord = await apiService.recordPaymentWithBreakdown(debt.id, {
        amount: paymentData.amount,
        paymentDate: paymentData.paymentDate,
        principalPortion: paymentData.principalPortion,
        interestPortion: paymentData.interestPortion,
        notes: paymentData.notes
      });

      // Step 2: Calculate new balance
      const newBalance = calculateNewBalance(debt.current_balance, paymentData.principalPortion);

      // Step 3: Update debt balance (only if payment was recorded successfully)
      if (paymentRecord && newBalance !== debt.current_balance) {
        await apiService.updateDebtAfterPayment(
          debt.id,
          newBalance,
          paymentData.notes ?
            `${paymentData.notes} | Payment of ${paymentData.amount} recorded` :
            `Payment of ${paymentData.amount} recorded on ${paymentData.paymentDate}`
        );
      }

      // Success feedback
      const isFullPayoff = newBalance === 0;
      if (isFullPayoff) {
        toast.success(
          `🎉 Congratulations! You've paid off ${debt.name} completely!`,
          {
            description: `Payment of ${paymentData.amount.toLocaleString('en-US', {
              style: 'currency',
              currency: 'USD'
            })} processed successfully.`,
            duration: 6000
          }
        );
      } else {
        toast.success(
          `Payment recorded successfully!`,
          {
            description: `${paymentData.amount.toLocaleString('en-US', {
              style: 'currency',
              currency: 'USD'
            })} payment applied to ${debt.name}. New balance: ${newBalance.toLocaleString('en-US', {
              style: 'currency',
              currency: 'USD'
            })}`,
            duration: 4000
          }
        );
      }

      // Callback for parent component to refresh data
      onPaymentSuccess?.(debt.id, newBalance);

      setState({ isLoading: false, error: null });
      return true;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Payment failed';

      setState({ isLoading: false, error: errorMessage });

      toast.error('Payment failed', {
        description: errorMessage,
        duration: 5000
      });

      return false;
    }
  }, [calculateNewBalance, onPaymentSuccess]);

  const validatePayment = useCallback((
    debt: Debt,
    amount: number
  ): { isValid: boolean; error?: string } => {
    if (amount <= 0) {
      return { isValid: false, error: 'Payment amount must be greater than 0' };
    }

    if (amount > debt.current_balance) {
      return { isValid: false, error: 'Payment cannot exceed current balance' };
    }

    if (!debt.is_active) {
      return { isValid: false, error: 'Cannot make payments on inactive debt' };
    }

    return { isValid: true };
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    processPayment,
    validatePayment,
    clearError,
    isLoading: state.isLoading,
    error: state.error
  };
};

export default usePaymentOperations;