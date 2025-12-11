// /src/pages/Admin/AreaManagement.tsx
/**
 * @fileoverview Area Response Management Dashboard.
 * 
 * @description
 * Advanced geographic response management system integrating with existing CMS infrastructure.
 * Provides interactive area definition, response analytics, and dynamic unit assignment capabilities.
 * 
 * @metadata
 * Author: [Wisarud Techa]
 * First Created: [27-08-2025] v0.1.0
 * Last Updated: [27-08-2025] v0.1.0
 * 
 * @notes
 * - Auto-generated code; may contain incomplete logic or require validation.
 * - Modify with caution and document changes.
 * - Intended as a starting point or scaffolding.
 */

import React from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useTranslation } from "@/hooks/useTranslation";
import { useGetAreaQuery } from "@/store/api/area";
import type { Area } from "@/store/api/area";
// import type { ResponseArea } from "@/types/area";
import AreaManagementComponent from "@/components/admin/system-configuration/area/AreaManagement";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import PageMeta from "@/components/common/PageMeta";

const AreaManagementPage: React.FC = () => {
  const { t } = useTranslation();

  // ===================================================================
  // API Data
  // ===================================================================
  const { data: areasData } = useGetAreaQuery(null);
  const areas = areasData?.data as unknown as Area[] || [];

  return (
    <>
      <PageMeta
        title="React.js Area Response Management | TailAdmin - Next.js Admin Dashboard Template"
        description="This is React.js Area Response Management page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />

      <ProtectedRoute requiredPermissions={["settings.view"]}>
        <PageBreadcrumb pageTitle={t("navigation.sidebar.main.system_configuration.nested.area_management")} />

        <AreaManagementComponent areas={areas} />
      </ProtectedRoute>
    </>
  );
};

export default AreaManagementPage;

/**
 * @keyFeatures
 * ----------------------------------------------------------------------------
 * - Dashboard Overview.
 * - Advanced Area Management.
 * - Unit Coverage Matrix.
 * 
 * @version 0.1.0
 * @date    27-08-2025
 * ----------------------------------------------------------------------------
 */
