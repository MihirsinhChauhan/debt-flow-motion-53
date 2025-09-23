// API Service Layer for DebtEase
// Handles all backend communication with proper TypeScript types

import { Debt, DebtSummary, UserProfile, AIRecommendation, PaymentHistoryItem, OnboardingProgress, OnboardingProfileData, OnboardingGoalData } from '../types/debt';
import {
  EnhancedInsightsRequest,
  EnhancedInsightsResponse,
  SimulatePaymentRequest,
  SimulatePaymentResponse,
  CompareStrategiesResponse,
  PaymentTimelineRequest,
  PaymentTimelineResponse,
  OptimizationMetricsRequest,
  OptimizationMetricsResponse
} from '../types/ai-insights';

// API Configuration
const API_BASE_URL =  'http://localhost:8000';

// API Response types
interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

interface AuthResponse {
  access_token: string;
  token_type: string;
}

interface UserResponse {
  id: string;
  email: string;
  full_name?: string;
  monthly_income?: number;
  created_at?: string;
  updated_at?: string;
}

interface AIInsightsResponse {
  debt_analysis: {
    total_debt: number;
    debt_count: number;
    average_interest_rate: number;
    total_minimum_payments: number;
    high_priority_count: number;
    generated_at: string;
  };
  recommendations: AIRecommendation[];
  dti_analysis?: {
    frontend_dti: number;
    backend_dti: number;
    total_monthly_debt_payments: number;
    monthly_income: number;
    is_healthy: boolean;
  };
  repayment_plan?: any;
  metadata: {
    processing_time: number;
    fallback_used: boolean;
    errors: string[];
    generated_at: string;
  };
}

// Professional AI Consultation Response (Real backend endpoint)
interface ProfessionalAIInsightsResponse {
  debt_analysis: {
    total_debt: number;
    debt_count: number;
    average_interest_rate: number;
    total_minimum_payments: number;
    high_priority_count: number;
  };
  recommendations: Array<{
    id: string;
    recommendation_type: string;
    title: string;
    description: string;
    potential_savings?: number;
    priority_score: number;
    action_steps?: string[];
    timeline?: string;
    risk_factors?: string[];
    benefits?: string[];
    ideal_for?: string[];
    estimated_savings?: number;
    implementation_difficulty?: 'easy' | 'moderate' | 'complex';
    professional_reasoning?: string;
  }>;
  metadata: {
    processing_time: number;
    fallback_used: boolean;
    errors: string[];
  };
}

// Enhanced AI Consultation Response matching exact backend structure
interface AIConsultationResponse {
  debt_analysis: {
    total_debt: number;
    debt_count: number;
    average_interest_rate: number;
    total_minimum_payments: number;
    high_priority_count: number;
    generated_at: string;
  };
  recommendations: Array<{
    id: string;
    user_id: string;
    recommendation_type: string;
    title: string;
    description: string;
    potential_savings?: number;
    priority_score: number;
    is_dismissed: boolean;
    created_at: string;
    action_steps?: string[];
    timeline?: string;
    risk_factors?: string[];
    benefits?: string[];
    ideal_for?: string[];
    estimated_savings?: number;
    implementation_difficulty?: 'easy' | 'moderate' | 'complex';
    professional_reasoning?: string;
  }>;
  professionalRecommendations?: Array<{
    id: string;
    recommendation_type: string;
    title: string;
    description: string;
    potential_savings?: number;
    priority_score: number;
    action_steps?: string[];
    timeline?: string;
    risk_factors?: string[];
    benefits?: string[];
    ideal_for?: string[];
    estimated_savings?: number;
    implementation_difficulty?: 'easy' | 'moderate' | 'complex';
    professional_reasoning?: string;
  }>;
  repaymentPlan?: {
    strategy: string;
    primary_strategy: {
      name: string;
      description: string;
      benefits: string[];
      reasoning: string;
      ideal_for: string[];
      estimated_savings?: number;
    };
    alternative_strategies: Array<{
      name: string;
      description: string;
      benefits: string[];
      reasoning: string;
      ideal_for: string[];
      estimated_savings?: number;
    }>;
    monthly_payment_amount: number;
    time_to_debt_free: number;
    total_interest_saved: number;
    expected_completion_date: string;
    key_insights: string[];
    action_items: string[];
    risk_factors: string[];
  };
  riskAssessment?: {
    level: 'low' | 'moderate' | 'high';
    factors: string[];
    mitigation_strategies: string[];
  };
  dtiAnalysis?: {
    frontend_dti: number;
    backend_dti: number;
    total_monthly_debt_payments: number;
    monthly_income: number;
    is_healthy: boolean;
  };
  metadata: {
    processing_time: number;
    fallback_used: boolean;
    errors: string[];
    generated_at: string;
    quality_score?: number;
    rate_limit_status?: {
      is_limited: boolean;
      retry_after?: number;
      requests_remaining?: number;
    };
  };
}

