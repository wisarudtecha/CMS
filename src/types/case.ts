// /src/types/case.ts
import { FormField, formType } from "@/components/interface/FormField";
import { Area } from "@/store/api/area";
import type { DepartmentCommandStationDataMerged } from "@/store/api/caseApi";
import type { BaseEntity, Custommer, sourceInterface } from "@/types";
import type { Properties } from "@/types/unit";
import type { EnhancedSkill } from "@/types/user";
import type { Workflow } from "@/types/workflow";
import { CaseSop, DeviceMetaData } from "./dispatch";

export interface Attachment {
    id: number;
    orgId: string;
    caseId: string;
    type: string;
    attId: string;
    attName: string;
    attUrl: string;
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    updatedBy: string;
}

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
  caseLocAddr: string;
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
  caseSla:number;
  attachments:Attachment[]
}

export interface CaseHistory {
  id: number | string;
  orgId: string;
  caseId: string;
  username: string;
  type: string;
  fullMsg: string;
  jsonData?: Record<string, string> | string;
  createdAt: string | Date;
  createdBy: string;
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

export interface CaseTypeManagementProps {
  analytics?: Record<string, TypeAnalytics>;
  caseSubTypes?: EnhancedCaseSubType[];
  caseTypes?: EnhancedCaseType[];
  className?: string;
  filteredTypes?: EnhancedCaseType[];
  properties?: Properties[];
  searchQuery?: string;
  showInactive?: boolean;
  skills?: EnhancedSkill[];
  workflows?: Workflow[];
  handleSTypeDelete?: (id: number) => void;
  handleSTypeReset?: () => void;
  handleTypeDelete?: (id: number) => void;
  handleTypeReset?: () => void;
  setSearchQuery?: React.Dispatch<React.SetStateAction<string>>;
  setCaseSla?: (sla: string) => void;
  setMDeviceType?: (deviceType: string) => void;
  setMWorkOrderType?: (workOrderType: string) => void;
  setPriority?: (priority: string) => void;
  setSTypeCode?: (code: string) => void;
  setSTypeEn?: (en: string) => void;
  setSTypeId?: (id: string) => void;
  setSTypeIsOpen?: (isOpen: boolean) => void;
  setSTypeTh?: (th: string) => void;
  setSTypeTypeId?: (typeId: string) => void;
  setTypeEn?: (th: string) => void;
  setTypeId?: (id: string) => void;
  setTypeIsOpen?: (isOpen: boolean) => void;
  setTypeTh?: (en: string) => void;
  setUnitPropLists?: (propId: string[]) => void;
  setUserSkillList?: (skillId: string[]) => void;
  setWfId?: (wfId: string) => void;
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

export interface Comment {
  id: string;
  content: string;
  author: string;
  createdAt: string;
  isInternal: boolean;
}

export interface AutomationRule {
  id: string;
  trigger: string;
  condition: string;
  action: string;
  enabled: boolean;
}

export interface SkillRequirement {
  skillId: string;
  level: number;
  required: boolean;
}

export interface ResourceRequirement {
  resourceId: string;
  quantity: number;
  duration: number;
}

export interface ApprovalStep {
  id: string;
  role: string;
  required: boolean;
  order: number;
}

export interface EnhancedCaseSubType {
  id: string;
  typeId: string;
  sTypeId: string;
  sTypeCode: string;
  orgId: string;
  en: string;
  th: string;
  wfId: string;
  caseSla: string;
  priority: string;
  userSkillList: string[];
  unitPropLists: string[];
  active: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  mDeviceType: string;
  mWorkOrderType: string;
  // Enhanced fields
  automationRules?: AutomationRule[];
  skillRequirements?: SkillRequirement[];
  resourceRequirements?: ResourceRequirement[];
  approvalWorkflow?: ApprovalStep[];
  costCenters?: string[];
  estimatedDuration?: number;
  complexity?: "low" | "medium" | "high" | "critical";
}

export interface CaseSubTypesCreateData {
  active: boolean;
  caseSla: string;
  en: string;
  priority: string;
  sTypeCode: string;
  th: string;
  typeId: string;
  unitPropLists: string[];
  userSkillList: string[];
  wfId: string;
  mDeviceType: string;
  mWorkOrderType: string;
}

export interface CaseSubTypesUpdateData {
  active: boolean;
  caseSla: string;
  en: string;
  priority: string;
  sTypeCode: string;
  th: string;
  typeId: string;
  unitPropLists: string[];
  userSkillList: string[];
  wfId: string;
  mDeviceType: string;
  mWorkOrderType: string;
}

export interface CaseSubTypesQueryParams {
  start: number;
  length: number;
}

export interface EscalationRule {
  id: string;
  condition: string;
  action: string;
  delay: number;
  recipient: string;
}

export interface CustomFieldDefinition {
  id: string;
  name: string;
  type: "text" | "number" | "select" | "multiselect" | "date" | "boolean";
  required: boolean;
  options?: string[];
  validation?: string;
}

export interface EnhancedCaseType {
  id: string;
  typeId: string;
  orgId: string;
  en: string;
  th: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  // Enhanced fields
  icon?: string;
  color?: string;
  category?: string;
  departmentRestrictions?: string[];
  escalationRules?: EscalationRule[];
  customFields?: CustomFieldDefinition[];
  templates?: {
    description?: string;
    requiredFields?: string[];
    attachmentTypes?: string[];
  };
  parentTypeId?: string;
  level?: number;
  sortOrder?: number;
}

export interface CaseTypesCreateData {
  active: boolean;
  en: string;
  th: string;
}

export interface CaseTypesUpdateData {
  active: boolean;
  en: string;
  th: string;
}

export interface CaseTypesQueryParams {
  start: number;
  length: number;
}

export interface ProgressStep {
  key: string;
  label: string;
  completed: boolean;
  active: boolean;
  timestamp?: string;
}

export interface TimelineStep {
  id?: string;
  label?: string;
  description?: string;
  timestamp?: string;
  status: "completed" | "active" | "pending" | "error";
  icon?: React.ComponentType<{ className?: string }>;
  metadata?: Record<string, unknown>;
  sop?: CaseSop;
  caseStatus?: CaseStatus[];
}

export interface ProgressTimelineProps {
  steps: TimelineStep[];
  orientation?: "horizontal" | "vertical";
  size?: "sm" | "md" | "lg";
  showTimestamps?: boolean;
  showDescriptions?: boolean;
  showSLA?: boolean;
  animated?: boolean;
  className?: string;
  onStepClick?: (step: TimelineStep, index: number) => void;
}

export interface TypeAnalytics {
  usageCount: number;
  averageResolutionTime: number;
  slaCompliance: number;
  resourceUtilization: number;
  efficiency: number;
  lastUsed: string;
}

export type FileItem = File | Attachment;

export interface CaseDetails {
  status: string
  priority: number
  createBy: string
  id: number
  title: string
  description: string
  date: string
  category: string
  formData?: FormField
  caseType?: formType
  serviceCenter?: DepartmentCommandStationDataMerged
  customerData?: Custommer
  location?: string
  attachFile?: FileItem[]
  requireSchedule?: boolean
  area?: Area
  scheduleDate?: string
  workOrderNummber?: string
  source?:sourceInterface
  workOrderRef?: string
  workOrderDate?: string
  iotDevice?: string
  iotDate?: string
  attachFileResult?: FileItem[]
  updateBy?: string
  lastUpdate?: string
  deviceMetaData?: DeviceMetaData
  resultDetail?: string
  resultId?: string
}

export interface caseResults {
  id: string;
  orgId: string;
  resId: string;
  en: string;
  th: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}
