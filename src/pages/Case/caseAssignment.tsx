"use client"

import { useMemo, useState } from "react"
import {
  Plus,
  List,
  LayoutGrid,
  Filter,
} from "lucide-react"
import Button from "@/components/ui/button/Button"
import Badge from "@/components/ui/badge/Badge"
import PageMeta from "@/components/common/PageMeta"
import PageBreadcrumb from "@/components/common/PageBreadCrumb"
import CaseDetailView from "../../components/case/CaseDetailView"

import { getPriorityBorderColorClass, getPriorityColorClass, getTextPriority } from "@/components/function/Prioriy"
import { Modal } from "@/components/ui/modal"
import DateStringToDateFormat from "@/components/date/DateToString"

import { CaseTypeSubType } from "@/components/interface/CaseType"
import { mergeCaseTypeAndSubType } from "@/components/caseTypeSubType/mergeCaseTypeAndSubType"
import { useFetchCase } from "@/components/case/CaseApiManager"
import { SearchableSelect } from "@/components/SearchSelectInput/SearchSelectInput"
import { caseStatus, statusIdToStatusTitle } from "@/components/ui/status/status"
import { CaseEntity } from "@/types/case"

const statusColumns = caseStatus

function createAvatarFromString(name: string): string {
  const words = name.trim().split(' ');
  const avatarLetters: string[] = [];
  for (const word of words) {
    if (word.length > 0) avatarLetters.push(word[0]);
  }
  return avatarLetters.join('').toUpperCase();
}

