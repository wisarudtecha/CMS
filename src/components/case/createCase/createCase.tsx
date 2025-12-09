import { CaseDetails, FileItem } from "@/types/case";
import { memo, useCallback, useState } from "react";
import { CaseFormFields } from "../caseFormFields";
import { Customer } from "@/store/api/custommerApi";
import Button from "@/components/ui/button/Button";
import { ArrowLeft, FileText } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { CreateCase, usePatchUpdateCaseMutation, usePostCreateCaseMutation } from "@/store/api/caseApi";
import { useNavigate } from "react-router";
import PreviewDataBeforeSubmit from "../PreviewCaseData";
import { TodayDate, TodayLocalDate } from "@/components/date/DateToString";
import { exampleCaseState } from "../constants/exampleData";
import { validateCaseForDraft, validateCaseForSubmission } from "../caseDataValidation/caseDataValidation";
import { updateCaseInLocalStorage } from "../caseLocalStorage.tsx/caseListUpdate";
import { TranslationParams } from "@/types/i18n";
import { CaseLayout } from "./layout";
import { ToastContainer } from "@/components/crud/ToastContainer";
import { useToast } from "@/hooks/useToast";
import { UploadFileRes } from "@/types/file";
import { useDeleteFileMutationMutation, usePostUploadFileMutationMutation } from "@/store/api/file";
import { handleFileChanges, uploadFileToServer } from "./createCaseFunction";

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
    const { toasts, addToast, removeToast } = useToast();
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
        attachFile: [] as FileItem[], // Changed to FileItem[]
        attachFileResult: [] as File[]
    } as CaseDetails);
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [showPreviewData, setShowPreviewData] = useState(false);
    const [postUploadFile] = usePostUploadFileMutationMutation();
    const [originalFiles, setOriginalFiles] = useState<FileItem[]>([]);
    const [delFileApi] = useDeleteFileMutationMutation();
    
    



const saveCase = useCallback(
    async (action: "draft" | "submit") => {
        if (!caseState) return false;

        const isDraft = action === "draft";
        const statusId = isDraft ? "S000" : "S001";
        const caseVersion = isDraft ? "draft" : "publish";
        const todayDate = new Date(TodayDate()).toISOString();
        
        const casePayload: CreateCase = {
            formData: caseState?.caseType?.formField,
            customerName: caseState?.customerData?.name,
            caseDetail: caseState?.description || "",
            caseDuration: 0,
            caseLat: "",
            caseLon: "",
            caseId:caseState.workOrderNummber,
            caseSTypeId: caseState?.caseType?.sTypeId || "",
            caseTypeId: caseState?.caseType?.typeId || "",
            caseVersion,
            caselocAddr: caseState?.location || "",
            caselocAddrDecs: "",
            countryId: caseState?.area?.countryId || "",
            createdDate: todayDate,
            distId: caseState?.area?.distId || "",
            deviceId: caseState?.iotDevice,
            extReceive: "",
            phoneNoHide: true,
            phoneNo: caseState?.customerData?.mobileNo || "",
            priority: caseState?.caseType?.priority || 0,
            provId: caseState?.area?.provId || "",
            referCaseId: caseState?.workOrderRef || "",
            resDetail: "",
            source: caseState?.source?.id || "",
            startedDate: caseState?.iotDate ? new Date(caseState?.iotDate).toISOString() : todayDate,
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

                // Step 1: Create case first (without files)
                data = await createCase({ 
                    ...casePayload, 
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
                        uploadedAttachments = await uploadFileToServer(newFiles,postUploadFile, newCaseId);

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
                        ...casePayload,
                        attachments: updatedAttachments as UploadFileRes[]
                    },
                }).unwrap();

                console.log(`✅ Case updated successfully`);
                console.log('Update result:', updateResult);

                updateCaseInLocalStorage(casePayload, caseState.workOrderNummber, profile);

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
    },
    [caseState, originalFiles, profile, createCase, updateCase, navigate, handleFileChanges, addToast, t]
);

    const handleSaveDraft = useCallback(() => {
        const errorMessage = validateCaseForDraft(caseState);
        if (errorMessage) {
            addToast("error", errorMessage);
            return;
        }
        saveCase("draft");
    }, [caseState, saveCase, addToast]);

    const handleCreateCase = useCallback(() => {
        const errorMessage = validateCaseForSubmission(caseState);
        if (errorMessage) {
            addToast("error", errorMessage);
            return;
        }
        saveCase("submit");
    }, [caseState, saveCase, addToast]);

    const handlePreviewShow = useCallback(() => {
        const errorMessage = validateCaseForSubmission(caseState);
        if (errorMessage) {
            addToast("error", errorMessage);
            return;
        }
        setShowPreviewData(true);
    }, [caseState, addToast]);

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
            caseItem={caseState || {} as CaseDetails}
            referCaseList={[]}
        >
            <CaseFormFields
                caseState={caseState || {} as CaseDetails}
                setCaseState={setCaseState}
                isCreate={true}
                listCustomerData={JSON.parse(localStorage.getItem("customer_data") ?? "[]")}
            />

            <div className="flex justify-between items-center m-3 w-full">
                <div>
                    <Button variant="outline-no-transparent" onClick={handleExampleData} size="sm">
                        <FileText className="h-4 w-4" />
                    </Button>
                </div>
                <div className="flex px-6">
                    <Button variant="outline-no-transparent" onClick={handleSaveDraft} className="mx-3">
                        {t("case.display.save_as_draft")}
                    </Button>
                    <Button onClick={handlePreviewShow}>
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
            <ToastContainer toasts={toasts} onRemove={removeToast} />
        </CaseLayout>
    );
}