// /src/pages/Admin/ServiceManagement.tsx
/**
 * @fileoverview Advanced Service Type & Sub-Type Management Component.
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
import { useGetSubTypeQuery, useGetTypeQuery } from "@/store/api/caseApi";
import { useGetPropertiesQuery } from "@/store/api/unitApi";
import { useGetSkillsQuery } from "@/store/api/userApi";
import { useGetWorkflowsQuery } from "@/store/api/workflowApi";
import type { EnhancedCaseSubType, EnhancedCaseType } from "@/types/case";
import type { Properties } from "@/types/unit";
import type { EnhancedSkill } from "@/types/user";
import type { Workflow } from "@/types/workflow";
import ServiceManagementComponent from "@/components/admin/system-configuration/service/ServiceManagement"; 
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import PageMeta from "@/components/common/PageMeta";

const CaseManagementPage: React.FC = () => {
  // ===================================================================
  // API Data
  // ===================================================================
  const { data: caseSubTypesData } = useGetSubTypeQuery(null);
  const caseSubTypes = caseSubTypesData?.data as unknown as EnhancedCaseSubType[] || [];

  const { data: caseTypesData } = useGetTypeQuery(null);
  const caseTypes = caseTypesData?.data as unknown as EnhancedCaseType[] || [];

  const { data: propertiesData } = useGetPropertiesQuery({ start: 0, length: 100 });
  const properties = propertiesData?.data as unknown as Properties[] || [];

  const { data: skillsData } = useGetSkillsQuery({ start: 0, length: 100 });
  const skills = skillsData?.data as unknown as EnhancedSkill[] || [];

  const { data: workflowsData } = useGetWorkflowsQuery("");
  const workflows = workflowsData?.data as unknown as Workflow[] || [];

  return (
    <>
      <PageMeta
        title="React.js Service Management | TailAdmin - Next.js Admin Dashboard Template"
        description="This is React.js Service Management page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />

      <ProtectedRoute requiredPermissions={["service.view"]}>
        <PageBreadcrumb pageTitle="Service Management" />

        <ServiceManagementComponent
          caseSubTypes={caseSubTypes}
          caseTypes={caseTypes}
          properties={properties}
          skills={skills}
          workflows={workflows}
        />
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
