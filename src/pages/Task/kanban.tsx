"use client"

import { useState } from "react"
import {
    Calendar,
    MessageCircle,
    Plus,
    Filter,
    MoreHorizontal,
    List,
    LayoutGrid,
} from "lucide-react"
import Button from "@/components/ui/button/Button"
import Badge from "@/components/ui/badge/Badge"

import PageMeta from "@/components/common/PageMeta"
import PageBreadcrumb from "@/components/common/PageBreadCrumb"

interface Case {
    id: string
    title: string
    description?: string
    status: "new" | "in-progress" | "pending" | "resolved"
    priority: number
    assignee: { name: string; avatar: string }
    dueDate: string
    comments: number
    category: string
    customer: string
}

const sampleCases: Case[] = [
  {
    "id": "1",
    "title": "Customer login issues with mobile app",
    "description": "Multiple customers reporting authentication failures on iOS devices",
    "status": "new",
    "priority": 2,  
    "assignee": { "name": "Sarah Chen", "avatar": "SC" },
    "dueDate": "Tomorrow",
    "comments": 3,
    "category": "Technical",
    "customer": "Mobile Users"
  },
  {
    "id": "2",
    "title": "Billing discrepancy for enterprise account",
    "status": "new",
    "priority": 5, 
    "assignee": { "name": "Mike Johnson", "avatar": "MJ" },
    "dueDate": "Jan 15, 2024",
    "comments": 1,
    "category": "Billing",
    "customer": "Acme Corp"
  },
  {
    "id": "3",
    "title": "Feature request: Dark mode support",
    "description": "Customer requesting dark theme option for better accessibility",
    "status": "new",
    "priority": 8, 
    "assignee": { "name": "Alex Rivera", "avatar": "AR" },
    "dueDate": "Jan 20, 2024",
    "comments": 5,
    "category": "Feature",
    "customer": "Design Team"
  },
  {
    "id": "4",
    "title": "Integration setup for Salesforce",
    "status": "in-progress",
    "priority": 1, 
    "assignee": { "name": "Emma Davis", "avatar": "ED" },
    "dueDate": "Today",
    "comments": 8,
    "category": "Integration",
    "customer": "Enterprise Client"
  },
  {
    "id": "5",
    "title": "Performance optimization for dashboard",
    "status": "in-progress",
    "priority": 4, 
    "assignee": { "name": "Tom Wilson", "avatar": "TW" },
    "dueDate": "Feb 1, 2024",
    "comments": 12,
    "category": "Performance",
    "customer": "Internal"
  },
  {
    "id": "6",
    "title": "Email notification system upgrade",
    "status": "pending",
    "priority": 6, 
    "assignee": { "name": "Lisa Park", "avatar": "LP" },
    "dueDate": "Jan 25, 2024",
    "comments": 4,
    "category": "System",
    "customer": "All Users"
  },
  {
    "id": "7",
    "title": "Security audit compliance review",
    "status": "pending",
    "priority": 3, 
    "assignee": { "name": "David Kim", "avatar": "DK" },
    "dueDate": "Tomorrow",
    "comments": 2,
    "category": "Security",
    "customer": "Compliance Team"
  },
  {
    "id": "8",
    "title": "Customer onboarding flow improvement",
    "status": "resolved",
    "priority": 7, 
    "assignee": { "name": "Rachel Green", "avatar": "RG" },
    "dueDate": "Jan 10, 2024",
    "comments": 15,
    "category": "UX",
    "customer": "New Users"
  },
  {
    "id": "9",
    "title": "API rate limiting implementation",
    "status": "resolved",
    "priority": 2, 
    "assignee": { "name": "Chris Brown", "avatar": "CB" },
    "dueDate": "Jan 8, 2024",
    "comments": 6,
    "category": "API",
    "customer": "Developers"
  }
]

const statusColumns = [
    { id: "new", title: "New"},
    { id: "in-progress", title: "In Progress"},
    { id: "pending", title: "Pending Review" },
    { id: "resolved", title: "Resolved"},
]

const getPriorityColorClass = (priority: number): string => {
    if (priority <= 3) return "bg-red-600"
    if (priority <= 6) return "bg-yellow-600"
    return "bg-green-600"
}

