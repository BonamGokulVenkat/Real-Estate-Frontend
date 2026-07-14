import axios from 'axios';
import Cookies from 'js-cookie';
import { useAuthStore } from '../store/useAuthStore';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  // Ensures HttpOnly cookies are sent cross-origin on every request
  withCredentials: true,
});

// Request interceptor — attach token
apiClient.interceptors.request.use(
  (config) => {
    const token = Cookies.get('access_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Track if we're already refreshing to avoid infinite loops
let isRefreshing = false;
let failedQueue: {
  resolve: (value: string | null) => void;
  reject: (reason?: any) => void
}[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

// Response interceptor — handle 401 with refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Auth endpoints should NEVER trigger the refresh/redirect flow.
    // A 401 here means "wrong credentials", not "session expired".
    const isAuthEndpoint =
      originalRequest?.url?.includes('/auth/login') ||
      originalRequest?.url?.includes('/auth/register') ||
      originalRequest?.url?.includes('/auth/refresh-token');

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      // If already refreshing, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Call your refresh endpoint
        const refreshToken = Cookies.get('refresh_token');
        const { data } = await axios.post(`${API_URL}/auth/refresh-token`, {
          refresh_token: refreshToken,
        });

        const newAccessToken = data.access_token;

        // Save new token
        Cookies.set('access_token', newAccessToken, { expires: 1 }); // 1 day

        // Update default header
        apiClient.defaults.headers['Authorization'] = `Bearer ${newAccessToken}`;

        processQueue(null, newAccessToken);

        // Retry original request with new token
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);

      } catch (refreshError) {
        processQueue(refreshError, null);

        // Refresh failed — clear cookies AND Zustand state so the UI
        // doesn't show a "logged-in" ghost state after redirect.
        Cookies.remove('access_token');
        Cookies.remove('refresh_token');
        useAuthStore.getState().logout();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);