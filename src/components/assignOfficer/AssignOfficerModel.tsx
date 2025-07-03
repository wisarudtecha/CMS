"use client"

import { useState, useMemo } from "react"
import {
  Search,
  ChevronUp,
  ChevronDown,
  X,
} from "lucide-react"
import  Button  from "@/components/ui/button/Button"
import  Checkbox from "@/components/form/input/Checkbox"
import  Input  from "@/components/form/input/InputField"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog/dialog"
import { ScrollArea } from "@/components/ui/scorllarea/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar/Avatarv2"
import  Badge  from "@/components/ui/badge/Badge"

// Define the shape of an Officer object
export interface Officer {
  id: string
  name: string
  status: "Available" | "On-Site" | "Unavailable" | "En-Route"
  department: string
  location: string
  service: string
  serviceProvider: string
  workload: number
  distance: number
}

// Props for the modal component
interface AssignOfficerModalProps {
  open: boolean
  onOpenChange: (isOpen: boolean) => void
  officers: Officer[]
  onAssign: (selectedOfficerIds: string[]) => void
}

type SortableColumns = keyof Omit<Officer, "id">

// Sorting icon component
const SortIcon = ({
  column,
  sortColumn,
  sortDirection,
}: {
  column: SortableColumns
  sortColumn: SortableColumns
  sortDirection: "asc" | "desc"
}) => {
  if (sortColumn !== column) return null
  return sortDirection === "asc" ? (
    <ChevronUp className="w-4 h-4" />
  ) : (
    <ChevronDown className="w-4 h-4" />
  )
}

// Helper to get status color
const getStatusColor = (status: Officer["status"]) => {
  switch (status) {
    case "Available":
      return "bg-green-500"
    case "On-Site":
      return "bg-blue-500"
    case "En-Route":
      return "bg-yellow-500"
    default:
      return "bg-gray-500"
  }
}

