"use client"

import { useState } from "react"
import {
  MessageCircle,
  Plus,
  List,
  LayoutGrid,
} from "lucide-react"
import Button from "@/components/ui/button/Button"
import Badge from "@/components/ui/badge/Badge"
import PageMeta from "@/components/common/PageMeta"
import PageBreadcrumb from "@/components/common/PageBreadCrumb"
import caseData from "../../utils/json/case.json"
import CaseDetailView from "./case-detail-view"
import { CaseItem } from "@/components/interface/CaseItem"

const statusColumns = [
  { title: "new" },
  { title: "in-progress" },
  { title: "pending" },
  { title: "resolved" },
]

function createAvatarFromString(name: string): string {
  const words = name.trim().split(' ');
  const avatarLetters: string[] = [];
  for (const word of words) {
    if (word.length > 0) avatarLetters.push(word[0]);
  }
  return avatarLetters.join('').toUpperCase();
}

export default function CasesView() {
  const [selectedCase, setSelectedCase] = useState<any>(null)
  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban")
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null)
  const [showDynamicForm, setShowDynamicForm] = useState(false)

  // NEW: filter/sort state
  const [searchText, setSearchText] = useState("")
  const [sortField, setSortField] = useState<"title" | "date">("date")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")

  const getStatusKey = (caseItem: CaseItem): string => {
    if (caseData.new?.some(c => c.id === caseItem.id)) return "new"
    if (caseData.inProgress?.some(c => c.id === caseItem.id)) return "in-progress"
    if (caseData.pendingReview?.some(c => c.id === caseItem.id)) return "pending"
    if (caseData.resolved?.some(c => c.id === caseItem.id)) return "resolved"
    return ""
  }

  const handleCaseClick = (caseItem: CaseItem) => {
    const detailCaseData = {
      id: typeof caseItem.id === "string" ? parseInt(caseItem.id, 10) : caseItem.id,
      title: caseItem.title,
      description: caseItem.description || "",
      date: caseItem.date || "",
      comments: caseItem.comments,
      category: caseItem.category,
      categoryColor: caseItem.categoryColor || "",
      priorityColor: caseItem.priorityColor,
      assignee: typeof caseItem.assignee === "object"
        ? {
            name: caseItem.assignee.name,
            color: caseItem.assignee.color
          }
        : { name: "", color: "" }
    }
    setSelectedCase(detailCaseData)
  }

  const getFilteredCases = () => {
    let allCases: CaseItem[] = []
    if (caseData && typeof caseData === "object") {
      allCases = [
        ...(caseData.new || []),
        ...(caseData.inProgress || []),
        ...(caseData.pendingReview || []),
        ...(caseData.resolved || [])
      ]
    }

    const filtered = allCases.filter(c =>
      c.title.toLowerCase().includes(searchText.toLowerCase())
    )

    return filtered.sort((a, b) => {
      const aVal = a[sortField]
      const bVal = b[sortField]
      if (aVal < bVal) return sortOrder === "asc" ? -1 : 1
      if (aVal > bVal) return sortOrder === "asc" ? 1 : -1
      return 0
    })
  }

  // Modified to use getFilteredCases and then filter by column status
  const getCasesForColumn = (columnId: string) => {
    const filteredCases = getFilteredCases();
    return filteredCases.filter(c => getStatusKey(c) === columnId);
  }

  const CaseCard = ({ caseItem }: { caseItem: CaseItem }) => (
    <div className="space-y-2">
      <div className="text-xs text-gray-500 font-medium"></div>
      <div
        className={`dark:bg-gray-800 bg-white rounded-lg p-4 space-y-3 border-l-4 ${caseItem.priorityColor} hover:bg-gray-750 transition-colors cursor-pointer`}
        onClick={() => handleCaseClick(caseItem)}
      >
        <div className="flex items-start justify-between">
          <h3 className="font-medium dark:text-white text-base leading-tight pr-2 text-gray-700">{caseItem.title}</h3>
        </div>
        <p className="text-sm text-gray-400 leading-relaxed">{caseItem.description}</p>
        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-gray-500 font-medium">{caseItem.date}</span>
          <Badge>Assigned</Badge>
        </div>
      </div>
    </div>
  )

  const KanbanView = () => (
    <div className="flex flex-wrap gap-6 pb-6">
      {statusColumns.map((column) => (
        (selectedStatus === null || selectedStatus === column.title) && (
          <div key={column.title} className="flex-shrink-0 w-80">
            <div className="flex items-center justify-between mb-4 px-2">
              <h3 className="font-medium text-gray-700 dark:text-gray-200">{column.title}</h3>
              <Badge color="primary">{getCasesForColumn(column.title).length}</Badge>
            </div>
            <div className="space-y-3 px-2">
              {getCasesForColumn(column.title).map((caseItem) => (
                <CaseCard key={caseItem.id} caseItem={caseItem} />
              ))}
            </div>
          </div>
        )
      ))}
    </div>
  )

  const ListView = () => (
    <div className="space-y-2">
      <div className="grid grid-cols-12 gap-4 p-3 text-xs font-medium text-gray-500 border-b border-gray-200 dark:border-gray-700 dark:text-gray-400">
        <div className="col-span-4">Case</div>
        <div className="col-span-2">Priority</div>
        <div className="col-span-2">Assignee</div>
        <div className="col-span-2">Due Date</div>
        <div className="col-span-1">Comments</div>
      </div>

      {getFilteredCases().filter(c => selectedStatus === null || getStatusKey(c) === selectedStatus).map((caseItem) => (
        <div
          key={caseItem.id}
          className="grid grid-cols-12 gap-4 p-3 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors dark:bg-gray-800 dark:border-gray-700 dark:hover:border-gray-600 hover:cursor-pointer"
          onClick={() => handleCaseClick(caseItem)}
        >
          <div className="col-span-4">
            <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-1">{caseItem.title}</h4>
            <div className="flex items-center space-x-2">
              <Badge color="primary">{caseItem.category}</Badge>
            </div>
          </div>
          <div className="col-span-2 flex items-center mx-4">
            <div className={`w-2 h-2 rounded-full ${caseItem.priorityColor.replace("border-l-", "bg-")}`} />
          </div>
          <div className="col-span-2 flex items-center space-x-2">
            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center dark:bg-blue-700">
              <span className="text-white text-xs">{createAvatarFromString(caseItem.assignee.name)}</span>
            </div>
            <span className="text-sm text-gray-800 dark:text-gray-100">{caseItem.assignee.name}</span>
          </div>
          <div className="col-span-2 flex items-center space-x-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">{caseItem.date}</span>
          </div>
          <div className="col-span-1 flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400">
            <MessageCircle className="w-3 h-3" />
            <span>{caseItem.comments}</span>
          </div>
        </div>
      ))}
    </div>
  )

  if (showDynamicForm) {
    return <CaseDetailView onBack={() => setShowDynamicForm(false)} caseData={undefined} />
  }

  if (selectedCase) {
    return <CaseDetailView onBack={() => setSelectedCase(null)} caseData={selectedCase} />
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PageMeta title="Cases – TailAdmin Dashboard" description="Manage your support cases" />
      <PageBreadcrumb pageTitle="Cases" />
      <div className="relative p-6">
        <div className="flex flex-col gap-y-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center bg-gray-200 dark:bg-gray-800 rounded-lg p-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode("kanban")}
                  className={
                    viewMode === "kanban"
                      ? "bg-white text-gray-900 shadow dark:bg-gray-700 dark:text-white"
                      : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                  }
                >
                  <LayoutGrid className="w-4 h-4 mr-2" />
                  Kanban
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className={
                    viewMode === "list"
                      ? "bg-white text-gray-900 shadow dark:bg-gray-700 dark:text-white"
                      : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                  }
                >
                  <List className="w-4 h-4 mr-2" />
                  List
                </Button>
              </div>
              {/* ✅ Filter UI */}
              <div className="space-x-2 flex items-center">
                <input
                  type="text"
                  className="px-2 py-1 rounded border text-sm dark:bg-gray-800 dark:text-white"
                  placeholder="Search by title"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                />
                <select
                  className="px-2 py-1 rounded border text-sm dark:bg-gray-800 dark:text-white"
                  value={sortField}
                  onChange={(e) => setSortField(e.target.value as "title" | "date")}
                >
                  <option value="date">Date</option>
                  <option value="title">Title</option>
                </select>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                >
                  {sortOrder === "asc" ? "⬆ Asc" : "⬇ Desc"}
                </Button>
              </div>
            </div>

            <Button
              className="flex items-center hover:bg-blue-700 text-white bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
              onClick={() => setShowDynamicForm(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New Case
            </Button>
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-6">
              <div
                className={`flex items-center space-x-2 cursor-pointer ${selectedStatus === null ? 'font-semibold text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                onClick={() => setSelectedStatus(null)}
              >
                <span className="text-sm">All Cases</span>
                <Badge color="primary">
                  {getFilteredCases().length}
                </Badge>
              </div>
              {statusColumns.map((col) => (
                <div
                  key={col.title}
                  className={`flex items-center space-x-2 cursor-pointer ${selectedStatus === col.title ? 'font-semibold text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                  onClick={() => setSelectedStatus(col.title)}
                >
                  <span className="text-sm">{col.title}</span>
                  <Badge color="primary">{getCasesForColumn(col.title).length}</Badge>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="relative grid h-full">
          {viewMode === "kanban" ? <KanbanView /> : <ListView />}
        </div>
      </div>
    </div>
  )
}