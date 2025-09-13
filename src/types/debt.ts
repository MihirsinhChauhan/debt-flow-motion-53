export type DebtType = 'credit_card' | 'personal_loan' | 'home_loan' | 'vehicle_loan' | 'education_loan' | 'business_loan' | 'gold_loan' | 'overdraft' | 'emi' | 'other';

export type PaymentFrequency = 'weekly' | 'biweekly' | 'monthly' | 'quarterly';

export interface Debt {
  id: string;
  name: string;
  debt_type: DebtType;
  principal_amount: number;
  current_balance: number;
  amount: number; // For backward compatibility
  remainingAmount: number; // For backward compatibility
  interest_rate: number;
  is_variable_rate: boolean;
  minimum_payment: number;
  due_date: string; // YYYY-MM-DD format
  lender: string;
  remaining_term_months?: number;
  is_tax_deductible: boolean;
  payment_frequency: PaymentFrequency;
  is_high_priority: boolean;
  days_past_due: number;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PaymentHistoryItem {
  id: string;
  debt_id: string;
  amount: number;
  payment_date: string;
  principal_portion?: number;
  interest_portion?: number;
  notes?: string;
  date: string; // For backward compatibility
}

export interface DebtSummary {
  total_debt: number;
  total_interest_paid: number;
  total_minimum_payments: number;
  average_interest_rate: number;
  debt_count: number;
  high_priority_count: number;
  upcomingPaymentsCount: number;
}

export interface UserProfile {
  id: string;
  email?: string;
  full_name?: string;
  monthly_income?: number;
  created_at?: string;
  updated_at?: string;
}

export interface UserStreak {
  id: string;
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_check_in?: string;
  total_payments_logged: number;
  milestones_achieved: string[];
  created_at?: string;
  updated_at?: string;
}

export interface AIRecommendation {
  id: string;
  user_id: string;
  recommendation_type: 'snowball' | 'avalanche' | 'refinance';
  title: string;
  description: string;
  potential_savings?: number;
  priority_score: number;
  is_dismissed: boolean;
  created_at?: string;
}

// DTI calculation utilities
export interface DTIMetrics {
  frontend_dti: number; // Housing costs only
  backend_dti: number; // All debt payments
  total_monthly_debt_payments: number;
  monthly_income: number;
  is_healthy: boolean;
}