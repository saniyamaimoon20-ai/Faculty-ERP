import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '../types';
import { apiRequest } from '../api/client';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string, remember: boolean) => Promise<User>;
  activateAccount: (identifier: string, new_password: string) => Promise<any>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const refreshSession = async () => {
    try {
      setLoading(true);
      const res = await apiRequest('/session');
      if (res.authenticated && res.user) {
        setUser(res.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshSession();
  }, []);

  const login = async (username: string, password: string, remember: boolean): Promise<User> => {
    const res = await apiRequest('/login', {
      method: 'POST',
      body: JSON.stringify({ username, password, remember }),
    });
    if (res.user) {
      setUser(res.user);
      return res.user;
    }
    throw new Error('Login failed.');
  };

  const activateAccount = async (identifier: string, new_password: string): Promise<any> => {
    return await apiRequest('/activate-account', {
      method: 'POST',
      body: JSON.stringify({ identifier, new_password }),
    });
  };

  const logout = async () => {
    try {
      await apiRequest('/logout', { method: 'POST' });
    } catch (err) {
      console.warn('Logout API call failed:', err);
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, activateAccount, logout, refreshSession }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
