"use client"

import { useCallback, useMemo, useState, useEffect, memo } from "react"
import { ArrowLeft } from "lucide-react"
import Button from "@/components/ui/button/Button"
import PageMeta from "@/components/common/PageMeta"
import { FormFieldWithNode } from "@/components/interface/FormField"
import AssignOfficerModal from "@/components/assignOfficer/AssignOfficerModel"
import { getAvatarIconFromString } from "../avatar/createAvatarFromString"
import Toast from "../toast/Toast"
import type { Custommer } from "@/types";
import React from "react"
import FormFieldValueDisplay from "./CaseDisplay"
import PreviewDataBeforeSubmit from "./PreviewCaseData"
import { Customer } from "@/store/api/custommerApi"
import { CreateCase, usePatchUpdateCaseMutation } from "@/store/api/caseApi" // REMOVED: usePostCreateCaseMutation
import { mergeCaseTypeAndSubType } from "../caseTypeSubType/mergeCaseTypeAndSubType"
import { findCaseTypeSubTypeByTypeIdSubTypeId } from "../caseTypeSubType/findCaseTypeSubTypeByMergeName"
import { CaseSopUnit, Unit, UnitWithSop, useGetCaseSopQuery, useLazyGetSopUnitQuery, usePostDispacthMutationMutation } from "@/store/api/dispatch"
import { Area } from "@/store/api/area"
import { CaseCard } from "./sopCard"
import { CaseDetails, CaseEntity } from "@/types/case"
import CreateSubCaseModel from "./subCase/subCaseModel"
import dispatchUpdateLocate from "./caseLocalStorage.tsx/caseLocalStorage"
import { useNavigate, useParams } from "react-router"
import Panel from "./CasePanel"
import OfficerDataModal from "./OfficerDataModal"
import { CaseStatusInterface } from "../ui/status/status"
import { ConfirmationModal } from "./modal/ConfirmationModal"
import { useWebSocket } from "../websocket/websocket"
import { useTranslation } from "@/hooks/useTranslation";
import { TranslationParams } from "@/types/i18n";
import { source } from "./constants/caseConstants";
import { CaseFormFields } from "./caseFormFields";
import { CaseTypeSubType } from "../interface/CaseType"
import { getLocalISOString, TodayDate } from "../date/DateToString"
import { validateCaseForSubmission } from "./caseDataValidation/caseDataValidation"

