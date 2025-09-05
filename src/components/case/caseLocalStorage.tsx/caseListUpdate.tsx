// utils/caseUtils.ts
import { store } from '@/store';
import { caseApi } from '@/store/api/caseApi';

export const getNewCaseData = async () => {
  try {
    // Use the store's dispatch method directly
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

// You can also create other case-related utilities here
export const clearCaseData = () => {
  localStorage.removeItem("caseList");
};

export const getCachedCaseData = () => {
  const caseList = localStorage.getItem("caseList");
  return caseList ? JSON.parse(caseList) : null;
};