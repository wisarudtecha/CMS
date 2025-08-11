// CaseDetailView.tsx - Refactored and Enhanced

"use client"

import { useCallback, useMemo, useState, useEffect, ChangeEvent, useRef } from "react" // Import useEffect
import {
    ArrowLeft,
    Clock,
    User as User_Icon,
    MessageSquare,
    Paperclip,
    ChevronDown,
    ChevronUp,
} from "lucide-react"
import Button from "@/components/ui/button/Button"
import { CaseItem, CaseList } from "@/components/interface/CaseItem"
import DynamicForm from "@/components/form/dynamic-form/DynamicForm"
import PageBreadcrumb from "@/components/common/PageBreadCrumb"
import PageMeta from "@/components/common/PageMeta"
import { formType, FormField } from "@/components/interface/FormField"
import Badge from "@/components/ui/badge/Badge"
import AssignOfficerModal, { Officer } from "@/components/assignOfficer/AssignOfficerModel"
import { getPriorityBorderColorClass, getPriorityColorClass, getTextPriority } from "../function/Prioriy"
import { getAvatarIconFromString } from "../avatar/createAvatarFromString"
import { CommandInformation } from "../assignOfficer/CommandInformation"
import Comments from "../comment/Comment"
// Corrected import path
import Toast from "../toast/Toast"
import Input from "../form/input/InputField"
import DateStringToDateFormat, { TodayDate } from "../date/DateToString"
import { SearchableSelect } from "../SearchSelectInput/SearchSelectInput"
import { Modal } from "../ui/modal"
import ProgressStepPreview from "../progress/ProgressBar"
import { CaseTypeSubType } from "../interface/CaseType"
import type { Custommer } from "@/types";
import React from "react"
import CustomerInput from "./CaseCustomerInput"
import CustomerPanel from "./CaseCustomerPanel"
import FormFieldValueDisplay from "./CaseDisplay"
import PreviewDataBeforeSubmit from "./PreviewCaseData"
import { Customer } from "@/store/api/custommerApi"
import { CreateCase, DepartmentCommandStationData, DepartmentCommandStationDataMerged, usePostCreateCaseMutation } from "@/store/api/caseApi"
import { mergeCaseTypeAndSubType } from "../caseTypeSubType/mergeCaseTypeAndSubType"
import { findCaseTypeSubType } from "../caseTypeSubType/findCaseTypeSubTypeByMergeName"
const commonInputCss = "shadow appearance-none border rounded  text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent dark:text-gray-300 dark:border-gray-800 dark:bg-gray-900 disabled:text-gray-500 disabled:border-gray-300 disabled:opacity-40 disabled:bg-gray-100 dark:disabled:bg-gray-800 dark:disabled:text-gray-400 dark:disabled:border-gray-700"
const mockOfficers: Officer[] = [
    { id: '1', name: 'Somchai Srisuk', status: 'Available', department: 'Electrical', location: 'Sector 4', service: 'Power Grid', serviceProvider: 'City Power', workload: 2, distance: 3.5 },
    { id: '2', name: 'Nanthaporn Jaidee', status: 'On-Site', department: 'Plumbing', location: 'Downtown', service: 'Water Main', serviceProvider: 'Aqua Services', workload: 8, distance: 12.1 },
    { id: '3', name: 'Manop Pongsawang', status: 'Unavailable', department: 'Electrical', location: 'Sector 2', service: 'Residential', serviceProvider: 'City Power', workload: 5, distance: 8.9 },
    { id: '4', name: 'Arunee Kaewpaitoon', status: 'En-Route', department: 'Communications', location: 'Hill Valley', service: 'Fiber Optics', serviceProvider: 'ConnectFast', workload: 4, distance: 1.2 },
    { id: '5', name: 'Wilaiwan Ratanakul', status: 'Available', department: 'Structural', location: 'Sector 4', service: 'Inspection', serviceProvider: 'BuildSafe', workload: 1, distance: 4.8 },
];

const requireElements = <span className=" text-red-500 text-sm font-bold">*</span>


