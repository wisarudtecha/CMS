"use client"

import { useEffect, useMemo, useState } from "react"
import {
  Plus,
  List,
  LayoutGrid,
  Filter,
  RefreshCcw,
} from "lucide-react"
import Button from "@/components/ui/button/Button"
import Badge from "@/components/ui/badge/Badge"
import PageMeta from "@/components/common/PageMeta"
import PageBreadcrumb from "@/components/common/PageBreadCrumb"
// import CaseDetailView from "../../components/case/main/CaseDetailView"

import { getPriorityBorderColorClass, getPriorityColorClass, getTextPriority } from "@/components/function/Prioriy"
import { Modal } from "@/components/ui/modal"
import DateStringToDateFormat, { DateStringToAgoFormat } from "@/components/date/DateToString"

import { CaseTypeSubType } from "@/components/interface/CaseType"
import { mergeCaseTypeAndSubType } from "@/components/caseTypeSubType/mergeCaseTypeAndSubType"
import { useFetchCase } from "@/components/case/uitls/CaseApiManager"
import { SearchableSelect } from "@/components/SearchSelectInput/SearchSelectInput"
import { caseStatusGroup, CaseStatusInterface, statusIdToStatusTitle } from "@/components/ui/status/status"
import { CaseEntity } from "@/types/case"
import { useNavigate } from "react-router"
import { getNewCaseData } from "@/components/case/caseLocalStorage.tsx/caseListUpdate"
import { useTranslation } from "@/hooks/useTranslation"

