// Custom hook for AI Insights with comprehensive state management
// Handles caching, processing states, error handling, and retry logic

import { useState, useEffect, useCallback, useRef } from 'react';
import { apiService } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import {
  AIConsultationResponse,
  AIProcessingState,
  AIInsightsCacheStatus,
  RateLimitState,
  QualityMetrics,
  RecommendationItem,
  DebtStrategy
} from '@/types/ai-insights';

interface UseAIInsightsOptions {
  enableAutoRefresh?: boolean;
  refreshInterval?: number; // minutes
  enableCaching?: boolean;
  maxRetries?: number;
}

interface AIInsightsState {
  data: AIConsultationResponse | null;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  cacheStatus: AIInsightsCacheStatus | null;
  processingState: AIProcessingState;
  rateLimitState: RateLimitState;
  qualityMetrics: QualityMetrics | null;
  lastUpdated: Date | null;
  hasData: boolean;
}

interface AIInsightsActions {
  fetchInsights: () => Promise<void>;
  refreshInsights: () => Promise<void>;
  invalidateCache: () => Promise<void>;
  checkStatus: () => Promise<void>;
  retry: () => Promise<void>;
  dismissError: () => void;
}

const initialState: AIInsightsState = {
  data: null,
  isLoading: false,
  isRefreshing: false,
  error: null,
  cacheStatus: null,
  processingState: {
    isLoading: false,
    stage: 'initializing',
    progress: 0,
    fallbackUsed: false
  },
  rateLimitState: {
    isLimited: false,
    fallbackAvailable: false
  },
  qualityMetrics: null,
  lastUpdated: null,
  hasData: false
};

