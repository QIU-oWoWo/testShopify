import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserVO, DealerLevel } from '../types';
import { mockUser } from '../mock';

interface AuthContextValue {
  user: UserVO | null;
  isLoggedIn: boolean;
  login: (phone: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (updates: Partial<UserVO>) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_KEY = 'yunxiaotong_user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserVO | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [user]);

  const login = async (_phone: string, _password: string): Promise<boolean> => {
    // Simulate API login - always succeed with mock data
    await new Promise((r) => setTimeout(r, 500));
    setUser(mockUser);
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('yunxiaotong_cart');
  };

  const updateUser = (updates: Partial<UserVO>) => {
    setUser((prev) => (prev ? { ...prev, ...updates } : prev));
  };

  return (
    <AuthContext.Provider value={{ user, isLoggedIn: !!user, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
