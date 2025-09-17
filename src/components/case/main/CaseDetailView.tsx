"use client"

import { useCallback, useMemo, useState, useEffect, ChangeEvent, memo } from "react"
import {
    ArrowLeft,
    FileText,
} from "lucide-react"
import Button from "@/components/ui/button/Button"
import { useLazyGetTypeSubTypeQuery } from "@/store/api/formApi";
import DynamicForm from "@/components/form/dynamic-form/DynamicForm"
import PageMeta from "@/components/common/PageMeta"
import { formType, FormField, FormFieldWithNode } from "@/components/interface/FormField"
import AssignOfficerModal from "@/components/assignOfficer/AssignOfficerModel"
import { getPriorityColorClass } from "../../function/Prioriy"
import { getAvatarIconFromString } from "../../avatar/createAvatarFromString"
import Toast from "../../toast/Toast"
import Input from "../../form/input/InputField"
import { getLocalISOString, TodayDate, TodayLocalDate } from "../../date/DateToString"
import { SearchableSelect } from "../../SearchSelectInput/SearchSelectInput"

import { CaseTypeSubType } from "../../interface/CaseType"
import type { Custommer } from "@/types";
import React from "react"
import CustomerInput from "../CaseCustomerInput"
import FormFieldValueDisplay from "../CaseDisplay"
import PreviewDataBeforeSubmit from "../PreviewCaseData"
import { Customer } from "@/store/api/custommerApi"
// **REMOVED**: useGetCaseHistoryQuery is no longer needed here
import { CreateCase, usePatchUpdateCaseMutation, usePostCreateCaseMutation } from "@/store/api/caseApi"
import { mergeCaseTypeAndSubType } from "../../caseTypeSubType/mergeCaseTypeAndSubType"
import { findCaseTypeSubType, findCaseTypeSubTypeByTypeIdSubTypeId } from "../../caseTypeSubType/findCaseTypeSubTypeByMergeName"
import { CaseSop, CaseSopUnit, Unit, UnitWithSop, useGetCaseSopQuery, useLazyGetSopUnitQuery, usePostDispacthMutationMutation } from "@/store/api/dispatch"
import { contractMethodMock } from ".././source"
import { Area, mergeArea } from "@/store/api/area"
// import Checkbox from "../form/input/Checkbox"
// import { data } from "react-router"
import DragDropFileUpload from "../../d&d upload/dndUpload"
import { CaseCard } from "../sopCard"
import { CaseDetails, CaseEntity } from "@/types/case"
import { genCaseID } from "../../genCaseId/genCaseId"
import CreateSubCaseModel from "../subCase/subCaseModel"
import dispatchUpdateLocate from "../caseLocalStorage.tsx/caseLocalStorage"
import { useNavigate, useParams } from "react-router"
import Panel from "../CasePanel"
import OfficerDataModal from "../OfficerDataModal"
import { CaseStatusInterface } from "../../ui/status/status"
import { ConfirmationModal } from "../modal/cancelUnitModal"
import { useWebSocket } from "../../websocket/websocket"
import { useTranslation } from "@/hooks/useTranslation";
import { TranslationParams } from "@/types/i18n";
const commonInputCss = "appearance-none border !border-1 rounded  text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent dark:text-gray-300 dark:border-gray-800 dark:bg-gray-900 disabled:text-gray-500 disabled:border-gray-300 disabled:opacity-40 disabled:bg-gray-100 dark:disabled:bg-gray-900 dark:disabled:text-gray-400 dark:disabled:border-gray-700"

const requireElements = <span className=" text-red-500 text-sm font-bold">*</span>



// interface CaseTypeFormSectionProps {
//     caseType: string;
//     handleCaseTypeChange: (newValue: string) => void;
//     handleGetTypeFormData: (getTypeData: FormField) => void;
//     hadleIsFillGetType: (isFill: boolean) => void;
//     selectedCaseTypeForm: FormField | undefined;
//     editFormData: boolean;
//     caseTypeSupTypeData: CaseTypeSubType[];
//     disableCaseTypeSelect: boolean;
//     className?: string;
//     caseState: CaseDetails
//     handleContactMethodChange: (contact: { id: string, name: string }) => void;
//     language: string
// }

// const CaseTypeFormSection: React.FC<CaseTypeFormSectionProps> = ({
//     caseType,
//     handleCaseTypeChange,
//     handleGetTypeFormData,
//     hadleIsFillGetType,
//     selectedCaseTypeForm,
//     caseTypeSupTypeData,
//     disableCaseTypeSelect,
//     className,
//     caseState,
//     handleContactMethodChange,
//     language
// }) => {
//     const caseTypeOptions = useMemo(() => {
//         if (!caseTypeSupTypeData?.length) return [];
//         return caseTypeSupTypeData.map(item =>
//             mergeCaseTypeAndSubType(item, language)
//         );
//     }, [caseTypeSupTypeData]);
//     const { t } = useTranslation()
//     return (
//         <>
//             <div className="grid-cols-2 sm:grid">
//                 <div className="text-white dark:text-gray-300">
//                     <div className="flex justify-between mx-3 text-gray-900 dark:text-gray-400">
//                         <h3 className="mb-3 block text-gray-900 dark:text-gray-400">{t("case.display.types")} :{requireElements}</h3>
//                     </div>
//                     <SearchableSelect
//                         options={caseTypeOptions}
//                         value={caseType}
//                         onChange={handleCaseTypeChange}
//                         placeholder={t("case.display.select_types_placeholder")}
//                         className={`2xsm:mx-3 mb-2 ${className}`}
//                         disabled={disableCaseTypeSelect}
//                     />
//                 </div>
//                 <div className="hidden md:block px-3 col-span-1">
//                     <h3 className="text-gray-900 dark:text-gray-400 mb-3">
//                         {t("case.display.contact_method")} : {requireElements}
//                     </h3>
//                     <SearchableSelect
//                         options={contractMethodMock.map(m => m.name)}
//                         className="sm:my-3 sm:mb-3"
//                         value={caseState?.customerData?.contractMethod?.name ?? ""}
//                         onChange={(selectedName) => {
//                             const selectedMethod = contractMethodMock.find(method => method.name === selectedName);
//                             if (selectedMethod) handleContactMethodChange(selectedMethod);
//                         }}
//                         placeholder={t("case.display.contact_method_placeholder")}
//                     />
//                 </div>
//             </div>
//             {selectedCaseTypeForm?.formFieldJson && (
//                 <>
//                     <DynamicForm
//                         initialForm={selectedCaseTypeForm}
//                         edit={false}
//                         editFormData={true}
//                         enableFormTitle={false}
//                         onFormChange={handleGetTypeFormData}
//                         returnFormAllFill={hadleIsFillGetType}
//                     />
//                 </>
//             )}
//         </>
//     );
// };

