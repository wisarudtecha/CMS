// /src/components/admin/user-management/organization/OrganizationManagement.tsx
import React, { useState, useMemo } from "react";
import { 
  Building2, 
  Settings, 
  Users, 
  Globe, 
  Shield,
  BarChart3, 
  FileText,
  Plus,
  Edit3,
  Save,
  X,
  Search,
  Filter,
  CheckCircle,
  RefreshCw
} from "lucide-react";

// Types extending existing organization structure
interface OrganizationProfile {
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

interface BranchLocation {
  id: string;
  name: { en: string; th: string };
  address: string;
  city: string;
  province: string;
  coordinates?: { lat: number; lon: number };
  active: boolean;
}

interface ContactInfo {
  name: string;
  email: string;
  phone: string;
  role: string;
}

interface IntegrationConfig {
  id: string;
  service: string;
  enabled: boolean;
  configuration: Record<string, unknown>;
  lastSync?: Date;
}

interface WorkingHours {
  monday: { start: string; end: string; active: boolean };
  tuesday: { start: string; end: string; active: boolean };
  wednesday: { start: string; end: string; active: boolean };
  thursday: { start: string; end: string; active: boolean };
  friday: { start: string; end: string; active: boolean };
  saturday: { start: string; end: string; active: boolean };
  sunday: { start: string; end: string; active: boolean };
}

interface PolicyDocument {
  id: string;
  title: { en: string; th: string };
  version: string;
  effectiveDate: Date;
  content: string;
  mandatory: boolean;
}

interface ComplianceRequirement {
  id: string;
  standard: string;
  level: "required" | "recommended" | "optional";
  status: "compliant" | "non-compliant" | "pending";
  lastAudit?: Date;
  nextAudit?: Date;
}

interface RetentionPolicy {
  cases: number; // months
  users: number; // months
  logs: number; // months
  attachments: number; // months
}

interface AuditConfiguration {
  enabled: boolean;
  logLevel: "basic" | "detailed" | "comprehensive";
  retentionDays: number;
  alertThresholds: Record<string, number>;
}

interface ServiceLimits {
  maxUsers: number;
  maxCasesPerMonth: number;
  maxStorageGB: number;
  maxAPICallsPerDay: number;
}

interface BillingInfo {
  plan: string;
  status: "active" | "past_due" | "cancelled";
  nextBillingDate: Date;
  amount: number;
  currency: string;
}

// Mock data - in real app, this would come from RTK Query
const mockOrganizations: OrganizationProfile[] = [
  {
    id: "1",
    orgId: "434c0f16-b7ea-4a7b-a74b-e2e0f859f549",
    organizationDetails: {
      legalName: "Metropolitan Crisis Management Center",
      displayName: { en: "MIOC Crisis Center", th: "ศูนย์บริหารจัดการวิกฤติ MIOC" },
      businessType: "Government Agency",
      industry: "Emergency Services",
      size: "large",
      establishedYear: 2020,
      taxId: "1234567890123",
      registrationNumber: "GOV-2020-001"
    },
    location: {
      headquarters: {
        address: "999 Government Complex",
        city: "Bangkok",
        province: "Bangkok",
        postalCode: "10200",
        country: "Thailand",
        coordinates: { lat: 13.7563, lon: 100.5018 }
      },
      branches: [
        {
          id: "b1",
          name: { en: "North Branch", th: "สาขาภาคเหนือ" },
          address: "123 North District",
          city: "Chiang Mai",
          province: "Chiang Mai",
          active: true
        }
      ],
      timezone: "Asia/Bangkok",
      locale: "th-TH"
    },
    contact: {
      primaryEmail: "admin@mioc.gov.th",
      primaryPhone: "+66-2-123-4567",
      website: "https://mioc.gov.th",
      socialMedia: {
        facebook: "mioc.official",
        twitter: "@mioc_thailand"
      },
      emergencyContact: {
        name: "Emergency Coordinator",
        email: "emergency@mioc.gov.th",
        phone: "+66-2-999-8888",
        role: "Emergency Response Manager"
      }
    },
    configuration: {
      branding: {
        theme: "mioc",
        colors: {
          primary: "#0bcfce",
          secondary: "#3bada9",
          accent: "#00fff7"
        }
      },
      features: {
        caseManagement: true,
        workflowDesigner: true,
        areaResponse: true,
        skillManagement: true,
        unitManagement: true,
        propertyManagement: true
      },
      integrations: [
        {
          id: "gis-1",
          service: "ArcGIS",
          enabled: true,
          configuration: { apiKey: "***", version: "4.25" },
          lastSync: new Date()
        }
      ],
      customizations: {
        defaultLanguage: "th",
        dateFormat: "DD/MM/YYYY",
        timeFormat: "24h",
        currency: "THB",
        workingHours: {
          monday: { start: "08:00", end: "17:00", active: true },
          tuesday: { start: "08:00", end: "17:00", active: true },
          wednesday: { start: "08:00", end: "17:00", active: true },
          thursday: { start: "08:00", end: "17:00", active: true },
          friday: { start: "08:00", end: "17:00", active: true },
          saturday: { start: "08:00", end: "12:00", active: false },
          sunday: { start: "00:00", end: "00:00", active: false }
        }
      }
    },
    governance: {
      policies: [
        {
          id: "pol-1",
          title: { en: "Data Privacy Policy", th: "นโยบายความเป็นส่วนตัวข้อมูล" },
          version: "2.1",
          effectiveDate: new Date("2025-01-01"),
          content: "Organization data privacy policy content...",
          mandatory: true
        }
      ],
      compliance: [
        {
          id: "comp-1",
          standard: "ISO 27001",
          level: "required",
          status: "compliant",
          lastAudit: new Date("2025-06-15"),
          nextAudit: new Date("2026-06-15")
        }
      ],
      dataRetention: {
        cases: 84, // 7 years
        users: 24, // 2 years after termination
        logs: 12, // 1 year
        attachments: 60 // 5 years
      },
      auditSettings: {
        enabled: true,
        logLevel: "comprehensive",
        retentionDays: 2555, // 7 years
        alertThresholds: {
          failedLogins: 5,
          dataExports: 10,
          permissionChanges: 1
        }
      }
    },
    subscription: {
      plan: "enterprise",
      features: ["unlimited_users", "advanced_analytics", "custom_branding", "api_access"],
      limits: {
        maxUsers: 10000,
        maxCasesPerMonth: 50000,
        maxStorageGB: 1000,
        maxAPICallsPerDay: 100000
      },
      billing: {
        plan: "Enterprise Plan",
        status: "active",
        nextBillingDate: new Date("2025-09-01"),
        amount: 15000,
        currency: "THB"
      }
    },
    metrics: {
      totalUsers: 450,
      totalCases: 12543,
      activeUnits: 85,
      lastActivity: new Date(),
      systemHealth: "healthy"
    },
    active: true,
    createdAt: "2020-01-15T00:00:00Z",
    updatedAt: new Date().toISOString(),
    createdBy: "system",
    updatedBy: "admin"
  },
  {
    id: "2", 
    orgId: "550d1f27-c8fb-5b8c-b85c-f3f1g970g660",
    organizationDetails: {
      legalName: "Metthier Emergency Response Unit",
      displayName: { en: "Metthier Emergency Center", th: "ศูนย์ฉุกเฉิน เมทเธียร์" },
      businessType: "Private Organization",
      industry: "Emergency Services",
      size: "medium",
      establishedYear: 2018,
      taxId: "2345678901234",
      registrationNumber: "PVT-2018-002"
    },
    location: {
      headquarters: {
        address: "555 Business District",
        city: "Bangkok",
        province: "Bangkok", 
        postalCode: "10110",
        country: "Thailand",
        coordinates: { lat: 13.7651, lon: 100.5379 }
      },
      branches: [],
      timezone: "Asia/Bangkok",
      locale: "th-TH"
    },
    contact: {
      primaryEmail: "contact@metthier.com",
      primaryPhone: "+66-2-987-6543", 
      website: "https://metthier.com",
      socialMedia: {},
      emergencyContact: {
        name: "Response Coordinator",
        email: "emergency@metthier.com",
        phone: "+66-2-999-7777",
        role: "Operations Manager"
      }
    },
    configuration: {
      branding: {
        theme: "metthier",
        colors: {
          primary: "#fd6e2b",
          secondary: "#473366", 
          accent: "#ff8311"
        }
      },
      features: {
        caseManagement: true,
        workflowDesigner: false,
        areaResponse: true,
        skillManagement: false,
        unitManagement: true,
        propertyManagement: false
      },
      integrations: [],
      customizations: {
        defaultLanguage: "th",
        dateFormat: "DD/MM/YYYY",
        timeFormat: "24h",
        currency: "THB",
        workingHours: {
          monday: { start: "09:00", end: "18:00", active: true },
          tuesday: { start: "09:00", end: "18:00", active: true },
          wednesday: { start: "09:00", end: "18:00", active: true },
          thursday: { start: "09:00", end: "18:00", active: true },
          friday: { start: "09:00", end: "18:00", active: true },
          saturday: { start: "00:00", end: "00:00", active: false },
          sunday: { start: "00:00", end: "00:00", active: false }
        }
      }
    },
    governance: {
      policies: [],
      compliance: [],
      dataRetention: {
        cases: 36,
        users: 12,
        logs: 6,
        attachments: 24
      },
      auditSettings: {
        enabled: true,
        logLevel: "basic",
        retentionDays: 365,
        alertThresholds: {}
      }
    },
    subscription: {
      plan: "professional",
      features: ["advanced_reports", "api_access"],
      limits: {
        maxUsers: 500,
        maxCasesPerMonth: 5000,
        maxStorageGB: 100,
        maxAPICallsPerDay: 10000
      },
      billing: {
        plan: "Professional Plan",
        status: "active",
        nextBillingDate: new Date("2025-09-15"),
        amount: 8500,
        currency: "THB"
      }
    },
    metrics: {
      totalUsers: 127,
      totalCases: 3456,
      activeUnits: 23,
      lastActivity: new Date(),
      systemHealth: "healthy"
    },
    active: true,
    createdAt: "2018-03-20T00:00:00Z",
    updatedAt: new Date().toISOString(), 
    createdBy: "system",
    updatedBy: "admin"
  }
];

const OrganizationManagementComponent: React.FC = () => {
  // State Management
  const [organizations, setOrganizations] = useState<OrganizationProfile[]>(mockOrganizations);
  const [selectedOrg, setSelectedOrg] = useState<OrganizationProfile | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "cards" | "details">("cards");
  const [activeTab, setActiveTab] = useState<"overview" | "configuration" | "governance" | "analytics">("overview");
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBy, setFilterBy] = useState<"all" | "active" | "inactive">("all");
  const [loading, ] = useState(false);

