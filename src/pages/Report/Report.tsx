import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import PageMeta from "@/components/common/PageMeta";
import ReportComponent from "@/components/report/ReportComponet";
import { useTranslation } from "@/hooks/useTranslation";

const ReportPage: React.FC = () => {
    const { t } = useTranslation()
    return (
        <div>
            <PageMeta
                title="React.js Workflow Management | TailAdmin - Next.js Admin Dashboard Template"
                description="This is React.js Workflow Management page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
            />

            <PageBreadcrumb pageTitle={t("common.report")} />
            <ReportComponent />
        </div>
    );
};

export default ReportPage;

