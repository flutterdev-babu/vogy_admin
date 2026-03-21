// =====================================
// Common Types
// =====================================

export type EntityStatus = 'PENDING' | 'APPROVED' | 'SUSPENDED';
export type EntityVerificationStatus = 'VERIFIED' | 'REJECTED' | 'UNVERIFIED' | 'PENDING' | 'UNDER_REVIEW';
export type EntityActiveStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'BANNED';
export type Gender = 'MALE' | 'FEMALE' | 'OTHER';
export type FuelType = 'PETROL' | 'DIESEL' | 'CNG' | 'ELECTRIC' | 'HYBRID';

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface Coupon {
  id: string;
  agentId: string;
  couponCode: string;
  discountValue: number;
  minBookingAmount: number;
  maxDiscountAmount: number;
  validFrom: string;
  validTo: string;
  isActive: boolean;
  agent?: Agent;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserRequest {
  name: string;
  phone: string;
  email?: string;
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

export interface PermissionOption {
  code: string;
  label: string;
}

export interface Admin {
  id: string;
  name: string;
  email: string;
  role: 'SUPERADMIN' | 'SUBADMIN';
  permissions: string[];
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
  status: EntityActiveStatus;
  verificationStatus: EntityVerificationStatus;
  cityCode?: CityCode;
  type?: 'INDIVIDUAL' | 'BUSINESS';
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
  password: string;
  cityCodeId: string;
  email?: string;
  type?: 'INDIVIDUAL' | 'BUSINESS';
  gstNumber?: string;
  panNumber?: string;
  ccMobile?: string;
  accountNumber?: string;
  officeAddress?: string;
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
  aadhaarNumber?: string; // Standardized with API
  licenseNumber?: string;
  licenseImage?: string;
  licenseExpiryDate?: string;
  panNumber?: string;
  panImage?: string; // Existing
  panCardPhoto?: string; // User example
  aadhaarImage?: string; // Existing
  aadhaarFrontPhoto?: string; // User example
  aadhaarBackPhoto?: string; // User example
  hasLicense?: boolean;
  // Banking Details
  accountNumber?: string;
  bankName?: string;
  bankAccountNumber?: string;
  ifscCode?: string;
  accountHolderName?: string; // User example
  cancelledChequePhoto?: string; // User example
  upiId?: string;
  rating?: number;
  totalEarnings?: number;
  vehicleNumber?: string;
  vehicleModel?: string;
  profileImage?: string;
  rides?: Ride[];
  status: EntityActiveStatus;
  verificationStatus: EntityVerificationStatus; // Standardized as per API v2.1
  isOnline: boolean;
  currentLat?: number;
  currentLng?: number;
  vehicle?: Vehicle; // Existing vehicle relation
  // Vendor association
  vendorId?: string;
  vendorCustomId?: string;
  vendor?: Vendor;
  // Own Vehicle Details (Owner-Driver)
  hasOwnVehicle: boolean;
  ownVehicleNumber?: string;
  ownVehicleModel?: string;
  ownVehicleTypeId?: string;
  ownVehicleType?: VehicleTypeSummary; // Added per API v2 docs
  cityCode?: CityCode;
  
  // New attachments list
  attachments?: Array<{
    id: string;
    fileType: string;
    fileUrl: string;
    status: string;
    verificationStatus: string;
  }>;
  _count?: {
    rides: number;
    [key: string]: number;
  };

  createdAt: string;
  updatedAt?: string;
}

export interface PartnerRegisterRequest {
  firstName: string;
  lastName: string;
  phone: string;
  password: string;
  cityCodeId: string;
  email?: string;
  gender?: Gender;
  dateOfBirth?: string;
  localAddress?: string;
  panNumber?: string;
  panImage?: string;
  aadhaarNumber?: string;
  aadhaarImage?: string;
  licenseNumber?: string;
  licenseImage?: string;
  hasLicense?: boolean;
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  licenseExpiryDate?: string;
  accountHolderName?: string;
  cancelledChequePhoto?: string;
  panCardPhoto?: string;
  aadhaarFrontPhoto?: string;
  aadhaarBackPhoto?: string;
  verificationStatus?: string;
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
  customId: string;
  name: string;
  phone: string;
  email?: string;
  agentCode: string;
  coupons?: Coupon[];
  createdAt: string;
  updatedAt?: string;
}

export interface AgentRegisterRequest {
  name: string;
  phone: string;
  email?: string;
  password: string;
  cityCodeId: string;
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
// Corporate Employee Types
// =====================================

export interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  status: 'ACTIVE' | 'INACTIVE';
  spendingLimit: number;
  createdAt: string;
}

export interface CreateEmployeeRequest {
  name: string;
  email: string;
  department: string;
  spendingLimit: number;
}

export interface CorporateBookingRequest {
  pickupLat: number;
  pickupLng: number;
  pickupAddress: string;
  dropLat: number;
  dropLng: number;
  dropAddress: string;
  vehicleTypeId: string;
  scheduledDateTime?: string;
  bookingNotes?: string;
  employeeId: string;
  guestName?: string;
  guestPhone?: string;
}

// =====================================
// Corporate Types
// =====================================

export interface Corporate {
  id: string;
  customId: string;
  companyName: string;
  contactPerson: string;
  phone: string;
  email: string;
  status: EntityStatus;
  creditLimit: number;
  currentBalance: number;
  cityCode?: CityCode;
  
  // Basic & Location Info
  state?: string;
  area?: string;
  
  // Detailed Addresses
  headOfficeAddress?: string;
  branchOfficeAddress?: string;
  address?: string; // Kept for backward compatibility
  
  // Tax & Legal
  panNumber?: string;
  gstNumber?: string;
  comments?: string;
  
  // Owner Details
  ownerName?: string;
  ownerPhone?: string;
  ownerEmail?: string;
  ownerAadhaar?: string;
  ownerPan?: string;

  // Point of Contacts
  primaryContactName?: string;
  primaryContactEmail?: string;
  primaryContactNumber?: string;
  secondaryContactName?: string;
  secondaryContactNumber?: string;
  secondaryContactEmail?: string;
  financeContactName?: string;
  financeContactNumber?: string;
  financeContactEmail?: string;
  
  // Bank Information 
  accountHolderName?: string;
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  branchAddress?: string;
  upiLinkedNumber?: string;

  createdAt: string;
  updatedAt?: string;
}

export interface CorporateRegisterRequest {
  companyName: string;
  contactPerson: string;
  phone: string;
  email: string;
  password?: string;
  cityCodeId?: string;
  
  // Basic & Location Info
  state?: string;
  area?: string;
  
  // Detailed Addresses
  headOfficeAddress?: string;
  branchOfficeAddress?: string;
  address?: string; // Kept for backward compatibility
  
  // Tax & Legal
  panNumber?: string;
  gstNumber?: string;
  comments?: string;
  
  // Owner Details
  ownerName?: string;
  ownerPhone?: string;
  ownerEmail?: string;
  ownerAadhaar?: string;
  ownerPan?: string;

  // Point of Contacts
  primaryContactName?: string;
  primaryContactEmail?: string;
  primaryContactNumber?: string;
  secondaryContactName?: string;
  secondaryContactNumber?: string;
  secondaryContactEmail?: string;
  financeContactName?: string;
  financeContactNumber?: string;
  financeContactEmail?: string;
  
  // Bank Information 
  accountHolderName?: string;
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  branchAddress?: string;
  upiLinkedNumber?: string;
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
  status: EntityActiveStatus;
  verificationStatus: EntityVerificationStatus;
  // New Fields
  color?: string;
  fuelType?: FuelType;
  chassisNumber?: string;
  rcNumber?: string;
  rcImage?: string;
  insuranceNumber?: string;
  insuranceExpiryDate?: string;
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
  cityCodeId: string;
  fuelType?: FuelType;
  color?: string;
  rcNumber?: string;
  rcImage?: string;
  chassisNumber?: string;
  insuranceNumber?: string;
  insuranceExpiryDate?: string;
  vendorId?: string;
  vendorCustomId?: string;
  partnerId?: string;
  partnerCustomId?: string;
}

export interface VendorSummary {
  id: string;
  customId: string;
  name: string;
  companyName?: string;
  email?: string;
  phone?: string;
  ccMobile?: string;
  gstNumber?: string;
  panNumber?: string;
  officeAddress?: string;
  address?: string;
  primaryNumber?: string;
  secondaryNumber?: string;
  ownerContact?: string;
  officeLandline?: string;
}

export interface PartnerSummary {
  id: string;
  customId: string;
  name: string;
  phone?: string;
  email?: string;
  gender?: Gender;
  dateOfBirth?: string;
  localAddress?: string;
  permanentAddress?: string;
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
  paymentMode: 'CASH' | 'UPI' | 'CARD' | 'ONLINE' | 'CREDIT';
  paymentStatus: 'PENDING' | 'COMPLETED' | 'FAILED';
  transactionId?: string;
  notes?: string;
  createdAt: string;
}

export interface RecordPaymentRequest {
  corporateId: string;
  amount: number;
  paymentMode: 'CASH' | 'UPI' | 'CARD' | 'ONLINE' | 'CREDIT';
  transactionId?: string;
  notes?: string;
}

// =====================================
// Pricing Config Types
// =====================================

export interface PricingConfig {
  id: string;
  baseFare: number;
  partnerPercentage: number;
  appCommission: number;
  isActive: boolean;
  createdAt: string;
}

export interface UpdatePricingConfigRequest {
  baseFare?: number;
  partnerPercentage: number;
  appCommission: number;
}

// =====================================
// Vehicle Pricing Group Types
// =====================================

export interface VehiclePricingGroup {
  id: string;
  vehicleTypeId: string;
  vehicleType?: VehicleType;
  name?: string;
  baseKm: number;
  baseFare: number;
  perKmPrice: number;
  cityCodeIds: string[];
  cityCodes?: CityCode[];
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateVehiclePricingGroupRequest {
  vehicleTypeId: string;
  name?: string;
  baseKm?: number;
  baseFare?: number;
  perKmPrice: number;
  cityCodeIds: string[];
}

export interface UpdateVehiclePricingGroupRequest {
  name?: string;
  baseKm?: number;
  baseFare?: number;
  perKmPrice?: number;
  cityCodeIds?: string[];
  isActive?: boolean;
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

export interface UpdateUserRequest {
  name?: string;
  phone?: string;
  email?: string;
}

// Rider alias for backward compatibility (merged into Partner)
export type Rider = Partner;

// =====================================
// Ride Types
// =====================================

export type RideStatus = 'REQUESTED' | 'UPCOMING' | 'INITIATED' | 'SCHEDULED' | 'ASSIGNED' | 'ARRIVED' | 'STARTED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED' | 'FUTURE';

export interface Ride {
  id: string;
  customId: string;
  status: RideStatus;
  rideType?: string; // New field from v2 API
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
  partnerEarnings: number;
  riderEarnings: number; // For backward compatibility/consistency
  commission: number;
  userOtp?: string;
  otp?: string; // New field as per Admin OTP retrieval
  startTime?: string;
  endTime?: string;
  acceptedAt?: string;
  arrivedAt?: string;
  isManualBooking: boolean;
  scheduledDateTime?: string;
  bookingNotes?: string;
  serviceType?: string;
  paymentMode?: string;
  paymentStatus?: string; // New field from v2 API
  user: UserSummary;
  partner?: PartnerSummary;
  vendor?: VendorSummary; // Expanded vendor field support
  corporate?: any; // New corporate reference support
  vehicle?: any; // Expanded full vehicle support
  vehicleType: VehicleTypeSummary;
  couponCode?: string; // Agent discount code
  agentCode?: string; // Original agent code reference
  discountAmount?: number; // Calculated discount value
  createdAt: string;
}


export interface ValidateCouponRequest {
  couponCode: string;
  cityCodeId: string;
  totalFare: number;
}

export interface ValidateCouponResponse {
  couponId: string;
  discountAmount: number;
  couponCode: string;
}

export interface RideSummary {
  id: string;
  status: RideStatus;
  totalFare: number;
  partnerEarnings?: number;
  createdAt: string;
}

export interface UserSummary {
  id: string;
  name: string;
  phone: string;
  email: string;
  uniqueOtp?: string;
}

export interface PartnerSummary {
  id: string;
  customId: string;
  name: string;
  phone?: string;
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
  partnerId?: string;
  startDate?: string;
  endDate?: string;
}

export interface VendorFilters {
  status?: EntityActiveStatus;
  verificationStatus?: EntityVerificationStatus;
  search?: string;
}

export interface PartnerFilters {
  status?: EntityActiveStatus;
  verificationStatus?: EntityVerificationStatus;
  isOnline?: boolean;
  search?: string;
}

export interface VehicleFilters {
  vendorId?: string;
  partnerId?: string;
  status?: EntityActiveStatus;
  verificationStatus?: EntityVerificationStatus;
  search?: string;
}

// =====================================
// Dashboard Response Types
// =====================================

// --- Vendor Dashboard ---
export interface VendorDashboardData {
  vehicles: { total: number; available: number; inUse: number };
  partners: { total: number; online: number; offline: number };
  rides: { total: number; completed: number; cancelled: number; active: number; today: number };
  revenue: { total: number; earnings: number; commission: number; today: number };
}

export interface VendorAttachment {
  id: string;
  vendorId: string;
  partner: {
    id: string;
    customId: string;
    name: string;
    phone: string;
    status: EntityActiveStatus;
    verificationStatus: EntityVerificationStatus;
    isOnline: boolean;
  };
  vehicle: {
    id: string;
    customId: string;
    registrationNumber: string;
    vehicleModel: string;
    isAvailable: boolean;
    vehicleType: VehicleTypeSummary;
  };
  createdAt: string;
  status: string;
  assignedAt: string;
}

export interface VendorEarningsData {
  summary: {
    totalRevenue: number;
    vendorEarnings: number;
    vogyCommission: number;
    rideCount: number;
  };
  breakdown: Array<{
    date: string;
    partnerId: string;
    vehicleId: string;
    totalFare: number;
    vogyCommission: number;
    vendorEarnings: number;
  }>;
}

// --- Partner Dashboard ---
export interface PartnerDashboardData {
  status: { isOnline: boolean; rating: number };
  rides: { total: number; completed: number; cancelled: number; active: number; today: number; completionRate: string };
  earnings: { total: number; sessionEarnings: number; totalFare: number; todayEarnings: number; todayFare: number };
  assignedVehicle: {
    id: string;
    customId: string;
    registrationNumber: string;
    vehicleModel: string;
    vehicleType: { displayName: string; category: string };
  } | null;
}

export interface PartnerVehicleData {
  hasOwnVehicle: boolean;
  ownVehicle: Vehicle | null;
  assignedVehicle: {
    id: string;
    customId: string;
    registrationNumber: string;
    vehicleModel: string;
    status: string;
    verificationStatus?: string;
    rcNumber?: string;
    rcPhoto?: string;
    chassisNumber?: string;
    insuranceNumber?: string;
    insurancePhoto?: string;
    insuranceExpiryDate?: string;
    vehicleType: { id?: string; displayName: string; category: string; name?: string; pricePerKm?: number; baseFare?: number; };
    vendor: { id: string; customId: string; name: string; companyName: string; phone: string; email?: string; address?: string; };
    attachments?: Array<{
      id: string;
      fileType: string;
      fileUrl: string;
      status: string;
      verificationStatus: string;
    }>;
  } | null;
}

export interface PartnerEarningsData {
  total: number;
  totalFare: number;
  sessionEarnings: number;
  todayEarnings: number;
  recentRides: Array<{
    rideId: string;
    date: string;
    totalFare: number;
    commission: number;
    earning: number;
  }>;
  byPaymentMode: Array<{ mode: string; count: number; earnings: number }>;
  dailyBreakdown: Array<{ date: string; earnings: number; rides: number }>;
}

// --- Admin Dashboard ---
export interface AdminDashboardData {
  entities: { 
    users: number; vendors: number; partners: number; vehicles: number; 
    agents: number; corporates: number; onlinePartners: number;
  };
  rides: { total: number; completed: number; active: number; today: number };
  revenue: { total: number; partnerEarnings: number; commission: number; todayRevenue: number; todayCommission: number };
  todayNewUsers: number;
}

export interface AdminRevenueAnalytics {
  byPaymentMode: Array<{ mode: string; count: number; revenue: number; commission: number }>;
  dailyRevenue: Array<{ date: string; revenue: number; commission: number; rides: number }>;
}

export interface AdminRideAnalytics {
  statusDistribution: Array<{ status: string; count: number }>;
  byVehicleType: Array<{ vehicleTypeId: string; vehicleType: { displayName: string; category: string }; count: number; revenue: number }>;
  bookingType: { manual: number; app: number };
}

export interface AdminEntityAnalytics {
  vendors: Array<{ status: string; count: number }>;
  partners: Array<{ status: string; count: number }>;
  corporates: Array<{ status: string; count: number }>;
}

export interface AdminRecentActivity {
  recentRides: Array<{ id: string; customId: string; status: RideStatus; totalFare: number; createdAt: string; user: { name: string }; partner: { name: string } }>;
  recentVendors: Array<{ id: string; customId: string; name: string; companyName: string; status: string; createdAt: string }>;
  recentPartners: Array<{ id: string; customId: string; name: string; status: string; createdAt: string }>;
  recentUsers: Array<{ id: string; name: string; phone: string; createdAt: string }>;
}

export interface CancellationAnalytics {
  date: string;
  count: number;
  byType: Record<string, number>;
}

export interface AuditTimelineItem {
  id: string;
  userName: string;
  userRole: string;
  action: string;
  module: string;
  description: string;
  createdAt: string;
}

// --- Attachment Governance ---
export type AttachmentStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';

export interface Attachment {
  id: string;
  customId: string;
  vendor: VendorSummary;
  cityCode?: string;
  partner: PartnerSummary;
  vehicle: Vehicle;
  status: AttachmentStatus;
  verificationStatus: EntityVerificationStatus;
  createdAt: string;
  updatedAt: string;
  verifiedAt?: string;
}

export interface CreateAttachmentRequest {
  vendorCustomId: string;
  partnerCustomId: string;
  vehicleCustomId: string;
  cityCode: string;
  status?: AttachmentStatus;
}

export interface VerifyAttachmentRequest {
  status: 'VERIFIED' | 'REJECTED' | 'UNVERIFIED';
  notes?: string;
}

export interface UpdateStatusRequest {
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'BANNED';
}

// --- User Dashboard ---
export interface UserRideSummary {
  totalRides: number;
  completedRides: number;
  cancelledRides: number;
  inProgress: number;
  totalSpent: number;
  averageFare: number;
}

export interface UserActiveRide {
  id: string;
  customId: string;
  status: RideStatus;
  pickupAddress: string;
  dropAddress: string;
  totalFare: number;
  partner: {
    id: string;
    customId: string;
    name: string;
    phone: string;
    profileImage: string;
    rating: number;
    currentLat: number;
    currentLng: number;
    isOnline: boolean;
  };
  vehicle: { registrationNumber: string; vehicleModel: string };
  vehicleType: { displayName: string; category: string };
}

export interface UserSpendSummary {
  byPaymentMode: Array<{ mode: string; count: number; amount: number }>;
  byVehicleType: Array<{ vehicleTypeId: string; vehicleType: { displayName: string; category: string }; count: number; amount: number }>;
  dailySpend: Array<{ date: string; spent: number; rides: number }>;
}
