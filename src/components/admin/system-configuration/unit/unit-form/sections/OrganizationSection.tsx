// /src/components/admin/system-configuration/unit/unit-form/sections/OrganizationSection.tsx
import React from "react";
import { useTranslation } from "@/hooks/useTranslation";
import type { UnitFormData } from "@/types/unit";
import CustomizableSelect from "@/components/form/CustomizableSelect";
import Label from "@/components/form/Label";

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
          <CustomizableSelect
            options={companies}
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
          <CustomizableSelect
            options={departments}
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
          <CustomizableSelect
            options={commands}
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
          <CustomizableSelect
            options={stations}
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
          <CustomizableSelect
            options={provinces}
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
