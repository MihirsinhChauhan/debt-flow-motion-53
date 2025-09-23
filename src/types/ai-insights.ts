// Enhanced AI Insights Types for DebtEase
// Defines data structures for comprehensive AI-powered debt optimization

export type DebtStrategy = 'avalanche' | 'snowball' | 'custom';

// Complete AI Consultation Response matching exact backend structure
export interface AIConsultationResponse {
  debt_analysis: {
    total_debt: number;
    debt_count: number;
    average_interest_rate: number;
    total_minimum_payments: number;
    high_priority_count: number;
    generated_at: string;
  };
  recommendations: RecommendationItem[];
  professionalRecommendations?: ProfessionalRecommendation[];
  repaymentPlan?: RepaymentPlan;
  riskAssessment?: RiskAssessment;
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

// Standard recommendation item from backend
export interface RecommendationItem {
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
}

// Risk assessment structure
export interface RiskAssessment {
  level: 'low' | 'moderate' | 'high';
  factors: string[];
  mitigation_strategies: string[];
}

// Indian financial context types
export interface IndianFinancialContext {
  banks: {
    name: string;
    type: 'public' | 'private' | 'foreign';
    specialties: string[];
  }[];
  currencyFormatting: {
    symbol: '₹';
    locale: 'en-IN';
    position: 'before';
  };
  culturalConsiderations: {
    family_planning: boolean;
    festival_spending: boolean;
    investment_preferences: string[];
  };
}

export interface StrategyDetails {
  name: string;
  timeToDebtFree: number; // months
  totalInterestPaid: number;
  totalInterestSaved: number;
  monthlyPayment: number;
  debtFreeDate: string;
  description?: string;
}

export interface PaymentTimelineEntry {
  month: number;
  date: string;
  totalDebt: number;
  monthlyPayment: number;
  interestPaid: number;
  principalPaid: number;
  remainingBalance: number;
  strategy?: string;
}

export interface DebtOptimizationSuggestion {
  id: string;
  name: string;
  description: string;
  timeToDebtFree: number;
  totalInterestSaved: number;
  monthlyPaymentIncrease?: number;
  implementationSteps: string[];
  priority: 'high' | 'medium' | 'low';
  category: 'payment_increase' | 'strategy_change' | 'refinancing' | 'consolidation';
}

// Enhanced professional recommendation types
export interface ProfessionalRecommendation {
  id: string;
  recommendation_type: string;
  title: string;
  description: string;
  potential_savings?: number;
  priority_score: number; // 1-10 scale
  action_steps?: string[];
  timeline?: string;
  risk_factors?: string[];
  benefits?: string[];
  ideal_for?: string[];
  estimated_savings?: number;
  implementation_difficulty?: 'easy' | 'moderate' | 'complex';
  professional_reasoning?: string;
}

// Professional AI Consultation data structure (from real backend)
export interface ProfessionalAIConsultationData {
  debt_analysis: {
    total_debt: number;
    debt_count: number;
    average_interest_rate: number;
    total_minimum_payments: number;
    high_priority_count: number;
  };
  recommendations: ProfessionalRecommendation[];
  metadata: {
    processing_time: number;
    fallback_used: boolean;
    errors: string[];
  };
}

// Enhanced metadata for professional quality scoring
export interface ProfessionalInsightsMetadata {
  generatedAt: string;
  processingTime: number;
  dataFreshness: string;
  recommendationConfidence: number;
  professionalQualityScore?: number;
  fallbackUsed: boolean;
  errors: string[];
  rateLimitStatus?: {
    isLimited: boolean;
    retryAfter?: number;
    requestsRemaining?: number;
  };
  indianContext?: {
    bankingIntegration: boolean;
    culturalAdviceIncluded: boolean;
    regulatoryCompliance: boolean;
  };
  aiModelInfo?: {
    model: string;
    version: string;
    capabilities: string[];
  };
}

export interface StrategyDetails {
  name: string;
  timeToDebtFree: number; // months
  totalInterestPaid: number;
  totalInterestSaved: number;
  monthlyPayment: number;
  debtFreeDate: string;
  description?: string;
  benefits?: string[];
  reasoning?: string;
  ideal_for?: string[];
}

export interface ProfessionalStrategy {
  name: string;
  description: string;
  benefits: string[];
  reasoning: string;
  ideal_for: string[];
  estimated_savings?: number;
}

export interface RepaymentPlan {
  strategy: string;
  primary_strategy: ProfessionalStrategy;
  alternative_strategies: ProfessionalStrategy[];
  monthly_payment_amount: number;
  time_to_debt_free: number;
  total_interest_saved: number;
  expected_completion_date: string;
  key_insights: string[];
  action_items: string[];
  risk_factors: string[];
  indian_context?: {
    banking_integration: string[];
    cultural_advice: string[];
    regional_considerations: string[];
  };
}

export interface SimulationParameters {
  monthlyPayment: number;
  strategy: DebtStrategy;
  extraPayment?: number;
  debtToFocus?: string; // debt ID for custom strategy
}

export interface SimulationResults {
  originalPlan: StrategyDetails;
  optimizedPlan: StrategyDetails;
  savings: {
    timeMonths: number;
    interestAmount: number;
    percentageImprovement: number;
  };
  timeline: PaymentTimelineEntry[];
}

export interface StrategyComparison {
  avalanche: StrategyDetails;
  snowball: StrategyDetails;
  recommended: DebtStrategy;
  differences: {
    timeDifference: number; // months
    interestDifference: number; // amount
    paymentDifference: number; // monthly
  };
}

export interface AIInsightsData {
  // Current debt overview
  currentStrategy: StrategyDetails;
  debtSummary: {
    totalDebt: number;
    debtCount: number;
    averageInterestRate: number;
    totalMinimumPayments: number;
    highPriorityCount: number;
  };

