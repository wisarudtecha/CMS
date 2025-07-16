
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
  status: "active" | "inactive" | "draft" ;
  createdAt: string;
  type:string;
  createBy:string
  description:string;
}

export interface formType extends FormField {
  caseType:string
}

export interface CustomerData {
  customerName: string;
  contractMethod: "Email" | "Chat" | "Iot Alert" | "Phone Number" | "";
  phoneNumber?: number;
  email?: string; 
}