"use client"

import { useCallback, useMemo, useState, useEffect, ChangeEvent, useRef } from "react"
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
import AssignOfficerModal from "@/components/assignOfficer/AssignOfficerModel"
import { getPriorityBorderColorClass, getPriorityColorClass, getTextPriority } from "../function/Prioriy"
import { getAvatarIconFromString } from "../avatar/createAvatarFromString"
import { CommandInformation } from "../assignOfficer/CommandInformation"
import Comments from "../comment/Comment"
import Toast from "../toast/Toast"
import Input from "../form/input/InputField"
import DateStringToDateFormat, { getLocalISOString, TodayDate } from "../date/DateToString"
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
import { CreateCase, usePatchUpdateCaseMutation, usePostCreateCaseMutation } from "@/store/api/caseApi"
import { mergeCaseTypeAndSubType } from "../caseTypeSubType/mergeCaseTypeAndSubType"
import { findCaseTypeSubType, findCaseTypeSubTypeByTypeIdSubTypeId } from "../caseTypeSubType/findCaseTypeSubTypeByMergeName"
import { CaseSop, Unit, useGetCaseSopQuery, useGetUintQuery } from "@/store/api/dispatch"
import { statusIdToStatusTitle } from "../ui/status/status"
import { contractMethodMock } from "./source"
import { Area, mergeArea } from "@/store/api/area"
// import Checkbox from "../form/input/Checkbox"
// import { data } from "react-router"
import DragDropFileUpload from "../d&d upload/dndUpload"

const commonInputCss = "shadow appearance-none border rounded  text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent dark:text-gray-300 dark:border-gray-800 dark:bg-gray-900 disabled:text-gray-500 disabled:border-gray-300 disabled:opacity-40 disabled:bg-gray-100 dark:disabled:bg-gray-900 dark:disabled:text-gray-400 dark:disabled:border-gray-700"

const requireElements = <span className=" text-red-500 text-sm font-bold">*</span>

interface CaseCardProps {
    onAssignClick: () => void;
    onEditClick: () => void;
    setCaseData?: React.Dispatch<React.SetStateAction<CaseItem | undefined>>;
    caseData: CaseSop;
    editFormData: boolean;
}

