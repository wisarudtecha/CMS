import { CaseDetails, CaseEntity } from "@/types/case";
import { memo, useCallback, useState } from "react";
import { CaseFormFields } from "../caseFormFields";
import { Customer } from "@/store/api/custommerApi";
import Button from "@/components/ui/button/Button";
import { ArrowLeft, FileText } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { CreateCase, usePatchUpdateCaseMutation, usePostCreateCaseMutation } from "@/store/api/caseApi";
import { useNavigate } from "react-router";
import Toast from "@/components/toast/Toast";
import PreviewDataBeforeSubmit from "../PreviewCaseData";
import { TodayDate, TodayLocalDate } from "@/components/date/DateToString";
import { exampleCaseState } from "../constants/exampleData";
import { validateCaseForDraft, validateCaseForSubmission } from "../caseDataValidation/caseDataValidation";
import { insertCaseToLocalStorage, updateCaseInLocalStorage } from "../caseLocalStorage.tsx/caseListUpdate";
import { TranslationParams } from "@/types/i18n";
import { CaseLayout } from "./layout";

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

export default function CaseCreation() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [createCase] = usePostCreateCaseMutation();
    const [updateCase] = usePatchUpdateCaseMutation();
    const profile = JSON.parse(localStorage.getItem("profile") ?? "{}");

    const [caseState, setCaseState] = useState<CaseDetails | undefined>({
        location: "",
        date: "",
        caseType: undefined,
        priority: 0,
        description: "",
        area: undefined,
        status: "",
        iotDate: TodayLocalDate(),
        scheduleDate: "",
        customerData: {} as Customer,
        attachFile: [] as File[],
        attachFileResult: [] as File[]
    } as CaseDetails);
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [showPreviewData, setShowPreviewData] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [toastType, setToastType] = useState<"success" | "error" | "info">("info");

    const saveCase = useCallback(
        async (action: "draft" | "submit") => {
            if (!caseState) return false;

            const isDraft = action === "draft";
            const statusId = isDraft ? "S000" : "S001";
            const caseVersion = isDraft ? "draft" : "publish";
            const casePayload: CreateCase = {
                formData: caseState?.caseType?.formField,
                customerName: caseState?.customerData?.name,
                caseDetail: caseState?.description || "",
                caseDuration: 0,
                caseLat: "",
                caseLon: "",
                caseSTypeId: caseState?.caseType?.sTypeId || "",
                caseTypeId: caseState?.caseType?.typeId || "",
                caseVersion,
                caselocAddr: caseState?.location || "",
                caselocAddrDecs: caseState?.location || "",
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
                statusId,
                userarrive: "",
                userclose: "",
                usercommand: caseState?.serviceCenter?.commandTh || "",
                usercreate: profile?.username || "",
                userreceive: "",
                nodeId: caseState?.caseType?.formField?.nextNodeId || "",
                wfId: caseState?.caseType?.wfId || "",
                versions: caseState?.caseType?.formField?.versions || "",
                deptId: caseState?.serviceCenter?.deptId,
                commId: caseState?.serviceCenter?.commId,
                stnId: caseState?.serviceCenter?.stnId,
                caseSla: caseState?.caseType?.caseSla,
                scheduleFlag: false,
            } as CreateCase;

            try {
                let data: any;

                if (!caseState.workOrderNummber) {
                    // no case yet → create
                    data = await createCase(casePayload).unwrap();
                    if (data?.msg !== "Success") throw new Error(data?.desc);

                    // update local state
                    setCaseState(prev =>
                        prev ? { ...prev, workOrderNummber: data.caseId, status: statusId } : prev
                    );

                    const newCase = {
                        ...(casePayload as object),
                        caseId: data?.caseId,
                        createdAt: TodayDate(),
                        createdBy: profile?.username || ""
                    } as CaseEntity;
                    insertCaseToLocalStorage(newCase);
                } else {
                    await updateCase({
                        caseId: caseState.workOrderNummber,
                        updateCase: casePayload,
                    }).unwrap();
                    updateCaseInLocalStorage(casePayload, caseState.workOrderNummber, profile);
                    if (!isDraft) {
                        setCaseState(prev =>
                            prev ? { ...prev, status: "S001" } : prev
                        );
                    }
                }

                // Navigate only when submitted
                if (!isDraft) {
                    navigate(`/case/${caseState.workOrderNummber || data?.caseId}`);
                }

                setToastMessage(isDraft ? "Draft saved successfully!" : "Case submitted successfully!");
                setToastType("success");
                setShowToast(true);

                return true;
            } catch (error) {
                setToastMessage(isDraft ? "Failed to save draft" : "Failed to submit case");
                setToastType("error");
                setShowToast(true);
                return false;
            }
        },
        [caseState, profile, createCase, updateCase, navigate]
    );

    const handleSaveDraft = useCallback(() => {
        const errorMessage = validateCaseForDraft(caseState);
        if (errorMessage) {
            setToastMessage(errorMessage);
            setToastType("error");
            setShowToast(true);
            return;
        }
        saveCase("draft");
    }, [caseState, saveCase]);

    const handleCreateCase = useCallback(() => {
        const errorMessage = validateCaseForSubmission(caseState);
        if (errorMessage) {
            setToastMessage(errorMessage);
            setToastType("error");
            setShowToast(true);
            return;
        }
        saveCase("submit");
    }, [caseState, saveCase]);


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

    const handleExampleData = () => {
        setCaseState(exampleCaseState as CaseDetails);
    };

    return (
        <CaseLayout
            disablePageMeta={false}
            onBack={() => navigate(-1)}
            isPanelOpen={isPanelOpen}
            onPanelClose={() => setIsPanelOpen(false)}
            onPanelOpen={() => setIsPanelOpen(true)}
            isCreate={true}
            t={t}
            // title={t("navigation.sidebar.main.case_management.nested.case_creation")}
            caseItem={caseState || {} as CaseDetails}
            referCaseList={[]}
            showToast={
                showToast && (
                    <Toast 
                        message={toastMessage} 
                        type={toastType} 
                        duration={3000} 
                        onClose={() => setShowToast(false)} 
                    />
                )
            }
        >
            <CaseFormFields
                caseState={caseState || {} as CaseDetails}
                setCaseState={setCaseState}
                isCreate={true}
                listCustomerData={JSON.parse(localStorage.getItem("customer_data") ?? "[]")}
            />

            <div className="flex justify-between items-center m-3 w-full">
                <div>
                    <Button onClick={handleExampleData} size="sm">
                        <FileText className="h-4 w-4" />
                    </Button>
                </div>
                <div className="flex px-6">
                    <Button onClick={handleSaveDraft} className="mx-3">
                        {t("case.display.save_as_draft")}
                    </Button>
                    <Button variant="success" onClick={handlePreviewShow}>
                        {t("case.display.submit")}
                    </Button>
                </div>
            </div>

            <PreviewDataBeforeSubmit
                caseData={caseState}
                submitButton={handleCreateCase}
                isOpen={showPreviewData}
                onClose={() => setShowPreviewData(false)}
            />
        </CaseLayout>
    );
}