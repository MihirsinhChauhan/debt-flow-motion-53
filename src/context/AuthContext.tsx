import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { apiService } from '../lib/api';

interface User {
  id: string;
  email?: string;
  full_name?: string;
  monthly_income?: number;
}

type ErrorType = 'network' | 'auth' | 'server' | 'session' | 'unknown';

interface AuthError {
  message: string;
  type: ErrorType;
  canRetry: boolean;
  timestamp: Date;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, full_name: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  error: AuthError | null;
  debugAuth: () => any;
  retryAuth: () => Promise<void>;
  clearError: () => void;
  sessionHealth: 'healthy' | 'degraded' | 'unhealthy';
  lastSuccessfulOperation: Date | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<AuthError | null>(null);
  const [sessionHealth, setSessionHealth] = useState<'healthy' | 'degraded' | 'unhealthy'>('healthy');
  const [lastSuccessfulOperation, setLastSuccessfulOperation] = useState<Date | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const healthCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isRecoveringRef = useRef(false);

  useEffect(() => {
    // Initialize authentication state and start monitoring
    initializeAuth();
    startHealthMonitoring();

    // Cleanup on unmount
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      if (healthCheckIntervalRef.current) {
        clearInterval(healthCheckIntervalRef.current);
      }
    };
  }, []);

  const initializeAuth = async () => {
    const token = localStorage.getItem('access_token');
    if (token) {
      console.log('[Auth] Existing token found, verifying...');
      await checkAuthStatus();
    } else {
      console.log('[Auth] No existing token found');
      setIsLoading(false);
    }
  };

  const startHealthMonitoring = () => {
    // Check session health every 5 minutes
    healthCheckIntervalRef.current = setInterval(async () => {
      if (user && !isRecoveringRef.current) {
        await performHealthCheck();
      }
    }, 5 * 60 * 1000);
  };

  const performHealthCheck = async () => {
    try {
      console.log('[Auth] Performing health check...');
      await apiService.getCurrentUser();
      setSessionHealth('healthy');
      setLastSuccessfulOperation(new Date());
    } catch (err) {
      console.warn('[Auth] Health check failed:', err);
      if (err instanceof Error && err.message.includes('session')) {
        setSessionHealth('unhealthy');
        await attemptSessionRecovery();
      } else {
        setSessionHealth('degraded');
      }
    }
  };

  const classifyError = (err: any): AuthError => {
    const message = err instanceof Error ? err.message : 'Unknown error';

    if (message.includes('Network error') || message.includes('Failed to fetch')) {
      return {
        message: 'Network connection issue. Please check your internet connection.',
        type: 'network',
        canRetry: true,
        timestamp: new Date()
      };
    }

    if (message.includes('session was corrupted') || message.includes('Expected unicode, got Delete')) {
      return {
        message: 'Session was corrupted. Attempting to recover...',
        type: 'session',
        canRetry: true,
        timestamp: new Date()
      };
    }

    if (message.includes('session has expired')) {
      return {
        message: 'Your session has expired. Please log in again.',
        type: 'auth',
        canRetry: false,
        timestamp: new Date()
      };
    }

    if (message.includes('500') || message.includes('503')) {
      return {
        message: 'Server is temporarily unavailable. Please try again.',
        type: 'server',
        canRetry: true,
        timestamp: new Date()
      };
    }

    return {
      message,
      type: 'unknown',
      canRetry: true,
      timestamp: new Date()
    };
  };

  const scheduleRecoveryAttempt = () => {
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }

    retryTimeoutRef.current = setTimeout(async () => {
      console.log('[Auth] Attempting scheduled recovery...');
      await retryAuth();
    }, 5000); // Wait 5 seconds before retry
  };

  const attemptSessionRecovery = async () => {
    if (isRecoveringRef.current) {
      console.log('[Auth] Recovery already in progress, skipping...');
      return;
    }

    isRecoveringRef.current = true;
    console.log('[Auth] Attempting session recovery...');

    try {
      // Brief delay for server recovery
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Try to validate current session
      const userData = await apiService.getCurrentUser();
      setUser(userData);
      setError(null);
      setSessionHealth('healthy');
      setLastSuccessfulOperation(new Date());
      console.log('[Auth] Session recovery successful');
    } catch (recoveryErr) {
      console.error('[Auth] Session recovery failed:', recoveryErr);
      // If recovery fails, the session is truly invalid
      apiService.clearToken();
      setUser(null);
      setError({
        message: 'Session could not be recovered. Please log in again.',
        type: 'auth',
        canRetry: false,
        timestamp: new Date()
      });
      setSessionHealth('unhealthy');
    } finally {
      isRecoveringRef.current = false;
    }
  };

  const checkAuthStatus = async () => {
    try {
      console.log('[Auth] Checking authentication status...');
      const userData = await apiService.getCurrentUser();
      setUser(userData);
      setError(null);
      setSessionHealth('healthy');
      setLastSuccessfulOperation(new Date());
      console.log('[Auth] Authentication verified successfully');
    } catch (err) {
      console.error('[Auth] Authentication check failed:', err);
      const authError = classifyError(err);

      // Don't immediately clear session for transient errors
      if (authError.type === 'network' || authError.type === 'server') {
        setError(authError);
        setSessionHealth('degraded');
        // Attempt recovery after delay
        scheduleRecoveryAttempt();
      } else if (authError.type === 'session') {
        // Session corruption - attempt recovery
        setError(authError);
        setSessionHealth('unhealthy');
        await attemptSessionRecovery();
      } else {
        // Auth failure - clear session
        apiService.clearToken();
        setUser(null);
        setError(authError);
        setSessionHealth('unhealthy');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const retryAuth = useCallback(async () => {
    if (!user || isRecoveringRef.current) return;

    console.log('[Auth] Manual retry attempt...');
    setError(null);
    await checkAuthStatus();
  }, [user]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    console.log('[Auth] Attempting login...');

    try {
      const response = await apiService.login(email, password);

      // Set session token in API service (already done in login method)
      setUser(response.user);
      setSessionHealth('healthy');
      setLastSuccessfulOperation(new Date());
      console.log('[Auth] Login successful');

      return true;
    } catch (err) {
      console.error('[Auth] Login failed:', err);
      const authError = classifyError(err);
      setError(authError);
      setSessionHealth('unhealthy');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string, full_name: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      await apiService.register(email, password, full_name);

      // After successful registration, log in automatically
      return await login(email, password);
    } catch (err) {
      const authError = classifyError(err);
      setError(authError);
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    console.log('[Auth] Logging out...');

    // Clear all intervals and timeouts
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }
    if (healthCheckIntervalRef.current) {
      clearInterval(healthCheckIntervalRef.current);
    }

    setUser(null);
    setError(null);
    setSessionHealth('unhealthy');
    setLastSuccessfulOperation(null);
    apiService.clearToken();

    // Force a page reload to ensure clean state
    window.location.href = '/auth';
  };

  // Enhanced debug function with comprehensive state information
  const debugAuth = () => {
    const token = localStorage.getItem('access_token');
    const expiresAt = localStorage.getItem('token_expires_at');
    const debugInfo = {
      hasToken: !!token,
      tokenPreview: token ? `${token.substring(0, 20)}...` : 'No token',
      tokenExpiry: expiresAt,
      user: user,
      isLoading,
      error,
      sessionHealth,
      lastSuccessfulOperation,
      isRecovering: isRecoveringRef.current,
      authMethod: 'enhanced-session-token',
      timestamp: new Date().toISOString()
    };

    console.log('[Auth Debug]:', debugInfo);
    return debugInfo;
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      signup,
      logout,
      isLoading,
      error,
      debugAuth,
      retryAuth,
      clearError,
      sessionHealth,
      lastSuccessfulOperation
    }}>
      {children}
    </AuthContext.Provider>
  );
};