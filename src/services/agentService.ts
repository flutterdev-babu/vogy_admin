import { agentApi, adminApi } from '@/lib/api';
import { 
  ApiResponse, 
  Agent, 
  AgentRegisterRequest, 
  AgentLoginRequest, 
  AgentLoginResponse,
  CityCode,
  FarePricing,
  SetFarePricingRequest,
  Vendor,
  VendorRegisterRequest,
  Corporate,
  CorporateRegisterRequest,
  User,
  CreateUserRequest,
  CreateVehicleRequest,
  Vehicle
} from '@/types';

export const agentService = {
  // =====================
  // Agent Auth APIs
  // =====================
  
  async register(data: AgentRegisterRequest): Promise<ApiResponse<Agent>> {
    const response = await agentApi.post('/auth/register', data);
    return response.data;
  },

  async login(data: AgentLoginRequest): Promise<ApiResponse<AgentLoginResponse>> {
    const response = await agentApi.post('/auth/login', data);
    return response.data;
  },

  // =====================
  // Agent Profile APIs
  // =====================
  
  async getProfile(): Promise<ApiResponse<Agent>> {
    const response = await agentApi.get('/profile');
    return response.data;
  },

  // =====================
  // City Code APIs
  // =====================
  
  async createCityCode(code: string, cityName: string): Promise<ApiResponse<CityCode>> {
    const response = await agentApi.post('/city-codes', { code, cityName });
    return response.data;
  },

  async getCityCodes(): Promise<ApiResponse<CityCode[]>> {
    const response = await agentApi.get('/city-codes');
    return response.data;
  },

  async updateCityCode(id: string, code: string, cityName: string): Promise<ApiResponse<CityCode>> {
    const response = await agentApi.put(`/city-codes/${id}`, { code, cityName });
    return response.data;
  },

  async deleteCityCode(id: string): Promise<ApiResponse<void>> {
    const response = await agentApi.delete(`/city-codes/${id}`);
    return response.data;
  },

  // =====================
  // Pricing APIs
  // =====================
  
  async setPricing(cityCodeId: string, data: SetFarePricingRequest): Promise<ApiResponse<FarePricing>> {
    const response = await agentApi.post(`/city-codes/${cityCodeId}/pricing`, data);
    return response.data;
  },

  async getPricing(cityCodeId: string): Promise<ApiResponse<FarePricing[]>> {
    const response = await agentApi.get(`/city-codes/${cityCodeId}/pricing`);
    return response.data;
  },

  // =====================
  // Agent Data APIs
  // =====================
  
  async getVendors(): Promise<ApiResponse<Vendor[]>> {
    const response = await agentApi.get('/vendors');
    return response.data;
  },

  async createVendor(data: VendorRegisterRequest): Promise<ApiResponse<Vendor>> {
    const response = await agentApi.post('/vendors', data);
    return response.data;
  },

  async getAllAgents(search?: string): Promise<ApiResponse<Agent[]>> {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    const response = await agentApi.get(`/all-agents?${params.toString()}`);
    return response.data;
  },

  async getCorporates(): Promise<ApiResponse<Corporate[]>> {
    const response = await agentApi.get('/corporates');
    return response.data;
  },
    
  async createCorporate(data: CorporateRegisterRequest): Promise<ApiResponse<Corporate>> {
    const response = await agentApi.post('/corporates', data);
    return response.data;
  },

  // =====================
  // User/Rider Management APIs
  // =====================

  async getUsers(search?: string): Promise<ApiResponse<User[]>> {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    const response = await agentApi.get(`/users?${params.toString()}`);
    return response.data;
  },

  async createUser(data: CreateUserRequest): Promise<ApiResponse<User>> {
    const response = await agentApi.post('/users', data);
    return response.data;
  },

  // =====================
  // Vehicle Management APIs
  // =====================

  async createVehicle(data: CreateVehicleRequest): Promise<ApiResponse<Vehicle>> {
    const response = await agentApi.post('/vehicles', data);
    return response.data;
  },

  async getVehicleTypes(): Promise<ApiResponse<any[]>> {
    const response = await agentApi.get('/vehicle-types');
    return response.data;
  },

  async getPartners(): Promise<ApiResponse<any[]>> {
    const response = await agentApi.get('/partners');
    return response.data;
  },

  async createPartner(data: any): Promise<ApiResponse<any>> {
    const response = await agentApi.post('/partners', data);
    return response.data;
  },

  async getVehicles(): Promise<ApiResponse<any[]>> {
    const response = await agentApi.get('/vehicles');
    return response.data;
  },

  async assignPartnerToVehicle(partnerId: string, vehicleId: string): Promise<ApiResponse<any>> {
    const response = await agentApi.post('/partners/assign-vehicle', { partnerId, vehicleId });
    return response.data;
  },

  async createRide(data: any): Promise<ApiResponse<any>> {
    const response = await agentApi.post('/rides', data);
    return response.data;
  },

  async updateProfile(data: Partial<Agent>): Promise<ApiResponse<Agent>> {
    const response = await agentApi.put('/profile', data);
    return response.data;
  },

  // =====================
  // Admin Agent APIs
  // =====================
  
  async getAll(): Promise<ApiResponse<Agent[]>> {
    const response = await adminApi.get('/agents');
    return response.data;
  },

  async assignVendor(agentId: string, vendorId: string): Promise<ApiResponse<Agent>> {
    const response = await adminApi.post(`/agents/${agentId}/assign-vendor`, { vendorId });
    return response.data;
  },

  async assignCorporate(agentId: string, corporateId: string): Promise<ApiResponse<Agent>> {
    const response = await adminApi.post(`/agents/${agentId}/assign-corporate`, { corporateId });
    return response.data;
  },
};
