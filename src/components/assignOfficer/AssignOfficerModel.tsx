"use client"
import { useState, useMemo, useEffect, useRef } from "react"
import { ChevronDown, ChevronUp, Search, X, } from "lucide-react"
import Button from "@/components/ui/button/Button"
import Input from "@/components/form/input/InputField"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, } from "@/components/ui/dialog/dialog"
import { ScrollArea } from "@/components/ui/scorllarea/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar/Avatarv2"
import Badge from "@/components/ui/badge/Badge"
import { getAvatarIconFromString } from "../avatar/createAvatarFromString"
import { CaseSop, Unit } from "@/store/api/dispatch"
import { unitStatus } from "../ui/status/status"
import { Area, mergeArea } from "@/store/api/area"
import SkillModal from "./officerSkillModal"

const SkillsDisplay = ({
  skills,
  maxInitialItems = 1,
  className = ""
}: {
  skills: Array<{ skillId: string, en: string, th: string }>
  maxInitialItems?: number
  className?: string
}) => {
  const [expanded, setExpanded] = useState(false)

  if (!skills || skills.length === 0) {
    return <span className="text-gray-400 dark:text-gray-500 text-xs">No skills</span>
  }

  const visibleSkills = expanded ? skills : skills.slice(0, maxInitialItems)
  const remainingCount = skills.length - maxInitialItems

  return (
    <div className={`space-y-1 w-full ${className}`}>
      <div className="flex flex-wrap gap-1 items-center justify-start"> {/* Default to justify-start */}
        {visibleSkills.map((skill) => (
          <Badge
            key={skill.skillId}
            variant="outline"
            className="text-xs max-w-[120px] truncate"
          >
            {skill.th}
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



interface AssignOfficerModalProps {
  open: boolean
  onOpenChange: (isOpen: boolean) => void
  officers: Unit[]
  onAssign: (selectedOfficerIds: string[]) => void
  assignedOfficers?: Unit[]
  canDispatch?: boolean
  caseData: CaseSop | undefined
}

type SortableColumns = keyof Omit<Unit, "id">

const UnifiedCheckbox = ({
  checked,
  indeterminate = false,
  onChange,
  className = "",
  ...props
}: {
  checked: boolean
  indeterminate?: boolean
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  className?: string
  [key: string]: any
}) => {
  const checkboxRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (checkboxRef.current) {
      checkboxRef.current.indeterminate = indeterminate
    }
  }, [indeterminate])

  return (
    <div className="relative flex items-center justify-center">
      <input
        ref={checkboxRef}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className={`w-4 h-4 appearance-none rounded cursor-pointer transition-all duration-200 
      bg-gray-200  border-gray-300 
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
        <svg
          className="absolute pointer-events-none w-2.5 h-2.5 text-white"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 14 14"
          fill="none"
        >
          <path
            d="M11.6666 3.5L5.24992 9.91667L2.33325 7"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </div>
  )
}

export default function AssignOfficerModal({
  open,
  onOpenChange,
  officers,
  onAssign,
  caseData,
  assignedOfficers = [],
  canDispatch = true,
}: AssignOfficerModalProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedOfficers, setSelectedOfficers] = useState<string[]>([])
  const [sortColumn] = useState<SortableColumns>("locAlt")
  const [sortDirection] = useState<"asc" | "desc">("asc")
  const [showModel, setShowModel] = useState(false)
  const [disableAssign, setDisableAssign] = useState(false)
  const [showOfficerData, setShowOFFicerData] = useState<Unit | null>(null)
  const areaList = useMemo(() =>
    JSON.parse(localStorage.getItem("area") ?? "[]") as Area[], []
  );
  // Reset selection when modal opens and set initial assigned officers
  useEffect(() => {
    if (open) {
      const assignedIds = assignedOfficers.map((o) => o.unitId)
      setSelectedOfficers(assignedIds)
    } else {
      // Reset when modal closes
      setSelectedOfficers([])
      setSearchTerm("")
    }
    setDisableAssign(false)
  }, [open, assignedOfficers])
  const workLoadsMock = [{ skillId: "D2509011730090507940", en: "D2509011730090507940", th: "D2509011730090507940" },
  { skillId: "D2509011629210596712", en: "D2509011629210596712", th: "D2509011629210596712" }]

  // Filter officers based on search term
  const filteredOfficers = useMemo(() => {
    if (!searchTerm.trim()) return officers
    const searchLower = searchTerm.toLowerCase()
    return officers.filter((officer) =>
      officer.username.toLowerCase().includes(searchLower) ||
      officer.deptId.toLowerCase().includes(searchLower)
    )
  }, [officers, searchTerm])

  // Sort the filtered officers
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

  // Handle individual officer selection
  const handleSelectOfficer = (officerId: string) => {
    setSelectedOfficers((prev) => {
      const isSelected = prev.includes(officerId)
      if (isSelected) {
        return prev.filter((id) => id !== officerId)
      } else {
        return [...prev, officerId]
      }
    })
  }

  // Check if all filtered officers are selected
  const isAllFilteredSelected = useMemo(() => {
    if (filteredOfficers.length === 0) return false
    return filteredOfficers.every(officer => selectedOfficers.includes(officer.unitId))
  }, [filteredOfficers, selectedOfficers])

  // Check if some (but not all) filtered officers are selected
  const isSomeFilteredSelected = useMemo(() => {
    if (filteredOfficers.length === 0) return false
    return filteredOfficers.some(officer => selectedOfficers.includes(officer.unitId)) && !isAllFilteredSelected
  }, [filteredOfficers, selectedOfficers, isAllFilteredSelected])

  // Handle "select all" checkbox for filtered officers
  const handleSelectAll = () => {
    const filteredIds = filteredOfficers.map(officer => officer.unitId)
    if (isAllFilteredSelected) {
      // Unselect all filtered officers
      setSelectedOfficers(prev => prev.filter(id => !filteredIds.includes(id)))
    } else {
      // Select all filtered officers (keep existing selections from other filters)
      setSelectedOfficers(prev => {
        const newSelections = new Set([...prev, ...filteredIds])
        return Array.from(newSelections)
      })
    }
  }


  const handleAssignOfficers = async () => {
    if (selectedOfficers.length === 0 || disableAssign) return;
    setDisableAssign(true);
    try {
      await onAssign(selectedOfficers);
    } catch (error) {
      console.error("Failed to assign officers:", error);
    } finally {
      setDisableAssign(false);
    }
  };

  // Get selected officer objects for display
  const selectedOfficerObjects = useMemo(() => {
    return officers.filter(officer => selectedOfficers.includes(officer.unitId))
  }, [officers, selectedOfficers])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent aria-describedby="modal-desc" className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white max-w-7xl w-[95vw] h-[85vh] flex flex-col z-99999 rounded-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-800 dark:text-white">
            Assign Officers to Case
          </DialogTitle>
        </DialogHeader>
        <SkillModal open={showModel} onOpenChange={setShowModel} officer={showOfficerData as Unit} />
        {/* Search Bar and Buttons - Now responsive */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          <div className="flex-grow">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400 dark:text-gray-200" />
              <Input
                placeholder="Search officers by name, department, or service..."
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
              Recommend By Skills
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            >
              All Officers
            </Button>
          </div>
        </div>

        {/* Officers Table - Now with horizontal scrolling for small screens */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden flex flex-col flex-1 min-h-0">
          <div className="flex-1 min-h-0 overflow-x-auto custom-scrollbar"> {/* Added overflow-x-auto here */}
            <div className="min-w-[768px]"> {/* Ensures minimum width for the table content */}
              {/* Table Header */}
              <div className="bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-300">
                <div className="flex items-center">
                  <div className="px-4 py-3">
                    <UnifiedCheckbox
                      checked={isAllFilteredSelected}
                      indeterminate={isSomeFilteredSelected}
                      onChange={(e) => {
                        e.stopPropagation()
                        handleSelectAll()
                      }}
                    />
                  </div>
                  <div className="grid grid-cols-5 flex-1 gap-3 pr-10">
                    <div className="flex items-center justify-center">Name</div>
                    <div className="flex items-center justify-center">Status</div>
                    <div className="flex items-center justify-center">Area</div>
                    <div className="flex items-center justify-center">Skills</div>
                    <div className="flex items-center justify-center">Work Loads</div>
                  </div>
                </div>
              </div>

              {/* Table Body */}
              <div>
                <ScrollArea className="h-full">
                  <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {sortedOfficers.length === 0 ? (
                      <div className="flex justify-center items-center text-center text-gray-500 dark:text-gray-400 py-4">
                        {officers.length === 0 ? "No officers available" : "No officers match your search"}
                      </div>
                    ) : (
                      sortedOfficers.map((officer) => {
                        const isSelected = selectedOfficers.includes(officer.unitId)
                        return (
                          <div
                            key={officer.unitId}
                            className={`flex items-center text-sm transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 ${isSelected
                              ? "bg-blue-50 dark:bg-blue-900/20"
                              : "bg-white dark:bg-gray-900"
                              }`}
                          >
                            <div className="px-4">
                              <UnifiedCheckbox
                                checked={isSelected}
                                onChange={(e) => {
                                  e.stopPropagation()
                                  handleSelectOfficer(officer.unitId)
                                }}
                              />
                            </div>
                            <div
                              className="grid grid-cols-[20%_20%_20%_20%_20%] flex-1 gap-4 py-3 pr-10 cursor-pointer"
                              onClick={() => setShowOFFicerData(officer)}
                            >
                              <div className="flex items-center space-x-2 justify-center">
                                <Avatar className="w-8 h-8">
                                  <AvatarFallback className="bg-gray-200 text-gray-700 text-xs dark:bg-gray-700 dark:text-white">
                                    {officer.username
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")
                                      .toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-gray-800 dark:text-white font-medium">
                                  {officer.username}
                                </span>
                              </div>
                              <div className="flex items-center justify-center">
                                {(() => {
                                  const status = unitStatus.find(column => column.group.includes(officer.sttId));
                                  return (
                                    <div className=" flex items-center ">
                                      <div className={`w-3 h-3 rounded-full mx-1 ${officer.isLogin ? "bg-green-500" : "bg-red-500"}`}>
                                      </div>
                                      <Badge
                                        color={status?.color || "secondary"}
                                        variant={status?.variant || "light"}
                                      >
                                        {status?.title || "-"}
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
                                  return matchedArea ? mergeArea(matchedArea) : "-";
                                })()}
                              </div>
                              <div className="flex items-center justify-center">
                                <SkillsDisplay skills={officer.skillLists || []} />
                              </div>
                              <div className="flex items-center justify-center">
                                <SkillsDisplay skills={workLoadsMock || []} />
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

        {/* Selection Summary */}
        {selectedOfficers.length > 0 && (
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
            <div className="text-sm text-gray-700 dark:text-gray-300">
              Selected {selectedOfficers.length} officer{selectedOfficers.length !== 1 ? "s" : ""}:
            </div>
            <div className="flex flex-wrap gap-2 mt-2 max-h-20 overflow-y-auto custom-scrollbar">
              {selectedOfficerObjects.map((officer) => (
                <Badge key={officer.unitId}>
                  {getAvatarIconFromString(officer.username, "bg-blue-600 dark:bg-blue-700 my-1")}
                  {officer.username}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleSelectOfficer(officer.unitId)
                    }}
                    className="ml-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        )}

        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
          {canDispatch && <Button
            onClick={handleAssignOfficers}
            disabled={selectedOfficers.length === 0 || disableAssign}
            className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
          >
            Assign Selected Officers ({selectedOfficers.length})
          </Button>}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}