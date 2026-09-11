'use client';

import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { User, LoginResponseData, ApiResponse } from '@/types/api';
import api from '@/lib/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginResponseData) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const logout = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
    }
    setUser(null);
    setToken(null);
  }, []);

  const login = useCallback((data: LoginResponseData) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('auth_user', JSON.stringify(data.user));
    }
    setToken(data.token);
    setUser(data.user);
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof window === 'undefined') return;
        const storedToken = localStorage.getItem('auth_token');
        const storedUser = localStorage.getItem('auth_user');

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          
          // Verify with backend
          try {
            const res = await api.get<ApiResponse<{ user: User }>>('/auth/me');
            if (res.data.success && res.data.data?.user) {
              setUser(res.data.data.user);
              localStorage.setItem('auth_user', JSON.stringify(res.data.data.user));
            }
          } catch {
            // Token expired or invalid
            logout();
          }
        }
      } catch {
        logout();
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    const handleUnauthorized = () => logout();
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, [logout]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
