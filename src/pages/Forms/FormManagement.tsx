
import React from 'react';
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import PageMeta from "@/components/common/PageMeta";
import FormManagerComponent from '@/components/formsManagents/formManagerComponent';
import { useTranslation } from '@/hooks/useTranslation';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

const FormManagentListPage: React.FC = () => {
  const {t}=useTranslation()
  return (
    <>
      <PageMeta
        title="React.js Workflow Management | TailAdmin - Next.js Admin Dashboard Template"
        description="This is React.js Workflow Management page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      
      <PageBreadcrumb pageTitle={t("form_builder.form_management")} />
      <ProtectedRoute requiredPermissions={["form.view"]}>
      <FormManagerComponent/>
      </ProtectedRoute>
    </>
  );
};

export default FormManagentListPage;

