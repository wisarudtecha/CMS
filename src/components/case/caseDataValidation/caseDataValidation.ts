import { CaseDetails } from "@/types/case";


export const validateCaseForSubmission = (caseState: CaseDetails | undefined): string => {
    if (!caseState) {
        return "Case data is not available.";
    }
    if (!caseState.caseType?.caseType) {
        return "Please select a Case Type.";
    }
    if (!caseState.description?.trim()) {
        return "Please enter Case Details.";
    }
    if (!caseState.customerData?.contractMethod?.name?.trim()) {
        return "Please select a Contact Method.";
    }

    return "";
};


export const validateCaseForDraft = (caseState: CaseDetails | undefined): string => {
    if (!caseState?.caseType?.caseType) {
        return "Please select a Service Type to save a draft.";
    }
    return "";
};
