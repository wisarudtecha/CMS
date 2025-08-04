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

import React from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useGetDepartmentsQuery, useGetUsersQuery, useGetUserRolesQuery } from "@/store/api/userApi";
import type { Department, Role, UserProfile } from "@/types/user";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import PageMeta from "@/components/common/PageMeta";
import UserManagementComponent from "@/components/admin/UserManagement";

const UserManagementPage: React.FC = () => {
  // ===================================================================
  // API Data
  // ===================================================================

  const { data: usersData } = useGetUsersQuery({ start: 0, length: 10 });
  const users: UserProfile[] = usersData?.data as unknown as UserProfile[] || [];

  const { data: departmentsData } = useGetDepartmentsQuery();
  const departments = departmentsData?.data as unknown as Department[] || [];

  const { data: rolesData } = useGetUserRolesQuery({ start: 0, length: 10 });
  const roles = rolesData?.data as unknown as Role[] || [];

  return (users && departments && roles) ? (
    <>
      <PageMeta
        title="React.js User Management | TailAdmin - Next.js Admin Dashboard Template"
        description="This is React.js User Management page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />

      <ProtectedRoute requiredPermissions={["user.view"]}>
        <PageBreadcrumb pageTitle="User Management" />

        <UserManagementComponent usr={users} dept={departments} role={roles} />
      </ProtectedRoute>
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
