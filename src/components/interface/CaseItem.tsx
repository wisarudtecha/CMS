import { CustomerData, FormField, formType } from "./FormField"
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
  serviceCenter?:string
  customerData?:CustomerData
  location?:string
  attachFile?:File[]
}