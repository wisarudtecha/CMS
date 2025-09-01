// src/components/device/UnitManagement.tsx
import React, { useState, useMemo } from "react";
import { 
  Building, 
  Users, 
  MapPin,
  Edit,
  Eye,
  Plus,
  Settings,
  Activity,
  TrendingUp,
  Search,
  Filter,
  MoreVertical,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Car,
  Radio
} from "lucide-react";

// Enhanced Unit interface building on the existing Unit type
interface EnhancedUnit {
  id: string;
  orgId: string;
  unitId: string;
  unitName: string;
  unitSourceId: string;
  unitTypeId: string;
  priority: number;
  compId: string;
  deptId: string;
  commId: string;
  stnId: string;
  plateNo: string;
  provinceCode: string;
  active: boolean;
  username: string;
  isLogin: boolean;
  isFreeze: boolean;
  isOutArea: boolean;
  locLat: number;
  locLon: number;
  locAlt: number;
  locBearing: number;
  locSpeed: number;
  locProvider: string;
  locGpsTime: string;
  locSatellites: number;
  locAccuracy: number;
  locLastUpdateTime: string;
  breakDuration: number;
  healthChk: string;
  healthChkTime: string;
  sttId: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  
  // Enhanced fields for advanced management
  unitStructure?: {
    parentUnitId?: string;
    subUnits: string[];
    organizationLevel: number;
    unitType: "department" | "team" | "squad" | "individual";
    reportingStructure: string[];
  };
  operational?: {
    capacity: {
      maxPersonnel: number;
      currentPersonnel: number;
      availablePersonnel: number;
      utilizationRate: number;
    };
    availability: {
      status: "available" | "busy" | "maintenance" | "offline";
      schedule: string;
      nextAvailable: string;
    };
    equipment: {
      vehicles: string[];
      specializedEquipment: string[];
      maintenanceStatus: "good" | "needs_attention" | "critical";
    };
    specializations: string[];
    responseArea: string[];
  };
  performance?: {
    responseMetrics: {
      averageResponseTime: number;
      slaCompliance: number;
      casesHandled: number;
      successRate: number;
    };
    workloadDistribution: {
      currentCases: number;
      averageCaseLoad: number;
      peakCapacity: number;
    };
    efficiency: {
      productivityScore: number;
      resourceUtilization: number;
      costEfficiency: number;
    };
  };
}

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

type ViewMode = "overview" | "hierarchy" | "performance" | "matrix";
type DisplayMode = "cards" | "table";

