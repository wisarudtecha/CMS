// /src/components/auth/ProtectedRoute.tsx
import React
  ,
  {
    useEffect,
    useRef,
    // useState
  }
from "react";
import { AlertIcon } from "@/icons";
import { LoginForm } from "@/components/auth/LoginForm";
import { getSsoToken } from "@/config/api";
import { useAuth } from "@/hooks/useAuth";
import { useIsSystemAdmin } from "@/hooks/useIsSystemAdmin";
import { useTranslation } from "@/hooks/useTranslation";
// import { AuthService } from "@/utils/authService";
import { MAX_SSO_LOGIN_ATTEMPTS } from "@/utils/constants";
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
  const { state, login } = useAuth();
  const { t } = useTranslation();

  // const [isSystemAdmin, setIsSystemAdmin] = useState(false);
  // useEffect(() => {
  //   const fetchAuthService = async () => {
  //     setIsSystemAdmin(await AuthService.isSystemAdmin());
  //   }
  //   fetchAuthService();
  // }, [isSystemAdmin]);
  const isSystemAdmin = useIsSystemAdmin();
  const ssoToken = getSsoToken();

  // Max attempts for automatic SSO login to avoid infinite retries
  const ssoLoginAttempts = useRef(0);
  // const ssoTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!state.user && !state.isLoading && ssoToken && ssoLoginAttempts.current < MAX_SSO_LOGIN_ATTEMPTS) {
      ssoLoginAttempts.current++;
      void login({ token: ssoToken ?? undefined, rememberMe: true });
    }
  }, [state.user, state.isLoading, ssoToken, login]);

  if (state.isLoading || state.isRefreshing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-800">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-brand-200 border-t-brand-600 mb-6"></div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {state.isRefreshing ? t("auth.signin.state.is_refreshing") : t("auth.signin.state.is_loading")}
          </h2>
          <p className="text-gray-600 dark:text-gray-300">{t("auth.signin.state.wating")}</p>
        </div>
      </div>
    );
  }

  // if (!state.user || !state.token || !state.refreshToken || !state.isAuthenticated) {
  //   return <LoginForm />;
  // }

  if (!state.user || !state.token || !state.refreshToken || !state.isAuthenticated) {
    if (ssoToken) {
      // If exceeded attempts, fall back to explicit login form
      if (ssoLoginAttempts.current >= MAX_SSO_LOGIN_ATTEMPTS) {
        return <LoginForm />;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-800">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-brand-200 border-t-brand-600 mb-6"></div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {t("auth.signin.state.is_loading")}
            </h2>
            <p className="text-gray-600 dark:text-gray-300">{t("auth.signin.state.wating")}</p>
          </div>
        </div>
      );
    }

    return <LoginForm />;
  }

  // Check module-based permission (e.g., 'dispatch.view')
  if (module) {
    const modulePermission = `${module}.${action}`;
    if (!PermissionManager.hasPermission(state.user, modulePermission) && !isSystemAdmin) {
      return Fallback ? (
        <Fallback />
      ) : (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center max-w-md">
            <AlertIcon className="h-16 w-16 text-red-500 dark:text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{t("auth.permission.access_denied.title")}</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {/* You don't have permission to {action} {module} resources. */}
              {t("auth.permission.access_denied.subtitle")} {action} {module}
            </p>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {t("auth.permission.access_denied.description")}: <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{modulePermission}</code>
            </div>
          </div>
        </div>
      );
    }
  }

  // Check specific required permissions (all must be present)
  if (requiredPermissions.length > 0 && !isSystemAdmin) {
    if (!PermissionManager.hasAllPermissions(state.user, requiredPermissions) && !isSystemAdmin) {
      return Fallback ? (
        <Fallback />
      ) : (
        <div className="min-h-screen flex items-center justify-center cursor-default">
          <div className="text-center max-w-md">
            <AlertIcon className="h-16 w-16 text-red-500 dark:text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{t("auth.permission.insufficient_permissions.title")}</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {t("auth.permission.insufficient_permissions.subtitle")}
            </p>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {t("auth.permission.insufficient_permissions.description")}:
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
