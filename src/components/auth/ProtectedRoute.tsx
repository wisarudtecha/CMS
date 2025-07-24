// /src/components/auth/ProtectedRoute.tsx
import React from "react";
import { AlertIcon } from "@/icons";
import { LoginForm } from "@/components/auth/LoginForm";
import { useAuth } from "@/hooks/useAuth";
import type { User } from "@/types/auth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: User["role"][];
  requiredPermissions?: string[];
  fallback?: React.ComponentType;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole = [],
  requiredPermissions = [],
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

  // Check role permissions
  if (requiredRole.length > 0 && state.user && !requiredRole.includes(state.user.role)) {
    return Fallback ? (
      <Fallback />
    ) : (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertIcon className="h-12 w-12 text-red-500 dark:text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Access Denied</h2>
          <p className="text-gray-600 dark:text-gray-300">You don"t have permission to access this page.</p>
        </div>
      </div>
    );
  }

  // Check specific permissions
  if (requiredPermissions.length > 0 && state.user) {
    const hasPermissions = requiredPermissions.every(permission =>
      state.user!.permissions.includes(permission)
    );

    if (!hasPermissions) {
      return Fallback ? (
        <Fallback />
      ) : (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <AlertIcon className="h-12 w-12 text-red-500 dark:text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Insufficient Permissions</h2>
            <p className="text-gray-600 dark:text-gray-300">You don"t have the required permissions for this action.</p>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
};
