import React, { Component, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, RefreshCw, Home, Bug, Mail } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  resetOnPropsChange?: any;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
  errorId: string;
}

/**
 * Global error boundary component for production-ready error handling
 * Provides user-friendly error messages and recovery options
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      errorId: this.generateErrorId(),
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      errorId: Date.now().toString(36) + Math.random().toString(36).substr(2),
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[ErrorBoundary] Global error caught:', error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });

    // Report error to external service in production
    if (process.env.NODE_ENV === 'production') {
      this.reportError(error, errorInfo);
    }

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  componentDidUpdate(prevProps: Props) {
    // Reset error boundary when props change (useful for navigation)
    if (this.state.hasError && prevProps.resetOnPropsChange !== this.props.resetOnPropsChange) {
      this.setState({
        hasError: false,
        error: undefined,
        errorInfo: undefined,
        errorId: this.generateErrorId(),
      });
    }
  }

  private generateErrorId = (): string => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  };

  private reportError = (error: Error, errorInfo: React.ErrorInfo) => {
    // In a real application, you would send this to your error tracking service
    // e.g., Sentry, LogRocket, Bugsnag, etc.
    const errorReport = {
      errorId: this.state.errorId,
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    console.warn('[ErrorBoundary] Error reported:', errorReport);
    // Example: sendToErrorTrackingService(errorReport);
  };

  private getErrorType = (error: Error): 'network' | 'auth' | 'chunk' | 'unknown' => {
    const message = error.message.toLowerCase();

    if (message.includes('loading chunk') || message.includes('loading css chunk')) {
      return 'chunk';
    }

    if (message.includes('network') || message.includes('fetch') || message.includes('connection')) {
      return 'network';
    }

    if (message.includes('auth') || message.includes('unauthorized') || message.includes('token')) {
      return 'auth';
    }

    return 'unknown';
  };

  private getErrorDetails = () => {
    const { error } = this.state;
    if (!error) return null;

    const errorType = this.getErrorType(error);

    switch (errorType) {
      case 'chunk':
        return {
          title: 'Update Available',
          description: 'A new version of the application is available. Please refresh to continue.',
          icon: <RefreshCw className="h-5 w-5 text-blue-500" />,
          action: 'refresh',
          actionText: 'Refresh Page',
        };

      case 'network':
        return {
          title: 'Connection Problem',
          description: 'Unable to connect to our servers. Please check your internet connection and try again.',
          icon: <AlertTriangle className="h-5 w-5 text-orange-500" />,
          action: 'retry',
          actionText: 'Try Again',
        };

      case 'auth':
        return {
          title: 'Session Expired',
          description: 'Your session has expired. Please sign in again to continue.',
          icon: <AlertTriangle className="h-5 w-5 text-red-500" />,
          action: 'auth',
          actionText: 'Sign In',
        };

      default:
        return {
          title: 'Something Went Wrong',
          description: 'An unexpected error occurred. Our team has been notified and is working on a fix.',
          icon: <Bug className="h-5 w-5 text-red-500" />,
          action: 'retry',
          actionText: 'Try Again',
        };
    }
  };

  private handleAction = (action: string) => {
    switch (action) {
      case 'refresh':
        window.location.reload();
        break;
      case 'retry':
        this.setState({
          hasError: false,
          error: undefined,
          errorInfo: undefined,
          errorId: this.generateErrorId(),
        });
        break;
      case 'auth':
        window.location.href = '/auth';
        break;
      default:
        break;
    }
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  private handleReportBug = () => {
    const subject = encodeURIComponent(`Bug Report - Error ${this.state.errorId}`);
    const body = encodeURIComponent(`
Error ID: ${this.state.errorId}
Error Message: ${this.state.error?.message || 'Unknown error'}
Page: ${window.location.href}
Time: ${new Date().toISOString()}

Please describe what you were doing when this error occurred:

`);
    window.open(`mailto:support@debtease.com?subject=${subject}&body=${body}`);
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const errorDetails = this.getErrorDetails();

      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="w-full max-w-lg">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
                {errorDetails?.icon}
              </div>
              <CardTitle className="text-2xl">
                {errorDetails?.title || 'Unexpected Error'}
              </CardTitle>
              <CardDescription className="text-base">
                {errorDetails?.description || 'An unexpected error occurred.'}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Error ID for support */}
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Error ID: {this.state.errorId}</p>
                    <p className="text-xs text-muted-foreground">
                      Reference this ID when contacting support
                    </p>
                  </div>
                </AlertDescription>
              </Alert>

              {/* Primary Action */}
              {errorDetails && (
                <Button
                  onClick={() => this.handleAction(errorDetails.action)}
                  className="w-full"
                  size="lg"
                >
                  {errorDetails.action === 'refresh' && <RefreshCw className="mr-2 h-4 w-4" />}
                  {errorDetails.actionText}
                </Button>
              )}

              {/* Secondary Actions */}
              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={this.handleGoHome}
                  variant="outline"
                >
                  <Home className="mr-2 h-4 w-4" />
                  Home
                </Button>

                <Button
                  onClick={this.handleReportBug}
                  variant="outline"
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Report Bug
                </Button>
              </div>

              {/* Developer Info (only in development) */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-4">
                  <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                    Technical Details (Development Only)
                  </summary>
                  <div className="mt-2 p-3 bg-gray-50 rounded border text-xs">
                    <div className="space-y-2">
                      <div>
                        <strong>Error:</strong> {this.state.error.message}
                      </div>
                      <div>
                        <strong>Stack Trace:</strong>
                        <pre className="whitespace-pre-wrap mt-1 text-xs">
                          {this.state.error.stack}
                        </pre>
                      </div>
                      {this.state.errorInfo && (
                        <div>
                          <strong>Component Stack:</strong>
                          <pre className="whitespace-pre-wrap mt-1 text-xs">
                            {this.state.errorInfo.componentStack}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                </details>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;