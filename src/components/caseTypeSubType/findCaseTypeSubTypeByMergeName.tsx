import { CaseTypeSubType } from "../interface/CaseType";
import { mergeCaseTypeAndSubType } from "./mergeCaseTypeAndSubType";

export const findCaseTypeSubType = (
    list: CaseTypeSubType[],
    targetKey: string
): CaseTypeSubType | undefined => {
    return list.find(item => mergeCaseTypeAndSubType(item) === targetKey);
};


export const findCaseTypeSubTypeByTypeIdSubTypeId = (
    list: CaseTypeSubType[],
    typeId: string,
    subTypeId:string
): CaseTypeSubType | undefined => {
    return list.find(item => item.sTypeId===subTypeId && item.typeId===typeId);
};
