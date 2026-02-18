import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, UserRole } from '@/lib/types';
import { mockUsers } from '@/lib/mock-data';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => boolean;
  signup: (name: string, email: string, password: string) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = (email: string, _password: string): boolean => {
    const found = mockUsers.find(u => u.email === email);
    if (found) {
      setUser(found);
      return true;
    }
    return false;
  };

  const signup = (name: string, email: string, _password: string): boolean => {
    const newUser: User = {
      id: `u${Date.now()}`,
      name,
      email,
      role: 'user',
      createdAt: new Date().toISOString(),
    };
    setUser(newUser);
    return true;
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
