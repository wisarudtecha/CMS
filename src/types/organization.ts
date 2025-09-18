// /src/types/organization.ts
export interface OrgStructureItem {
  id: string;
  orgId: string;
  deptId: string;
  commId: string;
  stnId: string;
  stationEn: string;
  stationTh: string;
  stationActive: boolean;
  commandEn: string;
  commandTh: string;
  commandActive: boolean;
  deptEn: string;
  deptTh: string;
  deptActive: boolean;
}
