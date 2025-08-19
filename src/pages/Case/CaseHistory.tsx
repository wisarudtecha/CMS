// /src/pages/Case/CaseHistory.tsx
/**
 * @fileoverview Code dupplicated from Workflow Management.
 * 
 * @description
 * React TypeScript component for listing case history with navigation functionality.
 * This will include fetching data from an API,
 * displaying case history in a clean list format, and handling click navigation.
 * 
 * @metadata
 * Author: [Wisarud Techa]
 * First Created: [11-07-2025] v0.1.0
 * Last Updated: [15-07-2025] v0.1.1
 * 
 * @notes
 * - Auto-generated code; may contain incomplete logic or require validation.
 * - Modify with caution and document changes.
 * - Intended as a starting point or scaffolding.
 */

import React from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useGetListCaseQuery } from "@/store/api/caseApi";
import { useGetCaseStatusesQuery, useGetCaseTypesSubTypesQuery } from "@/store/api/serviceApi";
import type { CaseEntity, CaseStatus, CaseTypeSubType } from "@/types/case";
import CaseHistoryComponent from "@/components/case/CaseHistory";
// import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import PageMeta from "@/components/common/PageMeta";

const CaseHistoryPage: React.FC = () => {
  // ===================================================================
  // API Data
  // ===================================================================
  const { data: caseHistoriesData } = useGetListCaseQuery({ start: 0, length: 100 });
  const caseHistories = caseHistoriesData?.data as unknown as CaseEntity[] || [];

  const { data: caseStatusesData } = useGetCaseStatusesQuery({ start: 0, length: 30 });
  const caseStatuses = caseStatusesData?.data as unknown as CaseStatus[] || [];

  const { data: caseTypesSubTypesData } = useGetCaseTypesSubTypesQuery(null);
  const caseTypesSubTypes = caseTypesSubTypesData?.data as unknown as CaseTypeSubType[] || [];

  return (
    <>
      <PageMeta
        title="React.js Case History | TailAdmin - Next.js Admin Dashboard Template"
        description="This is React.js Case History page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />

      <ProtectedRoute requiredPermissions={["case.view_history"]}>
        {/* <PageBreadcrumb pageTitle="Case History" /> */}

        <CaseHistoryComponent
          caseHistories={caseHistories}
          caseStatuses={caseStatuses}
          caseTypesSubTypes={caseTypesSubTypes}
        />
      </ProtectedRoute>
    </>
  );
};

export default CaseHistoryPage;

/**
 * @keyFeatures
 * ----------------------------------------------------------------------------
 * - Dupplicate from /src/pages/Workflow/List.tsx.
 * 
 * @version 0.1.0
 * @date    11-07-2025
 * ----------------------------------------------------------------------------
 * - Component Architecture Strategy.
 * - Custom Preview Dialog Implementation.
 * - Enhanced CRUD Integration.
 * - Interactive Features & User Experience.
 * - State Management Pattern.
 * 
 * @version 0.1.1
 * @date    15-07-2025
 * ----------------------------------------------------------------------------
 */
