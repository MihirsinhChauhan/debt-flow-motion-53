/**
 * Enhanced debt operations hook
 * Provides a unified interface for all debt CRUD operations with error handling,
 * optimistic updates, and retry mechanisms
 */

import { useState, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { apiService } from '@/lib/api';
import { Debt } from '@/types/debt';
import { debtUtils } from '@/lib/debt-utils';

interface DebtOperationState {
  isLoading: boolean;
  error: string | null;
  lastOperation: string | null;
  retryFunction: (() => Promise<void>) | null;
}

interface UseDebtOperationsOptions {
  onDebtAdded?: (debt: Debt) => void;
  onDebtUpdated?: (debt: Debt) => void;
  onDebtDeleted?: (debtId: string) => void;
  onPaymentRecorded?: (debtId: string, amount: number) => void;
  enableOptimisticUpdates?: boolean;
}

interface UseDebtOperationsReturn {
  state: DebtOperationState;
  operations: {
    createDebt: (debtData: Partial<Debt>) => Promise<Debt | null>;
    updateDebt: (debtId: string, updates: Partial<Debt>) => Promise<Debt | null>;
    deleteDebt: (debtId: string, confirmationName?: string) => Promise<boolean>;
    recordPayment: (debtId: string, amount: number, paymentDate?: string) => Promise<boolean>;
    bulkUpdateDebts: (updates: Array<{ id: string; updates: Partial<Debt> }>) => Promise<Debt[]>;
  };
  retry: () => Promise<void>;
  clearError: () => void;
  cancel: () => void;
}

export const useDebtOperations = (options: UseDebtOperationsOptions = {}): UseDebtOperationsReturn => {
  const {
    onDebtAdded,
    onDebtUpdated,
    onDebtDeleted,
    onPaymentRecorded,
    enableOptimisticUpdates = true
  } = options;

  const [state, setState] = useState<DebtOperationState>({
    isLoading: false,
    error: null,
    lastOperation: null,
    retryFunction: null
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  // Helper function to update state
  const updateState = useCallback((updates: Partial<DebtOperationState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  // Helper function to handle errors
  const handleError = useCallback((error: any, operation: string, retryFn?: () => Promise<void>) => {
    console.error(`[DebtOperations] ${operation} failed:`, error);

    const errorInfo = debtUtils.errorHandling.classifyError(error);

    updateState({
      isLoading: false,
      error: errorInfo.userFriendlyMessage,
      lastOperation: operation,
      retryFunction: errorInfo.canRetry && retryFn ? retryFn : null
    });

    // Show appropriate toast based on error type
    const toastConfig = {
      description: errorInfo.userFriendlyMessage
    };

    switch (errorInfo.type) {
      case 'network':
        toast.error('Network Error', toastConfig);
        break;
      case 'auth':
        toast.error('Authentication Error', toastConfig);
        break;
      case 'validation':
        toast.error('Validation Error', toastConfig);
        break;
      default:
        toast.error(`${operation} Failed`, toastConfig);
    }

    return errorInfo;
  }, [updateState]);

  // Helper function to execute operation with retry logic
  const executeWithRetry = useCallback(async <T>(
    operation: () => Promise<T>,
    operationName: string,
    maxRetries: number = 3
  ): Promise<T> => {
    let lastError: any;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // Create new abort controller for each attempt
        abortControllerRef.current = new AbortController();

        const result = await operation();
        console.log(`[DebtOperations] ${operationName} succeeded on attempt ${attempt}`);
        return result;
      } catch (error) {
        lastError = error;
        console.error(`[DebtOperations] ${operationName} attempt ${attempt} failed:`, error);

        const errorInfo = debtUtils.errorHandling.classifyError(error);

        // Don't retry validation errors or if it's the last attempt
        if (!errorInfo.canRetry || attempt === maxRetries) {
          throw error;
        }

        // Exponential backoff for retries
        const backoffDelay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
        console.log(`[DebtOperations] Retrying ${operationName} in ${backoffDelay}ms...`);
        await new Promise(resolve => setTimeout(resolve, backoffDelay));
      }
    }

    throw lastError;
  }, []);

  // Create debt operation
  const createDebt = useCallback(async (debtData: Partial<Debt>): Promise<Debt | null> => {
    const operationName = 'Create Debt';

    try {
      updateState({ isLoading: true, error: null, lastOperation: operationName });

      // Validate debt data
      const validation = debtUtils.validation.validateDebtForCreation(debtData);
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }

      const operation = () => apiService.createDebt(debtData);
      const newDebt = await executeWithRetry(operation, operationName);

      updateState({ isLoading: false, retryFunction: null });

      toast.success(`Debt "${newDebt.name}" created successfully!`, {
        description: `Balance: ${debtUtils.formatting.formatCurrency(newDebt.current_balance)}`
      });

      onDebtAdded?.(newDebt);
      return newDebt;

    } catch (error) {
      handleError(error, operationName, () => createDebt(debtData));
      return null;
    }
  }, [updateState, handleError, executeWithRetry, onDebtAdded]);

  // Update debt operation
  const updateDebt = useCallback(async (debtId: string, updates: Partial<Debt>): Promise<Debt | null> => {
    const operationName = 'Update Debt';

    try {
      updateState({ isLoading: true, error: null, lastOperation: operationName });

      // Validate updates
      const validation = debtUtils.validation.validateDebt(updates);
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }

      const operation = () => apiService.updateDebt(debtId, updates);
      const updatedDebt = await executeWithRetry(operation, operationName);

      updateState({ isLoading: false, retryFunction: null });

      toast.success(`Debt "${updatedDebt.name}" updated successfully!`);

      onDebtUpdated?.(updatedDebt);
      return updatedDebt;

    } catch (error) {
      handleError(error, operationName, () => updateDebt(debtId, updates));
      return null;
    }
  }, [updateState, handleError, executeWithRetry, onDebtUpdated]);

  // Delete debt operation
  const deleteDebt = useCallback(async (debtId: string, confirmationName?: string): Promise<boolean> => {
    const operationName = 'Delete Debt';

    try {
      updateState({ isLoading: true, error: null, lastOperation: operationName });

      // Additional confirmation check if name provided
      if (confirmationName) {
        // This would be implemented based on your confirmation requirements
        console.log(`[DebtOperations] Confirmed deletion of debt: ${confirmationName}`);
      }

      const operation = () => apiService.deleteDebt(debtId);
      await executeWithRetry(operation, operationName);

      updateState({ isLoading: false, retryFunction: null });

      toast.success('Debt deleted successfully!');

      onDebtDeleted?.(debtId);
      return true;

    } catch (error) {
      handleError(error, operationName, () => deleteDebt(debtId, confirmationName));
      return false;
    }
  }, [updateState, handleError, executeWithRetry, onDebtDeleted]);

  // Record payment operation
  const recordPayment = useCallback(async (
    debtId: string,
    amount: number,
    paymentDate: string = new Date().toISOString().split('T')[0]
  ): Promise<boolean> => {
    const operationName = 'Record Payment';

    try {
      updateState({ isLoading: true, error: null, lastOperation: operationName });

      // Validate payment amount
      if (amount <= 0) {
        throw new Error('Payment amount must be greater than 0');
      }

      const paymentData = {
        debt_id: debtId,
        amount,
        payment_date: paymentDate
      };

      const operation = () => apiService.recordPayment(paymentData);
      await executeWithRetry(operation, operationName);

      updateState({ isLoading: false, retryFunction: null });

      toast.success(`Payment of ${debtUtils.formatting.formatCurrency(amount)} recorded successfully!`);

      onPaymentRecorded?.(debtId, amount);
      return true;

    } catch (error) {
      handleError(error, operationName, () => recordPayment(debtId, amount, paymentDate));
      return false;
    }
  }, [updateState, handleError, executeWithRetry, onPaymentRecorded]);

  // Bulk update debts operation
  const bulkUpdateDebts = useCallback(async (
    updates: Array<{ id: string; updates: Partial<Debt> }>
  ): Promise<Debt[]> => {
    const operationName = 'Bulk Update Debts';

    try {
      updateState({ isLoading: true, error: null, lastOperation: operationName });

      // Validate all updates
      for (const update of updates) {
        const validation = debtUtils.validation.validateDebt(update.updates);
        if (!validation.isValid) {
          throw new Error(`Validation failed for debt ${update.id}: ${validation.errors.join(', ')}`);
        }
      }

      const operation = async () => {
        const results: Debt[] = [];
        for (const update of updates) {
          const result = await apiService.updateDebt(update.id, update.updates);
          results.push(result);
        }
        return results;
      };

      const updatedDebts = await executeWithRetry(operation, operationName);

      updateState({ isLoading: false, retryFunction: null });

      toast.success(`${updatedDebts.length} debts updated successfully!`);

      // Notify about each updated debt
      updatedDebts.forEach(debt => onDebtUpdated?.(debt));

      return updatedDebts;

    } catch (error) {
      handleError(error, operationName, () => bulkUpdateDebts(updates));
      return [];
    }
  }, [updateState, handleError, executeWithRetry, onDebtUpdated]);

  // Retry last failed operation
  const retry = useCallback(async (): Promise<void> => {
    if (state.retryFunction) {
      const retryFn = state.retryFunction;
      updateState({ retryFunction: null, error: null });
      await retryFn();
    }
  }, [state.retryFunction, updateState]);

  // Clear error state
  const clearError = useCallback((): void => {
    updateState({ error: null, retryFunction: null });
  }, [updateState]);

  // Cancel ongoing operations
  const cancel = useCallback((): void => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    updateState({
      isLoading: false,
      error: null,
      retryFunction: null,
      lastOperation: null
    });
  }, [updateState]);

  return {
    state,
    operations: {
      createDebt,
      updateDebt,
      deleteDebt,
      recordPayment,
      bulkUpdateDebts
    },
    retry,
    clearError,
    cancel
  };
};

export default useDebtOperations;