export const useAIInsights = (options: UseAIInsightsOptions = {}) => {
  const {
    enableAutoRefresh = false,
    refreshInterval = 30, // minutes
    enableCaching = true,
    maxRetries = 3
  } = options;

  const { user } = useAuth();
  const [state, setState] = useState<AIInsightsState>(initialState);
  const retryCount = useRef(0);
  const abortController = useRef<AbortController | null>(null);

  // Status polling for long-running AI operations
  const statusPollingInterval = useRef<NodeJS.Timeout | null>(null);
  const refreshTimer = useRef<NodeJS.Timeout | null>(null);

  // Check cache status and processing state
  const checkStatus = useCallback(async () => {
    if (!user) return;

    try {
      const cacheStatus = await apiService.getAIInsightsStatus();

      setState(prev => ({
        ...prev,
        cacheStatus,
        processingState: {
          ...prev.processingState,
          isLoading: cacheStatus.is_processing,
          stage: cacheStatus.is_processing ? 'analyzing_debt' : 'completed',
          progress: cacheStatus.is_processing ? 50 : 100
        }
      }));

      return cacheStatus;
    } catch (error) {
      console.error('Failed to check AI insights status:', error);
      return null;
    }
  }, [user]);

  // Enhanced error handling with proper categorization
  const handleError = useCallback((error: any) => {
    let errorMessage = 'An unexpected error occurred';
    let errorType: RateLimitState['errorType'] = 'AI_UNAVAILABLE';
    let retryAfter: number | undefined;
    let fallbackAvailable = false;

    if (error instanceof Error) {
      if (error.message === 'AI_RATE_LIMITED') {
        errorMessage = 'AI service is temporarily unavailable due to high demand. Please try again in a few minutes.';
        errorType = 'AI_RATE_LIMITED';
        retryAfter = 300; // 5 minutes
        fallbackAvailable = true;
      } else if (error.message === 'AI_TIMEOUT') {
        errorMessage = 'AI processing is taking longer than expected. Please wait and try again.';
        errorType = 'AI_TIMEOUT';
        retryAfter = 120; // 2 minutes
        fallbackAvailable = true;
      } else if (error.message === 'AI_UNAVAILABLE') {
        errorMessage = 'AI service is currently unavailable. Please try again later.';
        errorType = 'AI_UNAVAILABLE';
        retryAfter = 600; // 10 minutes
        fallbackAvailable = false;
      } else {
        errorMessage = error.message;
      }
    }

    setState(prev => ({
      ...prev,
      error: errorMessage,
      isLoading: false,
      isRefreshing: false,
      rateLimitState: {
        isLimited: errorType === 'AI_RATE_LIMITED',
        retryAfter,
        errorType,
        fallbackAvailable
      },
      processingState: {
        ...prev.processingState,
        isLoading: false,
        stage: 'error'
      }
    }));
  }, []);

  // Process AI insights response and extract quality metrics
  const processResponse = useCallback((response: AIConsultationResponse): QualityMetrics | null => {
    if (!response.metadata) return null;

    return {
      professionalQualityScore: response.metadata.quality_score || 0,
      dataFreshness: response.metadata.generated_at,
      recommendationConfidence: 85, // Default confidence
      processingTime: response.metadata.processing_time || 0,
      fallbackUsed: response.metadata.fallback_used || false,
      indianContextIncluded: true // Assume true for Indian market
    };
  }, []);

  // Start status polling for processing operations
  const startStatusPolling = useCallback(() => {
    if (statusPollingInterval.current) {
      clearInterval(statusPollingInterval.current);
    }

    statusPollingInterval.current = setInterval(async () => {
      const status = await checkStatus();

      if (status && !status.is_processing && status.has_valid_cache) {
        // Processing completed, stop polling and fetch results
        if (statusPollingInterval.current) {
          clearInterval(statusPollingInterval.current);
          statusPollingInterval.current = null;
        }
        await fetchInsights();
      }
    }, 3000); // Poll every 3 seconds
  }, [checkStatus]);

  // Stop status polling
  const stopStatusPolling = useCallback(() => {
    if (statusPollingInterval.current) {
      clearInterval(statusPollingInterval.current);
      statusPollingInterval.current = null;
    }
  }, []);

  // Main fetch function with enhanced caching logic
  const fetchInsights = useCallback(async () => {
    if (!user) return;

    // Cancel any previous request
    if (abortController.current) {
      abortController.current.abort();
    }
    abortController.current = new AbortController();

    setState(prev => ({
      ...prev,
      isLoading: true,
      error: null,
      processingState: {
        ...prev.processingState,
        isLoading: true,
        stage: 'initializing',
        progress: 0
      }
    }));

    try {
      // First check cache status if caching is enabled
      if (enableCaching) {
        await checkStatus();
      }

      setState(prev => ({
        ...prev,
        processingState: {
          ...prev.processingState,
          stage: 'analyzing_debt',
          progress: 25
        }
      }));

      const response = await apiService.getAIInsights();
      const qualityMetrics = processResponse(response);

      setState(prev => ({
        ...prev,
        data: response,
        isLoading: false,
        error: null,
        qualityMetrics,
        lastUpdated: new Date(),
        hasData: true,
        processingState: {
          ...prev.processingState,
          isLoading: false,
          stage: 'completed',
          progress: 100,
          qualityScore: qualityMetrics?.professionalQualityScore,
          fallbackUsed: response.metadata.fallback_used
        },
        rateLimitState: {
          isLimited: false,
          fallbackAvailable: false
        }
      }));

      retryCount.current = 0; // Reset retry count on success

    } catch (error) {
      console.error('Failed to fetch AI insights:', error);
      handleError(error);
    }
  }, [user, enableCaching, checkStatus, processResponse, handleError]);

  // Refresh insights (bypass cache)
  const refreshInsights = useCallback(async () => {
    if (!user) return;

    setState(prev => ({
      ...prev,
      isRefreshing: true,
      error: null
    }));

    try {
      const response = await apiService.refreshAIInsights();
      const qualityMetrics = processResponse(response);

      setState(prev => ({
        ...prev,
        data: response,
        isRefreshing: false,
        error: null,
        qualityMetrics,
        lastUpdated: new Date(),
        hasData: true,
        processingState: {
          ...prev.processingState,
          isLoading: false,
          stage: 'completed',
          progress: 100,
          qualityScore: qualityMetrics?.professionalQualityScore,
          fallbackUsed: response.metadata.fallback_used
        }
      }));

    } catch (error) {
      console.error('Failed to refresh AI insights:', error);
      handleError(error);
    }
  }, [user, processResponse, handleError]);

  // Invalidate cache
  const invalidateCache = useCallback(async () => {
    try {
      await apiService.invalidateAIInsightsCache();
      await checkStatus();
    } catch (error) {
      console.error('Failed to invalidate cache:', error);
    }
  }, [checkStatus]);

  // Retry with exponential backoff
  const retry = useCallback(async () => {
    if (retryCount.current >= maxRetries) {
      setState(prev => ({
        ...prev,
        error: 'Maximum retry attempts reached. Please try again later.'
      }));
      return;
    }

    retryCount.current += 1;
    const delay = Math.min(1000 * Math.pow(2, retryCount.current - 1), 10000);

    setTimeout(() => {
      fetchInsights();
    }, delay);
  }, [maxRetries, fetchInsights]);

  // Dismiss error
  const dismissError = useCallback(() => {
    setState(prev => ({
      ...prev,
      error: null,
      rateLimitState: {
        ...prev.rateLimitState,
        isLimited: false
      }
    }));
  }, []);

  // Set up auto-refresh
  useEffect(() => {
    if (enableAutoRefresh && refreshInterval > 0) {
      refreshTimer.current = setInterval(() => {
        if (state.hasData && !state.isLoading && !state.isRefreshing) {
          fetchInsights();
        }
      }, refreshInterval * 60 * 1000);

      return () => {
        if (refreshTimer.current) {
          clearInterval(refreshTimer.current);
        }
      };
    }
  }, [enableAutoRefresh, refreshInterval, state.hasData, state.isLoading, state.isRefreshing, fetchInsights]);

  // Initial fetch on mount
  useEffect(() => {
    if (user && !state.hasData && !state.isLoading) {
      fetchInsights();
    }
  }, [user, state.hasData, state.isLoading, fetchInsights]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortController.current) {
        abortController.current.abort();
      }
      stopStatusPolling();
      if (refreshTimer.current) {
        clearInterval(refreshTimer.current);
      }
    };
  }, [stopStatusPolling]);

  // Extract specific data for easier consumption
  const recommendations = state.data?.recommendations || [];
  const debtAnalysis = state.data?.debt_analysis;
  const dtiAnalysis = state.data?.dtiAnalysis;
  const repaymentPlan = state.data?.repaymentPlan;
  const riskAssessment = state.data?.riskAssessment;

  const actions: AIInsightsActions = {
    fetchInsights,
    refreshInsights,
    invalidateCache,
    checkStatus,
    retry,
    dismissError
  };

  return {
    // State
    ...state,

    // Extracted data
    recommendations,
    debtAnalysis,
    dtiAnalysis,
    repaymentPlan,
    riskAssessment,

    // Actions
    ...actions,

    // Computed states
    canRetry: retryCount.current < maxRetries && !state.isLoading,
    isProcessing: state.processingState.isLoading || state.cacheStatus?.is_processing,
    cacheAge: state.cacheStatus?.cache_age_seconds,
    isStale: state.cacheStatus?.cache_age_seconds ? state.cacheStatus.cache_age_seconds > 3600 : false, // 1 hour
  };
};

export default useAIInsights;