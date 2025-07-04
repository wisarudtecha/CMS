
import React from 'react';
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import PageMeta from "@/components/common/PageMeta";
import TicketListComponent from "@/components/ticket/List";

const WorkflowListPage: React.FC = () => {
  return (
    <>
      <PageMeta
        title="React.js Workflow Management | TailAdmin - Next.js Admin Dashboard Template"
        description="This is React.js Workflow Management page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />

      <PageBreadcrumb pageTitle="Workflow Management" />

      <TicketListComponent />
    </>
  );
};

export default WorkflowListPage;

/**
 * @keyFeatures
 * ----------------------------------------------------------------------------
 * - Fetches workflows from API using useEffect and useState hooks.
 * - Displays workflows in a clean, clickable list format.
 * - Uses functional components with TypeScript interfaces.
 * - Each item is clickable for navigation (currently shows alert, ready for router).
 * 
 * @version 0.1.0
 * @date    11-06-2025
 * ----------------------------------------------------------------------------
 * - Display Mode Options.
 * - Complete CRUD Operations.
 * - Search Functionality.
 * - Filtering & Sorting.
 * - Pagination System.
 * - Show Entries Options.
 * - Status Management.
 * - Action Buttons.
 * - Confirmation Dialogs.
 * - Toast Notifications.
 * 
 * @version 0.1.1
 * @date    13-06-2025
 * ----------------------------------------------------------------------------
 */
