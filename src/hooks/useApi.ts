import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const useApi = () => {
  const { apiUrl, token, isDebugMode } = useAuth();
  const instance = axios.create({
    baseURL: apiUrl,
    withCredentials: true,
  });

  instance.interceptors.request.use(
    (config) => {
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  const debugWrapper = async (method: string, url: string, data?: any) => {
    if (isDebugMode) {
      console.log(`Debug mode: ${method.toUpperCase()} ${url}`, data);
      // Simulate API response for debug mode
      return {
        data: {
          message: 'Debug mode: Operation successful',
          // Add more mock data as needed
        }
      };
    }
    return instance[method](url, data);
  };

  return {
    get: (url: string) => debugWrapper('get', url),
    post: (url: string, data: any) => debugWrapper('post', url, data),
    put: (url: string, data: any) => debugWrapper('put', url, data),
    delete: (url: string) => debugWrapper('delete', url),
  };
};

export default useApi;