// CaseDetailView.tsx - Refactored and Enhanced

"use client"

import { useCallback, useMemo, useState, useEffect, ChangeEvent } from "react" // Import useEffect
import {
    ArrowLeft,
    Clock,
    User,
    MessageSquare,
    Paperclip,
    MapPin,
    ChevronDown,
    ChevronUp,
    X // Added for the close button
} from "lucide-react"
import Button from "@/components/ui/button/Button"
import { CaseItem } from "@/components/interface/CaseItem"
import DynamicForm from "@/components/form/dynamic-form/DynamicForm"
import PageBreadcrumb from "@/components/common/PageBreadCrumb"
import PageMeta from "@/components/common/PageMeta"
import { formType, IndividualFormField, FormField, CustomerData } from "@/components/interface/FormField"
import createCaseJson from "../../utils/json/createCase.json" // Renamed to avoid conflict with function name
import Badge from "@/components/ui/badge/Badge"
import { ScrollArea } from "@/components/ui/scorllarea/scroll-area"
import AssignOfficerModal, { Officer } from "@/components/assignOfficer/AssignOfficerModel"
import locateImage from "@/icons/Location-image.jpeg"
import { getPriorityBorderColorClass, getPriorityColorClass, getTextPriority } from "../function/Prioriy"
import caseTypeMock from "../../utils/json/caseType.json"
import CaseHistory from "@/utils/json/caseHistory.json"
import Avatar from "../ui/avatar/Avatar"
import { getAvatarIconFromString } from "../avatar/createAvatarFromString"
import { CommandInformation } from "../assignOfficer/CommandInformation"
import Comments from "../comment/Comment"
import { SearchableSelect } from "../SearchSelectInput/SearchSelectInput"
import Toast from "../toast/Toast"
import Input from "../form/input/InputField"

// Mock data for officers - this would likely come from an API
const mockOfficers: Officer[] = [
    { id: '1', name: 'James Brown', status: 'Available', department: 'Electrical', location: 'Sector 4', service: 'Power Grid', serviceProvider: 'City Power', workload: 2, distance: 3.5 },
    { id: '2', name: 'Patricia Williams', status: 'On-Site', department: 'Plumbing', location: 'Downtown', service: 'Water Main', serviceProvider: 'Aqua Services', workload: 8, distance: 12.1 },
    { id: '3', name: 'Robert Jones', status: 'Unavailable', department: 'Electrical', location: 'Sector 2', service: 'Residential', serviceProvider: 'City Power', workload: 5, distance: 8.9 },
    { id: '4', name: 'Linda Davis', status: 'En-Route', department: 'Communications', location: 'Hill Valley', service: 'Fiber Optics', serviceProvider: 'ConnectFast', workload: 4, distance: 1.2 },
    { id: '5', name: 'Michael Miller', status: 'Available', department: 'Structural', location: 'Sector 4', service: 'Inspection', serviceProvider: 'BuildSafe', workload: 1, distance: 4.8 },
];

const requireElements = <span className=" text-red-500 text-sm font-bold">*</span>
interface CustomerPanelProps {
    type: "edit" | "add";
    onClose: () => void; // Added onClose handler for mobile view
}