const UnitManagementComponent: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>("overview");
  const [displayMode, setDisplayMode] = useState<DisplayMode>("cards");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUnits, setSelectedUnits] = useState<Set<string>>(new Set());
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive" | "maintenance">("all");
  const [filterUnitType, setFilterUnitType] = useState<"all" | "department" | "team" | "squad" | "individual">("all");
  const [previewUnit, setPreviewUnit] = useState<EnhancedUnit | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");

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

  // Selection handlers
  const handleSelectAll = () => {
    if (selectedUnits.size === filteredUnits.length) {
      setSelectedUnits(new Set());
    } else {
      setSelectedUnits(new Set(filteredUnits.map(unit => unit.id)));
    }
  };

  const handleSelectUnit = (unitId: string) => {
    const newSelection = new Set(selectedUnits);
    if (newSelection.has(unitId)) {
      newSelection.delete(unitId);
    } else {
      newSelection.add(unitId);
    }
    setSelectedUnits(newSelection);
  };

  // Status badge component
  const StatusBadge: React.FC<{ status: string; className?: string }> = ({ status, className = "" }) => {
    const getStatusConfig = (status: string) => {
      switch (status.toLowerCase()) {
        case "available":
          return { color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200", icon: CheckCircle };
        case "busy":
          return { color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200", icon: Clock };
        case "maintenance":
          return { color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200", icon: AlertTriangle };
        case "offline":
          return { color: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200", icon: XCircle };
        default:
          return { color: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200", icon: XCircle };
      }
    };

    const config = getStatusConfig(status);
    const IconComponent = config.icon;

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color} ${className}`}>
        <IconComponent className="w-3 h-3 mr-1" />
        {status}
      </span>
    );
  };

  // Unit card component
  const UnitCard: React.FC<{ unit: EnhancedUnit; isSelected: boolean }> = ({ unit, isSelected }) => (
    <div 
      className={`bg-white dark:bg-gray-800 rounded-lg border-2 transition-all cursor-pointer hover:shadow-md ${
        isSelected ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : "border-gray-200 dark:border-gray-700"
      }`}
      onClick={() => {
        setPreviewUnit(unit);
        setShowPreview(true);
      }}
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
              <Building className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{unit.unitName}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">{unit.unitId} • {unit.plateNo}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => {
                e.stopPropagation();
                handleSelectUnit(unit.id);
              }}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
              <MoreVertical className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Status and Type */}
        <div className="flex items-center gap-2 mb-3">
          <StatusBadge status={unit.operational?.availability.status || (unit.active ? "available" : "inactive")} />
          <span className={`px-2 py-1 rounded text-xs font-medium ${
            unit.unitStructure?.unitType === "department" ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200" :
            unit.unitStructure?.unitType === "team" ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" :
            unit.unitStructure?.unitType === "squad" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" :
            "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
          }`}>
            {unit.unitStructure?.unitType || "Unknown"}
          </span>
        </div>

        {/* Metrics */}
        {unit.operational && (
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="text-center">
              <div className="text-xs text-gray-500 dark:text-gray-400">Personnel</div>
              <div className="text-sm font-semibold text-gray-900 dark:text-white">
                {unit.operational.capacity.currentPersonnel}/{unit.operational.capacity.maxPersonnel}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-500 dark:text-gray-400">Utilization</div>
              <div className="text-sm font-semibold text-gray-900 dark:text-white">
                {unit.operational.capacity.utilizationRate}%
              </div>
            </div>
          </div>
        )}

        {/* Performance Metrics */}
        {unit.performance && (
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-gray-400" />
              <span className="text-gray-600 dark:text-gray-400">
                {unit.performance.responseMetrics.averageResponseTime}min avg
              </span>
            </div>
            <div className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-gray-400" />
              <span className="text-gray-600 dark:text-gray-400">
                {unit.performance.responseMetrics.slaCompliance}% SLA
              </span>
            </div>
          </div>
        )}

        {/* Location Status */}
        <div className="flex items-center gap-1 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
          <MapPin className="w-3 h-3 text-gray-400" />
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {unit.isOutArea ? "Out of Area" : "In Area"} • 
            {unit.isLogin ? " Online" : " Offline"}
          </span>
        </div>
      </div>
    </div>
  );

  // Performance Overview Component
  const PerformanceOverview: React.FC = () => (
    <div className="bg-white dark:bg-gray-800 rounded-lg py-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Performance Overview
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
          <div className="text-green-700 dark:text-green-400 text-sm font-medium">Active Units</div>
          <div className="text-2xl font-bold text-green-800 dark:text-green-300">
            {mockUnits.filter(u => u.active).length}
          </div>
          <div className="text-xs text-green-600 dark:text-green-500">
            of {mockUnits.length} total
          </div>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <div className="text-blue-700 dark:text-blue-400 text-sm font-medium">Avg Response</div>
          <div className="text-2xl font-bold text-blue-800 dark:text-blue-300">
            {(mockUnits.reduce((acc, u) => acc + (u.performance?.responseMetrics.averageResponseTime || 0), 0) / mockUnits.length).toFixed(1)}m
          </div>
          <div className="text-xs text-blue-600 dark:text-blue-500">
            across all units
          </div>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
          <div className="text-purple-700 dark:text-purple-400 text-sm font-medium">SLA Compliance</div>
          <div className="text-2xl font-bold text-purple-800 dark:text-purple-300">
            {(mockUnits.reduce((acc, u) => acc + (u.performance?.responseMetrics.slaCompliance || 0), 0) / mockUnits.length).toFixed(1)}%
          </div>
          <div className="text-xs text-purple-600 dark:text-purple-500">
            organization avg
          </div>
        </div>
        <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
          <div className="text-orange-700 dark:text-orange-400 text-sm font-medium">Total Cases</div>
          <div className="text-2xl font-bold text-orange-800 dark:text-orange-300">
            {mockUnits.reduce((acc, u) => acc + (u.performance?.responseMetrics.casesHandled || 0), 0)}
          </div>
          <div className="text-xs text-orange-600 dark:text-orange-500">
            this period
          </div>
        </div>
      </div>
    </div>
  );

  // Preview Modal Component
  const PreviewModal: React.FC = () => {
    if (!showPreview || !previewUnit) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <Building className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{previewUnit.unitName}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {previewUnit.unitId} • {previewUnit.unitStructure?.unitType || "Unknown Type"}
                </p>
              </div>
            </div>
            <button 
              onClick={() => setShowPreview(false)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <XCircle className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            {[
              { key: "basic", label: "Basic Info", icon: Building },
              { key: "operational", label: "Operational", icon: Activity },
              { key: "performance", label: "Performance", icon: TrendingUp },
              { key: "location", label: "Location", icon: MapPin }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === key
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === "basic" && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Unit ID</label>
                  <div className="mt-1 text-sm text-gray-900 dark:text-white font-mono bg-gray-50 dark:bg-gray-900 p-2 rounded">
                    {previewUnit.unitId}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Priority</label>
                  <div className="mt-1 text-sm text-gray-900 dark:text-white">{previewUnit.priority}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Plate Number</label>
                  <div className="mt-1 text-sm text-gray-900 dark:text-white font-mono bg-gray-50 dark:bg-gray-900 p-2 rounded">
                    {previewUnit.plateNo}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Province</label>
                  <div className="mt-1 text-sm text-gray-900 dark:text-white">{previewUnit.provinceCode}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Active Status</label>
                  <div className="mt-1">
                    <StatusBadge status={previewUnit.active ? "active" : "inactive"} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Login Status</label>
                  <div className="mt-1">
                    <StatusBadge status={previewUnit.isLogin ? "online" : "offline"} />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "operational" && previewUnit.operational && (
              <div className="space-y-6">
                {/* Capacity */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Capacity Management</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                      <div className="text-sm text-gray-600 dark:text-gray-400">Personnel</div>
                      <div className="text-lg font-semibold text-gray-900 dark:text-white">
                        {previewUnit.operational.capacity.currentPersonnel}/{previewUnit.operational.capacity.maxPersonnel}
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all"
                          style={{ width: `${previewUnit.operational.capacity.utilizationRate}%` }}
                        />
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {previewUnit.operational.capacity.utilizationRate}% utilization
                      </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                      <div className="text-sm text-gray-600 dark:text-gray-400">Availability</div>
                      <div className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
                        {previewUnit.operational.availability.status}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Schedule: {previewUnit.operational.availability.schedule}
                      </div>
                      <div className="text-xs text-gray-500">
                        Next: {previewUnit.operational.availability.nextAvailable}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Equipment */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Equipment & Resources</h4>
                  <div className="space-y-3">
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Vehicles</div>
                      <div className="flex flex-wrap gap-2">
                        {previewUnit.operational.equipment.vehicles.map((vehicle, idx) => (
                          <span key={idx} className="inline-flex items-center px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs">
                            <Car className="w-3 h-3 mr-1" />
                            {vehicle}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Specialized Equipment</div>
                      <div className="flex flex-wrap gap-2">
                        {previewUnit.operational.equipment.specializedEquipment.map((equipment, idx) => (
                          <span key={idx} className="inline-flex items-center px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded text-xs">
                            <Radio className="w-3 h-3 mr-1" />
                            {equipment}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Maintenance Status</div>
                      <StatusBadge status={previewUnit.operational.equipment.maintenanceStatus} />
                    </div>
                  </div>
                </div>

                {/* Specializations */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Specializations</h4>
                  <div className="flex flex-wrap gap-2">
                    {previewUnit.operational.specializations.map((spec, idx) => (
                      <span key={idx} className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm">
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "performance" && previewUnit.performance && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                    <div className="text-green-700 dark:text-green-400 text-sm font-medium">Response Time</div>
                    <div className="text-2xl font-bold text-green-800 dark:text-green-300">
                      {previewUnit.performance.responseMetrics.averageResponseTime} min
                    </div>
                    <div className="text-xs text-green-600 dark:text-green-500">average</div>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <div className="text-blue-700 dark:text-blue-400 text-sm font-medium">SLA Compliance</div>
                    <div className="text-2xl font-bold text-blue-800 dark:text-blue-300">
                      {previewUnit.performance.responseMetrics.slaCompliance}%
                    </div>
                    <div className="text-xs text-blue-600 dark:text-blue-500">compliance rate</div>
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                    <div className="text-purple-700 dark:text-purple-400 text-sm font-medium">Cases Handled</div>
                    <div className="text-2xl font-bold text-purple-800 dark:text-purple-300">
                      {previewUnit.performance.responseMetrics.casesHandled}
                    </div>
                    <div className="text-xs text-purple-600 dark:text-purple-500">total cases</div>
                  </div>
                  <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
                    <div className="text-orange-700 dark:text-orange-400 text-sm font-medium">Success Rate</div>
                    <div className="text-2xl font-bold text-orange-800 dark:text-orange-300">
                      {previewUnit.performance.responseMetrics.successRate}%
                    </div>
                    <div className="text-xs text-orange-600 dark:text-orange-500">success rate</div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Workload Distribution</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {previewUnit.performance.workloadDistribution.currentCases}
                      </div>
                      <div className="text-xs text-gray-500">Current Cases</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {previewUnit.performance.workloadDistribution.averageCaseLoad}
                      </div>
                      <div className="text-xs text-gray-500">Average Load</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {previewUnit.performance.workloadDistribution.peakCapacity}
                      </div>
                      <div className="text-xs text-gray-500">Peak Capacity</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "location" && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Latitude</label>
                    <div className="mt-1 text-sm text-gray-900 dark:text-white font-mono bg-gray-50 dark:bg-gray-900 p-2 rounded">
                      {previewUnit.locLat.toFixed(6)}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Longitude</label>
                    <div className="mt-1 text-sm text-gray-900 dark:text-white font-mono bg-gray-50 dark:bg-gray-900 p-2 rounded">
                      {previewUnit.locLon.toFixed(6)}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">GPS Accuracy</label>
                    <div className="mt-1 text-sm text-gray-900 dark:text-white">{previewUnit.locAccuracy}m</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Satellites</label>
                    <div className="mt-1 text-sm text-gray-900 dark:text-white">{previewUnit.locSatellites}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Provider</label>
                    <div className="mt-1 text-sm text-gray-900 dark:text-white">{previewUnit.locProvider}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Last Update</label>
                    <div className="mt-1 text-sm text-gray-900 dark:text-white">
                      {new Date(previewUnit.locLastUpdateTime).toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">Location Status</h4>
                    <div className="flex gap-2">
                      <StatusBadge status={previewUnit.isOutArea ? "out-of-area" : "in-area"} />
                      <StatusBadge status={previewUnit.isLogin ? "online" : "offline"} />
                    </div>
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Speed: {previewUnit.locSpeed} km/h • Bearing: {previewUnit.locBearing}°
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
            <button 
              onClick={() => setShowPreview(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            >
              Close
            </button>
            <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-2">
              <Edit className="w-4 h-4" />
              Edit Unit
            </button>
          </div>
        </div>
      </div>
    );
  };

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
                { key: "hierarchy", label: "Hierarchy", icon: Users },
                { key: "performance", label: "Performance", icon: TrendingUp },
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

        {/* Performance Overview (shown in overview mode) */}
        {viewMode === "overview" && <PerformanceOverview />}

        {/* Search and Filters */}
        {viewMode === "overview" && (
          <div className="bg-white dark:bg-gray-800 rounded-lg py-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search units by name, ID, or plate number..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Filters */}
              <div className="flex gap-3">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="maintenance">Maintenance</option>
                </select>

                <select
                  value={filterUnitType}
                  onChange={(e) => setFilterUnitType(e.target.value as typeof filterUnitType)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="all">All Types</option>
                  <option value="department">Department</option>
                  <option value="team">Team</option>
                  <option value="squad">Squad</option>
                  <option value="individual">Individual</option>
                </select>

                <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                  <Filter className="w-4 h-4" />
                  <span className="hidden sm:inline">More Filters</span>
                </button>
              </div>

              {/* Display Mode Toggle */}
              <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                <button
                  onClick={() => setDisplayMode("cards")}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    displayMode === "cards" 
                      ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                      : "text-gray-600 dark:text-gray-400"
                  }`}
                >
                  Cards
                </button>
                <button
                  onClick={() => setDisplayMode("table")}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    displayMode === "table"
                      ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                      : "text-gray-600 dark:text-gray-400"
                  }`}
                >
                  Table
                </button>
              </div>
            </div>

            {/* Bulk Actions */}
            {selectedUnits.size > 0 && (
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-blue-700 dark:text-blue-300">
                    {selectedUnits.size} unit(s) selected
                  </span>
                  <div className="flex gap-2">
                    <button className="px-3 py-1 text-xs font-medium text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900 hover:bg-green-200 dark:hover:bg-green-800 rounded transition-colors">
                      Activate
                    </button>
                    <button className="px-3 py-1 text-xs font-medium text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900 hover:bg-red-200 dark:hover:bg-red-800 rounded transition-colors">
                      Deactivate
                    </button>
                    <button 
                      onClick={() => setSelectedUnits(new Set())}
                      className="px-3 py-1 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Content Area */}
        {viewMode === "overview" && (
          <div className="bg-white dark:bg-gray-800">
            {/* Table Header */}
            {displayMode === "table" && (
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedUnits.size === filteredUnits.length && filteredUnits.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-4"
                  />
                  <div className="grid grid-cols-6 gap-4 flex-1 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <div>Unit</div>
                    <div>Type</div>
                    <div>Status</div>
                    <div>Personnel</div>
                    <div>Performance</div>
                    <div className="text-center">Actions</div>
                  </div>
                </div>
              </div>
            )}

            {/* Content */}
            <div className={displayMode === "cards" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "divide-y divide-gray-200 dark:divide-gray-700"}>
              {filteredUnits.map((unit) => 
                displayMode === "cards" ? (
                  <UnitCard key={unit.id} unit={unit} isSelected={selectedUnits.has(unit.id)} />
                ) : (
                  <div key={unit.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedUnits.has(unit.id)}
                        onChange={() => handleSelectUnit(unit.id)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-4"
                      />
                      <div className="grid grid-cols-6 gap-4 flex-1 items-center">
                        {/* Unit Info */}
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                            <Building className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <div className="font-medium text-sm text-gray-900 dark:text-white">{unit.unitName}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">{unit.unitId}</div>
                          </div>
                        </div>

                        {/* Type */}
                        <div>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            unit.unitStructure?.unitType === "department" ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200" :
                            unit.unitStructure?.unitType === "team" ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" :
                            unit.unitStructure?.unitType === "squad" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" :
                            "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
                          }`}>
                            {unit.unitStructure?.unitType || "Unknown"}
                          </span>
                        </div>

                        {/* Status */}
                        <div>
                          <StatusBadge status={unit.operational?.availability.status || (unit.active ? "available" : "inactive")} />
                        </div>

                        {/* Personnel */}
                        <div className="text-sm">
                          {unit.operational ? (
                            <div>
                              <div className="text-gray-900 dark:text-white font-medium">
                                {unit.operational.capacity.currentPersonnel}/{unit.operational.capacity.maxPersonnel}
                              </div>
                              <div className="text-xs text-gray-500">
                                {unit.operational.capacity.utilizationRate}% util
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-400">N/A</span>
                          )}
                        </div>

                        {/* Performance */}
                        <div className="text-sm">
                          {unit.performance ? (
                            <div>
                              <div className="text-gray-900 dark:text-white font-medium">
                                {unit.performance.responseMetrics.averageResponseTime}m
                              </div>
                              <div className="text-xs text-gray-500">
                                {unit.performance.responseMetrics.slaCompliance}% SLA
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-400">N/A</span>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex justify-center gap-1">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setPreviewUnit(unit);
                              setShowPreview(true);
                            }}
                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            title="Edit Unit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            title="Performance"
                          >
                            <TrendingUp className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>

            {/* Empty State */}
            {filteredUnits.length === 0 && (
              <div className="p-12 text-center">
                <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No units found</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  {searchTerm || filterStatus !== "all" || filterUnitType !== "all" 
                    ? "Try adjusting your search or filters" 
                    : "Get started by creating your first unit"}
                </p>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                  Create Unit
                </button>
              </div>
            )}
          </div>
        )}

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
                      <StatusBadge status={parentUnit.active ? "active" : "inactive"} />
                    </div>
                    
                    {/* Sub-units */}
                    <div className="ml-8 space-y-2">
                      {mockUnits
                        .filter(unit => unit.unitStructure?.parentUnitId === parentUnit.id)
                        .map(subUnit => (
                          <div key={subUnit.id} className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-700 rounded">
                            <Users className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-700 dark:text-gray-300">{subUnit.unitName}</span>
                            <StatusBadge status={subUnit.operational?.availability.status || "offline"} />
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
                          <CheckCircle className="w-5 h-5 text-green-500 mx-auto" /> : 
                          <XCircle className="w-5 h-5 text-gray-300 dark:text-gray-600 mx-auto" />
                        }
                      </td>
                      <td className="text-center p-2">
                        {unit.operational?.specializations.includes("Fire Rescue") ? 
                          <CheckCircle className="w-5 h-5 text-green-500 mx-auto" /> : 
                          <XCircle className="w-5 h-5 text-gray-300 dark:text-gray-600 mx-auto" />
                        }
                      </td>
                      <td className="text-center p-2">
                        {unit.operational?.specializations.includes("Traffic Control") ? 
                          <CheckCircle className="w-5 h-5 text-green-500 mx-auto" /> : 
                          <XCircle className="w-5 h-5 text-gray-300 dark:text-gray-600 mx-auto" />
                        }
                      </td>
                      <td className="text-center p-2">
                        {unit.operational?.specializations.includes("Critical Care") ? 
                          <CheckCircle className="w-5 h-5 text-green-500 mx-auto" /> : 
                          <XCircle className="w-5 h-5 text-gray-300 dark:text-gray-600 mx-auto" />
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Preview Modal */}
        <PreviewModal />
      </div>
    </div>
  );
};

export default UnitManagementComponent;
