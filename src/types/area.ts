// /src/types/area.ts
export interface AreaCoverage {
  areaId: string;
  unitId: string;
  unitName: string;
  primaryResponder: boolean;
  backupLevel: number;
  averageResponseTime: number;
  effectivenessScore: number;
  capacity: {
    current: number;
    maximum: number;
    reserved: number;
  };
}

export interface ResponseArea {
  id: string;
  orgId: string;
  areaCode: string;
  areaName: { en: string; th: string };
  geometry: {
    type: "Polygon" | "Circle" | "Custom";
    coordinates: number[][];
    radius?: number;
    bounds: {
      north: number;
      south: number;
      east: number;
      west: number;
    };
  };
  priority: number;
  population: number;
  riskLevel: "low" | "medium" | "high" | "critical";
  responseTimeTarget: number; // minutes
  active: boolean;
  metadata: {
    urbanDensity: number;
    accessibilityScore: number;
    trafficComplexity: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ResponseMetrics {
  areaId: string;
  totalCases: number;
  averageResponseTime: number;
  slaCompliance: number;
  activeIncidents: number;
  availableUnits: number;
  demandTrend: "up" | "down" | "stable";
}