const CustomerPanel: React.FC<CustomerPanelProps> = ({ type, onClose }) => {
    const [activeRightPanel, setActiveRightPanel] = useState<"customer" | "cases">("customer");
    const [activeTab, setActiveTab] = useState("customer-info");

    const edittabs = [
        { id: "customer-info", label: "Info" },
        { id: "Location", label: "Location" },
        { id: "Knowledge Base", label: "Knowledge Base" },
    ];
    const addTab = [
        { id: "customer-info", label: "Info" },
        { id: "Location", label: "Location" },
        { id: "Knowledge Base", label: "Knowledge Base" },
        { id: "FAQ", label: "FAQ" },
    ];

    const serviceHistory = CaseHistory;

    return (
        <div className="overflow-y-auto w-full h-full bg-gray-50 dark:bg-gray-900 flex flex-col custom-scrollbar">
            {/* Mobile-only header with a title and close button */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 md:hidden">
                <h3 className="font-semibold text-lg text-gray-900 dark:text-white">Customer Details</h3>
                <Button variant="ghost" onClick={onClose}>
                    <X className="w-5 h-5" />
                </Button>
            </div>

            {/* Mobile/Tablet Tabs for switching between Customer Info and Service History */}
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
                    } md:flex flex-col border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-800 md:max-h-80`}
            >
                <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800">
                    <div className="flex overflow-x-auto custom-scrollbar">
                        {type === "edit" ? (
                            edittabs.map((tab) => (
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
                            ))
                        ) : (
                            addTab.slice(0, 4).map((tab) => (
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
                            ))
                        )}
                    </div>
                </div>

                <ScrollArea className="flex-1">
                    <div className="p-3 space-y-3">
                        {activeTab === "customer-info" ? (
                            <>
                                <div className="flex items-center space-x-2">
                                    <span className="text-blue-500 dark:text-blue-400 font-medium text-sm">
                                        Customer Information
                                    </span>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <div className="flex flex-wrap gap-3 items-center">
                                        <Avatar
                                            src={
                                                type === "edit"
                                                    ? "/images/user/user-01.jpg"
                                                    : "/images/user/unknow user.png"
                                            }
                                            size="xxlarge"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-medium text-gray-900 dark:text-white text-sm">
                                                {type === "edit" ? "John Smith" : "-"}
                                            </h3>
                                            {type === "edit" && (
                                                <>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                                        Business ID: 123456789
                                                    </div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                                        Level: Premium
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2 text-xs">
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <div className="text-blue-500 dark:text-blue-400 mb-1">DOB</div>
                                            <div className="text-gray-900 dark:text-white">
                                                {type === "edit" ? "Jan 15, 1985" : "-"}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-blue-500 dark:text-blue-400 mb-1">Insurance</div>
                                            <div className="text-gray-900 dark:text-white">
                                                {type === "edit" ? "INS-789-456" : "-"}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>

                        ) : activeTab === "Location" ? (
                            <div className="text-center py-4">
                                <img src={locateImage} alt="Location Map" className="w-full h-48 object-cover rounded-lg" />
                            </div>
                        ) : (
                            <div className="text-center py-4">
                                <div className="text-gray-500 dark:text-gray-400 mb-1 text-sm">No data available for this tab.</div>
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
                        {type == "edit" ? serviceHistory.map((historyItem) => (
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
                        )) : <></>}
                    </div>
                </ScrollArea>
            </div>
        </div>
    );
};


interface CaseCardProps {
    onAssignClick: () => void;
    onEditClick: () => void;
    caseData: CaseItem;
    editFormData: boolean;
}

const CaseCard: React.FC<CaseCardProps> = ({ onAssignClick, onEditClick, caseData, editFormData }) => {
    const [showComment, setShowComment] = useState<boolean>(false);

    const handleCommentToggle = () => {
        setShowComment(!showComment);
    };
    // Mock progress steps
    const progressSteps = [
        { id: 1, title: "Received", completed: true },
        { id: 2, title: "Assigned", completed: true },
        { id: 3, title: "Acknowledged", completed: false, current: true },
        { id: 4, title: "En Route", completed: false },
        { id: 5, title: "On Site", completed: false },
        { id: 6, title: "Completed", completed: false }
    ];

    const currentStepIndex = progressSteps.findIndex(step => step.current);
    const progressWidth = currentStepIndex !== -1 ? ((currentStepIndex) / (progressSteps.length - 1)) * 100 : 0;


    return (
        <div className={`mb-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border-l-4 ${getPriorityBorderColorClass(caseData.priority)}`}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3">
                <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{caseData.title}</h2>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>Create Date: {caseData.date}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                            <User className="w-4 h-4" />
                            <span>Created: {caseData.createBy}</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center space-x-2 text-center mt-3 sm:mt-0">
                    <Badge color={`${getTextPriority(caseData.priority).color}`}>
                        {getTextPriority(caseData.priority).level} Priority
                    </Badge>
                    <Badge variant="outline" >
                        {caseData.status}
                    </Badge>
                </div>
            </div>

            {/* Progress Bar Section */}
            <div className="mb-4 overflow-x-auto custom-scrollbar">
                <div className="relative pt-4">
                    <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-0.5 bg-gray-200 dark:bg-gray-700"></div>
                    <div
                        className="absolute top-1/2 -translate-y-1/2 left-0 h-0.5 bg-blue-500 transition-all duration-300"
                        style={{ width: `${progressWidth}%` }}
                    ></div>
                    <div className="relative flex justify-between">
                        {progressSteps.map((step) => (
                            <div key={step.id} className="flex flex-col items-center text-center group" style={{ width: "16.66%" }}>
                                <div
                                    className={`w-8 h-8 rounded-full border-2 flex items-center justify-center mb-2 transition-all duration-300 relative ${step.completed || step.current
                                        ? "bg-blue-500 border-blue-500"
                                        : "bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                                        }`}
                                >
                                    {step.completed ? (
                                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                                    ) : step.current ? (
                                        <div className="w-3 h-3 bg-white rounded-full"></div>
                                    ) : (
                                        <div className="w-3 h-3 bg-gray-100 dark:bg-gray-800 rounded-full border-2 border-gray-300 dark:border-gray-600"></div>
                                    )}
                                </div>
                                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white">
                                    {step.title}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-3 sm:space-y-0">
                <div className="flex flex-wrap gap-2">
                    <Button onClick={handleCommentToggle} size="sm" variant="outline" className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300">
                        {showComment ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Comment
                    </Button>
                    <Button size="sm" variant="outline" className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300">
                        <Paperclip className="w-4 h-4 mr-2" />
                        Attach File
                    </Button>
                    <Button onClick={onEditClick} size="sm" variant="outline" className="border-blue-500 dark:border-blue-600 text-blue-500 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900">
                        {editFormData ? "Cancel Edit" : "Edit"}
                    </Button>
                </div>
                <Button onClick={onAssignClick} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-1">
                    <User className="w-4 h-4" />
                    <span>Assign</span>
                </Button>
            </div>
            {showComment && <Comments />}
        </div>
    );
};

// --- Helper function: renderField ---
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
    // Keep File objects for image fields
    if ((field.type === "multiImage" || field.type === "dndMultiImage") && Array.isArray(value)) {
        return { [field.label]: value };
    }
    if (field.type === "image" && value instanceof File) {
        return { [field.label]: value };
    }

    if (field.type === "option" && Array.isArray(value)) {
        value = value.length > 0 ? value : [];
    }
    if (field.type === "select" || field.type === "radio") {
        value = value || "-";
    }
    if (typeof value === "string" && value.trim() === "") {
        value = "-";
    }
    return { [field.label]: value };
};


// --- Sub-component: FormFieldValueDisplay ---
interface FormFieldValueDisplayProps {
    caseData?: CaseItem;
}

const FormFieldValueDisplay: React.FC<FormFieldValueDisplayProps> = ({ caseData }) => {
    if (!caseData || !caseData.formData || !caseData.formData.formFieldJson) return null;
    const result = caseData.formData.formFieldJson.map(renderField);
    const fieldMap = result.reduce((acc, curr) => ({ ...acc, ...curr }), {});

    const vehicleInformation = Array.isArray(fieldMap["Group"])
        ? fieldMap["Group"].find((item: any) => item["Vehicle Information"])?.["Vehicle Information"] || "-"
        : fieldMap["Vehicle Information"] || "-";

    const assemblyInformation = Array.isArray(fieldMap["Group"])
        ? fieldMap["Group"].find((item: any) => item["Assembly Information"])?.["Assembly Information"] || "-"
        : "-";

    const attachments = fieldMap["Attachments"];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                <span className=" text-md text-blue-500 dark:text-blue-400 " >Customer Information</span>
                <div className="mb-2">
                    <span className="text-md text-gray-500 dark:text-gray-400">Sevice Types : {requireElements}</span>
                    <div className="text-md font-medium text-gray-900 dark:text-white">{caseData?.caseType?.caseType}</div>
                </div>
                <div className="mb-2">
                    <span className="text-md text-gray-500 dark:text-gray-400">Request Service Date {requireElements}</span>
                    <div className="text-md font-medium text-gray-900 dark:text-white">
                        {fieldMap["Request Service Date"] ?
                            new Date(fieldMap["Request Service Date"]).toLocaleString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: 'numeric',
                                minute: 'numeric',
                                hour12: true
                            }) :
                            "-"
                        }
                    </div>
                </div>
                <div>
                    <span className="text-md text-gray-500 dark:text-gray-400">Priority</span>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{caseData.priority ? getTextPriority(caseData.priority).level : "-"}</div>

                </div>
                <div>
                    <span className="text-md text-gray-500 dark:text-gray-400">Service Center</span>
                    <div className="text-sm font-medium text-gray-900 dark:text-white"> {caseData.serviceCenter}</div>
                </div>
            </div>
            <div >
                <div className="mb-3 bg-gray-50 dark:bg-gray-900 p-4 rounded-lg h-fit  ">
                    <div className="mb-2">
                        <span className=" text-md text-blue-500 dark:text-blue-400 " >Location Information</span>
                    </div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                        <div className="flex flex-wrap gap-x-2 gap-y-1 ">
                            <MapPin />
                            {Array.isArray(fieldMap["3. Service Location & Destination:"])
                                ? fieldMap["3. Service Location & Destination:"].map((item: any, idx: number) => {
                                    return Object.values(item).map((val, i) => (
                                        <div key={idx + "-" + i}>{String(val)}</div>
                                    ));
                                })
                                : (fieldMap["Location Information"] ?? "-")}
                        </div>

                    </div>

                </div>
                <div className=" bg-gray-50 dark:bg-gray-900 p-4 rounded-lg ">
                    <div className="mb-2">
                        <span className=" text-md text-blue-500 dark:text-blue-400 " >Vehicle & Assembly</span>
                    </div>
                    <div className="mb-2">
                        <span className="text-md text-gray-500 dark:text-gray-400">Vehicle Information</span>
                        <div className="text-md font-medium text-gray-900 dark:text-white">
                            {vehicleInformation}
                        </div>
                    </div>
                    <div className="mb-2">
                        <span className="text-md text-gray-500 dark:text-gray-400">Assembly Information</span>
                        <div className="text-md font-medium text-gray-900 dark:text-white">
                            {assemblyInformation}
                        </div>
                    </div>
                </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg col-span-1 md:col-span-2">
                <div className="mb-2">
                    <span className=" text-md text-blue-500 dark:text-blue-400 " >Customer Information</span>
                </div>
                <div className="mb-2">
                    <span className="text-md text-gray-500 dark:text-gray-400">Customer Name</span>
                    <div className="text-md font-medium text-gray-900 dark:text-white">
                        {caseData.customerData?.customerName || "-"}
                    </div>
                </div>
                <div className="mb-2">
                    <span className="text-md text-gray-500 dark:text-gray-400">Customer Contact Method</span>
                    <div className="text-md font-medium text-gray-900 dark:text-white">
                        {caseData.customerData?.contractMethod || "-"}
                    </div>
                    {caseData.customerData?.contractMethod == "Email" ?
                        <>
                            <span className="text-md text-gray-500 dark:text-gray-400">Customer Email</span>
                            <div className="text-md font-medium text-gray-900 dark:text-white">
                                {caseData.customerData?.email || "-"}
                            </div>
                        </> : null}
                    {caseData.customerData?.contractMethod == "Phone Number" ?
                        <>
                            <span className="text-md text-gray-500 dark:text-gray-400">Customer Phone Number</span>
                            <div className="text-md font-medium text-gray-900 dark:text-white">
                                {caseData.customerData?.phoneNumber || "-"}
                            </div>
                        </> : null}
                </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg col-span-1 md:col-span-2">
                <div className="mb-2">
                    <span className="text-md text-blue-500 dark:text-blue-400">Attachments</span>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                    {Array.isArray(attachments) && attachments.length > 0 ? (
                        attachments.map((attachment, index) => {
                            const imageUrl = attachment instanceof File
                                ? URL.createObjectURL(attachment)
                                : String(attachment);
                            return (
                                <a key={index} href={imageUrl} target="_blank" rel="noopener noreferrer">
                                    <img
                                        src={imageUrl}
                                        alt={`Attachment ${index + 1}`}
                                        className="w-24 h-24 object-cover rounded-lg border border-gray-200 dark:border-gray-700 hover:opacity-80 transition-opacity"
                                    />
                                </a>
                            );
                        })
                    ) : (
                        <div className="text-sm text-gray-500 dark:text-gray-400">No attachments found.</div>
                    )}
                </div>
            </div>
        </div>
    );
};


