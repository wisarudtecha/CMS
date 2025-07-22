// /src/types/role.ts
export interface Permission {
  id: string;
  name: string;
  description: string;
  category?: PermissionCategory;
  level: "read" | "write" | "admin" | "system";
  dependencies?: string[];
  dangerous?: boolean;
  categoryId?: string;
}

export interface PermissionCategory {
  id: string;
  name: string;
  description: string;
  // icon: React.ComponentType<any>;
  icon?: string;
  color: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  level: number;
  color: string;
  permissions: string[];
  isSystem: boolean;
  isTemplate: boolean;
  parentRole?: string;
  userCount: number;
  createdAt: string;
  lastModified: string;
  createdBy: string;
}

export interface RoleTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  permissions: string[];
  usageCount: number;
  rating: number;
}

export interface RoleHierarchy {
  role: Role;
  children: RoleHierarchy[];
  inheritedPermissions: string[];
}

export interface RoleAnalytics {
  totalRoles: number;
  activeRoles: number;
  systemRoles: number;
  customRoles: number;
  averagePermissions: number;
  // mostUsedRole: Role;
  mostUsedRole: string;
  recentChanges?: number;
}

export interface RoleMetrics {
  totalRoles: number;
  activeRoles: number;
  systemRoles: number;
  customRoles: number;
  avgPermissions: number;
  mostUsed: string;
}
