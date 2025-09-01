// /src/pages/Admin/SkillManagement.tsx
/**
 * @fileoverview Enhanced Skill Management Dashboard.
 * 
 * @description
 * Comprehensive skill management system for CMS with advanced features:
 * - Skill taxonomy management
 * - Proficiency tracking and assessment
 * - Skill gap analysis
 * - Integration with case assignment
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
import SkillManagementComponent from "@/components/admin/skill/SkillManagement";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import PageMeta from "@/components/common/PageMeta";

const SkillManagementPage: React.FC = () => {
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
        title="React.js Skill Management | TailAdmin - Next.js Admin Dashboard Template"
        description="This is React.js Skill Management page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />

      <ProtectedRoute requiredPermissions={["user.view"]}>
        <PageBreadcrumb pageTitle="Skill Management" />

        <SkillManagementComponent />
      </ProtectedRoute>
    </>
  );
};

export default SkillManagementPage;

/**
 * @keyFeatures
 * ----------------------------------------------------------------------------
 * - Interactive skill matrix with proficiency levels.
 * - Real-time skill analytics and metrics.
 * - Advanced filtering and search.
 * - Skill assessment workflow integration.
 * - Case assignment skill matching visualization.
 * 
 * @version 0.1.0
 * @date    01-09-2025
 * ----------------------------------------------------------------------------
 */
