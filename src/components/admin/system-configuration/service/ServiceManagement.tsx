// /src/components/admin/system-configuration/service/ServiceManagement.tsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { CloseIcon } from "@/icons";
import { ToastContainer } from "@/components/crud/ToastContainer";
import { Modal } from "@/components/ui/modal";
import { usePermissions } from "@/hooks/usePermissions";
import { useToast } from "@/hooks/useToast";
import {
  useCreateCaseTypesMutation,
  useUpdateCaseTypesMutation,
  useDeleteCaseTypesMutation,
  useCreateCaseSubTypesMutation,
  useUpdateCaseSubTypesMutation,
  useDeleteCaseSubTypesMutation
} from "@/store/api/serviceApi";
import type {
  CaseSubTypesCreateData,
  CaseSubTypesUpdateData,
  CaseTypeManagementProps,
  CaseTypesCreateData,
  CaseTypesUpdateData,
  EnhancedCaseSubType,
  EnhancedCaseType,
  // TypeAnalytics
} from "@/types/case";
import type { Property } from "@/types/unit";
import type { EnhancedSkill } from "@/types/user";
import type { Workflow } from "@/types/workflow";
import ServiceTypeAndSubTypeComponent from "@/components/admin/system-configuration/service/ServiceTypeAndSubType";
import CustomizableSelect from "@/components/form/CustomizableSelect";
import Input from "@/components/form/input/InputField";
import Select from "@/components/form/Select";
import Button from "@/components/ui/button/Button";

// const mockAnalytics: Record<string, TypeAnalytics> = {
//   "EMERGENCY": {
//     usageCount: 245,
//     averageResolutionTime: 45,
//     slaCompliance: 98.5,
//     resourceUtilization: 85,
//     efficiency: 92,
//     lastUsed: "2025-08-26T14:30:00Z"
//   },
//   "MAINTENANCE": {
//     usageCount: 156,
//     averageResolutionTime: 180,
//     slaCompliance: 94.2,
//     resourceUtilization: 72,
//     efficiency: 88,
//     lastUsed: "2025-08-25T09:15:00Z"
//   }
// };

