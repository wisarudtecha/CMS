import store from "@/store";
import { caseApi, CaseListParams } from "@/store/api/caseApi";
import { customerApi } from "@/store/api/custommerApi";
import { formApi } from "@/store/api/formApi";
import { CaseTypeSubType } from "../interface/CaseType";


export const useFetchCustomers = async () => {
  const customerDataResult = await store.dispatch(
    customerApi.endpoints.getCustommers.initiate({ start: 0, length: 100 })
  );
  localStorage.setItem("customer_data", JSON.stringify(customerDataResult.data?.data))

};

export const useFetchCase = async (params: CaseListParams) => {
  const result = await store.dispatch(
    caseApi.endpoints.getListCase.initiate(params)
  );
  if (result.data?.data) {
    localStorage.setItem("caseList", JSON.stringify(result.data?.data))
  } else {
    localStorage.setItem("caseList", "[]")
  }

};

export const useFetchTypeSubType = async () => {
  const caseTypeSubType = await store.dispatch(
    caseApi.endpoints.postTypeSubType.initiate(null)
  );
  localStorage.setItem("caseTypeSubType", JSON.stringify(caseTypeSubType.data?.data))

};

export const useFetchSubTypeForm = async (subType: string) => {
  const SubTypeForm = await store.dispatch(
    formApi.endpoints.postSubTypeForm.initiate(subType)
  );
  localStorage.setItem("subTypeForm-" + subType, JSON.stringify(SubTypeForm.data?.data))
};

export const useFetchSubTypeAllForm = async () => {
  const typeSubTypeForm = localStorage.getItem("caseTypeSubType");
  if (typeSubTypeForm) {
    const typeSubTypeFormList = JSON.parse(typeSubTypeForm) as CaseTypeSubType[];
    typeSubTypeFormList.forEach(async (item) => {
      const SubTypeForm = await store.dispatch(
        formApi.endpoints.postSubTypeForm.initiate(item.sTypeId)
      );
      localStorage.setItem("subTypeForm-" + item.sTypeId, JSON.stringify(SubTypeForm.data?.data))
    });
  }

};

export const useFetchDeptCommandStations = async () => {
  const result = await store.dispatch(
    caseApi.endpoints.getDeptCommandStations.initiate(null)
  );
  localStorage.setItem("DeptCommandStations_data", JSON.stringify(result.data?.data))

};

export const useFetchCaseStatus = async () => {
  const result = await store.dispatch(
    caseApi.endpoints.getStatus.initiate({ start: 0, length: 100 })
  );
  localStorage.setItem("caseStatus", JSON.stringify(result.data?.data))

};


export const caseApiSetup = () => {
  useFetchCustomers();
  useFetchCase({ start: 0, length: 100 });
  useFetchTypeSubType();
  useFetchDeptCommandStations();
  useFetchCaseStatus();
  useFetchSubTypeAllForm();
}