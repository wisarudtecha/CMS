// @refresh reset
import store from "@/store";
import { caseApi, CaseListParams } from "@/store/api/caseApi";
import { customerApi } from "@/store/api/custommerApi";
import { formApi } from "@/store/api/formApi";
import { CaseTypeSubType } from "../../interface/CaseType";
import { areaApi } from "@/store/api/area";
import { unitApi } from "@/store/api/unitApi";
import distIdCommaSeparate from "@/components/profile/profileDistId";

export const fetchCustomers = async () => {
  const customerDataResult = await store.dispatch(
    customerApi.endpoints.getCustommers.initiate({ start: 0, length: 100 })
  );
  localStorage.setItem("customer_data", JSON.stringify(customerDataResult.data?.data));
};

export const fetchUnitStatus = async () => {
  const unitStatusDataResult = await store.dispatch(
    unitApi.endpoints.getUnitStatus.initiate({ start: 0, length: 100 })
  );
  localStorage.setItem("unit_status", JSON.stringify(unitStatusDataResult.data?.data));
};

export const fetchCase = async (params: CaseListParams) => {
  const requestNumber = parseInt(import.meta.env.VITE_GET_CASE_PER_REQUEST || "100", 10);
  if (!requestNumber || typeof requestNumber != "number") {
    return;
  }

  let allData: any[] = [];
  let start = 0;
  let currentPage = 0;
  let totalPages = 0;


  const firstResult = await store.dispatch(
    caseApi.endpoints.getListCase.initiate({
      ...params,
      start: 0,
      length: requestNumber,
      distId: distIdCommaSeparate(),
      orderBy: "priority,createdAt",
      direction: "asc,desc"
    })
  );

  if (firstResult.data?.data) {
    allData = [...firstResult.data.data];
    currentPage = firstResult.data.currentPage || 1;
    totalPages = firstResult.data.totalPage || 0;
  } else {
    localStorage.setItem("caseList", "[]");
    return [];
  }

  // Fetch remaining pages using currentPage
  while (currentPage < totalPages) {
    start = currentPage * requestNumber;
    const result = await store.dispatch(
      caseApi.endpoints.getListCase.initiate({
        ...params,
        start,
        length: requestNumber,
        distId: distIdCommaSeparate(),
        orderBy: "priority,createdAt",
        direction: "asc,desc"
      })
    );

    if (result.data?.data) {
      allData = [...allData, ...result.data.data];
      currentPage = result.data.currentPage || currentPage + 1;
    } else {
      break;
    }
  }

  localStorage.setItem("caseList", JSON.stringify(allData));
  return allData;
};

export const fetchCaseResults = async () => {
  const result = await store.dispatch(
    caseApi.endpoints.getCaseResults.initiate({})
  );
  if (result.data?.data) {
    localStorage.setItem("caseResultsList", JSON.stringify(result.data?.data));
  } else {
    localStorage.setItem("caseResultsList", "[]");
  }
};

export const fetchTypeSubType = async () => {
  const caseTypeSubType = await store.dispatch(
    caseApi.endpoints.postTypeSubType.initiate(null)
  );
  localStorage.setItem("caseTypeSubType", JSON.stringify(caseTypeSubType.data?.data));
};

export const fetchSubTypeForm = async (subType: string) => {
  const SubTypeForm = await store.dispatch(
    formApi.endpoints.postSubTypeForm.initiate(subType)
  );
  localStorage.setItem("subTypeForm-" + subType, JSON.stringify(SubTypeForm.data?.data));
};

export const fetchSubTypeAllForm = async () => {
  const typeSubTypeForm = localStorage.getItem("caseTypeSubType");
  if (typeSubTypeForm) {
    const typeSubTypeFormList = JSON.parse(typeSubTypeForm) as CaseTypeSubType[];


    await Promise.all(
      typeSubTypeFormList.map(async (item) => {
        const SubTypeForm = await store.dispatch(
          formApi.endpoints.postSubTypeForm.initiate(item.sTypeId)
        );
        localStorage.setItem("subTypeForm-" + item.sTypeId, JSON.stringify(SubTypeForm.data?.data));
      })
    );
  }
};

export const fetchDeptCommandStations = async () => {
  const result = await store.dispatch(
    caseApi.endpoints.getDeptCommandStations.initiate(null)
  );
  localStorage.setItem("DeptCommandStations", JSON.stringify(result.data?.data));
};

export const fetchCaseStatus = async () => {
  const result = await store.dispatch(
    caseApi.endpoints.getStatus.initiate({ start: 0, length: 100 })
  );
  localStorage.setItem("caseStatus", JSON.stringify(result.data?.data));
};

export const fetchArea = async () => {
  const result = await store.dispatch(
    areaApi.endpoints.getArea.initiate(null)
  );
  localStorage.setItem("area", JSON.stringify(result.data?.data));
};

export const caseApiSetup = async () => {
  await fetchCase({});
  await fetchTypeSubType();
  await fetchDeptCommandStations();
  await fetchCaseStatus();
  await fetchCaseResults();
  await fetchUnitStatus();
  await fetchArea();
};