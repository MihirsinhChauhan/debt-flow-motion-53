import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DebtWidget from '@/components/dashboard/widgets/DebtWidget';
import { apiService } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

// Mock the dependencies
vi.mock('@/lib/api');
vi.mock('@/context/AuthContext');
vi.mock('@/components/debt/DebtProgressRing', () => ({
  default: ({ progress, size }: { progress: number; size: number }) => (
    <div data-testid="debt-progress-ring" data-progress={progress} data-size={size}>
      Progress Ring: {progress.toFixed(1)}%
    </div>
  )
}));
vi.mock('@/components/debt/DTIIndicator', () => ({
  default: ({ monthlyIncome, totalMonthlyDebtPayments }: { monthlyIncome: number; totalMonthlyDebtPayments: number }) => (
    <div data-testid="dti-indicator" data-income={monthlyIncome} data-payments={totalMonthlyDebtPayments}>
      DTI Indicator
    </div>
  )
}));
vi.mock('@/components/debt/EnhancedDebtCard', () => ({
  default: ({ debt }: { debt: any }) => (
    <div data-testid="debt-card" data-debt-id={debt.id}>
      {debt.name}: {debt.current_balance}
    </div>
  )
}));
vi.mock('../AiSuggestionCard', () => ({
  default: ({ suggestion }: { suggestion: any }) => (
    <div data-testid="ai-suggestion" data-suggestion-id={suggestion.id}>
      {suggestion.title}
    </div>
  )
}));
vi.mock('../PaymentReminderCard', () => ({
  default: ({ reminder }: { reminder: any }) => (
    <div data-testid="payment-reminder" data-reminder-id={reminder.id}>
      {reminder.message}
    </div>
  )
}));

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

