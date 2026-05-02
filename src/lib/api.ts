import axios, { AxiosInstance } from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_BASE_URL) {
  throw new Error("CRITICAL: API base URL not configured");
}

// Create axios instance with common config
const createApiInstance = (baseURL: string): AxiosInstance => {
  const instance = axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  instance.interceptors.request.use((config) => {
    // Validate if request URL hits base URL
    if (config.baseURL && !config.baseURL.includes(API_BASE_URL as string)) {
      throw new Error(`CRITICAL: Request URL does not include base URL. Unauthorized external call blocked.`);
    }
    console.log(`[API REQUEST] ${config.method?.toUpperCase()} ${config.baseURL}${config.url || ''}`);
    return config;
  }, (error) => Promise.reject(error));

  instance.interceptors.response.use((response) => {
    console.log(`[API RESPONSE] ${response.status} ${response.config.baseURL}${response.config.url || ''}`);
    return response;
  }, (error) => {
    const status = error.response?.status || 'UNKNOWN';
    if (status === 503) {
      console.warn(`[API WARMUP] 503 - Server is waking up.`);
    }

    // Global Error Notification
    if (typeof window !== 'undefined' && error.response) {
      // Don't show toast for 401s that trigger redirect (handled in addAuthInterceptor)
      // and don't show for 404s on GET requests which might be intentional
      const isAuthError = error.response.status === 401;
      const isGet404 = error.config.method === 'get' && error.response.status === 404;
      
      if (!isAuthError && !isGet404) {
        const message = error.response.data?.message || error.message || 'An unexpected error occurred';
        toast.error(message, {
          id: `api-error-${error.config.url}`, // Prevent duplicate toasts for the same request
        });
      }
    } else if (typeof window !== 'undefined' && error.message === 'Network Error') {
      toast.error('Network Error: Please check if the server is running');
    }

    return Promise.reject(error);
  });

  return instance;
};

// Admin API instance
export const adminApi = createApiInstance(`${API_BASE_URL}/admin`);

// Vendor API instance
export const vendorApi = createApiInstance(`${API_BASE_URL}/vendor`);

// Partner API instance
export const partnerApi = createApiInstance(`${API_BASE_URL}/partner`);

// Rider API instance (for ride lifecycle)
export const riderApi = createApiInstance(`${API_BASE_URL}/rider`);

// Agent API instance
export const agentApi = createApiInstance(`${API_BASE_URL}/agent`);

// Corporate API instance
export const corporateApi = createApiInstance(`${API_BASE_URL}/corporate`);

// Public API instance (for city codes, etc.)
export const publicApi = createApiInstance(API_BASE_URL);

// Auth API instance (for user/partner login)
export const authApi = createApiInstance(`${API_BASE_URL}/auth`);

// Ride & Payment API instances
export const rideApi = createApiInstance(`${API_BASE_URL}/ride`);
export const paymentApi = createApiInstance(`${API_BASE_URL}/payment`);
export const userApi = createApiInstance(`${API_BASE_URL}/user`);
export const userRidesApi = createApiInstance(`${API_BASE_URL}/user/rides`);

// Token keys for different user types
export const TOKEN_KEYS = {
  admin: 'admin_token',
  vendor: 'vendor_token',
  partner: 'partner_token',
  agent: 'agent_token',
  corporate: 'corporate_token',
  user: 'user_token',
} as const;

export const USER_KEYS = {
  admin: 'admin_user',
  vendor: 'vendor_user',
  partner: 'partner_user',
  agent: 'agent_user',
  corporate: 'corporate_user',
  user: 'user_user',
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
      if (error.response?.status === 401) {
        const isLoginRequest = error.config.url?.includes('login') || error.config.url?.includes('register');
        const isAuthCredentialError = isLoginRequest && error.response?.status === 401;

        if (!isAuthCredentialError && typeof window !== 'undefined') {
          localStorage.removeItem(tokenKey);
          localStorage.removeItem(userKey);
          
          const currentPath = window.location.pathname;
          
          // Determine if we should redirect based on the token that failed and the current path
          let shouldRedirect = false;
          if (tokenKey === TOKEN_KEYS.admin && (currentPath.includes('/dashboard') || currentPath.includes('/admin'))) shouldRedirect = true;
          if (tokenKey === TOKEN_KEYS.user && currentPath.includes('/user')) shouldRedirect = true;
          if (tokenKey === TOKEN_KEYS.partner && currentPath.includes('/partner')) shouldRedirect = true;
          if (tokenKey === TOKEN_KEYS.vendor && currentPath.includes('/vendor')) shouldRedirect = true;
          if (tokenKey === TOKEN_KEYS.agent && currentPath.includes('/agent')) shouldRedirect = true;
          if (tokenKey === TOKEN_KEYS.corporate && currentPath.includes('/corporate')) shouldRedirect = true;

          // If we are on the home page or login pages, never force a redirect
          if (currentPath === '/' || currentPath.includes('/login') || currentPath.includes('/register')) {
            shouldRedirect = false;
          }
          
          if (shouldRedirect) {
            window.location.href = '/';
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
addAuthInterceptor(userApi, TOKEN_KEYS.user, USER_KEYS.user);
addAuthInterceptor(userRidesApi, TOKEN_KEYS.user, USER_KEYS.user);

// For shared APIs, try to find any valid token
const addCommonAuthInterceptor = (api: AxiosInstance) => {
  api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
      const token =
        localStorage.getItem(TOKEN_KEYS.user) ||
        localStorage.getItem(TOKEN_KEYS.agent) ||
        localStorage.getItem(TOKEN_KEYS.vendor) ||
        localStorage.getItem(TOKEN_KEYS.partner) ||
        localStorage.getItem(TOKEN_KEYS.corporate) ||
        localStorage.getItem(TOKEN_KEYS.admin);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  });
};

addCommonAuthInterceptor(publicApi);
addCommonAuthInterceptor(agentApi);
addCommonAuthInterceptor(rideApi);
addCommonAuthInterceptor(paymentApi);

// Default export for backward compatibility (admin API)
export default adminApi;
