import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { AuthLoadingOverlay } from './AuthLoadingOverlay';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertTriangle, ArrowRight, Home } from 'lucide-react';
import { toast } from 'sonner';

interface AuthRedirectHandlerProps {
  children?: React.ReactNode;
  defaultRedirect?: string;
  onRedirectComplete?: (redirectUrl: string) => void;
  showProgress?: boolean;
}

/**
 * Enhanced redirect handler for authentication flows
 * Provides smooth redirects with loading states and user feedback
 */
export const AuthRedirectHandler: React.FC<AuthRedirectHandlerProps> = ({
  children,
  defaultRedirect = '/dashboard',
  onRedirectComplete,
  showProgress = true
}) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();

  const [redirectState, setRedirectState] = useState<{
    isRedirecting: boolean;
    redirectUrl: string | null;
    countdown: number;
    error: string | null;
    showManualRedirect: boolean;
  }>({
    isRedirecting: false,
    redirectUrl: null,
    countdown: 3,
    error: null,
    showManualRedirect: false
  });

  // Get the target redirect URL
  const getRedirectUrl = (): string => {
    // Check for returnUrl in search params
    const returnUrl = searchParams.get('returnUrl');
    if (returnUrl) {
      try {
        // Validate the return URL to prevent open redirects
        const url = new URL(returnUrl, window.location.origin);
        if (url.origin === window.location.origin) {
          return url.pathname + url.search;
        }
      } catch (e) {
        console.warn('[AuthRedirectHandler] Invalid return URL:', returnUrl);
      }
    }

    // Check for redirect in location state
    const stateRedirect = location.state?.from?.pathname;
    if (stateRedirect && typeof stateRedirect === 'string') {
      return stateRedirect;
    }

    return defaultRedirect;
  };

  // Handle the redirect process
  useEffect(() => {
    if (!isAuthenticated || isLoading) {
      return;
    }

    const targetUrl = getRedirectUrl();

    // Don't redirect if we're already at the target
    if (location.pathname === targetUrl) {
      return;
    }

    setRedirectState(prev => ({
      ...prev,
      isRedirecting: true,
      redirectUrl: targetUrl,
      countdown: 3
    }));

    // Start countdown
    const countdownInterval = setInterval(() => {
      setRedirectState(prev => {
        const newCountdown = prev.countdown - 1;

        if (newCountdown <= 0) {
          clearInterval(countdownInterval);
          performRedirect(targetUrl);
          return { ...prev, countdown: 0 };
        }

        return { ...prev, countdown: newCountdown };
      });
    }, 1000);

    // Cleanup on unmount
    return () => {
      clearInterval(countdownInterval);
    };
  }, [isAuthenticated, isLoading, location.pathname]);

  const performRedirect = (url: string) => {
    try {
      navigate(url, { replace: true });
      toast.success(`Welcome back, ${user?.full_name || user?.email || 'User'}!`);

      if (onRedirectComplete) {
        onRedirectComplete(url);
      }
    } catch (error) {
      console.error('[AuthRedirectHandler] Redirect failed:', error);
      setRedirectState(prev => ({
        ...prev,
        isRedirecting: false,
        error: 'Failed to redirect. Please try manually.',
        showManualRedirect: true
      }));
    }
  };

  const handleManualRedirect = () => {
    if (redirectState.redirectUrl) {
      performRedirect(redirectState.redirectUrl);
    }
  };

  const handleGoHome = () => {
    navigate('/', { replace: true });
  };

  // Show loading overlay if auth is still loading
  if (isLoading) {
    return (
      <AuthLoadingOverlay
        isVisible={true}
        type="checking"
        message="Verifying your authentication..."
      />
    );
  }

  // If not authenticated, render children (likely the auth form)
  if (!isAuthenticated) {
    return <>{children}</>;
  }

  // Show redirect progress if configured to do so
  if (showProgress && redirectState.isRedirecting) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-50">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle className="text-xl text-green-600">
              Welcome Back!
            </CardTitle>
            <CardDescription>
              You've been signed in successfully
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {redirectState.error ? (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  {redirectState.error}
                </AlertDescription>
              </Alert>
            ) : (
              <Alert>
                <ArrowRight className="h-4 w-4" />
                <AlertDescription>
                  Redirecting in {redirectState.countdown} seconds...
                </AlertDescription>
              </Alert>
            )}

            {redirectState.redirectUrl && (
              <div className="text-center text-sm text-muted-foreground">
                <p>Taking you to: <span className="font-medium">{redirectState.redirectUrl}</span></p>
              </div>
            )}

            <div className="flex gap-2">
              {redirectState.showManualRedirect && (
                <Button
                  onClick={handleManualRedirect}
                  className="flex-1"
                  variant="default"
                >
                  <ArrowRight className="mr-2 h-4 w-4" />
                  Continue
                </Button>
              )}

              <Button
                onClick={handleGoHome}
                className="flex-1"
                variant="outline"
              >
                <Home className="mr-2 h-4 w-4" />
                Go Home
              </Button>
            </div>

            {/* Loading indicator */}
            {!redirectState.error && (
              <div className="flex justify-center">
                <div className="flex space-x-1">
                  {[0, 1, 2].map((index) => (
                    <div
                      key={index}
                      className="w-2 h-2 rounded-full bg-primary/30 animate-pulse"
                      style={{
                        animationDelay: `${index * 0.2}s`
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // If we reach here, redirect should happen without showing progress
  if (redirectState.isRedirecting && !showProgress) {
    return null;
  }

  // Default: render children
  return <>{children}</>;
};

export default AuthRedirectHandler;