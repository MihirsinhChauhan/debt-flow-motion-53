import React, { useState, useRef, useCallback } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { Plus, Loader2, AlertTriangle, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { Debt, DebtType, PaymentFrequency } from '@/types/debt';
import { apiService } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';


const debtTypes: { value: DebtType; label: string; description: string }[] = [
  { value: 'credit_card', label: 'Credit Card', description: 'Credit card debt with revolving credit' },
  { value: 'personal_loan', label: 'Personal Loan', description: 'Unsecured personal loan' },
  { value: 'home_loan', label: 'Home Loan', description: 'Housing loan or mortgage' },
  { value: 'vehicle_loan', label: 'Vehicle Loan', description: 'Car, bike, or other vehicle loan' },
  { value: 'education_loan', label: 'Education Loan', description: 'Student loan for education expenses' },
  { value: 'business_loan', label: 'Business Loan', description: 'Loan for business purposes' },
  { value: 'gold_loan', label: 'Gold Loan', description: 'Loan against gold jewelry' },
  { value: 'overdraft', label: 'Overdraft', description: 'Bank overdraft facility' },
  { value: 'emi', label: 'EMI', description: 'General EMI or installment' },
  { value: 'other', label: 'Other', description: 'Other types of debt' },
];

const paymentFrequencies: { value: PaymentFrequency; label: string }[] = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Bi-weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
];

interface AddDebtDialogProps {
  onAddDebt: (debt: Debt) => void;
  trigger?: React.ReactNode; // Allow custom trigger
}

