import React, { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { LogOut, Shield, Clock, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface LogoutConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  trigger?: React.ReactNode;
}

export const LogoutConfirmationDialog: React.FC<LogoutConfirmationDialogProps> = ({
  isOpen,
  onClose,
  trigger
}) => {
  const { logout, user, isLoading } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      // Add a small delay for better UX
      await new Promise(resolve => setTimeout(resolve, 800));
      logout();
      onClose();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const formatLastActivity = () => {
    // This would ideally come from the auth context or user session data
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      {trigger && (
        <div onClick={() => {}} role="button" tabIndex={0}>
          {trigger}
        </div>
      )}

      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader className="text-center space-y-4">
          <div className="mx-auto flex items-center justify-center w-12 h-12 rounded-full bg-orange-100">
            <LogOut className="w-6 h-6 text-orange-600" />
          </div>

          <AlertDialogTitle className="text-xl font-semibold">
            Sign Out of DebtEase?
          </AlertDialogTitle>

          <AlertDialogDescription className="text-center space-y-3">
            <div className="text-sm text-muted-foreground">
              You're about to sign out of your account.
            </div>

            {/* User Info */}
            {user && (
              <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-center gap-2 text-sm">
                  <Shield className="w-4 h-4 text-blue-500" />
                  <span className="font-medium">{user.full_name || user.email}</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  <span>Last activity: {formatLastActivity()}</span>
                </div>
              </div>
            )}

            {/* Security Notice */}
            <div className="flex items-start gap-2 text-left bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-yellow-700">
                <p className="font-medium">Security Note:</p>
                <p>Your session will be completely cleared and you'll need to sign in again to access your account.</p>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="flex flex-col-reverse sm:flex-row gap-2">
          <AlertDialogCancel
            onClick={onClose}
            disabled={isLoggingOut}
            className="w-full sm:w-auto"
          >
            Stay Signed In
          </AlertDialogCancel>

          <AlertDialogAction
            onClick={handleLogout}
            disabled={isLoggingOut || isLoading}
            className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700 text-white"
          >
            {isLoggingOut ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Signing Out...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <LogOut className="w-4 h-4" />
                Sign Out
              </div>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default LogoutConfirmationDialog;