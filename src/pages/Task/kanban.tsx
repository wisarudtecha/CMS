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
import DynamicForm from "../../components/form/dynamic-form/DynamicForm"
import PageMeta from "@/components/common/PageMeta"
import PageBreadcrumb from "@/components/common/PageBreadCrumb"
import { FormField } from "@/components/interface/FormField"
import { DropdownItem } from "@/components/ui/dropdown/DropdownItem"
import { Dropdown } from "@/components/ui/dropdown/Dropdown"
import createCase from "../../utils/json/createCase.json"
import sampleCases from "../../utils/json/sampleCases.json"

interface Case {
    id: string
    title: string
    description?: string
    status?: string
    priority: number
    assignee: string;
    dueDate: string
    comments: number
    category: string
    customer: string
}




const defaultCase: Case = {
    "id": "",
    "title": "",
    "description": "",
    "status": "",
    "priority": 2,
    "assignee": "",
    "dueDate": "",
    "comments": 3,
    "category": "",
    "customer": ""
}

const statusColumns = [
    { id: "new", title: "New" },
    { id: "in-progress", title: "In Progress" },
    { id: "pending", title: "Pending Review" },
    { id: "resolved", title: "Resolved" },
]

const getPriorityColorClass = (priority: number): string => {
    if (priority <= 3) return "bg-red-600"
    if (priority <= 6) return "bg-yellow-600"
    return "bg-green-600"
}

function mapCaseToForm(cases: Case): FormField[] {
    const singleCase: Case = cases;
    const formFields: FormField[] = JSON.parse(JSON.stringify(createCase));
    const mappedFields = formFields.map(field => {
        let newValue: string = field.value;
        switch (field.label) {
            case "Case Title":
                newValue = singleCase.title;
                break;
            case "Description":
                newValue = singleCase.description || "";
                break;
            case "Priority":
                newValue = singleCase.priority.toString();
                break;
            case "Status":
                if (singleCase.status === "new") newValue = "New";
                else if (singleCase.status === "in-progress") newValue = "In-Progress";
                else if (singleCase.status === "pending") newValue = "Pending Review";
                else if (singleCase.status === "resolved") newValue = "Resolved";
                break;
            case "Customer":
                newValue = singleCase.customer;
                break;
            case "Assignee":
                newValue = singleCase.assignee;
                break;
            case "Due Date":
                newValue = singleCase.dueDate;
                break;
        }
        return { ...field, value: newValue };
    });
    return mappedFields;
}

function createAvatarFromString(name: string): string {
    const words = name.trim().split(' ');
    const avatarLetters: string[] = [];
    for (const word of words) {
        if (word.length > 0) {
            avatarLetters.push(word[0]);
        }
    }
    return avatarLetters.join('').toUpperCase();
}

export default function CasesPage() {
    const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban")
    const [selectedStatus, setSelectedStatus] = useState<string | null>(null)
    const [showDynamicForm, setShowDynamicForm] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);
    const [editData, setEditData] = useState(defaultCase);

    const getCasesForColumn = (columnId: string) => {
        return sampleCases.filter((case_) => case_.status === columnId);
    };

    const getFilteredCases = () => {
        if (selectedStatus === null) {
            return sampleCases;
        }
        return sampleCases.filter((case_) => case_.status === selectedStatus);
    };

    const handleFormSubmission = (data: FormField[]) => {
        console.log("Data received from DynamicForm:", data);
        setShowDynamicForm(false);
    };

    const handleFormSubmissionEdit = (data: FormField[]) => {
        console.log("Data received from Edit DynamicForm:", data);
        setShowEditForm(false);
    };
    const handlePopUpEditForm = (case_: Case) => {
        setEditData(case_)
        setShowEditForm(true)
    }


    const CaseCard = ({ case_: caseItem }: { case_: Case }) => {
        const [isOpen, setIsOpen] = useState(false); 

        function toggleDropdown() {
            setIsOpen(!isOpen);
        }

        function closeDropdown() {
            setIsOpen(false);
        }

        return (
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
                        <div className="relative inline-block">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="w-6 h-6 p-0 text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-gray-100 dropdown-toggle"
                                onClick={toggleDropdown} 
                            >
                                <MoreHorizontal className="w-3 h-3" />
                            </Button>
                            <Dropdown
                                isOpen={isOpen} 
                                onClose={closeDropdown} 
                                className="w-40 p-2"
                            >
                                <DropdownItem
                                    onItemClick={() => {
                                        handlePopUpEditForm(caseItem);
                                        closeDropdown();
                                    }}
                                    className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
                                >
                                    Edit
                                </DropdownItem>
                            </Dropdown>
                        </div>
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
                            <span className="text-white text-xs">{createAvatarFromString(caseItem.assignee)}</span>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    const KanbanView = () => (
        <div className="flex space-x-6 overflow-x-auto pb-6">
            {statusColumns.map((column) => (
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
                            {caseItem.status}
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
                            <span className="text-white text-xs">{createAvatarFromString(caseItem.assignee)}</span>
                        </div>
                        <span className="text-sm text-gray-800 dark:text-gray-100">
                            {caseItem.assignee}
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

            <div className="relative p-6">
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
                            className="flex items-center  hover:bg-blue-700 text-white bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
                            onClick={() => {
                                setShowDynamicForm(true);

                            }}
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
                <div className="relative">
                {viewMode === "kanban" ? <KanbanView /> : <ListView />}
      
                
                {showDynamicForm && (
                    <div className=" fixed inset-0 bg-black/70 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg shadow-xl p-4 w-full sm:max-w-lg mx-auto dark:bg-gray-800 overflow-y-auto max-h-[70vh]">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Create New Case</h3>
                            <DynamicForm
                                form={createCase}
                                edit={false}
                                showDynamicForm={setShowDynamicForm}
                                onFormSubmit={handleFormSubmission}
                            />
                        </div>
                    </div>
                )}
                {showEditForm && (

                    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
                        <div className="relative bg-white rounded-lg shadow-xl p-4 w-full sm:max-w-lg mx-auto dark:bg-gray-800 overflow-y-auto max-h-[70vh]">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Edit Case</h3> {/* Changed title to "Edit Case" */}
                            <DynamicForm
                                form={mapCaseToForm(editData)}
                                edit={false}
                                showDynamicForm={setShowEditForm}
                                onFormSubmit={handleFormSubmissionEdit}
                            />

                        </div>
                    </div>
                )}
  </div>
            </div>
        </div>
    )
}