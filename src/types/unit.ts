// /src/types/unit.ts
export interface EnhancedUnit {
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

export type ViewMode = "overview" | "hierarchy" | "performance" | "matrix";
export type DisplayMode = "cards" | "table";