// --- Sub-component: CaseTypeFormSection ---
interface CaseTypeFormSectionProps {
    caseType: string;
    handleCaseTypeChange: (newValue: string) => void;
    handleGetTypeFormData: (getTypeData: FormField) => void;
    hadleIsFillGetType: (isFill: boolean) => void;
    selectedCaseTypeForm: FormField | undefined;
    editFormData: boolean; // Prop to control if the form is editable
}

const CaseTypeFormSection: React.FC<CaseTypeFormSectionProps> = ({
    caseType,
    handleCaseTypeChange,
    handleGetTypeFormData,
    hadleIsFillGetType,
    selectedCaseTypeForm,
    editFormData
}) => {
    const caseTypeOptions = useMemo(() => Array.from(new Set(caseTypeMock.map((item: formType) => item.caseType))), []);

    return (
        <>
            <div className="text-white dark:text-gray-300">
                <h3 className="mb-2 m-3 block text-gray-900 dark:text-gray-400">Service Type :{requireElements}</h3>
                <SearchableSelect
                    options={caseTypeOptions}
                    value={caseType}
                    onChange={handleCaseTypeChange}
                    placeholder={"Select a FormType"}
                    disabled={!editFormData}
                    className="2xsm:mx-3"
                />

            </div>
            {selectedCaseTypeForm && (
                <DynamicForm
                    initialForm={selectedCaseTypeForm}
                    edit={false}
                    editFormData={true}
                    enableFormTitle={false}
                    onFormChange={handleGetTypeFormData}
                    returnFormAllFill={hadleIsFillGetType}
                />
            )}
        </>
    );
};