const CaseCard: React.FC<CaseCardProps> = ({ onAssignClick, onEditClick, caseData, editFormData, setCaseData }) => {
    const [showComment, setShowComment] = useState<boolean>(false);
    const caseTypeSupTypeData = useMemo(() =>
        JSON.parse(localStorage.getItem("caseTypeSubType") ?? "[]") as CaseTypeSubType[], []
    );

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

            setCaseData?.((prev) => {
                if (!prev) return prev;

                const currentFiles = prev.attachFileResult ?? [];

                return {
                    ...prev,
                    attachFileResult: [...currentFiles, ...newFilesArray],
                };
            });
            e.target.value = '';
        }
    };

    return (
        <div className={`mb-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border-l-4 ${getPriorityBorderColorClass(caseData.priority)}`}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3">
                <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{
                        mergeCaseTypeAndSubType(
                            findCaseTypeSubTypeByTypeIdSubTypeId(
                                caseTypeSupTypeData,
                                caseData?.caseTypeId || "",
                                caseData?.caseSTypeId || ""
                            ) ?? ({} as CaseTypeSubType)
                        )
                    }</h2>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>Create Date: {DateStringToDateFormat(caseData.createdAt)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                            <User_Icon className="w-4 h-4" />
                            <span>Created: {caseData.createdBy}</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center space-x-2 text-center mt-3 sm:mt-0">
                    <Badge color={`${getTextPriority(caseData.priority).color}`}>
                        {getTextPriority(caseData.priority).level} Priority
                    </Badge>
                    <Badge variant="outline">
                        {statusIdToStatusTitle(caseData.statusId)}
                    </Badge>
                </div>
            </div>

            <ProgressStepPreview progressSteps={progressSteps} />

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-3 sm:space-y-0">
                <div className="flex flex-wrap gap-2">
                    <Button onClick={handleCommentToggle} size="sm" variant="outline" className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300">
                        {showComment ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Comment
                    </Button>
                    {/* Show Attach File button only in edit mode for existing cases */}
                    {editFormData && (
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
                    )}
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

interface CaseTypeFormSectionProps {
    caseType: string;
    handleCaseTypeChange: (newValue: string) => void;
    handleGetTypeFormData: (getTypeData: FormField) => void;
    hadleIsFillGetType: (isFill: boolean) => void;
    selectedCaseTypeForm: FormField | undefined;
    editFormData: boolean;
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
        return caseTypeSupTypeData.map(item =>
            mergeCaseTypeAndSubType(item)
        );
    }, [caseTypeSupTypeData]);

    return (
        <>
            <div className="text-white dark:text-gray-300">
                <div className="flex justify-between m-3 text-gray-900 dark:text-gray-400">
                    <h3 className="mb-2 block text-gray-900 dark:text-gray-400">Case Type :{requireElements}</h3>
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
    // Initialize state with proper defaults
    const [caseState, setCaseState] = useState<CaseItem | undefined>(() => {
        // Only initialize if it's a new case (no caseData)
        if (!caseData) {
            return {
                location: "",
                date: "",
                caseType: undefined,
                priority: 0,
                description: "",
                area: undefined,
                status: "",
                scheduleDate: "",
                customerData: {} as Custommer,
                attachFile: [] as File[], // For new cases (edit mode)
                attachFileResult: [] as File[] // For existing cases (view/edit mode)
            } as CaseItem;
        }
        return undefined;
    });

    const [showAssignModal, setShowAssignModal] = useState(false);
    const [editFormData, setEditFormData] = useState<boolean>(!caseData);
    const [assignedOfficers, setAssignedOfficers] = useState<Unit[]>([]);
    const [showOfficersData, setShowOFFicersData] = useState<Unit | null>(null);
    const [isCustomerPanelOpen, setIsCustomerPanelOpen] = useState(false);
    const [isValueFill, setIsValueFill] = useState({ getType: false, dynamicForm: false });
    const [showToast, setShowToast] = useState(false);
    const [showPreviewData, setShowPreviewData] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [toastType, setToastType] = useState<"success" | "error" | "info">("info");
    const [sopLocal, setSopLocal] = useState<CaseSop>();
    const [caseType, setCaseType] = useState<{ caseType: string, priority: number }>({ caseType: "", priority: 0 });
    const [listCustomerData, setListCustomerData] = useState<Customer[]>([])
    const [isInitialized, setIsInitialized] = useState(false);

    // Memoize static data to prevent re-renders
    const caseTypeSupTypeData = useMemo(() =>
        JSON.parse(localStorage.getItem("caseTypeSubType") ?? "[]") as CaseTypeSubType[], []
    );

    const areaList = useMemo(() =>
        JSON.parse(localStorage.getItem("area") ?? "[]") as Area[], []
    );

    const profile = useMemo(() =>
        JSON.parse(localStorage.getItem("profile") ?? "{}"), []
    );

    // Only make API calls if caseData exists
    const { data: sopData, isFetching, isLoading } = useGetCaseSopQuery(
        { caseId: caseData?.caseId || "" },
        {
            refetchOnMountOrArgChange: true,
            skip: !caseData?.caseId
        }
    );

    const { data: unit } = useGetUintQuery(
        { caseId: caseData?.caseId || "" },
        { skip: !caseData?.caseId }
    )

    const [createCase] = usePostCreateCaseMutation();
    const [updateCase] = usePatchUpdateCaseMutation()

    // Initialize customer data ONCE
    useEffect(() => {
        if (!isInitialized) {
            const customerList = JSON.parse(localStorage.getItem("customer_data") ?? "[]") as Customer[];
            setListCustomerData(customerList);
            setIsInitialized(true);
        }
    }, [isInitialized]);

    // Initialize sopLocal from API data ONLY when sopData changes
    useEffect(() => {
        if (sopData?.data && caseData) {
            setSopLocal(sopData.data);
        }
    }, [sopData?.data, caseData?.caseId]);

    // Initialize case type from caseData ONLY ONCE
    useEffect(() => {
        if (caseData && caseType.caseType === "" && caseTypeSupTypeData.length > 0 && !sopLocal) {
            const newCaseType = {
                caseType: mergeCaseTypeAndSubType(
                    findCaseTypeSubTypeByTypeIdSubTypeId(
                        caseTypeSupTypeData,
                        caseData?.caseTypeId || "",
                        caseData?.caseSTypeId || ""
                    ) ?? ({} as CaseTypeSubType)
                ) || "",
                priority: caseData.priority || 0
            };

            setCaseType(newCaseType);
        }
    }, [caseData?.caseTypeId, caseData?.caseSTypeId, caseData?.priority, caseTypeSupTypeData.length, caseType.caseType, sopLocal]);

    // Memoize getFormByCaseType to prevent infinite loops
    const getFormByCaseType = useCallback(() => {
        if (!caseType.caseType || !caseTypeSupTypeData.length) return undefined;

        const newCaseType = findCaseTypeSubType(caseTypeSupTypeData, caseType.caseType);
        if (!newCaseType?.sTypeId) {
            return undefined;
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
            caseType: mergeCaseTypeAndSubType(newCaseType),
            formField,
        } as formType
    }, [caseType.caseType, caseTypeSupTypeData]);

    const selectedCaseTypeForm = useMemo(() => {
        return getFormByCaseType()
    }, [getFormByCaseType]);

    // Initialize case state from sopLocal data ONLY when all required data is available
    useEffect(() => {
        if (caseData && sopLocal && areaList.length > 0 && !caseState) {
            const utcTimestamp: string | undefined = sopLocal?.createdAt;
            const area = areaList.find((items) =>
                sopLocal.provId === items.provId &&
                sopLocal.distId === items.distId &&
                sopLocal.countryId === items.countryId
            );

            const newCaseState: CaseItem = {
                location: sopLocal?.caselocAddr || "",
                date: utcTimestamp ? getLocalISOString(utcTimestamp) : "",
                caseType: getFormByCaseType(),
                priority: sopLocal?.priority || 0,
                description: sopLocal?.caseDetail || "",
                area: area,
                status: "",
                attachFile: [] as File[], // For new cases (edit mode)
                attachFileResult: [] as File[] // Initialize as empty array for view mode
            } as CaseItem;

            setCaseState(newCaseState);
        }
    }, [sopLocal, caseData, areaList.length, caseState, getFormByCaseType]);

    // Update customer data ONLY when necessary data is available
    useEffect(() => {
        if (listCustomerData.length > 0 && sopLocal && caseState && !caseState.customerData?.mobileNo) {
            const result = listCustomerData.find(items => items.mobileNo === caseData?.phoneNo)
            const customerData = result ? {
                ...result,
                name: `${result.firstName} ${result.lastName}`,
                contractMethod: {
                    id: sopLocal?.source || "",
                    name: contractMethodMock.find((items) => items.id === sopLocal?.source)?.name || ""
                }
            } as Custommer : {
                mobileNo: sopLocal?.phoneNo,
                contractMethod: {
                    id: sopLocal?.source || "",
                    name: contractMethodMock.find((items) => items.id === sopLocal?.source)?.name || ""
                },
            } as Custommer;

            setCaseState(prev => prev ? {
                ...prev,
                customerData: customerData,
                status: prev.status || "",
            } as CaseItem : prev);
        }
    }, [listCustomerData.length, sopLocal?.phoneNo, sopLocal?.source, caseData?.phoneNo, caseState?.customerData?.mobileNo]);

    // File handling function for DragDropFileUpload (new cases - attachFile)
    const handleFilesChange = useCallback((newFiles: File[]) => {
        setCaseState(prev => prev ? {
            ...prev,
            attachFile: newFiles
        } : prev);
    }, []);

    // File remove handler for attachFileResult (existing cases)
    const handleRemoveFileResult = useCallback((index: number) => {
        setCaseState((prev) => {
            if (!prev) return prev;
            const updatedFiles = (prev.attachFileResult ?? []).filter(
                (_file, i) => i !== index
            );

            return {
                ...prev,
                attachFileResult: updatedFiles,
            };
        });
    }, []);

    // Handlers
    const handleSelectOfficer = useCallback((selectedOfficer: Unit) => {
        setShowOFFicersData(prev => (prev?.unitId === selectedOfficer.unitId ? null : selectedOfficer));
    }, []);

    const handleCheckRequiredFields = useCallback(() => {
        let errorMessage = "";
        if (!caseType.caseType) {
            errorMessage = "Please select a Case Type.";
        } else if (!caseState?.description?.trim()) {
            errorMessage = "Please enter Case Details.";
        }  else if (!caseState?.customerData?.contractMethod?.name.trim()) {
            errorMessage = "Please select a Contact Method.";
        } else if ((!isValueFill.dynamicForm && caseState?.formData) || (!isValueFill.getType && selectedCaseTypeForm)) {
            errorMessage = "Please ensure all dynamic form fields are filled.";
        }
        return errorMessage;
    }, [caseType.caseType, caseState, isValueFill, selectedCaseTypeForm]);

    const handleCheckRequiredFieldsSaveDraft = useCallback(() => {
        let errorMessage = "";
        if (!caseType.caseType) {
            errorMessage = "Please select a Service Type.";
        }  else if (!caseState?.customerData?.mobileNo) {
            errorMessage = "Please enter Phone Number.";
        }
        return errorMessage;
    }, [caseType.caseType, caseState]);

    const createCaseAction = useCallback(async (action: "draft" | "submit") => {
        if (!caseState) return false;

        const caseVersion = action === "draft" ? "draft" : "publish";
        const statusId = action === "draft" ? "S000" : "S001";
        const createJson = {
            formData: caseState?.caseType?.formField,
            customerName: caseState?.customerData?.name,
            caseDetail: caseState?.description || "",
            caseDuration: 0,
            caseLat: "",
            caseLon: "",
            caseSTypeId: caseState?.caseType?.sTypeId || "",
            caseTypeId: caseState?.caseType?.typeId || "",
            caseVersion: caseVersion,
            caselocAddr: caseState?.location || "",
            caselocAddrDecs: caseState?.location || "",
            deviceId: caseState?.iotDevice || "",
            countryId: caseState?.area?.countryId || "",
            distId: caseState?.area?.distId || "",
            extReceive: "",
            phoneNoHide: true,
            phoneNo: caseState?.customerData?.mobileNo || "",
            priority: caseState?.caseType?.priority || 0,
            provId: caseState?.area?.provId || "",
            referCaseId: caseState?.workOrderRef || "",
            resDetail: "",
            source: caseState?.customerData?.contractMethod?.id || "",
            startedDate: new Date(caseState?.iotDate ?? TodayDate()).toISOString(),
            statusId: statusId,
            userarrive: "",
            userclose: "",
            usercommand: caseState?.serviceCenter?.commandTh || "",
            usercreate: profile?.username || "",
            userreceive: "",
            nodeId: caseState?.caseType?.formField.nextNodeId || "",
            wfId: caseState?.caseType?.formField.wfId || "",
            versions: caseState?.caseType?.formField.versions || "",
            caseId: caseState?.workOrderNummber || "",
            createdDate: new Date(caseState?.workOrderDate ?? TodayDate()).toISOString() || "",
            schedule: caseState.requireSchedule,
            scheduleDate: new Date(caseState?.scheduleDate ?? TodayDate()).toISOString() || "",
        } as CreateCase;

        try {
            await createCase(createJson).unwrap();
        } catch (error: any) {
            setToastType("error");
            setToastMessage(`Failed to create case`);
            setShowToast(true);
            return false;
        }

        const caseListData = localStorage.getItem("caseList") || "[]";
        if (caseListData) {
            const caseList = JSON.parse(caseListData) as CaseList[];
            caseList.push({ ...(createJson as object), createdAt: TodayDate(), createdBy: profile?.username || "" } as CaseList);
            localStorage.setItem("caseList", JSON.stringify(caseList));
        }
        return true;
    }, [caseState, profile, createCase]);

    const updateCaseInLocalStorage = useCallback((updateJson: CreateCase) => {
        try {
            const caseListData = localStorage.getItem("caseList");
            const caseList: CaseList[] = caseListData ? JSON.parse(caseListData) : [];

            const caseIdToUpdate = sopLocal?.id || sopLocal?.caseId;

            if (!caseIdToUpdate) {
                console.error("No case ID found to update");
                return false;
            }

            const caseIndex = caseList.findIndex(item => {
                const itemId = item.id || item.caseId;
                return itemId === caseIdToUpdate;
            });

            if (caseIndex === -1) {
                console.warn(`Case with ID ${caseIdToUpdate} not found in localStorage`);
                return false;
            }

            const originalCase = caseList[caseIndex];
            const updatedCase = {
                ...originalCase,
                ...updateJson,
                id: originalCase.id,
                caseId: originalCase.caseId || originalCase.id,
                createdAt: originalCase.createdAt,
                createdBy: originalCase.createdBy,
                updatedAt: TodayDate(),
                updatedBy: profile?.username || "",
            };

            caseList[caseIndex] = updatedCase;
            localStorage.setItem("caseList", JSON.stringify(caseList));

            if (sopLocal) {
                const updatedSopLocal: CaseSop = {
                    ...sopLocal,
                    caseDetail: updateJson.caseDetail,
                    caselocAddr: updateJson.caselocAddr,
                    caselocAddrDecs: updateJson.caselocAddrDecs,
                    phoneNo: updateJson.phoneNo,
                    priority: updateJson.priority,
                    startedDate: updateJson.startedDate,
                    source: updateJson.source,
                    usercommand: updateJson.usercommand,
                    caseSTypeId: updateJson.caseSTypeId,
                    caseTypeId: updateJson.caseTypeId,
                    caseVersion: updateJson.caseVersion,
                    statusId: updateJson.statusId,
                    caseLat: updateJson.caseLat || sopLocal.caseLat,
                    caseLon: updateJson.caseLon || sopLocal.caseLon,
                    caseDuration: updateJson.caseDuration || sopLocal.caseDuration,
                    usercreate: updateJson.usercreate || sopLocal.usercreate,
                    userreceive: updateJson.userreceive || sopLocal.userreceive,
                    userarrive: updateJson.userarrive || sopLocal.userarrive,
                    userclose: updateJson.userclose || sopLocal.userclose,
                    phoneNoHide: updateJson.phoneNoHide !== undefined ? updateJson.phoneNoHide : sopLocal.phoneNoHide,
                    extReceive: updateJson.extReceive || sopLocal.extReceive,
                    referCaseId: updateJson.referCaseId || sopLocal.referCaseId,
                    resDetail: updateJson.resDetail || sopLocal.resDetail,
                    deviceId: updateJson.deviceId || sopLocal.deviceId,
                    provId: updateJson.provId || sopLocal.provId,
                    distId: updateJson.distId || sopLocal.distId,
                    countryId: sopLocal.countryId,
                    wfId: updateJson.wfId || sopLocal.wfId,
                    versions: updateJson.versions || sopLocal.versions,
                    resId: sopLocal.resId,
                    createdDate: sopLocal.createdDate,
                    commandedDate: sopLocal.commandedDate,
                    receivedDate: sopLocal.receivedDate,
                    arrivedDate: sopLocal.arrivedDate,
                    closedDate: sopLocal.closedDate,
                    createdAt: sopLocal.createdAt,
                    createdBy: sopLocal.createdBy,
                    updatedAt: new Date().toISOString(),
                    updatedBy: profile?.username || sopLocal.updatedBy,
                    sop: sopLocal.sop,
                    currentStage: sopLocal.currentStage,
                    orgId: sopLocal.orgId,
                };

                setSopLocal(updatedSopLocal);
            }

            return true;
        } catch (error) {
            console.error("Error updating case in localStorage:", error);
            return false;
        }
    }, [sopLocal, profile]);

    const handleAssignOfficers = useCallback((selectedOfficerIds: string[]) => {
        const selected = unit?.data?.filter(o => selectedOfficerIds.includes(o.unitId));
        selected && setAssignedOfficers(selected);
        setShowAssignModal(false);
    }, [unit?.data]);

    const handleSaveChanges = useCallback(async () => {
        if (!caseState) return;

        setShowPreviewData(false)
        const updateJson = {
            formData: caseState?.caseType?.formField,
            customerName: caseState?.customerData?.name,
            caseDetail: caseState?.description || "",
            caseDuration: 0,
            caseLat: "",
            caseLon: "",
            caseSTypeId: caseState?.caseType?.sTypeId || "",
            caseTypeId: caseState?.caseType?.typeId || "",
            caseVersion: sopLocal?.caseVersion,
            caselocAddr: caseState?.location || "",
            caselocAddrDecs: caseState?.location || "",
            countryId: caseState?.area?.countryId || "",
            distId: caseState?.area?.distId,
            extReceive: "",
            phoneNoHide: true,
            phoneNo: caseState?.customerData?.mobileNo || "",
            priority: caseState?.caseType?.priority || 0,
            provId: caseState?.area?.provId || "",
            referCaseId: caseState?.workOrderRef || "",
            resDetail: "",
            deviceId: caseState?.iotDevice || "",
            source: caseState?.customerData?.contractMethod?.id || "",
            startedDate: new Date(caseState?.iotDate ?? TodayDate()).toISOString(),
            statusId: sopLocal?.statusId,
            userarrive: "",
            userclose: "",
            usercommand: caseState?.serviceCenter?.commandTh || "",
            usercreate: profile?.username || "",
            userreceive: "",
            nodeId: caseState?.caseType?.formField.nextNodeId || "",
            wfId: caseState?.caseType?.formField.wfId || "",
            versions: caseState?.caseType?.formField.versions || "",
            deptId: caseState?.serviceCenter?.deptId || undefined,
            commId: caseState?.serviceCenter?.commId || undefined,
            stnId: caseState?.serviceCenter?.stnId || undefined,
            caseId: caseState?.workOrderNummber || "",
            createdDate: new Date(caseState?.workOrderDate ?? TodayDate()).toISOString() || "",
            schedule: caseState.requireSchedule,
            scheduleDate: new Date(caseState?.scheduleDate ?? TodayDate()).toISOString() || "",
        } as CreateCase;

        try {
            await updateCase({ caseId: sopLocal?.id || "", updateCase: updateJson }).unwrap();
            const updateSuccess = updateCaseInLocalStorage(updateJson);

            if (updateSuccess) {
                setEditFormData(false);
                setToastMessage("Changes saved successfully!");
                setToastType("success");
                setShowToast(true);
            } else {
                setToastMessage("Changes saved to server, but localStorage update failed");
                setToastType("info");
                setShowToast(true);
            }
        } catch (error: any) {
            setToastType("error");
            setToastMessage(`Failed to Update Case`);
            setShowToast(true);
            return;
        }
    }, [caseState, sopLocal, updateCase, updateCaseInLocalStorage, profile]);

    const handleCreateCase = useCallback(async () => {
        setShowPreviewData(false)
        const isNotError = await createCaseAction("submit");
        if (isNotError === false) {
            return
        }
        setEditFormData(false)
        setToastMessage("Create Case successfully!");
        setToastType("success");
        setShowToast(true);
    }, [createCaseAction]);

    const handlePreviewShow = useCallback(() => {
        const errorMessage = handleCheckRequiredFields();
        if (errorMessage) {
            setToastMessage(errorMessage);
            setToastType("error");
            setShowToast(true);
            return;
        }
        setShowPreviewData(true)
    }, [handleCheckRequiredFields]);

    const handleEditClick = useCallback(() => {
        if (caseState) {
            const newCaseType = caseState.caseType ?
                { caseType: caseState.caseType.caseType || "", priority: caseState.caseType.priority || 0 } :
                { caseType: "", priority: 0 };

            setCaseType(newCaseType);
        }
        setEditFormData(prev => !prev);
    }, [caseState]);

    const handleCaseTypeChange = useCallback((newValue: string) => {
        const newCaseType = findCaseTypeSubType(caseTypeSupTypeData, newValue);
        if (newCaseType) {
            setCaseType(prevCaseType => ({
                ...prevCaseType,
                caseType: newValue
            }));
        }
    }, [caseTypeSupTypeData]);

    // Update handlers to work with single state
    const updateCaseState = useCallback((updates: Partial<CaseItem>) => {
        setCaseState(prev => prev ? { ...prev, ...updates } : prev);
    }, []);

    const handleLocationChange = useCallback((data: string) => {
        updateCaseState({ location: data });
    }, [updateCaseState]);

    const handleDetailChange = useCallback((data: string) => {
        updateCaseState({ description: data });
    }, [updateCaseState]);

    // const handleServiceDateChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    //     const value = e.target.value === "" ? "" : e.target.value;
    //     updateCaseState({ date: value });
    // }, [updateCaseState]);

    const handleContactMethodChange = useCallback((data: { name: string, id: string }) => {
        updateCaseState({
            customerData: {
                ...caseState?.customerData,
                contractMethod: data
            } as Custommer
        });
    }, [updateCaseState, caseState?.customerData]);

    const handleScheduleDate = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value === "" ? "" : e.target.value;
        updateCaseState({ scheduleDate: value });
    }, [updateCaseState]);

    // const handleServiceDateChangeDefault = useCallback((date: string) => {
    //     updateCaseState({ date: date });
    //     return date
    // }, [updateCaseState]);

    const handleWorkOrderDateChangeDefault = useCallback((date: string) => {
        updateCaseState({ workOrderDate: date });
        return date
    }, [updateCaseState]);

    const handleIotDateChangeDefault = useCallback((date: string) => {
        updateCaseState({ iotDate: date });
        return date
    }, [updateCaseState]);

    const handleWorkOrderNumber = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value === "" ? "" : e.target.value;
        updateCaseState({ workOrderNummber: value });
    }, [updateCaseState]);

    const handleWorkOrderRef = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value === "" ? "" : e.target.value;
        updateCaseState({ workOrderRef: value });
    }, [updateCaseState]);

    const handleWorkOrderDate = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value === "" ? "" : e.target.value;
        updateCaseState({ workOrderDate: value });
    }, [updateCaseState]);

    const handleIotDevice = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value === "" ? "" : e.target.value;
        updateCaseState({ iotDevice: value });
    }, [updateCaseState]);

    const handleIotDeviceDate = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value === "" ? "" : e.target.value;
        updateCaseState({ iotDate: value });
    }, [updateCaseState]);

    const handleScheduleDateChangeDefault = useCallback((date: string) => {
        updateCaseState({ scheduleDate: date });
        return date;
    }, [updateCaseState]);

    const handleIsFillGetType = useCallback((isFill: boolean) =>
        setIsValueFill(prev => ({ ...prev, getType: isFill })), []);

    const handleGetTypeFormData = useCallback((getTypeData: FormField) => {
        const newData = { ...selectedCaseTypeForm, formField: getTypeData, caseType: caseType.caseType } as formType;
        updateCaseState({ caseType: newData });
    }, [caseType.caseType, selectedCaseTypeForm, updateCaseState]);

    const handleSetArea = useCallback((selectedName: string) => {
        const selected = areaList.find(item => mergeArea(item) === selectedName);
        if (selected) {
            updateCaseState({ area: selected });
        }
    }, [areaList, updateCaseState]);

    const handleCustomerDataChange = useCallback((data: Custommer) => {
        updateCaseState({ customerData: data });
    }, [updateCaseState]);

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
        localStorage.setItem("Create Case", JSON.stringify(caseState));
        setEditFormData(false)
        setToastMessage("Create Case successfully!");
        setToastType("success");
        setShowToast(true);
    }, [handleCheckRequiredFieldsSaveDraft, createCaseAction, caseState]);

    // Loading state for existing cases
    if (caseData && (isLoading || isFetching)) {
        return (
            <div className="relative flex-1 min-h-screen ">
                <div className="absolute inset-0 flex items-center justify-center  dark:bg-gray-900 bg-opacity-70 dark:bg-opacity-70 z-50 rounded-2xl">
                    <div className="flex flex-col items-center">
                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 mb-4"></div>
                        <div className="text-lg text-gray-700 dark:text-gray-200 font-semibold">
                            Loading Case...
                        </div>
                    </div>
                </div>
            </div>
        );
    }

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
                                {(caseData && sopLocal) && <CaseCard
                                    onAssignClick={() => setShowAssignModal(true)}
                                    onEditClick={handleEditClick}
                                    caseData={sopLocal}
                                    editFormData={editFormData}
                                    setCaseData={setCaseState}
                                />}

                                {/* Display attachFileResult files for existing cases (both edit and view mode) */}
                                {caseData && caseState?.attachFileResult && caseState.attachFileResult.length > 0 && (
                                    <div className="mx-3">
                                        <span className="font-medium text-gray-700 dark:text-gray-200 text-sm">
                                            Attach File :
                                        </span>

                                        {Array.isArray(caseState.attachFileResult) && caseState.attachFileResult.length > 0 && (
                                            <div className="mt-2 mb-3">
                                                <div className="grid grid-cols-3 gap-2">
                                                    {caseState.attachFileResult.map((file: File, index: number) => (
                                                        <div key={file.name + index} className="relative group">
                                                            <img
                                                                src={URL.createObjectURL(file)}
                                                                alt={`Upload ${index + 1}`}
                                                                className="w-full h-20 object-cover rounded border border-gray-600"
                                                            />
                                                            {editFormData && (
                                                                <Button
                                                                    onClick={() => handleRemoveFileResult(index)}
                                                                    className="absolute top-1 right-1 rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                                                    size="sm"
                                                                    variant="error"
                                                                >
                                                                    ×
                                                                </Button>
                                                            )}
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
                                                key={officer.unitId}
                                                className="flex items-center px-2 py-1 rounded bg-blue-100 dark:bg-gray-900 text-blue-700 dark:text-blue-200 text-xs font-medium w-fit"
                                            >
                                                <div onClick={() => handleSelectOfficer(officer)}>
                                                    {showOfficersData?.unitId === officer.unitId ? <ChevronUp /> : <ChevronDown />}
                                                </div>
                                                {getAvatarIconFromString(officer.username, "bg-blue-600 dark:bg-blue-700 mx-1")}
                                                {officer.username}
                                                <Button size="xxs" className="mx-1" variant="outline-no-transparent">Acknowledge</Button>
                                                <Button
                                                    onClick={() => {
                                                        setAssignedOfficers(prev => prev.filter(o => o.unitId !== officer.unitId));
                                                        if (showOfficersData && showOfficersData.unitId === officer.unitId) {
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
                                        {((selectedCaseTypeForm && (caseTypeSupTypeData.find(data => mergeCaseTypeAndSubType(data) === caseType.caseType)?.priority))) && (
                                            <div className="flex items-end justify-end">
                                                <span className={`mr-2 text-gray-900 dark:text-gray-400 `}>Priority</span>
                                                <div
                                                    className={`w-5 h-5 mx-1 p-3 ${getPriorityColorClass(
                                                        caseTypeSupTypeData.find(data => mergeCaseTypeAndSubType(data) === caseType.caseType)?.priority ?? -1
                                                    )} rounded-lg`}
                                                ></div>
                                            </div>
                                        )}

                                        <div className="xsm:grid grid-cols-2">
                                            <div className="px-3 ">
                                                <h3 className=" text-gray-900 dark:text-gray-400 mb-3">Work Order Number : {requireElements}</h3>
                                                <Input
                                                    required={true}
                                                    type="text"
                                                    className={`dark:[&::-webkit-calendar-picker-indicator]:invert ${commonInputCss}`}
                                                    onChange={(e) => handleWorkOrderNumber(e)}
                                                    value={caseState?.workOrderNummber || ""}
                                                    placeholder="Work Order Number"
                                                ></Input>
                                            </div>
                                            <div className="px-3 ">
                                                <h3 className=" text-gray-900 dark:text-gray-400 mb-3">Work Order Reference : </h3>
                                                <Input
                                                    required={true}
                                                    type="text"
                                                    className={`dark:[&::-webkit-calendar-picker-indicator]:invert ${commonInputCss}`}
                                                    onChange={(e) => handleWorkOrderRef(e)}
                                                    value={caseState?.workOrderRef || ""}
                                                    placeholder="Work Order Reference"
                                                ></Input>
                                            </div>



                                            <div className="px-3 ">
                                                <h3 className=" text-gray-900 dark:text-gray-400 mb-3">Create Date : </h3>
                                                <Input
                                                    required={true}
                                                    type="datetime-local"
                                                    className={`dark:[&::-webkit-calendar-picker-indicator]:invert ${commonInputCss}`}
                                                    onChange={(e) => handleWorkOrderDate(e)}
                                                    disabled={true}
                                                    value={caseState?.workOrderDate || handleWorkOrderDateChangeDefault(TodayDate())}
                                                    placeholder="Word Order"
                                                ></Input>
                                            </div>
                                            <div className="px-3 ">
                                                <h3 className=" text-gray-900 dark:text-gray-400 mb-3">Contract Method : {requireElements}</h3>
                                                <SearchableSelect
                                                    options={contractMethodMock.map(m => m.name)}
                                                    className="sm:my-3"
                                                    value={caseState?.customerData?.contractMethod?.name ?? ""}
                                                    onChange={(selectedName) => {
                                                        const selectedMethod = contractMethodMock.find(
                                                            (method) => method.name === selectedName
                                                        );
                                                        if (selectedMethod) {
                                                            handleContactMethodChange(selectedMethod);
                                                        }
                                                    }}
                                                />
                                            </div>


                                            <div className="px-3">
                                                <h3 className=" text-gray-900 dark:text-gray-400 mb-3">Iot Device : </h3>
                                                <Input
                                                    required={true}
                                                    type="text"
                                                    className={`dark:[&::-webkit-calendar-picker-indicator]:invert ${commonInputCss}`}
                                                    onChange={(e) => handleIotDevice(e)}
                                                    value={caseState?.iotDevice || ""}
                                                    placeholder="Iot Device Name"
                                                ></Input>
                                            </div>
                                            <div className="px-3 ">
                                                <h3 className=" text-gray-900 dark:text-gray-400 mb-3">Iot Alert Date : </h3>
                                                <Input
                                                    required={true}
                                                    type="datetime-local"
                                                    className={`dark:[&::-webkit-calendar-picker-indicator]:invert ${commonInputCss}`}
                                                    onChange={(e) => handleIotDeviceDate(e)}
                                                    disabled={true}
                                                    value={caseState?.iotDate || handleIotDateChangeDefault(TodayDate())}
                                                    placeholder="Word Order"
                                                ></Input>
                                            </div>
                                        </div>
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
                                                value={caseState?.description || ""}
                                                placeholder="Enter Case Details"
                                                className={`w-full mx-3 my-2 h-20 p-2 ${commonInputCss}`}
                                                required={true}
                                            ></textarea>
                                        </div>
                                        <div className="sm:grid grid-cols-2">
                                            <div >
                                                <h3 className="w-auto text-gray-900 dark:text-gray-400 mx-3 ">Service Center : </h3>
                                                <SearchableSelect
                                                    options={areaList.map(item => mergeArea(item))}
                                                    value={caseState?.area ? mergeArea(caseState.area) : ""}
                                                    onChange={handleSetArea}
                                                    placeholder={"Select a Service Center"}
                                                    className="2xsm:m-3"
                                                />
                                            </div>
                                            <CustomerInput
                                                listCustomerData={listCustomerData}
                                                handleCustomerDataChange={handleCustomerDataChange}
                                                customerData={caseState?.customerData || {} as Custommer}
                                            />
                                            <div className="pr-6 col-span-2">
                                                <h3 className=" text-gray-900 dark:text-gray-400 mx-3 ">Location Information : </h3>
                                                <textarea
                                                    onChange={(e) => handleLocationChange(e.target.value)}
                                                    value={caseState?.location || ""}
                                                    placeholder="Enter Location"
                                                    className={`w-full mx-3 my-2 h-20 p-2 ${commonInputCss}`}
                                                ></textarea>
                                            </div>
                                            <div className="px-3">
                                                <div className="flex mb-3">

                                                    <h3 className=" text-gray-900 dark:text-gray-400 mr-2">Request Schedule date : </h3> <input
                                                        type="checkbox"
                                                        className="mx-3"
                                                        checked={caseState?.requireSchedule || false}
                                                        onChange={() => {
                                                            setCaseState(prevState => ({
                                                                ...prevState,
                                                                requireSchedule: !prevState?.requireSchedule
                                                            } as CaseItem));
                                                        }}
                                                    />
                                                </div>
                                                <div className="flex">

                                                    <Input
                                                        required={true}
                                                        type="datetime-local"
                                                        disabled={!caseState?.requireSchedule}
                                                        className={`dark:[&::-webkit-calendar-picker-indicator]:invert ${commonInputCss}`}
                                                        onChange={(e) => handleScheduleDate(e)}
                                                        value={caseState?.scheduleDate || handleScheduleDateChangeDefault(TodayDate())}
                                                        min={new Date().toISOString().slice(0, 16)}
                                                    ></Input>
                                                </div>
                                            </div>
                                        </div>

                                        {/* File Upload Section - Only show DND for new cases (no caseData) */}
                                        {!caseData && (
                                            <div className="px-3 my-6">
                                                <h3 className="font-medium text-gray-700 dark:text-gray-200 text-sm mb-3">
                                                    Attach Files:
                                                </h3>
                                                <DragDropFileUpload
                                                    files={caseState?.attachFile || []}
                                                    onFilesChange={handleFilesChange}
                                                    accept="image/*,.pdf,.doc,.docx,.txt"
                                                    maxSize={10}
                                                    className="mb-4"
                                                    disabled={false}
                                                />
                                            </div>
                                        )}

                                        <div className="flex justify-end mt-20 mb-3 mr-3">
                                            {caseData ? <Button variant="success" onClick={handlePreviewShow}>
                                                Save Changes
                                            </Button> :
                                                <div className="flex justify-end">
                                                    <div className="mx-3"><Button onClick={handleSaveDrafts} className="justify-end">Save As Draft</Button></div>
                                                    <Button variant="success" onClick={handlePreviewShow}>
                                                        Submit
                                                    </Button>
                                                </div>}
                                        </div>
                                    </>
                                ) : (
                                    <FormFieldValueDisplay caseData={caseState} />
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
                        <CustomerPanel
                            onClose={() => setIsCustomerPanelOpen(false)}
                            customerData={caseState?.customerData || {} as Custommer}
                        />
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
                <PreviewDataBeforeSubmit
                    caseData={caseState}
                    submitButton={caseData ? handleSaveChanges : handleCreateCase}
                />
            </Modal>

            <AssignOfficerModal
                open={showAssignModal}
                onOpenChange={setShowAssignModal}
                officers={unit?.data || ([] as Unit[])}
                onAssign={handleAssignOfficers}
                assignedOfficers={assignedOfficers}
            />
        </div>
    );
}