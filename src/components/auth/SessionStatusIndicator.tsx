import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuHeader,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Shield,
  User,
  Clock,
  LogOut,
  Settings,
  ChevronDown,
  CheckCircle,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import LogoutConfirmationDialog from './LogoutConfirmationDialog';

interface SessionStatusIndicatorProps {
  variant?: 'badge' | 'dropdown' | 'compact';
  showUserInfo?: boolean;
  className?: string;
}

export const SessionStatusIndicator: React.FC<SessionStatusIndicatorProps> = ({
  variant = 'badge',
  showUserInfo = true,
  className
}) => {
  const { user, isAuthenticated, isLoading, error } = useAuth();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [sessionTime, setSessionTime] = useState<string>('');

  // Update session time
  useEffect(() => {
    if (!isAuthenticated) return;

    const updateSessionTime = () => {
      const now = new Date();
      setSessionTime(now.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      }));
    };

    updateSessionTime();
    const interval = setInterval(updateSessionTime, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const getStatusConfig = () => {
    if (isLoading) {
      return {
        status: 'loading',
        icon: <Loader2 className="h-3 w-3 animate-spin" />,
        text: 'Checking...',
        badgeVariant: 'secondary' as const,
        color: 'text-blue-600'
      };
    }

    if (error) {
      return {
        status: 'error',
        icon: <AlertTriangle className="h-3 w-3" />,
        text: 'Session Error',
        badgeVariant: 'destructive' as const,
        color: 'text-red-600'
      };
    }

    if (isAuthenticated && user) {
      return {
        status: 'authenticated',
        icon: <CheckCircle className="h-3 w-3" />,
        text: 'Signed In',
        badgeVariant: 'default' as const,
        color: 'text-green-600'
      };
    }

    return {
      status: 'unauthenticated',
      icon: <Shield className="h-3 w-3" />,
      text: 'Not Signed In',
      badgeVariant: 'outline' as const,
      color: 'text-gray-600'
    };
  };

  const statusConfig = getStatusConfig();

  // Badge variant
  if (variant === 'badge') {
    return (
      <Badge
        variant={statusConfig.badgeVariant}
        className={cn('flex items-center gap-1 px-2 py-1', className)}
      >
        {statusConfig.icon}
        <span className="text-xs">{statusConfig.text}</span>
      </Badge>
    );
  }

  // Compact variant
  if (variant === 'compact') {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <div className={cn('flex items-center gap-1', statusConfig.color)}>
          {statusConfig.icon}
          <span className="text-sm font-medium">{statusConfig.text}</span>
        </div>
        {isAuthenticated && sessionTime && (
          <span className="text-xs text-muted-foreground">
            {sessionTime}
          </span>
        )}
      </div>
    );
  }

  // Dropdown variant (default)
  if (!isAuthenticated) {
    return (
      <Badge
        variant="outline"
        className={cn('flex items-center gap-1', className)}
      >
        {statusConfig.icon}
        <span className="text-xs">{statusConfig.text}</span>
      </Badge>
    );
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className={cn(
              'flex items-center gap-2 px-3 py-2 h-auto rounded-full',
              'hover:bg-gray-100 transition-colors',
              className
            )}
          >
            <div className="flex items-center gap-2">
              <div className={cn('flex items-center gap-1', statusConfig.color)}>
                {statusConfig.icon}
                {showUserInfo && (
                  <span className="text-sm font-medium">
                    {user?.full_name || user?.email?.split('@')[0] || 'User'}
                  </span>
                )}
              </div>
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            </div>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuHeader>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <div className="flex flex-col">
                <span className="text-sm font-medium">
                  {user?.full_name || 'User'}
                </span>
                {user?.email && (
                  <span className="text-xs text-muted-foreground">
                    {user.email}
                  </span>
                )}
              </div>
            </div>
          </DropdownMenuHeader>

          <DropdownMenuSeparator />

          <DropdownMenuLabel className="text-xs text-muted-foreground">
            Session Status
          </DropdownMenuLabel>

          <div className="px-2 py-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className={cn('flex items-center gap-1', statusConfig.color)}>
                  {statusConfig.icon}
                  <span>{statusConfig.text}</span>
                </div>
              </div>
              {sessionTime && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>{sessionTime}</span>
                </div>
              )}
            </div>
          </div>

          <DropdownMenuSeparator />

          <DropdownMenuLabel className="text-xs text-muted-foreground">
            Account Actions
          </DropdownMenuLabel>

          <DropdownMenuItem
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => {
              // Navigate to profile/settings
              window.location.href = '/profile';
            }}
          >
            <Settings className="h-4 w-4" />
            <span>Account Settings</span>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            className="flex items-center gap-2 cursor-pointer text-red-600 focus:text-red-600"
            onClick={() => setShowLogoutDialog(true)}
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <LogoutConfirmationDialog
        isOpen={showLogoutDialog}
        onClose={() => setShowLogoutDialog(false)}
      />
    </>
  );
};

export default SessionStatusIndicator;