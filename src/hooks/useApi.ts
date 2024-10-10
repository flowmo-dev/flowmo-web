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

  return instance;
};

export default useApi;