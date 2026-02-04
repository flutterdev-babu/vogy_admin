// =====================================
// Common Types
// =====================================

export type EntityStatus = 'PENDING' | 'APPROVED' | 'SUSPENDED';
export type Gender = 'MALE' | 'FEMALE' | 'OTHER';
export type FuelType = 'PETROL' | 'DIESEL' | 'CNG' | 'ELECTRIC' | 'HYBRID';

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

// =====================================
// City Code Types
// =====================================

export interface CityCode {
  id: string;
  code: string;
  cityName: string;
}

// =====================================
// Admin Types
// =====================================

export interface Admin {
  id: string;
  name: string;
  email: string;
  role: 'SUPERADMIN' | 'SUBADMIN';
  createdAt: string;
}

export interface LoginResponse {
  message: string;
  token: string;
  admin: Admin;
}

// =====================================
// Vendor Types
// =====================================

export interface Vendor {
  id: string;
  customId: string;
  name: string;
  companyName: string;
  phone: string;
  email?: string;
  address?: string;
  status: EntityStatus;
  cityCode?: CityCode;
  // Contact Details
  gstNumber?: string;
  panNumber?: string;
  ccMobile?: string;
  primaryNumber?: string;
  secondaryNumber?: string;
  ownerContact?: string;
  officeLandline?: string;
  officeAddress?: string;
  // Banking Details
  accountNumber?: string;
  bankName?: string;
  ifscCode?: string;
  accountHolderName?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface VendorRegisterRequest {
  name: string;
  companyName: string;
  phone: string;
  email?: string;
  password: string;
  address?: string;
  cityCodeId?: string;
  // Contact Details
  gstNumber?: string;
  panNumber?: string;
  ccMobile?: string;
  primaryNumber?: string;
  secondaryNumber?: string;
  ownerContact?: string;
  officeLandline?: string;
  officeAddress?: string;
  // Banking Details
  accountNumber?: string;
  bankName?: string;
  ifscCode?: string;
  accountHolderName?: string;
}

export interface VendorLoginRequest {
  phone: string;
  password: string;
}

export interface VendorLoginResponse {
  message: string;
  token: string;
  vendor: Vendor;
}

export interface VendorAnalytics {
  totalVehicles: number;
  activePartners: number;
  totalRides: number;
  completedRides: number;
  totalEarnings: number;
}

// =====================================
// Partner Types
// =====================================

export interface Partner {
  id: string;
  customId: string;
  name: string;
  phone: string;
  email?: string;
  // Personal Details
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  gender?: Gender;
  localAddress?: string;
  permanentAddress?: string;
  aadharNumber?: string;
  licenseNumber?: string;
  licenseImage?: string;
  // Banking Details
  bankAccountNumber?: string;
  upiId?: string;
  rating?: number;
  status: EntityStatus;
  isOnline: boolean;
  currentLat?: number;
  currentLng?: number;
  vehicle?: Vehicle;
  cityCode?: CityCode;
  createdAt: string;
  updatedAt?: string;
}

export interface PartnerRegisterRequest {
  name: string;
  phone: string;
  email?: string;
  password: string;
  cityCodeId?: string;
  // Personal Details
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  gender?: Gender;
  localAddress?: string;
  permanentAddress?: string;
  aadharNumber?: string;
  licenseNumber?: string;
  licenseImage?: string;
  // Banking Details
  bankAccountNumber?: string;
  upiId?: string;
}

export interface PartnerLoginRequest {
  phone: string;
  password: string;
}

export interface PartnerLoginResponse {
  message: string;
  token: string;
  partner: Partner;
}

// =====================================
// Agent Types
// =====================================

export interface Agent {
  id: string;
  name: string;
  phone: string;
  email?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface AgentRegisterRequest {
  name: string;
  phone: string;
  email?: string;
  password: string;
}

export interface AgentLoginRequest {
  phone: string;
  password: string;
}

export interface AgentLoginResponse {
  message: string;
  token: string;
  agent: Agent;
}

export interface FarePricing {
  id: string;
  vehicleTypeId: string;
  vehicleType?: VehicleType;
  baseKm: number;
  baseFare: number;
  perKmAfterBase: number;
  cityCodeId: string;
  cityCode?: CityCode;
}

export interface SetFarePricingRequest {
  vehicleTypeId: string;
  baseKm: number;
  baseFare: number;
  perKmAfterBase: number;
}

// =====================================
// Corporate Types
// =====================================

export interface Corporate {
  id: string;
  customId?: string;
  companyName: string;
  contactPerson: string;
  phone: string;
  email: string;
  address?: string;
  gstNumber?: string;
  status: EntityStatus;
  creditLimit: number;
  currentBalance: number;
  cityCode?: CityCode;
  createdAt: string;
  updatedAt?: string;
}

export interface CorporateRegisterRequest {
  companyName: string;
  contactPerson: string;
  phone: string;
  email: string;
  password: string;
  address?: string;
  gstNumber?: string;
  cityCodeId?: string;
}

export interface CorporateLoginRequest {
  email: string;
  password: string;
}

export interface CorporateLoginResponse {
  message: string;
  token: string;
  corporate: Corporate;
}

export interface BillingSummary {
  totalBilled: number;
  totalPaid: number;
  outstanding: number;
  lastBillingDate?: string;
  lastPaymentDate?: string;
}

// =====================================
// Vehicle Types
// =====================================

export interface VehicleType {
  id: string;
  category: 'BIKE' | 'AUTO' | 'CAR';
  name: string;
  displayName: string;
  pricePerKm: number;
  baseFare: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateVehicleTypeRequest {
  category: 'BIKE' | 'AUTO' | 'CAR';
  name: string;
  displayName: string;
  pricePerKm: number;
  baseFare?: number;
}

export interface UpdateVehicleTypeRequest {
  displayName?: string;
  pricePerKm?: number;
  baseFare?: number;
  isActive?: boolean;
}

// =====================================
// Vehicle (Physical Vehicle) Types
// =====================================

export interface Vehicle {
  id: string;
  customId: string;
  registrationNumber: string;
  vehicleModel: string;
  vehicleType: VehicleType;
  vendor: VendorSummary;
  partner?: PartnerSummary;
  cityCode: CityCode;
  isActive: boolean;
  // New Fields
  color?: string;
  fuelType?: FuelType;
  seatingCapacity?: number;
  rtoTaxExpiryDate?: string;
  speedGovernor?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateVehicleRequest {
  registrationNumber: string;
  vehicleModel: string;
  vehicleTypeId: string;
  vendorId: string;
  partnerId: string;
  cityCodeId: string;
  // New Fields
  color?: string;
  fuelType?: FuelType;
  seatingCapacity?: number;
  rtoTaxExpiryDate?: string;
  speedGovernor?: boolean;
}

export interface VendorSummary {
  id: string;
  customId: string;
  name: string;
  companyName?: string;
}

export interface PartnerSummary {
  id: string;
  customId: string;
  name: string;
  phone?: string;
}

// =====================================
// Billing & Payment Types
// =====================================

export interface Billing {
  id: string;
  corporate: CorporateSummary;
  billingPeriodStart: string;
  billingPeriodEnd: string;
  totalAmount: number;
  paidAmount: number;
  status: 'PENDING' | 'PARTIAL' | 'PAID';
  createdAt: string;
}

export interface CorporateSummary {
  id: string;
  companyName: string;
  contactPerson: string;
}

export interface GenerateBillingRequest {
  corporateId: string;
  billingPeriodStart: string;
  billingPeriodEnd: string;
}

export interface Payment {
  id: string;
  corporate: CorporateSummary;
  amount: number;
  paymentMode: 'CASH' | 'UPI' | 'CARD' | 'CREDIT';
  transactionId?: string;
  notes?: string;
  createdAt: string;
}

export interface RecordPaymentRequest {
  corporateId: string;
  amount: number;
  paymentMode: 'CASH' | 'UPI' | 'CARD' | 'CREDIT';
  transactionId?: string;
  notes?: string;
}

// =====================================
// Pricing Config Types
// =====================================

export interface PricingConfig {
  id: string;
  baseFare: number;
  riderPercentage: number;
  appCommission: number;
  isActive: boolean;
  createdAt: string;
}

export interface UpdatePricingConfigRequest {
  baseFare?: number;
  riderPercentage: number;
  appCommission: number;
}

// =====================================
// User Types
// =====================================

export interface User {
  id: string;
  name: string;
  phone: string;
  email: string;
  profileImage?: string;
  uniqueOtp: string;
  createdAt: string;
  updatedAt: string;
  rides?: RideSummary[];
}

export interface CreateUserRequest {
  name: string;
  phone: string;
  email?: string;
  profileImage?: string;
}

// =====================================
// Rider/Captain Types
// =====================================

export interface Rider {
  id: string;
  name: string;
  phone: string;
  email: string;
  profileImage?: string;
  aadharNumber?: string;
  licenseNumber?: string;
  licenseImage?: string;
  vehicleNumber: string;
  vehicleModel: string;
  vehicleTypeId?: string;
  isOnline: boolean;
  currentLat?: number;
  currentLng?: number;
  rating: number;
  totalEarnings: number;
  createdAt: string;
  rides?: RideSummary[];
}

// =====================================
// Ride Types
// =====================================

export type RideStatus = 'PENDING' | 'SCHEDULED' | 'ACCEPTED' | 'ARRIVED' | 'STARTED' | 'COMPLETED' | 'CANCELLED';

export interface Ride {
  id: string;
  status: RideStatus;
  pickupLat: number;
  pickupLng: number;
  pickupAddress: string;
  dropLat: number;
  dropLng: number;
  dropAddress: string;
  distanceKm: number;
  baseFare: number;
  perKmPrice: number;
  totalFare: number;
  riderEarnings: number;
  commission: number;
  userOtp?: string;
  startTime?: string;
  endTime?: string;
  acceptedAt?: string;
  arrivedAt?: string;
  isManualBooking: boolean;
  scheduledDateTime?: string;
  bookingNotes?: string;
  user: UserSummary;
  rider?: RiderSummary;
  vehicleType: VehicleTypeSummary;
  createdAt: string;
}

export interface RideSummary {
  id: string;
  status: RideStatus;
  totalFare: number;
  riderEarnings?: number;
  createdAt: string;
}

export interface UserSummary {
  id: string;
  name: string;
  phone: string;
  email: string;
}

export interface RiderSummary {
  id: string;
  name: string;
  phone: string;
  email?: string;
  profileImage?: string;
  vehicleNumber?: string;
  vehicleModel?: string;
  rating?: number;
}

export interface VehicleTypeSummary {
  id: string;
  category: 'BIKE' | 'AUTO' | 'CAR';
  name: string;
  displayName: string;
  pricePerKm: number;
}

// =====================================
// Filter Types
// =====================================

export interface RideFilters {
  status?: RideStatus;
  vehicleType?: string;
  userId?: string;
  riderId?: string;
  startDate?: string;
  endDate?: string;
}

export interface VendorFilters {
  status?: EntityStatus;
  search?: string;
}

export interface PartnerFilters {
  status?: EntityStatus;
  isOnline?: boolean;
  search?: string;
}

export interface VehicleFilters {
  vendorId?: string;
  isActive?: boolean;
  search?: string;
}
