// /src/types/role.ts
export interface Permission {
  id: string;
  groupName: string;
  permId: string;
  permName: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

// export interface PermissionCategory {
//   id: string;
//   name: string;
//   description: string;
//   // icon: React.ComponentType<any>;
//   icon?: string;
//   color: string;
// }

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

export interface RoleHierarchy {
  role: Role;
  children: RoleHierarchy[];
  inheritedPermissions: string[];
}

export interface RoleMetrics {
  totalRoles: number;
  activeRoles: number;
  systemRoles: number;
  customRoles: number;
  avgPermissions: number;
  mostUsed: string;
}

export interface RolePermission {
  id: number;
  orgId: string;
  roleId: string;
  permId: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

// export interface RoleTemplate {
//   id: string;
//   name: string;
//   description: string;
//   category: string;
//   permissions: string[];
//   usageCount: number;
//   rating: number;
// }

export interface LoadingStates {
  roles: boolean;
  permissions: boolean;
  analytics: boolean;
  permissionUpdate: string | null;
  roleCreate: boolean;
  roleUpdate: boolean;
  roleDelete: boolean;
}
