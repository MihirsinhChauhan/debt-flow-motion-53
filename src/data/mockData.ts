import { Debt, PaymentHistoryItem, DebtSummary } from "../types/debt";

export const mockDebts: Debt[] = [
  {
    id: "1",
    name: "Credit Card",
    debt_type: "credit_card",
    principal_amount: 5000,
    current_balance: 3200,
    amount: 5000,
    remainingAmount: 3200,
    interest_rate: 18.99,
    is_variable_rate: false,
    minimum_payment: 150,
    due_date: "2025-04-20",
    lender: "Chase Bank",
    remaining_term_months: 12,
    is_tax_deductible: false,
    payment_frequency: "monthly",
    is_high_priority: true,
    days_past_due: 0,
    notes: null,
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z"
  },
  {
    id: "2",
    name: "Education Loan",
    debt_type: "education_loan",
    principal_amount: 15000,
    current_balance: 12000,
    amount: 15000,
    remainingAmount: 12000,
    interest_rate: 4.5,
    is_variable_rate: false,
    minimum_payment: 200,
    due_date: "2025-04-15",
    lender: "Sallie Mae",
    remaining_term_months: 60,
    is_tax_deductible: true,
    payment_frequency: "monthly",
    is_high_priority: false,
    days_past_due: 0,
    notes: null,
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z"
  },
  {
    id: "3",
    name: "Car Loan",
    debt_type: "vehicle_loan",
    principal_amount: 22000,
    current_balance: 10500,
    amount: 22000,
    remainingAmount: 10500,
    interest_rate: 5.25,
    is_variable_rate: false,
    minimum_payment: 375,
    due_date: "2025-04-10",
    lender: "Toyota Financial",
    remaining_term_months: 24,
    is_tax_deductible: false,
    payment_frequency: "monthly",
    is_high_priority: false,
    days_past_due: 0,
    notes: null,
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z"
  },
  {
    id: "4",
    name: "Personal Loan (Family)",
    debt_type: "personal_loan",
    principal_amount: 3000,
    current_balance: 1200,
    amount: 3000,
    remainingAmount: 1200,
    interest_rate: 0,
    is_variable_rate: false,
    minimum_payment: 500,
    due_date: "2025-04-30",
    lender: "Mom & Dad",
    remaining_term_months: 3,
    is_tax_deductible: false,
    payment_frequency: "monthly",
    is_high_priority: true,
    days_past_due: 0,
    notes: "No interest family loan",
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z"
  },
  {
    id: "5",
    name: "Home Loan",
    debt_type: "home_loan",
    principal_amount: 350000,
    current_balance: 320000,
    amount: 350000,
    remainingAmount: 320000,
    interest_rate: 3.75,
    is_variable_rate: false,
    minimum_payment: 1800,
    due_date: "2025-04-01",
    lender: "Wells Fargo",
    remaining_term_months: 300,
    is_tax_deductible: true,
    payment_frequency: "monthly",
    is_high_priority: false,
    days_past_due: 0,
    notes: null,
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z"
  }
];

export const mockPaymentHistory: PaymentHistoryItem[] = [
  {
    id: "p1",
    debt_id: "1",
    amount: 300,
    payment_date: "2025-03-15",
    principal_portion: 250,
    interest_portion: 50,
    notes: "Extra payment",
    date: "2025-03-15"
  },
  {
    id: "p2",
    debt_id: "1",
    amount: 150,
    payment_date: "2025-02-15",
    principal_portion: 100,
    interest_portion: 50,
    notes: "Minimum payment",
    date: "2025-02-15"
  },
  {
    id: "p3",
    debt_id: "2",
    amount: 200,
    payment_date: "2025-03-10",
    principal_portion: 175,
    interest_portion: 25,
    notes: null,
    date: "2025-03-10"
  },
  {
    id: "p4",
    debt_id: "3",
    amount: 375,
    payment_date: "2025-03-05",
    principal_portion: 325,
    interest_portion: 50,
    notes: null,
    date: "2025-03-05"
  },
  {
    id: "p5",
    debt_id: "4",
    amount: 500,
    payment_date: "2025-02-28",
    principal_portion: 500,
    interest_portion: 0,
    notes: null,
    date: "2025-02-28"
  },
  {
    id: "p6",
    debt_id: "5",
    amount: 1800,
    payment_date: "2025-03-01",
    principal_portion: 1200,
    interest_portion: 600,
    notes: null,
    date: "2025-03-01"
  }
];

export const mockDebtSummary: DebtSummary = {
  total_debt: 346900,
  total_interest_paid: 4235,
  total_minimum_payments: 3025,
  average_interest_rate: 6.50,
  debt_count: 5,
  high_priority_count: 2,
  upcomingPaymentsCount: 3
};

export const aiSuggestions = [
  {
    id: "s1",
    title: "Pay off high-interest debt first",
    description: "Your Credit Card has an interest rate of 18.99%. Prioritize paying this off to save $320 in interest this year.",
    savingsAmount: 320,
    type: "high_interest"
  },
  {
    id: "s2",
    title: "Consolidate student loans",
    description: "You could save 1.2% APR by refinancing your student loan, saving approximately $144 per year.",
    savingsAmount: 144,
    type: "consolidation"
  },
  {
    id: "s3",
    title: "Set up automatic payments",
    description: "Setting up auto-pay for your Car Loan could get you a 0.25% interest rate reduction.",
    savingsAmount: 26,
    type: "automation"
  }
];

export const mockReminders = [
  {
    id: "r1",
    debtId: "5",
    dueDate: "2025-04-01",
    amount: 1800,
    message: "Home Mortgage payment due in 3 days",
    isPast: false,
    isToday: false
  },
  {
    id: "r2",
    debtId: "3",
    dueDate: "2025-04-10",
    amount: 375,
    message: "Car Loan payment due soon",
    isPast: false,
    isToday: false
  },
  {
    id: "r3",
    debtId: "2",
    dueDate: "2025-04-15",
    amount: 200,
    message: "Student Loan payment upcoming",
    isPast: false,
    isToday: false
  }
];
