// /src/pages/Case/CaseManagement.tsx
/**
 * @fileoverview Advanced Case Type & Sub-Type Management Component.
 * 
 * @description
 * Comprehensive management interface for case types and sub-types with
 * hierarchical organization, advanced configuration, and analytics.
 * Builds upon existing CaseType and CaseSubType interfaces.
 * 
 * @metadata
 * Author: [Wisarud Techa]
 * First Created: [28-08-2025] v0.1.0
 * Last Updated: [28-08-2025] v0.1.0
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
import CaseManagementComponent from "@/components/case/CaseManagement"; 
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import PageMeta from "@/components/common/PageMeta";

const CaseManagementPage: React.FC = () => {
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
        title="React.js Case Management | TailAdmin - Next.js Admin Dashboard Template"
        description="This is React.js Case Management page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />

      <ProtectedRoute requiredPermissions={["service.view"]}>
        <PageBreadcrumb pageTitle="Case Management" />

        <CaseManagementComponent />
      </ProtectedRoute>
    </>
  );
};

export default CaseManagementPage;

/**
 * @keyFeatures
 * ----------------------------------------------------------------------------
 * - Hierarchical type builder with drag-and-drop.
 * - Advanced sub-type configuration.
 * - Type analytics and optimization.
 * - Bulk operations.
 * - Template management.
 * - Integration with skills, properties, and workflows.
 * 
 * @version 0.1.0
 * @date    28-08-2025
 * ----------------------------------------------------------------------------
 */
