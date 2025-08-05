import { ApiResponse } from "@/types";
import { baseApi } from "./baseApi";
import { CaseSubType, CaseType, CaseTypeSubType } from "@/components/interface/CaseType";

export interface CreateCase {
    arrivedDate: string;
    caseDetail: string;
    caseDuration: number;
    caseLat: string;
    caseLon: string;
    caseSTypeId: string;
    caseTypeId: string;
    caseVersion: string;
    caselocAddr: string;
    caselocAddrDecs: string;
    closedDate: string;
    commandedDate: string;
    countryId: string;
    createdDate: string;
    deviceId: string;
    distId: string;
    extReceive: string;
    phoneNo: string;
    phoneNoHide: boolean;
    priority: number;
    provId: string;
    receivedDate: string;
    referCaseId: string;
    resDetail: string;
    resId: string;
    source: string;
    startedDate: string;
    statusId: string;
    userarrive: string;
    userclose: string;
    usercommand: string;
    usercreate: string;
    userreceive: string;
    nodeId:string;
}

export interface DepartmentCommandStationData {
  id: string;
  orgId: string;
  deptId: string;
  commId: string;
  stnId: string;
  stationEn: string;
  stationTh: string;
  stationActive: boolean;
  commandEn: string;
  commandTh: string;
  commandActive: boolean;
  deptEn: string;
  deptTh: string;
  deptActive: boolean;
}

export interface DepartmentCommandStationDataMerged extends DepartmentCommandStationData {
  name: string;
}
export const caseApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // Ticket CRUD operations

        getType: builder.query<ApiResponse<CaseType[]>, null>({
            query: () => "/casetypes",
            providesTags: ["Cases"],
        }),

        getSubType: builder.query<ApiResponse<CaseSubType[]>, null>({
            query: () => "/casesubtypes",
            providesTags: ["Cases"],
        }),

        postCreateCase: builder.mutation<ApiResponse<null>, CreateCase>({
            query: (newCase) => ({
                url: "/case/add",
                method: "POST",
                body: newCase,
            }),
            invalidatesTags: ["Cases"],
        }),


        postTypeSubType: builder.query<ApiResponse<CaseTypeSubType[]>, null>({
            query: () => "/casetypes_with_subtype",
            providesTags: ["Cases"],
        }),

        getDeptCommandStations: builder.query<ApiResponse<DepartmentCommandStationData[]>, null>({
            query: () => "/department_command_stations",
            providesTags: ["Dispatch"],
        }),
    }),
});
export const {
    useGetSubTypeQuery,
    useGetTypeQuery,
    usePostCreateCaseMutation,
    usePostTypeSubTypeQuery,
    useGetDeptCommandStationsQuery,
} = caseApi;

