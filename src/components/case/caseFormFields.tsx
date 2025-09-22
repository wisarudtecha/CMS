import DragDropFileUpload from "@/components/d&d upload/dndUpload";
import CustomerInput from "./CaseCustomerInput";
import { SearchableSelect } from "@/components/SearchSelectInput/SearchSelectInput";
import Input from "@/components/form/input/InputField";
import { mergeCaseTypeAndSubType } from "@/components/caseTypeSubType/mergeCaseTypeAndSubType";
import { getPriorityColorClass } from "@/components/function/Prioriy";
import { FormField, formType } from "@/components/interface/FormField";
import { Area, mergeArea } from "@/store/api/area";
import { Customer } from "@/store/api/custommerApi";
import { CaseDetails, CaseTypeSubType } from "@/types/case";
import { ChangeEvent, memo, useCallback, useEffect, useMemo, useState } from "react";
import { source } from "./constants/caseConstants";
import DynamicForm from "@/components/form/dynamic-form/DynamicForm";
import { Custommer } from "@/types";
import { REQUIRED_ELEMENT as requireElements, COMMON_INPUT_CSS as commonInputCss } from "./constants/caseConstants";
import { useTranslation } from "@/hooks/useTranslation";
import { findCaseTypeSubType } from "@/components/caseTypeSubType/findCaseTypeSubTypeByMergeName";
import { TodayLocalDate } from "@/components/date/DateToString";
import { useLazyGetTypeSubTypeQuery } from "@/store/api/formApi";

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

interface CaseFormFieldsProps {
    caseState: CaseDetails;
    setCaseState: React.Dispatch<React.SetStateAction<CaseDetails | undefined>>;
    isCreate: boolean;
    listCustomerData: Customer[];
}




