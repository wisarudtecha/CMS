// /src/pages/Device/PropertyManagement.tsx
/**
 * @fileoverview Advanced Properties Management Dashboard.
 * 
 * @description
 * Comprehensive properties management system that builds upon the existing Property interface.
 * Provides property definition, assignment matrix, lifecycle management, and analytics.
 * Integrates with existing unitPropLists system and case assignment logic.
 * 
 * @metadata
 * Author: [Wisarud Techa]
 * First Created: [29-08-2025] v0.1.0
 * Last Updated: [29-08-2025] v0.1.0
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
import PropertyManagementComponent from "@/components/device/PropertyManagement"; 
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import PageMeta from "@/components/common/PageMeta";

const PropertyManagementPage: React.FC = () => {
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
        title="React.js Property Management | TailAdmin - Next.js Admin Dashboard Template"
        description="This is React.js Property Management page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />

      <ProtectedRoute requiredPermissions={["unit.view"]}>
        <PageBreadcrumb pageTitle="Property Management" />

        <PropertyManagementComponent />
      </ProtectedRoute>
    </>
  );
};

export default PropertyManagementPage;

/**
 * @keyFeatures
 * ----------------------------------------------------------------------------
 * - Enhanced Data Architecture.
 * - Advanced Management Interface.
 * - Design Consistency.
 * - Bulk operations.
 * - Template management.
 * - Integration with skills, properties, and workflows.
 * 
 * @version 0.1.0
 * @date    29-08-2025
 * ----------------------------------------------------------------------------
 */
