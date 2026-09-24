import axios from 'axios';

// Smart API Base URL Resolution:
// 1. If explicit non-localhost VITE_API_BASE_URL is provided, use it.
// 2. If running locally (localhost / 127.0.0.1), use VITE_API_BASE_URL or 'http://localhost:5000/api'.
// 3. If running in production (e.g. Vercel deployment), automatically connect to the live Render backend:
//    'https://ai-careerguidance-1-p8g9.onrender.com/api'.
const resolveBaseUrl = () => {
  const envUrl = (import.meta.env.VITE_API_BASE_URL || '').trim();

  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const isLocalhost =
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '0.0.0.0' ||
      hostname === '';

    // If local dev environment
    if (isLocalhost) {
      return envUrl || 'http://localhost:5000/api';
    }

    // In deployed production environment:
    // If VITE_API_BASE_URL was configured to an external production URL (not localhost), use it
    if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
      return envUrl.replace(/\/$/, '');
    }

    // Default to the live Render backend in production deployments
    return 'https://ai-careerguidance-1-p8g9.onrender.com/api';
  }

  return envUrl || 'http://localhost:5000/api';
};

const api = axios.create({
  baseURL: resolveBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 45000, // 45 seconds for AI queries & cold starts
});

// Request interceptor: Attach JWT token automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('career_compass_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token.trim()}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: Global error handler
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // If token is invalid or expired, clear storage
    if (error.response && error.response.status === 401) {
      const url = error.config?.url || '';
      const isAuthRoute =
        url.includes('/auth/login') ||
        url.includes('/auth/register');

      if (!isAuthRoute) {
        localStorage.removeItem('career_compass_token');
        localStorage.removeItem('career_compass_user');
        if (
          typeof window !== 'undefined' &&
          window.location.pathname !== '/login' &&
          window.location.pathname !== '/register'
        ) {
          window.location.href = '/login?session_expired=true';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
