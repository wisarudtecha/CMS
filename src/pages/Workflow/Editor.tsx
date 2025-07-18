// /src/pages/Workflow/Editor.tsx
/**
 * @fileoverview Code generated by Claude Sonnet 4 model.
 * 
 * @description
 * The workflow visual editor specifically for Case Management System use.
 * This will include case-specific node types, priority levels, case categories, SLA management, and case lifecycle features.
 * 
 * @metadata
 * Author: [Wisarud Techa]
 * First Created: [25-06-2025] v0.2.0
 * Last Updated: [02-07-2025] v0.2.1
 * 
 * @notes
 * - Auto-generated code; may contain incomplete logic or require validation.
 * - Modify with caution and document changes.
 * - Intended as a starting point or scaffolding.
 */

import React from "react";
import { useParams } from "react-router-dom";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import PageMeta from "@/components/common/PageMeta";
import WorkflowEditorComponent from "@/components/workflow/editor/Editor";

const threeLayerBreadcrumb = [
  { label: "Home", href: "/" },
  { label: "Workflows Management", href: "/workflow/list" },
  { label: "Workflow Builder" },
];

const WorkflowEditorPage: React.FC = () => {
  const params = useParams<{ id: string }>();

  return (
    <>
      <PageMeta
        title="React.js Workflow Visual Editor | TailAdmin - Next.js Admin Dashboard Template"
        description="This is React.js Workflow Visual Editor for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />

      <PageBreadcrumb items={threeLayerBreadcrumb} />

      <WorkflowEditorComponent workflowId={params?.id || "new"} />
    </>
  );
};

export default WorkflowEditorPage;

/**
 * @keyFeatures
 * ----------------------------------------------------------------------------
 * Case Management Enhancements
 * - Case-Specific Actions & Processes.
 * - Case Management Configuration.
 * - Enhanced Visual System.
 * - Case Management Validations.
 * - Enhanced Components Preview.
 * - Professional Case Management UI.
 * 
 * @version 0.2.0
 * @date    26-06-2025
 * ----------------------------------------------------------------------------
 * UX/UI Enhancements
 * - Thinner Grid Line of Canvas in the Dark Theme.
 * - Position of panels Switching.
 * - Button Border Customization in Dark Theme.
 * - Modify Text of Header and Title.
 * - Remove Unnecessary Dropdown.
 * - Text Brightness Customization.
 * - Update the SLA's measure unit.
 * 
 * @version 0.2.1
 * @date    02-07-2025
 * ----------------------------------------------------------------------------
 */
