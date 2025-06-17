import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import PageMeta from "@/components/common/PageMeta";
import DynamicForm from "./DynamicForm";
import Button from "@/components/ui/button/Button";
import {  useState } from "react";
import formlist from "../../utils/json/loadDynamic.json"
import { FormField } from "@/components/interface/FormField";
export default function FormElements() {
    const [showLoadFormPages, setShowLoadFormPages] = useState(false);
    const [formSelect, setFormSelect] = useState<FormField[]>([])

    return (
        <div>
            <PageMeta
                title="React.js Form Elements Dashboard | TailAdmin - React.js Admin Dashboard Template"
                description="This is React.js Form Elements  Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
            />
            <PageBreadcrumb pageTitle="Load Dynamic Form" />
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                <div className="relative flex justify-end w-full">
                    <Button size="sm" onClick={() => {
                        setShowLoadFormPages(true);

                    }}>Load Form</Button>
                </div>
                <ComponentCard title="Form" >

                    <DynamicForm
                        form={formSelect}
                        edit={false}
                    />
                </ComponentCard>
                {showLoadFormPages && (
                    <div className=" fixed inset-0 bg-black/70 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg shadow-xl p-4 w-full sm:max-w-lg mx-auto dark:bg-gray-800 overflow-y-auto max-h-[70vh]">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 text-center">Select Form</h3>
                            {formlist.map((form, index) => (
                                <button
                                    key={index}
                                    className="my-2 flex items-center  space-x-2 cursor-pointer hover:text-blue-400 text-gray-500 dark:text-gray-400  dark:hover:text-blue-400"
                                    onClick={() => {
                                        setFormSelect(form.json)
                                        setShowLoadFormPages(false)
                                    }}
                                >
                                    {form.name}
                                </button>
                            ))}
                            <Button className="my-3" size="sm" onClick={() => { setShowLoadFormPages(false) }}>Close</Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}