"use client"

import { useCallback, useMemo, useState, useEffect, ChangeEvent, memo } from "react"
import {
    ArrowLeft,
    FileText,
} from "lucide-react"
import Button from "@/components/ui/button/Button"
import { useLazyGetTypeSubTypeQuery } from "@/store/api/formApi";
import DynamicForm from "@/components/form/dynamic-form/DynamicForm"
import { formType, FormField, FormFieldWithNode } from "@/components/interface/FormField"
import { getPriorityColorClass } from "../../function/Prioriy"
import Input from "../../form/input/InputField"
import { convertFromThaiYear, getDisplayDate, getLocalISOString, getTodayDate, TodayDate } from "../../date/DateToString"
import { CaseTypeSubType } from "../../interface/CaseType"
import type { Custommer } from "@/types";
import React from "react"
import CustomerInput from "../CaseCustomerInput"
import PreviewDataBeforeSubmit from "../PreviewCaseData"
import { Customer } from "@/store/api/custommerApi"
import { CreateCase, usePostCreateCaseMutation } from "@/store/api/caseApi"
import { mergeCaseTypeAndSubType } from "../../caseTypeSubType/mergeCaseTypeAndSubType"
import { findCaseTypeSubType, findCaseTypeSubTypeByTypeIdSubTypeId } from "../../caseTypeSubType/findCaseTypeSubTypeByMergeName"
import { Area, mergeArea } from "@/store/api/area"
import DragDropFileUpload from "../../d&d upload/dndUpload"
import { CaseDetails, CaseEntity, FileItem } from "@/types/case"
import { genCaseID } from "../../genCaseId/genCaseId"
import { useNavigate, useParams } from "react-router"
import { useTranslation } from "@/hooks/useTranslation";
import { TranslationParams } from "@/types/i18n";
import { registerLocale } from 'react-datepicker';
import { th, enUS } from 'date-fns/locale';
import "react-datepicker/dist/react-datepicker.css";
import DatePickerLocal from "@/components/form/input/DatepicketLocal";
import { exampleCaseState } from "../constants/exampleData";
import { detailsStringLimit, REQUIRED_ELEMENT as requireElements, source } from "../constants/caseConstants";
import { validateCaseForDraft, validateCaseForSubmission } from "../caseDataValidation/caseDataValidation";
import { COMMON_INPUT_CSS as commonInputCss } from "../constants/caseConstants";
import { CaseLayout } from "./layout";
import { SearchableSelect } from "@/components/SearchInput/SearchSelectInput";
import { useToast } from "@/hooks/useToast";
import { ToastContainer } from "@/components/crud/ToastContainer";
import TextAreaWithCounter from "@/components/form/input/TextAreaWithCounter";
import { CaseSop } from "@/types/dispatch";
import { idbStorage } from "@/components/idb/idb";
// const commonInputCss = "appearance-none border !border-1 rounded  text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent dark:text-gray-300 dark:border-gray-800 dark:bg-gray-900 disabled:text-gray-500 disabled:border-gray-300 disabled:opacity-40 disabled:bg-gray-100 dark:disabled:bg-gray-900 dark:disabled:text-gray-400 dark:disabled:border-gray-700"

interface CaseTypeFormSectionProps {
    handleGetTypeFormData: (getTypeData: FormField) => void;
    selectedCaseTypeForm: FormField | undefined;
    children?: React.ReactNode;

}

const CaseTypeFormSection: React.FC<CaseTypeFormSectionProps> = ({
    handleGetTypeFormData,
    selectedCaseTypeForm,
    children
}) => {

    return (
        <>

            {children}
            {selectedCaseTypeForm?.formFieldJson && (
                <>
                    <DynamicForm
                        initialForm={selectedCaseTypeForm}
                        edit={false}
                        editFormData={true}
                        enableFormTitle={false}
                        onFormChange={handleGetTypeFormData}
                    />
                </>
            )}
        </>
    );
};

// ## START: Refactored Components ##

