import DynamicForm from "@/components/form/dynamic-form/DynamicForm";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import createCase from "../../utils/json/createCase.json"
import { ArrowLeft } from "lucide-react";
import Button from "@/components/ui/button/Button";
import {Casev2} from "@/components/interface/Case";
interface CaseEditPagesProps {
    onBack: () => void;
    data?: Casev2;
}
const onFormSubmit = ()=>{

}

export default function CreateCasePages({ onBack ,data}: CaseEditPagesProps) {
    return (
        <div>
            <PageMeta
                title="React.js Blank Dashboard | TailAdmin - Next.js Admin Dashboard Template"
                description="This is React.js Blank Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
            />
            <PageBreadcrumb pageTitle="Create Case Page" />
            <div className=" px-6 py-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Button variant="ghost" size="sm" onClick={onBack}>
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back
                        </Button>
                    </div>
                </div>
            </div>
            <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">

                <DynamicForm
                    initialForm={createCase}
                    edit={false}
                    onFormSubmit={onFormSubmit}
                />

            </div>
        </div>
    );
}
