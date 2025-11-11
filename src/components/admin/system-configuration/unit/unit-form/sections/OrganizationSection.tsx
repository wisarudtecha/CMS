// /src/components/admin/system-configuration/unit/unit-form/sections/OrganizationSection.tsx
import React from "react";
import { useTranslation } from "@/hooks/useTranslation";
import type { UnitFormData } from "@/types/unit";
// import FormField from "@/components/common/FormField";
// import Input from "@/components/common/Input";
import CustomizableSelect from "@/components/form/CustomizableSelect";
import Label from "@/components/form/Label";
// import Select from "@/components/form/Select";

interface OrganizationSectionProps {
  commands: { value: string; label: string }[];
  companies: { value: string; label: string }[];
  departments: { value: string; label: string }[];
  errors: Partial<Record<keyof UnitFormData, string>>;
  formData: UnitFormData;
  provinces: { value: string; label: string }[];
  stations: { value: string; label: string }[];
  onChange: (field: keyof UnitFormData, value: unknown) => void;
}

const OrganizationSection: React.FC<OrganizationSectionProps> = ({
  commands,
  companies,
  departments,
  // errors,
  formData,
  provinces,
  stations,
  onChange
}) => {
  const { t } = useTranslation();

  return (
    <>
      <h3 className="font-semibold mb-4 text-lg text-gray-800 dark:text-gray-100 cursor-default">
        {t("crud.unit.form.organization_details.header")}
      </h3>
      
      <div className="gap-4 grid grid-cols-1 xl:grid-cols-4">
        <div>
          <Label>
            {t("crud.unit.form.organization_details.sections.compId.label")}
          </Label>
          {/*
          <Select
            value={formData.compId}
            onChange={value => onChange("compId", value)}
            placeholder={t("crud.unit.form.organization_details.sections.compId.placeholder")}
            options={companies}
            className="cursor-pointer"
          />
          */}
          <CustomizableSelect
            options={companies}
            // value={Array.isArray(formData.compId) ? formData.compId : []}
            value={formData.compId}
            onChange={value => onChange("compId", value)}
            placeholder={t("crud.unit.form.organization_details.sections.compId.placeholder")}
            multiple={false}
          />
        </div>

        <div>
          <Label>
            {t("crud.unit.form.organization_details.sections.deptId.label")}
          </Label>
          {/*
          <Select
            value={formData.deptId}
            onChange={value => onChange("deptId", value)}
            placeholder={t("crud.unit.form.organization_details.sections.deptId.placeholder")}
            options={departments}
            className="cursor-pointer"
          />
          */}
          <CustomizableSelect
            options={departments}
            // value={Array.isArray(formData.deptId) ? formData.deptId : []}
            value={formData.deptId}
            onChange={value => onChange("deptId", value)}
            placeholder={t("crud.unit.form.organization_details.sections.deptId.placeholder")}
            multiple={false}
          />
        </div>

        <div>
          <Label>
            {t("crud.unit.form.organization_details.sections.commId.label")}
          </Label>
          {/*
          <Select
            value={formData.commId}
            onChange={value => onChange("commId", value)}
            placeholder={t("crud.unit.form.organization_details.sections.commId.placeholder")}
            options={commands}
            className="cursor-pointer"
          />
          */}
          <CustomizableSelect
            options={commands}
            // value={Array.isArray(formData.commId) ? formData.commId : []}
            value={formData.commId}
            onChange={value => onChange("commId", value)}
            placeholder={t("crud.unit.form.organization_details.sections.commId.placeholder")}
            multiple={false}
          />
        </div>

        <div>
          <Label>
            {t("crud.unit.form.organization_details.sections.stnId.label")}
          </Label>
          {/*
          <Select
            value={formData.stnId}
            onChange={value => onChange("stnId", value)}
            placeholder={t("crud.unit.form.organization_details.sections.stnId.placeholder")}
            options={stations}
            className="cursor-pointer"
          />
          */}
          <CustomizableSelect
            options={stations}
            // value={Array.isArray(formData.stnId) ? formData.stnId : []}
            value={formData.stnId}
            onChange={value => onChange("stnId", value)}
            placeholder={t("crud.unit.form.organization_details.sections.stnId.placeholder")}
            multiple={false}
          />
        </div>

        <div>
          <Label>
            {t("crud.unit.form.organization_details.sections.provinceCode.label")}
          </Label>
          {/*
          <Select
            value={formData.provinceCode}
            onChange={value => onChange("provinceCode", value)}
            placeholder={t("crud.unit.form.organization_details.sections.provinceCode.placeholder")}
            options={provinces}
            className="cursor-pointer"
          />
          */}
          <CustomizableSelect
            options={provinces}
            // value={Array.isArray(formData.provinceCode) ? formData.provinceCode : []}
            value={formData.provinceCode}
            onChange={value => onChange("provinceCode", value)}
            placeholder={t("crud.unit.form.organization_details.sections.provinceCode.placeholder")}
            multiple={false}
          />
        </div>
      </div>
    </>
  );
};

export default OrganizationSection;
