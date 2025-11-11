// /src/components/admin/system-configuration/unit/unit-form/sections/BasicInfoSection.tsx
import React from "react";
import { useTranslation } from "@/hooks/useTranslation";
import type { UnitFormData } from "@/types/unit";
// import FormField from "@/components/common/FormField";
// import Input from "@/components/common/Input";
import CustomizableSelect from "@/components/form/CustomizableSelect";
import Label from "@/components/form/Label";
// import Select from "@/components/form/Select";
import Input from "@/components/form/input/InputField";

interface BasicInfoSectionProps {
  errors: Partial<Record<keyof UnitFormData, string>>;
  formData: UnitFormData;
  sources: { value: string; label: string }[];
  unitTypes: { value: string; label: string }[];
  users: { value: string; label: string }[];
  onChange: (field: keyof UnitFormData, value: unknown) => void;
}

const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({
  errors,
  formData,
  sources,
  unitTypes,
  users,
  onChange
}) => {
  const { t } = useTranslation();
  
  return (
    <>
      <h3 className="font-semibold mb-4 text-lg text-gray-800 dark:text-gray-100 cursor-default">
        {t("crud.unit.form.basic_information.header")}
      </h3>
      
      <div className="gap-4 grid grid-cols-1 xl:grid-cols-4">
        {/*
        <FormField label="Unit ID" required error={errors.unitId}>
          <Input
            type="text"
            value={formData.unitId}
            onChange={e => onChange("unitId", e.target.value)}
            placeholder="Enter unit ID"
          />
        </FormField>
        */}

        <div>
          <Label htmlFor="unitId">
            {t("crud.unit.form.basic_information.sections.unitId.label")}
            <span className="text-red-500 dark:text-red-400 ml-1">*</span>
          </Label>
          <Input
            id="unitId"
            value={formData.unitId || ""}
            onChange={e => onChange("unitId", e.target.value)}
            placeholder={t("crud.unit.form.basic_information.sections.unitId.placeholder")}
            required
            error={!!errors.unitId}
          />
          <span className="text-red-500 dark:text-red-400 text-sm">{errors.unitId}</span>
        </div>

        <div>
          <Label htmlFor="unitName">
            {t("crud.unit.form.basic_information.sections.unitName.label")}
            <span className="text-red-500 dark:text-red-400 ml-1">*</span>
          </Label>
          <Input
            id="unitName"
            value={formData.unitName || ""}
            onChange={e => onChange("unitName", e.target.value)}
            placeholder={t("crud.unit.form.basic_information.sections.unitName.placeholder")}
            required
            error={!!errors.unitName}
          />
          <span className="text-red-500 dark:text-red-400 text-sm">{errors.unitName}</span>
        </div>

        <div>
          <Label>
            {t("crud.unit.form.basic_information.sections.unitTypeId.label")}
          </Label>
          {/*
          <Select
            value={formData.unitTypeId}
            onChange={value => onChange("unitTypeId", value)}
            placeholder={t("crud.unit.form.basic_information.sections.unitTypeId.placeholder")}
            options={unitTypes}
            className="cursor-pointer"
          />
          */}
          <CustomizableSelect
            options={unitTypes}
            // value={Array.isArray(formData.unitTypeId) ? formData.unitTypeId : []}
            value={formData.unitTypeId}
            onChange={value => onChange("unitTypeId", value)}
            placeholder={t("crud.unit.form.basic_information.sections.unitTypeId.placeholder")}
            multiple={false}
          />
        </div>

        <div>
          <Label>
            {t("crud.unit.form.basic_information.sections.unitSourceId.label")}
          </Label>
          {/*
          <Select
            value={formData.unitSourceId}
            onChange={value => onChange("unitSourceId", value)}
            placeholder={t("crud.unit.form.basic_information.sections.unitSourceId.placeholder")}
            options={sources}
            className="cursor-pointer"
          />
          */}
          <CustomizableSelect
            options={sources}
            // value={Array.isArray(formData.unitSourceId) ? formData.unitSourceId : []}
            value={formData.unitSourceId}
            onChange={value => onChange("unitSourceId", value)}
            placeholder={t("crud.unit.form.basic_information.sections.unitSourceId.placeholder")}
            multiple={false}
          />
        </div>

        <div>
          <Label>
            {t("crud.unit.form.basic_information.sections.username.label")}
          </Label>
          {/*
          <Select
            value={formData.username}
            onChange={value => onChange("username", value)}
            placeholder={t("crud.unit.form.basic_information.sections.username.placeholder")}
            options={users}
            className="cursor-pointer"
          />
          */}
          <CustomizableSelect
            options={users}
            // value={Array.isArray(formData.username) ? formData.username : []}
            value={formData.username}
            onChange={value => onChange("username", value)}
            placeholder={t("crud.unit.form.basic_information.sections.username.placeholder")}
            multiple={false}
          />
        </div>

        <div>
          <Label htmlFor="priority">
            {t("crud.unit.form.basic_information.sections.priority.label")}
          </Label>
          <Input
            id="priority"
            type="number"
            value={formData.priority || 0}
            onChange={e => onChange("priority", e.target.value)}
            error={!!errors.priority}
          />
        </div>

        <div>
          <Label htmlFor="plateNo">
            {t("crud.unit.form.basic_information.sections.plateNo.label")}
          </Label>
          <Input
            id="plateNo"
            value={formData.plateNo || ""}
            onChange={e => onChange("plateNo", e.target.value)}
            placeholder={t("crud.unit.form.basic_information.sections.plateNo.placeholder")}
            error={!!errors.plateNo}
          />
        </div>

        <div>
          <Label htmlFor="breakDuration">
            {t("crud.unit.form.basic_information.sections.breakDuration.label")}
          </Label>
          <Input
            id="breakDuration"
            type="number"
            value={formData.breakDuration || 0}
            onChange={e => onChange("breakDuration", e.target.value)}
            error={!!errors.breakDuration}
          />
        </div>
      </div>
    </>
  );
};

export default BasicInfoSection;
