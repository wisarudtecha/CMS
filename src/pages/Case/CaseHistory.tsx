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
 * Last Updated: [11-07-2025] v0.1.0
 * 
 * @notes
 * - Auto-generated code; may contain incomplete logic or require validation.
 * - Modify with caution and document changes.
 * - Intended as a starting point or scaffolding.
 */

import React from 'react';
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import PageMeta from "@/components/common/PageMeta";
import CaseHistoryComponent from "@/components/case/CaseHistory";

const CaseHistoryPage: React.FC = () => {
  return (
    <>
      <PageMeta
        title="React.js Case History | TailAdmin - Next.js Admin Dashboard Template"
        description="This is React.js Case History page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />

      <PageBreadcrumb pageTitle="Case History" />

      <CaseHistoryComponent />
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
 */
