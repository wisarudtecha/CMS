import { CaseTypeSubType } from "../interface/CaseType"

export const mergeCaseTypeAndSubType = (data: CaseTypeSubType) => {
    return `${data.th ?? ""}` +
        `${data.sTypeCode ? `-${data.sTypeCode}` : ""}` +
        `${data.subTypeTh ? `_${data.subTypeTh}` : ""}`
}