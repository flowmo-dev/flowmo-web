import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const useApi = () => {
  const { apiUrl, token } = useAuth();
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

  return {
    get: (url: string, config?: any) => instance.get(url, config),
    post: (url: string, data: any, config?: any) => instance.post(url, data, config),
    put: (url: string, data: any, config?: any) => instance.put(url, data, config),
    delete: (url: string, config?: any) => instance.delete(url, config),
  };
};

export default useApi;