  // Mock permissions - in real app would come from useAuth hook
  const hasEditPermission = true;
  const hasDeletePermission = true;
  const hasCreatePermission = true;

  // Filtered and sorted organizations
  const filteredOrganizations = useMemo(() => {
    return organizations.filter(org => {
      const matchesSearch = searchTerm === "" || 
        org.organizationDetails.legalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        org.organizationDetails.displayName.en.toLowerCase().includes(searchTerm.toLowerCase()) ||
        org.organizationDetails.displayName.th.includes(searchTerm);
      
      const matchesFilter = filterBy === "all" || 
        (filterBy === "active" && org.active) ||
        (filterBy === "inactive" && !org.active);

      return matchesSearch && matchesFilter;
    });
  }, [organizations, searchTerm, filterBy]);

  // Handle organization selection
  const handleSelectOrganization = (org: OrganizationProfile) => {
    setSelectedOrg(org);
    setViewMode("details");
    setIsEditing(false);
  };

  // Handle save organization
  const handleSaveOrganization = () => {
    if (selectedOrg) {
      setOrganizations(prev => 
        prev.map(org => 
          org.id === selectedOrg.id 
            ? { ...selectedOrg, updatedAt: new Date().toISOString() }
            : org
        )
      );
      setIsEditing(false);
    }
  };

