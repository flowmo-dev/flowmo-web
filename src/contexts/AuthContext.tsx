import React, { createContext, useState, useContext, useEffect } from 'react';
import createApi from '../services/api';

interface User {
  id: string;
  username: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  apiUrl: string;
  login: (username: string, password: string, apiUrl: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setApiUrl: (url: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [apiUrl, setApiUrl] = useState(import.meta.env.VITE_DEFAULT_API_URL);
  const api = createApi(apiUrl);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await api.get('/auth/user');
        setUser(response.data);
      } catch (error) {
        setUser(null);
      }
    };
    checkAuth();
  }, [apiUrl]);

  const login = async (username: string, password: string, newApiUrl: string) => {
    setApiUrl(newApiUrl);
    const response = await api.post('/auth/login', { username, password });
    setUser(response.data.user);
  };

  const register = async (username: string, password: string) => {
    const response = await api.post('/auth/register', { username, password });
    setUser(response.data.user);
  };

  const logout = async () => {
    await api.post('/auth/logout');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user, 
      apiUrl,
      login, 
      register, 
      logout,
      setApiUrl
    }}>
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