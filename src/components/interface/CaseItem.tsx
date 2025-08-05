import { Custommer } from "@/types"
import {  FormField, formType } from "./FormField"
import { DepartmentCommandStationDataMerged } from "@/store/api/caseApi"
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
}