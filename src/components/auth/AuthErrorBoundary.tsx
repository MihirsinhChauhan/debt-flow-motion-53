import React, { Component, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, RefreshCw, Home, Shield } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
  retryCount: number;
}

/**
 * Authentication-specific error boundary component
 * Provides graceful error handling for auth-related components
 */
export class AuthErrorBoundary extends Component<Props, State> {
  private retryTimeoutId?: NodeJS.Timeout;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[AuthErrorBoundary] Authentication error caught:', error, errorInfo);

    this.setState({
      error,
      errorInfo
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Auto-retry for network-related errors
    if (this.isNetworkError(error) && this.state.retryCount < 3) {
      this.scheduleRetry();
    }
  }

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }

  private isNetworkError = (error: Error): boolean => {
    const message = error.message.toLowerCase();
    return message.includes('network') ||
           message.includes('fetch') ||
           message.includes('connection') ||
           message.includes('timeout');
  };

  private isAuthError = (error: Error): boolean => {
    const message = error.message.toLowerCase();
    return message.includes('auth') ||
           message.includes('unauthorized') ||
           message.includes('token') ||
           message.includes('session');
  };

  private scheduleRetry = () => {
    this.retryTimeoutId = setTimeout(() => {
      this.handleRetry();
    }, 2000 * Math.pow(2, this.state.retryCount)); // Exponential backoff
  };

  private handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      retryCount: prevState.retryCount + 1
    }));
  };

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      retryCount: 0
    });
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  private handleGoToAuth = () => {
    window.location.href = '/auth';
  };

  private getErrorDetails = () => {
    const { error } = this.state;
    if (!error) return null;

    const isNetwork = this.isNetworkError(error);
    const isAuth = this.isAuthError(error);

    if (isNetwork) {
      return {
        title: 'Connection Problem',
        description: 'Unable to connect to the authentication service. Please check your internet connection.',
        icon: <AlertTriangle className="h-5 w-5 text-orange-500" />,
        canRetry: true,
        suggestReload: true
      };
    }

    if (isAuth) {
      return {
        title: 'Authentication Error',
        description: 'There was a problem with your authentication session. Please sign in again.',
        icon: <Shield className="h-5 w-5 text-red-500" />,
        canRetry: false,
        suggestAuth: true
      };
    }

    return {
      title: 'Unexpected Error',
      description: 'Something went wrong with the authentication system. Please try again.',
      icon: <AlertTriangle className="h-5 w-5 text-red-500" />,
      canRetry: true,
      suggestReload: false
    };
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const errorDetails = this.getErrorDetails();
      const { retryCount } = this.state;
      const maxRetries = 3;

      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
                {errorDetails?.icon}
              </div>
              <CardTitle className="text-xl">
                {errorDetails?.title || 'Authentication Error'}
              </CardTitle>
              <CardDescription>
                {errorDetails?.description || 'An error occurred with the authentication system.'}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Error Details Alert */}
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <p className="text-sm">
                      {this.state.error?.message || 'Unknown error occurred'}
                    </p>
                    {retryCount > 0 && (
                      <p className="text-xs text-muted-foreground">
                        Retry attempts: {retryCount}/{maxRetries}
                      </p>
                    )}
                  </div>
                </AlertDescription>
              </Alert>

              {/* Action Buttons */}
              <div className="space-y-2">
                {errorDetails?.canRetry && retryCount < maxRetries && (
                  <Button
                    onClick={this.handleRetry}
                    className="w-full"
                    variant="default"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Try Again
                  </Button>
                )}

                {errorDetails?.suggestAuth && (
                  <Button
                    onClick={this.handleGoToAuth}
                    className="w-full"
                    variant="default"
                  >
                    <Shield className="mr-2 h-4 w-4" />
                    Go to Sign In
                  </Button>
                )}

                <div className="flex gap-2">
                  <Button
                    onClick={this.handleReset}
                    className="flex-1"
                    variant="outline"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Reset
                  </Button>

                  <Button
                    onClick={this.handleGoHome}
                    className="flex-1"
                    variant="outline"
                  >
                    <Home className="mr-2 h-4 w-4" />
                    Home
                  </Button>
                </div>
              </div>

              {/* Developer Info (only in development) */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-4 text-xs">
                  <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                    Technical Details
                  </summary>
                  <div className="mt-2 p-2 bg-gray-50 rounded border">
                    <pre className="whitespace-pre-wrap text-xs">
                      {this.state.error.stack}
                    </pre>
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

export default AuthErrorBoundary;