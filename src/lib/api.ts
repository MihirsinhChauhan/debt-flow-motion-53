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
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// API Response types
interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

interface AuthResponse {
  user: {
    id: string;
    email: string;
    full_name?: string;
    monthly_income?: number;
  };
  session_expires_at: string;
  message: string;
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

// Enhanced API Service Class with robust error handling and retry logic
export class ApiService {
  private baseUrl: string;
  private token: string | null = null;
  private tokenExpiresAt: Date | null = null;
  private debugMode: boolean = true;
  private requestId: number = 0;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
    this.token = localStorage.getItem('access_token');
    const expiresAt = localStorage.getItem('token_expires_at');
    if (expiresAt) {
      this.tokenExpiresAt = new Date(expiresAt);
    }
    this.log('ApiService initialized', { hasToken: !!this.token, baseUrl: this.baseUrl });
  }

  private log(message: string, data?: any) {
    if (this.debugMode) {
      console.log(`[API] ${message}`, data || '');
    }
  }

  private error(message: string, data?: any) {
    console.error(`[API ERROR] ${message}`, data || '');
  }

  // Enhanced authentication methods with lifecycle management
  setToken(token: string, expiresAt?: string) {
    this.token = token;
    localStorage.setItem('access_token', token);

    if (expiresAt) {
      this.tokenExpiresAt = new Date(expiresAt);
      localStorage.setItem('token_expires_at', expiresAt);
    }

    this.log('Token set successfully', {
      tokenPreview: token.substring(0, 20) + '...',
      expiresAt: expiresAt
    });
  }

  clearToken() {
    this.log('Clearing token and session data');
    this.token = null;
    this.tokenExpiresAt = null;
    localStorage.removeItem('access_token');
    localStorage.removeItem('token_expires_at');
  }

  isTokenExpired(): boolean {
    if (!this.token || !this.tokenExpiresAt) {
      return true;
    }
    const now = new Date();
    const isExpired = now >= this.tokenExpiresAt;
    if (isExpired) {
      this.log('Token is expired', { now, expiresAt: this.tokenExpiresAt });
    }
    return isExpired;
  }

  hasValidToken(): boolean {
    const hasToken = !!this.token && !this.isTokenExpired();
    this.log('Token validation check', { hasToken, token: !!this.token, expired: this.isTokenExpired() });
    return hasToken;
  }