interface CaseTypeFormSectionProps {
    handleGetTypeFormData: (getTypeData: FormField) => void;
    hadleIsFillGetType: (isFill: boolean) => void;
    selectedCaseTypeForm: FormField | undefined;
    children?: React.ReactNode;
}

const CaseTypeFormSection: React.FC<CaseTypeFormSectionProps> = ({
    handleGetTypeFormData,
    hadleIsFillGetType,
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
                        returnFormAllFill={hadleIsFillGetType}
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

// Memoized Attached Files Component
const AttachedFiles = memo(({ files, editFormData, onRemove }: {
    files?: File[];
    editFormData: boolean;
    onRemove: (index: number) => void;
}) => {
    if (!files?.length) return null;
    const { t } = useTranslation()
    return (
        <div className="mx-3">
            <span className="font-medium text-gray-700 dark:text-gray-200 text-sm">
                {t("case.display.attach_file")} :
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
// const AssignedOfficers = memo(({
//     assignedOfficers,
//     showOfficersData,
//     onSelectOfficer,
//     onRemoveOfficer,
//     handleDispatch,
// }: {
//     assignedOfficers: Unit[];
//     showOfficersData: Unit | null;
//     onSelectOfficer: (officer: Unit) => void;
//     onRemoveOfficer: (officer: Unit) => void;
//     handleDispatch: (officer: Unit) => void;
// }) => {
//     if (!assignedOfficers.length) return null;

//     return (
//         <div className="mb-4 flex flex-wrap gap-2 items-center">
//             <span className="font-medium text-gray-700 dark:text-gray-200 text-sm">
//                 Assigned Officer{assignedOfficers.length > 1 ? "s" : ""}:
//             </span>
//             {assignedOfficers.map(officer => (
//                 <div
//                     key={officer.unitId}
//                     className="flex items-center px-2 py-1 rounded bg-blue-100 dark:bg-gray-900 text-blue-700 dark:text-blue-200 text-xs font-medium w-fit"
//                 >
//                     <div onClick={() => onSelectOfficer(officer)} className="cursor-pointer">
//                         {showOfficersData?.unitId === officer.unitId ? <ChevronUp /> : <ChevronDown />}
//                     </div>
//                     {getAvatarIconFromString(officer.username, "bg-blue-600 dark:bg-blue-700 mx-1")}
//                     {officer.username}
//                     <Button size="xxs" className="mx-1" variant="outline-no-transparent" onClick={() => handleDispatch(officer)}>
//                         Acknowledge
//                     </Button>
//                     <Button
//                         onClick={() => onRemoveOfficer(officer)}
//                         className="ml-2"
//                         title="Remove"
//                         variant="outline-no-transparent"
//                         size="xxs"
//                     >
//                         Cancel
//                     </Button>
//                 </div>
//             ))}
//         </div>
//     );
// });
// AssignedOfficers.displayName = 'AssignedOfficers';

// Separate Officer Item Component
const OfficerItem = memo(({
    officer,
    onSelectOfficer,
    handleDispatch,
    caseStatus,
    handleCancel,
}: {
    officer: UnitWithSop;
    onSelectOfficer: (officer: UnitWithSop) => void;
    handleDispatch: (officer: UnitWithSop, setDisableButton: React.Dispatch<React.SetStateAction<boolean>>) => void;
    handleCancel: (officer: UnitWithSop) => void;
    caseStatus: CaseStatusInterface[]
}) => {
    const [disableButton, setDisableButton] = useState<boolean>(false);

    // console.log(officer.Sop?.nextStage?.nodeId,officer.unit)
    const hasAction = officer.Sop?.nextStage?.nodeId && officer.Sop?.nextStage?.data?.data?.config?.action;
    useEffect(() => {
        setDisableButton(false);
    }, [officer.Sop?.nextStage?.nodeId]);
    const { t, language } = useTranslation();
    return (
        <div
            key={officer.unit.unitId + "-" + officer.Sop.currentStage.nodeId}
            className="px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-900 text-blue-700 dark:text-blue-200 text-xs font-medium"
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    {getAvatarIconFromString(officer.unit.username, "bg-blue-600 dark:bg-blue-700 mx-1")}
                    <span className="ml-2 cursor-pointer" onClick={() => onSelectOfficer(officer)}>
                        {officer.unit.username}
                    </span>
                </div>
                <div className="flex items-end justify-end">
                    <Button
                        onClick={async () => {
                            if (hasAction) {
                                handleDispatch(officer, setDisableButton);
                            }
                        }}
                        size="xxs"
                        className={`mx-1 ${!hasAction ? 'cursor-default' : ''}`}
                        variant="success"
                        disabled={disableButton || !hasAction}
                    >
                        {caseStatus.find((item) =>
                            officer?.Sop?.nextStage?.data?.data?.config?.action === item.statusId
                        )?.[language === "th" ? "th" : "en"] || "End"}
                    </Button>
                    <Button
                        className="ml-2"
                        title="Remove"
                        variant="outline-no-transparent"
                        size="xxs"
                        onClick={() => handleCancel(officer)}
                    >
                        {t("case.display.cancel")}
                    </Button>
                </div>
            </div>
        </div>
    );
});
OfficerItem.displayName = 'OfficerItem';


const AssignedOfficers = memo(({
    SopUnit,
    onSelectOfficer,
    handleDispatch,
    caseStatus,
    handleCancel
}: {
    SopUnit: UnitWithSop[] | null;
    onSelectOfficer: (officer: UnitWithSop) => void;
    onRemoveOfficer: (officer: UnitWithSop) => void;
    handleDispatch: (officer: UnitWithSop, setDisableButton: React.Dispatch<React.SetStateAction<boolean>>) => void;
    handleCancel: (officer: UnitWithSop) => void;
    caseStatus: CaseStatusInterface[];
}) => {
    if (!SopUnit?.length) return null;
    const { t } = useTranslation();
    return (
        <div className="mb-4 gap-2 flex flex-wrap items-center">
            <div className="mb-2">
                <span className="font-medium text-gray-700 dark:text-gray-200 text-sm">
                    {t("case.display.Assigned Officer" + (SopUnit.length > 1 ? "s" : ""))}:
                </span>
            </div>
            {SopUnit.map(officer => (
                <OfficerItem
                    key={officer.unit.unitId + "-" + officer.Sop.currentStage.caseId}
                    officer={officer}
                    onSelectOfficer={onSelectOfficer}
                    handleDispatch={handleDispatch}
                    caseStatus={caseStatus}
                    handleCancel={handleCancel}
                />
            ))}
        </div>
    );
});
AssignedOfficers.displayName = 'AssignedOfficers';


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
    caseTypeOptions: string[]
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
    handleExampleData: () => void;
    language: string,
    t: (key: string, params?: TranslationParams | undefined) => string,
    isScheduleDate?: boolean;
    handleSaveChanges: () => void;
}


// Memoized Form Fields Component
const CaseFormFields = memo<CaseFormFieldsProps>(({
    caseState, caseData, caseType, selectedCaseTypeForm, caseTypeSupTypeData,
    areaList, listCustomerData, isCreate,
    handleContactMethodChange, handleIotDevice, handleIotDeviceDate,
    handleCaseTypeChange, handleGetTypeFormData, handleIsFillGetType, handleDetailChange,
    handleSetArea, handleCustomerDataChange, handleLocationChange, handleScheduleDate,
    handleFilesChange, handlePreviewShow, handleSaveDrafts, handleExampleData, language, t,
    isScheduleDate = false, caseTypeOptions, handleSaveChanges
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
        {isCreate && isScheduleDate &&
            <div className="px-3 mb-3">
                <div className="flex mb-3">
                    <h3 className="text-gray-900 dark:text-gray-400 mr-2">{t("case.display.request_schedule_date")} :</h3>
                </div>
                <Input
                    required
                    type="datetime-local"
                    disabled={!isScheduleDate}
                    className={`dark:[&::-webkit-calendar-picker-indicator]:invert ${commonInputCss}`}
                    onChange={handleScheduleDate}
                    value={caseState?.scheduleDate || ""}
                    min={new Date().toISOString().slice(0, 16)}
                />
            </div>}
        {/* Form Grid */}
        {/* Case Type Form Section */}
        <CaseTypeFormSection
            handleGetTypeFormData={handleGetTypeFormData}
            hadleIsFillGetType={handleIsFillGetType}
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
                        className={`2xsm:mx-3 mb-2`}
                        disabled={!isCreate}
                    />
                </div>
                <div className="px-3 col-span-1">
                    <h3 className="text-gray-900 dark:text-gray-400 mb-3">
                        {t("case.display.contact_method")} : {requireElements}
                    </h3>
                    <SearchableSelect
                        options={contractMethodMock.map(m => m.name)}
                        className="sm:my-3 sm:mb-3"
                        value={caseState?.customerData?.contractMethod?.name ?? ""}
                        onChange={(selectedName) => {
                            const selectedMethod = contractMethodMock.find(method => method.name === selectedName);
                            if (selectedMethod) handleContactMethodChange(selectedMethod);
                        }}
                        placeholder={t("case.display.contact_method_placeholder")}
                    />
                </div>
            </div>
        </CaseTypeFormSection>

        <div className="xsm:grid grid-cols-2">

            {/* Work Order Number */}
            {/* <div className="px-3">
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
            </div> */}
            {/* <div className="px-3 mb-3 md:hidden">
                <h3 className="text-gray-900 dark:text-gray-400 mb-3">
                    {t("case.display.contact_method")} : {requireElements}
                </h3>
                <SearchableSelect
                    options={contractMethodMock.map(m => m.name)}
                    className="sm:my-3 sm:mb-3"
                    value={caseState?.customerData?.contractMethod?.name ?? ""}
                    onChange={(selectedName) => {
                        const selectedMethod = contractMethodMock.find(method => method.name === selectedName);
                        if (selectedMethod) handleContactMethodChange(selectedMethod);
                    }}
                    placeholder={t("case.display.contact_method_placeholder")}
                />
            </div> */}
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
            ) : null}

            {/* Create Date */}
            {/* <div className="px-3">
                <h3 className="text-gray-900 dark:text-gray-400 mb-3">Create Date :</h3>
                <Input
                    required
                    type="datetime-local"
                    className={`dark:[&::-webkit-calendar-picker-indicator]:invert ${commonInputCss}`}
                    onChange={handleWorkOrderDate}
                    disabled
                    value={caseState?.workOrderDate || TodayDate()}
                    placeholder="Work Order"
                />
            </div> */}

            {/* Contract Method */}


            {/* IoT Device */}
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

            {/* IoT Alert Date */}
            <div className="px-3">
                <h3 className="text-gray-900 dark:text-gray-400 mb-3">{t("case.display.iot_alert_date")} :</h3>
                <Input
                    required
                    type="datetime-local"
                    className={`dark:[&::-webkit-calendar-picker-indicator]:invert ${commonInputCss}`}
                    onChange={handleIotDeviceDate}
                    disabled
                    value={caseState?.iotDate || ''}
                    placeholder="Work Order"
                />
            </div>
        </div>



        {/* Case Details */}
        <div className="pr-7">
            <h3 className="text-gray-900 dark:text-gray-400 mx-3">
                {t("case.display.case_detail")}: {requireElements}
            </h3>
            <textarea
                onChange={(e) => handleDetailChange(e.target.value)}
                value={caseState?.description || ""}
                placeholder={t("case.display.case_detail_placeholder")}
                className={`w-full mx-3 my-2 h-20 p-2 ${commonInputCss}`}
                required
            />
        </div>

        {/* Service Center and Customer */}
        <div className="sm:grid grid-cols-2">
            <div>
                <h3 className="w-auto text-gray-900 dark:text-gray-400 mx-3">{t("case.display.service_center")} :</h3>
                <SearchableSelect
                    options={areaList.map(item => mergeArea(item, language))}
                    value={caseState?.area ? mergeArea(caseState.area, language) : ""}
                    disabled={!isCreate}
                    onChange={handleSetArea}
                    placeholder={t("case.display.select_service_center")}
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
                <h3 className="text-gray-900 dark:text-gray-400 mx-3">{t("case.display.area")} :</h3>
                <textarea
                    onChange={(e) => handleLocationChange(e.target.value)}
                    value={caseState?.location || ""}
                    placeholder={t("case.display.area_placeholder")}
                    className={`w-full mx-3 my-2 h-20 p-2 ${commonInputCss}`}
                />
            </div>

            {/* Schedule Date */}

            {/* {isCreate && isScheduleDate &&
                <div className="px-3">
                    <div className="flex mb-3">
                        <h3 className="text-gray-900 dark:text-gray-400 mr-2">{t("case.display.request_schedule_date")} :</h3>
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
                        value={caseState?.scheduleDate || ""}
                        min={new Date().toISOString().slice(0, 16)}
                    />
                </div>} */}
        </div>

        {/* File Upload for new cases */}
        {isCreate && (
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
                    disabled={false}
                />
            </div>
        )}
        <div className="flex justify-between items-center">
            {/* Left side: Example button */}
            <div>
                <Button onClick={handleExampleData} size="sm">
                    <FileText className=" h-4 w-4" />
                </Button>
            </div>

            {/* Right side: Action Buttons */}
            <div className="flex justify-end mb-3 mr-3">
                {!isCreate ? (
                    <Button variant="success" onClick={handlePreviewShow}>
                        {t("case.display.save_change")}
                    </Button>
                ) : (
                    <div className="flex">
                        <Button onClick={caseState.workOrderNummber ? handleSaveChanges : handleSaveDrafts} className="mx-3" >
                            {t("case.display.save_as_draft")}
                        </Button>
                        <Button variant="success" onClick={handlePreviewShow}>
                            {t("case.display.submit")}
                        </Button>
                    </div>
                )}
            </div>
        </div>

    </>
));
CaseFormFields.displayName = 'CaseFormFields';


// ## END: Refactored Components ##


export default function CaseDetailView({ onBack, caseData, disablePageMeta = false, isSubCase = false, isCreate = true, isScheduleDate = false }: { onBack?: () => void, caseData?: CaseEntity, disablePageMeta?: boolean, isSubCase?: boolean, isCreate?: boolean, isScheduleDate?: boolean }) {
    // Initialize state with proper defaults

    const caseStatus = JSON.parse(localStorage.getItem("caseStatus") ?? "[]") as CaseStatusInterface[]
    const navigate = useNavigate()
    const handleBack = useCallback(() => {
        if (onBack) {
            onBack();
        } else {
            navigate('/case/assignment');
        }
    }, [onBack, navigate]);
    const [showCloseCaseModal, setShowCloseCaseModal] = useState<boolean>(false)
    const [showCancelUnitModal, setShowCancelUnitModal] = useState<boolean>(false)
    const [showCancelCaseModal, setShowCancelCaseModal] = useState<boolean>(false)
    const [unitToCancel, setUnitToCancel] = useState<UnitWithSop | null>(null);
    const { caseId: paramCaseId } = useParams<{ caseId: string }>();
    const initialCaseData: CaseEntity | undefined = caseData || (paramCaseId ? { caseId: paramCaseId } as CaseEntity : undefined);
    const [formDataUpdated, setFormDataUpdated] = useState(0);
    const [caseState, setCaseState] = useState<CaseDetails | undefined>(() => {
        // Only initialize if it's a new case (no caseData)
        if (!initialCaseData) {
            return {
                location: "",
                date: "",
                caseType: undefined,
                priority: 0,
                description: "",
                area: undefined,
                workOrderNummber: undefined,
                status: "",
                scheduleDate: "",
                customerData: {} as Custommer,
                attachFile: [] as File[], // For new cases (edit mode)
                attachFileResult: [] as File[] // For existing cases (view/edit mode)
            } as CaseDetails;
        }
        return undefined;
    });
    const [showCreatedCase, setShowCreatedCase] = useState(false);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [showCreateSupCase, setShowCreateSupCase] = useState(false);
    const [editFormData, setEditFormData] = useState<boolean>(!initialCaseData);
    const [assignedOfficers, setAssignedOfficers] = useState<Unit[]>([]);
    const [showOfficersData, setShowOFFicersData] = useState<UnitWithSop | null>(null);
    const [dispatchUnit, setDispatchUnit] = useState<CaseSopUnit[] | null>(null);
    const [unitWorkOrder, setUnitWorkOrder] = useState<UnitWithSop[]>([]);
    const [isCustomerPanelOpen, setIsCustomerPanelOpen] = useState(false);
    const [isValueFill, setIsValueFill] = useState({ getType: false, dynamicForm: false });
    const [showToast, setShowToast] = useState(false);
    const [showPreviewData, setShowPreviewData] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [toastType, setToastType] = useState<"success" | "error" | "info">("info");
    const [sopLocal, setSopLocal] = useState<CaseSop>();
    const [listCustomerData, setListCustomerData] = useState<Customer[]>([])
    const [isInitialized, setIsInitialized] = useState(false);
    const { subscribe, isConnected, connectionState, connect } = useWebSocket()
    // Memoize static data to prevent re-renders
    const { t, language } = useTranslation();
    const caseTypeSupTypeData = useMemo(() =>
        JSON.parse(localStorage.getItem("caseTypeSubType") ?? "[]") as CaseTypeSubType[], []
    );

    const areaList = useMemo(() =>
        JSON.parse(localStorage.getItem("area") ?? "[]") as Area[], []
    );

    const profile = useMemo(() =>
        JSON.parse(localStorage.getItem("profile") ?? "{}"), []
    );

    const caseTypeOptions = useMemo(() => {
        if (!caseTypeSupTypeData?.length) return [];
        return caseTypeSupTypeData.map(item =>
            mergeCaseTypeAndSubType(item, language)
        );
    }, [caseTypeSupTypeData]);

    // Only make API calls if initialCaseData exists
    const { data: sopData, isError, isLoading, refetch } = useGetCaseSopQuery(
        { caseId: initialCaseData?.caseId || "" },
        {
            refetchOnMountOrArgChange: true,
            skip: !initialCaseData?.caseId || isCreate
        }
    );
    // const { data: unit, refetch: unitRefect } = useGetUnitQuery(
    //     { caseId: initialCaseData?.caseId || "" },
    //     { skip: !initialCaseData?.caseId || isCreate }
    // )


    // **REMOVED**: Comment fetching is now handled in Comments.tsx
    // const { data: comments } = useGetCaseHistoryQuery(
    //     { caseId: initialCaseData?.caseId || "" },
    //     { skip: !initialCaseData?.caseId || isCreate }
    // )

    const [createCase] = usePostCreateCaseMutation();
    const [updateCase] = usePatchUpdateCaseMutation();
    const [postDispatch] = usePostDispacthMutationMutation();
    const [getSopUnit] = useLazyGetSopUnitQuery();
    const [refetchTriggerUnit, setRefetchTriggerUnit] = useState(Boolean);
    // Initialize customer data ONCE
    useEffect(() => {
        if (!isInitialized) {
            const customerList = JSON.parse(localStorage.getItem("customer_data") ?? "[]") as Customer[];
            setListCustomerData(customerList);
            setIsInitialized(true);
        }
    }, [isInitialized]);


    useEffect(() => {


        const listener = subscribe((message) => {
            try {
                if (message?.data) {
                    const data = message.data;
                    if (data.eventType === "Update") {
                        (async () => {
                            const caseIdFromUrl = data.redirectUrl.split('/case/')[1];
                            if (caseIdFromUrl && caseState?.workOrderNummber === caseIdFromUrl) {
                                await refetch();
                            }
                        })();
                    } else if (data?.additionalJson?.event === "STATUS UPDATE") {
                        
                        (async () => {
                            if (data?.additionalJson?.caseId && caseState?.workOrderNummber === data?.additionalJson?.caseId) {
                                await refetch();
                            }
                        })();
                    }
                }
            } catch (error) {
                console.error("Error processing WebSocket message:", error);
            }
        });

        return () => {
            listener();
        };
    }, [subscribe, connect, connectionState, isConnected,caseState]);


    // Initialize sopLocal from API data ONLY when sopData changes
    useEffect(() => {
        if (sopData?.data && initialCaseData) {
            setSopLocal(sopData.data);
            if (sopData.data.unitLists) {
                setDispatchUnit(sopData.data.unitLists)
            }
            
        }
    }, [sopData?.data, initialCaseData?.caseId]);


    const triggerRefetchUnit = useCallback(async () => {
        const result = await refetch();
        setRefetchTriggerUnit(prev => !prev);
        return result;
    }, [refetch]);

    useEffect(() => {
        if (!dispatchUnit || dispatchUnit.length === 0) {
            setUnitWorkOrder([]);
            return;
        }

        const fetchData = async () => {
            const results = await Promise.all(
                dispatchUnit.map(async (item) => {
                    try {
                        const data = await getSopUnit({
                            caseId: initialCaseData?.caseId || "",
                            unitId: item.unitId,
                        }).unwrap();

                        if (data?.data) {
                            return { unit: item, Sop: data.data };
                        }
                    } catch (err) {
                        console.error("Error fetching SOP unit:", err);
                    }
                    return null;
                })
            );

            setUnitWorkOrder(results.filter((r): r is UnitWithSop => r !== null));
        };

        fetchData();
    }, [dispatchUnit, sopData, getSopUnit, refetchTriggerUnit, initialCaseData?.caseId]);

    const handleCancelUnitClick = useCallback((officer: UnitWithSop) => {
        setUnitToCancel(officer);
        setShowCancelUnitModal(true);
    }, []);

    const handleConfirmCancelUnit = useCallback(() => {
        // Placeholder for API call to cancel the unit
        console.log("Cancelling assignment for:", unitToCancel?.unit.username);
        // Here you would typically make an API call
        setShowCancelUnitModal(false);
        setUnitToCancel(null);
        setToastMessage("Unit assignment cancelled.");
        setToastType("info");
        setShowToast(true);
        // Optionally, refetch data after cancellation
        // refetch(); 
    }, [unitToCancel]);

    const handleConfirmCancelCase = useCallback(() => {
        // Placeholder for API call to cancel the case
        console.log("Cancelling case:", sopLocal?.caseId);
        setShowCancelCaseModal(false);
        setToastMessage("Case has been cancelled.");
        setToastType("error");
        setShowToast(true);
        // Optionally, navigate away or update state
        // navigate('/case/assignment');
    }, [sopLocal]);

    const handleConfirmCloseCase = useCallback(() => {
        // Placeholder for API call to close the case
        console.log("Closing case:", sopLocal?.caseId);
        setShowCloseCaseModal(false);
        setToastMessage("Case has been closed.");
        setToastType("success");
        setShowToast(true);
        // Optionally, update state to reflect closed status
        // setSopLocal(prev => ({ ...prev, statusId: 'CLOSED_STATUS_ID' }));
    }, [sopLocal]);

    const [getTypeSubType] = useLazyGetTypeSubTypeQuery();

    useEffect(() => {
        const fetchFormData = async () => {
            if (!caseState?.caseType?.sTypeId) return;

            const existingData = localStorage.getItem("subTypeForm-" + caseState.caseType.sTypeId);
            if (existingData && existingData !== "undefined") {
                return;
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
    }, [caseState?.caseType?.caseType, caseTypeSupTypeData, editFormData, formDataUpdated]);

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
                iotDate: getLocalISOString(sopLocal?.startedDate) || "",
                area: area,
                status: sopLocal?.statusId || "",
                lastUpdate:sopLocal?.updatedAt,
                updateBy:sopLocal?.updatedBy,
                attachFile: [] as File[], // For new cases (edit mode)
                attachFileResult: [] as File[] // Initialize as empty array for view mode
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
        if (isCreate && caseState && !caseState.iotDate) {
            setCaseState(prev => prev ? {
                ...prev,
                iotDate: TodayLocalDate()
            } : prev);
        }
    }, [isCreate, caseState]);

    useEffect(() => {
        if (selectedCaseTypeForm === undefined ||
            selectedCaseTypeForm.formField === undefined ||
            selectedCaseTypeForm.formField.formFieldJson === undefined || selectedCaseTypeForm.formField.formFieldJson === null){
            setIsValueFill(prev => ({ ...prev, dynamicForm: true }));
        }
    }, [selectedCaseTypeForm]);

    useEffect(() => {
        if (listCustomerData.length > 0) {
            const result = listCustomerData.find(items => items.mobileNo === initialCaseData?.phoneNo)
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
    }, [listCustomerData.length, sopLocal, initialCaseData?.phoneNo]);

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
    const handleSelectOfficer = useCallback((selectedOfficer: UnitWithSop) => {
        setShowOFFicersData(prev => (prev?.unit.unitId === selectedOfficer.unit.unitId ? null : selectedOfficer));
    }, []);

    const handleRemoveOfficer = useCallback((officerToRemove: UnitWithSop) => {
        setAssignedOfficers(prev => prev.filter(o => o.unitId !== officerToRemove.unit.unitId));
        if (showOfficersData?.unit.unitId === officerToRemove.unit.unitId) {
            setShowOFFicersData(null);
        }
    }, [showOfficersData?.unit.unitId]);

    const handleCheckRequiredFields = useCallback(() => {
        let errorMessage = "";
        if (!caseState?.caseType?.caseType) {
            errorMessage = "Please select a Case Type.";
        } else if (!caseState?.description?.trim()) {
            errorMessage = "Please enter Case Details.";
        } else if (!caseState?.customerData?.contractMethod?.name.trim()) {
            errorMessage = "Please select a Contact Method.";
        } else if (((!isValueFill.dynamicForm ) || (!isValueFill.getType)) && Object.keys(selectedCaseTypeForm?.formField as object).length !== 0) {
            errorMessage = "Please ensure all dynamic form fields are filled.";
        }
        return errorMessage;
    }, [caseState, isValueFill, selectedCaseTypeForm]);

    const handleCheckRequiredFieldsSaveDraft = useCallback(() => {
        let errorMessage = "";
        if (!caseState?.caseType?.caseType) {
            errorMessage = "Please select a Service Type.";
        }
        return errorMessage;
    }, [caseState?.caseType?.caseType]);

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
            caseSla: caseState?.caseType?.caseSla || "",
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
            scheduleFlag: isScheduleDate,
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
            setCaseState(prev => prev ? {
                ...prev,
                workOrderNummber: data.caseId,
                status: statusId
            } : prev);

            const caseListData = localStorage.getItem("caseList") || "[]";
            if (caseListData) {
                const caseList = JSON.parse(caseListData) as CaseEntity[];
                const newCase = {
                    ...(createJson as object),
                    caseId: data?.caseId,
                    createdAt: TodayDate(),
                    createdBy: profile?.username || ""
                } as CaseEntity;

                // Helper function to get priority group order
                const getPriorityOrder = (priority: number): number => {
                    if (priority <= 3) return 1; // High priority
                    if (priority <= 6) return 2; // Medium priority
                    return 3; // Low priority
                };

                // Find the correct position to insert the new case
                const insertIndex = caseList.findIndex(existingCase => {
                    const newCasePriorityOrder = getPriorityOrder(newCase.priority);
                    const existingCasePriorityOrder = getPriorityOrder(existingCase.priority);

                    // First, compare by priority group (High → Medium → Low)
                    if (newCasePriorityOrder < existingCasePriorityOrder) {
                        return true; // Insert before this case
                    }
                    if (newCasePriorityOrder > existingCasePriorityOrder) {
                        return false; // Continue searching
                    }

                    // If priority groups are equal, compare by date (newer first)
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

                localStorage.setItem("caseList", JSON.stringify(caseList));
            }
        } catch (error: any) {
            setToastType("error");
            setToastMessage(`Failed to ${statusId === "S001" ? "Create Case" : "Save As Draft"}`);
            setShowToast(true);
            return false;
        }
        return true;
    }, [caseState, profile, createCase, navigate]);

    const updateCaseInLocalStorage = useCallback((updateJson: CreateCase) => {
        try {
            const caseListData = localStorage.getItem("caseList");
            const caseList: CaseEntity[] = caseListData ? JSON.parse(caseListData) : [];

            const caseIdToUpdate = sopLocal?.caseId;

            if (!caseIdToUpdate) {
                console.warn("No case ID found to update");
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



    const handleSaveChanges = useCallback(async () => {
        if (!caseState) return;

        setShowPreviewData(false)
        const updateJson = {
            caseId: caseState?.workOrderNummber,
            formData: caseState?.caseType?.formField,
            customerName: caseState?.customerData?.name,
            caseDetail: caseState?.description || "",
            caseDuration: 0,
            caseLat: "",
            caseLon: "",
            caseSTypeId: caseState?.caseType?.sTypeId || "",
            caseTypeId: caseState?.caseType?.typeId || "",
            caseVersion: caseState?.status === "S000" ? "publish" : sopLocal?.caseVersion,
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
            caseSla: caseState?.caseType?.caseSla || "",
            deviceId: caseState?.iotDevice || "",
            source: caseState?.customerData?.contractMethod?.id || "",
            statusId: caseState?.status === "S000" ? "S001" : sopLocal?.statusId,
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
            scheduleFlag: isScheduleDate,
        } as CreateCase;

        try {
            await updateCase({ caseId: caseState?.workOrderNummber || "", updateCase: updateJson }).unwrap();
            const updateSuccess = updateCaseInLocalStorage(updateJson);

            if (caseState?.status === "S000") {
                setCaseState(prev => prev ? {
                    ...prev,
                    status: "S001"
                } : prev);
                setSopLocal(prev => prev ? {
                    ...prev,
                    caseVersion: "publish"
                } : undefined)
                if (caseState?.workOrderNummber) {
                    navigate("/case/" + caseState?.workOrderNummber)
                }
            }
            if (updateSuccess) {
                setEditFormData(false);
                setToastMessage("Changes saved successfully!");
                setToastType("success");
                setShowToast(true);
            } else {
                setToastMessage("Changes saved to server");
                setToastType("success");
                setEditFormData(false);
                setShowToast(true);
            }
            // unitRefect()
        } catch (error: any) {
            setToastType("error");
            setToastMessage(`Failed to Update Case`);
            setShowToast(true);
            return;
        }
    }, [caseState, sopLocal, updateCase, updateCaseInLocalStorage, profile]);

    const handleSaveChangesDraft = useCallback(async () => {
        if (!caseState) return;

        setShowPreviewData(false)
        const updateJson = {
            caseId: caseState?.workOrderNummber,
            formData: caseState?.caseType?.formField,
            customerName: caseState?.customerData?.name,
            caseDetail: caseState?.description || "",
            caseDuration: 0,
            caseLat: "",
            caseLon: "",
            caseSTypeId: caseState?.caseType?.sTypeId || "",
            caseTypeId: caseState?.caseType?.typeId || "",
            caseVersion: "draft",
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
            caseSla: caseState?.caseType?.caseSla || "",
            deviceId: caseState?.iotDevice || "",
            source: caseState?.customerData?.contractMethod?.id || "",
            statusId: caseState?.status === "S000" ? "S001" : sopLocal?.statusId,
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
            scheduleFlag: isScheduleDate,
        } as CreateCase;

        try {
            await updateCase({ caseId: caseState?.workOrderNummber || "", updateCase: updateJson }).unwrap();
            const updateSuccess = updateCaseInLocalStorage(updateJson);
            if (updateSuccess) {
                setEditFormData(false);
                setToastMessage("Changes saved successfully!");
                setToastType("success");
                setShowToast(true);
            } else {
                setToastMessage("Changes saved to server");
                setToastType("success");
                setEditFormData(false);
                setShowToast(true);
            }
            // unitRefect()
        } catch (error: any) {
            setToastType("error");
            setToastMessage(`Failed to Update Case`);
            setShowToast(true);
            return;
        }
    }, [caseState, sopLocal, updateCase, updateCaseInLocalStorage, profile]);

    const handleCreateCase = useCallback(async () => {

        const isNotError = await createCaseAction("submit");
        if (isNotError === false) {
            setShowPreviewData(false)
            return
        }
        setEditFormData(false)
        // setToastMessage("Create Case successfully!");
        // setToastType("success");
        // setShowToast(true);
        setShowCreatedCase(true);
        // navigate(`/case/${caseState?.workOrderNummber}`)
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
        const newCaseType = findCaseTypeSubType(caseTypeSupTypeData, newValue, language);

        if (!newCaseType) return;

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

    const handleScheduleDate = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value === "" ? "" : e.target.value;
        updateCaseState({ scheduleDate: value });
    }, [updateCaseState]);

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

    const handleIsFillGetType = useCallback((isFill: boolean) =>
        setIsValueFill(prev => ({ ...prev, getType: isFill })), []);

    const handleGetTypeFormData = useCallback((getTypeData: FormField) => {
        const newData = { ...selectedCaseTypeForm, formField: getTypeData, caseType: caseState?.caseType?.caseType ?? "" } as formType;
        updateCaseState({ caseType: newData });
    }, [caseState?.caseType?.caseType, selectedCaseTypeForm, updateCaseState]);

    const handleSetArea = useCallback((selectedName: string) => {
        const selected = areaList.find(item => mergeArea(item, language) === selectedName);
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
        setToastMessage("Save As Draft successfully!");
        setToastType("success");
        setShowToast(true);
    }, [handleCheckRequiredFieldsSaveDraft, createCaseAction, caseState]);

    const handleUnitSopDispatch = useCallback(async (officer: UnitWithSop, setDisableButton: React.Dispatch<React.SetStateAction<boolean>>) => {
        // This object creation is correct
        setDisableButton(true)
        const dispatchjson = {
            unitId: officer.unit.unitId,
            caseId: initialCaseData!.caseId,
            nodeId: officer.Sop?.nextStage?.nodeId,
            status: officer.Sop?.nextStage?.data?.data?.config?.action,
            unitUser: officer.unit?.username
        };
        console.log("Dispatching with:", dispatchjson);
        try {
            // 2. Call the 'postDispatch' trigger function inside your event handler.
            //    '.unwrap()' is a helpful utility that will automatically throw an
            //    error if the mutation fails, making it easy to use with try/catch.
            if (!(dispatchjson.caseId && dispatchjson.nodeId && dispatchjson.status && dispatchjson?.unitId)) {
                throw new Error("No data found in dispatch object");
            }
            const payload = await postDispatch(dispatchjson).unwrap();
            if (payload.msg?.toLocaleLowerCase() !== "success") {
                throw Error
            }
            console.log('Dispatch successful:', payload);
            setToastMessage("Dispatch Successfully!");
            setToastType("success");
            setShowToast(true);
            dispatchUpdateLocate(dispatchjson)
            setCaseState(prev => {
                if (!prev) return prev;
                return {
                    ...prev,
                    status: dispatchjson.status
                };
            });

            await triggerRefetchUnit()
            // setDisableButton(false);

            return true
        } catch (error) {
            console.error('Dispatch failed:', error);
            setToastMessage("Dispatch Failed");
            // You might want an error toast type here
            setToastType("error");
            setShowToast(true);
            setDisableButton(false);
            return false
        }
    }, [initialCaseData, postDispatch, refetch]);

    const handleDispatch = useCallback(async (officer: Unit) => {

        const dispatchjson = {
            unitId: officer.unitId,
            caseId: initialCaseData!.caseId,
            nodeId: sopLocal?.dispatchStage?.nodeId,
            status: sopLocal?.dispatchStage?.data?.data?.config?.action,
            unitUser: officer.username
        };
        console.log("Dispatching with:", dispatchjson);
        try {

            if (!(dispatchjson.caseId && dispatchjson.nodeId && dispatchjson.status && dispatchjson?.unitId)) {
                throw new Error("No data found in dispatch object");
            }
            const payload = await postDispatch(dispatchjson).unwrap();

            console.log('Dispatch successful:', payload);
            setToastMessage("Dispatch Successfully!");
            setToastType("success");
            setShowToast(true);
            dispatchUpdateLocate(dispatchjson)
            setCaseState(prev => {
                if (!prev) return prev;
                return {
                    ...prev,
                    status: dispatchjson.status
                };
            });

            refetch()
            return true
        } catch (error) {
            console.error('Dispatch failed:', error);
            setToastMessage("Dispatch Failed");
            // You might want an error toast type here
            setToastType("error");
            setShowToast(true);
            return false
        }
    }, [initialCaseData, postDispatch, sopLocal, refetch]);

    const handleAssignOfficers = useCallback(async (selectedOfficers: Unit[]) => {
        // Now receives Unit objects directly instead of IDs
        if (selectedOfficers.length > 0) {
            for (const officer of selectedOfficers) {
                await handleDispatch(officer);
            }
        }
        setShowAssignModal(false);
    }, [handleDispatch]);

    useEffect(() => {
        if (!caseState?.workOrderDate && !initialCaseData) {
            updateCaseState({ workOrderDate: TodayDate() });
        }
    }, [caseState?.workOrderDate, initialCaseData, updateCaseState]);


    // Loading state for existing cases
    // if (initialCaseData && (isLoading || isFetching)) {
    if (initialCaseData && (isLoading)) {
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

    if (showCreatedCase) {
        return (
            <CaseDetailView
                caseData={{ caseId: caseState?.workOrderNummber } as CaseEntity}
                onBack={() => {
                    setShowCreatedCase(false);
                    setCaseState(prev => {
                        if (!prev) return prev;
                        return {
                            ...prev,
                            workOrderNummber: genCaseID()
                        };
                    });
                }}
                isCreate={false}
            />
        );
    }


    if ((sopData === undefined || isError) && isCreate === false) {
        return (
            <div className="flex flex-col h-screen">
                {!disablePageMeta && <PageMeta title="Case Detail" description="Case Detail Page" />}

                {/* Header */}
                <CaseHeader
                    disablePageMeta={disablePageMeta}
                    onBack={handleBack}
                    onOpenCustomerPanel={() => setIsCustomerPanelOpen(true)}
                    isCreate={isCreate}
                    t={t}
                />

                {/* No Data Content */}
                <div className="flex-1 overflow-hidden bg-white dark:bg-gray-800 md:flex rounded-2xl">
                    <div className="flex items-center justify-center h-full w-full">
                        <div className="text-center px-6 py-12">
                            {/* Icon */}
                            <div className="mx-auto w-24 h-24 mb-6 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
                                <svg
                                    className="w-12 h-12 text-gray-400 dark:text-gray-500"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1.5}
                                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                    />
                                </svg>
                            </div>

                            {/* Title */}
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                No Case Data Found
                            </h3>

                            {/* Description */}
                            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                                The case you're looking for doesn't exist or couldn't be loaded.
                                Please check the case ID or try again.
                            </p>

                            {/* Actions */}
                            {/* <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                <button
                                    onClick={onBack}
                                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                                >
                                    Go Back
                                </button>
                                <button
                                    onClick={() => window.location.reload()}
                                    className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                                >
                                    Retry
                                </button>
                            </div> */}

                            {/* Additional Info */}
                            {/* <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    If this issue persists, please contact support or check your network connection.
                                </p>
                            </div> */}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const handleExampleData = () => {
        const exampleCaseState: Partial<CaseDetails> = {
            location: "เลขที่ 78 ซอยสามเสน 3 (วัดสามพระยา) ถนนสามเสน แขวงวัดสามพระยา เขตพระนคร กรุงเทพมหานคร 10200",
            date: "",
            iotDevice: "CAM-001-XYZ123",
            customerData: {
                contractMethod: { name: "IOT-Alert", id: "05" },
                mobileNo: "0991396777",
                name: "",
            } as Custommer,
            caseType: {
                typeId: "fe4215f5-7127-4f6b-bd7a-d6ed8ccaa29d",
                orgId: "434c0f16-b7ea-4a7b-a74b-e2e0f859f549",
                en: "IOT Water Sensor",
                th: "เซ็นเซอร์น้ำอัจฉริยะ",
                active: true,
                sTypeId: "b2c3d4e5-f6a7-8901-bc23-45678901def0",
                sTypeCode: "200",
                subTypeEn: "Water Sensor Malfunction",
                subTypeTh: "เซ็นเซอร์น้ำทำงานผิดปกติ",
                wfId: "f090eeb5-b63c-46ed-aaa9-72462234a070",
                caseSla: "45",
                priority: 5,
                userSkillList: [
                    "fe6c8262-04a1-4f5c-8b48-c124cf0152b1"
                ],
                unitPropLists: [
                    "4a56e3c2-1188-40ef-bf0a-4ec07f6a5933"
                ],
                subTypeActive: true,
                caseType: "200-เซ็นเซอร์น้ำอัจฉริยะ-เซ็นเซอร์น้ำทำงานผิดปกติ",
                formField: {
                    nextNodeId: "node-1755508933488",
                    versions: "draft",
                    wfId: "f090eeb5-b63c-46ed-aaa9-72462234a070",
                    formId: "da7f4b82-dd1f-4743-bea3-eee5d415fccc",
                    formName: "เซ็นเซอร์น้ำอัจฉริยะ",
                    formColSpan: 2,
                    formFieldJson: [
                        {
                            colSpan: 1,
                            id: "18a00f16-6f0d-436e-9a1e-fec5c12513ab",
                            isChild: false,
                            label: "เลขเซ็นเซอร์น้ำ",
                            placeholder: "เลขเซ็นเซอร์น้ำ",
                            required: false,
                            showLabel: true,
                            type: "textInput",
                            value: "WS-001-ABC789"
                        },
                        {
                            colSpan: 1,
                            id: "48f15f2d-a3d6-4955-ab52-8138c780094e",
                            isChild: false,
                            label: "ระดับน้ำ",
                            placeholder: "ระดับน้ำ",
                            required: false,
                            showLabel: true,
                            type: "textInput",
                            value: "200 เมตร"
                        },
                        {
                            colSpan: 2,
                            id: "35c9cfe7-2779-414a-a1e4-b6954b384981",
                            isChild: false,
                            label: "ข้อมูลจากเซ็นเซอร์",
                            placeholder: "ข้อมูลจากเซ็นเซอร์",
                            required: false,
                            showLabel: true,
                            type: "textAreaInput",
                            value: "ลง   500 m"
                        }
                    ]
                },



            },
            priority: 5,
            description: "เซ็นเซอร์น้ำขัดข้อง",
            area: {
                id: "62",
                orgId: "434c0f16-b7ea-4a7b-a74b-e2e0f859f549",
                countryId: "TH",
                provId: "10",
                districtEn: "Phra Nakhon",
                districtTh: "พระนคร",
                districtActive: true,
                distId: "101",
                provinceEn: "Bangkok",
                provinceTh: "กรุงเทพมหานคร",
                provinceActive: true,
                countryEn: "Thailand",
                countryTh: "ประเทศไทย",
                countryActive: true
            },
            status: "",
            scheduleDate: "2025-08-27T16:40",
            attachFile: [],
            attachFileResult: [],
            iotDate: "2025-08-27T16:40",
            workOrderDate: "2025-08-27T16:40"
        };
        setCaseState(exampleCaseState as CaseDetails)
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
                onBack={handleBack}
                onOpenCustomerPanel={() => setIsCustomerPanelOpen(true)}
                isCreate={isCreate}
                t={t}
            />

            {/* Main Content */}
            <div className="flex-1 overflow-hidden bg-white dark:bg-gray-800 md:flex rounded-2xl custom-scrollbar">
                <div className="flex flex-col md:flex-row h-full gap-1 w-full">

                    {/* Left Panel */}
                    <div className="overflow-y-auto w-full md:w-2/3 lg:w-3/4 custom-scrollbar">
                        <div className="pr-0">
                            <div className="px-4 pt-6">

                                {/* Case Card */}
                                {(initialCaseData && sopLocal) && (
                                    <CaseCard
                                        onAddSubCase={() => setShowCreateSupCase(true)}
                                        onAssignClick={() => setShowAssignModal(true)}
                                        onEditClick={handleEditClick}
                                        caseData={sopLocal}
                                        editFormData={editFormData}
                                        setCaseData={setCaseState}
                                    // **REMOVED**: comment prop
                                    />
                                )}

                                <AttachedFiles
                                    files={caseState?.attachFileResult}
                                    editFormData={editFormData}
                                    onRemove={handleRemoveFileResult}
                                />
                                <AssignedOfficers
                                    SopUnit={unitWorkOrder}
                                    onSelectOfficer={handleSelectOfficer}
                                    onRemoveOfficer={handleRemoveOfficer}
                                    handleDispatch={handleUnitSopDispatch}
                                    caseStatus={caseStatus}
                                    handleCancel={handleCancelUnitClick}
                                />

                                {showOfficersData && <OfficerDataModal officer={showOfficersData} onOpenChange={() => setShowOFFicersData(null)} />}
                            </div>

                            {/* Form Content */}
                            <div className="px-4">
                                {(editFormData || isCreate) && caseState ? (
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
                                        handleExampleData={handleExampleData}
                                        language={language}
                                        t={t}
                                        isScheduleDate={isScheduleDate}
                                        caseTypeOptions={caseTypeOptions}
                                        handleSaveChanges={handleSaveChangesDraft}
                                    />
                                ) : (
                                    <FormFieldValueDisplay
                                        caseData={caseState} showResult={true}
                                        isCreate={isCreate} />
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
                        <Panel
                            onClose={() => setIsCustomerPanelOpen(false)}
                            caseItem={caseState || {} as CaseDetails}
                            referCaseList={sopLocal?.referCaseLists}
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
            <PreviewDataBeforeSubmit
                caseData={caseState}
                submitButton={!isCreate || caseState?.workOrderNummber !== undefined ? handleSaveChanges : handleCreateCase}
                isOpen={showPreviewData}
                onClose={() => setShowPreviewData(false)}
            />


            <CreateSubCaseModel
                caseData={initialCaseData}
                open={showCreateSupCase}
                onOpenChange={setShowCreateSupCase}
            />

            <AssignOfficerModal
                open={showAssignModal}
                onOpenChange={setShowAssignModal}
                caseId={initialCaseData?.caseId || ""}
                caseData={sopLocal}
                onAssign={handleAssignOfficers}
                assignedOfficers={assignedOfficers}
                canDispatch={sopData?.data?.dispatchStage.data ? true : false}
                sopUnitLists={sopLocal?.unitLists || []}
            />

            <ConfirmationModal
                isOpen={showCancelUnitModal}
                onClose={() => setShowCancelUnitModal(false)}
                onConfirm={handleConfirmCancelUnit}
                title="Cancel Assignment"
                description={<>Are you sure you want to cancel the assignment for <strong>{unitToCancel?.unit.username}</strong>?</>}
                confirmButtonText="Confirm"
                confirmButtonVariant="error"
            />

            <ConfirmationModal
                isOpen={showCancelCaseModal}
                onClose={() => setShowCancelCaseModal(false)}
                onConfirm={handleConfirmCancelCase}
                title="Cancel Case"
                description="Are you sure you want to cancel this entire case? This action cannot be undone."
                confirmButtonText="Confirm"
                confirmButtonVariant="error"
            />

            <ConfirmationModal
                isOpen={showCloseCaseModal}
                onClose={() => setShowCloseCaseModal(false)}
                onConfirm={handleConfirmCloseCase}
                title="Close Case"
                description="Are you sure you want to close this case?"
                confirmButtonText="Confirm"
                confirmButtonVariant="success"
            />
        </div>
    );
}