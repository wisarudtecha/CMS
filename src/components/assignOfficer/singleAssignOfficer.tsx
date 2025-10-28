"use client"
import { useState, useMemo, useEffect} from "react"
import { ChevronDown, ChevronUp, Search, X, } from "lucide-react"
import Button from "@/components/ui/button/Button"
import Input from "@/components/form/input/InputField"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, } from "@/components/ui/dialog/dialog"
import { ScrollArea } from "@/components/ui/scorllarea/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar/Avatarv2"
import Badge from "@/components/ui/badge/Badge"
import { getAvatarIconFromString } from "../avatar/createAvatarFromString"
import { useGetUnitQuery } from "@/store/api/dispatch"
import { Area, mergeArea } from "@/store/api/area"
import OfficerDetailModal from "./officerSkillModal"
import { useTranslation } from "@/hooks/useTranslation"
import { UnitStatus } from "@/types/unit"
import { unitStatusConfig } from "../ui/status/status"
import { CaseSop, Unit } from "@/types/dispatch"

const SkillsDisplay = ({
  skills,
  maxInitialItems = 1,
  className = "",
  language = "th"
}: {
  skills: Array<{ skillId: string, en: string, th: string }>
  maxInitialItems?: number
  className?: string
  language?: string
}) => {
  const [expanded, setExpanded] = useState(false)

  if (!skills || skills.length === 0) {
    return <span className="text-gray-400 dark:text-gray-500 text-xs">No skills</span>
  }

  const visibleSkills = expanded ? skills : skills.slice(0, maxInitialItems)
  const remainingCount = skills.length - maxInitialItems
  return (
    <div className={`space-y-1 w-full ${className}`}>
      <div className="flex flex-wrap gap-1 items-center justify-start">
        {visibleSkills.map((skill) => (
          <Badge
            key={skill.skillId}
            variant="outline"
            className="text-xs max-w-[120px] truncate"
          >
            {skill?.[language === "th" ? "th" : "en"] || skill.th}
          </Badge>
        ))}
        {skills.length > maxInitialItems && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              setExpanded(!expanded)
            }}
            className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline px-1 py-0.5 rounded transition-colors"
          >
            {expanded ? (
              <>
                <ChevronUp className="w-3 h-3" />
                Less
              </>
            ) : (
              <>
                <ChevronDown className="w-3 h-3" />
                +{remainingCount}
              </>
            )}
          </button>
        )}
      </div>
    </div>
  )
}

// Radio button component for single selection
const UnifiedRadio = ({
  checked,
  onChange,
  className = "",
  ...props
}: {
  checked: boolean
  onChange: (e: any) => void
  className?: string
  [key: string]: any
}) => {
  return (
    <div className="relative flex items-center justify-center">
      <input
        type="radio"
        checked={checked}
        onClick={onChange}
        className={`w-4 h-4 appearance-none rounded-full cursor-pointer transition-all duration-200 
      bg-gray-200 border-2 border-gray-300 
      focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 
      checked:bg-blue-600 checked:border-blue-600
      hover:border-blue-400
      dark:border-gray-500 dark:bg-gray-700 
      dark:checked:bg-blue-500 dark:checked:border-blue-500
      dark:focus:ring-blue-400 dark:focus:ring-offset-gray-800
      dark:hover:border-blue-400 ${className}`}
        {...props}
      />
      {checked && (
        <div className="absolute pointer-events-none w-2 h-2 bg-white rounded-full" />
      )}
    </div>
  )
}

interface AssignOfficerModalProps {
  open: boolean
  onOpenChange: (isOpen: boolean) => void
  caseId: string
  onAssign: (selectedOfficers: Unit[]) => void
  assignedOfficers?: Unit[]
  canDispatch?: boolean
  caseData: CaseSop | undefined
  sopUnitLists?: Array<{ unitId: string }>
}

type SortableColumns = keyof Omit<Unit, "id">