export const CaseFormFields = memo<CaseFormFieldsProps>(({
    caseState,
    setCaseState,
    isCreate,
    listCustomerData,

}) => {
    const { t, language } = useTranslation();
    const [getTypeSubType] = useLazyGetTypeSubTypeQuery();
    const [formDataUpdated, setFormDataUpdated] = useState(0);
    const caseTypeSupTypeData = useMemo(() =>
        JSON.parse(localStorage.getItem("caseTypeSubType") ?? "[]") as CaseTypeSubType[], []
    );
    const areaList = useMemo(() =>
        JSON.parse(localStorage.getItem("area") ?? "[]") as Area[], []
    );
    const caseTypeOptions = useMemo(() => {
        if (!caseTypeSupTypeData?.length) return [];
        return caseTypeSupTypeData.map(item =>
            mergeCaseTypeAndSubType(item, language)
        );
    }, [caseTypeSupTypeData]);
    const [selectedCaseTypeForm, setSelectedCaseTypeForm] = useState<formType | undefined>();
    
    
    const caseType = useMemo(() => ({
        caseType: caseState?.caseType?.caseType ?? "",
        priority: caseState?.priority ?? 0
    }), [caseState?.caseType?.caseType, caseState?.priority]);

    // Form data fetching effect
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
                    setFormDataUpdated(prev => prev + 1);
                }
            } catch (error) {
                console.error('Error fetching form data:', error);
            }
        };

        fetchFormData();
    }, [caseState?.caseType?.sTypeId, getTypeSubType]);

    // Get form by case type
    const getFormByCaseType = useCallback(() => {
        if (!caseState?.caseType?.caseType || !caseTypeSupTypeData.length) {
            return undefined;
        }

        const newCaseType = findCaseTypeSubType(caseTypeSupTypeData, caseState.caseType.caseType, language);
        if (!newCaseType?.sTypeId) return undefined;

        const formFieldStr = localStorage.getItem("subTypeForm-" + newCaseType.sTypeId);
        if (formFieldStr && formFieldStr !== "undefined") {
            try {
                const formField: FormField = JSON.parse(formFieldStr);
                return {
                    ...newCaseType,
                    caseType: mergeCaseTypeAndSubType(newCaseType, language),
                    formField,
                };
            } catch (e) {
                console.error("Failed to parse formField JSON:", e);
                localStorage.removeItem("subTypeForm-" + newCaseType.sTypeId);
            }
        }

        return {
            ...newCaseType,
            caseType: mergeCaseTypeAndSubType(newCaseType, language),
        } as formType;
    }, [caseState?.caseType?.caseType, caseTypeSupTypeData, formDataUpdated, language]);

    useEffect(() => {
        if (caseState?.caseType?.formField) {
            const currentCaseType = findCaseTypeSubType(caseTypeSupTypeData, caseState?.caseType?.caseType, language);
            if (currentCaseType?.typeId === caseState.caseType.typeId &&
                currentCaseType?.sTypeId === caseState.caseType.sTypeId) {
                setSelectedCaseTypeForm(caseState.caseType);
                return;
            }
        }
        setSelectedCaseTypeForm(getFormByCaseType() as formType);
    }, [getFormByCaseType]);

    useEffect(() => {
        if (isCreate && caseState && !caseState.iotDate) {
            setCaseState(prev => prev ? {
                ...prev,
                iotDate: TodayLocalDate()
            } : prev);
        }
    }, [isCreate, caseState, setCaseState]);

    // Check if dynamic form is required
    // useEffect(() => {
    //     if (!selectedCaseTypeForm?.formField?.formFieldJson) {
    //         setIsValueFill(prev => ({ ...prev, dynamicForm: true }));
    //     }
    // }, [selectedCaseTypeForm]);

    // Update case state helper
    const updateCaseState = useCallback((updates: Partial<CaseDetails>) => {
        setCaseState(prev => prev ? { ...prev, ...updates } : prev);
    }, [setCaseState]);

    // Handle functions
    const handleCaseTypeChange = useCallback((newValue: string) => {
        const newCaseType = findCaseTypeSubType(caseTypeSupTypeData, newValue, language);
        if (!newCaseType) return;

        const shouldUpdate = isCreate ||
            newCaseType?.typeId !== caseState?.caseType?.typeId ||
            newCaseType?.sTypeId !== caseState?.caseType?.sTypeId;

        if (shouldUpdate) {
            updateCaseState({
                priority: newCaseType.priority,
                caseType: {
                    ...newCaseType,
                    caseType: mergeCaseTypeAndSubType(newCaseType, language)
                } as formType
            });
        }
    }, [caseTypeSupTypeData, caseState?.caseType, isCreate, language, updateCaseState]);

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
    }, [setCaseState]);

    const handleIotDevice = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        updateCaseState({ iotDevice: e.target.value });
    }, [updateCaseState]);

    const handleIotDeviceDate = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        updateCaseState({ iotDate: e.target.value });
    }, [updateCaseState]);

    const handleDetailChange = useCallback((data: string) => {
        updateCaseState({ description: data });
    }, [updateCaseState]);

    const handleSetArea = useCallback((selectedName: string) => {
        const selected = areaList.find(item => mergeArea(item, language) === selectedName);
        if (selected) {
            updateCaseState({ area: selected });
        }
    }, [areaList, language, updateCaseState]);

    const handleCustomerDataChange = useCallback((data: any) => {
        updateCaseState({ customerData: data });
    }, [updateCaseState]);

    const handleLocationChange = useCallback((data: string) => {
        updateCaseState({ location: data });
    }, [updateCaseState]);


    const handleFilesChange = useCallback((newFiles: File[]) => {
        updateCaseState({ attachFile: newFiles });
    }, [updateCaseState]);

    const handleGetTypeFormData = useCallback((getTypeData: FormField) => {
        const newData = {
            ...selectedCaseTypeForm,
            formField: getTypeData,
            caseType: caseState?.caseType?.caseType ?? ""
        } as formType;
        updateCaseState({ caseType: newData });
    }, [caseState?.caseType?.caseType, selectedCaseTypeForm, updateCaseState]);





    // const handlePreviewShow = useCallback(() => {
    //     const errorMessage = checkRequiredFields();
    //     if (errorMessage) {
    //         // You can emit an error event or show toast here
    //         console.error(errorMessage);
    //         return;
    //     }
    //     onPreview();
    // }, [checkRequiredFields, onPreview]);

    return (
        <>
            {/* Priority Section */}
            {selectedCaseTypeForm && (
                <div className="flex items-end justify-end">
                    <span className="mr-2 text-gray-900 dark:text-gray-400">{t("case.assignment.piority")}</span>
                    <div
                        className={`w-5 h-5 mx-1 p-3 ${getPriorityColorClass(
                            caseTypeSupTypeData.find(data =>
                                mergeCaseTypeAndSubType(data, language) === caseType.caseType
                            )?.priority ?? -1
                        )} rounded-lg`}
                    />
                </div>
            )}


            {/* Case Type Form Section */}
            <CaseTypeFormSection
                handleGetTypeFormData={handleGetTypeFormData}
                selectedCaseTypeForm={selectedCaseTypeForm?.formField}
            >
                <div className="grid-cols-2 sm:grid">
                    <div className="text-white dark:text-gray-300">
                        <div className="flex justify-between mx-3 text-gray-900 dark:text-gray-400">
                            <h3 className="mb-3 block text-gray-900 dark:text-gray-400">
                                {t("case.display.types")} :{requireElements}
                            </h3>
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
                            options={source.map(m => m.name)}
                            className="sm:my-3 sm:mb-3"
                            value={caseState?.customerData?.contractMethod?.name ?? ""}
                            onChange={(selectedName) => {
                                const selectedMethod = source.find(method => method.name === selectedName);
                                if (selectedMethod) handleContactMethodChange(selectedMethod);
                            }}
                            placeholder={t("case.display.contact_method_placeholder")}
                        />
                    </div>
                </div>
            </CaseTypeFormSection>

            {/* IoT Device and Alert Date */}
            <div className="xsm:grid grid-cols-2">
                {caseState?.workOrderRef && (
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
                )}

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
                        className="2xsm:my-4 2xsm:mx-3"
                    />
                </div>
                <CustomerInput
                    listCustomerData={listCustomerData}
                    handleCustomerDataChange={handleCustomerDataChange}
                    customerData={caseState?.customerData || {} as any}
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

            {/* Action Buttons */}
            {/* <div className="flex justify-between items-center">
                {!isCreate ? (
                    <Button variant="success" onClick={handlePreviewShow}>
                        {t("case.display.save_change")}
                    </Button>
                ) : (
                    <div className="flex justify-between items-center m-3 w-full">
                        <div>
                            <Button onClick={onExampleData} size="sm">
                                <FileText className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="flex">
                            <Button onClick={onSaveDraft} className="mx-3">
                                {t("case.display.save_as_draft")}
                            </Button>
                            <Button variant="success" onClick={handlePreviewShow}>
                                {t("case.display.submit")}
                            </Button>
                        </div>
                    </div>
                )}
            </div> */}
        </>
    );
});

CaseFormFields.displayName = 'CaseFormFields';