const ServiceManagementComponent: React.FC<CaseTypeManagementProps> = ({
  caseSubTypes,
  caseTypes,
  properties,
  skills,
  workflows,
  className
}) => {
  const permissions = usePermissions();
  const { toasts, addToast, removeToast } = useToast();

  const [createCaseSubTypes] = useCreateCaseSubTypesMutation();
  const [updateCaseSubTypes] = useUpdateCaseSubTypesMutation();
  const [deleteCaseSubTypes] = useDeleteCaseSubTypesMutation();
  const [createCaseTypes] = useCreateCaseTypesMutation();
  const [updateCaseTypes] = useUpdateCaseTypesMutation();
  const [deleteCaseTypes] = useDeleteCaseTypesMutation();

  // ===================================================================
  // State management
  // ===================================================================

  // Case Sub-Type
  const [caseSubType, setCaseSubType] = useState<EnhancedCaseSubType[]>(caseSubTypes || []);
  const [sTypeId, setSTypeId] = useState<string>("");
  const [sTypeTh, setSTypeTh] = useState<string>("");
  const [sTypeEn, setSTypeEn] = useState<string>("");
  const [sTypeCode, setSTypeCode] = useState<string>("");
  const [sTypeTypeId, setSTypeTypeId] = useState<string>("");
  const [caseSla, setCaseSla] = useState<string>("");
  const [priority, setPriority] = useState<string>("");
  const [unitPropLists, setUnitPropLists] = useState<string[]>([]);
  const [userSkillList, setUserSkillList] = useState<string[]>([]);
  const [wfId, setWfId] = useState("");
  const [mDeviceType, setMDeviceType] = useState<string>("");
  const [mWorkOrderType, setMWorkOrderType] = useState<string>("");
  const [sTypeValidateErrors, setSTypeValidateErrors] = useState<{
    sTypeTh: string,
    sTypeEn: string,
    sTypeCode: string,
    sTypeTypeId: string,
    caseSla: string,
    priority: string,
    unitPropLists: string,
    userSkillList: string,
    wfId: string,
    mDeviceType: string,
    mWorkOrderType: string
  }>({
    sTypeTh: "", sTypeEn: "", sTypeCode: "", sTypeTypeId: "", caseSla: "", priority: "", unitPropLists: "", userSkillList: "", wfId: "", mDeviceType: "", mWorkOrderType: ""
  });

  // Case Type
  const [caseType, setCaseType] = useState<EnhancedCaseType[]>(caseTypes || []);
  const [typeId, setTypeId] = useState<string>("");
  const [typeTh, setTypeTh] = useState<string>("");
  const [typeEn, setTypeEn] = useState<string>("");
  const [typeValidateErrors, setTypeValidateErrors] = useState<{
    typeTh: string,
    typeEn: string
  }>({ typeTh: "", typeEn: "" });

  // Property
  const [property, setProperty] = useState<Property[]>(properties || []);

  // Skill
  const [, setSkill] = useState<EnhancedSkill[]>(skills || []);

  // Workflow
  const [workflow, setWorkflow] = useState<Workflow[]>(workflows || []);

  // const [isLoading, ] = useState(false);
  const [, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showInactive, ] = useState(false);
  // const [filterCategory, ] = useState<string>("all");
  // const [viewMode, ] = useState<"hierarchy" | "list">("hierarchy");
  const [, setValidationErrors] = useState<string[]>([]);

  // ===================================================================
  // Modals and dialogs
  // ===================================================================

  const [sTypeIsOpen, setSTypeIsOpen] = useState(false);
  const [sTypeConfirmIsOpen, setSTypeConfirmIsOpen] = useState(false);
  const [typeIsOpen, setTypeIsOpen] = useState(false);
  const [typeConfirmIsOpen, setTypeConfirmIsOpen] = useState(false);

  // ===================================================================
  // Fill select option
  // ===================================================================

  const [caseTypesOptions, setCaseTypesOptions] = useState<{ value: string; label: string }[]>([]);
  const [propertiesOptions, setPropertiesOptions] = useState<{ value: string; label: string }[]>([]);
  const [skillsOptions, setSkillsOptions] = useState<{ value: string; label: string }[]>([]);
  const [workflowsOptions, setWorkflowsOptions] = useState<{ value: string; label: string }[]>([]);

  // ===================================================================
  // Filter and search logic
  // ===================================================================

  const filteredTypes = useMemo(() => {
    const filtered = caseType.filter(type => {
      // Search filter
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch = 
          type.en.toLowerCase().includes(searchLower) ||
          type.th.toLowerCase().includes(searchLower) ||
          type.typeId.toLowerCase().includes(searchLower);
        if (!matchesSearch) {
          return false;
        }
      }

      // Category filter
      // if (filterCategory !== "all" && type.category !== filterCategory) {
      //   return false;
      // }

      // Active filter
      if (!showInactive && !type.active) {
        return false;
      }

      return true;
    });

    return filtered.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  }, [
    caseType,
    searchQuery,
    // filterCategory,
    showInactive
  ]);

  // ===================================================================
  // Validation before saving
  // ===================================================================

  // Validate Type
  const validateType = useCallback((): string[] => {
    const errors: string[] = [];
    if (!typeTh.trim()) {
      errors.push("Type name (Thai) is required");
      setTypeValidateErrors(prev => ({ ...prev, typeTh: "Type name (Thai) is required" }));
    }
    if (!typeEn.trim()) {
      errors.push("Type name (English) is required");
      setTypeValidateErrors(prev => ({ ...prev, typeEn: "Type name (English) is required" }));
    }
    return errors;
  }, [typeEn, typeTh]);

  // Validate Sub-Type
  const validateSubType = useCallback((): string[] => {
    const errors: string[] = [];
    if (!sTypeTh.trim()) {
      errors.push("Sub-Type name (Thai) is required");
      setSTypeValidateErrors(prev => ({ ...prev, sTypeTh: "Sub-Type name (Thai) is required" }));
    }
    if (!sTypeEn.trim()) {
      errors.push("Sub-Type name (English) is required");
      setSTypeValidateErrors(prev => ({ ...prev, sTypeEn: "Sub-Type name (English) is required" }));
    }
    if (!sTypeCode.trim()) {
      errors.push("Sub-Type code is required");
      setSTypeValidateErrors(prev => ({ ...prev, sTypeCode: "Sub-Type code is required" }));
    }
    if (!sTypeTypeId.trim()) {
      errors.push("Type ID is required");
      setSTypeValidateErrors(prev => ({ ...prev, sTypeTypeId: "Type ID is required" }));
    }
    if (!caseSla.trim()) {
      errors.push("SLA is required");
      setSTypeValidateErrors(prev => ({ ...prev, caseSla: "SLA is required" }));
    }
    if (!priority.trim()) {
      errors.push("Priority is required");
      setSTypeValidateErrors(prev => ({ ...prev, priority: "Priority is required" }));
    }
    if (!unitPropLists) {
      errors.push("Unit Property List is required");
      setSTypeValidateErrors(prev => ({ ...prev, unitPropLists: "Unit Property List is required" }));
    }
    if (!userSkillList) {
      errors.push("User Skill List is required");
      setSTypeValidateErrors(prev => ({ ...prev, userSkillList: "User Skill List is required" }));
    }
    if (!wfId) {
      errors.push("Workflow is required");
      setSTypeValidateErrors(prev => ({ ...prev, wfId: "Workflow is required" }));
    }
    if (!mDeviceType.trim()) {
      errors.push("Device Type is required");
      setSTypeValidateErrors(prev => ({ ...prev, mDeviceType: "Device Type is required" }));
    }
    if (!mWorkOrderType.trim()) {
      errors.push("Work Order Type is required");
      setSTypeValidateErrors(prev => ({ ...prev, mWorkOrderType: "Work Order Type is required" }));
    }
    return errors;
  }, [caseSla, priority, sTypeCode, sTypeEn, sTypeTh, sTypeTypeId, unitPropLists, userSkillList, wfId, mDeviceType, mWorkOrderType]);

  // ===================================================================
  // Type CRUD
  // ===================================================================

  // Delete Type
  const handleTypeDelete = useCallback(async (id: number) => {
    if (!id) {
      throw new Error("Type ID not found");
    }
    try {
      // console.log("🚀 ~ ServiceManagementComponent ~ handleTypeDelete - id:", id);
      // throw new Error("");

      setLoading(true);
      let response;
      if (permissions.hasAnyPermission(["service.delete"])) {
        response = await deleteCaseTypes(id).unwrap();
      }
      else {
        throw new Error("Permission denied");
      }
      if (response?.status) {
        addToast("success", `Service Management - Type: ${response?.desc || response?.msg || "Delete successfully"}`);
        setTimeout(() => {
          window.location.replace(`/service`);
        }, 1000);
      }
      else {
        throw new Error(response?.desc || response?.msg || "Unknown error");
      }
    }
    catch (error) {
      addToast("error", `Service Management - Type: ${error}`);
    }
    finally {
      setLoading(false);
    }
  }, [permissions, addToast, deleteCaseTypes]);

  // Reset Department
  const handleTypeReset = () => {
    setTypeId("");
    setTypeTh("");
    setTypeEn("");
    setTypeValidateErrors({ typeTh: "", typeEn: "" });
  };

  // Create / Update Type
  const handleTypeSave = useCallback(async () => {
    const errors = validateType();
    setValidationErrors(errors);
    if (errors.length > 0) {
      return; // Don"t save if there are validation errors
    }
    const typeData: CaseTypesCreateData | CaseTypesUpdateData = {
      active: true,
      th: typeTh,
      en: typeEn,
    };
    try {
      // console.log("🚀 ~ ServiceManagementComponent ~ handleTypeSave - id:", typeId, "data:", typeData);
      // throw new Error("");

      setLoading(true);
      let response;
      if (permissions.hasAnyPermission(["service.create", "service.update"])) {
        if (typeId) {
          response = await updateCaseTypes({
            id: typeId, data: typeData
          }).unwrap();
        }
        else {
          response = await createCaseTypes(typeData).unwrap();
        }
      }
      else {
        throw new Error("Permission denied");
      }
      if (response?.status) {
        addToast("success", `Service Management - Type: ${response?.desc || response?.msg || "Save successfully"}`);
        setTimeout(() => {
          window.location.replace(`/service`);
        }, 1000);
      }
      else {
        throw new Error(response?.desc || response?.msg || "Unknown error");
      }
    }
    catch (error) {
      addToast("error", `Service Management - Type: ${error}`);
    }
    finally {
      setTypeIsOpen(false);
      setLoading(false);
    }
  }, [typeEn, typeId, typeTh, permissions, addToast, createCaseTypes, updateCaseTypes, validateType]);

  // ===================================================================
  // Sub-Type CRUD
  // ===================================================================

  // Delete Sub-Type
  const handleSTypeDelete = useCallback(async (id: number) => {
    if (!id) {
      throw new Error("Sub-Type ID not found");
    }
    try {
      // console.log("🚀 ~ ServiceManagementComponent ~ handleSTypeDelete - id:", id);
      // throw new Error("");

      setLoading(true);
      let response;
      if (permissions.hasAnyPermission(["service.delete"])) {
        response = await deleteCaseSubTypes(id).unwrap();
      }
      else {
        throw new Error("Permission denied");
      }
      if (response?.status) {
        addToast("success", `Service Management - Sub-Type: ${response?.desc || response?.msg || "Delete successfully"}`);
        setTimeout(() => {
          window.location.replace(`/service`);
        }, 1000);
      }
      else {
        throw new Error(response?.desc || response?.msg || "Unknown error");
      }
    }
    catch (error) {
      addToast("error", `Service Management - Sub-Type: ${error}`);
    }
    finally {
      setLoading(false);
    }
  }, [permissions, addToast, deleteCaseSubTypes]);

  // Reset Sub-Type
  const handleSTypeReset = () => {
    setSTypeId("");
    setSTypeTh("");
    setSTypeEn("");
    setSTypeCode("");
    setSTypeTypeId("");
    setCaseSla("");
    setPriority("");
    setUnitPropLists([]);
    setUserSkillList([]);
    setWfId("");
    setMDeviceType("");
    setMWorkOrderType("");
    setSTypeValidateErrors({
      sTypeTh: "",
      sTypeEn: "",
      sTypeCode: "",
      sTypeTypeId: "",
      caseSla: "",
      priority: "",
      unitPropLists: "",
      userSkillList: "",
      wfId: "",
      mDeviceType: "",
      mWorkOrderType: ""
    });
  };

  // Create / Update Sub-Type
  const handleSTypeSave = useCallback(async () => {
    const errors = validateSubType();
    setValidationErrors(errors);
    if (errors.length > 0) {
      return; // Don"t save if there are validation errors
    }
    const sTypeData: CaseSubTypesCreateData | CaseSubTypesUpdateData = {
      active: true,
      caseSla: caseSla,
      en: sTypeEn,
      priority: priority,
      sTypeCode: sTypeCode,
      th: sTypeTh,
      typeId: sTypeTypeId,
      unitPropLists: unitPropLists,
      userSkillList: userSkillList,
      wfId: wfId,
      mDeviceType: mDeviceType,
      mWorkOrderType: mWorkOrderType
    };
    try {
      // console.log("🚀 ~ ServiceManagementComponent ~ handleSTypeSave - id:", sTypeId, "data:", sTypeData);
      // throw new Error("");

      setLoading(true);
      let response;
      if (permissions.hasAnyPermission(["service.create", "service.update"])) {
        if (sTypeId) {
          response = await updateCaseSubTypes({
            id: sTypeId, data: sTypeData
          }).unwrap();
        }
        else {
          response = await createCaseSubTypes(sTypeData).unwrap();
        }
      }
      else {
        throw new Error("Permission denied");
      }
      if (response?.status) {
        addToast("success", `Service Management - Sub-Type: ${response?.desc || response?.msg || "Save successfully"}`);
        setTimeout(() => {
          window.location.replace(`/service`);
        }, 1000);
      }
      else {
        throw new Error(response?.desc || response?.msg || "Unknown error");
      }
    }
    catch (error) {
      addToast("error", `Service Management - Sub-Type: ${error}`);
    }
    finally {
      setSTypeIsOpen(false);
      setLoading(false);
    }
  }, [
    caseSla, permissions, priority, sTypeCode, sTypeEn, sTypeId, sTypeTh, sTypeTypeId, unitPropLists, userSkillList, wfId, mDeviceType, mWorkOrderType,
    addToast, createCaseSubTypes, updateCaseSubTypes, validateSubType
  ]);

  // ===================================================================
  // Render
  // ===================================================================

  useEffect(() => {
    setCaseSubType(caseSubTypes || []);
    setCaseType(caseTypes|| []);
  }, [caseSubTypes, caseTypes]);

  useEffect(() => {
    setCaseTypesOptions(caseTypes?.map(t => ({
      value: String(t.typeId),
      label: `${t.th} (${t.en})`
    })) || []);
  }, [caseTypes]);

  useEffect(() => {
    setPropertiesOptions(properties?.map(p => ({
      value: String(p.propId),
      label: `${p.th} (${p.en})`,
    })) || []);
  }, [properties]);

  useEffect(() => {
    setSkillsOptions(skills?.map(s => ({
      value: String(s.skillId),
      label: `${s.th} (${s.en})`,
    })) || []);
  }, [skills]);

  useEffect(() => {
    setWorkflowsOptions(workflows?.map(w => ({
      value: String(w.wfId),
      label: `${w.title}`,
    })) || []);
  }, [workflows]);

  const renderServiceHierarchy = () => (
    <ServiceTypeAndSubTypeComponent
      // analytics={mockAnalytics}
      caseSubTypes={caseSubType || []}
      caseTypes={caseType || []}
      filteredTypes={filteredTypes || []}
      properties={property}
      searchQuery={searchQuery}
      skills={skills}
      workflows={workflow}
      handleSTypeDelete={handleSTypeDelete}
      handleSTypeReset={handleSTypeReset}
      handleTypeDelete={handleTypeDelete}
      handleTypeReset={handleTypeReset}
      setSearchQuery={setSearchQuery}
      setCaseSla={setCaseSla}
      setMDeviceType={setMDeviceType}
      setMWorkOrderType={setMWorkOrderType}
      setPriority={setPriority}
      setSTypeCode={setSTypeCode}
      setSTypeEn={setSTypeEn}
      setSTypeId={setSTypeId}
      setSTypeIsOpen={setSTypeIsOpen}
      setSTypeTh={setSTypeTh}
      setSTypeTypeId={setSTypeTypeId}
      setTypeEn={setTypeEn}
      setTypeId={setTypeId}
      setTypeIsOpen={setTypeIsOpen}
      setTypeTh={setTypeTh}
      setUnitPropLists={setUnitPropLists}
      setUserSkillList={setUserSkillList}
      setWfId={setWfId}
    />
  );

  // const tabItem: TabItem[] = [
  //   {
  //     id: "typesAndSubTypes",
  //     label: "Types & Sub-Types",
  //     content: <ServiceTypeAndSubType
  //       analytics={mockAnalytics}
  //       caseSubTypes={caseSubType}
  //       caseTypes={caseType}
  //       filteredTypes={filteredTypes}
  //       searchQuery={searchQuery}
  //       setSearchQuery={setSearchQuery}
  //     />
  //   },
  //   {
  //     id: "analytics",
  //     label: "Analytics",
  //     content: <ServiceAnalyticsContent
  //       // analytics={mockAnalytics}
  //       // filteredTypes={filteredTypes}
  //     />
  //   },
  // ];

  useEffect(() => {
    setCaseSubType(caseSubTypes || []);
  }, [caseSubTypes]);

  useEffect(() => {
    setCaseType(caseTypes || []);
  }, [caseTypes]);

  useEffect(() => {
    setProperty(properties || []);
  }, [properties]);

  useEffect(() => {
    setSkill(skills || []);
  }, [skills]);

  useEffect(() => {
    setWorkflow(workflows || []);
  }, [workflows]);

  return (
    <>
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-6">
        <div className={`mx-auto w-full ${className}`}>
          {/*
          <ServiceTypeAndSubTypeComponent
            // analytics={mockAnalytics}
            caseSubTypes={caseSubType}
            caseTypes={caseType}
            properties={property}
            workflows={workflow}
            filteredTypes={filteredTypes}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
          */}
          {renderServiceHierarchy()}

          {/* <Tab items={tabItem} variant="underline" /> */}
        </div>
      </div>
      
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      
      {/* Create / Update Type */}
      <Modal
        isOpen={typeIsOpen}
        onClose={() => {
          handleTypeReset();
          setTypeConfirmIsOpen(false);
          setTypeIsOpen(false);
        }}
        className="max-w-4xl p-6 max-h-[80vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white cursor-default">
            {typeId && "Edit" || "Create"} Type
          </h3>
          <Button
            onClick={() => {
              handleTypeReset();
              setTypeConfirmIsOpen(false);
              setTypeIsOpen(false);
            }}
            variant="ghost"
            size="sm"
          >
            <CloseIcon className="w-4 h-4" />
          </Button>
        </div>
        <div className="space-y-4">
          <div>
            <label htmlFor="typeTh" className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Type Name (TH)
            </label>
            <Input
              id="typeTh"
              placeholder="Fill type name in Thai language"
              value={typeTh}
              onChange={(e) => setTypeTh && setTypeTh(e.target.value)}
            />
            <span className="text-red-500 dark:text-red-400 text-xs">{typeValidateErrors.typeTh}</span>
          </div>
          <div>
            <label htmlFor="typeEn" className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Type Name (EN)
            </label>
            <Input
              id="typeEn"
              placeholder="Fill type name in English language"
              value={typeEn}
              onChange={(e) => setTypeEn && setTypeEn(e.target.value)}
            />
            <span className="text-red-500 dark:text-red-400 text-xs">{typeValidateErrors.typeEn}</span>
          </div>
        </div>
        <div className="flex items-center justify-end mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex gap-3">
            {!typeId && (
              <Button onClick={handleTypeReset} variant="outline">
                Reset
              </Button>
            )}
            <Button 
              onClick={() => {
                setTypeConfirmIsOpen(true);
                setTypeIsOpen(false);
              }}
              variant="primary"
            >
              Save
            </Button>
          </div>
        </div>
      </Modal>

      {/* Confirm Type */}
      <Modal
        isOpen={typeConfirmIsOpen}
        onClose={() => {
          setTypeConfirmIsOpen(false);
          setTypeIsOpen(true);
        }}
        className="max-w-4xl p-6 max-h-[80vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white cursor-default">
            Confirm {typeId && "Edit" || "Create"} Type
          </h3>
          <Button
            onClick={() => {
              setTypeConfirmIsOpen(false);
              setTypeIsOpen(true);
            }}
            variant="ghost"
            size="sm"
          >
            <CloseIcon className="w-4 h-4" />
          </Button>
        </div>
        <div className="space-y-4">
          Please confirm to {typeId && "edit" || "create"} {typeTh} {typeEn}.
        </div>
        <div className="flex items-center justify-end mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex gap-3">
            <Button
              onClick={() => {
                setTypeConfirmIsOpen(false);
                setTypeIsOpen(true);
              }}
              variant="outline"
            >
              Cancel
            </Button>
            <Button onClick={handleTypeSave} variant="success">
              Confirm
            </Button>
          </div>
        </div>
      </Modal>

      {/* Create / Update Sub-Type */}
      <Modal
        isOpen={sTypeIsOpen}
        onClose={() => {
          handleSTypeReset();
          setSTypeConfirmIsOpen(false);
          setSTypeIsOpen(false);
        }}
        className="max-w-4xl p-6 max-h-[80vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white cursor-default">
            {sTypeId && "Edit" || "Create"} Sub-Type
          </h3>
          <Button
            onClick={() => {
              handleSTypeReset();
              setSTypeConfirmIsOpen(false);
              setSTypeIsOpen(false);
            }}
            variant="ghost"
            size="sm"
          >
            <CloseIcon className="w-4 h-4" />
          </Button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Type
            </label>
            <Select
              value={sTypeTypeId || ""}
              onChange={value => setSTypeTypeId && setSTypeTypeId(value)}
              options={caseTypesOptions || []}
              placeholder="Select Type"
              className="cursor-pointer"
            />
            <span className="text-red-500 dark:text-red-400 text-xs">{sTypeValidateErrors.sTypeTypeId}</span>
          </div>
          <div>
            <label htmlFor="sTypeCode" className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Sub-Type Code
            </label>
            <Input
              id="sTypeCode"
              placeholder="Fill sub-type code"
              value={sTypeCode}
              onChange={(e) => setSTypeCode && setSTypeCode(e.target.value)}
            />
            <span className="text-red-500 dark:text-red-400 text-xs">{sTypeValidateErrors.sTypeCode}</span>
          </div>
          <div>
            <label htmlFor="sTypeTh" className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Sub-Type Name (TH)
            </label>
            <Input
              id="sTypeTh"
              placeholder="Fill sub-type name in Thai language"
              value={sTypeTh}
              onChange={(e) => setSTypeTh && setSTypeTh(e.target.value)}
            />
            <span className="text-red-500 dark:text-red-400 text-xs">{sTypeValidateErrors.sTypeTh}</span>
          </div>
          <div>
            <label htmlFor="sTypeEn" className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Sub-Type Name (EN)
            </label>
            <Input
              id="sTypeEn"
              placeholder="Fill sub-type name in English language"
              value={sTypeEn}
              onChange={(e) => setSTypeEn && setSTypeEn(e.target.value)}
            />
            <span className="text-red-500 dark:text-red-400 text-xs">{sTypeValidateErrors.sTypeEn}</span>
          </div>
          <div>
            <label htmlFor="caseSla" className="text-sm font-medium text-gray-700 dark:text-gray-200">
              SLA
            </label>
            <Input
              id="caseSla"
              placeholder="Fill SLA"
              value={caseSla}
              onChange={(e) => setCaseSla && setCaseSla(e.target.value)}
            />
            <span className="text-red-500 dark:text-red-400 text-xs">{sTypeValidateErrors.caseSla}</span>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Priority
            </label>
            <Select
              value={priority || ""}
              onChange={value => setPriority && setPriority(value)}
              options={[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => {
                return { value: String(n), label: String(n) }
              })}
              placeholder="Select Priority"
              className="cursor-pointer"
            />
            <span className="text-red-500 dark:text-red-400 text-xs">{sTypeValidateErrors.priority}</span>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Properties
            </label>
            <CustomizableSelect
              options={propertiesOptions}
              value={Array.isArray(unitPropLists) ? unitPropLists : []}
              onChange={value => setUnitPropLists(value as string[])}
              placeholder="Select Properties"
            />
            <span className="text-red-500 dark:text-red-400 text-xs">{sTypeValidateErrors.unitPropLists}</span>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Skills
            </label>
            <CustomizableSelect
              options={skillsOptions}
              value={Array.isArray(userSkillList) ? userSkillList : []}
              onChange={value => setUserSkillList(value as string[])}
              placeholder="Select Skills"
            />
            <span className="text-red-500 dark:text-red-400 text-xs">{sTypeValidateErrors.userSkillList}</span>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Workflow
            </label>
            <Select
              value={wfId || ""}
              onChange={value => setWfId && setWfId(value)}
              options={workflowsOptions || []}
              placeholder="Select Workflow"
              className="cursor-pointer"
            />
            <span className="text-red-500 dark:text-red-400 text-xs">{sTypeValidateErrors.wfId}</span>
          </div>
          <div>
            <label htmlFor="mDeviceType" className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Device Type
            </label>
            <Input
              id="mDeviceType"
              placeholder="Fill Device Type"
              value={mDeviceType}
              onChange={(e) => setMDeviceType && setMDeviceType(e.target.value)}
            />
            <span className="text-red-500 dark:text-red-400 text-xs">{sTypeValidateErrors.mDeviceType}</span>
          </div>
          <div>
            <label htmlFor="mWorkOrderType" className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Work Order Type
            </label>
            <Input
              id="mWorkOrderType"
              placeholder="Fill Work Order Type"
              value={mWorkOrderType}
              onChange={(e) => setMWorkOrderType && setMWorkOrderType(e.target.value)}
            />
            <span className="text-red-500 dark:text-red-400 text-xs">{sTypeValidateErrors.mWorkOrderType}</span>
          </div>
        </div>
        <div className="flex items-center justify-end mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex gap-3">
            {!sTypeId && (
              <Button onClick={handleSTypeReset} variant="outline">
                Reset
              </Button>
            )}
            <Button
              onClick={() => {
                setSTypeConfirmIsOpen(true);
                setSTypeIsOpen(false);
              }}
              variant="primary"
            >
              Save
            </Button>
          </div>
        </div>
      </Modal>

      {/* Confirm Sub-Type */}
      <Modal
        isOpen={sTypeConfirmIsOpen}
        onClose={() => {
          setSTypeConfirmIsOpen(false);
          setSTypeIsOpen(true);
        }}
        className="max-w-4xl p-6 max-h-[80vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white cursor-default">
            Confirm {sTypeId && "Edit" || "Create"} Sub-Type
          </h3>
          <Button
            onClick={() => {
              setSTypeConfirmIsOpen(false);
              setSTypeIsOpen(true);
            }}
            variant="ghost"
            size="sm"
          >
            <CloseIcon className="w-4 h-4" />
          </Button>
        </div>
        <div className="space-y-4">
          Please confirm to {sTypeId && "edit" || "create"} {sTypeCode} {sTypeTh} {sTypeEn}.
        </div>
        <div className="flex items-center justify-end mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex gap-3">
            <Button
              onClick={() => {
                setSTypeConfirmIsOpen(false);
                setSTypeIsOpen(true);
              }}
              variant="outline"
            >
              Cancel
            </Button>
            <Button onClick={handleSTypeSave} variant="success">
              Confirm
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default ServiceManagementComponent;
