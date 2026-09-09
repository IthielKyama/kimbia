import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../services/apiClient';

export type Role = 'GUEST' | 'SUPER_ADMIN' | 'RACE_ADMIN_PENDING' | 'RACE_ADMIN_APPROVED';

export interface User {
  id: number | string;
  name: string;
  email: string;
  role: 'SUPER_ADMIN' | 'RACE_ADMIN' | 'RUNNER';
  status?: 'ACTIVE' | 'INACTIVE' | 'PENDING_VETTING' | 'APPROVED';
  mobileNumber?: string;
  tinggServiceCode?: string;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  organization?: string;
  mobileNumber?: string;
}

export interface AuthContextType {
  user: User | null;
  role: Role;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ role: Role }>;
  register: (data: RegisterData) => Promise<{ role: Role }>;
  logout: () => void;
}

export const computeRole = (user: User): Role => {
  if (user.role === 'SUPER_ADMIN') {
    return 'SUPER_ADMIN';
  }
  if (user.role === 'RACE_ADMIN') {
    if (user.status === 'PENDING_VETTING') {
      return 'RACE_ADMIN_PENDING';
    }
    return 'RACE_ADMIN_APPROVED';
  }
  return 'GUEST';
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role>('GUEST');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setIsLoading(false);
      return;
    }

    apiClient
      .get<User>('/api/users/me')
      .then((res) => {
        const userData = res.data;
        if (userData.role === 'RUNNER') {
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          setUser(null);
          setRole('GUEST');
        } else {
          setUser(userData);
          setRole(computeRole(userData));
        }
      })
      .catch(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        setUser(null);
        setRole('GUEST');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const login = async (email: string, password: string): Promise<{ role: Role }> => {
    const res = await apiClient.post<{
      token: string;
      accessToken?: string;
      refreshToken?: string;
      userId: number;
      role: string;
    }>('/api/auth/login', {
      email,
      password,
    });
    const { token, accessToken, refreshToken, role: backendRole } = res.data;

    if (backendRole === 'RUNNER') {
      throw new Error('Access denied: Runner accounts must use the Kimbia mobile app.');
    }

    const activeToken = accessToken || token;
    localStorage.setItem('token', activeToken);
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    }

    const userRes = await apiClient.get<User>('/api/users/me');
    const userData = userRes.data;
    const effectiveRole = computeRole(userData);
    setUser(userData);
    setRole(effectiveRole);

    return { role: effectiveRole };
  };

  const register = async (data: RegisterData): Promise<{ role: Role }> => {
    const res = await apiClient.post<{
      token: string;
      accessToken?: string;
      refreshToken?: string;
      userId: number;
      role: string;
    }>('/api/auth/register', {
      name: data.name,
      email: data.email,
      password: data.password,
      role: 'RACE_ADMIN',
      mobileNumber: data.mobileNumber || '',
    });
    const { token, accessToken, refreshToken } = res.data;
    const activeToken = accessToken || token;
    localStorage.setItem('token', activeToken);
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    }

    const userRes = await apiClient.get<User>('/api/users/me');
    const userData = userRes.data;
    const effectiveRole = computeRole(userData);
    setUser(userData);
    setRole(effectiveRole);

    return { role: effectiveRole };
  };

  const logout = () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      apiClient.post('/api/auth/logout', { refreshToken }).catch(() => {});
    }
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    setUser(null);
    setRole('GUEST');
  };

  return (
    <AuthContext.Provider value={{ user, role, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

