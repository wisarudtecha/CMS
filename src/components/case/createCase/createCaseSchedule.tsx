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
import { getLocalISOString, getTodayDate, TodayDate } from "../../date/DateToString"
import { CaseTypeSubType } from "../../interface/CaseType"
import type { Custommer } from "@/types";
import React from "react"
import CustomerInput from "../CaseCustomerInput"
import PreviewDataBeforeSubmit from "../PreviewCaseData"
import { Customer } from "@/store/api/custommerApi"
import { CreateCase, usePatchUpdateCaseMutation, usePostCreateCaseMutation } from "@/store/api/caseApi"
import { mergeCaseTypeAndSubType } from "../../caseTypeSubType/mergeCaseTypeAndSubType"
import { findCaseTypeSubType, findCaseTypeSubTypeByTypeIdSubTypeId } from "../../caseTypeSubType/findCaseTypeSubTypeByMergeName"
import { Area, mergeArea } from "@/store/api/area"
import DragDropFileUpload from "../../d&d upload/dndUpload"
import { CaseDetails, CaseEntity, FileItem } from "@/types/case"
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
import { UploadFileRes } from "@/types/file";
import { useDeleteFileMutationMutation, usePostUploadFileMutationMutation } from "@/store/api/file";
import { updateCaseInLocalStorage } from "../caseLocalStorage.tsx/caseListUpdate";
import { handleFileChanges, uploadFileToServer } from "./createCaseFunction";
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
                selected={caseState?.scheduleDate ? new Date(caseState?.scheduleDate) : null}
                onChange={(date: Date | null) => {
                    handleScheduleDate(date);
                }}
                language={language}
                // showTimeSelect
                dateFormat="P"
                minDate={getTodayDate()}
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
                        disabled={!!caseState.workOrderNummber}
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
                <Button onClick={handleExampleData} variant="outline-no-transparent" size="sm">
                    <FileText className=" h-4 w-4" />
                </Button>
            </div>

            {/* Right side: Action Buttons */}

            <div className="flex">
                <Button variant="outline-no-transparent" onClick={handleSaveDrafts} className="mx-3">
                    {t("case.display.save_as_draft")}
                </Button>
                <Button onClick={handlePreviewShow}>
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
    const [postUploadFile] = usePostUploadFileMutationMutation();
    const [updateCase] = usePatchUpdateCaseMutation();
    const [delFileApi] = useDeleteFileMutationMutation();
    const [originalFiles, setOriginalFiles] = useState<FileItem[]>([]);
    const initialCaseData: CaseEntity | undefined = caseData || (paramCaseId ? { caseId: paramCaseId } as CaseEntity : undefined);
    const [caseState, setCaseState] = useState<CaseDetails | undefined>(() => {
        if (!initialCaseData) {
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
                attachFile: [] as File[],
                attachFileResult: [] as File[],
                source: { id: "06", name: "OTHER" },
            } as CaseDetails;
        }
        return undefined;
    });
    const [selectedCaseTypeForm, setSelectedCaseTypeForm] = useState<formType | undefined>();
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


            const form = await getFormByCaseType();
            setSelectedCaseTypeForm(form);
        };

        fetchFormData();
    }, [caseState?.caseType?.sTypeId, getTypeSubType]);

    const getFormByCaseType = useCallback(async () => {
        if (!caseState?.caseType?.caseType || !caseTypeSupTypeData.length) {
            return undefined;
        }

        const newCaseType = findCaseTypeSubType(caseTypeSupTypeData, caseState.caseType.caseType, language);

        if (!newCaseType?.sTypeId) {
            return undefined;
        }
        try {
            const result = await getTypeSubType(caseState.caseType.sTypeId).unwrap();
            if (result) {
                return {
                    ...newCaseType,
                    caseType: mergeCaseTypeAndSubType(newCaseType, language),
                    formField: result?.data
                } as formType;
            }
        } catch (error) {
            console.error('Error fetching form data:', error);
        }

        // Return data without formField if not found
        return {
            ...newCaseType,
            caseType: mergeCaseTypeAndSubType(newCaseType, language),
        } as formType;
    }, [caseState?.caseType?.caseType, caseTypeSupTypeData]);


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
                location: sopLocal?.caseLocAddr || "",
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
            caseId: caseState.workOrderNummber,
            usercommand: caseState?.serviceCenter?.commandTh || "",
            usercreate: profile?.username || "",
            userreceive: "",
            startedDate: new Date(TodayDate()).toISOString(),
            nodeId: caseState?.caseType?.formField?.nextNodeId || "",
            wfId: caseState?.caseType?.wfId || "",
            versions: caseState?.caseType?.formField?.versions || "",
            scheduleFlag: true,
            scheduleDate: caseState?.scheduleDate
                ? new Date(caseState.scheduleDate + "Z").toISOString()
                : undefined,

        } as CreateCase;

        try {
            let data: any;

            if (!caseState.workOrderNummber) {

                // Step 1: Create case first (without files)
                data = await createCase({
                    ...createJson,
                    attachments: []
                }).unwrap();

                if (data?.msg !== "Success") {
                    throw new Error(data?.desc || "Failed to create case");
                }

                const newCaseId = data.caseId;

                // Step 2: Upload files with the new case ID
                let uploadedAttachments: UploadFileRes[] = [];

                if (caseState.attachFile && caseState.attachFile.length > 0) {
                    const newFiles = caseState.attachFile.filter(
                        (item): item is File => item instanceof File
                    );

                    if (newFiles.length > 0) {
                        console.log(`📤 Uploading ${newFiles.length} file(s)...`);
                        uploadedAttachments = await uploadFileToServer(newFiles, postUploadFile, newCaseId);

                        if (uploadedAttachments.length !== newFiles.length) {
                            addToast("warning", t("case.display.toast.partial_upload"));
                        }
                    }
                }

                // Step 3: Update state with case ID and convert uploaded files to attachments
                const attachmentFiles: FileItem[] = uploadedAttachments.map(file => file as FileItem);

                setCaseState(prev =>
                    prev ? {
                        ...prev,
                        workOrderNummber: newCaseId,
                        status: statusId,
                        attachFile: attachmentFiles
                    } : prev
                );

                setOriginalFiles(attachmentFiles);
                console.log(`📎 Tracking ${attachmentFiles.length} attachments`);

                // const newCase = {
                //     ...(casePayload as object),
                //     caseId: newCaseId,
                //     createdAt: TodayDate(),
                //     createdBy: profile?.username || ""
                // } as CaseEntity;
                // insertCaseToLocalStorage(newCase);

            } else {
                // ===== UPDATE EXISTING CASE =====
                console.log(`📝 Updating case: ${caseState.workOrderNummber}`);
                console.log(`Current files: ${caseState.attachFile?.length || 0}`);
                console.log(`Original files: ${originalFiles.length}`);

                // Step 1: Handle file changes (DELETE FROM SERVER & UPLOAD NEW)
                const fileChanges = await handleFileChanges(
                    caseState.attachFile || [],
                    originalFiles,
                    caseState.workOrderNummber,
                    delFileApi
                );

                if (fileChanges.errors.length > 0) {
                    console.warn("⚠️ File operation errors:", fileChanges.errors);
                    addToast("warning", `File issues: ${fileChanges.errors.join(", ")}`);
                }

                // Step 2: Prepare updated attachments list
                const newAttachments: FileItem[] = fileChanges.uploaded.map(file => file as FileItem);
                const updatedAttachments = [
                    ...fileChanges.remainingAttachments,
                    ...newAttachments
                ];

                console.log(`📎 Total attachments after changes: ${updatedAttachments.length}`);

                // Step 3: Update case with new attachment list
                const updateResult = await updateCase({
                    caseId: caseState.workOrderNummber,
                    updateCase: {
                        ...createJson,
                        attachments: updatedAttachments as UploadFileRes[]
                    },
                }).unwrap();

                console.log(`✅ Case updated successfully`);
                console.log('Update result:', updateResult);

                updateCaseInLocalStorage(createJson, caseState.workOrderNummber, profile);

                // Step 4: Update tracking
                setOriginalFiles(updatedAttachments);

                // Step 5: Update state
                setCaseState(prev =>
                    prev ? {
                        ...prev,
                        attachFile: updatedAttachments,
                        status: isDraft ? "S000" : "S001"
                    } : prev
                );
            }

            // Navigate if submitting
            if (!isDraft) {
                navigate(`/case/${caseState.workOrderNummber || data?.caseId}`);
            }

            addToast(
                "success",
                isDraft
                    ? t("case.display.toast.savedaft_success")
                    : t("case.display.toast.add_case_success")
            );
            setShowPreviewData(false);

            return true;

        } catch (error: any) {
            console.error("❌ Save case error:", error);
            addToast(
                "error",
                isDraft
                    ? t("case.display.toast.savedaft_fail")
                    : t("case.display.toast.add_case_fail")
            );
            setShowPreviewData(false);
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
                    selectedCaseTypeForm={selectedCaseTypeForm as formType}
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
