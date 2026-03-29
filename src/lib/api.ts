import axios, { AxiosInstance } from 'axios';

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
    const message = error.response?.data?.message || error.message;
    if (status === 503) {
      console.warn(`[API WARMUP] 503 - Server is waking up.`);
    } else {
      const url = `${error.config?.baseURL || ''}${error.config?.url || ''}`;
      const fullMessage = `[${status}] ${message} at ${url}`;
      console.error(`[API ERROR] ${fullMessage}`);
      // If we are on the landing page or anywhere with toast, show the real message
      error.message = message || `API Error ${status}: ${url}`;
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

// Ride & Payment API instances
export const rideApi = createApiInstance(`${API_BASE_URL}/ride`);
export const paymentApi = createApiInstance(`${API_BASE_URL}/payment`);
export const userApi = createApiInstance(`${API_BASE_URL}/user`);

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

// For shared APIs, try to find any valid token
const addCommonAuthInterceptor = (api: AxiosInstance) => {
  api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
      const token = 
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
