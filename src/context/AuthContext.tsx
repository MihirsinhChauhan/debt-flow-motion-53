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
  debugAuth: () => any;
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
    // Check for existing session on app start
    const token = localStorage.getItem('access_token');
    if (token) {
      // Verify token by fetching current user
      checkAuthStatus();
    } else {
      setIsLoading(false);
    }
  }, []);

  const checkAuthStatus = async () => {
    try {
      const userData = await apiService.getCurrentUser();
      setUser(userData);
    } catch (err) {
      // Token is invalid, clear it
      apiService.clearToken();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiService.login(email, password);

      // Set token in API service
      apiService.setToken(response.access_token);

      // Fetch user profile
      const userData = await apiService.getCurrentUser();
      setUser(userData);

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string, full_name: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      await apiService.register(email, password, full_name);

      // After successful registration, log in automatically
      return await login(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed');
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setError(null);
    apiService.clearToken();
    // Force a page reload to ensure clean state
    window.location.href = '/auth';
  };

  // Debug function to check authentication state
  const debugAuth = () => {
    const token = localStorage.getItem('access_token');
    console.log('Auth Debug:', {
      hasToken: !!token,
      tokenPreview: token ? `${token.substring(0, 20)}...` : 'No token',
      user: user,
      isLoading,
      error
    });
    return { token, user, isLoading, error };
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isLoading, error, debugAuth }}>
      {children}
    </AuthContext.Provider>
  );
};