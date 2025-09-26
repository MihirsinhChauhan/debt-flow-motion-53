import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  AuthLoadingOverlay,
  PasswordStrengthIndicator,
  LogoutConfirmationDialog,
  SessionStatusIndicator,
  AuthErrorBoundary,
  AuthRedirectHandler
} from './index';

/**
 * Demo component showcasing all authentication UX components
 * This is for development/testing purposes only
 */
export const AuthDemo: React.FC = () => {
  const [showLoadingOverlay, setShowLoadingOverlay] = useState(false);
  const [loadingType, setLoadingType] = useState<'login' | 'signup' | 'logout' | 'checking' | 'error'>('login');
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [password, setPassword] = useState('');

  const handleShowLoading = (type: typeof loadingType) => {
    setLoadingType(type);
    setShowLoadingOverlay(true);
    setTimeout(() => setShowLoadingOverlay(false), 3000);
  };

  return (
    <AuthErrorBoundary>
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold">Authentication UX Components Demo</h1>
            <p className="text-muted-foreground mt-2">
              Showcase of all authentication user experience components
            </p>
          </div>

          {/* Session Status Indicators */}
          <Card>
            <CardHeader>
              <CardTitle>Session Status Indicators</CardTitle>
              <CardDescription>
                Different variants of session status display components
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Badge Variant</Label>
                  <div className="mt-2">
                    <SessionStatusIndicator variant="badge" />
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Compact Variant</Label>
                  <div className="mt-2">
                    <SessionStatusIndicator variant="compact" />
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Dropdown Variant (with user info)</Label>
                  <div className="mt-2">
                    <SessionStatusIndicator variant="dropdown" showUserInfo={true} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Loading Overlays */}
          <Card>
            <CardHeader>
              <CardTitle>Loading Overlays</CardTitle>
              <CardDescription>
                Different types of authentication loading states
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <Button
                  onClick={() => handleShowLoading('login')}
                  variant="outline"
                >
                  Login Loading
                </Button>
                <Button
                  onClick={() => handleShowLoading('signup')}
                  variant="outline"
                >
                  Signup Loading
                </Button>
                <Button
                  onClick={() => handleShowLoading('logout')}
                  variant="outline"
                >
                  Logout Loading
                </Button>
                <Button
                  onClick={() => handleShowLoading('checking')}
                  variant="outline"
                >
                  Auth Checking
                </Button>
                <Button
                  onClick={() => handleShowLoading('error')}
                  variant="outline"
                >
                  Error State
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Password Strength Indicator */}
          <Card>
            <CardHeader>
              <CardTitle>Password Strength Indicator</CardTitle>
              <CardDescription>
                Real-time password strength feedback with requirements
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="demo-password">Try typing a password:</Label>
                <Input
                  id="demo-password"
                  type="password"
                  placeholder="Enter a password to see strength indicator"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <PasswordStrengthIndicator password={password} />

              <div className="text-sm text-muted-foreground">
                <p>Try different passwords to see how the strength indicator responds:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li><code>password</code> - Weak</li>
                  <li><code>Password123</code> - Fair</li>
                  <li><code>Password123!</code> - Good</li>
                  <li><code>MySecurePassword123!</code> - Strong</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Logout Confirmation */}
          <Card>
            <CardHeader>
              <CardTitle>Logout Confirmation Dialog</CardTitle>
              <CardDescription>
                Secure logout confirmation with user session info
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => setShowLogoutDialog(true)}
                variant="outline"
                className="text-red-600 hover:text-red-700"
              >
                Show Logout Dialog
              </Button>
            </CardContent>
          </Card>

          {/* Auth Redirect Handler */}
          <Card>
            <CardHeader>
              <CardTitle>Auth Redirect Handler</CardTitle>
              <CardDescription>
                Handles authentication redirects with smooth UX
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                The AuthRedirectHandler component automatically handles redirects after authentication.
                It provides smooth transitions and user feedback during the redirect process.
              </p>

              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm font-medium mb-2">Features:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Automatic redirect with countdown</li>
                  <li>• Return URL handling from query parameters</li>
                  <li>• Manual redirect fallback</li>
                  <li>• Error handling and retry logic</li>
                  <li>• Loading states and progress indicators</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Error Boundary */}
          <Card>
            <CardHeader>
              <CardTitle>Authentication Error Boundary</CardTitle>
              <CardDescription>
                Graceful error handling for authentication components
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                The AuthErrorBoundary component catches and handles authentication-related errors gracefully.
                It provides user-friendly error messages and recovery options.
              </p>

              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm font-medium mb-2">Error Types Handled:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Network connection errors with auto-retry</li>
                  <li>• Authentication session errors</li>
                  <li>• Unexpected component errors</li>
                  <li>• API communication failures</li>
                </ul>
              </div>

              <Button
                onClick={() => {
                  throw new Error('Demo authentication error');
                }}
                variant="outline"
                className="text-red-600 hover:text-red-700"
              >
                Trigger Error (Demo)
              </Button>
            </CardContent>
          </Card>

          <Separator />

          {/* Implementation Examples */}
          <Card>
            <CardHeader>
              <CardTitle>Implementation Examples</CardTitle>
              <CardDescription>
                Code examples for using these components
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Basic Usage:</h4>
                  <pre className="bg-gray-50 p-3 rounded text-xs overflow-x-auto">
{`import {
  SessionStatusIndicator,
  AuthLoadingOverlay,
  PasswordStrengthIndicator,
  LogoutConfirmationDialog,
  AuthErrorBoundary
} from '@/components/auth';

// In your component
<AuthErrorBoundary>
  <SessionStatusIndicator variant="dropdown" />
  <AuthLoadingOverlay isVisible={loading} type="login" />
  <PasswordStrengthIndicator password={password} />
  <LogoutConfirmationDialog
    isOpen={showDialog}
    onClose={() => setShowDialog(false)}
  />
</AuthErrorBoundary>`}
                  </pre>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2">With useAuthGuard Hook:</h4>
                  <pre className="bg-gray-50 p-3 rounded text-xs overflow-x-auto">
{`import { useAuthGuard } from '@/hooks/useAuthGuard';

const MyProtectedComponent = () => {
  const { canAccess, isLoading, showLoadingOverlay } = useAuthGuard({
    redirectTo: '/auth',
    showLoadingOverlay: true
  });

  if (!canAccess) return null;

  return <div>Protected content</div>;
};`}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Loading Overlay */}
        <AuthLoadingOverlay
          isVisible={showLoadingOverlay}
          type={loadingType}
        />

        {/* Logout Dialog */}
        <LogoutConfirmationDialog
          isOpen={showLogoutDialog}
          onClose={() => setShowLogoutDialog(false)}
        />
      </div>
    </AuthErrorBoundary>
  );
};

export default AuthDemo;