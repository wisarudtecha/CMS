import {
    Clock,
} from "lucide-react"
import Button from "@/components/ui/button/Button"
import Badge from "@/components/ui/badge/Badge"
import DateStringToDateFormat from "../date/DateToString"
import React from "react"
import { getTextPriority } from "../function/Prioriy"
import FormFieldValueDisplay from "./CaseDisplay"
import { CaseDetails } from "@/types/case"
interface PreviewDataBeforeSubmitProps {
    caseData?: CaseDetails;
    submitButton?: () => void;
}

const PreviewDataBeforeSubmit: React.FC<PreviewDataBeforeSubmitProps> = ({
    caseData,
    submitButton
}) => {
    // const progressSteps = [
    //     { id: 1, title: "Received", completed: true },
    //     { id: 2, title: "Assigned", completed: true },
    //     { id: 3, title: "Acknowledged", completed: false, current: true },
    //     { id: 4, title: "En Route", completed: false },
    //     { id: 5, title: "On Site", completed: false },
    //     { id: 6, title: "Completed", completed: false }
    // ];
    return (
        <div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3">
                <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{caseData?.title}</h2>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>Create Date: {caseData && caseData?.workOrderDate && DateStringToDateFormat(caseData?.workOrderDate)}</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center space-x-2 text-center mt-3 mr-[10%] sm:mt-0">
                    {caseData?.caseType?.priority &&
                        <Badge color={`${getTextPriority(caseData?.caseType?.priority).color}`}>
                            {getTextPriority(caseData?.caseType?.priority).level} Priority
                        </Badge>}
                    {caseData?.status &&
                        <Badge variant="outline" >
                            {caseData?.status}
                        </Badge>}
                </div>
            </div>
            {/* <ProgressStepPreview progressSteps={progressSteps} className="border-t-1 border-b-1 p-2 dark:border-gray-500" /> */}
            {(caseData?.attachFileResult?.length!=0 && caseData ) && (
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
            <FormFieldValueDisplay caseData={caseData} />
            {submitButton &&
                <div className="flex justify-end ">
                    <Button onClick={submitButton}>Confirm</Button>
                </div>
            }
        </div>
    );
};

export default PreviewDataBeforeSubmit