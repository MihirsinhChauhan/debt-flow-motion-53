import { useMemo } from 'react';

export interface PaymentBreakdown {
  interestPortion: number;
  principalPortion: number;
  newBalance: number;
  isFullPayoff: boolean;
  monthlyInterestAmount: number;
  effectiveInterestRate: number;
}

export interface PaymentSuggestion {
  type: 'minimum' | 'double_minimum' | 'interest_plus' | 'full_payoff';
  amount: number;
  label: string;
  description: string;
  timeSavings?: string;
  interestSavings?: number;
}

export const usePaymentCalculations = (
  currentBalance: number,
  interestRate: number,
  minimumPayment: number
) => {
  const calculations = useMemo(() => {
    const monthlyInterestRate = interestRate / 100 / 12;
    const monthlyInterestAmount = currentBalance * monthlyInterestRate;

    const calculateBreakdown = (paymentAmount: number): PaymentBreakdown => {
      const interestPortion = Math.min(monthlyInterestAmount, paymentAmount);
      const principalPortion = Math.max(0, paymentAmount - interestPortion);
      const newBalance = Math.max(0, currentBalance - principalPortion);

      return {
        interestPortion,
        principalPortion,
        newBalance,
        isFullPayoff: newBalance === 0,
        monthlyInterestAmount,
        effectiveInterestRate: monthlyInterestRate * 100
      };
    };

    const getSuggestions = (): PaymentSuggestion[] => {
      const suggestions: PaymentSuggestion[] = [
        {
          type: 'minimum',
          amount: minimumPayment,
          label: 'Minimum Payment',
          description: 'Required monthly payment'
        },
        {
          type: 'double_minimum',
          amount: minimumPayment * 2,
          label: 'Double Minimum',
          description: 'Pay off debt faster'
        },
        {
          type: 'interest_plus',
          amount: monthlyInterestAmount + 100,
          label: 'Interest + $100',
          description: 'Guaranteed progress on principal'
        },
        {
          type: 'full_payoff',
          amount: currentBalance,
          label: 'Full Payoff',
          description: 'Pay off completely'
        }
      ];

      return suggestions.filter(s => s.amount <= currentBalance);
    };

    const calculateTimeToPayoff = (monthlyPayment: number): number => {
      if (monthlyPayment <= monthlyInterestAmount) return Infinity;

      const monthsToPayoff = Math.log(1 + (currentBalance * monthlyInterestRate) / (monthlyPayment - monthlyInterestAmount)) / Math.log(1 + monthlyInterestRate);
      return Math.ceil(monthsToPayoff);
    };

    const calculateTotalInterest = (monthlyPayment: number): number => {
      const months = calculateTimeToPayoff(monthlyPayment);
      if (months === Infinity) return Infinity;

      return (monthlyPayment * months) - currentBalance;
    };

    return {
      calculateBreakdown,
      getSuggestions,
      calculateTimeToPayoff,
      calculateTotalInterest,
      monthlyInterestAmount,
      monthlyInterestRate
    };
  }, [currentBalance, interestRate, minimumPayment]);

  return calculations;
};

export default usePaymentCalculations;