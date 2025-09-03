import {
    User,
} from "lucide-react"
import Button from "@/components/ui/button/Button"
import Badge from "@/components/ui/badge/Badge"
import React, { useMemo } from "react"
import { getPriorityBorderColorClass, getTextPriority } from "../function/Prioriy"
import FormFieldValueDisplay from "./CaseDisplay"
import { CaseDetails } from "@/types/case"
import { mergeCaseTypeAndSubType } from "../caseTypeSubType/mergeCaseTypeAndSubType"
import { statusIdToStatusTitle } from "../ui/status/status"
import { Modal } from "../ui/modal"


interface PreviewDataBeforeSubmitProps {
    caseData?: CaseDetails
    submitButton?: () => void
    isOpen: boolean
    onClose: () => void
}

const PreviewDataBeforeSubmit: React.FC<PreviewDataBeforeSubmitProps> = ({
    caseData,
    submitButton,
    isOpen,
    onClose
}) => {
    const profile = useMemo(
        () => JSON.parse(localStorage.getItem("profile") ?? "{}"),
        []
    )

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            className="max-w-6xl p-8 dark:!bg-gray-800  flex flex-col  "
            closeButtonClassName="!bg-transparent"
        >
            {/* Scrollable content */}
            <div className=" overflow-y-auto custom-scrollbar pr-2  max-h-[90vh] ">
                <div
                    className={`mb-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border-l-4 ${getPriorityBorderColorClass(
                        caseData?.caseType?.priority || 0
                    )}`}
                >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3">
                        <div>
                            {caseData?.caseType && (
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                    {mergeCaseTypeAndSubType(caseData.caseType)}
                                </h2>
                            )}
                            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 text-sm text-gray-600 dark:text-gray-400">
                                <div className="flex items-center space-x-1">
                                    <User className="w-4 h-4" />
                                    <span>Created: {profile.username}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2 text-center mt-3 sm:mt-0">
                            {caseData?.caseType?.priority && (
                                <Badge
                                    variant="outline"
                                    color={`${getTextPriority(caseData.caseType?.priority).color}`}
                                >
                                    {getTextPriority(caseData.caseType?.priority).level} Priority
                                </Badge>
                            )}
                            {caseData?.status && (
                                <Badge variant="outline">
                                    {statusIdToStatusTitle(caseData?.status)}
                                </Badge>
                            )}
                        </div>
                    </div>
                </div>

                {(caseData?.attachFileResult?.length !== 0 && caseData) && (
                    <>
                        <span className="font-medium text-gray-700 dark:text-gray-200 text-sm">
                            Attach File :
                        </span>

                        {Array.isArray(caseData.attachFile) && caseData.attachFile.length > 0 && (
                            <div className="mt-2 mb-3">
                                <div className="grid grid-cols-3 gap-2">
                                    {caseData.attachFile.map((file: File, index: number) => (
                                        <div key={file.name + index} className="relative group">
                                            <img
                                                src={URL.createObjectURL(file)}
                                                alt={`Upload ${index + 1}`}
                                                className="w-full h-20 object-cover rounded border border-gray-600"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}

                <FormFieldValueDisplay caseData={caseData} isCreate={true} />

                {submitButton && (
                    <div className="flex justify-end">
                        <Button onClick={submitButton}>Confirm</Button>
                    </div>
                )}
            </div>
        </Modal>
    )
}

export default PreviewDataBeforeSubmit
