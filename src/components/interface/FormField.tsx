export interface FormField {
  id: string;
  label: string;
  type: string;
  value: any; 
  options?: string[];
  newOptionText?: string;
  required:boolean;
}