// API Service Class
export class ApiService {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
    this.token = localStorage.getItem('access_token');
  }

  // Authentication methods
  setToken(token: string) {
    this.token = token;
    localStorage.setItem('access_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('access_token');
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  // Authentication API
  async login(email: string, password: string): Promise<AuthResponse> {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);

    const response = await fetch(`${this.baseUrl}/api/auth/login/form`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Invalid email or password');
    }

    const data = await response.json();
    this.setToken(data.access_token);
    return data;
  }

  async register(email: string, password: string, fullName: string): Promise<UserResponse> {
    return this.request<UserResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email,
        password,
        full_name: fullName,
      }),
    });
  }

  async getCurrentUser(): Promise<UserProfile> {
    const data = await this.request<UserResponse>('/api/auth/me');
    return {
      id: data.id,
      email: data.email,
      full_name: data.full_name,
      monthly_income: data.monthly_income,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };
  }

  // Debt API
  async getDebts(activeOnly: boolean = true): Promise<Debt[]> {
    return this.request<Debt[]>(`/api/debts/?active_only=${activeOnly}`);
  }

  async getDebt(debtId: string): Promise<Debt> {
    return this.request<Debt>(`/api/debts/${debtId}`);
  }

  async createDebt(debt: Omit<Debt, 'id' | 'created_at' | 'updated_at' | 'days_past_due'>): Promise<Debt> {
    return this.request<Debt>('/api/debts/', {
      method: 'POST',
      body: JSON.stringify({
        name: debt.name,
        debt_type: debt.debt_type,
        principal_amount: debt.principal_amount,
        current_balance: debt.current_balance,
        interest_rate: debt.interest_rate,
        is_variable_rate: debt.is_variable_rate,
        minimum_payment: debt.minimum_payment,
        due_date: debt.due_date,
        lender: debt.lender,
        remaining_term_months: debt.remaining_term_months,
        is_tax_deductible: debt.is_tax_deductible,
        payment_frequency: debt.payment_frequency,
        is_high_priority: debt.is_high_priority,
        notes: debt.notes,
      }),
    });
  }

  async updateDebt(debtId: string, debt: Partial<Debt>): Promise<Debt> {
    return this.request<Debt>(`/api/debts/${debtId}`, {
      method: 'PUT',
      body: JSON.stringify({
        name: debt.name,
        debt_type: debt.debt_type,
        principal_amount: debt.principal_amount,
        current_balance: debt.current_balance,
        interest_rate: debt.interest_rate,
        is_variable_rate: debt.is_variable_rate,
        minimum_payment: debt.minimum_payment,
        due_date: debt.due_date,
        lender: debt.lender,
        remaining_term_months: debt.remaining_term_months,
        is_tax_deductible: debt.is_tax_deductible,
        payment_frequency: debt.payment_frequency,
        is_high_priority: debt.is_high_priority,
        notes: debt.notes,
        is_active: debt.is_active,
      }),
    });
  }

  async deleteDebt(debtId: string): Promise<Debt> {
    return this.request<Debt>(`/api/debts/${debtId}`, {
      method: 'DELETE',
    });
  }

  async getDebtSummary(): Promise<DebtSummary> {
    const response = await this.request<{
      total_debt: number;
      total_interest_paid: number;
      total_minimum_payments: number;
      average_interest_rate: number;
      debt_count: number;
      high_priority_count: number;
      upcoming_payments_count: number;
    }>('/api/debts/summary');

    // Map backend response to frontend interface
    return {
      total_debt: response.total_debt,
      total_interest_paid: response.total_interest_paid,
      total_minimum_payments: response.total_minimum_payments,
      average_interest_rate: response.average_interest_rate,
      debt_count: response.debt_count,
      high_priority_count: response.high_priority_count,
      upcomingPaymentsCount: response.upcoming_payments_count, // Map snake_case to camelCase
    };
  }

  // Payment API
  async recordPayment(debtId: string, amount: number, paymentDate?: string, notes?: string): Promise<PaymentHistoryItem> {
    return this.request<PaymentHistoryItem>(`/api/payments/${debtId}/record`, {
      method: 'POST',
      body: JSON.stringify({
        amount,
        payment_date: paymentDate,
        notes,
      }),
    });
  }

  async getPaymentHistory(debtId?: string): Promise<PaymentHistoryItem[]> {
    const endpoint = debtId ? `/api/payments/history?debt_id=${debtId}` : '/api/payments/history';
    return this.request<PaymentHistoryItem[]>(endpoint);
  }

  // AI API
  async getAIInsights(
    monthlyPaymentBudget?: number,
    preferredStrategy?: string,
    includeDti: boolean = true
  ): Promise<AIInsightsResponse> {
    const params = new URLSearchParams();
    if (monthlyPaymentBudget !== undefined) {
      params.append('monthly_payment_budget', monthlyPaymentBudget.toString());
    }
    if (preferredStrategy) {
      params.append('preferred_strategy', preferredStrategy);
    }
    params.append('include_dti', includeDti.toString());

    return this.request<AIInsightsResponse>(`/api/ai/insights?${params.toString()}`);
  }

  // Professional AI Consultation Endpoint - Real backend insights
  async getProfessionalAIInsights(userId?: string): Promise<ProfessionalAIInsightsResponse> {
    // If no userId provided, use current user endpoint that backend will resolve
    const endpoint = userId
      ? `/api/ai-insights/insights/${userId}`
      : '/api/ai-insights/insights/me';

    return this.request<ProfessionalAIInsightsResponse>(endpoint, {
      // Extended timeout for AI processing (120 seconds)
      ...(typeof AbortController !== 'undefined' && {
        signal: AbortSignal.timeout(120000)
      })
    });
  }

  // Enhanced AI Insights method with comprehensive error handling
  async getAIInsights(userId?: string): Promise<AIConsultationResponse> {
    try {
      // If no userId provided, use current user endpoint that backend will resolve
      const endpoint = userId
        ? `/api/ai-insights/insights/${userId}`
        : '/api/ai-insights/insights/me';

      const response = await this.request<AIConsultationResponse>(endpoint, {
        // Extended timeout for AI processing (120 seconds)
        ...(typeof AbortController !== 'undefined' && {
          signal: AbortSignal.timeout(120000)
        })
      });

      return response;
    } catch (error) {
      // Enhanced error handling for rate limiting and timeouts
      if (error instanceof Error) {
        if (error.message.includes('429') || error.message.includes('rate limit')) {
          throw new Error('AI_RATE_LIMITED');
        }
        if (error.message.includes('timeout') || error.message.includes('AbortError')) {
          throw new Error('AI_TIMEOUT');
        }
        if (error.message.includes('503') || error.message.includes('unavailable')) {
          throw new Error('AI_UNAVAILABLE');
        }
      }
      throw error;
    }
  }

  async getAIRecommendations(): Promise<AIRecommendation[]> {
    return this.request<AIRecommendation[]>('/api/ai/recommendations');
  }

  async getDTIAnalysis(): Promise<{
    frontend_dti: number;
    backend_dti: number;
    total_monthly_debt_payments: number;
    monthly_income: number;
    is_healthy: boolean;
  }> {
    return this.request('/api/ai/dti');
  }

  async generateAIInsights(request: {
    monthly_payment_budget?: number;
    preferred_strategy?: string;
    include_dti?: boolean;
  }): Promise<AIInsightsResponse> {
    return this.request<AIInsightsResponse>('/api/ai/insights', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // Enhanced AI Endpoints
  async getEnhancedInsights(request?: EnhancedInsightsRequest): Promise<EnhancedInsightsResponse> {
    const params = new URLSearchParams();
    if (request?.monthlyPaymentBudget !== undefined) {
      params.append('monthly_payment_budget', request.monthlyPaymentBudget.toString());
    }
    if (request?.preferredStrategy) {
      params.append('preferred_strategy', request.preferredStrategy);
    }
    if (request?.includeDti !== undefined) {
      params.append('include_dti', request.includeDti.toString());
    }

    const endpoint = params.toString()
      ? `/api/ai/insights/enhanced?${params.toString()}`
      : '/api/ai/insights/enhanced';

    return this.request<EnhancedInsightsResponse>(endpoint);
  }

  async simulatePaymentScenario(request: SimulatePaymentRequest): Promise<SimulatePaymentResponse> {
    // Convert single scenario to the backend expected format
    const scenario: any = {
      monthly_payment: request.monthlyPayment,
      strategy: request.strategy
    };

    // Only add optional fields if they exist
    if (request.targetDebtId) {
      scenario.extra_payment_target = request.targetDebtId;
    }

    const backendRequest = {
      scenarios: [scenario]
    };

    return this.request<SimulatePaymentResponse>('/api/ai/simulate', {
      method: 'POST',
      body: JSON.stringify(backendRequest),
    });
  }

  async compareStrategies(): Promise<CompareStrategiesResponse> {
    return this.request<CompareStrategiesResponse>('/api/ai/strategies/compare');
  }

  async getPaymentTimeline(request?: PaymentTimelineRequest): Promise<PaymentTimelineResponse> {
    const params = new URLSearchParams();
    if (request?.strategy) {
      params.append('strategy', request.strategy);
    }
    if (request?.monthlyPayment !== undefined) {
      params.append('monthly_payment', request.monthlyPayment.toString());
    }
    if (request?.months !== undefined) {
      params.append('months', request.months.toString());
    }

    const endpoint = params.toString()
      ? `/api/ai/timeline?${params.toString()}`
      : '/api/ai/timeline';

    return this.request<PaymentTimelineResponse>(endpoint);
  }

  async getOptimizationMetrics(request: OptimizationMetricsRequest): Promise<OptimizationMetricsResponse> {
    return this.request<OptimizationMetricsResponse>('/api/ai/optimize', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // Onboarding API
  async startOnboarding(): Promise<OnboardingProgress> {
    return this.request<OnboardingProgress>('/api/onboarding/start', {
      method: 'POST',
    });
  }

  async getOnboardingStatus(): Promise<OnboardingProgress> {
    return this.request<OnboardingProgress>('/api/onboarding/status');
  }

  async updateProfile(profileData: OnboardingProfileData): Promise<OnboardingProgress> {
    return this.request<OnboardingProgress>('/api/onboarding/profile', {
      method: 'POST',
      body: JSON.stringify(profileData),
    });
  }

  async skipDebtEntry(): Promise<OnboardingProgress> {
    return this.request<OnboardingProgress>('/api/onboarding/debts/skip', {
      method: 'POST',
    });
  }

  async setGoals(goalData: OnboardingGoalData): Promise<OnboardingProgress> {
    return this.request<OnboardingProgress>('/api/onboarding/goals', {
      method: 'POST',
      body: JSON.stringify(goalData),
    });
  }

  async completeOnboarding(): Promise<OnboardingProgress> {
    return this.request<OnboardingProgress>('/api/onboarding/complete', {
      method: 'POST',
    });
  }

  async getOnboardingAnalytics(): Promise<{
    completion_rate: number;
    average_time_spent: number;
    drop_off_points: string[];
    total_started: number;
    total_completed: number;
  }> {
    return this.request('/api/onboarding/analytics');
  }

  async navigateToStep(step: string): Promise<OnboardingProgress> {
    return this.request<OnboardingProgress>(`/api/onboarding/navigate/${step}`, {
      method: 'POST',
    });
  }

  // Utility methods
  async healthCheck(): Promise<{ status: string }> {
    const response = await fetch(`${this.baseUrl}/health`);
    if (!response.ok) {
      throw new Error(`Health check failed: ${response.status}`);
    }
    return response.json();
  }
}

// Create and export singleton instance
export const apiService = new ApiService();

// Export types for use in components
export type {
  ApiResponse,
  AuthResponse,
  UserResponse,
  AIInsightsResponse,
  ProfessionalAIInsightsResponse,
  AIConsultationResponse
};