// function mergeCaseTypeAndSubType(
//     caseTypes: CaseType[],
//     caseSubTypes: CaseSubType[]
// ): CaseTypeSubType[] {
//     const mergedList: CaseTypeSubType[] = [];

//     caseTypes.forEach(type => {
//         const matchingSubTypes = caseSubTypes.filter(sub => sub.typeId === type.typeId);

//         matchingSubTypes.forEach(sub => {
//             mergedList.push({
//                 CaseTypeid: type.id,
//                 CaseSubTypeid: sub.id,
//                 typeId: type.typeId,
//                 orgId: type.orgId,
//                 en: `${type.en} - ${sub.en}`,
//                 th: `${type.th} - ${sub.th}`,
//                 activeType: type.active,
//                 activeSubType: sub.active,
//                 wfId: sub.wfId,
//                 caseSla: sub.caseSla,
//                 priority: sub.priority,
//                 userSkillList: sub.userSkillList,
//                 unitPropLists: sub.unitPropLists
//             });
//         });
//     });

//     return mergedList;
// }

// function mergeEntitiesIntoServiceCenters(
//     departments: Department[],
//     stations: Station[],
//     commands: Commands[]
// ): ServiceCenter[] {
//     const serviceCenters: ServiceCenter[] = [];

//     const departmentMap = new Map<string, Department>();
//     departments.forEach(dept => departmentMap.set(`${dept.deptId}`, dept));
//     const commandMap = new Map<string, Commands>();
//     commands.forEach(cmd => commandMap.set(`${cmd.deptId}-${cmd.commId}`, cmd));

//     stations.forEach(station => {
//         const department = departmentMap.get(`${station.deptId}`);
//         const command = commandMap.get(`${station.deptId}-${station.commId}`);
//         if (department && command) {
//             serviceCenters.push({
//                 department: department,
//                 station: station,
//                 command: command,
//                 name: department.th+"-"+station.th+"-"+command.th
//             });
//         }
//     });

//     return serviceCenters;
// }


// const getTypeSupType = () => {

//     try {
//         let caseMatched
//         const { data: caseTypes } = useGetTypeQuery(null);
//         const { data: subTypes } = useGetSubTypeQuery(null);
//         if (caseTypes?.data && subTypes?.data) {
//             caseMatched = mergeCaseTypeAndSubType(caseTypes.data, subTypes.data);
//         }
//         // console.log("Matched Case Types with Subtypes:", caseMatched);
//         return caseMatched
//     } catch (error) {
//         console.error("Failed to fetch case types:", error);
//     }


// }


// const getServiceCenter= () => {

//     try {
//         let serviceCenter
//         const { data: commands } = useGetCommandsQuery({start:0,length:100});
//         const { data: department } = useGetDepartmentQuery({start:0,length:100});
//         const { data: station } = useGetStationsQuery({start:0,length:100});
//         if (commands?.data && department?.data && station?.data) {
//             serviceCenter = mergeEntitiesIntoServiceCenters( department.data,station.data,commands.data);
//         }
//         return serviceCenter
//     } catch (error) {
//         console.error("Failed to fetch case types:", error);
//     }

