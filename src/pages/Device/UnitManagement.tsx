// /src/pages/Device/UnitManagement.tsx
/**
 * @fileoverview Advanced Units Management Dashboard.
 * 
 * @description
 * Comprehensive units management system that builds upon the existing Property interface.
 * Provides property definition, assignment matrix and hierarchy, lifecycle management, and analytics.
 * Integrates with existing unitPropLists system and case assignment logic.
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
import UnitManagementComponent from "@/components/device/UnitManagement";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import PageMeta from "@/components/common/PageMeta";

const UnitManagementPage: React.FC = () => {
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
        title="React.js Unit Management | TailAdmin - Next.js Admin Dashboard Template"
        description="This is React.js Unit Management page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />

      <ProtectedRoute requiredPermissions={["unit.view"]}>
        <PageBreadcrumb pageTitle="Unit Management" />

        <UnitManagementComponent />
      </ProtectedRoute>
    </>
  );
};

export default UnitManagementPage;

/**
 * @keyFeatures
 * ----------------------------------------------------------------------------
 * - Interactive Unit Cards.
 * - Advanced Table View.
 * - Detailed Preview System.
 * - Smart Filtering System.
 * 
 * @version 0.1.0
 * @date    01-09-2025
 * ----------------------------------------------------------------------------
 */
