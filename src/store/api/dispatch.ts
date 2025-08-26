import { ApiResponse } from "@/types";
import { baseApi } from "./baseApi";
export interface Commands {
    id: string;
    deptId: string;
    orgId: string;
    commId: string;
    en: string;
    th: string;
    active: boolean;
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    updatedBy: string;
}

export interface Department {
    id: string;
    deptId: string;
    orgId: string;
    en: string;
    th: string;
    active: boolean;
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    updatedBy: string;
}


export interface Station {
    id: string;
    orgId: string;
    deptId: string;
    commId: string;
    stnId: string;
    en: string;
    th: string;
    active: boolean;
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    updatedBy: string;
}

export interface ServiceCenter {
    department: Department
    station:Station
    command:Commands
    name:string
}

export interface CaseSopParams {
    caseId: string;
}

export interface SopNodeData {
  data: {
    description: string;
    label: string;
    config?: {
      action: string;
      formId: string;
      pic?: string;
      group?: string;
      sla: string;
      condition?: string;
    };
  };
  id: string;
  position: {
    x: number;
    y: number;
  };
  type: string;
}

export interface CurrentStage {
  caseId: string;
  nodeId: string;
  versions: string;
  type: string;
  section: string;
  data: SopNodeData;
  pic: string;
  group: string | null;
  formId: string;
}

export interface CaselocAddr {
  number: string;
  building: string;
  road: string;
  sub_district: string;
  district: string;
  province: string;
  postal_code: string;
  country: string;
}


export interface CaseSop {
  id: string;
  orgId: string;
  caseId: string;
  caseVersion: string;
  referCaseId: string | null;
  caseTypeId: string;
  caseSTypeId: string;
  priority: number;
  wfId: string;
  versions: string;
  source: string;
  deviceId: string;
  phoneNo: string;
  phoneNoHide: boolean;
  caseDetail: string | null;
  extReceive: string;
  statusId: string;
  caseLat: string;
  caseLon: string;
  caselocAddr: string | CaselocAddr;
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
  sop: any[];
  currentStage: CurrentStage;
  dispatchStage: any;
  nextStage: any;
  referCaseLists:string[];
}

export interface Unit {
  orgId: string;
  unitId: string;
  unitName: string;
  unitSourceId: string;
  unitTypeId: string;
  priority: number;
  compId: string;
  deptId: string;
  commId: string;
  stnId: string;
  plateNo: string;
  provinceCode: string;
  active: boolean;
  username: string;
  isLogin: boolean;
  isFreeze: boolean;
  isOutArea: boolean;
  locLat: number;
  locLon: number;
  locAlt: number;
  locBearing: number;
  locSpeed: number;
  locProvider: number;
  locGpsTime: string;
  locSatellites: number;
  locAccuracy: number;
  locLastUpdateTime: string;
  breakDuration: number;
  healthChk: string;
  healthChkTime: string;
  sttId: string;
  createdBy: string;
  updatedBy: string;
}

interface PaginationParams {
    start?: number;
    length?: number;
}

export interface dispatchInterface {
    caseId:string
    nodeId:string,
    status:string,
    unitId:string,
    unitUser:string
}

export const dispantchApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({

        getCommands: builder.query<ApiResponse<Commands[]>, PaginationParams>({
            query: (params) => ({
                url: "/commands",
                params, 
            }),
            providesTags: ["Dispatch"], 
        }),

        getDepartment: builder.query<ApiResponse<Department[]>, PaginationParams>({
            query: (params) => ({
                url: "/departments",
                params, 
            }),
            providesTags: ["Dispatch"], 
        }),

        getStations: builder.query<ApiResponse<Station[]>, PaginationParams>({
            query: (params) => ({
                url: "/stations",
                params,
            }),
            providesTags: ["Dispatch"],
        }),

        getCaseSop: builder.query<ApiResponse<CaseSop>, CaseSopParams>({
            query: (params) => ({
                url: `/dispatch/${params.caseId}/SOP`,
            }),
            providesTags: ["Dispatch"],
        }),

        getUnit: builder.query<ApiResponse<Unit[]>, {caseId:string}>({
            query: (params) => ({
                url: `/dispatch/${params.caseId}/units`,
            }),
            providesTags: ["Dispatch"],
        }),

        postDispacth: builder.query<ApiResponse<null>, dispatchInterface>({
            query: (params) => ({
                url: `/dispatch/event`,
                method: "POST",
                body: params
            }),
            providesTags: ["Dispatch"],
        }),
        
        postDispacthMutation: builder.mutation<ApiResponse<null>, dispatchInterface>({
            query: (params) => ({
                url: `/dispatch/event`,
                method: "POST",
                body: params
            }),
        }),

        getSopUnitMutation: builder.mutation<ApiResponse<null>, {caseId:string,unitId:string}>({
            query: (params) => ({
                url: `/dispatch/${params.caseId}/SOP/unit/${params.unitId}`,
                method: "POST",
                body: params
            }),
        }),

        getSopUnitQuery: builder.query<ApiResponse<null>, {caseId:string,unitId:string}>({
            query: (params) => ({
                url: `/dispatch/${params.caseId}/SOP/unit/${params.unitId}`,
                method: "POST",
                body: params
            }),
        })
    }),
});

export const {
    useGetCommandsQuery,
    useGetDepartmentQuery,
    useGetStationsQuery, 
    useGetCaseSopQuery,
    useGetUnitQuery,
    usePostDispacthQuery,
    usePostDispacthMutationMutation,
    useGetSopUnitMutationMutation,
    useGetSopUnitQueryQuery
} = dispantchApi;

