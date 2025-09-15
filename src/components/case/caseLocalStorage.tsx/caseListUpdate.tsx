// utils/caseUtils.ts
import { store } from '@/store';
import { caseApi } from '@/store/api/caseApi';
import { CaseEntity } from '@/types/case';

export const getNewCaseData = async () => {
    try {

        const result = await store.dispatch(
            caseApi.endpoints.getListCaseMutation.initiate({})
        );

        if ('data' in result && result.data?.data) {
            localStorage.setItem("caseList", JSON.stringify(result.data.data));
            console.log('Case list updated successfully');
        } else if ('error' in result) {
            console.error('Failed to fetch case data:', result.error);
        }
    } catch (error) {
        console.error('Error in getNewCaseData:', error);
    }
};

export const getNewCaseDataByCaseId = async (caseId: string) => {
    try {

        const result = await store.dispatch(
            caseApi.endpoints.getCaseByIdMutation.initiate({ caseId })
        );
        if (result?.data?.data) {
            const caseList = JSON.parse(localStorage.getItem("caseList") ?? "{}") as CaseEntity[];
            const updatedCaseList = caseList.map((item) =>
                item.caseId === caseId
                    ? result.data.data
                    : item
            );
            localStorage.setItem("caseList", JSON.stringify(updatedCaseList))
            console.log('Case list updated successfully');
        } else if ('error' in result) {
            console.error('Failed to fetch case data:', result.error);
        }
    } catch (error) {
        console.error('Error in getNewCaseData:', error);
    }
};


export const clearCaseData = () => {
    localStorage.removeItem("caseList");
};

export const getCachedCaseData = () => {
    const caseList = localStorage.getItem("caseList");
    return caseList ? JSON.parse(caseList) : null;
};