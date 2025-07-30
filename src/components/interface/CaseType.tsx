
export interface CaseType {
    id: string;
    typeId: string;
    orgId: string;
    en: string;
    th: string;
    active: boolean;
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    updatedBy: string;
}


export interface CaseSubType {
    id: string;
    typeId: string;
    sTypeId: string;
    sTypeCode: string;
    orgId: string;
    en: string;
    th: string;
    wfId: string;
    caseSla: string;
    priority: string;
    userSkillList: string[];
    unitPropLists: string[];
    active: boolean;
    createdAt: string; // use `Date` if you want to parse the timestamp
    updatedAt: string;
    createdBy: string;
    updatedBy: string;
}


export interface CaseTypeSubType  {
    CaseTypeid: string;
    CaseSubTypeid : string
    typeId: string;
    orgId: string;
    en: string; // {en-type} - {for each en-subtype}
    th: string; // {th-type} - {for each th-subtype}
    activeType: boolean;
    wfId: string;
    caseSla: string;
    priority: string;
    userSkillList: string[];
    unitPropLists: string[];
    activeSubType: boolean;
}



