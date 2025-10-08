// /src/components/admin/user-management/organization/OrganizationManagement.tsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
// import { useNavigate } from "react-router-dom";
import {
  Folder,
  // Plus,
  RefreshCw
} from "lucide-react";
import {
  // CheckLineIcon,
  CloseIcon,
  // FolderIcon,
  // ListIcon,
  // TimeIcon
} from "@/icons";
// import { EnhancedCrudContainer } from "@/components/crud/EnhancedCrudContainer";
import { ToastContainer } from "@/components/crud/ToastContainer";
import { Modal } from "@/components/ui/modal";
import { usePermissions } from "@/hooks/usePermissions";
import { useToast } from "@/hooks/useToast";
// import { useTranslation } from "@/hooks/useTranslation";
import {
  useCreateDepartmentsMutation,
  useCreateCommandsMutation,
  useCreateStationsMutation,
  useDeleteDepartmentsMutation,
  useDeleteCommandsMutation,
  useDeleteStationsMutation,
  useUpdateDepartmentsMutation,
  useUpdateCommandsMutation,
  useUpdateStationsMutation
} from "@/store/api/organizationApi";
// import { AuthService } from "@/utils/authService";
// import type { PreviewConfig } from "@/types/enhanced-crud";
import type {
  Department, DepartmentCreateData, DepartmentUpdateData,
  Command, CommandCreateData, CommandUpdateData,
  Station, StationCreateData, StationUpdateData,
  Organization, OrganizationManagementProps
} from "@/types/organization";
import OrganizationHierarchyView from "@/components/admin/user-management/organization/OrganizationHierarchyView";
import Input from "@/components/form/input/InputField";
import Select from "@/components/form/Select";
import Button from "@/components/ui/button/Button";