// }


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
            const newFilesArray = Array.from(files);

            setDisplayCaseData?.((prev) => {
                if (!prev) return prev;

                const currentFiles = prev.attachFile ?? [];

                return {
                    ...prev,
                    attachFile: [...currentFiles, ...newFilesArray],
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






// --- Sub-component: CaseTypeFormSection ---
interface CaseTypeFormSectionProps {
    caseType: string;
    handleCaseTypeChange: (newValue: string) => void;
    handleGetTypeFormData: (getTypeData: FormField) => void;
    hadleIsFillGetType: (isFill: boolean) => void;
    selectedCaseTypeForm: FormField | undefined;
    editFormData: boolean; // Prop to control if the form is editable
    caseTypeSupTypeData: CaseTypeSubType[];
}


const mergeDeptCommandStation = (data: DepartmentCommandStationData) => {
    return `${data.deptTh ? `${data.deptTh}` : ""}` +
        `${data.commandTh ? `-${data.commandTh}` : ""}` +
        `${data.stationTh ? `_${data.stationTh}` : ""}`
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
        return caseTypeSupTypeData.map(item =>
            mergeCaseTypeAndSubType(item)
        );
    }, [caseTypeSupTypeData]);
    return (
        <>
            <div className="text-white dark:text-gray-300">
                <div className="flex justify-between m-3 text-gray-900 dark:text-gray-400">
                    <h3 className="mb-2  block text-gray-900 dark:text-gray-400">Case Type :{requireElements}</h3>
                    {((selectedCaseTypeForm && (caseTypeSupTypeData.find(data => mergeCaseTypeAndSubType(data) === caseType)?.priority))) && (
                        <div className="flex">
                            <span className="mr-2">Priority</span>
                            <div
                                className={`w-5 h-5 mx-1 p-3 ${getPriorityColorClass(
                                    caseTypeSupTypeData.find(data => mergeCaseTypeAndSubType(data) === caseType)?.priority ?? -1
                                )
                                    } rounded-lg`}
                            ></div>

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
            {selectedCaseTypeForm?.formFieldJson && (
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








export default function CaseDetailView({ onBack, caseData }: { onBack?: () => void, caseData?: CaseList }) {
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
    const [updateCaseData, setUpdateCaseData] = useState<CaseItem | undefined>();
    const caseTypeSupTypeData = JSON.parse(localStorage.getItem("caseTypeSubType") ?? "[]") as CaseTypeSubType[]
    // const caseTypeSupTypeData = getTypeSupType()
    const [createCase] = usePostCreateCaseMutation();
    const departmentCommandStations = JSON.parse(localStorage.getItem("DeptCommandStations_data") ?? "[]") as DepartmentCommandStationData[];
    const serviceCenter = departmentCommandStations.map((item) => ({
        ...item,
        name: mergeDeptCommandStation(item)
    })) as DepartmentCommandStationDataMerged[];
    // const serviceCenter = getServiceCenter()
    const [displayedCaseData, setDisplayedCaseData] = useState<CaseItem | undefined>();
    // const [formDataChange, setFormDataChange] = useState<FormField | undefined>();
    const [caseType, setCaseType] = useState<{ caseType: string, priority: number }>({ caseType: "", priority: 0 });
    const [caseTypeData, setCaseTypeData] = useState<formType | undefined>();
    const [formData, setFormData] = useState<FormField | undefined>();
    const [serviceCenterData, setServiceCenterData] = useState<DepartmentCommandStationDataMerged>({} as DepartmentCommandStationDataMerged);
    const [customerData, setCustomerData] = useState<Custommer>({
    } as Custommer);
    const profile = JSON.parse(localStorage.getItem("profile") ?? "{}");
    const [listCustomerData, setListCustomerData] = useState<Customer[]>([])
    // const serviceCenterMock = ["Bankkok", "Phisanulok", "Chiang mai"];

    const createCaseAction = async (acton: "draft" | "submit") => {
        const caseVersion = acton === "draft" ? "draft" : "publish";
        const statusId = acton === "draft" ? "S000" : "S001";
        const createJson = {
            formData: updateCaseData?.caseType?.formField,
            customerName: updateCaseData?.customerData?.name,
            caseDetail: updateCaseData?.description || "",
            caseDuration: 0,
            caseLat: "",
            caseLon: "",
            caseSTypeId: updateCaseData?.caseType?.sTypeId || "",
            caseTypeId: updateCaseData?.caseType?.typeId || "",
            caseVersion: caseVersion,
            caselocAddr: updateCaseData?.location || "",
            caselocAddrDecs: updateCaseData?.location || "",
            deviceId: "",
            distId: "70",
            extReceive: "",
            phoneNoHide: true,
            phoneNo: updateCaseData?.customerData?.mobileNo || "",
            priority: updateCaseData?.caseType?.priority || 0,
            provId: "10",
            referCaseId: "",
            resDetail: "",
            source: updateCaseData?.customerData?.contractMethod?.id || "",
            startedDate: new Date(updateCaseData?.date ?? TodayDate()).toISOString(),
            statusId: statusId,
            userarrive: "",
            userclose: "",
            usercommand: updateCaseData?.serviceCenter?.commandTh || "",
            usercreate: profile?.username || "",
            userreceive: "",
            nodeId: updateCaseData?.caseType?.formField.nextNodeId || "",
            wfId: updateCaseData?.caseType?.formField.wfId || "",
            versions: updateCaseData?.caseType?.formField.versions || "",
            deptId: updateCaseData?.serviceCenter?.deptId || undefined,
            commId: updateCaseData?.serviceCenter?.commId || undefined,
            stnId: updateCaseData?.serviceCenter?.stnId || undefined,
        } as CreateCase;
        try {

            await createCase(createJson).unwrap();
        } catch (error: any) {
            setToastType("error");
            setToastMessage(`Failed to create case`);
            setShowToast(true);;
            return false;
        }
        const caseListData = localStorage.getItem("caseList") || "[]";
        if (caseListData) {
            const caseList = JSON.parse(caseListData) as CaseList[];
            caseList.push({ ...(createJson as object), createdAt: TodayDate(), createdBy: profile?.username || "" } as CaseList);
            localStorage.setItem("caseList", JSON.stringify(caseList));
        }
        return true;

    }


    useEffect(() => {
        // setDisplayedCaseData(caseData);
        setListCustomerData(JSON.parse(localStorage.getItem("customer_data") ?? "[]") as Customer[])
        // if (caseData) {
        //     const newCaseType = caseData.caseType ?
        //         { caseType: caseData.caseType.caseType || "", priority: caseData.caseType.priority || 0 } :
        //         { caseType: "", priority: 0 };

        //     setCaseType(newCaseType);
        //     setCaseTypeData(caseData.caseType);
        //     setFormData(caseData.formData);
        //     setServiceCenterData(caseData.serviceCenter || {} as DepartmentCommandStationDataMerged);
        //     { caseData.customerData && setCustomerData(caseData.customerData) }

        // } else {
        //     const draft = localStorage.getItem("Create Case");
        //     if (draft) {
        //         const parsedDraft = JSON.parse(draft) as CaseItem;
        //         setCaseTypeData(parsedDraft.caseType);
        //         setFormData(parsedDraft.formData);
        //         setCaseType({ caseType: parsedDraft.caseType?.caseType || "", priority: parsedDraft.caseType?.priority || 0 });
        //         setServiceCenterData(parsedDraft.serviceCenter || {} as DepartmentCommandStationDataMerged);
        //         setCustomerData(parsedDraft.customerData || {} as Custommer);
        //         setDisplayedCaseData(parsedDraft);
        //     }
        // }
    }, [caseData]);


    const selectedCaseTypeForm = useMemo(() => {
        if (caseTypeData?.caseType === caseType.caseType) {
            return caseTypeData;
        }

        const newCaseType = findCaseTypeSubType(caseTypeSupTypeData, caseType.caseType);
        if (!newCaseType?.sTypeId) {
            return;
        }

        const formFieldStr = localStorage.getItem("subTypeForm-" + newCaseType.sTypeId);
        let formField: FormField = {} as FormField;

        try {
            if (formFieldStr && formFieldStr !== "undefined") {
                formField = JSON.parse(formFieldStr);
            }
        } catch (e) {
            console.error("Failed to parse formField JSON:", e);
        }

        return {
            ...newCaseType,
            formField,
        } as formType;
    }, [caseType, displayedCaseData]);



    // Handlers
    const handleSelectOfficer = useCallback((selectedOfficer: Officer) => {
        setShowOFFicersData(prev => (prev?.id === selectedOfficer.id ? null : selectedOfficer));
    }, []);
    const handleCheckRequiredFields = () => {
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
        } else if (!customerData?.contractMethod?.name.trim()) {
            errorMessage = "Please select a Contact Method.";
        } else if (customerData.email === "Email" && !customerData.email?.trim()) {
            errorMessage = "Please enter Customer Email.";
        } else if ((!isValueFill.dynamicForm && formData) || (!isValueFill.getType && selectedCaseTypeForm)) {
            errorMessage = "Please ensure all dynamic form fields are filled.";
        }
        return errorMessage;
    }

    const handleCheckRequiredFieldsSaveDraft = () => {
        let errorMessage = "";
        if (!caseType.caseType) {
            errorMessage = "Please select a Service Type.";
        } else if (!displayedCaseData?.date) {
            errorMessage = "Please select a Request Service Date.";
        } else if (!customerData.mobileNo) {
            errorMessage = "Please enter Customer Phone Number.";
        }
        return errorMessage;
    }

    const handleAssignOfficers = useCallback((selectedOfficerIds: string[]) => {
        const selected = mockOfficers.filter(o => selectedOfficerIds.includes(o.id));
        setAssignedOfficers(selected);
        setShowAssignModal(false);
    }, []);

    const handleSaveChanges = useCallback(() => {
        setShowPreviewData(false)
        setDisplayedCaseData(updateCaseData);
        setEditFormData(false)
        setToastMessage("Changes saved successfully!");
        setToastType("success");
        setShowToast(true);;
    }, [isValueFill, caseTypeData, customerData, serviceCenterData, caseType, displayedCaseData]);

    const handleCreateCase = useCallback(async () => {
        setShowPreviewData(false)
        const isNotError = await createCaseAction("submit");
        if (isNotError === false) {
            return
        }
        setDisplayedCaseData(updateCaseData);
        setEditFormData(false)
        setToastMessage("Ceate Case successfully!");
        setToastType("success");
        setShowToast(true);;
    }, [isValueFill, caseTypeData, customerData, serviceCenterData, caseType, displayedCaseData]);

    useEffect(() => {
        const updatedCaseData = {
            ...(displayedCaseData as CaseItem),
            caseType: caseTypeData!,
            customerData: customerData,
            serviceCenter: serviceCenterData,
        };
        setUpdateCaseData(updatedCaseData)
    }, [caseTypeData, customerData, serviceCenterData, caseType])
    const handlePreviewShow = () => {
        const errorMessage = handleCheckRequiredFields();
        if (errorMessage) {
            setToastMessage(errorMessage);
            setToastType("error");
            setShowToast(true);
            return;
        }
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
            setServiceCenterData(displayedCaseData.serviceCenter || {} as DepartmentCommandStationDataMerged);
            {
                displayedCaseData.customerData &&
                    setCustomerData(displayedCaseData.customerData)
            }
        }
        setEditFormData(prev => !prev);
    }, [editFormData, displayedCaseData]);

    const handleCaseTypeChange = useCallback(async (newValue: string) => {
        const newCaseType = findCaseTypeSubType(caseTypeSupTypeData, newValue);
        if (newCaseType) {
            // const localStorageItem = localStorage.getItem("subTypeForm-" + newCaseType.sTypeId);

            // if (!localStorageItem) {
            //     await useFetchSubTypeForm(newCaseType.sTypeId);
            // }
            setCaseType(prevCaseType => ({
                ...prevCaseType,
                caseType: newValue
            }));
        }
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


    // const handleDynamicFormChange = useCallback((data: FormField) => {
    //     setFormDataChange(prevData => {
    //         if (JSON.stringify(prevData) !== JSON.stringify(data)) {
    //             return data;
    //         }
    //         return prevData;
    //     });
    // }, []);
    const handleIsFillGetType = useCallback((isFill: boolean) => setIsValueFill(prev => ({ ...prev, getType: isFill })), []);
    // const handleIsFillDynamicForm = useCallback((isFill: boolean) => setIsValueFill(prev => ({ ...prev, dynamicForm: isFill })), []);
    const handleGetTypeFormData = useCallback((getTypeData: FormField) => {
        const newData = { ...selectedCaseTypeForm, formField: getTypeData, caseType: caseType.caseType } as formType;
        setCaseTypeData(prevData => {
            // Same logic here to prevent loops from the other DynamicForm
            if (JSON.stringify(prevData) !== JSON.stringify(newData)) {
                return newData;
            }
            return prevData;
        });

    }, [caseType]);
    const handleSetServiceCenter = useCallback((selectedName: string) => {
        const selected = serviceCenter.find(item => item.name === selectedName);
        if (selected) {
            setServiceCenterData(selected);
        }
    }, [serviceCenter]);
    const handleCustomerDataChange = useCallback((data: Custommer) => { setCustomerData(data) }, []);
    // const handleSaveDrafts = async () => {
    //     const updatedCaseDataForDraft: CaseItem = {
    //         ...(displayedCaseData || {} as CaseItem),
    //         caseType: caseTypeData!,
    //         customerData: customerData,
    //         serviceCenter: serviceCenterData,
    //     };
    //     setDisplayedCaseData(updatedCaseDataForDraft);
    //     localStorage.setItem("Create Case", JSON.stringify(updatedCaseDataForDraft));
    //     setToastMessage("Draft saved successfully!");
    //     setToastType("info");
    //     setShowToast(true);
    // };
    const handleSaveDrafts = useCallback(async () => {
        setShowPreviewData(false)
        const errorMessage = handleCheckRequiredFieldsSaveDraft();

        if (errorMessage) {
            setToastMessage(errorMessage);
            setToastType("error");
            setShowToast(true);
            return;
        }
        const isNotError = await createCaseAction("draft");
        if (isNotError === false) {
            return
        }
        localStorage.setItem("Create Case", JSON.stringify(updateCaseData));
        setDisplayedCaseData(updateCaseData);
        setEditFormData(false)
        setToastMessage("Ceate Case successfully!");
        setToastType("success");
        setShowToast(true);;
    }, [isValueFill, caseTypeData, customerData, serviceCenterData, caseType, displayedCaseData]);


    const handleRemoveFile = (index: number) => {
        setDisplayedCaseData((prev) => {
            if (!prev) return prev;
            // Remove the file at the specified index
            const updatedFiles = (prev.attachFile ?? []).filter(
                (_file, i) => i !== index
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
                <PageBreadcrumb pageTitle="" />
                <div className="px-4 sm:px-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            {onBack && (
                                <Button variant="ghost" size="sm" onClick={onBack}>
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Back
                                </Button>
                            )}
                            {/* {caseData && <div className="relative bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-2 rounded-t-lg border-t border-l border-r border-gray-300 dark:border-gray-600 text-sm font-medium">
                                Case #{caseData.id.toString().padStart(10, '0')}
                                <button className="ml-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">×</button>
                            </div>} */}
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
                                {(caseData) && <CaseCard onAssignClick={() => setShowAssignModal(true)} onEditClick={handleEditClick} caseData={displayedCaseData || {} as CaseItem} editFormData={editFormData} setDisplayCaseData={setDisplayedCaseData} />}
                                {(displayedCaseData?.attachFile && displayedCaseData.attachFile.length > 0 && displayedCaseData) && (
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
                                                                onClick={() => handleRemoveFile(index)}
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
                                            selectedCaseTypeForm={selectedCaseTypeForm?.formField}
                                            editFormData={editFormData}
                                            caseTypeSupTypeData={caseTypeSupTypeData ?? []}
                                        />
                                        <div className="pr-7">
                                            <h3 className=" text-gray-900 dark:text-gray-400 mx-3 ">Case Details: {requireElements}</h3>
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
                                                    options={serviceCenter.map(item => item.name)}
                                                    value={serviceCenterData.name || ""}
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
                                            <CustomerInput listCustomerData={listCustomerData} handleCustomerDataChange={handleCustomerDataChange} customerData={customerData} />
                                        </div>
                                        {/* <DynamicForm
                                            initialForm={formData || createCaseJson}
                                            edit={false}
                                            editFormData={true}
                                            enableFormTitle={false}
                                            onFormChange={handleDynamicFormChange}
                                            returnFormAllFill={handleIsFillDynamicForm}
                                        /> */}

                                        <div className="flex justify-end mt-20 mb-3 mr-3">
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

                        <CustomerPanel onClose={() => setIsCustomerPanelOpen(false)} customerData={customerData} />

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
                <PreviewDataBeforeSubmit caseData={updateCaseData} submitButton={caseData ? handleSaveChanges : handleCreateCase}></PreviewDataBeforeSubmit>
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