// /src/pages/Admin/OrganizationManagement.tsx
/**
 * @fileoverview Enhanced Organization Management Component.
 * 
 * @description
 * Comprehensive organization management system that builds on existing 
 * Department → Command → Station hierarchy while adding enterprise-level
 * multi-tenant capabilities, branding, and governance features.
 * 
 * @metadata
 * Author: [Wisarud Techa]
 * First Created: [01-09-2025] v0.1.0
 * Last Updated: [01-09-2025] v0.1.0
 * 
 * @notes
 * - Auto-generated code; may contain incomplete logic or require validation.
 * - Modify with caution and document changes.
 * - Intended as a starting point or scaffolding.
 */

import React from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useGetDepartmentsQuery, useGetCommandsQuery, useGetStationsQuery, useGetOrganizationsQuery } from "@/store/api/organizationApi";
import type { Department, Command, Station, Organization } from "@/types/organization";
import OrganizationManagementComponent from "@/components/admin/user-management/organization/OrganizationManagement";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import PageMeta from "@/components/common/PageMeta";

const OrganizationManagementPage: React.FC = () => {
  // ===================================================================
  // API Data
  // ===================================================================
  const { data: departmentsData } = useGetDepartmentsQuery({ start: 0, length: 100 });
  const departments = departmentsData?.data as unknown as Department[] || [];

  const { data: commandsData } = useGetCommandsQuery({ start: 0, length: 1000 });
  const commands = commandsData?.data as unknown as Command[] || [];

  const { data: stationsData } = useGetStationsQuery({ start: 0, length: 10000 });
  const stations = stationsData?.data as unknown as Station[] || [];

  const { data: organizationsData } = useGetOrganizationsQuery(null);
  const organizations = organizationsData?.data as unknown as Organization[] || [];

  return (
    <>
      <PageMeta
        title="React.js Organization Management | TailAdmin - Next.js Admin Dashboard Template"
        description="This is React.js Organization Management page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />

      <ProtectedRoute requiredPermissions={["organization.view"]}>
        <PageBreadcrumb pageTitle="Organization Management" />

        <OrganizationManagementComponent
          departments={departments}
          commands={commands}
          stations={stations}
          organizations={organizations}
        />
      </ProtectedRoute>
    </>
  );
};

export default OrganizationManagementPage;

/**
 * @keyFeatures
 * ----------------------------------------------------------------------------
 * - Leveraged existing theme system.
 * - Used established patterns.
 * - Multi-tenant ready.
 * 
 * @version 0.1.0
 * @date    01-09-2025
 * ----------------------------------------------------------------------------
 */