export default function AssignOfficerModal({
  open,
  onOpenChange,
  officers,
  onAssign,
}: AssignOfficerModalProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedOfficers, setSelectedOfficers] = useState<string[]>([])
  const [sortColumn, setSortColumn] =
    useState<SortableColumns>("distance")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")

  // Filter officers based on search term
  const filteredOfficers = useMemo(
    () =>
      officers.filter(
        (officer) =>
          officer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          officer.department
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          officer.service.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    [officers, searchTerm],
  )

  // Sort the filtered officers
  const sortedOfficers = useMemo(
    () =>
      [...filteredOfficers].sort((a, b) => {
        const aValue = a[sortColumn]
        const bValue = b[sortColumn]

        if (aValue < bValue) return sortDirection === "asc" ? -1 : 1
        if (aValue > bValue) return sortDirection === "asc" ? 1 : -1
        return 0
      }),
    [filteredOfficers, sortColumn, sortDirection],
  )

  // Handle sorting when a column header is clicked
  const handleSort = (column: SortableColumns) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortColumn(column)
      setSortDirection("asc")
    }
  }

  // Handle officer selection
  const handleSelectOfficer = (officerId: string) => {
    setSelectedOfficers((prev) =>
      prev.includes(officerId)
        ? prev.filter((id) => id !== officerId)
        : [...prev, officerId],
    )
  }

  // Handle "select all" checkbox
  const handleSelectAll = () => {
    if (selectedOfficers.length === filteredOfficers.length) {
      setSelectedOfficers([])
    } else {
      setSelectedOfficers(filteredOfficers.map((o) => o.id))
    }
  }

  // Handle final assignment and close modal
  const handleAssignOfficers = () => {
    onAssign(selectedOfficers)
    onOpenChange(false) // Close the modal
    setSelectedOfficers([]) // Reset selection
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-7xl w-[95vw] h-[85vh] flex flex-col z-99999">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Assign Officers to Case
          </DialogTitle>
        </DialogHeader>

        {/* Search Bar */}
        <div className="mb-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <Input
              placeholder="Search officers by name, department, or service..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 pl-10"
            />
          </div>
        </div>

        {/* Officers Table */}
        <div className="border border-gray-700 rounded-lg overflow-hidden flex flex-col flex-1 min-h-0">
          {/* Table Header */}
          <div className="bg-gray-800 border-b border-gray-700">
            <div className="grid grid-cols-9 gap-4 p-3 text-sm font-medium text-gray-300">
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={
                    selectedOfficers.length === filteredOfficers.length &&
                    filteredOfficers.length > 0
                  }
                  onChange={handleSelectAll}
                  className="border-gray-600"
                />
              </div>
              {(
                [
                  "name",
                  "status",
                  "department",
                  "location",
                  "service",
                  "serviceProvider",
                  "workload",
                  "distance",
                ] as const
              ).map((col) => (
                <button
                  key={col}
                  onClick={() => handleSort(col)}
                  className="flex items-center space-x-1 hover:text-white transition-colors text-left"
                >
                  <span>
                    {col.charAt(0).toUpperCase() +
                      col.slice(1).replace(/([A-Z])/g, " $1")}
                  </span>
                  <SortIcon
                    column={col}
                    sortColumn={sortColumn}
                    sortDirection={sortDirection}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Table Body */}
          <div className="flex-1 min-h-0">
            <ScrollArea className="h-full">
              <div className="divide-y divide-gray-700">
                {sortedOfficers.map((officer) => (
                  <div
                    key={officer.id}
                    className={`grid grid-cols-9 gap-4 p-3 text-sm hover:bg-gray-800 transition-colors ${
                      selectedOfficers.includes(officer.id) ? "bg-gray-800" : ""
                    }`}
                  >
                    <div className="flex items-center">
                      <Checkbox
                        checked={selectedOfficers.includes(officer.id)}
                        onChange={() => handleSelectOfficer(officer.id)}
                        className="border-gray-600"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-gray-700 text-white text-xs">
                          {officer.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-white font-medium">
                        {officer.name}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <div className="flex items-center space-x-2">
                        <div
                          className={`w-2 h-2 rounded-full ${getStatusColor(
                            officer.status,
                          )}`}
                        ></div>
                        <span className="text-gray-300">{officer.status}</span>
                      </div>
                    </div>
                    <div className="flex items-center text-gray-300">
                      {officer.department}
                    </div>
                    <div className="flex items-center text-gray-300">
                      {officer.location}
                    </div>
                    <div className="flex items-center text-gray-300">
                      {officer.service}
                    </div>
                    <div className="flex items-center text-gray-300">
                      {officer.serviceProvider}
                    </div>
                    <div className="flex items-center">
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-300">
                          {officer.workload}
                        </span>
                        <div className="w-16 h-2 bg-gray-700 rounded-full">
                          <div
                            className={`h-full rounded-full transition-all ${
                              officer.workload > 6
                                ? "bg-red-500"
                                : officer.workload > 3
                                ? "bg-yellow-500"
                                : "bg-green-500"
                            }`}
                            style={{
                              width: `${Math.min(officer.workload * 10, 100)}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="flex items-center space-x-2">
                        <span
                          className={`text-sm font-medium ${
                            officer.distance <= 5
                              ? "text-green-400"
                              : officer.distance <= 15
                              ? "text-yellow-400"
                              : "text-red-400"
                          }`}
                        >
                          {officer.distance.toFixed(1)} km
                        </span>
                        <span className="text-xs text-gray-500">
                          ~{Math.round(officer.distance * 3)} min
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* Selection Summary */}
        {selectedOfficers.length > 0 && (
          <div className="bg-gray-800 rounded-lg p-3">
            <div className="text-sm text-gray-300">
              Selected {selectedOfficers.length} officer
              {selectedOfficers.length !== 1 ? "s" : ""}:
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {selectedOfficers.map((officerId) => {
                const officer = officers.find((o) => o.id === officerId)
                return officer ? (
                  <Badge
                    key={officerId}
                  >
                    {officer.name}
                    <button
                      onClick={() => handleSelectOfficer(officerId)}
                      className="ml-2 hover:text-gray-300"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ) : null
              })}
            </div>
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-gray-600 text-gray-300 hover:bg-gray-800"
          >
            Cancel
          </Button>
          <Button
            onClick={handleAssignOfficers}
            disabled={selectedOfficers.length === 0}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Assign Selected Officers ({selectedOfficers.length})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}