  // Payment timeline data
  paymentTimeline: PaymentTimelineEntry[];

  // Strategy comparison
  strategyComparison: StrategyComparison;

  // Alternative optimization strategies
  alternativeStrategies: DebtOptimizationSuggestion[];

  // Enhanced professional recommendations
  professionalRecommendations?: ProfessionalRecommendation[];
  repaymentPlan?: RepaymentPlan;
  riskAssessment?: {
    level: 'low' | 'moderate' | 'high';
    factors: string[];
    mitigation_strategies: string[];
  };

  // Real-time simulation capabilities
  simulationResults?: SimulationResults;

  // Metadata
  metadata: ProfessionalInsightsMetadata;
}

// API Request/Response types for enhanced endpoints

export interface EnhancedInsightsRequest {
  monthlyPaymentBudget?: number;
  preferredStrategy?: DebtStrategy;
  includeDti?: boolean;
}

export interface EnhancedInsightsResponse {
  insights: AIInsightsData;
  recommendations: DebtOptimizationSuggestion[];
  dtiAnalysis?: {
    frontendDti: number;
    backendDti: number;
    totalMonthlyDebtPayments: number;
    monthlyIncome: number;
    isHealthy: boolean;
  };
}

export interface SimulatePaymentRequest {
  monthlyPayment: number;
  strategy: DebtStrategy;
  extraPayment?: number; // Note: Currently not supported by backend, will be ignored
  targetDebtId?: string; // Maps to extra_payment_target in backend
}

export interface SimulatePaymentResponse {
  results: SimulationResults;
  recommendations: string[];
  warnings?: string[];
}

export interface CompareStrategiesResponse {
  comparison: StrategyComparison;
  detailedBreakdown: {
    avalanche: {
      paymentOrder: Array<{ debtId: string; debtName: string; reason: string }>;
      monthlyBreakdown: PaymentTimelineEntry[];
    };
    snowball: {
      paymentOrder: Array<{ debtId: string; debtName: string; reason: string }>;
      monthlyBreakdown: PaymentTimelineEntry[];
    };
  };
}

export interface PaymentTimelineRequest {
  strategy?: DebtStrategy;
  monthlyPayment?: number;
  months?: number;
}

export interface PaymentTimelineResponse {
  timeline: PaymentTimelineEntry[];
  summary: {
    totalMonths: number;
    totalInterestPaid: number;
    totalPrincipalPaid: number;
    debtFreeDate: string;
  };
}

export interface OptimizationMetricsRequest {
  currentMonthlyPayment: number;
  targetMonthlyPayment: number;
  strategy: DebtStrategy;
}

export interface OptimizationMetricsResponse {
  metrics: {
    timeSaved: number; // months
    interestSaved: number;
    paymentIncrease: number;
    efficiencyGain: number; // percentage
  };
  breakdown: {
    originalPlan: StrategyDetails;
    optimizedPlan: StrategyDetails;
    monthlyImpact: number;
  };
}

// UI State types

export interface AIInsightsUIState {
  isLoading: boolean;
  error: string | null;
  selectedStrategy: DebtStrategy;
  simulationParams: SimulationParameters;
  showComparison: boolean;
  activeTimelineView: 'months' | 'years';
  expandedAlternatives: string[];
}

export interface LoadingStates {
  insights: boolean;
  simulation: boolean;
  comparison: boolean;
  timeline: boolean;
  optimization: boolean;
  professionalConsultation: boolean;
}

// Extended loading state for AI processing (90+ seconds)
export interface AIProcessingState {
  isLoading: boolean;
  stage: 'initializing' | 'analyzing_debt' | 'generating_recommendations' | 'finalizing' | 'completed' | 'error' | 'rate_limited';
  progress: number; // 0-100
  estimatedTime?: number; // seconds
  elapsedTime?: number; // seconds
  message?: string;
  hasTimeout?: boolean;
  qualityScore?: number; // Professional quality indicator
  fallbackUsed?: boolean;
}

// Professional consultation display state
export interface ProfessionalConsultationState {
  isProcessing: boolean;
  processingStage: string;
  qualityScore?: number;
  processingTime?: number;
  fallbackMode: boolean;
  errorState?: {
    type: 'rate_limit' | 'timeout' | 'server_error' | 'network_error';
    message: string;
    retryAfter?: number;
  };
}

// Rate limiting and error states
export interface RateLimitState {
  isLimited: boolean;
  retryAfter?: number; // seconds
  requestsRemaining?: number;
  limitType?: 'hourly' | 'daily' | 'monthly';
  errorType?: 'AI_RATE_LIMITED' | 'AI_TIMEOUT' | 'AI_UNAVAILABLE';
  fallbackAvailable?: boolean;
}

// Professional quality metrics
export interface QualityMetrics {
  professionalQualityScore: number; // 0-100
  dataFreshness: string;
  recommendationConfidence: number; // 0-100
  processingTime: number; // seconds
  fallbackUsed: boolean;
  indianContextIncluded: boolean;
}

// Chart data types for visualizations

export interface ChartDataPoint {
  month: number;
  date: string;
  totalDebt: number;
  monthlyPayment: number;
  interestPaid: number;
  principalPaid: number;
  strategy?: string;
  [key: string]: any; // For additional strategy lines
}

export interface ChartConfig {
  dataKey: string;
  stroke: string;
  strokeWidth?: number;
  dot?: boolean;
  name: string;
}

// Utility types

export type ChartTimeframe = '6m' | '1y' | '2y' | '5y' | 'all';
export type MetricType = 'debt' | 'payment' | 'interest' | 'principal';
export type ComparisonMode = 'side-by-side' | 'overlay' | 'difference';

// Error handling types

export interface AIInsightsError {
  code: string;
  message: string;
  field?: string;
  suggestion?: string;
  errorType?: 'rate_limit' | 'timeout' | 'server_error' | 'validation_error';
  retryable?: boolean;
}

export interface APIErrorResponse {
  detail: string;
  errors?: AIInsightsError[];
  code?: string;
  retryAfter?: number;
}

// Indian banking and financial context
export interface IndianBankingContext {
  recognizedBanks: {
    name: string;
    type: 'public_sector' | 'private_sector' | 'foreign' | 'cooperative';
    specialties: string[];
    digitalCapabilities: string[];
  }[];
  paymentMethods: {
    upi: boolean;
    netBanking: boolean;
    imps: boolean;
    neft: boolean;
    rtgs: boolean;
  };
  regulatoryContext: {
    rbiGuidelines: string[];
    taxImplications: string[];
    creditBureauIntegration: string[];
  };
}

// Currency formatting utilities for Indian context
export interface CurrencyDisplayOptions {
  locale: 'en-IN';
  currency: 'INR';
  symbol: '₹';
  displayFormat: 'symbol_first' | 'symbol_last';
  grouping: 'indian' | 'western'; // 1,23,45,678 vs 12,345,678
  precision: number;
}