// /src/pages/Organization/OrganizationManagement.tsx
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
// import { useGetListCaseQuery } from "@/store/api/caseApi";
// import { useGetCaseStatusesQuery, useGetCaseTypesSubTypesQuery } from "@/store/api/serviceApi";
import OrganizationManagementComponent from "@/components/organization/OrganizationManagement";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import PageMeta from "@/components/common/PageMeta";

const OrganizationManagementPage: React.FC = () => {
  // ===================================================================
  // API Data
  // ===================================================================
  // const { data: caseHistoriesData } = useGetListCaseQuery({ start: 0, length: 100 });
  // const caseHistories = caseHistoriesData?.data as unknown as CaseEntity[] || [];

  // const { data: caseStatusesData } = useGetCaseStatusesQuery({ start: 0, length: 30 });
  // const caseStatuses = caseStatusesData?.data as unknown as CaseStatus[] || [];

  // const { data: caseTypesSubTypesData } = useGetCaseTypesSubTypesQuery(null);
  // const caseTypesSubTypes = caseTypesSubTypesData?.data as unknown as CaseTypeSubType[] || [];

  return (
    <>
      <PageMeta
        title="React.js Organization Management | TailAdmin - Next.js Admin Dashboard Template"
        description="This is React.js Organization Management page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />

      <ProtectedRoute requiredPermissions={["organization.view"]}>
        <PageBreadcrumb pageTitle="Organization Management" />

        <OrganizationManagementComponent />
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
