import DynamicForm from "@/components/form/dynamic-form/DynamicForm";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import createCase from "../../utils/json/createCase.json"
import { ArrowLeft } from "lucide-react";
import Button from "@/components/ui/button/Button";

interface CreateCasePagesProps {
    onBack: () => void;
}
const onFormSubmit = ()=>{

}

export default function CreateCasePages({ onBack }: CreateCasePagesProps) {
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
                        <div className="flex items-center">
                            <div className="flex">
                                {/* <div className="relative bg-gray-700 text-white px-4 py-2 rounded-t-lg border-t border-l border-r border-gray-600 text-sm font-medium">
                                    Case #0891234005
                                    <button className="ml-2 text-gray-400 hover:text-white">×</button>
                                </div> */}
                                {/* <div className="relative bg-gray-800 text-gray-300 px-4 py-2 rounded-t-lg border-t border-l border-r border-gray-600 text-sm font-medium ml-1">
                                    Case #0891234007
                                    <button className="ml-2 text-gray-400 hover:text-white">×</button>
                                </div> */}
                            </div>
                        </div>
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
