import { CaseTypeSubType } from "./CaseType";

export interface IndividualFormField {
  id: string;
  label: string;
  showLabel?:boolean;
  type: string;
  value: any;
  enableSearch?:boolean
  options?: any[];
  placeholder?: string;
  required: boolean;
  colSpan?: number;
  isChild?: boolean;
  GroupColSpan?: number;
  DynamicFieldColSpan?: number;
  formRule?:FormRule
}

export interface FormRule {
  maxLength?: number;
  minLength?: number;
  contain?: string;
  maxnumber?: number;
  minnumber?: number;
  validEmailFormat?: boolean;
  maxSelections?: number;
  minSelections?: number;
  maxFileSize?: number;
  allowedFileTypes?: string[];
  allowedCountries?: string[];
  hasUppercase?: boolean;
  hasLowercase?: boolean;
  hasNumber?: boolean;
  hasSpecialChar?: boolean;
  noWhitespace?: boolean;
  minDate?: string;
  maxDate?: string;
  minLocalDate?:string
  maxLocalDate?:string
  futureDateOnly?: boolean;
  pastDateOnly?: boolean;
  minFiles?: number;
  maxFiles?: number;
}

export interface IndividualFormFieldWithChildren extends IndividualFormField {
  value: any | IndividualFormFieldWithChildren[];
  options?: Array<any | { value: string; form: IndividualFormFieldWithChildren[] }>;
}

export interface FormField {
  formId: string;
  formName: string;
  formColSpan: number;
  formFieldJson: IndividualFormField[];
}

export interface FormFieldWithNode extends FormField {
  versions: string;
  nextNodeId: string;
  wfId:string;
}

export interface FormFieldWithChildren extends FormField {
  formFieldJson: IndividualFormFieldWithChildren[];
}

export interface FormConfigItem {
  formType: string;
  title: string;
  options?: any[];
  canBeChild?: boolean;
  property?:string[];
}


export interface FormManager extends FormField {
  active:boolean;
  publish:boolean;
  versions: string;
  createdAt: string;
  type:string;
  createdBy:string
}

export interface formType  extends CaseTypeSubType {
  formField : FormFieldWithNode
  caseType:string
}

export interface CustomerData {
  customerName: string;
  contractMethod: "Email" | "Chat" | "Iot Alert" | "Phone Number" | "";
  phoneNumber?: number;
  email?: string; 
}