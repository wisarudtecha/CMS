// /src/types/organization.ts
import type { BaseEntity } from "@/types";

export interface Department extends BaseEntity {
  orgId: string;
  deptId: string;
  en: string;
  th: string;
  active: boolean;
}

export interface Command extends BaseEntity {
  orgId: string;
  deptId: string;
  commId: string;
  en: string;
  th: string;
  active: boolean;
}

export interface Station extends BaseEntity {
  orgId: string;
  deptId: string;
  commId: string;
  stnId: string;
  en: string;
  th: string;
  active: boolean;
}

export interface Organization {
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

export interface OrganizationManagementProps {
  departments?: Department[];
  commands?: Command[];
  stations?: Station[];
  organizations?: Organization[];
  className?: string;
  filteredOrganizations?: Organization[];
  searchQuery?: string;
  setSearchQuery?: React.Dispatch<React.SetStateAction<string>>;
}

export interface OrganizationQueryParams {
  start?: number | 0;
  length?: number | 10;
}

export interface BranchLocation {
  id: string;
  name: { en: string; th: string };
  address: string;
  city: string;
  province: string;
  coordinates?: { lat: number; lon: number };
  active: boolean;
}

export interface ContactInfo {
  name: string;
  email: string;
  phone: string;
  role: string;
}

export interface IntegrationConfig {
  id: string;
  service: string;
  enabled: boolean;
  configuration: Record<string, unknown>;
  lastSync?: Date;
}

export interface WorkingHours {
  monday: { start: string; end: string; active: boolean };
  tuesday: { start: string; end: string; active: boolean };
  wednesday: { start: string; end: string; active: boolean };
  thursday: { start: string; end: string; active: boolean };
  friday: { start: string; end: string; active: boolean };
  saturday: { start: string; end: string; active: boolean };
  sunday: { start: string; end: string; active: boolean };
}

export interface PolicyDocument {
  id: string;
  title: { en: string; th: string };
  version: string;
  effectiveDate: Date;
  content: string;
  mandatory: boolean;
}

export interface ComplianceRequirement {
  id: string;
  standard: string;
  level: "required" | "recommended" | "optional";
  status: "compliant" | "non-compliant" | "pending";
  lastAudit?: Date;
  nextAudit?: Date;
}

export interface RetentionPolicy {
  cases: number; // months
  users: number; // months
  logs: number; // months
  attachments: number; // months
}

export interface AuditConfiguration {
  enabled: boolean;
  logLevel: "basic" | "detailed" | "comprehensive";
  retentionDays: number;
  alertThresholds: Record<string, number>;
}

export interface ServiceLimits {
  maxUsers: number;
  maxCasesPerMonth: number;
  maxStorageGB: number;
  maxAPICallsPerDay: number;
}

export interface BillingInfo {
  plan: string;
  status: "active" | "past_due" | "cancelled";
  nextBillingDate: Date;
  amount: number;
  currency: string;
}

export interface OrganizationProfile {
  id: string;
  orgId: string;
  organizationDetails: {
    legalName: string;
    displayName: { en: string; th: string };
    businessType: string;
    industry: string;
    size: "small" | "medium" | "large" | "enterprise";
    establishedYear: number;
    taxId: string;
    registrationNumber: string;
  };
  location: {
    headquarters: {
      address: string;
      city: string;
      province: string;
      postalCode: string;
      country: string;
      coordinates?: { lat: number; lon: number };
    };
    branches: BranchLocation[];
    timezone: string;
    locale: string;
  };
  contact: {
    primaryEmail: string;
    primaryPhone: string;
    website?: string;
    socialMedia: Record<string, string>;
    emergencyContact: ContactInfo;
  };
  configuration: {
    branding: {
      theme: "mioc" | "metthier" | "custom";
      logo?: string;
      colors: {
        primary: string;
        secondary: string;
        accent: string;
      };
      customCSS?: string;
    };
    features: {
      [key: string]: boolean;
    };
    integrations: IntegrationConfig[];
    customizations: {
      defaultLanguage: "en" | "th";
      dateFormat: string;
      timeFormat: "12h" | "24h";
      currency: string;
      workingHours: WorkingHours;
    };
  };
  governance: {
    policies: PolicyDocument[];
    compliance: ComplianceRequirement[];
    dataRetention: RetentionPolicy;
    auditSettings: AuditConfiguration;
  };
  subscription: {
    plan: "basic" | "professional" | "enterprise";
    features: string[];
    limits: ServiceLimits;
    billing: BillingInfo;
  };
  metrics: {
    totalUsers: number;
    totalCases: number;
    activeUnits: number;
    lastActivity: Date;
    systemHealth: "healthy" | "warning" | "critical";
  };
  active: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}
