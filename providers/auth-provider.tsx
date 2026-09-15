'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '../types';
import { authService } from '../services/auth.service';
import { getToken, removeToken, setStoredUser, setToken, getStoredUser } from '../lib/auth/token';
import { hasPermission as checkPermission } from '../lib/permissions';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  const refreshUser = async () => {
    try {
      const token = getToken();
      if (!token) {
        setUser(null);
        setIsLoading(false);
        return;
      }
      const userData = await authService.getMe();
      setUser(userData);
      setStoredUser(userData);
    } catch {
      removeToken();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const cachedUser = getStoredUser();
    const token = getToken();
    if (cachedUser && token) {
      setUser(cachedUser);
      setIsLoading(false);
    }
    void refreshUser();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await authService.login({ email, password });
    setToken(res.accessToken);
    setUser(res.user);
    setStoredUser(res.user);
    setIsLoading(false);
    router.push('/dashboard');
  };

  const logout = () => {
    removeToken();
    setUser(null);
    router.push('/login');
  };

  const hasPermission = (permission: string): boolean => {
    return checkPermission(user, permission);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
        hasPermission,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
