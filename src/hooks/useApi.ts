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
        // トークンがある場合はAuthorizationヘッダーに追加
        config.headers.Authorization = `Bearer ${token}`;
      }
      console.log('token:', token);
      console.log('Request config:', config);
      return config;
    },
    (error) => {
      // リクエストエラーの処理
      return Promise.reject(error);
    }
  );

  return instance;
};

export default useApi;
