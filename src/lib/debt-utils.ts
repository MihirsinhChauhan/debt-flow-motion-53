/**
 * Comprehensive debt validation and calculation utilities
 * Provides TypeScript-safe functions for debt operations, validation, and calculations
 */

import { Debt, DebtType, PaymentFrequency, DebtSummary } from '@/types/debt';

// Validation utilities
export const debtValidation = {
  /**
   * Validates a debt object for completeness and business rules
   */
  validateDebt: (debt: Partial<Debt>): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    // Required fields validation
    if (!debt.name?.trim()) {
      errors.push('Debt name is required');
    }

    if (!debt.lender?.trim()) {
      errors.push('Lender name is required');
    }

    if (!debt.current_balance || debt.current_balance < 0) {
      errors.push('Current balance must be a positive number');
    }

    if (!debt.minimum_payment || debt.minimum_payment < 0) {
      errors.push('Minimum payment must be a positive number');
    }

    if (!debt.due_date) {
      errors.push('Due date is required');
    }

    // Business rule validations
    if (debt.current_balance && debt.minimum_payment && debt.minimum_payment > debt.current_balance) {
      errors.push('Minimum payment cannot exceed current balance');
    }

    if (debt.interest_rate && (debt.interest_rate < 0 || debt.interest_rate > 100)) {
      errors.push('Interest rate must be between 0% and 100%');
    }

    if (debt.principal_amount && debt.current_balance && debt.current_balance > debt.principal_amount) {
      errors.push('Current balance cannot exceed original principal amount');
    }

    if (debt.remaining_term_months && debt.remaining_term_months < 0) {
      errors.push('Remaining term must be a positive number');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  /**
   * Validates payment amount against debt constraints
   */
  validatePayment: (debt: Debt, paymentAmount: number): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!paymentAmount || paymentAmount <= 0) {
      errors.push('Payment amount must be greater than 0');
    }

    if (paymentAmount > debt.current_balance) {
      errors.push('Payment amount cannot exceed current balance');
    }

    // Warning for very large payments (more than 50% of balance)
    if (paymentAmount > debt.current_balance * 0.5) {
      errors.push('Warning: This payment is more than 50% of the current balance');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  /**
   * Validates that required fields for debt creation are present
   */
  validateDebtForCreation: (debtData: any): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    const requiredFields = [
      'name',
      'debt_type',
      'current_balance',
      'minimum_payment',
      'due_date',
      'lender'
    ];

    requiredFields.forEach(field => {
      if (!debtData[field]) {
        errors.push(`${field.replace('_', ' ')} is required`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }
};

// Calculation utilities
export const debtCalculations = {
  /**
   * Calculates the progress percentage for a debt
   */
  calculateProgress: (debt: Debt): number => {
    if (!debt.principal_amount || debt.principal_amount <= 0) {
      return 0;
    }
    const paidAmount = debt.principal_amount - debt.current_balance;
    return Math.max(0, Math.min(100, (paidAmount / debt.principal_amount) * 100));
  },

  /**
   * Calculates total interest paid to date
   */
  calculateInterestPaid: (debt: Debt): number => {
    // Simple calculation - in a real app, this would be based on payment history
    const principalPaid = debt.principal_amount - debt.current_balance;
    const estimatedInterest = principalPaid * (debt.interest_rate / 100) * 0.5; // Rough estimate
    return Math.max(0, estimatedInterest);
  },

  /**
   * Estimates time to payoff at current minimum payment rate
   */
  estimatePayoffTime: (debt: Debt): { months: number; totalInterest: number } => {
    if (!debt.current_balance || !debt.minimum_payment || !debt.interest_rate) {
      return { months: 0, totalInterest: 0 };
    }

    const monthlyRate = debt.interest_rate / 100 / 12;
    const balance = debt.current_balance;
    const payment = debt.minimum_payment;

    if (payment <= balance * monthlyRate) {
      // Payment too low to ever pay off
      return { months: Infinity, totalInterest: Infinity };
    }

    const months = Math.ceil(
      -Math.log(1 - (balance * monthlyRate) / payment) / Math.log(1 + monthlyRate)
    );

    const totalPaid = months * payment;
    const totalInterest = totalPaid - balance;

    return {
      months: isFinite(months) ? months : 0,
      totalInterest: Math.max(0, totalInterest)
    };
  },

  /**
   * Calculates debt-to-income ratio
   */
  calculateDTI: (debts: Debt[], monthlyIncome: number): {
    totalMonthlyPayments: number;
    dtiRatio: number;
    isHealthy: boolean;
  } => {
    const totalMonthlyPayments = debts.reduce((sum, debt) => {
      // Convert payment frequency to monthly equivalent
      let monthlyPayment = debt.minimum_payment;

      switch (debt.payment_frequency) {
        case 'weekly':
          monthlyPayment = debt.minimum_payment * 4.33;
          break;
        case 'biweekly':
          monthlyPayment = debt.minimum_payment * 2.17;
          break;
        case 'quarterly':
          monthlyPayment = debt.minimum_payment / 3;
          break;
        // monthly is default
      }

      return sum + monthlyPayment;
    }, 0);

    const dtiRatio = monthlyIncome > 0 ? (totalMonthlyPayments / monthlyIncome) * 100 : 0;
    const isHealthy = dtiRatio <= 36; // Standard DTI threshold

    return {
      totalMonthlyPayments,
      dtiRatio,
      isHealthy
    };
  },

  /**
   * Calculates savings from extra payments
   */
  calculateExtraPaymentSavings: (
    debt: Debt,
    extraPayment: number
  ): {
    monthsSaved: number;
    interestSaved: number;
    newPayoffTime: number
  } => {
    const baseline = debtCalculations.estimatePayoffTime(debt);

    const newPayment = debt.minimum_payment + extraPayment;
    const modifiedDebt = { ...debt, minimum_payment: newPayment };
    const withExtra = debtCalculations.estimatePayoffTime(modifiedDebt);

    return {
      monthsSaved: baseline.months - withExtra.months,
      interestSaved: baseline.totalInterest - withExtra.totalInterest,
      newPayoffTime: withExtra.months
    };
  },

  /**
   * Calculates snowball vs avalanche savings comparison
   */
  compareDebtStrategies: (debts: Debt[], extraPayment: number = 0): {
    snowball: { totalTime: number; totalInterest: number; order: string[] };
    avalanche: { totalTime: number; totalInterest: number; order: string[] };
    savings: number;
  } => {
    // Snowball: Sort by balance (lowest first)
    const snowballOrder = [...debts].sort((a, b) => a.current_balance - b.current_balance);

    // Avalanche: Sort by interest rate (highest first)
    const avalancheOrder = [...debts].sort((a, b) => b.interest_rate - a.interest_rate);

    // For simplicity, calculate basic totals
    const calculateStrategy = (orderedDebts: Debt[]) => {
      let totalTime = 0;
      let totalInterest = 0;

      orderedDebts.forEach(debt => {
        const payoff = debtCalculations.estimatePayoffTime(debt);
        totalTime = Math.max(totalTime, payoff.months);
        totalInterest += payoff.totalInterest;
      });

      return { totalTime, totalInterest, order: orderedDebts.map(d => d.id) };
    };

    const snowball = calculateStrategy(snowballOrder);
    const avalanche = calculateStrategy(avalancheOrder);

    return {
      snowball,
      avalanche,
      savings: snowball.totalInterest - avalanche.totalInterest
    };
  }
};

// Formatting utilities
export const debtFormatting = {
  /**
   * Formats currency for display
   */
  formatCurrency: (amount: number, locale: string = 'en-IN', currency: string = 'INR'): string => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  },

  /**
   * Formats date for display
   */
  formatDate: (dateString: string, locale: string = 'en-IN'): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(locale, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  },

  /**
   * Formats debt type for display
   */
  formatDebtType: (debtType: DebtType): string => {
    const typeMap: Record<DebtType, string> = {
      'credit_card': 'Credit Card',
      'personal_loan': 'Personal Loan',
      'home_loan': 'Home Loan',
      'vehicle_loan': 'Vehicle Loan',
      'education_loan': 'Education Loan',
      'business_loan': 'Business Loan',
      'gold_loan': 'Gold Loan',
      'overdraft': 'Overdraft',
      'emi': 'EMI',
      'other': 'Other'
    };
    return typeMap[debtType] || debtType;
  },

  /**
   * Formats payment frequency for display
   */
  formatPaymentFrequency: (frequency: PaymentFrequency): string => {
    const frequencyMap: Record<PaymentFrequency, string> = {
      'weekly': 'Weekly',
      'biweekly': 'Bi-weekly',
      'monthly': 'Monthly',
      'quarterly': 'Quarterly'
    };
    return frequencyMap[frequency] || frequency;
  },

  /**
   * Formats time duration for display
   */
  formatDuration: (months: number): string => {
    if (!isFinite(months) || months <= 0) {
      return 'Never';
    }

    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;

    if (years === 0) {
      return `${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`;
    } else if (remainingMonths === 0) {
      return `${years} year${years !== 1 ? 's' : ''}`;
    } else {
      return `${years} year${years !== 1 ? 's' : ''} ${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`;
    }
  }
};

// Debt status utilities
export const debtStatus = {
  /**
   * Determines if a debt is overdue
   */
  isOverdue: (debt: Debt): boolean => {
    const today = new Date();
    const dueDate = new Date(debt.due_date);
    return dueDate < today;
  },

  /**
   * Determines if a debt is due soon (within 7 days)
   */
  isDueSoon: (debt: Debt): boolean => {
    const today = new Date();
    const dueDate = new Date(debt.due_date);
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7 && diffDays > 0;
  },

  /**
   * Gets the priority score for a debt (higher is more urgent)
   */
  getPriorityScore: (debt: Debt): number => {
    let score = 0;

    // High priority flag
    if (debt.is_high_priority) score += 50;

    // Overdue penalty
    if (debtStatus.isOverdue(debt)) score += 100;

    // Due soon bonus
    if (debtStatus.isDueSoon(debt)) score += 25;

    // High interest rate penalty
    if (debt.interest_rate > 20) score += 30;
    else if (debt.interest_rate > 15) score += 20;
    else if (debt.interest_rate > 10) score += 10;

    // Small balance bonus (for snowball method)
    if (debt.current_balance < 5000) score += 15;

    return score;
  },

  /**
   * Gets days until due date
   */
  getDaysUntilDue: (debt: Debt): number => {
    const today = new Date();
    const dueDate = new Date(debt.due_date);
    const diffTime = dueDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
};

// Summary calculation utilities
export const summaryCalculations = {
  /**
   * Calculates comprehensive debt summary from debt array
   */
  calculateSummary: (debts: Debt[]): DebtSummary => {
    const activeDebts = debts.filter(debt => debt.is_active !== false);

    const total_debt = activeDebts.reduce((sum, debt) => sum + debt.current_balance, 0);
    const total_minimum_payments = activeDebts.reduce((sum, debt) => {
      // Convert to monthly equivalent
      let monthlyPayment = debt.minimum_payment;
      switch (debt.payment_frequency) {
        case 'weekly': monthlyPayment *= 4.33; break;
        case 'biweekly': monthlyPayment *= 2.17; break;
        case 'quarterly': monthlyPayment /= 3; break;
      }
      return sum + monthlyPayment;
    }, 0);

    const average_interest_rate = activeDebts.length > 0
      ? activeDebts.reduce((sum, debt) => sum + debt.interest_rate, 0) / activeDebts.length
      : 0;

    const high_priority_count = activeDebts.filter(debt => debt.is_high_priority).length;
    const upcoming_payments_count = activeDebts.filter(debt => debtStatus.isDueSoon(debt)).length;

    // Estimated total interest paid (simplified calculation)
    const total_interest_paid = activeDebts.reduce((sum, debt) => {
      return sum + debtCalculations.calculateInterestPaid(debt);
    }, 0);

    return {
      total_debt,
      total_interest_paid,
      total_minimum_payments,
      average_interest_rate,
      debt_count: activeDebts.length,
      high_priority_count,
      upcoming_payments_count,
      upcomingPaymentsCount: upcoming_payments_count // For backward compatibility
    };
  }
};

// Error handling utilities
export const debtErrorHandling = {
  /**
   * Classifies error types for better user feedback
   */
  classifyError: (error: any): {
    type: 'network' | 'auth' | 'validation' | 'server' | 'unknown';
    message: string;
    canRetry: boolean;
    userFriendlyMessage: string;
  } => {
    const message = error instanceof Error ? error.message : String(error);

    if (message.includes('Network') || message.includes('fetch')) {
      return {
        type: 'network',
        message,
        canRetry: true,
        userFriendlyMessage: 'Network connection issue. Please check your internet and try again.'
      };
    }

    if (message.includes('401') || message.includes('session') || message.includes('auth')) {
      return {
        type: 'auth',
        message,
        canRetry: true,
        userFriendlyMessage: 'Authentication issue. Please refresh the page to log in again.'
      };
    }

    if (message.includes('validation') || message.includes('invalid') || message.includes('required')) {
      return {
        type: 'validation',
        message,
        canRetry: false,
        userFriendlyMessage: message
      };
    }

    if (message.includes('500') || message.includes('503') || message.includes('server')) {
      return {
        type: 'server',
        message,
        canRetry: true,
        userFriendlyMessage: 'Server is temporarily unavailable. Please try again in a moment.'
      };
    }

    return {
      type: 'unknown',
      message,
      canRetry: true,
      userFriendlyMessage: 'An unexpected error occurred. Please try again.'
    };
  }
};

// Export all utilities as a combined object for convenience
export const debtUtils = {
  validation: debtValidation,
  calculations: debtCalculations,
  formatting: debtFormatting,
  status: debtStatus,
  summary: summaryCalculations,
  errorHandling: debtErrorHandling
};

export default debtUtils;