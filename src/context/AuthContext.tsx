'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../services/api';

export interface User {
  id: string;
  name: string;
  username: string;
  role: 'ADMIN' | 'TEAM' | 'VOLUNTEER' | 'CUSTOMER';
  created?: number;
  updated?: number;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  updateCurrentUser: (userData: Partial<User>) => void;
  isProfileModalOpen: boolean;
  openProfileModal: () => void;
  closeProfileModal: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  logout: () => {},
  updateCurrentUser: () => {},
  isProfileModalOpen: false,
  openProfileModal: () => {},
  closeProfileModal: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('pragati_admin_token');
      const storedUser = localStorage.getItem('pragati_admin_user');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch {}
    setIsLoading(false);

    const handleUnauthorized = () => {
      setUser(null);
      setToken(null);
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  const login = async (username: string, password: string) => {
    const res: any = await api.login({ username, password });
    const token = res.token || res.data?.token;
    const user = res.user || res.data?.user;

    if (res.success && token) {
      setToken(token);
      setUser(user);
      localStorage.setItem('pragati_admin_token', token);
      localStorage.setItem('pragati_admin_user', JSON.stringify(user));
    } else {
      throw new Error(res.message || 'Login failed. Invalid credentials or token.');
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('pragati_admin_token');
    localStorage.removeItem('pragati_admin_user');
  };

  const updateCurrentUser = (userData: Partial<User>) => {
    if (user) {
      const updated = { ...user, ...userData };
      setUser(updated);
      localStorage.setItem('pragati_admin_user', JSON.stringify(updated));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        logout,
        updateCurrentUser,
        isProfileModalOpen,
        openProfileModal: () => setIsProfileModalOpen(true),
        closeProfileModal: () => setIsProfileModalOpen(false),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