describe('DebtWidget', () => {
  const mockUser = {
    id: '1',
    email: 'test@example.com',
    monthly_income: 50000
  };

  const mockDebts = [
    {
      id: '1',
      name: 'Credit Card',
      debt_type: 'credit_card',
      principal_amount: 5000,
      current_balance: 3000,
      amount: 3000,
      remainingAmount: 3000,
      interest_rate: 18.5,
      is_variable_rate: false,
      minimum_payment: 300,
      due_date: '2024-01-15',
      lender: 'HDFC Bank',
      is_tax_deductible: false,
      payment_frequency: 'monthly',
      is_high_priority: true,
      days_past_due: 0,
    },
    {
      id: '2',
      name: 'Car Loan',
      debt_type: 'vehicle_loan',
      principal_amount: 800000,
      current_balance: 600000,
      amount: 600000,
      remainingAmount: 600000,
      interest_rate: 9.5,
      is_variable_rate: false,
      minimum_payment: 15000,
      due_date: '2024-01-20',
      lender: 'ICICI Bank',
      is_tax_deductible: false,
      payment_frequency: 'monthly',
      is_high_priority: false,
      days_past_due: -5,
    }
  ];

  const mockDebtSummary = {
    total_debt: 603000,
    total_interest_paid: 5000,
    total_minimum_payments: 15300,
    average_interest_rate: 14.0,
    debt_count: 2,
    high_priority_count: 1,
    upcomingPaymentsCount: 2
  };

  const mockAIRecommendations = [
    {
      id: '1',
      user_id: '1',
      recommendation_type: 'avalanche',
      title: 'Pay off high-interest debt first',
      description: 'Focus on your credit card debt to save on interest',
      potential_savings: 5000,
      priority_score: 9,
      is_dismissed: false
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
    (useAuth as any).mockReturnValue({ user: mockUser });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Loading States', () => {
    it('shows initial loading state when all data is loading', async () => {
      // Mock all API calls to be pending
      (apiService.getDebts as any).mockImplementation(() => new Promise(() => {}));
      (apiService.getDebtSummary as any).mockImplementation(() => new Promise(() => {}));
      (apiService.getAIRecommendations as any).mockImplementation(() => new Promise(() => {}));

      render(<DebtWidget />);

      expect(screen.getByText('Loading your debt data...')).toBeInTheDocument();
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('shows skeleton loaders for individual sections', async () => {
      // Mock debts to be loading while others complete
      (apiService.getDebts as any).mockImplementation(() => new Promise(() => {}));
      (apiService.getDebtSummary as any).mockResolvedValue(mockDebtSummary);
      (apiService.getAIRecommendations as any).mockResolvedValue(mockAIRecommendations);

      render(<DebtWidget />);

      await waitFor(() => {
        expect(screen.getByLabelText('Loading total debt amount')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('displays user-friendly error messages for 422 errors', async () => {
      const error422 = { status: 422, message: 'Unprocessable Entity' };
      (apiService.getDebts as any).mockRejectedValue(error422);
      (apiService.getDebtSummary as any).mockRejectedValue(error422);
      (apiService.getAIRecommendations as any).mockRejectedValue(error422);

      render(<DebtWidget />);

      await waitFor(() => {
        expect(screen.getByText('Invalid data format. Please refresh and try again.')).toBeInTheDocument();
      });
    });

    it('displays user-friendly error messages for 500 errors', async () => {
      const error500 = { status: 500, message: 'Internal Server Error' };
      (apiService.getAIRecommendations as any).mockRejectedValue(error500);
      (apiService.getDebts as any).mockResolvedValue(mockDebts);
      (apiService.getDebtSummary as any).mockResolvedValue(mockDebtSummary);

      render(<DebtWidget />);

      // Expand the widget to see AI recommendations tab
      fireEvent.click(screen.getByRole('article')); // Card is clickable

      await waitFor(() => {
        expect(screen.getByText('AI Insights')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('AI Insights'));

      await waitFor(() => {
        expect(screen.getByText('Server error. Our team has been notified.')).toBeInTheDocument();
      });
    });

    it('handles network errors gracefully', async () => {
      const networkError = new Error('Network error');
      (apiService.getDebts as any).mockRejectedValue(networkError);
      (apiService.getDebtSummary as any).mockResolvedValue(mockDebtSummary);
      (apiService.getAIRecommendations as any).mockResolvedValue(mockAIRecommendations);

      render(<DebtWidget />);

      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument();
      });
    });
  });

  describe('Retry Functionality', () => {
    it('shows retry button for failed API calls', async () => {
      (apiService.getDebts as any).mockRejectedValue(new Error('API Error'));
      (apiService.getDebtSummary as any).mockResolvedValue(mockDebtSummary);
      (apiService.getAIRecommendations as any).mockResolvedValue(mockAIRecommendations);

      render(<DebtWidget />);

      await waitFor(() => {
        expect(screen.getByText('Try Again')).toBeInTheDocument();
      });
    });

    it('allows retrying failed API calls', async () => {
      let callCount = 0;
      (apiService.getDebts as any).mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return Promise.reject(new Error('First attempt failed'));
        }
        return Promise.resolve(mockDebts);
      });
      (apiService.getDebtSummary as any).mockResolvedValue(mockDebtSummary);
      (apiService.getAIRecommendations as any).mockResolvedValue(mockAIRecommendations);

      render(<DebtWidget />);

      await waitFor(() => {
        expect(screen.getByText('Try Again')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Try Again'));

      await waitFor(() => {
        expect(callCount).toBe(2);
        expect(screen.getByText('Credit Card: 3000')).toBeInTheDocument();
      });
    });

    it('shows max retries reached message after 3 attempts', async () => {
      (apiService.getDebts as any).mockRejectedValue(new Error('Persistent error'));
      (apiService.getDebtSummary as any).mockResolvedValue(mockDebtSummary);
      (apiService.getAIRecommendations as any).mockResolvedValue(mockAIRecommendations);

      render(<DebtWidget />);

      // Try to retry 3 times
      for (let i = 0; i < 3; i++) {
        await waitFor(() => {
          expect(screen.getByText(/Try Again/)).toBeInTheDocument();
        });
        fireEvent.click(screen.getByText(/Try Again/));
      }

      await waitFor(() => {
        expect(screen.getByText('Max retries reached. Please refresh the page.')).toBeInTheDocument();
      });
    });
  });

  describe('Fallback Data and Caching', () => {
    it('uses cached data when API fails', async () => {
      const cachedDebts = JSON.stringify(mockDebts);
      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'debtease_debts') return cachedDebts;
        if (key === 'debtease_summary') return JSON.stringify(mockDebtSummary);
        return null;
      });

      (apiService.getDebts as any).mockRejectedValue(new Error('API Down'));
      (apiService.getDebtSummary as any).mockRejectedValue(new Error('API Down'));
      (apiService.getAIRecommendations as any).mockResolvedValue(mockAIRecommendations);

      render(<DebtWidget />);

      await waitFor(() => {
        expect(screen.getByText('Using cached data')).toBeInTheDocument();
        expect(screen.getByText('₹6,03,000')).toBeInTheDocument(); // Formatted total debt
      });
    });

    it('caches successful API responses', async () => {
      (apiService.getDebts as any).mockResolvedValue(mockDebts);
      (apiService.getDebtSummary as any).mockResolvedValue(mockDebtSummary);
      (apiService.getAIRecommendations as any).mockResolvedValue(mockAIRecommendations);

      render(<DebtWidget />);

      await waitFor(() => {
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith('debtease_debts', JSON.stringify(mockDebts));
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith('debtease_summary', JSON.stringify(mockDebtSummary));
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith('debtease_recommendations', JSON.stringify(mockAIRecommendations));
      });
    });
  });

  describe('Graceful Degradation', () => {
    it('shows debt data even when AI recommendations fail', async () => {
      (apiService.getDebts as any).mockResolvedValue(mockDebts);
      (apiService.getDebtSummary as any).mockResolvedValue(mockDebtSummary);
      (apiService.getAIRecommendations as any).mockRejectedValue(new Error('AI Service Down'));

      render(<DebtWidget />);

      await waitFor(() => {
        expect(screen.getByText('₹6,03,000')).toBeInTheDocument(); // Total debt still shows
      });

      // Expand widget to check AI tab
      fireEvent.click(screen.getByRole('article'));

      await waitFor(() => {
        expect(screen.getByText('AI Insights')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('AI Insights'));

      await waitFor(() => {
        expect(screen.getByText('Failed to load AI recommendations')).toBeInTheDocument();
      });
    });

    it('shows partial data when some APIs succeed and others fail', async () => {
      (apiService.getDebts as any).mockResolvedValue(mockDebts);
      (apiService.getDebtSummary as any).mockRejectedValue(new Error('Summary API Down'));
      (apiService.getAIRecommendations as any).mockResolvedValue(mockAIRecommendations);

      render(<DebtWidget />);

      await waitFor(() => {
        // Should still show debt count and calculated totals
        expect(screen.getByText('2')).toBeInTheDocument(); // Debt count from actual debts
        expect(screen.getByText('₹6,03,000')).toBeInTheDocument(); // Calculated total
      });
    });
  });

  describe('Accessibility', () => {
    it('provides proper ARIA attributes for loading states', async () => {
      (apiService.getDebts as any).mockImplementation(() => new Promise(() => {}));
      (apiService.getDebtSummary as any).mockImplementation(() => new Promise(() => {}));
      (apiService.getAIRecommendations as any).mockImplementation(() => new Promise(() => {}));

      render(<DebtWidget />);

      const loadingElement = screen.getByRole('status');
      expect(loadingElement).toHaveAttribute('aria-live', 'polite');
    });

    it('provides proper ARIA attributes for error states', async () => {
      (apiService.getDebts as any).mockRejectedValue(new Error('Test error'));
      (apiService.getDebtSummary as any).mockRejectedValue(new Error('Test error'));
      (apiService.getAIRecommendations as any).mockRejectedValue(new Error('Test error'));

      render(<DebtWidget />);

      await waitFor(() => {
        const errorElement = screen.getByRole('alert');
        expect(errorElement).toHaveAttribute('aria-live', 'polite');
      });
    });

    it('provides meaningful labels for skeleton loaders', async () => {
      (apiService.getDebts as any).mockImplementation(() => new Promise(() => {}));
      (apiService.getDebtSummary as any).mockResolvedValue(mockDebtSummary);
      (apiService.getAIRecommendations as any).mockResolvedValue(mockAIRecommendations);

      render(<DebtWidget />);

      await waitFor(() => {
        expect(screen.getByLabelText('Loading total debt amount')).toBeInTheDocument();
        expect(screen.getByLabelText('Loading monthly payment amount')).toBeInTheDocument();
        expect(screen.getByLabelText('Loading debt count')).toBeInTheDocument();
      });
    });
  });

  describe('User Interactions', () => {
    it('expands and collapses widget correctly', async () => {
      (apiService.getDebts as any).mockResolvedValue(mockDebts);
      (apiService.getDebtSummary as any).mockResolvedValue(mockDebtSummary);
      (apiService.getAIRecommendations as any).mockResolvedValue(mockAIRecommendations);

      render(<DebtWidget />);

      // Initially collapsed
      expect(screen.queryByText('AI Insights')).not.toBeInTheDocument();

      // Click to expand
      fireEvent.click(screen.getByRole('article'));

      await waitFor(() => {
        expect(screen.getByText('AI Insights')).toBeInTheDocument();
      });

      // Click back arrow to collapse
      fireEvent.click(screen.getByText('←'));

      await waitFor(() => {
        expect(screen.queryByText('AI Insights')).not.toBeInTheDocument();
      });
    });

    it('switches between tabs in expanded view', async () => {
      (apiService.getDebts as any).mockResolvedValue(mockDebts);
      (apiService.getDebtSummary as any).mockResolvedValue(mockDebtSummary);
      (apiService.getAIRecommendations as any).mockResolvedValue(mockAIRecommendations);

      render(<DebtWidget />);

      // Expand widget
      fireEvent.click(screen.getByRole('article'));

      await waitFor(() => {
        expect(screen.getByText('AI Insights')).toBeInTheDocument();
        expect(screen.getByText('Your Debts')).toBeInTheDocument();
        expect(screen.getByText('Reminders')).toBeInTheDocument();
      });

      // Click on Debts tab
      fireEvent.click(screen.getByText('Your Debts'));

      await waitFor(() => {
        expect(screen.getByText('Credit Card: 3000')).toBeInTheDocument();
      });

      // Click on Reminders tab
      fireEvent.click(screen.getByText('Reminders'));

      await waitFor(() => {
        expect(screen.getByText('Car Loan payment due in 5 days')).toBeInTheDocument();
      });
    });
  });
});