// Memoized Header Component
const CaseHeader = memo(({ disablePageMeta, onBack, onOpenCustomerPanel, t }: {
    disablePageMeta?: boolean;
    onBack?: () => void;
    onOpenCustomerPanel: () => void;
    isCreate: boolean;
    t: (key: string, params?: TranslationParams | undefined) => string;
}) => (
    <div className="flex-shrink-0">
        {/* {!disablePageMeta && <PageBreadcrumb pageTitle={isCreate ? "Create Case" : "Case"} />} */}
        <div className="">
            <div className="flex items-center justify-between">
                {!disablePageMeta && (
                    <div className="flex items-center space-x-4">
                        {onBack && (
                            <Button variant="ghost" size="sm" onClick={onBack}>
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                {t("case.back")}
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

                        {t("case.panel.details_panel")}
                    </Button>
                </div>
            </div>
        </div>
    </div>
));
CaseHeader.displayName = 'CaseHeader';





interface CaseFormFieldsProps {
    caseState: CaseDetails;
    caseData?: CaseEntity;
    setCaseState: React.Dispatch<React.SetStateAction<CaseDetails | undefined>>;
    caseType: { caseType: string; priority: number };
    selectedCaseTypeForm: formType | undefined;
    caseTypeSupTypeData: CaseTypeSubType[];
    areaList: Area[];
    listCustomerData: Customer[];
    // Handlers
    caseTypeOptions: string[]
    handleWorkOrderNumber: (e: ChangeEvent<HTMLInputElement>) => void;
    handleWorkOrderDate: (e: ChangeEvent<HTMLInputElement>) => void;
    handleContactMethodChange: (data: { name: string, id: string }) => void;
    handleIotDevice: (e: ChangeEvent<HTMLInputElement>) => void;
    handleIotDeviceDate: (e: ChangeEvent<HTMLInputElement>) => void;
    handleCaseTypeChange: (newValue: string) => void;
    handleGetTypeFormData: (getTypeData: FormField) => void;
    handleDetailChange: (data: string) => void;
    handleSetArea: (selectedName: string) => void;
    handleCustomerDataChange: (data: Custommer) => void;
    handleLocationChange: (data: string) => void;
    handleScheduleDate: (date: Date | null) => void;
    handleWorkOrderDateChangeDefault: (date: string) => string;
    handleIotDateChangeDefault: (date: string) => string;
    handleScheduleDateChangeDefault: (date: string) => string;
    handleFilesChange: (newFiles: FileItem[]) => void;
    handlePreviewShow: () => void;
    handleSaveDrafts: () => Promise<void>;
    handleExampleData: () => void;
    language: string,
    t: (key: string, params?: TranslationParams | undefined) => string,
    isScheduleDate?: boolean
}


// Memoized Form Fields Component
const CaseFormFields = memo<CaseFormFieldsProps>(({
    caseState, caseData, caseType, selectedCaseTypeForm, caseTypeSupTypeData,
    areaList, listCustomerData,
    handleIotDevice,
    handleCaseTypeChange, handleGetTypeFormData, handleDetailChange,
    handleSetArea, handleCustomerDataChange, handleLocationChange, handleScheduleDate,
    caseTypeOptions,
    handleFilesChange, handlePreviewShow, handleSaveDrafts, handleExampleData, language, t,
}) => (
    <>
        {/* Priority Section */}
        {selectedCaseTypeForm && (
            <div className="flex items-end justify-end">
                <span className="mr-2 text-gray-900 dark:text-gray-400">{t("case.assignment.piority")}</span>
                <div
                    className={`w-5 h-5 mx-1 p-3 ${getPriorityColorClass(
                        caseTypeSupTypeData.find(data => mergeCaseTypeAndSubType(data, language) === caseType.caseType)?.priority ?? -1
                    )} rounded-lg`}
                />
            </div>
        )}
        <div className="px-3 mb-3">
            <div className="flex mb-3">
                <h3 className="text-gray-900 dark:text-gray-400 mr-2">{t("case.display.request_schedule_date")} :</h3>
            </div>
            <DatePickerLocal
                selected={getDisplayDate(caseState?.scheduleDate, language)}
                onChange={(date: Date | null) => {
                    const gregorianDate = language === 'th' ? convertFromThaiYear(date) : date;
                    handleScheduleDate(gregorianDate);
                }}
                language={language}
                showTimeSelect
                dateFormat="Pp"
                minDate={getTodayDate(language)}
                popperClassName="z-50"
                wrapperClassName="w-full"
                className={`p-2 w-full dark:[&::-webkit-calendar-picker-indicator]:invert ${commonInputCss}`}
                placeholderText={t("case.display.schedule_placeholder")}
                locale={language === 'th' ? 'th' : 'en'}
            />
        </div>
        {/* Form Grid */}
        {/* Case Type Form Section */}
        <CaseTypeFormSection
            handleGetTypeFormData={handleGetTypeFormData}
            selectedCaseTypeForm={selectedCaseTypeForm?.formField}
        >
            <div className="grid-cols-2 sm:grid">
                <div className="text-white dark:text-gray-300">
                    <div className="flex justify-between mx-3 text-gray-900 dark:text-gray-400">
                        <h3 className="mb-3 block text-gray-900 dark:text-gray-400">{t("case.display.types")} :{requireElements}</h3>
                    </div>
                    <SearchableSelect
                        options={caseTypeOptions}
                        value={caseType.caseType}
                        onChange={handleCaseTypeChange}
                        placeholder={t("case.display.select_types_placeholder")}
                        className={`2xsm:mx-3 mb-2 `}
                    />
                </div>
                <div className="px-3 mb-3">
                    <h3 className="text-gray-900 dark:text-gray-400 mb-3">{t("case.display.iot_device")} :</h3>
                    <Input
                        required
                        type="text"
                        className={`dark:[&::-webkit-calendar-picker-indicator]:invert ${commonInputCss}`}
                        onChange={handleIotDevice}
                        value={caseState?.iotDevice || ""}
                        placeholder={t("case.display.iot_device_placeholde")}
                    />
                </div>
            </div>
        </CaseTypeFormSection>

        <div className="xsm:grid grid-cols-2">
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
            ) : null}

        </div>



        {/* Case Details */}
        <div className="pr-7 mb-1">
            <h3 className="text-gray-900 dark:text-gray-400 mx-4">
                {t("case.display.case_detail")}: {requireElements}
            </h3>
            <TextAreaWithCounter
                maxLength={detailsStringLimit}
                onChange={(e) => handleDetailChange(e.target.value)}
                value={caseState?.description || ""}
                placeholder={t("case.display.case_detail_placeholder")}
                className={`w-full h-20 ${commonInputCss}`}
                required
                containnerClass="m-3"
            />
        </div>

        {/* Service Center and Customer */}
        <div className="sm:grid grid-cols-1">
            <div className="">
                <h3 className="w-auto text-gray-900 dark:text-gray-400 mx-3">{t("case.display.service_center")} :</h3>
                <SearchableSelect
                    options={areaList.map(item => mergeArea(item, language))}
                    value={caseState?.area ? mergeArea(caseState.area, language) : ""}
                    onChange={handleSetArea}
                    placeholder={t("case.display.select_service_center")}
                    className="2xsm:m-3 sm:w-full"
                />
            </div>
            <CustomerInput
                listCustomerData={listCustomerData}
                hidePhone={true}
                handleCustomerDataChange={handleCustomerDataChange}
                customerData={caseState?.customerData || {} as Custommer}
            />

            {/* Location Information */}
            <div className="pr-6 col-span-2">
                <h3 className="text-gray-900 dark:text-gray-400 mx-3">{t("case.display.area")} :</h3>
                <textarea
                    onChange={(e) => handleLocationChange(e.target.value)}
                    value={caseState?.location || ""}
                    placeholder={t("case.display.area_placeholder")}
                    className={`w-full mx-3 my-2 h-20 p-2 ${commonInputCss}`}
                />
            </div>

        </div>

        {/* File Upload for new cases */}

        <div className="px-3 my-6">
            <h3 className="font-medium text-gray-700 dark:text-gray-200 text-sm mb-3">
                {t("case.display.attach_file")}:
            </h3>
            <DragDropFileUpload
                files={caseState?.attachFile || []}
                onFilesChange={handleFilesChange}
                accept="image/*,.pdf,.doc,.docx,.txt"
                maxSize={1}
                className="mb-4"
                type="case"
                disabled={false}
            />
        </div>
        <div className="flex justify-between items-center m-3">
            {/* Left side: Example button */}
            <div>
                <Button onClick={handleExampleData} size="sm">
                    <FileText className=" h-4 w-4" />
                </Button>
            </div>

            {/* Right side: Action Buttons */}

            <div className="flex">
                <Button onClick={handleSaveDrafts} className="mx-3">
                    {t("case.display.save_as_draft")}
                </Button>
                <Button variant="success" onClick={handlePreviewShow}>
                    {t("case.display.submit")}
                </Button>
            </div>


        </div>

    </>
));
CaseFormFields.displayName = 'CaseFormFields';


// ## END: Refactored Components ##


export default function CaseDetailViewSchedule({ onBack, caseData, disablePageMeta = false, isSubCase = false, isCreate = true }: { onBack?: () => void, caseData?: CaseEntity, disablePageMeta?: boolean, isSubCase?: boolean, isCreate?: boolean, isScheduleDate?: boolean }) {
    const navigate = useNavigate()
    const handleBack = useCallback(() => {
        if (onBack) {
            onBack();
        } else {
            navigate('/case/assignment');
        }
    }, [onBack, navigate]);
    const { caseId: paramCaseId } = useParams<{ caseId: string }>();
    const initialCaseData: CaseEntity | undefined = caseData || (paramCaseId ? { caseId: paramCaseId } as CaseEntity : undefined);
    const [formDataUpdated, setFormDataUpdated] = useState(0);
    const [caseState, setCaseState] = useState<CaseDetails | undefined>(() => {
        if (!initialCaseData) {
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
                attachFile: [] as File[],
                attachFileResult: [] as File[]
            } as CaseDetails;
        }
        return undefined;
    });
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    // const [isValueFill, setIsValueFill] = useState({ getType: false, dynamicForm: false });
    const [showPreviewData, setShowPreviewData] = useState(false);
    const [sopLocal] = useState<CaseSop>();
    const [listCustomerData, setListCustomerData] = useState<Customer[]>([])
    const [isInitialized, setIsInitialized] = useState(false);
    const { t, language } = useTranslation();
    const { toasts, addToast, removeToast } = useToast();
    if (language === "th") {
        registerLocale("th", th);
    } else {
        registerLocale("en", enUS);
    }

    const caseTypeSupTypeData = useMemo(() =>
        JSON.parse(localStorage.getItem("caseTypeSubType") ?? "[]") as CaseTypeSubType[], []
    );
    const caseTypeOptions = useMemo(() => {
        if (!caseTypeSupTypeData?.length) return [];
        return caseTypeSupTypeData.map(item =>
            mergeCaseTypeAndSubType(item, language)
        );
    }, [caseTypeSupTypeData]);
    const areaList = useMemo(() =>
        JSON.parse(localStorage.getItem("area") ?? "[]") as Area[], []
    );

    const profile = useMemo(() =>
        JSON.parse(localStorage.getItem("profile") ?? "{}"), []
    );

    const [createCase] = usePostCreateCaseMutation();
    // Initialize customer data ONCE
    useEffect(() => {
        if (!isInitialized) {
            const customerList = JSON.parse(localStorage.getItem("customer_data") ?? "[]") as Customer[];
            setListCustomerData(customerList);
            setIsInitialized(true);
        }
    }, [isInitialized]);

    const [getTypeSubType] = useLazyGetTypeSubTypeQuery();

    useEffect(() => {
        const fetchFormData = async () => {
            if (!caseState?.caseType?.sTypeId) return;

            // Check if data already exists in localStorage
            const existingData = localStorage.getItem("subTypeForm-" + caseState.caseType.sTypeId);
            if (existingData && existingData !== "undefined") {
                return; // Data already exists, no need to fetch
            }

            try {
                const result = await getTypeSubType(caseState.caseType.sTypeId).unwrap();
                if (result) {
                    localStorage.setItem(
                        "subTypeForm-" + caseState.caseType.sTypeId,
                        JSON.stringify(result.data)
                    );
                    // Trigger re-evaluation
                    setFormDataUpdated(prev => prev + 1);
                }
            } catch (error) {
                console.error('Error fetching form data:', error);
            }
        };

        fetchFormData();
    }, [caseState?.caseType?.sTypeId, getTypeSubType]);

    const getFormByCaseType = useCallback(() => {
        if (!caseState?.caseType?.caseType || !caseTypeSupTypeData.length) {
            return undefined;
        }

        const newCaseType = findCaseTypeSubType(caseTypeSupTypeData, caseState.caseType.caseType, language);

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
                    caseType: mergeCaseTypeAndSubType(newCaseType, language),
                    formField,
                    isLoading: false,
                    error: null,
                } as formType & { isLoading: boolean; error: any };
            } catch (e) {
                console.error("Failed to parse formField JSON:", e);
                localStorage.removeItem("subTypeForm-" + newCaseType.sTypeId);
            }
        }

        // Return data without formField if not found
        return {
            ...newCaseType,
            caseType: mergeCaseTypeAndSubType(newCaseType, language),
        } as formType;
    }, [caseState?.caseType?.caseType, caseTypeSupTypeData, formDataUpdated]);

    const selectedCaseTypeForm = useMemo(() => {
        if (caseState?.caseType?.formField) {
            const currentCaseType = findCaseTypeSubType(caseTypeSupTypeData, caseState?.caseType?.caseType, language);
            if (currentCaseType?.typeId === caseState.caseType.typeId &&
                currentCaseType?.sTypeId === caseState.caseType.sTypeId) {
                return caseState.caseType;
            }
        }
        return getFormByCaseType();
    }, [getFormByCaseType]);

    useEffect(() => {
        if (initialCaseData && sopLocal && areaList.length > 0 && !caseState && caseTypeSupTypeData.length > 0) {
            const utcTimestamp: string | undefined = sopLocal?.createdAt;
            const area = areaList.find((items) =>
                sopLocal.provId === items.provId &&
                sopLocal.distId === items.distId &&
                sopLocal.countryId === items.countryId
            );

            const initialCaseTypeData = findCaseTypeSubTypeByTypeIdSubTypeId(
                caseTypeSupTypeData,
                sopLocal.caseTypeId,
                sopLocal.caseSTypeId
            ) ?? {} as CaseTypeSubType;

            const initialMergedCaseType = mergeCaseTypeAndSubType(initialCaseTypeData, language);
            const newCaseState: CaseDetails = {
                location: sopLocal?.caselocAddr || "",
                date: utcTimestamp ? getLocalISOString(utcTimestamp) : "",
                caseType: {
                    ...initialCaseTypeData,
                    caseType: initialMergedCaseType,
                    formField: sopLocal?.formAnswer || {} as FormFieldWithNode,
                },
                priority: sopLocal?.priority || 0,
                description: sopLocal?.caseDetail || "",
                workOrderNummber: sopLocal?.caseId || "",
                workOrderRef: sopLocal?.referCaseId || "",
                iotDevice: sopLocal?.deviceId || "",
                iotDate: sopLocal?.startedDate || "",
                area: area,
                status: sopLocal?.statusId || "",
                attachFile: [] as File[], // For new cases (edit mode)
                attachFileResult: [] as File[],
            } as CaseDetails;

            setCaseState(newCaseState);
        }
        else if (isSubCase) {
            const newCaseState: CaseDetails = {

                workOrderNummber: initialCaseData?.caseId || "",
                workOrderRef: initialCaseData?.referCaseId || "",
            } as CaseDetails;

            setCaseState(newCaseState);
        }

    }, [sopLocal, initialCaseData, areaList.length, caseTypeSupTypeData, isSubCase]);




    useEffect(() => {
        if (listCustomerData.length > 0) {
            const result = listCustomerData.find(items => items.mobileNo === initialCaseData?.phoneNo)
            const customerData = result ? {
                ...result,
                name: `${result.firstName} ${result.lastName}`,
                contractMethod: {
                    id: "06",
                    name: source.find((items) => items.id === "06")?.name || ""
                }
            } as Custommer : {
                mobileNo: profile.mobileNo,
            } as Custommer;
            setCaseState(prev => prev ? {
                ...prev,
                customerData: customerData,
                status: prev.status || "",
            } as CaseDetails : prev);
        }
        setCaseState(prev => prev ? {
                ...prev,
                status: prev.status || "",
            } as CaseDetails : prev);
    }, [listCustomerData.length, sopLocal, initialCaseData?.phoneNo]);

    // File handling function for DragDropFileUpload (new cases - attachFile)
    const handleFilesChange = useCallback((newFiles: FileItem[]) => {
        setCaseState(prev => prev ? {
            ...prev,
            attachFile: newFiles
        } : prev);
    }, []);



    const createCaseAction = useCallback(async (action: "draft" | "submit") => {
        if (!caseState) return false;
        const isDraft = action === "draft";
        const caseVersion = action === "draft" ? "draft" : "publish";
        const statusId = action === "draft" ? "S000" : "S001";
        const createJson = {
            formData: caseState?.caseType?.formField,
            customerName: caseState?.customerData?.name,
            caseDetail: caseState?.description || "",
            caseDuration: 0,
            caseLat: "",
            caseSla: caseState?.caseType?.caseSla || "",
            caseLon: "",
            caseSTypeId: caseState?.caseType?.sTypeId || "",
            caseTypeId: caseState?.caseType?.typeId || "",
            caseVersion: caseVersion,
            caselocAddr: caseState?.location || "",
            caselocAddrDecs: "",
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
            source: "06",
            createdDate: new Date(TodayDate()).toISOString(),
            // startedDate: new Date(caseState?.iotDate ?? TodayDate()).toISOString(),
            statusId: statusId,
            userarrive: "",
            userclose: "",
            usercommand: caseState?.serviceCenter?.commandTh || "",
            usercreate: profile?.username || "",
            userreceive: "",
            startedDate: new Date(TodayDate()).toISOString(),
            nodeId: caseState?.caseType?.formField?.nextNodeId || "",
            wfId: caseState?.caseType?.wfId || "",
            versions: caseState?.caseType?.formField?.versions || "",
            scheduleFlag: true,
            scheduleDate: caseState?.scheduleDate
                ? new Date(caseState.scheduleDate).toISOString()
                : undefined,

        } as CreateCase;

        try {
            const data = await createCase(createJson).unwrap();
            if (data?.msg !== "Success") {
                throw new Error(data?.desc);
            }
            if (statusId === "S001") {
                navigate(`/case/${data?.caseId}`)
            }
            const caseListData = await idbStorage.getItem("caseList") || "[]";
            if (caseListData) {
                const caseList = JSON.parse(caseListData) as CaseEntity[];
                const newCase = {
                    ...(createJson as object),
                    caseId: data?.caseId,
                    createdAt: TodayDate(),
                    createdBy: profile?.username || ""
                } as CaseEntity;

                const getPriorityOrder = (priority: number): number => {
                    if (priority <= 3) return 1;
                    if (priority <= 6) return 2;
                    return 3;
                };

                const insertIndex = caseList.findIndex(existingCase => {
                    const newCasePriorityOrder = getPriorityOrder(newCase.priority);
                    const existingCasePriorityOrder = getPriorityOrder(existingCase.priority);

                    if (newCasePriorityOrder < existingCasePriorityOrder) {
                        return true; // Insert before this case
                    }
                    if (newCasePriorityOrder > existingCasePriorityOrder) {
                        return false; // Continue searching
                    }
                    const newCaseDate = new Date(newCase.createdAt || newCase.createdDate);
                    const existingCaseDate = new Date(existingCase.createdAt || existingCase.createdDate);
                    return newCaseDate > existingCaseDate; // Insert before if new case is newer
                });
                // Insert at the found position, or at the end if no position found
                if (insertIndex === -1) {
                    caseList.push(newCase);
                } else {
                    caseList.splice(insertIndex, 0, newCase);
                }

                idbStorage.setItem("caseList", JSON.stringify(caseList));
            }
        } catch (error: any) {
            addToast("error", isDraft ? t("case.display.toast.add_case_fail") : t("case.display.toast.savedaft_fail"));
            return false;
        }
        return true;
    }, [caseState, profile, createCase, navigate]);



    const handleCreateCase = useCallback(async () => {
        const isNotError = await createCaseAction("submit");
        if (isNotError === false) {
            setShowPreviewData(false)
            return
        }
    }, [createCaseAction]);

    const handlePreviewShow = useCallback(() => {
        const errorMessage = validateCaseForSubmission(caseState);
        if (errorMessage) {
            addToast("error", errorMessage);
            return;
        }
        setShowPreviewData(true)
    }, [validateCaseForSubmission, , caseState]);

    const handleCaseTypeChange = useCallback((newValue: string) => {
        const newCaseType = findCaseTypeSubType(caseTypeSupTypeData, newValue, language);

        if (!newCaseType) return updateCaseState({
                priority: undefined,
                caseType: undefined
            });;

        // Always update for new cases, or when the case type is actually different
        const shouldUpdate = isCreate ||
            newCaseType?.typeId !== caseState?.caseType?.typeId ||
            newCaseType?.sTypeId !== caseState?.caseType?.sTypeId;

        if (shouldUpdate) {
            setCaseState(prev => prev ? {
                ...prev,
                priority: newCaseType.priority,
                caseType: {
                    ...newCaseType,
                    caseType: mergeCaseTypeAndSubType(newCaseType, language)
                } as formType
            } : prev);
        }
    }, [caseTypeSupTypeData, caseState?.caseType, isCreate]);

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

    const handleScheduleDate = useCallback(
        (date: Date | null) => {
            if (!date) {
                updateCaseState({ scheduleDate: "" });
                return;
            }
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            const seconds = String(date.getSeconds()).padStart(2, '0');

            const localDateTimeString = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
            updateCaseState({ scheduleDate: localDateTimeString });
        },
        [updateCaseState]
    );


    const handleWorkOrderDateChangeDefault = useCallback((date: string) => {
        return date;
    }, []);

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



    const handleGetTypeFormData = useCallback((getTypeData: FormField) => {
        const newData = { ...selectedCaseTypeForm, formField: getTypeData, caseType: caseState?.caseType?.caseType ?? "" } as formType;
        updateCaseState({ caseType: newData });
    }, [caseState?.caseType?.caseType, selectedCaseTypeForm, updateCaseState]);

    const handleSetArea = useCallback((selectedName: string) => {
        const selected = areaList.find(item => mergeArea(item, language) === selectedName);
        if (selected) {
            updateCaseState({ area: selected });
        } else {
            updateCaseState({ area: undefined })
        }
    }, [areaList, updateCaseState]);

    const handleCustomerDataChange = useCallback((data: Custommer) => {
        updateCaseState({ customerData: data });
    }, [updateCaseState]);

    const handleSaveDrafts = useCallback(async () => {
        setShowPreviewData(false)
        const errorMessage = validateCaseForDraft(caseState);

        if (errorMessage) {
            addToast("error", errorMessage);
            return;
        }
        const isNotError = await createCaseAction("draft");
        if (isNotError === false) {
            return
        }
        localStorage.setItem("Create Case", JSON.stringify(caseState));
        addToast("success", t("case.display.toast.savedaft_success"));
    }, [validateCaseForDraft, createCaseAction, caseState]);



    useEffect(() => {
        if (!caseState?.workOrderDate && !initialCaseData) {
            updateCaseState({ workOrderDate: TodayDate() });
        }
    }, [caseState?.workOrderDate, initialCaseData, updateCaseState]);

    const handleExampleData = () => {
        setCaseState(exampleCaseState as CaseDetails)
    }

    return (
        <CaseLayout
            disablePageMeta={disablePageMeta}
            onBack={handleBack}
            isPanelOpen={isPanelOpen}
            onPanelClose={() => setIsPanelOpen(false)}
            onPanelOpen={() => setIsPanelOpen(true)}
            isCreate={isCreate}
            t={t}
            // title={isCreate ? "Create Case" : "Case Detail"}
            caseItem={caseState || {} as CaseDetails}
            referCaseList={sopLocal?.referCaseLists}
        >
            {caseState && (
                <CaseFormFields
                    caseState={caseState}
                    caseData={initialCaseData}
                    setCaseState={setCaseState}
                    caseType={{
                        caseType: caseState?.caseType?.caseType ?? "",
                        priority: caseState?.priority ?? 0
                    }}
                    selectedCaseTypeForm={selectedCaseTypeForm}
                    caseTypeSupTypeData={caseTypeSupTypeData}
                    areaList={areaList}
                    listCustomerData={listCustomerData}
                    caseTypeOptions={caseTypeOptions}
                    handleWorkOrderNumber={handleWorkOrderNumber}
                    handleWorkOrderDate={handleWorkOrderDate}
                    handleContactMethodChange={handleContactMethodChange}
                    handleIotDevice={handleIotDevice}
                    handleIotDeviceDate={handleIotDeviceDate}
                    handleCaseTypeChange={handleCaseTypeChange}
                    handleGetTypeFormData={handleGetTypeFormData}
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
                    handleExampleData={handleExampleData}
                    language={language}
                    t={t}
                />
            )}

            <PreviewDataBeforeSubmit
                caseData={caseState}
                submitButton={handleCreateCase}
                isOpen={showPreviewData}
                onClose={() => setShowPreviewData(false)}
            />
            <ToastContainer toasts={toasts} onRemove={removeToast} />
        </CaseLayout>
    );
}
