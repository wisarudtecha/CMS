
export interface IndividualFormField {
  id: string;
  label: string;
  type: string;
  value: any;
  options?: string[];
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