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
import CaseDetailView, { mergeCaseTypeAndSubType } from "../../components/case/CaseDetailView"

import { getPriorityBorderColorClass, getPriorityColorClass } from "@/components/function/Prioriy"
import { Modal } from "@/components/ui/modal"
import DateStringToDateFormat from "@/components/date/DateToString"
import { CaseList } from "@/components/interface/CaseItem"
import { CaseTypeSubType } from "@/components/interface/CaseType"
const caseData = JSON.parse(localStorage.getItem("caseList") ?? "[]") as CaseList[]
const statusColumns = [
  { title: "New", group: ["S001", "S008"] },
  { title: "Assign", group: ["S002", "S009"] },
  { title: "In-progress ", group: ["S003", "S004", "S005", "S006", "S010", "S011", "S012", "S013", "S015", "S019"] },
  { title: "Approve", group: ["S017", "S018"] },
  { title: "Done", group: ["S007", "S016"] },
  { title: "Cancel", group: ["S014"] },
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
  const caseTypeSupTypeData = JSON.parse(localStorage.getItem("caseTypeSubType") ?? "[]") as CaseTypeSubType[]
  const [searchText, setSearchText] = useState("")
  const [sortField] = useState<"title" | "date">("date")
  const [sortOrder] = useState<"asc" | "desc">("asc")
  const [showAdvanceFilter, setShowAdvanceFilter] = useState<boolean>(false)
  const [advancedFilters, setAdvancedFilters] = useState({
    priority: "",
    category: "",
    titleSearch: "", 
    descriptionSearch: "",
    startDate: "",
    endDate: "",
  })

  const allCasesForMeta: CaseList[] = caseData;
  const uniqueCategories = [...new Set(allCasesForMeta.map(c => c.statusId).filter(Boolean))];

  const getStatusKey = (caseItem: CaseList): string => {
    const statusColumn = statusColumns.find(column =>
      column.group.includes((caseItem as any).statusId)
    );

    return statusColumn ? statusColumn.title : "";
  };

  const matchingSubTypesNames = (caseSTypeId: string ,caseTypeSupType: CaseTypeSubType[]): string => {
    const matchingSubType = caseTypeSupType.find(item => item.sTypeId === caseSTypeId

    );
    return matchingSubType ? mergeCaseTypeAndSubType(matchingSubType) : caseSTypeId;
  }
  const handleCaseClick = (caseItem: CaseList) => {

    setSelectedCase(caseItem)
  }
  const handleAdvanceFilterClose = () => {
    setShowAdvanceFilter(false)
  }

  const getFilteredCases = () => {
    let allCases: CaseList[] = []
    if (Array.isArray(caseData)) {
      const mergeWithAssignee = (cases: any[] = []) =>
        cases.map(c => ({
          ...c,
          assignee: c.assignee
            ? c.assignee
            : [{ name: "", color: "" }]
        }));
      allCases = mergeWithAssignee(caseData)
    }

    const filtered = allCases.filter(c => {
      const generalSearchTerm = searchText.toLowerCase()
      const assigneeName = c.createdBy;

      const generalSearchCondition = generalSearchTerm === '' ||
        matchingSubTypesNames(c.caseSTypeId,caseTypeSupTypeData) ||
        c.caseDetail?.toLowerCase().includes(generalSearchTerm) ||
        c.statusId.toLowerCase().includes(generalSearchTerm) ||
        assigneeName.includes(generalSearchTerm) ||
        DateStringToDateFormat(c.createdDate).toLowerCase().includes(generalSearchTerm);

      let priorityCondition = true;
      if (advancedFilters.priority !== '') {
        let isPriorityMatch = false;
        switch (advancedFilters.priority) {
          case "High":
            isPriorityMatch = (c.priority >= 0 && c.priority <= 3);
            break;
          case "Medium":
            isPriorityMatch = (c.priority >= 4 && c.priority <= 6);
            break;
          case "Low":
            isPriorityMatch = (c.priority >= 7 && c.priority <= 9);
            break;
          default:
            isPriorityMatch = true; // No specific priority filter applied
        }
        priorityCondition = isPriorityMatch;
      }

      const categoryCondition = advancedFilters.category === '' || c.statusId === advancedFilters.category;

      const titleSearchCondition =
        advancedFilters.titleSearch === '' ||
        c.caseSTypeId.toLowerCase().includes(advancedFilters.titleSearch.toLowerCase());

      const descriptionSearchCondition =
        advancedFilters.descriptionSearch === '' ||
        c.caseDetail?.toLowerCase().includes(advancedFilters.descriptionSearch.toLowerCase());

      // NEW: Date range filtering logic
      let dateRangeCondition = true;
      if (advancedFilters.startDate !== '' || advancedFilters.endDate !== '') {
        const caseDate = new Date(c.createdDate);
        if (advancedFilters.startDate !== '') {
          const startDate = new Date(advancedFilters.startDate);
          if (caseDate < startDate) {
            dateRangeCondition = false;
          }
        }
        if (advancedFilters.endDate !== '') {
          const endDate = new Date(advancedFilters.endDate);
          if (caseDate > endDate) {
            dateRangeCondition = false;
          }
        }
      }

      return generalSearchCondition && priorityCondition && categoryCondition && titleSearchCondition && descriptionSearchCondition && dateRangeCondition; // Include dateRangeCondition
    })

    return filtered.sort((a, b) => {
      let aVal: string | number = "";
      let bVal: string | number = "";
      if (sortField === "title") {
        aVal = a.caseSTypeId?.toLowerCase() ?? "";
        bVal = b.caseSTypeId?.toLowerCase() ?? "";
      } else if (sortField === "date") {
        aVal = new Date(a.createdDate).getTime();
        bVal = new Date(b.createdDate).getTime();
      }
      if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
      if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
      return 0;
    })
  }

  // Modified to use getFilteredCases and then filter by column status
  const getCasesForColumn = (columnId: string) => {
    const filteredCases = getFilteredCases();
    return filteredCases.filter(c => getStatusKey(c) === columnId);
  }

  const AdvanceFilter: React.FC = () => {
    const [localFilters, setLocalFilters] = useState(advancedFilters);

    const handleApply = () => {
      setAdvancedFilters(localFilters);
      handleAdvanceFilterClose();
    };

    const handleClear = () => {
      setAdvancedFilters({ priority: "", category: "", titleSearch: "", descriptionSearch: "", startDate: "", endDate: "" });
      handleAdvanceFilterClose();
    };

    return (<Modal isOpen={showAdvanceFilter} onClose={handleAdvanceFilterClose} className="max-w-xl p-6">
      <div>
        <h3 className="font-medium dark:text-gray-50 text-xl leading-tight pr-2 text-gray-700 mb-4">Advance Filtering</h3>
        <div className="space-y-4">
          {/* New fields for advanced search */}

          <div>
            <label htmlFor="description-search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Details Search</label>
            <input
              id="description-search"
              type="texts"
              value={localFilters.descriptionSearch}
              onChange={(e) => setLocalFilters({ ...localFilters, descriptionSearch: e.target.value })}
              className="w-full rounded-lg border border-gray-200 bg-transparent py-2 px-3 text-sm text-gray-800 dark:border-gray-800 dark:bg-gray-900 dark:text-white/90"
              placeholder="Search by details..."
            />
          </div>

          <div className="grid grid-cols-2">
            <div className="mr-2">
              <label htmlFor="start-date-search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date</label>
              <input
                id="start-date-search"
                type="datetime-local" // Keep this for precise date/time selection
                value={localFilters.startDate} // Bind to startDate
                onChange={(e) => setLocalFilters({ ...localFilters, startDate: e.target.value })}
                className="dark:[&::-webkit-calendar-picker-indicator]:invert w-full rounded-lg border border-gray-200 bg-transparent py-2 px-3 text-sm text-gray-800 dark:border-gray-800 dark:bg-gray-900 dark:text-white/90"
              />
            </div>
            <div>
              <label htmlFor="end-date-search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Date</label>
              <input
                id="end-date-search"
                type="datetime-local" // Keep this for precise date/time selection
                value={localFilters.endDate} // Bind to endDate
                onChange={(e) => setLocalFilters({ ...localFilters, endDate: e.target.value })}
                className="dark:[&::-webkit-calendar-picker-indicator]:invert w-full rounded-lg border border-gray-200 bg-transparent py-2 px-3 text-sm text-gray-800 dark:border-gray-800 dark:bg-gray-900 dark:text-white/90"
              />
            </div>
          </div>
          <div>
            <label htmlFor="category-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
            <select
              id="category-filter"
              value={localFilters.category}
              onChange={(e) => setLocalFilters({ ...localFilters, category: e.target.value })}
              className="w-full rounded-lg border border-gray-200 bg-transparent py-2 px-3 text-sm text-gray-800 dark:border-gray-800 dark:bg-gray-900 dark:text-white/90"
            >
              <option value="">All Categories</option>
              {uniqueCategories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <div className="mt-6 flex justify-end space-x-3">
          <Button variant="outline" onClick={handleClear}>Clear</Button>
          <Button onClick={handleApply}>Apply Filters</Button>
        </div>
      </div>
    </Modal>)
  }


  const CaseCard = ({ caseItem }: { caseItem: CaseList }) => (
    <div className="space-y-2">
      <div className="text-xs text-gray-500 font-medium"></div>
      <div
        className={`dark:bg-gray-800 bg-white rounded-lg p-4 space-y-3 border-l-4 ${getPriorityBorderColorClass(caseItem.priority)} hover:bg-gray-750 transition-colors cursor-pointer`}
        onClick={() => handleCaseClick(caseItem)}
      >
        <div className="flex items-start justify-between">
          <h3 className="font-medium dark:text-gray-50 text-base leading-tight pr-2 text-gray-700">{matchingSubTypesNames(caseItem.caseSTypeId,caseTypeSupTypeData)}</h3>
        </div>
        <p className="text-sm text-gray-400 leading-relaxed">{caseItem.caseDetail}</p>
        <div className="flex items-center justify-between mb-3 text-xs text-gray-500 dark:text-gray-400">
          {caseItem.createdBy ? (
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center dark:bg-blue-700">
                <span className="text-white text-xs">{createAvatarFromString(caseItem.createdBy)}</span>
              </div>
              <span className="text-sm text-gray-800 dark:text-gray-100">{caseItem.createdBy}</span>
            </div>
          ) : <div></div>}
          <div className="flex items-center space-x-2">
            <MessageCircle className="w-3 h-3" />
            <span>{caseItem.comments ?? 0}</span>
          </div>
        </div>
        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-gray-500 font-medium">{DateStringToDateFormat(caseItem.createdDate)}</span>
          <Badge>
            {
              (() => {
                const status = statusColumns.find(col => col.group.includes(caseItem.statusId));
                return status ? status.title : caseItem.statusId;
              })()
            }
          </Badge>
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
        <div className="col-span-2">Status</div>
        <div className="col-span-2">Priority</div>
        <div className="col-span-2">Assignee</div>
        <div className="col-span-1">Due Date</div>
        <div className="col-span-1">Comments</div>
      </div>

      {getFilteredCases().filter(c => selectedStatus === null || getStatusKey(c) === selectedStatus).map((caseItem) => (
        <div
          key={caseItem.id}
          className="grid grid-cols-12 gap-4 p-3 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors dark:bg-gray-800 dark:border-gray-700 dark:hover:border-gray-600 hover:cursor-pointer"
          onClick={() => handleCaseClick(caseItem)}
        >
          <div className="col-span-4">
            <h4 className="text-sm font-semibold mb-1 text-gray-500 dark:text-gray-400">{matchingSubTypesNames(caseItem.caseSTypeId,caseTypeSupTypeData)}</h4>
            {/* <div className="flex items-center space-x-2">
              <Badge color="primary">{caseItem.category}</Badge>
            </div> */}
          </div>
          <div className="flex col-span-2 items-center space-x-2">
            <Badge color="primary">{caseItem.statusId}</Badge>
          </div>
          <div className="col-span-2 flex items-center mx-4">
            <div className={`w-2 h-2 rounded-full ${getPriorityColorClass(caseItem.priority)}`} />
          </div>
          <div className="col-span-2 flex items-center space-x-2">
            {caseItem.createdBy ? (
              <>
                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center dark:bg-blue-700">
                  <span className="text-white text-xs">{createAvatarFromString(caseItem.createdBy)}</span>
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">{caseItem.createdBy}</span>
              </>
            ) : (
              <div className="ml-4 text-gray-500 dark:text-gray-400">-</div>
            )}
          </div>
          <div className="col-span-1 flex items-center space-x-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">{DateStringToDateFormat(caseItem.createdDate)}</span>
          </div>
          <div className="col-span-1 flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400">
            <MessageCircle className="w-3 h-3" />
            <span>{caseItem?.comments ?? 0}</span>
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
      <div className="relative ">
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
                  className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-200 bg-transparent py-2.5 pl-3 pr-14 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 xl:w-[430px]"
                  placeholder="Search cases..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                />
                {/* <select
                  className="px-2 py-1 rounded border text-sm text-gray-500 dark:text-gray-400 dark:border-gray-800"
                  value={sortField}
                  onChange={(e) => setSortField(e.target.value as "title" | "date")}
                >
                  <option value="date">Date</option>
                  <option value="title">Title</option>
                </select> */}
                <Button variant="outline" onClick={() => { setShowAdvanceFilter(true) }}>
                  Advance Filtering
                </Button>

              </div>
            </div>

            <Button
              className="flex items-center hover:bg-blue-700 text-white bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
              onClick={() => setShowDynamicForm(true)}
              size="sm"
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
      {
        showAdvanceFilter ? <AdvanceFilter></AdvanceFilter> : null
      }
    </div>
  )
}