// /src/utils/permissionManager.ts
import type { User } from "@/types/auth";
import type { Permission } from "@/types/role";

export class PermissionManager {
  // Extract permission IDs from permission objects
  static extractPermissionIds(permissions: Permission[]): string[] {
    return permissions.filter(p => p.active).map(p => p.permId);
  }

  // Check if user has specific permission
  static hasPermission(user: User | null, permissionId: string): boolean {
    if (!user || !user.permission) {
      return false;
    }
    return user.permission.includes(permissionId);
  }

  // Check if user has any of the specified permissions
  static hasAnyPermission(user: User | null, permissionIds: string[]): boolean {
    if (!user || !user.permission) {
      return false;
    }
    return permissionIds.some(permId => user.permission.includes(permId));
  }

  // Check if user has all specified permissions
  static hasAllPermissions(user: User | null, permissionIds: string[]): boolean {
    if (!user || !user.permission) return false;
    return permissionIds.every(permId => user.permission.includes(permId));
  }

  // Group permissions by module (e.g., dispatch, user, report)
  static groupPermissionsByModule(permissions: Permission[]): Record<string, Permission[]> {
    return permissions.reduce((groups, permission) => {
      const module = permission.permId.split(".")[0];
      if (!groups[module]) {
        groups[module] = [];
      }
      groups[module].push(permission);
      return groups;
    }, {} as Record<string, Permission[]>);
  }

  // Get permission level for a module (view, create, update, delete)
  static getModulePermissions(user: User | null, module: string): string[] {
    if (!user || !user.permission) {
      return [];
    }
    return user.permission.filter(permId => permId.startsWith(`${module}.`)).map(permId => permId.split(".")[1]);
  }

  // Check if user can perform CRUD operations on a module
  static canView(user: User | null, module: string): boolean {
    return this.hasPermission(user, `${module}.view`);
  }

  static canCreate(user: User | null, module: string): boolean {
    return this.hasPermission(user, `${module}.create`);
  }

  static canUpdate(user: User | null, module: string): boolean {
    return this.hasPermission(user, `${module}.update`) || this.hasPermission(user, `${module}.edit`);
  }

  static canDelete(user: User | null, module: string): boolean {
    return this.hasPermission(user, `${module}.delete`);
  }
}
