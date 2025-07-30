// CaseDetailView.tsx - Refactored and Enhanced

"use client"

import { useCallback, useMemo, useState, useEffect, ChangeEvent, useRef } from "react" // Import useEffect
import {
    ArrowLeft,
    Clock,
    User as User_Icon,
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
import { formType, IndividualFormField, FormField } from "@/components/interface/FormField"
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
// Corrected import path
import Toast from "../toast/Toast"
import Input from "../form/input/InputField"
import FormViewer from "../form/dynamic-form/FormViewValue"
import DateStringToDateFormat, { TodayDate } from "../date/DateToString"
import { SearchableSelect } from "../SearchSelectInput/SearchSelectInput"
import { Modal } from "../ui/modal"
import ProgressStepPreview from "../progress/ProgressBar"
import { CaseSubType, CaseType, CaseTypeSubType } from "../interface/CaseType"
import { useGetSubTypeQuery, useGetTypeQuery } from "@/store/api/caseApi"
import { useGetUsersQuery } from "@/store/api/userApi"
import type { Custommer, User } from "@/types";
import React from "react"
const commonInputCss = "shadow appearance-none border rounded  text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent dark:text-gray-300 dark:border-gray-800 dark:bg-gray-900 disabled:text-gray-500 disabled:border-gray-300 disabled:opacity-40 disabled:bg-gray-100 dark:disabled:bg-gray-800 dark:disabled:text-gray-400 dark:disabled:border-gray-700"
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

function mergeCaseTypeAndSubType(
    caseTypes: CaseType[],
    caseSubTypes: CaseSubType[]
): CaseTypeSubType[] {
    const mergedList: CaseTypeSubType[] = [];

    caseTypes.forEach(type => {
        const matchingSubTypes = caseSubTypes.filter(sub => sub.typeId === type.typeId);

        matchingSubTypes.forEach(sub => {
            mergedList.push({
                CaseTypeid: type.id,
                CaseSubTypeid: sub.id,
                typeId: type.typeId,
                orgId: type.orgId,
                en: `${type.en} - ${sub.en}`,
                th: `${type.th} - ${sub.th}`,
                activeType: type.active,
                activeSubType: sub.active,
                wfId: sub.wfId,
                caseSla: sub.caseSla,
                priority: sub.priority,
                userSkillList: sub.userSkillList,
                unitPropLists: sub.unitPropLists
            });
        });
    });

    return mergedList;
}


const getTypeSupType = () => {

    try {
        let caseMatched
        const { data: caseTypes } = useGetTypeQuery(null);
        const { data: subTypes } = useGetSubTypeQuery(null);
        if (caseTypes?.data && subTypes?.data) {
            caseMatched = mergeCaseTypeAndSubType(caseTypes.data, subTypes.data);
        }
        // console.log("Matched Case Types with Subtypes:", caseMatched);
        return caseMatched
    } catch (error) {
        console.error("Failed to fetch case types:", error);
    }

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
    setDisplayCaseData?: React.Dispatch<React.SetStateAction<CaseItem | undefined>>;
    caseData: CaseItem;
    editFormData: boolean;
}

const CaseCard: React.FC<CaseCardProps> = ({ onAssignClick, onEditClick, caseData, editFormData, setDisplayCaseData }) => {
    const [showComment, setShowComment] = useState<boolean>(false);

    const handleCommentToggle = () => {
        setShowComment(!showComment);
    };
    const progressSteps = [
        { id: 1, title: "Received", completed: true },
        { id: 2, title: "Assigned", completed: true },
        { id: 3, title: "Acknowledged", completed: false, current: true },
        { id: 4, title: "En Route", completed: false },
        { id: 5, title: "On Site", completed: false },
        { id: 6, title: "Completed", completed: false }
    ];


    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleButtonClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;

        if (files && files.length > 0) {
            const newFilesArray = Array.from(files); // Convert FileList to File[]

            setDisplayCaseData?.((prev) => {
                if (!prev) return prev;

                const currentFiles = prev.attachFile ?? [];

                return {
                    ...prev,
                    attachFile: [...currentFiles, ...newFilesArray], // Allow duplicates
                };
            });
            e.target.value = '';
        }
    };


    return (
        <div className={`mb-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border-l-4 ${getPriorityBorderColorClass(caseData.priority)}`}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3">
                <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{caseData.title}</h2>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>Create Date: {DateStringToDateFormat(caseData.date)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                            <User_Icon className="w-4 h-4" />
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
            <ProgressStepPreview progressSteps={progressSteps} />

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-3 sm:space-y-0">
                <div className="flex flex-wrap gap-2">
                    <Button onClick={handleCommentToggle} size="sm" variant="outline" className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300">
                        {showComment ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Comment
                    </Button>
                    <div>
                        <Button
                            size="sm"
                            variant="outline"
                            className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                            onClick={handleButtonClick}
                        >
                            <Paperclip className="w-4 h-4 mr-2" />
                            Attach File
                        </Button>
                        <input
                            type="file"
                            accept="image/*"
                            ref={fileInputRef}
                            multiple
                            onChange={handleFileChange}
                            style={{ display: "none" }}
                        />
                    </div>
                    <Button onClick={onEditClick} size="sm" variant="outline" className="border-blue-500 dark:border-blue-600 text-blue-500 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900">
                        {editFormData ? "Cancel Edit" : "Edit"}
                    </Button>
                </div>
                <Button onClick={onAssignClick} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-1">
                    <User_Icon className="w-4 h-4" />
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
                <span className=" text-md text-blue-500 dark:text-blue-400 " >Service Information</span>
                <div className="mb-2">
                    <span className="text-md text-gray-500 dark:text-gray-400">Sevice Types : {requireElements}</span>
                    <div className="text-md font-medium text-gray-900 dark:text-white">{caseData?.caseType?.caseType}</div>
                </div>
                {caseData.caseType && <FormViewer formData={caseData.caseType} />}
                <div className="mb-2">
                    <span className="text-md text-gray-500 dark:text-gray-400">Service Detail {requireElements}</span>
                    <div className="text-md font-medium text-gray-900 dark:text-white">
                        {caseData.description}

                    </div>
                </div>
                <div className="mb-2">
                    <span className="text-md text-gray-500 dark:text-gray-400">Request Service Date {requireElements}</span>
                    <div className="text-md font-medium text-gray-900 dark:text-white">
                        {caseData.date != "" ?
                            DateStringToDateFormat(caseData.date) :
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
                                : (caseData.location ?? "-")}
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
                        {caseData.customerData?.name || "-"}
                    </div>
                </div>

                <span className="text-md text-gray-500 dark:text-gray-400">Customer Phone Number</span>
                <div className="text-md font-medium text-gray-900 dark:text-white">
                    {caseData.customerData?.mobileNo || "-"}
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
    selectedCaseTypeForm: formType | undefined;
    editFormData: boolean; // Prop to control if the form is editable
    caseTypeSupTypeData: CaseTypeSubType[];
}

const CaseTypeFormSection: React.FC<CaseTypeFormSectionProps> = ({
    caseType,
    handleCaseTypeChange,
    handleGetTypeFormData,
    hadleIsFillGetType,
    selectedCaseTypeForm,
    editFormData,
    caseTypeSupTypeData
}) => {
    const caseTypeOptions = useMemo(() => {
        if (!caseTypeSupTypeData?.length) return [];
        return caseTypeSupTypeData.map(item => item.th);
    }, [caseTypeSupTypeData]);


    return (
        <>
            <div className="text-white dark:text-gray-300">
                <div className="flex justify-between m-3 text-gray-900 dark:text-gray-400">
                    <h3 className="mb-2  block text-gray-900 dark:text-gray-400">Service Type :{requireElements}</h3>
                    {selectedCaseTypeForm && (
                        <div className="flex">
                            <span className="mr-2">Priority</span>
                            <div className={`w-5 h-5 mx-1 p-3 ${getPriorityColorClass(selectedCaseTypeForm.priority)} rounded-lg`}></div>
                        </div>
                    )}
                </div>
                <SearchableSelect
                    options={caseTypeOptions}
                    value={caseType}
                    onChange={handleCaseTypeChange}
                    placeholder={"Select a FormType"}
                    disabled={!editFormData}
                    className=" 2xsm:mx-3 mb-2"
                />

            </div>
            {selectedCaseTypeForm && (
                <>
                    <DynamicForm
                        initialForm={selectedCaseTypeForm}
                        edit={false}
                        editFormData={true}
                        enableFormTitle={false}
                        onFormChange={handleGetTypeFormData}
                        returnFormAllFill={hadleIsFillGetType}
                    />

                </>
            )}
        </>
    );
};


interface PreviewDataBeforeSubmitProps {
    caseData?: CaseItem;
    submitButton?: () => void;
}

const PreviewDataBeforeSubmit: React.FC<PreviewDataBeforeSubmitProps> = ({
    caseData,
    submitButton
}) => {
    // const progressSteps = [
    //     { id: 1, title: "Received", completed: true },
    //     { id: 2, title: "Assigned", completed: true },
    //     { id: 3, title: "Acknowledged", completed: false, current: true },
    //     { id: 4, title: "En Route", completed: false },
    //     { id: 5, title: "On Site", completed: false },
    //     { id: 6, title: "Completed", completed: false }
    // ];
    return (
        <div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3">
                <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{caseData?.title}</h2>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>Create Date: {caseData && DateStringToDateFormat(caseData?.date)}</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center space-x-2 text-center mt-3 mr-[10%] sm:mt-0">
                    {caseData &&
                        <Badge color={`${getTextPriority(caseData?.priority).color}`}>
                            {getTextPriority(caseData?.priority).level} Priority
                        </Badge>}
                    {caseData?.status &&
                        <Badge variant="outline" >
                            {caseData?.status}
                        </Badge>}
                </div>
            </div>
            {/* <ProgressStepPreview progressSteps={progressSteps} className="border-t-1 border-b-1 p-2 dark:border-gray-500" /> */}
            {(caseData?.attachFile && caseData) && (
                <>
                    <span className="font-medium text-gray-700 dark:text-gray-200 text-sm">
                        Attach File :
                    </span>

                    {Array.isArray(caseData.attachFile) && caseData.attachFile.length > 0 && (
                        <div className="mt-2 mb-3">
                            <div className="grid grid-cols-3 gap-2">
                                {caseData.attachFile.map((file: File, index: number) => (
                                    <div key={file.name + index} className="relative group">
                                        <img
                                            src={URL.createObjectURL(file)}
                                            alt={`Upload ${index + 1}`}
                                            className="w-full h-20 object-cover rounded border border-gray-600"
                                        />

                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}
            <FormFieldValueDisplay caseData={caseData} />
            {submitButton &&
                <div className="flex justify-end ">
                    <Button onClick={submitButton}>Submit</Button>
                </div>
            }
        </div>
    );
};


interface CustomerInputProps {
    customerData: Custommer
    listCustomerData: User[];
    handleCustomerDataChange: (newValue: Custommer) => void;
}

const CustomerInput: React.FC<CustomerInputProps> = ({
    customerData,
    listCustomerData,
    handleCustomerDataChange,
}) => {
    // Improved customerOptions to map label and value properly
    const customerOptions = useMemo(() =>
        listCustomerData.map(user => ({
            label: user.firstName + " " + user.lastName,
            value: user.id, // Use ID as value for robust selection
            mobileNo: user.mobileNo,
            email: user.email // Also include email for potential auto-fill
        })),
        [listCustomerData]
    );

    const contractMethodMock = ["Iot Alert", "Chat", "Email"];

    const handleCustomerDataNameChange = (selectedId: string) => {
        const selectedCustomer = customerOptions.find(option => option.value === selectedId);

        if (selectedCustomer) {
            handleCustomerDataChange({
                ...customerData,
                name: selectedCustomer.label, // Set the full name for display
                mobileNo: String(selectedCustomer.mobileNo), // Auto-fill phone number
                email: selectedCustomer.email // Auto-fill email if available
            });
        } else {
            // Clear name, mobileNo, and email if nothing is selected or an invalid option
            handleCustomerDataChange({
                ...customerData,
                name: "",
                mobileNo: undefined,
                email: undefined
            });
        }
    };

    const handleCustomerDataContractMethodeChange = (data: string) => {
        handleCustomerDataChange({ ...customerData, contractMethod: data as "Email" | "Chat" | "Iot Alert" | "Phone Number" | ""});
    };

    const handleCustomerDataPhoneChange = (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value === "" ? undefined : e.target.value;
        let updatedCustomerData = { ...customerData, mobileNo: value };
        if (value !== undefined) {
            const matchingCustomer = listCustomerData.find(
                (customer) => customer.mobileNo === value
            );
            if (matchingCustomer) {
                updatedCustomerData = {
                    ...updatedCustomerData,
                    name: `${matchingCustomer.firstName} ${matchingCustomer.lastName}`,
                    email: matchingCustomer.email // Auto-fill email if available
                };
            } else {
                // If no match, clear the customer name and email
                updatedCustomerData = {
                    ...updatedCustomerData,
                    name: "",
                    email: undefined
                };
            }
        } else {
            // If phone number is cleared, clear name and email as well
            updatedCustomerData = {
                ...updatedCustomerData,
                name: "",
                email: undefined
            };
        }

        handleCustomerDataChange(updatedCustomerData);
    };

    const handleCustomerEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value === "" ? undefined : e.target.value;
        handleCustomerDataChange({ ...customerData, email: value });
    };

    return (
        <div className=" text-gray-900 dark:text-gray-400 mx-3">
            <div className="w-auto md:mr-2">
                <h3 className="mb-2 ">Customer Name : <span className=" text-red-500 text-sm font-bold">*</span></h3>
                <SearchableSelect
                    // Pass only labels for display, but capture the ID on change
                    options={customerOptions.map(option => option.label)}
                    value={customerData.name || ""} // Display the name
                    onChange={(label) => {
                        // Find the ID based on the selected label to pass to handleCustomerDataNameChange
                        const selectedOption = customerOptions.find(option => option.label === label);
                        handleCustomerDataNameChange(selectedOption ? selectedOption.value : "");
                    }}
                    placeholder={"Enter Customer Name"}
                />
            </div>
            <div className="w-auto md:mr-2">
                <h3 className="my-2 ">Phone Number : <span className=" text-red-500 text-sm font-bold">*</span></h3>
                <Input
                    value={customerData.mobileNo ?? ""}
                    onChange={(e) => { handleCustomerDataPhoneChange(e) }}
                    className={`${commonInputCss}`}
                    placeholder={"Enter Customer Phone Number"}
                    required={true}
                />
            </div>
            <div className="w-auto md:mr-2">
                <h3 className="my-2">Contact Method : <span className=" text-red-500 text-sm font-bold">*</span></h3>
                <SearchableSelect
                    options={contractMethodMock}
                    className="sm:my-3"
                    value={customerData.contractMethod ?? ""}
                    onChange={(e) => handleCustomerDataContractMethodeChange(e)}
                />
            </div>
            {customerData.contractMethod === "Email" &&
                <div className="w-auto md:mr-2  ">
                    <h3 className="my-2">Customer Email : <span className=" text-red-500 text-sm font-bold">*</span></h3>
                    <Input
                        type="email"
                        onChange={handleCustomerEmailChange}
                        value={customerData.email || ""}
                        placeholder="Enter Email"
                        className={commonInputCss}
                        required={true}
                    />
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
    const [showPreviewData, setShowPreviewData] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [toastType, setToastType] = useState<"success" | "error" | "info">("info");
    const [updateCaseData, setUpdateCaseData] = useState<CaseItem | undefined>(caseData);
    const caseTypeSupTypeData = getTypeSupType()
    const [displayedCaseData, setDisplayedCaseData] = useState<CaseItem | undefined>(caseData);
    const [formDataChange, setFormDataChange] = useState<FormField | undefined>();
    const [caseType, setCaseType] = useState<{ caseType: string, priority: number }>({ caseType: "", priority: 0 });
    const [caseTypeData, setCaseTypeData] = useState<formType | undefined>(caseData?.caseType);
    const [formData, setFormData] = useState<FormField | undefined>();
    const [serviceCenterData, setServiceCenterData] = useState<string>("");
    const [customerData, setCustomerData] = useState<Custommer>()
    const [listCustomerData, setListCustomerData] = useState<User[]>([])
    const { data: usersData } = useGetUsersQuery({
        start: 0,
        length: 100
    });
    useEffect(() => {
        if (usersData?.data) {
            setListCustomerData(usersData.data);
        }
        console.log(usersData?.data)
    }, [usersData]);
    const serviceCenterMock = ["Bankkok", "Phisanulok", "Chiang mai"];

    useEffect(() => {
        setDisplayedCaseData(caseData);
        if (caseData) {
            const newCaseType = caseData.caseType ?
                { caseType: caseData.caseType.caseType || "", priority: caseData.caseType.priority || 0 } :
                { caseType: "", priority: 0 };

            setCaseType(newCaseType);
            setCaseTypeData(caseData.caseType);
            setFormData(caseData.formData);
            setServiceCenterData(caseData.serviceCenter || "");
            setCustomerData(caseData.customerData);

        } else {
            const draft = localStorage.getItem("Create Case");
            if (draft) {
                const parsedDraft = JSON.parse(draft);
                setCaseType(parsedDraft.caseType?.caseType || '');
                setCaseTypeData(parsedDraft.caseType);
                setFormData(parsedDraft.formData);
                setServiceCenterData(parsedDraft.serviceCenter || "");
                setCustomerData(parsedDraft.customerData || { customerName: "", contractMethod: "" });
                setDisplayedCaseData(parsedDraft);
            }
        }
    }, [caseData]);


    const selectedCaseTypeForm = useMemo(() => {
        if (caseTypeData?.caseType === caseType.caseType) {
            return caseTypeData;
        }
        return caseTypeMock.find(form => form.caseType === caseType.caseType);
    }, [caseType, displayedCaseData]);


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
        setShowPreviewData(false)
        let errorMessage = "";
        if (!caseType.caseType) {
            errorMessage = "Please select a Service Type.";
        } else if (!displayedCaseData?.description?.trim()) {
            errorMessage = "Please enter Service Details.";
        } else if (!displayedCaseData?.date) {
            errorMessage = "Please select a Request Service Date.";
        } else if (!customerData?.name?.trim()) {
            errorMessage = "Please enter Customer Name.";
        } else if (!customerData.mobileNo) {
            errorMessage = "Please enter Customer Phone Number.";
        } else if (!customerData?.contractMethod?.trim()) {
            errorMessage = "Please select a Contact Method.";
        } else if (customerData.email === "Email" && !customerData.email?.trim()) {
            errorMessage = "Please enter Customer Email.";
        } else if ((!isValueFill.dynamicForm && formData) || (!isValueFill.getType && selectedCaseTypeForm)) {
            errorMessage = "Please ensure all dynamic form fields are filled.";
        }

        if (errorMessage) {
            setToastMessage(errorMessage);
            setToastType("error");
            setShowToast(true);
            return;
        }


        setDisplayedCaseData(updateCaseData);
        setEditFormData(false)
        setToastMessage("Changes saved successfully!");
        setToastType("success");
        setShowToast(true);;
    }, [isValueFill, formDataChange, caseTypeData, customerData, serviceCenterData, caseType, displayedCaseData]);

    useEffect(() => {
        const updatedCaseData = {
            ...(displayedCaseData as CaseItem),
            formData: formDataChange!,
            caseType: caseTypeData!,
            customerData: customerData,
            serviceCenter: serviceCenterData,
        };
        setUpdateCaseData(updatedCaseData)
    }, [formDataChange, caseTypeData, customerData, serviceCenterData, caseType])

    const handlePreviewShow = () => {
        setShowPreviewData(true)
    }

    const handleEditClick = useCallback(() => {
        if (displayedCaseData) {
            const newCaseType = displayedCaseData.caseType ?
                { caseType: displayedCaseData.caseType.caseType || "", priority: displayedCaseData.caseType.priority || 0 } :
                { caseType: "", priority: 0 }; // Default object if caseData.caseType is missing


            setCaseType(newCaseType || '');
            setCaseTypeData(displayedCaseData.caseType);
            setFormData(displayedCaseData.formData);
            setServiceCenterData(displayedCaseData.serviceCenter || "");
            setCustomerData(displayedCaseData.customerData);
        }
        setEditFormData(prev => !prev);
    }, [editFormData, displayedCaseData]);

    const handleCaseTypeChange = useCallback((newValue: string) => {
        setCaseType(prevCaseType => ({
            ...prevCaseType,
            caseType: newValue
        }));
    }, []);

    const handleLocationChange = useCallback((data: string) => {
        setDisplayedCaseData((prevDisplayedCaseData) => ({
            ...(prevDisplayedCaseData as CaseItem),
            location: data
        }));
    }, []);

    const handleDetailChange = useCallback((data: string) => {
        setDisplayedCaseData((prevDisplayedCaseData) => ({
            ...(prevDisplayedCaseData as CaseItem),
            description: data
        }));
    }, []);

    const handleServiceDateChange = (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value === "" ? "" : e.target.value;
        setDisplayedCaseData((prevDisplayedCaseData) => ({
            ...(prevDisplayedCaseData as CaseItem),
            date: value
        }));
    };
    const handleServiceDateChangeDefault = (date: string) => {
        const value = date;
        setDisplayedCaseData((prevDisplayedCaseData) => ({
            ...(prevDisplayedCaseData as CaseItem),
            date: value
        }));
        return date
    };


    const handleDynamicFormChange = useCallback((data: FormField) => {
        setFormDataChange(prevData => {
            if (JSON.stringify(prevData) !== JSON.stringify(data)) {
                return data;
            }
            return prevData;
        });
    }, []);
    const handleIsFillGetType = useCallback((isFill: boolean) => setIsValueFill(prev => ({ ...prev, getType: isFill })), []);
    const handleIsFillDynamicForm = useCallback((isFill: boolean) => setIsValueFill(prev => ({ ...prev, dynamicForm: isFill })), []);
    const handleGetTypeFormData = useCallback((getTypeData: FormField) => {
        const newData = { ...getTypeData, caseType: caseType.caseType, priority: caseType.priority };
        setCaseTypeData(prevData => {
            // Same logic here to prevent loops from the other DynamicForm
            if (JSON.stringify(prevData) !== JSON.stringify(newData)) {
                return newData;
            }
            return prevData;
        });

    }, [caseType]);
    const handleSetServiceCenter = useCallback((data: string) => setServiceCenterData(data), []);
    const handleCustomerDataChange = useCallback((data: Custommer) => setCustomerData(data), []);
    const handleSaveDrafts = () => {
        const updatedCaseDataForDraft: CaseItem = {
            ...(displayedCaseData || {} as CaseItem),
            formData: formDataChange || formData!,
            caseType: caseTypeData!,
            customerData: customerData,
            serviceCenter: serviceCenterData,
        };
        setDisplayedCaseData(updatedCaseDataForDraft);
        localStorage.setItem("Create Case", JSON.stringify(updatedCaseDataForDraft));
        setToastMessage("Draft saved successfully!");
        setToastType("info");
        setShowToast(true);

    };
    const handleRemoveFile = (fileNameToRemove: string) => {
        setUpdateCaseData?.((prev) => {
            if (!prev) return prev;

            // Filter out the file to remove by name
            const updatedFiles = (prev.attachFile ?? []).filter(
                (file) => file.name !== fileNameToRemove
            );

            return {
                ...prev,
                attachFile: updatedFiles,
            };
        });
    };

    return (
        <div className="flex flex-col h-screen">
            <PageMeta title="Case Detail" description="Case Detail Page" />
            {showToast && (
                <Toast
                    message={toastMessage}
                    type={toastType}
                    duration={3000}
                    onClose={() => setShowToast(false)}
                />
            )}

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
                                <User_Icon className="w-4 h-4 mr-2" />
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
                                {(caseData && displayedCaseData) && <CaseCard onAssignClick={() => setShowAssignModal(true)} onEditClick={handleEditClick} caseData={displayedCaseData} editFormData={editFormData} setDisplayCaseData={setDisplayedCaseData} />}
                                {(displayedCaseData?.attachFile && displayedCaseData) && (
                                    <div className="mx-3">
                                        <span className="font-medium text-gray-700 dark:text-gray-200 text-sm">
                                            Attach File :
                                        </span>

                                        {Array.isArray(displayedCaseData.attachFile) && displayedCaseData.attachFile.length > 0 && (
                                            <div className="mt-2 mb-3">
                                                <div className="grid grid-cols-3 gap-2">
                                                    {displayedCaseData.attachFile.map((file: File, index: number) => (
                                                        <div key={file.name + index} className="relative group">
                                                            <img
                                                                src={URL.createObjectURL(file)}
                                                                alt={`Upload ${index + 1}`}
                                                                className="w-full h-20 object-cover rounded border border-gray-600"
                                                            />
                                                            <Button
                                                                onClick={() => handleRemoveFile(file.name)}
                                                                className="absolute top-1 right-1 rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                                                size="sm"
                                                                variant="error"
                                                            >
                                                                ×
                                                            </Button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                                {(caseData && assignedOfficers.length > 0) && (
                                    <div className="mb-4 flex flex-wrap gap-2 items-center">
                                        <span className="font-medium text-gray-700 dark:text-gray-200 text-sm">
                                            Assigned Officer{assignedOfficers.length > 1 ? "s" : ""}:
                                        </span>
                                        {assignedOfficers.map(officer => (
                                            <div
                                                key={officer.id}
                                                className="flex items-center px-2 py-1 rounded bg-blue-100 dark:bg-gray-900 text-blue-700 dark:text-blue-200 text-xs font-medium w-fit"
                                            >   <div onClick={() => handleSelectOfficer(officer)}>
                                                    {showOfficersData?.id === officer.id ? <ChevronUp /> : <ChevronDown />}
                                                </div>
                                                {getAvatarIconFromString(officer.name, "bg-blue-600 dark:bg-blue-700 mx-1")}
                                                {officer.name}
                                                <Button size="xxs" className="mx-1" variant="outline-no-transparent" >Acknowledge</Button>
                                                <Button
                                                    onClick={() => {

                                                        setAssignedOfficers(prev => prev.filter(o => o.id !== officer.id));
                                                        if (showOfficersData && showOfficersData.id === officer.id) {
                                                            setShowOFFicersData(null)
                                                        }
                                                    }}
                                                    className="ml-2"
                                                    title="Remove"
                                                    variant="outline-no-transparent"
                                                    size="xxs"
                                                >
                                                    Cancel
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {showOfficersData && <CommandInformation className="my-2" />}
                            </div>
                            <div className="px-4">
                                {editFormData ? (
                                    <>

                                        <CaseTypeFormSection
                                            caseType={caseType.caseType}
                                            handleCaseTypeChange={handleCaseTypeChange}
                                            handleGetTypeFormData={handleGetTypeFormData}
                                            hadleIsFillGetType={handleIsFillGetType}
                                            selectedCaseTypeForm={selectedCaseTypeForm}
                                            editFormData={editFormData}
                                            caseTypeSupTypeData={caseTypeSupTypeData ?? []}
                                        />
                                        <div className="pr-7">
                                            <h3 className=" text-gray-900 dark:text-gray-400 mx-3 ">Service Details: {requireElements}</h3>
                                            <textarea
                                                onChange={(e) => handleDetailChange(e.target.value)}
                                                value={displayedCaseData?.description}
                                                placeholder="Enter Location"
                                                className={`w-full mx-3 my-2 h-20 p-2 ${commonInputCss}`}
                                                required={true} // Added required attribute
                                            ></textarea>
                                        </div>
                                        <div className="sm:grid grid-cols-2">
                                            <div >
                                                <h3 className="w-auto text-gray-900 dark:text-gray-400 mx-3 ">Service Center : </h3>
                                                <SearchableSelect
                                                    options={serviceCenterMock}
                                                    value={serviceCenterData}
                                                    onChange={handleSetServiceCenter}
                                                    placeholder={"Select a Service Center"}
                                                    className="2xsm:m-3"
                                                />
                                                <div className="pr-6">
                                                    <h3 className=" text-gray-900 dark:text-gray-400 mx-3 ">Location Infomation : </h3>
                                                    <textarea
                                                        onChange={(e) => handleLocationChange(e.target.value)}
                                                        value={displayedCaseData?.location}
                                                        placeholder="Enter Location"
                                                        className={`w-full mx-3 my-2 h-20 p-2 ${commonInputCss}`}
                                                    ></textarea>
                                                </div>
                                                <div className="px-3">
                                                    <h3 className=" text-gray-900 dark:text-gray-400 mb-3">Request Service Date : {requireElements}</h3>
                                                    <Input
                                                        required={true}
                                                        type="datetime-local"
                                                        className={`dark:[&::-webkit-calendar-picker-indicator]:invert ${commonInputCss}`}
                                                        onChange={(e) => handleServiceDateChange(e)}
                                                        value={displayedCaseData?.date || handleServiceDateChangeDefault(TodayDate())}
                                                    ></Input>
                                                </div>
                                            </div>
                                            {customerData &&
                                                <CustomerInput listCustomerData={listCustomerData} handleCustomerDataChange={handleCustomerDataChange} customerData={customerData} />
                                            }
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
                                            {caseData ? <Button variant="success" onClick={handlePreviewShow}>
                                                Save Changes
                                            </Button> :
                                                <div className="flex justify-end">
                                                    <div className="mx-3"><Button onClick={handleSaveDrafts} className="justify-end">Save As Draft</Button></div>
                                                    <Button variant="success" onClick={handlePreviewShow}> {/* Changed onClick to handleSaveChanges */}
                                                        Submit
                                                    </Button>

                                                </div>}

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

            <Modal isOpen={showPreviewData} onClose={() => setShowPreviewData(false)} className="max-w-2xl h-4/5 p-6 dark:!bg-gray-800 overflow-auto custom-scrollbar">
                <PreviewDataBeforeSubmit caseData={updateCaseData} submitButton={handleSaveChanges}></PreviewDataBeforeSubmit>
            </Modal>

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