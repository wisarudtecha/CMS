// /src/pages/Admin/UnitManagement.tsx
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
import { useGetUnitsQuery } from "@/store/api/unitApi";
import type { Unit } from "@/types/unit";
import UnitManagementComponent from "@/components/admin/system-configuration/unit/UnitManagement";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import PageMeta from "@/components/common/PageMeta";

const UnitManagementPage: React.FC = () => {
  // ===================================================================
  // API Data
  // ===================================================================
  const { data: unitsData } = useGetUnitsQuery({ start: 0, length: 100 });
  const units = unitsData?.data as unknown as Unit[] || [];

  return (
    <>
      <PageMeta
        title="React.js Unit Management | TailAdmin - Next.js Admin Dashboard Template"
        description="This is React.js Unit Management page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />

      <ProtectedRoute requiredPermissions={["unit.view"]}>
        <PageBreadcrumb pageTitle="Unit Management" />

        <UnitManagementComponent unit={units} />
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