const OrganizationManagementComponent: React.FC<OrganizationManagementProps> = ({ departments, commands, stations, organizations, className }) => {
  // const isSystemAdmin = AuthService.isSystemAdmin();
  // const navigate = useNavigate();
  const permissions = usePermissions();
  const { toasts, addToast, removeToast } = useToast();
  // const { t } = useTranslation();

  const [createDepartment] = useCreateDepartmentsMutation();
  const [createCommand] = useCreateCommandsMutation();
  const [createStation] = useCreateStationsMutation();
  const [deleteDepartment] = useDeleteDepartmentsMutation();
  const [deleteCommand] = useDeleteCommandsMutation();
  const [deleteStation] = useDeleteStationsMutation();
  const [updateDepartment] = useUpdateDepartmentsMutation();
  const [updateCommand] = useUpdateCommandsMutation();
  const [updateStation] = useUpdateStationsMutation();
  
  // ===================================================================
  // State management
  // ===================================================================

  // Department
  const [department, setDepartment] = useState<Department[]>(departments || []);
  const [deptId, setDeptId] = useState<string>("");
  const [deptTh, setDeptTh] = useState("");
  const [deptEn, setDeptEn] = useState("");
  const [deptValidateErrors, setDeptValidateErrors] = useState({ deptTh: "", deptEn: "" });

  // Command
  const [command, setCommand] = useState<Command[]>(commands || []);
  const [commId, setCommId] = useState<string>("");
  const [commDeptId, setCommDeptId] = useState("");
  const [commandTh, setCommandTh] = useState("");
  const [commandEn, setCommandEn] = useState("");
  const [commValidateErrors, setCommValidateErrors] = useState({ deptId: "", commandTh: "", commandEn: "" });

  // Station
  const [station, setStation] = useState<Station[]>(stations || []);
  const [stnId, setStnId] = useState<string>("");
  const [stnCommId, setStnCommId] = useState("");
  const [stnDeptId, setStnDeptId] = useState("");
  const [stationTh, setStationTh] = useState("");
  const [stationEn, setStationEn] = useState("");
  const [stnValidateErrors, setStnValidateErrors] = useState({ deptId: "", commId: "", stationTh: "", stationEn: "" });

  const [isLoading, ] = useState(false);
  // const [isOpen, setIsOpen] = useState(false);
  // const [loading, setLoading] = useState(false);
  const [, setLoading] = useState(false);
  // const [organization, setOrganization] = useState<Organization[]>(organizations || []);
  const [, setOrganization] = useState<Organization[]>(organizations || []);
  const [searchQuery, setSearchQuery] = useState("");
  const [showInactive, ] = useState(false);
  // const [viewMode, setViewMode] = useState<"hierarchy" | "list">("hierarchy");
  const [viewMode, ] = useState<"hierarchy" | "list">("hierarchy");
  // const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [, setValidationErrors] = useState<string[]>([]);

  // ===================================================================
  // Modals and dialogs
  // ===================================================================

  // const [, setShowCreateOrganizationModal] = useState(false);
  const [deptIsOpen, setDeptIsOpen] = useState(false);
  const [commIsOpen, setCommIsOpen] = useState(false);
  const [stnIsOpen, setStnIsOpen] = useState(false);

  // const handleCreateOrganization = () => {
  //   setShowCreateOrganizationModal(true);
  // };

  // ===================================================================
  // Fill select option
  // ===================================================================

  const [departmentsOptions, setDepartmentsOptions] = useState<{ value: string; label: string }[]>([]);
  const [commandsOptions, setCommandsOptions] = useState<{ value: string; label: string; deptId: string }[]>([]);

  // const departmentsOptions = departments?.map(dept => ({
  //   value: String(dept.deptId),
  //   label: `${dept.th} (${dept.en})`
  // }));

  // const commandsOptions = commands?.map(comm => ({
  //   value: String(comm.commId),
  //   label: `${comm.th} (${comm.en})`,
  //   deptId: String(comm.deptId)
  // }));

  // ===================================================================
  // Filter and search logic
  // ===================================================================

  const filteredOrganizations = useMemo(() => {
    const filteredDepartment = department.filter(dept => {
      // Search filter
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch = 
          dept.th.toLowerCase().includes(searchLower) ||
          dept.en.toLowerCase().includes(searchLower)
        if (!matchesSearch) {
          return false;
        }
      }
      // Active filter
      if (!showInactive && !dept.active) {
        return false;
      }
      return true;
    });

    const filteredCommand = command.filter(cmd => {
      // Search filter
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch = 
          cmd.th.toLowerCase().includes(searchLower) ||
          cmd.en.toLowerCase().includes(searchLower)
        if (!matchesSearch) {
          return false;
        }
      }
      // Active filter
      if (!showInactive && !cmd.active) {
        return false;
      }
      return true;
    });

    const filteredStation = station.filter(stn => {
      // Search filter
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch = 
          stn.th.toLowerCase().includes(searchLower) ||
          stn.en.toLowerCase().includes(searchLower)
        if (!matchesSearch) {
          return false;
        }
      }
      // Active filter
      if (!showInactive && !stn.active) {
        return false;
      }
      return true;
    });

    return filteredStation?.length > 0 ? filteredStation
      : filteredCommand?.length > 0 ? filteredCommand
      : filteredDepartment?.length > 0 ? filteredDepartment
      : [];
  }, [
    department,
    command,
    station,
    searchQuery,
    showInactive
  ]);

  // ===================================================================
  // Validation before saving
  // ===================================================================

  // Validate department
  const validateDepartment = useCallback((): string[] => {
    const errors: string[] = [];
    if (!deptTh.trim()) {
      errors.push("Department name (Thai) is required");
      setDeptValidateErrors(prev => ({ ...prev, deptTh: "Department name (Thai) is required" }));
    }
    if (!deptEn.trim()) {
      errors.push("Department name (English) is required");
      setDeptValidateErrors(prev => ({ ...prev, deptEn: "Department name (English) is required" }));
    }
    return errors;
  }, [deptEn, deptTh]);

  // Validate command
  const validateCommand = useCallback((): string[] => {
    const errors: string[] = [];
    if (!commDeptId.trim()) {
      errors.push("Department is required");
      setCommValidateErrors(prev => ({ ...prev, deptId: "Department is required" }));
    }
    if (!commandTh.trim()) {
      errors.push("Command name (Thai) is required");
      setCommValidateErrors(prev => ({ ...prev, commandTh: "Command name (Thai) is required" }));
    }
    if (!commandEn.trim()) {
      errors.push("Command name (English) is required");
      setCommValidateErrors(prev => ({ ...prev, commandEn: "Command name (English) is required" }));
    }
    return errors;
  }, [commDeptId, commandEn, commandTh]);

  // Validate station
  const validateStation = useCallback((): string[] => {
    const errors: string[] = [];
    if (!stnDeptId.trim()) {
      errors.push("Department is required");
      setStnValidateErrors(prev => ({ ...prev, deptId: "Department is required" }));
    }
    if (!stnCommId.trim()) {
      errors.push("Command is required");
      setStnValidateErrors(prev => ({ ...prev, commId: "Command is required" }));
    }
    if (!stationTh.trim()) {
      errors.push("Station name (Thai) is required");
      setCommValidateErrors(prev => ({ ...prev, stationTh: "Station name (Thai) is required" }));
    }
    if (!stationEn.trim()) {
      errors.push("Station name (English) is required");
      setCommValidateErrors(prev => ({ ...prev, stationEn: "Station name (English) is required" }));
    }
    return errors;
  }, [stationEn, stationTh, stnCommId, stnDeptId]);

  // ===================================================================
  // Department CRUD
  // ===================================================================

  // Delete Department
  const handleDepartmentDelete = useCallback(async (id: number) => {
    if (!id) {
      throw new Error("Department ID not found");
    }
    try {
      // console.log("🚀 ~ OrganizationManagementComponent ~ handleDepartmentDelete - id:", id);
      // throw new Error("");

      setLoading(true);
      let response;
      if (permissions.hasAnyPermission(["organization.update"])) {
        response = await deleteDepartment(id).unwrap();
      }
      else {
        throw new Error("Permission denied");
      }
      if (response?.status) {
        addToast("success", `Organization Management - Department: ${response?.desc || response?.msg || "Delete successfully"}`);
        setTimeout(() => {
          window.location.replace(`/organization`);
        }, 1000);
      }
      else {
        throw new Error(response?.desc || response?.msg || "Unknown error");
      }
    }
    catch (error) {
      addToast("error", `Organization Management - Department: ${error}`);
    }
    finally {
      setLoading(false);
    }
  }, [permissions, addToast, deleteDepartment]);

  // Reset Department
  const handleDepartmentReset = () => {
    setDeptId("");
    setDeptTh("");
    setDeptEn("");
    setDeptValidateErrors({ deptTh: "", deptEn: "" });
  };

  // Create / Update Department
  const handleDepartmentSave = useCallback(async () => {
    const errors = validateDepartment();
    setValidationErrors(errors);
    if (errors.length > 0) {
      return; // Don"t save if there are validation errors
    }
    const departmentData: DepartmentCreateData | DepartmentUpdateData = {
      active: true,
      th: deptTh,
      en: deptEn,
    };
    try {
      // console.log("🚀 ~ OrganizationManagementComponent ~ handleDepartmentSave - id:", deptId, "data:", departmentData);
      // throw new Error("");

      setLoading(true);
      let response;
      if (permissions.hasAnyPermission(["organization.update"])) {
        if (deptId) {
          response = await updateDepartment({
            id: deptId, data: departmentData
          }).unwrap();
        }
        else {
          response = await createDepartment(departmentData).unwrap();
        }
      }
      else {
        throw new Error("Permission denied");
      }
      if (response?.status) {
        addToast("success", `Organization Management - Department: ${response?.desc || response?.msg || "Save successfully"}`);
        setTimeout(() => {
          window.location.replace(`/organization`);
        }, 1000);
      }
      else {
        throw new Error(response?.desc || response?.msg || "Unknown error");
      }
    }
    catch (error) {
      addToast("error", `Organization Management - Department: ${error}`);
    }
    finally {
      setDeptIsOpen(false);
      setLoading(false);
    }
  }, [deptEn, deptId, deptTh, permissions, addToast, createDepartment, updateDepartment, validateDepartment]);

  // ===================================================================
  // Command CRUD
  // ===================================================================

  // Delete Command
  const handleCommandDelete = useCallback(async (id: number) => {
    if (!id) {
      throw new Error("Command ID not found");
    }
    try {
      // console.log("🚀 ~ OrganizationManagementComponent ~ handleCommandDelete - id:", id);
      // throw new Error("");

      setLoading(true);
      let response;
      if (permissions.hasAnyPermission(["organization.update"])) {
        response = await deleteCommand(id).unwrap();
      }
      else {
        throw new Error("Permission denied");
      }
      if (response?.status) {
        addToast("success", `Organization Management - Command: ${response?.desc || response?.msg || "Delete successfully"}`);
        setTimeout(() => {
          window.location.replace(`/organization`);
        }, 1000);
      }
      else {
        throw new Error(response?.desc || response?.msg || "Unknown error");
      }
    }
    catch (error) {
      addToast("error", `Organization Management - Command: ${error}`);
    }
    finally {
      setLoading(false);
    }
  }, [permissions, addToast, deleteCommand]);

  // Reset Command
  const handleCommandReset = () => {
    setCommId("");
    setCommDeptId("");
    setCommandTh("");
    setCommandEn("");
    setCommValidateErrors({ deptId: "", commandTh: "", commandEn: "" });
  };

  // Create / Update Command
  const handleCommandSave = useCallback(async () => {
    const errors = validateCommand();
    setValidationErrors(errors);
    if (errors.length > 0) {
      return; // Don"t save if there are validation errors
    }
    const commandData: CommandCreateData | CommandUpdateData = {
      active: true,
      deptId: commDeptId,
      th: commandTh,
      en: commandEn,
    };
    try {
      // console.log("🚀 ~ OrganizationManagementComponent ~ handleCommandSave - id:", commId, "data:", commandData);
      // throw new Error("");

      setLoading(true);
      let response;
      if (permissions.hasAnyPermission(["organization.update"])) {
        if (commId) {
          response = await updateCommand({
            id: commId, data: commandData
          }).unwrap();
        }
        else {
          response = await createCommand(commandData).unwrap();
        }
      }
      else {
        throw new Error("Permission denied");
      }
      if (response?.status) {
        addToast("success", `Organization Management - Command: ${response?.desc || response?.msg || "Save successfully"}`);
        setTimeout(() => {
          window.location.replace(`/organization`);
        }, 1000);
      }
      else {
        throw new Error(response?.desc || response?.msg || "Unknown error");
      }
    }
    catch (error) {
      addToast("error", `Organization Management - Command: ${error}`);
    }
    finally {
      setCommIsOpen(false);
      setLoading(false);
    }
  }, [commDeptId, commandEn, commandTh, commId, permissions, addToast, createCommand, updateCommand, validateCommand]);

  // ===================================================================
  // Station CRUD
  // ===================================================================

  // Delete Station
  const handleStationDelete = useCallback(async (id: number) => {
    if (!id) {
      throw new Error("Station ID not found");
    }
    try {
      // console.log("🚀 ~ OrganizationManagementComponent ~ handleStationDelete - id:", id);
      // throw new Error("");

      setLoading(true);
      let response;
      if (permissions.hasAnyPermission(["organization.update"])) {
        response = await deleteStation(id).unwrap();
      }
      else {
        throw new Error("Permission denied");
      }
      if (response?.status) {
        addToast("success", `Organization Management - Station: ${response?.desc || response?.msg || "Delete successfully"}`);
        setTimeout(() => {
          window.location.replace(`/organization`);
        }, 1000);
      }
      else {
        throw new Error(response?.desc || response?.msg || "Unknown error");
      }
    }
    catch (error) {
      addToast("error", `Organization Management - Station: ${error}`);
    }
    finally {
      setLoading(false);
    }
  }, [permissions, addToast, deleteStation]);

  // Reset Command
  const handleStationReset = () => {
    setStnId("");
    setStnDeptId("");
    setStnCommId("");
    setStationTh("");
    setStationEn("");
    setStnValidateErrors({ commId: "", deptId: "", stationTh: "", stationEn: "" });
  };

  // Create / Update Station
  const handleStationSave = useCallback(async () => {
    const errors = validateStation();
    setValidationErrors(errors);
    if (errors.length > 0) {
      return; // Don"t save if there are validation errors
    }
    const stationData: StationCreateData | StationUpdateData = {
      active: true,
      commId: stnCommId,
      deptId: stnDeptId,
      th: stationTh,
      en: stationEn,
    };
    try {
      // console.log("🚀 ~ OrganizationManagementComponent ~ handleStationSave - id:", stnId, "data:", stationData);
      // throw new Error("");

      setLoading(true);
      let response;
      if (permissions.hasAnyPermission(["organization.update"])) {
        if (stnId) {
          response = await updateStation({
            id: stnId, data: stationData
          }).unwrap();
        }
        else {
          response = await createStation(stationData).unwrap();
        }
      }
      else {
        throw new Error("Permission denied");
      }
      if (response?.status) {
        addToast("success", `Organization Management - Station: ${response?.desc || response?.msg || "Save successfully"}`);
        setTimeout(() => {
          window.location.replace(`/organization`);
        }, 1000);
      }
      else {
        throw new Error(response?.desc || response?.msg || "Unknown error");
      }
    }
    catch (error) {
      addToast("error", `Organization Management - Station: ${error}`);
    }
    finally {
      setStnIsOpen(false);
      setLoading(false);
    }
  }, [permissions, stationEn, stationTh, stnCommId, stnDeptId, stnId, addToast, createStation, updateStation, validateStation]);

  // ===================================================================
  // Render
  // ===================================================================

  useEffect(() => {
    setDepartment(departments || []);
    setCommand(commands|| []);
    setStation(stations || []);
    setOrganization(organizations || []);
  }, [departments, commands, stations, organizations]);

  useEffect(() => {
    setDepartmentsOptions(departments?.map(dept => ({
      value: String(dept.deptId),
      label: `${dept.th} (${dept.en})`
    })) || []);
  }, [departments]);

  useEffect(() => {
    setCommandsOptions(commands?.map(comm => ({
      value: String(comm.commId),
      label: `${comm.th} (${comm.en})`,
      deptId: String(comm.deptId)
    })) || []);
  }, [commands]);

  const renderOrganizationHierarchy = () => (
    <OrganizationHierarchyView
      departments={department || []}
      commands={command || []}
      stations={station || []}
      showInactive={showInactive}
      handleDepartmentDelete={handleDepartmentDelete}
      handleDepartmentReset={handleDepartmentReset}
      handleCommandDelete={handleCommandDelete}
      handleCommandReset={handleCommandReset}
      handleStationDelete={handleStationDelete}
      handleStationReset={handleStationReset}
      setDeptId={setDeptId}
      setDeptIsOpen={setDeptIsOpen}
      setDeptTh={setDeptTh}
      setDeptEn={setDeptEn}
      setCommId={setCommId}
      setCommIsOpen={setCommIsOpen}
      setCommDeptId={setCommDeptId}
      setCommandTh={setCommandTh}
      setCommandEn={setCommandEn}
      setStnId={setStnId}
      setStnIsOpen={setStnIsOpen}
      setStnDeptId={setStnDeptId}
      setStnCommId={setStnCommId}
      setStnTh={setStationTh}
      setStnEn={setStationEn}
    />
  );

  // const data: (Organization & { id: string })[] = organization.map(o => ({
  //   ...o,
  //   id: typeof o.id === "string" ? o.id : o.id ?? "",
  // }));

  // ===================================================================
  // CRUD Configuration
  // ===================================================================

  // const statusConfig = (status: boolean) => {
  //   return status
  //     ? { color: "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100", icon: CheckLineIcon }
  //     : { color: "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100", icon: TimeIcon };
  // }

  // const config = {
  //   entityName: "Organization",
  //   entityNamePlural: "Organizations",
  //   apiEndpoints: {
  //     list: "/api/organization",
  //     create: "/api/organization",
  //     read: "/api/organization/:id",
  //     update: "/api/organization/:id",
  //     delete: "/api/organization/:id",
  //     // bulkDelete: "/api/organizations/bulk",
  //     // export: "/api/organizations/export"
  //   },
  //   columns: [
  //     {
  //       key: "station",
  //       label: "Station",
  //       sortable: true,
  //       render: (organizationItem: Organization) => {
  //         const status = statusConfig(organizationItem.stationActive || false);
  //         const Icon = status.icon;
  //         return (
  //           <>
  //             <div>{organizationItem.stationTh || organizationItem.stationEn || ""}</div>
  //             <div className={`flex items-center gap-1 px-2 py-1 rounded-full justify-center ${status.color}`}>
  //               <Icon className="w-4 h-4" />
  //               <span className="text-sm font-medium capitalize">{organizationItem.stationActive ? "Active" : "Inactive"}</span>
  //             </div>
  //           </>
  //         );
  //       }
  //     },
  //     {
  //       key: "command",
  //       label: "Command",
  //       sortable: true,
  //       render: (organizationItem: Organization) => {
  //         const status = statusConfig(organizationItem.commandActive || false);
  //         const Icon = status.icon;
  //         return (
  //           <>
  //             <div>{organizationItem.commandTh || organizationItem.commandEn || ""}</div>
  //             <div className={`flex items-center gap-1 px-2 py-1 rounded-full justify-center ${status.color}`}>
  //               <Icon className="w-4 h-4" />
  //               <span className="text-sm font-medium capitalize">{organizationItem.commandActive ? "Active" : "Inactive"}</span>
  //             </div>
  //           </>
  //         );
  //       }
  //     },
  //     {
  //       key: "department",
  //       label: "Department",
  //       sortable: true,
  //       render: (organizationItem: Organization) => {
  //         const status = statusConfig(organizationItem.deptActive || false);
  //         const Icon = status.icon;
  //         return (
  //           <>
  //             <div>{organizationItem.deptTh || organizationItem.deptEn || ""}</div>
  //             <div className={`flex items-center gap-1 px-2 py-1 rounded-full justify-center ${status.color}`}>
  //               <Icon className="w-4 h-4" />
  //               <span className="text-sm font-medium capitalize">{organizationItem.deptActive ? "Active" : "Inactive"}</span>
  //             </div>
  //           </>
  //         );
  //       }
  //     }
  //   ],
  //   actions: [
  //     {
  //       key: "view",
  //       label: "View",
  //       variant: "primary" as const,
  //       // icon: EyeIcon,
  //       onClick: (organizationItem: Organization) => navigate(`/organization/${organizationItem.id}`),
  //       condition: () => (permissions.hasPermission("organization.view") || isSystemAdmin) as boolean
  //     },
  //     {
  //       key: "update",
  //       label: "Edit",
  //       variant: "warning" as const,
  //       // icon: PencilIcon,
  //       onClick: (organizationItem: Organization) => navigate(`/organization/${organizationItem.id}/edit`),
  //       condition: () => (permissions.hasPermission("organization.update") || isSystemAdmin) as boolean
  //     },
  //     {
  //       key: "delete",
  //       label: "Delete",
  //       variant: "outline" as const,
  //       // icon: TrashBinIcon,
  //       onClick: (organizationItem: Organization) => {
  //         console.log("Delete organization:", organizationItem.id);
  //       },
  //       condition: () => (permissions.hasPermission("organization.delete") || isSystemAdmin) as boolean
  //     }
  //   ]
  // };

  // ===================================================================
  // Preview Configuration
  // ===================================================================

  // const previewConfig: PreviewConfig<Organization> = {
  //   title: () => "Organization Information",
  //   size: "xl",
  //   enableNavigation: true,
  //   tabs: [
  //     {
  //       key: "overview",
  //       label: "Overview",
  //       // icon: InfoIcon,
  //       render: (
  //         // organizationItem: Organization
  //       ) => {
  //         return (
  //           <></>
  //         )
  //       }
  //     }
  //   ],
  //   actions: [
  //     {
  //       key: "update",
  //       label: "Edit",
  //       // icon: PencilIcon,
  //       variant: "warning",
  //       onClick: (organizationItem: Organization, closePreview: () => void) => {
  //         closePreview();
  //         navigate(`/organization/${organizationItem.id}/edit`);
  //       },
  //       condition: () => (permissions.hasPermission("organization.update") || isSystemAdmin) as boolean
  //     },
  //     {
  //       key: "delete",
  //       label: "Delete",
  //       // icon: CheckLineIcon,
  //       variant: "outline",
  //       onClick: (organizationItem: Organization, closePreview: () => void) => {
  //         closePreview();
  //         console.log("Delete user:", organizationItem.id);
  //       },
  //       condition: () => (permissions.hasPermission("organization.delete") || isSystemAdmin) as boolean
  //     }
  //   ]
  // };

  // ===================================================================
  // Advanced Filters
  // ===================================================================

  // const advancedFilters = [
  //   {
  //     key: "department",
  //     label: "Department",
  //     type: "select" as const,
  //     options: department.map(dept => ({ value: String(dept.id), label: dept.th || dept.en })),
  //     placeholder: "Select department",
  //   },
  //   {
  //     key: "command",
  //     label: "Command",
  //     type: "select" as const,
  //     options: command.map(cmd => ({ value: String(cmd.id), label: cmd.th || cmd.en })),
  //     placeholder: "Select command",
  //   },
  //   {
  //     key: "station",
  //     label: "Station",
  //     type: "select" as const,
  //     options: station.map(stn => ({ value: String(stn.id), label: stn.th || stn.en })),
  //     placeholder: "Select station",
  //   }
  // ];

  // return (
  //   <>
  //     <EnhancedCrudContainer
  //       advancedFilters={advancedFilters}
  //       apiConfig={{
  //         baseUrl: "/api",
  //         endpoints: {
  //           create: "/organization",
  //           read: "/organization/:id",
  //           list: "/organization",
  //           update: "/organization/:id",
  //           delete: "/organization/:id",
  //           // bulkDelete: "/organization/bulk",
  //           // export: "/organization/export"
  //         }
  //       }}
  //       // bulkActions={bulkActions}
  //       config={config}
  //       data={data}
  //       displayModes={["hierarchy", "table", "card"]}
  //       enableDebug={true} // Enable debug mode to troubleshoot
  //       // error={null}
  //       // exportOptions={exportOptions}
  //       features={{
  //         bulkActions: false,
  //         export: false,
  //         filtering: true,
  //         keyboardShortcuts: true,
  //         pagination: true,
  //         realTimeUpdates: false, // Disabled for demo
  //         search: true,
  //         sorting: true,
  //       }}
  //       // keyboardShortcuts={[]}
  //       loading={!organization}
  //       module="organization"
  //       previewConfig={previewConfig}
  //       searchFields={["stationTh", "stationEn", "commandTh", "commandEn", "deptTh", "deptEn"]}
  //       // customFilterFunction={() => true}
  //       onCreate={() => navigate("/organization/create")}
  //       onDelete={handleDelete}
  //       onItemAction={handleAction}
  //       // onItemClick={(item) => navigate(`/organization/${item.id}`)}
  //       onRefresh={() => window.location.reload()}
  //       // onUpdate={() => {}}
  //       renderCard={renderCard as unknown as (item: { id: string }) => React.ReactNode}
  //     />
  //   </>
  // );

  return (
    <>
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-6">
        <div className={`mx-auto w-full ${className}`}>
          <div className={`mx-auto w-full ${className}`}>
            {/* Header */}
            <div className="mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div className="mt-4 sm:mt-0 xl:flex space-y-2 xl:space-y-0 items-center space-x-3">
                  {/*
                  <div className="xl:flex">
                    <button
                      onClick={() => setViewMode("hierarchy")}
                      className={`inline-flex items-center justify-center gap-2 rounded-l-lg transition h-11 px-5 py-3.5 text-md shadow-theme-xs ${
                        viewMode === "hierarchy"
                          ? "bg-brand-500 text-white dark:text-white hover:bg-brand-600 disabled:bg-brand-300"
                          : "bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/[0.03] dark:hover:text-gray-300"
                      }`}
                      title="Hierarchy"
                    >
                      <FolderIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`inline-flex items-center justify-center gap-2 rounded-r-lg transition h-11 px-5 py-3.5 text-md shadow-theme-xs ${
                        viewMode === "list"
                          ? "bg-brand-500 text-white dark:text-white hover:bg-brand-600 disabled:bg-brand-300"
                          : "bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/[0.03] dark:hover:text-gray-300"
                      }`}
                      title="List"
                    >
                      <ListIcon className="w-4 h-4" />
                    </button>
                  </div>
                  */}

                  {/* Toolbar */}
                  <div className="xl:flex space-y-2 xl:space-y-0 items-center space-x-4">
                    {/* Search */}
                    <div className="relative">
                      <Input
                        placeholder="Search department or command or station..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-4 sm:mt-0 xl:flex space-y-2 xl:space-y-0 items-center space-x-3">
                  <div className="xl:flex">
                    <Button
                      onClick={() => {
                        handleDepartmentReset();
                        setDeptIsOpen(true);
                      }} size="sm">
                      Create Department
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            {/* Loading state */}
            {isLoading && (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="w-6 h-6 animate-spin text-blue-600 dark:text-blue-300" />
              </div>
            )}
            {/* Content */}
            {!isLoading && filteredOrganizations?.length !== 0 && (
              <>
                {viewMode === "hierarchy" && renderOrganizationHierarchy()}
                {viewMode === "list" && (
                  <div className="text-center py-12 text-gray-400 dark:text-gray-500 cursor-default">
                    <p>List view implementation coming soon...</p>
                  </div>
                )}
              </>
            )}
            {/* Empty state */}
            {!isLoading && filteredOrganizations?.length === 0 && (
              <div className="text-center py-12">
                <Folder className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-800 dark:text-gray-100 mb-2 cursor-default">
                  No organization found
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4 cursor-default">
                  {searchQuery ? "Try adjusting your search criteria" : "Get started by creating your first organization"}
                </p>
                {/*
                <button
                  // onClick={handleCreateOrganization}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 dark:bg-blue-300 text-white dark:text-gray-900 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-200 mx-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Organization</span>
                </button>
                */}
              </div>
            )}
          </div>
        </div>
      </div>

      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Create / Update Department */}
      <Modal
        isOpen={deptIsOpen}
        onClose={() => {
          setDeptIsOpen(false);
          handleDepartmentReset();
        }}
        className="max-w-4xl p-6 max-h-[80vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white cursor-default">
            {deptId && "Edit" || "Create"} Department
          </h3>
          <Button
            onClick={() => setDeptIsOpen(false)}
            variant="ghost"
            size="sm"
          >
            <CloseIcon className="w-4 h-4" />
          </Button>
        </div>
        <div className="space-y-4">
          <div>
            <label htmlFor="deptTh" className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Department (TH)
            </label>
            <Input
              id="deptTh"
              placeholder="Fill department name in Thai language"
              value={deptTh}
              onChange={(e) => setDeptTh && setDeptTh(e.target.value)}
            />
            <span className="text-red-500 dark:text-red-400 text-xs">{deptValidateErrors.deptTh}</span>
          </div>
          <div>
            <label htmlFor="deptEn" className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Department (EN)
            </label>
            <Input
              id="deptEn"
              placeholder="Fill department name in English language"
              value={deptEn}
              onChange={(e) => setDeptEn && setDeptEn(e.target.value)}
            />
            <span className="text-red-500 dark:text-red-400 text-xs">{deptValidateErrors.deptEn}</span>
          </div>
        </div>
        <div className="flex items-center justify-end mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex gap-3">
            <Button onClick={handleDepartmentReset} variant="outline">
              Reset
            </Button>
            <Button onClick={handleDepartmentSave} variant="primary">
              Confirm
            </Button>
          </div>
        </div>
      </Modal>

      {/* Create / Update Command */}
      <Modal
        isOpen={commIsOpen}
        onClose={() => {
          setCommIsOpen(false);
          handleCommandReset();
        }}
        className="max-w-4xl p-6 max-h-[80vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white cursor-default">
            {commId && "Edit" || "Create"} Command
          </h3>
          <Button
            onClick={() => setCommIsOpen(false)}
            variant="ghost"
            size="sm"
          >
            <CloseIcon className="w-4 h-4" />
          </Button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Department
            </label>
            <Select
              value={commDeptId || ""}
              onChange={value => setCommDeptId && setCommDeptId(value)}
              options={departmentsOptions || []}
              placeholder="Select Department"
              className="cursor-pointer"
            />
            <span className="text-red-500 dark:text-red-400 text-xs">{commValidateErrors.deptId}</span>
          </div>
          <div>
            <label htmlFor="commandTh" className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Command (TH)
            </label>
            <Input
              id="commandTh"
              placeholder="Fill command name in Thai language"
              value={commandTh}
              onChange={(e) => setCommandTh && setCommandTh(e.target.value)}
            />
            <span className="text-red-500 dark:text-red-400 text-xs">{commValidateErrors.commandTh}</span>
          </div>
          <div>
            <label htmlFor="commandEn" className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Command (EN)
            </label>
            <Input
              id="commandEn"
              placeholder="Fill command name in English language"
              value={commandEn}
              onChange={(e) => setCommandEn && setCommandEn(e.target.value)}
            />
            <span className="text-red-500 dark:text-red-400 text-xs">{commValidateErrors.commandEn}</span>
          </div>
        </div>
        <div className="flex items-center justify-end mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex gap-3">
            <Button onClick={handleCommandReset} variant="outline">
              Reset
            </Button>
            <Button onClick={handleCommandSave} variant="primary">
              Confirm
            </Button>
          </div>
        </div>
      </Modal>

      {/* Create / Update Station */}
      <Modal
        isOpen={stnIsOpen}
        onClose={() => {
          setStnIsOpen(false);
          handleStationReset();
        }}
        className="max-w-4xl p-6 max-h-[80vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white cursor-default">
            {stnId && "Edit" || "Create"} Station
          </h3>
          <Button
            onClick={() => setStnIsOpen(false)}
            variant="ghost"
            size="sm"
          >
            <CloseIcon className="w-4 h-4" />
          </Button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Department
            </label>
            <Select
              value={stnDeptId || ""}
              onChange={value => setStnDeptId && setStnDeptId(value)}
              options={departmentsOptions || []}
              placeholder="Select Department"
              className="cursor-pointer"
            />
            <span className="text-red-500 dark:text-red-400 text-xs">{stnValidateErrors.deptId}</span>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Command
            </label>
            <Select
              value={stnCommId || ""}
              onChange={value => setStnCommId && setStnCommId(value)}
              // options={commandsOptions?.filter(option => option.deptId === stnDeptId) || []}
              options={commandsOptions || []}
              placeholder="Select Command"
              className="cursor-pointer"
            />
            <span className="text-red-500 dark:text-red-400 text-xs">{stnValidateErrors.commId}</span>
          </div>
          <div>
            <label htmlFor="stationTh" className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Station (TH)
            </label>
            <Input
              id="stationTh"
              placeholder="Fill station name in Thai language"
              value={stationTh}
              onChange={(e) => setStationTh && setStationTh(e.target.value)}
            />
            <span className="text-red-500 dark:text-red-400 text-xs">{stnValidateErrors.stationTh}</span>
          </div>
          <div>
            <label htmlFor="stationEn" className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Station (EN)
            </label>
            <Input
              id="stationEn"
              placeholder="Fill station name in English language"
              value={stationEn}
              onChange={(e) => setStationEn && setStationEn(e.target.value)}
            />
            <span className="text-red-500 dark:text-red-400 text-xs">{stnValidateErrors.stationEn}</span>
          </div>
        </div>
        <div className="flex items-center justify-end mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex gap-3">
            <Button onClick={handleStationReset} variant="outline">
              Reset
            </Button>
            <Button onClick={handleStationSave} variant="primary">
              Confirm
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default OrganizationManagementComponent;