  private getHeaders(skipAuth: boolean = false): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'X-Request-ID': (++this.requestId).toString(),
    };

    // Server expects session token in Authorization header (OAuth2-style)
    if (!skipAuth && this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
      this.log('Added Authorization header', { tokenPreview: this.token.substring(0, 20) + '...' });
    } else if (!skipAuth) {
      this.log('No token available for Authorization header');
    }

    return headers;
  }

  private async requestWithRetry<T>(
    endpoint: string,
    options: RequestInit = {},
    retryCount: number = 0,
    maxRetries: number = 3
  ): Promise<T> {
    const requestId = this.requestId;
    const url = `${this.baseUrl}${endpoint}`;
    const skipAuth = options.headers && 'skip-auth' in options.headers;

    this.log(`Request ${requestId}: ${options.method || 'GET'} ${endpoint}`, {
      retryCount,
      hasToken: !!this.token,
      skipAuth
    });

    try {
      const headers = skipAuth ?
        { ...options.headers } :
        { ...this.getHeaders(), ...options.headers };

      // Remove skip-auth flag from headers
      if ('skip-auth' in headers) {
        delete headers['skip-auth'];
      }

      const response = await fetch(url, {
        ...options,
        headers,
      });

      this.log(`Response ${requestId}: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        return this.handleErrorResponse(response, endpoint, options, retryCount, maxRetries, requestId);
      }

      const data = await response.json();
      this.log(`Success ${requestId}:`, { dataType: typeof data, hasData: !!data });
      return data;
    } catch (error) {
      return this.handleRequestError(error, endpoint, options, retryCount, maxRetries, requestId);
    }
  }

  private async handleErrorResponse<T>(
    response: Response,
    endpoint: string,
    options: RequestInit,
    retryCount: number,
    maxRetries: number,
    requestId: number
  ): Promise<T> {
    const errorData = await response.json().catch(() => ({}));
    this.error(`Request ${requestId} failed:`, {
      status: response.status,
      statusText: response.statusText,
      errorData,
      endpoint,
      retryCount
    });

    // Handle authentication errors with smart retry logic
    if (response.status === 401) {
      return this.handle401Error(endpoint, options, retryCount, maxRetries, errorData, requestId);
    }

    // Handle rate limiting with exponential backoff
    if (response.status === 429) {
      if (retryCount < maxRetries) {
        const backoffDelay = Math.min(1000 * Math.pow(2, retryCount), 10000);
        this.log(`Rate limited, retrying in ${backoffDelay}ms`, { requestId, retryCount });
        await this.delay(backoffDelay);
        return this.requestWithRetry(endpoint, options, retryCount + 1, maxRetries);
      }
      throw new Error('Rate limited. Please try again later.');
    }

    // Handle server errors with retry
    if (response.status >= 500 && retryCount < maxRetries) {
      const backoffDelay = Math.min(1000 * Math.pow(2, retryCount), 5000);
      this.log(`Server error, retrying in ${backoffDelay}ms`, { requestId, retryCount });
      await this.delay(backoffDelay);
      return this.requestWithRetry(endpoint, options, retryCount + 1, maxRetries);
    }

    // Handle specific error cases
    if (response.status === 404 && endpoint.includes('/onboarding/status')) {
      throw new Error('Onboarding not found (404)');
    }

    throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
  }

  private async handle401Error<T>(
    endpoint: string,
    options: RequestInit,
    retryCount: number,
    maxRetries: number,
    errorData: any,
    requestId: number
  ): Promise<T> {
    this.error(`401 Unauthorized for request ${requestId}`, {
      endpoint,
      hasToken: !!this.token,
      tokenExpired: this.isTokenExpired(),
      errorData
    });

    // Check if this is a session corruption issue vs expired token
    const isSessionCorruption = errorData.detail?.includes('Expected unicode, got Delete') ||
                                errorData.detail?.includes('cache') ||
                                errorData.detail?.includes('session');

    if (isSessionCorruption && retryCount < 2) {
      // For session corruption, try once more with the same token
      this.log(`Suspected session corruption, retrying request ${requestId}`, { retryCount });
      await this.delay(1000); // Brief delay for server recovery
      return this.requestWithRetry(endpoint, options, retryCount + 1, maxRetries);
    }

    // For critical operations, don't immediately clear the token
    const isCriticalOperation = endpoint.includes('/debts/') ||
                               endpoint.includes('/auth/me') ||
                               endpoint.includes('/onboarding/');

    if (isCriticalOperation && retryCount === 0) {
      this.log(`Critical operation failed, attempting one retry with fresh validation`, { requestId });
      // Brief delay then retry once more
      await this.delay(500);
      return this.requestWithRetry(endpoint, options, retryCount + 1, maxRetries);
    }

    // After retries failed, clear token and throw appropriate error
    this.clearToken();
    const errorMessage = isSessionCorruption ?
      'Session was corrupted on server. Please log in again.' :
      'Your session has expired. Please log in again.';

    throw new Error(errorMessage);
  }

  private async handleRequestError<T>(
    error: any,
    endpoint: string,
    options: RequestInit,
    retryCount: number,
    maxRetries: number,
    requestId: number
  ): Promise<T> {
    this.error(`Network error for request ${requestId}:`, {
      error: error.message,
      endpoint,
      retryCount
    });

    // Handle network errors and other fetch failures
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      if (retryCount < maxRetries) {
        const backoffDelay = Math.min(1000 * Math.pow(2, retryCount), 5000);
        this.log(`Network error, retrying in ${backoffDelay}ms`, { requestId, retryCount });
        await this.delay(backoffDelay);
        return this.requestWithRetry(endpoint, options, retryCount + 1, maxRetries);
      }
      throw new Error('Network error. Please check your connection and try again.');
    }

    // Re-throw custom errors and other errors
    throw error;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    return this.requestWithRetry<T>(endpoint, options);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Token validation before critical operations
  private async ensureValidToken(operation: string): Promise<void> {
    if (!this.hasValidToken()) {
      this.error(`Invalid token for operation: ${operation}`, {
        hasToken: !!this.token,
        isExpired: this.isTokenExpired()
      });
      throw new Error('Authentication required. Please log in again.');
    }
  }

  // Authentication API
  async login(email: string, password: string): Promise<AuthResponse> {
    this.log('Attempting login', { email });

    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);

    const response = await fetch(`${this.baseUrl}/api/auth/login/form`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'skip-auth': 'true' // Skip auth header for login
      } as any,
      body: formData,
    });

    if (!response.ok) {
      this.error('Login failed', { status: response.status, statusText: response.statusText });
      throw new Error('Invalid email or password');
    }

    const data = await response.json();
    this.log('Login successful', {
      hasToken: !!data.access_token,
      expiresAt: data.expires_at
    });

    // Server returns session token as 'access_token'
    this.setToken(data.access_token, data.expires_at);
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
    await this.ensureValidToken('getCurrentUser');

    this.log('Fetching current user');
    const data = await this.request<UserResponse>('/api/auth/me');

    this.log('User data retrieved successfully', { id: data.id, email: data.email });
    return {
      id: data.id,
      email: data.email,
      full_name: data.full_name,
      monthly_income: data.monthly_income,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };
  }

  // Enhanced Debt API with validation and comprehensive error handling
  async getDebts(activeOnly: boolean = true): Promise<Debt[]> {
    await this.ensureValidToken('getDebts');
    return this.request<Debt[]>(`/api/debts/?active_only=${activeOnly}`);
  }

  async getDebt(debtId: string): Promise<Debt> {
    await this.ensureValidToken('getDebt');
    return this.request<Debt>(`/api/debts/${debtId}`);
  }

  async createDebt(debt: Omit<Debt, 'id' | 'created_at' | 'updated_at' | 'days_past_due'>): Promise<Debt> {
    await this.ensureValidToken('createDebt');

    this.log('Creating debt', {
      name: debt.name,
      debt_type: debt.debt_type,
      current_balance: debt.current_balance
    });

    try {
      const result = await this.request<Debt>('/api/debts/', {
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

      this.log('Debt created successfully', { id: result.id, name: result.name });
      return result;
    } catch (error) {
      this.error('Failed to create debt', { error: error instanceof Error ? error.message : error });
      throw error;
    }
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
  async getBasicAIInsights(
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
  async getProfessionalAIInsights(): Promise<ProfessionalAIInsightsResponse> {
    // Use the correct backend endpoint
    const endpoint = '/api/ai/insights';

    return this.request<ProfessionalAIInsightsResponse>(endpoint, {
      // Extended timeout for AI processing (120 seconds)
      ...(typeof AbortController !== 'undefined' && {
        signal: AbortSignal.timeout(120000)
      })
    });
  }

  // Enhanced AI Insights method with cache-first approach
  async getAIInsights(): Promise<AIConsultationResponse> {
    try {
      // First check if we have cached insights
      const cacheStatus = await this.getAIInsightsStatus();

      if (cacheStatus.has_valid_cache && cacheStatus.cache_data) {
        // Return cached data immediately
        return {
          debt_analysis: cacheStatus.cache_data.debt_analysis,
          recommendations: cacheStatus.cache_data.recommendations,
          metadata: {
            is_cached: true,
            cache_age_seconds: cacheStatus.cache_age_seconds || 0,
            generated_at: cacheStatus.cache_data.generated_at || new Date().toISOString(),
            processing_time: cacheStatus.cache_data.processing_time || 0,
            ai_model_used: cacheStatus.cache_data.ai_model_used || 'cached'
          }
        };
      }

      // If no valid cache, check if processing is in progress
      if (cacheStatus.is_processing) {
        // If already processing, wait for completion or return partial result
        return this.waitForProcessing();
      }

      // No cache and not processing, start fresh generation
      return this.generateFreshAIInsights();

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

  // Get AI insights cache status
  async getAIInsightsStatus(): Promise<{
    has_valid_cache: boolean;
    is_processing: boolean;
    cache_age_seconds?: number;
    queue_position?: number;
    estimated_completion_time?: string;
    cache_data?: {
      debt_analysis: any;
      recommendations: any[];
      generated_at: string;
      processing_time: number;
      ai_model_used: string;
    };
  }> {
    return this.request('/api/ai/insights/status');
  }

  // Force refresh AI insights (bypass cache)
  async refreshAIInsights(): Promise<AIConsultationResponse> {
    return this.request<AIConsultationResponse>('/api/ai/insights/refresh', {
      method: 'POST',
      // Extended timeout for AI processing
      ...(typeof AbortController !== 'undefined' && {
        signal: AbortSignal.timeout(120000)
      })
    });
  }

  // Invalidate AI insights cache
  async invalidateAIInsightsCache(): Promise<{ success: boolean; message: string }> {
    return this.request('/api/ai/insights/cache', {
      method: 'DELETE'
    });
  }

  // Wait for processing completion
  private async waitForProcessing(): Promise<AIConsultationResponse> {
    let attempts = 0;
    const maxAttempts = 60; // Wait up to 2 minutes
    const pollInterval = 2000; // 2 seconds

    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, pollInterval));

      const status = await this.getAIInsightsStatus();

      if (status.has_valid_cache && status.cache_data) {
        // Processing completed, return cached result
        return {
          debt_analysis: status.cache_data.debt_analysis,
          recommendations: status.cache_data.recommendations,
          metadata: {
            is_cached: true,
            cache_age_seconds: status.cache_age_seconds || 0,
            generated_at: status.cache_data.generated_at,
            processing_time: status.cache_data.processing_time,
            ai_model_used: status.cache_data.ai_model_used
          }
        };
      }

      if (!status.is_processing) {
        // Processing failed or stopped, fall back to fresh generation
        break;
      }

      attempts++;
    }

    // Timeout waiting for processing, fall back to fresh generation
    return this.generateFreshAIInsights();
  }

  // Generate fresh AI insights
  private async generateFreshAIInsights(): Promise<AIConsultationResponse> {
    const endpoint = '/api/ai/insights';

    const response = await this.request<AIConsultationResponse>(endpoint, {
      // Extended timeout for AI processing (120 seconds)
      ...(typeof AbortController !== 'undefined' && {
        signal: AbortSignal.timeout(120000)
      })
    });

    return response;
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
