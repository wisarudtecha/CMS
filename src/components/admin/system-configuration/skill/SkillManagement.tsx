// /src/components/admin/system-configuration/skill/SkillManagement.tsx
import React, { useCallback, useState } from "react";
import { CloseIcon, CheckLineIcon, CloseLineIcon, TimeIcon } from "@/icons";
import { EnhancedCrudContainer } from "@/components/crud/EnhancedCrudContainer";
import { ToastContainer } from "@/components/crud/ToastContainer";
import { Modal } from "@/components/ui/modal";
import { usePermissions } from "@/hooks/usePermissions";
import { useToast } from "@/hooks/useToast";
import { useCreateSkillMutation, useUpdateSkillMutation } from "@/store/api/skillApi";
import { AuthService } from "@/utils/authService";
import type { PreviewConfig } from "@/types/enhanced-crud";
import type { Skill, SkillCreateData, SkillManagementProps, SkillUpdateData } from "@/types/skill";
import Input from "@/components/form/input/InputField";
import Button from "@/components/ui/button/Button";

const SkillManagementComponent: React.FC<SkillManagementProps> = ({ skills }) => {
  const isSystemAdmin = AuthService.isSystemAdmin();
  const permissions = usePermissions();
  const { toasts, addToast, removeToast } = useToast();

  const [createSkill] = useCreateSkillMutation();
  const [updateSkill] = useUpdateSkillMutation();

  const [, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [skillId, setSkillId] = useState("");
  const [active, setActive] = useState(true);
  const [th, setTh] = useState("");
  const [en, setEn] = useState("");
  const [validationErrors, setValidationErrors] = useState({ th: "", en: "" });

  const handleSkillReset = () => {
    setActive(true);
    setTh("");
    setEn("");
    setIsOpen(false);
  }

  const validateError = useCallback((): string[] => {
    const errors: string[] = [];
    if (!th.trim()) {
      errors.push("Skill name (Thai) is required");
      setValidationErrors(prev => ({ ...prev, th: "Skill name (Thai) is required" }));
    }
    if (!en.trim()) {
      errors.push("Skill name (English) is required");
      setValidationErrors(prev => ({ ...prev, en: "Skill name (English) is required" }));
    }
    return errors;
  }, [th, en]);

  const handleSkillSave = useCallback(async () => {
    const errors = validateError();
    if (errors.length > 0) {
      return; // Don"t save if there are validation errors
    }
    const data: SkillCreateData | SkillUpdateData = {
      active: active,
      th: th,
      en: en
    };
    try {
      // console.log("🚀 ~ SkillManagementComponent ~ handleSkillSave - id:", skillId, "data:", data);
      // throw new Error("");

      setLoading(true);
      let response;
      if (permissions.hasAnyPermission(["unit.create", "unit.update"])) {
        if (skillId) {
          response = await updateSkill({
            id: skillId, data: data
          }).unwrap();
        }
        else {
          response = await createSkill(data).unwrap();
        }
      }
      else {
        throw new Error("Permission denied");
      }
      if (response?.status) {
        addToast("success", `Skill Management: ${response?.desc || response?.msg || "Save successfully"}`);
        setTimeout(() => {
          window.location.replace(`/skill`);
        }, 1000);
      }
      else {
        throw new Error(response?.desc || response?.msg || "Unknown error");
      }
    }
    catch (error) {
      addToast("error", `Skill Management: ${error}`);
    }
    finally {
      setIsOpen(false);
      setIsConfirmOpen(false);
      setLoading(false);
    }
  }, [
    active, addToast, createSkill, en, permissions, skillId, th, updateSkill, validateError
  ]);

  // ===================================================================
  // Mock Data
  // ===================================================================

  // ===================================================================
  // Real Functionality Data
  // ===================================================================

  const data: (Skill & { id: string })[] = skills?.map(s => ({
    ...s,
    id: typeof s.skillId === "string" ? s.skillId : s.skillId ?? s.id?.toString?.() ?? "",
  })) ?? [];

  // ===================================================================
  // CRUD Configuration
  // ===================================================================

  const config = {
    entityName: "Skill",
    entityNamePlural: "Skills",
    apiEndpoints: {
      list: "/api/skill",
      create: "/api/skill",
      read: "/api/skill/:id",
      update: "/api/skill/:id",
      delete: "/api/skill/:id",
      bulkDelete: "/api/skill/bulk",
      export: "/api/skill/export"
    },
    columns: [
      {
        key: "th",
        label: "Name",
        sortable: true,
        render: (skillItem: Skill) => `${skillItem.th} (${skillItem.en})`
      },
      {
        key: "status",
        label: "Status",
        sortable: true,
        render: (skillItem: Skill) => {
          const statusConfig = skillItem.active
            ? { color: "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100", icon: CheckLineIcon }
            : { color: "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100", icon: TimeIcon };
          const Icon = statusConfig.icon;
          return (
            <span className={`items-center px-2 py-1 rounded-full text-xs font-medium capitalize ${statusConfig.color}`}>
              <Icon className="w-4 h-4 inline mr-1" />
              {skillItem.active ? "Active" : "Inactive"}
            </span>
          );
        }
      }
    ],
    actions: [
      {
        key: "view",
        label: "View",
        variant: "primary" as const,
        onClick: () => {},
        condition: () => (permissions.hasPermission("skill.view") || isSystemAdmin) as boolean
      },
      {
        key: "update",
        label: "Edit",
        variant: "warning" as const,
        onClick: (skillItem: Skill) => {
          setSkillId(skillItem.skillId);
          setActive(skillItem.active);
          setTh(skillItem.th);
          setEn(skillItem.en);
          setIsOpen(true);
        },
        condition: () => (permissions.hasPermission("skill.update") || isSystemAdmin) as boolean
      },
      {
        key: "delete",
        label: "Delete",
        variant: "outline" as const,
        onClick: (skillItem: Skill) => {
          console.log("Delete skill:", skillItem.skillId);
        },
        condition: () => (permissions.hasPermission("skill.delete") || isSystemAdmin) as boolean
      }
    ]
  };

  // ===================================================================
  // Preview Configuration
  // ===================================================================

  const previewConfig: PreviewConfig<
    Skill
  > = {
    title: () => "Skill Information",
    size: "xl",
    enableNavigation: true,
    tabs: [
      {
        key: "overview",
        label: "Overview",
        // icon: InfoIcon,
        fields: [
          {
            key: "th",
            label: "Name",
            type: "text" as const,
          },
          {
            key: "active",
            label: "Status",
            type: "custom",
            render: value => {
              const statusConfig = value
                ? { color: "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100", icon: CheckLineIcon }
                : { color: "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100", icon: TimeIcon };
              const Icon = statusConfig.icon;
              return (
                <span className={`items-center px-2 py-1 rounded-full text-xs font-medium capitalize ${statusConfig.color}`}>
                  <Icon className="w-4 h-4 inline mr-1" />
                  {value ? "Active" : "Inactive"}
                </span>
              );
            }
          },
        ]
      }
    ],
    actions: [
      {
        key: "update",
        label: "Edit",
        // icon: PencilIcon,
        variant: "warning",
        onClick: (skillItem: Skill) => {
          setSkillId(skillItem.skillId);
          setActive(skillItem.active);
          setTh(skillItem.th);
          setEn(skillItem.en);
          setIsOpen(true);
        },
        condition: () => (permissions.hasPermission("skill.update") || isSystemAdmin) as boolean
      },
      // {
      //   key: "delete",
      //   label: "Delete",
      //   // icon: CheckLineIcon,
      //   variant: "outline",
      //   onClick: (skillItem: Skill, closePreview: () => void) => {
      //     console.log("🚀 ~ SkillManagementComponent ~ skillItem:", skillItem);
      //     closePreview();
      //     // console.log("Delete skill:", skillItem.skillId);
      //   },
      //   condition: () => (permissions.hasPermission("skill.delete") || isSystemAdmin) as boolean
      // }
    ]
  };

  // ===================================================================
  // Advanced Filters
  // ===================================================================

  // const advancedFilters = [{}];

  // ===================================================================
  // Bulk Actions
  // ===================================================================

  // ===================================================================
  // Export Options
  // ===================================================================

  // ===================================================================
  // Custom Card Rendering
  // ===================================================================

  const renderCard = (skillItem: Skill) => {
    const statusConfig = skillItem.active
        ? { color: "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100", icon: CheckLineIcon }
        : { color: "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100", icon: CloseLineIcon };
      const Icon = statusConfig.icon;

    return (
      <div className={`xl:flex items-start justify-between mb-4`}>
        <div className="xl:flex items-center gap-3 min-w-0 xl:flex-1">
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate capitalize">
              {skillItem.th.trim()} ({skillItem.en.trim()})
            </h3>
            <span className={`items-center px-2 py-1 rounded-full text-xs font-medium capitalize ${statusConfig.color}`}>
              <Icon className="w-4 h-4 inline mr-1" />
              {skillItem.active ? "Active" : "Inactive"}
            </span>
          </div>
        </div>
      </div>
    );
  };

  // ===================================================================
  // Event Handlers
  // ===================================================================

  // Handle deletion and other actions
  const handleAction = (actionKey: string, skillItem: Skill) => {
    // Add custom skill-specific action handling
    console.log(`Action ${actionKey} triggered for skill:`, skillItem.skillId);

  };

  // Handle deletion
  const handleDelete = (skillId: string) => {
    // Handle skill delete
    console.log("Skill deleted:", skillId);
    setTimeout(() => {
      window.location.replace(`/skill`);
    }, 1000);
  };

  // ===================================================================
  // Render Component
  // ===================================================================

  return (
    <>
      <EnhancedCrudContainer
        advancedFilters={[]}
        apiConfig={{
          baseUrl: "/api",
          endpoints: {
            create: "/skill",
            read: "/skill/:id",
            list: "/skill",
            update: "/skill/:id",
            delete: "/skill/:id",
            bulkDelete: "/skill/bulk",
            export: "/skill/export"
          }
        }}
        // bulkActions={bulkActions}
        // config={config as unknown as CrudConfig<{ id: string; }>}
        config={config}
        // data={skills as unknown as { id: string }[]}
        data={data}
        displayModes={["card", "table"]}
        enableDebug={true} // Enable debug mode to troubleshoot
        // error={null}
        // exportOptions={exportOptions}
        features={{
          bulkActions: false,
          export: false,
          filtering: true,
          keyboardShortcuts: true,
          pagination: true,
          realTimeUpdates: false, // Disabled for demo
          search: true,
          sorting: true,
        }}
        // keyboardShortcuts={[]}
        loading={!skills}
        module="skill"
        // previewConfig={previewConfig as unknown as PreviewConfig<{ id: string }>}
        previewConfig={previewConfig as PreviewConfig<Skill & { id: string }>}
        searchFields={["th", "active"]}
        // customFilterFunction={() => true}
        onCreate={() => {
          handleSkillReset();
          setIsOpen(true);
        }}
        onDelete={handleDelete}
        onItemAction={handleAction as unknown as (action: string, item: { id: string }) => void}
        // onItemClick={(item) => navigate(`/skill/${item.id}`)}
        onRefresh={() => window.location.reload()}
        // onUpdate={() => {}}
        renderCard={renderCard as unknown as (item: { id: string }) => React.ReactNode}
      />

      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <Modal
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
          handleSkillReset();
        }}
        className="max-w-4xl p-6 max-h-[80vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white cursor-default">
            {skillId && "Edit" || "Create"} Skill
          </h3>
          <Button
            onClick={() => setIsOpen(false)}
            variant="ghost"
            size="sm"
          >
            <CloseIcon className="w-4 h-4" />
          </Button>
        </div>
        <div className="space-y-4">
          <div>
            <label htmlFor="th" className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Name (TH)
            </label>
            <Input
              id="th"
              placeholder="Fill skill name in Thai language"
              value={th}
              onChange={(e) => setTh && setTh(e.target.value)}
            />
            <span className="text-red-500 dark:text-red-400 text-xs">{validationErrors.th}</span>
          </div>
          <div>
            <label htmlFor="en" className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Name (EN)
            </label>
            <Input
              id="en"
              placeholder="Fill skill name in English language"
              value={en}
              onChange={(e) => setEn && setEn(e.target.value)}
            />
            <span className="text-red-500 dark:text-red-400 text-xs">{validationErrors.en}</span>
          </div>
        </div>
        <div className="flex items-center justify-end mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex gap-3">
            <Button onClick={handleSkillReset} variant="outline">
              Reset
            </Button>
            <Button
              onClick={() => {
                setIsConfirmOpen(true);
                setIsOpen(false);
              }}
              variant="primary"
            >
              Confirm
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isConfirmOpen}
        onClose={() => {
          setIsConfirmOpen(false);
          setIsOpen(true);
        }}
        className="max-w-4xl p-6 max-h-[80vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white cursor-default">
            Confirm {skillId && "Edit" || "Create"} Skill
          </h3>
          <Button
            onClick={() => {
              setIsConfirmOpen(false);
              setIsOpen(true);
            }}
            variant="ghost"
            size="sm"
          >
            <CloseIcon className="w-4 h-4" />
          </Button>
        </div>
        <div className="space-y-4">
          Please confirm to {skillId && "edit" || "create"} {th} {en}
        </div>
        <div className="flex items-center justify-end mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex gap-3">
            <Button
              onClick={() => {
                setIsConfirmOpen(false);
                setIsOpen(true);
              }}
              variant="outline"
            >
              Cancel
            </Button>
            <Button onClick={handleSkillSave} variant="success">
              Confirm
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default SkillManagementComponent;