const statusColumns = caseStatusGroup.filter((item) => {
  return item.show === true;
});

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
  // const [showDynamicForm, setShowDynamicForm] = useState(false)
  const caseTypeSupTypeData = JSON.parse(localStorage.getItem("caseTypeSubType") ?? "[]") as CaseTypeSubType[]
  const caseStatus = JSON.parse(localStorage.getItem("caseStatus") ?? "[]") as CaseStatusInterface[]
  const [searchText, setSearchText] = useState("")
  const [sortField] = useState<"title" | "date">("date")
  const [sortOrder] = useState<"asc" | "desc">("asc")
  const [showAdvanceFilter, setShowAdvanceFilter] = useState<boolean>(false)
  const allowedStatusIds = statusColumns.flatMap(col => col.group);
  const navigate = useNavigate()
  const [caseData, setCaseData] = useState<CaseEntity[]>(() => {
    const savedCases = localStorage.getItem("caseList");
    return savedCases
      ? (JSON.parse(savedCases) as CaseEntity[]).filter(c => allowedStatusIds.includes(c.statusId)) : [];
  });
  const { t, language } = useTranslation();
  const [advancedFilters, setAdvancedFilters] = useState({
    priority: "",
    category: "",
    titleSearch: "",
    descriptionSearch: "",
    startDate: "",
    endDate: "",
    caseType: "",
    caseSubtype: "",
    createBy: "",
  })
  const uniqueCategories = statusColumns.map(col => language === "th" ? col.title.th : col.title.en);

  const getStatusKey = (caseItem: CaseEntity): string => {
    const statusColumn = statusColumns.find(column =>
      column.group.includes((caseItem as any).statusId)
    );
    if (language === "th") {
      return statusColumn ? statusColumn.title.th : "";
    } else {
      return statusColumn ? statusColumn.title.en : "";
    }
  };

  const matchingSubTypesNames = (caseTypeId: string, caseSTypeId: string, caseTypeSupType: CaseTypeSubType[]): string => {
    const matchingSubType = caseTypeSupType.find(item => item.typeId === caseTypeId && item.sTypeId === caseSTypeId);
    return matchingSubType ? mergeCaseTypeAndSubType(matchingSubType, language) : "Unknow";
  }



  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {

      if (e.key === 'caseList' && e.newValue) {
        console.log('Case list updated in localStorage');
        try {
          const updatedCases = JSON.parse(e.newValue) as CaseEntity[];
          const filteredCases = updatedCases.filter(c => allowedStatusIds.includes(c.statusId));
          setCaseData(filteredCases);
          console.log('Local case data refreshed from storage event');
        } catch (error) {
          console.error('Failed to parse updated case list:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [allowedStatusIds]);

  const handleCaseClick = (caseItem: CaseEntity) => {
    setSelectedCase(caseItem)
  }

  const handleAdvanceFilterClose = () => {
    setShowAdvanceFilter(false)
  }
  const handleClear = async () => {
    const clearedFilters = {
      priority: "",
      category: "",
      titleSearch: "",
      descriptionSearch: "",
      startDate: "",
      endDate: "",
      caseType: "",
      caseSubtype: "",
      createBy: ""
    };
    setAdvancedFilters(clearedFilters);
    setSelectedStatus(null)
    await getNewCaseData();
    const updatedCases = (JSON.parse(localStorage.getItem("caseList") ?? "[]") as CaseEntity[]).filter(c => allowedStatusIds.includes(c.statusId));
    setCaseData(updatedCases);
    handleAdvanceFilterClose();
  };
  const handleRefreshCase = async () => {
    await getNewCaseData();
    const updatedCases = (JSON.parse(localStorage.getItem("caseList") ?? "[]") as CaseEntity[]).filter(c => allowedStatusIds.includes(c.statusId));
    setCaseData(updatedCases);
  }

  const getFilteredCases = () => {
    let allCases: CaseEntity[] = caseData.map(c => ({
      ...c,
      assignee: c.createdBy ? c.createdBy : [{ name: "", color: "" }]
    }));

    const filtered = allCases.filter(c => {
      const generalSearchTerm = searchText.toLowerCase()
      if (generalSearchTerm === '') return true;

      const assigneeName = c.createdBy;

      return (
        matchingSubTypesNames(c.caseTypeId, c.caseSTypeId, caseTypeSupTypeData).toLowerCase().includes(generalSearchTerm) ||
        c?.caseDetail?.toLowerCase().includes(generalSearchTerm) ||
        c?.statusId?.toLowerCase().includes(generalSearchTerm) ||
        c?.caseId?.toLowerCase().includes(generalSearchTerm) ||
        assigneeName?.toLowerCase().includes(generalSearchTerm) ||
        DateStringToDateFormat(c?.createdAt as string, false, language).toLowerCase().includes(generalSearchTerm)
      );
    });

    return filtered.sort((a, b) => {
      let aVal: string | number = "";
      let bVal: string | number = "";
      if (sortField === "title") {
        aVal = a.caseSTypeId?.toLowerCase() ?? "";
        bVal = b.caseSTypeId?.toLowerCase() ?? "";
      }
      if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
      if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }

  const getCasesForColumn = (columnId: string) => {
    return getFilteredCases()
      .filter(c => getStatusKey(c) === columnId)
      ;
  }

  const SLACountdownBadge = ({ createdAt, sla }: { createdAt: string, sla: number }) => {
    const [timeRemaining, setTimeRemaining] = useState<{
      isOverdue: boolean;
      days: number;
      hours: number;
      minutes: number;
      seconds: number;
      totalSeconds: number;
    } | null>(null);
    if (sla === 0) {
      return
    }
    useEffect(() => {
      const calculateTimeRemaining = () => {
        const createdDate = new Date(createdAt);
        const slaDeadline = new Date(createdDate.getTime() + (sla * 60 * 60 * 1000)); // sla in hours
        const now = new Date();
        const diffMs = slaDeadline.getTime() - now.getTime();

        if (diffMs <= 0) {
          const overdueSeconds = Math.abs(Math.floor(diffMs / 1000));
          const overdueDays = Math.floor(overdueSeconds / (24 * 60 * 60));
          const overdueHours = Math.floor((overdueSeconds % (24 * 60 * 60)) / (60 * 60));
          const overdueMinutes = Math.floor((overdueSeconds % (60 * 60)) / 60);

          return {
            isOverdue: true,
            days: overdueDays,
            hours: overdueHours,
            minutes: overdueMinutes,
            seconds: overdueSeconds % 60,
            totalSeconds: overdueSeconds
          };
        }

        const totalSeconds = Math.floor(diffMs / 1000);
        const days = Math.floor(totalSeconds / (24 * 60 * 60));
        const hours = Math.floor((totalSeconds % (24 * 60 * 60)) / (60 * 60));
        const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
        const seconds = totalSeconds % 60;

        return {
          isOverdue: false,
          days,
          hours,
          minutes,
          seconds,
          totalSeconds
        };
      };

      setTimeRemaining(calculateTimeRemaining());

      const interval = setInterval(() => {
        setTimeRemaining(calculateTimeRemaining());
      }, 1000);

      return () => clearInterval(interval);
    }, [createdAt, sla]);

    if (!timeRemaining) {
      return <Badge variant="solid" size="xs">Loading...</Badge>;
    }

    if (timeRemaining.isOverdue) {
      return (
        <Badge variant="solid" color="error" size="xs" className="text-center animate-pulse">
          Over SLA
        </Badge>
      );
    }

    const getVariantAndColor = () => {
      if (timeRemaining.totalSeconds <= 3600) {
        return { variant: "solid" as const, color: "error" as const };
      } else if (timeRemaining.totalSeconds <= 10800) {
        return { variant: "solid" as const, color: "warning" as const };
      } else if (timeRemaining.totalSeconds <= 21600) {
        return { variant: "solid" as const, color: "info" as const };
      } else {
        return { variant: "solid" as const, color: "success" as const };
      }
    };

    const { variant, color } = getVariantAndColor();

    const formatTimeRemaining = () => {
      if (timeRemaining.days > 0) {
        return `${timeRemaining.days}d ${timeRemaining.hours}h`;
      } else if (timeRemaining.hours > 0) {
        return `${timeRemaining.hours}h ${timeRemaining.minutes}m`;
      } else if (timeRemaining.minutes > 0) {
        return `${timeRemaining.minutes}m ${timeRemaining.seconds}s`;
      } else {
        return `${timeRemaining.seconds}s`;
      }
    };

    const shouldPulse = timeRemaining.totalSeconds <= 600 && !timeRemaining.isOverdue;
    return (
      <Badge
        variant={variant}
        color={color}
        size="xs"
        className={`text-center ${shouldPulse ? 'animate-pulse' : ''}`}
      >
        {formatTimeRemaining()}
      </Badge>
    );
  };

  // AdvanceFilter component now triggers the API call
  const AdvanceFilter: React.FC = () => {
    const [localFilters, setLocalFilters] = useState(advancedFilters);
    const handleApply = async () => {
      setAdvancedFilters(localFilters);
      // const category = statusColumns.find(col => col.title === localFilters.category)?.group[0] || "";ßß
      await useFetchCase({
        caseType: localFilters.caseType ?? undefined,
        caseSType: localFilters.caseSubtype ?? undefined,
        detail: localFilters.descriptionSearch,
        start_date: localFilters.startDate ? new Date(localFilters.startDate + ':00.000Z').toISOString() : undefined,
        end_date: localFilters.endDate ? new Date(localFilters.endDate + ':00.000Z').toISOString() : undefined,
        createBy: localFilters.createBy ?? undefined
      });
      if (localFilters.category !== "") {
        setSelectedStatus(localFilters.category);
      } else {
        setSelectedStatus(null);
      }
      const updatedCases = (JSON.parse(localStorage.getItem("caseList") ?? "[]") as CaseEntity[]).filter(c => allowedStatusIds.includes(c.statusId));
      setCaseData(updatedCases);
      handleAdvanceFilterClose();
    };

    const handleCaseTypeChange = (label: string) => {
      const selectedCaseTypes = caseTypeSupTypeData.find(item => mergeCaseTypeAndSubType(item, language) === label);

      setLocalFilters(prev => ({
        ...prev,
        caseSubtype: selectedCaseTypes?.sTypeId || "",
        caseType: selectedCaseTypes?.typeId || ""
      }));

    };

    const caseTypeOptions = useMemo(() => {
      if (!caseTypeSupTypeData?.length) return [];
      return caseTypeSupTypeData.map(item =>
        mergeCaseTypeAndSubType(item, language)
      );
    }, [caseTypeSupTypeData]);


    return (<Modal isOpen={showAdvanceFilter} onClose={handleAdvanceFilterClose} className="max-w-xl p-6">
      <div>
        <h3 className="font-medium dark:text-gray-50 text-xl leading-tight pr-2 text-gray-700 mb-4">{t("case.display.advance_filtering.title")}</h3>
        <div className="space-y-4">
          <div>
            <label htmlFor="description-search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t("case.display.types")}</label>
            <SearchableSelect
              options={caseTypeOptions}
              value={
                (() => {
                  const found = caseTypeSupTypeData.find(item => item.typeId === localFilters.caseType || item.sTypeId === localFilters.caseSubtype);
                  return found ? mergeCaseTypeAndSubType(found, language) : "";
                })()
              }
              onChange={(e) => handleCaseTypeChange(e)}
              className="w-full  border-gray-200 bg-transparent   text-sm text-gray-800 dark:border-gray-800 dark:bg-gray-900 dark:text-white/90"
              placeholder={t("case.display.advance_filtering.search_case_type_place_holder")}
            />
          </div>
          <div>
            <label htmlFor="description-search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t("case.display.advance_filtering.search_detail")}</label>
            <input
              id="description-search"
              type="texts"
              value={localFilters.descriptionSearch}
              onChange={(e) => setLocalFilters({ ...localFilters, descriptionSearch: e.target.value })}
              className="w-full rounded-lg border border-gray-200 bg-transparent py-2 px-3 text-sm text-gray-800 dark:border-gray-800 dark:bg-gray-900 dark:text-white/90"
              placeholder={t("case.display.advance_filtering.search_detail_placeholder")}
            />
          </div>

          <div className="grid grid-cols-2">
            <div className="mr-2">
              <label htmlFor="start-date-search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t("case.display.advance_filtering.start_date_title")}</label>
              <input
                id="start-date-search"
                type="datetime-local"
                value={localFilters.startDate}
                onChange={(e) => setLocalFilters({ ...localFilters, startDate: e.target.value })}
                className="dark:[&::-webkit-calendar-picker-indicator]:invert w-full rounded-lg border border-gray-200 bg-transparent py-2 px-3 text-sm text-gray-800 dark:border-gray-800 dark:bg-gray-900 dark:text-white/90"
              />
            </div>
            <div>
              <label htmlFor="end-date-search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t("case.display.advance_filtering.end_date_title")}</label>
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
            <label htmlFor="category-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t("case.display.advance_filtering.status_title")}</label>
            <select
              id="category-filter"
              value={localFilters.category}
              onChange={(e) => setLocalFilters({ ...localFilters, category: e.target.value })}
              className="w-full rounded-lg border border-gray-200 bg-transparent py-2 px-3 text-sm text-gray-800 dark:border-gray-800 dark:bg-gray-900 dark:text-white/90"
            >
              <option value="">{t("case.display.advance_filtering.status_placeholder_all")}</option>
              {uniqueCategories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="description-search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t("case.display.advance_filtering.create_by_tilte")}</label>
            <input
              id="createBy"
              type="texts"
              value={localFilters.createBy}
              onChange={(e) => setLocalFilters({ ...localFilters, createBy: e.target.value })}
              className="w-full rounded-lg border border-gray-200 bg-transparent py-2 px-3 text-sm text-gray-800 dark:border-gray-800 dark:bg-gray-900 dark:text-white/90"
              placeholder={t("case.display.advance_filtering.create_by_tilte_placeholder")}
            />
          </div>
        </div>
        <div className="mt-6 flex justify-end space-x-3">
          <Button variant="outline" onClick={handleClear}>{t("case.assignment.clear")}</Button>
          <Button onClick={handleApply}>{t("case.assignment.apply_filter")}</Button>
        </div>
      </div>
    </Modal>)
  }

  const CaseCard = ({ caseItem }: { caseItem: CaseEntity }) => (
    <div className="space-y-2">
      <div className="text-xs text-gray-500 font-medium"></div>
      <div
        className={`dark:bg-gray-800 bg-white rounded-lg p-4 space-y-3 border-l-4 ${getPriorityBorderColorClass(caseItem.priority)} hover:bg-gray-750 transition-colors cursor-pointer`}
        onClick={() => handleCaseClick(caseItem)}
      >
        <div className="flex items-start justify-between">
          <h3 className="font-medium dark:text-gray-50 text-base leading-tight pr-2 text-gray-700">{matchingSubTypesNames(caseItem.caseTypeId, caseItem.caseSTypeId, caseTypeSupTypeData)}</h3>
          <SLACountdownBadge createdAt={caseItem.createdAt as string} sla={caseItem.caseSla} />
        </div>
        {/* <p className="text-sm text-gray-400 leading-relaxed">Case ID : {caseItem.caseId}</p> */}
        <p className="text-sm text-gray-400 leading-relaxed line-clamp-2">{caseItem.caselocAddr}</p>
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
        <div className="flex items-center justify-between pt-2 text-sm">
          <span className="text-xs text-gray-500 font-medium ">{DateStringToAgoFormat(caseItem.createdAt as string, language)}</span>
          <Badge className="flex flex-col justify-center items-center text-center truncate">
            {language === "th" ?
              caseStatus.find((item) => caseItem?.statusId === item.statusId)?.th :
              caseStatus.find((item) => caseItem?.statusId === item.statusId)?.en
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
          <div className="grid grid-cols-1 sm:grid-cols2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-6">
            {filteredCases.map((caseItem) => (
              <CaseCard key={caseItem.id} caseItem={caseItem} />
            ))}
          </div>
        </div>
      );
    }

    return (<div className="flex flex-wrap xl:grid xl:grid-cols-4 gap-3 pb-6">
      {statusColumns.map((column) => {
        const localizedTitle = language === "th" ? column.title.th : column.title.en;
        return (
          (selectedStatus === null || selectedStatus === localizedTitle) && (
            <div key={localizedTitle} className="flex-shrink-0 w-80 xl:w-full">
              {!selectedStatus && <div className="flex items-center mb-4 px-2">
                <h3 className="font-medium text-gray-700 dark:text-gray-200">{localizedTitle}</h3>
                <Badge color="primary" className="mx-2">{getCasesForColumn(localizedTitle).length}</Badge>
              </div>}
              <div className="space-y-3 px-2 md:overflow-y-auto md:h-screen  custom-scrollbar ">
                {getCasesForColumn(localizedTitle).map((caseItem) => (
                  <CaseCard key={caseItem.id} caseItem={caseItem} />
                ))}
              </div>
            </div>
          )
        )
      })}
    </div>)
  }

  const ListView = () => (
    <div className="space-y-3 ">
      {/* Desktop Header - Hidden on mobile */}
      <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider bg-gray-50 border border-gray-200 rounded-lg dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-300">
        <div className="col-span-3">{t("case.assignment.case_type")}</div>
        <div className="col-span-2">{t("case.assignment.area")}</div>
        <div className="col-span-2">{t("case.assignment.status")}</div>
        <div className="col-span-2">{t("case.assignment.piority")}</div>
        <div className="col-span-2">{t("case.assignment.create_by")}</div>
        <div className="col-span-1">{t("case.assignment.create_date")}</div>
      </div>

      {/* Cases */}
      <div className="space-y-2">
        {getFilteredCases()
          .filter(c => selectedStatus === null || getStatusKey(c) === selectedStatus)
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
                    {
                      language === "th" ?
                        caseStatus.find((item) => caseItem?.statusId === item.statusId)?.th :
                        caseStatus.find((item) => caseItem?.statusId === item.statusId)?.en
                    }
                  </Badge>
                </div>

                {/* Priority */}
                <div className="col-span-2 flex items-center">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${getPriorityColorClass(caseItem.priority)} shadow-sm`} />
                    <span className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                      {t(`case.sop_card.${getTextPriority(caseItem.priority).level} Priority`)}
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
                    {/* <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg> */}
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      {DateStringToAgoFormat(caseItem.createdAt as string, language)}
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
                    {statusIdToStatusTitle(caseItem.statusId, language)}
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
                    <span>{DateStringToAgoFormat(caseItem.createdAt as string, language)}</span>
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

  // const onBackDynamic = () => {
  //   setShowDynamicForm(false)
  //   const savedCases = localStorage.getItem("caseList");
  //   setCaseData(savedCases
  //     ? (JSON.parse(savedCases) as CaseEntity[]).filter(c => allowedStatusIds.includes(c.statusId))
  //     : [])
  // }

  // const onBackSelectedCase = () => {
  //   setSelectedCase(null)
  //   const savedCases = localStorage.getItem("caseList");
  //   setCaseData(savedCases
  //     ? (JSON.parse(savedCases) as CaseEntity[]).filter(c => allowedStatusIds.includes(c.statusId))
  //     : [])
  // }

  // if (selectedCase) {
  //   navigate(`/case/${selectedCase.caseId}`)
  //   // return <CaseDetailView onBack={onBackSelectedCase} caseData={selectedCase} isCreate={false}/>
  // }
  useEffect(() => {
    if (selectedCase) {
      navigate(`/case/${selectedCase.caseId}`)
    }
  }, [selectedCase, navigate])

  const hasActiveFilters = () => {
    return Object.values(advancedFilters).some(value => value !== "");
  };
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PageMeta title="Cases – TailAdmin Dashboard" description="Manage your support cases" />
      <PageBreadcrumb pageTitle={t("case.assignment.pageheader")} />
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
                  className={`flex-1 sm:flex-none ${viewMode === "kanban"
                    ? "bg-white text-gray-900 shadow dark:bg-gray-700 dark:text-white"
                    : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                    }`}
                >
                  <LayoutGrid className="w-4 h-4 mr-2" />
                  {t("case.assignment.kanban")}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className={`flex-1 sm:flex-none ${viewMode === "list"
                    ? "bg-white text-gray-900 shadow dark:bg-gray-700 dark:text-white"
                    : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                    }`}
                >
                  <List className="w-4 h-4 mr-2" />
                  {t("case.assignment.list")}
                </Button>
              </div>

              {/* Search & Filter */}
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <input
                  type="text"
                  className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-200 bg-transparent py-2.5 pl-3 pr-3 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 sm:w-[300px] lg:w-[430px]"
                  placeholder={t("case.assignment.search_placeholder")}
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
                  <span className="sm:hidden">{t("case.assignment.advance_filter")}</span>
                  <span className="hidden sm:inline">{t("case.assignment.advance_filter")}</span>
                </Button>
                {hasActiveFilters() && (
                  <Button
                    variant="primary"
                    onClick={handleClear}
                    className="w-full sm:w-auto whitespace-nowrap"
                    size="sm"
                  >
                    <span>{t("case.assignment.clear")}</span>
                  </Button>
                )}
              </div>
            </div>
            <div className="flex">
              <Button
                className="flex mr-3 items-center hover:bg-blue-700 text-white bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 w-full sm:w-auto"
                onClick={handleRefreshCase}
                size="sm"
              >
                <RefreshCcw className="w-4 h-4" />
              </Button>
              {/* Add New Case Button */}
              <Button
                className="flex items-center justify-center hover:bg-blue-700 text-white bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 w-full sm:w-auto"
                onClick={() => navigate("/case/creation")}
                size="sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                {t("case.assignment.add_new_case")}
              </Button>
            </div>
          </div>

          {/* Status Filter Tabs - Mobile Responsive */}
          <div className="w-full overflow-x-auto custom-scrollbar">
            <div className="flex items-center space-x-3 sm:space-x-6 min-w-max pb-2">
              <div
                className={`flex items-center space-x-2 cursor-pointer whitespace-nowrap ${selectedStatus === null
                  ? 'font-semibold text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                onClick={() => setSelectedStatus(null)}
              >
                <span className="text-sm">{t("case.status_allcase")}</span>
                <Badge color="primary">
                  {getFilteredCases().length}
                </Badge>
              </div>
              {statusColumns.map((col) => {
                const localizedTitle = language === "th" ? col.title.th : col.title.en;
                return (
                  <div
                    key={localizedTitle}
                    className={`flex items-center space-x-2 cursor-pointer whitespace-nowrap ${selectedStatus === localizedTitle
                      ? 'font-semibold text-blue-600 dark:text-blue-400'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    onClick={() => setSelectedStatus(localizedTitle)}
                  >
                    <span className="text-sm">{localizedTitle}</span>
                    <Badge color="primary">{getCasesForColumn(localizedTitle).length}</Badge>
                  </div>
                )
              })}
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