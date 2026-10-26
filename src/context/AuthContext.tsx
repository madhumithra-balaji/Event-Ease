import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, Role } from '../types/index.js';
import { api, TokenStorage } from '../services/api.js';
import { useToast } from './ToastContext.js';

interface AuthContextValue {
  user: User | null;
  role: Role | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (name: string, email: string, pass: string, role: Role, orgName?: string) => Promise<void>;
  logout: () => void;
  quickSwitchDemoRole: (role: 'ADMIN' | 'ORGANIZER' | 'ATTENDEE') => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { success, error } = useToast();

  const refreshUser = useCallback(async () => {
    const token = TokenStorage.get();
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const data = await api.get<{ user: User }>('/api/auth/me');
      setUser(data.user);
    } catch {
      TokenStorage.clear();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (email: string, pass: string) => {
    try {
      const data = await api.post<{ token: string; user: User }>('/api/auth/login', {
        email,
        password: pass,
      });
      TokenStorage.set(data.token);
      setUser(data.user);
      success(`Welcome back, ${data.user.name}!`);
    } catch (err: any) {
      error(err.message || 'Login failed. Please check credentials.');
      throw err;
    }
  };

  const register = async (name: string, email: string, pass: string, role: Role, orgName?: string) => {
    try {
      const data = await api.post<{ token: string; user: User }>('/api/auth/register', {
        name,
        email,
        password: pass,
        role,
        organizationName: orgName,
      });
      TokenStorage.set(data.token);
      setUser(data.user);
      success('Account created successfully!');
    } catch (err: any) {
      error(err.message || 'Registration failed.');
      throw err;
    }
  };

  const quickSwitchDemoRole = async (targetRole: 'ADMIN' | 'ORGANIZER' | 'ATTENDEE') => {
    try {
      setIsLoading(true);
      const data = await api.post<{ token: string; user: User }>('/api/auth/demo-switch', {
        role: targetRole,
      });
      TokenStorage.set(data.token);
      setUser(data.user);
      success(`Switched role to demo ${targetRole}: ${data.user.name}`);
    } catch (err: any) {
      error(err.message || 'Failed to switch demo role.');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    TokenStorage.clear();
    setUser(null);
    success('Logged out successfully.');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        quickSwitchDemoRole,
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