export default function CasesView() {
  const [selectedCase, setSelectedCase] = useState<CaseEntity | null>(null)
  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban")
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null)
  const [showDynamicForm, setShowDynamicForm] = useState(false)
  const caseTypeSupTypeData = JSON.parse(localStorage.getItem("caseTypeSubType") ?? "[]") as CaseTypeSubType[]
  const [searchText, setSearchText] = useState("")
  const [sortField] = useState<"title" | "date">("date")
  const [sortOrder] = useState<"asc" | "desc">("asc")
  const [showAdvanceFilter, setShowAdvanceFilter] = useState<boolean>(false)
  const allowedStatusIds = statusColumns.flatMap(col => col.group);

  const [caseData, setCaseData] = useState<CaseEntity[]>(() => {
    const savedCases = localStorage.getItem("caseList");
    return savedCases
      ? (JSON.parse(savedCases) as CaseEntity[]).filter(c => allowedStatusIds.includes(c.statusId)).sort((a, b) => {
        if (a.priority !== b.priority) {
          return a.priority - b.priority;
        } return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }) : [];
  });

  const [advancedFilters, setAdvancedFilters] = useState({
    priority: "",
    category: "",
    titleSearch: "",
    descriptionSearch: "",
    startDate: "",
    endDate: "",
    caseType: "",
    caseSubtype: "",
  })

  const uniqueCategories = statusColumns.map(col => col.title);

  const getStatusKey = (caseItem: CaseEntity): string => {
    const statusColumn = statusColumns.find(column =>
      column.group.includes((caseItem as any).statusId)
    );
    return statusColumn ? statusColumn.title : "";
  };

  const matchingSubTypesNames = (caseTypeId: string, caseSTypeId: string, caseTypeSupType: CaseTypeSubType[]): string => {
    const matchingSubType = caseTypeSupType.find(item => item.typeId === caseTypeId || item.sTypeId === caseSTypeId);
    return matchingSubType ? mergeCaseTypeAndSubType(matchingSubType) : "Unknow";
  }

  const handleCaseClick = (caseItem: CaseEntity) => {
    setSelectedCase(caseItem)
  }

  const handleAdvanceFilterClose = () => {
    setShowAdvanceFilter(false)
  }

  // Refactored to remove advanced filtering logic, which is now handled by the API
  const getFilteredCases = () => {
    let allCases: CaseEntity[] = caseData.map(c => ({
      ...c,
      assignee: c.createdBy ? c.createdBy : [{ name: "", color: "" }]
    }));

    const filtered = allCases.filter(c => {
      const generalSearchTerm = searchText.toLowerCase()
      if (generalSearchTerm === '') return true;

      const assigneeName = c.createdBy;

      // General search condition remains on the client side for instant feedback
      return (
        matchingSubTypesNames(c.caseTypeId, c.caseSTypeId, caseTypeSupTypeData).toLowerCase().includes(generalSearchTerm) ||
        c.caseDetail?.toLowerCase().includes(generalSearchTerm) ||
        c.statusId.toLowerCase().includes(generalSearchTerm) ||
        c.caseId.toLocaleLowerCase().includes(generalSearchTerm) ||
        assigneeName.toLowerCase().includes(generalSearchTerm) ||
        DateStringToDateFormat(c.createdAt as string).toLowerCase().includes(generalSearchTerm)
      );
    });
    
    return filtered.sort((a, b) => {
      let aVal: string | number = "";
      let bVal: string | number = "";
      if (sortField === "title") {
        aVal = a.caseSTypeId?.toLowerCase() ?? "";
        bVal = b.caseSTypeId?.toLowerCase() ?? "";
      } else if (sortField === "date") {
        aVal = new Date(a.createdAt).getTime();
        bVal = new Date(b.createdAt).getTime();
      }
      if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
      if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }

  const getCasesForColumn = (columnId: string) => {
    return getFilteredCases()
      .filter(c => getStatusKey(c) === columnId)
      .sort((a, b) => {
        if (a.priority !== b.priority) {
          return a.priority - b.priority;
        }
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      });
  }


  // AdvanceFilter component now triggers the API call
  const AdvanceFilter: React.FC = () => {
    const [localFilters, setLocalFilters] = useState(advancedFilters);
    const handleApply = async () => {
      setAdvancedFilters(localFilters);
      // const category = statusColumns.find(col => col.title === localFilters.category)?.group[0] || "";
      await useFetchCase({
        caseType: localFilters.caseType ?? undefined,
        caseSType: localFilters.caseSubtype ?? undefined,
        detail: localFilters.descriptionSearch,
        start_date: localFilters.startDate ? new Date(localFilters.startDate).toISOString() : undefined,
        end_date: localFilters.endDate ? new Date(localFilters.endDate).toISOString() : undefined,
      });
      if (localFilters.category !== "") {
        setSelectedStatus(localFilters.category);
      } else {
        setSelectedStatus(null);
      }
      const updatedCases = JSON.parse(localStorage.getItem("caseList") ?? "[]");
      setCaseData(updatedCases);
      handleAdvanceFilterClose();
    };

    const handleCaseTypeChange = (label: string) => {
      const selectedCaseTypes = caseTypeSupTypeData.find(item => mergeCaseTypeAndSubType(item) === label);

      setLocalFilters(prev => ({
        ...prev,
        caseSubtype: selectedCaseTypes?.sTypeId || "",
        caseType: selectedCaseTypes?.typeId || ""
      }));

    };

    const handleClear = async () => {
      const clearedFilters = {
        priority: "",
        category: "",
        titleSearch: "",
        descriptionSearch: "",
        startDate: "",
        endDate: "",
        caseType: "",
        caseSubtype: ""
      };
      setAdvancedFilters(clearedFilters);
      setSelectedStatus(null)
      await useFetchCase({ start: 0, length: 100 });
      const updatedCases = JSON.parse(localStorage.getItem("caseList") ?? "[]");
      setCaseData(updatedCases);
      handleAdvanceFilterClose();
    };

    const caseTypeOptions = useMemo(() => {
      if (!caseTypeSupTypeData?.length) return [];
      return caseTypeSupTypeData.map(item =>
        mergeCaseTypeAndSubType(item)
      );
    }, [caseTypeSupTypeData]);


    return (<Modal isOpen={showAdvanceFilter} onClose={handleAdvanceFilterClose} className="max-w-xl p-6">
      <div>
        <h3 className="font-medium dark:text-gray-50 text-xl leading-tight pr-2 text-gray-700 mb-4">Advance Filtering</h3>
        <div className="space-y-4">
          <div>
            <label htmlFor="description-search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Case Type</label>
            <SearchableSelect
              options={caseTypeOptions}
              value={
                (() => {
                  const found = caseTypeSupTypeData.find(item => item.typeId === localFilters.caseType || item.sTypeId === localFilters.caseSubtype);
                  return found ? mergeCaseTypeAndSubType(found) : "";
                })()
              }
              onChange={(e) => handleCaseTypeChange(e)}
              className="w-full  border-gray-200 bg-transparent   text-sm text-gray-800 dark:border-gray-800 dark:bg-gray-900 dark:text-white/90"
              placeholder="Search by Case Type..."
            />
          </div>
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
                type="datetime-local"
                value={localFilters.startDate}
                onChange={(e) => setLocalFilters({ ...localFilters, startDate: e.target.value })}
                className="dark:[&::-webkit-calendar-picker-indicator]:invert w-full rounded-lg border border-gray-200 bg-transparent py-2 px-3 text-sm text-gray-800 dark:border-gray-800 dark:bg-gray-900 dark:text-white/90"
              />
            </div>
            <div>
              <label htmlFor="end-date-search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Date</label>
              <input
                id="end-date-search"
                type="datetime-local"
                value={localFilters.endDate}
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
  // ... Rest of the component remains the same (CaseCard, KanbanView, ListView, JSX return)
  // No changes are needed below this line for the requested refactoring.

  const CaseCard = ({ caseItem }: { caseItem: CaseEntity }) => (
    <div className="space-y-2">
      <div className="text-xs text-gray-500 font-medium"></div>
      <div
        className={`dark:bg-gray-800 bg-white rounded-lg p-4 space-y-3 border-l-4 ${getPriorityBorderColorClass(caseItem.priority)} hover:bg-gray-750 transition-colors cursor-pointer`}
        onClick={() => handleCaseClick(caseItem)}
      >
        <div className="flex items-start justify-between">
          <h3 className="font-medium dark:text-gray-50 text-base leading-tight pr-2 text-gray-700">{matchingSubTypesNames(caseItem.caseTypeId, caseItem.caseSTypeId, caseTypeSupTypeData)}</h3>
        </div>
        <p className="text-sm text-gray-400 leading-relaxed">{caseItem.caselocAddr}</p>
        <div className="flex items-center justify-between mb-3 text-xs text-gray-500 dark:text-gray-400">
          {caseItem.createdBy ? (
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center dark:bg-blue-700">
                <span className="text-white text-xs">{createAvatarFromString(caseItem.createdBy)}</span>
              </div>
              <span className="text-sm text-gray-800 dark:text-gray-100">{caseItem.createdBy}</span>
            </div>
          ) : <div></div>}
          {/* <div className="flex items-center space-x-2">
            <MessageCircle className="w-3 h-3" />
            <span>{caseItem.comments ?? 0}</span>
          </div> */}
        </div>
        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-gray-500 font-medium">{DateStringToDateFormat(caseItem.createdAt as string)}</span>
          <Badge>
            {
              statusIdToStatusTitle(caseItem.statusId)
            }
          </Badge>
        </div>

      </div>
    </div>
  )

  const KanbanView = () => {
    if (selectedStatus) {
      const filteredCases = getCasesForColumn(selectedStatus);
      return (
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-6">
            {filteredCases.map((caseItem) => (
              <CaseCard key={caseItem.id} caseItem={caseItem} />
            ))}
          </div>
        </div>
      );
    }

    return (<div className="flex flex-wrap gap-6 pb-6">
      {statusColumns.map((column) => (
        (selectedStatus === null || selectedStatus === column.title) && (
          <div key={column.title} className="flex-shrink-0 w-70">
            {!selectedStatus && <div className="flex items-center justify-between mb-4 px-2">
              <h3 className="font-medium text-gray-700 dark:text-gray-200">{column.title}</h3>
              <Badge color="primary">{getCasesForColumn(column.title).length}</Badge>
            </div>}
            <div className="space-y-3 px-2 md:overflow-y-auto md:h-150  custom-scrollbar ">
              {getCasesForColumn(column.title).map((caseItem) => (
                <CaseCard key={caseItem.id} caseItem={caseItem} />
              ))}
            </div>
          </div>
        )
      ))}
    </div>)
  }

  const ListView = () => (
    <div className="space-y-3 ">
      {/* Desktop Header - Hidden on mobile */}
      <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider bg-gray-50 border border-gray-200 rounded-lg dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-300">
        <div className="col-span-3">Case Type</div>
        <div className="col-span-2">Location</div>
        <div className="col-span-2">Status</div>
        <div className="col-span-2">Priority</div>
        <div className="col-span-2">Assignee</div>
        <div className="col-span-1">Create Date</div>
      </div>

      {/* Cases */}
      <div className="space-y-2">
        {getFilteredCases()
          .filter(c => selectedStatus === null || getStatusKey(c) === selectedStatus)
          .sort((a, b) => {
            if (a.priority !== b.priority) {
              return a.priority - b.priority;
            }
            return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          })
          .map((caseItem) => (
            <div
              key={caseItem.id}
              className="group bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-200 cursor-pointer dark:bg-gray-800 dark:border-gray-700 dark:hover:border-gray-600 dark:hover:shadow-lg"
              onClick={() => handleCaseClick(caseItem)}
            >
              {/* Desktop Layout */}
              <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-4">
                {/* Case Type */}
                <div className="col-span-3 flex items-center">
                  <div className="flex items-center space-x-3">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {matchingSubTypesNames(caseItem.caseTypeId, caseItem.caseSTypeId, caseTypeSupTypeData)}
                      </h4>
                    </div>
                  </div>
                </div>

                {/* Location */}
                <div className="col-span-2 flex items-center">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600 dark:text-gray-300 ">
                      {caseItem.caselocAddr || 'No location'}
                    </span>
                  </div>
                </div>

                {/* Status */}
                <div className="col-span-2 flex items-center">
                  <Badge
                    color="primary"
                    className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                  >
                    {statusIdToStatusTitle(caseItem.statusId)}
                  </Badge>
                </div>

                {/* Priority */}
                <div className="col-span-2 flex items-center">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${getPriorityColorClass(caseItem.priority)} shadow-sm`} />
                    <span className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                      Priority {getTextPriority(caseItem.priority).level}
                    </span>
                  </div>
                </div>

                {/* Assignee */}
                <div className="col-span-2 flex items-center">
                  {caseItem.createdBy ? (
                    <div className="flex items-center space-x-2">
                      <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-sm dark:from-blue-600 dark:to-blue-700">
                        <span className="text-white text-xs font-semibold">
                          {createAvatarFromString(caseItem.createdBy)}
                        </span>
                      </div>
                      <span className="text-sm text-gray-700 dark:text-gray-300 font-medium truncate">
                        {caseItem.createdBy}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2 text-gray-400 dark:text-gray-500">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center dark:bg-gray-700">
                        <span className="text-gray-400 text-xs">?</span>
                      </div>
                      <span className="text-sm">Unassigned</span>
                    </div>
                  )}
                </div>

                {/* Date */}
                <div className="col-span-1 flex items-center">
                  <div className="flex items-center space-x-1">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      {DateStringToDateFormat(caseItem.createdAt as string)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Mobile Layout */}
              <div className="md:hidden p-4 space-y-3">
                {/* Mobile Header Row */}
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                      {matchingSubTypesNames(caseItem.caseTypeId, caseItem.caseSTypeId, caseTypeSupTypeData)}
                    </h4>
                    <div className="flex items-center space-x-2 mt-1">
                      <div className={`w-2 h-2 rounded-full ${getPriorityColorClass(caseItem.priority)} shadow-sm`} />
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {getTextPriority(caseItem.priority).level} Priority
                      </span>
                    </div>
                  </div>
                  <Badge
                    color="primary"
                    className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                  >
                    {statusIdToStatusTitle(caseItem.statusId)}
                  </Badge>
                </div>

                {/* Mobile Location Row */}
                {caseItem.caselocAddr && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                    <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="truncate">{caseItem.caselocAddr}</span>
                  </div>
                )}

                {/* Mobile Bottom Row */}
                <div className="flex items-center justify-between">
                  {/* Assignee */}
                  <div className="flex items-center space-x-2">
                    {caseItem.createdBy ? (
                      <>
                        <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-sm dark:from-blue-600 dark:to-blue-700">
                          <span className="text-white text-xs font-semibold">
                            {createAvatarFromString(caseItem.createdBy)}
                          </span>
                        </div>
                        <span className="text-xs text-gray-600 dark:text-gray-300 font-medium truncate max-w-[100px]">
                          {caseItem.createdBy}
                        </span>
                      </>
                    ) : (
                      <div className="flex items-center space-x-2 text-gray-400 dark:text-gray-500">
                        <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center dark:bg-gray-700">
                          <span className="text-gray-400 text-xs">?</span>
                        </div>
                        <span className="text-xs">Unassigned</span>
                      </div>
                    )}
                  </div>

                  {/* Date */}
                  <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>{DateStringToDateFormat(caseItem.createdAt as string)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
      </div>

      {/* Empty State */}
      {getFilteredCases().filter(c => selectedStatus === null || getStatusKey(c) === selectedStatus).length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
          <svg className="w-12 h-12 mb-4 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-lg font-medium mb-1">No cases found</h3>
          <p className="text-sm text-center px-4">Try adjusting your filters or create a new case.</p>
        </div>
      )}
    </div>
  );

  const onBackDynamic = () => {
    setShowDynamicForm(false)
    const savedCases = localStorage.getItem("caseList");
    setCaseData(savedCases
      ? (JSON.parse(savedCases) as CaseEntity[]).filter(c => allowedStatusIds.includes(c.statusId))
      : [])
  }

  const onBackSelectedCase = () => {
    setSelectedCase(null)
    const savedCases = localStorage.getItem("caseList");
    setCaseData(savedCases
      ? (JSON.parse(savedCases) as CaseEntity[]).filter(c => allowedStatusIds.includes(c.statusId))
      : [])
  }

  if (showDynamicForm) {
    return <CaseDetailView onBack={onBackDynamic} />
  }

  if (selectedCase) {
    return <CaseDetailView onBack={onBackSelectedCase} caseData={selectedCase} />
  }

  return (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
    <PageMeta title="Cases – TailAdmin Dashboard" description="Manage your support cases" />
    <PageBreadcrumb pageTitle="Cases" />
    <div className="relative px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-y-4 mb-6">
        {/* Top Section - Mobile Responsive */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Left Side - View Mode & Search */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full lg:w-auto">
            {/* View Mode Buttons */}
            <div className="flex items-center bg-gray-200 dark:bg-gray-800 rounded-lg p-1 w-full sm:w-auto">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode("kanban")}
                className={`flex-1 sm:flex-none ${
                  viewMode === "kanban"
                    ? "bg-white text-gray-900 shadow dark:bg-gray-700 dark:text-white"
                    : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                }`}
              >
                <LayoutGrid className="w-4 h-4 mr-2" />
                Kanban
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode("list")}
                className={`flex-1 sm:flex-none ${
                  viewMode === "list"
                    ? "bg-white text-gray-900 shadow dark:bg-gray-700 dark:text-white"
                    : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                }`}
              >
                <List className="w-4 h-4 mr-2" />
                List
              </Button>
            </div>

            {/* Search & Filter */}
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <input
                type="text"
                className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-200 bg-transparent py-2.5 pl-3 pr-3 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 sm:w-[300px] lg:w-[430px]"
                placeholder="Search cases..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
              <Button 
                variant="outline" 
                onClick={() => { setShowAdvanceFilter(true) }}
                className="w-full sm:w-auto whitespace-nowrap"
                size="sm"
              >
                <Filter className="w-4 h-4 mr-2 sm:mr-1" />
                <span className="sm:hidden">Advanced Filters</span>
                <span className="hidden sm:inline">Advance Filtering</span>
              </Button>
            </div>
          </div>

          {/* Add New Case Button */}
          <Button
            className="flex items-center justify-center hover:bg-blue-700 text-white bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 w-full sm:w-auto"
            onClick={() => setShowDynamicForm(true)}
            size="sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Case
          </Button>
        </div>

        {/* Status Filter Tabs - Mobile Responsive */}
        <div className="w-full overflow-x-auto custom-scrollbar">
          <div className="flex items-center space-x-3 sm:space-x-6 min-w-max pb-2">
            <div
              className={`flex items-center space-x-2 cursor-pointer whitespace-nowrap ${
                selectedStatus === null 
                  ? 'font-semibold text-blue-600 dark:text-blue-400' 
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
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
                className={`flex items-center space-x-2 cursor-pointer whitespace-nowrap ${
                  selectedStatus === col.title 
                    ? 'font-semibold text-blue-600 dark:text-blue-400' 
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
                onClick={() => setSelectedStatus(col.title)}
              >
                <span className="text-sm">{col.title}</span>
                <Badge color="primary">{getCasesForColumn(col.title).length}</Badge>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="relative w-full h-full">
        {viewMode === "kanban" ? <KanbanView /> : <ListView />}
      </div>
    </div>

    {/* Advanced Filter Modal */}
    {showAdvanceFilter && <AdvanceFilter />}
  </div>
);
}