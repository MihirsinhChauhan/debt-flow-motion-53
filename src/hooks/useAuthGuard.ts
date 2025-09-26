import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

interface UseAuthGuardOptions {
  redirectTo?: string;
  requireAuth?: boolean;
  showLoadingOverlay?: boolean;
  onAuthRequired?: () => void;
  onAuthSuccess?: () => void;
  retryInterval?: number;
}

interface AuthGuardState {
  isAuthenticated: boolean;
  isLoading: boolean;
  canAccess: boolean;
  authError: string | null;
  retryCount: number;
  isRetrying: boolean;
}

/**
 * Enhanced authentication guard hook to protect routes
 * Provides comprehensive auth state management with retry logic
 */
export const useAuthGuard = (options: UseAuthGuardOptions = {}) => {
  const {
    redirectTo = '/auth',
    requireAuth = true,
    showLoadingOverlay = false,
    onAuthRequired,
    onAuthSuccess,
    retryInterval = 3000
  } = options;

  const { isAuthenticated, isLoading, error, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [authState, setAuthState] = useState<AuthGuardState>({
    isAuthenticated: false,
    isLoading: true,
    canAccess: false,
    authError: null,
    retryCount: 0,
    isRetrying: false
  });

  const [redirectAttempted, setRedirectAttempted] = useState(false);

  // Retry authentication check
  const retryAuth = useCallback(async () => {
    if (authState.retryCount >= 3) {
      setAuthState(prev => ({
        ...prev,
        authError: 'Maximum retry attempts reached. Please refresh the page.',
        isRetrying: false
      }));
      return;
    }

    setAuthState(prev => ({
      ...prev,
      isRetrying: true,
      retryCount: prev.retryCount + 1
    }));

    // Clear any existing errors
    clearError();

    // Wait for retry interval
    setTimeout(() => {
      setAuthState(prev => ({ ...prev, isRetrying: false }));
    }, retryInterval);
  }, [authState.retryCount, clearError, retryInterval]);

  // Handle authentication state changes
  useEffect(() => {
    const updateAuthState = () => {
      const canAccess = requireAuth ? (isAuthenticated && !isLoading) : true;
      const authError = error?.message || null;

      setAuthState(prev => ({
        ...prev,
        isAuthenticated,
        isLoading,
        canAccess,
        authError,
        // Reset retry count on successful auth
        retryCount: isAuthenticated ? 0 : prev.retryCount
      }));

      // Handle successful authentication
      if (isAuthenticated && !isLoading && onAuthSuccess) {
        onAuthSuccess();
      }
    };

    updateAuthState();
  }, [isAuthenticated, isLoading, error, requireAuth, onAuthSuccess]);

  // Handle redirect logic
  useEffect(() => {
    if (!requireAuth) return;

    // Don't redirect while loading or if already attempted
    if (isLoading || redirectAttempted) return;

    // Don't redirect if user is authenticated
    if (isAuthenticated) return;

    // Don't redirect if there's a retryable error and we haven't exceeded retry limit
    if (error?.canRetry && authState.retryCount < 3) {
      console.log('[AuthGuard] Retryable error detected, attempting retry in', retryInterval, 'ms');
      setTimeout(retryAuth, retryInterval);
      return;
    }

    // Perform redirect
    console.log('[AuthGuard] User not authenticated, redirecting to:', redirectTo);
    setRedirectAttempted(true);

    // Store the current location for redirect after login
    const returnUrl = location.pathname + location.search;
    const redirectUrl = `${redirectTo}${returnUrl !== '/' ? `?returnUrl=${encodeURIComponent(returnUrl)}` : ''}`;

    if (onAuthRequired) {
      onAuthRequired();
    } else {
      toast.error('Please sign in to continue');
    }

    navigate(redirectUrl, { replace: true });
  }, [
    requireAuth,
    isLoading,
    isAuthenticated,
    redirectAttempted,
    redirectTo,
    location.pathname,
    location.search,
    navigate,
    onAuthRequired,
    error,
    authState.retryCount,
    retryAuth,
    retryInterval
  ]);

  // Auto-retry on network errors
  useEffect(() => {
    if (error?.type === 'network' && authState.retryCount < 3) {
      const timeoutId = setTimeout(retryAuth, retryInterval);
      return () => clearTimeout(timeoutId);
    }
  }, [error, authState.retryCount, retryAuth, retryInterval]);

  const clearAuthError = useCallback(() => {
    setAuthState(prev => ({ ...prev, authError: null }));
    clearError();
  }, [clearError]);

  const forceRetry = useCallback(() => {
    setAuthState(prev => ({ ...prev, retryCount: 0 }));
    retryAuth();
  }, [retryAuth]);

  return {
    ...authState,
    clearAuthError,
    retryAuth,
    forceRetry,
    showLoadingOverlay: showLoadingOverlay && (isLoading || authState.isRetrying),
    // Legacy compatibility
    canAccess: authState.canAccess
  };
};

/**
 * Simple auth guard hook for basic use cases
 * Maintains backward compatibility
 */
export const useSimpleAuthGuard = (redirectTo: string = '/auth') => {
  return useAuthGuard({ redirectTo, requireAuth: true });
};