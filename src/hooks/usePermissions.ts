// /src/hooks/usePermissions.ts
import { PermissionManager } from "@/utils/permissionManager";
import { useAuth } from "@/hooks/useAuth";

export const usePermissions = () => {
  const { state } = useAuth();

  return {
    user: state.user,
    permissions: state.user?.permission || [],
    
    // Permission checking methods
    hasPermission: (permission: string) => PermissionManager.hasPermission(state.user, permission),
    hasAnyPermission: (permissions: string[]) => PermissionManager.hasAnyPermission(state.user, permissions),
    hasAllPermissions: (permissions: string[]) => PermissionManager.hasAllPermissions(state.user, permissions),
    
    // Module-based permission checking
    canView: (module: string) => PermissionManager.canView(state.user, module),
    canCreate: (module: string) => PermissionManager.canCreate(state.user, module),
    canUpdate: (module: string) => PermissionManager.canUpdate(state.user, module),
    canDelete: (module: string) => PermissionManager.canDelete(state.user, module),
    
    // Get all permissions for a module
    getModulePermissions: (module: string) => PermissionManager.getModulePermissions(state.user, module),
    
    // Group permissions by module
    getGroupedPermissions: () => {
      // const role = state.user?.role;
      // return role ? PermissionManager.groupPermissionsByModule(role.permissions) : {};
      const userPermissions = state.user?.permission;
      return userPermissions ? PermissionManager.groupPermissionsByModule(userPermissions.map(permId => ({
        id: permId,
        permId,
        groupName: "",
        permName: "",
        active: true,
        createdAt: "",
        updatedAt: "",
        createdBy: "",
        updatedBy: ""
      }))) : {};
    }
  };
};
