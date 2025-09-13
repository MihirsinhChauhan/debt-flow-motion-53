import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import { Debt, DebtType, PaymentFrequency } from '@/types/debt';

interface AddDebtDialogProps {
  onAddDebt: (debt: Debt) => void;
}

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

const AddDebtDialog: React.FC<AddDebtDialogProps> = ({ onAddDebt }) => {
  const [open, setOpen] = useState(false);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.current_balance || !formData.minimum_payment || !formData.due_date || !formData.lender) {
      toast.error('Please fill in all required fields');
      return;
    }

    const newDebt: Debt = {
      id: Date.now().toString(),
      name: formData.name,
      debt_type: formData.debt_type,
      principal_amount: parseFloat(formData.principal_amount) || parseFloat(formData.current_balance),
      current_balance: parseFloat(formData.current_balance),
      amount: parseFloat(formData.current_balance), // For backward compatibility
      remainingAmount: parseFloat(formData.current_balance), // For backward compatibility
      interest_rate: parseFloat(formData.interest_rate) || 0,
      is_variable_rate: formData.is_variable_rate,
      minimum_payment: parseFloat(formData.minimum_payment),
      due_date: formData.due_date,
      lender: formData.lender,
      remaining_term_months: formData.remaining_term_months ? parseInt(formData.remaining_term_months) : undefined,
      is_tax_deductible: formData.is_tax_deductible,
      payment_frequency: formData.payment_frequency,
      is_high_priority: formData.is_high_priority,
      days_past_due: 0,
      notes: formData.notes || undefined,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    onAddDebt(newDebt);
    toast.success('Debt added successfully!');
    setOpen(false);
    
    // Reset form
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
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add New Debt
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Debt</DialogTitle>
          <DialogDescription>
            Enter the details of your debt to start tracking it
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Debt Name *</Label>
              <Input
                id="name"
                placeholder="e.g., HDFC Credit Card"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="debt_type">Debt Type *</Label>
              <Select value={formData.debt_type} onValueChange={(value: DebtType) => setFormData(prev => ({ ...prev, debt_type: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {debtTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div>
                        <div className="font-medium">{type.label}</div>
                        <div className="text-sm text-muted-foreground">{type.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="current_balance">Current Balance (₹) *</Label>
              <Input
                id="current_balance"
                type="number"
                placeholder="e.g., 50000"
                value={formData.current_balance}
                onChange={(e) => setFormData(prev => ({ ...prev, current_balance: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="principal_amount">Original Amount (₹)</Label>
              <Input
                id="principal_amount"
                type="number"
                placeholder="e.g., 100000"
                value={formData.principal_amount}
                onChange={(e) => setFormData(prev => ({ ...prev, principal_amount: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="interest_rate">Interest Rate (%)</Label>
              <Input
                id="interest_rate"
                type="number"
                step="0.01"
                placeholder="e.g., 18.5"
                value={formData.interest_rate}
                onChange={(e) => setFormData(prev => ({ ...prev, interest_rate: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="minimum_payment">Minimum Payment (₹) *</Label>
              <Input
                id="minimum_payment"
                type="number"
                placeholder="e.g., 2500"
                value={formData.minimum_payment}
                onChange={(e) => setFormData(prev => ({ ...prev, minimum_payment: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="due_date">Next Due Date *</Label>
              <Input
                id="due_date"
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="lender">Lender/Bank *</Label>
              <Input
                id="lender"
                placeholder="e.g., HDFC Bank"
                value={formData.lender}
                onChange={(e) => setFormData(prev => ({ ...prev, lender: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="payment_frequency">Payment Frequency</Label>
              <Select value={formData.payment_frequency} onValueChange={(value: PaymentFrequency) => setFormData(prev => ({ ...prev, payment_frequency: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {paymentFrequencies.map((freq) => (
                    <SelectItem key={freq.value} value={freq.value}>
                      {freq.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="remaining_term_months">Remaining Term (months)</Label>
              <Input
                id="remaining_term_months"
                type="number"
                placeholder="e.g., 24"
                value={formData.remaining_term_months}
                onChange={(e) => setFormData(prev => ({ ...prev, remaining_term_months: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="is_high_priority"
                checked={formData.is_high_priority}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_high_priority: checked }))}
              />
              <Label htmlFor="is_high_priority">High Priority Debt</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="is_variable_rate"
                checked={formData.is_variable_rate}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_variable_rate: checked }))}
              />
              <Label htmlFor="is_variable_rate">Variable Interest Rate</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="is_tax_deductible"
                checked={formData.is_tax_deductible}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_tax_deductible: checked }))}
              />
              <Label htmlFor="is_tax_deductible">Tax Deductible</Label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Any additional notes about this debt..."
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Add Debt
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddDebtDialog;