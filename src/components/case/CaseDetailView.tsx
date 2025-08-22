"use client"

import { useCallback, useMemo, useState, useEffect, ChangeEvent, memo } from "react"
import {
    ArrowLeft,
    ChevronDown,
    ChevronUp,
} from "lucide-react"
import Button from "@/components/ui/button/Button"

import DynamicForm from "@/components/form/dynamic-form/DynamicForm"
import PageBreadcrumb from "@/components/common/PageBreadCrumb"
import PageMeta from "@/components/common/PageMeta"
import { formType, FormField } from "@/components/interface/FormField"
import AssignOfficerModal from "@/components/assignOfficer/AssignOfficerModel"
import { getPriorityColorClass } from "../function/Prioriy"
import { getAvatarIconFromString } from "../avatar/createAvatarFromString"
import { CommandInformation } from "../assignOfficer/CommandInformation"
import Toast from "../toast/Toast"
import Input from "../form/input/InputField"
import { getLocalISOString, TodayDate } from "../date/DateToString"
import { SearchableSelect } from "../SearchSelectInput/SearchSelectInput"
import { Modal } from "../ui/modal"
import { CaseTypeSubType } from "../interface/CaseType"
import type { Custommer } from "@/types";
import React from "react"
import CustomerInput from "./CaseCustomerInput"
import CustomerPanel from "./CaseCustomerPanel"
import FormFieldValueDisplay from "./CaseDisplay"
import PreviewDataBeforeSubmit from "./PreviewCaseData"
import { Customer } from "@/store/api/custommerApi"
import { CreateCase, useGetCaseHistoryQuery, usePatchUpdateCaseMutation, usePostCreateCaseMutation } from "@/store/api/caseApi"
import { mergeCaseTypeAndSubType } from "../caseTypeSubType/mergeCaseTypeAndSubType"
import { findCaseTypeSubType, findCaseTypeSubTypeByTypeIdSubTypeId } from "../caseTypeSubType/findCaseTypeSubTypeByMergeName"
import { CaseSop, Unit, useGetCaseSopQuery, useGetUnitQuery, usePostDispacthMutationMutation } from "@/store/api/dispatch"
import { contractMethodMock } from "./source"
import { Area, mergeArea } from "@/store/api/area"
// import Checkbox from "../form/input/Checkbox"
// import { data } from "react-router"
import DragDropFileUpload from "../d&d upload/dndUpload"
import { CaseCard } from "./sopCard"
import { CaseDetails, CaseEntity } from "@/types/case"
import { genCaseID } from "../genCaseId/genCaseId"
import { useGetTypeSubTypeQuery } from "@/store/api/formApi"
import CreateSubCaseModel from "./subCase/subCaseModel"




const commonInputCss = "appearance-none border !border-1 rounded  text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent dark:text-gray-300 dark:border-gray-800 dark:bg-gray-900 disabled:text-gray-500 disabled:border-gray-300 disabled:opacity-40 disabled:bg-gray-100 dark:disabled:bg-gray-900 dark:disabled:text-gray-400 dark:disabled:border-gray-700"

const requireElements = <span className=" text-red-500 text-sm font-bold">*</span>



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
                    placeholder={"Select CaseType"}
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

// ## START: Refactored Components ##

// Memoized Header Component
const CaseHeader = memo(({ disablePageMeta, onBack, onOpenCustomerPanel }: {
    disablePageMeta?: boolean;
    onBack?: () => void;
    onOpenCustomerPanel: () => void;
}) => (
    <div className="flex-shrink-0">
        {!disablePageMeta && <PageBreadcrumb pageTitle="Case" />}
        <div className="px-4 sm:px-6">
            <div className="flex items-center justify-between">
                {!disablePageMeta && (
                    <div className="flex items-center space-x-4">
                        {onBack && (
                            <Button variant="ghost" size="sm" onClick={onBack}>
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back
                            </Button>
                        )}
                    </div>
                )}
                <div className="md:hidden">
                    <Button
                        className="mb-2"
                        variant="outline"
                        size="sm"
                        onClick={onOpenCustomerPanel}
                    >

                        View Details Panel
                    </Button>
                </div>
            </div>
        </div>
    </div>
));
CaseHeader.displayName = 'CaseHeader';

// Memoized Attached Files Component
const AttachedFiles = memo(({ files, editFormData, onRemove }: {
    files?: File[];
    editFormData: boolean;
    onRemove: (index: number) => void;
}) => {
    if (!files?.length) return null;

    return (
        <div className="mx-3">
            <span className="font-medium text-gray-700 dark:text-gray-200 text-sm">
                Attach File :
            </span>
            <div className="mt-2 mb-3">
                <div className="grid grid-cols-3 gap-2">
                    {files.map((file, index) => (
                        <div key={`${file.name}-${index}`} className="relative group">
                            <img
                                src={URL.createObjectURL(file)}
                                alt={`Upload ${index + 1}`}
                                className="w-full h-20 object-cover rounded border border-gray-600"
                            />
                            {editFormData && (
                                <Button
                                    onClick={() => onRemove(index)}
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
        </div>
    );
});
AttachedFiles.displayName = 'AttachedFiles';


// Memoized Assigned Officers Component
const AssignedOfficers = memo(({
    assignedOfficers,
    showOfficersData,
    onSelectOfficer,
    onRemoveOfficer,
    handleDispatch,
}: {
    assignedOfficers: Unit[];
    showOfficersData: Unit | null;
    onSelectOfficer: (officer: Unit) => void;
    onRemoveOfficer: (officer: Unit) => void;
    handleDispatch: (officer: Unit) => void;
}) => {
    if (!assignedOfficers.length) return null;

    return (
        <div className="mb-4 flex flex-wrap gap-2 items-center">
            <span className="font-medium text-gray-700 dark:text-gray-200 text-sm">
                Assigned Officer{assignedOfficers.length > 1 ? "s" : ""}:
            </span>
            {assignedOfficers.map(officer => (
                <div
                    key={officer.unitId}
                    className="flex items-center px-2 py-1 rounded bg-blue-100 dark:bg-gray-900 text-blue-700 dark:text-blue-200 text-xs font-medium w-fit"
                >
                    <div onClick={() => onSelectOfficer(officer)} className="cursor-pointer">
                        {showOfficersData?.unitId === officer.unitId ? <ChevronUp /> : <ChevronDown />}
                    </div>
                    {getAvatarIconFromString(officer.username, "bg-blue-600 dark:bg-blue-700 mx-1")}
                    {officer.username}
                    <Button size="xxs" className="mx-1" variant="outline-no-transparent" onClick={() => handleDispatch(officer)}>
                        Acknowledge
                    </Button>
                    <Button
                        onClick={() => onRemoveOfficer(officer)}
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
    );
});
AssignedOfficers.displayName = 'AssignedOfficers';


// Props interface for the form fields component
interface CaseFormFieldsProps {
    caseState: CaseDetails;
    caseData?: CaseEntity;
    setCaseState: React.Dispatch<React.SetStateAction<CaseDetails | undefined>>;
    caseType: { caseType: string; priority: number };
    selectedCaseTypeForm: formType | undefined;
    caseTypeSupTypeData: CaseTypeSubType[];
    areaList: Area[];
    listCustomerData: Customer[];
    isCreate: boolean;
    editFormData: boolean;
    // Handlers
    handleWorkOrderNumber: (e: ChangeEvent<HTMLInputElement>) => void;
    handleWorkOrderDate: (e: ChangeEvent<HTMLInputElement>) => void;
    handleContactMethodChange: (data: { name: string, id: string }) => void;
    handleIotDevice: (e: ChangeEvent<HTMLInputElement>) => void;
    handleIotDeviceDate: (e: ChangeEvent<HTMLInputElement>) => void;
    handleCaseTypeChange: (newValue: string) => void;
    handleGetTypeFormData: (getTypeData: FormField) => void;
    handleIsFillGetType: (isFill: boolean) => void;
    handleDetailChange: (data: string) => void;
    handleSetArea: (selectedName: string) => void;
    handleCustomerDataChange: (data: Custommer) => void;
    handleLocationChange: (data: string) => void;
    handleScheduleDate: (e: ChangeEvent<HTMLInputElement>) => void;
    handleWorkOrderDateChangeDefault: (date: string) => string;
    handleIotDateChangeDefault: (date: string) => string;
    handleScheduleDateChangeDefault: (date: string) => string;
    handleFilesChange: (newFiles: File[]) => void;
    handlePreviewShow: () => void;
    handleSaveDrafts: () => Promise<void>;
}


// Memoized Form Fields Component
const CaseFormFields = memo<CaseFormFieldsProps>(({
    caseState, caseData, setCaseState, caseType, selectedCaseTypeForm, caseTypeSupTypeData,
    areaList, listCustomerData, isCreate, editFormData, handleWorkOrderNumber,
    handleWorkOrderDate, handleContactMethodChange, handleIotDevice, handleIotDeviceDate,
    handleCaseTypeChange, handleGetTypeFormData, handleIsFillGetType, handleDetailChange,
    handleSetArea, handleCustomerDataChange, handleLocationChange, handleScheduleDate,
    handleWorkOrderDateChangeDefault, handleIotDateChangeDefault, handleScheduleDateChangeDefault,
    handleFilesChange, handlePreviewShow, handleSaveDrafts
}) => (
    <>
        {/* Priority Section */}
        {selectedCaseTypeForm && (
            <div className="flex items-end justify-end">
                <span className="mr-2 text-gray-900 dark:text-gray-400">Priority</span>
                <div
                    className={`w-5 h-5 mx-1 p-3 ${getPriorityColorClass(
                        caseTypeSupTypeData.find(data => mergeCaseTypeAndSubType(data) === caseType.caseType)?.priority ?? -1
                    )} rounded-lg`}
                />
            </div>
        )}

        {/* Form Grid */}
        <div className="xsm:grid grid-cols-2">
            {/* Work Order Number */}
            <div className="px-3">
                <h3 className="text-gray-900 dark:text-gray-400 mb-3">
                    Work Order No : {requireElements}
                </h3>
                <Input
                    required
                    type="text"
                    className={`dark:[&::-webkit-calendar-picker-indicator]:invert ${commonInputCss}`}
                    onChange={handleWorkOrderNumber}
                    value={caseState?.workOrderNummber || ""}
                    placeholder="Work Order Number"
                    disabled
                />
            </div>

            {/* Work Order Reference */}
            {caseData?.referCaseId ? (
                <div className="px-3">
                    <h3 className="text-gray-900 dark:text-gray-400 mb-3">Work Order Reference :</h3>
                    <Input
                        required
                        type="text"
                        className={`dark:[&::-webkit-calendar-picker-indicator]:invert ${commonInputCss}`}
                        value={caseState?.workOrderRef || ""}
                        placeholder="Work Order Reference"
                        disabled={true}
                    />
                </div>
            ) : <div></div>}

            {/* Create Date */}
            <div className="px-3">
                <h3 className="text-gray-900 dark:text-gray-400 mb-3">Create Date :</h3>
                <Input
                    required
                    type="datetime-local"
                    className={`dark:[&::-webkit-calendar-picker-indicator]:invert ${commonInputCss}`}
                    onChange={handleWorkOrderDate}
                    disabled
                    value={caseState?.workOrderDate || handleWorkOrderDateChangeDefault(TodayDate())}
                    placeholder="Work Order"
                />
            </div>

            {/* Contract Method */}
            <div className="px-3">
                <h3 className="text-gray-900 dark:text-gray-400 mb-3">
                    Contract Method : {requireElements}
                </h3>
                <SearchableSelect
                    options={contractMethodMock.map(m => m.name)}
                    className="sm:my-3"
                    value={caseState?.customerData?.contractMethod?.name ?? ""}
                    onChange={(selectedName) => {
                        const selectedMethod = contractMethodMock.find(method => method.name === selectedName);
                        if (selectedMethod) handleContactMethodChange(selectedMethod);
                    }}
                />
            </div>

            {/* IoT Device */}
            <div className="px-3">
                <h3 className="text-gray-900 dark:text-gray-400 mb-3">IoT Device ID :</h3>
                <Input
                    required
                    type="text"
                    className={`dark:[&::-webkit-calendar-picker-indicator]:invert ${commonInputCss}`}
                    onChange={handleIotDevice}
                    value={caseState?.iotDevice || ""}
                    placeholder="IoT Device ID"
                />
            </div>

            {/* IoT Alert Date */}
            <div className="px-3">
                <h3 className="text-gray-900 dark:text-gray-400 mb-3">IoT Alert Date :</h3>
                <Input
                    required
                    type="datetime-local"
                    className={`dark:[&::-webkit-calendar-picker-indicator]:invert ${commonInputCss}`}
                    onChange={handleIotDeviceDate}
                    disabled
                    value={caseState?.iotDate || handleIotDateChangeDefault(TodayDate())}
                    placeholder="Work Order"
                />
            </div>
        </div>

        {/* Case Type Form Section */}
        <CaseTypeFormSection
            caseType={caseType.caseType}
            handleCaseTypeChange={handleCaseTypeChange}
            handleGetTypeFormData={handleGetTypeFormData}
            hadleIsFillGetType={handleIsFillGetType}
            selectedCaseTypeForm={selectedCaseTypeForm?.formField}
            editFormData={editFormData}
            caseTypeSupTypeData={caseTypeSupTypeData ?? []}
        />

        {/* Case Details */}
        <div className="pr-7">
            <h3 className="text-gray-900 dark:text-gray-400 mx-3">
                Case Details: {requireElements}
            </h3>
            <textarea
                onChange={(e) => handleDetailChange(e.target.value)}
                value={caseState?.description || ""}
                placeholder="Enter Case Details"
                className={`w-full mx-3 my-2 h-20 p-2 ${commonInputCss}`}
                required
            />
        </div>

        {/* Service Center and Customer */}
        <div className="sm:grid grid-cols-2">
            <div>
                <h3 className="w-auto text-gray-900 dark:text-gray-400 mx-3">Service Center :</h3>
                <SearchableSelect
                    options={areaList.map(item => mergeArea(item))}
                    value={caseState?.area ? mergeArea(caseState.area) : ""}
                    onChange={handleSetArea}
                    placeholder="Select a Service Center"
                    className="2xsm:m-3"
                />
            </div>
            <CustomerInput
                listCustomerData={listCustomerData}
                handleCustomerDataChange={handleCustomerDataChange}
                customerData={caseState?.customerData || {} as Custommer}
            />

            {/* Location Information */}
            <div className="pr-6 col-span-2">
                <h3 className="text-gray-900 dark:text-gray-400 mx-3">Location Information :</h3>
                <textarea
                    onChange={(e) => handleLocationChange(e.target.value)}
                    value={caseState?.location || ""}
                    placeholder="Enter Location"
                    className={`w-full mx-3 my-2 h-20 p-2 ${commonInputCss}`}
                />
            </div>

            {/* Schedule Date */}
            {isCreate &&
                <div className="px-3">
                    <div className="flex mb-3">
                        <h3 className="text-gray-900 dark:text-gray-400 mr-2">Request Schedule date :</h3>
                        <input
                            type="checkbox"
                            className="mx-3"
                            checked={caseState?.requireSchedule || false}
                            onChange={() => {
                                setCaseState(prevState => ({
                                    ...prevState,
                                    requireSchedule: !prevState?.requireSchedule
                                } as CaseDetails));
                            }}
                        />
                    </div>
                    <Input
                        required
                        type="datetime-local"
                        disabled={!caseState?.requireSchedule}
                        className={`dark:[&::-webkit-calendar-picker-indicator]:invert ${commonInputCss}`}
                        onChange={handleScheduleDate}
                        value={caseState?.scheduleDate || handleScheduleDateChangeDefault(TodayDate())}
                        min={new Date().toISOString().slice(0, 16)}
                    />
                </div>}
        </div>

        {/* File Upload for new cases */}
        {isCreate && (
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

        {/* Action Buttons */}
        <div className="flex justify-end mt-20 mb-3 mr-3">
            {!isCreate ? (
                <Button variant="success" onClick={handlePreviewShow}>
                    Save Changes
                </Button>
            ) : (
                <div className="flex justify-end">
                    <Button onClick={handleSaveDrafts} className="mx-3">
                        Save As Draft
                    </Button>
                    <Button variant="success" onClick={handlePreviewShow}>
                        Submit
                    </Button>
                </div>
            )}
        </div>
    </>
));
CaseFormFields.displayName = 'CaseFormFields';


// ## END: Refactored Components ##


export default function CaseDetailView({ onBack, caseData, disablePageMeta = false, isSubCase = false, isCreate = true }: { onBack?: () => void, caseData?: CaseEntity, disablePageMeta?: boolean, isSubCase?: boolean, isCreate?: boolean }) {
    // Initialize state with proper defaults

    const [caseState, setCaseState] = useState<CaseDetails | undefined>(() => {
        // Only initialize if it's a new case (no caseData)
        if (!caseData) {
            return {
                location: "",
                date: "",
                caseType: undefined,
                priority: 0,
                description: "",
                area: undefined,
                workOrderNummber: genCaseID(),
                status: "",
                scheduleDate: "",
                customerData: {} as Custommer,
                attachFile: [] as File[], // For new cases (edit mode)
                attachFileResult: [] as File[] // For existing cases (view/edit mode)
            } as CaseDetails;
        }
        return undefined;
    });

    const [showAssignModal, setShowAssignModal] = useState(false);
    const [showCreateSupCase, setShowCreateSupCase] = useState(false);
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
            skip: !caseData?.caseId || isCreate
        }
    );

    const { data: unit } = useGetUnitQuery(
        { caseId: caseData?.caseId || "" },
        { skip: !caseData?.caseId || isCreate }
    )



    const { data: comments } = useGetCaseHistoryQuery(
        { caseId: caseData?.caseId || "" },
        { skip: !caseData?.caseId || isCreate }
    )

    const [createCase] = usePostCreateCaseMutation();
    const [updateCase] = usePatchUpdateCaseMutation();
    const [postDispatch] = usePostDispacthMutationMutation();
    // Initialize customer data ONCE
    useEffect(() => {
        if (!isInitialized) {
            const customerList = JSON.parse(localStorage.getItem("customer_data") ?? "[]") as Customer[];
            setListCustomerData(customerList);
            setIsInitialized(true);
        }
    }, [isInitialized]);

    const [triggerFetch, setTriggerFetch] = useState<string | null>(null);

    const {
        data: apiFormData,
        error,
        isLoading: apiIsLoading
    } = useGetTypeSubTypeQuery(triggerFetch || '', {
        skip: !triggerFetch,
    });

    useEffect(() => {
        if (apiFormData?.data && triggerFetch) {
            localStorage.setItem(
                "subTypeForm-" + triggerFetch,
                JSON.stringify(apiFormData.data)
            );
            setTriggerFetch(null);
        }
    }, [apiFormData, triggerFetch]);

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
    }, []);

    useEffect(() => {

        if (!caseType.caseType || !caseTypeSupTypeData.length) {
            return;
        }

        const newCaseType = findCaseTypeSubType(caseTypeSupTypeData, caseType.caseType);

        if (!newCaseType?.sTypeId) {
            return;
        }

        const formFieldStr = localStorage.getItem("subTypeForm-" + newCaseType.sTypeId);
        if (formFieldStr === null && triggerFetch !== newCaseType.sTypeId) {
            setTriggerFetch(newCaseType.sTypeId);
        }
    }, [caseType.caseType, caseTypeSupTypeData, triggerFetch]);


    const getFormByCaseType = useCallback(() => {
        if (!caseType.caseType || !caseTypeSupTypeData.length) {
            return undefined;
        }

        const newCaseType = findCaseTypeSubType(caseTypeSupTypeData, caseType.caseType);

        if (!newCaseType?.sTypeId) {
            return undefined;
        }

        // Check localStorage first
        const formFieldStr = localStorage.getItem("subTypeForm-" + newCaseType.sTypeId);

        if (formFieldStr && formFieldStr !== "undefined") {
            try {
                const formField: FormField = JSON.parse(formFieldStr);
                return {
                    ...newCaseType,
                    caseType: mergeCaseTypeAndSubType(newCaseType),
                    formField,
                    isLoading: false,
                    error: null,
                } as formType & { isLoading: boolean; error: any };
            } catch (e) {
                console.error("Failed to parse formField JSON:", e);
                localStorage.removeItem("subTypeForm-" + newCaseType.sTypeId);
                // Continue to the fetch logic below
            }
        }

        // Return data based on the current API state
        return {
            ...newCaseType,
            caseType: mergeCaseTypeAndSubType(newCaseType),
            formField: apiFormData?.data || ({} as FormField),
            isLoading: apiIsLoading && triggerFetch === newCaseType.sTypeId,
            error: error,
        } as formType & { isLoading: boolean; error: any };
    }, [caseType.caseType, triggerFetch, apiFormData, apiIsLoading, error]);

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

            const newCaseState: CaseDetails = {
                location: sopLocal?.caselocAddr || "",
                date: utcTimestamp ? getLocalISOString(utcTimestamp) : "",
                caseType: getFormByCaseType(),
                priority: sopLocal?.priority || 0,
                description: sopLocal?.caseDetail || "",
                workOrderNummber: sopLocal?.caseId || "",
                workOrderRef: sopLocal?.referCaseId || "",
                iotDevice: sopLocal?.deviceId || "",
                iotDate: sopLocal?.startedDate || "",
                area: area,
                status: "",
                attachFile: [] as File[], // For new cases (edit mode)
                attachFileResult: [] as File[] // Initialize as empty array for view mode
            } as CaseDetails;

            setCaseState(newCaseState);
        }
        else if (isSubCase) {
            const newCaseState: CaseDetails = {

                workOrderNummber: caseData?.caseId || "",
                workOrderRef: caseData?.referCaseId || "",
            } as CaseDetails;

            setCaseState(newCaseState);
        }

    }, [sopLocal, caseData, areaList.length]);


    useEffect(() => {
        if (selectedCaseTypeForm === undefined ||
            selectedCaseTypeForm.formField === undefined ||
            Object.keys(selectedCaseTypeForm.formField || {}).length === 0) {
            setIsValueFill(prev => ({ ...prev, DynamicForm: true }));
        }
    }, [selectedCaseTypeForm]);

    // Update customer data ONLY when necessary data is available
    useEffect(() => {
        if (listCustomerData.length > 0) {
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
            } as CaseDetails : prev);
        }
    }, [listCustomerData.length, sopLocal, caseData?.phoneNo]);

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

    const handleRemoveOfficer = useCallback((officerToRemove: Unit) => {
        setAssignedOfficers(prev => prev.filter(o => o.unitId !== officerToRemove.unitId));
        if (showOfficersData?.unitId === officerToRemove.unitId) {
            setShowOFFicersData(null);
        }
    }, [showOfficersData?.unitId]);

    const handleCheckRequiredFields = useCallback(() => {
        let errorMessage = "";
        if (!caseType.caseType) {
            errorMessage = "Please select a Case Type.";
        } else if (!caseState?.workOrderNummber) {
            errorMessage = "Please enter Work Order Number.";
        } else if (!caseState?.description?.trim()) {
            errorMessage = "Please enter Case Details.";
        } else if (!caseState?.customerData?.contractMethod?.name.trim()) {
            errorMessage = "Please select a Contact Method.";
        } else if (((!isValueFill.dynamicForm && caseState?.formData) || (!isValueFill.getType && selectedCaseTypeForm)) && Object.keys(selectedCaseTypeForm?.formField as object).length !== 0) {
            errorMessage = "Please ensure all dynamic form fields are filled.";
        }
        return errorMessage;
    }, [caseType.caseType, caseState, isValueFill, selectedCaseTypeForm]);

    const handleCheckRequiredFieldsSaveDraft = useCallback(() => {
        let errorMessage = "";
        if (!caseType.caseType) {
            errorMessage = "Please select a Service Type.";
        }
        return errorMessage;
    }, [caseType.caseType]);

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
            nodeId: caseState?.caseType?.formField?.nextNodeId || "",
            wfId: caseState?.caseType?.wfId || "",
            versions: caseState?.caseType?.formField?.versions || "",
            caseId: caseState?.workOrderNummber || "",
            createdDate: new Date(caseState?.workOrderDate ?? TodayDate()).toISOString() || "",
            scheduleFlag: caseState.requireSchedule,
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
            const caseList = JSON.parse(caseListData) as CaseEntity[];
            caseList.push({ ...(createJson as object), createdAt: TodayDate(), createdBy: profile?.username || "" } as CaseEntity);
            localStorage.setItem("caseList", JSON.stringify(caseList));
        }
        return true;
    }, [caseState, profile, createCase]);

    const updateCaseInLocalStorage = useCallback((updateJson: CreateCase) => {
        try {
            const caseListData = localStorage.getItem("caseList");
            const caseList: CaseEntity[] = caseListData ? JSON.parse(caseListData) : [];

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
                caseId: originalCase.caseId,
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
            nodeId: caseState?.caseType?.formField?.nextNodeId || "",
            wfId: caseState?.caseType?.wfId || "",
            versions: caseState?.caseType?.formField.versions || "",
            deptId: caseState?.serviceCenter?.deptId || undefined,
            commId: caseState?.serviceCenter?.commId || undefined,
            stnId: caseState?.serviceCenter?.stnId || undefined,
            caseId: caseState?.workOrderNummber || "",
            createdDate: new Date(caseState?.workOrderDate ?? TodayDate()).toISOString() || "",
            scheduleFlag: caseState.requireSchedule,
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
        setEditFormData(prev => !prev);
    }, []);

    const handleCaseTypeChange = useCallback((newValue: string) => {
        const newCaseType = findCaseTypeSubType(caseTypeSupTypeData, newValue);
        if (newCaseType) {
            setCaseType(prevCaseType => ({
                ...prevCaseType,
                caseType: newValue
            }));
            setCaseState(
                prev => prev ? {
                    ...prev,
                    caseType: {
                        ...newCaseType,
                        caseType: mergeCaseTypeAndSubType(newCaseType)
                    } as formType
                } : prev
            )
        }
    }, [caseTypeSupTypeData]);

    const updateCaseState = useCallback((updates: Partial<CaseDetails>) => {
        setCaseState(prev => prev ? { ...prev, ...updates } : prev);
    }, []);

    const handleLocationChange = useCallback((data: string) => {
        updateCaseState({ location: data });
    }, [updateCaseState]);

    const handleDetailChange = useCallback((data: string) => {
        updateCaseState({ description: data });
    }, [updateCaseState]);

    const handleContactMethodChange = useCallback((data: { name: string, id: string }) => {
        setCaseState(prev => {
            if (!prev) return prev;
            return {
                ...prev,
                customerData: {
                    ...prev.customerData,
                    contractMethod: data
                } as Custommer
            };
        });
    }, []);

    const handleScheduleDate = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value === "" ? "" : e.target.value;
        updateCaseState({ scheduleDate: value });
    }, [updateCaseState]);

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
    // console.log(sopData)
    const handleDispatch = useCallback(async (officer: Unit) => {
        // This object creation is correct
        const dispatchjson = {
            unitId: officer.unitId,
            caseId: caseData!.caseId,
            nodeId: sopData?.data?.dispatchStage?.nodeId,
            status: sopData?.data?.dispatchStage?.data?.data?.config?.action,
            unitUser: profile.username
        };

        // console.log("Dispatching with:", dispatchjson);

        try {
            // 2. Call the 'postDispatch' trigger function inside your event handler.
            //    '.unwrap()' is a helpful utility that will automatically throw an
            //    error if the mutation fails, making it easy to use with try/catch.
            const payload = await postDispatch(dispatchjson).unwrap();

            console.log('Dispatch successful:', payload);
            setToastMessage("Dispatch Successfully!");
            setToastType("success");
            setShowToast(true);

        } catch (error) {
            console.error('Dispatch failed:', error);
            setToastMessage("Dispatch Failed");
            // You might want an error toast type here
            setToastType("error");
            setShowToast(true);
        }
    }, [caseData, profile.username, postDispatch]); // 3. Add dependencies to useCallback

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

    // Main component
    return (
        <div className="flex flex-col h-screen">
            {!disablePageMeta && <PageMeta title="Case Detail" description="Case Detail Page" />}

            {/* Toast */}
            {showToast && (
                <Toast
                    message={toastMessage}
                    type={toastType}
                    duration={3000}
                    onClose={() => setShowToast(false)}
                />
            )}

            {/* Header */}
            <CaseHeader
                disablePageMeta={disablePageMeta}
                onBack={onBack}
                onOpenCustomerPanel={() => setIsCustomerPanelOpen(true)}
            />

            {/* Main Content */}
            <div className="flex-1 overflow-hidden bg-white dark:bg-gray-800 md:flex rounded-2xl custom-scrollbar">
                <div className="flex flex-col md:flex-row h-full gap-1 w-full">

                    {/* Left Panel */}
                    <div className="overflow-y-auto w-full md:w-2/3 lg:w-3/4 custom-scrollbar">
                        <div className="pr-0">
                            <div className="px-4 pt-6">

                                {/* Case Card */}
                                {(caseData && sopLocal) && (
                                    <CaseCard
                                        onAddSubCase={() => setShowCreateSupCase(true)}
                                        onAssignClick={() => setShowAssignModal(true)}
                                        onEditClick={handleEditClick}
                                        caseData={sopLocal}
                                        editFormData={editFormData}
                                        setCaseData={setCaseState}
                                        comment={comments?.data}
                                    />
                                )}

                                <AttachedFiles
                                    files={caseState?.attachFileResult}
                                    editFormData={editFormData}
                                    onRemove={handleRemoveFileResult}
                                />
                                <AssignedOfficers
                                    assignedOfficers={assignedOfficers}
                                    showOfficersData={showOfficersData}
                                    onSelectOfficer={handleSelectOfficer}
                                    onRemoveOfficer={handleRemoveOfficer}
                                    handleDispatch={handleDispatch}
                                />

                                {showOfficersData && <CommandInformation className="my-2" />}
                            </div>

                            {/* Form Content */}
                            <div className="px-4">
                                {(editFormData || isCreate) && caseState ? (
                                    <CaseFormFields
                                        caseState={caseState}
                                        caseData={caseData}
                                        setCaseState={setCaseState}
                                        caseType={caseType}
                                        selectedCaseTypeForm={selectedCaseTypeForm}
                                        caseTypeSupTypeData={caseTypeSupTypeData}
                                        areaList={areaList}
                                        listCustomerData={listCustomerData}
                                        isCreate={isCreate}
                                        editFormData={editFormData}
                                        handleWorkOrderNumber={handleWorkOrderNumber}
                                        handleWorkOrderDate={handleWorkOrderDate}
                                        handleContactMethodChange={handleContactMethodChange}
                                        handleIotDevice={handleIotDevice}
                                        handleIotDeviceDate={handleIotDeviceDate}
                                        handleCaseTypeChange={handleCaseTypeChange}
                                        handleGetTypeFormData={handleGetTypeFormData}
                                        handleIsFillGetType={handleIsFillGetType}
                                        handleDetailChange={handleDetailChange}
                                        handleSetArea={handleSetArea}
                                        handleCustomerDataChange={handleCustomerDataChange}
                                        handleLocationChange={handleLocationChange}
                                        handleScheduleDate={handleScheduleDate}
                                        handleWorkOrderDateChangeDefault={handleWorkOrderDateChangeDefault}
                                        handleIotDateChangeDefault={handleIotDateChangeDefault}
                                        handleScheduleDateChangeDefault={handleScheduleDateChangeDefault}
                                        handleFilesChange={handleFilesChange}
                                        handlePreviewShow={handlePreviewShow}
                                        handleSaveDrafts={handleSaveDrafts}
                                    />
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
                            caseItem={caseState || {} as CaseDetails}
                        />
                    </div>
                </div>
            </div>

            {/* Overlay for mobile */}
            {isCustomerPanelOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-30 md:hidden"
                    onClick={() => setIsCustomerPanelOpen(false)}
                />
            )}

            {/* Modals */}
            <Modal
                isOpen={showPreviewData}
                onClose={() => setShowPreviewData(false)}
                className="max-w-2xl h-4/5 p-6 dark:!bg-gray-800 overflow-auto custom-scrollbar"
            >
                <PreviewDataBeforeSubmit
                    caseData={caseState}
                    submitButton={caseData ? handleSaveChanges : handleCreateCase}
                />
            </Modal>

            <CreateSubCaseModel
                caseData={caseData}
                open={showCreateSupCase}
                onOpenChange={setShowCreateSupCase}
            />

            <AssignOfficerModal
                open={showAssignModal}
                onOpenChange={setShowAssignModal}
                officers={unit?.data || []}
                onAssign={handleAssignOfficers}
                assignedOfficers={assignedOfficers}
            />
        </div>
    );
}