interface CustomerInputProps {
    customerData: CustomerData;
    handleCustomerDataChange: (newValue: CustomerData) => void;
}

const CustomerInput: React.FC<CustomerInputProps> = ({
    customerData,
    handleCustomerDataChange,
}) => {
    const customerMock = ["John Smith", "Elina Opasa", "Artra Yui"];
    const contractMethodMock = ["Phone Number", "Iot Alert", "Chat", "Email"];

    const handleCustomerDataNameChange = (data: string) => {
        handleCustomerDataChange({ ...customerData, customerName: data });
    };

    const handleCustomerDataContractMethodeChange = (data: any) => {
        handleCustomerDataChange({ ...customerData, contractMethod: data });
    };
    const handleCustomerDataPhoneChange = (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value === "" ? undefined : Number(e.target.value);
        handleCustomerDataChange({ ...customerData, phoneNumber: value });
    };

    const handleCustomerEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value === "" ? undefined : e.target.value;
        handleCustomerDataChange({ ...customerData, email: value });
    };
    return (
        <div className=" text-gray-900 dark:text-gray-400 mx-3">
            <h3 className="mb-2 md:ml-3">Customer Name : <span className=" text-red-500 text-sm font-bold">*</span></h3>
            <SearchableSelect
                options={customerMock}
                value={customerData.customerName}
                onChange={handleCustomerDataNameChange}
                className="sm:my-3 md:ml-3"
                placeholder={"Enter Customer Name"}
            />
            <h3 className="mb-2 md:ml-3">Contact Method : <span className=" text-red-500 text-sm font-bold">*</span></h3>
            <SearchableSelect
                options={contractMethodMock}
                className="sm:my-3 md:ml-3"
                value={customerData.contractMethod}
                onChange={handleCustomerDataContractMethodeChange}
            />
            {customerData.contractMethod === "Phone Number" &&
                <div className="w-auto md:mr-4 ">
                    <h3 className="mb-2 md:ml-3 ">Customer Phone Number : <span className=" text-red-500 text-sm font-bold">*</span></h3>
                    <Input
                        type="number"
                        value={customerData.phoneNumber}
                        onChange={handleCustomerDataPhoneChange}
                        placeholder="Enter Phone Number"
                        className="md:ml-3  shadow appearance-none border rounded  text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent dark:text-gray-300 dark:border-gray-800 dark:bg-gray-900 disabled:text-gray-500 disabled:border-gray-300 disabled:opacity-40 disabled:bg-gray-100 dark:disabled:bg-gray-800 dark:disabled:text-gray-400 dark:disabled:border-gray-700" />
                </div>
            }
            {customerData.contractMethod === "Email" &&
                <div className="w-auto md:mr-4  ">
                    <h3 className="mb-2 md:ml-3">Customer Email : <span className=" text-red-500 text-sm font-bold">*</span></h3>
                    <Input
                        type="email"
                        onChange={handleCustomerEmailChange}
                        value={customerData.email}
                        placeholder="Enter Email"
                        className="md:ml-3 md:mr-3 shadow appearance-none border rounded  text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent dark:text-gray-300 dark:border-gray-800 dark:bg-gray-900 disabled:text-gray-500 disabled:border-gray-300 disabled:opacity-40 disabled:bg-gray-100 dark:disabled:bg-gray-800 dark:disabled:text-gray-400 dark:disabled:border-gray-700 " />
                </div>
            }
        </div>
    );
};

