import { ApiResponse } from "@/types";
import { baseApi } from "./baseApi";
import { CaseSubType, CaseType, CaseTypeSubType } from "@/components/interface/CaseType";
import { PaginationParams } from "./custommerApi";
import { FormFieldWithNode } from "@/components/interface/FormField";

export interface CreateCase {
    formData: FormFieldWithNode;
    customerName: string;
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
    nodeId: string;
    wfId: string;
    versions: string;
    deptId: string,
    commId: string,
    stnId: string,
    caseId: string
    scheduleFlag: true,
    scheduleDate: string,
}

export interface Case {
    id: string;
    orgId: string;
    caseId: string;
    caseVersion: string;
    referCaseId: string | null;
    caseTypeId: string;
    caseSTypeId: string;
    priority: number;
    source: string;
    deviceId: string;
    phoneNo: string;
    phoneNoHide: boolean;
    caseDetail: string | null;
    extReceive: string;
    statusId: string;
    caseLat: string;
    caseLon: string;
    caselocAddr: string;
    caselocAddrDecs: string;
    countryId: string;
    provId: string;
    distId: string;
    caseDuration: number;
    createdDate: string;
    startedDate: string;
    commandedDate: string;
    receivedDate: string;
    arrivedDate: string;
    closedDate: string;
    usercreate: string;
    usercommand: string;
    userreceive: string;
    userarrive: string;
    userclose: string;
    resId: string;
    resDetail: string | null;
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    updatedBy: string;
}

export const mergeDeptCommandStation = (data: DepartmentCommandStationData) => {
    return `${data.deptTh ? `${data.deptTh}` : ""}` +
        `${data.commandTh ? `-${data.commandTh}` : ""}` +
        `${data.stationTh ? `-${data.stationTh}` : ""}`
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

export interface AddComment {
    caseId: string;
    fullMsg: string;
    jsonData: string;
    type: string;
    username: string;
}

interface ApiResponseCreateCase<T> {
  status: string
  msg: string
  data: T
  desc?: string
  caseId?: string
}

export interface CaseStatus {
    id: string;
    statusId: string;
    th: string;
    en: string;
    color: string;
    active: boolean;
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    updatedBy: string;
}

export interface CaseListParams extends PaginationParams {
    detail?: string;
    start_date?: string;
    end_date?: string;
    category?: string;
    caseType?: string;
    caseSType?: string;
}

export interface CaseHistory {
    id: number;
    orgId: string;
    caseId: string;
    username: string;
    type: string;
    fullMsg: string;
    jsonData: any;
    createdAt: string;
    createdBy: string;
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

        postCreateCase: builder.mutation<ApiResponseCreateCase<null>, CreateCase>({
            query: (newCase) => ({
                url: "/case/add",
                method: "POST",
                body: newCase,
            }),
            invalidatesTags: ["Cases"],
        }),


        patchUpdateCase: builder.mutation<ApiResponse<null>, { caseId: string; updateCase: CreateCase }>({
            query: ({ caseId, updateCase }) => ({
                url: `/case/${caseId}`,
                method: "PATCH",
                body: updateCase,
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

        getListCase: builder.query<ApiResponse<Case[]>, CaseListParams>({
            query: (params) => ({
                url: "/case",
                params,
            }),
            providesTags: ["Cases"],
        }),

        getStatus: builder.query<ApiResponse<CaseStatus[]>, PaginationParams>({
            query: (params) => ({
                url: "/case_status",
                params,
            }),
            providesTags: ["Cases"],
        }),

        getCaseHistory: builder.query<ApiResponse<CaseHistory[]>, { caseId: string }>({
            query: (params) => ({
                url: `/case_history/${params.caseId}`,
            }),
            providesTags: ["Cases"],
        }),

        postAddCaseHistory: builder.mutation<ApiResponse<null>, AddComment>({
            query: (params) => ({
                url: `/case_history/add`,
                method: 'POST', 
                body: params
            }),
            invalidatesTags: ["Cases"],
        }),
    }),
});
export const {
    useGetSubTypeQuery,
    useGetTypeQuery,
    usePostCreateCaseMutation,
    usePatchUpdateCaseMutation,
    usePostTypeSubTypeQuery,
    useGetDeptCommandStationsQuery,
    useGetListCaseQuery,
    useGetCaseHistoryQuery,
    usePostAddCaseHistoryMutation
} = caseApi;

