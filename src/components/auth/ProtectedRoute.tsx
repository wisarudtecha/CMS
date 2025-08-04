// /src/components/auth/ProtectedRoute.tsx
import React from "react";
import { AlertIcon } from "@/icons";
import { LoginForm } from "@/components/auth/LoginForm";
import { useAuth } from "@/hooks/useAuth";
import { PermissionManager } from "@/utils/permissionManager";
import type {
  ProtectedRouteProps,
  // User
} from "@/types/auth";

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  // requiredRole = [],
  requiredPermissions = [],
  // requireAnyPermission = [],
  module,
  action = "view",
  fallback: Fallback
}) => {
  const { state } = useAuth();

  if (state.isLoading || state.isRefreshing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-800">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-brand-200 border-t-brand-600 mb-6"></div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {state.isRefreshing ? "Refreshing session..." : "Authenticating..."}
          </h2>
          <p className="text-gray-600 dark:text-gray-300">Please wait</p>
        </div>
      </div>
    );
  }

  if (!state.isAuthenticated) {
    return <LoginForm />;
  }

  // Check module-based permission (e.g., 'dispatch.view')
  if (module) {
    const modulePermission = `${module}.${action}`;
    if (!PermissionManager.hasPermission(state.user, modulePermission)) {
      return Fallback ? (
        <Fallback />
      ) : (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center max-w-md">
            <AlertIcon className="h-16 w-16 text-red-500 dark:text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Access Denied</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              You don't have permission to {action} {module} resources.
            </p>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Required permission: <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{modulePermission}</code>
            </div>
          </div>
        </div>
      );
    }
  }

  // Check specific required permissions (all must be present)
  if (requiredPermissions.length > 0) {
    if (!PermissionManager.hasAllPermissions(state.user, requiredPermissions)) {
      return Fallback ? (
        <Fallback />
      ) : (
        <div className="min-h-screen flex items-center justify-center cursor-default">
          <div className="text-center max-w-md">
            <AlertIcon className="h-16 w-16 text-red-500 dark:text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Insufficient Permissions</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              You don't have all the required permissions for this action.
            </p>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Required permissions:
              <div className="bg-gray-200 dark:bg-gray-700 p-2 rounded mt-2">
                {requiredPermissions.map(perm => (
                  <div key={perm} className="font-mono text-xs">
                    <span className={PermissionManager.hasPermission(state.user, perm) ? 'text-green-600 dark:text-green-300' : 'text-red-600 dark:text-red-300'}>
                      {PermissionManager.hasPermission(state.user, perm) ? '✓' : '✗'}
                    </span> {perm}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      );
    }
  }

  // Check role permissions
  // if (requiredRole.length > 0 && state.user && !requiredRole.includes(state.user.role)) {
  //   return Fallback ? (
  //     <Fallback />
  //   ) : (
  //     <div className="min-h-screen flex items-center justify-center">
  //       <div className="text-center">
  //         <AlertIcon className="h-12 w-12 text-red-500 dark:text-red-400 mx-auto mb-4" />
  //         <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Access Denied</h2>
  //         <p className="text-gray-600 dark:text-gray-300">You don"t have permission to access this page.</p>
  //       </div>
  //     </div>
  //   );
  // }

  // Check specific permissions
  // if (requiredPermissions.length > 0 && state.user) {
  //   const hasPermissions = requiredPermissions.every(permission =>
  //     state.user!.permissions.includes(permission)
  //   );
  //   if (!hasPermissions) {
  //     return Fallback ? (
  //       <Fallback />
  //     ) : (
  //       <div className="min-h-screen flex items-center justify-center">
  //         <div className="text-center">
  //           <AlertIcon className="h-12 w-12 text-red-500 dark:text-red-400 mx-auto mb-4" />
  //           <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Insufficient Permissions</h2>
  //           <p className="text-gray-600 dark:text-gray-300">You don"t have the required permissions for this action.</p>
  //         </div>
  //       </div>
  //     );
  //   }
  // }

  return <>{children}</>;
};
