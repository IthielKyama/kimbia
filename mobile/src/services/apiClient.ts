import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

const getBaseUrl = () => {
  // 1. Explicit local dev override if set
  if (__DEV__ && process.env.EXPO_PUBLIC_DEV_API_URL) {
    return process.env.EXPO_PUBLIC_DEV_API_URL;
  }

  // 2. Explicit environment variable:
  // - In production (!__DEV__), always use EXPO_PUBLIC_API_URL.
  // - In local dev (__DEV__), only use EXPO_PUBLIC_API_URL if it points to a local address
  //   (e.g. localhost, 127.0.0.1, 10.x, 192.168.x) or if explicitly forced via EXPO_PUBLIC_FORCE_REMOTE=true.
  if (process.env.EXPO_PUBLIC_API_URL) {
    const isRemote =
      process.env.EXPO_PUBLIC_API_URL.startsWith('https://') ||
      process.env.EXPO_PUBLIC_API_URL.includes('onrender.com');

    if (!__DEV__ || !isRemote || process.env.EXPO_PUBLIC_FORCE_REMOTE === 'true') {
      return process.env.EXPO_PUBLIC_API_URL;
    }
  }

  // 3. Web browser (running in mobile or desktop browser)
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && window.location?.hostname) {
      return `http://${window.location.hostname}:8081`;
    }
    return 'http://localhost:8081';
  }

  // 4. Expo Go / Dev Client on physical device:
  // Extract host machine's IP from Metro connection so physical devices can reach backend
  const hostUri =
    Constants.expoConfig?.hostUri ||
    (Constants as any).manifest?.debuggerHost ||
    (Constants as any).manifest2?.extra?.expoGo?.debuggerHost;

  if (hostUri) {
    const hostIp = hostUri.split(':')[0];
    if (hostIp) {
      return `http://${hostIp}:8081`;
    }
  }

  // 5. Android Emulator loopback
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:8081';
  }

  // 6. Local machine fallback IP
  return 'http://localhost:8081';
};

const BASE_URL = getBaseUrl();

if (__DEV__) {
  console.log(`[Kimbia API] Running in local development mode. Base URL: ${BASE_URL}`);
}

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (!error.response || error.response.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    const requestUrl = originalRequest.url || '';
    if (requestUrl.includes('/api/auth/login') || requestUrl.includes('/api/auth/refresh')) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const refreshToken = await AsyncStorage.getItem('refreshToken');

      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      // Use clean axios call to avoid interceptor recursion
      const { data } = await axios.post(`${BASE_URL}/api/auth/refresh`, {
        refreshToken,
      });

      const newAccessToken = data.accessToken || data.token;
      const newRefreshToken = data.refreshToken;

      await AsyncStorage.setItem('token', newAccessToken);
      if (newRefreshToken) {
        await AsyncStorage.setItem('refreshToken', newRefreshToken);
      }

      apiClient.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

      processQueue(null, newAccessToken);

      return apiClient(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('refreshToken');

      const { navigationRef } = require('../../App');
      if (navigationRef.isReady()) {
        navigationRef.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
      }

      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default apiClient;