const CaseHeader = memo(({ disablePageMeta, onBack, onOpenCustomerPanel, t }: {
    disablePageMeta?: boolean;
    onBack?: () => void;
    onOpenCustomerPanel: () => void;
    t: (key: string, params?: TranslationParams | undefined) => string;
}) => (
    <div className="flex-shrink-0">
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


// REMOVED: The `isCreate` prop from the component signature.
export default function CaseDetailView({ onBack, caseData, disablePageMeta = false, isSubCase = false, isScheduleDate = false }: { onBack?: () => void, caseData?: CaseEntity, disablePageMeta?: boolean, isSubCase?: boolean, isScheduleDate?: boolean }) {

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
    const [caseState, setCaseState] = useState<CaseDetails | undefined>(undefined);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [showCreateSupCase, setShowCreateSupCase] = useState(false);
    const [editFormData, setEditFormData] = useState<boolean>(false);
    const [assignedOfficers, setAssignedOfficers] = useState<Unit[]>([]);
    const [showOfficersData, setShowOFFicersData] = useState<UnitWithSop | null>(null);
    const [dispatchUnit, setDispatchUnit] = useState<CaseSopUnit[] | null>(null);
    const [unitWorkOrder, setUnitWorkOrder] = useState<UnitWithSop[]>([]);
    const [isCustomerPanelOpen, setIsCustomerPanelOpen] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [showPreviewData, setShowPreviewData] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [toastType, setToastType] = useState<"success" | "error" | "info">("info");
    const [listCustomerData, setListCustomerData] = useState<Customer[]>([])
    const [isInitialized, setIsInitialized] = useState(false);
    const { subscribe, isConnected, connectionState, connect } = useWebSocket()
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

    const { data: sopData, isError, isLoading, refetch } = useGetCaseSopQuery(
        { caseId: initialCaseData?.caseId || "" },
        {
            refetchOnMountOrArgChange: true,
            skip: !initialCaseData?.caseId
        }
    );

    const [updateCase] = usePatchUpdateCaseMutation();
    const [postDispatch] = usePostDispacthMutationMutation();
    const [getSopUnit] = useLazyGetSopUnitQuery();
    const [refetchTriggerUnit, setRefetchTriggerUnit] = useState(Boolean);

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
                    if (data.additionalJson?.event === "Update") {
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
    }, [subscribe, connect, connectionState, isConnected, caseState]);


    useEffect(() => {
        if (sopData?.data && initialCaseData) {
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
        console.log("Cancelling assignment for:", unitToCancel?.unit.username);
        setShowCancelUnitModal(false);
        setUnitToCancel(null);
        setToastMessage("Unit assignment cancelled.");
        setToastType("info");
        setShowToast(true);
    }, [unitToCancel]);

    const handleConfirmCancelCase = useCallback(() => {
        console.log("Cancelling case:", sopData?.data?.caseId);
        setShowCancelCaseModal(false);
        setToastMessage("Case has been cancelled.");
        setToastType("error");
        setShowToast(true);
    }, [sopData?.data]);

    const handleConfirmCloseCase = useCallback(() => {
        console.log("Closing case:", sopData?.data?.caseId);
        setShowCloseCaseModal(false);
        setToastMessage("Case has been closed.");
        setToastType("success");
        setShowToast(true);
    }, [sopData?.data]);

    useEffect(() => {
        if ( sopData?.data && areaList.length > 0  && caseTypeSupTypeData.length > 0) {
            const utcTimestamp: string | undefined = sopData.data?.createdAt;
            const area = areaList.find((items) =>
                sopData?.data?.provId === items.provId &&
                sopData?.data?.distId === items.distId &&
                sopData?.data?.countryId === items.countryId
            );

            const initialCaseTypeData = findCaseTypeSubTypeByTypeIdSubTypeId(
                caseTypeSupTypeData,
                sopData.data.caseTypeId,
                sopData.data.caseSTypeId
            ) ?? {} as CaseTypeSubType;

            const initialMergedCaseType = mergeCaseTypeAndSubType(initialCaseTypeData, language);
            const newCaseState: CaseDetails = {
                location: sopData.data?.caselocAddr || "",
                date: utcTimestamp ? getLocalISOString(utcTimestamp) : "",
                caseType: {
                    ...initialCaseTypeData,
                    caseType: initialMergedCaseType,
                    formField: sopData.data?.formAnswer || {} as FormFieldWithNode,
                },
                priority: sopData.data?.priority || 0,
                description: sopData.data?.caseDetail || "",
                workOrderNummber: sopData.data?.caseId || "",
                workOrderRef: sopData.data?.referCaseId || "",
                iotDevice: sopData.data?.deviceId || "",
                iotDate: getLocalISOString(sopData.data?.startedDate) || "",
                area: area,
                status: sopData.data?.statusId || "",
                lastUpdate: sopData.data?.updatedAt,
                updateBy: sopData.data?.updatedBy,
                attachFile: [] as File[],
                attachFileResult: [] as File[]
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

    }, [sopData?.data, areaList.length, caseTypeSupTypeData, isSubCase, language]);


    useEffect(() => {
        if (listCustomerData.length > 0 && sopData?.data) {
            const result = listCustomerData.find(items => items.mobileNo === initialCaseData?.phoneNo)
            const customerData = result ? {
                ...result,
                name: `${result.firstName} ${result.lastName}`,
                contractMethod: {
                    id: sopData?.data?.source || "",
                    name: source.find((items) => items.id === sopData?.data?.source)?.name || ""
                }
            } as Custommer : {
                mobileNo: sopData?.data?.phoneNo,
                contractMethod: {
                    id: sopData?.data?.source || "",
                    name: source.find((items) => items.id === sopData?.data?.source)?.name || ""
                },
            } as Custommer;
            setCaseState(prev => prev ? {
                ...prev,
                customerData: customerData,
                status: prev.status || "",
            } as CaseDetails : prev);
        }
    }, [listCustomerData.length, sopData?.data, initialCaseData?.phoneNo]);

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

    const handleSelectOfficer = useCallback((selectedOfficer: UnitWithSop) => {
        setShowOFFicersData(prev => (prev?.unit.unitId === selectedOfficer.unit.unitId ? null : selectedOfficer));
    }, []);

    const handleRemoveOfficer = useCallback((officerToRemove: UnitWithSop) => {
        setAssignedOfficers(prev => prev.filter(o => o.unitId !== officerToRemove.unit.unitId));
        if (showOfficersData?.unit.unitId === officerToRemove.unit.unitId) {
            setShowOFFicersData(null);
        }
    }, [showOfficersData?.unit.unitId]);


    const updateCaseInLocalStorage = useCallback((updateJson: CreateCase) => {
        try {
            const caseListData = localStorage.getItem("caseList");
            const caseList: CaseEntity[] = caseListData ? JSON.parse(caseListData) : [];
            const caseIdToUpdate = sopData?.data?.caseId;
            if (!caseIdToUpdate) return false;

            const caseIndex = caseList.findIndex(item => (item.caseId || item.caseId) === caseIdToUpdate);
            if (caseIndex === -1) return false;

            const originalCase = caseList[caseIndex];
            const updatedCase = {
                ...originalCase,
                ...updateJson,
                caseSla:Number(updateJson.caseSla),
                id: originalCase.id,
                caseId: originalCase.caseId,
                createdAt: originalCase.createdAt,
                createdBy: originalCase.createdBy,
                updatedAt: TodayDate(),
                updatedBy: profile?.username || "",
            };
            
            caseList[caseIndex] = updatedCase;
            localStorage.setItem("caseList", JSON.stringify(caseList));
            return true;
        } catch (error) {
            console.error("Error updating case in localStorage:", error);
            return false;
        }
    }, [sopData?.data, profile]);



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
            caseVersion: caseState?.status === "S000" ? "publish" : sopData?.data?.caseVersion,
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
            statusId: caseState?.status === "S000" ? "S001" : sopData?.data?.statusId,
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
                setCaseState(prev => prev ? { ...prev, status: "S001" } : prev);
                if (caseState?.workOrderNummber) navigate("/case/" + caseState?.workOrderNummber);
            }

            setEditFormData(false);
            setToastMessage(updateSuccess ? "Changes saved successfully!" : "Changes saved to server");
            setToastType("success");
            setShowToast(true);

        } catch (error: any) {
            setToastType("error");
            setToastMessage(`Failed to Update Case`);
            setShowToast(true);
        }
    }, [caseState, sopData?.data, updateCase, updateCaseInLocalStorage, profile, navigate, isScheduleDate]);
    
    const handlePreviewShow = useCallback(() => {
            const errorMessage = validateCaseForSubmission(caseState);
            if (errorMessage) {
                setToastMessage(errorMessage);
                setToastType("error");
                setShowToast(true);
                return;
            }
            setShowPreviewData(true);
    }, [validateCaseForSubmission, caseState]);

    const handleEditClick = useCallback(() => {
        setEditFormData(prev => !prev);
    }, []);
    
    const handleUnitSopDispatch = useCallback(async (officer: UnitWithSop, setDisableButton: React.Dispatch<React.SetStateAction<boolean>>) => {
        setDisableButton(true)
        const dispatchjson = {
            unitId: officer.unit.unitId,
            caseId: initialCaseData!.caseId,
            nodeId: officer.Sop?.nextStage?.nodeId,
            status: officer.Sop?.nextStage?.data?.data?.config?.action,
            unitUser: officer.unit?.username
        };
        try {
            if (!(dispatchjson.caseId && dispatchjson.nodeId && dispatchjson.status && dispatchjson?.unitId)) {
                throw new Error("No data found in dispatch object");
            }
            const payload = await postDispatch(dispatchjson).unwrap();
            if (payload.msg?.toLocaleLowerCase() !== "success") {
                throw Error
            }
            setToastMessage("Dispatch Successfully!");
            setToastType("success");
            setShowToast(true);
            dispatchUpdateLocate(dispatchjson)
            setCaseState(prev => prev ? { ...prev, status: dispatchjson.status } : prev);
            await triggerRefetchUnit();
            return true
        } catch (error) {
            console.error('Dispatch failed:', error);
            setToastMessage("Dispatch Failed");
            setToastType("error");
            setShowToast(true);
            setDisableButton(false);
            return false
        }
    }, [initialCaseData, postDispatch, triggerRefetchUnit]);

    const handleDispatch = useCallback(async (officer: Unit) => {
        const dispatchjson = {
            unitId: officer.unitId,
            caseId: initialCaseData!.caseId,
            nodeId: sopData?.data?.dispatchStage?.nodeId,
            status: sopData?.data?.dispatchStage?.data?.data?.config?.action,
            unitUser: officer.username
        };
        try {
            if (!(dispatchjson.caseId && dispatchjson.nodeId && dispatchjson.status && dispatchjson?.unitId)) {
                throw new Error("No data found in dispatch object");
            }
            await postDispatch(dispatchjson).unwrap();
            setToastMessage("Dispatch Successfully!");
            setToastType("success");
            setShowToast(true);
            dispatchUpdateLocate(dispatchjson)
            setCaseState(prev => prev ? { ...prev, status: dispatchjson.status } : prev);
            refetch()
            return true
        } catch (error) {
            console.error('Dispatch failed:', error);
            setToastMessage("Dispatch Failed");
            setToastType("error");
            setShowToast(true);
            return false
        }
    }, [initialCaseData, postDispatch, sopData?.data, refetch]);

    const handleAssignOfficers = useCallback(async (selectedOfficers: Unit[]) => {
        if (selectedOfficers.length > 0) {
            for (const officer of selectedOfficers) {
                await handleDispatch(officer);
            }
        }
        setShowAssignModal(false);
    }, [handleDispatch]);


    if (initialCaseData && isLoading) {
        return (
            <div className="relative flex-1 min-h-screen ">
                <div className="absolute inset-0 flex items-center justify-center dark:bg-gray-900 bg-opacity-70 dark:bg-opacity-70 z-50 rounded-2xl">
                    <div className="flex flex-col items-center">
                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 mb-4"></div>
                        <div className="text-lg text-gray-700 dark:text-gray-200 font-semibold">Loading Case...</div>
                    </div>
                </div>
            </div>
        );
    }

    if ((sopData === undefined || isError)) {
        return (
            <div className="flex flex-col h-screen">
                {!disablePageMeta && <PageMeta title="Case Detail" description="Case Detail Page" />}
                <CaseHeader
                    disablePageMeta={disablePageMeta}
                    onBack={handleBack}
                    onOpenCustomerPanel={() => setIsCustomerPanelOpen(true)}
                    t={t}
                />
                <div className="flex-1 overflow-hidden bg-white dark:bg-gray-800 md:flex rounded-2xl">
                    <div className="flex items-center justify-center h-full w-full">
                        <div className="text-center px-6 py-12">
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Case Data Found</h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                                The case you're looking for doesn't exist or couldn't be loaded.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
    
    return (
        <div className="flex flex-col h-screen">
            {!disablePageMeta && <PageMeta title="Case Detail" description="Case Detail Page" />}
            {showToast && (
                <Toast message={toastMessage} type={toastType} duration={3000} onClose={() => setShowToast(false)} />
            )}
            <CaseHeader
                disablePageMeta={disablePageMeta}
                onBack={handleBack}
                onOpenCustomerPanel={() => setIsCustomerPanelOpen(true)}
                t={t}
            />
            <div className="flex-1 overflow-hidden bg-white dark:bg-gray-800 md:flex rounded-2xl custom-scrollbar">
                <div className="flex flex-col md:flex-row h-full gap-1 w-full">
                    <div className="overflow-y-auto w-full md:w-2/3 lg:w-3/4 custom-scrollbar">
                        <div className="pr-0">
                            <div className="px-4 pt-6">
                                {(initialCaseData && sopData?.data) && (
                                    <CaseCard
                                        onAddSubCase={() => setShowCreateSupCase(true)}
                                        onAssignClick={() => setShowAssignModal(true)}
                                        onEditClick={handleEditClick}
                                        caseData={sopData.data}
                                        editFormData={editFormData}
                                        setCaseData={setCaseState}
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
                            <div className="px-4">
                                {editFormData && caseState ? (
                                    <div>
                                        <CaseFormFields
                                            caseState={caseState}
                                            setCaseState={setCaseState}
                                            isCreate={false}
                                            listCustomerData={listCustomerData}
                                        />
                                        <div className="flex justify-end items-center m-3">
                                            <Button variant="success" onClick={handlePreviewShow}>
                                                {t("case.display.save_change")}
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <FormFieldValueDisplay
                                        caseData={caseState} showResult={true}
                                    />
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
                            referCaseList={sopData?.data?.referCaseLists}
                        />
                    </div>
                </div>
            </div>
            {isCustomerPanelOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-30 md:hidden"
                    onClick={() => setIsCustomerPanelOpen(false)}
                />
            )}
            <PreviewDataBeforeSubmit
                caseData={caseState}
                submitButton={handleSaveChanges}
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
                caseData={sopData?.data}
                onAssign={handleAssignOfficers}
                assignedOfficers={assignedOfficers}
                canDispatch={sopData?.data?.dispatchStage.data ? true : false}
                sopUnitLists={sopData?.data?.unitLists || []}
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