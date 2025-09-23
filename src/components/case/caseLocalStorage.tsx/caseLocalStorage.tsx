import { dispatchInterface } from "@/store/api/dispatch";
import { CaseEntity } from "@/types/case";


export const dispatchUpdateLocate = (dispatch: dispatchInterface) => {
    const caseListJSON = localStorage.getItem('caseList');
    const caseList = caseListJSON ? JSON.parse(caseListJSON) as CaseEntity[] : [];

    if (caseListJSON) {
        const updateCaseList = caseList.map((items) => {
            if (items.caseId === dispatch.caseId) {
                return { ...items, statusId: dispatch.status };
            }
            return items; 
        });
        
        localStorage.setItem('caseList', JSON.stringify(updateCaseList));
    }
}

export default dispatchUpdateLocate;