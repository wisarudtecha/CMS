import { CaseTypeSubType } from "../interface/CaseType";
import { mergeCaseTypeAndSubType } from "./mergeCaseTypeAndSubType";

export const findCaseTypeSubType = (
    list: CaseTypeSubType[],
    targetKey: string
): CaseTypeSubType | undefined => {
    return list.find(item => mergeCaseTypeAndSubType(item) === targetKey);
};
