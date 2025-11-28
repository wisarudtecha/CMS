// /src/pages/Admin/UserManagement.tsx
/**
 * @fileoverview Code dupplicated from Case History.
 * 
 * @description
 * React TypeScript component for listing users with navigation functionality.
 * This will include fetching data from an API,
 * displaying users in a clean list format, and handling click navigation.
 * 
 * @metadata
 * Author: [Wisarud Techa]
 * First Created: [16-07-2025] v0.1.0
 * Last Updated: [16-07-2025] v0.1.1
 * 
 * @notes
 * - Auto-generated code; may contain incomplete logic or require validation.
 * - Modify with caution and document changes.
 * - Intended as a starting point or scaffolding.
 */

import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useTranslation } from "@/hooks/useTranslation";
import { useGetCommandsQuery, useGetDepartmentsQuery, useGetStationsQuery } from "@/store/api/organizationApi";
import { useGetUsersQuery, useGetUserRolesQuery } from "@/store/api/userApi";
import type { Command, Department, Station } from "@/types/organization";
import type { Role, UserProfile } from "@/types/user";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import PageMeta from "@/components/common/PageMeta";
import UserManagementComponent from "@/components/admin/user-management/user/UserManagement";
import Toast from "@/components/toast/Toast";

const UserManagementPage: React.FC = () => {
  const location = useLocation();
  const { t } = useTranslation();
  
  // Toast state
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);

  // Check for toast message from navigation state
  useEffect(() => {
    if (location.state?.toast) {
      setToast({
        message: location.state.toast.message,
        type: location.state.toast.type
      });
      
      // Clear the navigation state to prevent toast from showing again on refresh
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [location.state]);

  // ===================================================================
  // API Data
  // ===================================================================

  const { data: usersData } = useGetUsersQuery({ start: 0, length: 100 });
  const users: UserProfile[] = usersData?.data as unknown as UserProfile[] || [];

  const { data: departmentsData } = useGetDepartmentsQuery({ start: 0, length: 100});
  const departments = departmentsData?.data as unknown as Department[] || [];

  const { data: commandsData } = useGetCommandsQuery({ start: 0, length: 1000});
  const commands = commandsData?.data as unknown as Command[] || [];

  const { data: stationsData } = useGetStationsQuery({ start: 0, length: 10000});
  const stations = stationsData?.data as unknown as Station[] || [];

  const { data: rolesData } = useGetUserRolesQuery({ start: 0, length: 10 });
  const roles = rolesData?.data as unknown as Role[] || [];

  return (users && departments && roles) ? (
    <>
      <PageMeta
        title="React.js User Management | TailAdmin - Next.js Admin Dashboard Template"
        description="This is React.js User Management page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />

      <ProtectedRoute requiredPermissions={["user.view"]}>
        <PageBreadcrumb pageTitle={t("navigation.sidebar.main.user_management.nested.user.header")} />

        <UserManagementComponent usr={users} dept={departments} cmd={commands} stn={stations} role={roles} />
      </ProtectedRoute>

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          duration={3000}
          onClose={() => setToast(null)}
        />
      )}
    </>
  ) : (
    <div>Loading...</div>
  );
};

export default UserManagementPage;

/**
 * @keyFeatures
 * ----------------------------------------------------------------------------
 * - Dupplicate from /src/pages/Case/CaseHistory.tsx
 * 
 * @version 0.1.0
 * @date    16-07-2025
 * ----------------------------------------------------------------------------
 * - Dashboard Metrics.
 * - Advanced Filtering & Search.
 * - User Management Features.
 * - Bulk Operations.
 * - Individual User Actions.
 * 
 * @version 0.1.1
 * @date    16-07-2025
 * ----------------------------------------------------------------------------
 */
