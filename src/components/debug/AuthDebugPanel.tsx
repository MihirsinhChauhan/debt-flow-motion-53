import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Database,
  Eye,
  EyeOff,
  Info,
  RefreshCw,
  Shield,
  Wifi,
  WifiOff,
  XCircle
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { apiService } from '@/lib/api';

interface AuthDebugPanelProps {
  isVisible?: boolean;
  onToggleVisibility?: () => void;
}

const AuthDebugPanel: React.FC<AuthDebugPanelProps> = ({
  isVisible = false,
  onToggleVisibility
}) => {
  const {
    user,
    sessionHealth,
    lastSuccessfulOperation,
    error,
    debugAuth,
    retryAuth,
    clearError
  } = useAuth();

  const [debugData, setDebugData] = useState<any>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [apiHealth, setApiHealth] = useState<'checking' | 'healthy' | 'unhealthy'>('checking');
  const [lastHealthCheck, setLastHealthCheck] = useState<Date | null>(null);

  useEffect(() => {
    if (isVisible) {
      refreshDebugData();
      checkApiHealth();
    }
  }, [isVisible]);

  const refreshDebugData = () => {
    const data = debugAuth();
    setDebugData(data);
  };

  const checkApiHealth = async () => {
    setApiHealth('checking');
    try {
      await apiService.healthCheck();
      setApiHealth('healthy');
      setLastHealthCheck(new Date());
    } catch (err) {
      console.error('API health check failed:', err);
      setApiHealth('unhealthy');
      setLastHealthCheck(new Date());
    }
  };

  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'degraded':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'unhealthy':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'checking':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'healthy':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'degraded':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'unhealthy':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'checking':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatTimestamp = (timestamp: Date | string | null) => {
    if (!timestamp) return 'Never';
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    return date.toLocaleTimeString();
  };

  const getConnectionIcon = () => {
    if (sessionHealth === 'healthy' && apiHealth === 'healthy') {
      return <Wifi className="h-4 w-4 text-green-500" />;
    }
    return <WifiOff className="h-4 w-4 text-red-500" />;
  };

  if (!isVisible) {
    return (
      <Button
        onClick={onToggleVisibility}
        variant="outline"
        size="sm"
        className="fixed bottom-4 right-4 z-50 bg-white/90 backdrop-blur-sm"
        title="Show Auth Debug Panel"
      >
        <Eye className="h-4 w-4" />
        <span className="ml-1">Debug</span>
      </Button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 max-h-[calc(100vh-2rem)] overflow-auto">
      <Card className="bg-white/95 backdrop-blur-sm shadow-lg border-2">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-lg">Auth Debug Panel</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              {getConnectionIcon()}
              <Button
                onClick={onToggleVisibility}
                variant="ghost"
                size="sm"
                title="Hide Debug Panel"
              >
                <EyeOff className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <CardDescription>
            Real-time authentication and session monitoring
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Session Health Overview */}
          <div className="grid grid-cols-2 gap-2">
            <div className={`p-2 rounded-lg border ${getHealthColor(sessionHealth)}`}>
              <div className="flex items-center gap-2">
                {getHealthIcon(sessionHealth)}
                <span className="text-xs font-medium">Session</span>
              </div>
              <div className="text-xs capitalize">{sessionHealth}</div>
            </div>

            <div className={`p-2 rounded-lg border ${getHealthColor(apiHealth)}`}>
              <div className="flex items-center gap-2">
                {getHealthIcon(apiHealth)}
                <span className="text-xs font-medium">API</span>
              </div>
              <div className="text-xs capitalize">{apiHealth}</div>
            </div>
          </div>

          {/* Current Error */}
          {error && (\n            <Alert className=\"border-red-200 bg-red-50\">\n              <AlertTriangle className=\"h-4 w-4 text-red-500\" />\n              <AlertDescription className=\"text-xs\">\n                <div className=\"font-medium\">{error.type.toUpperCase()} ERROR</div>\n                <div className=\"mt-1\">{error.message}</div>\n                <div className=\"text-xs text-red-600 mt-1\">\n                  {formatTimestamp(error.timestamp)} • Retry: {error.canRetry ? 'Yes' : 'No'}\n                </div>\n                {error.canRetry && (\n                  <div className=\"flex gap-2 mt-2\">\n                    <Button\n                      onClick={retryAuth}\n                      variant=\"outline\"\n                      size=\"sm\"\n                      className=\"h-6 text-xs\"\n                    >\n                      <RefreshCw className=\"h-3 w-3 mr-1\" />\n                      Retry\n                    </Button>\n                    <Button\n                      onClick={clearError}\n                      variant=\"outline\"\n                      size=\"sm\"\n                      className=\"h-6 text-xs\"\n                    >\n                      Clear\n                    </Button>\n                  </div>\n                )}\n              </AlertDescription>\n            </Alert>\n          )}\n\n          {/* User Status */}\n          <div className=\"space-y-2\">\n            <div className=\"flex items-center justify-between\">\n              <span className=\"text-sm font-medium\">User Status</span>\n              <Badge variant={user ? \"default\" : \"secondary\"}>\n                {user ? 'Authenticated' : 'Not Authenticated'}\n              </Badge>\n            </div>\n            {user && (\n              <div className=\"text-xs text-gray-600\">\n                <div>Email: {user.email}</div>\n                <div>ID: {user.id}</div>\n              </div>\n            )}\n          </div>\n\n          {/* Activity Timestamps */}\n          <div className=\"space-y-2\">\n            <span className=\"text-sm font-medium\">Activity Timeline</span>\n            <div className=\"text-xs space-y-1\">\n              <div className=\"flex justify-between\">\n                <span>Last Success:</span>\n                <span>{formatTimestamp(lastSuccessfulOperation)}</span>\n              </div>\n              <div className=\"flex justify-between\">\n                <span>API Check:</span>\n                <span>{formatTimestamp(lastHealthCheck)}</span>\n              </div>\n              <div className=\"flex justify-between\">\n                <span>Error Time:</span>\n                <span>{error ? formatTimestamp(error.timestamp) : 'None'}</span>\n              </div>\n            </div>\n          </div>\n\n          {/* Action Buttons */}\n          <div className=\"flex gap-2\">\n            <Button\n              onClick={refreshDebugData}\n              variant=\"outline\"\n              size=\"sm\"\n              className=\"flex-1 text-xs\"\n            >\n              <Activity className=\"h-3 w-3 mr-1\" />\n              Refresh\n            </Button>\n            <Button\n              onClick={checkApiHealth}\n              variant=\"outline\"\n              size=\"sm\"\n              className=\"flex-1 text-xs\"\n            >\n              <Database className=\"h-3 w-3 mr-1\" />\n              API Check\n            </Button>\n          </div>\n\n          {/* Detailed Debug Data (Collapsible) */}\n          <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>\n            <CollapsibleTrigger asChild>\n              <Button variant=\"ghost\" size=\"sm\" className=\"w-full text-xs justify-between\">\n                <span>Debug Details</span>\n                <span>{isExpanded ? '−' : '+'}</span>\n              </Button>\n            </CollapsibleTrigger>\n            <CollapsibleContent className=\"mt-2\">\n              <div className=\"bg-gray-50 rounded-lg p-3 text-xs font-mono\">\n                <pre className=\"whitespace-pre-wrap overflow-auto max-h-40\">\n                  {JSON.stringify(debugData, null, 2)}\n                </pre>\n              </div>\n            </CollapsibleContent>\n          </Collapsible>\n\n          {/* Health Indicators */}\n          <div className=\"pt-2 border-t border-gray-200\">\n            <div className=\"flex items-center justify-between text-xs text-gray-500\">\n              <span>Monitoring Active</span>\n              <div className=\"flex items-center gap-1\">\n                <Clock className=\"h-3 w-3\" />\n                <span>{formatTimestamp(new Date())}</span>\n              </div>\n            </div>\n          </div>\n        </CardContent>\n      </Card>\n    </div>\n  );\n};\n\nexport default AuthDebugPanel;