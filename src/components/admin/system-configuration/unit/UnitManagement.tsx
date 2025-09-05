// src/components/admin/system-configuration/unit/UnitManagement.tsx
import React, { useState, useMemo } from "react";
import { Building, Plus, Settings } from "lucide-react";
import { CheckCircleIcon, CloseIcon, GroupIcon, PieChartIcon } from "@/icons";
import type { EnhancedUnit, ViewMode } from "@/types/unit";
import UnitOverviewContent from "@/components/admin/system-configuration/unit/UnitOverview";
import UnitStatusBadgeContent from "@/components/admin/system-configuration/unit/UnitStatusBadge";

// Mock data for demonstration
const mockUnits: EnhancedUnit[] = [
  {
    id: "unit-001",
    orgId: "org-001",
    unitId: "U001",
    unitName: "Emergency Response Team Alpha",
    unitSourceId: "SRC001",
    unitTypeId: "TYPE001",
    priority: 1,
    compId: "COMP001",
    deptId: "DEPT001",
    commId: "COMM001",
    stnId: "STN001",
    plateNo: "EMR-001",
    provinceCode: "BKK",
    active: true,
    username: "ert_alpha",
    isLogin: true,
    isFreeze: false,
    isOutArea: false,
    locLat: 13.7563,
    locLon: 100.5018,
    locAlt: 0,
    locBearing: 0,
    locSpeed: 0,
    locProvider: "GPS",
    locGpsTime: "2025-08-27T10:30:00Z",
    locSatellites: 12,
    locAccuracy: 3.5,
    locLastUpdateTime: "2025-08-27T10:30:00Z",
    breakDuration: 0,
    healthChk: "OK",
    healthChkTime: "2025-08-27T10:30:00Z",
    sttId: "STATUS_ACTIVE",
    createdAt: "2025-01-15T08:00:00Z",
    updatedAt: "2025-08-27T10:30:00Z",
    createdBy: "system",
    updatedBy: "admin",
    unitStructure: {
      subUnits: ["unit-002", "unit-003"],
      organizationLevel: 1,
      unitType: "department",
      reportingStructure: ["supervisor-001"]
    },
    operational: {
      capacity: {
        maxPersonnel: 12,
        currentPersonnel: 10,
        availablePersonnel: 8,
        utilizationRate: 83.3
      },
      availability: {
        status: "available",
        schedule: "24/7",
        nextAvailable: "immediate"
      },
      equipment: {
        vehicles: ["Ambulance-A1", "Fire-Truck-F1"],
        specializedEquipment: ["Defibrillator", "Rescue-Tools"],
        maintenanceStatus: "good"
      },
      specializations: ["Emergency Medical", "Fire Rescue"],
      responseArea: ["Zone-A", "Zone-B"]
    },
    performance: {
      responseMetrics: {
        averageResponseTime: 4.2,
        slaCompliance: 94.5,
        casesHandled: 156,
        successRate: 98.1
      },
      workloadDistribution: {
        currentCases: 3,
        averageCaseLoad: 5.2,
        peakCapacity: 15
      },
      efficiency: {
        productivityScore: 92.0,
        resourceUtilization: 87.5,
        costEfficiency: 89.2
      }
    }
  },
  {
    id: "unit-002",
    orgId: "org-001",
    unitId: "U002",
    unitName: "Medical Response Unit Beta",
    unitSourceId: "SRC002",
    unitTypeId: "TYPE002",
    priority: 2,
    compId: "COMP001",
    deptId: "DEPT001",
    commId: "COMM001",
    stnId: "STN002",
    plateNo: "MED-002",
    provinceCode: "BKK",
    active: true,
    username: "med_beta",
    isLogin: false,
    isFreeze: false,
    isOutArea: true,
    locLat: 13.7661,
    locLon: 100.5379,
    locAlt: 0,
    locBearing: 45,
    locSpeed: 35,
    locProvider: "GPS",
    locGpsTime: "2025-08-27T10:25:00Z",
    locSatellites: 8,
    locAccuracy: 5.2,
    locLastUpdateTime: "2025-08-27T10:25:00Z",
    breakDuration: 0,
    healthChk: "OK",
    healthChkTime: "2025-08-27T10:25:00Z",
    sttId: "STATUS_BUSY",
    createdAt: "2025-02-01T08:00:00Z",
    updatedAt: "2025-08-27T10:25:00Z",
    createdBy: "admin",
    updatedBy: "supervisor",
    unitStructure: {
      parentUnitId: "unit-001",
      subUnits: [],
      organizationLevel: 2,
      unitType: "team",
      reportingStructure: ["unit-001", "supervisor-001"]
    },
    operational: {
      capacity: {
        maxPersonnel: 4,
        currentPersonnel: 4,
        availablePersonnel: 0,
        utilizationRate: 100
      },
      availability: {
        status: "busy",
        schedule: "12h shifts",
        nextAvailable: "14:30"
      },
      equipment: {
        vehicles: ["Ambulance-B1"],
        specializedEquipment: ["Advanced-Life-Support"],
        maintenanceStatus: "good"
      },
      specializations: ["Emergency Medical", "Critical Care"],
      responseArea: ["Zone-C", "Zone-D"]
    },
    performance: {
      responseMetrics: {
        averageResponseTime: 3.8,
        slaCompliance: 96.2,
        casesHandled: 89,
        successRate: 99.1
      },
      workloadDistribution: {
        currentCases: 1,
        averageCaseLoad: 3.1,
        peakCapacity: 8
      },
      efficiency: {
        productivityScore: 95.5,
        resourceUtilization: 92.0,
        costEfficiency: 91.8
      }
    }
  },
  {
    id: "unit-003",
    orgId: "org-001",
    unitId: "U003",
    unitName: "Traffic Control Squad",
    unitSourceId: "SRC003",
    unitTypeId: "TYPE003",
    priority: 3,
    compId: "COMP001",
    deptId: "DEPT002",
    commId: "COMM001",
    stnId: "STN003",
    plateNo: "TFC-003",
    provinceCode: "BKK",
    active: false,
    username: "traffic_squad",
    isLogin: false,
    isFreeze: true,
    isOutArea: false,
    locLat: 13.7308,
    locLon: 100.5418,
    locAlt: 0,
    locBearing: 180,
    locSpeed: 0,
    locProvider: "GPS",
    locGpsTime: "2025-08-27T09:45:00Z",
    locSatellites: 6,
    locAccuracy: 8.1,
    locLastUpdateTime: "2025-08-27T09:45:00Z",
    breakDuration: 30,
    healthChk: "MAINTENANCE",
    healthChkTime: "2025-08-27T09:45:00Z",
    sttId: "STATUS_MAINTENANCE",
    createdAt: "2025-03-10T08:00:00Z",
    updatedAt: "2025-08-27T09:45:00Z",
    createdBy: "admin", 
    updatedBy: "maintenance",
    unitStructure: {
      parentUnitId: "unit-001",
      subUnits: [],
      organizationLevel: 3,
      unitType: "squad",
      reportingStructure: ["unit-001", "supervisor-002"]
    },
    operational: {
      capacity: {
        maxPersonnel: 6,
        currentPersonnel: 4,
        availablePersonnel: 0,
        utilizationRate: 0
      },
      availability: {
        status: "maintenance",
        schedule: "8h shifts",
        nextAvailable: "16:00"
      },
      equipment: {
        vehicles: ["Motorcycle-M1", "Patrol-Car-P1"],
        specializedEquipment: ["Traffic-Cones", "Speed-Radar"],
        maintenanceStatus: "needs_attention"
      },
      specializations: ["Traffic Control", "Speed Enforcement"],
      responseArea: ["Highway-1", "Downtown"]
    },
    performance: {
      responseMetrics: {
        averageResponseTime: 6.1,
        slaCompliance: 87.3,
        casesHandled: 234,
        successRate: 96.4
      },
      workloadDistribution: {
        currentCases: 0,
        averageCaseLoad: 8.1,
        peakCapacity: 20
      },
      efficiency: {
        productivityScore: 78.2,
        resourceUtilization: 65.4,
        costEfficiency: 83.7
      }
    }
  }
];

