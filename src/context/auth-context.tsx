'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isLocalMode: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const isLocalMode = !isSupabaseConfigured;

  useEffect(() => {
    if (!isLocalMode && supabase) {
      // 1. Supabase Mode Auth Sync
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || '',
          });
        } else {
          setUser(null);
        }
        setLoading(false);
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || '',
          });
        } else {
          setUser(null);
        }
        setLoading(false);
      });

      return () => {
        subscription.unsubscribe();
      };
    } else {
      // 2. Local Mode Auth Sync
      if (typeof window !== 'undefined') {
        const localUserStr = localStorage.getItem('labreport_ai_current_user');
        if (localUserStr) {
          try {
            setUser(JSON.parse(localUserStr));
          } catch {
            localStorage.removeItem('labreport_ai_current_user');
          }
        }
      }
      setLoading(false);
    }
  }, [isLocalMode]);

  // Login
  const login = async (email: string, password: string) => {
    if (!isLocalMode && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        return { success: false, error: error.message };
      }
      if (data.user) {
        setUser({
          id: data.user.id,
          email: data.user.email || '',
        });
        return { success: true };
      }
      return { success: false, error: '登录失败，请重试' };
    } else {
      // Local Login
      if (typeof window === 'undefined') return { success: false, error: '环境错误' };
      const usersRaw = localStorage.getItem('labreport_ai_users');
      let users = [];
      if (usersRaw) {
        try {
          users = JSON.parse(usersRaw);
        } catch {
          users = [];
        }
      }
      const existingUser = users.find((u: any) => u.email === email && u.password === password);
      if (existingUser) {
        const sessionUser = { id: existingUser.id, email: existingUser.email };
        localStorage.setItem('labreport_ai_current_user', JSON.stringify(sessionUser));
        setUser(sessionUser);
        return { success: true };
      }
      return { success: false, error: '邮箱或密码不正确' };
    }
  };

  // Register
  const register = async (email: string, password: string) => {
    if (!isLocalMode && supabase) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) {
        return { success: false, error: error.message };
      }
      if (data.user) {
        // Note: if email verification is enabled, the user is not automatically logged in.
        // We prompt the user.
        return { success: true };
      }
      return { success: false, error: '注册失败，请重试' };
    } else {
      // Local Register
      if (typeof window === 'undefined') return { success: false, error: '环境错误' };
      const usersRaw = localStorage.getItem('labreport_ai_users') || '[]';
      let users = [];
      try {
        users = JSON.parse(usersRaw);
      } catch {
        users = [];
      }

      const emailExists = users.some((u: any) => u.email === email);
      if (emailExists) {
        return { success: false, error: '该邮箱已被注册' };
      }

      const newUser = {
        id: 'user_' + Math.random().toString(36).substr(2, 9),
        email,
        password,
      };
      users.push(newUser);
      localStorage.setItem('labreport_ai_users', JSON.stringify(users));

      // Auto login in local mode
      const sessionUser = { id: newUser.id, email: newUser.email };
      localStorage.setItem('labreport_ai_current_user', JSON.stringify(sessionUser));
      setUser(sessionUser);

      return { success: true };
    }
  };

  // Logout
  const logout = async () => {
    if (!isLocalMode && supabase) {
      await supabase.auth.signOut();
    } else {
      localStorage.removeItem('labreport_ai_current_user');
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, isLocalMode, login, register, logout }}>
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