export default function AssignOfficerModal({
  open,
  onOpenChange,
  caseId,
  onAssign,
  caseData,
  assignedOfficers = [],
  canDispatch = true,
  sopUnitLists = [],
}: AssignOfficerModalProps) {
  const [searchTerm, setSearchTerm] = useState("")
  // Changed from array to single string for single selection
  const [selectedOfficer, setSelectedOfficer] = useState<string | null>(null)
  const [sortColumn] = useState<SortableColumns>("locAlt")
  const [sortDirection] = useState<"asc" | "desc">("asc")
  const [disableAssign, setDisableAssign] = useState(false)
  const [showOfficerData, setShowOFFicerData] = useState<Unit | null>(null)
  
  const unitStatus = useMemo(() => {
    return JSON.parse(localStorage.getItem("unit_status") ?? "[]") as UnitStatus[];
  }, []);

  const handleAssignOfficers = async () => {
    if (!selectedOfficer || disableAssign) return;
    setDisableAssign(true);
    try {
      const selectedOfficerObject = availableOfficers.find(officer =>
        officer.unitId === selectedOfficer
      );
      if (selectedOfficerObject) {
        await onAssign([selectedOfficerObject]); // Still pass as array for API compatibility
      }
    } catch (error) {
      console.error("Failed to assign officer:", error);
    } finally {
      setDisableAssign(false);
    }
  };

  const { data: unitData, isLoading: isLoadingUnits, error: unitError } = useGetUnitQuery(
    { caseId },
    {
      skip: !open || !caseId,
      refetchOnMountOrArgChange: true
    }
  )

  const areaList = useMemo(() =>
    JSON.parse(localStorage.getItem("area") ?? "[]") as Area[], []
  );

  const availableOfficers = useMemo(() => {
    if (!unitData?.data) return []

    return unitData.data.filter((officer) => {
      return !sopUnitLists.some((assignedUnit) =>
        assignedUnit.unitId === officer.unitId
      );
    })
  }, [unitData?.data, sopUnitLists])

  useEffect(() => {
    if (open) {
      // Set the first assigned officer as selected, or null if none
      const assignedId = assignedOfficers.length > 0 ? assignedOfficers[0].unitId : null
      setSelectedOfficer(assignedId)
    } else {
      setSelectedOfficer(null)
      setSearchTerm("")
    }
    setDisableAssign(false)
  }, [open, assignedOfficers])

  const workLoadsMock = [
    { skillId: "D2509011730090507940", en: "D2509011730090507940", th: "D2509011730090507940" },
    { skillId: "D2509011629210596712", en: "D2509011629210596712", th: "D2509011629210596712" }
  ]

  const { t, language } = useTranslation();

  const filteredOfficers = useMemo(() => {
    if (!searchTerm.trim()) return availableOfficers
    const searchLower = searchTerm.toLowerCase()
    return availableOfficers.filter((officer) =>
      officer.username.toLowerCase().includes(searchLower) ||
      officer.deptId.toLowerCase().includes(searchLower) ||
      officer.unitId.toLowerCase().includes(searchTerm) ||
      officer.skillLists.find(item => item[language === "en" ? "en" : "th"]?.toLowerCase().includes(searchLower)) ||
      (() => {
        const matchedArea = areaList.find(
          item =>
            caseData?.provId === item.provId &&
            caseData?.countryId === item.countryId &&
            caseData?.distId === item.distId
        );
        return matchedArea ? mergeArea(matchedArea, language).toLocaleLowerCase().includes(searchTerm) : "";
      })()
    )
  }, [availableOfficers, searchTerm])

  const sortedOfficers = useMemo(() =>
    [...filteredOfficers].sort((a, b) => {
      const aValue = a[sortColumn]
      const bValue = b[sortColumn]
      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1
      return 0
    }),
    [filteredOfficers, sortColumn, sortDirection]
  )

  // Updated to handle single selection
  const handleSelectOfficer = (officerId: string) => {
    setSelectedOfficer(prev => prev === officerId ? null : officerId)
  }

  // Get selected officer object for display
  const selectedOfficerObject = useMemo(() => {
    if (!selectedOfficer) return null
    return availableOfficers.find(officer => officer.unitId === selectedOfficer)
  }, [availableOfficers, selectedOfficer])

  if (isLoadingUnits) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent aria-describedby={undefined} className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white max-w-7xl w-[95vw] h-[85vh] flex flex-col z-999999 rounded-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-800 dark:text-white">
              {t("case.assign_officer_modal.title")}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-4"></div>
              <div className="text-gray-600 dark:text-gray-400">{t("common.loading")}</div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  if (unitError) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent aria-describedby={undefined} className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white max-w-7xl w-[95vw] h-[85vh] flex flex-col z-999999 rounded-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-800 dark:text-white">
              {t("case.assign_officer_modal.title")}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="text-red-600 dark:text-red-400 mb-2">{t("common.error")}</div>
              <Button onClick={() => window.location.reload()} variant="outline" size="sm">
                Retry
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent aria-describedby={undefined} className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white max-w-7xl w-[95vw] h-[85vh] flex flex-col z-999999 rounded-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-800 dark:text-white">
            {t("case.assign_officer_modal.title")}
          </DialogTitle>
        </DialogHeader>
        {showOfficerData && <OfficerDetailModal onOpenChange={() => setShowOFFicerData(null)} officer={showOfficerData as Unit} />}

        {/* Search Bar and Buttons */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          <div className="flex-grow">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400 dark:text-gray-200" />
              <Input
                placeholder={t("case.assign_officer_modal.search_placeholder")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 pl-10 dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
              />
            </div>
          </div>
          <div className="flex items-center bg-gray-200 dark:bg-gray-800 rounded-xl mt-2 md:mt-0">
            <Button
              variant="ghost"
              size="sm"
              className="bg-white text-gray-900 shadow dark:bg-gray-700 dark:text-white"
            >
              {t("case.assign_officer_modal.recommend_button")}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            >
              {t("case.assign_officer_modal.allofficer_button")}
            </Button>
          </div>
        </div>

        {/* Officers Table */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden flex flex-col flex-1 min-h-0">
          <div className="flex-1 min-h-0 overflow-x-auto custom-scrollbar">
            <div className="min-w-[768px]">
              {/* Table Header - Removed select all checkbox */}
              <div className="bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-300">
                <div className="flex items-center">
                  <div className="p-5 w-12">
                    {/* Empty space where select all checkbox was */}
                  </div>
                  <div className="grid grid-cols-5 flex-1 gap-3 pr-10">
                    <div className="flex items-center justify-center">{t("case.assign_officer_modal.name")}</div>
                    <div className="flex items-center justify-center">{t("case.assign_officer_modal.status")}</div>
                    <div className="flex items-center justify-center">{t("case.assign_officer_modal.area")}</div>
                    <div className="flex items-center justify-center">{t("case.assign_officer_modal.skills")}</div>
                    <div className="flex items-center justify-center">{t("case.assign_officer_modal.workloads")}</div>
                  </div>
                </div>
              </div>

              {/* Table Body */}
              <div>
                <ScrollArea className="h-full">
                  <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {sortedOfficers.length === 0 ? (
                      <div className="flex justify-center items-center text-center text-gray-500 dark:text-gray-400 py-4">
                        {availableOfficers.length === 0 ? t("case.assign_officer_modal.no_officer") : t("case.assign_officer_modal.not_match_officer")}
                      </div>
                    ) : (
                      sortedOfficers.map((officer) => {
                        const isSelected = selectedOfficer === officer.unitId
                        return (
                          <div
                            key={officer.unitId}
                            className={`flex items-center text-sm transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 ${isSelected
                              ? "bg-blue-50 dark:bg-blue-900/20"
                              : "bg-white dark:bg-gray-900"
                              }`}
                          >
                            <div className="px-4">
                              <UnifiedRadio
                                checked={isSelected}
                                onChange={(e) => {
                                  e.stopPropagation()
                                  handleSelectOfficer(officer.unitId)
                                }}
                              />
                            </div>
                            <div
                              className="grid grid-cols-[20%_20%_20%_20%_20%] flex-1 gap-4 py-3 pr-10 cursor-pointer"
                              onClick={() => {
                                setShowOFFicerData(officer)
                              }}
                            >
                              <div className="flex items-center mx-4 space-x-2">
                                <Avatar className="w-8 h-8">
                                  <AvatarFallback className="bg-gray-200 text-gray-700 text-xs dark:bg-gray-700 dark:text-white">
                                    {officer.photo ?
                                      <img src={officer.photo} alt="officer" className="w-full h-full object-cover" /> : officer.unitName
                                        .split(" ")
                                        .map((n) => n[0])
                                        .join("")
                                        .toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-gray-800 dark:text-white font-medium">
                                  {officer.unitName}
                                </span>
                              </div>
                              <div className="flex items-center justify-center">
                                {(() => {
                                  const status = unitStatusConfig.find(column => column.group.includes(officer.sttId));
                                  return (
                                    <div className=" flex items-center ">
                                      <div className={`w-3 h-3 rounded-full mx-1 ${officer.isLogin ? "bg-green-500" : "bg-red-500"}`}>
                                      </div>
                                      <Badge
                                        color={status?.color || "secondary"}
                                        variant={status?.variant || "light"}
                                      >
                                        {unitStatus.find(column => column.sttId.includes(officer.sttId))?.sttName || "-"}
                                      </Badge>
                                    </div>
                                  );
                                })()}
                              </div>
                              <div className="flex items-center justify-center text-gray-600 dark:text-gray-300">
                                {(() => {
                                  const matchedArea = areaList.find(
                                    item =>
                                      caseData?.provId === item.provId &&
                                      caseData?.countryId === item.countryId &&
                                      caseData?.distId === item.distId
                                  );
                                  return matchedArea ? mergeArea(matchedArea, language) : "-";
                                })()}
                              </div>
                              <div className="flex items-center justify-center">
                                <SkillsDisplay skills={officer.skillLists || []} language={language} />
                              </div>
                              <div className="flex items-center justify-center">
                                <SkillsDisplay skills={workLoadsMock || []} language={language} />
                              </div>
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>
                </ScrollArea>
              </div>
            </div>
          </div>
        </div>

        {/* Selection Summary - Updated for single selection */}
        {selectedOfficer && selectedOfficerObject && (
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
            <div className="text-sm text-gray-700 dark:text-gray-300">
              {t("case.assign_officer_modal.select")} {t("case.assign_officer_modal.officer")}:
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge>
                {getAvatarIconFromString(selectedOfficerObject.unitName, "bg-blue-600 dark:bg-blue-700 my-1")}
                {selectedOfficerObject.unitName}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedOfficer(null)
                  }}
                  className="ml-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            </div>
          </div>
        )}

        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
          {canDispatch && <Button
            onClick={handleAssignOfficers}
            disabled={!selectedOfficer || disableAssign}
            className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
          >
            {t("case.assign_officer_modal.assign_button")} {selectedOfficer ? "(1)" : "(0)"}
          </Button>}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}