export default function CasesPage() {
    const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban")
    const [selectedStatus, setSelectedStatus] = useState<string | null>(null)

    // This function now returns cases based on the selectedStatus
    // if no specific status is selected, it returns all cases for the given column ID.
    const getCasesForColumn = (columnId: string) => {
        return sampleCases.filter((case_) => case_.status === columnId);
    };

    const getFilteredCases = () => {
        if (selectedStatus === null) {
            return sampleCases;
        }
        return sampleCases.filter((case_) => case_.status === selectedStatus);
    };

    const CaseCard = ({ case_: caseItem }: { case_: Case }) => (
        <div className="rounded-lg p-4 mb-3 border border-gray-200 hover:border-gray-300 shadow-sm
                    dark:bg-gray-800 dark:border-gray-700 dark:hover:border-gray-600 transition-colors">
            <div className="flex items-start justify-between mb-2">
                <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-100 line-clamp-2">
                    {caseItem.title}
                </h4>
                <div className="flex items-center space-x-1">
                    <div
                        className={`w-2 h-2 rounded-full ${getPriorityColorClass(
                            caseItem.priority
                        )}`}
                    ></div>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="w-6 h-6 p-0 text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-gray-100"
                    >
                        <MoreHorizontal className="w-3 h-3" />
                    </Button>
                </div>
            </div>

            {caseItem.description && (
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                    {caseItem.description}
                </p>
            )}

            <div className="flex items-center justify-between mb-3 text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center space-x-2">
                    <Calendar className="w-3 h-3" />
                    <span>{caseItem.dueDate}</span>
                </div>
                <div className="flex items-center space-x-2">
                    <MessageCircle className="w-3 h-3" />
                    <span>{caseItem.comments}</span>
                </div>
            </div>

            <div className="flex items-center justify-between">
                <Badge color="primary">{caseItem.category}</Badge>
                <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                        {caseItem.customer}
                    </span>
                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center dark:bg-blue-700">
                        <span className="text-white text-xs">{caseItem.assignee.avatar}</span>
                    </div>
                </div>
            </div>
        </div>
    )

    const KanbanView = () => (
        <div className="flex space-x-6 overflow-x-auto pb-6">
            {statusColumns.map((column) => (
                // Conditionally render the column based on selectedStatus
                (selectedStatus === null || selectedStatus === column.id) && (
                    <div key={column.id} className="flex-shrink-0 w-80">
                        <div className="flex items-center justify-between mb-4 px-2">
                            <h3 className="font-medium text-gray-700 dark:text-gray-200">{column.title}</h3>
                            <Badge color="primary">{getCasesForColumn(column.id).length}</Badge>
                        </div>
                        <div className="space-y-3 px-2">
                            {getCasesForColumn(column.id).map((caseItem) => (
                                <CaseCard key={caseItem.id} case_={caseItem} />
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
                <div className="col-span-2">Status</div>
                <div className="col-span-2">Priority</div>
                <div className="col-span-2">Assignee</div>
                <div className="col-span-1">Due Date</div>
                <div className="col-span-1">Comments</div>
            </div>

            {getFilteredCases().map((caseItem) => (
                <div
                    key={caseItem.id}
                    className="grid grid-cols-12 gap-4 p-3 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors
                     dark:bg-gray-800 dark:border-gray-700 dark:hover:border-gray-600"
                >
                    <div className="col-span-4">
                        <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-1">
                            {caseItem.title}
                        </h4>
                        <div className="flex items-center space-x-2">
                            <Badge color="primary">{caseItem.category}</Badge>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                {caseItem.customer}
                            </span>
                        </div>
                    </div>
                    <div className="col-span-2">
                        <Badge color="primary">
                            {caseItem.status.replace("-", " ")}
                        </Badge>
                    </div>
                    <div className="col-span-2 flex items-center space-x-2">
                        <div
                            className={`w-2 h-2 rounded-full ${getPriorityColorClass(
                                caseItem.priority
                            )}`}
                        ></div>
                        <span className="text-sm text-gray-800 dark:text-gray-100">{caseItem.priority}</span>
                    </div>
                    <div className="col-span-2 flex items-center space-x-2">
                        <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center dark:bg-blue-700">
                            <span className="text-white text-xs">{caseItem.assignee.avatar}</span>
                        </div>
                        <span className="text-sm text-gray-800 dark:text-gray-100">
                            {caseItem.assignee.name}
                        </span>
                    </div>
                    <div className="col-span-1">
                        <span className="text-sm text-gray-500 dark:text-gray-400">{caseItem.dueDate}</span>
                    </div>
                    <div className="col-span-1 flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400">
                        <MessageCircle className="w-3 h-3" />
                        <span>{caseItem.comments}</span>
                    </div>
                </div>
            ))}
        </div>
    )

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <PageMeta
                title="Cases – TailAdmin Dashboard"
                description="Manage your support cases"
            />
            <PageBreadcrumb pageTitle="Cases" />

            <div className="p-6">
                <div className="flex flex-col gap-y-4 mb-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="flex items-center bg-gray-200 dark:bg-gray-800 rounded-lg p-1 ">
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
                            <Button
                                variant="ghost"
                                className="flex items-center text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                            >
                                <Filter className="w-4 h-4 mr-2" />
                                Filter & Sort
                            </Button>
                        </div>
                        <Button
                            variant="ghost"
                            className="flex items-center bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-700 dark:hover:bg-blue-600"
                            onClick={() => { }}
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
                                <Badge color="primary">{sampleCases.length}</Badge>
                            </div>
                            {statusColumns.map((col) => (
                                <div
                                    key={col.id}
                                    className={`flex items-center space-x-2 cursor-pointer ${selectedStatus === col.id ? 'font-semibold text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                                    onClick={() => setSelectedStatus(col.id)}
                                >
                                    <span className="text-sm">{col.title}</span>
                                    <Badge color="primary">
                                        {sampleCases.filter((case_) => case_.status === col.id).length}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {viewMode === "kanban" ? <KanbanView /> : <ListView />}
            </div>
        </div>
    )
}