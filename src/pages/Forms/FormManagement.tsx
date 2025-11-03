
import React from 'react';
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import PageMeta from "@/components/common/PageMeta";
import FormManagerComponent from '@/components/formsManagents/formManagerComponent';

const FormManagentListPage: React.FC = () => {
  return (
    <>
      <PageMeta
        title="React.js Workflow Management | TailAdmin - Next.js Admin Dashboard Template"
        description="This is React.js Workflow Management page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />

      <PageBreadcrumb pageTitle="Forms Management" />

      <FormManagerComponent/>
    </>
  );
};

export default FormManagentListPage;

