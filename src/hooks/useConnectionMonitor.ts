import { useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { apiService } from '@/lib/api';

interface ConnectionState {
  isOnline: boolean;
  apiReachable: boolean;
  lastSuccessfulPing: Date | null;
  consecutiveFailures: number;
  connectionQuality: 'excellent' | 'good' | 'poor' | 'offline';
}

interface NetworkEvent {
  type: 'connection_change' | 'api_failure' | 'session_issue' | 'recovery_success';
  timestamp: Date;
  details: any;
}

export const useConnectionMonitor = () => {
  const { sessionHealth, lastSuccessfulOperation, error } = useAuth();
  const [connectionState, setConnectionState] = useState<ConnectionState>({
    isOnline: navigator.onLine,
    apiReachable: true,
    lastSuccessfulPing: null,
    consecutiveFailures: 0,
    connectionQuality: 'excellent'
  });
  const [networkEvents, setNetworkEvents] = useState<NetworkEvent[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(true);

  const monitoringIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastPingTimeRef = useRef<number>(0);
  const eventHistoryLimit = 50;

  const logEvent = useCallback((type: NetworkEvent['type'], details: any) => {
    const event: NetworkEvent = {
      type,
      timestamp: new Date(),
      details
    };

    setNetworkEvents(prev => {
      const updated = [event, ...prev].slice(0, eventHistoryLimit);
      console.log(`[ConnectionMonitor] ${type}:`, details);
      return updated;
    });
  }, []);

  const calculateConnectionQuality = useCallback((
    isOnline: boolean,
    apiReachable: boolean,
    consecutiveFailures: number,
    responseTime?: number
  ): ConnectionState['connectionQuality'] => {
    if (!isOnline || !apiReachable) return 'offline';
    if (consecutiveFailures >= 3) return 'poor';
    if (consecutiveFailures >= 1 || (responseTime && responseTime > 5000)) return 'poor';
    if (responseTime && responseTime > 2000) return 'good';
    return 'excellent';
  }, []);

  const performHealthPing = useCallback(async (): Promise<boolean> => {
    const startTime = Date.now();

    try {
      await apiService.healthCheck();
      const responseTime = Date.now() - startTime;

      setConnectionState(prev => {
        const newState = {
          ...prev,
          apiReachable: true,
          lastSuccessfulPing: new Date(),
          consecutiveFailures: 0,
          connectionQuality: calculateConnectionQuality(
            prev.isOnline,
            true,
            0,
            responseTime
          )
        };

        if (prev.consecutiveFailures > 0) {
          logEvent('recovery_success', {
            previousFailures: prev.consecutiveFailures,
            responseTime
          });
        }

        return newState;
      });

      lastPingTimeRef.current = responseTime;
      return true;
    } catch (error) {
      const responseTime = Date.now() - startTime;

      setConnectionState(prev => {
        const consecutiveFailures = prev.consecutiveFailures + 1;
        const newState = {
          ...prev,
          apiReachable: false,
          consecutiveFailures,
          connectionQuality: calculateConnectionQuality(
            prev.isOnline,
            false,
            consecutiveFailures,
            responseTime
          )
        };

        logEvent('api_failure', {
          error: error instanceof Error ? error.message : 'Unknown error',
          consecutiveFailures,
          responseTime
        });

        return newState;
      });

      return false;
    }
  }, [calculateConnectionQuality, logEvent]);

  const handleOnlineStatusChange = useCallback(() => {
    const isOnline = navigator.onLine;

    setConnectionState(prev => ({
      ...prev,
      isOnline,
      connectionQuality: calculateConnectionQuality(
        isOnline,
        prev.apiReachable,
        prev.consecutiveFailures
      )
    }));

    logEvent('connection_change', { isOnline });

    // If we just came back online, immediately check API reachability
    if (isOnline) {
      setTimeout(performHealthPing, 1000);
    }
  }, [calculateConnectionQuality, logEvent, performHealthPing]);

  const startMonitoring = useCallback(() => {
    if (monitoringIntervalRef.current) {
      clearInterval(monitoringIntervalRef.current);
    }

    // Initial health check
    performHealthPing();

    // Set up periodic monitoring (every 30 seconds)
    monitoringIntervalRef.current = setInterval(() => {
      if (document.visibilityState === 'visible') {
        performHealthPing();
      }
    }, 30000);

    setIsMonitoring(true);
    logEvent('recovery_success', { action: 'monitoring_started' });
  }, [performHealthPing, logEvent]);

  const stopMonitoring = useCallback(() => {
    if (monitoringIntervalRef.current) {
      clearInterval(monitoringIntervalRef.current);
      monitoringIntervalRef.current = null;
    }
    setIsMonitoring(false);
    logEvent('connection_change', { action: 'monitoring_stopped' });
  }, [logEvent]);

  // Monitor session health changes
  useEffect(() => {
    if (sessionHealth === 'unhealthy') {
      logEvent('session_issue', {
        sessionHealth,
        authError: error?.message
      });
    }
  }, [sessionHealth, error, logEvent]);

  // Set up network monitoring
  useEffect(() => {
    // Add online/offline event listeners
    window.addEventListener('online', handleOnlineStatusChange);
    window.addEventListener('offline', handleOnlineStatusChange);

    // Add visibility change listener to pause monitoring when tab is hidden
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isMonitoring) {
        performHealthPing();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Start monitoring
    startMonitoring();

    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnlineStatusChange);
      window.removeEventListener('offline', handleOnlineStatusChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (monitoringIntervalRef.current) {
        clearInterval(monitoringIntervalRef.current);
      }
    };
  }, [handleOnlineStatusChange, isMonitoring, performHealthPing, startMonitoring]);

  const getConnectionSummary = useCallback(() => {
    const recentEvents = networkEvents.slice(0, 10);
    const recentFailures = recentEvents.filter(e => e.type === 'api_failure').length;
    const recentRecoveries = recentEvents.filter(e => e.type === 'recovery_success').length;

    return {
      ...connectionState,
      sessionHealth,
      lastSuccessfulOperation,
      authError: error,
      averageResponseTime: lastPingTimeRef.current,
      recentFailures,
      recentRecoveries,
      isMonitoring,
      eventCount: networkEvents.length
    };
  }, [connectionState, sessionHealth, lastSuccessfulOperation, error, networkEvents, isMonitoring]);

  const getRecentEvents = useCallback((limit: number = 10) => {
    return networkEvents.slice(0, limit);
  }, [networkEvents]);

  const clearEventHistory = useCallback(() => {
    setNetworkEvents([]);
    logEvent('recovery_success', { action: 'event_history_cleared' });
  }, [logEvent]);

  return {
    connectionState,
    networkEvents,
    isMonitoring,
    getConnectionSummary,
    getRecentEvents,
    clearEventHistory,
    startMonitoring,
    stopMonitoring,
    performHealthPing
  };
};