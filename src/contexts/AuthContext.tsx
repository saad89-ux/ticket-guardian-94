import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, UserRole } from '@/lib/types';
import { mockUsers, demoCredentials } from '@/lib/mock-data';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('clinic_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading] = useState(false);

  const login = async (email: string, password: string): Promise<boolean> => {
    const cred = demoCredentials.find(c => c.email === email && c.password === password);
    if (cred) {
      const found = mockUsers.find(u => u.email === email);
      if (found) {
        setUser(found);
        localStorage.setItem('clinic_user', JSON.stringify(found));
        return true;
      }
    }
    return false;
  };

  const signup = async (name: string, email: string, _password: string): Promise<boolean> => {
    const newUser: User = {
      id: `pat-${Date.now()}`,
      name,
      email,
      role: 'patient',
      createdAt: new Date().toISOString(),
    };
    setUser(newUser);
    localStorage.setItem('clinic_user', JSON.stringify(newUser));
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('clinic_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isAuthenticated: !!user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
