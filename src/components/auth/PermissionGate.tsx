// /src/components/auth/PermissionGate.tsx
import { useAuth } from "@/hooks/useAuth";
import { PermissionManager } from "@/utils/permissionManager";

export const PermissionGate: React.FC<{
  permission?: string;
  permissions?: string[];
  requireAny?: boolean;
  module?: string;
  action?: "view" | "create" | "update" | "delete";
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ 
  permission, 
  permissions = [], 
  requireAny = false, 
  module, 
  action = "view", 
  children, 
  fallback = null 
}) => {
  const { state } = useAuth();

  if (!state.user) {
    return <>{fallback}</>;
  }

  let hasAccess = false;

  if (module) {
    hasAccess = PermissionManager.hasPermission(state.user, `${module}.${action}`);
  }
  else if (permission) {
    hasAccess = PermissionManager.hasPermission(state.user, permission);
  }
  else if (permissions.length > 0) {
    hasAccess = requireAny 
      ? PermissionManager.hasAnyPermission(state.user, permissions)
      : PermissionManager.hasAllPermissions(state.user, permissions);
  }

  return hasAccess ? <>{children}</> : <>{fallback}</>;
};