const AddDebtDialog: React.FC<AddDebtDialogProps> = ({ onAddDebt, trigger }) => {
  const { sessionHealth, retryAuth, error: authError } = useAuth();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [error, setError] = useState<{ message: string; type: 'auth' | 'network' | 'server' | 'validation'; canRetry: boolean } | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const abortControllerRef = useRef<AbortController | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    debt_type: 'credit_card' as DebtType,
    principal_amount: '',
    current_balance: '',
    interest_rate: '',
    is_variable_rate: false,
    minimum_payment: '',
    due_date: '',
    lender: '',
    remaining_term_months: '',
    is_tax_deductible: false,
    payment_frequency: 'monthly' as PaymentFrequency,
    is_high_priority: false,
    notes: '',
  });

  // Enhanced error classification for debt operations
  const classifyDebtError = useCallback((err: any) => {
    const message = err instanceof Error ? err.message : 'Unknown error';

    if (message.includes('Network error') || message.includes('Failed to fetch')) {
      return {
        message: 'Network connection issue. Please check your internet and try again.',
        type: 'network' as const,
        canRetry: true
      };
    }

    if (message.includes('session') || message.includes('401')) {
      return {
        message: 'Authentication issue detected. Please try again or log in.',
        type: 'auth' as const,
        canRetry: true
      };
    }

    if (message.includes('500') || message.includes('503') || message.includes('server')) {
      return {
        message: 'Server is temporarily unavailable. Please try again in a moment.',
        type: 'server' as const,
        canRetry: true
      };
    }

    if (message.includes('validation') || message.includes('required') || message.includes('invalid')) {
      return {
        message: message,
        type: 'validation' as const,
        canRetry: false
      };
    }

    return {
      message: message,
      type: 'server' as const,
      canRetry: true
    };
  }, []);

  // Retry mechanism with exponential backoff
  const attemptCreateDebt = useCallback(async (debtData: any, attempt: number = 1): Promise<Debt> => {
    console.log(`[AddDebt] Attempt ${attempt} to create debt:`, debtData.name);

    try {
      // Create new abort controller for each attempt
      abortControllerRef.current = new AbortController();

      const newDebt = await apiService.createDebt(debtData);
      console.log(`[AddDebt] Successfully created debt on attempt ${attempt}`);
      return newDebt;
    } catch (err) {
      console.error(`[AddDebt] Attempt ${attempt} failed:`, err);

      const debtError = classifyDebtError(err);

      // If authentication error, try to recover session first
      if (debtError.type === 'auth' && attempt === 1) {
        console.log('[AddDebt] Authentication error, attempting session recovery...');
        try {
          await retryAuth();
          // Brief delay then retry
          await new Promise(resolve => setTimeout(resolve, 1000));
          return attemptCreateDebt(debtData, attempt + 1);
        } catch (authErr) {
          console.error('[AddDebt] Session recovery failed:', authErr);
          throw debtError;
        }
      }

      // For retryable errors, attempt retry with backoff
      if (debtError.canRetry && attempt < 3) {
        const backoffDelay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
        console.log(`[AddDebt] Retrying in ${backoffDelay}ms...`);

        await new Promise(resolve => setTimeout(resolve, backoffDelay));
        return attemptCreateDebt(debtData, attempt + 1);
      }

      throw debtError;
    }
  }, [classifyDebtError, retryAuth]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate required fields
    if (!formData.name || !formData.current_balance || !formData.minimum_payment || !formData.due_date || !formData.lender) {
      setError({
        message: 'Please fill in all required fields (Name, Balance, Minimum Payment, Due Date, Lender)',
        type: 'validation',
        canRetry: false
      });
      return;
    }

    // Check session health before attempting
    if (sessionHealth === 'unhealthy') {
      setError({
        message: 'Session is unhealthy. Please refresh the page or log in again.',
        type: 'auth',
        canRetry: true
      });
      return;
    }

    try {
      setIsLoading(true);
      setRetryCount(0);

      const debtData = {
        name: formData.name,
        debt_type: formData.debt_type,
        principal_amount: parseFloat(formData.principal_amount) || parseFloat(formData.current_balance),
        current_balance: parseFloat(formData.current_balance),
        interest_rate: parseFloat(formData.interest_rate) || 0,
        is_variable_rate: formData.is_variable_rate,
        minimum_payment: parseFloat(formData.minimum_payment),
        due_date: formData.due_date,
        lender: formData.lender,
        remaining_term_months: formData.remaining_term_months ? parseInt(formData.remaining_term_months) : undefined,
        is_tax_deductible: formData.is_tax_deductible,
        payment_frequency: formData.payment_frequency,
        is_high_priority: formData.is_high_priority,
        notes: formData.notes || undefined,
      };

      console.log('[AddDebt] Starting debt creation process...');
      const newDebt = await attemptCreateDebt(debtData);

      onAddDebt(newDebt);
      toast.success(
        `Debt "${newDebt.name}" added successfully!`,
        {
          description: `Balance: ₹${newDebt.current_balance.toLocaleString()}`
        }
      );
      setOpen(false);
      resetForm();

    } catch (error) {
      console.error('[AddDebt] Final error:', error);

      const debtError = error as { message: string; type: string; canRetry: boolean };
      setError(debtError);

      // Show appropriate toast based on error type
      if (debtError.type === 'auth') {
        toast.error('Authentication Error', {
          description: 'Please try again or refresh the page to log in.'
        });
      } else if (debtError.type === 'network') {
        toast.error('Network Error', {
          description: 'Please check your connection and try again.'
        });
      } else {
        toast.error('Failed to Add Debt', {
          description: debtError.message || 'Please try again.'
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = useCallback(() => {
    setFormData({
      name: '',
      debt_type: 'credit_card',
      principal_amount: '',
      current_balance: '',
      interest_rate: '',
      is_variable_rate: false,
      minimum_payment: '',
      due_date: '',
      lender: '',
      remaining_term_months: '',
      is_tax_deductible: false,
      payment_frequency: 'monthly',
      is_high_priority: false,
      notes: '',
    });
    setError(null);
    setRetryCount(0);
  }, []);

  const handleRetry = useCallback(async () => {
    if (!error?.canRetry) return;

    setIsRetrying(true);
    setError(null);

    try {
      if (error.type === 'auth') {
        console.log('[AddDebt] Retrying with auth recovery...');
        await retryAuth();
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Retry the submission
      const form = document.querySelector('form') as HTMLFormElement;
      if (form) {
        const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
        form.dispatchEvent(submitEvent);
      }
    } catch (retryError) {
      console.error('[AddDebt] Retry failed:', retryError);
      const debtError = classifyDebtError(retryError);
      setError(debtError);
    } finally {
      setIsRetrying(false);
    }
  }, [error, retryAuth, classifyDebtError]);

  const handleCancel = useCallback(() => {
    // Cancel any ongoing requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    resetForm();
    setOpen(false);
  }, [resetForm]);

  // Monitor session health and show warnings
  const getSessionHealthIcon = () => {
    switch (sessionHealth) {
      case 'healthy': return <Wifi className="h-4 w-4 text-green-500" />;
      case 'degraded': return <Wifi className="h-4 w-4 text-yellow-500" />;
      case 'unhealthy': return <WifiOff className="h-4 w-4 text-red-500" />;
    }
  };

  const getSessionHealthMessage = () => {
    switch (sessionHealth) {
      case 'degraded': return 'Connection issues detected. Debt creation may be slower.';
      case 'unhealthy': return 'Session is unhealthy. Please refresh or log in again.';
      default: return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gap-2 w-full sm:w-auto">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add New Debt</span>
            <span className="sm:hidden">Add Debt</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="w-[95vw] max-w-2xl max-h-[95vh] mx-auto overflow-y-auto">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-mobile-title sm:text-2xl">Add New Debt</DialogTitle>
          <DialogDescription className="text-mobile-body text-muted-foreground">
            Enter the details of your debt to start tracking it
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Session Health Indicator */}
          {sessionHealth !== 'healthy' && (
            <Alert className={`${sessionHealth === 'unhealthy' ? 'border-red-200 bg-red-50' : 'border-yellow-200 bg-yellow-50'}`}>
              <div className="flex items-center gap-2">
                {getSessionHealthIcon()}
                <AlertDescription className="text-sm">
                  {getSessionHealthMessage()}
                </AlertDescription>
              </div>
            </Alert>
          )}

          {/* Error Display */}
          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <AlertDescription className="text-sm text-red-700">
                <div className="mb-2">{error.message}</div>
                {error.canRetry && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleRetry}
                    disabled={isRetrying}
                    className="h-8 text-xs"
                  >
                    {isRetrying ? (
                      <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                    ) : (
                      <RefreshCw className="mr-2 h-3 w-3" />
                    )}
                    {isRetrying ? 'Retrying...' : 'Try Again'}
                  </Button>
                )}
              </AlertDescription>
            </Alert>
          )}
          {/* Mobile-first form layout */}
          <div className="space-y-6">
            {/* Essential Information */}
            <div className="space-y-4">
              <h3 className="text-mobile-heading font-semibold text-foreground border-b border-border pb-2">
                Basic Information
              </h3>

              <div className="space-y-3">
                <Label htmlFor="name" className="text-mobile-body font-medium">
                  Debt Name *
                </Label>
                <Input
                  id="name"
                  placeholder="e.g., HDFC Credit Card"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="text-mobile-body"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="debt_type" className="text-mobile-body font-medium">
                  Debt Type *
                </Label>
                <Select value={formData.debt_type} onValueChange={(value: DebtType) => setFormData(prev => ({ ...prev, debt_type: value }))}>
                  <SelectTrigger className="min-h-touch">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {debtTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value} className="py-3">
                        <div>
                          <div className="font-medium text-mobile-body">{type.label}</div>
                          <div className="text-sm text-muted-foreground">{type.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label htmlFor="lender" className="text-mobile-body font-medium">
                  Lender/Bank *
                </Label>
                <Input
                  id="lender"
                  placeholder="e.g., HDFC Bank"
                  value={formData.lender}
                  onChange={(e) => setFormData(prev => ({ ...prev, lender: e.target.value }))}
                  className="text-mobile-body"
                />
              </div>
            </div>

            {/* Financial Details */}
            <div className="space-y-4">
              <h3 className="text-mobile-heading font-semibold text-foreground border-b border-border pb-2">
                Financial Details
              </h3>

              <div className="space-y-3">
                <Label htmlFor="current_balance" className="text-mobile-body font-medium">
                  Current Balance (₹) *
                </Label>
                <Input
                  id="current_balance"
                  type="number"
                  inputMode="decimal"
                  placeholder="e.g., 50000"
                  value={formData.current_balance}
                  onChange={(e) => setFormData(prev => ({ ...prev, current_balance: e.target.value }))}
                  className="text-mobile-body"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="minimum_payment" className="text-mobile-body font-medium">
                  Minimum Payment (₹) *
                </Label>
                <Input
                  id="minimum_payment"
                  type="number"
                  inputMode="decimal"
                  placeholder="e.g., 2500"
                  value={formData.minimum_payment}
                  onChange={(e) => setFormData(prev => ({ ...prev, minimum_payment: e.target.value }))}
                  className="text-mobile-body"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <Label htmlFor="interest_rate" className="text-mobile-body font-medium">
                    Interest Rate (%)
                  </Label>
                  <Input
                    id="interest_rate"
                    type="number"
                    inputMode="decimal"
                    step="0.01"
                    placeholder="e.g., 18.5"
                    value={formData.interest_rate}
                    onChange={(e) => setFormData(prev => ({ ...prev, interest_rate: e.target.value }))}
                    className="text-mobile-body"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="due_date" className="text-mobile-body font-medium">
                    Next Due Date *
                  </Label>
                  <Input
                    id="due_date"
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
                    className="text-mobile-body"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Additional Details - Collapsible on mobile */}
          <div className="space-y-4">
            <h3 className="text-mobile-heading font-semibold text-foreground border-b border-border pb-2">
              Additional Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-3">
                <Label htmlFor="principal_amount" className="text-mobile-body font-medium">
                  Original Amount (₹)
                </Label>
                <Input
                  id="principal_amount"
                  type="number"
                  inputMode="decimal"
                  placeholder="e.g., 100000"
                  value={formData.principal_amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, principal_amount: e.target.value }))}
                  className="text-mobile-body"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="remaining_term_months" className="text-mobile-body font-medium">
                  Remaining Term (months)
                </Label>
                <Input
                  id="remaining_term_months"
                  type="number"
                  inputMode="numeric"
                  placeholder="e.g., 24"
                  value={formData.remaining_term_months}
                  onChange={(e) => setFormData(prev => ({ ...prev, remaining_term_months: e.target.value }))}
                  className="text-mobile-body"
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="payment_frequency" className="text-mobile-body font-medium">
                Payment Frequency
              </Label>
              <Select value={formData.payment_frequency} onValueChange={(value: PaymentFrequency) => setFormData(prev => ({ ...prev, payment_frequency: value }))}>
                <SelectTrigger className="min-h-touch">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {paymentFrequencies.map((freq) => (
                    <SelectItem key={freq.value} value={freq.value} className="py-3">
                      <span className="text-mobile-body">{freq.label}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Mobile-friendly switches */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                <Label htmlFor="is_high_priority" className="text-mobile-body font-medium flex-1">
                  High Priority Debt
                </Label>
                <Switch
                  id="is_high_priority"
                  checked={formData.is_high_priority}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_high_priority: checked }))}
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                <Label htmlFor="is_variable_rate" className="text-mobile-body font-medium flex-1">
                  Variable Interest Rate
                </Label>
                <Switch
                  id="is_variable_rate"
                  checked={formData.is_variable_rate}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_variable_rate: checked }))}
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                <Label htmlFor="is_tax_deductible" className="text-mobile-body font-medium flex-1">
                  Tax Deductible
                </Label>
                <Switch
                  id="is_tax_deductible"
                  checked={formData.is_tax_deductible}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_tax_deductible: checked }))}
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="notes" className="text-mobile-body font-medium">
                Notes (Optional)
              </Label>
              <Textarea
                id="notes"
                placeholder="Any additional notes about this debt..."
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                className="min-h-[100px] text-mobile-body resize-none"
              />
            </div>
          </div>

          {/* Mobile-friendly buttons */}
          <div className="flex flex-col sm:flex-row sm:justify-end gap-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="w-full sm:w-auto order-2 sm:order-1"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="w-full sm:w-auto order-1 sm:order-2"
              disabled={isLoading || sessionHealth === 'unhealthy'}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? (
                retryCount > 0 ? `Retrying... (${retryCount + 1})` : 'Adding...'
              ) : (
                'Add Debt'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddDebtDialog;