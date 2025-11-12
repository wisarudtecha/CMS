// /src/types/user.ts
import type { DropdownOption } from "@/types";
import type { Permission } from "@/types/role";

export interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
  onSuccess?: () => void;
}

export interface EnhancedSkill {
  id: string;
  orgId: string;
  skillId: string;
  en: string;
  th: string;
  category?: "technical" | "operational" | "safety" | "certification" | "soft_skill";
  level?: "basic" | "intermediate" | "advanced" | "expert";
  prerequisites?: string[];
  certificationRequired?: boolean;
  expirationPeriod?: number; // months
  active: boolean;
  icon?: string;
  color?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export interface SkillQueryParams {
  start: number;
  length: number;
}

export interface EnhancedUserSkill {
  orgId: string;
  userName: string;
  skillId: string;
  proficiencyLevel: number; // 1-5 scale
  certificationDate?: string;
  expirationDate?: string;
  lastAssessment?: string;
  assessmentScore: number;
  verifiedBy: string;
  practiceHours: number;
  status: "active" | "expired" | "pending" | "revoked";
  active: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export interface UserSkill {
  orgId: string;
  userName: string;
  skillId: string;
  th?: string;
  en?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export type Preferences = {
  popupEnabled: boolean;
  soundEnabled: boolean;
  sound: string;
  pushEnabled: boolean;
  autoDelete: boolean;
  hideRead: boolean;
  autoDeleteDays: number;
};

export interface PreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface ResetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
  username?: string;
  onSuccess?: () => void;
}

export interface Role {
  id: string;
  orgId: string;
  roleName: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
  permissions?: string[];
}

export interface TemporaryRole {
  role: Role;
  expiresAt: string;
  reason: string;
  assignedBy: string;
}

export interface SkillCategory {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  skillCount: number;
  avgProficiency: number;
}

export interface SkillMetrics {
  totalSkills: number;
  totalUserSkills: number;
  avgProficiencyScore: number;
  skillsNeedingAssessment: number;
  expiringCertifications: number;
  topPerformers: number;
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

export interface UserCreateData {
  name: string;
  email: string;
  password: string;
  role: Role;
  department: string;
  permissions?: Permission[];
}

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

export interface UserFormData {
  active: boolean;
  address: string;
  blood: string;
  bod: string;
  citizenId: string;
  commId: string;
  deptId: string;
  displayName: string;
  email: string;
  empId: string;
  firstName: string;
  gender: number | null; 
  lastName: string;
  middleName: string;
  mobileNo: string;
  orgId: string;
  password?: string;
  confirmPassword?: string;
  photo: File | string | null;
  roleId: string;
  stnId: string;
  title: string;
  userType: number | 1;
  username: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
  // [key: string]: any;
  [key: string]: unknown;
}

export interface UserFormProfile {
  id: string;
  displayName: string;
  firstName: string;
  lastName: string;
  email: string;
  mobileNo: string;
  photo: string;
  address: string | null;
  title?: string;
  middleName?: string;
  citizenId?: string;
  bod?: string;
  gender?: number;
  blood?: string;
  bio?: string;
  empId?: string;
  commId?: string;
  deptId?: string;
  stnId?: string;
  roleId?: string;
  userType?: number;
  active?: boolean;
  facebook?: string;
  twitter?: string;
  linkedin?: string;
  instagram?: string;
}

export interface DropdownData extends DropdownOption {
  commId?: string;
  deptId?: string;
  stnId?: string;
  roleName?: string;
}

export interface UserProfileContextType {
  userData: UserFormProfile | null;
  rolesData: DropdownData[];
  departmentsData: DropdownData[];
  commandsData: DropdownData[];
  stationsData: DropdownData[];
  loading: boolean;
  error: string | null;
  refetchUserData: () => Promise<void>;
}

export interface UserGroup {
  id: number;
  orgId: string;
  grpId: string;
  en: string;
  th: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export interface UserGroupQueryParams {
  start?: number;
  length?: number;
}

export interface UserMetrics {
  totalUsers: number;
  activeUsers: number;
  newThisMonth: number;
  suspendedUsers: number;
  lastMonthGrowth: number;
}

export interface UserQueryParams {
  start?: number;
  length?: number;
  role?: string;
  department?: string;
  isActive?: boolean;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface UserUpdateData {
  name?: string;
  email?: string;
  role?: Role;
  department?: string;
  permissions?: Permission[];
  isActive?: boolean;
}

export interface SystemMetadata {
  id: string;
  orgId: string;
  empId: string;
  userType: string;
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
  bod: string;
  gender: string;
  blood: string;
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

export interface UserProfile {
  id: string | number;
  orgId: string;
  displayName: string;
  title: string;
  firstName: string;
  middleName: string;
  lastName: string;
  citizenId: string;
  bod: string;
  blood: string;
  gender: string;
  mobileNo: string;
  address: string;
  photo: string | null;
  username: string;
  password: string;
  email: string;
  roleId: string;
  userType: string;
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
  lastLogin: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  createdBy: string;
  updatedBy: string;
  meta?: Meta;
  permissions?: string[];
}

export interface UserUnitInfo {
  id: string;
  displayName: string;
  title: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  gender: string;
  mobileNo: string | null;
  address: string | null;
  photo: string | null;
  username: string;
  email: string | null;
  empId: string;
  deptId: string;
  commId: string;
  stnId: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  skills: Array<Record<string, any>> | null;
  areas: Array<Record<string, any>> | null;
}

export interface UserInfoCardProps {
  userData?: UserProfile | null;
  loading?: boolean;
  error?: string | null;
}

export interface UserMetaCardProps {
  userData?: UserProfile | null;
  loading?: boolean;
  error?: string | null;
}

export interface UserOrganizationCardProps {
  userData?: UserProfile | null;
  rolesData?: DropdownData[];
  departmentsData?: DropdownData[];
  commandsData?: DropdownData[];
  stationsData?: DropdownData[];
  loading?: boolean;
  error?: string | null;
}

export interface Department {
  id: string;
  deptId: string;
  orgId: string;
  en: string;
  th: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export interface FilterConfig {
  roles: string[];
  departments: string[];
  status: string[];
  lastLoginDays: number;
  search: string;
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
