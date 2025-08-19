// /src/types/case.ts
import { FormField, formType } from "@/components/interface/FormField";
import { Area } from "@/store/api/area";
import { DepartmentCommandStationDataMerged } from "@/store/api/caseApi";
import { BaseEntity, Custommer } from "@/types";

export interface CaseEntity extends BaseEntity {
  orgId: string;
  caseId: string;
  caseVersion: string;
  referCaseId: string;
  caseTypeId: string;
  caseSTypeId: string;
  priority: number;
  wfId: string;
  versions: string | null;
  source: string;
  deviceId: string;
  phoneNo: string;
  phoneNoHide: boolean;
  caseDetail: string;
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
  commandedDate: string | null;
  receivedDate: string | null;
  arrivedDate: string | null;
  closedDate: string | null;
  usercreate: string;
  usercommand: string;
  userreceive: string;
  userarrive: string;
  userclose: string;
  resId: string | null;
  resDetail: string;
  sop: string | null;
  currentStage: string | null;
}

export interface CaseStatus extends BaseEntity {
  statusId: string;
  th: string;
  en: string;
  color: string;
  active: boolean;
}

export interface CaseStatusQueryParams {
  start?: number;
  length?: number;
}

export interface CaseTypeSubType {
  typeId: string;
  orgId: string;
  en: string;
  th: string;
  active: boolean;
  sTypeId: string;
  sTypeCode: string;
  subTypeEn: string;
  subTypeTh: string;
  wfId: string;
  caseSla: string;
  priority: number;
  userSkillList: string[];
  unitPropLists: string[];
  subTypeActive: boolean;
}

export interface Attachment {
  id: string;
  filename: string;
  size: number;
  type: string;
  uploadedAt: string;
  uploadedBy: string;
}

export interface Comment {
  id: string;
  content: string;
  author: string;
  createdAt: string;
  isInternal: boolean;
}

export interface ProgressStep {
  key: string;
  label: string;
  completed: boolean;
  active: boolean;
  timestamp?: string;
}

export interface TimelineStep {
  id: string;
  label: string;
  description?: string;
  timestamp?: string;
  status: "completed" | "active" | "pending" | "error";
  icon?: React.ComponentType<{ className?: string }>;
  metadata?: Record<string, unknown>;
}

export interface ProgressTimelineProps {
  steps: TimelineStep[];
  orientation?: "horizontal" | "vertical";
  size?: "sm" | "md" | "lg";
  showTimestamps?: boolean;
  showDescriptions?: boolean;
  animated?: boolean;
  className?: string;
  onStepClick?: (step: TimelineStep, index: number) => void;
}



export interface CaseDetails {
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