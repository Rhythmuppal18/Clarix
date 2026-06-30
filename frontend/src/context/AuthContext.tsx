'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { auth } from '../lib/api';

interface AuthContextType {
  user: any | null;
  loading: boolean;
  login: (data: any) => Promise<void>;
  logout: () => void;
  registerOrg: (data: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token') || Cookies.get('token');
      if (token) {
        try {
          const res = await auth.getMe();
          setUser(res);
        } catch (e) {
          console.error(e);
          localStorage.removeItem('token');
          Cookies.remove('token');
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const loginUser = async (data: any) => {
    const res = await auth.login(data);
    localStorage.setItem('token', res.access_token);
    Cookies.set('token', res.access_token, { expires: 1 });
    const me = await auth.getMe();
    setUser(me);
    router.push('/dashboard');
  };

  const registerOrganization = async (data: any) => {
    const res = await auth.registerOrg(data);
    localStorage.setItem('token', res.access_token);
    Cookies.set('token', res.access_token, { expires: 1 });
    const me = await auth.getMe();
    setUser(me);
    router.push('/dashboard');
  };

  const logout = () => {
    localStorage.removeItem('token');
    Cookies.remove('token');
    setUser(null);
    router.push('/auth');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login: loginUser, logout, registerOrg: registerOrganization }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
