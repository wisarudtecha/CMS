"use client"

import { useState } from "react"
import {
    ArrowLeft,
    Clock,
    User,
    MessageSquare,
    Paperclip,
} from "lucide-react"
import Button from "@/components/ui/button/Button"
import { CaseItem } from "@/components/interface/CaseItem"
import DynamicForm from "@/components/form/dynamic-form/DynamicForm"
import PageBreadcrumb from "@/components/common/PageBreadCrumb"
import PageMeta from "@/components/common/PageMeta"
import { FormField, IndividualFormField } from "@/components/interface/FormField"
import createCase from "../../utils/json/createCase.json"
import Badge from "@/components/ui/badge/Badge"
import { ScrollArea } from "@/components/ui/scorllarea/scroll-area"
import AssignOfficerModal, { Officer } from "@/components/assignOfficer/AssignOfficerModel"
import { getPriorityBorderColorClass, getPriorityColorClass, getTextPriority } from "../function/Prioriy"
// Mock data for officers - this would likely come from an API
const mockOfficers: Officer[] = [
    { id: '1', name: 'James Brown', status: 'Available', department: 'Electrical', location: 'Sector 4', service: 'Power Grid', serviceProvider: 'City Power', workload: 2, distance: 3.5 },
    { id: '2', name: 'Patricia Williams', status: 'On-Site', department: 'Plumbing', location: 'Downtown', service: 'Water Main', serviceProvider: 'Aqua Services', workload: 8, distance: 12.1 },
    { id: '3', name: 'Robert Jones', status: 'Unavailable', department: 'Electrical', location: 'Sector 2', service: 'Residential', serviceProvider: 'City Power', workload: 5, distance: 8.9 },
    { id: '4', name: 'Linda Davis', status: 'En-Route', department: 'Communications', location: 'Hill Valley', service: 'Fiber Optics', serviceProvider: 'ConnectFast', workload: 4, distance: 1.2 },
    { id: '5', name: 'Michael Miller', status: 'Available', department: 'Structural', location: 'Sector 4', service: 'Inspection', serviceProvider: 'BuildSafe', workload: 1, distance: 4.8 },
];
import  CaseHistory  from "@/utils/json/caseHistory.json"

interface CaseDetailViewProps {
    onBack: () => void
    caseData?: CaseItem
}


