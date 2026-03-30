'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import axios from 'axios';

interface User {
  username: string;
  target_language: string;
  llm_provider: string;
  local_llm_url: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, username: string, target_language: string, llm_provider?: string, local_llm_url?: string) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUsername = localStorage.getItem('username');
    const savedLanguage = localStorage.getItem('target_language') || 'Korean';
    const savedLLM = localStorage.getItem('llm_provider') || 'groq';
    const savedLocalURL = localStorage.getItem('local_llm_url') || 'http://localhost:1234/v1';
    
    if (savedToken && savedUsername) {
      setToken(savedToken);
      setUser({ 
        username: savedUsername, 
        target_language: savedLanguage,
        llm_provider: savedLLM,
        local_llm_url: savedLocalURL
      });
      api.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
    }

    const interceptor = api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          logout();
        }
        return Promise.reject(error);
      }
    );

    setIsLoading(false);
    return () => api.interceptors.response.eject(interceptor);
  }, []);

  const login = (newToken: string, username: string, target_language: string, llm_provider: string = 'groq', local_llm_url: string = 'http://localhost:1234/v1') => {
    setToken(newToken);
    setUser({ username, target_language, llm_provider, local_llm_url });
    localStorage.setItem('token', newToken);
    localStorage.setItem('username', username);
    localStorage.setItem('target_language', target_language);
    localStorage.setItem('llm_provider', llm_provider);
    localStorage.setItem('local_llm_url', local_llm_url);
    api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    router.push('/');
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('target_language');
    localStorage.removeItem('llm_provider');
    localStorage.removeItem('local_llm_url');
    delete api.defaults.headers.common['Authorization'];
    router.push('/login');
  };

  const updateUser = async (updates: Partial<User>) => {
    if (!token) return;
    try {
      const response = await api.patch('/user/me', updates);
      const updatedUser = response.data;
      setUser(updatedUser);
      localStorage.setItem('target_language', updatedUser.target_language);
      localStorage.setItem('llm_provider', updatedUser.llm_provider);
      localStorage.setItem('local_llm_url', updatedUser.local_llm_url);
    } catch (err) {
      console.error('Failed to update user:', err);
      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, updateUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
