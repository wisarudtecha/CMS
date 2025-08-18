import store from "@/store";
import { caseApi, CaseListParams } from "@/store/api/caseApi";
import { customerApi } from "@/store/api/custommerApi";
import { formApi } from "@/store/api/formApi";
import { CaseTypeSubType } from "../interface/CaseType";
import { areaApi } from "@/store/api/area";

export const useFetchCustomers = async () => {
  try {
    const customerDataResult = await store.dispatch(
      customerApi.endpoints.getCustommers.initiate({ start: 0, length: 100 })
    );
    
    // Wait for the promise to resolve
    const data = await customerDataResult;
    
    if (data?.data?.data) {
      localStorage.setItem("customer_data", JSON.stringify(data.data.data));
    }
    
    return data;
  } catch (error) {
    console.error("Error fetching customers:", error);
    throw error;
  }
};

export const useFetchCase = async (params: CaseListParams) => {
  try {
    const result = await store.dispatch(
      caseApi.endpoints.getListCase.initiate(params)
    );
    
    const data = await result;
    
    if (data?.data?.data) {
      localStorage.setItem("caseList", JSON.stringify(data.data.data));
    } else {
      localStorage.setItem("caseList", "[]");
    }
    
    return data;
  } catch (error) {
    console.error("Error fetching cases:", error);
    localStorage.setItem("caseList", "[]");
    throw error;
  }
};

export const useFetchTypeSubType = async () => {
  try {
    const caseTypeSubType = await store.dispatch(
      caseApi.endpoints.postTypeSubType.initiate(null)
    );
    
    const data = await caseTypeSubType;
    
    if (data?.data?.data) {
      localStorage.setItem("caseTypeSubType", JSON.stringify(data.data.data));
    }
    
    return data;
  } catch (error) {
    console.error("Error fetching type subtype:", error);
    throw error;
  }
};

export const useFetchSubTypeForm = async (subType: string) => {
  try {
    const SubTypeForm = await store.dispatch(
      formApi.endpoints.postSubTypeForm.initiate(subType)
    );
    
    const data = await SubTypeForm;
    
    if (data?.data?.data) {
      localStorage.setItem("subTypeForm-" + subType, JSON.stringify(data.data.data));
    }
    
    return data;
  } catch (error) {
    console.error(`Error fetching subtype form for ${subType}:`, error);
    throw error;
  }
};

export const useFetchSubTypeAllForm = async () => {
  const typeSubTypeForm = localStorage.getItem("caseTypeSubType");
  if (typeSubTypeForm) {
    try {
      const typeSubTypeFormList = JSON.parse(typeSubTypeForm) as CaseTypeSubType[];
      
      // Wait for all form fetches to complete
      const promises = typeSubTypeFormList.map(async (item) => {
        return useFetchSubTypeForm(item.sTypeId);
      });
      
      await Promise.all(promises);
    } catch (error) {
      console.error("Error fetching all subtype forms:", error);
      throw error;
    }
  }
};

export const useFetchDeptCommandStations = async () => {
  try {
    const result = await store.dispatch(
      caseApi.endpoints.getDeptCommandStations.initiate(null)
    );
    
    const data = await result;
    
    if (data?.data?.data) {
      localStorage.setItem("DeptCommandStations_data", JSON.stringify(data.data.data));
    }
    
    return data;
  } catch (error) {
    console.error("Error fetching dept command stations:", error);
    throw error;
  }
};

export const useFetchCaseStatus = async () => {
  try {
    const result = await store.dispatch(
      caseApi.endpoints.getStatus.initiate({ start: 0, length: 100 })
    );
    
    const data = await result;
    
    if (data?.data?.data) {
      localStorage.setItem("caseStatus", JSON.stringify(data.data.data));
    }
    
    return data;
  } catch (error) {
    console.error("Error fetching case status:", error);
    throw error;
  }
};

export const useFetchArea = async () => {
  try {
    const result = await store.dispatch(
      areaApi.endpoints.getArea.initiate(null)
    );
    
    const data = await result;
    
    if (data?.data?.data) {
      localStorage.setItem("area", JSON.stringify(data.data.data));
    }
    
    return data;
  } catch (error) {
    console.error("Error fetching area:", error);
    throw error;
  }
};

export const caseApiSetup = async () => {
  try {
    console.log("Starting API setup...");
    
    // Execute in sequence to ensure proper loading order
    await useFetchCustomers();
    console.log("✓ Customers loaded");
    
    await useFetchCase({ start: 0, length: 100 });
    console.log("✓ Cases loaded");
    
    await useFetchTypeSubType();
    console.log("✓ Type/SubType loaded");
    
    await useFetchDeptCommandStations();
    console.log("✓ Dept Command Stations loaded");
    
    await useFetchCaseStatus();
    console.log("✓ Case Status loaded");
    
    await useFetchArea();
    console.log("✓ Area loaded");
    
    // Load subtype forms after type/subtype data is available
    await useFetchSubTypeAllForm();
    console.log("✓ All SubType Forms loaded");
    
    console.log("API setup completed successfully!");
  } catch (error) {
    console.error("Error during API setup:", error);
    throw error;
  }
};