// --- Main Component: CaseDetailView ---
export default function CaseDetailView({ onBack, caseData }: { onBack?: () => void, caseData?: CaseItem }) {
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [editFormData, setEditFormData] = useState<boolean>(!caseData);
    const [assignedOfficers, setAssignedOfficers] = useState<Officer[]>([]);
    const [showOfficersData, setShowOFFicersData] = useState<Officer | null>(null);
    const [isCustomerPanelOpen, setIsCustomerPanelOpen] = useState(false);
    const [isValueFill, setIsValueFill] = useState({ getType: false, dynamicForm: false });
    const [showToast, setShowToast] = useState(false);

    // State for the data currently being displayed
    const [displayedCaseData, setDisplayedCaseData] = useState<CaseItem | undefined>(caseData);

    // States for form inputs
    const [caseType, setCaseType] = useState<string>('');
    const [caseTypeData, setCaseTypeData] = useState<formType | undefined>(caseData?.caseType);
    const [formData, setFormData] = useState<FormField | undefined>();
    const [serviceCenterData, setServiceCenterData] = useState<string>("");
    const [customerData, setCustomerData] = useState<CustomerData>({
        customerName: "",
        contractMethod: "",
        phoneNumber: undefined,
        email: undefined,
    });
    
    const serviceCenterMock = ["Bankkok", "Phisanulok", "Chiang mai"];

    // Effect to initialize and reset form states when caseData changes
    useEffect(() => {
        setDisplayedCaseData(caseData);
        if (caseData) {
            setCaseType(caseData.caseType?.caseType || '');
            setCaseTypeData(caseData.caseType);
            setFormData(caseData.formData);
            setServiceCenterData(caseData.serviceCenter || "");
            setCustomerData(caseData.customerData || { customerName: "", contractMethod: "" });
        }
    }, [caseData]);
    
    const selectedCaseTypeForm = useMemo(() => {
        if (caseTypeData?.caseType === caseType) { 
            return caseTypeData;
        }
        return caseTypeMock.find(form => form.caseType === caseType);
    }, [caseType, caseData,caseTypeData]);

    // Handlers
    const handleSelectOfficer = useCallback((selectedOfficer: Officer) => {
        setShowOFFicersData(prev => (prev?.id === selectedOfficer.id ? null : selectedOfficer));
    }, []);

    const handleAssignOfficers = useCallback((selectedOfficerIds: string[]) => {
        const selected = mockOfficers.filter(o => selectedOfficerIds.includes(o.id));
        setAssignedOfficers(selected);
        setShowAssignModal(false);
    }, []);

    const handleSaveChanges = useCallback(() => {
        if (!isValueFill.dynamicForm || !isValueFill.getType) {
            setShowToast(true);
            return;
        }

        const updatedCaseData = {
            ...(displayedCaseData as CaseItem),
            formData: formData!,
            caseType: caseTypeData! ,
            customerData: customerData,
            serviceCenter: serviceCenterData,
        };
        setDisplayedCaseData(updatedCaseData);
        setEditFormData(false);
    }, [isValueFill, formData, caseTypeData, customerData, serviceCenterData, caseType, displayedCaseData]);

    const handleEditClick = useCallback(() => {
        // If cancelling edit, reset form states to match the displayed data
        if (editFormData && displayedCaseData) {
            setCaseType(displayedCaseData.caseType?.caseType || '');
            setCaseTypeData(displayedCaseData.caseType);
            setFormData(displayedCaseData.formData);
            setServiceCenterData(displayedCaseData.serviceCenter || "");
            setCustomerData(displayedCaseData.customerData || { customerName: "", contractMethod: "" });
        }
        setEditFormData(prev => !prev);
    }, [editFormData, displayedCaseData]);

    const handleCaseTypeChange = useCallback((newValue: string) => {
        setCaseType(newValue);
    }, []);

    const handleDynamicFormChange = useCallback((data: FormField) => {
        setFormData(prevData => {
            // By comparing the stringified versions, we prevent a state update
            // if the new data is structurally identical to the old, breaking the loop.
            if (JSON.stringify(prevData) !== JSON.stringify(data)) {
                return data;
            }
            return prevData; // Return the old state to prevent a re-render
        });
    }, []);
    const handleIsFillGetType = useCallback((isFill: boolean) => setIsValueFill(prev => ({ ...prev, getType: isFill })), []);
    const handleIsFillDynamicForm = useCallback((isFill: boolean) => setIsValueFill(prev => ({ ...prev, dynamicForm: isFill })), []);
    const handleGetTypeFormData = useCallback((getTypeData: FormField) => {
        const newData = { ...getTypeData, caseType: caseType };
        setCaseTypeData(prevData => {
            // Same logic here to prevent loops from the other DynamicForm
            if (JSON.stringify(prevData) !== JSON.stringify(newData)) {
                return newData;
            }
            return prevData;
        });
        
    }, [caseType]);
    const handleSetServiceCenter = useCallback((data: string) => setServiceCenterData(data), []);
    const handleCustomerDataChange = useCallback((data: CustomerData) => setCustomerData(data), []);

    return (
        <div className="flex flex-col h-screen">
            <PageMeta title="Case Detail" description="Case Detail Page" />
            {showToast && <Toast message="Please enter all required data." type="error" duration={3000} onClose={() => setShowToast(false)} />}
            
            <div className="flex-shrink-0">
                <PageBreadcrumb pageTitle="Create Case" />
                <div className="px-4 sm:px-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            {onBack && (
                                <Button variant="ghost" size="sm" onClick={onBack}>
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Back
                                </Button>
                            )}
                            {caseData && <div className="relative bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-2 rounded-t-lg border-t border-l border-r border-gray-300 dark:border-gray-600 text-sm font-medium">
                                Case #{caseData.id.toString().padStart(10, '0')}
                                <button className="ml-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">×</button>
                            </div>}
                        </div>
                        <div className="md:hidden">
                            <Button className="mb-2" variant="outline" size="sm" onClick={() => setIsCustomerPanelOpen(true)}>
                                <User className="w-4 h-4 mr-2" />
                                View Customer
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-hidden bg-white dark:bg-gray-800 md:flex rounded-2xl custom-scrollbar">
                <div className="flex flex-col md:flex-row h-full gap-1 w-full">
                    <div className="overflow-y-auto w-full md:w-2/3 lg:w-3/4 custom-scrollbar">
                        <div className="pr-0">
                            <div className="px-4 pt-6">
                                {displayedCaseData && <CaseCard onAssignClick={() => setShowAssignModal(true)} onEditClick={handleEditClick} caseData={displayedCaseData} editFormData={editFormData} />}
                                {(caseData && assignedOfficers.length > 0) && (
                                    <div className="mb-4 flex flex-wrap gap-2 items-center">
                                        <span className="font-medium text-gray-700 dark:text-gray-200 text-sm">
                                            Assigned Officer{assignedOfficers.length > 1 ? "s" : ""}:
                                        </span>
                                        {assignedOfficers.map(officer => (
                                            <button
                                                key={officer.id}
                                                className="flex items-center px-2 py-1 rounded bg-blue-100 dark:bg-gray-900 text-blue-700 dark:text-blue-200 text-xs font-medium w-fit"
                                            >   <div onClick={() => handleSelectOfficer(officer)}>
                                                    {showOfficersData?.id === officer.id ? <ChevronUp /> : <ChevronDown />}
                                                </div>
                                                {getAvatarIconFromString(officer.name, "bg-blue-600 dark:bg-blue-700 mx-1")}
                                                {officer.name}
                                                <Button size="xxs" className="mx-1" variant="outline-no-transparent" >Acknowledge</Button>
                                                <Button
                                                    onClick={() => setAssignedOfficers(prev => prev.filter(o => o.id !== officer.id))}
                                                    className="ml-2"
                                                    title="Remove"
                                                    variant="outline-no-transparent"
                                                    size="xxs"
                                                >
                                                    Cancel
                                                </Button>
                                            </button>
                                        ))}
                                    </div>
                                )}
                                {showOfficersData && <CommandInformation className="my-2" />}
                            </div>
                            <div className="px-4">
                                {editFormData ? (
                                    <>
                                        <CaseTypeFormSection
                                            caseType={caseType}
                                            handleCaseTypeChange={handleCaseTypeChange}
                                            handleGetTypeFormData={handleGetTypeFormData}
                                            hadleIsFillGetType={handleIsFillGetType}
                                            selectedCaseTypeForm={selectedCaseTypeForm}
                                            editFormData={editFormData}
                                        />
                                        <div className=" sm:grid grid-cols-2">
                                            <div>
                                                <h3 className=" text-gray-900 dark:text-gray-400 mx-3 ">Service Center : </h3>
                                                <SearchableSelect
                                                    options={serviceCenterMock}
                                                    value={serviceCenterData}
                                                    onChange={handleSetServiceCenter}
                                                    placeholder={"Select a Service Center"}
                                                    className="2xsm:m-3"
                                                />
                                            </div>
                                            <CustomerInput handleCustomerDataChange={handleCustomerDataChange} customerData={customerData} />
                                        </div>
                                        <DynamicForm
                                            initialForm={formData || createCaseJson}
                                            edit={false}
                                            editFormData={true}
                                            enableFormTitle={false}
                                            onFormChange={handleDynamicFormChange}
                                            returnFormAllFill={handleIsFillDynamicForm}
                                        />

                                        <div className="flex justify-end mb-3 mr-3">
                                            {caseData?<Button variant="success" onClick={handleSaveChanges}>
                                                Save Changes
                                            </Button>:<Button variant="success" onClick={undefined}>
                                                Submit
                                            </Button>}
                                            
                                        </div>
                                    </>
                                ) : (
                                    <FormFieldValueDisplay caseData={displayedCaseData} />
                                )}
                            </div>
                        </div>
                    </div>

                    <div className={`
                        fixed top-0 right-0 h-full w-[90%] max-w-md z-40
                        transition-transform duration-300 ease-in-out
                        md:relative md:h-auto md:w-1/3 lg:w-1/4 md:translate-x-0 md:z-auto
                        md:border-l md:border-gray-200 md:dark:border-gray-800 px-1
                        ${isCustomerPanelOpen ? 'translate-x-0' : 'translate-x-full'}
                    `}>
                        {caseData
                            ? <CustomerPanel type="edit" onClose={() => setIsCustomerPanelOpen(false)} />
                            : <CustomerPanel type="add" onClose={() => setIsCustomerPanelOpen(false)} />}
                    </div>
                </div>
            </div>

            {isCustomerPanelOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-30 md:hidden"
                    onClick={() => setIsCustomerPanelOpen(false)}
                ></div>
            )}

            <AssignOfficerModal
                open={showAssignModal}
                onOpenChange={setShowAssignModal}
                officers={mockOfficers}
                onAssign={handleAssignOfficers}
                assignedOfficers={assignedOfficers}
            />
        </div>
    );
}