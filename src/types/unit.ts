// /src/types/unit.ts
import type { BaseEntity } from "@/types";

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

export interface Unit extends BaseEntity {
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
}

export interface UnitMetrics {
  activeUnits: number | string;
  avgResponse: number | string;
  slaCompliance: number | string;
  totalCases: number | string;
}

export interface UnitQueryParams {
  start?: number | 0;
  length?: number | 10;
}

export type UnitUpdateData = Omit<Unit, keyof BaseEntity>;

export type ViewMode = "overview" | "hierarchy" | "performance" | "matrix";
export type DisplayMode = "cards" | "table";


export interface UnitStatus {
  id: string;
  sttId: string;
  sttName: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}