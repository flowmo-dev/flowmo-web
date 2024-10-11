import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

interface User {
  id: string;
  username: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
  apiUrl: string;
  login: (username: string, password: string, apiUrl: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setApiUrl: (url: string) => void;
  debugLogin: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [apiUrl, setApiUrl] = useState(import.meta.env.VITE_DEFAULT_API_URL || '');
  const [token, setToken] = useState<string | null>(localStorage.getItem('authToken'));
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!localStorage.getItem('authToken'));

  const api = axios.create({
    baseURL: apiUrl,
    withCredentials: true,
  });

  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('authToken');
      if (storedToken) {
        try {
          const response = await api.get('/auth/user', {
            headers: { Authorization: `Bearer ${storedToken}` }
          });
          setUser(response.data);
          setIsAuthenticated(true);
          setToken(storedToken);
        } catch (error) {
          console.error('Failed to fetch user data:', error);
          setUser(null);
          setToken(null);
          setIsAuthenticated(false);
          localStorage.removeItem('authToken');
        }
      }
    };
    if (apiUrl) {
      checkAuth();
    }
  }, [apiUrl]);

  const login = async (username: string, password: string, newApiUrl: string) => {
    setApiUrl(newApiUrl);
    const response = await api.post('/auth/login', { username, password });
    setToken(response.data.token);
    setUser(response.data.user);
    setIsAuthenticated(true);
    localStorage.setItem('authToken', response.data.token);
  };

  const register = async (username: string, password: string) => {
    const response = await api.post('/auth/register', { username, password });
    setToken(response.data.token);
    setUser(response.data.user);
    setIsAuthenticated(true);
    localStorage.setItem('authToken', response.data.token);
  };

  const logout = async () => {
    await api.post('/auth/logout');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('authToken');
  };

  const debugLogin = () => {
    const debugUser = { id: 'debug', username: 'Debug User' };
    setUser(debugUser);
    setIsAuthenticated(true);
    localStorage.setItem('debugMode', 'true');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      token,
      apiUrl,
      login, 
      register, 
      logout,
      setApiUrl,
      debugLogin
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