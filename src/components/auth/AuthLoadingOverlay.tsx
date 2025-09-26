import React from 'react';
import { Loader2, Shield, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AuthLoadingOverlayProps {
  isVisible: boolean;
  type?: 'login' | 'signup' | 'logout' | 'checking' | 'error';
  message?: string;
  className?: string;
}

export const AuthLoadingOverlay: React.FC<AuthLoadingOverlayProps> = ({
  isVisible,
  type = 'checking',
  message,
  className
}) => {
  const getLoadingConfig = (type: string) => {
    switch (type) {
      case 'login':
        return {
          icon: <Loader2 className="h-8 w-8 animate-spin text-primary" />,
          title: 'Signing you in...',
          subtitle: 'Please wait while we verify your credentials',
          bgColor: 'bg-background/95'
        };
      case 'signup':
        return {
          icon: <Loader2 className="h-8 w-8 animate-spin text-primary" />,
          title: 'Creating your account...',
          subtitle: 'Setting up your DebtEase profile',
          bgColor: 'bg-background/95'
        };
      case 'logout':
        return {
          icon: <Loader2 className="h-8 w-8 animate-spin text-orange-500" />,
          title: 'Signing you out...',
          subtitle: 'Securing your session',
          bgColor: 'bg-background/95'
        };
      case 'checking':
        return {
          icon: <Shield className="h-8 w-8 text-blue-500 animate-pulse" />,
          title: 'Verifying authentication...',
          subtitle: 'Checking your session status',
          bgColor: 'bg-background/95'
        };
      case 'error':
        return {
          icon: <AlertCircle className="h-8 w-8 text-red-500" />,
          title: 'Authentication Error',
          subtitle: 'Please try again or contact support',
          bgColor: 'bg-red-50/95'
        };
      default:
        return {
          icon: <Loader2 className="h-8 w-8 animate-spin text-primary" />,
          title: 'Processing...',
          subtitle: 'Please wait',
          bgColor: 'bg-background/95'
        };
    }
  };

  if (!isVisible) return null;

  const config = getLoadingConfig(type);

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center',
        config.bgColor,
        'backdrop-blur-sm transition-all duration-300',
        className
      )}
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-loading-title"
      aria-describedby="auth-loading-subtitle"
    >
      <div className="flex flex-col items-center space-y-6 text-center max-w-md mx-4">
        {/* Loading Icon */}
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-primary/10 animate-ping" />
          {config.icon}
        </div>

        {/* Loading Content */}
        <div className="space-y-2">
          <h2
            id="auth-loading-title"
            className="text-xl font-semibold text-foreground"
          >
            {message || config.title}
          </h2>
          <p
            id="auth-loading-subtitle"
            className="text-sm text-muted-foreground"
          >
            {config.subtitle}
          </p>
        </div>

        {/* Loading Progress Dots */}
        {type !== 'error' && (
          <div className="flex space-x-1">
            {[0, 1, 2].map((index) => (
              <div
                key={index}
                className={cn(
                  'w-2 h-2 rounded-full bg-primary/30 animate-pulse',
                  'animation-delay-' + (index * 200)
                )}
                style={{
                  animationDelay: `${index * 0.2}s`
                }}
              />
            ))}
          </div>
        )}

        {/* Branding */}
        <div className="mt-8 opacity-50">
          <p className="text-xs text-muted-foreground">DebtEase</p>
        </div>
      </div>
    </div>
  );
};

export default AuthLoadingOverlay;