// CustomerPanel and other sub-components remain unchanged as their internal structure is correct.
const CustomerPanel = () => {
    const [activeRightPanel, setActiveRightPanel] = useState<"customer" | "cases">("customer");
    const [activeTab, setActiveTab] = useState("customer-info");

    const tabs = [
        { id: "customer-info", label: "Info" },
        { id: "history", label: "History" },
        { id: "other", label: "Other" },
    ];

    const serviceHistory = CaseHistory

    return (
        <div className="overflow-y-auto w-full max-w-sm md:max-w-md xl:max-w-lg bg-gray-50 dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 flex flex-col">
            {/* Mobile/Tablet Tabs */}
            <div className="md:hidden border-b border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800">
                <div className="flex">
                    <button
                        onClick={() => setActiveRightPanel("customer")}
                        className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${activeRightPanel === "customer"
                            ? "text-gray-900 dark:text-white bg-white dark:bg-gray-900 border-b-2 border-b-blue-500"
                            : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                            }`}
                    >
                        Customer Info
                    </button>
                    <button
                        onClick={() => setActiveRightPanel("cases")}
                        className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${activeRightPanel === "cases"
                            ? "text-gray-900 dark:text-white bg-white dark:bg-gray-900 border-b-2 border-b-blue-500"
                            : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                            }`}
                    >
                        Service History
                    </button>
                </div>
            </div>

            {/* Customer Info Section */}
            <div
                className={`${activeRightPanel === "customer" ? "flex" : "hidden"
                    } md:flex flex-col border-b border-gray-200 dark:border-gray-800 md:max-h-80`}
            >
                <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800">
                    <div className="flex overflow-x-auto">
                        {tabs.slice(0, 3).map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`relative px-2 md:px-3 py-2 text-xs font-medium whitespace-nowrap transition-colors border-r border-gray-200 dark:border-gray-700 ${activeTab === tab.id
                                    ? "text-gray-900 dark:text-white bg-white dark:bg-gray-900 border-b-2 border-b-blue-500"
                                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-750"
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                <ScrollArea className="flex-1">
                    <div className="p-3 space-y-3">
                        {activeTab === "customer-info" ? (
                            <>
                                <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <span className="text-blue-500 dark:text-blue-400 font-medium text-sm">Customer Information</span>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-medium text-gray-900 dark:text-white text-sm">John Smith</h3>
                                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate">Business ID: 123456789</div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">Level: Premium</div>
                                    </div>
                                </div>
                                <div className="space-y-2 text-xs">
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <div className="text-blue-500 dark:text-blue-400 mb-1">DOB</div>
                                            <div className="text-gray-900 dark:text-white">Jan 15, 1985</div>
                                        </div>
                                        <div>
                                            <div className="text-blue-500 dark:text-blue-400 mb-1">Insurance</div>
                                            <div className="text-gray-900 dark:text-white">INS-789-456</div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-4">
                                <div className="text-gray-500 dark:text-gray-400 mb-1 text-sm">No data available</div>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </div>

            {/* Service History Section */}
            <div className={`${activeRightPanel === "cases" ? "flex" : "hidden"} md:flex flex-1 flex-col`}>
                <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-900 px-4 py-3">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">Service History</h3>
                        <Button variant="ghost" size="sm" className="p-1 text-xs">Filter</Button>
                    </div>
                </div>
                <ScrollArea className="flex-1">
                    <div className="p-3 space-y-3">
                        {serviceHistory.map((historyItem) => (
                            <div
                                key={historyItem.id}
                                className={`bg-gray-100 dark:bg-gray-800 rounded-lg p-3 hover:bg-gray-200 dark:hover:bg-gray-750 transition-colors cursor-pointer border-l-4 ${getPriorityBorderColorClass(historyItem.priority)} group`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center space-x-2 mb-2">
                                            <div className={`w-2 h-2 ${getPriorityColorClass(historyItem.priority)} rounded-full flex-shrink-0`}></div>
                                            <span className="text-xs text-gray-600 dark:text-gray-500 font-mono">#{historyItem.id}</span>
                                            <span className="text-xs text-gray-600 dark:text-gray-500">{historyItem.date}</span>
                                        </div>
                                        <h4 className="text-sm font-medium text-gray-900 dark:text-white leading-tight mb-2 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors">
                                            {historyItem.title}
                                        </h4>
                                        <div className="flex items-center justify-between">
                                            <Badge >
                                                {historyItem.status}
                                            </Badge>
                                            <span className="text-xs text-gray-600 dark:text-gray-400">
                                                {Array.isArray(historyItem.assignee)
                                                    ? historyItem.assignee.map((a: { name: string }) => a.name).join(", ")
                                                    : ((historyItem.assignee as { name?: string })?.name || "-")}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </div>
        </div>
    );
};

interface TempCaseCardProps {
    onAssignClick: () => void;
    onEditChick?: () => void;
    caseData: CaseItem;
}

const TempCaseCard = ({ onAssignClick, onEditChick, caseData }: TempCaseCardProps) => {
    const [editFormData, setEditFormData] = useState(false);
    const onChick = () => {

        onEditChick && onEditChick();
        setEditFormData(!editFormData);

    }
    return (
        <div className={`mb-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border-l-4 ${getPriorityBorderColorClass(caseData.priority)}`}>
            <div className="flex items-start justify-between mb-3">
                <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{caseData.title}</h2>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>Created: {caseData.date}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                            <User className="w-4 h-4" />
                            <span>Assigned: {caseData.createBy}</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <Badge  >
                        <div className="text-center">
                        {getTextPriority(caseData.priority)} Priority
                        </div>
                    </Badge>
                    <Badge variant="outline">
                        {caseData.status}
                    </Badge>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
                <div className="relative">
                    <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200 dark:bg-gray-700"></div>
                    <div
                        className="absolute top-4 left-0 h-0.5 bg-blue-500 transition-all duration-300"
                        style={{ width: "40%" }}
                    ></div>
                    <div className="relative flex justify-between">
                        {[
                            { id: 1, title: "Received", description: "Request received", completed: true },
                            { id: 2, title: "Assigned", description: "Task assigned", completed: true },
                            { id: 3, title: "Acknowledged", description: "Assignment confirmed", completed: false, current: true },
                            { id: 4, title: "En Route", description: "Traveling to location", completed: false },
                            { id: 5, title: "On Site", description: "Arrived at service location", completed: false },
                            { id: 6, title: "Completed", description: "Service completed", completed: false }
                        ].map((step) => (
                            <div key={step.id} className="flex flex-col items-center text-center" style={{ width: "16.66%" }}>
                                <div
                                    className={`w-8 h-8 rounded-full border-2 flex items-center justify-center mb-2 transition-all duration-300 ${step.completed || step.current
                                        ? "bg-blue-500 border-blue-500"
                                        : "bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                                        }`}
                                >
                                    {step.completed ? (
                                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path
                                                fillRule="evenodd"
                                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    ) : step.current ? (
                                        <div className="w-2 h-2 bg-white rounded-full"></div>
                                    ) : (
                                        <span className="text-xs text-gray-500 dark:text-gray-400">{step.id}</span>
                                    )}
                                </div>
                                <div className="space-y-1">
                                    <div
                                        className={`text-xs font-medium ${step.completed || step.current ? "text-gray-900 dark:text-white" : "text-gray-500 dark:text-gray-400"
                                            }`}
                                    >
                                        {step.title}
                                    </div>
                                    {/* <div
                                        className={`text-xs ${step.completed || step.current ? "text-gray-600 dark:text-gray-300" : "text-gray-500"
                                            }`}
                                    >
                                        {step.description}
                                    </div> */}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Add Comment
                    </Button>
                    <Button size="sm" variant="outline" className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300">
                        <Paperclip className="w-4 h-4 mr-2" />
                        Attach File
                    </Button>
                    <Button onClick={onChick} size="sm" variant="outline" className="border-blue-500 dark:border-blue-600 text-blue-500 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900">
                        {editFormData ? "Cancel Edit" : "Edit"}
                    </Button>
                </div>
                <Button onClick={onAssignClick} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-1">
                    <User className="w-4 h-4" />
                    <span>Assign</span>
                </Button>
            </div>
        </div>
    );
};

// function mapCaseToForm(singleCase: CaseItem, initialFormSchema: FormField): FormField {
//     const newFormSchema: FormField = JSON.parse(JSON.stringify(initialFormSchema));
//     const mappedFields: IndividualFormField[] = newFormSchema.formFieldJson.map(field => {
//         let updatedValue: any = field.value;
//         switch (field.label) {
//             case "Case Title": updatedValue = singleCase.title; break;
//             case "Description": updatedValue = singleCase.description || ""; break;
//             case "Priority": updatedValue = singleCase.priorityColor; break;
//             case "Status": updatedValue = "New"; break;
//             case "Customer": updatedValue = singleCase.assignee.name; break;
//             case "Assignee": updatedValue = singleCase.assignee; break;
//             case "Due Date": updatedValue = singleCase.date; break;
//         }
//         return { ...field, value: updatedValue };
//     });
//     newFormSchema.formFieldJson = mappedFields;
//     return newFormSchema;
// }
interface Props {
    formData?: FormField;
}

const renderField = (field: IndividualFormField): Record<string, any> => {
    if (field.type === "InputGroup" && Array.isArray(field.value)) {
        return {
            [field.label]: field.value.map((child: any) => renderField(child))
        };
    }

    if (field.type === "dynamicField" && Array.isArray(field.options)) {
        const selectedOption = field.options.find((opt: any) => opt.value === field.value);
        return {
            [field.label]: {
                value: field.value || "-",
                ...(selectedOption && Array.isArray(selectedOption.form)
                    ? { form: selectedOption.form.map((child: any) => renderField(child)) }
                    : {})
            }
        };
    }

    let value = field.value;
    if (field.type === "option" && Array.isArray(value)) {
        value = value.length > 0 ? value : [];
    }
    if (field.type === "select" || field.type === "radio") {
        value = value || "-";
    }
    if (field.type === "multiImage" && Array.isArray(value)) {
        value = value.length > 0 ? value.map((file: File) => file.name) : [];
    }
    if (field.type === "image" && value instanceof File) {
        value = value.name;
    }
    if (typeof value === "string" && value.trim() === "") {
        value = "-";
    }
    return { [field.label]: value };
};

const FormFieldValueDisplay: React.FC<Props> = ({ formData }) => {
    if (!formData || !formData.formFieldJson) return null;
    const result = formData.formFieldJson.map(renderField);

    const fieldMap = result.reduce((acc, curr) => ({ ...acc, ...curr }), {});

    return (
        <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                <div className="mb-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Service Type</span>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{fieldMap["1. Service Type:"] ?? "-"}</div>
                </div>
                <div className="mb-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Date</span>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{fieldMap["2. Request Service Date:"] ?? "-"}</div>
                </div>
                <div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Priority</span>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{fieldMap["Priority Level:"] ?? "-"}</div>
                </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                <span className="text-xs text-gray-500 dark:text-gray-400">Location</span>
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {/* Handle InputGroup for location */}
                    {Array.isArray(fieldMap["3. Service Location & Destination:"])
                        ? fieldMap["3. Service Location & Destination:"].map((item: any, idx: number) => {
                            // Flatten nested objects
                            return Object.values(item).map((val, i) => (
                                <div key={idx + "-" + i}>{String(val)}</div>
                            ));
                        })
                        : (fieldMap["3. Service Location & Destination:"] ?? "-")}
                </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg col-span-2">
                <span className="text-xs text-gray-500 dark:text-gray-400">Description</span>
                <div className="text-sm font-medium text-gray-900 dark:text-white">{fieldMap["7. Service Details: *"] ?? "-"}</div>
            </div>
        </div>
    );
};

export default function CaseDetailView({ onBack, caseData }: CaseDetailViewProps) {
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [editFormData, setEditFormData] = useState<boolean>(caseData? false : true);
    const [assignedOfficers, setAssignedOfficers] = useState<Officer[]>([]);
    const handleAssignOfficers = (selectedOfficerIds: string[]) => {
        const selected = mockOfficers.filter(o => selectedOfficerIds.includes(o.id));
        setAssignedOfficers(selected);
        setShowAssignModal(false);
    };
    console.log("Case Data:", caseData);
    const handleFormSubmissionEdit = () => {
        console.log("Data received from Edit DynamicForm");
        setEditFormData(false);
    };
    const handleEditClick = () => {
        if (editFormData) {
            setEditFormData(false);
        }
        else { setEditFormData(true); }
    };

    return (
        <div className="flex flex-col h-screen ">
            <PageMeta
                title="Case Detail"
                description="Case Detail Page"
            />
            <div className="flex-shrink-0">
                <PageBreadcrumb pageTitle="Create Case Assignment" />
                <div className="px-6 ">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <Button variant="ghost" size="sm" onClick={onBack}>
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back
                            </Button>
                            <div className="flex items-center">
                                <div className="flex">
                                    <div className="relative bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-2 rounded-t-lg border-t border-l border-r border-gray-300 dark:border-gray-600 text-sm font-medium">
                                        Case #0891234005
                                        <button className="ml-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">×</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 px-5 py-7 xl:px-10 xl:py-12 overflow-hidden bg-white dark:bg-gray-800 rounded-lg">
                <div className="flex h-full gap-6">
                    <div className="overflow-y-auto">
                        <div className="pr-6 ">
                            {caseData ? <TempCaseCard onAssignClick={() => setShowAssignModal(true)} onEditChick={handleEditClick} caseData={caseData} /> : <></>}
                            {(caseData  && assignedOfficers.length > 0) && (
                                <div className="mb-4 flex flex-wrap gap-2 items-center">
                                    <span className="font-medium text-gray-700 dark:text-gray-200 text-sm">
                                        Assigned Officer{assignedOfficers.length > 1 ? "s" : ""}:
                                    </span>
                                    {assignedOfficers.map(officer => (
                                        <span
                                            key={officer.id}
                                            className="flex items-center px-2 py-1 rounded bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 text-xs font-medium"
                                        >
                                            {officer.name}
                                            <button
                                                onClick={() =>
                                                    setAssignedOfficers(prev =>
                                                        prev.filter(o => o.id !== officer.id)
                                                    )
                                                }
                                                className="ml-2 text-blue-400 hover:text-red-500 focus:outline-none"
                                                title="Remove"
                                                type="button"
                                            >
                                                ×
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}

                            {editFormData  ? <DynamicForm
                                initialForm={caseData ? caseData.formData : createCase}
                                edit={false}
                                editFormData={true}
                                onFormSubmit={editFormData ? handleFormSubmissionEdit : undefined}
                                enableFormTitle={false}
                            /> : <FormFieldValueDisplay formData={caseData?.formData} />}
                        </div>
                    </div>

                    <CustomerPanel />
                </div>
            </div>

            {/* Render the modal */}
            <AssignOfficerModal
                open={showAssignModal}
                onOpenChange={setShowAssignModal}
                officers={mockOfficers}
                onAssign={handleAssignOfficers}
            />
        </div>
    )
}