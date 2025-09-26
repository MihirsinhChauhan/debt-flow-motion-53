import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiService } from '../lib/api';

interface User {
  id: string;
  email?: string;
  full_name?: string;
  monthly_income?: number;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, full_name: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    const token = localStorage.getItem('access_token');
    if (token) {
      try {
        console.log('[Auth] Existing token found, verifying...');
        const userData = await apiService.getCurrentUser();
        setUser(userData);
        console.log('[Auth] Authentication verified successfully');
      } catch (err) {
        console.error('[Auth] Token verification failed:', err);
        // Clear invalid token
        apiService.clearToken();
        setUser(null);
      }
    }
    setIsLoading(false);
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('[Auth] Attempting login...');
      const response = await apiService.login(email, password);
      setUser(response.user);
      console.log('[Auth] Login successful');
      return true;
    } catch (err) {
      console.error('[Auth] Login failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string, full_name: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('[Auth] Attempting registration...');
      const response = await apiService.register(email, password, full_name);

      // Backend might return user directly from registration
      if (response.user) {
        setUser(response.user);
        console.log('[Auth] Registration successful with user data');
        return true;
      } else {
        // If no user in response, try to login
        console.log('[Auth] Registration successful, attempting auto-login...');
        return await login(email, password);
      }
    } catch (err) {
      console.error('[Auth] Registration failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'Registration failed';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    console.log('[Auth] Logging out...');
    setUser(null);
    setError(null);
    apiService.clearToken();
    window.location.href = '/auth';
  };

  const clearError = () => {
    setError(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      signup,
      logout,
      isLoading,
      error,
      clearError
    }}>
      {children}
    </AuthContext.Provider>
  );
};