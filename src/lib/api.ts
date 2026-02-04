import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Create axios instance with common config
const createApiInstance = (baseURL: string): AxiosInstance => {
  return axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

// Admin API instance
export const adminApi = createApiInstance(`${API_BASE_URL}/admin`);

// Vendor API instance
export const vendorApi = createApiInstance(`${API_BASE_URL}/vendor`);

// Partner API instance
export const partnerApi = createApiInstance(`${API_BASE_URL}/partner`);

// Agent API instance
export const agentApi = createApiInstance(`${API_BASE_URL}/agent`);

// Corporate API instance
export const corporateApi = createApiInstance(`${API_BASE_URL}/corporate`);

// Public API instance (for city codes, etc.)
export const publicApi = createApiInstance(API_BASE_URL);

// Token keys for different user types
export const TOKEN_KEYS = {
  admin: 'admin_token',
  vendor: 'vendor_token',
  partner: 'partner_token',
  agent: 'agent_token',
  corporate: 'corporate_token',
} as const;

export const USER_KEYS = {
  admin: 'admin_user',
  vendor: 'vendor_user',
  partner: 'partner_user',
  agent: 'agent_user',
  corporate: 'corporate_user',
} as const;

// Add auth interceptor to an API instance
const addAuthInterceptor = (api: AxiosInstance, tokenKey: string, userKey: string) => {
  // Request interceptor to add auth token
  api.interceptors.request.use(
    (config) => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem(tokenKey);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor to handle auth errors
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401 && !error.config.url?.includes('login')) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem(tokenKey);
          localStorage.removeItem(userKey);
          // Redirect based on user type
          const redirectPath = tokenKey === TOKEN_KEYS.admin ? '/login' : '/';
          // Only redirect if we are not already on the redirect path
          if (window.location.pathname !== redirectPath) {
             window.location.href = redirectPath;
          }
        }
      }
      return Promise.reject(error);
    }
  );
};

// Apply interceptors
addAuthInterceptor(adminApi, TOKEN_KEYS.admin, USER_KEYS.admin);
addAuthInterceptor(vendorApi, TOKEN_KEYS.vendor, USER_KEYS.vendor);
addAuthInterceptor(partnerApi, TOKEN_KEYS.partner, USER_KEYS.partner);
addAuthInterceptor(agentApi, TOKEN_KEYS.agent, USER_KEYS.agent);
addAuthInterceptor(corporateApi, TOKEN_KEYS.corporate, USER_KEYS.corporate);

// Default export for backward compatibility (admin API)
export default adminApi;
