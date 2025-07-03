export interface CaseItem {
  id: number
  title: string
  description: string
  date: string
  comments: number
  category: string
  categoryColor: string
  priorityColor: string
  assignee: {
    name: string
    color: string
  }
}