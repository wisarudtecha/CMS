// /src/types/user.ts
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

export interface Role {
  id: string;
  name: string;
  level: number;
  color: string;
  permissions: string[];
}

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
