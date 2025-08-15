import { Custommer } from "@/types"
import {  FormField, formType } from "./FormField"
import { DepartmentCommandStationDataMerged } from "@/store/api/caseApi"
import { Area } from "@/store/api/area"
interface assignee{
  name: string
  color: string
}
export interface CaseItem {
  status: string
  priority: number
  createBy: string
  id: number
  title: string
  description: string
  date: string
  comments: number
  category: string
  categoryColor: string
  priorityColor: string
  assignee: assignee[]
  formData?: FormField
  caseType?: formType
  serviceCenter?:DepartmentCommandStationDataMerged
  customerData?:Custommer
  location?:string
  attachFile?:File[]
  requireSchedule?:boolean
  area?:Area
  scheduleDate?:string
  workOrderNummber?:string
  workOrderRef?:string
  workOrderDate?:string
  iotDevice?:string
  iotDate?:string
  attachFileResult?:File[]
}


export interface CaseList {
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
  comments: number;
  sop: string | null;
  currentStage: string | null;
}