const UnitManagementComponent: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive" | "maintenance">("all");
  const [filterUnitType, setFilterUnitType] = useState<"all" | "department" | "team" | "squad" | "individual">("all");

  // Filter and search logic
  const filteredUnits = useMemo(() => {
    return mockUnits.filter(unit => {
      const matchesSearch = unit.unitName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        unit.unitId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        unit.plateNo.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = filterStatus === "all" || 
        (filterStatus === "active" && unit.active) ||
        (filterStatus === "inactive" && !unit.active) ||
        (filterStatus === "maintenance" && unit.healthChk === "MAINTENANCE");
      
      const matchesUnitType = filterUnitType === "all" || 
        unit.unitStructure?.unitType === filterUnitType;

      return matchesSearch && matchesStatus && matchesUnitType;
    });
  }, [searchTerm, filterStatus, filterUnitType]);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-6">
      <div className="mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              {[
                { key: "overview", label: "Overview", icon: Building },
                { key: "hierarchy", label: "Hierarchy", icon: GroupIcon },
                { key: "performance", label: "Performance", icon: PieChartIcon },
                { key: "matrix", label: "Matrix", icon: Settings }
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setViewMode(key as ViewMode)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === key 
                      ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{label}</span>
                </button>
              ))}
            </div>
            
            <button className="ml-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Unit
            </button>
          </div>
        </div>

        {viewMode === "overview" &&
          <UnitOverviewContent
            filteredUnits={filteredUnits}
            filterStatus={filterStatus}
            filterUnitType={filterUnitType}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            setFilterStatus={setFilterStatus}
            setFilterUnitType={setFilterUnitType}
          />
        }

        {/* Hierarchy View */}
        {viewMode === "hierarchy" && (
          <div className="bg-white dark:bg-gray-800 py-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Organization Hierarchy</h3>
            <div className="space-y-4">
              {mockUnits
                .filter(unit => !unit.unitStructure?.parentUnitId)
                .map(parentUnit => (
                  <div key={parentUnit.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <Building className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <span className="font-medium text-gray-900 dark:text-white">{parentUnit.unitName}</span>
                      <UnitStatusBadgeContent status={parentUnit.active ? "active" : "inactive"} />
                    </div>
                    
                    {/* Sub-units */}
                    <div className="ml-8 space-y-2">
                      {mockUnits
                        .filter(unit => unit.unitStructure?.parentUnitId === parentUnit.id)
                        .map(subUnit => (
                          <div key={subUnit.id} className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-700 rounded">
                            <GroupIcon className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-700 dark:text-gray-300">{subUnit.unitName}</span>
                            <UnitStatusBadgeContent status={subUnit.operational?.availability.status || "offline"} />
                          </div>
                        ))
                      }
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
        )}

        {/* Matrix View */}
        {viewMode === "matrix" && (
          <div className="bg-white dark:bg-gray-800 py-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Unit Capability Matrix</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left p-2 font-medium text-gray-900 dark:text-white">Unit</th>
                    <th className="text-center p-2 font-medium text-gray-900 dark:text-white">Emergency Medical</th>
                    <th className="text-center p-2 font-medium text-gray-900 dark:text-white">Fire Rescue</th>
                    <th className="text-center p-2 font-medium text-gray-900 dark:text-white">Traffic Control</th>
                    <th className="text-center p-2 font-medium text-gray-900 dark:text-white">Critical Care</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUnits.map(unit => (
                    <tr key={unit.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="p-2">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                            <Building className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                          </div>
                          <span className="font-medium text-gray-900 dark:text-white">{unit.unitName}</span>
                        </div>
                      </td>
                      <td className="text-center p-2">
                        {unit.operational?.specializations.includes("Emergency Medical") ? 
                          <CheckCircleIcon className="w-5 h-5 text-green-500 mx-auto" /> : 
                          <CloseIcon className="w-5 h-5 text-gray-300 dark:text-gray-600 mx-auto" />
                        }
                      </td>
                      <td className="text-center p-2">
                        {unit.operational?.specializations.includes("Fire Rescue") ? 
                          <CheckCircleIcon className="w-5 h-5 text-green-500 mx-auto" /> : 
                          <CloseIcon className="w-5 h-5 text-gray-300 dark:text-gray-600 mx-auto" />
                        }
                      </td>
                      <td className="text-center p-2">
                        {unit.operational?.specializations.includes("Traffic Control") ? 
                          <CheckCircleIcon className="w-5 h-5 text-green-500 mx-auto" /> : 
                          <CloseIcon className="w-5 h-5 text-gray-300 dark:text-gray-600 mx-auto" />
                        }
                      </td>
                      <td className="text-center p-2">
                        {unit.operational?.specializations.includes("Critical Care") ? 
                          <CheckCircleIcon className="w-5 h-5 text-green-500 mx-auto" /> : 
                          <CloseIcon className="w-5 h-5 text-gray-300 dark:text-gray-600 mx-auto" />
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UnitManagementComponent;
