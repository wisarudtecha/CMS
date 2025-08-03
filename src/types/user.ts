// /src/types/user.ts
// ===================================================================
// Mockup
// ===================================================================
export interface UserEntity {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  department: string;
  status: "active" | "inactive" | "suspended";
  lastLogin: string;
  createdAt: string;
  avatar?: string;
  permissions: string[];
  temporaryRoles?: TemporaryRole[];
  loginAttempts: number;
  phoneNumber?: string;
  jobTitle: string;
  roleId?: string;
  meta?: UserMeta;
  address?: UserAddress;
}

// export interface Role {
//   id: string;
//   name: string;
//   level: number;
//   color: string;
//   permissions: string[];
// }

export interface TemporaryRole {
  role: Role;
  expiresAt: string;
  reason: string;
  assignedBy: string;
}

export interface UserMetrics {
  totalUsers: number;
  activeUsers: number;
  newThisMonth: number;
  suspendedUsers: number;
  lastMonthGrowth: number;
}

export interface FilterConfig {
  roles: string[];
  departments: string[];
  status: string[];
  lastLoginDays: number;
  search: string;
}

export interface UserMeta {
  avatar?: string;
  firstName?: string;
  lastName?: string;
  fullname?: string;
  jobTitle?: string;
  location?: string;
}

export interface UserAddress {
  country?: string;
  city?: string;
  postalCode?: string;
  taxId?: string;
}

// ===================================================================
// API
// ===================================================================

export interface SystemMetadata {
  id: string;
  orgId: string;
  empId: string;
  userType: string; // Consider enum
  roleId: string;
  deptId: string;
  commId: string;
  stnId: string;
}

export interface PersonalInfo {
  title: string;
  firstName: string;
  middleName: string;
  lastName: string;
  displayName: string;
  citizenId: string;
  bod: string; // ISO Date string
  gender: string; // Consider enum
  blood: string; // Consider enum
  mobileNo: string;
  email: string;
  photo: string | null;
}

export interface Address {
  street: string;
  floor: string;
  room: string;
  building: string;
  road: string;
  subDistrict: string;
  district: string;
  province: string;
  postalCode: string;
  country: string;
  lat: string;
  lon: string;
}

export interface AuthInfo {
  username: string;
  password: string;
  activationToken: string | null;
  lastActivationRequest: string | null;
  lostPasswordRequest: string | null;
  islogin: boolean;
}

export interface TimestampInfo {
  lastLogin: string;
  createdAt: string;
  updatedAt: string;
  signupStamp: string | null;
}

export interface AuditInfo {
  createdBy: string;
  updatedBy: string;
}

export interface StatusInfo {
  active: boolean;
}

export interface Department {
  id: string;
  deptId: string;
  orgId: string;
  en: string;
  th: string;
  active: boolean;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  createdBy: string;
  updatedBy: string;
}

export interface Meta {
  photo?: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  roleName: string;
  province?: string;
  country?: string;
}

export interface Role {
  id: string;
  orgId: string;
  roleName: string;
  active: boolean;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  createdBy: string;
  updatedBy: string;
}

export interface UserProfile {
  // system: SystemMetadata;
  // personal: PersonalInfo;
  // address: Address;
  // auth: AuthInfo;
  // timestamps: TimestampInfo;
  // audit: AuditInfo;
  // status: StatusInfo;
  id: string;
  orgId: string;
  displayName: string;
  title: string;
  firstName: string;
  middleName: string;
  lastName: string;
  citizenId: string;
  bod: string; // ISO date string
  blood: string;
  gender: string; // Consider enum e.g., "1" | "2"
  mobileNo: string;
  address: string;
  photo: string | null;
  username: string;
  password: string;
  email: string;
  roleId: string;
  userType: string; // Could be enum
  empId: string;
  deptId: string;
  commId: string;
  stnId: string;
  active: boolean;
  activationToken: string | null;
  lastActivationRequest: string | null;
  lostPasswordRequest: string | null;
  signupStamp: string | null;
  islogin: boolean;
  lastLogin: string; // ISO date string
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  createdBy: string;
  updatedBy: string;
  meta?: Meta;
  permissions?: string[];
}

