import axios from 'axios';
import store from '../store/store';
import { logout, updateToken } from '../store/slices/AuthSlice';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true, // Required to send/receive HTTP-only refresh cookies
  headers: { "Content-Type": "application/json" },
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

// 1. Request Interceptor: Attach the current token to every request
apiClient.interceptors.request.use(
  (config) => {
    const token = store.getState().auth.token || localStorage.getItem('employeeToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 2. Response Interceptor: Handle Token Expiration and Refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Do NOT attempt refresh if the login itself fails
    if (originalRequest.url.includes('/employee/login')) {
      return Promise.reject(error);
    }

    // Handle 401 (Expired Access Token)
    if (error.response?.status === 401 && !originalRequest._retry) {
      
      // If already refreshing, queue this request
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
        // Call the Refresh Token endpoint
        const response = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/api/v1/employee/refresh-token`,
          {},
          { withCredentials: true }
        );

        // Your specific API structure: response.data.data.accessToken
        const { accessToken } = response.data.data;
        
        // 1. Update Redux & LocalStorage
        store.dispatch(updateToken(accessToken));
        
        // 2. Resolve all queued requests with the new token
        processQueue(null, accessToken);
        
        // 3. Retry the original failed request
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(originalRequest);

      } catch (refreshError) {
        // If Refresh fails (Token expired or EMPLOYEE_NOT_FOUND 500)
        processQueue(refreshError, null);
        
        // Force Logout: Clear state and redirect to login
        store.dispatch(logout());
        
        if (window.location.pathname !== '/login') {
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

export default apiClient;