
export interface IndividualFormField {
  id: string;
  label: string;
  type: string;
  value: any;
  options?: any[];
  newOptionText?: string;
  placeholder?: string;
  required: boolean;
  colSpan?: number; 
}

export interface IndividualFormFieldWithChildren extends IndividualFormField {
  isChild?: boolean;
  GroupColSpan?:number
}

export interface FormFieldWithChildren extends FormField {
  formFieldJson: IndividualFormFieldWithChildren[];
}

export interface FormField {
  formId: string;
  formName: string;
  formColSpan: number; 
  formFieldJson: IndividualFormField[]; 
}

export interface FormSop {
  id: string;
  name: string;
  description: string;
  status: "active" | "inactive" | "draft" | "testing";
  createdAt: string;
  category?: string;
  type?:string;
}