  // Handle organization status toggle
  const handleToggleStatus = (orgId: string) => {
    setOrganizations(prev => 
      prev.map(org => 
        org.id === orgId 
          ? { ...org, active: !org.active, updatedAt: new Date().toISOString() }
          : org
      )
    );
  };

  // Get status color
  const getStatusColor = (status: "healthy" | "warning" | "critical") => {
    switch (status) {
      case "healthy": return "text-green-600 bg-green-50";
      case "warning": return "text-yellow-600 bg-yellow-50";
      case "critical": return "text-red-600 bg-red-50";
      default: return "text-gray-600 bg-gray-50";
    }
  };

  // Get plan badge color
  const getPlanColor = (plan: string) => {
    switch (plan) {
      case "basic": return "bg-gray-100 text-gray-800";
      case "professional": return "bg-blue-100 text-blue-800";
      case "enterprise": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  // Render organization card
  const renderOrganizationCard = (org: OrganizationProfile) => (
    <div 
      key={org.id}
      className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all duration-200 cursor-pointer"
      onClick={() => handleSelectOrganization(org)}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
            org.configuration.branding.theme === "mioc" ? "bg-cyan-100 text-cyan-600" : "bg-orange-100 text-orange-600"
          }`}>
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {org.organizationDetails.displayName.en}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {org.organizationDetails.businessType}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            org.active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
          }`}>
            {org.active ? "Active" : "Inactive"}
          </span>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
            getPlanColor(org.subscription.plan)
          }`}>
            {org.subscription.plan}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="space-y-1">
          <p className="text-xs text-gray-500 dark:text-gray-400">Total Users</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">{org.metrics.totalUsers}</p>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-gray-500 dark:text-gray-400">Active Cases</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">{org.metrics.totalCases}</p>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-gray-500 dark:text-gray-400">Active Units</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">{org.metrics.activeUnits}</p>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-gray-500 dark:text-gray-400">System Health</p>
          <span className={`inline-flex items-center text-xs font-medium capitalize px-2 py-1 rounded ${
            getStatusColor(org.metrics.systemHealth)
          }`}>
            {org.metrics.systemHealth}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Updated {new Date(org.updatedAt).toLocaleDateString()}
        </p>
        <div className="flex items-center space-x-1">
          {hasEditPermission && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedOrg(org);
                setIsEditing(true);
                setViewMode("details");
              }}
              className="p-1 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          )}
          {hasDeletePermission && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleToggleStatus(org.id);
              }}
              className="p-1 text-gray-400 hover:text-red-600 dark:text-gray-500 dark:hover:text-red-400"
            >
              {org.active ? <X className="w-4 h-4" /> : <RefreshCw className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>
    </div>
  );

  // Render organization details
  const renderOrganizationDetails = () => {
    if (!selectedOrg) return null;

    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setViewMode("cards")}
                className="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {selectedOrg.organizationDetails.displayName.en}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {selectedOrg.organizationDetails.legalName}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSaveOrganization}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                hasEditPermission && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 flex items-center space-x-2"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                )
              )}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 pt-4">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              {[
                { key: "overview", label: "Overview", icon: Globe },
                { key: "configuration", label: "Configuration", icon: Settings },
                { key: "governance", label: "Governance", icon: Shield },
                { key: "analytics", label: "Analytics", icon: BarChart3 }
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as "overview" | "configuration" | "governance" | "analytics")}
                  className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.key
                      ? "border-blue-500 text-blue-600 dark:text-blue-400"
                      : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Organization Details */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Organization Details</h3>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Legal Name</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={selectedOrg.organizationDetails.legalName}
                          onChange={(e) => setSelectedOrg(prev => prev ? {
                            ...prev,
                            organizationDetails: {
                              ...prev.organizationDetails,
                              legalName: e.target.value
                            }
                          } : null)}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      ) : (
                        <p className="mt-1 text-sm text-gray-900 dark:text-white">{selectedOrg.organizationDetails.legalName}</p>
                      )}
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Business Type</label>
                      <p className="mt-1 text-sm text-gray-900 dark:text-white">{selectedOrg.organizationDetails.businessType}</p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Industry</label>
                      <p className="mt-1 text-sm text-gray-900 dark:text-white">{selectedOrg.organizationDetails.industry}</p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Organization Size</label>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize mt-1 ${
                        selectedOrg.organizationDetails.size === "enterprise" ? "bg-purple-100 text-purple-800" :
                        selectedOrg.organizationDetails.size === "large" ? "bg-blue-100 text-blue-800" :
                        selectedOrg.organizationDetails.size === "medium" ? "bg-green-100 text-green-800" :
                        "bg-gray-100 text-gray-800"
                      }`}>
                        {selectedOrg.organizationDetails.size}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Contact Information</h3>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Primary Email</label>
                      <p className="mt-1 text-sm text-gray-900 dark:text-white">{selectedOrg.contact.primaryEmail}</p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Primary Phone</label>
                      <p className="mt-1 text-sm text-gray-900 dark:text-white">{selectedOrg.contact.primaryPhone}</p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Website</label>
                      <p className="mt-1 text-sm text-blue-600 dark:text-blue-400">{selectedOrg.contact.website || "Not specified"}</p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Emergency Contact</label>
                      <p className="mt-1 text-sm text-gray-900 dark:text-white">{selectedOrg.contact.emergencyContact.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{selectedOrg.contact.emergencyContact.phone}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Metrics Dashboard */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 rounded-lg p-4">
                  <div className="flex items-center">
                    <Users className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    <div className="ml-4">
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{selectedOrg.metrics.totalUsers}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Total Users</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 rounded-lg p-4">
                  <div className="flex items-center">
                    <FileText className="w-8 h-8 text-green-600 dark:text-green-400" />
                    <div className="ml-4">
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{selectedOrg.metrics.totalCases}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Total Cases</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800 rounded-lg p-4">
                  <div className="flex items-center">
                    <Shield className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                    <div className="ml-4">
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{selectedOrg.metrics.activeUnits}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Active Units</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900 dark:to-yellow-800 rounded-lg p-4">
                  <div className="flex items-center">
                    <CheckCircle className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
                    <div className="ml-4">
                      <p className="text-lg font-bold text-gray-900 dark:text-white capitalize">{selectedOrg.metrics.systemHealth}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">System Status</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "configuration" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Branding Configuration */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Branding & Theme</h3>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Theme</label>
                      <div className="mt-2 flex space-x-3">
                        {["mioc", "metthier", "custom"].map(theme => (
                          <button
                            key={theme}
                            onClick={() => isEditing && setSelectedOrg(prev => prev ? {
                              ...prev,
                              configuration: {
                                ...prev.configuration,
                                branding: { ...prev.configuration.branding, theme: theme as OrganizationProfile['configuration']['branding']['theme'] }
                              }
                            } : null)}
                            disabled={!isEditing}
                            className={`px-4 py-2 rounded-lg border text-sm font-medium capitalize ${
                              selectedOrg.configuration.branding.theme === theme
                                ? "bg-blue-50 border-blue-200 text-blue-700"
                                : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                            } ${!isEditing ? "opacity-50 cursor-not-allowed" : ""}`}
                          >
                            {theme}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      {Object.entries(selectedOrg.configuration.branding.colors).map(([key, color]) => (
                        <div key={key}>
                          <label className="text-xs font-medium text-gray-700 dark:text-gray-300 capitalize">{key}</label>
                          <div className="mt-1 flex items-center space-x-2">
                            <div 
                              className="w-6 h-6 rounded border border-gray-200"
                              style={{ backgroundColor: color }}
                            />
                            <span className="text-xs text-gray-500 font-mono">{color}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Feature Configuration */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Enabled Features</h3>
                  
                  <div className="space-y-3">
                    {Object.entries(selectedOrg.configuration.features).map(([feature, enabled]) => (
                      <div key={feature} className="flex items-center justify-between py-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                          {feature.replace(/([A-Z])/g, " $1").trim()}
                        </span>
                        <button
                          onClick={() => isEditing && setSelectedOrg(prev => prev ? {
                            ...prev,
                            configuration: {
                              ...prev.configuration,
                              features: { ...prev.configuration.features, [feature]: !enabled }
                            }
                          } : null)}
                          disabled={!isEditing}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            enabled ? "bg-blue-600" : "bg-gray-200 dark:bg-gray-600"
                          } ${!isEditing ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              enabled ? "translate-x-6" : "translate-x-1"
                            }`}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Subscription Information */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Subscription & Limits</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Plan</div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white capitalize">{selectedOrg.subscription.plan}</div>
                    <div className={`text-xs mt-1 ${
                      selectedOrg.subscription.billing.status === "active" ? "text-green-600" : "text-red-600"
                    }`}>
                      {selectedOrg.subscription.billing.status}
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Users</div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      {selectedOrg.metrics.totalUsers} / {selectedOrg.subscription.limits.maxUsers}
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${(selectedOrg.metrics.totalUsers / selectedOrg.subscription.limits.maxUsers) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Cases/Month</div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      {Math.floor(selectedOrg.metrics.totalCases / 12)} / {selectedOrg.subscription.limits.maxCasesPerMonth}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Current month usage</div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Storage</div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      45 / {selectedOrg.subscription.limits.maxStorageGB} GB
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${(45 / selectedOrg.subscription.limits.maxStorageGB) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "configuration" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Localization Settings */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Localization</h3>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Default Language</label>
                      <select
                        value={selectedOrg.configuration.customizations.defaultLanguage}
                        onChange={(e) => isEditing && setSelectedOrg(prev => prev ? {
                          ...prev,
                          configuration: {
                            ...prev.configuration,
                            customizations: {
                              ...prev.configuration.customizations,
                              defaultLanguage: e.target.value as "en" | "th"
                            }
                          }
                        } : null)}
                        disabled={!isEditing}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                      >
                        <option value="en">English</option>
                        <option value="th">ภาษาไทย</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Timezone</label>
                      <p className="mt-1 text-sm text-gray-900 dark:text-white">{selectedOrg.location.timezone}</p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Date Format</label>
                      <p className="mt-1 text-sm text-gray-900 dark:text-white">{selectedOrg.configuration.customizations.dateFormat}</p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Currency</label>
                      <p className="mt-1 text-sm text-gray-900 dark:text-white">{selectedOrg.configuration.customizations.currency}</p>
                    </div>
                  </div>
                </div>

                {/* Integrations */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">System Integrations</h3>
                  
                  <div className="space-y-3">
                    {selectedOrg.configuration.integrations.map((integration) => (
                      <div key={integration.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{integration.service}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Last sync: {integration.lastSync ? new Date(integration.lastSync).toLocaleDateString() : "Never"}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            integration.enabled ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                          }`}>
                            {integration.enabled ? "Active" : "Inactive"}
                          </span>
                          {isEditing && (
                            <button
                              className="p-1 text-gray-400 hover:text-gray-600"
                              onClick={() => {
                                // Toggle integration status
                                setSelectedOrg(prev => prev ? {
                                  ...prev,
                                  configuration: {
                                    ...prev.configuration,
                                    integrations: prev.configuration.integrations.map(int => 
                                      int.id === integration.id 
                                        ? { ...int, enabled: !int.enabled }
                                        : int
                                    )
                                  }
                                } : null);
                              }}
                            >
                              <Settings className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "governance" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Policies */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Policies</h3>
                    {isEditing && (
                      <button className="text-blue-600 hover:text-blue-700">
                        <Plus className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="space-y-3">
                    {selectedOrg.governance.policies.map((policy) => (
                      <div key={policy.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{policy.title.en}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Version {policy.version}</p>
                          </div>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            policy.mandatory ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800"
                          }`}>
                            {policy.mandatory ? "Mandatory" : "Optional"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Compliance */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Compliance Status</h3>
                  
                  <div className="space-y-3">
                    {selectedOrg.governance.compliance.map((comp) => (
                      <div key={comp.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{comp.standard}</p>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            comp.status === "compliant" ? "bg-green-100 text-green-800" :
                            comp.status === "non-compliant" ? "bg-red-100 text-red-800" :
                            "bg-yellow-100 text-yellow-800"
                          }`}>
                            {comp.status}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Next audit: {comp.nextAudit ? new Date(comp.nextAudit).toLocaleDateString() : "Not scheduled"}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Data Retention Policies */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Data Retention Policies</h3>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(selectedOrg.governance.dataRetention).map(([type, months]) => (
                    <div key={type} className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{months}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300 capitalize">{type}</p>
                      <p className="text-xs text-gray-500">months</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "analytics" && (
            <div className="space-y-6">
              {/* System Health Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 rounded-xl p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-600 dark:text-green-400 text-sm font-medium">System Health</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white capitalize">
                        {selectedOrg.metrics.systemHealth}
                      </p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 rounded-xl p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-600 dark:text-blue-400 text-sm font-medium">Active Users</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{selectedOrg.metrics.totalUsers}</p>
                    </div>
                    <Users className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800 rounded-xl p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-600 dark:text-purple-400 text-sm font-medium">Response Rate</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">98.7%</p>
                    </div>
                    <BarChart3 className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </div>

              {/* Activity Timeline */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Recent Activity</h3>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="space-y-3">
                    {[
                      { action: "User login", user: "admin@mioc.gov.th", time: "2 minutes ago", type: "info" },
                      { action: "Case created", user: "officer.01@mioc.gov.th", time: "5 minutes ago", type: "success" },
                      { action: "Configuration updated", user: "admin@mioc.gov.th", time: "1 hour ago", type: "warning" },
                      { action: "System backup completed", user: "system", time: "6 hours ago", type: "info" }
                    ].map((activity, index) => (
                      <div key={index} className="flex items-center space-x-3 py-2">
                        <div className={`w-2 h-2 rounded-full ${
                          activity.type === "success" ? "bg-green-400" :
                          activity.type === "warning" ? "bg-yellow-400" :
                          "bg-blue-400"
                        }`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900 dark:text-white">{activity.action}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">by {activity.user}</p>
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{activity.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-6">
      <div className="mx-auto w-full">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {hasCreatePermission && (
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>Add Organization</span>
              </button>
            )}
            
            <div className="flex items-center border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode("cards")}
                className={`p-2 ${viewMode === "cards" ? "bg-blue-50 text-blue-600" : "text-gray-400 hover:text-gray-600"}`}
              >
                <Globe className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 ${viewMode === "list" ? "bg-blue-50 text-blue-600" : "text-gray-400 hover:text-gray-600"}`}
              >
                <BarChart3 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {viewMode !== "details" && (
          <>
            {/* Search and Filter */}
            <div className="flex items-center space-x-4 bg-white dark:bg-gray-800 py-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search organizations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <select
                  value={filterBy}
                  onChange={(e) => setFilterBy(e.target.value as "all" | "active" | "inactive")}
                  className="px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="all">All Organizations</option>
                  <option value="active">Active Only</option>
                  <option value="inactive">Inactive Only</option>
                </select>
              </div>
            </div>

            {/* Organizations Grid */}
            <div className={`grid gap-6 ${
              viewMode === "cards" ? "grid-cols-1 lg:grid-cols-2 xl:grid-cols-3" : "grid-cols-1"
            }`}>
              {loading ? (
                <div className="col-span-full flex items-center justify-center py-12">
                  <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
                </div>
              ) : filteredOrganizations.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No organizations found</h3>
                  <p className="text-gray-500 dark:text-gray-400">Try adjusting your search criteria or add a new organization.</p>
                </div>
              ) : (
                filteredOrganizations.map(org => renderOrganizationCard(org))
              )}
            </div>
          </>
        )}

        {/* Organization Details View */}
        {viewMode === "details" && renderOrganizationDetails()}
      </div>
    </div>
  );
};

export default OrganizationManagementComponent;